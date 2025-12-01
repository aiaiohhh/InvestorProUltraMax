import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InvestorPro UltraMax | Professional Investment Platform',
  description: 'Track your investments, research assets, and manage your portfolio with real-time data and powerful analytics.',
  keywords: ['investment', 'portfolio', 'stocks', 'crypto', 'ETF', 'trading', 'finance'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

