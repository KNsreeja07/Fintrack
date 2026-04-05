import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, TransactionInsert } from '../lib/database.types';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'viewer';
export type TimeRange = 'week' | 'month' | 'year';

interface AppState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  userRole: UserRole;
  darkMode: boolean;
  timeRange: TimeRange;
  sidebarOpen: boolean;

  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: TransactionInsert) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setUserRole: (role: UserRole) => void;
  toggleDarkMode: () => void;
  setTimeRange: (range: TimeRange) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      userRole: 'admin',
      darkMode: false,
      timeRange: 'month',
      sidebarOpen: true,

      fetchTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

          if (error) throw error;
          set({ transactions: data || [], isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch transactions',
            isLoading: false
          });
        }
      },

      addTransaction: async (transaction: TransactionInsert) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

          if (error) throw error;

          const currentTransactions = get().transactions;
          set({
            transactions: [data, ...currentTransactions],
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add transaction',
            isLoading: false
          });
        }
      },

      updateTransaction: async (id: string, transaction: Partial<Transaction>) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('transactions')
            .update({ ...transaction, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          const currentTransactions = get().transactions;
          set({
            transactions: currentTransactions.map(t => t.id === id ? data : t),
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update transaction',
            isLoading: false
          });
        }
      },

      deleteTransaction: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

          if (error) throw error;

          const currentTransactions = get().transactions;
          set({
            transactions: currentTransactions.filter(t => t.id !== id),
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete transaction',
            isLoading: false
          });
        }
      },

      setUserRole: (role: UserRole) => set({ userRole: role }),

      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        set({ darkMode: newMode });
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setTimeRange: (range: TimeRange) => set({ timeRange: range }),

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
    }),
    {
      name: 'finance-dashboard-storage',
      partialize: (state) => ({
        userRole: state.userRole,
        darkMode: state.darkMode,
        timeRange: state.timeRange,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
