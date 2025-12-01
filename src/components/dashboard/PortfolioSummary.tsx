'use client';

import { useStore } from '@/store/useStore';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'red' | 'purple' | 'orange';
}

function StatCard({ title, value, change, isPositive, icon, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'from-electric-cyan/20 to-electric-cyan/5 border-electric-cyan/30',
    green: 'from-electric-green/20 to-electric-green/5 border-electric-green/30',
    red: 'from-electric-red/20 to-electric-red/5 border-electric-red/30',
    purple: 'from-electric-purple/20 to-electric-purple/5 border-electric-purple/30',
    orange: 'from-electric-orange/20 to-electric-orange/5 border-electric-orange/30',
  };

  const iconColorClasses = {
    cyan: 'text-electric-cyan',
    green: 'text-electric-green',
    red: 'text-electric-red',
    purple: 'text-electric-purple',
    orange: 'text-electric-orange',
  };

  return (
    <div className={clsx(
      'relative p-5 rounded-xl border bg-gradient-to-br overflow-hidden',
      colorClasses[color]
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }} />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm text-white/60">{title}</span>
          <div className={clsx('p-2 rounded-lg bg-midnight-800/50', iconColorClasses[color])}>
            {icon}
          </div>
        </div>
        
        <div className="font-display text-2xl font-bold text-white mb-1">
          {value}
        </div>
        
        {change && (
          <div className={clsx(
            'flex items-center gap-1 text-sm font-mono',
            isPositive ? 'text-electric-green' : 'text-electric-red'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
}

export function PortfolioSummary() {
  const { portfolio } = useStore();

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const stats: StatCardProps[] = [
    {
      title: 'Total Value',
      value: formatCurrency(portfolio.totalValue),
      change: `${portfolio.dayChangePercent >= 0 ? '+' : ''}${portfolio.dayChangePercent.toFixed(2)}% today`,
      isPositive: portfolio.dayChangePercent >= 0,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'cyan',
    },
    {
      title: 'Total Profit/Loss',
      value: formatCurrency(portfolio.totalProfitLoss),
      change: `${portfolio.totalProfitLossPercent >= 0 ? '+' : ''}${portfolio.totalProfitLossPercent.toFixed(2)}%`,
      isPositive: portfolio.totalProfitLoss >= 0,
      icon: portfolio.totalProfitLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      color: portfolio.totalProfitLoss >= 0 ? 'green' : 'red',
    },
    {
      title: "Today's Change",
      value: formatCurrency(portfolio.dayChange),
      change: `${portfolio.dayChangePercent >= 0 ? '+' : ''}${portfolio.dayChangePercent.toFixed(2)}%`,
      isPositive: portfolio.dayChange >= 0,
      icon: <Activity className="w-5 h-5" />,
      color: portfolio.dayChange >= 0 ? 'green' : 'red',
    },
    {
      title: 'Total Invested',
      value: formatCurrency(portfolio.totalCost),
      icon: <Percent className="w-5 h-5" />,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

