import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { Range } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

function isCursorInRange(
  state: EditorView["state"],
  from: number,
  to: number
): boolean {
  return state.selection.ranges.some(
    (range) => range.from <= to && range.to >= from
  );
}

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const { state } = view;

  syntaxTree(state).iterate({
    enter: (node) => {
      const { from, to, name } = node;

      // ATX Headings: # heading
      const headingMatch = name.match(/^ATXHeading(\d)$/);
      if (headingMatch) {
        const level = parseInt(headingMatch[1]);
        const line = state.doc.lineAt(from);
        const lineText = line.text;
        const hashMatch = lineText.match(/^(#{1,6})\s/);
        if (hashMatch) {
          const markerEnd = from + hashMatch[0].length;
          if (!isCursorInRange(state, from, markerEnd)) {
            decorations.push(Decoration.replace({}).range(from, markerEnd));
          }
          decorations.push(
            Decoration.line({ class: `cm-heading-${level}` }).range(line.from)
          );
        }
        return;
      }

      // Strong Emphasis: **text** or __text__
      if (name === "StrongEmphasis") {
        const text = state.doc.sliceString(from, to);
        let openLen = 0;
        let closeLen = 0;
        if (text.startsWith("**")) openLen = 2;
        else if (text.startsWith("__")) openLen = 2;
        if (text.endsWith("**")) closeLen = 2;
        else if (text.endsWith("__")) closeLen = 2;
        if (openLen > 0 && closeLen > 0 && !isCursorInRange(state, from, to)) {
          decorations.push(Decoration.replace({}).range(from, from + openLen));
          decorations.push(Decoration.replace({}).range(to - closeLen, to));
          decorations.push(
            Decoration.mark({ class: "cm-strong" }).range(
              from + openLen,
              to - closeLen
            )
          );
        }
        return;
      }

      // Emphasis: *text* or _text_
      if (name === "Emphasis") {
        const text = state.doc.sliceString(from, to);
        let openLen = 0;
        let closeLen = 0;
        if (text.startsWith("*")) openLen = 1;
        else if (text.startsWith("_")) openLen = 1;
        if (text.endsWith("*")) closeLen = 1;
        else if (text.endsWith("_")) closeLen = 1;
        if (
          openLen > 0 &&
          closeLen > 0 &&
          !text.startsWith("**") &&
          !isCursorInRange(state, from, to)
        ) {
          decorations.push(Decoration.replace({}).range(from, from + openLen));
          decorations.push(Decoration.replace({}).range(to - closeLen, to));
          decorations.push(
            Decoration.mark({ class: "cm-emphasis" }).range(
              from + openLen,
              to - closeLen
            )
          );
        }
        return;
      }

      // Inline code: `code`
      if (name === "InlineCode") {
        if (!isCursorInRange(state, from, to)) {
          decorations.push(Decoration.replace({}).range(from, from + 1));
          decorations.push(Decoration.replace({}).range(to - 1, to));
          decorations.push(
            Decoration.mark({ class: "cm-inline-code" }).range(from + 1, to - 1)
          );
        }
        return;
      }

      // Links: [text](url)
      if (name === "Link") {
        if (!isCursorInRange(state, from, to)) {
          const text = state.doc.sliceString(from, to);
          // Find link text boundaries: [text](url)
          const bracketOpen = text.indexOf("[");
          const bracketClose = text.indexOf("](");
          const parenClose = text.lastIndexOf(")");

          if (bracketOpen === 0 && bracketClose > 0 && parenClose > 0) {
            // Hide [ and ](
            decorations.push(Decoration.replace({}).range(from, from + 1));
            decorations.push(
              Decoration.replace({}).range(
                from + bracketClose,
                from + bracketClose + 2
              )
            );
            // Hide )
            decorations.push(Decoration.replace({}).range(to - 1, to));
            // Style the link text
            decorations.push(
              Decoration.mark({ class: "cm-link-text" }).range(
                from + 1,
                from + bracketClose
              )
            );
          }
        }
        return;
      }

      // Fenced code blocks: ```lang ... ```
      if (name === "FencedCode") {
        const line = state.doc.lineAt(from);
        const lineText = line.text;
        // Find opening fence
        const fenceMatch = lineText.match(/^(`{3,}|~{3,})/);
        if (fenceMatch) {
          const fenceLen = fenceMatch[1].length;
          const fenceEnd = from + fenceLen;
          // Hide opening fence + language
          if (!isCursorInRange(state, from, fenceEnd)) {
            decorations.push(Decoration.replace({}).range(from, fenceEnd));
          }
          // Apply code block style
          decorations.push(
            Decoration.line({ class: "cm-code-block" }).range(line.from)
          );
        }
        // Check if this is the closing fence line
        const lastLine = state.doc.lineAt(to);
        if (lastLine.from !== line.from) {
          const lastLineText = lastLine.text;
          const closeFenceMatch = lastLineText.match(/^(`{3,}|~{3,})\s*$/);
          if (closeFenceMatch) {
            if (!isCursorInRange(state, lastLine.from, lastLine.to)) {
              decorations.push(
                Decoration.replace({}).range(lastLine.from, lastLine.to)
              );
            }
          }
          // Style inner lines of code block
          let currentLine = state.doc.lineAt(line.to + 1);
          while (currentLine.from < lastLine.from) {
            decorations.push(
              Decoration.line({ class: "cm-code-block" }).range(currentLine.from)
            );
            if (currentLine.to >= state.doc.length) break;
            currentLine = state.doc.line(currentLine.number + 1);
          }
        }
        return;
      }

      // Blockquotes: > text
      if (name === "Blockquote") {
        const line = state.doc.lineAt(from);
        const lineText = line.text;
        const quoteMatch = lineText.match(/^>\s?/);
        if (quoteMatch) {
          const markerEnd = from + quoteMatch[0].length;
          if (!isCursorInRange(state, from, markerEnd)) {
            decorations.push(Decoration.replace({}).range(from, markerEnd));
          }
          decorations.push(
            Decoration.line({ class: "cm-blockquote" }).range(line.from)
          );
        }
        return;
      }

      // Horizontal rules: --- or *** or ___
      if (name === "HorizontalRule") {
        if (!isCursorInRange(state, from, to)) {
          decorations.push(Decoration.replace({}).range(from, to));
          decorations.push(
            Decoration.widget({
              widget: new HorizontalRuleWidget(),
              side: 0,
            }).range(from)
          );
        }
        return;
      }

      // List items (including checklists)
      if (name === "ListItem") {
        const line = state.doc.lineAt(from);
        const lineText = line.text;

        // Detect checklist: - [ ] or - [x] or * [X] or 1. [ ] etc.
        const checklistMatch = lineText.match(/^(\s*[-*+]\s|\d+\.\s)\[([ xX])\]\s/);

        if (checklistMatch) {
          const markerText = checklistMatch[1]; // "- " or "1. " etc.
          const checked = checklistMatch[2] !== ' ';
          const checkboxStart = from + markerText.length;
          const checkboxEnd = checkboxStart + 3; // "[ ]" or "[x]"
          const markerEnd = from + checklistMatch[0].length;

          // Hide list marker ("- " or "1. ")
          if (!isCursorInRange(state, from, checkboxStart)) {
            decorations.push(Decoration.replace({}).range(from, checkboxStart));
          }

          // Hide "[ ]" or "[x]" and replace with widget
          if (!isCursorInRange(state, checkboxStart, checkboxEnd)) {
            decorations.push(Decoration.replace({}).range(checkboxStart, checkboxEnd));
            decorations.push(
              Decoration.widget({
                widget: new CheckboxWidget(checked, line.from),
                side: -1,
              }).range(from)
            );
          }

          // Strikethrough for checked items
          if (checked && !isCursorInRange(state, markerEnd, line.to)) {
            decorations.push(
              Decoration.line({ class: "cm-task-checked" }).range(line.from)
            );
          }
        } else {
          decorations.push(
            Decoration.line({ class: "cm-list-item" }).range(line.from)
          );
        }
        return;
      }
    },
  });

  return Decoration.set(decorations, true);
}

import { WidgetType } from "@codemirror/view";

class HorizontalRuleWidget extends WidgetType {
  toDOM() {
    const hr = document.createElement("div");
    hr.className = "cm-hr";
    return hr;
  }

  eq(other: HorizontalRuleWidget) {
    return other instanceof HorizontalRuleWidget;
  }
}

class CheckboxWidget extends WidgetType {
  readonly checked: boolean;
  readonly lineFrom: number;

  constructor(checked: boolean, lineFrom: number) {
    super();
    this.checked = checked;
    this.lineFrom = lineFrom;
  }

  toDOM(view: EditorView) {
    const box = document.createElement("div");
    box.className = this.checked ? "cm-checkbox cm-checkbox-checked" : "cm-checkbox cm-checkbox-unchecked";
    box.setAttribute("contenteditable", "false");

    if (this.checked) {
      const check = document.createElement("span");
      check.className = "cm-checkbox-mark";
      check.textContent = "✓";
      box.appendChild(check);
    }

    const lineFrom = this.lineFrom;
    box.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const state = view.state;
      const line = state.doc.lineAt(lineFrom);
      const text = line.text;
      const match = text.match(/^(\s*[-*+]\s|\d+\.\s)\[([ xX])\]/);
      if (match) {
        const openBracket = lineFrom + match[1].length;
        const checked = match[2] !== ' ';
        view.dispatch({
          changes: {
            from: openBracket + 1,
            to: openBracket + 2,
            insert: checked ? " " : "x",
          },
        });
      }
    });

    return box;
  }

  eq(other: CheckboxWidget) {
    return other instanceof CheckboxWidget
      && other.checked === this.checked
      && other.lineFrom === this.lineFrom;
  }

  ignoreEvent() { return true; }
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
