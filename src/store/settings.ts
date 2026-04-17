import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings } from '../types';

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const defaultSettings: Settings = {
  sbUrl: '',
  sbToken: '',
  alwaysOnTop: false,
  vimEnabled: false,
  livePreviewEnabled: true,
  theme: 'system',
  mode: 'scratchpad',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (settings) => set({ settings }),
      updateSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),
    }),
    {
      name: 'argent-settings',
      merge: (persisted, current) => {
        const p = persisted as { settings?: Partial<Settings> };
        return {
          ...current,
          settings: { ...current.settings, ...p.settings },
        };
      },
    }
  )
);
