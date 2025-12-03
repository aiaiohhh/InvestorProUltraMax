'use client';

import { Asset } from '@/types';
import { technicalAnalysis } from '@/data/mockData';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Zap,
  BarChart3,
  Target,
  Gauge,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TechnicalAnalysisProps {
  asset: Asset;
}

const signalConfig = {
  strong_buy: { label: 'Strong Buy', color: 'text-electric-green', bg: 'bg-electric-green/20', value: 100 },
  buy: { label: 'Buy', color: 'text-electric-green/80', bg: 'bg-electric-green/15', value: 75 },
  neutral: { label: 'Neutral', color: 'text-white/60', bg: 'bg-white/10', value: 50 },
  sell: { label: 'Sell', color: 'text-electric-red/80', bg: 'bg-electric-red/15', value: 25 },
  strong_sell: { label: 'Strong Sell', color: 'text-electric-red', bg: 'bg-electric-red/20', value: 0 },
};

const indicatorSignalConfig = {
  buy: { label: 'Buy', color: 'text-electric-green', icon: ArrowUp },
  sell: { label: 'Sell', color: 'text-electric-red', icon: ArrowDown },
  hold: { label: 'Hold', color: 'text-white/60', icon: Minus },
};

const strengthConfig = {
  strong: { label: 'Strong', opacity: 1 },
  moderate: { label: 'Moderate', opacity: 0.7 },
  weak: { label: 'Weak', opacity: 0.4 },
};

export function TechnicalAnalysis({ asset }: TechnicalAnalysisProps) {
  const analysis = technicalAnalysis[asset.id];

  if (!analysis) {
    return (
      <div className="panel p-8 text-center">
        <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Technical Analysis Unavailable</h3>
        <p className="text-white/50 text-sm">Technical indicators for this asset are not yet available.</p>
      </div>
    );
  }

  const signal = signalConfig[analysis.overallSignal];
  const buySignals = analysis.indicators.filter(i => i.signal === 'buy').length;
  const sellSignals = analysis.indicators.filter(i => i.signal === 'sell').length;
  const holdSignals = analysis.indicators.filter(i => i.signal === 'hold').length;

  return (
    <div className="space-y-6">
      {/* Overall Signal Card */}
      <div className="panel overflow-hidden">
        <div className={clsx('p-6', signal.bg)}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-electric-purple" />
              <h3 className="text-lg font-semibold text-white">Technical Signal</h3>
            </div>
            <div className={clsx('px-4 py-2 rounded-full font-bold text-sm', signal.bg, signal.color)}>
              {signal.label}
            </div>
          </div>

          {/* Signal Meter */}
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-xs">
              <span className="text-electric-red font-medium">Strong Sell</span>
              <span className="text-white/50">Neutral</span>
              <span className="text-electric-green font-medium">Strong Buy</span>
            </div>
            <div className="relative h-6 bg-gradient-to-r from-electric-red via-white/20 to-electric-green rounded-full overflow-hidden">
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${signal.value}%` }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                className="absolute top-1/2 -translate-y-1/2"
              >
                <div className="w-8 h-8 -ml-4 rounded-full bg-midnight-900 border-4 border-white shadow-lg 
                              flex items-center justify-center">
                  <div className={clsx('w-3 h-3 rounded-full', 
                    analysis.overallSignal.includes('buy') ? 'bg-electric-green' : 
                    analysis.overallSignal.includes('sell') ? 'bg-electric-red' : 'bg-white/50'
                  )} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Signal Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-midnight-700/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowUp className="w-4 h-4 text-electric-green" />
                <span className="text-lg font-bold text-electric-green">{buySignals}</span>
              </div>
              <span className="text-xs text-white/50">Buy Signals</span>
            </div>
            <div className="bg-midnight-700/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Minus className="w-4 h-4 text-white/50" />
                <span className="text-lg font-bold text-white/60">{holdSignals}</span>
              </div>
              <span className="text-xs text-white/50">Hold Signals</span>
            </div>
            <div className="bg-midnight-700/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowDown className="w-4 h-4 text-electric-red" />
                <span className="text-lg font-bold text-electric-red">{sellSignals}</span>
              </div>
              <span className="text-xs text-white/50">Sell Signals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend & Momentum */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className={clsx(
              'w-4 h-4',
              analysis.trendDirection === 'uptrend' && 'text-electric-green',
              analysis.trendDirection === 'downtrend' && 'text-electric-red',
              analysis.trendDirection === 'sideways' && 'text-electric-orange'
            )} />
            <span className="text-xs text-white/50">Trend Direction</span>
          </div>
          <div className={clsx(
            'font-medium capitalize',
            analysis.trendDirection === 'uptrend' && 'text-electric-green',
            analysis.trendDirection === 'downtrend' && 'text-electric-red',
            analysis.trendDirection === 'sideways' && 'text-electric-orange'
          )}>
            {analysis.trendDirection}
          </div>
        </div>
        
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-electric-purple" />
            <span className="text-xs text-white/50">Volatility</span>
          </div>
          <div className={clsx(
            'font-medium capitalize',
            analysis.volatility === 'high' && 'text-electric-red',
            analysis.volatility === 'medium' && 'text-electric-orange',
            analysis.volatility === 'low' && 'text-electric-green'
          )}>
            {analysis.volatility}
          </div>
        </div>
        
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-electric-cyan" />
            <span className="text-xs text-white/50">Momentum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-midnight-600 rounded-full overflow-hidden">
              <div 
                className={clsx(
                  'h-full rounded-full transition-all',
                  analysis.momentum >= 0 ? 'bg-electric-green' : 'bg-electric-red'
                )}
                style={{ 
                  width: `${Math.abs(analysis.momentum)}%`,
                  marginLeft: analysis.momentum < 0 ? `${100 - Math.abs(analysis.momentum)}%` : 0 
                }}
              />
            </div>
            <span className={clsx(
              'font-mono text-sm',
              analysis.momentum >= 0 ? 'text-electric-green' : 'text-electric-red'
            )}>
              {analysis.momentum >= 0 ? '+' : ''}{analysis.momentum}
            </span>
          </div>
        </div>
      </div>

      {/* Support & Resistance */}
      <div className="panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-electric-orange" />
          <h3 className="text-lg font-semibold text-white">Support & Resistance Levels</h3>
        </div>
        
        <div className="relative py-8">
          {/* Price scale visualization */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/20" />
          
          {/* Current price marker */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <div className="flex flex-col items-center">
              <div className="bg-electric-cyan text-midnight-900 px-3 py-1 rounded font-mono text-sm font-bold">
                ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="w-0.5 h-6 bg-electric-cyan" />
              <div className="w-3 h-3 rounded-full bg-electric-cyan border-2 border-midnight-900" />
            </div>
          </div>
          
          {/* Support levels */}
          <div className="flex justify-start gap-4 mb-8">
            {analysis.supportLevels.map((level, idx) => (
              <motion.div
                key={`support-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-3 h-3 rounded-full bg-electric-green border-2 border-midnight-900" />
                <div className="w-0.5 h-4 bg-electric-green/50" />
                <div className="bg-electric-green/20 text-electric-green px-2 py-1 rounded font-mono text-xs">
                  ${level.toLocaleString()}
                </div>
                <span className="text-[10px] text-white/40 mt-1">S{idx + 1}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Resistance levels */}
          <div className="flex justify-end gap-4 mt-8">
            {analysis.resistanceLevels.map((level, idx) => (
              <motion.div
                key={`resistance-${idx}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-[10px] text-white/40 mb-1">R{idx + 1}</span>
                <div className="bg-electric-red/20 text-electric-red px-2 py-1 rounded font-mono text-xs">
                  ${level.toLocaleString()}
                </div>
                <div className="w-0.5 h-4 bg-electric-red/50" />
                <div className="w-3 h-3 rounded-full bg-electric-red border-2 border-midnight-900" />
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-xs text-white/50 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-electric-green" />
            <span>Support Levels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-electric-cyan" />
            <span>Current Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-electric-red" />
            <span>Resistance Levels</span>
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="panel">
        <div className="p-4 border-b border-midnight-500/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-electric-cyan" />
            <h3 className="text-lg font-semibold text-white">Technical Indicators</h3>
          </div>
        </div>
        
        <div className="divide-y divide-midnight-600/50">
          {analysis.indicators.map((indicator, idx) => {
            const signalConf = indicatorSignalConfig[indicator.signal];
            const strengthConf = strengthConfig[indicator.strength];
            const SignalIcon = signalConf.icon;
            
            return (
              <motion.div
                key={indicator.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 hover:bg-midnight-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-white">{indicator.name}</h4>
                      <span className="font-mono text-sm text-white/70">
                        {typeof indicator.value === 'number' && indicator.value % 1 !== 0 
                          ? indicator.value.toFixed(2) 
                          : indicator.value}
                      </span>
                    </div>
                    {indicator.description && (
                      <p className="text-xs text-white/50 mt-1">{indicator.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded',
                      'bg-midnight-600 text-white/60'
                    )} style={{ opacity: strengthConf.opacity }}>
                      {strengthConf.label}
                    </span>
                    
                    <div className={clsx(
                      'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                      indicator.signal === 'buy' && 'bg-electric-green/20 text-electric-green',
                      indicator.signal === 'sell' && 'bg-electric-red/20 text-electric-red',
                      indicator.signal === 'hold' && 'bg-white/10 text-white/60'
                    )}>
                      <SignalIcon className="w-3 h-3" />
                      {signalConf.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

