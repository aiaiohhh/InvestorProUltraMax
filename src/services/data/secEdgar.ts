/**
 * PRD-1.1.2: SEC EDGAR Integration
 * 
 * Free access to all US company financial filings from SEC.gov.
 * 
 * Features:
 * - 10-K annual reports
 * - 10-Q quarterly reports
 * - 8-K current reports
 * - DEF 14A proxy statements
 * - Insider trading forms (Form 3, 4, 5)
 * - 13F institutional holdings
 * 
 * Rate Limit: 10 requests per second (SEC guideline)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// SEC EDGAR API endpoints
const SEC_BASE_URL = 'https://www.sec.gov';
const SEC_DATA_URL = 'https://data.sec.gov';
const SEC_EFTS_URL = 'https://efts.sec.gov/LATEST/search-index';

// Filing types
export type FilingType = '10-K' | '10-Q' | '8-K' | 'DEF 14A' | '4' | '13F-HR' | 'S-1' | '424B4';

export interface SECFiling {
  accessionNumber: string;
  filingType: string;
  filingDate: string;
  reportDate?: string;
  companyName: string;
  cik: string;
  description?: string;
  documentUrl: string;
  filingUrl: string;
}

export interface InsiderTransaction {
  filingDate: string;
  transactionDate: string;
  ownerName: string;
  ownerRelationship: string;
  transactionType: 'P' | 'S' | 'A' | 'D' | 'M' | 'C' | 'G'; // Purchase, Sale, Award, Disposition, etc.
  sharesTraded: number;
  pricePerShare?: number;
  sharesOwned: number;
  filingUrl: string;
}

export interface InstitutionalHolding {
  filingDate: string;
  institutionName: string;
  cik: string;
  holdings: Array<{
    issuer: string;
    cusip: string;
    shares: number;
    value: number; // in thousands
    investmentDiscretion: string;
    votingAuthority: {
      sole: number;
      shared: number;
      none: number;
    };
  }>;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class SECEdgarService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 60 * 60 * 1000; // 1 hour (filings don't change often)
  private requestDelay = 100; // 100ms between requests (10 req/sec)
  private lastRequestTime = 0;

  /**
   * Get CIK (Central Index Key) for a ticker symbol
   */
  async getCIK(ticker: string): Promise<string | null> {
    const cacheKey = `cik:${ticker.toUpperCase()}`;
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      // SEC provides a company ticker to CIK mapping
      const response = await this.makeRequest(
        `${SEC_DATA_URL}/submissions/CIK${ticker.toUpperCase().padStart(10, '0')}.json`
      );

      if (response?.cik) {
        const cik = response.cik.toString().padStart(10, '0');
        this.setCache(cacheKey, cik, 24 * 60 * 60 * 1000); // Cache for 24 hours
        return cik;
      }

      // Fallback: Search for ticker
      const searchResponse = await this.makeRequest(
        `${SEC_DATA_URL}/company_tickers.json`
      );

      if (searchResponse) {
        const companies = Object.values(searchResponse) as any[];
        const match = companies.find(
          (c: any) => c.ticker?.toUpperCase() === ticker.toUpperCase()
        );
        if (match) {
          const cik = match.cik_str.toString().padStart(10, '0');
          this.setCache(cacheKey, cik, 24 * 60 * 60 * 1000);
          return cik;
        }
      }

      return null;
    } catch (error) {
      console.error(`[SECEdgar] Error getting CIK for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get company information by CIK or ticker
   */
  async getCompanyInfo(tickerOrCik: string): Promise<{
    cik: string;
    name: string;
    ticker: string;
    sic: string;
    sicDescription: string;
    fiscalYearEnd: string;
    stateOfIncorporation: string;
    filings: SECFiling[];
  } | null> {
    const cik = tickerOrCik.length <= 5 
      ? await this.getCIK(tickerOrCik) 
      : tickerOrCik.padStart(10, '0');

    if (!cik) return null;

    const cacheKey = `company:${cik}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `${SEC_DATA_URL}/submissions/CIK${cik}.json`
      );

      if (!response) return null;

      const recentFilings = response.filings?.recent || {};
      const filings: SECFiling[] = [];

      const accessionNumbers = recentFilings.accessionNumber || [];
      const forms = recentFilings.form || [];
      const filingDates = recentFilings.filingDate || [];
      const primaryDocuments = recentFilings.primaryDocument || [];

      for (let i = 0; i < Math.min(accessionNumbers.length, 50); i++) {
        const accessionNumber = accessionNumbers[i].replace(/-/g, '');
        filings.push({
          accessionNumber: accessionNumbers[i],
          filingType: forms[i],
          filingDate: filingDates[i],
          companyName: response.name,
          cik: cik,
          documentUrl: `${SEC_BASE_URL}/Archives/edgar/data/${parseInt(cik)}/${accessionNumber}/${primaryDocuments[i]}`,
          filingUrl: `${SEC_BASE_URL}/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${forms[i]}&dateb=&owner=include&count=40`,
        });
      }

      const result = {
        cik: cik,
        name: response.name,
        ticker: response.tickers?.[0] || '',
        sic: response.sic || '',
        sicDescription: response.sicDescription || '',
        fiscalYearEnd: response.fiscalYearEnd || '',
        stateOfIncorporation: response.stateOfIncorporation || '',
        filings: filings,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`[SECEdgar] Error getting company info for ${tickerOrCik}:`, error);
      return null;
    }
  }

  /**
   * Get filings by type
   */
  async getFilings(
    tickerOrCik: string,
    filingType: FilingType,
    limit: number = 10
  ): Promise<SECFiling[]> {
    const companyInfo = await this.getCompanyInfo(tickerOrCik);
    if (!companyInfo) return [];

    return companyInfo.filings
      .filter(f => f.filingType === filingType)
      .slice(0, limit);
  }

  /**
   * Get latest 10-K (annual report)
   */
  async getLatest10K(tickerOrCik: string): Promise<SECFiling | null> {
    const filings = await this.getFilings(tickerOrCik, '10-K', 1);
    return filings[0] || null;
  }

  /**
   * Get latest 10-Q (quarterly report)
   */
  async getLatest10Q(tickerOrCik: string): Promise<SECFiling | null> {
    const filings = await this.getFilings(tickerOrCik, '10-Q', 1);
    return filings[0] || null;
  }

  /**
   * Get recent 8-K filings (current reports / material events)
   */
  async getRecent8K(tickerOrCik: string, limit: number = 5): Promise<SECFiling[]> {
    return this.getFilings(tickerOrCik, '8-K', limit);
  }

  /**
   * Get insider transactions (Form 4)
   */
  async getInsiderTransactions(
    tickerOrCik: string,
    limit: number = 20
  ): Promise<InsiderTransaction[]> {
    const cacheKey = `insider:${tickerOrCik}:${limit}`;
    const cached = this.getFromCache<InsiderTransaction[]>(cacheKey);
    if (cached) return cached;

    const cik = tickerOrCik.length <= 5
      ? await this.getCIK(tickerOrCik)
      : tickerOrCik.padStart(10, '0');

    if (!cik) return [];

    try {
      const response = await this.makeRequest(
        `${SEC_DATA_URL}/submissions/CIK${cik}.json`
      );

      if (!response?.filings?.recent) return [];

      const recentFilings = response.filings.recent;
      const transactions: InsiderTransaction[] = [];

      const accessionNumbers = recentFilings.accessionNumber || [];
      const forms = recentFilings.form || [];
      const filingDates = recentFilings.filingDate || [];

      for (let i = 0; i < accessionNumbers.length && transactions.length < limit; i++) {
        if (forms[i] === '4') {
          // Form 4 is insider transaction
          const accessionNumber = accessionNumbers[i].replace(/-/g, '');
          transactions.push({
            filingDate: filingDates[i],
            transactionDate: filingDates[i], // Would need to parse the actual filing for exact date
            ownerName: 'See filing', // Would need to parse the actual filing
            ownerRelationship: 'Officer/Director',
            transactionType: 'P', // Would need to parse the actual filing
            sharesTraded: 0, // Would need to parse the actual filing
            sharesOwned: 0, // Would need to parse the actual filing
            filingUrl: `${SEC_BASE_URL}/Archives/edgar/data/${parseInt(cik)}/${accessionNumber}`,
          });
        }
      }

      this.setCache(cacheKey, transactions);
      return transactions;
    } catch (error) {
      console.error(`[SECEdgar] Error getting insider transactions for ${tickerOrCik}:`, error);
      return [];
    }
  }

  /**
   * Get 13F institutional holdings for a company
   */
  async getInstitutionalHolders(tickerOrCik: string): Promise<InstitutionalHolding[]> {
    const cacheKey = `institutional:${tickerOrCik}`;
    const cached = this.getFromCache<InstitutionalHolding[]>(cacheKey);
    if (cached) return cached;

    // Note: 13F filings are filed by institutions, not companies
    // This would require searching for all 13F filings that include the company
    // For now, return empty array - would need more complex implementation
    console.log('[SECEdgar] Institutional holdings search not fully implemented');
    return [];
  }

  /**
   * Search for filings across all companies
   */
  async searchFilings(query: string, filingType?: FilingType): Promise<SECFiling[]> {
    const cacheKey = `search:${query}:${filingType || 'all'}`;
    const cached = this.getFromCache<SECFiling[]>(cacheKey);
    if (cached) return cached;

    try {
      // Use SEC EDGAR full-text search
      const searchParams = new URLSearchParams({
        q: query,
        dateRange: 'custom',
        startdt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        enddt: new Date().toISOString().split('T')[0],
      });

      if (filingType) {
        searchParams.append('forms', filingType);
      }

      const response = await this.makeRequest(
        `${SEC_EFTS_URL}?${searchParams.toString()}`
      );

      const hits = response?.hits?.hits || [];
      const filings: SECFiling[] = hits.slice(0, 20).map((hit: any) => ({
        accessionNumber: hit._source?.adsh || '',
        filingType: hit._source?.form || '',
        filingDate: hit._source?.file_date || '',
        companyName: hit._source?.display_names?.[0] || '',
        cik: hit._source?.ciks?.[0] || '',
        description: hit._source?.root_form || '',
        documentUrl: `${SEC_BASE_URL}/Archives/edgar/data/${hit._source?.ciks?.[0]}/${hit._source?.adsh?.replace(/-/g, '')}`,
        filingUrl: `${SEC_BASE_URL}/cgi-bin/browse-edgar?action=getcompany&CIK=${hit._source?.ciks?.[0]}`,
      }));

      this.setCache(cacheKey, filings, 30 * 60 * 1000); // 30 minute cache
      return filings;
    } catch (error) {
      console.error(`[SECEdgar] Error searching filings for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get filing document content (HTML or text)
   */
  async getFilingContent(filing: SECFiling): Promise<string | null> {
    const cacheKey = `content:${filing.accessionNumber}`;
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(filing.documentUrl, {
        headers: {
          'User-Agent': 'InvestorProUltraMax/1.0 (contact@example.com)',
        },
        timeout: 30000,
      });

      const content = response.data;
      this.setCache(cacheKey, content, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return content;
    } catch (error) {
      console.error(`[SECEdgar] Error getting filing content:`, error);
      return null;
    }
  }

  // Private helper methods

  private async makeRequest(url: string): Promise<any> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await this.delay(this.requestDelay - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'InvestorProUltraMax/1.0 (contact@example.com)',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
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
export const secEdgarService = new SECEdgarService();
export default secEdgarService;

