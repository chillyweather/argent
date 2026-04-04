import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import { useSettingsStore } from '../store/settings';
import { useStatusStore } from '../store/status';

const isMac = /Mac/i.test(navigator.userAgent);

interface TopBarProps {
  onSettingsClick: () => void;
}

export function TopBar({ onSettingsClick }: TopBarProps) {
  const { settings, updateSetting } = useSettingsStore();
  const { setError } = useStatusStore();
  const [isPinning, setIsPinning] = useState(false);

  const handlePin = async () => {
    setIsPinning(true);
    try {
      const newValue = !settings.alwaysOnTop;
      await invoke('set_always_on_top', { alwaysOnTop: newValue });
      updateSetting('alwaysOnTop', newValue);
    } catch (error) {
      setError(String(error));
      console.error('Failed to set always on top:', error);
    } finally {
      setIsPinning(false);
    }
  };

  const handleOpenSB = async () => {
    if (settings.sbUrl) {
      await open(settings.sbUrl);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className={`flex items-center justify-between ${isMac ? 'pl-20' : 'pl-3'} pr-3 py-2.5 select-none`}
    >
      <div data-tauri-drag-region className="flex-1" />
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleOpenSB}
          disabled={!settings.sbUrl}
          className="p-1.5 rounded text-argent-text-muted hover:bg-argent-bg hover:text-argent-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Open SilverBullet"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </button>
        <button
          onClick={handlePin}
          disabled={isPinning}
          className={`p-1.5 rounded transition-colors ${
            settings.alwaysOnTop
              ? 'text-argent-accent hover:bg-argent-bg'
              : 'text-argent-text-muted hover:bg-argent-bg hover:text-argent-text'
          }`}
          title={settings.alwaysOnTop ? 'Unpin from top' : 'Pin to top'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={settings.alwaysOnTop ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        </button>
        <button
          onClick={onSettingsClick}
          className="p-1.5 rounded text-argent-text-muted hover:bg-argent-bg hover:text-argent-text transition-colors"
          title="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
