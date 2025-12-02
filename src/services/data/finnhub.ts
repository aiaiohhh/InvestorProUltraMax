/**
 * PRD-1.1.8: Finnhub Free Tier Integration
 * 
 * News, fundamentals, and earnings data from Finnhub.
 * 
 * Features:
 * - Company news and sentiment
 * - Earnings calendar
 * - Insider transactions
 * - Company fundamentals
 * - Real-time quotes (WebSocket)
 * 
 * Rate Limit: 60 calls/minute (free tier)
 * API Key: Required - https://finnhub.io/register
 */

import axios from 'axios';
import { NewsItem } from '@/types';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubEarning {
  actual: number | null;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}

export interface FinnhubEarningsCalendar {
  earningsCalendar: Array<{
    date: string;
    epsActual: number | null;
    epsEstimate: number;
    hour: string;
    quarter: number;
    revenueActual: number | null;
    revenueEstimate: number;
    symbol: string;
    year: number;
  }>;
}

export interface FinnhubInsiderTransaction {
  name: string;
  share: number;
  change: number;
  filingDate: string;
  transactionDate: string;
  transactionCode: string;
  transactionPrice: number;
}

export interface FinnhubRecommendation {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

export interface FinnhubPriceTarget {
  lastUpdated: string;
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class FinnhubService {
  private apiKey: string;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private requestDelay = 1000; // 1 second between requests (60/min)
  private lastRequestTime = 0;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_FINNHUB_KEY || '';
    if (!this.apiKey) {
      console.warn('[Finnhub] No API key provided. Get one at https://finnhub.io/register');
    }
  }

  /**
   * Get real-time quote
   */
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getFromCache<FinnhubQuote>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/quote', { symbol });
      if (!data || data.c === 0) return null;

      this.setCache(cacheKey, data, 30 * 1000); // 30 second cache
      return data;
    } catch (error) {
      console.error(`[Finnhub] Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get company profile
   */
  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile | null> {
    const cacheKey = `profile:${symbol}`;
    const cached = this.getFromCache<FinnhubCompanyProfile>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/profile2', { symbol });
      if (!data || !data.name) return null;

      this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 24 hour cache
      return data;
    } catch (error) {
      console.error(`[Finnhub] Error fetching profile for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get company news
   */
  async getCompanyNews(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<FinnhubNews[]> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const fromDate = from || weekAgo.toISOString().split('T')[0];
    const toDate = to || today.toISOString().split('T')[0];

    const cacheKey = `news:${symbol}:${fromDate}:${toDate}`;
    const cached = this.getFromCache<FinnhubNews[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/company-news', {
        symbol,
        from: fromDate,
        to: toDate,
      });

      this.setCache(cacheKey, data || [], 5 * 60 * 1000);
      return data || [];
    } catch (error) {
      console.error(`[Finnhub] Error fetching news for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get company news as NewsItem objects
   */
  async getCompanyNewsItems(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    const news = await this.getCompanyNews(symbol);
    
    return news.slice(0, limit).map((item, index) => ({
      id: `finnhub-${item.id || Date.now()}-${index}`,
      title: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      sentiment: this.analyzeSentiment(item.headline + ' ' + item.summary),
      relatedAssets: [symbol],
      imageUrl: item.image,
    }));
  }

  /**
   * Get market news
   */
  async getMarketNews(category: 'general' | 'forex' | 'crypto' | 'merger' = 'general'): Promise<FinnhubNews[]> {
    const cacheKey = `marketnews:${category}`;
    const cached = this.getFromCache<FinnhubNews[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/news', { category });
      this.setCache(cacheKey, data || [], 5 * 60 * 1000);
      return data || [];
    } catch (error) {
      console.error(`[Finnhub] Error fetching market news:`, error);
      return [];
    }
  }

  /**
   * Get earnings calendar
   */
  async getEarningsCalendar(
    from?: string,
    to?: string,
    symbol?: string
  ): Promise<FinnhubEarningsCalendar['earningsCalendar']> {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const fromDate = from || today.toISOString().split('T')[0];
    const toDate = to || nextMonth.toISOString().split('T')[0];

    const cacheKey = `earnings:${fromDate}:${toDate}:${symbol || 'all'}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: Record<string, string> = {
        from: fromDate,
        to: toDate,
      };
      if (symbol) params.symbol = symbol;

      const data = await this.makeRequest('/calendar/earnings', params);
      const earnings = data?.earningsCalendar || [];

      this.setCache(cacheKey, earnings, 30 * 60 * 1000); // 30 minute cache
      return earnings;
    } catch (error) {
      console.error('[Finnhub] Error fetching earnings calendar:', error);
      return [];
    }
  }

  /**
   * Get insider transactions
   */
  async getInsiderTransactions(symbol: string): Promise<FinnhubInsiderTransaction[]> {
    const cacheKey = `insider:${symbol}`;
    const cached = this.getFromCache<FinnhubInsiderTransaction[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/insider-transactions', { symbol });
      const transactions = data?.data || [];

      this.setCache(cacheKey, transactions, 60 * 60 * 1000); // 1 hour cache
      return transactions;
    } catch (error) {
      console.error(`[Finnhub] Error fetching insider transactions for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get analyst recommendations
   */
  async getRecommendations(symbol: string): Promise<FinnhubRecommendation[]> {
    const cacheKey = `recommendations:${symbol}`;
    const cached = this.getFromCache<FinnhubRecommendation[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/recommendation', { symbol });
      this.setCache(cacheKey, data || [], 24 * 60 * 60 * 1000); // 24 hour cache
      return data || [];
    } catch (error) {
      console.error(`[Finnhub] Error fetching recommendations for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get price target consensus
   */
  async getPriceTarget(symbol: string): Promise<FinnhubPriceTarget | null> {
    const cacheKey = `pricetarget:${symbol}`;
    const cached = this.getFromCache<FinnhubPriceTarget>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/price-target', { symbol });
      if (!data || !data.targetMean) return null;

      this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 24 hour cache
      return data;
    } catch (error) {
      console.error(`[Finnhub] Error fetching price target for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get basic financials
   */
  async getBasicFinancials(symbol: string): Promise<Record<string, any> | null> {
    const cacheKey = `financials:${symbol}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/metric', {
        symbol,
        metric: 'all',
      });

      if (!data || !data.metric) return null;

      this.setCache(cacheKey, data.metric, 24 * 60 * 60 * 1000);
      return data.metric;
    } catch (error) {
      console.error(`[Finnhub] Error fetching financials for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get peers (similar companies)
   */
  async getPeers(symbol: string): Promise<string[]> {
    const cacheKey = `peers:${symbol}`;
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/peers', { symbol });
      this.setCache(cacheKey, data || [], 24 * 60 * 60 * 1000);
      return data || [];
    } catch (error) {
      console.error(`[Finnhub] Error fetching peers for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get social sentiment
   */
  async getSocialSentiment(symbol: string): Promise<{
    reddit: { atTime: string; mention: number; positiveScore: number; negativeScore: number; positiveMention: number; negativeMention: number; score: number }[];
    twitter: { atTime: string; mention: number; positiveScore: number; negativeScore: number; positiveMention: number; negativeMention: number; score: number }[];
  } | null> {
    const cacheKey = `sentiment:${symbol}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const data = await this.makeRequest('/stock/social-sentiment', {
        symbol,
        from: weekAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      });

      if (!data) return null;

      this.setCache(cacheKey, data, 30 * 60 * 1000); // 30 minute cache
      return data;
    } catch (error) {
      console.error(`[Finnhub] Error fetching social sentiment for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Search for symbols
   */
  async search(query: string): Promise<Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>> {
    const cacheKey = `search:${query}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/search', { q: query });
      const results = data?.result || [];

      this.setCache(cacheKey, results, 5 * 60 * 1000);
      return results;
    } catch (error) {
      console.error(`[Finnhub] Error searching for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get market status
   */
  async getMarketStatus(exchange: string = 'US'): Promise<{
    exchange: string;
    holiday: string | null;
    isOpen: boolean;
    session: string;
    timezone: string;
    t: number;
  } | null> {
    const cacheKey = `marketstatus:${exchange}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/market-status', { exchange });
      if (!data) return null;

      this.setCache(cacheKey, data, 60 * 1000); // 1 minute cache
      return data;
    } catch (error) {
      console.error(`[Finnhub] Error fetching market status:`, error);
      return null;
    }
  }

  // Private helper methods

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'surge', 'soar', 'gain', 'rise', 'jump', 'rally', 'bull', 'growth',
      'profit', 'beat', 'exceed', 'strong', 'record', 'high', 'up',
      'breakthrough', 'success', 'win', 'boom', 'optimistic',
    ];
    const negativeWords = [
      'drop', 'fall', 'plunge', 'crash', 'bear', 'loss', 'decline',
      'miss', 'weak', 'low', 'down', 'concern', 'fear', 'risk',
      'warning', 'fail', 'crisis', 'recession', 'pessimistic',
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

  private async makeRequest(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<any> {
    if (!this.apiKey) {
      console.error('[Finnhub] No API key configured');
      return null;
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await this.delay(this.requestDelay - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(`${FINNHUB_BASE}${endpoint}`, {
        params: {
          ...params,
          token: this.apiKey,
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          console.warn('[Finnhub] Rate limit hit');
        } else if (error.response?.status === 401) {
          console.error('[Finnhub] Invalid API key');
        }
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < item.ttl) {
      return item.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.defaultCacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const finnhubService = new FinnhubService();
export default finnhubService;

