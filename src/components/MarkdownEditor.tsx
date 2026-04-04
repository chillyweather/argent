import { useRef, useEffect, useCallback } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history } from "@codemirror/commands";
import { vim } from "@replit/codemirror-vim";
import { editorTheme } from "../lib/codemirror/theme";
import { livePreview } from "../lib/codemirror/live-preview";

const vimCompartment = new Compartment();

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  autoFocus?: boolean;
  vimEnabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  isSaving = false,
  autoFocus = true,
  vimEnabled = false,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onSaveRef = useRef(onSave);
  const onChangeRef = useRef(onChange);
  const isSavingRef = useRef(isSaving);

  onSaveRef.current = onSave;
  onChangeRef.current = onChange;
  isSavingRef.current = isSaving;

  const handleSave = useCallback((_view: EditorView): boolean => {
    if (isSavingRef.current) return false;
    onSaveRef.current();
    return true;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        vimCompartment.of(vimEnabled ? vim() : []),
        history(),
        markdown(),
        keymap.of([
          ...defaultKeymap,
          { key: "Mod-Enter", run: handleSave },
        ]),
        EditorView.lineWrapping,
        editorTheme,
        livePreview,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.editable.of(!isSaving),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    // Direct keydown handler for Cmd/Ctrl+Enter — bypasses CM keymaps (including vim)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        if (!isSavingRef.current) {
          onSaveRef.current();
        }
      }
    };
    view.dom.addEventListener("keydown", onKeyDown);

    viewRef.current = view;

    if (autoFocus) {
      view.focus();
    }

    return () => {
      view.dom.removeEventListener("keydown", onKeyDown);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update content when value changes externally (draft recovery)
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  // Update editable state
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: [],
      });
      viewRef.current.contentDOM.contentEditable = isSaving
        ? "false"
        : "true";
    }
  }, [isSaving]);

  // Toggle vim mode
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: vimCompartment.reconfigure(vimEnabled ? vim() : []),
      });
    }
  }, [vimEnabled]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden cm-container"
    />
  );
}
