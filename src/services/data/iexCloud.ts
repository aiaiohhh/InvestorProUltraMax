/**
 * PRD-1.1.7: IEX Cloud Free Tier Integration
 * 
 * Real-time stock quotes from IEX Cloud.
 * 
 * Features:
 * - Real-time quotes
 * - Bid/ask prices
 * - Volume data
 * - Market status
 * - Sector performance
 * - Market movers
 * 
 * Rate Limit: 50,000 messages/month (free tier)
 * API Key: Required - https://iexcloud.io/console/tokens
 */

import axios from 'axios';
import { Asset } from '@/types';

const IEX_CLOUD_BASE = 'https://cloud.iexapis.com/stable';
const IEX_SANDBOX_BASE = 'https://sandbox.iexapis.com/stable';

export interface IEXQuote {
  symbol: string;
  companyName: string;
  primaryExchange: string;
  calculationPrice: string;
  open: number | null;
  openTime: number | null;
  close: number | null;
  closeTime: number | null;
  high: number | null;
  low: number | null;
  latestPrice: number;
  latestSource: string;
  latestTime: string;
  latestUpdate: number;
  latestVolume: number | null;
  iexRealtimePrice: number | null;
  iexRealtimeSize: number | null;
  iexLastUpdated: number | null;
  delayedPrice: number | null;
  delayedPriceTime: number | null;
  extendedPrice: number | null;
  extendedChange: number | null;
  extendedChangePercent: number | null;
  extendedPriceTime: number | null;
  previousClose: number;
  previousVolume: number;
  change: number;
  changePercent: number;
  volume: number | null;
  iexMarketPercent: number | null;
  iexVolume: number | null;
  avgTotalVolume: number;
  iexBidPrice: number | null;
  iexBidSize: number | null;
  iexAskPrice: number | null;
  iexAskSize: number | null;
  marketCap: number;
  peRatio: number | null;
  week52High: number;
  week52Low: number;
  ytdChange: number;
  lastTradeTime: number;
  isUSMarketOpen: boolean;
}

export interface IEXCompany {
  symbol: string;
  companyName: string;
  exchange: string;
  industry: string;
  website: string;
  description: string;
  CEO: string;
  securityName: string;
  issueType: string;
  sector: string;
  employees: number;
  tags: string[];
  address: string;
  address2: string | null;
  state: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
}

export interface IEXStats {
  companyName: string;
  marketcap: number;
  week52high: number;
  week52low: number;
  week52change: number;
  sharesOutstanding: number;
  float: number;
  avg10Volume: number;
  avg30Volume: number;
  day200MovingAvg: number;
  day50MovingAvg: number;
  employees: number;
  ttmEPS: number;
  ttmDividendRate: number;
  dividendYield: number;
  nextDividendDate: string;
  exDividendDate: string;
  nextEarningsDate: string;
  peRatio: number;
  beta: number;
  maxChangePercent: number;
  year5ChangePercent: number;
  year2ChangePercent: number;
  year1ChangePercent: number;
  ytdChangePercent: number;
  month6ChangePercent: number;
  month3ChangePercent: number;
  month1ChangePercent: number;
  day30ChangePercent: number;
  day5ChangePercent: number;
}

export interface IEXSectorPerformance {
  type: string;
  name: string;
  performance: number;
  lastUpdated: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class IEXCloudService {
  private apiKey: string;
  private useSandbox: boolean;
  private baseUrl: string;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 60 * 1000; // 1 minute
  private monthlyMessageCount = 0;
  private monthlyMessageLimit = 50000;
  private lastResetMonth: string = '';

  constructor(apiKey?: string, useSandbox: boolean = false) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_IEX_CLOUD_KEY || '';
    this.useSandbox = useSandbox;
    this.baseUrl = useSandbox ? IEX_SANDBOX_BASE : IEX_CLOUD_BASE;
    
    if (!this.apiKey) {
      console.warn('[IEXCloud] No API key provided. Get one at https://iexcloud.io/console/tokens');
    }
    
    this.resetMonthlyCountIfNeeded();
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string): Promise<IEXQuote | null> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getFromCache<IEXQuote>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/stock/${symbol}/quote`);
      if (!data) return null;

      this.setCache(cacheKey, data, 15 * 1000); // 15 second cache for quotes
      return data;
    } catch (error) {
      console.error(`[IEXCloud] Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get quotes for multiple symbols
   */
  async getBatchQuotes(symbols: string[]): Promise<Record<string, IEXQuote>> {
    if (symbols.length === 0) return {};

    const cacheKey = `batch:${symbols.sort().join(',')}`;
    const cached = this.getFromCache<Record<string, IEXQuote>>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/market/batch', {
        symbols: symbols.join(','),
        types: 'quote',
      });

      const quotes: Record<string, IEXQuote> = {};
      for (const [symbol, result] of Object.entries(data || {})) {
        if ((result as any).quote) {
          quotes[symbol] = (result as any).quote;
        }
      }

      this.setCache(cacheKey, quotes, 15 * 1000);
      return quotes;
    } catch (error) {
      console.error('[IEXCloud] Error fetching batch quotes:', error);
      return {};
    }
  }

  /**
   * Get quote as Asset object
   */
  async getAsset(symbol: string): Promise<Asset | null> {
    const quote = await this.getQuote(symbol);
    if (!quote) return null;

    return {
      id: quote.symbol,
      symbol: quote.symbol,
      name: quote.companyName,
      type: 'stock',
      price: quote.latestPrice,
      change24h: quote.change,
      changePercent24h: quote.changePercent * 100,
      marketCap: quote.marketCap,
      volume24h: quote.volume || quote.latestVolume || 0,
      high24h: quote.high || quote.latestPrice,
      low24h: quote.low || quote.latestPrice,
      logoUrl: `https://storage.googleapis.com/iex/api/logos/${quote.symbol}.png`,
    };
  }

  /**
   * Get company information
   */
  async getCompany(symbol: string): Promise<IEXCompany | null> {
    const cacheKey = `company:${symbol}`;
    const cached = this.getFromCache<IEXCompany>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/stock/${symbol}/company`);
      if (!data) return null;

      this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 24 hour cache
      return data;
    } catch (error) {
      console.error(`[IEXCloud] Error fetching company for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get key statistics
   */
  async getStats(symbol: string): Promise<IEXStats | null> {
    const cacheKey = `stats:${symbol}`;
    const cached = this.getFromCache<IEXStats>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/stock/${symbol}/stats`);
      if (!data) return null;

      this.setCache(cacheKey, data, 60 * 60 * 1000); // 1 hour cache
      return data;
    } catch (error) {
      console.error(`[IEXCloud] Error fetching stats for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<IEXSectorPerformance[]> {
    const cacheKey = 'sectors';
    const cached = this.getFromCache<IEXSectorPerformance[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/market/sector-performance');
      if (!data) return [];

      this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minute cache
      return data;
    } catch (error) {
      console.error('[IEXCloud] Error fetching sector performance:', error);
      return [];
    }
  }

  /**
   * Get market movers (gainers)
   */
  async getGainers(): Promise<IEXQuote[]> {
    const cacheKey = 'gainers';
    const cached = this.getFromCache<IEXQuote[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/market/list/gainers');
      if (!data) return [];

      this.setCache(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      console.error('[IEXCloud] Error fetching gainers:', error);
      return [];
    }
  }

  /**
   * Get market movers (losers)
   */
  async getLosers(): Promise<IEXQuote[]> {
    const cacheKey = 'losers';
    const cached = this.getFromCache<IEXQuote[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/market/list/losers');
      if (!data) return [];

      this.setCache(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      console.error('[IEXCloud] Error fetching losers:', error);
      return [];
    }
  }

  /**
   * Get most active stocks
   */
  async getMostActive(): Promise<IEXQuote[]> {
    const cacheKey = 'mostactive';
    const cached = this.getFromCache<IEXQuote[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/stock/market/list/mostactive');
      if (!data) return [];

      this.setCache(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      console.error('[IEXCloud] Error fetching most active:', error);
      return [];
    }
  }

  /**
   * Get intraday prices
   */
  async getIntradayPrices(symbol: string): Promise<Array<{
    date: string;
    minute: string;
    label: string;
    high: number;
    low: number;
    open: number;
    close: number;
    average: number;
    volume: number;
    notional: number;
    numberOfTrades: number;
  }>> {
    const cacheKey = `intraday:${symbol}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/stock/${symbol}/intraday-prices`);
      if (!data) return [];

      this.setCache(cacheKey, data, 60 * 1000); // 1 minute cache
      return data;
    } catch (error) {
      console.error(`[IEXCloud] Error fetching intraday prices for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get historical prices
   */
  async getHistoricalPrices(
    symbol: string,
    range: '1m' | '3m' | '6m' | '1y' | '2y' | '5y' | 'max' = '1m'
  ): Promise<Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    uOpen: number;
    uHigh: number;
    uLow: number;
    uClose: number;
    uVolume: number;
    change: number;
    changePercent: number;
    label: string;
    changeOverTime: number;
  }>> {
    const cacheKey = `historical:${symbol}:${range}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/stock/${symbol}/chart/${range}`);
      if (!data) return [];

      // Cache based on range
      const cacheTTL = range === '1m' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      this.setCache(cacheKey, data, cacheTTL);
      return data;
    } catch (error) {
      console.error(`[IEXCloud] Error fetching historical prices for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Search for symbols
   */
  async search(query: string): Promise<Array<{
    symbol: string;
    securityName: string;
    securityType: string;
    region: string;
    exchange: string;
  }>> {
    const cacheKey = `search:${query}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/search/' + encodeURIComponent(query));
      if (!data) return [];

      this.setCache(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      console.error(`[IEXCloud] Error searching for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get market status
   */
  async isMarketOpen(): Promise<boolean> {
    const cacheKey = 'marketstatus';
    const cached = this.getFromCache<boolean>(cacheKey);
    if (cached !== null) return cached;

    try {
      // Check a major stock's quote for market status
      const quote = await this.getQuote('SPY');
      const isOpen = quote?.isUSMarketOpen || false;

      this.setCache(cacheKey, isOpen, 60 * 1000);
      return isOpen;
    } catch (error) {
      console.error('[IEXCloud] Error checking market status:', error);
      return false;
    }
  }

  /**
   * Get remaining API messages for the month
   */
  getRemainingMessages(): number {
    this.resetMonthlyCountIfNeeded();
    return this.monthlyMessageLimit - this.monthlyMessageCount;
  }

  // Private helper methods

  private async makeRequest(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<any> {
    if (!this.apiKey) {
      console.error('[IEXCloud] No API key configured');
      return null;
    }

    this.resetMonthlyCountIfNeeded();
    if (this.monthlyMessageCount >= this.monthlyMessageLimit) {
      console.error('[IEXCloud] Monthly message limit reached');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          ...params,
          token: this.apiKey,
        },
        timeout: 10000,
      });

      // Estimate message count (each request uses messages based on data returned)
      this.monthlyMessageCount += 1;

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 402) {
          console.error('[IEXCloud] Message limit exceeded');
        } else if (error.response?.status === 403) {
          console.error('[IEXCloud] Invalid API key');
        }
      }
      throw error;
    }
  }

  private resetMonthlyCountIfNeeded(): void {
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (this.lastResetMonth !== currentMonth) {
      this.monthlyMessageCount = 0;
      this.lastResetMonth = currentMonth;
    }
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
export const iexCloudService = new IEXCloudService();
export default iexCloudService;

