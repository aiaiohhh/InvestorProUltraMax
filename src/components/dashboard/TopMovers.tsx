'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

export function TopMovers() {
  const { assets } = useStore();

  const { gainers, losers } = useMemo(() => {
    const sorted = [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h);
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [assets]);

  return (
    <div className="panel">
      <div className="px-6 py-4 border-b border-midnight-500/50">
        <h3 className="text-lg font-semibold text-white">Top Movers</h3>
        <p className="text-sm text-white/50">24h price change</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-midnight-500/50">
        {/* Gainers */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-electric-green/10">
              <TrendingUp className="w-4 h-4 text-electric-green" />
            </div>
            <span className="text-sm font-medium text-electric-green">Top Gainers</span>
          </div>
          
          <div className="space-y-3">
            {gainers.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                    asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                    asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                  )}>
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{asset.symbol}</div>
                    <div className="text-xs text-white/40 truncate max-w-[80px]">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white">
                    ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-mono text-electric-green">
                    +{asset.changePercent24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-electric-red/10">
              <TrendingDown className="w-4 h-4 text-electric-red" />
            </div>
            <span className="text-sm font-medium text-electric-red">Top Losers</span>
          </div>
          
          <div className="space-y-3">
            {losers.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                    asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                    asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                  )}>
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{asset.symbol}</div>
                    <div className="text-xs text-white/40 truncate max-w-[80px]">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white">
                    ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-mono text-electric-red">
                    {asset.changePercent24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

