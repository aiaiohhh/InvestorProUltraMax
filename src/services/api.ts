/**
 * API Service Layer
 * 
 * This module provides a centralized API service for making requests to external data providers.
 * Integrates with multiple free data sources as per PRD plan.
 * 
 * Integrated APIs:
 * - Yahoo Finance (Primary stock data)
 * - Alpha Vantage (Fundamentals & Technical)
 * - CoinGecko (Crypto)
 * - IEX Cloud (Real-time quotes)
 * - Finnhub (News & Earnings)
 * - SEC EDGAR (Filings)
 * - FRED (Economic data)
 */

import { Asset, PriceHistory, NewsItem, Fundamentals } from '@/types';
import { mockAssets, mockNews, mockFundamentals, generatePriceHistory } from '@/data/mockData';

// Import unified data service
import { unifiedDataService } from './data';

// Feature flag to switch between mock and real data
const USE_REAL_DATA = process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true';

// API Configuration
const config = {
  alphaVantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || '',
  },
  coinGecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: process.env.NEXT_PUBLIC_COINGECKO_KEY || '',
  },
  polygon: {
    baseUrl: 'https://api.polygon.io',
    apiKey: process.env.NEXT_PUBLIC_POLYGON_KEY || '',
  },
};

// Generic fetch wrapper with error handling
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Asset Services
export const assetService = {
  /**
   * Get all available assets
   */
  async getAll(): Promise<Asset[]> {
    if (USE_REAL_DATA) {
      try {
        // Get top stocks and crypto from real APIs
        const symbols = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META'];
        const cryptoSymbols = ['BTC', 'ETH', 'SOL'];
        const assets = await unifiedDataService.getAssets([...symbols, ...cryptoSymbols]);
        return assets.length > 0 ? assets : mockAssets;
      } catch (error) {
        console.error('[API] Error fetching assets, falling back to mock:', error);
        return mockAssets;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockAssets;
  },

  /**
   * Get a single asset by ID/symbol
   */
  async getById(id: string): Promise<Asset | null> {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getAsset(id);
      } catch (error) {
        console.error(`[API] Error fetching asset ${id}, falling back to mock:`, error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockAssets.find(a => a.id === id) || null;
  },

  /**
   * Search assets by query
   */
  async search(query: string): Promise<Asset[]> {
    if (USE_REAL_DATA) {
      try {
        const results = await unifiedDataService.search(query);
        // Convert search results to Asset format
        const assets = await Promise.all(
          results.slice(0, 10).map(r => unifiedDataService.getAsset(r.symbol))
        );
        return assets.filter((a): a is Asset => a !== null);
      } catch (error) {
        console.error(`[API] Error searching for ${query}, falling back to mock:`, error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    const lowerQuery = query.toLowerCase();
    return mockAssets.filter(
      a => a.symbol.toLowerCase().includes(lowerQuery) ||
           a.name.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get real-time quote for an asset
   */
  async getQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
    if (USE_REAL_DATA) {
      try {
        const asset = await unifiedDataService.getAsset(symbol);
        if (asset) {
          return {
            price: asset.price,
            change: asset.change24h,
            changePercent: asset.changePercent24h,
          };
        }
      } catch (error) {
        console.error(`[API] Error fetching quote for ${symbol}:`, error);
      }
    }
    
    const asset = mockAssets.find(a => a.symbol === symbol);
    if (!asset) return null;
    
    return {
      price: asset.price,
      change: asset.change24h,
      changePercent: asset.changePercent24h,
    };
  },
};

// Price History Services
export const priceService = {
  /**
   * Get historical price data
   */
  async getHistory(
    assetId: string,
    days: number = 90,
    interval: 'daily' | 'hourly' | 'minute' = 'daily'
  ): Promise<PriceHistory[]> {
    if (USE_REAL_DATA) {
      try {
        const range = days <= 5 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';
        return await unifiedDataService.getPriceHistory(assetId, range as any);
      } catch (error) {
        console.error(`[API] Error fetching price history for ${assetId}:`, error);
      }
    }
    
    const asset = mockAssets.find(a => a.id === assetId);
    if (!asset) return [];
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return generatePriceHistory(asset.price, days);
  },

  /**
   * Get intraday price data (for real-time charts)
   */
  async getIntraday(assetId: string): Promise<PriceHistory[]> {
    return this.getHistory(assetId, 1, 'minute');
  },
};

// Fundamentals Services
export const fundamentalsService = {
  /**
   * Get company fundamentals
   */
  async getByAssetId(assetId: string): Promise<Fundamentals | null> {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getFundamentals(assetId);
      } catch (error) {
        console.error(`[API] Error fetching fundamentals for ${assetId}:`, error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockFundamentals[assetId] || null;
  },

  /**
   * Get financial statements
   */
  async getFinancials(assetId: string, type: 'income' | 'balance' | 'cashflow') {
    if (USE_REAL_DATA) {
      try {
        const statements = await unifiedDataService.getFinancialStatements(assetId);
        switch (type) {
          case 'income': return statements.incomeStatements;
          case 'balance': return statements.balanceSheets;
          case 'cashflow': return statements.cashFlowStatements;
        }
      } catch (error) {
        console.error(`[API] Error fetching financials for ${assetId}:`, error);
      }
    }
    return null;
  },
};

// News Services
export const newsService = {
  /**
   * Get market news
   */
  async getLatest(limit: number = 10): Promise<NewsItem[]> {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getNews({ limit });
      } catch (error) {
        console.error('[API] Error fetching news:', error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockNews.slice(0, limit);
  },

  /**
   * Get news for specific asset
   */
  async getByAsset(assetId: string, limit: number = 5): Promise<NewsItem[]> {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getCompanyNews(assetId, limit);
      } catch (error) {
        console.error(`[API] Error fetching news for ${assetId}:`, error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockNews.filter(n => n.relatedAssets?.includes(assetId)).slice(0, limit);
  },

  /**
   * Get news with sentiment analysis
   */
  async getWithSentiment(query: string): Promise<NewsItem[]> {
    return this.getLatest(20);
  },
  
  /**
   * Get crypto news
   */
  async getCryptoNews(limit: number = 10): Promise<NewsItem[]> {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getCryptoNews(limit);
      } catch (error) {
        console.error('[API] Error fetching crypto news:', error);
      }
    }
    return mockNews.filter(n => n.relatedAssets?.some(a => ['BTC', 'ETH', 'SOL'].includes(a))).slice(0, limit);
  },
};

// Market Data Services
export const marketService = {
  /**
   * Get market indices
   */
  async getIndices(): Promise<{ name: string; value: number; change: number }[]> {
    if (USE_REAL_DATA) {
      try {
        const indices = await unifiedDataService.getMarketIndices();
        return indices.map(i => ({
          name: i.name,
          value: i.value,
          change: i.changePercent,
        }));
      } catch (error) {
        console.error('[API] Error fetching market indices:', error);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    return [
      { name: 'S&P 500', value: 4780.94, change: 0.52 },
      { name: 'NASDAQ', value: 15055.65, change: 0.98 },
      { name: 'DOW', value: 37863.80, change: 0.31 },
      { name: 'BTC/USD', value: 67234.50, change: 1.89 },
    ];
  },

  /**
   * Get market status (open/closed)
   */
  async getStatus(): Promise<{ market: string; status: 'open' | 'closed'; nextOpen?: Date }> {
    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    
    // Simple check for US market hours (9:30 AM - 4:00 PM ET)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 14 && hour < 21; // UTC approximation
    
    return {
      market: 'US',
      status: isWeekday && isMarketHours ? 'open' : 'closed',
    };
  },
  
  /**
   * Get top movers
   */
  async getTopMovers(): Promise<{ gainers: any[]; losers: any[]; mostActive: any[] }> {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getMarketMovers();
      } catch (error) {
        console.error('[API] Error fetching market movers:', error);
      }
    }
    return { gainers: [], losers: [], mostActive: [] };
  },
  
  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<Array<{ name: string; performance: number }>> {
    if (USE_REAL_DATA) {
      try {
        const sectors = await unifiedDataService.getSectorPerformance();
        return sectors.map(s => ({
          name: s.name,
          performance: s.performance * 100,
        }));
      } catch (error) {
        console.error('[API] Error fetching sector performance:', error);
      }
    }
    return [];
  },
  
  /**
   * Get economic indicators
   */
  async getEconomicIndicators() {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getEconomicIndicators();
      } catch (error) {
        console.error('[API] Error fetching economic indicators:', error);
      }
    }
    return null;
  },
  
  /**
   * Get earnings calendar
   */
  async getEarningsCalendar(from?: string, to?: string) {
    if (USE_REAL_DATA) {
      try {
        return await unifiedDataService.getEarningsCalendar(from, to);
      } catch (error) {
        console.error('[API] Error fetching earnings calendar:', error);
      }
    }
    return [];
  },
};

// WebSocket Service for Real-time Data
export const wsService = {
  connection: null as WebSocket | null,
  subscribers: new Map<string, Set<(data: any) => void>>(),

  /**
   * Connect to WebSocket for real-time price updates
   */
  connect(url?: string) {
    // TODO: Implement WebSocket connection
    // this.connection = new WebSocket(url || 'wss://stream.polygon.io/...');
    console.log('WebSocket: Would connect to real-time data feed');
  },

  /**
   * Subscribe to price updates for a symbol
   */
  subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)?.add(callback);

    return () => {
      this.subscribers.get(symbol)?.delete(callback);
    };
  },

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.connection?.close();
    this.connection = null;
    this.subscribers.clear();
  },
};

// Unified API export
export const api = {
  assets: assetService,
  prices: priceService,
  fundamentals: fundamentalsService,
  news: newsService,
  market: marketService,
  ws: wsService,
};

export default api;

