'use client';

import { ExpertPrediction, Asset } from '@/types';
import { expertPredictions } from '@/data/mockData';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus, Target, Calendar, Shield, User, ChevronRight, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface ExpertPredictionsProps {
  asset: Asset;
}

const sentimentConfig = {
  strongly_bullish: { label: 'Strongly Bullish', color: 'text-electric-green', bg: 'bg-electric-green/20', icon: TrendingUp, value: 100 },
  bullish: { label: 'Bullish', color: 'text-electric-green/80', bg: 'bg-electric-green/15', icon: TrendingUp, value: 75 },
  neutral: { label: 'Neutral', color: 'text-white/60', bg: 'bg-white/10', icon: Minus, value: 50 },
  bearish: { label: 'Bearish', color: 'text-electric-red/80', bg: 'bg-electric-red/15', icon: TrendingDown, value: 25 },
  strongly_bearish: { label: 'Strongly Bearish', color: 'text-electric-red', bg: 'bg-electric-red/20', icon: TrendingDown, value: 0 },
};

const categoryLabels = {
  value_investor: 'Value Investor',
  growth_investor: 'Growth Investor',
  contrarian: 'Contrarian',
  technical_analyst: 'Technical Analyst',
  quant: 'Quantitative',
  macro_strategist: 'Macro Strategist',
};

export function ExpertPredictions({ asset }: ExpertPredictionsProps) {
  const predictions = expertPredictions.filter(p => p.assetId === asset.id);
  
  // Calculate consensus
  const consensus = useMemo(() => {
    if (predictions.length === 0) return null;
    
    const avgSentiment = predictions.reduce((sum, p) => {
      return sum + sentimentConfig[p.sentiment].value;
    }, 0) / predictions.length;
    
    const avgPriceTarget = predictions.reduce((sum, p) => sum + p.priceTarget, 0) / predictions.length;
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    const bullishCount = predictions.filter(p => p.sentiment === 'bullish' || p.sentiment === 'strongly_bullish').length;
    const bearishCount = predictions.filter(p => p.sentiment === 'bearish' || p.sentiment === 'strongly_bearish').length;
    
    return {
      avgSentiment,
      avgPriceTarget,
      avgConfidence,
      bullishCount,
      bearishCount,
      neutralCount: predictions.length - bullishCount - bearishCount,
      upside: ((avgPriceTarget - asset.price) / asset.price) * 100,
    };
  }, [predictions, asset.price]);

  if (predictions.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <Brain className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Expert Predictions Available</h3>
        <p className="text-white/50 text-sm">Expert analysis for this asset is not yet available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consensus Summary */}
      {consensus && (
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-electric-purple" />
            <h3 className="text-lg font-semibold text-white">Expert Consensus</h3>
            <span className="text-xs text-white/40 ml-auto">{predictions.length} analysts</span>
          </div>

          {/* Sentiment Gauge */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-electric-red font-medium">Bearish</span>
              <span className="text-sm text-white/60">Neutral</span>
              <span className="text-sm text-electric-green font-medium">Bullish</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-electric-red via-white/20 to-electric-green rounded-full overflow-hidden">
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${consensus.avgSentiment}%` }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 -ml-3"
              >
                <div className="w-6 h-6 rounded-full bg-white border-2 border-midnight-900 shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-electric-cyan to-electric-purple" />
                </div>
              </motion.div>
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-electric-red" />
                <span className="text-xs text-white/50">{consensus.bearishCount} bearish</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-xs text-white/50">{consensus.neutralCount} neutral</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-electric-green" />
                <span className="text-xs text-white/50">{consensus.bullishCount} bullish</span>
              </div>
            </div>
          </div>

          {/* Price Target Distribution */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-midnight-700/50 rounded-lg p-4">
              <div className="text-xs text-white/50 mb-1">Current Price</div>
              <div className="font-mono text-lg text-white">
                ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-midnight-700/50 rounded-lg p-4">
              <div className="text-xs text-white/50 mb-1">Avg Target</div>
              <div className="font-mono text-lg text-electric-cyan">
                ${consensus.avgPriceTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-midnight-700/50 rounded-lg p-4">
              <div className="text-xs text-white/50 mb-1">Implied Upside</div>
              <div className={clsx(
                'font-mono text-lg',
                consensus.upside >= 0 ? 'text-electric-green' : 'text-electric-red'
              )}>
                {consensus.upside >= 0 ? '+' : ''}{consensus.upside.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Price Target Range Visualization */}
          <div className="mt-6">
            <div className="text-xs text-white/50 mb-3">Price Target Range</div>
            <div className="relative h-12 bg-midnight-700/50 rounded-lg overflow-hidden">
              {/* Current price line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
                style={{ 
                  left: `${Math.max(0, Math.min(100, ((asset.price - Math.min(...predictions.map(p => p.priceTarget))) / 
                    (Math.max(...predictions.map(p => p.priceTarget)) - Math.min(...predictions.map(p => p.priceTarget)))) * 100))}%` 
                }}
              />
              
              {/* Prediction dots */}
              {predictions.map((pred, idx) => {
                const minPrice = Math.min(...predictions.map(p => p.priceTarget)) * 0.9;
                const maxPrice = Math.max(...predictions.map(p => p.priceTarget)) * 1.1;
                const position = ((pred.priceTarget - minPrice) / (maxPrice - minPrice)) * 100;
                const config = sentimentConfig[pred.sentiment];
                
                return (
                  <motion.div
                    key={pred.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${position}%` }}
                  >
                    <div className={clsx(
                      'w-4 h-4 -ml-2 rounded-full border-2 border-midnight-900 transition-transform hover:scale-150',
                      config.bg
                    )} />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 
                                    transition-opacity pointer-events-none z-20">
                      <div className="bg-midnight-700 border border-midnight-500 rounded-lg p-2 text-xs whitespace-nowrap">
                        <div className="font-medium text-white">{pred.expertName}</div>
                        <div className={clsx('font-mono', config.color)}>
                          ${pred.priceTarget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-white/40 font-mono">
                ${Math.min(...predictions.map(p => p.priceTarget)).toLocaleString()}
              </span>
              <span className="text-xs text-white/40 font-mono">
                ${Math.max(...predictions.map(p => p.priceTarget)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Individual Predictions */}
      <div className="panel">
        <div className="p-4 border-b border-midnight-500/50">
          <h3 className="text-lg font-semibold text-white">Expert Analysis</h3>
        </div>
        <div className="divide-y divide-midnight-600/50">
          {predictions.map((pred) => {
            const config = sentimentConfig[pred.sentiment];
            const Icon = config.icon;
            const upside = ((pred.priceTarget - asset.price) / asset.price) * 100;
            
            return (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 hover:bg-midnight-700/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Expert Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-cyan/20 to-electric-purple/20 
                                  flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {pred.avatarUrl ? (
                      <img 
                        src={pred.avatarUrl} 
                        alt={pred.expertName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white/50" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{pred.expertName}</h4>
                        <p className="text-xs text-white/50">{pred.expertTitle} • {pred.expertFirm}</p>
                      </div>
                      <div className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{pred.rationale}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-electric-cyan" />
                        <span className="text-white/50">Target:</span>
                        <span className="font-mono text-white">${pred.priceTarget.toLocaleString()}</span>
                        <span className={clsx('font-mono', upside >= 0 ? 'text-electric-green' : 'text-electric-red')}>
                          ({upside >= 0 ? '+' : ''}{upside.toFixed(1)}%)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-electric-purple" />
                        <span className="text-white/50">Confidence:</span>
                        <span className="font-mono text-white">{pred.confidence}%</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-electric-orange" />
                        <span className="text-white/50">Target Date:</span>
                        <span className="text-white">{format(new Date(pred.targetDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className={clsx(
                        'inline-block px-2 py-0.5 rounded text-xs',
                        'bg-midnight-600 text-white/60'
                      )}>
                        {categoryLabels[pred.expertCategory]}
                      </span>
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

