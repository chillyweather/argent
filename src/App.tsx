import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TopBar } from './components/TopBar';
import { Editor } from './components/Editor';
import { SettingsPanel } from './components/SettingsPanel';
import { useSettingsStore } from './store/settings';
import { useStatusStore } from './store/status';
import { getStatusColor, parseErrorStatus } from './lib/status';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings } = useSettingsStore();
  const { status, setStatus, setError } = useStatusStore();
  const [savedAnimation, setSavedAnimation] = useState(false);

  useEffect(() => {
    if (!settings.sbUrl || !settings.sbToken) {
      setStatus('Config Missing');
    } else if (status !== 'Saving' && status !== 'Saved') {
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
    } catch (err) {
      const errorStr = String(err);
      const errorStatus = parseErrorStatus(errorStr);
      setStatus(errorStatus);
      setError(errorStr);
    }
  }, [settings, status, setStatus, setError]);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    const unlisten = appWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      await appWindow.hide();
    });

    return () => {
      unlisten.then((cleanup) => cleanup()).catch(console.error);
    };
  }, []);

  useEffect(() => {
    invoke('set_always_on_top', { alwaysOnTop: settings.alwaysOnTop }).catch(console.error);
  }, [settings.alwaysOnTop]);

  const displayColor = savedAnimation ? 'bg-green-400' : getStatusColor(status);

  return (
    <div className="flex flex-col h-screen bg-argent-bg text-argent-text">
      <TopBar onSettingsClick={() => setShowSettings(true)} />

      <Editor
        onSave={handleSave}
        isSaving={status === 'Saving'}
        statusColor={displayColor}
        vimEnabled={settings.vimEnabled}
      />

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
