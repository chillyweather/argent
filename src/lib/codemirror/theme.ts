import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "16px",
    backgroundColor: "transparent",
    color: "var(--argent-text)",
  },
  ".cm-scroller": {
    fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    overflow: "auto",
  },
  ".cm-content": {
    padding: "0",
    caretColor: "var(--argent-text)",
    lineHeight: "1.6",
  },
  ".cm-line": {
    padding: "1px 0",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-selectionBackground": {
    backgroundColor: "var(--argent-accent) !important",
    opacity: "0.25",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--argent-accent) !important",
    opacity: "0.25",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--argent-text)",
    borderLeftWidth: "2px",
  },
  ".cm-placeholder": {
    color: "var(--argent-text-muted)",
    opacity: "0.5",
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: "bold", fontSize: "1.6em" },
  { tag: tags.heading2, fontWeight: "bold", fontSize: "1.35em" },
  { tag: tags.heading3, fontWeight: "bold", fontSize: "1.15em" },
  { tag: tags.heading4, fontWeight: "bold", fontSize: "1.05em" },
  { tag: tags.heading5, fontWeight: "bold", fontSize: "1em" },
  { tag: tags.heading6, fontWeight: "bold", fontSize: "0.95em", opacity: "0.8" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  {
    tag: tags.monospace,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.9em",
  },
  { tag: tags.link, textDecoration: "underline" },
  { tag: tags.url, color: "inherit", opacity: "0.7" },
  { tag: tags.comment, opacity: "0.5" },
  { tag: tags.meta, opacity: "0.5" },
]);

export const editorTheme = [
  baseTheme,
  syntaxHighlighting(highlightStyle),
];
