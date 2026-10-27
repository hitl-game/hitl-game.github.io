# ADR 0003: Tagged PDF with PDFKit, spike outcome

- **Status:** Accepted (go), 2026-10-27
- **Story:** 8.1, PDFKit tagged-PDF spike
- **Follows:** architecture ADR-003 (Tagged PDF via PDFKit) and D8 (End-of-run documents)
- **Feeds:** Story 6.5 (Tagged PDF export), Story 1.7 (fonts), Story 8.8 (bundle budgets)

## Decision

**Go.** PDFKit 0.20.2 builds into the Vite 8 app as a lazy chunk, runs in the browser without cross-origin isolation, and writes a document that veraPDF validates as **PDF/UA-1**. Generation of the sample takes about 0.1 s.

There is one condition: the PDF fonts must be **WOFF 1.0 files with composite glyphs decomposed**. WOFF2 does not work with PDFKit (details under Font handling).

## Evidence

All numbers come from the sample in `src/report/pdf`, generated in the built app (`vite build` + `vite preview`) by `tests/e2e/pdfSpike.spec.ts`.

| Check                                     | Result                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| veraPDF 1.30.3, PDF/UA-1 profile (`ua1`)  | **PASS** for the PDFs generated in Chromium and in WebKit (`compliant="1" nonCompliant="0"`).                                                                 |
| The gate has teeth                        | With `tagged: false`, veraPDF fails rule **6.2-1** (`MarkInfo`/`Marked`). With unpatched fonts it fails **7.21.4.2-2** (CIDSet). Neither change is committed. |
| Generation time, Chromium (cold / warm)   | 133–142 ms / 82–90 ms                                                                                                                                         |
| Generation time, WebKit (cold / warm)     | 107–118 ms / 58–61 ms                                                                                                                                         |
| Budget (NFR6, PRF-06)                     | < 3000 ms, asserted by the e2e spec on every engine it runs on                                                                                                |
| `crossOriginIsolated`                     | `false` (asserted). No `SharedArrayBuffer`, no workers, no COOP/COEP.                                                                                         |
| Requests outside the site origin          | none (asserted)                                                                                                                                               |
| Initial bundle (`index.html`)             | 4.98 kB gzip, no PDFKit code (`tools/checkInitialBundle.ts`). It was 4.86 kB before the story (see Build gotchas).                                            |
| Lazy PDFKit chunk (`pdfkit.browser-*.js`) | 527.6 kB raw, 212.8 kB gzip                                                                                                                                   |
| Spike page chunk (renderer + page script) | 6.2 kB raw, 2.8 kB gzip                                                                                                                                       |
| Fonts, fetched on first generation        | `inter-400.woff` 35.5 kB, `inter-700.woff` 36.1 kB (already compressed)                                                                                       |
| Sample PDF                                | 17.1 kB, A4, one page                                                                                                                                         |

- **Machine.** Apple M4 Pro, 12 cores, 24 GB, macOS 27.0.1, Playwright 1.64.1. The repository does not define a "reference laptop", so the timings are from this machine. They leave a margin of more than 20× under the 3 s budget.
- **"Cold"** is the first click after page load: it includes the dynamic import of the PDFKit chunk and both font fetches. **"Warm"** is the second click.
- **Engines.** Chromium and WebKit were run locally. Firefox does not launch in the local environment ("Could not find profile folder"; the same limit as Story 1.1), so Firefox is covered by the three-engine `e2e` job on `main`.
- **Deployed site.** The post-deploy `smoke` job runs the same spec against `https://hitl-game.github.io/spike/pdf.html`. That proof exists only after the first deploy from `main`.
- **Rendering.** A page render (`pdftoppm`) of the browser output was checked by eye: heading, paragraphs, bullets, table, footer and mark are all visible.

## How CI validates

- **`verapdf` job** in `.github/workflows/ci.yml`. It runs on `main` only (`if: github.event_name == 'push'`) and is not a required status check.
  - It builds the app, runs `pdfSpike.spec.ts` on Chromium against `vite preview`, and validates `test-results/pdf-spike/sample-chromium.pdf`.
  - The veraPDF image is pinned by tag and digest: `verapdf/cli:v1.30.3@sha256:d565095c67a083e693aebf7d1a15784007370571053fc1aa5b502665b9a78f9c`. That image bundles its own JRE, so the job needs no Java setup.
  - The job fails if veraPDF exits non-zero or if the report summary is not exactly `compliant="1" nonCompliant="0" failedJobs="0"`. The second check stops a run that validated nothing from passing.
  - It uploads the PDF, the timing JSON and the veraPDF report as the `pdf-spike` artifact (14 days), pass or fail.
- **Deploy.** `deploy.yml` runs after a successful `ci` run, so a veraPDF failure on `main` also blocks the Pages deploy.
- **Post-deploy smoke.** It runs `smoke.spec.ts` and `pdfSpike.spec.ts` on Chromium against the live URL.

## Font handling

- **Source.** Inter **4.001** (`Version 4.001;git-66647c0bb`), taken from the npm package `@fontsource/inter@5.3.0` (Google Fonts build `v20`). The files are `files/inter-latin-400-normal.woff` and `files/inter-latin-700-normal.woff`. They were copied once with `npm pack`; the package is not a dependency.
- **Weights.** 400 (body, footer, table cells) and 700 (document title, table headers). These are the only weights the sample uses (D14).
- **Licence.** SIL OFL 1.1, in `assets/fonts/OFL.txt` (copied from the package). The licence declares no Reserved Font Name, so the modified files keep the name Inter.
- **Glyph coverage.** The Fontsource `latin` subset: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD. That is 231 code points and 518 glyphs. It covers English and most Western European text.
  - **Consequence for later locales.** A locale that needs Latin Extended, Cyrillic, Greek or Vietnamese needs the matching Fontsource subset, merged into the file or added as a second font. PDFKit has no font fallback: a missing glyph renders as `.notdef`, and veraPDF does not flag it. Each locale's PDF test must contain that locale's characters.
- **PDFKit embeds a real subset.** The PDF holds `CIDFontType2` fonts with a `FontFile2` program, named `XXXXXX+Inter-Regular` and `XXXXXX+Inter-Bold`. The standard 14 fonts are never used:
  - the document is created with `font: <Inter bytes>`, so PDFKit never loads its default Helvetica;
  - the browser build throws if a standard font is requested without being registered first;
  - the footer ("Page 1 of 1") uses Inter.

### Why WOFF and not WOFF2 (deviation from D14 for PDF fonts)

1. **fontkit 2.0.4, as used by PDFKit 0.20.2, cannot subset WOFF2 reliably.**
   - With composite glyphs (`i`, `j`, `,`, `:`, `;`, quotes, most accented letters) `TTFSubset` throws `RangeError: Offset is outside the bounds of the DataView`.
   - With the composites decomposed, it embeds glyphs with **no outlines**: the text is invisible, but veraPDF still reports PDF/UA-1 compliance.
   - The same glyphs from the WOFF 1.0 file subset correctly.
2. **PDFKit writes a wrong `CIDSet` whenever a used glyph is a composite.**
   - `subset: 'PDF/UA'` sets `doc.subset = 1`, and PDFKit then writes the PDF/A-1 `CIDSet` stream.
   - That stream lists only the glyphs used directly, while fontkit also copies the component glyphs into the subset.
   - veraPDF fails PDF/UA rule **7.21.4.2-2**. Plain text such as "ink" is enough to trigger it.
3. **Fix applied:** every composite glyph is decomposed into a simple outline, once, and the font is saved as WOFF 1.0. That is 304 glyphs per weight. The outlines are identical, and the file grows from about 30.7 kB to 35.5 kB.

The conversion (fontTools 4.60.1, run with `uvx --from 'fonttools[woff]==4.60.1' python -I decompose.py <in.woff> <out.woff>`):

```python
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

font = TTFont(sys.argv[1])
glyph_set = font.getGlyphSet()
glyf = font['glyf']
for name in font.getGlyphOrder():
    if glyf[name].isComposite():
        recording = DecomposingRecordingPen(glyph_set)
        glyph_set[name].draw(recording)
        pen = TTGlyphPen(None)
        recording.replay(pen)
        glyf[name] = pen.glyph()
font.flavor = 'woff'
font.save(sys.argv[2])
```

Source SHA-256 values (Fontsource 5.3.0): `inter-latin-400-normal.woff` `e20fa0b4…dd45`, `inter-latin-700-normal.woff` `7c5ed565…7e7a`. fontTools rewrites the `head` timestamp, so the output bytes differ on every run. Only the outlines are reproducible.

**For Story 1.7:** the UI can keep WOFF2 (`inter-<weight>.woff2`, D14). The PDF renderer needs these `.woff` files next to them. Do not point the PDF renderer at the UI's WOFF2 files.

**Guard:** `src/report/pdf/buildSamplePdf.test.ts` measures the glyph data per embedded glyph. It fails if someone swaps in a WOFF2 file (about 30 bytes per glyph, against about 90 for real outlines), because veraPDF would not catch that.

## Build gotchas

- **Which PDFKit build.** We use the `exports` default entry, `js/pdfkit.browser.mjs`, through a dynamic `import('pdfkit')` inside `buildSamplePdf`. In 0.20 this is a native ES module with its own `EventEmitter`/`Readable`:
  - it needs no `Buffer`, `process`, `fs`, `stream` or `zlib` polyfills;
  - the only Vite config change is the second HTML entry;
  - `js/pdfkit.standalone.js` (browserify UMD) was not needed. It would also bypass Vite's dependency graph and tree-shaking.
- **No types ship with PDFKit 0.20.** `src/report/pdf/pdfkit.d.ts` declares only the API the renderer uses. Story 6.5 extends it rather than adding `@types/pdfkit`, which describes the older CommonJS API.
- **`size-limit` alone did not prove laziness.**
  - Its globs only measure `index-*.js` and `index-*.css`.
  - A static `import 'pdfkit'` in `main.tsx` puts PDFKit in a separate `pdfkit.browser-*.js` file that `index.html` loads eagerly. `size-limit` still reported 5 kB and passed. This was tested.
  - `tools/checkInitialBundle.ts` (run by `npm run size`, so by the `gates` job) follows `index.html` and its static imports. It fails if any eagerly loaded file contains PDFKit, or if it is not counted by the `initial bundle` budget.
- **Multi-page input moves the module-preload polyfill.** With two HTML entries, Vite emits it as a shared `modulepreload-polyfill-*.js` instead of inlining it in `index-*.js`. The `initial bundle` budget now includes that file. This split adds 0.12 kB gzip to the initial bundle (4.86 → 4.98 kB). The budget stays at 150 KB.
- **Entry name.** The main entry must keep the input key `index`. Renaming it renames the chunk and silently empties the `size-limit` glob.
- **Chunk-size warning.** Vite warns that the PDFKit chunk is over 500 kB. It is lazy and expected; the warning is informational.
- **`fflate`** is now used by the renderer's unit test, so its `ignoreDependencies` entry was removed from `knip.json`, along with the `pdfkit` entry.

## PDFKit API gotchas

- **Attach the root first.** `doc.addStructure(root)` must run before children are added. A closure child (`doc.struct('P', () => …)`) runs when its parent is attached. If the parent is not attached yet, the content is drawn later, out of reading order.
- **Word separators.** PDF/UA needs the space between words inside the marked content, including at the end of a block. `withWordSeparator` appends it to every heading, paragraph, list item, cell and footer string.
- **Artifacts.** Wrap decorative drawing in `doc.markContent('Artifact', { type })` and close it with `doc.endMarkedContent()`:
  - `Layout` for rules;
  - `Pagination` for "Page 1 of 1";
  - no type for the Metis mark (a gradient circle; the only Metis colour).

  Marking structure content closes an open artifact automatically, but the renderer closes it explicitly.

- **Lists.** `doc.list(items, { structParent: doc.struct('L') })` builds `LI` > `Lbl` + `LBody`. The bullet is drawn inside `Lbl`, which veraPDF accepts.
- **Tables.** `doc.table({ structParent, data })` builds `Table` > `TR` > `TH`/`TD`, with `Scope` and `Headers` attributes when a header cell has `scope: 'column'`.
  - Cell borders are drawn inside the cell's marked content, not as artifacts. The sample sets `border: 0` and draws the table rules as `Layout` artifacts.
  - Header cells take a font per cell: `font: { src: 'inter-700' }`, a name registered with `doc.registerFont`.
- **Heading tag.** The title is tagged `H1`, not `H`. Story 6.5 needs section headings, and PDF/UA-1 does not allow strongly structured `H` to be mixed with numbered headings, so numbered headings are used from the start.
- **Footer placement.** Text placed below the bottom margin starts a new page. The footer sits just inside the margin (`footerTopPt`).
- **Output.** The renderer collects the document's `data` events into one `Uint8Array`. PDFKit also ships `toBytes` and `toBlob` in `pdfkit/output`, but they are marked experimental, so the spike does not use them.
- **`subset: 'PDF/UA'`** also writes the XMP `pdfuaid:part 1`, `/MarkInfo << /Marked true >>`, `/Lang` and `/ViewerPreferences << /DisplayDocTitle true >>` (with `displayTitle: true`).

## What Story 6.5 must reuse

- `src/report/layout/documentLayout.ts`: page size, margins and type sizes in points, plus colours. Move the colours to the Story 1.7 tokens when those land.
- The structure helpers in `src/report/pdf/`: `addHeading`, `addParagraphs`, `addList`, `addReceiptTable`, `addRunId`, `drawMetisMark`, `drawRule`, `drawPageLabel`, `withWordSeparator`.
- The font pipeline: `loadPdfFonts` (Vite `?url` assets, fetched lazily) and `pdfFontName`, plus the decomposed `.woff` files and the outline guard test.
- `tools/checkInitialBundle.ts` and the `verapdf` job. Point the job at the real document once it exists.
- **Remove with 6.5:**
  - `spike/pdf.html` and its `input` entry in `vite.config.ts`;
  - `src/spike/` and the `spike` layer in `eslint.config.js`;
  - its knip entry;
  - `samplePostMortem.ts`;
  - the `pdfSpike` e2e spec, or replace it with the real end-of-run flow.
- **Errors.** Shared `Result` (Story 1.2) does not exist yet, so the spike throws on every failure, including a failed font fetch or chunk load. Story 6.5 must return `Result` for those expected failures.

## Fallback (not needed)

The outcome is go, so no fallback is proposed. If a later PDFKit or fontkit upgrade breaks PDF/UA, the options to raise with Tiziano are:

- pin PDFKit 0.20.2;
- post-process tagging;
- ship the HTML document plus PNG only.
