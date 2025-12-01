import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Portfolio, Watchlist, Alert, Asset, Holding, Transaction, WatchlistItem } from '@/types';
import { mockPortfolio, mockWatchlist, mockAlerts, mockAssets, mockTransactions, getAssetById } from '@/data/mockData';

interface AppState {
  // Portfolio
  portfolio: Portfolio;
  transactions: Transaction[];
  
  // Watchlist
  watchlist: Watchlist;
  
  // Alerts
  alerts: Alert[];
  
  // Assets
  assets: Asset[];
  
  // UI State
  selectedAssetId: string | null;
  sidebarOpen: boolean;
  
  // Actions
  setSelectedAsset: (assetId: string | null) => void;
  toggleSidebar: () => void;
  
  // Portfolio Actions
  addHolding: (assetId: string, quantity: number, price: number) => void;
  removeHolding: (holdingId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'asset'>) => void;
  
  // Watchlist Actions
  addToWatchlist: (assetId: string, alertPrice?: number, alertType?: 'above' | 'below', notes?: string) => void;
  removeFromWatchlist: (itemId: string) => void;
  updateWatchlistItem: (itemId: string, updates: Partial<WatchlistItem>) => void;
  
  // Alert Actions
  addAlert: (assetId: string, type: Alert['type'], threshold: number) => void;
  removeAlert: (alertId: string) => void;
  
  // Utility
  recalculatePortfolio: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      portfolio: mockPortfolio,
      transactions: mockTransactions,
      watchlist: mockWatchlist,
      alerts: mockAlerts,
      assets: mockAssets,
      selectedAssetId: null,
      sidebarOpen: true,
      
      // UI Actions
      setSelectedAsset: (assetId) => set({ selectedAssetId: assetId }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Portfolio Actions
      addHolding: (assetId, quantity, price) => {
        const asset = getAssetById(assetId);
        if (!asset) return;
        
        set((state) => {
          const existingHolding = state.portfolio.holdings.find(h => h.assetId === assetId);
          
          let newHoldings: Holding[];
          if (existingHolding) {
            // Update existing holding with new average cost
            const totalQuantity = existingHolding.quantity + quantity;
            const newAverageCost = 
              (existingHolding.quantity * existingHolding.averageCost + quantity * price) / totalQuantity;
            
            newHoldings = state.portfolio.holdings.map(h => 
              h.assetId === assetId 
                ? {
                    ...h,
                    quantity: totalQuantity,
                    averageCost: newAverageCost,
                    totalCost: totalQuantity * newAverageCost,
                    currentValue: totalQuantity * asset.price,
                    profitLoss: (totalQuantity * asset.price) - (totalQuantity * newAverageCost),
                    profitLossPercent: ((asset.price - newAverageCost) / newAverageCost) * 100,
                  }
                : h
            );
          } else {
            // Add new holding
            const newHolding: Holding = {
              id: generateId(),
              assetId,
              asset,
              quantity,
              averageCost: price,
              totalCost: quantity * price,
              currentValue: quantity * asset.price,
              profitLoss: quantity * (asset.price - price),
              profitLossPercent: ((asset.price - price) / price) * 100,
              portfolioId: state.portfolio.id,
            };
            newHoldings = [...state.portfolio.holdings, newHolding];
          }
          
          // Recalculate portfolio totals
          const totalValue = newHoldings.reduce((sum, h) => sum + h.currentValue, 0);
          const totalCost = newHoldings.reduce((sum, h) => sum + h.totalCost, 0);
          
          return {
            portfolio: {
              ...state.portfolio,
              holdings: newHoldings,
              totalValue,
              totalCost,
              totalProfitLoss: totalValue - totalCost,
              totalProfitLossPercent: ((totalValue - totalCost) / totalCost) * 100,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },
      
      removeHolding: (holdingId) => {
        set((state) => {
          const newHoldings = state.portfolio.holdings.filter(h => h.id !== holdingId);
          const totalValue = newHoldings.reduce((sum, h) => sum + h.currentValue, 0);
          const totalCost = newHoldings.reduce((sum, h) => sum + h.totalCost, 0);
          
          return {
            portfolio: {
              ...state.portfolio,
              holdings: newHoldings,
              totalValue,
              totalCost,
              totalProfitLoss: totalValue - totalCost,
              totalProfitLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },
      
      addTransaction: (transaction) => {
        const asset = getAssetById(transaction.assetId);
        if (!asset) return;
        
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          asset,
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        
        // Update holding if it's a buy
        if (transaction.type === 'buy') {
          get().addHolding(transaction.assetId, transaction.quantity, transaction.price);
        }
      },
      
      // Watchlist Actions
      addToWatchlist: (assetId, alertPrice, alertType, notes) => {
        const asset = getAssetById(assetId);
        if (!asset) return;
        
        set((state) => {
          // Check if already in watchlist
          if (state.watchlist.items.find(i => i.assetId === assetId)) {
            return state;
          }
          
          const newItem: WatchlistItem = {
            id: generateId(),
            assetId,
            asset,
            alertPrice,
            alertType,
            notes,
            addedAt: new Date().toISOString(),
          };
          
          return {
            watchlist: {
              ...state.watchlist,
              items: [...state.watchlist.items, newItem],
            },
          };
        });
      },
      
      removeFromWatchlist: (itemId) => {
        set((state) => ({
          watchlist: {
            ...state.watchlist,
            items: state.watchlist.items.filter(i => i.id !== itemId),
          },
        }));
      },
      
      updateWatchlistItem: (itemId, updates) => {
        set((state) => ({
          watchlist: {
            ...state.watchlist,
            items: state.watchlist.items.map(i => 
              i.id === itemId ? { ...i, ...updates } : i
            ),
          },
        }));
      },
      
      // Alert Actions
      addAlert: (assetId, type, threshold) => {
        const asset = getAssetById(assetId);
        if (!asset) return;
        
        const newAlert: Alert = {
          id: generateId(),
          assetId,
          asset,
          type,
          threshold,
          triggered: false,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },
      
      removeAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== alertId),
        }));
      },
      
      // Utility
      recalculatePortfolio: () => {
        set((state) => {
          const holdings = state.portfolio.holdings.map(h => {
            const asset = getAssetById(h.assetId);
            if (!asset) return h;
            
            const currentValue = h.quantity * asset.price;
            return {
              ...h,
              asset,
              currentValue,
              profitLoss: currentValue - h.totalCost,
              profitLossPercent: ((currentValue - h.totalCost) / h.totalCost) * 100,
            };
          });
          
          const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
          const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
          const dayChange = holdings.reduce((sum, h) => sum + (h.asset.change24h * h.quantity), 0);
          
          return {
            portfolio: {
              ...state.portfolio,
              holdings,
              totalValue,
              totalCost,
              totalProfitLoss: totalValue - totalCost,
              totalProfitLossPercent: ((totalValue - totalCost) / totalCost) * 100,
              dayChange,
              dayChangePercent: (dayChange / (totalValue - dayChange)) * 100,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },
    }),
    {
      name: 'investor-pro-storage',
      partialize: (state) => ({
        portfolio: state.portfolio,
        transactions: state.transactions,
        watchlist: state.watchlist,
        alerts: state.alerts,
      }),
    }
  )
);

