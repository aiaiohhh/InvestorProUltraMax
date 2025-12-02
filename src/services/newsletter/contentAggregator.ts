/**
 * PRD-2.1.1: Newsletter Content Aggregation Engine
 * 
 * Automated system to collect and aggregate all content for daily newsletters
 * from free data sources.
 * 
 * Features:
 * - Market data aggregation (indices, sectors, movers)
 * - News aggregation (breaking news, company news)
 * - Social media intelligence (Reddit, Twitter)
 * - Economic data releases
 * - Earnings announcements
 */

import { NewsItem } from '@/types';
import { unifiedDataService, FRED_SERIES } from '../data';

// Newsletter content sections
export interface MarketSummary {
  indices: Array<{
    name: string;
    symbol: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
  sectors: Array<{
    name: string;
    performance: number;
  }>;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  generatedAt: string;
}

export interface TopMovers {
  gainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
  losers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
  mostActive: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
  generatedAt: string;
}

export interface NewsDigest {
  breakingNews: NewsItem[];
  marketNews: NewsItem[];
  cryptoNews: NewsItem[];
  sectorNews: Record<string, NewsItem[]>;
  generatedAt: string;
}

export interface SocialIntelligence {
  redditHot: Array<{
    title: string;
    subreddit: string;
    score: number;
    comments: number;
    url: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  trendingTopics: string[];
  sentimentOverview: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  generatedAt: string;
}

export interface EconomicUpdate {
  indicators: Array<{
    name: string;
    value: number | null;
    previousValue: number | null;
    change: number | null;
    date: string;
    significance: 'high' | 'medium' | 'low';
  }>;
  yieldCurve: {
    spread: number | null;
    isInverted: boolean;
    interpretation: string;
  };
  upcomingReleases: Array<{
    name: string;
    date: string;
    previousValue: string;
    forecast: string;
  }>;
  generatedAt: string;
}

export interface EarningsUpdate {
  upcoming: Array<{
    symbol: string;
    companyName: string;
    date: string;
    time: 'before-market' | 'after-market' | 'during-market';
    epsEstimate: number;
    revenueEstimate: number;
  }>;
  recent: Array<{
    symbol: string;
    companyName: string;
    date: string;
    epsActual: number | null;
    epsEstimate: number;
    epsSurprise: number;
    revenueActual: number | null;
    revenueEstimate: number;
  }>;
  generatedAt: string;
}

export interface CryptoUpdate {
  marketOverview: {
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    marketCapChange24h: number;
  };
  topCoins: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
  }>;
  trending: Array<{
    symbol: string;
    name: string;
    rank: number;
  }>;
  generatedAt: string;
}

export interface AggregatedContent {
  marketSummary: MarketSummary;
  topMovers: TopMovers;
  newsDigest: NewsDigest;
  socialIntelligence: SocialIntelligence;
  economicUpdate: EconomicUpdate;
  earningsUpdate: EarningsUpdate;
  cryptoUpdate: CryptoUpdate;
  generatedAt: string;
  version: string;
}

/**
 * Content Aggregator Service
 * 
 * Collects and aggregates all content needed for newsletter generation.
 */
export class ContentAggregatorService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Aggregate all content for newsletter
   */
  async aggregateAllContent(): Promise<AggregatedContent> {
    const [
      marketSummary,
      topMovers,
      newsDigest,
      socialIntelligence,
      economicUpdate,
      earningsUpdate,
      cryptoUpdate,
    ] = await Promise.all([
      this.getMarketSummary(),
      this.getTopMovers(),
      this.getNewsDigest(),
      this.getSocialIntelligence(),
      this.getEconomicUpdate(),
      this.getEarningsUpdate(),
      this.getCryptoUpdate(),
    ]);

    return {
      marketSummary,
      topMovers,
      newsDigest,
      socialIntelligence,
      economicUpdate,
      earningsUpdate,
      cryptoUpdate,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Get market summary
   */
  async getMarketSummary(): Promise<MarketSummary> {
    const cacheKey = 'marketSummary';
    const cached = this.getFromCache<MarketSummary>(cacheKey);
    if (cached) return cached;

    try {
      const [indices, sectors] = await Promise.all([
        unifiedDataService.getMarketIndices(),
        unifiedDataService.getSectorPerformance(),
      ]);

      const result: MarketSummary = {
        indices: indices.map(i => ({
          name: i.name,
          symbol: i.symbol,
          value: i.value,
          change: i.change,
          changePercent: i.changePercent,
        })),
        sectors: sectors.map(s => ({
          name: s.name,
          performance: s.performance * 100,
        })),
        marketStatus: this.determineMarketStatus(),
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting market summary:', error);
      return {
        indices: [],
        sectors: [],
        marketStatus: 'closed',
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get top movers (gainers, losers, most active)
   */
  async getTopMovers(): Promise<TopMovers> {
    const cacheKey = 'topMovers';
    const cached = this.getFromCache<TopMovers>(cacheKey);
    if (cached) return cached;

    try {
      const movers = await unifiedDataService.getMarketMovers();

      const result: TopMovers = {
        gainers: movers.gainers.slice(0, 10).map(q => ({
          symbol: q.symbol,
          name: q.companyName,
          price: q.latestPrice,
          change: q.change,
          changePercent: q.changePercent * 100,
          volume: q.volume || 0,
        })),
        losers: movers.losers.slice(0, 10).map(q => ({
          symbol: q.symbol,
          name: q.companyName,
          price: q.latestPrice,
          change: q.change,
          changePercent: q.changePercent * 100,
          volume: q.volume || 0,
        })),
        mostActive: movers.mostActive.slice(0, 10).map(q => ({
          symbol: q.symbol,
          name: q.companyName,
          price: q.latestPrice,
          change: q.change,
          changePercent: q.changePercent * 100,
          volume: q.volume || 0,
        })),
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting top movers:', error);
      return {
        gainers: [],
        losers: [],
        mostActive: [],
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get news digest
   */
  async getNewsDigest(): Promise<NewsDigest> {
    const cacheKey = 'newsDigest';
    const cached = this.getFromCache<NewsDigest>(cacheKey);
    if (cached) return cached;

    try {
      const [marketNews, cryptoNews] = await Promise.all([
        unifiedDataService.getNews({ category: 'business', limit: 20 }),
        unifiedDataService.getCryptoNews(10),
      ]);

      // Identify breaking news (high importance, recent)
      const breakingNews = marketNews
        .filter(n => {
          const age = Date.now() - new Date(n.publishedAt).getTime();
          return age < 6 * 60 * 60 * 1000; // Last 6 hours
        })
        .slice(0, 5);

      const result: NewsDigest = {
        breakingNews,
        marketNews: marketNews.slice(0, 15),
        cryptoNews,
        sectorNews: {},
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting news digest:', error);
      return {
        breakingNews: [],
        marketNews: [],
        cryptoNews: [],
        sectorNews: {},
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get social media intelligence
   */
  async getSocialIntelligence(): Promise<SocialIntelligence> {
    const cacheKey = 'socialIntelligence';
    const cached = this.getFromCache<SocialIntelligence>(cacheKey);
    if (cached) return cached;

    try {
      const redditPosts = await unifiedDataService.getRedditPosts(
        ['wallstreetbets', 'stocks', 'investing', 'cryptocurrency'],
        20
      );

      // Analyze sentiment
      let bullish = 0, bearish = 0, neutral = 0;
      const redditHot = redditPosts.map(post => {
        const sentiment = this.analyzeSentiment(post.title + ' ' + post.selftext);
        if (sentiment === 'positive') bullish++;
        else if (sentiment === 'negative') bearish++;
        else neutral++;

        return {
          title: post.title,
          subreddit: post.subreddit,
          score: post.score,
          comments: post.num_comments,
          url: post.permalink,
          sentiment,
        };
      });

      // Extract trending topics
      const trendingTopics = this.extractTrendingTopics(redditPosts);

      const total = bullish + bearish + neutral || 1;
      const result: SocialIntelligence = {
        redditHot: redditHot.slice(0, 10),
        trendingTopics: trendingTopics.slice(0, 10),
        sentimentOverview: {
          bullish: Math.round((bullish / total) * 100),
          bearish: Math.round((bearish / total) * 100),
          neutral: Math.round((neutral / total) * 100),
        },
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting social intelligence:', error);
      return {
        redditHot: [],
        trendingTopics: [],
        sentimentOverview: { bullish: 33, bearish: 33, neutral: 34 },
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get economic update
   */
  async getEconomicUpdate(): Promise<EconomicUpdate> {
    const cacheKey = 'economicUpdate';
    const cached = this.getFromCache<EconomicUpdate>(cacheKey);
    if (cached) return cached;

    try {
      const economicData = await unifiedDataService.getEconomicIndicators();

      const indicators = [
        ...economicData.interestRates.map(i => ({
          name: i.name,
          value: i.value,
          previousValue: i.previousValue,
          change: i.change,
          date: i.date,
          significance: 'high' as const,
        })),
        ...economicData.inflation.slice(0, 2).map(i => ({
          name: i.name,
          value: i.value,
          previousValue: i.previousValue,
          change: i.change,
          date: i.date,
          significance: 'high' as const,
        })),
        ...economicData.employment.slice(0, 2).map(i => ({
          name: i.name,
          value: i.value,
          previousValue: i.previousValue,
          change: i.change,
          date: i.date,
          significance: 'medium' as const,
        })),
      ];

      const yieldCurveInterpretation = economicData.yieldCurve.isInverted
        ? 'Yield curve is inverted, historically a recession indicator'
        : 'Yield curve is normal, indicating healthy economic expectations';

      const result: EconomicUpdate = {
        indicators,
        yieldCurve: {
          spread: economicData.yieldCurve.spread,
          isInverted: economicData.yieldCurve.isInverted,
          interpretation: yieldCurveInterpretation,
        },
        upcomingReleases: [], // Would need economic calendar integration
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting economic update:', error);
      return {
        indicators: [],
        yieldCurve: { spread: null, isInverted: false, interpretation: '' },
        upcomingReleases: [],
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get earnings update
   */
  async getEarningsUpdate(): Promise<EarningsUpdate> {
    const cacheKey = 'earningsUpdate';
    const cached = this.getFromCache<EarningsUpdate>(cacheKey);
    if (cached) return cached;

    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const earnings = await unifiedDataService.getEarningsCalendar(
        lastWeek.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      );

      const todayStr = today.toISOString().split('T')[0];
      
      const upcoming = earnings
        .filter(e => e.date >= todayStr)
        .slice(0, 10)
        .map(e => ({
          symbol: e.symbol,
          companyName: e.symbol, // Would need company lookup
          date: e.date,
          time: (e.hour === 'bmo' ? 'before-market' : e.hour === 'amc' ? 'after-market' : 'during-market') as any,
          epsEstimate: e.epsEstimate,
          revenueEstimate: e.revenueEstimate,
        }));

      const recent = earnings
        .filter(e => e.date < todayStr && e.epsActual !== null)
        .slice(0, 10)
        .map(e => ({
          symbol: e.symbol,
          companyName: e.symbol,
          date: e.date,
          epsActual: e.epsActual,
          epsEstimate: e.epsEstimate,
          epsSurprise: e.epsActual !== null ? e.epsActual - e.epsEstimate : 0,
          revenueActual: e.revenueActual,
          revenueEstimate: e.revenueEstimate,
        }));

      const result: EarningsUpdate = {
        upcoming,
        recent,
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting earnings update:', error);
      return {
        upcoming: [],
        recent: [],
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get crypto market update
   */
  async getCryptoUpdate(): Promise<CryptoUpdate> {
    const cacheKey = 'cryptoUpdate';
    const cached = this.getFromCache<CryptoUpdate>(cacheKey);
    if (cached) return cached;

    try {
      const [globalData, topCryptos, trending] = await Promise.all([
        this.getCryptoGlobalData(),
        unifiedDataService.getAssets(['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'DOT']),
        unifiedDataService.getTrendingCrypto(),
      ]);

      const result: CryptoUpdate = {
        marketOverview: {
          totalMarketCap: globalData?.total_market_cap || 0,
          totalVolume: globalData?.total_volume || 0,
          btcDominance: globalData?.market_cap_percentage?.btc || 0,
          marketCapChange24h: globalData?.market_cap_change_percentage_24h || 0,
        },
        topCoins: topCryptos
          .filter(a => a.type === 'crypto')
          .slice(0, 10)
          .map(a => ({
            symbol: a.symbol,
            name: a.name,
            price: a.price,
            change24h: a.changePercent24h,
            marketCap: a.marketCap,
          })),
        trending: trending.slice(0, 5).map((t, i) => ({
          symbol: t.symbol,
          name: t.name,
          rank: i + 1,
        })),
        generatedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[ContentAggregator] Error getting crypto update:', error);
      return {
        marketOverview: {
          totalMarketCap: 0,
          totalVolume: 0,
          btcDominance: 0,
          marketCapChange24h: 0,
        },
        topCoins: [],
        trending: [],
        generatedAt: new Date().toISOString(),
      };
    }
  }

  // Helper methods

  private async getCryptoGlobalData() {
    try {
      const { coinGeckoService } = await import('../data/coinGecko');
      return coinGeckoService.getGlobalData();
    } catch {
      return null;
    }
  }

  private determineMarketStatus(): 'open' | 'closed' | 'pre-market' | 'after-hours' {
    const now = new Date();
    const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hour = nyTime.getHours();
    const minute = nyTime.getMinutes();
    const day = nyTime.getDay();

    // Weekend
    if (day === 0 || day === 6) return 'closed';

    const timeInMinutes = hour * 60 + minute;
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    const preMarketStart = 4 * 60; // 4:00 AM
    const afterHoursEnd = 20 * 60; // 8:00 PM

    if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
      return 'open';
    } else if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
      return 'pre-market';
    } else if (timeInMinutes >= marketClose && timeInMinutes < afterHoursEnd) {
      return 'after-hours';
    }

    return 'closed';
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'bull', 'moon', 'rocket', 'gain', 'up', 'buy', 'calls', 'long',
      'breakout', 'rally', 'surge', 'profit', 'win', 'diamond', 'hands',
    ];
    const negativeWords = [
      'bear', 'crash', 'dump', 'loss', 'down', 'sell', 'puts', 'short',
      'drop', 'tank', 'fear', 'panic', 'bag', 'holder', 'rekt',
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) score++;
    }
    for (const word of negativeWords) {
      if (lowerText.includes(word)) score--;
    }

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  private extractTrendingTopics(posts: Array<{ title: string; selftext: string }>): string[] {
    const tickerPattern = /\$([A-Z]{1,5})\b/g;
    const tickerCounts = new Map<string, number>();

    for (const post of posts) {
      const text = post.title + ' ' + post.selftext;
      const matches = Array.from(text.matchAll(tickerPattern));
      for (const match of matches) {
        const ticker = match[1];
        tickerCounts.set(ticker, (tickerCounts.get(ticker) || 0) + 1);
      }
    }

    return Array.from(tickerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([ticker]) => `$${ticker}`);
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.cacheTTL) {
      return item.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const contentAggregatorService = new ContentAggregatorService();
export default contentAggregatorService;

