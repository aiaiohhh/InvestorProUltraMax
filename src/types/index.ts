// Core data types for InvestorProUltraMax

export type AssetType = 'stock' | 'crypto' | 'etf';

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

