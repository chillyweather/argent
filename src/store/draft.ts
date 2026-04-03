import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Draft } from '../types';

interface DraftStore {
  draft: Draft;
  setDraft: (content: string) => void;
  clearDraft: () => void;
  recoverDraft: () => Draft | null;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      draft: {
        content: '',
        lastUpdated: Date.now(),
      },
      setDraft: (content) =>
        set({
          draft: {
            content,
            lastUpdated: Date.now(),
          },
        }),
      clearDraft: () =>
        set({
          draft: {
            content: '',
            lastUpdated: Date.now(),
          },
        }),
      recoverDraft: () => {
        const { draft } = get();
        return draft.content.trim() ? draft : null;
      },
    }),
    {
      name: 'argent-draft',
    }
  )
);
