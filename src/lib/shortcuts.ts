import { useEffect } from 'react';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { useSettingsStore } from '../store/settings';

export function useGlobalShortcut(callback: () => void) {
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (!settings.globalShortcut) return;

    const shortcut = settings.globalShortcut.replace('Cmd', 'Command').replace('Ctrl', 'Control');

    register(shortcut, (event) => {
      if (event.state === 'Pressed') {
        callback();
      }
    }).catch(console.error);

    return () => {
      unregister(shortcut).catch(console.error);
    };
  }, [settings.globalShortcut, callback]);
}
