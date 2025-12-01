import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Terminal-inspired dark theme with electric accents
        midnight: {
          900: '#0a0c10',
          800: '#0d1117',
          700: '#161b22',
          600: '#21262d',
          500: '#30363d',
        },
        electric: {
          cyan: '#00d9ff',
          green: '#00ff88',
          red: '#ff3366',
          orange: '#ff9500',
          purple: '#a855f7',
          yellow: '#ffd60a',
        },
        gain: '#00ff88',
        loss: '#ff3366',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': `linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)`,
        'glow-gradient': 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-red': '0 0 20px rgba(255, 51, 102, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config

