import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Editor themes for the playground. Three come from the toi_companion
 * sticky-note palette; one (kanagawa dragon) is borrowed from
 * rebelot/kanagawa.nvim. Each theme defines:
 *   - base UI colors (bg, fg, cursor, selection, gutter)
 *   - a `swatch` color used in the toolbar button
 *   - syntax HighlightStyle mapped to readable colors on that bg
 *   - output panel colors (for the JS run console)
 *
 * Apply with `EditorView.theme(...)` + `syntaxHighlighting(highlightStyle)`.
 */

export type ThemeId = 'systemBlue' | 'helixPurple' | 'taxiYellow' | 'kanagawaDragon';

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
  swatch: string;
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
  output: {
    log: string;
    info: string;
    warn: string;
    error: string;
    debug: string;
    return: string;
    muted: string;
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
    swatch: '#0000AA',
    tokens: {
      keyword: '#FFFF55',
      string: '#55FF55',
      number: '#FF55FF',
      comment: '#7C7CFF',
      variable: '#DFDFDF',
      function: '#55FFFF',
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
    output: {
      log: '#DFDFDF',
      info: '#55FFFF',
      warn: '#FFFF55',
      error: '#FF55FF',
      debug: '#7C7CFF',
      return: '#55FF55',
      muted: '#7C7CFF',
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
    swatch: '#3A2155',
    tokens: {
      keyword: '#FF77AA',
      string: '#C8A2FF',
      number: '#FFC857',
      comment: '#7B6294',
      variable: '#E6DCFF',
      function: '#A6E3FF',
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
    output: {
      log: '#DFDFDF',
      info: '#A6E3FF',
      warn: '#FFC857',
      error: '#FF77AA',
      debug: '#7B6294',
      return: '#C8A2FF',
      muted: '#9B7BB8',
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
    swatch: '#FFD900',
    tokens: {
      keyword: '#000000',
      string: '#7A2C00',
      number: '#0033AA',
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
    output: {
      log: '#000000',
      info: '#0033AA',
      warn: '#7A2C00',
      error: '#7A0000',
      debug: '#6B5A00',
      return: '#0033AA',
      muted: '#3D3200',
    },
  },
  kanagawaDragon: {
    id: 'kanagawaDragon',
    label: 'kanagawa dragon',
    background: '#1F1F28',
    foreground: '#DCD7BA',
    cursor: '#C8C093',
    selection: 'rgba(127, 180, 202, 0.25)',
    gutterBackground: '#181820',
    gutterForeground: '#625E5A',
    lineNumber: '#625E5A',
    swatch: '#1F1F28',
    tokens: {
      keyword: '#957FB8',
      string: '#98BB6C',
      number: '#FFA066',
      comment: '#625E5A',
      variable: '#DCD7BA',
      function: '#7FB4CA',
      type: '#E0C28D',
      operator: '#E46876',
      punctuation: '#C8C093',
      heading: '#7FB4CA',
      emphasis: '#FFA066',
      link: '#7FB4CA',
      code: '#98BB6C',
      quote: '#625E5A',
      list: '#957FB8',
    },
    output: {
      log: '#DCD7BA',
      info: '#7FB4CA',
      warn: '#E0C28D',
      error: '#E46876',
      debug: '#625E5A',
      return: '#98BB6C',
      muted: '#625E5A',
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
      },
      '.cm-content': {
        caretColor: spec.cursor,
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
  swatch: string;
  extension: import('@codemirror/state').Extension;
}

export function buildTheme(id: ThemeId): ThemeBundle {
  const spec = THEME_SPECS[id];
  const highlightStyle = buildHighlightStyle(spec);
  const editorTheme = buildEditorTheme(spec);
  return {
    id: spec.id,
    label: spec.label,
    swatch: spec.swatch,
    extension: [editorTheme, syntaxHighlighting(highlightStyle)],
  };
}

export const THEME_IDS: ThemeId[] = ['systemBlue', 'helixPurple', 'taxiYellow', 'kanagawaDragon'];

export const THEME_LABELS: Record<ThemeId, string> = {
  systemBlue: 'azul sistema',
  helixPurple: 'púrpura helix',
  taxiYellow: 'amarillo taxi',
  kanagawaDragon: 'kanagawa dragon',
};

export const THEME_SWATCHES: Record<ThemeId, string> = {
  systemBlue: THEME_SPECS.systemBlue.swatch,
  helixPurple: THEME_SPECS.helixPurple.swatch,
  taxiYellow: THEME_SPECS.taxiYellow.swatch,
  kanagawaDragon: THEME_SPECS.kanagawaDragon.swatch,
};

/**
 * CSS variables that drive the output panel so it always matches the
 * currently selected editor theme. Inline-applied to the editor shell.
 */
export const THEME_VARS: Record<ThemeId, Record<string, string>> = {
  systemBlue: {
    '--shell-bg': THEME_SPECS.systemBlue.background,
    '--shell-fg': THEME_SPECS.systemBlue.foreground,
    '--shell-muted': THEME_SPECS.systemBlue.output.muted,
    '--out-log': THEME_SPECS.systemBlue.output.log,
    '--out-info': THEME_SPECS.systemBlue.output.info,
    '--out-warn': THEME_SPECS.systemBlue.output.warn,
    '--out-error': THEME_SPECS.systemBlue.output.error,
    '--out-debug': THEME_SPECS.systemBlue.output.debug,
    '--out-return': THEME_SPECS.systemBlue.output.return,
  },
  helixPurple: {
    '--shell-bg': THEME_SPECS.helixPurple.background,
    '--shell-fg': THEME_SPECS.helixPurple.foreground,
    '--shell-muted': THEME_SPECS.helixPurple.output.muted,
    '--out-log': THEME_SPECS.helixPurple.output.log,
    '--out-info': THEME_SPECS.helixPurple.output.info,
    '--out-warn': THEME_SPECS.helixPurple.output.warn,
    '--out-error': THEME_SPECS.helixPurple.output.error,
    '--out-debug': THEME_SPECS.helixPurple.output.debug,
    '--out-return': THEME_SPECS.helixPurple.output.return,
  },
  taxiYellow: {
    '--shell-bg': THEME_SPECS.taxiYellow.background,
    '--shell-fg': THEME_SPECS.taxiYellow.foreground,
    '--shell-muted': THEME_SPECS.taxiYellow.output.muted,
    '--out-log': THEME_SPECS.taxiYellow.output.log,
    '--out-info': THEME_SPECS.taxiYellow.output.info,
    '--out-warn': THEME_SPECS.taxiYellow.output.warn,
    '--out-error': THEME_SPECS.taxiYellow.output.error,
    '--out-debug': THEME_SPECS.taxiYellow.output.debug,
    '--out-return': THEME_SPECS.taxiYellow.output.return,
  },
  kanagawaDragon: {
    '--shell-bg': THEME_SPECS.kanagawaDragon.background,
    '--shell-fg': THEME_SPECS.kanagawaDragon.foreground,
    '--shell-muted': THEME_SPECS.kanagawaDragon.output.muted,
    '--out-log': THEME_SPECS.kanagawaDragon.output.log,
    '--out-info': THEME_SPECS.kanagawaDragon.output.info,
    '--out-warn': THEME_SPECS.kanagawaDragon.output.warn,
    '--out-error': THEME_SPECS.kanagawaDragon.output.error,
    '--out-debug': THEME_SPECS.kanagawaDragon.output.debug,
    '--out-return': THEME_SPECS.kanagawaDragon.output.return,
  },
};
