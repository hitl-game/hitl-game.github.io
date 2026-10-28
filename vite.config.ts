import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

import { contentPlugin } from './tools/content/contentPlugin.ts';

export default defineConfig({
  base: '/',
  plugins: [preact(), contentPlugin(import.meta.dirname)],
  // spike/pdf.html is the Story 8.1 PDF spike page; Story 6.5 removes it.
  input: {
    index: 'index.html',
    pdfSpike: 'spike/pdf.html',
  },
});
