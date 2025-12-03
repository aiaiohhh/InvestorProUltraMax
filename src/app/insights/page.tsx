'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExpertPredictions } from '@/components/insights/ExpertPredictions';
import { FairValueAnalysis } from '@/components/insights/FairValueAnalysis';
import { TechnicalAnalysis } from '@/components/insights/TechnicalAnalysis';
import { useStore } from '@/store/useStore';
import { mockAssets, generatePriceHistory, realTimeAlerts, spotPrices, marketSentiment, aiInsights } from '@/data/mockData';
import { Asset } from '@/types';
import { 
  Search, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target,
  Activity,
  Bell,
  Sparkles,
  BarChart3,
  LineChart,
  Scale,
  Users,
  Radio,
  Clock,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

type TabType = 'overview' | 'fair_value' | 'predictions' | 'technical';
type AssetFilter = 'all' | 'stock' | 'crypto' | 'commodity' | 'precious_metal' | 'etf';

function InsightsContent() {
  const searchParams = useSearchParams();
  const initialAsset = searchParams.get('asset');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialAsset || 'AAPL');
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('all');

  // Get all assets including commodities
  const allAssets = mockAssets;
  
  const filteredAssets = useMemo(() => {
    return allAssets.filter(asset => {
      const matchesSearch = searchQuery.length === 0 ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = assetFilter === 'all' || asset.type === assetFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allAssets, searchQuery, assetFilter]);

  const selectedAsset = selectedAssetId ? allAssets.find(a => a.id === selectedAssetId) : null;
  const priceHistory = useMemo(() => 
    selectedAsset ? generatePriceHistory(selectedAsset.price, 90, 0.025) : [], 
    [selectedAsset]
  );

  const assetAlerts = selectedAsset 
    ? realTimeAlerts.filter(a => a.assetId === selectedAsset.id)
    : [];

  const assetSentiment = selectedAsset ? marketSentiment[selectedAsset.id] : null;
  const assetInsights = selectedAsset ? aiInsights[selectedAsset.id] : [];
  const assetSpotPrice = selectedAsset && spotPrices[selectedAsset.id];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'fair_value', label: 'Fair Value', icon: Scale },
    { id: 'predictions', label: 'Expert Predictions', icon: Users },
    { id: 'technical', label: 'Technical Analysis', icon: Activity },
  ] as const;

  const filterOptions: { value: AssetFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'stock', label: 'Stocks' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'commodity', label: 'Commodities' },
    { value: 'precious_metal', label: 'Metals' },
    { value: 'etf', label: 'ETFs' },
  ];

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-purple to-electric-cyan 
                            flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">AI Insights</h1>
                <p className="text-white/50 text-sm">Deep-dive analysis powered by AI</p>
              </div>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-electric-green/10 rounded-full border border-electric-green/30">
            <div className="w-2 h-2 rounded-full bg-electric-green pulse-live" />
            <span className="text-xs text-electric-green font-medium">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Asset Selector Panel */}
          <div className="xl:col-span-1">
            <div className="panel sticky top-4">
              {/* Search */}
              <div className="p-4 border-b border-midnight-500/50">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                
                {/* Filter pills */}
                <div className="flex flex-wrap gap-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAssetFilter(option.value)}
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded transition-all',
                        assetFilter === option.value
                          ? 'bg-electric-cyan/20 text-electric-cyan'
                          : 'text-white/50 hover:text-white hover:bg-midnight-600'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset List */}
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setSelectedAssetId(asset.id);
                      setActiveTab('overview');
                    }}
                    className={clsx(
                      'w-full flex items-center gap-3 p-3 border-b border-midnight-600/50 transition-colors text-left',
                      selectedAssetId === asset.id
                        ? 'bg-electric-cyan/10 border-l-2 border-l-electric-cyan'
                        : 'hover:bg-midnight-700/50'
                    )}
                  >
                    <div className={clsx(
                      'w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0',
                      asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                      asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                      asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple',
                      asset.type === 'commodity' && 'bg-electric-yellow/10 text-electric-yellow',
                      asset.type === 'precious_metal' && 'bg-electric-green/10 text-electric-green'
                    )}>
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{asset.symbol}</div>
                      <div className="text-[10px] text-white/50 truncate">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-white">
                        ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className={clsx(
                        'text-[10px] font-mono',
                        asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                      )}>
                        {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {selectedAsset ? (
              <>
                {/* Asset Header */}
                <div className="panel p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl',
                        selectedAsset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                        selectedAsset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                        selectedAsset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple',
                        selectedAsset.type === 'commodity' && 'bg-electric-yellow/10 text-electric-yellow',
                        selectedAsset.type === 'precious_metal' && 'bg-electric-green/10 text-electric-green'
                      )}>
                        {selectedAsset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-white">{selectedAsset.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-white/60">{selectedAsset.symbol}</span>
                          <span className={clsx(
                            'badge',
                            selectedAsset.type === 'stock' && 'badge-stock',
                            selectedAsset.type === 'crypto' && 'badge-crypto',
                            selectedAsset.type === 'etf' && 'badge-etf',
                            selectedAsset.type === 'commodity' && 'bg-electric-yellow/10 text-electric-yellow',
                            selectedAsset.type === 'precious_metal' && 'bg-electric-green/10 text-electric-green'
                          )}>
                            {selectedAsset.type.replace('_', ' ').toUpperCase()}
                          </span>
                          {assetAlerts.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-electric-orange">
                              <Bell className="w-3 h-3" />
                              {assetAlerts.length} alerts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-display text-3xl font-bold text-white">
                        ${selectedAsset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className={clsx(
                        'flex items-center justify-end gap-1 mt-1 font-mono',
                        selectedAsset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                      )}>
                        {selectedAsset.changePercent24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {selectedAsset.changePercent24h >= 0 ? '+' : ''}
                        {selectedAsset.change24h.toFixed(2)} ({selectedAsset.changePercent24h >= 0 ? '+' : ''}
                        {selectedAsset.changePercent24h.toFixed(2)}%)
                      </div>
                      {assetSpotPrice && (
                        <div className="mt-2 text-xs text-white/40">
                          Bid: ${assetSpotPrice.bid.toLocaleString()} • Ask: ${assetSpotPrice.ask.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <defs>
                          <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={selectedAsset.changePercent24h >= 0 ? '#00ff88' : '#ff3366'} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={selectedAsset.changePercent24h >= 0 ? '#00ff88' : '#ff3366'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                        <XAxis
                          dataKey="timestamp"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          tickFormatter={(value) => format(new Date(value), 'MMM d')}
                          minTickGap={40}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          domain={['auto', 'auto']}
                          width={60}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                          }}
                          labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                          formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Price']}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke={selectedAsset.changePercent24h >= 0 ? '#00ff88' : '#ff3366'}
                          strokeWidth={2}
                          fill="url(#insightGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-midnight-800/50 rounded-lg border border-midnight-500/50">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-1 justify-center',
                          activeTab === tab.id
                            ? 'bg-electric-cyan/20 text-electric-cyan'
                            : 'text-white/50 hover:text-white hover:bg-midnight-700/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="panel p-4">
                            <div className="text-xs text-white/50 mb-1">Market Cap</div>
                            <div className="font-mono text-lg text-white">
                              ${(selectedAsset.marketCap / 1e9).toFixed(2)}B
                            </div>
                          </div>
                          <div className="panel p-4">
                            <div className="text-xs text-white/50 mb-1">24h Volume</div>
                            <div className="font-mono text-lg text-white">
                              ${(selectedAsset.volume24h / 1e6).toFixed(2)}M
                            </div>
                          </div>
                          <div className="panel p-4">
                            <div className="text-xs text-white/50 mb-1">24h High</div>
                            <div className="font-mono text-lg text-electric-green">
                              ${selectedAsset.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="panel p-4">
                            <div className="text-xs text-white/50 mb-1">24h Low</div>
                            <div className="font-mono text-lg text-electric-red">
                              ${selectedAsset.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>

                        {/* AI Insights Summary */}
                        {assetInsights.length > 0 && (
                          <div className="panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="w-5 h-5 text-electric-purple" />
                              <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              {assetInsights.slice(0, 4).map((insight) => (
                                <motion.div
                                  key={insight.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={clsx(
                                    'p-4 rounded-lg border transition-colors cursor-pointer hover:border-electric-cyan/50',
                                    insight.type === 'fair_value' && 'bg-electric-cyan/5 border-electric-cyan/20',
                                    insight.type === 'sentiment' && 'bg-electric-purple/5 border-electric-purple/20',
                                    insight.type === 'opportunity' && 'bg-electric-green/5 border-electric-green/20',
                                    insight.type === 'warning' && 'bg-electric-red/5 border-electric-red/20',
                                    insight.type === 'technical' && 'bg-electric-orange/5 border-electric-orange/20',
                                    insight.type === 'risk' && 'bg-electric-yellow/5 border-electric-yellow/20'
                                  )}
                                  onClick={() => {
                                    if (insight.type === 'fair_value') setActiveTab('fair_value');
                                    else if (insight.type === 'technical') setActiveTab('technical');
                                  }}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                                    <div className={clsx(
                                      'px-2 py-0.5 rounded text-xs font-medium',
                                      insight.type === 'fair_value' && 'bg-electric-cyan/20 text-electric-cyan',
                                      insight.type === 'sentiment' && 'bg-electric-purple/20 text-electric-purple',
                                      insight.type === 'opportunity' && 'bg-electric-green/20 text-electric-green',
                                      insight.type === 'warning' && 'bg-electric-red/20 text-electric-red',
                                      insight.type === 'technical' && 'bg-electric-orange/20 text-electric-orange',
                                      insight.type === 'risk' && 'bg-electric-yellow/20 text-electric-yellow'
                                    )}>
                                      {insight.type.replace('_', ' ')}
                                    </div>
                                  </div>
                                  <p className="text-xs text-white/60 mb-3">{insight.summary}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-white/40">Confidence:</span>
                                      <div className="w-16 h-1.5 bg-midnight-600 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-electric-cyan rounded-full"
                                          style={{ width: `${insight.confidence}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-white/60 font-mono">{insight.confidence}%</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/30" />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sentiment Gauge */}
                        {assetSentiment && (
                          <div className="panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Radio className="w-5 h-5 text-electric-orange" />
                              <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {[
                                { label: 'Overall', value: assetSentiment.overall },
                                { label: 'Social', value: assetSentiment.social },
                                { label: 'News', value: assetSentiment.news },
                                { label: 'Institutional', value: assetSentiment.institutional },
                                { label: 'Retail', value: assetSentiment.retail },
                              ].map((item) => (
                                <div key={item.label} className="bg-midnight-700/50 rounded-lg p-4">
                                  <div className="text-xs text-white/50 mb-2">{item.label}</div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-midnight-600 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value + 100) / 2}%` }}
                                        className={clsx(
                                          'h-full rounded-full',
                                          item.value >= 50 && 'bg-electric-green',
                                          item.value >= 0 && item.value < 50 && 'bg-electric-cyan',
                                          item.value < 0 && 'bg-electric-red'
                                        )}
                                      />
                                    </div>
                                    <span className={clsx(
                                      'font-mono text-sm',
                                      item.value >= 50 && 'text-electric-green',
                                      item.value >= 0 && item.value < 50 && 'text-electric-cyan',
                                      item.value < 0 && 'text-electric-red'
                                    )}>
                                      {item.value}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Active Alerts */}
                        {assetAlerts.length > 0 && (
                          <div className="panel p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Bell className="w-5 h-5 text-electric-red" />
                              <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                            </div>
                            <div className="space-y-3">
                              {assetAlerts.map((alert) => (
                                <div
                                  key={alert.id}
                                  className={clsx(
                                    'flex items-start gap-3 p-3 rounded-lg border',
                                    alert.severity === 'critical' && 'bg-electric-red/10 border-electric-red/30',
                                    alert.severity === 'high' && 'bg-electric-orange/10 border-electric-orange/30',
                                    alert.severity === 'medium' && 'bg-electric-yellow/10 border-electric-yellow/30',
                                    alert.severity === 'low' && 'bg-midnight-700/50 border-midnight-500/50'
                                  )}
                                >
                                  <AlertCircle className={clsx(
                                    'w-5 h-5 flex-shrink-0 mt-0.5',
                                    alert.severity === 'critical' && 'text-electric-red',
                                    alert.severity === 'high' && 'text-electric-orange',
                                    alert.severity === 'medium' && 'text-electric-yellow',
                                    alert.severity === 'low' && 'text-white/50'
                                  )} />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white text-sm">{alert.title}</h4>
                                    <p className="text-xs text-white/60 mt-1">{alert.message}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                                      <Clock className="w-3 h-3" />
                                      {format(new Date(alert.triggeredAt), 'MMM d, h:mm a')}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'fair_value' && <FairValueAnalysis asset={selectedAsset} />}
                    {activeTab === 'predictions' && <ExpertPredictions asset={selectedAsset} />}
                    {activeTab === 'technical' && <TechnicalAnalysis asset={selectedAsset} />}
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <div className="panel p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-purple/20 to-electric-cyan/20 
                              flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Select an Asset</h3>
                <p className="text-white/50 max-w-md mx-auto">
                  Choose an asset from the list to access AI-powered insights, fair value analysis, 
                  expert predictions, and advanced technical analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-purple to-electric-cyan 
                          flex items-center justify-center animate-pulse">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">AI Insights</h1>
              <p className="text-white/50 text-sm">Loading...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <InsightsContent />
    </Suspense>
  );
}

