import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TopBar } from './components/TopBar';
import { Editor } from './components/Editor';
import { RecentNotes } from './components/RecentNotes';
import { SettingsPanel } from './components/SettingsPanel';
import { useSettingsStore } from './store/settings';
import { useStatusStore } from './store/status';
import { getStatusColor, getStatusText } from './lib/status';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings } = useSettingsStore();
  const { status, setStatus, setError } = useStatusStore();
  const [savedAnimation, setSavedAnimation] = useState(false);

  useEffect(() => {
    if (!settings.sbUrl || !settings.sbToken) {
      setStatus('Config Missing');
    } else {
      setStatus('Ready');
    }
  }, [settings.sbUrl, settings.sbToken, setStatus]);

  const handleSave = useCallback(async (content: string) => {
    if (status === 'Saving') return;

    if (!content.trim()) return;

    if (!settings.sbUrl || !settings.sbToken) {
      setStatus('Config Missing');
      setShowSettings(true);
      return;
    }

    setStatus('Saving');

    try {
      await invoke<{ path: string; url: string }>('save_to_sb', {
        content,
        sbUrl: settings.sbUrl,
        sbToken: settings.sbToken,
      });

      setStatus('Saved');
      setSavedAnimation(true);
      setTimeout(() => {
        setSavedAnimation(false);
        setStatus('Ready');
      }, 2000);

      if (settings.hideAfterSave) {
        const appWindow = getCurrentWindow();
        await appWindow.hide();
      }
    } catch (err) {
      const errorStr = String(err);
      if (errorStr.includes('Unauthorized') || errorStr.includes('Auth')) {
        setStatus('Auth Error');
      } else {
        setStatus('Server Error');
      }
      setError(errorStr);
    }
  }, [settings, status, setStatus, setError]);

  useEffect(() => {
    const setupWindow = async () => {
      const appWindow = getCurrentWindow();
      appWindow.onCloseRequested(async (event) => {
        event.preventDefault();
        await appWindow.hide();
      });

      if (settings.alwaysOnTop) {
        await invoke('set_always_on_top', { alwaysOnTop: true });
      }
    };
    setupWindow().catch(console.error);
  }, []);

  const displayText = savedAnimation ? 'Saved' : getStatusText(status);
  const displayColor = savedAnimation ? 'bg-green-400' : getStatusColor(status);

  return (
    <div className="flex flex-col h-screen bg-argent-bg text-argent-text">
      <TopBar
        onSettingsClick={() => setShowSettings(true)}
        statusColor={displayColor}
        statusText={displayText}
      />

      <Editor onSave={handleSave} onSaved={() => {}} isSaving={status === 'Saving'} />

      <RecentNotes />

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
