import { create } from 'zustand';
import { AppStatus } from '../types';

interface StatusStore {
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
  errorMessage: string | null;
  setError: (message: string) => void;
  clearError: () => void;
}

export const useStatusStore = create<StatusStore>((set) => ({
  status: 'Ready',
  setStatus: (status) => set({ status, errorMessage: null }),
  errorMessage: null,
  setError: (message) => set({ errorMessage: message }),
  clearError: () => set({ errorMessage: null }),
}));
