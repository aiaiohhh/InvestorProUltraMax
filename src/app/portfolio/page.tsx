'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStore } from '@/store/useStore';
import { Plus, ArrowUpDown, TrendingUp, TrendingDown, History, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

type TabType = 'holdings' | 'transactions';

export default function PortfolioPage() {
  const { portfolio, transactions, assets, addTransaction, removeHolding } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('holdings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrade, setNewTrade] = useState({
    assetId: '',
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
  });

  const handleAddTrade = () => {
    if (!newTrade.assetId || !newTrade.quantity || !newTrade.price) return;
    
    const quantity = parseFloat(newTrade.quantity);
    const price = parseFloat(newTrade.price);
    
    addTransaction({
      portfolioId: portfolio.id,
      assetId: newTrade.assetId,
      type: newTrade.type,
      quantity,
      price,
      total: quantity * price,
      date: new Date().toISOString(),
    });
    
    setNewTrade({ assetId: '', type: 'buy', quantity: '', price: '' });
    setShowAddModal(false);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Portfolio</h1>
            <p className="text-white/50">Manage your holdings and track transactions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Trade
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="panel p-4">
            <div className="text-sm text-white/50 mb-1">Total Value</div>
            <div className="font-display text-xl font-bold text-white">
              ${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="panel p-4">
            <div className="text-sm text-white/50 mb-1">Total Cost</div>
            <div className="font-display text-xl font-bold text-white">
              ${portfolio.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="panel p-4">
            <div className="text-sm text-white/50 mb-1">Total P/L</div>
            <div className={clsx(
              'font-display text-xl font-bold',
              portfolio.totalProfitLoss >= 0 ? 'text-electric-green' : 'text-electric-red'
            )}>
              {portfolio.totalProfitLoss >= 0 ? '+' : ''}
              ${portfolio.totalProfitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="panel p-4">
            <div className="text-sm text-white/50 mb-1">P/L %</div>
            <div className={clsx(
              'font-display text-xl font-bold',
              portfolio.totalProfitLossPercent >= 0 ? 'text-electric-green' : 'text-electric-red'
            )}>
              {portfolio.totalProfitLossPercent >= 0 ? '+' : ''}
              {portfolio.totalProfitLossPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-midnight-500/50">
          <button
            onClick={() => setActiveTab('holdings')}
            className={clsx('tab', activeTab === 'holdings' && 'tab-active')}
          >
            Holdings ({portfolio.holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={clsx('tab', activeTab === 'transactions' && 'tab-active')}
          >
            Transactions ({transactions.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'holdings' && (
          <div className="panel overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="bg-midnight-700/30">
                  <th>Asset</th>
                  <th>Quantity</th>
                  <th>Avg Cost</th>
                  <th>Current Price</th>
                  <th>Value</th>
                  <th>P/L</th>
                  <th>P/L %</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => (
                  <tr key={holding.id} className="group">
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
                    <td className="font-mono text-white">
                      {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="font-mono text-white/70">
                      ${holding.averageCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="font-mono text-white">
                      ${holding.asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="font-mono text-white font-medium">
                      ${holding.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className={clsx(
                      'font-mono',
                      holding.profitLoss >= 0 ? 'text-electric-green' : 'text-electric-red'
                    )}>
                      {holding.profitLoss >= 0 ? '+' : ''}
                      ${holding.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={clsx(
                        'px-2 py-1 rounded-md font-mono text-sm',
                        holding.profitLossPercent >= 0 
                          ? 'bg-electric-green/10 text-electric-green' 
                          : 'bg-electric-red/10 text-electric-red'
                      )}>
                        {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => removeHolding(holding.id)}
                        className="p-2 rounded-lg text-white/40 hover:text-electric-red hover:bg-electric-red/10 
                                   opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="panel overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="bg-midnight-700/30">
                  <th>Date</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Fees</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="text-white/70">
                      {format(parseISO(tx.date), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs',
                          tx.asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                          tx.asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                          tx.asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                        )}>
                          {tx.asset.symbol.slice(0, 2)}
                        </div>
                        <span className="font-medium text-white">{tx.asset.symbol}</span>
                      </div>
                    </td>
                    <td>
                      <span className={clsx(
                        'px-2 py-1 rounded-md text-xs font-medium uppercase',
                        tx.type === 'buy' 
                          ? 'bg-electric-green/10 text-electric-green' 
                          : 'bg-electric-red/10 text-electric-red'
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="font-mono text-white">
                      {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="font-mono text-white/70">
                      ${tx.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="font-mono text-white font-medium">
                      ${tx.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="font-mono text-white/50">
                      {tx.fees ? `$${tx.fees.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Trade Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Add Trade</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Asset</label>
                  <select
                    value={newTrade.assetId}
                    onChange={(e) => setNewTrade({ ...newTrade, assetId: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.symbol} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewTrade({ ...newTrade, type: 'buy' })}
                      className={clsx(
                        'flex-1 py-2 rounded-lg font-medium transition-all',
                        newTrade.type === 'buy'
                          ? 'bg-electric-green/20 text-electric-green border border-electric-green/30'
                          : 'bg-midnight-700 text-white/50 border border-midnight-500'
                      )}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setNewTrade({ ...newTrade, type: 'sell' })}
                      className={clsx(
                        'flex-1 py-2 rounded-lg font-medium transition-all',
                        newTrade.type === 'sell'
                          ? 'bg-electric-red/20 text-electric-red border border-electric-red/30'
                          : 'bg-midnight-700 text-white/50 border border-midnight-500'
                      )}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Price</label>
                    <input
                      type="number"
                      value={newTrade.price}
                      onChange={(e) => setNewTrade({ ...newTrade, price: e.target.value })}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                </div>

                {newTrade.quantity && newTrade.price && (
                  <div className="p-3 bg-midnight-700 rounded-lg">
                    <div className="text-sm text-white/50">Total</div>
                    <div className="font-mono text-lg text-white">
                      ${(parseFloat(newTrade.quantity) * parseFloat(newTrade.price)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTrade}
                  className="btn-primary flex-1"
                >
                  Add Trade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}

