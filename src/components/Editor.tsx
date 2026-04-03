import { useState, useEffect, useRef, useCallback } from 'react';
import { useDraftStore } from '../store/draft';
import { MarkdownEditor } from './MarkdownEditor';

interface EditorProps {
  onSave: (content: string) => void;
  onSaved: () => void;
  isSaving: boolean;
  statusColor: string;
  statusText: string;
}

export function Editor({ onSave, onSaved, isSaving, statusColor, statusText }: EditorProps) {
  const [content, setContent] = useState('');
  const contentRef = useRef(content);
  const { setDraft, clearDraft, recoverDraft } = useDraftStore();
  const autosaveIntervalRef = useRef<number | null>(null);

  contentRef.current = content;

  // Recover draft on mount
  useEffect(() => {
    const recovered = recoverDraft();
    if (recovered) {
      setContent(recovered.content);
    }
  }, [recoverDraft]);

  // Autosave draft every 2 seconds
  useEffect(() => {
    autosaveIntervalRef.current = window.setInterval(() => {
      setDraft(contentRef.current);
    }, 2000);

    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [setDraft]);

  const handleChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleSave = useCallback(async () => {
    const text = contentRef.current;
    if (!text.trim()) return;
    try {
      await onSave(text);
      setContent('');
      clearDraft();
    } catch {
      // Save failed — keep text in editor
    }
    onSaved();
  }, [onSave, onSaved, clearDraft]);

  return (
    <div className="flex flex-col flex-1 px-4 pt-3 pb-3 gap-2 min-h-0">
      <MarkdownEditor
        value={content}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
          <span className="text-xs text-argent-text-muted">{statusText}</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 text-xs font-medium rounded border border-argent-border text-argent-text-muted hover:border-argent-text hover:text-argent-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : 'Save'}
          <span className="ml-2 opacity-50">⌘↵</span>
        </button>
      </div>
    </div>
  );
}
