/**
 * Typography options for the editor. The selected font is applied to
 * CodeMirror's `.cm-content` via a theme extension; size and letter
 * spacing live on the same extension so they update together.
 *
 * Web fonts are loaded in `index.astro` via Google Fonts.
 */

export type FontId = 'jetbrains' | 'fira' | 'plex' | 'geist' | 'system';

export interface FontOption {
  id: FontId;
  label: string;
  /** CSS font-family stack. */
  family: string;
}

export const FONTS: FontOption[] = [
  {
    id: 'jetbrains',
    label: 'JetBrains',
    family: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  {
    id: 'fira',
    label: 'Fira Code',
    family: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  {
    id: 'plex',
    label: 'IBM Plex',
    family: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  {
    id: 'geist',
    label: 'Geist Mono',
    family: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  {
    id: 'system',
    label: 'Sistema',
    family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
];

export const FONT_FAMILIES: Record<FontId, string> = FONTS.reduce(
  (acc, f) => {
    acc[f.id] = f.family;
    return acc;
  },
  {} as Record<FontId, string>,
);

export const FONT_LABELS: Record<FontId, string> = FONTS.reduce(
  (acc, f) => {
    acc[f.id] = f.label;
    return acc;
  },
  {} as Record<FontId, string>,
);

export const FONT_SIZE_DEFAULT = 14;
export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 22;

export const LINE_HEIGHT_DEFAULT = 1.5;
export const LINE_HEIGHT_MIN = 1;
export const LINE_HEIGHT_MAX = 2.4;
export const LINE_HEIGHT_STEP = 0.1;
