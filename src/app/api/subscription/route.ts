/**
 * Subscription API Routes
 * 
 * GET /api/subscription - Get user's subscription
 * POST /api/subscription - Create/update subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManagerService, SUBSCRIPTION_PLANS, SubscriptionTier } from '@/services/subscription';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // Get all plans
    if (action === 'plans') {
      return NextResponse.json({
        plans: subscriptionManagerService.getAllPlans(),
        comparison: subscriptionManagerService.comparePlans(),
      });
    }

    // Get user subscription
    if (userId) {
      const subscription = await subscriptionManagerService.getSubscription(userId);
      const tier = await subscriptionManagerService.getUserTier(userId);
      const plan = subscriptionManagerService.getPlan(tier);
      const usage = await subscriptionManagerService.getUsage(userId);

      return NextResponse.json({
        subscription,
        tier,
        plan,
        usage,
        features: {
          newsletterAccess: await subscriptionManagerService.hasNewsletterAccess(userId),
          newsletterCustomization: await subscriptionManagerService.hasFeatureAccess(userId, 'newsletterCustomization'),
          aiAgentsAccess: await subscriptionManagerService.hasFeatureAccess(userId, 'aiAgentsAccess'),
          prioritySupport: await subscriptionManagerService.hasFeatureAccess(userId, 'prioritySupport'),
        },
      });
    }

    return NextResponse.json(
      { error: 'userId or action parameter required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Subscription GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, tier } = body as {
      userId: string;
      action: 'create' | 'upgrade' | 'cancel' | 'reactivate';
      tier?: SubscriptionTier;
    };

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'create':
        if (!tier) {
          return NextResponse.json(
            { error: 'tier is required for create action' },
            { status: 400 }
          );
        }
        result = await subscriptionManagerService.createSubscription(userId, tier, {
          trialDays: tier === 'pro' ? 14 : undefined,
        });
        break;

      case 'upgrade':
        if (!tier) {
          return NextResponse.json(
            { error: 'tier is required for upgrade action' },
            { status: 400 }
          );
        }
        result = await subscriptionManagerService.upgradeSubscription(userId, tier);
        break;

      case 'cancel':
        result = await subscriptionManagerService.cancelSubscription(userId);
        break;

      case 'reactivate':
        result = await subscriptionManagerService.reactivateSubscription(userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid options: create, upgrade, cancel, reactivate' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      subscription: result,
    });
  } catch (error) {
    console.error('[API] Subscription POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

