import { useEffect, useRef, useState } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
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
  type ThemeId,
} from '../lib/editor-themes';

type LangId = 'javascript' | 'markdown';

const DEFAULT_CONTENT: Record<LangId, string> = {
  javascript: `// toitoi playground — javascript
// prueba el autocompletado: escribe "con", "fun", "arr"

const greet = (name = 'toitoi') => {
  return \`hola, \${name}!\`;
};

console.log(greet());

// mueve el cursor a la siguiente línea y prueba Ctrl+Space
function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`,
  markdown: `# toitoi playground

esto es un **markdown** playground. prueba:

- títulos con #
- listas con - o 1.
- enlaces [toitoi.dev](https://toitoi.dev)
- código \`inline\` o bloques

> las comillas se ven así, con un toque typewriter.

cambia el tema con los botones de arriba.
`,
};

export default function CodeEditor() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  const [themeId, setThemeId] = useState<ThemeId>('systemBlue');
  const [langId, setLangId] = useState<LangId>('markdown');

  // Compartments let us reconfigure the editor without rebuilding it.
  const themeComp = useRef(new Compartment()).current;
  const langComp = useRef(new Compartment()).current;
  const contentComp = useRef(new Compartment()).current;

  // Build the editor once on mount.
  useEffect(() => {
    if (!hostRef.current) return;

    const initialTheme = buildTheme(themeId);
    const initialLang = langId === 'javascript' ? javascript() : markdown();

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
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        themeComp.of(initialTheme.extension),
        langComp.of(initialLang),
        contentComp.of(EditorView.editable.of(true)),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

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

  // Swap language (and reset content) on the fly.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const ext = langId === 'javascript' ? javascript() : markdown();
    view.dispatch({
      effects: langComp.reconfigure(ext),
      changes: { from: 0, to: view.state.doc.length, insert: DEFAULT_CONTENT[langId] },
    });
  }, [langId, langComp]);

  return (
    <div className="editor-shell" data-theme={themeId}>
      <div className="editor-toolbar" role="toolbar" aria-label="editor controls">
        <div className="toolbar-group" role="group" aria-label="language">
          <span className="toolbar-label">modo</span>
          <button
            type="button"
            className={`chip ${langId === 'javascript' ? 'chip-on' : ''}`}
            onClick={() => setLangId('javascript')}
            aria-pressed={langId === 'javascript'}
          >
            javascript
          </button>
          <button
            type="button"
            className={`chip ${langId === 'markdown' ? 'chip-on' : ''}`}
            onClick={() => setLangId('markdown')}
            aria-pressed={langId === 'markdown'}
          >
            markdown
          </button>
        </div>
        <div className="toolbar-group" role="group" aria-label="theme">
          <span className="toolbar-label">tema</span>
          {THEME_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`chip ${themeId === id ? 'chip-on' : ''}`}
              onClick={() => setThemeId(id)}
              aria-pressed={themeId === id}
            >
              {THEME_LABELS[id]}
            </button>
          ))}
        </div>
      </div>
      <div ref={hostRef} className="editor-host" />
    </div>
  );
}
