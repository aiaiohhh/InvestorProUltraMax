/**
 * PRD-1.1.1: Yahoo Finance Integration
 * 
 * Primary free data source for stocks, ETFs, crypto, and basic market data.
 * Uses the yfinance library for data retrieval.
 * 
 * Features:
 * - Real-time quotes (delayed 15-20min)
 * - Historical OHLCV data
 * - Company fundamentals
 * - Market indices
 * 
 * Rate Limit: ~2000 requests/hour (conservative estimate)
 */

import axios from 'axios';
import { Asset, PriceHistory, Fundamentals } from '@/types';

// Yahoo Finance API endpoints
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance';
const YAHOO_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_QUOTE_BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class YahooFinanceService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private requestDelay = 100; // 100ms between requests to avoid rate limiting

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string): Promise<Asset | null> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getFromCache<Asset>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `${YAHOO_QUOTE_BASE}?symbols=${encodeURIComponent(symbol)}`
      );

      const result = response?.quoteResponse?.result?.[0];
      if (!result) return null;

      const asset: Asset = {
        id: symbol,
        symbol: result.symbol || symbol,
        name: result.longName || result.shortName || symbol,
        type: this.determineAssetType(result.quoteType, symbol),
        price: result.regularMarketPrice || 0,
        change24h: result.regularMarketChange || 0,
        changePercent24h: result.regularMarketChangePercent || 0,
        marketCap: result.marketCap || 0,
        volume24h: result.regularMarketVolume || 0,
        high24h: result.regularMarketDayHigh || 0,
        low24h: result.regularMarketDayLow || 0,
        logoUrl: this.getLogoUrl(symbol, result.longName),
      };

      this.setCache(cacheKey, asset);
      return asset;
    } catch (error) {
      console.error(`[YahooFinance] Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get multiple quotes at once
   */
  async getQuotes(symbols: string[]): Promise<Asset[]> {
    const cacheKey = `quotes:${symbols.sort().join(',')}`;
    const cached = this.getFromCache<Asset[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `${YAHOO_QUOTE_BASE}?symbols=${encodeURIComponent(symbols.join(','))}`
      );

      const results = response?.quoteResponse?.result || [];
      const assets: Asset[] = results.map((result: any) => ({
        id: result.symbol,
        symbol: result.symbol,
        name: result.longName || result.shortName || result.symbol,
        type: this.determineAssetType(result.quoteType, result.symbol),
        price: result.regularMarketPrice || 0,
        change24h: result.regularMarketChange || 0,
        changePercent24h: result.regularMarketChangePercent || 0,
        marketCap: result.marketCap || 0,
        volume24h: result.regularMarketVolume || 0,
        high24h: result.regularMarketDayHigh || 0,
        low24h: result.regularMarketDayLow || 0,
        logoUrl: this.getLogoUrl(result.symbol, result.longName),
      }));

      this.setCache(cacheKey, assets);
      return assets;
    } catch (error) {
      console.error(`[YahooFinance] Error fetching quotes:`, error);
      return [];
    }
  }

  /**
   * Get historical price data
   */
  async getHistory(
    symbol: string,
    range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max' = '1y',
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo' = '1d'
  ): Promise<PriceHistory[]> {
    const cacheKey = `history:${symbol}:${range}:${interval}`;
    const cached = this.getFromCache<PriceHistory[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
      );

      const chart = response?.chart?.result?.[0];
      if (!chart) return [];

      const timestamps = chart.timestamp || [];
      const quotes = chart.indicators?.quote?.[0] || {};
      
      const history: PriceHistory[] = timestamps.map((ts: number, i: number) => ({
        timestamp: ts * 1000, // Convert to milliseconds
        price: quotes.close?.[i] || quotes.open?.[i] || 0,
        volume: quotes.volume?.[i] || 0,
      })).filter((item: PriceHistory) => item.price > 0);

      // Use longer cache for historical data
      const historyTTL = range === '1d' ? 60 * 1000 : 30 * 60 * 1000;
      this.setCache(cacheKey, history, historyTTL);
      return history;
    } catch (error) {
      console.error(`[YahooFinance] Error fetching history for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get company fundamentals
   */
  async getFundamentals(symbol: string): Promise<Fundamentals | null> {
    const cacheKey = `fundamentals:${symbol}`;
    const cached = this.getFromCache<Fundamentals>(cacheKey);
    if (cached) return cached;

    try {
      // Yahoo Finance modules for fundamentals
      const modules = 'summaryProfile,financialData,defaultKeyStatistics,price,summaryDetail';
      const response = await this.makeRequest(
        `${YAHOO_FINANCE_BASE}/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`
      );

      const result = response?.quoteSummary?.result?.[0];
      if (!result) return null;

      const profile = result.summaryProfile || {};
      const financialData = result.financialData || {};
      const keyStats = result.defaultKeyStatistics || {};
      const summaryDetail = result.summaryDetail || {};

      const fundamentals: Fundamentals = {
        assetId: symbol,
        peRatio: summaryDetail.trailingPE?.raw,
        pbRatio: keyStats.priceToBook?.raw,
        psRatio: summaryDetail.priceToSalesTrailing12Months?.raw,
        epsGrowth: financialData.earningsGrowth?.raw ? financialData.earningsGrowth.raw * 100 : undefined,
        revenueGrowth: financialData.revenueGrowth?.raw ? financialData.revenueGrowth.raw * 100 : undefined,
        profitMargin: financialData.profitMargins?.raw ? financialData.profitMargins.raw * 100 : undefined,
        debtToEquity: financialData.debtToEquity?.raw,
        roe: financialData.returnOnEquity?.raw ? financialData.returnOnEquity.raw * 100 : undefined,
        roa: financialData.returnOnAssets?.raw ? financialData.returnOnAssets.raw * 100 : undefined,
        currentRatio: financialData.currentRatio?.raw,
        quickRatio: financialData.quickRatio?.raw,
        dividendYield: summaryDetail.dividendYield?.raw ? summaryDetail.dividendYield.raw * 100 : undefined,
        payoutRatio: summaryDetail.payoutRatio?.raw ? summaryDetail.payoutRatio.raw * 100 : undefined,
        beta: summaryDetail.beta?.raw,
        week52High: summaryDetail.fiftyTwoWeekHigh?.raw,
        week52Low: summaryDetail.fiftyTwoWeekLow?.raw,
        avgVolume: summaryDetail.averageVolume?.raw,
        sharesOutstanding: keyStats.sharesOutstanding?.raw,
        description: profile.longBusinessSummary,
        sector: profile.sector,
        industry: profile.industry,
        employees: profile.fullTimeEmployees,
        headquarters: profile.city ? `${profile.city}, ${profile.state || profile.country}` : undefined,
        website: profile.website,
        ceo: undefined, // Not directly available in Yahoo Finance
        founded: undefined, // Not directly available in Yahoo Finance
      };

      // Cache fundamentals for longer (1 hour)
      this.setCache(cacheKey, fundamentals, 60 * 60 * 1000);
      return fundamentals;
    } catch (error) {
      console.error(`[YahooFinance] Error fetching fundamentals for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get market indices
   */
  async getMarketIndices(): Promise<Array<{ name: string; symbol: string; value: number; change: number; changePercent: number }>> {
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^DJI', name: 'DOW' },
      { symbol: '^RUT', name: 'Russell 2000' },
      { symbol: '^VIX', name: 'VIX' },
      { symbol: '^TNX', name: '10Y Treasury' },
    ];

    const cacheKey = 'market:indices';
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const symbols = indices.map(i => i.symbol).join(',');
      const assets = await this.getQuotes(indices.map(i => i.symbol));

      const results = indices.map(index => {
        const asset = assets.find(a => a.symbol === index.symbol);
        return {
          name: index.name,
          symbol: index.symbol,
          value: asset?.price || 0,
          change: asset?.change24h || 0,
          changePercent: asset?.changePercent24h || 0,
        };
      });

      this.setCache(cacheKey, results, 60 * 1000); // 1 minute cache
      return results;
    } catch (error) {
      console.error('[YahooFinance] Error fetching market indices:', error);
      return [];
    }
  }

  /**
   * Search for symbols
   */
  async search(query: string): Promise<Array<{ symbol: string; name: string; type: string; exchange: string }>> {
    const cacheKey = `search:${query}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
      );

      const quotes = response?.quotes || [];
      const results = quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        type: q.quoteType || 'EQUITY',
        exchange: q.exchange || 'Unknown',
      }));

      this.setCache(cacheKey, results, 5 * 60 * 1000);
      return results;
    } catch (error) {
      console.error(`[YahooFinance] Error searching for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get trending tickers
   */
  async getTrending(): Promise<string[]> {
    const cacheKey = 'trending';
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        'https://query1.finance.yahoo.com/v1/finance/trending/US?count=20'
      );

      const quotes = response?.finance?.result?.[0]?.quotes || [];
      const symbols = quotes.map((q: any) => q.symbol);

      this.setCache(cacheKey, symbols, 5 * 60 * 1000);
      return symbols;
    } catch (error) {
      console.error('[YahooFinance] Error fetching trending:', error);
      return [];
    }
  }

  // Private helper methods

  private async makeRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 10000,
          });
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        await this.delay(this.requestDelay);
      }
    }

    this.isProcessingQueue = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private determineAssetType(quoteType: string, symbol: string): 'stock' | 'crypto' | 'etf' {
    if (quoteType === 'CRYPTOCURRENCY') return 'crypto';
    if (quoteType === 'ETF') return 'etf';
    if (symbol.includes('-USD') || symbol.includes('-BTC')) return 'crypto';
    if (symbol.startsWith('^')) return 'etf'; // Indices
    return 'stock';
  }

  private getLogoUrl(symbol: string, companyName?: string): string {
    // Common symbol to domain mappings
    const domainMap: Record<string, string> = {
      AAPL: 'apple.com',
      GOOGL: 'google.com',
      GOOG: 'google.com',
      MSFT: 'microsoft.com',
      AMZN: 'amazon.com',
      META: 'meta.com',
      FB: 'meta.com',
      TSLA: 'tesla.com',
      NVDA: 'nvidia.com',
      JPM: 'jpmorganchase.com',
      V: 'visa.com',
      MA: 'mastercard.com',
      DIS: 'disney.com',
      NFLX: 'netflix.com',
      PYPL: 'paypal.com',
      INTC: 'intel.com',
      AMD: 'amd.com',
      CRM: 'salesforce.com',
      ORCL: 'oracle.com',
      IBM: 'ibm.com',
    };

    if (domainMap[symbol]) {
      return `https://logo.clearbit.com/${domainMap[symbol]}`;
    }

    // Try to derive domain from company name
    if (companyName) {
      const cleanName = companyName
        .toLowerCase()
        .replace(/\s*(inc\.?|corp\.?|corporation|company|co\.?|ltd\.?|llc)\s*/gi, '')
        .replace(/[^a-z0-9]/g, '');
      return `https://logo.clearbit.com/${cleanName}.com`;
    }

    return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
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
export const yahooFinanceService = new YahooFinanceService();
export default yahooFinanceService;

