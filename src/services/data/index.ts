/**
 * PRD-1.1.9: Data Normalization & Aggregation Layer
 * 
 * Unified data schema across all data sources with automatic source selection.
 * This is the main entry point for all data access in the application.
 * 
 * Features:
 * - Unified symbol format
 * - Standardized price data structure
 * - Consistent timestamp formats
 * - Currency normalization
 * - Automatic source selection
 * - Fallback mechanisms
 * - Health monitoring
 * 
 * Source Priority:
 * 1. Primary source for each data type
 * 2. Automatic fallback on failure
 * 3. Caching across sources
 */

import { Asset, PriceHistory, Fundamentals, NewsItem } from '@/types';
import { yahooFinanceService } from './yahooFinance';
import { secEdgarService, SECFiling, InsiderTransaction } from './secEdgar';
import { fredApiService, EconomicIndicator, FRED_SERIES } from './fredApi';
import { alphaVantageService, IncomeStatement, BalanceSheet, CashFlowStatement, TechnicalIndicatorData } from './alphaVantage';
import { coinGeckoService, CoinGeckoMarketData } from './coinGecko';
import { newsAggregatorService, RedditPost } from './newsAggregator';
import { iexCloudService, IEXQuote, IEXSectorPerformance } from './iexCloud';
import { finnhubService, FinnhubEarningsCalendar, FinnhubRecommendation, FinnhubPriceTarget } from './finnhub';

// Re-export all services
export { yahooFinanceService } from './yahooFinance';
export { secEdgarService } from './secEdgar';
export { fredApiService, FRED_SERIES } from './fredApi';
export { alphaVantageService } from './alphaVantage';
export { coinGeckoService } from './coinGecko';
export { newsAggregatorService } from './newsAggregator';
export { iexCloudService } from './iexCloud';
export { finnhubService } from './finnhub';

// Data source health status
interface SourceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  errorCount: number;
  latency: number;
}

// Unified data service configuration
interface DataServiceConfig {
  enableFallback: boolean;
  cacheEnabled: boolean;
  maxRetries: number;
  timeout: number;
}

/**
 * Unified Data Service
 * 
 * Main entry point for all data access. Handles source selection,
 * fallback logic, and data normalization.
 */
class UnifiedDataService {
  private config: DataServiceConfig = {
    enableFallback: true,
    cacheEnabled: true,
    maxRetries: 2,
    timeout: 10000,
  };

  private sourceHealth: Map<string, SourceHealth> = new Map();

  constructor() {
    // Initialize source health tracking
    const sources = [
      'yahooFinance', 'secEdgar', 'fred', 'alphaVantage',
      'coinGecko', 'newsAggregator', 'iexCloud', 'finnhub'
    ];
    sources.forEach(source => {
      this.sourceHealth.set(source, {
        name: source,
        status: 'healthy',
        lastCheck: new Date(),
        errorCount: 0,
        latency: 0,
      });
    });
  }

  // ==================== ASSET DATA ====================

  /**
   * Get asset data with automatic source selection
   * Priority: Yahoo Finance -> IEX Cloud -> Finnhub
   */
  async getAsset(symbol: string): Promise<Asset | null> {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    const assetType = this.detectAssetType(normalizedSymbol);

    // Route to appropriate source based on asset type
    if (assetType === 'crypto') {
      return this.getCryptoAsset(normalizedSymbol);
    }

    // Try Yahoo Finance first (primary source)
    try {
      const asset = await this.withHealthTracking('yahooFinance', () =>
        yahooFinanceService.getQuote(normalizedSymbol)
      );
      if (asset) return asset;
    } catch (error) {
      console.warn(`[UnifiedData] Yahoo Finance failed for ${symbol}, trying fallback`);
    }

    // Fallback to IEX Cloud
    if (this.config.enableFallback) {
      try {
        const asset = await this.withHealthTracking('iexCloud', () =>
          iexCloudService.getAsset(normalizedSymbol)
        );
        if (asset) return asset;
      } catch (error) {
        console.warn(`[UnifiedData] IEX Cloud failed for ${symbol}`);
      }
    }

    return null;
  }

  /**
   * Get multiple assets
   */
  async getAssets(symbols: string[]): Promise<Asset[]> {
    const normalizedSymbols = symbols.map(s => this.normalizeSymbol(s));
    
    // Separate crypto and stock symbols
    const cryptoSymbols = normalizedSymbols.filter(s => this.detectAssetType(s) === 'crypto');
    const stockSymbols = normalizedSymbols.filter(s => this.detectAssetType(s) !== 'crypto');

    const [stockAssets, cryptoAssets] = await Promise.all([
      stockSymbols.length > 0 ? yahooFinanceService.getQuotes(stockSymbols) : [],
      cryptoSymbols.length > 0 ? coinGeckoService.getTopCryptos(cryptoSymbols.length) : [],
    ]);

    return [...stockAssets, ...cryptoAssets];
  }

  /**
   * Get crypto asset from CoinGecko
   */
  private async getCryptoAsset(symbol: string): Promise<Asset | null> {
    try {
      const coinId = coinGeckoService.symbolToId(symbol);
      const markets = await coinGeckoService.getMarkets({ ids: [coinId], per_page: 1 });
      
      if (markets.length === 0) return null;

      const coin = markets[0];
      return {
        id: coin.symbol.toUpperCase(),
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        type: 'crypto',
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        logoUrl: coin.image,
      };
    } catch (error) {
      console.error(`[UnifiedData] Error getting crypto asset ${symbol}:`, error);
      return null;
    }
  }

  // ==================== PRICE HISTORY ====================

  /**
   * Get historical price data
   * Priority: Yahoo Finance -> CoinGecko (for crypto)
   */
  async getPriceHistory(
    symbol: string,
    range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' = '1y'
  ): Promise<PriceHistory[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    const assetType = this.detectAssetType(normalizedSymbol);

    if (assetType === 'crypto') {
      const coinId = coinGeckoService.symbolToId(normalizedSymbol);
      const days = this.rangeToDays(range);
      return coinGeckoService.getMarketChart(coinId, days);
    }

    return yahooFinanceService.getHistory(normalizedSymbol, range);
  }

  // ==================== FUNDAMENTALS ====================

  /**
   * Get company fundamentals
   * Priority: Yahoo Finance -> Alpha Vantage
   */
  async getFundamentals(symbol: string): Promise<Fundamentals | null> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // Try Yahoo Finance first
    try {
      const fundamentals = await yahooFinanceService.getFundamentals(normalizedSymbol);
      if (fundamentals) return fundamentals;
    } catch (error) {
      console.warn(`[UnifiedData] Yahoo Finance fundamentals failed for ${symbol}`);
    }

    // Fallback to Alpha Vantage
    if (this.config.enableFallback) {
      try {
        return await alphaVantageService.getCompanyOverview(normalizedSymbol);
      } catch (error) {
        console.warn(`[UnifiedData] Alpha Vantage fundamentals failed for ${symbol}`);
      }
    }

    return null;
  }

  /**
   * Get financial statements
   */
  async getFinancialStatements(symbol: string): Promise<{
    incomeStatements: IncomeStatement[];
    balanceSheets: BalanceSheet[];
    cashFlowStatements: CashFlowStatement[];
  }> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    const [incomeStatements, balanceSheets, cashFlowStatements] = await Promise.all([
      alphaVantageService.getIncomeStatements(normalizedSymbol),
      alphaVantageService.getBalanceSheets(normalizedSymbol),
      alphaVantageService.getCashFlowStatements(normalizedSymbol),
    ]);

    return { incomeStatements, balanceSheets, cashFlowStatements };
  }

  // ==================== SEC FILINGS ====================

  /**
   * Get SEC filings for a company
   */
  async getSECFilings(symbol: string): Promise<SECFiling[]> {
    const companyInfo = await secEdgarService.getCompanyInfo(symbol);
    return companyInfo?.filings || [];
  }

  /**
   * Get insider transactions
   */
  async getInsiderTransactions(symbol: string): Promise<InsiderTransaction[]> {
    return secEdgarService.getInsiderTransactions(symbol);
  }

  // ==================== ECONOMIC DATA ====================

  /**
   * Get economic indicators
   */
  async getEconomicIndicators(): Promise<{
    interestRates: EconomicIndicator[];
    inflation: EconomicIndicator[];
    employment: EconomicIndicator[];
    growth: EconomicIndicator[];
    yieldCurve: { spread: number | null; isInverted: boolean };
  }> {
    return fredApiService.getEconomicSummary();
  }

  /**
   * Get specific economic indicator
   */
  async getEconomicIndicator(seriesId: string): Promise<EconomicIndicator | null> {
    return fredApiService.getLatestValue(seriesId);
  }

  // ==================== NEWS ====================

  /**
   * Get aggregated news from all sources
   */
  async getNews(options: {
    symbols?: string[];
    category?: 'business' | 'technology' | 'general';
    limit?: number;
  } = {}): Promise<NewsItem[]> {
    return newsAggregatorService.getAggregatedNews(options);
  }

  /**
   * Get news for a specific company
   */
  async getCompanyNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    return newsAggregatorService.getCompanyNews(symbol, limit);
  }

  /**
   * Get crypto news
   */
  async getCryptoNews(limit: number = 10): Promise<NewsItem[]> {
    return newsAggregatorService.getCryptoNews(limit);
  }

  /**
   * Get Reddit posts from financial subreddits
   */
  async getRedditPosts(subreddits?: string[], limit?: number): Promise<RedditPost[]> {
    return newsAggregatorService.getRedditPosts(subreddits, limit);
  }

  // ==================== MARKET DATA ====================

  /**
   * Get market indices
   */
  async getMarketIndices(): Promise<Array<{ name: string; symbol: string; value: number; change: number; changePercent: number }>> {
    return yahooFinanceService.getMarketIndices();
  }

  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<IEXSectorPerformance[]> {
    return iexCloudService.getSectorPerformance();
  }

  /**
   * Get market movers
   */
  async getMarketMovers(): Promise<{
    gainers: IEXQuote[];
    losers: IEXQuote[];
    mostActive: IEXQuote[];
  }> {
    const [gainers, losers, mostActive] = await Promise.all([
      iexCloudService.getGainers(),
      iexCloudService.getLosers(),
      iexCloudService.getMostActive(),
    ]);

    return { gainers, losers, mostActive };
  }

  /**
   * Get trending tickers
   */
  async getTrendingTickers(): Promise<string[]> {
    return yahooFinanceService.getTrending();
  }

  /**
   * Get trending crypto
   */
  async getTrendingCrypto(): Promise<Array<{ id: string; name: string; symbol: string }>> {
    const trending = await coinGeckoService.getTrending();
    return trending.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
    }));
  }

  // ==================== TECHNICAL ANALYSIS ====================

  /**
   * Get technical indicators
   */
  async getTechnicalIndicators(
    symbol: string,
    indicators: ('RSI' | 'MACD' | 'SMA' | 'BBANDS')[] = ['RSI', 'MACD']
  ): Promise<Record<string, TechnicalIndicatorData | null>> {
    const results: Record<string, TechnicalIndicatorData | null> = {};

    await Promise.all(
      indicators.map(async indicator => {
        switch (indicator) {
          case 'RSI':
            results.RSI = await alphaVantageService.getRSI(symbol);
            break;
          case 'MACD':
            results.MACD = await alphaVantageService.getMACD(symbol);
            break;
          case 'SMA':
            results.SMA = await alphaVantageService.getSMA(symbol);
            break;
          case 'BBANDS':
            results.BBANDS = await alphaVantageService.getBollingerBands(symbol);
            break;
        }
      })
    );

    return results;
  }

  // ==================== EARNINGS & ANALYST DATA ====================

  /**
   * Get earnings calendar
   */
  async getEarningsCalendar(from?: string, to?: string): Promise<FinnhubEarningsCalendar['earningsCalendar']> {
    return finnhubService.getEarningsCalendar(from, to);
  }

  /**
   * Get analyst recommendations
   */
  async getAnalystRecommendations(symbol: string): Promise<FinnhubRecommendation[]> {
    return finnhubService.getRecommendations(symbol);
  }

  /**
   * Get price targets
   */
  async getPriceTarget(symbol: string): Promise<FinnhubPriceTarget | null> {
    return finnhubService.getPriceTarget(symbol);
  }

  // ==================== SEARCH ====================

  /**
   * Search for assets across all types
   */
  async search(query: string): Promise<Array<{ symbol: string; name: string; type: string }>> {
    const [stockResults, cryptoResults] = await Promise.all([
      yahooFinanceService.search(query),
      coinGeckoService.search(query),
    ]);

    const results = [
      ...stockResults.map(r => ({
        symbol: r.symbol,
        name: r.name,
        type: r.type,
      })),
      ...cryptoResults.slice(0, 5).map(r => ({
        symbol: r.symbol.toUpperCase(),
        name: r.name,
        type: 'CRYPTOCURRENCY',
      })),
    ];

    return results;
  }

  // ==================== HEALTH & MONITORING ====================

  /**
   * Get health status of all data sources
   */
  getSourceHealth(): Map<string, SourceHealth> {
    return this.sourceHealth;
  }

  /**
   * Check if a source is healthy
   */
  isSourceHealthy(sourceName: string): boolean {
    const health = this.sourceHealth.get(sourceName);
    return health?.status === 'healthy';
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    yahooFinanceService.clearCache();
    secEdgarService.clearCache();
    fredApiService.clearCache();
    alphaVantageService.clearCache();
    coinGeckoService.clearCache();
    newsAggregatorService.clearCache();
    iexCloudService.clearCache();
    finnhubService.clearCache();
  }

  // ==================== HELPER METHODS ====================

  private normalizeSymbol(symbol: string): string {
    return symbol.toUpperCase().trim();
  }

  private detectAssetType(symbol: string): 'stock' | 'crypto' | 'etf' {
    const cryptoSymbols = [
      'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC',
      'SHIB', 'LTC', 'AVAX', 'LINK', 'UNI', 'ATOM', 'XLM', 'ALGO', 'VET',
      'NEAR', 'FTM', 'SAND', 'MANA', 'AAVE', 'AXS', 'CRO',
    ];

    if (cryptoSymbols.includes(symbol)) return 'crypto';
    if (symbol.includes('-USD') || symbol.includes('-BTC')) return 'crypto';
    if (symbol.startsWith('^')) return 'etf';
    
    return 'stock';
  }

  private rangeToDays(range: string): number {
    const rangeMap: Record<string, number> = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365,
      '2y': 730,
      '5y': 1825,
    };
    return rangeMap[range] || 365;
  }

  private async withHealthTracking<T>(
    sourceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const health = this.sourceHealth.get(sourceName);
    const startTime = Date.now();

    try {
      const result = await operation();
      
      if (health) {
        health.status = 'healthy';
        health.lastCheck = new Date();
        health.latency = Date.now() - startTime;
        health.errorCount = 0;
      }

      return result;
    } catch (error) {
      if (health) {
        health.errorCount++;
        health.lastCheck = new Date();
        health.latency = Date.now() - startTime;
        
        if (health.errorCount >= 3) {
          health.status = 'down';
        } else if (health.errorCount >= 1) {
          health.status = 'degraded';
        }
      }

      throw error;
    }
  }
}

// Singleton instance
export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;

// Type exports
export type {
  SECFiling,
  InsiderTransaction,
  EconomicIndicator,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  TechnicalIndicatorData,
  CoinGeckoMarketData,
  RedditPost,
  IEXQuote,
  IEXSectorPerformance,
  FinnhubRecommendation,
  FinnhubPriceTarget,
};

