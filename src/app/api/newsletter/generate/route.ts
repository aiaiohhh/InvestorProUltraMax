/**
 * Newsletter Generation API Route
 * 
 * POST /api/newsletter/generate
 * Generates a personalized newsletter for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterGeneratorService, UserPreferences } from '@/services/newsletter';
import { subscriptionManagerService } from '@/services/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body as { userId: string; preferences?: Partial<UserPreferences> };

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if user has newsletter access
    const hasAccess = await subscriptionManagerService.hasNewsletterAccess(userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Newsletter access requires Pro subscription' },
        { status: 403 }
      );
    }

    // Build full preferences with defaults
    const fullPreferences: UserPreferences = {
      userId,
      email: preferences?.email || 'user@example.com',
      name: preferences?.name || 'Investor',
      assetClasses: preferences?.assetClasses || ['stocks', 'crypto'],
      investmentStyle: preferences?.investmentStyle || 'mixed',
      riskProfile: preferences?.riskProfile || 'moderate',
      enabledSections: preferences?.enabledSections || {
        marketSummary: true,
        topMovers: true,
        breakingNews: true,
        socialIntelligence: true,
        economicUpdate: true,
        earningsCalendar: true,
        cryptoUpdate: true,
        portfolioInsights: true,
        educationalContent: true,
      },
      format: preferences?.format || 'full',
      deliveryTime: preferences?.deliveryTime || '07:00',
      timezone: preferences?.timezone || 'America/New_York',
      holdings: preferences?.holdings,
      watchlist: preferences?.watchlist,
    };

    // Generate newsletter
    const newsletter = await newsletterGeneratorService.generateNewsletter(fullPreferences);

    return NextResponse.json({
      success: true,
      newsletter: {
        id: newsletter.id,
        subject: newsletter.subject,
        preheader: newsletter.preheader,
        generatedAt: newsletter.generatedAt,
        sectionsCount: newsletter.sections.length,
      },
      // Include HTML for preview
      html: newsletter.html,
      plainText: newsletter.plainText,
    });
  } catch (error) {
    console.error('[API] Newsletter generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate newsletter' },
      { status: 500 }
    );
  }
}

