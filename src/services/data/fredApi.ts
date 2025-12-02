/**
 * PRD-1.1.3: FRED Economic Data Integration
 * 
 * Federal Reserve Economic Data (FRED) API for free access to economic indicators.
 * 
 * Features:
 * - Federal Funds Rate
 * - Treasury yields (1yr, 2yr, 5yr, 10yr, 30yr)
 * - CPI (Consumer Price Index)
 * - PPI (Producer Price Index)
 * - Unemployment rate
 * - GDP growth
 * - Employment statistics
 * 
 * Rate Limit: 120 API calls/minute
 * API Key: Free registration required at https://fred.stlouisfed.org/docs/api/api_key.html
 */

import axios from 'axios';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// Common FRED series IDs
export const FRED_SERIES = {
  // Interest Rates
  FED_FUNDS_RATE: 'FEDFUNDS',
  TREASURY_1Y: 'DGS1',
  TREASURY_2Y: 'DGS2',
  TREASURY_5Y: 'DGS5',
  TREASURY_10Y: 'DGS10',
  TREASURY_30Y: 'DGS30',
  PRIME_RATE: 'DPRIME',

  // Inflation
  CPI_ALL_ITEMS: 'CPIAUCSL',
  CPI_CORE: 'CPILFESL',
  PPI_ALL_COMMODITIES: 'PPIACO',
  PCE_PRICE_INDEX: 'PCEPI',
  INFLATION_EXPECTATIONS: 'MICH',

  // Employment
  UNEMPLOYMENT_RATE: 'UNRATE',
  NONFARM_PAYROLLS: 'PAYEMS',
  INITIAL_CLAIMS: 'ICSA',
  LABOR_FORCE_PARTICIPATION: 'CIVPART',

  // GDP & Growth
  REAL_GDP: 'GDPC1',
  GDP_GROWTH: 'A191RL1Q225SBEA',
  INDUSTRIAL_PRODUCTION: 'INDPRO',

  // Housing
  HOUSING_STARTS: 'HOUST',
  EXISTING_HOME_SALES: 'EXHOSLUSM495S',
  CASE_SHILLER_HOME_PRICE: 'CSUSHPINSA',

  // Consumer
  RETAIL_SALES: 'RSXFS',
  CONSUMER_CONFIDENCE: 'UMCSENT',
  PERSONAL_INCOME: 'PI',
  PERSONAL_SPENDING: 'PCE',

  // Money Supply
  M1_MONEY_SUPPLY: 'M1SL',
  M2_MONEY_SUPPLY: 'M2SL',

  // Market Indicators
  SP500: 'SP500',
  VIX: 'VIXCLS',
  YIELD_CURVE_SPREAD: 'T10Y2Y',
} as const;

export interface FREDSeriesInfo {
  id: string;
  title: string;
  observationStart: string;
  observationEnd: string;
  frequency: string;
  units: string;
  seasonalAdjustment: string;
  lastUpdated: string;
  notes?: string;
}

export interface FREDObservation {
  date: string;
  value: number | null;
}

export interface EconomicIndicator {
  id: string;
  name: string;
  value: number | null;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  date: string;
  frequency: string;
  units: string;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class FREDApiService {
  private apiKey: string;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 60 * 60 * 1000; // 1 hour (economic data updates infrequently)
  private requestDelay = 500; // 500ms between requests (120 req/min = 2 req/sec)
  private lastRequestTime = 0;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_FRED_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[FRED] No API key provided. Get one at https://fred.stlouisfed.org/docs/api/api_key.html');
    }
  }

  /**
   * Get series information
   */
  async getSeriesInfo(seriesId: string): Promise<FREDSeriesInfo | null> {
    const cacheKey = `info:${seriesId}`;
    const cached = this.getFromCache<FREDSeriesInfo>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/series', {
        series_id: seriesId,
      });

      const series = response?.seriess?.[0];
      if (!series) return null;

      const info: FREDSeriesInfo = {
        id: series.id,
        title: series.title,
        observationStart: series.observation_start,
        observationEnd: series.observation_end,
        frequency: series.frequency,
        units: series.units,
        seasonalAdjustment: series.seasonal_adjustment,
        lastUpdated: series.last_updated,
        notes: series.notes,
      };

      this.setCache(cacheKey, info, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return info;
    } catch (error) {
      console.error(`[FRED] Error getting series info for ${seriesId}:`, error);
      return null;
    }
  }

  /**
   * Get observations (data points) for a series
   */
  async getObservations(
    seriesId: string,
    options: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<FREDObservation[]> {
    const { startDate, endDate, limit = 100, sortOrder = 'desc' } = options;

    const cacheKey = `obs:${seriesId}:${startDate || 'start'}:${endDate || 'end'}:${limit}:${sortOrder}`;
    const cached = this.getFromCache<FREDObservation[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: Record<string, string | number> = {
        series_id: seriesId,
        sort_order: sortOrder,
        limit: limit,
      };

      if (startDate) params.observation_start = startDate;
      if (endDate) params.observation_end = endDate;

      const response = await this.makeRequest('/series/observations', params);

      const observations: FREDObservation[] = (response?.observations || []).map((obs: any) => ({
        date: obs.date,
        value: obs.value === '.' ? null : parseFloat(obs.value),
      }));

      this.setCache(cacheKey, observations);
      return observations;
    } catch (error) {
      console.error(`[FRED] Error getting observations for ${seriesId}:`, error);
      return [];
    }
  }

  /**
   * Get latest value for a series
   */
  async getLatestValue(seriesId: string): Promise<EconomicIndicator | null> {
    const cacheKey = `latest:${seriesId}`;
    const cached = this.getFromCache<EconomicIndicator>(cacheKey);
    if (cached) return cached;

    try {
      const [info, observations] = await Promise.all([
        this.getSeriesInfo(seriesId),
        this.getObservations(seriesId, { limit: 2, sortOrder: 'desc' }),
      ]);

      if (!info || observations.length === 0) return null;

      const latest = observations[0];
      const previous = observations[1];

      const change = latest.value !== null && previous?.value !== null
        ? latest.value - previous.value
        : null;

      const changePercent = change !== null && previous?.value !== null && previous.value !== 0
        ? (change / previous.value) * 100
        : null;

      const indicator: EconomicIndicator = {
        id: seriesId,
        name: info.title,
        value: latest.value,
        previousValue: previous?.value || null,
        change,
        changePercent,
        date: latest.date,
        frequency: info.frequency,
        units: info.units,
      };

      this.setCache(cacheKey, indicator, 30 * 60 * 1000); // 30 minute cache
      return indicator;
    } catch (error) {
      console.error(`[FRED] Error getting latest value for ${seriesId}:`, error);
      return null;
    }
  }

  /**
   * Get multiple economic indicators at once
   */
  async getIndicators(seriesIds: string[]): Promise<EconomicIndicator[]> {
    const results = await Promise.all(
      seriesIds.map(id => this.getLatestValue(id))
    );
    return results.filter((r): r is EconomicIndicator => r !== null);
  }

  /**
   * Get key interest rates
   */
  async getInterestRates(): Promise<EconomicIndicator[]> {
    return this.getIndicators([
      FRED_SERIES.FED_FUNDS_RATE,
      FRED_SERIES.TREASURY_2Y,
      FRED_SERIES.TREASURY_10Y,
      FRED_SERIES.TREASURY_30Y,
      FRED_SERIES.PRIME_RATE,
    ]);
  }

  /**
   * Get inflation indicators
   */
  async getInflationIndicators(): Promise<EconomicIndicator[]> {
    return this.getIndicators([
      FRED_SERIES.CPI_ALL_ITEMS,
      FRED_SERIES.CPI_CORE,
      FRED_SERIES.PPI_ALL_COMMODITIES,
      FRED_SERIES.PCE_PRICE_INDEX,
    ]);
  }

  /**
   * Get employment indicators
   */
  async getEmploymentIndicators(): Promise<EconomicIndicator[]> {
    return this.getIndicators([
      FRED_SERIES.UNEMPLOYMENT_RATE,
      FRED_SERIES.NONFARM_PAYROLLS,
      FRED_SERIES.INITIAL_CLAIMS,
      FRED_SERIES.LABOR_FORCE_PARTICIPATION,
    ]);
  }

  /**
   * Get GDP and growth indicators
   */
  async getGrowthIndicators(): Promise<EconomicIndicator[]> {
    return this.getIndicators([
      FRED_SERIES.REAL_GDP,
      FRED_SERIES.GDP_GROWTH,
      FRED_SERIES.INDUSTRIAL_PRODUCTION,
    ]);
  }

  /**
   * Get yield curve data (for recession indicator)
   */
  async getYieldCurve(): Promise<{
    spread: number | null;
    isInverted: boolean;
    treasuryRates: EconomicIndicator[];
  }> {
    const [spread, rates] = await Promise.all([
      this.getLatestValue(FRED_SERIES.YIELD_CURVE_SPREAD),
      this.getIndicators([
        FRED_SERIES.TREASURY_1Y,
        FRED_SERIES.TREASURY_2Y,
        FRED_SERIES.TREASURY_5Y,
        FRED_SERIES.TREASURY_10Y,
        FRED_SERIES.TREASURY_30Y,
      ]),
    ]);

    return {
      spread: spread?.value || null,
      isInverted: (spread?.value || 0) < 0,
      treasuryRates: rates,
    };
  }

  /**
   * Get market sentiment indicators
   */
  async getMarketSentiment(): Promise<EconomicIndicator[]> {
    return this.getIndicators([
      FRED_SERIES.VIX,
      FRED_SERIES.CONSUMER_CONFIDENCE,
      FRED_SERIES.INFLATION_EXPECTATIONS,
    ]);
  }

  /**
   * Get economic calendar summary (key upcoming releases)
   */
  async getEconomicSummary(): Promise<{
    interestRates: EconomicIndicator[];
    inflation: EconomicIndicator[];
    employment: EconomicIndicator[];
    growth: EconomicIndicator[];
    yieldCurve: { spread: number | null; isInverted: boolean };
  }> {
    const [interestRates, inflation, employment, growth, yieldCurve] = await Promise.all([
      this.getInterestRates(),
      this.getInflationIndicators(),
      this.getEmploymentIndicators(),
      this.getGrowthIndicators(),
      this.getYieldCurve(),
    ]);

    return {
      interestRates,
      inflation,
      employment,
      growth,
      yieldCurve: {
        spread: yieldCurve.spread,
        isInverted: yieldCurve.isInverted,
      },
    };
  }

  /**
   * Search for series
   */
  async searchSeries(query: string, limit: number = 20): Promise<FREDSeriesInfo[]> {
    const cacheKey = `search:${query}:${limit}`;
    const cached = this.getFromCache<FREDSeriesInfo[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest('/series/search', {
        search_text: query,
        limit: limit,
      });

      const series: FREDSeriesInfo[] = (response?.seriess || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        observationStart: s.observation_start,
        observationEnd: s.observation_end,
        frequency: s.frequency,
        units: s.units,
        seasonalAdjustment: s.seasonal_adjustment,
        lastUpdated: s.last_updated,
        notes: s.notes,
      }));

      this.setCache(cacheKey, series, 60 * 60 * 1000);
      return series;
    } catch (error) {
      console.error(`[FRED] Error searching for ${query}:`, error);
      return [];
    }
  }

  // Private helper methods

  private async makeRequest(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<any> {
    if (!this.apiKey) {
      console.error('[FRED] No API key configured');
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
      const url = `${FRED_BASE_URL}${endpoint}`;
      const response = await axios.get(url, {
        params: {
          ...params,
          api_key: this.apiKey,
          file_type: 'json',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[FRED] API error: ${error.response?.status} - ${error.message}`);
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
export const fredApiService = new FREDApiService();
export default fredApiService;

