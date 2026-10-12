import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  vite: {
    ssr: {
      noExternal: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        'codemirror',
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lang-javascript',
        '@codemirror/lang-markdown',
        '@codemirror/autocomplete',
        '@codemirror/search',
        '@lezer/highlight',
      ],
    },
  },
});
