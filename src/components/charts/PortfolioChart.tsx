'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { generatePortfolioHistory } from '@/data/mockData';
import { ChartData } from '@/types';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const timeRanges: { label: TimeRange; days: number }[] = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 730 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-xs text-white/60 mb-1">
          {label && format(parseISO(label), 'MMM d, yyyy')}
        </p>
        <p className="font-mono text-lg text-white">
          ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
}

export function PortfolioChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  
  const chartData = useMemo(() => {
    const days = timeRanges.find(t => t.label === timeRange)?.days || 90;
    return generatePortfolioHistory(days);
  }, [timeRange]);

  const { startValue, endValue, change, changePercent, isPositive } = useMemo(() => {
    if (chartData.length < 2) return { startValue: 0, endValue: 0, change: 0, changePercent: 0, isPositive: true };
    
    const start = chartData[0].value;
    const end = chartData[chartData.length - 1].value;
    const diff = end - start;
    const percent = (diff / start) * 100;
    
    return {
      startValue: start,
      endValue: end,
      change: diff,
      changePercent: percent,
      isPositive: diff >= 0,
    };
  }, [chartData]);

  const gradientColor = isPositive ? '#00ff88' : '#ff3366';
  const strokeColor = isPositive ? '#00ff88' : '#ff3366';

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-1">Portfolio Value</h3>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-white">
              ${endValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className={clsx(
              'font-mono text-sm',
              isPositive ? 'text-electric-green' : 'text-electric-red'
            )}>
              {isPositive ? '+' : ''}{change.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              {' '}({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-midnight-700 p-1 rounded-lg">
          {timeRanges.map(({ label }) => (
            <button
              key={label}
              onClick={() => setTimeRange(label)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                timeRange === label
                  ? 'bg-electric-cyan/20 text-electric-cyan'
                  : 'text-white/50 hover:text-white hover:bg-midnight-600'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => format(parseISO(value), 'MMM d')}
              minTickGap={40}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              animationDuration={750}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

