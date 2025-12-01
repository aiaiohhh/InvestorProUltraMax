'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { AssetDetail } from '@/components/research/AssetDetail';
import { useStore } from '@/store/useStore';
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'stock' | 'crypto' | 'etf';

export default function ResearchPage() {
  const searchParams = useSearchParams();
  const initialAsset = searchParams.get('asset');
  
  const { assets } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialAsset);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchQuery.length === 0 ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || asset.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [assets, searchQuery, filter]);

  const selectedAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Research</h1>
          <p className="text-white/50">Analyze assets with fundamental data and metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset List */}
          <div className="lg:col-span-1">
            <div className="panel">
              {/* Search & Filter */}
              <div className="p-4 border-b border-midnight-500/50 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <div className="flex gap-1">
                  {(['all', 'stock', 'crypto', 'etf'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={clsx(
                        'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                        filter === f
                          ? 'bg-electric-cyan/20 text-electric-cyan'
                          : 'text-white/50 hover:text-white hover:bg-midnight-600'
                      )}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset List */}
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 p-4 border-b border-midnight-600/50 transition-colors text-left',
                      selectedAssetId === asset.id
                        ? 'bg-electric-cyan/10 border-l-2 border-l-electric-cyan'
                        : 'hover:bg-midnight-700/50'
                    )}
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                      asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                      asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                      asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                    )}>
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-white/50 truncate">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-white">
                        ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className={clsx(
                        'flex items-center justify-end gap-1 text-xs font-mono',
                        asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                      )}>
                        {asset.changePercent24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Asset Detail */}
          <div className="lg:col-span-2">
            {selectedAsset ? (
              <AssetDetail asset={selectedAsset} />
            ) : (
              <div className="panel p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-midnight-700 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Select an Asset</h3>
                <p className="text-white/50">Choose an asset from the list to view detailed research and analytics</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

