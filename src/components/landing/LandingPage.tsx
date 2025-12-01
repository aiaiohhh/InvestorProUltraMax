'use client';

import { useState } from 'react';
import { HeroBackground } from './HeroBackground';
import { AnimatedShowcase } from './AnimatedShowcase';
import { 
  Zap, ArrowRight, Check, BarChart3, Brain, LineChart, 
  Shield, Globe, Bell, TrendingUp, Users, Award,
  ChevronRight, Play, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Link from 'next/link';

const features = [
  {
    icon: LineChart,
    title: 'Real-time Data',
    description: 'Live market data for stocks, crypto, and ETFs with millisecond updates.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Machine learning models analyze patterns and predict market movements.',
  },
  {
    icon: BarChart3,
    title: 'Fair Value Analysis',
    description: 'Proprietary algorithms calculate intrinsic value for smarter decisions.',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted and protected with enterprise-level security.',
  },
];

const stats = [
  { value: '50K+', label: 'Active Investors' },
  { value: '$2.5B', label: 'Assets Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '150+', label: 'Countries' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Portfolio Manager',
    company: 'Apex Capital',
    content: 'InvestorProUltraMax transformed how I analyze stocks. The AI insights have helped me identify opportunities I would have missed.',
    rating: 5,
  },
  {
    name: 'Michael Roberts',
    role: 'Day Trader',
    company: 'Independent',
    content: 'The real-time alerts and fair value estimates are game-changers. I\'ve seen a 40% improvement in my trading decisions.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'Financial Advisor',
    company: 'Wealth Partners',
    content: 'My clients love the portfolio tracking features. The professional reports make client meetings so much more productive.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Track up to 10 holdings',
      'Basic portfolio analytics',
      'Daily market updates',
      'Community support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For serious investors',
    features: [
      'Unlimited holdings',
      'Real-time data & alerts',
      'AI-powered insights',
      'Advanced analytics',
      'Fair value estimates',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'per month',
    description: 'For institutions',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated account manager',
      'API access',
      'White-label options',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-midnight-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-midnight-900/80 backdrop-blur-md border-b border-midnight-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-electric-orange">
                <span className="text-2xl">≡</span>
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-electric-orange">InvestorPro</span>
                <span className="text-white">UltraMax</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonials</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onLogin}
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={onSignUp}
                className="px-5 py-2 bg-electric-orange hover:bg-electric-orange/90 text-white font-semibold 
                           rounded-lg transition-all hover:scale-105"
              >
                Sign Up
              </button>
              <div className="w-2 h-2 rounded-full bg-electric-green animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/50 via-transparent to-midnight-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-900/30 via-transparent to-midnight-900/30" />
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Invest Like</span>
              <br />
              <span className="text-electric-orange">The Pros</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
              AI-powered stock analysis, real-time fair value estimates, and institutional-grade 
              screening tools. <span className="text-white font-medium">Make smarter investment decisions.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onSignUp}
                className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 
                           text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
              >
                <Zap className="w-5 h-5" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 
                           text-white font-semibold rounded-xl border border-white/20 
                           transition-all hover:border-white/40"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {['Real-time data', 'Fair value analysis', 'AI-powered insights', 'No credit card required'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-white/60">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-5 h-5 rotate-90" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-midnight-500/30 bg-midnight-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-4xl font-bold text-electric-cyan mb-2">
                  {stat.value}
                </div>
                <div className="text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-midnight-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="text-electric-cyan">Succeed</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Professional-grade tools that give you the edge in any market condition.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-midnight-800/50 rounded-2xl border border-midnight-500/30 
                           hover:border-electric-cyan/30 transition-all hover:bg-midnight-800"
              >
                <div className="w-12 h-12 rounded-xl bg-electric-cyan/10 flex items-center justify-center mb-4
                                group-hover:bg-electric-cyan/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-electric-cyan" />
                </div>
                <h3 className="font-semibold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-24 bg-midnight-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Powerful Dashboard, <span className="text-electric-orange">Simple Interface</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              See your entire portfolio at a glance with our intuitive dashboard.
            </p>
          </motion.div>

          {/* Animated Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <AnimatedShowcase />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-midnight-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Trusted by <span className="text-electric-green">Thousands</span> of Investors
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              See what our users have to say about their experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-midnight-800/50 rounded-2xl border border-midnight-500/30"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-electric-yellow text-electric-yellow" />
                  ))}
                </div>
                <p className="text-white/80 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-cyan to-electric-purple 
                                  flex items-center justify-center text-sm font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/50">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-midnight-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Simple, Transparent <span className="text-electric-purple">Pricing</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={clsx(
                  'relative p-6 rounded-2xl border transition-all',
                  plan.highlighted
                    ? 'bg-gradient-to-b from-electric-cyan/10 to-midnight-800 border-electric-cyan/30 scale-105'
                    : 'bg-midnight-800/50 border-midnight-500/30'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-electric-cyan 
                                  text-midnight-900 text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-xl text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/50">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-white/50 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-electric-green flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onSignUp}
                  className={clsx(
                    'w-full py-3 rounded-xl font-semibold transition-all',
                    plan.highlighted
                      ? 'bg-electric-cyan text-midnight-900 hover:bg-electric-cyan/90'
                      : 'bg-midnight-700 text-white hover:bg-midnight-600'
                  )}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-midnight-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Ready to Start <span className="text-electric-orange">Investing Smarter</span>?
            </h2>
            <p className="text-white/60 mb-8">
              Join thousands of investors who trust InvestorProUltraMax for their portfolio management.
            </p>
            <button
              onClick={onSignUp}
              className="inline-flex items-center gap-3 px-8 py-4 bg-electric-orange hover:bg-electric-orange/90 
                         text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-electric-orange/25"
            >
              <Zap className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-midnight-800/50 border-t border-midnight-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-electric-orange text-2xl">≡</span>
              <span className="font-display font-bold">
                <span className="text-electric-orange">InvestorPro</span>
                <span className="text-white">UltraMax</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-white/30">
              © 2024 InvestorProUltraMax. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

