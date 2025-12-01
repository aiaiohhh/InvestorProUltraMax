'use client';

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStore } from '@/store/useStore';
import { mockFundamentals, generatePriceHistory } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, X, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Asset } from '@/types';

const CHART_COLORS = ['#00d9ff', '#ff9500', '#a855f7', '#00ff88', '#ff3366'];

export default function ComparePage() {
  const { assets } = useStore();
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['AAPL', 'MSFT']);
  const [showAddModal, setShowAddModal] = useState(false);

  const availableAssets = assets.filter(a => !selectedAssets.includes(a.id));

  const addAsset = (assetId: string) => {
    if (selectedAssets.length < 5) {
      setSelectedAssets([...selectedAssets, assetId]);
    }
    setShowAddModal(false);
  };

  const removeAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter(id => id !== assetId));
  };

  const selectedAssetObjects = selectedAssets
    .map(id => assets.find(a => a.id === id))
    .filter(Boolean) as Asset[];

  // Generate normalized price data for comparison
  const chartData = useMemo(() => {
    if (selectedAssets.length === 0) return [];

    const historiesMap: Record<string, { timestamp: number; price: number }[]> = {};
    
    selectedAssets.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        historiesMap[assetId] = generatePriceHistory(asset.price, 90, 0.02);
      }
    });

    // Normalize all prices to percentage change from start
    const normalizedData: Record<string, number>[] = [];
    const firstAssetHistory = historiesMap[selectedAssets[0]];
    
    if (!firstAssetHistory) return [];

    firstAssetHistory.forEach((_, index) => {
      const dataPoint: Record<string, number> = {
        timestamp: firstAssetHistory[index].timestamp,
      };

      selectedAssets.forEach(assetId => {
        const history = historiesMap[assetId];
        if (history && history[0] && history[index]) {
          const startPrice = history[0].price;
          const currentPrice = history[index].price;
          dataPoint[assetId] = ((currentPrice - startPrice) / startPrice) * 100;
        }
      });

      normalizedData.push(dataPoint);
    });

    return normalizedData;
  }, [selectedAssets, assets]);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Compare Assets</h1>
            <p className="text-white/50">Compare performance and fundamentals side by side</p>
          </div>
          {selectedAssets.length < 5 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          )}
        </div>

        {/* Selected Assets Pills */}
        <div className="flex flex-wrap gap-2">
          {selectedAssetObjects.map((asset, index) => (
            <div
              key={asset.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-midnight-700 border border-midnight-500"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="font-medium text-white">{asset.symbol}</span>
              <span className="text-sm text-white/50">{asset.name}</span>
              <button
                onClick={() => removeAsset(asset.id)}
                className="p-1 rounded hover:bg-midnight-600 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {selectedAssets.length > 0 ? (
          <>
            {/* Performance Chart */}
            <div className="panel p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison (90 days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      minTickGap={40}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                      domain={['auto', 'auto']}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value: number, name: string) => [
                        `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
                        name,
                      ]}
                    />
                    <Legend />
                    {selectedAssets.map((assetId, index) => (
                      <Line
                        key={assetId}
                        type="monotone"
                        dataKey={assetId}
                        name={assetId}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fundamentals Comparison */}
            <div className="panel overflow-hidden">
              <div className="px-6 py-4 border-b border-midnight-500/50">
                <h3 className="text-lg font-semibold text-white">Fundamentals Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="bg-midnight-700/30">
                      <th>Metric</th>
                      {selectedAssetObjects.map((asset, index) => (
                        <th key={asset.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            {asset.symbol}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-white/60">Price</td>
                      {selectedAssetObjects.map((asset) => (
                        <td key={asset.id} className="font-mono text-white">
                          ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-white/60">24h Change</td>
                      {selectedAssetObjects.map((asset) => (
                        <td key={asset.id}>
                          <span className={clsx(
                            'font-mono',
                            asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                          )}>
                            {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-white/60">Market Cap</td>
                      {selectedAssetObjects.map((asset) => (
                        <td key={asset.id} className="font-mono text-white">
                          ${(asset.marketCap / 1e9).toFixed(2)}B
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-white/60">P/E Ratio</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id} className="font-mono text-white">
                            {fund?.peRatio?.toFixed(2) || '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="text-white/60">EPS Growth</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id}>
                            {fund?.epsGrowth ? (
                              <span className={clsx(
                                'font-mono',
                                fund.epsGrowth >= 0 ? 'text-electric-green' : 'text-electric-red'
                              )}>
                                {fund.epsGrowth >= 0 ? '+' : ''}{fund.epsGrowth.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-white/40">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="text-white/60">Revenue Growth</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id}>
                            {fund?.revenueGrowth ? (
                              <span className={clsx(
                                'font-mono',
                                fund.revenueGrowth >= 0 ? 'text-electric-green' : 'text-electric-red'
                              )}>
                                {fund.revenueGrowth >= 0 ? '+' : ''}{fund.revenueGrowth.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-white/40">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="text-white/60">Profit Margin</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id} className="font-mono text-white">
                            {fund?.profitMargin ? `${fund.profitMargin.toFixed(1)}%` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="text-white/60">ROE</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id} className="font-mono text-white">
                            {fund?.roe ? `${fund.roe.toFixed(1)}%` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="text-white/60">Beta</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id} className="font-mono text-white">
                            {fund?.beta?.toFixed(2) || '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="text-white/60">Dividend Yield</td>
                      {selectedAssetObjects.map((asset) => {
                        const fund = mockFundamentals[asset.id];
                        return (
                          <td key={asset.id} className="font-mono text-white">
                            {fund?.dividendYield ? `${fund.dividendYield.toFixed(2)}%` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="panel p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-midnight-700 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Assets Selected</h3>
            <p className="text-white/50 mb-4">Add assets to compare their performance and fundamentals</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add First Asset
            </button>
          </div>
        )}

        {/* Add Asset Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Add Asset to Compare</h2>
              
              <div className="overflow-y-auto flex-1">
                {availableAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => addAsset(asset.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-midnight-700 transition-colors text-left"
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                      asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                      asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                      asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                    )}>
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-white/50">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-white">
                        ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className={clsx(
                        'text-xs font-mono',
                        asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                      )}>
                        {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary mt-4 w-full"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}

