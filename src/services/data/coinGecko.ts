/**
 * PRD-1.1.5: CoinGecko Integration
 * 
 * Comprehensive cryptocurrency data from CoinGecko API.
 * 
 * Features:
 * - Real-time prices for 1000+ cryptocurrencies
 * - Historical OHLCV data
 * - Market cap, volume, 24h change
 * - Trending cryptocurrencies
 * - Exchange data
 * 
 * Rate Limit: ~10-50 calls/minute (free tier, no API key required)
 */

import axios from 'axios';
import { Asset, PriceHistory } from '@/types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface CoinGeckoDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    subreddit_url: string;
    twitter_screen_name: string;
  };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
  community_data: {
    twitter_followers: number;
    reddit_subscribers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    commit_count_4_weeks: number;
  };
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
}

export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CoinGeckoService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 60 * 1000; // 1 minute (crypto prices change frequently)
  private requestDelay = 1500; // 1.5 seconds between requests
  private lastRequestTime = 0;

  /**
   * Get list of all coins
   */
  async getCoinList(): Promise<Array<{ id: string; symbol: string; name: string }>> {
    const cacheKey = 'coinlist';
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/coins/list');
      this.setCache(cacheKey, response, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return response;
    } catch (error) {
      console.error('[CoinGecko] Error fetching coin list:', error);
      return [];
    }
  }

  /**
   * Get market data for multiple coins
   */
  async getMarkets(
    options: {
      vs_currency?: string;
      ids?: string[];
      category?: string;
      order?: 'market_cap_desc' | 'market_cap_asc' | 'volume_desc' | 'volume_asc';
      per_page?: number;
      page?: number;
      sparkline?: boolean;
      price_change_percentage?: string;
    } = {}
  ): Promise<CoinGeckoMarketData[]> {
    const {
      vs_currency = 'usd',
      ids,
      category,
      order = 'market_cap_desc',
      per_page = 100,
      page = 1,
      sparkline = false,
      price_change_percentage = '24h,7d,30d',
    } = options;

    const cacheKey = `markets:${vs_currency}:${ids?.join(',') || 'all'}:${order}:${per_page}:${page}`;
    const cached = this.getFromCache<CoinGeckoMarketData[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: Record<string, string | number | boolean> = {
        vs_currency,
        order,
        per_page,
        page,
        sparkline,
        price_change_percentage,
      };

      if (ids && ids.length > 0) {
        params.ids = ids.join(',');
      }
      if (category) {
        params.category = category;
      }

      const response = await this.makeRequest('/coins/markets', params);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('[CoinGecko] Error fetching markets:', error);
      return [];
    }
  }

  /**
   * Get top cryptocurrencies as Asset objects
   */
  async getTopCryptos(limit: number = 20): Promise<Asset[]> {
    const markets = await this.getMarkets({ per_page: limit });
    
    return markets.map(coin => ({
      id: coin.symbol.toUpperCase(),
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      type: 'crypto' as const,
      price: coin.current_price,
      change24h: coin.price_change_24h,
      changePercent24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      logoUrl: coin.image,
    }));
  }

  /**
   * Get detailed coin data
   */
  async getCoinDetail(coinId: string): Promise<CoinGeckoDetail | null> {
    const cacheKey = `detail:${coinId}`;
    const cached = this.getFromCache<CoinGeckoDetail>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(`/coins/${coinId}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: true,
        developer_data: true,
        sparkline: false,
      });

      this.setCache(cacheKey, response, 5 * 60 * 1000); // 5 minute cache
      return response;
    } catch (error) {
      console.error(`[CoinGecko] Error fetching coin detail for ${coinId}:`, error);
      return null;
    }
  }

  /**
   * Get coin price history
   */
  async getMarketChart(
    coinId: string,
    days: number | 'max' = 30,
    vs_currency: string = 'usd'
  ): Promise<PriceHistory[]> {
    const cacheKey = `chart:${coinId}:${days}:${vs_currency}`;
    const cached = this.getFromCache<PriceHistory[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(`/coins/${coinId}/market_chart`, {
        vs_currency,
        days: days.toString(),
      });

      const prices = response?.prices || [];
      const volumes = response?.total_volumes || [];

      const history: PriceHistory[] = prices.map((p: [number, number], i: number) => ({
        timestamp: p[0],
        price: p[1],
        volume: volumes[i]?.[1] || 0,
      }));

      // Cache based on time range
      const cacheTTL = days === 1 ? 60 * 1000 : days <= 7 ? 5 * 60 * 1000 : 30 * 60 * 1000;
      this.setCache(cacheKey, history, cacheTTL);
      return history;
    } catch (error) {
      console.error(`[CoinGecko] Error fetching market chart for ${coinId}:`, error);
      return [];
    }
  }

  /**
   * Get OHLC data
   */
  async getOHLC(
    coinId: string,
    days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 30,
    vs_currency: string = 'usd'
  ): Promise<Array<{ timestamp: number; open: number; high: number; low: number; close: number }>> {
    const cacheKey = `ohlc:${coinId}:${days}:${vs_currency}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(`/coins/${coinId}/ohlc`, {
        vs_currency,
        days: days.toString(),
      });

      const ohlc = (response || []).map((candle: number[]) => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
      }));

      this.setCache(cacheKey, ohlc, 5 * 60 * 1000);
      return ohlc;
    } catch (error) {
      console.error(`[CoinGecko] Error fetching OHLC for ${coinId}:`, error);
      return [];
    }
  }

  /**
   * Get trending coins
   */
  async getTrending(): Promise<TrendingCoin[]> {
    const cacheKey = 'trending';
    const cached = this.getFromCache<TrendingCoin[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/search/trending');
      const coins = (response?.coins || []).map((item: any) => item.item);
      this.setCache(cacheKey, coins, 5 * 60 * 1000);
      return coins;
    } catch (error) {
      console.error('[CoinGecko] Error fetching trending:', error);
      return [];
    }
  }

  /**
   * Get global crypto market data
   */
  async getGlobalData(): Promise<{
    total_market_cap: number;
    total_volume: number;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h: number;
    active_cryptocurrencies: number;
    markets: number;
  } | null> {
    const cacheKey = 'global';
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/global');
      const data = response?.data;
      
      if (!data) return null;

      const result = {
        total_market_cap: data.total_market_cap?.usd || 0,
        total_volume: data.total_volume?.usd || 0,
        market_cap_percentage: data.market_cap_percentage || {},
        market_cap_change_percentage_24h: data.market_cap_change_percentage_24h_usd || 0,
        active_cryptocurrencies: data.active_cryptocurrencies || 0,
        markets: data.markets || 0,
      };

      this.setCache(cacheKey, result, 2 * 60 * 1000);
      return result;
    } catch (error) {
      console.error('[CoinGecko] Error fetching global data:', error);
      return null;
    }
  }

  /**
   * Search for coins
   */
  async search(query: string): Promise<Array<{ id: string; symbol: string; name: string; market_cap_rank: number; thumb: string }>> {
    const cacheKey = `search:${query}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/search', { query });
      const coins = response?.coins || [];
      this.setCache(cacheKey, coins, 5 * 60 * 1000);
      return coins;
    } catch (error) {
      console.error(`[CoinGecko] Error searching for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get simple price for multiple coins
   */
  async getSimplePrice(
    ids: string[],
    vs_currencies: string[] = ['usd'],
    options: {
      include_market_cap?: boolean;
      include_24hr_vol?: boolean;
      include_24hr_change?: boolean;
    } = {}
  ): Promise<Record<string, Record<string, number>>> {
    const cacheKey = `simple:${ids.join(',')}:${vs_currencies.join(',')}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/simple/price', {
        ids: ids.join(','),
        vs_currencies: vs_currencies.join(','),
        include_market_cap: options.include_market_cap || false,
        include_24hr_vol: options.include_24hr_vol || false,
        include_24hr_change: options.include_24hr_change || false,
      });

      this.setCache(cacheKey, response, 30 * 1000); // 30 second cache
      return response;
    } catch (error) {
      console.error('[CoinGecko] Error fetching simple price:', error);
      return {};
    }
  }

  /**
   * Map common symbols to CoinGecko IDs
   */
  symbolToId(symbol: string): string {
    const symbolMap: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      BNB: 'binancecoin',
      XRP: 'ripple',
      ADA: 'cardano',
      SOL: 'solana',
      DOGE: 'dogecoin',
      DOT: 'polkadot',
      MATIC: 'matic-network',
      SHIB: 'shiba-inu',
      LTC: 'litecoin',
      AVAX: 'avalanche-2',
      LINK: 'chainlink',
      UNI: 'uniswap',
      ATOM: 'cosmos',
      XLM: 'stellar',
      ALGO: 'algorand',
      VET: 'vechain',
      NEAR: 'near',
      FTM: 'fantom',
      SAND: 'the-sandbox',
      MANA: 'decentraland',
      AAVE: 'aave',
      AXS: 'axie-infinity',
      CRO: 'crypto-com-chain',
    };

    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  // Private helper methods

  private async makeRequest(
    endpoint: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<any> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await this.delay(this.requestDelay - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(`${COINGECKO_BASE}${endpoint}`, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          console.warn('[CoinGecko] Rate limit hit, waiting...');
          await this.delay(60000); // Wait 1 minute
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
export const coinGeckoService = new CoinGeckoService();
export default coinGeckoService;

