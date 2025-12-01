/**
 * API Service Layer
 * 
 * This module provides a centralized API service for making requests to external data providers.
 * Currently configured for mock data, but structured for easy integration with real APIs.
 * 
 * Supported APIs (to be integrated):
 * - Alpha Vantage (Stocks)
 * - CoinGecko (Crypto)
 * - Polygon.io (Market data)
 * - Yahoo Finance (Alternative)
 */

import { Asset, PriceHistory, NewsItem, Fundamentals } from '@/types';
import { mockAssets, mockNews, mockFundamentals, generatePriceHistory } from '@/data/mockData';

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
    // TODO: Replace with real API call
    // const stocks = await fetchWithRetry(`${config.alphaVantage.baseUrl}?function=...`);
    // const crypto = await fetchWithRetry(`${config.coinGecko.baseUrl}/coins/markets?...`);
    
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    return mockAssets;
  },

  /**
   * Get a single asset by ID/symbol
   */
  async getById(id: string): Promise<Asset | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockAssets.find(a => a.id === id) || null;
  },

  /**
   * Search assets by query
   */
  async search(query: string): Promise<Asset[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const lowerQuery = query.toLowerCase();
    return mockAssets.filter(
      a => a.symbol.toLowerCase().includes(lowerQuery) ||
           a.name.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get real-time quote for an asset
   * 
   * Alpha Vantage example:
   * GET https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
   */
  async getQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
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
   * 
   * Alpha Vantage example:
   * GET https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo
   * 
   * CoinGecko example:
   * GET https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30
   */
  async getHistory(
    assetId: string,
    days: number = 90,
    interval: 'daily' | 'hourly' | 'minute' = 'daily'
  ): Promise<PriceHistory[]> {
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
   * 
   * Alpha Vantage example:
   * GET https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=demo
   */
  async getByAssetId(assetId: string): Promise<Fundamentals | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockFundamentals[assetId] || null;
  },

  /**
   * Get financial statements
   */
  async getFinancials(assetId: string, type: 'income' | 'balance' | 'cashflow') {
    // TODO: Implement with real API
    return null;
  },
};

// News Services
export const newsService = {
  /**
   * Get market news
   * 
   * Alpha Vantage example:
   * GET https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&apikey=demo
   */
  async getLatest(limit: number = 10): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockNews.slice(0, limit);
  },

  /**
   * Get news for specific asset
   */
  async getByAsset(assetId: string, limit: number = 5): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockNews.filter(n => n.relatedAssets?.includes(assetId)).slice(0, limit);
  },

  /**
   * Get news with sentiment analysis
   */
  async getWithSentiment(query: string): Promise<NewsItem[]> {
    return this.getLatest(20);
  },
};

// Market Data Services
export const marketService = {
  /**
   * Get market indices
   */
  async getIndices(): Promise<{ name: string; value: number; change: number }[]> {
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

