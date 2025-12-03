'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { MainLayout } from '@/components/layout/MainLayout';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { AllocationChart } from '@/components/charts/AllocationChart';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { TopMovers } from '@/components/dashboard/TopMovers';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { motion } from 'framer-motion';
import { isDevPreviewMode, previewEmail, previewPassword } from '@/config/authConfig';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const { isAuthenticated, login, signup } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isHydrated, setIsHydrated] = useState(false);
  const autoLoginAttempted = useRef(false);
  const devModeEnabled = isDevPreviewMode;
  const allowSignup = devModeEnabled;

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode(allowSignup ? 'signup' : 'login');
    setShowAuthModal(true);
  };

  const handleAuth = async (email: string, password: string, name?: string) => {
    const success = authMode === 'login'
      ? await login(email, password)
      : await signup(email, password, name || 'User');

    if (success) {
      setShowAuthModal(false);
    }

    return success;
  };

  useEffect(() => {
    if (!devModeEnabled || autoLoginAttempted.current || isAuthenticated) return;
    autoLoginAttempted.current = true;
    void login(previewEmail, previewPassword);
  }, [devModeEnabled, isAuthenticated, login]);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-cyan to-electric-purple 
                          flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">IP</span>
          </div>
          <div className="text-white/50 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} />
        <AuthModal
          isOpen={showAuthModal}
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onModeChange={setAuthMode}
          onAuth={handleAuth}
        />
      </>
    );
  }

  // Show dashboard for authenticated users
  return (
    <MainLayout>
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-white/50">Welcome back! Here&apos;s your portfolio overview.</p>
        </motion.div>

        {/* Portfolio Summary Cards */}
        <motion.div variants={fadeInUp}>
          <PortfolioSummary />
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart />
          </div>
          <div>
            <AllocationChart />
          </div>
        </motion.div>

        {/* Holdings & Top Movers */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <HoldingsTable />
          </div>
          <div>
            <TopMovers />
          </div>
        </motion.div>

        {/* News Feed */}
        <motion.div variants={fadeInUp}>
          <NewsFeed />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
