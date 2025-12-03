import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  isDevPreviewMode,
  previewEmail,
  previewName,
  previewPassword,
} from '@/config/authConfig';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const PREVIEW_USER_ID = 'preview-user';
const normalizedPreviewEmail = previewEmail.toLowerCase();

const buildPreviewUser = (): User => ({
  id: PREVIEW_USER_ID,
  email: previewEmail,
  name: previewName,
  createdAt: new Date().toISOString(),
});

const credentialsMatch = (email: string, password: string) => {
  if (!email || !password) return false;
  return email.trim().toLowerCase() === normalizedPreviewEmail && password === previewPassword;
};

const baseStore: StateCreator<AuthState> = (set, get) => ({
  user: isDevPreviewMode ? buildPreviewUser() : null,
  isAuthenticated: isDevPreviewMode,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!credentialsMatch(email, password)) {
      set({ isLoading: false });
      return false;
    }

    set({ user: buildPreviewUser(), isAuthenticated: true, isLoading: false });
    return true;
  },

  signup: async (email: string, password: string, _name?: string) => {
    // For the protected preview we treat signup as an alias to login
    return get().login(email, password);
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },
});

// Create the store with or without persistence based on dev mode
export const useAuthStore = isDevPreviewMode
  ? create<AuthState>()(baseStore)
  : create<AuthState>()(
      persist(baseStore, {
        name: 'investor-pro-auth',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      })
    );

