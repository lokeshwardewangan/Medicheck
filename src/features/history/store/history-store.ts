import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SymptomCheckHistory } from '@/types';

interface HistoryState {
  histories: SymptomCheckHistory[];
  addHistory: (history: Omit<SymptomCheckHistory, 'id' | 'createdAt'>) => void;
  updateFeedback: (historyId: string, feedback: 'helpful' | 'not_helpful') => void;
  deleteHistory: (historyId: string) => void;
  clearAllHistory: () => void;
  getHistoryById: (id: string) => SymptomCheckHistory | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      histories: [],

      addHistory: (history) =>
        set((state) => ({
          histories: [
            {
              ...history,
              id: Math.random().toString(36).substring(2, 15),
              createdAt: new Date(),
            },
            ...state.histories,
          ],
        })),

      updateFeedback: (historyId, feedback) =>
        set((state) => ({
          histories: state.histories.map((h) => (h.id === historyId ? { ...h, feedback } : h)),
        })),

      deleteHistory: (historyId) =>
        set((state) => ({
          histories: state.histories.filter((h) => h.id !== historyId),
        })),

      clearAllHistory: () => set({ histories: [] }),

      getHistoryById: (id) => {
        return get().histories.find((h) => h.id === id);
      },
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
