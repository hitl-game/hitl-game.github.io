import { describe, expect, it } from 'vitest';

import {
  findHtmlAssets,
  findInitialChunks,
  findStaticImports,
  matchesSizeLimitGlob,
} from './findInitialChunks.ts';

const indexHtml = `<!doctype html><html><head>
<link rel="icon" href="data:," />
<script type="module" crossorigin src="/assets/index-a1.js"></script>
<link rel="modulepreload" crossorigin href="/assets/shared-b2.js">
<link rel="stylesheet" crossorigin href="/assets/index-c3.css">
<script src="https://example.com/remote.js"></script>
</head></html>`;

const assets: Readonly<Record<string, string>> = {
  'assets/index-a1.js':
    'import"./shared-b2.js";import{a as b}from"./vendor-d4.js";const c=()=>import("./pdfkit-e5.js");',
  'assets/shared-b2.js': 'export const s=1;',
  'assets/vendor-d4.js': 'export const a=2;',
  'assets/pdfkit-e5.js': 'Producer:"PDFKit"',
};

const readAsset = (assetPath: string): Promise<string> => {
  const code = assets[assetPath];
  return code === undefined ? Promise.reject(new Error(assetPath)) : Promise.resolve(code);
};

describe('findHtmlAssets', () => {
  it('lists the local scripts, module preloads and stylesheets of the page', () => {
    expect(findHtmlAssets(indexHtml)).toEqual([
      'assets/index-a1.js',
      'assets/shared-b2.js',
      'assets/index-c3.css',
    ]);
  });
});

describe('findStaticImports', () => {
  it('follows static imports and ignores dynamic ones', () => {
    expect(findStaticImports(assets['assets/index-a1.js'] ?? '')).toEqual([
      'shared-b2.js',
      'vendor-d4.js',
    ]);
  });
});

describe('findInitialChunks', () => {
  it('collects every file the page loads up front, but not lazy chunks', async () => {
    await expect(findInitialChunks(indexHtml, readAsset)).resolves.toEqual([
      'assets/index-a1.js',
      'assets/index-c3.css',
      'assets/shared-b2.js',
      'assets/vendor-d4.js',
    ]);
  });
});

describe('matchesSizeLimitGlob', () => {
  it('matches dist-relative size-limit globs within one directory', () => {
    expect(matchesSizeLimitGlob('assets/index-a1.js', 'dist/assets/index-*.js')).toBe(true);
    expect(matchesSizeLimitGlob('assets/vendor-d4.js', 'dist/assets/index-*.js')).toBe(false);
    expect(matchesSizeLimitGlob('assets/index-a1.css', 'dist/assets/index-*.js')).toBe(false);
  });
});
