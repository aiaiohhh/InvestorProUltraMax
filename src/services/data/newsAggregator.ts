/**
 * PRD-1.1.6: Free News Sources Integration
 * 
 * Aggregates news from multiple free sources for financial news.
 * 
 * Sources:
 * - NewsAPI (100 requests/day free tier)
 * - Finnhub News (60 calls/minute)
 * - Reddit API (via PRAW-style access)
 * - RSS Feeds (Seeking Alpha, Yahoo Finance)
 * 
 * Features:
 * - Multi-source news collection
 * - Company-specific news filtering
 * - Sentiment analysis (basic)
 * - Duplicate detection
 * - Source attribution
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsItem } from '@/types';

// API endpoints
const NEWSAPI_BASE = 'https://newsapi.org/v2';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const REDDIT_BASE = 'https://www.reddit.com';

// RSS Feed URLs
const RSS_FEEDS = {
  seekingAlpha: 'https://seekingalpha.com/feed.xml',
  yahooFinance: 'https://finance.yahoo.com/rss/',
  marketWatch: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
  cnbc: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  bloomberg: 'https://feeds.bloomberg.com/markets/news.rss',
};

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  url: string;
  permalink: string;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class NewsAggregatorService {
  private newsApiKey: string;
  private finnhubApiKey: string;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private requestDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;
  private newsApiDailyCount = 0;
  private newsApiDailyLimit = 100;
  private lastResetDate: string = '';

  constructor(newsApiKey?: string, finnhubApiKey?: string) {
    this.newsApiKey = newsApiKey || process.env.NEXT_PUBLIC_NEWSAPI_KEY || '';
    this.finnhubApiKey = finnhubApiKey || process.env.NEXT_PUBLIC_FINNHUB_KEY || '';
    this.resetDailyCountIfNeeded();
  }

  /**
   * Get aggregated news from all sources
   */
  async getAggregatedNews(
    options: {
      query?: string;
      symbols?: string[];
      category?: 'business' | 'technology' | 'general';
      limit?: number;
    } = {}
  ): Promise<NewsItem[]> {
    const { query, symbols, category = 'business', limit = 20 } = options;

    const cacheKey = `aggregated:${query || 'all'}:${symbols?.join(',') || 'all'}:${category}:${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch from multiple sources in parallel
      const [newsApiNews, finnhubNews, redditPosts] = await Promise.all([
        this.getNewsApiNews(query || category, limit),
        symbols && symbols.length > 0 
          ? this.getFinnhubNews(symbols[0], limit) 
          : Promise.resolve([]),
        this.getRedditPosts(['wallstreetbets', 'stocks', 'investing'], limit),
      ]);

      // Combine and deduplicate
      const allNews = [
        ...newsApiNews,
        ...finnhubNews,
        ...this.redditToNewsItems(redditPosts),
      ];

      // Remove duplicates based on title similarity
      const uniqueNews = this.deduplicateNews(allNews);

      // Sort by date
      const sortedNews = uniqueNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);

      this.setCache(cacheKey, sortedNews);
      return sortedNews;
    } catch (error) {
      console.error('[NewsAggregator] Error aggregating news:', error);
      return [];
    }
  }

  /**
   * Get news from NewsAPI
   */
  async getNewsApiNews(query: string, limit: number = 10): Promise<NewsItem[]> {
    if (!this.newsApiKey) {
      console.warn('[NewsAggregator] NewsAPI key not configured');
      return [];
    }

    this.resetDailyCountIfNeeded();
    if (this.newsApiDailyCount >= this.newsApiDailyLimit) {
      console.warn('[NewsAggregator] NewsAPI daily limit reached');
      return [];
    }

    const cacheKey = `newsapi:${query}:${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      await this.rateLimit();
      const response = await axios.get(`${NEWSAPI_BASE}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit,
          apiKey: this.newsApiKey,
        },
        timeout: 10000,
      });

      this.newsApiDailyCount++;

      const articles = response.data?.articles || [];
      const news: NewsItem[] = articles.map((article: any, index: number) => ({
        id: `newsapi-${Date.now()}-${index}`,
        title: article.title,
        summary: article.description || article.content?.substring(0, 200) || '',
        source: article.source?.name || 'NewsAPI',
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment: this.analyzeSentiment(article.title + ' ' + (article.description || '')),
        imageUrl: article.urlToImage,
      }));

      this.setCache(cacheKey, news);
      return news;
    } catch (error) {
      console.error('[NewsAggregator] NewsAPI error:', error);
      return [];
    }
  }

  /**
   * Get news from Finnhub
   */
  async getFinnhubNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    if (!this.finnhubApiKey) {
      console.warn('[NewsAggregator] Finnhub API key not configured');
      return [];
    }

    const cacheKey = `finnhub:${symbol}:${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      await this.rateLimit();
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const response = await axios.get(`${FINNHUB_BASE}/company-news`, {
        params: {
          symbol: symbol,
          from: weekAgo.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
          token: this.finnhubApiKey,
        },
        timeout: 10000,
      });

      const articles = (response.data || []).slice(0, limit);
      const news: NewsItem[] = articles.map((article: any, index: number) => ({
        id: `finnhub-${article.id || Date.now()}-${index}`,
        title: article.headline,
        summary: article.summary || '',
        source: article.source || 'Finnhub',
        url: article.url,
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        sentiment: this.analyzeSentiment(article.headline + ' ' + (article.summary || '')),
        relatedAssets: [symbol],
        imageUrl: article.image,
      }));

      this.setCache(cacheKey, news);
      return news;
    } catch (error) {
      console.error('[NewsAggregator] Finnhub error:', error);
      return [];
    }
  }

  /**
   * Get posts from Reddit financial subreddits
   */
  async getRedditPosts(
    subreddits: string[] = ['wallstreetbets', 'stocks', 'investing'],
    limit: number = 10
  ): Promise<RedditPost[]> {
    const cacheKey = `reddit:${subreddits.join(',')}:${limit}`;
    const cached = this.getFromCache<RedditPost[]>(cacheKey);
    if (cached) return cached;

    try {
      const allPosts: RedditPost[] = [];

      for (const subreddit of subreddits) {
        await this.rateLimit();
        const response = await axios.get(
          `${REDDIT_BASE}/r/${subreddit}/hot.json`,
          {
            params: { limit: Math.ceil(limit / subreddits.length) },
            headers: {
              'User-Agent': 'InvestorProUltraMax/1.0',
            },
            timeout: 10000,
          }
        );

        const posts = response.data?.data?.children || [];
        for (const post of posts) {
          const data = post.data;
          if (!data.stickied && !data.is_self === false) {
            allPosts.push({
              id: data.id,
              title: data.title,
              selftext: data.selftext || '',
              author: data.author,
              subreddit: data.subreddit,
              score: data.score,
              upvote_ratio: data.upvote_ratio,
              num_comments: data.num_comments,
              created_utc: data.created_utc,
              url: data.url,
              permalink: `https://reddit.com${data.permalink}`,
            });
          }
        }
      }

      // Sort by score
      const sortedPosts = allPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      this.setCache(cacheKey, sortedPosts, 2 * 60 * 1000); // 2 minute cache
      return sortedPosts;
    } catch (error) {
      console.error('[NewsAggregator] Reddit error:', error);
      return [];
    }
  }

  /**
   * Parse RSS feed
   */
  async parseRSSFeed(feedUrl: string, limit: number = 10): Promise<NewsItem[]> {
    const cacheKey = `rss:${feedUrl}:${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      await this.rateLimit();
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'InvestorProUltraMax/1.0',
        },
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: NewsItem[] = [];

      $('item').slice(0, limit).each((index, element) => {
        const $item = $(element);
        items.push({
          id: `rss-${Date.now()}-${index}`,
          title: $item.find('title').text(),
          summary: $item.find('description').text().replace(/<[^>]*>/g, '').substring(0, 300),
          source: $('channel > title').first().text() || 'RSS Feed',
          url: $item.find('link').text(),
          publishedAt: new Date($item.find('pubDate').text()).toISOString(),
          sentiment: this.analyzeSentiment($item.find('title').text()),
        });
      });

      this.setCache(cacheKey, items, 10 * 60 * 1000); // 10 minute cache
      return items;
    } catch (error) {
      console.error(`[NewsAggregator] RSS error for ${feedUrl}:`, error);
      return [];
    }
  }

  /**
   * Get news for specific company/symbol
   */
  async getCompanyNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    const cacheKey = `company:${symbol}:${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const [finnhubNews, newsApiNews] = await Promise.all([
        this.getFinnhubNews(symbol, limit),
        this.getNewsApiNews(symbol, limit),
      ]);

      const allNews = [...finnhubNews, ...newsApiNews];
      const uniqueNews = this.deduplicateNews(allNews)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);

      // Tag with related asset
      uniqueNews.forEach(news => {
        if (!news.relatedAssets) news.relatedAssets = [];
        if (!news.relatedAssets.includes(symbol)) {
          news.relatedAssets.push(symbol);
        }
      });

      this.setCache(cacheKey, uniqueNews);
      return uniqueNews;
    } catch (error) {
      console.error(`[NewsAggregator] Error getting company news for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get market-wide news
   */
  async getMarketNews(limit: number = 20): Promise<NewsItem[]> {
    return this.getAggregatedNews({
      category: 'business',
      limit,
    });
  }

  /**
   * Get crypto-specific news
   */
  async getCryptoNews(limit: number = 10): Promise<NewsItem[]> {
    const cacheKey = `crypto:${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const [newsApiNews, redditPosts] = await Promise.all([
        this.getNewsApiNews('cryptocurrency OR bitcoin OR ethereum', limit),
        this.getRedditPosts(['cryptocurrency', 'bitcoin', 'ethereum'], limit),
      ]);

      const allNews = [
        ...newsApiNews,
        ...this.redditToNewsItems(redditPosts),
      ];

      const uniqueNews = this.deduplicateNews(allNews)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);

      this.setCache(cacheKey, uniqueNews);
      return uniqueNews;
    } catch (error) {
      console.error('[NewsAggregator] Error getting crypto news:', error);
      return [];
    }
  }

  // Helper methods

  private redditToNewsItems(posts: RedditPost[]): NewsItem[] {
    return posts.map(post => ({
      id: `reddit-${post.id}`,
      title: post.title,
      summary: post.selftext.substring(0, 300) || `Score: ${post.score} | Comments: ${post.num_comments}`,
      source: `r/${post.subreddit}`,
      url: post.permalink,
      publishedAt: new Date(post.created_utc * 1000).toISOString(),
      sentiment: this.analyzeSentiment(post.title + ' ' + post.selftext),
    }));
  }

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

  private deduplicateNews(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return news.filter(item => {
      // Create a normalized key from the title
      const key = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 50);
      
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await this.delay(this.requestDelay - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private resetDailyCountIfNeeded(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastResetDate !== today) {
      this.newsApiDailyCount = 0;
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
   * Get remaining NewsAPI calls
   */
  getRemainingNewsApiCalls(): number {
    this.resetDailyCountIfNeeded();
    return this.newsApiDailyLimit - this.newsApiDailyCount;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const newsAggregatorService = new NewsAggregatorService();
export default newsAggregatorService;

