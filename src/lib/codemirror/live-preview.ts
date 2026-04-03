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
        // Find the end of the marker (e.g., "# ")
        const line = state.doc.lineAt(from);
        const lineText = line.text;
        const hashMatch = lineText.match(/^(#{1,6})\s/);
        if (hashMatch) {
          const markerEnd = from + hashMatch[0].length;
          // Hide marker when cursor is not in range
          if (!isCursorInRange(state, from, markerEnd)) {
            decorations.push(
              Decoration.replace({}).range(from, markerEnd)
            );
          }
          // Apply heading style to the entire line
          decorations.push(
            Decoration.line({ class: `cm-heading-${level}` }).range(line.from)
          );
        }
        return;
      }

      // Strong Emphasis: **text** or __text__
      if (name === "StrongEmphasis") {
        // Find opening and closing markers
        const text = state.doc.sliceString(from, to);
        let openLen = 0;
        let closeLen = 0;

        if (text.startsWith("**")) openLen = 2;
        else if (text.startsWith("__")) openLen = 2;

        if (text.endsWith("**")) closeLen = 2;
        else if (text.endsWith("__")) closeLen = 2;

        if (openLen > 0 && closeLen > 0 && !isCursorInRange(state, from, to)) {
          // Hide opening marker
          decorations.push(
            Decoration.replace({}).range(from, from + openLen)
          );
          // Hide closing marker
          decorations.push(
            Decoration.replace({}).range(to - closeLen, to)
          );
          // Apply bold style to content
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

        // Make sure this isn't StrongEmphasis (parent handles that)
        if (
          openLen > 0 &&
          closeLen > 0 &&
          !text.startsWith("**") &&
          !isCursorInRange(state, from, to)
        ) {
          // Hide opening marker
          decorations.push(
            Decoration.replace({}).range(from, from + openLen)
          );
          // Hide closing marker
          decorations.push(
            Decoration.replace({}).range(to - closeLen, to)
          );
          // Apply italic style to content
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
          decorations.push(
            Decoration.replace({}).range(from, from + 1)
          );
          decorations.push(
            Decoration.replace({}).range(to - 1, to)
          );
          decorations.push(
            Decoration.mark({ class: "cm-inline-code" }).range(
              from + 1,
              to - 1
            )
          );
        }
        return;
      }
    },
  });

  return Decoration.set(decorations, true);
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
