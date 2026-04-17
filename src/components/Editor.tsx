import { useState, useEffect, useRef, useCallback } from 'react';
import { useDraftStore } from '../store/draft';
import { MarkdownEditor } from './MarkdownEditor';
import { AppMode } from '../types';

const isMac = /Mac/i.test(navigator.userAgent);

interface EditorProps {
  onSave: (content: string) => void;
  isSaving: boolean;
  statusColor: string;
  vimEnabled: boolean;
  livePreviewEnabled: boolean;
  mode: AppMode;
  initialValue?: string | null;
  onExternalChange?: (content: string) => void;
}

export function Editor({ onSave, isSaving, statusColor, vimEnabled, livePreviewEnabled, mode, initialValue, onExternalChange }: EditorProps) {
  const [content, setContent] = useState('');
  const contentRef = useRef(content);
  const { setDraft, clearDraft, recoverDraft } = useDraftStore();
  const autosaveIntervalRef = useRef<number | null>(null);

  contentRef.current = content;

  useEffect(() => {
    if (mode === 'scratchpad') {
      const recovered = recoverDraft();
      if (recovered) {
        setContent(recovered.content);
      }
    } else if (mode === 'todo' && initialValue !== null && initialValue !== undefined) {
      setContent(initialValue);
    }
  }, [mode, initialValue, recoverDraft]);

  useEffect(() => {
    if (mode === 'scratchpad') {
      autosaveIntervalRef.current = window.setInterval(() => {
        setDraft(contentRef.current);
      }, 2000);

      return () => {
        if (autosaveIntervalRef.current) {
          clearInterval(autosaveIntervalRef.current);
        }
      };
    }
  }, [mode, setDraft]);

  const handleChange = useCallback((value: string) => {
    setContent(value);
    if (mode === 'todo' && onExternalChange) {
      onExternalChange(value);
    }
  }, [mode, onExternalChange]);

  const handleSave = useCallback(async () => {
    const text = contentRef.current;
    if (!text.trim()) return;
    try {
      await onSave(text);
      if (mode === 'scratchpad') {
        setContent('');
        clearDraft();
      }
    } catch {
      // Save failed — keep text in editor
    }
  }, [onSave, clearDraft, mode]);

  return (
    <div className="flex flex-col flex-1 px-4 pt-3 pb-3 gap-2 min-h-0">
      <MarkdownEditor
        value={content}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={isSaving}
        vimEnabled={vimEnabled}
        livePreviewEnabled={livePreviewEnabled}
      />
      <div className="flex items-center justify-between">
        <div>
          {statusColor && (
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
          )}
        </div>
        {mode === 'scratchpad' && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-medium rounded border border-argent-border text-argent-text-muted hover:border-argent-text hover:text-argent-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : 'Save'}
            <span className="ml-2 opacity-50">{isMac ? '⌘↵' : 'Ctrl↵'}</span>
          </button>
        )}
        {mode === 'todo' && (
          <span className="text-xs text-argent-text-muted opacity-50">todo.md</span>
        )}
      </div>
    </div>
  );
}