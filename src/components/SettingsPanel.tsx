import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../store/settings';
import { useStatusStore } from '../store/status';
import { parseErrorStatus } from '../lib/status';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSetting } = useSettingsStore();
  const { setStatus } = useStatusStore();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!settings.sbUrl || !settings.sbToken) {
      setTestResult({ success: false, message: 'Please fill in URL and Token' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const result = await invoke<string>('test_connection', {
        sbUrl: settings.sbUrl,
        sbToken: settings.sbToken,
      });
      setTestResult({ success: true, message: result });
      setStatus('Ready');
    } catch (err) {
      const errorStr = String(err);
      setTestResult({ success: false, message: errorStr });
      setStatus(parseErrorStatus(errorStr));
    } finally {
      setTesting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-argent-bg border border-argent-border rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-argent-border">
          <h2 className="text-sm font-medium text-argent-text">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-argent-bg-secondary text-argent-text-muted hover:text-argent-text transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-argent-text-muted mb-1">
              SilverBullet URL
            </label>
            <input
              type="url"
              value={settings.sbUrl}
              onChange={(e) => updateSetting('sbUrl', e.target.value)}
              placeholder="https://notes.example.com"
              className="w-full px-3 py-2 bg-argent-bg-secondary border border-argent-border rounded text-sm text-argent-text focus:outline-none focus:ring-2 focus:ring-argent-accent focus:border-transparent placeholder:text-argent-text-muted"
            />
          </div>

          <div>
            <label className="block text-xs text-argent-text-muted mb-1">
              API Token
            </label>
            <input
              type="password"
              value={settings.sbToken}
              onChange={(e) => updateSetting('sbToken', e.target.value)}
              placeholder="Your SilverBullet API token"
              className="w-full px-3 py-2 bg-argent-bg-secondary border border-argent-border rounded text-sm text-argent-text focus:outline-none focus:ring-2 focus:ring-argent-accent focus:border-transparent placeholder:text-argent-text-muted"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-argent-text">Vim mode</label>
            <button
              onClick={() => updateSetting('vimEnabled', !settings.vimEnabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                settings.vimEnabled ? 'bg-argent-accent' : 'bg-argent-bg-secondary'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  settings.vimEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full py-2 bg-argent-bg-secondary border border-argent-border rounded text-sm text-argent-text hover:border-argent-accent transition-colors disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <div
              className={`text-xs p-2 rounded ${
                testResult.success
                  ? 'bg-green-400/10 text-green-400'
                  : 'bg-red-400/10 text-red-400'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
