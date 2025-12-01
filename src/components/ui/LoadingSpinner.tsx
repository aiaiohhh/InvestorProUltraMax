'use client';

import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={clsx(
        'rounded-full border-electric-cyan/30 border-t-electric-cyan animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-midnight-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-cyan to-electric-purple 
                          flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">IP</span>
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-electric-cyan/20 blur-xl animate-pulse" />
        </div>
        <div className="text-white font-display font-bold text-xl">
          InvestorPro<span className="text-electric-cyan">UltraMax</span>
        </div>
        <LoadingSpinner size="sm" />
      </div>
    </div>
  );
}

