'use client';

import { useMemo } from 'react';
import { Asset, Fundamentals, PriceHistory } from '@/types';
import { generatePriceHistory, mockFundamentals, mockNews } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Globe, Users, Building2, Calendar, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface AssetDetailProps {
  asset: Asset;
}

export function AssetDetail({ asset }: AssetDetailProps) {
  const priceHistory = useMemo(() => generatePriceHistory(asset.price, 90, 0.025), [asset.price]);
  const fundamentals = mockFundamentals[asset.id];
  const relatedNews = mockNews.filter(n => n.relatedAssets?.includes(asset.id));

  const isPositive = asset.changePercent24h >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl',
              asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
              asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
              asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
            )}>
              {asset.symbol.slice(0, 3)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{asset.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-white/60">{asset.symbol}</span>
                <span className={clsx(
                  'badge',
                  asset.type === 'stock' && 'badge-stock',
                  asset.type === 'crypto' && 'badge-crypto',
                  asset.type === 'etf' && 'badge-etf'
                )}>
                  {asset.type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-display text-3xl font-bold text-white">
              ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className={clsx(
              'flex items-center justify-end gap-1 mt-1 font-mono',
              isPositive ? 'text-electric-green' : 'text-electric-red'
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{asset.change24h.toFixed(2)} ({isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#00ff88' : '#ff3366'} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isPositive ? '#00ff88' : '#ff3366'} stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['auto', 'auto']}
                width={70}
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
                stroke={isPositive ? '#00ff88' : '#ff3366'}
                strokeWidth={2}
                fill="url(#assetGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4">
          <div className="text-xs text-white/50 mb-1">Market Cap</div>
          <div className="font-mono text-lg text-white">
            ${(asset.marketCap / 1e9).toFixed(2)}B
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-white/50 mb-1">24h Volume</div>
          <div className="font-mono text-lg text-white">
            ${(asset.volume24h / 1e6).toFixed(2)}M
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-white/50 mb-1">24h High</div>
          <div className="font-mono text-lg text-electric-green">
            ${asset.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-white/50 mb-1">24h Low</div>
          <div className="font-mono text-lg text-electric-red">
            ${asset.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Fundamentals */}
      {fundamentals && (
        <div className="panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Fundamentals</h3>
          
          {fundamentals.description && (
            <p className="text-white/60 text-sm mb-6">{fundamentals.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {fundamentals.peRatio && (
              <div>
                <div className="text-xs text-white/50 mb-1">P/E Ratio</div>
                <div className="font-mono text-white">{fundamentals.peRatio.toFixed(2)}</div>
              </div>
            )}
            {fundamentals.pbRatio && (
              <div>
                <div className="text-xs text-white/50 mb-1">P/B Ratio</div>
                <div className="font-mono text-white">{fundamentals.pbRatio.toFixed(2)}</div>
              </div>
            )}
            {fundamentals.psRatio && (
              <div>
                <div className="text-xs text-white/50 mb-1">P/S Ratio</div>
                <div className="font-mono text-white">{fundamentals.psRatio.toFixed(2)}</div>
              </div>
            )}
            {fundamentals.epsGrowth && (
              <div>
                <div className="text-xs text-white/50 mb-1">EPS Growth</div>
                <div className={clsx(
                  'font-mono',
                  fundamentals.epsGrowth >= 0 ? 'text-electric-green' : 'text-electric-red'
                )}>
                  {fundamentals.epsGrowth >= 0 ? '+' : ''}{fundamentals.epsGrowth.toFixed(1)}%
                </div>
              </div>
            )}
            {fundamentals.revenueGrowth && (
              <div>
                <div className="text-xs text-white/50 mb-1">Revenue Growth</div>
                <div className={clsx(
                  'font-mono',
                  fundamentals.revenueGrowth >= 0 ? 'text-electric-green' : 'text-electric-red'
                )}>
                  {fundamentals.revenueGrowth >= 0 ? '+' : ''}{fundamentals.revenueGrowth.toFixed(1)}%
                </div>
              </div>
            )}
            {fundamentals.profitMargin && (
              <div>
                <div className="text-xs text-white/50 mb-1">Profit Margin</div>
                <div className="font-mono text-white">{fundamentals.profitMargin.toFixed(1)}%</div>
              </div>
            )}
            {fundamentals.roe && (
              <div>
                <div className="text-xs text-white/50 mb-1">ROE</div>
                <div className="font-mono text-white">{fundamentals.roe.toFixed(1)}%</div>
              </div>
            )}
            {fundamentals.beta && (
              <div>
                <div className="text-xs text-white/50 mb-1">Beta</div>
                <div className="font-mono text-white">{fundamentals.beta.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-midnight-500/50">
            {fundamentals.sector && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/40" />
                <div>
                  <div className="text-xs text-white/50">Sector</div>
                  <div className="text-sm text-white">{fundamentals.sector}</div>
                </div>
              </div>
            )}
            {fundamentals.employees && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/40" />
                <div>
                  <div className="text-xs text-white/50">Employees</div>
                  <div className="text-sm text-white">{fundamentals.employees.toLocaleString()}</div>
                </div>
              </div>
            )}
            {fundamentals.founded && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <div>
                  <div className="text-xs text-white/50">Founded</div>
                  <div className="text-sm text-white">{fundamentals.founded}</div>
                </div>
              </div>
            )}
            {fundamentals.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white/40" />
                <div>
                  <div className="text-xs text-white/50">Website</div>
                  <a 
                    href={fundamentals.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-electric-cyan hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related News */}
      {relatedNews.length > 0 && (
        <div className="panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Related News</h3>
          <div className="space-y-4">
            {relatedNews.map((news) => (
              <div key={news.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-midnight-700/30 transition-colors">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  news.sentiment === 'positive' && 'bg-electric-green/10 text-electric-green',
                  news.sentiment === 'negative' && 'bg-electric-red/10 text-electric-red',
                  news.sentiment === 'neutral' && 'bg-white/10 text-white/50'
                )}>
                  {news.sentiment === 'positive' && <TrendingUp className="w-4 h-4" />}
                  {news.sentiment === 'negative' && <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{news.title}</h4>
                  <p className="text-xs text-white/50 mt-1">{news.source} • {format(new Date(news.publishedAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

