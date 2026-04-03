import { useRef, useEffect } from 'react';
import { useDraftStore } from '../store/draft';

interface EditorProps {
  onSave: (content: string) => void;
  onSaved: () => void;
  isSaving: boolean;
  statusColor: string;
  statusText: string;
}

export function Editor({ onSave, onSaved, isSaving, statusColor, statusText }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setDraft, clearDraft, recoverDraft } = useDraftStore();
  const autosaveIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const recovered = recoverDraft();
    if (recovered && textareaRef.current) {
      textareaRef.current.value = recovered.content;
      textareaRef.current.focus();
    } else if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [recoverDraft]);

  useEffect(() => {
    autosaveIntervalRef.current = window.setInterval(() => {
      if (textareaRef.current) {
        setDraft(textareaRef.current.value);
      }
    }, 2000);

    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [setDraft]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
  };

  const handleSave = async () => {
    const content = textareaRef.current?.value || '';
    try {
      await onSave(content);
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      clearDraft();
    } catch {
      // Save failed — keep text in editor
    }
    onSaved();
  };

  return (
    <div className="flex flex-col flex-1 px-4 pt-3 pb-3 gap-2">
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Start typing…"
        className="flex-1 w-full bg-transparent text-argent-text font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-argent-text-muted/50"
        disabled={isSaving}
        autoFocus
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
