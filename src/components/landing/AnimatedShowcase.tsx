'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Brain, Zap, BarChart3, Bell, LineChart, Info, MousePointerClick } from 'lucide-react';
import { clsx } from 'clsx';

interface Showcase {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  component: React.ComponentType;
}

// Dashboard Overview Animation
function DashboardOverview() {
  const [portfolioValue, setPortfolioValue] = useState(125000);
  const [change, setChange] = useState(2.34);
  const [chartData, setChartData] = useState<number[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    // Animate portfolio value
    const interval = setInterval(() => {
      setPortfolioValue(prev => {
        const variation = (Math.random() - 0.5) * 500;
        return Math.max(120000, Math.min(130000, prev + variation));
      });
      setChange(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 2000);

    // Generate chart data
    const data: number[] = [];
    for (let i = 0; i < 30; i++) {
      data.push(30 + Math.sin(i * 0.3) * 20 + Math.random() * 10);
    }
    setChartData(data);

    return () => clearInterval(interval);
  }, []);

  const holdings = [
    { name: 'AAPL', value: 45000, change: 1.2, color: 'from-electric-cyan to-electric-cyan/50' },
    { name: 'TSLA', value: 32000, change: -0.8, color: 'from-electric-orange to-electric-orange/50' },
    { name: 'MSFT', value: 28000, change: 2.1, color: 'from-electric-purple to-electric-purple/50' },
    { name: 'GOOGL', value: 20000, change: 0.5, color: 'from-electric-green to-electric-green/50' },
  ];

  return (
    <div className="h-full p-8 bg-midnight-900 rounded-xl">
      <div className="h-full flex flex-col gap-6">
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-4">
          {holdings.map((holding, i) => (
            <motion.div
              key={holding.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 cursor-pointer group"
            >
              <div className="text-xs text-white/50 mb-1">{holding.name}</div>
              <div className="text-lg font-bold text-white mb-1">
                ${(holding.value / 1000).toFixed(0)}k
              </div>
              <div className={clsx(
                'text-xs flex items-center gap-1',
                holding.change >= 0 ? 'text-electric-green' : 'text-electric-red'
              )}>
                {holding.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(holding.change).toFixed(2)}%
              </div>
              <div className={clsx(
                'h-1 mt-2 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity',
                holding.color
              )} />
            </motion.div>
          ))}
        </div>

        {/* Main Chart and Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Portfolio Value Chart - Takes 2 columns */}
          <div className="lg:col-span-2 bg-midnight-800 rounded-xl p-6 border border-midnight-500/30 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <div className="text-sm text-white/50 mb-1">Total Portfolio Value</div>
                <motion.div
                  key={portfolioValue}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-white"
                >
                  ${(portfolioValue / 1000).toFixed(1)}k
                </motion.div>
                <motion.div
                  key={change}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={clsx(
                    'text-sm flex items-center gap-1 mt-1',
                    change >= 0 ? 'text-electric-green' : 'text-electric-red'
                  )}
                >
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                </motion.div>
              </div>
              <div className="text-xs text-white/40 flex items-center gap-1">
                <MousePointerClick className="w-3 h-3" />
                Hover bars for details
              </div>
            </div>
            <div className="flex-1 flex items-end gap-1 relative pt-4" style={{ minHeight: '180px', maxHeight: '220px' }}>
              {chartData.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col items-center justify-end relative"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-midnight-700/95 backdrop-blur-sm px-2 py-1.5 rounded-lg text-xs text-white whitespace-nowrap shadow-lg z-20 border border-midnight-500/50"
                    >
                      Day {i + 1}: ${(portfolioValue * (value / 100)).toFixed(0)}
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={clsx(
                      'w-full bg-gradient-to-t from-electric-cyan to-electric-cyan/30 rounded-t cursor-pointer transition-all min-h-[2px]',
                      hoveredBar === i ? 'from-electric-green to-electric-green/50 ring-2 ring-electric-green/50' : ''
                    )}
                    style={{ maxHeight: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="flex flex-col gap-4">
            {/* Navigation */}
            <div className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 flex-shrink-0">
              <div className="text-xs text-white/50 mb-2">Navigation</div>
              <div className="space-y-2">
                {['Dashboard', 'Portfolio', 'Research', 'Alerts'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(0, 217, 255, 0.1)' }}
                    className="h-8 bg-midnight-700 rounded-lg flex items-center px-3 cursor-pointer transition-colors"
                  >
                    <span className="text-xs text-white/70">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity with Chart */}
            <div className="flex-1 bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 flex flex-col min-h-[200px]">
              <div className="text-sm text-white/50 mb-3 flex-shrink-0">Recent Activity</div>
              
              {/* Activity Chart */}
              <div className="flex-1 flex items-end gap-1 mb-4 min-h-[100px] max-h-[120px]">
                {chartData.slice(0, 10).map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${value * 0.6}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-electric-cyan/60 to-electric-cyan/20 rounded-t min-h-[2px]"
                    style={{ maxHeight: '100%' }}
                  />
                ))}
              </div>

              {/* Activity List */}
              <div className="space-y-2 flex-shrink-0">
                {['Trade executed', 'Alert triggered', 'Portfolio updated'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="h-6 bg-midnight-700 rounded flex items-center px-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-electric-cyan mr-2" />
                    <span className="text-xs text-white/60">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Insights Animation
function AIInsights() {
  const [insights, setInsights] = useState([
    { id: 1, text: 'Analyzing market patterns...', progress: 0 },
    { id: 2, text: 'Detecting trend anomalies...', progress: 0 },
    { id: 3, text: 'Calculating predictions...', progress: 0 },
  ]);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setInsights(prev => prev.map(insight => ({
        ...insight,
        progress: Math.min(100, insight.progress + Math.random() * 15),
      })));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Define meaningful node data based on neural network layers
  const nodeData = [
    // Input Layer (Column 1) - Market Data
    { layer: 'input', label: 'Price Data', value: '$178.45', change: '+2.3%', type: 'market' },
    { layer: 'input', label: 'Volume', value: '12.4M', change: '+15.2%', type: 'market' },
    { layer: 'input', label: 'Sentiment', value: 'Bullish', change: '+8.1%', type: 'market' },
    
    // Hidden Layer 1 (Column 2) - Pattern Recognition
    { layer: 'hidden', label: 'Trend Pattern', value: 'Uptrend', confidence: 87, type: 'analysis' },
    { layer: 'hidden', label: 'Volatility', value: '18.5%', confidence: 92, type: 'analysis' },
    { layer: 'hidden', label: 'Momentum', value: 'Strong', confidence: 79, type: 'analysis' },
    
    // Hidden Layer 2 (Column 3) - Feature Extraction
    { layer: 'hidden', label: 'Support Level', value: '$175.20', confidence: 85, type: 'technical' },
    { layer: 'hidden', label: 'Resistance', value: '$182.80', confidence: 88, type: 'technical' },
    { layer: 'hidden', label: 'RSI', value: '62.3', confidence: 91, type: 'technical' },
    
    // Output Layer (Column 4) - Predictions
    { layer: 'output', label: 'Price Target', value: '$185.50', confidence: 89, type: 'prediction' },
    { layer: 'output', label: 'Buy Signal', value: 'Strong', confidence: 94, type: 'prediction' },
    { layer: 'output', label: 'Risk Score', value: 'Low', confidence: 76, type: 'prediction' },
  ];

  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 20 + (i % 4) * 25,
    y: 20 + Math.floor(i / 4) * 30,
    active: Math.random() > 0.4,
    data: nodeData[i],
  }));

  return (
    <div className="h-full p-8 bg-midnight-900 rounded-xl">
      <div className="h-full flex flex-col gap-6">
        {/* Neural Network Visualization */}
        <div className="flex-1 bg-midnight-800 rounded-xl p-6 border border-midnight-500/30 relative overflow-hidden min-h-[250px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Layer Labels */}
            <div className="absolute top-2 left-0 right-0 flex justify-around text-[10px] text-white/30 font-mono z-10">
              <span>Input</span>
              <span>Hidden 1</span>
              <span>Hidden 2</span>
              <span>Output</span>
            </div>
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map((node, i) => {
                const nextNode = nodes[i + 1];
                if (nextNode && i % 4 !== 3) {
                  return (
                    <motion.line
                      key={`line-${i}`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${nextNode.x}%`}
                      y2={`${nextNode.y}%`}
                      stroke="#00d9ff"
                      strokeWidth="1"
                      opacity={0.2}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    />
                  );
                }
                return null;
              })}
            </svg>
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute rounded-full border-2 cursor-pointer group"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: '40px',
                  height: '40px',
                  marginLeft: '-20px',
                  marginTop: '-20px',
                  borderColor: node.active ? '#00d9ff' : '#30363d',
                  backgroundColor: node.active ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                }}
                animate={{
                  scale: node.active || hoveredNode === i ? [1, 1.3, 1] : 1,
                  opacity: node.active || hoveredNode === i ? [0.7, 1, 0.7] : 0.3,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                {/* Node inner indicator */}
                <div className={clsx(
                  'absolute inset-0 rounded-full flex items-center justify-center',
                  node.data?.layer === 'input' ? 'bg-electric-green/20' :
                  node.data?.layer === 'hidden' ? 'bg-electric-cyan/20' : 'bg-electric-purple/20'
                )}>
                  {hoveredNode === i && (
                    <div className={clsx(
                      'w-2 h-2 rounded-full',
                      node.data?.layer === 'input' ? 'bg-electric-green' :
                      node.data?.layer === 'hidden' ? 'bg-electric-cyan' : 'bg-electric-purple'
                    )} />
                  )}
                </div>
                
                {hoveredNode === i && node.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute -top-28 left-1/2 -translate-x-1/2 bg-midnight-700/95 backdrop-blur-sm px-3 py-2.5 rounded-lg text-xs text-white shadow-xl z-30 border border-midnight-500/50 min-w-[180px]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={clsx(
                        'w-2.5 h-2.5 rounded-full',
                        node.data.layer === 'input' ? 'bg-electric-green' :
                        node.data.layer === 'hidden' ? 'bg-electric-cyan' : 'bg-electric-purple'
                      )} />
                      <span className="font-semibold text-electric-cyan">{node.data.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-white/90 font-mono text-sm">{node.data.value}</div>
                      {node.data.change && (
                        <div className={clsx(
                          'text-xs flex items-center gap-1',
                          node.data.change.startsWith('+') ? 'text-electric-green' : 'text-electric-red'
                        )}>
                          {node.data.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {node.data.change}
                        </div>
                      )}
                      {node.data.confidence && (
                        <div className="text-xs text-white/60 flex items-center gap-1">
                          <span>Confidence:</span>
                          <span className="text-electric-cyan font-semibold">{node.data.confidence}%</span>
                        </div>
                      )}
                      <div className="text-[10px] text-white/40 mt-2 pt-1.5 border-t border-midnight-600 flex items-center gap-1">
                        <div className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          node.data.layer === 'input' ? 'bg-electric-green' :
                          node.data.layer === 'hidden' ? 'bg-electric-cyan' : 'bg-electric-purple'
                        )} />
                        {node.data.layer.charAt(0).toUpperCase() + node.data.layer.slice(1)} Layer • {node.data.type}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-white/40 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Hover over nodes to see AI analysis data
          </div>
        </div>

        {/* AI Processing Insights */}
        <div className="space-y-3">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              whileHover={{ scale: 1.02, x: 4 }}
              className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white">{insight.text}</div>
                <div className="text-xs text-electric-cyan font-mono">{Math.round(insight.progress)}%</div>
              </div>
              <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-electric-cyan to-electric-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${insight.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { symbol: 'AAPL', prediction: '+5.2%', confidence: 87 },
            { symbol: 'TSLA', prediction: '-2.1%', confidence: 72 },
            { symbol: 'MSFT', prediction: '+3.8%', confidence: 91 },
          ].map((pred, i) => (
            <motion.div
              key={pred.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 cursor-pointer group"
            >
              <div className="text-xs text-white/50 mb-1">{pred.symbol}</div>
              <div className={clsx(
                'text-lg font-bold mb-1',
                pred.prediction.startsWith('+') ? 'text-electric-green' : 'text-electric-red'
              )}>
                {pred.prediction}
              </div>
              <div className="text-xs text-white/40 mb-2">Confidence: {pred.confidence}%</div>
              <div className="h-1 bg-midnight-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-electric-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${pred.confidence}%` }}
                  transition={{ delay: 1.2 + i * 0.2, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Fair Value Analysis Animation
function FairValueAnalysis() {
  const [currentPrice, setCurrentPrice] = useState(150);
  const [fairValue, setFairValue] = useState(165);
  const [hoveredFactor, setHoveredFactor] = useState<number | null>(null);
  const [factors, setFactors] = useState([
    { name: 'P/E Ratio', value: 28.5, weight: 0.3, description: 'Price to Earnings ratio' },
    { name: 'Revenue Growth', value: 12.3, weight: 0.25, description: 'Year-over-year growth' },
    { name: 'Market Position', value: 85, weight: 0.2, description: 'Competitive strength' },
    { name: 'Debt Ratio', value: 0.15, weight: 0.15, description: 'Financial stability' },
    { name: 'ROE', value: 22.1, weight: 0.1, description: 'Return on Equity' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => prev + (Math.random() - 0.5) * 2);
      setFairValue(prev => prev + (Math.random() - 0.5) * 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const discount = ((fairValue - currentPrice) / fairValue) * 100;

  return (
    <div className="h-full p-8 bg-midnight-900 rounded-xl">
      <div className="h-full flex flex-col gap-6">
        {/* Price Comparison */}
        <div className="bg-midnight-800 rounded-xl p-6 border border-midnight-500/30">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <div className="text-sm text-white/50 mb-2">Current Price</div>
              <motion.div
                key={currentPrice}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-white"
              >
                ${currentPrice.toFixed(2)}
              </motion.div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <div className="text-sm text-white/50 mb-2">Fair Value</div>
              <motion.div
                key={fairValue}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-electric-green"
              >
                ${fairValue.toFixed(2)}
              </motion.div>
            </motion.div>
          </div>
          <div className="h-4 bg-midnight-700 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-electric-red via-electric-orange to-electric-green"
              initial={{ width: '50%' }}
              animate={{ width: `${(currentPrice / fairValue) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: '100%' }}
            />
          </div>
          <div className="mt-4 text-center">
            <motion.div
              key={discount}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={clsx(
                'text-xl font-bold',
                discount > 0 ? 'text-electric-green' : 'text-electric-red'
              )}
            >
              {discount > 0 ? 'Undervalued' : 'Overvalued'} by {Math.abs(discount).toFixed(1)}%
            </motion.div>
            <div className="text-xs text-white/40 mt-2">Based on comprehensive analysis</div>
          </div>
        </div>

        {/* Valuation Factors */}
        <div className="flex-1 bg-midnight-800 rounded-xl p-6 border border-midnight-500/30 overflow-y-auto min-h-[200px]">
          <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            Valuation Factors
            <Info className="w-3 h-3 text-white/40" />
          </div>
          <div className="space-y-4">
            {factors.map((factor, i) => (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredFactor(i)}
                onMouseLeave={() => setHoveredFactor(null)}
                whileHover={{ x: 4, backgroundColor: 'rgba(0, 217, 255, 0.05)' }}
                className="p-3 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-white/70">{factor.name}</div>
                    {hoveredFactor === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-white/40 mt-1"
                      >
                        {factor.description}
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm text-electric-cyan font-mono">
                    {typeof factor.value === 'number' && factor.value < 1
                      ? (factor.value * 100).toFixed(1) + '%'
                      : factor.value.toFixed(1)}
                  </div>
                </div>
                <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-electric-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${(typeof factor.value === 'number' && factor.value < 1 ? factor.value * 100 : factor.value) / 100 * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  />
                </div>
                <div className="text-xs text-white/40 mt-1">Weight: {(factor.weight * 100).toFixed(0)}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Real-Time Alerts Animation
function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: number;
    symbol: string;
    type: 'price' | 'volume' | 'news';
    message: string;
    time: string;
    active: boolean;
  }>>([]);
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  useEffect(() => {
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'];
    const types: Array<'price' | 'volume' | 'news'> = ['price', 'volume', 'news'];
    
    // Initialize prices
    const initialPrices: Record<string, { price: number; change: number }> = {};
    symbols.forEach(symbol => {
      initialPrices[symbol] = {
        price: 100 + Math.random() * 200,
        change: (Math.random() - 0.5) * 5,
      };
    });
    setPrices(initialPrices);

    // Update prices periodically
    const priceInterval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev };
        symbols.forEach(symbol => {
          updated[symbol] = {
            price: updated[symbol].price + (Math.random() - 0.5) * 5,
            change: (Math.random() - 0.5) * 5,
          };
        });
        return updated;
      });
    }, 2000);

    // Add alerts
    const alertInterval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        type: types[Math.floor(Math.random() * types.length)],
        message: '',
        time: new Date().toLocaleTimeString(),
        active: true,
      };

      if (newAlert.type === 'price') {
        newAlert.message = `Price ${Math.random() > 0.5 ? 'above' : 'below'} target`;
      } else if (newAlert.type === 'volume') {
        newAlert.message = 'Unusual volume detected';
      } else {
        newAlert.message = 'Breaking news';
      }

      setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    }, 3000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(alertInterval);
    };
  }, []);

  return (
    <div className="h-full p-8 bg-midnight-900 rounded-xl">
      <div className="h-full flex flex-col gap-6">
        {/* Live Price Ticker */}
        <div className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30">
          <div className="text-xs text-white/50 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-electric-green animate-pulse" />
            Live Market Data
          </div>
          <div className="flex items-center gap-4 overflow-x-auto">
            {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'].map((symbol, i) => {
              const priceData = prices[symbol] || { price: 150, change: 0 };
              return (
                <motion.div
                  key={symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 min-w-[120px] bg-midnight-700/50 rounded-lg p-2 cursor-pointer"
                >
                  <div className="text-xs text-white/50 mb-1">{symbol}</div>
                  <motion.div
                    key={priceData.price}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-white"
                  >
                    ${priceData.price.toFixed(2)}
                  </motion.div>
                  <motion.div
                    key={priceData.change}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={clsx(
                      'text-sm flex items-center gap-1',
                      priceData.change >= 0 ? 'text-electric-green' : 'text-electric-red'
                    )}
                  >
                    {priceData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(priceData.change).toFixed(2)}%
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Alert Feed */}
        <div className="flex-1 bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 overflow-y-auto min-h-[200px]">
          <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-electric-cyan" />
            Live Alerts
            <span className="text-xs text-white/40 ml-auto">({alerts.length} active)</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                    className={clsx(
                      'bg-midnight-700 rounded-lg p-3 border cursor-pointer transition-all',
                      selectedAlert === alert.id
                        ? 'border-electric-cyan bg-midnight-700/80'
                        : 'border-electric-cyan/20 hover:border-electric-cyan/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          'w-2 h-2 rounded-full',
                          alert.type === 'price' ? 'bg-electric-green' :
                          alert.type === 'volume' ? 'bg-electric-orange' : 'bg-electric-purple'
                        )} />
                        <span className="font-semibold text-white">{alert.symbol}</span>
                        <span className="text-xs text-white/40 px-2 py-0.5 bg-midnight-600 rounded">
                          {alert.type}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">{alert.time}</span>
                    </div>
                    <div className="text-sm text-white/70">{alert.message}</div>
                    {selectedAlert === alert.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 pt-2 border-t border-midnight-600 text-xs text-white/50"
                      >
                        Click to view details and take action
                      </motion.div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-white/40 py-8">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <div className="text-sm">Alerts will appear here</div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Alert Settings Preview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Price Alerts', count: 12, active: true },
            { label: 'Volume Alerts', count: 5, active: true },
            { label: 'News Alerts', count: 8, active: true },
          ].map((setting, i) => (
            <motion.div
              key={setting.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 cursor-pointer"
            >
              <div className="text-xs text-white/50 mb-1">{setting.label}</div>
              <div className="text-2xl font-bold text-electric-cyan">{setting.count}</div>
              <div className="text-xs text-electric-green mt-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-electric-green" />
                Active
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Advanced Analytics Animation
function AdvancedAnalytics() {
  const [metrics, setMetrics] = useState([
    { name: 'Sharpe Ratio', value: 1.85, target: 2.0 },
    { name: 'Max Drawdown', value: -8.2, target: -10 },
    { name: 'Win Rate', value: 62.5, target: 60 },
    { name: 'Avg Return', value: 12.3, target: 10 },
  ]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const data = Array.from({ length: 20 }, (_, i) => {
      const baseValue = 100;
      const portfolioValue = baseValue + Math.sin(i * 0.3) * 20 + (i * 0.5) + Math.random() * 5;
      const benchmarkValue = baseValue + (i * 1.2) + Math.random() * 3;
      return {
        value: Math.max(80, portfolioValue),
        benchmark: Math.max(80, benchmarkValue),
        date: `Day ${i + 1}`,
      };
    });
    return data;
  }, []);

  const maxValue = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.value, d.benchmark]);
    return Math.max(...allValues, 150); // Ensure minimum max value
  }, [chartData]);

  return (
    <div className="h-full p-8 bg-midnight-900 rounded-xl">
      <div className="h-full flex flex-col gap-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 cursor-pointer"
            >
              <div className="text-xs text-white/50 mb-2">{metric.name}</div>
              <div className="text-2xl font-bold text-white mb-1">
                {metric.value > 0 ? '+' : ''}{metric.value.toFixed(1)}
                {metric.name === 'Win Rate' || metric.name === 'Avg Return' ? '%' : ''}
              </div>
              <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
                <motion.div
                  className={clsx(
                    'h-full',
                    metric.value >= metric.target ? 'bg-electric-green' : 'bg-electric-orange'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (Math.abs(metric.value) / Math.abs(metric.target)) * 100)}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              </div>
              <div className="text-xs text-white/40 mt-1">Target: {metric.target}</div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="flex-1 bg-midnight-800 rounded-xl p-6 border border-midnight-500/30 min-h-[300px] flex flex-col">
          <div className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
            <span>Portfolio vs Benchmark</span>
            <div className="text-xs text-white/40 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              Hover for details
            </div>
          </div>
          <div className="flex-1 flex items-end gap-1.5 min-h-[200px] pb-2">
            {chartData.map((data, i) => {
              const portfolioHeight = Math.max(10, (data.value / maxValue) * 100);
              const benchmarkHeight = Math.max(10, (data.benchmark / maxValue) * 100);
              const portfolioChange = ((data.value / 100 - 1) * 100);
              const benchmarkChange = ((data.benchmark / 100 - 1) * 100);
              
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-1 group relative h-full"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="w-full flex flex-col items-center justify-end gap-1 h-full">
                    {/* Benchmark Bar */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${benchmarkHeight}%`, opacity: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.6, ease: "easeOut" }}
                      className="w-full bg-midnight-600 rounded-t hover:bg-midnight-500 transition-colors min-h-[2px]"
                      style={{ maxHeight: '100%' }}
                    />
                    {/* Portfolio Bar */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${portfolioHeight}%`, opacity: 1 }}
                      transition={{ delay: i * 0.03 + 0.15, duration: 0.6, ease: "easeOut" }}
                      className={clsx(
                        'w-full bg-gradient-to-t from-electric-cyan to-electric-cyan/30 rounded-t transition-all min-h-[2px]',
                        hoveredBar === i ? 'from-electric-green to-electric-green/50 ring-2 ring-electric-green/50' : ''
                      )}
                      style={{ maxHeight: '100%' }}
                    />
                  </div>
                  {hoveredBar === i && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 bg-midnight-700/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white whitespace-nowrap shadow-xl z-20 border border-midnight-500/50"
                    >
                      <div className="font-semibold mb-1.5 text-electric-cyan">{data.date}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-electric-cyan" />
                          <span>Portfolio: <span className={clsx(portfolioChange >= 0 ? 'text-electric-green' : 'text-electric-red')}>
                            {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(1)}%
                          </span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-midnight-600" />
                          <span>Benchmark: <span className={clsx(benchmarkChange >= 0 ? 'text-electric-green' : 'text-electric-red')}>
                            {benchmarkChange >= 0 ? '+' : ''}{benchmarkChange.toFixed(1)}%
                          </span></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-midnight-500/30 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-electric-cyan rounded" />
              <span className="text-white/60">Portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-midnight-600 rounded" />
              <span className="text-white/60">Benchmark</span>
            </div>
            <div className="ml-auto text-white/40">
              {chartData.length} days performance
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Volatility', value: 18.5, status: 'moderate' },
            { label: 'Beta', value: 1.12, status: 'high' },
            { label: 'Alpha', value: 4.2, status: 'positive' },
          ].map((risk, i) => (
            <motion.div
              key={risk.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-midnight-800 rounded-xl p-4 border border-midnight-500/30 cursor-pointer"
            >
              <div className="text-xs text-white/50 mb-2">{risk.label}</div>
              <div className="text-xl font-bold text-white mb-2">{risk.value}</div>
              <div className={clsx(
                'text-xs flex items-center gap-1',
                risk.status === 'positive' ? 'text-electric-green' :
                risk.status === 'moderate' ? 'text-electric-orange' : 'text-electric-red'
              )}>
                <div className={clsx(
                  'w-1.5 h-1.5 rounded-full',
                  risk.status === 'positive' ? 'bg-electric-green' :
                  risk.status === 'moderate' ? 'bg-electric-orange' : 'bg-electric-red'
                )} />
                {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const showcases: Showcase[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'See how easy it is to track your entire portfolio at a glance',
    icon: BarChart3,
    component: DashboardOverview,
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Discover how our AI analyzes market patterns and predicts trends',
    icon: Brain,
    component: AIInsights,
  },
  {
    id: 'fair-value',
    title: 'Fair Value Analysis',
    description: 'Learn how we calculate intrinsic value for smarter investment decisions',
    icon: LineChart,
    component: FairValueAnalysis,
  },
  {
    id: 'real-time-alerts',
    title: 'Real-Time Alerts',
    description: 'Never miss an opportunity with instant price and market alerts',
    icon: Bell,
    component: RealTimeAlerts,
  },
  {
    id: 'portfolio-analytics',
    title: 'Advanced Analytics',
    description: 'Deep dive into your portfolio performance with professional-grade tools',
    icon: TrendingUp,
    component: AdvancedAnalytics,
  },
];

export function AnimatedShowcase() {
  const [selectedShowcase, setSelectedShowcase] = useState(0);
  const currentShowcase = showcases[selectedShowcase];
  const CurrentComponent = currentShowcase.component;

  const selectShowcase = (index: number) => {
    setSelectedShowcase(index);
  };

  const nextShowcase = () => {
    setSelectedShowcase((prev) => (prev + 1) % showcases.length);
  };

  const prevShowcase = () => {
    setSelectedShowcase((prev) => (prev - 1 + showcases.length) % showcases.length);
  };

  return (
    <div className="w-full">
      {/* Main Animation Container */}
      <div className="relative rounded-2xl overflow-hidden border border-midnight-500/50 shadow-2xl shadow-electric-cyan/10 bg-midnight-900">
        <div className="relative aspect-video bg-midnight-900 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShowcase.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 p-8"
            >
              <CurrentComponent />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevShowcase}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-midnight-800/80 backdrop-blur-md border border-midnight-500/50 flex items-center justify-center hover:bg-midnight-700 transition-all hover:scale-110 z-10 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextShowcase}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-midnight-800/80 backdrop-blur-md border border-midnight-500/50 flex items-center justify-center hover:bg-midnight-700 transition-all hover:scale-110 z-10 shadow-lg"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Title Overlay */}
          <div className="absolute top-4 left-4 right-4 pointer-events-none z-10">
            <motion.div
              key={currentShowcase.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-midnight-900/80 backdrop-blur-md rounded-lg p-3 border border-midnight-500/50 inline-block"
            >
              <div className="flex items-center gap-2 mb-1">
                <currentShowcase.icon className="w-4 h-4 text-electric-cyan" />
                <h3 className="font-semibold text-white">{currentShowcase.title}</h3>
              </div>
              <p className="text-sm text-white/60">{currentShowcase.description}</p>
            </motion.div>
          </div>

          {/* Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {showcases.map((_, index) => (
              <button
                key={index}
                onClick={() => selectShowcase(index)}
                className={clsx(
                  'transition-all rounded-full',
                  index === selectedShowcase
                    ? 'w-8 h-2 bg-electric-cyan'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail Selector */}
      <div className="mt-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-midnight-500 scrollbar-track-midnight-800">
          {showcases.map((showcase, index) => {
            const Icon = showcase.icon;
            return (
              <motion.button
                key={showcase.id}
                onClick={() => selectShowcase(index)}
                className={clsx(
                  'flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all group',
                  index === selectedShowcase
                    ? 'border-electric-cyan scale-105 shadow-lg shadow-electric-cyan/20'
                    : 'border-midnight-500/50 hover:border-midnight-500'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-32 h-20 bg-midnight-800 flex items-center justify-center">
                  <div className={clsx(
                    'absolute inset-0 flex items-center justify-center transition-colors',
                    index === selectedShowcase
                      ? 'bg-electric-cyan/10'
                      : 'bg-midnight-700/50 group-hover:bg-midnight-700'
                  )}>
                    <Icon className={clsx(
                      'w-8 h-8 transition-colors',
                      index === selectedShowcase
                        ? 'text-electric-cyan'
                        : 'text-white/40 group-hover:text-white/60'
                    )} />
                  </div>

                  {/* Video Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-midnight-900/90 to-transparent">
                    <p className="text-xs font-medium text-white truncate">{showcase.title}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-white/50">
          Interactive animated showcases - Click thumbnails or use arrows to explore
        </p>
      </div>
    </div>
  );
}
