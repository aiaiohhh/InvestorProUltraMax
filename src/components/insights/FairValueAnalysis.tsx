'use client';

import { Asset } from '@/types';
import { fairValueAnalysis, aiInsights } from '@/data/mockData';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  Scale,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useMemo } from 'react';

interface FairValueAnalysisProps {
  asset: Asset;
}

const methodologyLabels = {
  dcf: 'Discounted Cash Flow',
  comparables: 'Comparable Analysis',
  asset_based: 'Asset-Based',
  hybrid: 'Hybrid Model',
};

const confidenceColors = {
  high: 'text-electric-green',
  medium: 'text-electric-orange',
  low: 'text-electric-red',
};

export function FairValueAnalysis({ asset }: FairValueAnalysisProps) {
  const analysis = fairValueAnalysis[asset.id];
  const insights = aiInsights[asset.id] || [];
  const fairValueInsight = insights.find(i => i.type === 'fair_value');

  if (!analysis) {
    return (
      <div className="panel p-8 text-center">
        <Calculator className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Fair Value Analysis Unavailable</h3>
        <p className="text-white/50 text-sm">Valuation analysis for this asset is not yet available.</p>
      </div>
    );
  }

  const isUndervalued = analysis.upside > 5;
  const isOvervalued = analysis.upside < -5;
  const isFairlyValued = !isUndervalued && !isOvervalued;

  return (
    <div className="space-y-6">
      {/* Main Value Card */}
      <div className="panel overflow-hidden">
        {/* Header with Gradient */}
        <div className={clsx(
          'p-6 relative',
          isUndervalued && 'bg-gradient-to-r from-electric-green/10 to-transparent',
          isOvervalued && 'bg-gradient-to-r from-electric-red/10 to-transparent',
          isFairlyValued && 'bg-gradient-to-r from-electric-cyan/10 to-transparent'
        )}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Scale className={clsx(
                  'w-5 h-5',
                  isUndervalued && 'text-electric-green',
                  isOvervalued && 'text-electric-red',
                  isFairlyValued && 'text-electric-cyan'
                )} />
                <h3 className="text-lg font-semibold text-white">AI Fair Value Analysis</h3>
              </div>
              <p className="text-sm text-white/50">{methodologyLabels[analysis.methodology]} Model</p>
            </div>
            
            <div className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1',
              isUndervalued && 'bg-electric-green/20 text-electric-green',
              isOvervalued && 'bg-electric-red/20 text-electric-red',
              isFairlyValued && 'bg-electric-cyan/20 text-electric-cyan'
            )}>
              {isUndervalued && <><ArrowUpRight className="w-3 h-3" /> Undervalued</>}
              {isOvervalued && <><ArrowDownRight className="w-3 h-3" /> Overvalued</>}
              {isFairlyValued && <><CheckCircle2 className="w-3 h-3" /> Fairly Valued</>}
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-0">
          {/* Value Comparison */}
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <div className="text-xs text-white/50 mb-2">Current Price</div>
              <div className="font-display text-3xl font-bold text-white">
                ${analysis.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ChevronRight className={clsx(
                'w-8 h-8',
                isUndervalued && 'text-electric-green',
                isOvervalued && 'text-electric-red',
                isFairlyValued && 'text-electric-cyan'
              )} />
              <div className={clsx(
                'font-mono text-sm font-bold',
                analysis.upside >= 0 ? 'text-electric-green' : 'text-electric-red'
              )}>
                {analysis.upside >= 0 ? '+' : ''}{analysis.upside.toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-white/50 mb-2">Fair Value</div>
              <div className={clsx(
                'font-display text-3xl font-bold',
                isUndervalued && 'text-electric-green',
                isOvervalued && 'text-electric-red',
                isFairlyValued && 'text-electric-cyan'
              )}>
                ${analysis.fairValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          
          {/* Value Gauge */}
          <div className="relative h-6 bg-midnight-700 rounded-full overflow-hidden mb-4">
            {/* Undervalued zone */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-electric-green/20" />
            {/* Fair value zone */}
            <div className="absolute left-1/3 top-0 bottom-0 w-1/3 bg-electric-cyan/20" />
            {/* Overvalued zone */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-electric-red/20" />
            
            {/* Current position indicator */}
            <motion.div
              initial={{ left: '50%' }}
              animate={{ 
                left: `${Math.max(5, Math.min(95, 50 - analysis.upside))}%` 
              }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute top-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-4 h-4 -ml-2 rounded-full bg-white border-2 border-midnight-900 shadow-lg" />
            </motion.div>
            
            {/* Fair value line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 -translate-x-1/2" />
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-electric-green">Undervalued</span>
            <span className="text-electric-cyan">Fair Value</span>
            <span className="text-electric-red">Overvalued</span>
          </div>
          
          {/* Confidence Indicator */}
          <div className="mt-6 flex items-center justify-between bg-midnight-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white/70">Model Confidence</span>
            </div>
            <div className={clsx('font-medium', confidenceColors[analysis.confidenceLevel])}>
              {analysis.confidenceLevel.charAt(0).toUpperCase() + analysis.confidenceLevel.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Valuation Models Breakdown */}
      <div className="panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-electric-purple" />
          <h3 className="text-lg font-semibold text-white">Valuation Models</h3>
        </div>
        
        <div className="space-y-4">
          {analysis.models.map((model, idx) => {
            const modelUpside = ((model.value - analysis.currentPrice) / analysis.currentPrice) * 100;
            
            return (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-midnight-700/50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{model.name}</h4>
                    <p className="text-xs text-white/50">{model.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg text-white">
                      ${model.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className={clsx(
                      'text-xs font-mono',
                      modelUpside >= 0 ? 'text-electric-green' : 'text-electric-red'
                    )}>
                      {modelUpside >= 0 ? '+' : ''}{modelUpside.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Weight indicator */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-midnight-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${model.weight * 100}%` }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                      className="h-full bg-gradient-to-r from-electric-cyan to-electric-purple rounded-full"
                    />
                  </div>
                  <span className="text-xs text-white/50 font-mono w-12 text-right">
                    {(model.weight * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Insight Factors */}
      {fairValueInsight?.factors && (
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-electric-orange" />
            <h3 className="text-lg font-semibold text-white">Key Value Drivers</h3>
          </div>
          
          <div className="space-y-3">
            {fairValueInsight.factors.map((factor, idx) => (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-3 bg-midnight-700/30 rounded-lg"
              >
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  factor.impact === 'positive' && 'bg-electric-green/20 text-electric-green',
                  factor.impact === 'negative' && 'bg-electric-red/20 text-electric-red',
                  factor.impact === 'neutral' && 'bg-white/10 text-white/50'
                )}>
                  {factor.impact === 'positive' && <TrendingUp className="w-4 h-4" />}
                  {factor.impact === 'negative' && <TrendingDown className="w-4 h-4" />}
                  {factor.impact === 'neutral' && <Info className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white">{factor.name}</h4>
                    <span className={clsx(
                      'text-sm font-mono',
                      factor.value > 0 && factor.impact === 'positive' && 'text-electric-green',
                      factor.value < 0 && factor.impact === 'negative' && 'text-electric-red',
                      factor.impact === 'neutral' && 'text-white/60'
                    )}>
                      {factor.value > 0 ? '+' : ''}{factor.value}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{factor.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* AI Confidence Score */}
          <div className="mt-6 p-4 bg-gradient-to-r from-electric-purple/10 to-electric-cyan/10 rounded-lg border border-electric-purple/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-electric-purple" />
                <span className="text-sm text-white">AI Model Confidence</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-midnight-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fairValueInsight.confidence}%` }}
                    className="h-full bg-gradient-to-r from-electric-purple to-electric-cyan rounded-full"
                  />
                </div>
                <span className="font-mono text-sm text-white">{fairValueInsight.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

