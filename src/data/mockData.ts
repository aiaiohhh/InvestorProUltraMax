import { Asset, Portfolio, Holding, Transaction, Watchlist, WatchlistItem, NewsItem, Fundamentals, PriceHistory, Alert, ChartData } from '@/types';

// Mock Assets Database
export const mockAssets: Asset[] = [
  {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    price: 178.72,
    change24h: 2.34,
    changePercent24h: 1.33,
    marketCap: 2780000000000,
    volume24h: 52340000,
    high24h: 179.50,
    low24h: 175.80,
    logoUrl: 'https://logo.clearbit.com/apple.com',
  },
  {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'stock',
    price: 141.80,
    change24h: -1.20,
    changePercent24h: -0.84,
    marketCap: 1780000000000,
    volume24h: 28450000,
    high24h: 143.20,
    low24h: 140.50,
    logoUrl: 'https://logo.clearbit.com/google.com',
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    price: 378.91,
    change24h: 4.56,
    changePercent24h: 1.22,
    marketCap: 2810000000000,
    volume24h: 19870000,
    high24h: 380.00,
    low24h: 374.20,
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
  },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    type: 'stock',
    price: 495.22,
    change24h: 12.88,
    changePercent24h: 2.67,
    marketCap: 1220000000000,
    volume24h: 41230000,
    high24h: 498.00,
    low24h: 480.50,
    logoUrl: 'https://logo.clearbit.com/nvidia.com',
  },
  {
    id: 'TSLA',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'stock',
    price: 238.45,
    change24h: -5.67,
    changePercent24h: -2.32,
    marketCap: 756000000000,
    volume24h: 98760000,
    high24h: 245.00,
    low24h: 236.20,
    logoUrl: 'https://logo.clearbit.com/tesla.com',
  },
  {
    id: 'AMZN',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    type: 'stock',
    price: 178.25,
    change24h: 1.89,
    changePercent24h: 1.07,
    marketCap: 1850000000000,
    volume24h: 45670000,
    high24h: 179.80,
    low24h: 176.00,
    logoUrl: 'https://logo.clearbit.com/amazon.com',
  },
  {
    id: 'META',
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    type: 'stock',
    price: 505.75,
    change24h: 8.32,
    changePercent24h: 1.67,
    marketCap: 1290000000000,
    volume24h: 15890000,
    high24h: 508.00,
    low24h: 496.50,
    logoUrl: 'https://logo.clearbit.com/meta.com',
  },
  {
    id: 'BTC',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    price: 67234.50,
    change24h: 1245.30,
    changePercent24h: 1.89,
    marketCap: 1320000000000,
    volume24h: 28500000000,
    high24h: 68000.00,
    low24h: 65800.00,
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'ETH',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    price: 3456.78,
    change24h: -45.23,
    changePercent24h: -1.29,
    marketCap: 415000000000,
    volume24h: 12400000000,
    high24h: 3520.00,
    low24h: 3420.00,
    logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'SOL',
    symbol: 'SOL',
    name: 'Solana',
    type: 'crypto',
    price: 148.92,
    change24h: 8.45,
    changePercent24h: 6.02,
    marketCap: 65000000000,
    volume24h: 3200000000,
    high24h: 152.00,
    low24h: 140.00,
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  {
    id: 'SPY',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    type: 'etf',
    price: 456.78,
    change24h: 3.21,
    changePercent24h: 0.71,
    marketCap: 420000000000,
    volume24h: 78900000,
    high24h: 458.00,
    low24h: 453.50,
    logoUrl: 'https://logo.clearbit.com/ssga.com',
  },
  {
    id: 'QQQ',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    type: 'etf',
    price: 389.45,
    change24h: 4.56,
    changePercent24h: 1.18,
    marketCap: 198000000000,
    volume24h: 45600000,
    high24h: 391.00,
    low24h: 385.20,
    logoUrl: 'https://logo.clearbit.com/invesco.com',
  },
  {
    id: 'VTI',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    type: 'etf',
    price: 234.56,
    change24h: 1.23,
    changePercent24h: 0.53,
    marketCap: 320000000000,
    volume24h: 4500000,
    high24h: 235.50,
    low24h: 233.00,
    logoUrl: 'https://logo.clearbit.com/vanguard.com',
  },
];

// Helper to get asset by ID
export const getAssetById = (id: string): Asset | undefined => 
  mockAssets.find(a => a.id === id);

// Mock Holdings
const createHolding = (
  id: string,
  assetId: string,
  quantity: number,
  averageCost: number,
  portfolioId: string
): Holding => {
  const asset = getAssetById(assetId)!;
  const currentValue = quantity * asset.price;
  const totalCost = quantity * averageCost;
  const profitLoss = currentValue - totalCost;
  const profitLossPercent = (profitLoss / totalCost) * 100;
  
  return {
    id,
    assetId,
    asset,
    quantity,
    averageCost,
    currentValue,
    totalCost,
    profitLoss,
    profitLossPercent,
    portfolioId,
  };
};

// Mock Portfolio
export const mockPortfolio: Portfolio = {
  id: 'portfolio-1',
  name: 'Main Portfolio',
  description: 'Primary investment portfolio',
  holdings: [
    createHolding('h1', 'AAPL', 50, 145.00, 'portfolio-1'),
    createHolding('h2', 'GOOGL', 25, 120.50, 'portfolio-1'),
    createHolding('h3', 'MSFT', 30, 320.00, 'portfolio-1'),
    createHolding('h4', 'NVDA', 15, 280.00, 'portfolio-1'),
    createHolding('h5', 'BTC', 0.75, 42000.00, 'portfolio-1'),
    createHolding('h6', 'ETH', 5, 2200.00, 'portfolio-1'),
    createHolding('h7', 'SPY', 40, 420.00, 'portfolio-1'),
    createHolding('h8', 'SOL', 100, 85.00, 'portfolio-1'),
  ],
  totalValue: 0,
  totalCost: 0,
  totalProfitLoss: 0,
  totalProfitLossPercent: 0,
  dayChange: 0,
  dayChangePercent: 0,
  createdAt: '2023-01-15T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

// Calculate portfolio totals
mockPortfolio.totalValue = mockPortfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
mockPortfolio.totalCost = mockPortfolio.holdings.reduce((sum, h) => sum + h.totalCost, 0);
mockPortfolio.totalProfitLoss = mockPortfolio.totalValue - mockPortfolio.totalCost;
mockPortfolio.totalProfitLossPercent = (mockPortfolio.totalProfitLoss / mockPortfolio.totalCost) * 100;
mockPortfolio.dayChange = mockPortfolio.holdings.reduce((sum, h) => sum + (h.asset.change24h * h.quantity), 0);
mockPortfolio.dayChangePercent = (mockPortfolio.dayChange / (mockPortfolio.totalValue - mockPortfolio.dayChange)) * 100;

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    portfolioId: 'portfolio-1',
    assetId: 'AAPL',
    asset: getAssetById('AAPL')!,
    type: 'buy',
    quantity: 25,
    price: 142.00,
    total: 3550.00,
    date: '2023-03-15T10:30:00Z',
    fees: 4.95,
  },
  {
    id: 't2',
    portfolioId: 'portfolio-1',
    assetId: 'AAPL',
    asset: getAssetById('AAPL')!,
    type: 'buy',
    quantity: 25,
    price: 148.00,
    total: 3700.00,
    date: '2023-06-22T14:15:00Z',
    fees: 4.95,
  },
  {
    id: 't3',
    portfolioId: 'portfolio-1',
    assetId: 'BTC',
    asset: getAssetById('BTC')!,
    type: 'buy',
    quantity: 0.5,
    price: 38000.00,
    total: 19000.00,
    date: '2023-02-10T09:00:00Z',
    fees: 25.00,
  },
  {
    id: 't4',
    portfolioId: 'portfolio-1',
    assetId: 'BTC',
    asset: getAssetById('BTC')!,
    type: 'buy',
    quantity: 0.25,
    price: 50000.00,
    total: 12500.00,
    date: '2023-11-20T11:30:00Z',
    fees: 18.00,
  },
  {
    id: 't5',
    portfolioId: 'portfolio-1',
    assetId: 'NVDA',
    asset: getAssetById('NVDA')!,
    type: 'buy',
    quantity: 15,
    price: 280.00,
    total: 4200.00,
    date: '2023-04-05T13:45:00Z',
    fees: 4.95,
  },
  {
    id: 't6',
    portfolioId: 'portfolio-1',
    assetId: 'TSLA',
    asset: getAssetById('TSLA')!,
    type: 'sell',
    quantity: 10,
    price: 260.00,
    total: 2600.00,
    date: '2023-08-15T15:00:00Z',
    fees: 4.95,
  },
];

// Mock Watchlist
export const mockWatchlist: Watchlist = {
  id: 'watchlist-1',
  name: 'Tech & Crypto Watch',
  items: [
    {
      id: 'w1',
      assetId: 'TSLA',
      asset: getAssetById('TSLA')!,
      alertPrice: 250.00,
      alertType: 'above',
      notes: 'Wait for breakout above $250',
      addedAt: '2024-01-10T00:00:00Z',
    },
    {
      id: 'w2',
      assetId: 'META',
      asset: getAssetById('META')!,
      alertPrice: 480.00,
      alertType: 'below',
      notes: 'Buy opportunity if drops below $480',
      addedAt: '2024-01-12T00:00:00Z',
    },
    {
      id: 'w3',
      assetId: 'SOL',
      asset: getAssetById('SOL')!,
      alertPrice: 200.00,
      alertType: 'above',
      notes: 'Take profits at $200',
      addedAt: '2024-01-05T00:00:00Z',
    },
    {
      id: 'w4',
      assetId: 'QQQ',
      asset: getAssetById('QQQ')!,
      addedAt: '2024-01-08T00:00:00Z',
    },
    {
      id: 'w5',
      assetId: 'AMZN',
      asset: getAssetById('AMZN')!,
      alertPrice: 170.00,
      alertType: 'below',
      notes: 'Strong support at $170',
      addedAt: '2024-01-15T00:00:00Z',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
};

// Mock News
export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    title: 'NVIDIA Reports Record Data Center Revenue Driven by AI Demand',
    summary: 'NVIDIA\'s data center revenue surged 279% year-over-year as the company continues to dominate the AI chip market. CEO Jensen Huang highlighted unprecedented demand for H100 GPUs.',
    source: 'Bloomberg',
    url: '#',
    publishedAt: '2024-01-18T14:30:00Z',
    sentiment: 'positive',
    relatedAssets: ['NVDA'],
  },
  {
    id: 'n2',
    title: 'Bitcoin ETF Sees Record Inflows in First Week of Trading',
    summary: 'The newly approved spot Bitcoin ETFs attracted over $1.9 billion in net inflows during their first week, signaling strong institutional appetite for cryptocurrency exposure.',
    source: 'CoinDesk',
    url: '#',
    publishedAt: '2024-01-17T10:15:00Z',
    sentiment: 'positive',
    relatedAssets: ['BTC'],
  },
  {
    id: 'n3',
    title: 'Apple Vision Pro Launch Date Announced, Pre-orders Begin Friday',
    summary: 'Apple announced the Vision Pro headset will launch on February 2nd in the US, with pre-orders starting this Friday. The $3,499 device represents Apple\'s biggest new product category in years.',
    source: 'TechCrunch',
    url: '#',
    publishedAt: '2024-01-16T18:00:00Z',
    sentiment: 'positive',
    relatedAssets: ['AAPL'],
  },
  {
    id: 'n4',
    title: 'Tesla Faces Increased Competition as Chinese EV Makers Expand Globally',
    summary: 'BYD and other Chinese electric vehicle manufacturers are accelerating their international expansion, putting pressure on Tesla\'s market share in Europe and emerging markets.',
    source: 'Reuters',
    url: '#',
    publishedAt: '2024-01-16T09:45:00Z',
    sentiment: 'negative',
    relatedAssets: ['TSLA'],
  },
  {
    id: 'n5',
    title: 'Fed Officials Signal Potential Rate Cuts Later This Year',
    summary: 'Several Federal Reserve officials suggested the central bank could begin cutting interest rates in the second half of 2024 if inflation continues to moderate.',
    source: 'Wall Street Journal',
    url: '#',
    publishedAt: '2024-01-15T16:20:00Z',
    sentiment: 'positive',
    relatedAssets: ['SPY', 'QQQ'],
  },
  {
    id: 'n6',
    title: 'Ethereum Network Upgrade "Dencun" Set for March Launch',
    summary: 'The Ethereum Foundation announced the Dencun upgrade will go live on mainnet in March, introducing proto-danksharding to significantly reduce Layer 2 transaction costs.',
    source: 'The Block',
    url: '#',
    publishedAt: '2024-01-15T12:00:00Z',
    sentiment: 'positive',
    relatedAssets: ['ETH'],
  },
];

// Mock Fundamentals
export const mockFundamentals: Record<string, Fundamentals> = {
  AAPL: {
    assetId: 'AAPL',
    peRatio: 28.5,
    pbRatio: 45.2,
    psRatio: 7.3,
    epsGrowth: 11.2,
    revenueGrowth: 2.1,
    profitMargin: 25.3,
    debtToEquity: 1.87,
    roe: 147.9,
    roa: 28.3,
    currentRatio: 0.99,
    quickRatio: 0.94,
    dividendYield: 0.51,
    payoutRatio: 15.2,
    beta: 1.28,
    week52High: 199.62,
    week52Low: 124.17,
    avgVolume: 57230000,
    sharesOutstanding: 15550000000,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    employees: 164000,
    headquarters: 'Cupertino, California',
    website: 'https://www.apple.com',
    ceo: 'Tim Cook',
    founded: '1976',
  },
  NVDA: {
    assetId: 'NVDA',
    peRatio: 65.3,
    pbRatio: 42.1,
    psRatio: 28.7,
    epsGrowth: 586.2,
    revenueGrowth: 122.4,
    profitMargin: 55.0,
    debtToEquity: 0.41,
    roe: 91.5,
    roa: 45.3,
    currentRatio: 4.17,
    quickRatio: 3.59,
    dividendYield: 0.03,
    payoutRatio: 1.8,
    beta: 1.72,
    week52High: 505.48,
    week52Low: 138.84,
    avgVolume: 42150000,
    sharesOutstanding: 2470000000,
    description: 'NVIDIA Corporation provides graphics, computing and networking solutions. The company leads in AI computing, data center, and gaming.',
    sector: 'Technology',
    industry: 'Semiconductors',
    employees: 29600,
    headquarters: 'Santa Clara, California',
    website: 'https://www.nvidia.com',
    ceo: 'Jensen Huang',
    founded: '1993',
  },
  MSFT: {
    assetId: 'MSFT',
    peRatio: 36.2,
    pbRatio: 12.8,
    psRatio: 13.1,
    epsGrowth: 21.5,
    revenueGrowth: 12.8,
    profitMargin: 36.7,
    debtToEquity: 0.35,
    roe: 38.5,
    roa: 19.2,
    currentRatio: 1.77,
    quickRatio: 1.54,
    dividendYield: 0.74,
    payoutRatio: 26.8,
    beta: 0.89,
    week52High: 384.30,
    week52Low: 245.61,
    avgVolume: 21450000,
    sharesOutstanding: 7430000000,
    description: 'Microsoft Corporation develops and supports software, services, devices and solutions worldwide including cloud computing, AI, and productivity software.',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    employees: 221000,
    headquarters: 'Redmond, Washington',
    website: 'https://www.microsoft.com',
    ceo: 'Satya Nadella',
    founded: '1975',
  },
  GOOGL: {
    assetId: 'GOOGL',
    peRatio: 24.8,
    pbRatio: 6.2,
    psRatio: 5.9,
    epsGrowth: 52.3,
    revenueGrowth: 11.0,
    profitMargin: 24.0,
    debtToEquity: 0.10,
    roe: 27.4,
    roa: 17.3,
    currentRatio: 2.93,
    quickRatio: 2.78,
    dividendYield: 0,
    payoutRatio: 0,
    beta: 1.05,
    week52High: 153.78,
    week52Low: 89.42,
    avgVolume: 26780000,
    sharesOutstanding: 12530000000,
    description: 'Alphabet Inc. offers various products and platforms including Google Search, YouTube, Android, Cloud, and Waymo autonomous vehicles.',
    sector: 'Technology',
    industry: 'Internet Content & Information',
    employees: 182502,
    headquarters: 'Mountain View, California',
    website: 'https://www.abc.xyz',
    ceo: 'Sundar Pichai',
    founded: '1998',
  },
  BTC: {
    assetId: 'BTC',
    week52High: 73750,
    week52Low: 38500,
    avgVolume: 28000000000,
    description: 'Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network. It was invented in 2008 by an unknown person using the name Satoshi Nakamoto.',
    sector: 'Cryptocurrency',
    industry: 'Digital Currency',
    website: 'https://bitcoin.org',
    founded: '2009',
  },
  ETH: {
    assetId: 'ETH',
    week52High: 4090,
    week52Low: 1520,
    avgVolume: 12000000000,
    description: 'Ethereum is a decentralized blockchain platform that establishes a peer-to-peer network for executing and verifying smart contracts and decentralized applications.',
    sector: 'Cryptocurrency',
    industry: 'Smart Contract Platform',
    website: 'https://ethereum.org',
    founded: '2015',
  },
};

// Seeded random for deterministic generation
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate mock price history (deterministic based on basePrice)
export const generatePriceHistory = (
  basePrice: number,
  days: number = 365,
  volatility: number = 0.02
): PriceHistory[] => {
  const history: PriceHistory[] = [];
  const seed = Math.floor(basePrice * 1000); // Use basePrice as seed
  const random = seededRandom(seed);
  
  let currentPrice = basePrice * (1 - (days * volatility * 0.1));
  // Use a fixed base time for determinism
  const baseTime = new Date('2024-01-18T00:00:00Z').getTime();
  
  for (let i = days; i >= 0; i--) {
    const change = (random() - 0.48) * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.3);
    
    history.push({
      timestamp: baseTime - (i * 24 * 60 * 60 * 1000),
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(random() * 100000000),
    });
  }
  
  // Ensure last price matches current asset price
  if (history.length > 0) {
    history[history.length - 1].price = basePrice;
  }
  
  return history;
};

// Generate portfolio history chart data (deterministic)
export const generatePortfolioHistory = (days: number = 90): ChartData[] => {
  const history: ChartData[] = [];
  const seed = Math.floor(mockPortfolio.totalValue);
  const random = seededRandom(seed + days);
  
  let value = mockPortfolio.totalValue * 0.85;
  // Use fixed base date for determinism
  const baseDate = new Date('2024-01-18');
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    const change = (random() - 0.45) * value * 0.015;
    value = Math.max(value + change, mockPortfolio.totalValue * 0.5);
    
    history.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(2)),
    });
  }
  
  // Ensure last value matches current portfolio value
  history[history.length - 1].value = mockPortfolio.totalValue;
  
  return history;
};

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    assetId: 'BTC',
    asset: getAssetById('BTC')!,
    type: 'price_above',
    threshold: 70000,
    triggered: false,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'a2',
    assetId: 'NVDA',
    asset: getAssetById('NVDA')!,
    type: 'price_above',
    threshold: 500,
    triggered: false,
    createdAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'a3',
    assetId: 'ETH',
    asset: getAssetById('ETH')!,
    type: 'price_below',
    threshold: 3000,
    triggered: false,
    createdAt: '2024-01-08T00:00:00Z',
  },
];

// Market indices summary
export const marketIndices = [
  { name: 'S&P 500', value: 4780.94, change: 0.52 },
  { name: 'NASDAQ', value: 15055.65, change: 0.98 },
  { name: 'DOW', value: 37863.80, change: 0.31 },
  { name: 'BTC/USD', value: 67234.50, change: 1.89 },
  { name: 'ETH/USD', value: 3456.78, change: -1.29 },
  { name: '10Y Treasury', value: 4.12, change: -0.05 },
];

