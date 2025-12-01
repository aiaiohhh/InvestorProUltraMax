'use client';

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStore } from '@/store/useStore';
import { marketIndices } from '@/data/mockData';
import { TrendingUp, TrendingDown, ArrowUpDown, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

type SortField = 'symbol' | 'price' | 'change' | 'marketCap' | 'volume';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'stock' | 'crypto' | 'etf';

export default function MarketsPage() {
  const { assets } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedAssets = useMemo(() => {
    return assets
      .filter(asset => {
        const matchesSearch = searchQuery.length === 0 ||
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || asset.type === filter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;

        switch (sortField) {
          case 'symbol':
            aVal = a.symbol;
            bVal = b.symbol;
            break;
          case 'price':
            aVal = a.price;
            bVal = b.price;
            break;
          case 'change':
            aVal = a.changePercent24h;
            bVal = b.changePercent24h;
            break;
          case 'marketCap':
            aVal = a.marketCap;
            bVal = b.marketCap;
            break;
          case 'volume':
            aVal = a.volume24h;
            bVal = b.volume24h;
            break;
        }

        if (typeof aVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal);
        }

        return sortOrder === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
      });
  }, [assets, searchQuery, filter, sortField, sortOrder]);

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={clsx(
        'flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors',
        sortField === field ? 'text-electric-cyan' : 'text-white/50 hover:text-white/70'
      )}
    >
      {children}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Markets</h1>
          <p className="text-white/50">Browse all available assets</p>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {marketIndices.map((index) => (
            <div key={index.name} className="panel p-4">
              <div className="text-xs text-white/50 mb-1">{index.name}</div>
              <div className="font-mono text-lg text-white">
                {index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className={clsx(
                'text-xs font-mono flex items-center gap-1',
                index.change >= 0 ? 'text-electric-green' : 'text-electric-red'
              )}>
                {index.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-1 bg-midnight-700 p-1 rounded-lg">
            {(['all', 'stock', 'crypto', 'etf'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  filter === f
                    ? 'bg-electric-cyan/20 text-electric-cyan'
                    : 'text-white/50 hover:text-white hover:bg-midnight-600'
                )}
              >
                {f === 'all' ? 'All' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Table */}
        <div className="panel overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-midnight-700/30">
                <th className="w-8">#</th>
                <th>
                  <SortHeader field="symbol">Asset</SortHeader>
                </th>
                <th>
                  <SortHeader field="price">Price</SortHeader>
                </th>
                <th>
                  <SortHeader field="change">24h Change</SortHeader>
                </th>
                <th>24h High</th>
                <th>24h Low</th>
                <th>
                  <SortHeader field="marketCap">Market Cap</SortHeader>
                </th>
                <th>
                  <SortHeader field="volume">Volume (24h)</SortHeader>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAssets.map((asset, index) => (
                <tr key={asset.id} className="group hover:bg-midnight-700/30">
                  <td className="text-white/40 text-sm">{index + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                        asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                        asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                        asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                      )}>
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{asset.symbol}</span>
                          <span className={clsx(
                            'badge text-[10px]',
                            asset.type === 'stock' && 'badge-stock',
                            asset.type === 'crypto' && 'badge-crypto',
                            asset.type === 'etf' && 'badge-etf'
                          )}>
                            {asset.type}
                          </span>
                        </div>
                        <div className="text-xs text-white/50">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-white font-medium">
                    ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div className={clsx(
                      'flex items-center gap-1 font-mono',
                      asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                    )}>
                      {asset.changePercent24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="font-mono text-white/70">
                    ${asset.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="font-mono text-white/70">
                    ${asset.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="font-mono text-white">
                    ${(asset.marketCap / 1e9).toFixed(2)}B
                  </td>
                  <td className="font-mono text-white/70">
                    ${(asset.volume24h / 1e6).toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </MainLayout>
  );
}

