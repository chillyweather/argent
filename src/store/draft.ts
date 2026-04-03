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
      },
      setDraft: (content) =>
        set({
          draft: {
            content,
          },
        }),
      clearDraft: () =>
        set({
          draft: {
            content: '',
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
