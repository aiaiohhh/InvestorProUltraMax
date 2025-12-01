'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';

const COLORS = {
  stock: ['#00d9ff', '#0099cc', '#006699', '#003366'],
  crypto: ['#ff9500', '#cc7700', '#995500', '#663300'],
  etf: ['#a855f7', '#8844cc', '#663399', '#442266'],
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; percent: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="text-sm font-medium text-white mb-1">{data.name}</p>
        <p className="font-mono text-white/80">
          ${data.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-white/50">{data.percent.toFixed(1)}% of portfolio</p>
      </div>
    );
  }
  return null;
}

export function AllocationChart() {
  const { portfolio } = useStore();

  const { assetAllocation, typeAllocation } = useMemo(() => {
    // By asset
    const assetData = portfolio.holdings.map((h, i) => ({
      name: h.asset.symbol,
      value: h.currentValue,
      percent: (h.currentValue / portfolio.totalValue) * 100,
      type: h.asset.type,
    }));

    // By type
    const typeGroups: Record<string, number> = {};
    portfolio.holdings.forEach(h => {
      typeGroups[h.asset.type] = (typeGroups[h.asset.type] || 0) + h.currentValue;
    });

    const typeData = Object.entries(typeGroups).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value,
      percent: (value / portfolio.totalValue) * 100,
      type: type as 'stock' | 'crypto' | 'etf',
    }));

    return { assetAllocation: assetData, typeAllocation: typeData };
  }, [portfolio]);

  const getColor = (type: string, index: number) => {
    const colorSet = COLORS[type as keyof typeof COLORS] || COLORS.stock;
    return colorSet[index % colorSet.length];
  };

  return (
    <div className="panel p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* By Type */}
        <div>
          <p className="text-xs text-white/50 mb-3 text-center">By Type</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeAllocation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.type, 0)}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {typeAllocation.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: getColor(item.type, 0) }}
                />
                <span className="text-xs text-white/70">{item.name}</span>
                <span className="text-xs font-mono text-white/50">{item.percent.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Asset */}
        <div>
          <p className="text-xs text-white/50 mb-3 text-center">By Asset</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.type, index)}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {assetAllocation.slice(0, 5).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: getColor(item.type, i) }}
                />
                <span className="text-xs text-white/70">{item.name}</span>
              </div>
            ))}
            {assetAllocation.length > 5 && (
              <span className="text-xs text-white/40">+{assetAllocation.length - 5} more</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

