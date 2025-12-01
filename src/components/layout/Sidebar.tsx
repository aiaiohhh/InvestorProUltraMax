'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  Eye, 
  Bell, 
  Settings,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Menu
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/research', label: 'Research', icon: Search },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/compare', label: 'Compare', icon: Layers },
  { href: '/alerts', label: 'Alerts', icon: Bell },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useStore();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      // Don't auto-close on mobile
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-midnight-800 border border-midnight-500
                   text-white/70 hover:text-white md:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen bg-midnight-800/95 backdrop-blur-md border-r border-midnight-500/50',
          'flex flex-col transition-all duration-300 z-50',
          // Mobile styles
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20 w-64'
        )}
      >
      {/* Logo */}
      <div className="p-4 border-b border-midnight-500/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-cyan to-electric-purple flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-lg text-white leading-tight">
                InvestorPro
              </h1>
              <p className="text-[10px] text-electric-cyan font-mono tracking-wider">
                ULTRA MAX
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'group relative',
                    isActive
                      ? 'bg-electric-cyan/10 text-electric-cyan'
                      : 'text-white/60 hover:text-white hover:bg-midnight-700/50'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-electric-cyan rounded-r" />
                  )}
                  <Icon className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]'
                  )} />
                  {sidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-midnight-700 text-white text-sm rounded 
                                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all
                                    whitespace-nowrap z-50 border border-midnight-500">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-midnight-500/50">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-electric-cyan/10 text-electric-cyan'
                      : 'text-white/60 hover:text-white hover:bg-midnight-700/50'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-white/40 hover:text-white/70 hover:bg-midnight-700/50 transition-all"
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
    </>
  );
}

