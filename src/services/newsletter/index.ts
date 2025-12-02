/**
 * Newsletter Services Index
 * 
 * Main entry point for newsletter-related services.
 */

export { contentAggregatorService, type AggregatedContent } from './contentAggregator';
export type {
  MarketSummary,
  TopMovers,
  NewsDigest,
  SocialIntelligence,
  EconomicUpdate,
  EarningsUpdate,
  CryptoUpdate,
} from './contentAggregator';

export { newsletterGeneratorService, type GeneratedNewsletter, type UserPreferences, type NewsletterSection } from './newsletterGenerator';

