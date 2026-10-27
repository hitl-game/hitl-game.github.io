---
baseline_commit: 6d5ac8d
---

# Story 8.1: PDFKit tagged-PDF spike

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want proof that PDFKit produces PDF/UA in our Vite build on static hosting,
so that the end-of-run PDF is de-risked before Epic 6 (Story 6.5) depends on it.

## Acceptance Criteria

Source: epics.md → Story 8.1; test-design PDF-01 and risk R8. This is a **spike**: the deliverable is evidence plus a go/no-go ADR, not a product feature.

1. **Lazy chunk, no cross-origin isolation.** **Given** PDFKit 0.20 standalone in Vite. **When** the app is built. **Then** PDFKit and its fonts are a lazy chunk outside the 150 KB initial budget, and it runs without `SharedArrayBuffer` or cross-origin isolation on the deployed Pages site.
2. **PDF/UA sample, validated in CI, under 3 s.** **Given** a sample document shaped like the Post-mortem (heading, paragraphs, a list, a table, a decorative mark). **When** generated in the browser with embedded Inter (added to `assets/fonts` by the spike, because Story 1.7 has not landed; WOFF2 or converted) and `tagged: true`, `subset: 'PDF/UA'`. **Then** veraPDF validates it as PDF/UA in a CI job on `main`, and generation takes < 3 s on the reference laptop.
3. **ADR.** **Given** the spike. **When** finished. **Then** an ADR in `docs/adr/` records go/no-go, font handling and gotchas; on no-go, it records the fallback to raise with Tiziano before E6.

**Covers:** architecture D8, ADR-003; NFR6, NFR19. Test-design: **PDF-01** (P0), risk **R8**; also feeds PRF-04 (lazy chunk) and PLT-04 (Pages constraints).

## Tasks / Subtasks

- [x] **Task 1: Prove PDFKit builds and runs in the Vite app as a lazy chunk (AC 1)**
  - [x] 1.1 Read `node_modules/pdfkit/package.json`: the `exports` map serves `./js/pdfkit.browser.mjs` to non-Node consumers, and `js/pdfkit.standalone.js` also ships. Decide which one Vite 8 bundles correctly (default: the `exports` browser build through a dynamic `import('pdfkit')`). Record the choice and why in the ADR.
  - [x] 1.2 Resolve any Node-global fallout in the browser (`Buffer`, `process`, `fs`, streams). PDFKit 0.20 pulls `fontkit`, `linebreak`, `png-js`, `fflate`, `@noble/hashes`, `@noble/ciphers`. Fix with the smallest Vite config change; no polyfill package unless justified in the PR and the ADR.
  - [x] 1.3 Keep PDFKit out of the main chunk: dynamic `import()` only. Prove it with a check that fails if `dist/assets/index-*.js` contains PDFKit code (extend `.size-limit.json` or add a build-output test). The existing `initial bundle` size-limit entry stays at 150 KB gzip and must not grow.
  - [x] 1.4 Report the lazy chunk size (raw and gzip) in the ADR. No budget exists for it; record it so Story 8.8 can judge it.
  - [x] 1.5 Confirm the generation path needs no `SharedArrayBuffer`, no workers with shared memory, and no COOP/COEP headers (assert `crossOriginIsolated === false` and `typeof SharedArrayBuffer` is irrelevant to the code path, in the e2e spec).
- [x] **Task 2: Embed Inter (AC 2)**
  - [x] 2.1 Add the used Inter weights to `assets/fonts/` named `inter-<weight>.woff2` (architecture naming: `inter-500.woff2`). Minimum for the sample: regular for body and bold or semibold for the heading. Only weights actually used (architecture D14).
  - [x] 2.2 Add the Inter licence (SIL OFL 1.1) next to the fonts and state the source and version in the ADR. Do not add a runtime dependency to get the files; copy them once (a `devDependency` that is not used at runtime is not wanted either).
  - [x] 2.3 Load font bytes through Vite asset URLs (`?url`) and `fetch` them lazily. URLs are relative to `base` (`/`); zero requests outside the site origin.
  - [x] 2.4 Verify PDFKit/fontkit embeds WOFF2 directly. If it does not, convert to TTF/OTF and record that. Embedding must be a real subset embed: PDF/UA forbids non-embedded fonts, so do not use PDFKit's standard (Helvetica) fonts anywhere, including for the "Page 1 of 1" footer.
  - [x] 2.5 Record the glyph coverage you ship (for example the Latin subset) and the consequence for non-English locales later.
- [x] **Task 3: Tagged sample document (AC 2)**
  - [x] 3.1 Create the spike module in `src/report/pdf/` (layer `report`; public API through `src/report/index.ts` only). Shared layout tokens go in `src/report/layout/` (page size, margins, font sizes) as plain constants. The architecture says both renderers will share them, but build only what the sample needs.
  - [x] 3.2 Build the sample from a hard-coded Post-mortem-shaped model: title (`H`), 2 paragraphs (`P`), a list (`L` > `LI` > `Lbl` + `LBody`), a small table (`Table` > `TR` > `TH`/`TD`), and a decorative mark (stand-in for the Metis mark) drawn as an **artifact**. Include a `Figure` with `alt` only if cheap; the Post-mortem has no figure, the Metis mark is an artifact.
  - [x] 3.3 Options exactly as in D8: `tagged: true`, `subset: 'PDF/UA'`, `pdfVersion: '1.7'`, `lang: 'en-US'`, `displayTitle: true`, `info.Title` set. Use `doc.markStructureContent(tag)` / `doc.struct(tag, ...)` / `doc.addStructure(...)` / `doc.markContent('Artifact', ...)` per PDFKit's accessibility guide (see Dev Notes). Include word-separating spaces inside marked content, including line and paragraph ends.
  - [x] 3.4 Write objects in natural reading order; mark every non-structure drawing (rules, borders, the mark, the page footer if decorative) as an artifact.
  - [x] 3.5 Expose one function (for example `renderSamplePdf`) returning the bytes as a `Uint8Array` or `Blob`. Unexpected failures throw; expected ones (chunk or font fetch failure) return `Result` (shared `Result` does not exist until Story 1.2; if it still does not exist, keep the spike throwing and say so in the ADR rather than inventing a stand-in).
  - [x] 3.6 Keep Charter limits: functions <= 40 lines, files <= 300, complexity <= 10, <= 3 params, named exports only, no comments except a non-obvious why. Split the sample builder by structure element (heading, list, table) to stay under the limits.
- [x] **Task 4: A way to run it in the built app (AC 1, 2)**
  - [x] 4.1 The app has no UI for documents yet and this story must not add game UI. Provide a minimal, **non-linked** second Vite entry (for example `spike/pdf.html` in `build.rollupOptions.input`, with `<meta name="robots" content="noindex">`) that dynamically imports the report module and exposes a "generate" button plus a download link. It ships in the production build so it can run on the deployed Pages site. Story 6.5 removes it.
  - [x] 4.2 The page must satisfy the existing gates: no literal user-facing strings in JSX (use a plain-HTML page with a tiny script, or `t()`-free text outside JSX), no `console`, no `any`, relative URLs only. If a lint rule blocks the page, restructure; never suppress without a written reason.
  - [x] 4.3 Record the timing with `performance.now()` around generation in the page and expose it to the test, for the < 3 s check. Timing code lives in the spike page, not in `core/`.
- [x] **Task 5: Playwright e2e + veraPDF in CI (AC 1, 2)**
  - [x] 5.1 Add `tests/e2e/pdfSpike.spec.ts`: open the spike page, generate, capture the bytes (download event or a `blob:` read) and save them to a known path (for example `test-results/pdf-spike/sample.pdf`), assert generation time < 3000 ms, assert no console errors and **no request outside the site origin**, assert `crossOriginIsolated === false`. It runs on all three engines on `main` and on Chromium on PRs, like the smoke test. Reuse the smoke test's request-capture pattern; extract a shared helper only if the second copy would trip jscpd.
  - [x] 5.2 Add a CI job `verapdf` in `.github/workflows/ci.yml`, **on `main` only** (`if: github.event_name == 'push'`), that runs the e2e spec output through veraPDF with the PDF/UA-1 profile (`--flavour ua1`) and fails on any non-compliant result. Obtain veraPDF reproducibly (official Docker image `verapdf/cli`, or the pinned release installer; it needs a JRE). Pin the version, and record how in the ADR. Do **not** rename or touch the existing `gates`, `unit`, `e2e` jobs: they are required status checks on `main`.
  - [x] 5.3 Decide whether the generated PDF is produced against the deployed site or the local preview server. Default: the CI `verapdf` job generates the PDF with `vite preview` of the built `dist` (deterministic, no deploy race), **and** the existing post-deploy `smoke` job in `deploy.yml` additionally opens the spike page on `https://hitl-game.github.io/` and checks it generates a non-empty `%PDF` without errors (this covers "runs on the deployed Pages site"). Keep the deploy smoke small; veraPDF itself stays in `ci`.
  - [x] 5.4 Upload the sample PDF and the veraPDF report as workflow artifacts (`actions/upload-artifact@v7`) so a failure can be inspected.
  - [x] 5.5 Do not add `verapdf` as a required status check (it only runs on `main`). Tiziano decides later whether to wire it into branch protection; mention it in the PR.
- [x] **Task 6: ADR (AC 3)**
  - [x] 6.1 Create `docs/adr/` (it does not exist yet; `docs/` is empty) and write `docs/adr/0003-tagged-pdf-pdfkit-spike.md`, or the next free number, noting that it is the outcome of architecture ADR-003.
  - [x] 6.2 Record: **go or no-go** with the evidence (veraPDF result, timing numbers on the machine used, lazy chunk size, engines tested); font handling (source, weights, WOFF2 vs converted, subset, licence); build gotchas (Buffer/Node globals, standalone vs browser build, Vite config changes); PDFKit API gotchas found (trailing spaces, artifact marking, table structure, list structure); what Story 6.5 must reuse.
  - [x] 6.3 On **no-go**: stop, record the failing veraPDF rule IDs and the fallback options (for example post-process tagging, server-less alternatives, or shipping the HTML document plus PNG only), and **raise it with Tiziano before E6**. Do not start a fallback implementation in this story.
- [x] **Task 7: Housekeeping**
  - [x] 7.1 `knip.json` lists `pdfkit` under `ignoreDependencies` because nothing imported it. Once the spike imports it, remove that entry (knip reports stale ignores, as it did for `yaml` in Story 1.1). Add the spike HTML entry to knip `entry` if needed.
  - [x] 7.2 Run `npm run check` (all gates except e2e) and `npx playwright test` locally on Node 24; then the Agent Review Checklist and paste it, ticked, in the PR.

### Review Findings

Code review run 1 (2026-10-27; Blind Hunter, Edge Case Hunter, Acceptance Auditor; 19 raw findings, 11 patched, 2 deferred to Tiziano, 6 dismissed as verified non-issues).

- [ ] [Review][Decision] Firefox has never run `pdfSpike.spec.ts` — Playwright's Firefox fails to launch in the sandbox ("Could not find profile folder", also on this run). The first push to `main` runs the spec on Firefox in the three-engine `e2e` job; a Firefox-only failure there would block the Pages deploy. Options: run `npx playwright test --project=firefox tests/e2e/pdfSpike.spec.ts` once outside the sandbox before merging, or accept the first-run risk (the job can be re-run after a fix).
- [ ] [Review][Decision] The `verapdf` job pulls `verapdf/cli` anonymously from Docker Hub [.github/workflows/ci.yml:79]. A registry rate limit or outage fails `ci` on `main` and therefore the deploy. Options: accept (re-run), or mirror the image (GHCR) later. Low likelihood; no code change made.
- [x] [Review][Patch] `findStaticImports` missed `export … from` re-exports, so an eagerly loaded facade chunk could carry PDFKit unnoticed [tools/findInitialChunks.ts:4] — regex now matches `import` and `export` forms; test added.
- [x] [Review][Patch] Spike page left the status at "Generating…" on failure and the e2e surfaced only a 5 s attribute timeout [src/spike/pdfSpikePage.ts:30, tests/e2e/pdfSpike.spec.ts:14] — the page writes `Failed: <message>` and rethrows; the spec asserts the status text first, so the message is in the failure report.
- [x] [Review][Patch] `doc.on('error', reject)` listened for an event PDFKit never emits [src/report/pdf/buildSamplePdf.ts:14, src/report/pdf/pdfkit.d.ts:86] — listener and overload removed; failures throw from the drawing call.
- [x] [Review][Patch] `pdfkit.d.ts` declared `table()` as returning `this` (runtime returns a `PDFTable`) and members the renderer does not use (`bulletRadius`, artifact types `Page`/`Background`) [src/report/pdf/pdfkit.d.ts:18-37,79] — return type fixed, unused members removed.
- [x] [Review][Patch] `verapdf` artifact upload used `if: always()` with `if-no-files-found: error`, adding a second red step when the test step fails early, and kept no Playwright report [.github/workflows/ci.yml:100-106] — now `!cancelled()`, `warn`, and `playwright-report` included.
- [x] [Review][Patch] ADR glyph coverage said 231 code points / 518 glyphs; the shipped fonts hold 230 / 515 (fontTools) [docs/adr/0003-tagged-pdf-pdfkit-spike.md:54] — corrected.
- [x] [Review][Patch] ADR status read as a settled decision while AC 1 (deployed site) and AC 2 (veraPDF on `main`) can only be confirmed after merge [docs/adr/0003-tagged-pdf-pdfkit-spike.md:3] — status now states what is proven locally and what the first `main` run confirms.
- [x] [Review][Patch] The outline-guard unit test runs PDFKit's `node` export, not the browser build the ADR describes [src/report/pdf/buildSamplePdf.test.ts, docs/adr/0003-tagged-pdf-pdfkit-spike.md:99] — documented in the test header and the ADR; the browser build stays covered by the e2e spec.
- [x] [Review][Patch] Footer helpers assume a one-page body; Story 6.5 is told to reuse them [src/report/pdf/addStructureBlocks.ts:55, src/report/pdf/drawArtifacts.ts:46; since run 2 `addRunId.ts` and `drawPageLabel.ts`] — limitation and the 6.5 obligation (per-page footer, `bufferedPageRange()`) recorded in the ADR; no code change, by the scope fence.
- [x] [Review][Patch] `.size-limit.json` `modulepreload-polyfill-*.js` glob matches nothing once 6.5 removes the second entry [.size-limit.json:7] — added to the ADR's "Remove with 6.5" list.
- [x] [Review][Patch] `AGENTS.md` and `CONTRIBUTING.md` still described `size` as size-limit only [AGENTS.md:31, CONTRIBUTING.md:19] — updated.

Dismissed after verification: top-level `input` in `vite.config.ts` is a valid Vite 8 option (`SharedEnvironmentOptions.input`, `dist/spike/pdf.html` is built); the `verapdf` job builds through Playwright's `webServer` (`npm run build && npm run preview`); `if: github.event_name == 'push'` is `main`-only because `on.push.branches` is `[main]`; `tools/checkInitialBundle.ts` with a non-root `base` is out of scope (`base` is `/` by NFR19, and `size-limit` fails first without `dist/`); task 1.5's `SharedArrayBuffer` clause is proven by generation succeeding with `crossOriginIsolated === false` (no chunk contains the identifier); `struct(type, fn)` matches PDFKit's runtime, which accepts a child as the second argument.

Code review run 2 (2026-10-27; Blind Hunter, Edge Case Hunter, Acceptance Auditor; 13 raw findings, 12 after merging, 7 patched, 0 deferred, 5 dismissed as verified non-issues). Run 1's two decisions above stay open for Tiziano.

- [x] [Review][Patch] The Inter bytes passed as the constructor's default `font` made PDFKit parse the regular font again on every `doc.font('inter-400')` call: a probe against the installed 0.20.2 counted 7 fontkit opens for 2 fonts, because `font()` returns on the name match before caching the registered name [src/report/pdf/buildSamplePdf.ts:31] — the document is now created with `font: null` (PDFKit then skips Helvetica, which the browser build cannot load) and the fonts are registered right after; 2 opens. The table's per-cell font rollback still re-parses (PDFKit passes the bytes back); recorded in the ADR for Story 6.5.
- [x] [Review][Patch] `AGENTS.md` did not list the `spike → report` layer added to `eslint.config.js` [AGENTS.md:14] — added, with the 6.5 removal note.
- [x] [Review][Patch] `addStructureBlocks.ts` and `drawArtifacts.ts` were not named after a main export, and the page geometry lived under "artifacts" while the word separator lived under "structure blocks" [src/report/pdf/addStructureBlocks.ts, src/report/pdf/drawArtifacts.ts] — one module per helper (`addHeading`, `addParagraphs`, `addList`, `addRunId`, `drawMetisMark`, `drawRule`, `drawPageLabel`, `withWordSeparator`); the geometry (`pageWidthPt`, `pageHeightPt`, `contentRightPt`, `contentWidthPt`, `footerTopPt`) is a plain constant in `documentLayout` (task 3.1), so the helpers no longer read `doc.page` and the `PDFPage` typing is gone. The document is created with `size: [pageWidthPt, pageHeightPt]` (PDFKit's A4) instead of the `'A4'` name, so the two cannot drift.
- [x] [Review][Patch] `lazyOnlyMarkers` was a one-item `{ name, marker }` list with both fields equal (Charter 8, speculative generality) [tools/checkInitialBundle.ts:7] — a single `pdfkitMarker` constant.
- [x] [Review][Patch] On a non-compliant PDF the `verapdf` job log showed only the summary line; the failing rule IDs were only in the uploaded artifact [.github/workflows/ci.yml:96] — the step now prints every `<rule … status="failed">` element before failing.
- [x] [Review][Patch] The static-import scanner followed `./` specifiers only, so a chunk layout with sub-directories (`import"../vendor/x.js"`) would be skipped silently, reopening the false negative the gate exists to close [tools/findInitialChunks.ts:5] — it now captures `./` and `../` specifiers and resolves them with `path.posix.join`; test added.
- [x] [Review][Patch] ADR gotchas missed two PDFKit table behaviours seen in the generated file: `TH` cells list themselves in their own `/Headers` array, and the per-cell font rollback re-parses a bytes-registered font [docs/adr/0003-tagged-pdf-pdfkit-spike.md:129] — both recorded (veraPDF accepts the first; 6.5 keeps per-cell fonts to the header row), plus the serial font-then-chunk loading that 6.5 can parallelise.

Dismissed after verification: top-level `input` in `vite.config.ts` and a "missing" `OFL.txt` were raised again on the diff alone (both verified in run 1; `OFL.txt` is in the branch); table `scope: 'column'` is lower-cased and mapped to `/Scope /Column` by PDFKit (`pdfkit.browser.mjs:6518`); the cold timing includes the chunk and font loads on purpose (PRF-06 measures cold and warm; on Pages the CDN latency is covered by a 20× margin and Playwright's retries); `readGlyfBytesPerGlyph` could return `Infinity` only for a non-empty `glyf` with zero `maxp` glyphs, which fontkit never writes.

Code review run 3 (2026-10-27; Blind Hunter, Edge Case Hunter, Acceptance Auditor; 16 raw findings, 15 after merging, 9 patched, 0 deferred, 6 dismissed as verified non-issues). Run 1's two decisions above stay open for Tiziano.

- [x] [Review][Patch] `drawMetisMark` set the gradient fill after building the path, so the content stream read `… h /Pattern cs /Sh1 scn f`: colour operators inside a path object, which ISO 32000-1 (8.5.2) does not allow. Readers and veraPDF's PDF/UA-1 profile tolerate it; a PDF/A preflight may not, and Story 6.5 would inherit the idiom [src/report/pdf/drawMetisMark.ts:20] — `fillColor(gradient)` now precedes `circle()`; verified in the regenerated content stream; both PDFs still pass veraPDF; gotcha recorded in the ADR.
- [x] [Review][Patch] Task 4.1 asks the spike page to import the report module dynamically; it imported it statically and the deviation was not recorded [src/spike/pdfSpikePage.ts:1] — `import('../report')` inside `generatePdf`. Vite emits a separate `report-*.js` chunk (4.1 kB raw, 1.9 kB gzip) that does not collide with the `index-*.js` budget glob (checked on the build output), and the cold timing now covers it.
- [x] [Review][Patch] ADR and Dev Record claimed a word separator on "every string" while the page label, an artifact, has none [docs/adr/0003-tagged-pdf-pdfkit-spike.md:120] — both now say structure strings only, and why the label is excluded.
- [x] [Review][Patch] ADR evidence predated the run-2 refactor (6.2 kB spike chunk; Chromium 133–142 / 82–90 ms against 161 / 93 ms in the latest local run) [docs/adr/0003-tagged-pdf-pdfkit-spike.md:22-29] — re-measured on the final build over three runs (Chromium cold 137–185 ms / warm 84–86 ms, WebKit cold 104–118 ms / warm 52–61 ms); chunk sizes updated.
- [x] [Review][Patch] ADR said `size-limit` "fails on a glob that matches nothing"; it only fails when the whole entry is empty (`get-config.js` filters on `check.files.length`; the current `dist/` has no `index-*.css` and `npm run size` passes) [docs/adr/0003-tagged-pdf-pdfkit-spike.md:113,149] — the "Entry name" gotcha and the 6.5 removal list now state the real behaviour.
- [x] [Review][Patch] ADR status line read as if the CI and Pages confirmations had already happened, while the Evidence section says they have not [docs/adr/0003-tagged-pdf-pdfkit-spike.md:3] — reworded as still to confirm by the first run on `main`.
- [x] [Review][Patch] Declaration leftovers: `PDFTable.document` existed only to avoid an empty interface, `align` and `scope` carried unused union members, `ReadAsset` was exported but never imported [src/report/pdf/pdfkit.d.ts:14,21,31, tools/findInitialChunks.ts:9] — `table()` returns `object` with a why, the unions are the values used, `ReadAsset` is module-private.
- [x] [Review][Patch] `stopCount` in `drawMetisMark` counted intervals, not stops [src/report/pdf/drawMetisMark.ts:15] — `intervalCount`.
- [x] [Review][Patch] Run-1 findings pointed at `addStructureBlocks.ts` and `drawArtifacts.ts`, removed in run 2 [story Review Findings, run 1] — the current file names are added to the pointer.

Dismissed after verification: the `verapdf` build step, top-level `input`, the fonts "missing" from the patch and `push` being `main`-only were raised again on the diff alone (run 1 verified all four; the review diff excludes `assets/fonts`); the warm timing cannot read the cold value, because Playwright's `click()` returns after the handler has synchronously set "Generating…"; a string-valued `path` in `.size-limit.json` would stop `tools/checkInitialBundle.ts` with a TypeError instead of its own message, but the repo's config is an array and the script fails closed either way (defensive noise per the Charter).

Code review run 4 (2026-10-27; Blind Hunter, Edge Case Hunter, Acceptance Auditor; 26 raw findings, 21 after merging, 1 patched, 0 deferred, 20 dismissed as verified non-issues; the Acceptance Auditor reported none). Run 1's two decisions above stay open for Tiziano.

- [x] [Review][Patch] The ADR said `doc.table` re-parses the font only "after every cell with its own font" and told Story 6.5 to keep per-cell fonts to the header row. A probe against 0.20.2 shows the rollback runs after every cell, three times per cell, with or without a per-cell font (24 fontkit parses for the sample's 8 cells, `_fontCount` 4 → 28); the advice does not avoid it [docs/adr/0003-tagged-pdf-pdfkit-spike.md:134] — the gotcha now records the measured behaviour and cost (about 35 ms for the sample table, about 120 ms for a 30-row receipt, of which about 100 ms are parses), the option that does avoid it (registering fontkit font objects, which `PDFFontFactory.open` uses without parsing: 24 ms for 30 rows), and that a `family` name is not an option (fontkit treats it as a variation and throws). No renderer change: the fix needs fontkit as a direct dependency or PDFKit's private `_fontFamilies`, both outside the spike's scope fence.

Dismissed after verification: the ADR's chunk, bundle, font and PDF sizes and the timing ranges match a fresh build and the local `test-results/pdf-spike` output (527.59 / 212.77 kB PDFKit, 4.07 / 1.86 kB report, 2.47 / 1.26 kB spike, 4.98 kB initial, 17 087-byte PDF); the `verapdf` build step, the fonts "missing" from the patch, `push` being `main`-only, top-level `input`, the ADR status wording, the cold timing including network on Pages and the outline guard's `Infinity` path were raised again (runs 1 to 3 verified or dismissed all of them); `findHtmlAssets` attribute order and quoting and a `/assets/...` or `.mjs` import specifier do not occur in Vite's output (every `dist/` specifier is `./`, attributes are double-quoted with `rel` first), so widening the scanner is speculative; a missing chunk file or the bare `PDFKit` marker only make the gate fail closed, loudly; no budget for the lazy chunk is what task 1.4 asks (record it for Story 8.8); `needs`/`timeout-minutes` on `verapdf` and an axe pass on the throwaway spike page follow neither the existing jobs nor the story; the footer overrun is already in the deferred ledger (run 1); an empty list or an unended structure element cannot happen with the hard-coded sample; `matchesSizeLimitGlob` supports the globs the repo uses; unit tests for `checkInitialBundle.ts`'s two failure branches were exercised by hand (Debug Log) and the script is a top-level gate, not a library.

## Dev Notes

### Current repository state (read before touching anything)

- Story 1.1 is merged (PRs #1 to #3). Branch protection on `main` requires the checks `gates`, `unit`, `e2e` and code-owner review. **Do not rename those jobs.**
- `pdfkit ~0.20.2` is already a dependency in `package.json` (declared by Story 1.1, unused, hence the knip ignore). Latest on npm is 0.20.2.
- `src/report/index.ts` is an empty `export {};` stub (layer exists, no module yet). `src/report/layout` and `src/report/pdf` do not exist.
- `assets/` holds only `.gitkeep`. There is no `docs/adr/`, no `public/`, and no fonts anywhere.
- Only one HTML entry exists (`index.html`); `vite.config.ts` is `base: '/'` + the Preact plugin and nothing else.
- Existing gates the new code must pass: ESLint `strictTypeChecked` + boundaries, Stylelint, Prettier, jscpd (`minTokens: 50`, `threshold: 0`), knip, size-limit (150 KB gzip on `dist/assets/index-*.js` and `index-*.css`), Vitest projects `core` (node; `src/{core,shared}`, `tools`, `tests`) and `dom` (happy-dom; the rest of `src`).
- CI today: `ci.yml` jobs `gates`, `unit`, `e2e` (Chromium on PR; three engines on `main` through the `BROWSERS` env). `deploy.yml` deploys the tip of `main` then runs a post-deploy `smoke` job against the live URL using the same spec. Playwright install on PRs was slow (about 9 min of apt) per Story 1.1's follow-up note.

### What this story changes and what must be preserved

- **Changes:** adds `src/report/{pdf,layout}` modules, `assets/fonts/*`, a spike HTML entry plus `vite.config.ts` multi-page input, one e2e spec, a `verapdf` CI job on `main`, a small addition to the post-deploy smoke, `docs/adr/`, a knip config tweak.
- **Must preserve:** the main bundle stays within 150 KB gzip and contains no PDFKit; the smoke spec still passes unchanged (empty `<main>`, no console errors, no foreign request, axe clean); the existing required job names; the layer rules (`report` imports `core/report` and `shared` only; `ui` never imports `report` directly except lazily through `app`; for the spike no `ui` or `app` wiring is needed).

### Architecture guardrails that apply

- **D8:** one `ReportModel`, two renderers. PDF = PDFKit with `tagged: true`, `subset: 'PDF/UA'`, `pdfVersion: '1.7'`, `lang`, `displayTitle`, full structure tree (`H`, `P`, `Table`, `Figure` with `alt`), decorative content as artifacts. This story does **not** build `ReportModel` or `buildReportModel` (E6.2, `core/report`); the sample is hard-coded and shaped like the Post-mortem (UX DESIGN.md: white A4/Letter page, letterhead, doc-title, header strip, highlights, receipt, footer `Run ID` + "Page 1 of 1", Metis mark = the only Metis colour, treated as an artifact).
- **Loading (D14):** renderers, PDFKit and PDF fonts are a separate lazy chunk. Fonts are self-hosted WOFF2, used weights only, no third-party requests at runtime.
- **Hosting (NFR19):** GitHub Pages, no custom headers, no `SharedArrayBuffer`/COOP/COEP, relative URLs, `base` is `/` for the org site. No runtime network calls beyond the site's own origin (NFR13).
- **Performance (NFR6):** PDF generation < 3 s on the reference laptop, cold and warm chunk (PRF-06). Measure both cold and warm and report both.
- **Spoiler safety:** the sample contains no real game data and nothing Alignment-related. Do not invent document copy beyond neutral sample text; it is not player-facing and is not shipped as game content. It must not read as final narrative (no `docs/kernel-bank.md` needed because no content item is created).
- **Naming/units:** unit suffixes on numbers with units (`generationDurationMs`, `marginPt` or similar for layout constants), verbs for functions (`renderSamplePdf`, `buildSampleDocument`), named exports only, no `utils.ts`/`helpers.ts`, camelCase files named after their main export.

### Testing standards for this story

- The real proof is the e2e generation + veraPDF run, not unit tests. Add a small Vitest test only where it pays (for example the layout constants or a pure function that builds the structure description), in the `dom` project; never assert on DOM snapshots; query by role.
- veraPDF is the oracle for PDF/UA-1. Optionally also assert in e2e that the bytes start with `%PDF-1.7`, contain `/MarkInfo` with `/Marked true`, `/Lang`, and a `/StructTreeRoot` (cheap sanity checks that fail fast before the CI job).
- Verify the gate has teeth once: temporarily generate the PDF with `tagged: false` (or an unembedded standard font) and confirm veraPDF fails; do not commit the experiment. Record it in the Debug Log.
- Measure timing on the dev machine and state the hardware in the ADR. "Reference laptop" is not defined in the repo; use the machine at hand and say so.

### Latest Tech Information (Context7 `/foliojs/pdfkit`, npm checked 2026-10-27)

- PDFKit 0.20.2 is the latest; browser export is `js/pdfkit.browser.mjs` via `exports.default`; Node export is separate. `js/pdfkit.standalone.js` is the prebuilt bundle.
- PDFKit's PDF/UA checklist (docs/accessibility.md):
  - `pdfVersion: '1.5'` or higher, `subset: 'PDF/UA'`, `tagged: true`, `info.Title` plus `displayTitle: true`, natural language via the `lang` option or in structure;
  - add logical structure for all significant content; alt text on `Figure` via `doc.struct('Figure', { alt, bbox }, ...)`;
  - include word-separating spaces in marked content even at line and paragraph ends (`doc.text('Hello, world! ')`);
  - mark all non-structure content as `Artifact`; write objects in reading order; do not convey information by visuals alone.
- API: `doc.markStructureContent('P')` ... `doc.endMarkedContent()`; `doc.struct(type, options?, children?)`; `doc.addStructure(element)`; `element.add(child)`; `element.end()` flushes a finished element (lets memory be freed). Check the same docs for artifact marking (`markContent('Artifact', ...)`) and the tag list for `L`/`LI`/`Lbl`/`LBody` and `Table`/`TR`/`TH`/`TD` before coding; confirm against the installed 0.20.2 types in `node_modules/pdfkit/types`.
- Run `npx ctx7@latest docs /foliojs/pdfkit "<question>"` for any API detail; do not rely on memory. Fonts: fontkit (a PDFKit dependency) is what opens WOFF2; confirm WOFF2 support in the installed `fontkit@2.x` rather than assuming.
- TypeScript 6 with explicit `types`: PDFKit ships `types/`; if the module's types are missing or too loose for `strictTypeChecked`, add the narrowest local declaration rather than `any` or a suppression.
- veraPDF: current release and Docker image tag must be checked at implementation time (not verified here). Use the PDF/UA-1 flavour (`ua1`), machine-readable output (`--format mrr` or `xml`) and fail the job on `isCompliant="false"`.
- GitHub Actions majors in use: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`.

### Previous story intelligence (Story 1.1)

- Config choices worth reusing: `~` exact-minor pins through `.npmrc`; lint fixtures prove rules still fail (no new Charter rule is needed here); Vitest `test.projects`; Playwright runs against `BASE_URL` in `deploy.yml`'s smoke job.
- Things that bit last time: (a) the empty `<main>` has zero size, so assert with `toHaveCount`; (b) ESLint test-file relaxations also covered fixture folders until excluded, so check that rules apply to any new directory (for example a `spike/` folder) and that boundaries element patterns match it; (c) knip flags stale `ignoreDependencies`; (d) Firefox may not launch locally on this macOS version, so rely on the three-engine run on `main` for Firefox and say so; (e) `npx playwright install --with-deps` is slow on PRs.
- Review loop precedent: the 1.1 code review found gate bypasses. Expect review to probe: lazy-ness of the chunk, request isolation, and that CI jobs cannot be skipped silently.
- Added dependencies in 1.1 beyond the architecture list: `eslint-import-resolver-typescript`, `@types/node`, `eslint-plugin-sonarjs`.

### Git intelligence

- Last commits: `6d5ac8d` Story 1.1 review fixes (stricter Stylelint/ESLint, fixtures 71, vitest globs, deploy only ships the tip of main), `c8173de` close 1.1, `46078d7` scaffold, gates, CI and deploy, `72f0463` planning specs.
- Conventions: one story per branch (`story/<key>`), PR with the Agent Review Checklist, code review loop before the PR (max 5 runs), Tiziano merges with admin bypass only after green CI.

### Scope fence (what this story must NOT do)

- No `ReportModel`, `buildReportModel`, `RunRecord`, PNG renderer, end-of-run page or any game UI (E6). No `ui/features/endOfRun`.
- No i18n/`t()` infrastructure (Story 1.4) and no design tokens (Story 1.7); layout constants for the sample are local to `report/layout`. If 1.7 lands first, take Inter from `assets/fonts` instead of adding it.
- No service worker/precache (Story 8.7). No locale handling beyond a fixed `lang: 'en-US'` and the page size choice recorded as a finding.
- No new runtime dependency (PDFKit is already declared). veraPDF is CI tooling only, not an npm dependency.
- The spike page and its HTML entry are throwaway: Story 6.5 removes them; do not build abstractions "for 6.5".

### Project Structure Notes

- Target new/changed files:

  ```
  src/report/index.ts                  (export the spike renderer)
  src/report/pdf/<sample + structure modules>.ts
  src/report/layout/<layout constants>.ts
  assets/fonts/inter-<weight>.woff2 + OFL licence
  spike/pdf.html (+ its script)        (non-linked second Vite entry; exact folder is the dev's call if lint requires)
  vite.config.ts                       (multi-page input, Node-global fix only if needed)
  tests/e2e/pdfSpike.spec.ts
  .github/workflows/ci.yml             (new `verapdf` job, main only)
  .github/workflows/deploy.yml         (small post-deploy check of the spike page)
  .size-limit.json or a build-output test (PDFKit not in the initial bundle)
  knip.json                            (drop `pdfkit` ignore, add entry)
  docs/adr/0003-tagged-pdf-pdfkit-spike.md
  ```

- Variance from the architecture tree: the tree has no `spike/` folder and no `docs/adr/` content yet; both are additions justified by the AC (deployed-site proof, ADR).

### Project Context Rules (from `_bmad-output/project-context.md`, applicable here)

- **CI is the definition of done.** Never disable a gate to merge; a lint suppression needs a written reason.
- **No new runtime dependency without justification in the PR.** The initial bundle budget is 150 KB gzip; PDFKit, report renderers and PDF fonts stay lazy (`import()` only). A static import into the main bundle fails size-limit.
- **Zero runtime network calls.** No CDN fonts or scripts; everything ships in the build.
- **Hosting is GitHub Pages:** no custom headers, no SharedArrayBuffer, relative URLs, base `/` for this org site.
- **Layers:** `report → core/report + shared`; import through `index.ts` only; features never import features.
- **Code Quality Charter:** named exports only, no `any`, `!`, `@ts-ignore`, nested ternaries; functions <= 40 lines, files <= 300, complexity <= 10, <= 3 params; no AI-style comments or TODOs; no `utils.ts`/`helpers.ts`; unit suffixes on numbers.
- **Shared documents (PNG, PDF) are built only by `buildReportModel`** (the single spoiler filter). This spike uses a hard-coded non-game sample and must not become a second path to build shared artifacts; Story 6.5 replaces the sample input with the real `ReportModel`.
- **Tests:** colocated unit tests; e2e in `tests/e2e`; UI tests by role; no DOM snapshots; test names state behaviour.
- **Before closing:** run the Agent Review Checklist (game-architecture.md → Implementation Patterns) and paste it, ticked, in the PR.

### References

- [Source: epics.md#Story 8.1: PDFKit tagged-PDF spike] (`_bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md`), also Epic 8 intro and Global sequence
- [Source: epics.md#Story 6.5: Tagged PDF export] (depends on this story)
- [Source: game-architecture.md#D8 End-of-run documents], [#ADR-003], [#Asset Loading (D14)], [#Hosting Constraints (GitHub Pages)], [#Project Structure] (`report/pdf`, `assets/fonts`, naming `inter-500.woff2`)
- [Source: game-test-design.md#4.5 PDF/UA and Shared Documents (R8)] PDF-01 to PDF-06; risk R8; PRF-04, PRF-06
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md] (Inter typography, end-of-run document look)
- [Source: _bmad-output/project-context.md]
- [Source: implementation-artifacts/1-1-project-scaffold-quality-gates-ci-and-pages-deploy.md] (Dev Agent Record, completion notes)
- [Source: https://github.com/foliojs/pdfkit/blob/master/docs/accessibility.md] via Context7 `/foliojs/pdfkit`

## Questions for Tiziano (non-blocking; defaults are stated)

1. **How the sample runs on Pages.** Default: a non-linked second Vite entry (`spike/pdf.html`) shipped to production and deleted by Story 6.5. Alternative: a dev/test-only entry (then "on the deployed Pages site" is proven only by `vite preview`).
2. **Where veraPDF runs.** Default: `ci` job `verapdf` on `main` only, against `vite preview`, plus a small post-deploy check of the live page. Say if you want veraPDF also on PRs (slower) or as a required check.
3. **"Reference laptop."** Not defined in the repo; the dev records the hardware used. Define it if the 3 s budget should be judged on a specific machine.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5[1m]), Claude Code, gds-dev-story workflow, run non-interactively.

### Debug Log References

- **WOFF2 subsetting fails.** With the Fontsource `inter-latin-*-normal.woff2` files, `doc.end()` threw `RangeError: Offset is outside the bounds of the DataView` in fontkit `TTFSubset._addGlyph`. A per-glyph probe found every composite glyph fails (`,:;` `ij`, quotes, most accented letters). The same glyphs from the WOFF 1.0 file subset correctly.
- **CIDSet bug.** With WOFF 1.0, veraPDF 1.30.3 (`--flavour ua1`) failed **7.21.4.2-2**: the CIDSet does not list every glyph in the subset.
  - Cause: `subset: 'PDF/UA'` sets `doc.subset = 1`, so PDFKit writes the PDF/A-1 CIDSet from the glyphs used directly, while fontkit also copies the component glyphs.
  - Reproduced with a single P containing "ink" (fails) against "Sample" (passes).
- **Fix.** All composite glyphs were decomposed with fontTools 4.60.1 (304 glyphs per weight). The result: veraPDF passes.
- **Invisible glyphs.** Decomposed **WOFF2** also passed veraPDF, but a `pdftoppm` render showed **no visible text**: fontkit's WOFF2 path embeds glyphs with no outlines, and veraPDF does not catch it.
  - Decomposed **WOFF 1.0** renders correctly and passes veraPDF.
  - Guard added: the unit test checks glyph data per glyph in each embedded subset. It fails on the decomposed WOFF2 files (about 30-35 bytes per glyph, against about 85-97 for real outlines). This was verified by swapping the files in temporarily.
- **The gate has teeth (not committed).**
  - With `tagged: false`, the browser-generated PDF fails veraPDF rule **6.2-1**, and the CI step script exits 1 (`compliant="0" nonCompliant="1"`).
  - With a temporary static `import 'pdfkit'` in `src/main.tsx`, `size-limit` still **passed** (5 kB, because PDFKit landed in a separate eagerly loaded chunk). The new `tools/checkInitialBundle.ts` failed with "contains PDFKit" and "not counted by the initial bundle budget".
- **Entry name.** Naming the main Vite input `main` renamed `index-*.js` to `main-*.js`, and `size-limit` reported "can't find files". The key is now `index`, and the ADR records why.
- **Firefox (local only).** It does not launch locally: Playwright's Firefox exits with "Could not find profile folder" (the same environment limit as Story 1.1). Re-running outside the sandbox was not permitted. Chromium and WebKit pass locally; Firefox is left to the three-engine `e2e` job on `main`.
- **Timings** on an Apple M4 Pro (12 cores, 24 GB), macOS 27.0.1, `vite preview`:
  - Chromium: cold 137–185 ms, warm 84–86 ms;
  - WebKit: cold 104–118 ms, warm 52–61 ms.

  Three runs of the final build (review run 3); the cold path includes the report chunk, the PDFKit chunk and both fonts.
- **Initial bundle before and after.** At the baseline commit (`6d5ac8d`) it was 4.86 kB gzip in one file. After the story it is 4.98 kB gzip: `index-*.js` 4.62 kB plus the shared `modulepreload-polyfill-*.js` 0.38 kB, which the multi-page build splits out.

### Completion Notes List

- **Outcome: GO.** PDFKit 0.20.2 (the `exports` browser build, `js/pdfkit.browser.mjs`, through a dynamic `import('pdfkit')`) builds in Vite 8.3.5 with **no** Node polyfills and no config change beyond the second HTML entry.
  - It runs with `crossOriginIsolated === false`.
  - Its output passes **veraPDF 1.30.3 PDF/UA-1** for the PDFs generated in both Chromium and WebKit.
  - Generation takes about 0.1 s, against the 3 s budget.
  - Full evidence: `docs/adr/0003-tagged-pdf-pdfkit-spike.md`.
- **Renderer.** `src/report/pdf/` builds a hard-coded Post-mortem-shaped sample:
  - `Document` > `H1`, 2 × `P`, `L` > `LI` > `Lbl` + `LBody`, `Table` > `TR` > `TH`/`TD` (scope column), and `P` (Run ID);
  - the Metis mark (gradient circle), the table rules and "Page 1 of 1" are artifacts;
  - options as in D8, with a trailing word separator on every structure string (the page label is an artifact and has none);
  - the public API is `renderSamplePdf()` through `src/report/index.ts`, and the layout constants are in `src/report/layout/`.
- **Fonts.** Inter 4.001, 400 and 700, from `@fontsource/inter@5.3.0` (latin subset), composites decomposed, shipped as WOFF 1.0 in `assets/fonts/` with `OFL.txt`. They are loaded lazily via `?url` and `fetch`.
- **Spike page.** `spike/pdf.html` (noindex, not linked) is a second Vite `input` entry with the script `src/spike/pdfSpikePage.ts`. The script imports the report module lazily (`import('../report')`, task 4.1), so Vite emits a separate `report-*.js` chunk and the cold timing covers it. It times generation with `performance.now()` and exposes the result as `data-generation-duration-ms`. A new `spike` layer in `eslint.config.js` (allowed: `report`) keeps boundaries enforced. Story 6.5 removes all of it.
- **Laziness gate.** `npm run size` now also runs `tools/checkInitialBundle.ts` (with unit tests). It follows `index.html` and its static imports, fails on PDFKit code in any eagerly loaded file, and fails if such a file falls outside the `initial bundle` budget. `.size-limit.json` now includes `modulepreload-polyfill-*.js`; the limit stays 150 KB.
- **E2E.** `tests/e2e/pdfSpike.spec.ts` checks:
  - cold and warm generation, both < 3000 ms;
  - the download is saved to `test-results/pdf-spike/sample-<engine>.pdf`, with timing JSON;
  - `%PDF-1.7`, `/Marked true`, `/StructTreeRoot` and `/Lang`;
  - `crossOriginIsolated === false`;
  - no console errors and no foreign requests.

  The request and console capture from the smoke spec is now a shared helper, `tests/e2e/watchPageProblems.ts`. The smoke spec's behaviour is unchanged.
- **CI.**
  - New `verapdf` job in `ci.yml`, on `main` only. It uses the image pinned by tag and digest, `verapdf/cli:v1.30.3@sha256:d565095c…f9c`, and fails on a non-zero exit or on a summary other than `compliant="1" nonCompliant="0" failedJobs="0"`. It uploads the `pdf-spike` artifact with the PDF, timings and veraPDF report.
  - The `gates`, `unit` and `e2e` jobs are untouched.
  - The post-deploy `smoke` job in `deploy.yml` also runs `pdfSpike.spec.ts` against the live Pages URL.
  - **For the PR:** `verapdf` is not a required status check. Tiziano decides whether to add it to branch protection. Because `deploy` waits for a successful `ci` run, a veraPDF failure on `main` also blocks deployment.
- **Deviations from the story.** These are recorded here and in the ADR.
  1. **Fonts are WOFF 1.0 (`inter-400.woff`, `inter-700.woff`) with decomposed composites, not WOFF2.** fontkit/PDFKit cannot subset WOFF2 correctly (task 2.4 allowed a conversion). Story 1.7 can still use WOFF2 for the UI.
  2. **The title is tagged `H1`, not `H`.** PDF/UA-1 does not allow `H` and `Hn` to be mixed, and Story 6.5 needs section headings.
  3. **No shared `Result` yet** (Story 1.2 has not landed). The spike throws on every failure, as task 3.5 directs; the ADR records it.
  4. **Smoke spec refactor.** The request and console capture was extracted into a shared helper (Charter rule 1: extract at the second occurrence). jscpd ignores `tests/**`, so it would not have forced this.
  5. **A new `tools/checkInitialBundle.ts` gate was added inside `npm run size`.** `size-limit` alone was shown to miss an eagerly loaded PDFKit chunk.
- **Questions for Tiziano.** The defaults were adopted unchanged:
  - Q1: the spike page ships to production and Story 6.5 deletes it;
  - Q2: veraPDF runs on `main` only, against `vite preview`, plus the post-deploy check;
  - Q3: the hardware is recorded above.
- **Not verified locally:**
  - Firefox (does not launch in this environment);
  - the live Pages run of the spike page (needs a deploy from `main`);
  - the `verapdf` job on GitHub Actions. Its exact step script was run locally against Docker with `DOCKER_DEFAULT_PLATFORM=linux/amd64`.

### Agent Review Checklist

- [x] I searched for an existing primitive, pattern or helper before creating one. `src/report` was an empty stub and `shared` is empty. The smoke spec's request capture is reused through `tests/e2e/watchPageProblems.ts`.
- [x] No duplicated logic. Second occurrences are extracted where the concept is the same: `watchPageProblems`, `withWordSeparator`, `contentWidthPt`/`footerTopPt` and `pdfFontName`. jscpd reports 0 clones.
- [x] Names use the GDD glossary, carry units (`marginPt`, `docTitleSizePt`, `generationDurationMs`, `coldDurationMs`) and need no comment.
- [x] Every comment states a *why* that the code cannot: missing PDFKit types, the PDF/UA word-separator rule, the veraPDF blind spot, the spike layer and entry lifetime, and the sfnt tag variants.
- [x] Core code is pure: no clocks, no `Math.random`, no I/O. `core/` is untouched; `performance.now()` lives only in the spike page.
- [x] New content kinds or predicates have schema, implementation and test. N/A: this story adds none.
- [x] Tests describe behaviour and use the shared builders. The test names state behaviour. No game-state builders apply, because there is no core state.
- [x] Lint, jscpd, knip, Stylelint, size-limit and tests pass (`npm run check` exit 0; `npm run test:e2e` passes on Chromium and WebKit; Firefox cannot launch locally, see above).

### File List

- `_bmad-output/implementation-artifacts/8-1-pdfkit-tagged-pdf-spike.md` (new; story file)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `assets/.gitkeep` (deleted)
- `assets/fonts/inter-400.woff` (new)
- `assets/fonts/inter-700.woff` (new)
- `assets/fonts/OFL.txt` (new)
- `src/report/index.ts` (modified)
- `src/report/layout/documentLayout.ts` (new)
- `src/report/layout/index.ts` (new)
- `src/report/pdf/addHeading.ts` (new; review run 2 split)
- `src/report/pdf/addList.ts` (new; review run 2 split)
- `src/report/pdf/addParagraphs.ts` (new; review run 2 split)
- `src/report/pdf/addReceiptTable.ts` (new)
- `src/report/pdf/addRunId.ts` (new; review run 2 split)
- `src/report/pdf/buildSamplePdf.ts` (new)
- `src/report/pdf/buildSamplePdf.test.ts` (new)
- `src/report/pdf/drawMetisMark.ts` (new; review run 2 split)
- `src/report/pdf/drawPageLabel.ts` (new; review run 2 split)
- `src/report/pdf/drawRule.ts` (new; review run 2 split)
- `src/report/pdf/withWordSeparator.ts` (new; review run 2 split)
- `src/report/pdf/index.ts` (new)
- `src/report/pdf/pdfFonts.ts` (new)
- `src/report/pdf/pdfkit.d.ts` (new)
- `src/report/pdf/renderSamplePdf.ts` (new)
- `src/report/pdf/samplePostMortem.ts` (new)
- `src/spike/pdfSpikePage.ts` (new)
- `spike/pdf.html` (new)
- `vite.config.ts` (modified)
- `eslint.config.js` (modified)
- `knip.json` (modified)
- `.size-limit.json` (modified)
- `package.json` (modified)
- `tools/checkInitialBundle.ts` (new)
- `tools/findInitialChunks.ts` (new)
- `tools/findInitialChunks.test.ts` (new)
- `tests/e2e/pdfSpike.spec.ts` (new)
- `tests/e2e/watchPageProblems.ts` (new)
- `tests/e2e/smoke.spec.ts` (modified)
- `.github/workflows/ci.yml` (modified)
- `.github/workflows/deploy.yml` (modified)
- `docs/adr/0003-tagged-pdf-pdfkit-spike.md` (new)
- `_bmad-output/implementation-artifacts/deferred-work.md` (new; review run 1)
- `AGENTS.md` (modified; review run 1)
- `CONTRIBUTING.md` (modified; review run 1)

## Change Log

| Date       | Change                                                                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-27 | Story 8.1 implemented: PDFKit tagged-PDF spike. **Outcome: GO.** It adds the PDF/UA sample renderer, the PDF fonts (decomposed Inter WOFF), the spike page, the initial-bundle laziness gate, the e2e spec, the `verapdf` CI job and ADR 0003. Status set to review. |
| 2026-10-27 | Code review run 1: 11 findings patched (re-export detection in the laziness gate, spike page error reporting, PDFKit typings and the unused `error` listener, `verapdf` artifact upload, ADR accuracy, docs), 2 deferred to Tiziano (Firefox run, Docker Hub pull), 6 dismissed. See Review Findings. Status stays review. |
| 2026-10-27 | Code review run 2: 7 findings patched (default-font double parse, one module per helper with geometry constants in `documentLayout`, `spike` layer in AGENTS.md, laziness gate simplified and following `../` imports, `verapdf` failed-rule log, ADR table gotchas), 0 deferred, 5 dismissed. See Review Findings. Status stays review. |
| 2026-10-27 | Code review run 3: 9 findings patched (gradient colour set before the path in `drawMetisMark`, spike page imports the report module lazily as task 4.1 asks, ADR evidence re-measured and three ADR claims corrected, declaration leftovers, naming, stale pointers), 0 deferred, 6 dismissed. See Review Findings. Status stays review. |
| 2026-10-27 | Code review run 4: 1 finding patched (ADR table gotcha: the font rollback re-parses after every cell, not only cells with their own font; measured cost and the fontkit-object option recorded for Story 6.5), 0 deferred, 20 dismissed after verification. No code change. See Review Findings. Status stays review. |
