'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStore } from '@/store/useStore';
import { Plus, Bell, BellOff, Trash2, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function AlertsPage() {
  const { alerts, assets, addAlert, removeAlert } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    assetId: '',
    type: 'price_above' as 'price_above' | 'price_below' | 'percent_change',
    threshold: '',
  });

  const handleAddAlert = () => {
    if (!newAlert.assetId || !newAlert.threshold) return;
    
    addAlert(newAlert.assetId, newAlert.type, parseFloat(newAlert.threshold));
    setNewAlert({ assetId: '', type: 'price_above', threshold: '' });
    setShowAddModal(false);
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

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
            <h1 className="font-display text-2xl font-bold text-white mb-1">Price Alerts</h1>
            <p className="text-white/50">Get notified when assets reach your target price</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-electric-cyan/10">
                <Bell className="w-5 h-5 text-electric-cyan" />
              </div>
              <div>
                <div className="text-sm text-white/50">Active Alerts</div>
                <div className="font-display text-xl font-bold text-white">{activeAlerts.length}</div>
              </div>
            </div>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-electric-green/10">
                <BellOff className="w-5 h-5 text-electric-green" />
              </div>
              <div>
                <div className="text-sm text-white/50">Triggered</div>
                <div className="font-display text-xl font-bold text-electric-green">{triggeredAlerts.length}</div>
              </div>
            </div>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-electric-purple/10">
                <TrendingUp className="w-5 h-5 text-electric-purple" />
              </div>
              <div>
                <div className="text-sm text-white/50">Total Created</div>
                <div className="font-display text-xl font-bold text-white">{alerts.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="panel">
          <div className="px-6 py-4 border-b border-midnight-500/50">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          </div>
          
          {activeAlerts.length > 0 ? (
            <div className="divide-y divide-midnight-600/50">
              {activeAlerts.map((alert) => {
                const distance = alert.type === 'price_above'
                  ? ((alert.threshold - alert.asset.price) / alert.asset.price) * 100
                  : alert.type === 'price_below'
                    ? ((alert.asset.price - alert.threshold) / alert.asset.price) * 100
                    : 0;

                return (
                  <div key={alert.id} className="flex items-center gap-4 p-4 hover:bg-midnight-700/30 transition-colors group">
                    <div className={clsx(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      alert.type === 'price_above' && 'bg-electric-green/10',
                      alert.type === 'price_below' && 'bg-electric-red/10',
                      alert.type === 'percent_change' && 'bg-electric-purple/10'
                    )}>
                      {alert.type === 'price_above' && <TrendingUp className="w-6 h-6 text-electric-green" />}
                      {alert.type === 'price_below' && <TrendingDown className="w-6 h-6 text-electric-red" />}
                      {alert.type === 'percent_change' && <Percent className="w-6 h-6 text-electric-purple" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{alert.asset.symbol}</span>
                        <span className={clsx(
                          'badge',
                          alert.asset.type === 'stock' && 'badge-stock',
                          alert.asset.type === 'crypto' && 'badge-crypto',
                          alert.asset.type === 'etf' && 'badge-etf'
                        )}>
                          {alert.asset.type}
                        </span>
                      </div>
                      <div className="text-sm text-white/50">
                        {alert.type === 'price_above' && `Alert when price goes above $${alert.threshold.toLocaleString()}`}
                        {alert.type === 'price_below' && `Alert when price goes below $${alert.threshold.toLocaleString()}`}
                        {alert.type === 'percent_change' && `Alert when price changes by ${alert.threshold}%`}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-white mb-1">
                        Current: ${alert.asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-white/50">
                        {Math.abs(distance).toFixed(1)}% {distance > 0 ? 'to target' : 'away'}
                      </div>
                    </div>

                    <div className="text-right text-sm text-white/40">
                      {formatDistanceToNow(parseISO(alert.createdAt), { addSuffix: true })}
                    </div>

                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-2 rounded-lg text-white/40 hover:text-electric-red hover:bg-electric-red/10 
                                 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No active alerts</p>
            </div>
          )}
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="panel">
            <div className="px-6 py-4 border-b border-midnight-500/50">
              <h3 className="text-lg font-semibold text-white">Triggered Alerts</h3>
            </div>
            <div className="divide-y divide-midnight-600/50">
              {triggeredAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 p-4 opacity-60">
                  <div className="w-12 h-12 rounded-xl bg-midnight-700 flex items-center justify-center">
                    <BellOff className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{alert.asset.symbol}</span>
                    </div>
                    <div className="text-sm text-white/50">
                      Target: ${alert.threshold.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-electric-green">Triggered</div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-2 rounded-lg text-white/40 hover:text-electric-red hover:bg-electric-red/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Alert Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Create Price Alert</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Asset</label>
                  <select
                    value={newAlert.assetId}
                    onChange={(e) => setNewAlert({ ...newAlert, assetId: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.symbol} - ${asset.price.toLocaleString()} ({asset.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Alert Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'price_above', label: 'Above', icon: TrendingUp, color: 'green' },
                      { value: 'price_below', label: 'Below', icon: TrendingDown, color: 'red' },
                      { value: 'percent_change', label: '% Change', icon: Percent, color: 'purple' },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setNewAlert({ ...newAlert, type: type.value as typeof newAlert.type })}
                          className={clsx(
                            'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                            newAlert.type === type.value
                              ? `bg-electric-${type.color}/10 border-electric-${type.color}/30 text-electric-${type.color}`
                              : 'bg-midnight-700 border-midnight-500 text-white/50'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    {newAlert.type === 'percent_change' ? 'Percentage' : 'Target Price'}
                  </label>
                  <input
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                    placeholder={newAlert.type === 'percent_change' ? '5' : '100.00'}
                    className="input-field"
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
                  onClick={handleAddAlert}
                  className="btn-primary flex-1"
                >
                  Create Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}

