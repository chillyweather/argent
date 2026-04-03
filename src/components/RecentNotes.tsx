import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import { useSettingsStore } from '../store/settings';
import { RecentNote } from '../types';
import { formatPath } from '../lib/path';

interface RecentNotesProps {
  refreshKey?: number;
}

export function RecentNotes({ refreshKey }: RecentNotesProps) {
  const { settings } = useSettingsStore();
  const [notes, setNotes] = useState<RecentNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!settings.sbUrl || !settings.sbToken) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke<{ notes: RecentNote[] }>('fetch_recent_notes', {
        sbUrl: settings.sbUrl,
        sbToken: settings.sbToken,
      });
      setNotes(result.notes);
    } catch {
      setError('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [settings.sbUrl, settings.sbToken, refreshKey]);

  const handleOpenNote = async (url: string) => {
    try {
      await open(url);
    } catch (err) {
      console.error('Failed to open note:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 pb-3">
        <div className="text-xs text-argent-text-muted">Loading recent notes...</div>
      </div>
    );
  }

  if (error || notes.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-3">
      <div className="text-xs text-argent-text-muted/60 mb-1.5">Recent</div>
      <div className="flex flex-wrap gap-1.5">
        {notes.map((note) => (
          <button
            key={note.path}
            onClick={() => handleOpenNote(note.url)}
            className="px-2 py-1 text-xs bg-argent-bg-secondary rounded text-argent-text-muted hover:text-argent-text transition-colors"
            title={note.path}
          >
            {formatPath(note.path)}
          </button>
        ))}
      </div>
    </div>
  );
}
