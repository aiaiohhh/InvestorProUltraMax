/**
 * Newsletter Content API Route
 * 
 * GET /api/newsletter/content
 * Gets aggregated content for newsletter (for preview/debugging)
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentAggregatorService } from '@/services/newsletter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section');

    // If specific section requested
    if (section) {
      let data;
      switch (section) {
        case 'market':
          data = await contentAggregatorService.getMarketSummary();
          break;
        case 'movers':
          data = await contentAggregatorService.getTopMovers();
          break;
        case 'news':
          data = await contentAggregatorService.getNewsDigest();
          break;
        case 'social':
          data = await contentAggregatorService.getSocialIntelligence();
          break;
        case 'economic':
          data = await contentAggregatorService.getEconomicUpdate();
          break;
        case 'earnings':
          data = await contentAggregatorService.getEarningsUpdate();
          break;
        case 'crypto':
          data = await contentAggregatorService.getCryptoUpdate();
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid section. Valid options: market, movers, news, social, economic, earnings, crypto' },
            { status: 400 }
          );
      }
      return NextResponse.json({ section, data });
    }

    // Get all aggregated content
    const content = await contentAggregatorService.aggregateAllContent();

    return NextResponse.json({
      success: true,
      generatedAt: content.generatedAt,
      version: content.version,
      sections: {
        marketSummary: { available: true, lastUpdated: content.marketSummary.generatedAt },
        topMovers: { available: true, lastUpdated: content.topMovers.generatedAt },
        newsDigest: { available: true, lastUpdated: content.newsDigest.generatedAt },
        socialIntelligence: { available: true, lastUpdated: content.socialIntelligence.generatedAt },
        economicUpdate: { available: true, lastUpdated: content.economicUpdate.generatedAt },
        earningsUpdate: { available: true, lastUpdated: content.earningsUpdate.generatedAt },
        cryptoUpdate: { available: true, lastUpdated: content.cryptoUpdate.generatedAt },
      },
      content,
    });
  } catch (error) {
    console.error('[API] Content aggregation error:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate content' },
      { status: 500 }
    );
  }
}

