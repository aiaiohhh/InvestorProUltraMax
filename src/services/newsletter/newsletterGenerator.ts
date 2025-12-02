/**
 * PRD-2.1.6: Newsletter Generation & Assembly Pipeline
 * 
 * Automated pipeline that assembles personalized newsletters from
 * aggregated and verified content.
 * 
 * Features:
 * - Content selection and ranking
 * - Section ordering
 * - Personalization application
 * - Template population
 * - Quality assurance
 */

import { contentAggregatorService, AggregatedContent } from './contentAggregator';

// User preferences for personalization
export interface UserPreferences {
  userId: string;
  email: string;
  name: string;
  
  // Content preferences
  assetClasses: ('stocks' | 'crypto' | 'commodities' | 'forex')[];
  investmentStyle: 'value' | 'growth' | 'dividend' | 'trading' | 'mixed';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  
  // Section preferences
  enabledSections: {
    marketSummary: boolean;
    topMovers: boolean;
    breakingNews: boolean;
    socialIntelligence: boolean;
    economicUpdate: boolean;
    earningsCalendar: boolean;
    cryptoUpdate: boolean;
    portfolioInsights: boolean;
    educationalContent: boolean;
  };
  
  // Delivery preferences
  format: 'full' | 'summary' | 'extended';
  deliveryTime: string; // HH:MM format
  timezone: string;
  
  // Portfolio data (for personalization)
  holdings?: string[];
  watchlist?: string[];
}

// Newsletter section
export interface NewsletterSection {
  id: string;
  title: string;
  content: string;
  html: string;
  priority: number;
  type: 'market' | 'news' | 'social' | 'economic' | 'earnings' | 'crypto' | 'portfolio' | 'education';
}

// Generated newsletter
export interface GeneratedNewsletter {
  id: string;
  userId: string;
  subject: string;
  preheader: string;
  sections: NewsletterSection[];
  html: string;
  plainText: string;
  generatedAt: string;
  contentVersion: string;
  personalizationApplied: boolean;
}

/**
 * Newsletter Generator Service
 * 
 * Generates personalized newsletters from aggregated content.
 */
export class NewsletterGeneratorService {
  private readonly defaultSubject = '📈 Your Daily Market Digest';

  /**
   * Generate newsletter for a user
   */
  async generateNewsletter(
    preferences: UserPreferences,
    content?: AggregatedContent
  ): Promise<GeneratedNewsletter> {
    // Get aggregated content if not provided
    const aggregatedContent = content || await contentAggregatorService.aggregateAllContent();

    // Generate sections based on preferences
    const sections = await this.generateSections(preferences, aggregatedContent);

    // Generate subject line
    const subject = this.generateSubject(aggregatedContent);

    // Generate preheader
    const preheader = this.generatePreheader(aggregatedContent);

    // Assemble HTML
    const html = this.assembleHTML(sections, preferences, subject);

    // Generate plain text version
    const plainText = this.generatePlainText(sections);

    return {
      id: `newsletter-${Date.now()}-${preferences.userId}`,
      userId: preferences.userId,
      subject,
      preheader,
      sections,
      html,
      plainText,
      generatedAt: new Date().toISOString(),
      contentVersion: aggregatedContent.version,
      personalizationApplied: true,
    };
  }

  /**
   * Generate newsletter sections
   */
  private async generateSections(
    preferences: UserPreferences,
    content: AggregatedContent
  ): Promise<NewsletterSection[]> {
    const sections: NewsletterSection[] = [];
    let priority = 0;

    // Market Summary
    if (preferences.enabledSections.marketSummary) {
      sections.push(this.generateMarketSummarySection(content, ++priority));
    }

    // Top Movers
    if (preferences.enabledSections.topMovers) {
      sections.push(this.generateTopMoversSection(content, ++priority));
    }

    // Breaking News
    if (preferences.enabledSections.breakingNews) {
      sections.push(this.generateNewsSection(content, ++priority));
    }

    // Social Intelligence
    if (preferences.enabledSections.socialIntelligence) {
      sections.push(this.generateSocialSection(content, ++priority));
    }

    // Economic Update
    if (preferences.enabledSections.economicUpdate) {
      sections.push(this.generateEconomicSection(content, ++priority));
    }

    // Earnings Calendar
    if (preferences.enabledSections.earningsCalendar) {
      sections.push(this.generateEarningsSection(content, ++priority));
    }

    // Crypto Update (if user has crypto in preferences)
    if (preferences.enabledSections.cryptoUpdate && preferences.assetClasses.includes('crypto')) {
      sections.push(this.generateCryptoSection(content, ++priority));
    }

    // Portfolio Insights (if user has holdings)
    if (preferences.enabledSections.portfolioInsights && preferences.holdings?.length) {
      sections.push(await this.generatePortfolioSection(preferences, ++priority));
    }

    // Educational Content
    if (preferences.enabledSections.educationalContent) {
      sections.push(this.generateEducationalSection(++priority));
    }

    return sections;
  }

  /**
   * Generate Market Summary section
   */
  private generateMarketSummarySection(content: AggregatedContent, priority: number): NewsletterSection {
    const { marketSummary } = content;
    
    const indicesHtml = marketSummary.indices.map(index => {
      const changeClass = index.change >= 0 ? 'positive' : 'negative';
      const changeSymbol = index.change >= 0 ? '▲' : '▼';
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${index.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${index.value.toLocaleString()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: ${changeClass === 'positive' ? '#10B981' : '#EF4444'};">
            ${changeSymbol} ${Math.abs(index.changePercent).toFixed(2)}%
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">📊 Market Summary</h2>
        <p style="color: #6B7280; margin-bottom: 12px;">Market Status: <strong>${marketSummary.marketStatus.toUpperCase()}</strong></p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 8px; text-align: left;">Index</th>
              <th style="padding: 8px; text-align: right;">Value</th>
              <th style="padding: 8px; text-align: right;">Change</th>
            </tr>
          </thead>
          <tbody>
            ${indicesHtml}
          </tbody>
        </table>
      </div>
    `;

    return {
      id: 'market-summary',
      title: 'Market Summary',
      content: marketSummary.indices.map(i => `${i.name}: ${i.value} (${i.change >= 0 ? '+' : ''}${i.changePercent.toFixed(2)}%)`).join('\n'),
      html,
      priority,
      type: 'market',
    };
  }

  /**
   * Generate Top Movers section
   */
  private generateTopMoversSection(content: AggregatedContent, priority: number): NewsletterSection {
    const { topMovers } = content;

    const generateMoversList = (movers: typeof topMovers.gainers, title: string, emoji: string) => {
      if (movers.length === 0) return '';
      
      const items = movers.slice(0, 5).map(m => `
        <tr>
          <td style="padding: 6px 8px;"><strong>${m.symbol}</strong></td>
          <td style="padding: 6px 8px;">${m.name.substring(0, 20)}${m.name.length > 20 ? '...' : ''}</td>
          <td style="padding: 6px 8px; text-align: right;">$${m.price.toFixed(2)}</td>
          <td style="padding: 6px 8px; text-align: right; color: ${m.change >= 0 ? '#10B981' : '#EF4444'};">
            ${m.change >= 0 ? '+' : ''}${m.changePercent.toFixed(2)}%
          </td>
        </tr>
      `).join('');

      return `
        <div style="margin-bottom: 16px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 8px;">${emoji} ${title}</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${items}
          </table>
        </div>
      `;
    };

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">🔥 Top Movers</h2>
        ${generateMoversList(topMovers.gainers, 'Top Gainers', '📈')}
        ${generateMoversList(topMovers.losers, 'Top Losers', '📉')}
        ${generateMoversList(topMovers.mostActive, 'Most Active', '⚡')}
      </div>
    `;

    return {
      id: 'top-movers',
      title: 'Top Movers',
      content: [
        'Top Gainers:',
        ...topMovers.gainers.slice(0, 5).map(m => `  ${m.symbol}: ${m.changePercent.toFixed(2)}%`),
        'Top Losers:',
        ...topMovers.losers.slice(0, 5).map(m => `  ${m.symbol}: ${m.changePercent.toFixed(2)}%`),
      ].join('\n'),
      html,
      priority,
      type: 'market',
    };
  }

  /**
   * Generate News section
   */
  private generateNewsSection(content: AggregatedContent, priority: number): NewsletterSection {
    const { newsDigest } = content;
    const allNews = [...newsDigest.breakingNews, ...newsDigest.marketNews.slice(0, 5)];

    const newsItems = allNews.slice(0, 8).map(news => {
      const sentimentEmoji = news.sentiment === 'positive' ? '🟢' : news.sentiment === 'negative' ? '🔴' : '⚪';
      return `
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #E5E7EB;">
          <a href="${news.url}" style="color: #1F2937; text-decoration: none; font-weight: 600; font-size: 15px;">
            ${sentimentEmoji} ${news.title}
          </a>
          <p style="color: #6B7280; font-size: 13px; margin: 8px 0 0 0;">
            ${news.summary.substring(0, 150)}${news.summary.length > 150 ? '...' : ''}
          </p>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 4px;">
            ${news.source} • ${new Date(news.publishedAt).toLocaleDateString()}
          </p>
        </div>
      `;
    }).join('');

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">📰 Breaking News & Updates</h2>
        ${newsItems}
      </div>
    `;

    return {
      id: 'news',
      title: 'Breaking News & Updates',
      content: allNews.slice(0, 8).map(n => `• ${n.title}`).join('\n'),
      html,
      priority,
      type: 'news',
    };
  }

  /**
   * Generate Social Intelligence section
   */
  private generateSocialSection(content: AggregatedContent, priority: number): NewsletterSection {
    const { socialIntelligence } = content;

    const sentimentBar = `
      <div style="display: flex; height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 16px;">
        <div style="width: ${socialIntelligence.sentimentOverview.bullish}%; background-color: #10B981;"></div>
        <div style="width: ${socialIntelligence.sentimentOverview.neutral}%; background-color: #9CA3AF;"></div>
        <div style="width: ${socialIntelligence.sentimentOverview.bearish}%; background-color: #EF4444;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6B7280; margin-bottom: 16px;">
        <span>🐂 Bullish ${socialIntelligence.sentimentOverview.bullish}%</span>
        <span>😐 Neutral ${socialIntelligence.sentimentOverview.neutral}%</span>
        <span>🐻 Bearish ${socialIntelligence.sentimentOverview.bearish}%</span>
      </div>
    `;

    const trendingTopics = socialIntelligence.trendingTopics.length > 0
      ? `<p style="color: #6B7280; font-size: 14px;">Trending: ${socialIntelligence.trendingTopics.slice(0, 5).join(', ')}</p>`
      : '';

    const topPosts = socialIntelligence.redditHot.slice(0, 5).map(post => `
      <div style="margin-bottom: 12px; padding: 12px; background-color: #F9FAFB; border-radius: 8px;">
        <a href="${post.url}" style="color: #1F2937; text-decoration: none; font-size: 14px;">
          ${post.title.substring(0, 80)}${post.title.length > 80 ? '...' : ''}
        </a>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 4px;">
          r/${post.subreddit} • ⬆️ ${post.score} • 💬 ${post.comments}
        </p>
      </div>
    `).join('');

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">🌐 Social Media Intelligence</h2>
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 8px;">Market Sentiment</h3>
        ${sentimentBar}
        ${trendingTopics}
        <h3 style="color: #374151; font-size: 16px; margin: 16px 0 8px 0;">Hot on Reddit</h3>
        ${topPosts}
      </div>
    `;

    return {
      id: 'social',
      title: 'Social Media Intelligence',
      content: [
        `Sentiment: Bullish ${socialIntelligence.sentimentOverview.bullish}% | Neutral ${socialIntelligence.sentimentOverview.neutral}% | Bearish ${socialIntelligence.sentimentOverview.bearish}%`,
        `Trending: ${socialIntelligence.trendingTopics.slice(0, 5).join(', ')}`,
      ].join('\n'),
      html,
      priority,
      type: 'social',
    };
  }

  /**
   * Generate Economic Update section
   */
  private generateEconomicSection(content: AggregatedContent, priority: number): NewsletterSection {
    const { economicUpdate } = content;

    const indicatorRows = economicUpdate.indicators.slice(0, 6).map(ind => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${ind.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ${ind.value !== null ? ind.value.toFixed(2) : 'N/A'}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: ${(ind.change || 0) >= 0 ? '#10B981' : '#EF4444'};">
          ${ind.change !== null ? (ind.change >= 0 ? '+' : '') + ind.change.toFixed(2) : '-'}
        </td>
      </tr>
    `).join('');

    const yieldCurveStatus = economicUpdate.yieldCurve.isInverted
      ? '⚠️ <span style="color: #EF4444;">Inverted</span>'
      : '✅ <span style="color: #10B981;">Normal</span>';

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">📈 Economic Update</h2>
        
        <div style="margin-bottom: 16px; padding: 12px; background-color: #F0FDF4; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Yield Curve:</strong> ${yieldCurveStatus}
            ${economicUpdate.yieldCurve.spread !== null ? ` (Spread: ${economicUpdate.yieldCurve.spread.toFixed(2)}%)` : ''}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B7280;">
            ${economicUpdate.yieldCurve.interpretation}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 8px; text-align: left;">Indicator</th>
              <th style="padding: 8px; text-align: right;">Value</th>
              <th style="padding: 8px; text-align: right;">Change</th>
            </tr>
          </thead>
          <tbody>
            ${indicatorRows}
          </tbody>
        </table>
      </div>
    `;

    return {
      id: 'economic',
      title: 'Economic Update',
      content: economicUpdate.indicators.map(i => `${i.name}: ${i.value}`).join('\n'),
      html,
      priority,
      type: 'economic',
    };
  }

  /**
   * Generate Earnings section
   */
  private generateEarningsSection(content: AggregatedContent, priority: number): NewsletterSection {
    const { earningsUpdate } = content;

    const upcomingRows = earningsUpdate.upcoming.slice(0, 5).map(e => `
      <tr>
        <td style="padding: 6px 8px;"><strong>${e.symbol}</strong></td>
        <td style="padding: 6px 8px;">${e.date}</td>
        <td style="padding: 6px 8px; text-align: right;">$${e.epsEstimate.toFixed(2)}</td>
      </tr>
    `).join('');

    const recentRows = earningsUpdate.recent.slice(0, 5).map(e => {
      const beatMiss = e.epsSurprise >= 0 ? '✅ Beat' : '❌ Miss';
      return `
        <tr>
          <td style="padding: 6px 8px;"><strong>${e.symbol}</strong></td>
          <td style="padding: 6px 8px;">${e.date}</td>
          <td style="padding: 6px 8px; text-align: right;">$${e.epsActual?.toFixed(2) || 'N/A'}</td>
          <td style="padding: 6px 8px; text-align: right; color: ${e.epsSurprise >= 0 ? '#10B981' : '#EF4444'};">
            ${beatMiss}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">📅 Earnings Calendar</h2>
        
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 8px;">Upcoming Earnings</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 6px 8px; text-align: left;">Symbol</th>
              <th style="padding: 6px 8px; text-align: left;">Date</th>
              <th style="padding: 6px 8px; text-align: right;">EPS Est.</th>
            </tr>
          </thead>
          <tbody>${upcomingRows}</tbody>
        </table>

        <h3 style="color: #374151; font-size: 16px; margin-bottom: 8px;">Recent Results</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 6px 8px; text-align: left;">Symbol</th>
              <th style="padding: 6px 8px; text-align: left;">Date</th>
              <th style="padding: 6px 8px; text-align: right;">EPS</th>
              <th style="padding: 6px 8px; text-align: right;">Result</th>
            </tr>
          </thead>
          <tbody>${recentRows}</tbody>
        </table>
      </div>
    `;

    return {
      id: 'earnings',
      title: 'Earnings Calendar',
      content: [
        'Upcoming:',
        ...earningsUpdate.upcoming.slice(0, 5).map(e => `  ${e.symbol} - ${e.date}`),
      ].join('\n'),
      html,
      priority,
      type: 'earnings',
    };
  }

  /**
   * Generate Crypto section
   */
  private generateCryptoSection(content: AggregatedContent, priority: number): NewsletterSection {
    const { cryptoUpdate } = content;

    const coinRows = cryptoUpdate.topCoins.slice(0, 8).map(coin => `
      <tr>
        <td style="padding: 6px 8px;"><strong>${coin.symbol}</strong></td>
        <td style="padding: 6px 8px;">${coin.name}</td>
        <td style="padding: 6px 8px; text-align: right;">$${coin.price.toLocaleString()}</td>
        <td style="padding: 6px 8px; text-align: right; color: ${coin.change24h >= 0 ? '#10B981' : '#EF4444'};">
          ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">🪙 Crypto Market Update</h2>
        
        <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 150px; padding: 12px; background-color: #F3F4F6; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #6B7280;">Total Market Cap</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600;">$${(cryptoUpdate.marketOverview.totalMarketCap / 1e12).toFixed(2)}T</p>
          </div>
          <div style="flex: 1; min-width: 150px; padding: 12px; background-color: #F3F4F6; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #6B7280;">BTC Dominance</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600;">${cryptoUpdate.marketOverview.btcDominance.toFixed(1)}%</p>
          </div>
          <div style="flex: 1; min-width: 150px; padding: 12px; background-color: #F3F4F6; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #6B7280;">24h Change</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: ${cryptoUpdate.marketOverview.marketCapChange24h >= 0 ? '#10B981' : '#EF4444'};">
              ${cryptoUpdate.marketOverview.marketCapChange24h >= 0 ? '+' : ''}${cryptoUpdate.marketOverview.marketCapChange24h.toFixed(2)}%
            </p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 6px 8px; text-align: left;">Symbol</th>
              <th style="padding: 6px 8px; text-align: left;">Name</th>
              <th style="padding: 6px 8px; text-align: right;">Price</th>
              <th style="padding: 6px 8px; text-align: right;">24h</th>
            </tr>
          </thead>
          <tbody>${coinRows}</tbody>
        </table>
      </div>
    `;

    return {
      id: 'crypto',
      title: 'Crypto Market Update',
      content: cryptoUpdate.topCoins.map(c => `${c.symbol}: $${c.price.toLocaleString()} (${c.change24h.toFixed(2)}%)`).join('\n'),
      html,
      priority,
      type: 'crypto',
    };
  }

  /**
   * Generate Portfolio Insights section
   */
  private async generatePortfolioSection(preferences: UserPreferences, priority: number): Promise<NewsletterSection> {
    // This would integrate with the user's actual portfolio data
    const html = `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin-bottom: 16px; font-size: 20px;">💼 Your Portfolio Insights</h2>
        <p style="color: #6B7280;">
          Portfolio insights are personalized based on your holdings.
          Check the app for detailed portfolio analysis.
        </p>
      </div>
    `;

    return {
      id: 'portfolio',
      title: 'Portfolio Insights',
      content: 'Check the app for personalized portfolio insights.',
      html,
      priority,
      type: 'portfolio',
    };
  }

  /**
   * Generate Educational Content section
   */
  private generateEducationalSection(priority: number): NewsletterSection {
    const tips = [
      { title: 'Dollar-Cost Averaging', content: 'Investing a fixed amount regularly can help reduce the impact of volatility on your overall purchase.' },
      { title: 'Diversification', content: 'Spreading investments across different asset classes can help manage risk in your portfolio.' },
      { title: 'Compound Interest', content: 'Reinvesting your returns can lead to exponential growth over time through the power of compounding.' },
      { title: 'Risk Management', content: 'Never invest more than you can afford to lose, and always have an emergency fund before investing.' },
      { title: 'Long-term Perspective', content: 'Historical data shows that patient investors who hold through market cycles tend to achieve better returns.' },
    ];

    const tip = tips[Math.floor(Math.random() * tips.length)];

    const html = `
      <div style="margin-bottom: 24px; padding: 20px; background-color: #EFF6FF; border-radius: 8px; border-left: 4px solid #3B82F6;">
        <h2 style="color: #1E40AF; margin: 0 0 12px 0; font-size: 18px;">💡 Investor Tip: ${tip.title}</h2>
        <p style="color: #1E3A8A; margin: 0; font-size: 14px;">${tip.content}</p>
      </div>
    `;

    return {
      id: 'education',
      title: 'Educational Content',
      content: `${tip.title}: ${tip.content}`,
      html,
      priority,
      type: 'education',
    };
  }

  /**
   * Generate dynamic subject line
   */
  private generateSubject(content: AggregatedContent): string {
    const { marketSummary, topMovers } = content;
    
    // Get the most significant market move
    const spIndex = marketSummary.indices.find(i => i.name === 'S&P 500');
    if (spIndex) {
      const direction = spIndex.change >= 0 ? '📈' : '📉';
      return `${direction} S&P ${spIndex.change >= 0 ? '+' : ''}${spIndex.changePercent.toFixed(1)}% | Your Daily Market Digest`;
    }

    // Fallback to top gainer
    if (topMovers.gainers.length > 0) {
      const topGainer = topMovers.gainers[0];
      return `🚀 ${topGainer.symbol} +${topGainer.changePercent.toFixed(1)}% | Your Daily Market Digest`;
    }

    return this.defaultSubject;
  }

  /**
   * Generate preheader text
   */
  private generatePreheader(content: AggregatedContent): string {
    const { marketSummary, newsDigest } = content;
    
    const parts: string[] = [];
    
    // Add market status
    parts.push(`Market ${marketSummary.marketStatus}`);
    
    // Add top news headline if available
    if (newsDigest.breakingNews.length > 0) {
      parts.push(newsDigest.breakingNews[0].title.substring(0, 50));
    }

    return parts.join(' • ');
  }

  /**
   * Assemble full HTML newsletter
   */
  private assembleHTML(sections: NewsletterSection[], preferences: UserPreferences, subject: string): string {
    const sectionsHtml = sections
      .sort((a, b) => a.priority - b.priority)
      .map(s => s.html)
      .join('<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1F2937; }
    a { color: #3B82F6; }
    .positive { color: #10B981; }
    .negative { color: #EF4444; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">📈 InvestorProUltraMax</h1>
      <p style="color: #BFDBFE; margin: 8px 0 0 0; font-size: 14px;">Your Daily Market Intelligence</p>
    </div>

    <!-- Greeting -->
    <div style="padding: 24px;">
      <p style="color: #6B7280; margin: 0;">
        Good ${this.getTimeOfDay()}, <strong>${preferences.name}</strong>!
      </p>
      <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 14px;">
        Here's your personalized market digest for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 0 24px 24px;">
      ${sectionsHtml}
    </div>

    <!-- Footer -->
    <div style="background-color: #F3F4F6; padding: 24px; text-align: center;">
      <p style="color: #6B7280; font-size: 12px; margin: 0;">
        You're receiving this because you subscribed to InvestorProUltraMax Pro.
      </p>
      <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0 0;">
        <a href="#" style="color: #6B7280;">Manage Preferences</a> • 
        <a href="#" style="color: #6B7280;">Unsubscribe</a> • 
        <a href="#" style="color: #6B7280;">View in Browser</a>
      </p>
      <p style="color: #9CA3AF; font-size: 11px; margin: 16px 0 0 0;">
        © ${new Date().getFullYear()} InvestorProUltraMax. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text version
   */
  private generatePlainText(sections: NewsletterSection[]): string {
    const header = `
📈 InvestorProUltraMax - Your Daily Market Intelligence
${'='.repeat(50)}
`;

    const content = sections
      .sort((a, b) => a.priority - b.priority)
      .map(s => `\n## ${s.title}\n${'-'.repeat(30)}\n${s.content}`)
      .join('\n');

    const footer = `
${'='.repeat(50)}
You're receiving this because you subscribed to InvestorProUltraMax Pro.
To unsubscribe, visit your account settings.
`;

    return header + content + footer;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}

// Singleton instance
export const newsletterGeneratorService = new NewsletterGeneratorService();
export default newsletterGeneratorService;

