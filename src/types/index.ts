// Core data types for InvestorProUltraMax

export type AssetType = 'stock' | 'crypto' | 'etf' | 'commodity' | 'precious_metal';

export type AssetCategory = 'equity' | 'cryptocurrency' | 'commodity' | 'index' | 'forex';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  logoUrl?: string;
}

export interface Holding {
  id: string;
  assetId: string;
  asset: Asset;
  quantity: number;
  averageCost: number;
  currentValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
  portfolioId: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  assetId: string;
  asset: Asset;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  date: string;
  fees?: number;
  notes?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  holdings: Holding[];
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  assetId: string;
  asset: Asset;
  alertPrice?: number;
  alertType?: 'above' | 'below';
  notes?: string;
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface Fundamentals {
  assetId: string;
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  epsGrowth?: number;
  revenueGrowth?: number;
  profitMargin?: number;
  debtToEquity?: number;
  roe?: number;
  roa?: number;
  currentRatio?: number;
  quickRatio?: number;
  dividendYield?: number;
  payoutRatio?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  sharesOutstanding?: number;
  description?: string;
  sector?: string;
  industry?: string;
  employees?: number;
  headquarters?: string;
  website?: string;
  ceo?: string;
  founded?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedAssets?: string[];
  imageUrl?: string;
}

export interface Alert {
  id: string;
  assetId: string;
  asset: Asset;
  type: 'price_above' | 'price_below' | 'percent_change';
  threshold: number;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  portfolios: Portfolio[];
  watchlists: Watchlist[];
  alerts: Alert[];
  createdAt: string;
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface AllocationData {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface ComparisonAsset {
  asset: Asset;
  priceHistory: PriceHistory[];
  fundamentals?: Fundamentals;
}

// AI Insights & Predictions Types
export type PredictionSentiment = 'strongly_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strongly_bearish';
export type ExpertCategory = 'value_investor' | 'growth_investor' | 'contrarian' | 'technical_analyst' | 'quant' | 'macro_strategist';

export interface ExpertPrediction {
  id: string;
  expertName: string;
  expertTitle: string;
  expertFirm: string;
  expertCategory: ExpertCategory;
  assetId: string;
  sentiment: PredictionSentiment;
  priceTarget: number;
  currentPrice: number;
  targetDate: string;
  confidence: number; // 0-100
  rationale: string;
  methodology: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface AIInsight {
  id: string;
  assetId: string;
  type: 'fair_value' | 'technical' | 'sentiment' | 'risk' | 'opportunity' | 'warning';
  title: string;
  summary: string;
  details: string;
  score: number; // 0-100 where applicable
  confidence: number; // 0-100
  generatedAt: string;
  factors?: AIInsightFactor[];
}

export interface AIInsightFactor {
  name: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface FairValueAnalysis {
  assetId: string;
  currentPrice: number;
  fairValue: number;
  upside: number;
  methodology: 'dcf' | 'comparables' | 'asset_based' | 'hybrid';
  confidenceLevel: 'high' | 'medium' | 'low';
  lastUpdated: string;
  models: FairValueModel[];
}

export interface FairValueModel {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: 'strong' | 'moderate' | 'weak';
  description?: string;
}

export interface TechnicalAnalysis {
  assetId: string;
  overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  indicators: TechnicalIndicator[];
  supportLevels: number[];
  resistanceLevels: number[];
  trendDirection: 'uptrend' | 'downtrend' | 'sideways';
  volatility: 'high' | 'medium' | 'low';
  momentum: number; // -100 to 100
}

export interface RealTimeAlert {
  id: string;
  assetId: string;
  asset: Asset;
  type: 'price_target' | 'volume_spike' | 'news_sentiment' | 'technical_signal' | 'ai_insight';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  triggeredAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface MarketSentiment {
  assetId: string;
  overall: number; // -100 to 100
  social: number;
  news: number;
  institutional: number;
  retail: number;
  lastUpdated: string;
}

export interface SpotPrice {
  assetId: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  spread: number;
  lastUpdated: string;
}

