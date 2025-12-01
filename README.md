# InvestorPro UltraMax

A professional investment portfolio tracking and research platform built with Next.js 14.

![Dashboard Preview](https://via.placeholder.com/1200x600/0d1117/00d9ff?text=InvestorPro+UltraMax)

## Features

### 📊 Dashboard
- Real-time portfolio value tracking
- Interactive performance charts with multiple timeframes
- Asset allocation visualization (pie charts)
- Top movers (gainers and losers)
- Market news feed with sentiment analysis

### 💼 Portfolio Management
- Track holdings across stocks, crypto, and ETFs
- Add/remove trades with automatic P/L calculation
- Transaction history with full audit trail
- Average cost basis tracking

### 🔬 Research
- Detailed asset analysis
- Fundamental metrics (P/E, P/B, ROE, etc.)
- Historical price charts
- Company information and financials

### 👁️ Watchlist
- Track assets you're interested in
- Set price alerts (above/below thresholds)
- Add notes to remember your investment thesis

### 📈 Markets
- Browse all available assets
- Sort and filter by type, price, volume, market cap
- Real-time market indices

### ⚖️ Compare
- Side-by-side asset comparison
- Normalized performance charts
- Fundamentals comparison table

### 🔔 Alerts
- Price target alerts
- Percentage change alerts
- Alert history and management

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd InvestorProUltraMax

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── portfolio/         # Portfolio management
│   ├── research/          # Asset research
│   ├── watchlist/         # Watchlist
│   ├── markets/           # Markets overview
│   ├── compare/           # Asset comparison
│   ├── alerts/            # Price alerts
│   └── settings/          # User settings
├── components/
│   ├── layout/            # Sidebar, Header, MainLayout
│   ├── charts/            # Portfolio & Allocation charts
│   ├── dashboard/         # Dashboard components
│   └── research/          # Research components
├── data/
│   └── mockData.ts        # Mock data for development
├── store/
│   └── useStore.ts        # Zustand store
└── types/
    └── index.ts           # TypeScript types
```

## Current Limitations / Future Improvements

### 🔧 To Be Implemented

1. **Real API Integration**
   - Connect to real market data APIs (Alpha Vantage, Yahoo Finance, CoinGecko)
   - Real-time price updates via WebSocket

2. **Backend & Database**
   - User authentication (NextAuth.js)
   - PostgreSQL/MongoDB for persistent storage
   - API routes for CRUD operations

3. **Advanced Features**
   - Portfolio performance analytics (Sharpe ratio, max drawdown)
   - Dividend tracking
   - Tax lot management
   - Import from brokerage CSV
   - Multiple portfolio support
   - Mobile responsive optimizations

4. **Notifications**
   - Push notifications for price alerts
   - Email alerts
   - SMS integration

5. **Social Features**
   - Share portfolio performance
   - Community watchlists
   - Investment ideas

## Environment Variables

Create a `.env.local` file for API keys (when integrating real APIs):

```env
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_key_here
NEXT_PUBLIC_COINGECKO_KEY=your_key_here
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
```

## License

MIT License - feel free to use this project for learning or as a starting point for your own investment platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

