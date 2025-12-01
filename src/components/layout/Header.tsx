'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Plus, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { marketIndices } from '@/data/mockData';
import { clsx } from 'clsx';
import Link from 'next/link';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { assets, alerts, sidebarOpen } = useStore();
  const { user, logout } = useAuthStore();
  const unreadAlerts = alerts.filter(a => !a.triggered).length;

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssets = searchQuery.length > 0
    ? assets.filter(a => 
        a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className={clsx(
      'fixed top-0 right-0 z-40 h-16 bg-midnight-800/80 backdrop-blur-md border-b border-midnight-500/50',
      'transition-all duration-300',
      // Desktop: sidebar affects header position
      'md:left-64',
      !sidebarOpen && 'md:left-20',
      // Mobile: full width header with padding for menu button
      'left-0 pl-16 md:pl-0'
    )}>
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* Market Ticker */}
        <div className="hidden lg:flex items-center gap-6 overflow-hidden flex-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-electric-green pulse-live" />
            <span className="text-xs text-white/50 font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {marketIndices.slice(0, 4).map((index) => (
              <div key={index.name} className="flex items-center gap-2">
                <span className="text-white/60">{index.name}</span>
                <span className="font-mono text-white">
                  {index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className={clsx(
                  'font-mono text-xs',
                  index.change >= 0 ? 'text-electric-green' : 'text-electric-red'
                )}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-midnight-700 border border-midnight-500 rounded-lg
                       text-sm text-white placeholder-white/40 transition-all
                       focus:outline-none focus:border-electric-cyan/50 focus:ring-1 focus:ring-electric-cyan/30"
          />
          
          {/* Search Results Dropdown */}
          {filteredAssets.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-midnight-700 border border-midnight-500 
                            rounded-lg shadow-xl overflow-hidden z-50">
              {filteredAssets.map((asset) => (
                <a
                  key={asset.id}
                  href={`/research?asset=${asset.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-midnight-600 transition-colors"
                  onClick={() => setSearchQuery('')}
                >
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    asset.type === 'stock' && 'bg-electric-cyan/20 text-electric-cyan',
                    asset.type === 'crypto' && 'bg-electric-orange/20 text-electric-orange',
                    asset.type === 'etf' && 'bg-electric-purple/20 text-electric-purple'
                  )}>
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{asset.symbol}</div>
                    <div className="text-xs text-white/50">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-white">
                      ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className={clsx(
                      'text-xs font-mono',
                      asset.changePercent24h >= 0 ? 'text-electric-green' : 'text-electric-red'
                    )}>
                      {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Trade</span>
          </button>

          <button className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-midnight-700 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-electric-red rounded-full 
                               text-[10px] font-bold flex items-center justify-center text-white">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-midnight-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-cyan to-electric-purple 
                              flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <ChevronDown className={clsx(
                'w-4 h-4 text-white/50 transition-transform hidden sm:block',
                showUserMenu && 'rotate-180'
              )} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-midnight-700 border border-midnight-500 
                              rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                <div className="p-3 border-b border-midnight-500">
                  <div className="font-medium text-white">{user?.name || 'User'}</div>
                  <div className="text-xs text-white/50 truncate">{user?.email || 'user@example.com'}</div>
                </div>
                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 
                               hover:text-white hover:bg-midnight-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-electric-red/80 
                               hover:text-electric-red hover:bg-electric-red/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

