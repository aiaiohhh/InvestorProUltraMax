'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Zap, Github, Chrome } from 'lucide-react';
import { clsx } from 'clsx';
import {
  isDevPreviewMode,
  previewCredentialsLabel,
  previewEmail,
  previewPassword,
} from '@/config/authConfig';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  onAuth: (email: string, password: string, name?: string) => Promise<boolean>;
}

export function AuthModal({ isOpen, mode, onClose, onModeChange, onAuth }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const allowSignup = isDevPreviewMode;
  const allowSocialAuth = isDevPreviewMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup' && allowSignup && !name) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup' && !allowSignup) {
      setError('Sign ups are disabled for this preview.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const success = await onAuth(email, password, mode === 'signup' ? name : undefined);

    if (!success) {
      setError('Invalid credentials. Use the preview username/password to continue.');
      setIsLoading(false);
      return;
    }

    setEmail('');
    setPassword('');
    setName('');
    setIsLoading(false);
  };

  const handleSocialAuth = (provider: string) => {
    if (!allowSocialAuth) return;
    onAuth(`${provider}@example.com`, 'social-auth', `${provider} User`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-full max-w-md bg-midnight-800 rounded-2xl border border-midnight-500/50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-midnight-500/50">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white 
                         hover:bg-midnight-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-orange to-electric-red 
                              flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-white/50">
                  {mode === 'login' 
                    ? 'Sign in to access your portfolio' 
                    : 'Start your investment journey'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                disabled={!allowSocialAuth}
                onClick={() => handleSocialAuth('google')}
                className={clsx(
                  'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-midnight-500 transition-colors',
                  'bg-midnight-700 hover:bg-midnight-600',
                  !allowSocialAuth && 'opacity-40 cursor-not-allowed hover:bg-midnight-700'
                )}
              >
                <Chrome className="w-5 h-5 text-white/70" />
                <span className="text-sm font-medium text-white/80">Google</span>
              </button>
              <button
                type="button"
                disabled={!allowSocialAuth}
                onClick={() => handleSocialAuth('github')}
                className={clsx(
                  'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-midnight-500 transition-colors',
                  'bg-midnight-700 hover:bg-midnight-600',
                  !allowSocialAuth && 'opacity-40 cursor-not-allowed hover:bg-midnight-700'
                )}
              >
                <Github className="w-5 h-5 text-white/70" />
                <span className="text-sm font-medium text-white/80">GitHub</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-midnight-500" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-midnight-800 text-white/40">
                  {allowSocialAuth ? 'or continue with email' : 'Enter the preview credentials'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && allowSignup && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-midnight-700 border border-midnight-500 rounded-lg
                                 text-white placeholder-white/30 focus:outline-none focus:border-electric-cyan/50
                                 focus:ring-1 focus:ring-electric-cyan/30 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-white/60 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-midnight-700 border border-midnight-500 rounded-lg
                               text-white placeholder-white/30 focus:outline-none focus:border-electric-cyan/50
                               focus:ring-1 focus:ring-electric-cyan/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-midnight-700 border border-midnight-500 rounded-lg
                               text-white placeholder-white/30 focus:outline-none focus:border-electric-cyan/50
                               focus:ring-1 focus:ring-electric-cyan/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 
                               hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-electric-cyan hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-electric-red/10 border border-electric-red/30 rounded-lg">
                  <p className="text-sm text-electric-red">{error}</p>
                </div>
              )}

              {!allowSocialAuth && (
                <div className="p-3 bg-midnight-700 border border-midnight-500 rounded-lg text-sm text-white/60">
                  Preview access is limited. Use{' '}
                  <span className="font-mono text-white">{previewCredentialsLabel}</span>
                  {' '}to sign in.
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  'w-full py-3 rounded-lg font-semibold transition-all',
                  'bg-electric-cyan text-midnight-900 hover:bg-electric-cyan/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isLoading && 'animate-pulse'
                )}
              >
                {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            {allowSignup && (
              <>
                <p className="mt-6 text-center text-sm text-white/50">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
                    className="text-electric-cyan hover:underline font-medium"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>

                {mode === 'signup' && (
                  <p className="mt-4 text-center text-xs text-white/30">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-white/50 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-white/50 hover:underline">Privacy Policy</a>
                  </p>
                )}
              </>
            )}

            {!allowSocialAuth && (
              <p className="mt-4 text-center text-xs text-white/40">
                Username: <span className="font-mono text-white">{previewEmail}</span> · Password:{' '}
                <span className="font-mono text-white">{previewPassword}</span>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

