'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { User, Bell, Palette, Shield, Database, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

type ThemeMode = 'dark' | 'light' | 'system';

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    portfolioUpdates: true,
    newsAlerts: false,
    weeklyReport: true,
  });
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleClearLocalData = () => {
    localStorage.clear();
    logout();
    router.push('/');
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-white/50">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-electric-cyan/10">
              <User className="w-5 h-5 text-electric-cyan" />
            </div>
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-cyan to-electric-purple 
                            flex items-center justify-center text-2xl font-bold text-white">
              JP
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">John Pro</h3>
              <p className="text-white/50">john.pro@example.com</p>
              <p className="text-xs text-white/30 mt-1">Member since January 2024</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="John Pro"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <input
                type="email"
                defaultValue="john.pro@example.com"
                className="input-field"
              />
            </div>
          </div>

          <button className="btn-primary mt-4">Save Changes</button>
        </div>

        {/* Appearance Section */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-electric-purple/10">
              <Palette className="w-5 h-5 text-electric-purple" />
            </div>
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'system', label: 'System', icon: Monitor },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as ThemeMode)}
                    className={clsx(
                      'flex items-center justify-center gap-2 p-4 rounded-lg border transition-all',
                      theme === option.value
                        ? 'bg-electric-cyan/10 border-electric-cyan/30 text-electric-cyan'
                        : 'bg-midnight-700 border-midnight-500 text-white/50 hover:border-midnight-400'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/40 mt-2">
              Note: Light mode is coming soon. Currently only dark mode is available.
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-electric-orange/10">
              <Bell className="w-5 h-5 text-electric-orange" />
            </div>
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'priceAlerts', label: 'Price Alerts', description: 'Get notified when assets reach your target price' },
              { key: 'portfolioUpdates', label: 'Portfolio Updates', description: 'Daily summary of your portfolio performance' },
              { key: 'newsAlerts', label: 'News Alerts', description: 'Breaking news about assets you own or watch' },
              { key: 'weeklyReport', label: 'Weekly Report', description: 'Weekly performance report sent to your email' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-midnight-700/50">
                <div>
                  <div className="font-medium text-white">{item.label}</div>
                  <div className="text-sm text-white/50">{item.description}</div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={clsx(
                    'relative w-12 h-6 rounded-full transition-colors',
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-electric-cyan'
                      : 'bg-midnight-500'
                  )}
                >
                  <div
                    className={clsx(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                      notifications[item.key as keyof typeof notifications]
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-electric-green/10">
              <Shield className="w-5 h-5 text-electric-green" />
            </div>
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-midnight-700/50 
                               hover:bg-midnight-700 transition-colors text-left">
              <div>
                <div className="font-medium text-white">Change Password</div>
                <div className="text-sm text-white/50">Update your account password</div>
              </div>
              <span className="text-white/40">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-midnight-700/50 
                               hover:bg-midnight-700 transition-colors text-left">
              <div>
                <div className="font-medium text-white">Two-Factor Authentication</div>
                <div className="text-sm text-white/50">Add an extra layer of security</div>
              </div>
              <span className="px-2 py-1 rounded bg-electric-orange/10 text-electric-orange text-xs font-medium">
                Not Enabled
              </span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-midnight-700/50 
                               hover:bg-midnight-700 transition-colors text-left">
              <div>
                <div className="font-medium text-white">Active Sessions</div>
                <div className="text-sm text-white/50">Manage your active login sessions</div>
              </div>
              <span className="text-white/40">→</span>
            </button>
          </div>
        </div>

        {/* Data Section */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-electric-red/10">
              <Database className="w-5 h-5 text-electric-red" />
            </div>
            <h2 className="text-lg font-semibold text-white">Data & Privacy</h2>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-midnight-700/50 
                               hover:bg-midnight-700 transition-colors text-left">
              <div>
                <div className="font-medium text-white">Export Data</div>
                <div className="text-sm text-white/50">Download all your portfolio data</div>
              </div>
              <span className="text-white/40">→</span>
            </button>
            <button 
              onClick={handleClearLocalData}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-midnight-700/50 
                               hover:bg-midnight-700 transition-colors text-left">
              <div>
                <div className="font-medium text-white">Clear Local Data</div>
                <div className="text-sm text-white/50">Reset all locally stored data</div>
              </div>
              <span className="text-white/40">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg 
                               border border-electric-red/30 hover:bg-electric-red/10 transition-colors text-left">
              <div>
                <div className="font-medium text-electric-red">Delete Account</div>
                <div className="text-sm text-white/50">Permanently delete your account and all data</div>
              </div>
              <span className="text-electric-red/40">→</span>
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="panel p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-lg 
                       bg-electric-red/10 border border-electric-red/30 hover:bg-electric-red/20 
                       transition-colors text-electric-red font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}

