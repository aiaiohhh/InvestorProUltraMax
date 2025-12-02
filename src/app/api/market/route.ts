/**
 * Market Data API Routes
 * 
 * GET /api/market - Get market data
 */

import { NextRequest, NextResponse } from 'next/server';
import { unifiedDataService } from '@/services/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'summary';
    const symbol = searchParams.get('symbol');

    switch (type) {
      case 'indices':
        const indices = await unifiedDataService.getMarketIndices();
        return NextResponse.json({ indices });

      case 'movers':
        const movers = await unifiedDataService.getMarketMovers();
        return NextResponse.json(movers);

      case 'sectors':
        const sectors = await unifiedDataService.getSectorPerformance();
        return NextResponse.json({ sectors });

      case 'economic':
        const economic = await unifiedDataService.getEconomicIndicators();
        return NextResponse.json(economic);

      case 'earnings':
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const earnings = await unifiedDataService.getEarningsCalendar(from || undefined, to || undefined);
        return NextResponse.json({ earnings });

      case 'trending':
        const [trendingStocks, trendingCrypto] = await Promise.all([
          unifiedDataService.getTrendingTickers(),
          unifiedDataService.getTrendingCrypto(),
        ]);
        return NextResponse.json({ stocks: trendingStocks, crypto: trendingCrypto });

      case 'quote':
        if (!symbol) {
          return NextResponse.json({ error: 'symbol parameter required for quote' }, { status: 400 });
        }
        const asset = await unifiedDataService.getAsset(symbol);
        return NextResponse.json({ asset });

      case 'history':
        if (!symbol) {
          return NextResponse.json({ error: 'symbol parameter required for history' }, { status: 400 });
        }
        const range = (searchParams.get('range') || '1y') as any;
        const history = await unifiedDataService.getPriceHistory(symbol, range);
        return NextResponse.json({ symbol, range, history });

      case 'fundamentals':
        if (!symbol) {
          return NextResponse.json({ error: 'symbol parameter required for fundamentals' }, { status: 400 });
        }
        const fundamentals = await unifiedDataService.getFundamentals(symbol);
        return NextResponse.json({ symbol, fundamentals });

      case 'news':
        const newsSymbol = searchParams.get('symbol');
        const limit = parseInt(searchParams.get('limit') || '10');
        const news = newsSymbol
          ? await unifiedDataService.getCompanyNews(newsSymbol, limit)
          : await unifiedDataService.getNews({ limit });
        return NextResponse.json({ news });

      case 'summary':
      default:
        // Get comprehensive market summary
        const [summaryIndices, summaryMovers, summarySectors] = await Promise.all([
          unifiedDataService.getMarketIndices(),
          unifiedDataService.getMarketMovers(),
          unifiedDataService.getSectorPerformance(),
        ]);

        return NextResponse.json({
          indices: summaryIndices,
          movers: {
            gainers: summaryMovers.gainers.slice(0, 5),
            losers: summaryMovers.losers.slice(0, 5),
          },
          sectors: summarySectors.slice(0, 5),
          generatedAt: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('[API] Market data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

