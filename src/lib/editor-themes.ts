import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Three editor themes inspired by the toi_companion sticky-note palette
 * (see toi-companion-v2-reference memory). Each theme defines:
 *   - base colors (bg, fg, cursor, selection, gutter)
 *   - a syntax HighlightStyle that maps CodeMirror tags to readable colors
 *     against that background.
 *
 * Apply with: `EditorView.theme(...)` + `syntaxHighlighting(highlightStyle)`.
 */

export type ThemeId = 'systemBlue' | 'helixPurple' | 'taxiYellow';

interface ThemeSpec {
  id: ThemeId;
  label: string;
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  gutterBackground: string;
  gutterForeground: string;
  lineNumber: string;
  /** Highlight tag color map */
  tokens: {
    keyword: string;
    string: string;
    number: string;
    comment: string;
    variable: string;
    function: string;
    type: string;
    operator: string;
    punctuation: string;
    heading: string;
    emphasis: string;
    link: string;
    code: string;
    quote: string;
    list: string;
  };
}

const THEME_SPECS: Record<ThemeId, ThemeSpec> = {
  systemBlue: {
    id: 'systemBlue',
    label: 'azul sistema',
    background: '#0000AA',
    foreground: '#DFDFDF',
    cursor: '#FFD900',
    selection: 'rgba(255, 255, 255, 0.25)',
    gutterBackground: '#000088',
    gutterForeground: '#7C7CFF',
    lineNumber: '#7C7CFF',
    tokens: {
      keyword: '#FFFF55', // phosphor yellow
      string: '#55FF55', // phosphor green
      number: '#FF55FF', // phosphor magenta
      comment: '#7C7CFF',
      variable: '#DFDFDF',
      function: '#55FFFF', // phosphor cyan
      type: '#55FFFF',
      operator: '#FFFF55',
      punctuation: '#DFDFDF',
      heading: '#55FFFF',
      emphasis: '#FFFF55',
      link: '#55FF55',
      code: '#FF55FF',
      quote: '#7C7CFF',
      list: '#FFFF55',
    },
  },
  helixPurple: {
    id: 'helixPurple',
    label: 'púrpura helix',
    background: '#3A2155',
    foreground: '#DFDFDF',
    cursor: '#FF77AA',
    selection: 'rgba(255, 119, 170, 0.25)',
    gutterBackground: '#2C1942',
    gutterForeground: '#9B7BB8',
    lineNumber: '#9B7BB8',
    tokens: {
      keyword: '#FF77AA', // hot pink, like Helix
      string: '#C8A2FF', // soft violet
      number: '#FFC857', // warm amber
      comment: '#7B6294',
      variable: '#E6DCFF',
      function: '#A6E3FF', // light blue
      type: '#A6E3FF',
      operator: '#FF77AA',
      punctuation: '#C8A2FF',
      heading: '#FF77AA',
      emphasis: '#FFC857',
      link: '#A6E3FF',
      code: '#FFC857',
      quote: '#7B6294',
      list: '#FF77AA',
    },
  },
  taxiYellow: {
    id: 'taxiYellow',
    label: 'amarillo taxi',
    background: '#FFD900',
    foreground: '#000000',
    cursor: '#000000',
    selection: 'rgba(0, 0, 0, 0.25)',
    gutterBackground: '#E6C200',
    gutterForeground: '#3D3200',
    lineNumber: '#3D3200',
    tokens: {
      keyword: '#000000',
      string: '#7A2C00', // dark brown-red
      number: '#0033AA', // deep blue
      comment: '#6B5A00',
      variable: '#000000',
      function: '#0033AA',
      type: '#0033AA',
      operator: '#000000',
      punctuation: '#000000',
      heading: '#000000',
      emphasis: '#7A2C00',
      link: '#0033AA',
      code: '#7A2C00',
      quote: '#6B5A00',
      list: '#000000',
    },
  },
};

function buildHighlightStyle(spec: ThemeSpec): HighlightStyle {
  return HighlightStyle.define([
    { tag: t.keyword, color: spec.tokens.keyword, fontWeight: 'bold' },
    { tag: [t.string, t.special(t.string)], color: spec.tokens.string },
    { tag: t.number, color: spec.tokens.number },
    { tag: [t.comment, t.lineComment, t.blockComment], color: spec.tokens.comment, fontStyle: 'italic' },
    { tag: t.variableName, color: spec.tokens.variable },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: spec.tokens.function, fontWeight: 'bold' },
    { tag: [t.typeName, t.className], color: spec.tokens.type },
    { tag: [t.operator, t.url], color: spec.tokens.operator },
    { tag: [t.punctuation, t.bracket], color: spec.tokens.punctuation },
    { tag: [t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6], color: spec.tokens.heading, fontWeight: 'bold' },
    { tag: [t.emphasis, t.strong], color: spec.tokens.emphasis, fontWeight: 'bold' },
    { tag: t.link, color: spec.tokens.link, textDecoration: 'underline' },
    { tag: t.monospace, color: spec.tokens.code },
    { tag: t.quote, color: spec.tokens.quote, fontStyle: 'italic' },
    { tag: [t.list, t.meta], color: spec.tokens.list },
  ]);
}

function buildEditorTheme(spec: ThemeSpec) {
  return EditorView.theme(
    {
      '&': {
        backgroundColor: spec.background,
        color: spec.foreground,
        height: '100%',
        fontSize: '14px',
      },
      '.cm-content': {
        caretColor: spec.cursor,
        fontFamily:
          'JetBrains Mono, Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: spec.cursor },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection':
        { backgroundColor: spec.selection },
      '.cm-gutters': {
        backgroundColor: spec.gutterBackground,
        color: spec.gutterForeground,
        border: 'none',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: spec.foreground,
      },
      '.cm-activeLine': { backgroundColor: 'transparent' },
      '.cm-scroller': { fontFamily: 'inherit' },
    },
    { dark: spec.id !== 'taxiYellow' },
  );
}

export interface ThemeBundle {
  id: ThemeId;
  label: string;
  extension: import('@codemirror/state').Extension;
}

export function buildTheme(id: ThemeId): ThemeBundle {
  const spec = THEME_SPECS[id];
  const highlightStyle = buildHighlightStyle(spec);
  const editorTheme = buildEditorTheme(spec);
  return {
    id: spec.id,
    label: spec.label,
    extension: [editorTheme, syntaxHighlighting(highlightStyle)],
  };
}

export const THEME_IDS: ThemeId[] = ['systemBlue', 'helixPurple', 'taxiYellow'];

export const THEME_LABELS: Record<ThemeId, string> = {
  systemBlue: 'azul sistema',
  helixPurple: 'púrpura helix',
  taxiYellow: 'amarillo taxi',
};
