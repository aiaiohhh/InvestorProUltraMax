'use client';

import { useStore } from '@/store/useStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { clsx } from 'clsx';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main className={clsx(
        'pt-16 min-h-screen transition-all duration-300',
        // Desktop: sidebar affects layout
        'md:pl-64',
        !sidebarOpen && 'md:pl-20',
        // Mobile: no sidebar offset
        'pl-0'
      )}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

