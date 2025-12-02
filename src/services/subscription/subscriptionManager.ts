/**
 * PRD-3.1.1: Subscription Management System
 * 
 * Implements subscription tiers with newsletter access as core feature.
 * 
 * Subscription Tiers:
 * - Free: Basic webapp, no newsletter
 * - Pro ($29/mo): Full webapp + daily newsletter
 * - Enterprise: Custom pricing + newsletter customization
 * 
 * Features:
 * - Subscription tier management
 * - Feature access control
 * - Payment integration (Stripe)
 * - Subscription lifecycle management
 */

// Subscription tier definitions
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number; // Monthly price in cents
  yearlyPrice: number; // Yearly price in cents
  features: string[];
  limits: {
    portfolios: number;
    watchlistItems: number;
    alerts: number;
    apiCalls: number;
    dataRefreshRate: number; // in seconds
  };
  newsletterAccess: boolean;
  newsletterCustomization: boolean;
  aiAgentsAccess: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUsage {
  userId: string;
  period: string; // YYYY-MM
  portfoliosUsed: number;
  watchlistItemsUsed: number;
  alertsUsed: number;
  apiCallsUsed: number;
  newslettersSent: number;
}

// Subscription plans
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'plan_free',
    tier: 'free',
    name: 'Free',
    description: 'Basic access to portfolio tracking',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Basic portfolio tracking',
      '1 portfolio',
      '10 watchlist items',
      '3 price alerts',
      'Delayed market data (15 min)',
      'Basic research tools',
    ],
    limits: {
      portfolios: 1,
      watchlistItems: 10,
      alerts: 3,
      apiCalls: 100,
      dataRefreshRate: 900, // 15 minutes
    },
    newsletterAccess: false,
    newsletterCustomization: false,
    aiAgentsAccess: false,
    prioritySupport: false,
  },
  pro: {
    id: 'plan_pro',
    tier: 'pro',
    name: 'Pro',
    description: 'Full access with daily newsletter',
    price: 2900, // $29.00
    yearlyPrice: 29000, // $290.00 (2 months free)
    features: [
      'Everything in Free, plus:',
      'Unlimited portfolios',
      'Unlimited watchlist items',
      'Unlimited price alerts',
      'Real-time market data',
      '📧 Daily personalized newsletter',
      'Advanced research tools',
      'Technical indicators',
      'SEC filings access',
      'Economic data dashboard',
      'Social sentiment analysis',
      'Earnings calendar',
    ],
    limits: {
      portfolios: -1, // Unlimited
      watchlistItems: -1,
      alerts: -1,
      apiCalls: 10000,
      dataRefreshRate: 60, // 1 minute
    },
    newsletterAccess: true,
    newsletterCustomization: true,
    aiAgentsAccess: false,
    prioritySupport: false,
  },
  enterprise: {
    id: 'plan_enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for teams and institutions',
    price: 0, // Custom pricing
    yearlyPrice: 0,
    features: [
      'Everything in Pro, plus:',
      'Custom newsletter branding',
      'White-label options',
      'AI investment agents',
      'API access',
      'Dedicated account manager',
      'Priority support',
      'Custom integrations',
      'Team management',
      'Compliance reporting',
    ],
    limits: {
      portfolios: -1,
      watchlistItems: -1,
      alerts: -1,
      apiCalls: -1,
      dataRefreshRate: 10, // 10 seconds
    },
    newsletterAccess: true,
    newsletterCustomization: true,
    aiAgentsAccess: true,
    prioritySupport: true,
  },
};

/**
 * Subscription Manager Service
 * 
 * Handles subscription management, access control, and payment integration.
 */
export class SubscriptionManagerService {
  private subscriptions: Map<string, Subscription> = new Map();
  private usage: Map<string, SubscriptionUsage> = new Map();

  /**
   * Get subscription for a user
   */
  async getSubscription(userId: string): Promise<Subscription | null> {
    // In production, this would fetch from database
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Get user's current subscription tier
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    return subscription.tier;
  }

  /**
   * Get subscription plan details
   */
  getPlan(tier: SubscriptionTier): SubscriptionPlan {
    return SUBSCRIPTION_PLANS[tier];
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(userId: string, feature: keyof SubscriptionPlan): Promise<boolean> {
    const tier = await this.getUserTier(userId);
    const plan = this.getPlan(tier);

    switch (feature) {
      case 'newsletterAccess':
        return plan.newsletterAccess;
      case 'newsletterCustomization':
        return plan.newsletterCustomization;
      case 'aiAgentsAccess':
        return plan.aiAgentsAccess;
      case 'prioritySupport':
        return plan.prioritySupport;
      default:
        return true;
    }
  }

  /**
   * Check if user has newsletter access
   */
  async hasNewsletterAccess(userId: string): Promise<boolean> {
    return this.hasFeatureAccess(userId, 'newsletterAccess');
  }

  /**
   * Check if user is within usage limits
   */
  async checkUsageLimit(
    userId: string,
    limitType: keyof SubscriptionPlan['limits'],
    currentUsage: number
  ): Promise<{ allowed: boolean; limit: number; used: number; remaining: number }> {
    const tier = await this.getUserTier(userId);
    const plan = this.getPlan(tier);
    const limit = plan.limits[limitType];

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, used: currentUsage, remaining: -1 };
    }

    const remaining = limit - currentUsage;
    return {
      allowed: currentUsage < limit,
      limit,
      used: currentUsage,
      remaining: Math.max(0, remaining),
    };
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    options: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      trialDays?: number;
    } = {}
  ): Promise<Subscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${userId}`,
      userId,
      tier,
      planId: SUBSCRIPTION_PLANS[tier].id,
      status: options.trialDays ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      stripeCustomerId: options.stripeCustomerId,
      stripeSubscriptionId: options.stripeSubscriptionId,
      createdAt: now,
      updatedAt: now,
    };

    if (options.trialDays) {
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + options.trialDays);
      subscription.trialEnd = trialEnd;
    }

    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(userId: string, newTier: SubscriptionTier): Promise<Subscription> {
    const existing = await this.getSubscription(userId);
    
    if (existing) {
      existing.tier = newTier;
      existing.planId = SUBSCRIPTION_PLANS[newTier].id;
      existing.updatedAt = new Date();
      this.subscriptions.set(userId, existing);
      return existing;
    }

    return this.createSubscription(userId, newTier);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, atPeriodEnd: boolean = true): Promise<Subscription | null> {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) return null;

    if (atPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = 'canceled';
    }
    
    subscription.updatedAt = new Date();
    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<Subscription | null> {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) return null;

    subscription.cancelAtPeriodEnd = false;
    subscription.status = 'active';
    subscription.updatedAt = new Date();
    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  /**
   * Get usage for current period
   */
  async getUsage(userId: string): Promise<SubscriptionUsage> {
    const period = new Date().toISOString().substring(0, 7); // YYYY-MM
    const key = `${userId}:${period}`;
    
    return this.usage.get(key) || {
      userId,
      period,
      portfoliosUsed: 0,
      watchlistItemsUsed: 0,
      alertsUsed: 0,
      apiCallsUsed: 0,
      newslettersSent: 0,
    };
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(
    userId: string,
    usageType: keyof Omit<SubscriptionUsage, 'userId' | 'period'>,
    amount: number = 1
  ): Promise<SubscriptionUsage> {
    const usage = await this.getUsage(userId);
    usage[usageType] += amount;
    
    const key = `${userId}:${usage.period}`;
    this.usage.set(key, usage);
    return usage;
  }

  /**
   * Check if user can perform action based on limits
   */
  async canPerformAction(
    userId: string,
    action: 'create_portfolio' | 'add_watchlist' | 'create_alert' | 'api_call'
  ): Promise<boolean> {
    const usage = await this.getUsage(userId);
    
    const actionToLimit: Record<string, keyof SubscriptionPlan['limits']> = {
      create_portfolio: 'portfolios',
      add_watchlist: 'watchlistItems',
      create_alert: 'alerts',
      api_call: 'apiCalls',
    };

    const actionToUsage: Record<string, keyof Omit<SubscriptionUsage, 'userId' | 'period'>> = {
      create_portfolio: 'portfoliosUsed',
      add_watchlist: 'watchlistItemsUsed',
      create_alert: 'alertsUsed',
      api_call: 'apiCallsUsed',
    };

    const limitType = actionToLimit[action];
    const usageType = actionToUsage[action];
    const currentUsage = usage[usageType];

    const { allowed } = await this.checkUsageLimit(userId, limitType, currentUsage);
    return allowed;
  }

  /**
   * Get all available plans
   */
  getAllPlans(): SubscriptionPlan[] {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  /**
   * Compare plans
   */
  comparePlans(): Array<{
    feature: string;
    free: string | boolean;
    pro: string | boolean;
    enterprise: string | boolean;
  }> {
    return [
      { feature: 'Portfolio Tracking', free: true, pro: true, enterprise: true },
      { feature: 'Portfolios', free: '1', pro: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Watchlist Items', free: '10', pro: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Price Alerts', free: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Market Data', free: '15 min delay', pro: 'Real-time', enterprise: 'Real-time' },
      { feature: 'Daily Newsletter', free: false, pro: true, enterprise: true },
      { feature: 'Newsletter Customization', free: false, pro: true, enterprise: true },
      { feature: 'Advanced Research', free: false, pro: true, enterprise: true },
      { feature: 'Technical Indicators', free: false, pro: true, enterprise: true },
      { feature: 'SEC Filings', free: false, pro: true, enterprise: true },
      { feature: 'AI Investment Agents', free: false, pro: false, enterprise: true },
      { feature: 'API Access', free: false, pro: false, enterprise: true },
      { feature: 'White-label Options', free: false, pro: false, enterprise: true },
      { feature: 'Priority Support', free: false, pro: false, enterprise: true },
    ];
  }

  /**
   * Validate Stripe webhook signature (placeholder)
   */
  validateStripeWebhook(payload: string, signature: string): boolean {
    // In production, this would validate the Stripe webhook signature
    console.log('[Subscription] Validating Stripe webhook');
    return true;
  }

  /**
   * Handle Stripe webhook events (placeholder)
   */
  async handleStripeWebhook(event: {
    type: string;
    data: { object: any };
  }): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('[Subscription] New subscription created');
        break;
      case 'customer.subscription.updated':
        console.log('[Subscription] Subscription updated');
        break;
      case 'customer.subscription.deleted':
        console.log('[Subscription] Subscription canceled');
        break;
      case 'invoice.payment_succeeded':
        console.log('[Subscription] Payment succeeded');
        break;
      case 'invoice.payment_failed':
        console.log('[Subscription] Payment failed');
        break;
      default:
        console.log(`[Subscription] Unhandled event type: ${event.type}`);
    }
  }
}

// Singleton instance
export const subscriptionManagerService = new SubscriptionManagerService();
export default subscriptionManagerService;

