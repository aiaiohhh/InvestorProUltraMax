'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ArrowUpDown, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { Holding } from '@/types';

type SortField = 'symbol' | 'value' | 'profitLoss' | 'profitLossPercent' | 'quantity';
type SortOrder = 'asc' | 'desc';

export function HoldingsTable() {
  const { portfolio } = useStore();
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedHoldings = [...portfolio.holdings].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'symbol':
        aVal = a.asset.symbol;
        bVal = b.asset.symbol;
        break;
      case 'value':
        aVal = a.currentValue;
        bVal = b.currentValue;
        break;
      case 'profitLoss':
        aVal = a.profitLoss;
        bVal = b.profitLoss;
        break;
      case 'profitLossPercent':
        aVal = a.profitLossPercent;
        bVal = b.profitLossPercent;
        break;
      case 'quantity':
        aVal = a.quantity;
        bVal = b.quantity;
        break;
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
  });

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
    <div className="panel overflow-hidden">
      <div className="px-6 py-4 border-b border-midnight-500/50">
        <h3 className="text-lg font-semibold text-white">Holdings</h3>
        <p className="text-sm text-white/50">{portfolio.holdings.length} assets</p>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="bg-midnight-700/30">
              <th className="w-[200px]">
                <SortHeader field="symbol">Asset</SortHeader>
              </th>
              <th>
                <SortHeader field="quantity">Quantity</SortHeader>
              </th>
              <th>Price</th>
              <th>Avg Cost</th>
              <th>
                <SortHeader field="value">Value</SortHeader>
              </th>
              <th>
                <SortHeader field="profitLoss">P/L</SortHeader>
              </th>
              <th>
                <SortHeader field="profitLossPercent">P/L %</SortHeader>
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((holding) => (
              <HoldingRow key={holding.id} holding={holding} totalValue={portfolio.totalValue} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HoldingRow({ holding, totalValue }: { holding: Holding; totalValue: number }) {
  const allocation = (holding.currentValue / totalValue) * 100;
  const isPositive = holding.profitLoss >= 0;

  return (
    <tr className="group">
      <td>
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
            holding.asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
            holding.asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
            holding.asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
          )}>
            {holding.asset.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="font-medium text-white">{holding.asset.symbol}</div>
            <div className="text-xs text-white/50">{holding.asset.name}</div>
          </div>
        </div>
      </td>
      <td>
        <span className="font-mono text-white">
          {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </span>
      </td>
      <td>
        <div className="font-mono text-white">
          ${holding.asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className={clsx(
          'text-xs font-mono',
          holding.asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
        )}>
          {holding.asset.changePercent24h >= 0 ? '+' : ''}{holding.asset.changePercent24h.toFixed(2)}%
        </div>
      </td>
      <td>
        <span className="font-mono text-white/70">
          ${holding.averageCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </td>
      <td>
        <div className="font-mono text-white font-medium">
          ${holding.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-white/50">{allocation.toFixed(1)}% of portfolio</div>
      </td>
      <td>
        <div className={clsx(
          'flex items-center gap-1 font-mono',
          isPositive ? 'text-electric-green' : 'text-electric-red'
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}${holding.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      </td>
      <td>
        <div className={clsx(
          'inline-flex items-center px-2 py-1 rounded-md font-mono text-sm',
          isPositive ? 'bg-electric-green/10 text-electric-green' : 'bg-electric-red/10 text-electric-red'
        )}>
          {isPositive ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
        </div>
      </td>
      <td>
        <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-midnight-600 
                           opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

