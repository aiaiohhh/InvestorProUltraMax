'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Bell, TrendingUp, TrendingDown, Eye, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function WatchlistPage() {
  const { watchlist, assets, addToWatchlist, removeFromWatchlist, updateWatchlistItem } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    assetId: '',
    alertPrice: '',
    alertType: 'above' as 'above' | 'below',
    notes: '',
  });

  const availableAssets = assets.filter(
    a => !watchlist.items.find(i => i.assetId === a.id)
  );

  const handleAddToWatchlist = () => {
    if (!newItem.assetId) return;
    
    addToWatchlist(
      newItem.assetId,
      newItem.alertPrice ? parseFloat(newItem.alertPrice) : undefined,
      newItem.alertPrice ? newItem.alertType : undefined,
      newItem.notes || undefined
    );
    
    setNewItem({ assetId: '', alertPrice: '', alertType: 'above', notes: '' });
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
            <h1 className="font-display text-2xl font-bold text-white mb-1">Watchlist</h1>
            <p className="text-white/50">Track assets and set price alerts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Watchlist
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-electric-cyan/10">
                <Eye className="w-5 h-5 text-electric-cyan" />
              </div>
              <div>
                <div className="text-sm text-white/50">Watching</div>
                <div className="font-display text-xl font-bold text-white">{watchlist.items.length} assets</div>
              </div>
            </div>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-electric-green/10">
                <TrendingUp className="w-5 h-5 text-electric-green" />
              </div>
              <div>
                <div className="text-sm text-white/50">Gainers Today</div>
                <div className="font-display text-xl font-bold text-electric-green">
                  {watchlist.items.filter(i => i.asset.changePercent24h > 0).length}
                </div>
              </div>
            </div>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-electric-orange/10">
                <Bell className="w-5 h-5 text-electric-orange" />
              </div>
              <div>
                <div className="text-sm text-white/50">Active Alerts</div>
                <div className="font-display text-xl font-bold text-electric-orange">
                  {watchlist.items.filter(i => i.alertPrice).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist Table */}
        {watchlist.items.length > 0 ? (
          <div className="panel overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="bg-midnight-700/30">
                  <th>Asset</th>
                  <th>Price</th>
                  <th>24h Change</th>
                  <th>Alert</th>
                  <th>Notes</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {watchlist.items.map((item) => {
                  const alertTriggered = item.alertPrice && (
                    (item.alertType === 'above' && item.asset.price >= item.alertPrice) ||
                    (item.alertType === 'below' && item.asset.price <= item.alertPrice)
                  );

                  return (
                    <tr key={item.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                            item.asset.type === 'stock' && 'bg-electric-cyan/10 text-electric-cyan',
                            item.asset.type === 'crypto' && 'bg-electric-orange/10 text-electric-orange',
                            item.asset.type === 'etf' && 'bg-electric-purple/10 text-electric-purple'
                          )}>
                            {item.asset.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{item.asset.symbol}</div>
                            <div className="text-xs text-white/50">{item.asset.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-mono text-white">
                          ${item.asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td>
                        <div className={clsx(
                          'flex items-center gap-1 font-mono',
                          item.asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                        )}>
                          {item.asset.changePercent24h >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {item.asset.changePercent24h >= 0 ? '+' : ''}
                          {item.asset.changePercent24h.toFixed(2)}%
                        </div>
                      </td>
                      <td>
                        {item.alertPrice ? (
                          <div className={clsx(
                            'flex items-center gap-2 px-2 py-1 rounded-md text-sm',
                            alertTriggered
                              ? 'bg-electric-yellow/10 text-electric-yellow'
                              : 'bg-midnight-600 text-white/70'
                          )}>
                            <Bell className={clsx('w-3 h-3', alertTriggered && 'animate-pulse')} />
                            <span className="font-mono">
                              {item.alertType === 'above' ? '>' : '<'} ${item.alertPrice.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/30">-</span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-white/50 max-w-[150px] truncate block">
                          {item.notes || '-'}
                        </span>
                      </td>
                      <td className="text-white/40 text-sm">
                        {formatDistanceToNow(parseISO(item.addedAt), { addSuffix: true })}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-midnight-600 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(item.id)}
                            className="p-2 rounded-lg text-white/40 hover:text-electric-red hover:bg-electric-red/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-midnight-700 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Your Watchlist is Empty</h3>
            <p className="text-white/50 mb-4">Start tracking assets by adding them to your watchlist</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add First Asset
            </button>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Add to Watchlist</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Asset</label>
                  <select
                    value={newItem.assetId}
                    onChange={(e) => setNewItem({ ...newItem, assetId: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select asset...</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.symbol} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Price Alert (optional)</label>
                  <div className="flex gap-2">
                    <select
                      value={newItem.alertType}
                      onChange={(e) => setNewItem({ ...newItem, alertType: e.target.value as 'above' | 'below' })}
                      className="select-field w-32"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                    <input
                      type="number"
                      value={newItem.alertPrice}
                      onChange={(e) => setNewItem({ ...newItem, alertPrice: e.target.value })}
                      placeholder="Price"
                      className="input-field flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Notes (optional)</label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Add notes..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToWatchlist}
                  className="btn-primary flex-1"
                >
                  Add to Watchlist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}

