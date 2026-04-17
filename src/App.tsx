import { useState, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TopBar } from './components/TopBar';
import { Editor } from './components/Editor';
import { SettingsPanel } from './components/SettingsPanel';
import { useSettingsStore } from './store/settings';
import { useStatusStore } from './store/status';
import { getStatusColor, parseErrorStatus } from './lib/status';
import { AppMode } from './types';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSetting } = useSettingsStore();
  const { status, setStatus, setError } = useStatusStore();
  const [todoContent, setTodoContent] = useState<string | null>(null);
  const todoSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!settings.sbUrl || !settings.sbToken) {
      setStatus('Config Missing');
    } else if (status !== 'Saving' && status !== 'Saved') {
      setStatus('Ready');
    }
  }, [settings.sbUrl, settings.sbToken, setStatus]);

  useEffect(() => {
    if (!settings.sbUrl || !settings.sbToken) return;
    if (settings.mode !== 'todo') return;

    invoke<string>('fetch_note', {
      path: 'todo.md',
      sbUrl: settings.sbUrl,
      sbToken: settings.sbToken,
    }).then((content) => {
      setTodoContent(content);
    }).catch((err) => {
      console.error('Failed to fetch todo.md:', err);
      setTodoContent('');
    });
  }, [settings.mode, settings.sbUrl, settings.sbToken]);

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
      setTimeout(() => {
        setStatus('Ready');
      }, 2000);
    } catch (err) {
      const errorStr = String(err);
      const errorStatus = parseErrorStatus(errorStr);
      setStatus(errorStatus);
      setError(errorStr);
    }
  }, [settings, status, setStatus, setError]);

  const handleTodoChange = useCallback((content: string) => {
    setTodoContent(content);

    if (todoSaveTimerRef.current !== null) {
      clearTimeout(todoSaveTimerRef.current);
    }

    todoSaveTimerRef.current = window.setTimeout(async () => {
      if (!settings.sbUrl || !settings.sbToken) return;

      try {
        await invoke('save_note', {
          path: 'todo.md',
          content,
          sbUrl: settings.sbUrl,
          sbToken: settings.sbToken,
        });
      } catch (err) {
        console.error('Auto-save todo failed:', err);
      }
    }, 1500);
  }, [settings.sbUrl, settings.sbToken]);

  const handleModeSwitch = useCallback((mode: AppMode) => {
    if (todoSaveTimerRef.current !== null) {
      clearTimeout(todoSaveTimerRef.current);
    }
    updateSetting('mode', mode);
  }, [updateSetting]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const nextMode: AppMode = settings.mode === 'scratchpad' ? 'todo' : 'scratchpad';
        handleModeSwitch(nextMode);
      }
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSettings((v) => !v);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.mode, handleModeSwitch]);

  const displayColor = getStatusColor(status);

  return (
    <div className="flex flex-col h-screen bg-argent-bg text-argent-text">
      <TopBar onSettingsClick={() => setShowSettings(true)} onModeSwitch={handleModeSwitch} />

      {settings.mode === 'scratchpad' ? (
        <Editor
          onSave={handleSave}
          isSaving={status === 'Saving'}
          statusColor={displayColor}
          vimEnabled={settings.vimEnabled}
          livePreviewEnabled={settings.livePreviewEnabled}
          mode="scratchpad"
        />
      ) : (
        <Editor
          onSave={handleSave}
          isSaving={status === 'Saving'}
          statusColor={displayColor}
          vimEnabled={settings.vimEnabled}
          livePreviewEnabled={settings.livePreviewEnabled}
          mode="todo"
          initialValue={todoContent}
          onExternalChange={handleTodoChange}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;