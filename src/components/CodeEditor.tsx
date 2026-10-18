import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting, indentOnInput } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { searchKeymap } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import {
  buildTheme,
  THEME_IDS,
  THEME_LABELS,
  THEME_SWATCHES,
  THEME_VARS,
  type ThemeId,
} from '../lib/editor-themes';
import {
  FONTS,
  FONT_FAMILIES,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LINE_HEIGHT_DEFAULT,
  LINE_HEIGHT_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_STEP,
  type FontId,
} from '../lib/editor-typography';

type LangId = 'javascript' | 'markdown';

const TIMEOUT_MS = 5000;
let ENTRY_ID = 0;

type OutputLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'return';
interface OutputEntry {
  id: number;
  level: OutputLevel;
  text: string;
}

const DEFAULT_CONTENT: Record<LangId, string> = {
  javascript: `// toitoi playground — javascript
// corre con el botón ▶ run o con Cmd/Ctrl + Enter

const greet = (name = 'toitoi') => \`hola, \${name}!\`;

console.log(greet());

// async funciona (5s timeout)
const data = await fetch('https://catfact.ninja/fact')
  .then(r => r.json())
  .catch(e => ({ error: String(e) }));

console.log('dato:', data);
`,
  markdown: `# toitoi playground

esto es un **markdown** playground. prueba:

- títulos con #
- listas con - o 1.
- enlaces [toitoi.dev](https://toitoi.dev)
- código \`inline\` o bloques

> cambia a javascript para ejecutar código real con ▶ run.

cambia el tema con los puntos de arriba a la derecha.
`,
};

function stringify(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'function') return value.toString();
  if (typeof value === 'symbol') return value.toString();
  if (value instanceof Error) return value.stack || value.message;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function runJs(code: string): Promise<OutputEntry[]> {
  const entries: OutputEntry[] = [];
  const next = () => ++ENTRY_ID;

  const capture = (level: OutputLevel) => (...args: unknown[]) => {
    entries.push({ id: next(), level, text: args.map(stringify).join(' ') });
  };

  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  console.log = capture('log');
  console.info = capture('info');
  console.warn = capture('warn');
  console.error = capture('error');
  console.debug = capture('debug');

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Execution timed out after ${TIMEOUT_MS}ms`)),
      TIMEOUT_MS,
    ),
  );

  try {
    const wrapped = new Function(`"use strict"; return (async () => {\n${code}\n})();`);
    const result = await Promise.race([wrapped(), timeout]);

    if (result !== undefined) {
      entries.push({ id: next(), level: 'return', text: stringify(result) });
    }
  } catch (err) {
    const e = err as Error;
    entries.push({ id: next(), level: 'error', text: e?.stack || String(err) });
  } finally {
    console.log = original.log;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
    console.debug = original.debug;
  }

  return entries;
}

function buildTypographyTheme(fontFamily: string, fontSize: number, lineHeight: number) {
  return EditorView.theme({
    '&': {
      fontSize: `${fontSize}px`,
      fontFamily,
    },
    '.cm-content': {
      lineHeight: String(lineHeight),
    },
    '.cm-gutters, .cm-gutter': {
      fontSize: `${fontSize}px`,
    },
  });
}

export default function CodeEditor() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langRef = useRef<LangId>('markdown');
  const typeButtonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const [themeId, setThemeId] = useState<ThemeId>('kanagawaDragon');
  const [langId, setLangId] = useState<LangId>('markdown');
  const [isRunning, setIsRunning] = useState(false);
  const [entries, setEntries] = useState<OutputEntry[]>([]);

  const [fontId, setFontId] = useState<FontId>('jetbrains');
  const [fontSize, setFontSize] = useState<number>(FONT_SIZE_DEFAULT);
  const [lineHeight, setLineHeight] = useState<number>(LINE_HEIGHT_DEFAULT);
  const [typeOpen, setTypeOpen] = useState(false);

  const themeComp = useRef(new Compartment()).current;
  const typeComp = useRef(new Compartment()).current;
  const langComp = useRef(new Compartment()).current;

  // Build the editor once on mount.
  useEffect(() => {
    if (!hostRef.current) return;

    const initialTheme = buildTheme(themeId);
    const initialLang = langId === 'javascript' ? javascript() : markdown();
    const initialTypography = buildTypographyTheme(
      FONT_FAMILIES[fontId],
      fontSize,
      lineHeight,
    );

    const state = EditorState.create({
      doc: DEFAULT_CONTENT[langId],
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        indentOnInput(),
        autocompletion(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        Prec.high(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                handleRun();
                return true;
              },
            },
          ]),
        ),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        themeComp.of(initialTheme.extension),
        typeComp.of(initialTypography),
        langComp.of(initialLang),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    langRef.current = langId;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap theme on the fly.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeComp.reconfigure(buildTheme(themeId).extension) });
  }, [themeId, themeComp]);

  // Swap typography on the fly.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: typeComp.reconfigure(
        buildTypographyTheme(FONT_FAMILIES[fontId], fontSize, lineHeight),
      ),
    });
  }, [fontId, fontSize, lineHeight, typeComp]);

  // Swap language on the fly.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const ext = langId === 'javascript' ? javascript() : markdown();
    langRef.current = langId;
    view.dispatch({
      effects: langComp.reconfigure(ext),
      changes: { from: 0, to: view.state.doc.length, insert: DEFAULT_CONTENT[langId] },
    });
    if (langId !== 'javascript') setEntries([]);
  }, [langId, langComp]);

  const handleRun = useCallback(async () => {
    const view = viewRef.current;
    if (!view) return;
    if (langRef.current !== 'javascript') return;
    if (isRunning) return;

    const code = view.state.doc.toString();
    setIsRunning(true);
    setEntries([]);
    const result = await runJs(code);
    setEntries(result);
    setIsRunning(false);
  }, [isRunning]);

  const clearOutput = useCallback(() => setEntries([]), []);

  // Close the typography popover on outside click or Escape.
  useEffect(() => {
    if (!typeOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        typeButtonRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setTypeOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTypeOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [typeOpen]);

  const isJs = langId === 'javascript';
  const errorCount = entries.filter((e) => e.level === 'error').length;
  const totalCount = entries.length;

  return (
    <div className="editor-shell" data-theme={themeId} style={THEME_VARS[themeId]}>
      <div className="editor-topbar" role="toolbar" aria-label="editor controls">
        <div className="topbar-group" role="group" aria-label="language">
          <button
            type="button"
            className={`seg ${langId === 'markdown' ? 'seg-on' : ''}`}
            onClick={() => setLangId('markdown')}
            aria-pressed={langId === 'markdown'}
          >
            markdown
          </button>
          <button
            type="button"
            className={`seg ${langId === 'javascript' ? 'seg-on' : ''}`}
            onClick={() => setLangId('javascript')}
            aria-pressed={langId === 'javascript'}
          >
            javascript
          </button>
        </div>

        <div className="topbar-group" role="group" aria-label="run">
          <button
            type="button"
            className={`run-btn ${isRunning ? 'is-running' : ''}`}
            onClick={handleRun}
            disabled={!isJs || isRunning}
            aria-label={isRunning ? 'running' : 'run code'}
            title={isJs ? 'run (⌘/Ctrl + Enter)' : 'switch to javascript to run'}
          >
            {isRunning ? <span className="run-spinner" aria-hidden="true" /> : <span className="run-icon" aria-hidden="true">▶</span>}
            <span className="run-label">{isRunning ? 'running' : 'run'}</span>
          </button>
        </div>

        <div className="topbar-group topbar-right" role="group" aria-label="theme and typography">
          <button
            ref={typeButtonRef}
            type="button"
            className={`type-btn ${typeOpen ? 'is-open' : ''}`}
            onClick={() => setTypeOpen((o) => !o)}
            aria-expanded={typeOpen}
            aria-haspopup="dialog"
            aria-label="typography"
            title="tipografía, tamaño, interlineado"
          >
            <span className="type-btn-glyph">Aa</span>
          </button>

          <div className="topbar-themes" role="group" aria-label="theme">
            {THEME_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={`swatch ${themeId === id ? 'swatch-on' : ''}`}
                style={{ ['--swatch' as string]: THEME_SWATCHES[id] }}
                onClick={() => setThemeId(id)}
                aria-label={THEME_LABELS[id]}
                aria-pressed={themeId === id}
                title={THEME_LABELS[id]}
              />
            ))}
          </div>
        </div>

        {typeOpen && (
          <div
            ref={popoverRef}
            className="type-popover"
            role="dialog"
            aria-label="typography settings"
          >
            <section className="type-section">
              <div className="type-label">fuente</div>
              <div className="type-chips">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`seg type-font-chip ${fontId === f.id ? 'seg-on' : ''}`}
                    style={{ fontFamily: f.family }}
                    onClick={() => setFontId(f.id)}
                    aria-pressed={fontId === f.id}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="type-section">
              <div className="type-label">
                tamaño <span className="type-value">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="type-slider"
                aria-label="font size"
              />
            </section>

            <section className="type-section">
              <div className="type-label">
                interlineado <span className="type-value">{lineHeight.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={LINE_HEIGHT_MIN}
                max={LINE_HEIGHT_MAX}
                step={LINE_HEIGHT_STEP}
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="type-slider"
                aria-label="line height"
              />
            </section>
          </div>
        )}
      </div>

      <div className="editor-body">
        <div ref={hostRef} className="editor-host" />
        <section
          className="output-panel"
          aria-label="output"
          aria-live="polite"
        >
          <header className="output-header">
            <span className="output-title">output</span>
            <span className="output-status">
              {entries.length === 0
                ? isJs
                  ? isRunning
                    ? 'running…'
                    : 'press ⌘/Ctrl + Enter to run'
                  : 'switch to javascript to run'
                : `${totalCount} ${totalCount === 1 ? 'entry' : 'entries'}${errorCount ? ` · ${errorCount} error${errorCount > 1 ? 's' : ''}` : ''}`}
            </span>
            <button
              type="button"
              className="output-clear"
              onClick={clearOutput}
              disabled={entries.length === 0}
              aria-label="clear output"
            >
              clear
            </button>
          </header>
          <div className="output-list" role="log">
            {entries.map((e) => (
              <div key={e.id} className={`output-entry output-${e.level}`}>
                <span className="output-level">{e.level}</span>
                <pre className="output-text">{e.text}</pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
