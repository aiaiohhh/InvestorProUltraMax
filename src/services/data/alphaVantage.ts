/**
 * PRD-1.1.4: Alpha Vantage Integration
 * 
 * Supplementary data source for fundamental and technical data.
 * 
 * Features:
 * - Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.)
 * - Fundamental data (income statements, balance sheets, cash flow)
 * - Earnings data
 * - Company overview
 * 
 * Rate Limit: 5 calls/minute, 500 calls/day (free tier)
 * API Key: Free registration at https://www.alphavantage.co/support/#api-key
 */

import axios from 'axios';
import { Fundamentals } from '@/types';

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

// Technical indicator types
export type TechnicalIndicator = 
  | 'SMA' | 'EMA' | 'WMA' | 'DEMA' | 'TEMA' | 'TRIMA' | 'KAMA'
  | 'MACD' | 'RSI' | 'STOCH' | 'STOCHRSI'
  | 'ADX' | 'AROON' | 'BBANDS' | 'AD' | 'OBV'
  | 'ATR' | 'CCI' | 'MOM' | 'ROC' | 'WILLR';

export interface TechnicalIndicatorData {
  indicator: TechnicalIndicator;
  symbol: string;
  interval: string;
  data: Array<{
    date: string;
    value: number;
    additionalValues?: Record<string, number>;
  }>;
}

export interface IncomeStatement {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalRevenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  ebitda: number;
  eps: number;
  dilutedEps: number;
}

export interface BalanceSheet {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalAssets: number;
  totalLiabilities: number;
  totalShareholderEquity: number;
  cashAndEquivalents: number;
  totalCurrentAssets: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  shortTermDebt: number;
  inventory: number;
  accountsReceivable: number;
  accountsPayable: number;
}

export interface CashFlowStatement {
  fiscalDateEnding: string;
  reportedCurrency: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  capitalExpenditures: number;
  dividendPayout: number;
  freeCashFlow: number;
}

export interface EarningsData {
  symbol: string;
  annualEarnings: Array<{
    fiscalDateEnding: string;
    reportedEPS: number;
  }>;
  quarterlyEarnings: Array<{
    fiscalDateEnding: string;
    reportedDate: string;
    reportedEPS: number;
    estimatedEPS: number;
    surprise: number;
    surprisePercentage: number;
  }>;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class AlphaVantageService {
  private apiKey: string;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 60 * 60 * 1000; // 1 hour
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private requestDelay = 12000; // 12 seconds between requests (5 per minute)
  private dailyRequestCount = 0;
  private dailyRequestLimit = 500;
  private lastResetDate: string = '';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || '';
    if (!this.apiKey) {
      console.warn('[AlphaVantage] No API key provided. Get one at https://www.alphavantage.co/support/#api-key');
    }
    this.resetDailyCountIfNeeded();
  }

  /**
   * Get company overview (fundamentals)
   */
  async getCompanyOverview(symbol: string): Promise<Fundamentals | null> {
    const cacheKey = `overview:${symbol}`;
    const cached = this.getFromCache<Fundamentals>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest({
        function: 'OVERVIEW',
        symbol: symbol,
      });

      if (!data || data.Note || data['Error Message']) {
        console.error('[AlphaVantage] API error:', data?.Note || data?.['Error Message']);
        return null;
      }

      const fundamentals: Fundamentals = {
        assetId: symbol,
        peRatio: parseFloat(data.PERatio) || undefined,
        pbRatio: parseFloat(data.PriceToBookRatio) || undefined,
        psRatio: parseFloat(data.PriceToSalesRatioTTM) || undefined,
        epsGrowth: parseFloat(data.QuarterlyEarningsGrowthYOY) ? parseFloat(data.QuarterlyEarningsGrowthYOY) * 100 : undefined,
        revenueGrowth: parseFloat(data.QuarterlyRevenueGrowthYOY) ? parseFloat(data.QuarterlyRevenueGrowthYOY) * 100 : undefined,
        profitMargin: parseFloat(data.ProfitMargin) ? parseFloat(data.ProfitMargin) * 100 : undefined,
        debtToEquity: undefined, // Not directly available
        roe: parseFloat(data.ReturnOnEquityTTM) ? parseFloat(data.ReturnOnEquityTTM) * 100 : undefined,
        roa: parseFloat(data.ReturnOnAssetsTTM) ? parseFloat(data.ReturnOnAssetsTTM) * 100 : undefined,
        currentRatio: undefined, // Requires balance sheet
        quickRatio: undefined, // Requires balance sheet
        dividendYield: parseFloat(data.DividendYield) ? parseFloat(data.DividendYield) * 100 : undefined,
        payoutRatio: parseFloat(data.PayoutRatio) ? parseFloat(data.PayoutRatio) * 100 : undefined,
        beta: parseFloat(data.Beta) || undefined,
        week52High: parseFloat(data['52WeekHigh']) || undefined,
        week52Low: parseFloat(data['52WeekLow']) || undefined,
        avgVolume: parseInt(data.AverageVolume) || undefined,
        sharesOutstanding: parseInt(data.SharesOutstanding) || undefined,
        description: data.Description,
        sector: data.Sector,
        industry: data.Industry,
        employees: parseInt(data.FullTimeEmployees) || undefined,
        headquarters: data.Address ? `${data.Address}, ${data.Country}` : undefined,
        website: undefined, // Not available in Alpha Vantage
        ceo: undefined, // Not available in Alpha Vantage
        founded: undefined, // Not available in Alpha Vantage
      };

      this.setCache(cacheKey, fundamentals, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return fundamentals;
    } catch (error) {
      console.error(`[AlphaVantage] Error getting company overview for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get income statements
   */
  async getIncomeStatements(symbol: string, annual: boolean = true): Promise<IncomeStatement[]> {
    const cacheKey = `income:${symbol}:${annual ? 'annual' : 'quarterly'}`;
    const cached = this.getFromCache<IncomeStatement[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest({
        function: 'INCOME_STATEMENT',
        symbol: symbol,
      });

      if (!data || data.Note || data['Error Message']) {
        return [];
      }

      const reports = annual ? data.annualReports : data.quarterlyReports;
      const statements: IncomeStatement[] = (reports || []).map((report: any) => ({
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        totalRevenue: parseFloat(report.totalRevenue) || 0,
        costOfRevenue: parseFloat(report.costOfRevenue) || 0,
        grossProfit: parseFloat(report.grossProfit) || 0,
        operatingExpenses: parseFloat(report.operatingExpenses) || 0,
        operatingIncome: parseFloat(report.operatingIncome) || 0,
        netIncome: parseFloat(report.netIncome) || 0,
        ebitda: parseFloat(report.ebitda) || 0,
        eps: parseFloat(report.reportedEPS) || 0,
        dilutedEps: parseFloat(report.reportedEPS) || 0,
      }));

      this.setCache(cacheKey, statements, 24 * 60 * 60 * 1000);
      return statements;
    } catch (error) {
      console.error(`[AlphaVantage] Error getting income statements for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get balance sheets
   */
  async getBalanceSheets(symbol: string, annual: boolean = true): Promise<BalanceSheet[]> {
    const cacheKey = `balance:${symbol}:${annual ? 'annual' : 'quarterly'}`;
    const cached = this.getFromCache<BalanceSheet[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest({
        function: 'BALANCE_SHEET',
        symbol: symbol,
      });

      if (!data || data.Note || data['Error Message']) {
        return [];
      }

      const reports = annual ? data.annualReports : data.quarterlyReports;
      const sheets: BalanceSheet[] = (reports || []).map((report: any) => ({
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        totalAssets: parseFloat(report.totalAssets) || 0,
        totalLiabilities: parseFloat(report.totalLiabilities) || 0,
        totalShareholderEquity: parseFloat(report.totalShareholderEquity) || 0,
        cashAndEquivalents: parseFloat(report.cashAndCashEquivalentsAtCarryingValue) || 0,
        totalCurrentAssets: parseFloat(report.totalCurrentAssets) || 0,
        totalCurrentLiabilities: parseFloat(report.totalCurrentLiabilities) || 0,
        longTermDebt: parseFloat(report.longTermDebt) || 0,
        shortTermDebt: parseFloat(report.shortTermDebt) || 0,
        inventory: parseFloat(report.inventory) || 0,
        accountsReceivable: parseFloat(report.currentNetReceivables) || 0,
        accountsPayable: parseFloat(report.currentAccountsPayable) || 0,
      }));

      this.setCache(cacheKey, sheets, 24 * 60 * 60 * 1000);
      return sheets;
    } catch (error) {
      console.error(`[AlphaVantage] Error getting balance sheets for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get cash flow statements
   */
  async getCashFlowStatements(symbol: string, annual: boolean = true): Promise<CashFlowStatement[]> {
    const cacheKey = `cashflow:${symbol}:${annual ? 'annual' : 'quarterly'}`;
    const cached = this.getFromCache<CashFlowStatement[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest({
        function: 'CASH_FLOW',
        symbol: symbol,
      });

      if (!data || data.Note || data['Error Message']) {
        return [];
      }

      const reports = annual ? data.annualReports : data.quarterlyReports;
      const statements: CashFlowStatement[] = (reports || []).map((report: any) => ({
        fiscalDateEnding: report.fiscalDateEnding,
        reportedCurrency: report.reportedCurrency,
        operatingCashFlow: parseFloat(report.operatingCashflow) || 0,
        investingCashFlow: parseFloat(report.cashflowFromInvestment) || 0,
        financingCashFlow: parseFloat(report.cashflowFromFinancing) || 0,
        capitalExpenditures: parseFloat(report.capitalExpenditures) || 0,
        dividendPayout: parseFloat(report.dividendPayout) || 0,
        freeCashFlow: (parseFloat(report.operatingCashflow) || 0) - (parseFloat(report.capitalExpenditures) || 0),
      }));

      this.setCache(cacheKey, statements, 24 * 60 * 60 * 1000);
      return statements;
    } catch (error) {
      console.error(`[AlphaVantage] Error getting cash flow statements for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get earnings data
   */
  async getEarnings(symbol: string): Promise<EarningsData | null> {
    const cacheKey = `earnings:${symbol}`;
    const cached = this.getFromCache<EarningsData>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest({
        function: 'EARNINGS',
        symbol: symbol,
      });

      if (!data || data.Note || data['Error Message']) {
        return null;
      }

      const earnings: EarningsData = {
        symbol: data.symbol,
        annualEarnings: (data.annualEarnings || []).map((e: any) => ({
          fiscalDateEnding: e.fiscalDateEnding,
          reportedEPS: parseFloat(e.reportedEPS) || 0,
        })),
        quarterlyEarnings: (data.quarterlyEarnings || []).map((e: any) => ({
          fiscalDateEnding: e.fiscalDateEnding,
          reportedDate: e.reportedDate,
          reportedEPS: parseFloat(e.reportedEPS) || 0,
          estimatedEPS: parseFloat(e.estimatedEPS) || 0,
          surprise: parseFloat(e.surprise) || 0,
          surprisePercentage: parseFloat(e.surprisePercentage) || 0,
        })),
      };

      this.setCache(cacheKey, earnings, 24 * 60 * 60 * 1000);
      return earnings;
    } catch (error) {
      console.error(`[AlphaVantage] Error getting earnings for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get technical indicator
   */
  async getTechnicalIndicator(
    symbol: string,
    indicator: TechnicalIndicator,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly' = 'daily',
    timePeriod: number = 14
  ): Promise<TechnicalIndicatorData | null> {
    const cacheKey = `tech:${symbol}:${indicator}:${interval}:${timePeriod}`;
    const cached = this.getFromCache<TechnicalIndicatorData>(cacheKey);
    if (cached) return cached;

    try {
      const params: Record<string, string | number> = {
        function: indicator,
        symbol: symbol,
        interval: interval,
        time_period: timePeriod,
        series_type: 'close',
      };

      const data = await this.makeRequest(params);

      if (!data || data.Note || data['Error Message']) {
        return null;
      }

      // Find the data key (it varies by indicator)
      const dataKey = Object.keys(data).find(k => k.startsWith('Technical Analysis'));
      if (!dataKey) return null;

      const technicalData = data[dataKey];
      const result: TechnicalIndicatorData = {
        indicator,
        symbol,
        interval,
        data: Object.entries(technicalData).map(([date, values]: [string, any]) => {
          const mainValue = parseFloat(Object.values(values)[0] as string);
          const additionalValues: Record<string, number> = {};
          
          Object.entries(values).forEach(([key, val]) => {
            if (key !== Object.keys(values)[0]) {
              additionalValues[key] = parseFloat(val as string);
            }
          });

          return {
            date,
            value: mainValue,
            additionalValues: Object.keys(additionalValues).length > 0 ? additionalValues : undefined,
          };
        }),
      };

      // Shorter cache for technical indicators
      this.setCache(cacheKey, result, 15 * 60 * 1000);
      return result;
    } catch (error) {
      console.error(`[AlphaVantage] Error getting ${indicator} for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get RSI (Relative Strength Index)
   */
  async getRSI(symbol: string, interval: string = 'daily', timePeriod: number = 14): Promise<TechnicalIndicatorData | null> {
    return this.getTechnicalIndicator(symbol, 'RSI', interval as any, timePeriod);
  }

  /**
   * Get MACD
   */
  async getMACD(symbol: string, interval: string = 'daily'): Promise<TechnicalIndicatorData | null> {
    return this.getTechnicalIndicator(symbol, 'MACD', interval as any);
  }

  /**
   * Get SMA (Simple Moving Average)
   */
  async getSMA(symbol: string, interval: string = 'daily', timePeriod: number = 50): Promise<TechnicalIndicatorData | null> {
    return this.getTechnicalIndicator(symbol, 'SMA', interval as any, timePeriod);
  }

  /**
   * Get Bollinger Bands
   */
  async getBollingerBands(symbol: string, interval: string = 'daily', timePeriod: number = 20): Promise<TechnicalIndicatorData | null> {
    return this.getTechnicalIndicator(symbol, 'BBANDS', interval as any, timePeriod);
  }

  /**
   * Get remaining API calls for today
   */
  getRemainingCalls(): number {
    this.resetDailyCountIfNeeded();
    return this.dailyRequestLimit - this.dailyRequestCount;
  }

  // Private helper methods

  private async makeRequest(params: Record<string, string | number>): Promise<any> {
    if (!this.apiKey) {
      console.error('[AlphaVantage] No API key configured');
      return null;
    }

    this.resetDailyCountIfNeeded();
    if (this.dailyRequestCount >= this.dailyRequestLimit) {
      console.error('[AlphaVantage] Daily request limit reached');
      return null;
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await axios.get(ALPHA_VANTAGE_BASE, {
            params: {
              ...params,
              apikey: this.apiKey,
            },
            timeout: 15000,
          });
          this.dailyRequestCount++;
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

  private resetDailyCountIfNeeded(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastResetDate !== today) {
      this.dailyRequestCount = 0;
      this.lastResetDate = today;
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
export const alphaVantageService = new AlphaVantageService();
export default alphaVantageService;

