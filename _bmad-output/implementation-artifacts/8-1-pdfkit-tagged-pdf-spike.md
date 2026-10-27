---
baseline_commit: 6d5ac8d
---

# Story 8.1: PDFKit tagged-PDF spike

Status: in-progress

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

- [ ] **Task 1: Prove PDFKit builds and runs in the Vite app as a lazy chunk (AC 1)**
  - [ ] 1.1 Read `node_modules/pdfkit/package.json`: the `exports` map serves `./js/pdfkit.browser.mjs` to non-Node consumers, and `js/pdfkit.standalone.js` also ships. Decide which one Vite 8 bundles correctly (default: the `exports` browser build through a dynamic `import('pdfkit')`). Record the choice and why in the ADR.
  - [ ] 1.2 Resolve any Node-global fallout in the browser (`Buffer`, `process`, `fs`, streams). PDFKit 0.20 pulls `fontkit`, `linebreak`, `png-js`, `fflate`, `@noble/hashes`, `@noble/ciphers`. Fix with the smallest Vite config change; no polyfill package unless justified in the PR and the ADR.
  - [ ] 1.3 Keep PDFKit out of the main chunk: dynamic `import()` only. Prove it with a check that fails if `dist/assets/index-*.js` contains PDFKit code (extend `.size-limit.json` or add a build-output test). The existing `initial bundle` size-limit entry stays at 150 KB gzip and must not grow.
  - [ ] 1.4 Report the lazy chunk size (raw and gzip) in the ADR. No budget exists for it; record it so Story 8.8 can judge it.
  - [ ] 1.5 Confirm the generation path needs no `SharedArrayBuffer`, no workers with shared memory, and no COOP/COEP headers (assert `crossOriginIsolated === false` and `typeof SharedArrayBuffer` is irrelevant to the code path, in the e2e spec).
- [ ] **Task 2: Embed Inter (AC 2)**
  - [ ] 2.1 Add the used Inter weights to `assets/fonts/` named `inter-<weight>.woff2` (architecture naming: `inter-500.woff2`). Minimum for the sample: regular for body and bold or semibold for the heading. Only weights actually used (architecture D14).
  - [ ] 2.2 Add the Inter licence (SIL OFL 1.1) next to the fonts and state the source and version in the ADR. Do not add a runtime dependency to get the files; copy them once (a `devDependency` that is not used at runtime is not wanted either).
  - [ ] 2.3 Load font bytes through Vite asset URLs (`?url`) and `fetch` them lazily. URLs are relative to `base` (`/`); zero requests outside the site origin.
  - [ ] 2.4 Verify PDFKit/fontkit embeds WOFF2 directly. If it does not, convert to TTF/OTF and record that. Embedding must be a real subset embed: PDF/UA forbids non-embedded fonts, so do not use PDFKit's standard (Helvetica) fonts anywhere, including for the "Page 1 of 1" footer.
  - [ ] 2.5 Record the glyph coverage you ship (for example the Latin subset) and the consequence for non-English locales later.
- [ ] **Task 3: Tagged sample document (AC 2)**
  - [ ] 3.1 Create the spike module in `src/report/pdf/` (layer `report`; public API through `src/report/index.ts` only). Shared layout tokens go in `src/report/layout/` (page size, margins, font sizes) as plain constants. The architecture says both renderers will share them, but build only what the sample needs.
  - [ ] 3.2 Build the sample from a hard-coded Post-mortem-shaped model: title (`H`), 2 paragraphs (`P`), a list (`L` > `LI` > `Lbl` + `LBody`), a small table (`Table` > `TR` > `TH`/`TD`), and a decorative mark (stand-in for the Metis mark) drawn as an **artifact**. Include a `Figure` with `alt` only if cheap; the Post-mortem has no figure, the Metis mark is an artifact.
  - [ ] 3.3 Options exactly as in D8: `tagged: true`, `subset: 'PDF/UA'`, `pdfVersion: '1.7'`, `lang: 'en-US'`, `displayTitle: true`, `info.Title` set. Use `doc.markStructureContent(tag)` / `doc.struct(tag, ...)` / `doc.addStructure(...)` / `doc.markContent('Artifact', ...)` per PDFKit's accessibility guide (see Dev Notes). Include word-separating spaces inside marked content, including line and paragraph ends.
  - [ ] 3.4 Write objects in natural reading order; mark every non-structure drawing (rules, borders, the mark, the page footer if decorative) as an artifact.
  - [ ] 3.5 Expose one function (for example `renderSamplePdf`) returning the bytes as a `Uint8Array` or `Blob`. Unexpected failures throw; expected ones (chunk or font fetch failure) return `Result` (shared `Result` does not exist until Story 1.2; if it still does not exist, keep the spike throwing and say so in the ADR rather than inventing a stand-in).
  - [ ] 3.6 Keep Charter limits: functions <= 40 lines, files <= 300, complexity <= 10, <= 3 params, named exports only, no comments except a non-obvious why. Split the sample builder by structure element (heading, list, table) to stay under the limits.
- [ ] **Task 4: A way to run it in the built app (AC 1, 2)**
  - [ ] 4.1 The app has no UI for documents yet and this story must not add game UI. Provide a minimal, **non-linked** second Vite entry (for example `spike/pdf.html` in `build.rollupOptions.input`, with `<meta name="robots" content="noindex">`) that dynamically imports the report module and exposes a "generate" button plus a download link. It ships in the production build so it can run on the deployed Pages site. Story 6.5 removes it.
  - [ ] 4.2 The page must satisfy the existing gates: no literal user-facing strings in JSX (use a plain-HTML page with a tiny script, or `t()`-free text outside JSX), no `console`, no `any`, relative URLs only. If a lint rule blocks the page, restructure; never suppress without a written reason.
  - [ ] 4.3 Record the timing with `performance.now()` around generation in the page and expose it to the test, for the < 3 s check. Timing code lives in the spike page, not in `core/`.
- [ ] **Task 5: Playwright e2e + veraPDF in CI (AC 1, 2)**
  - [ ] 5.1 Add `tests/e2e/pdfSpike.spec.ts`: open the spike page, generate, capture the bytes (download event or a `blob:` read) and save them to a known path (for example `test-results/pdf-spike/sample.pdf`), assert generation time < 3000 ms, assert no console errors and **no request outside the site origin**, assert `crossOriginIsolated === false`. It runs on all three engines on `main` and on Chromium on PRs, like the smoke test. Reuse the smoke test's request-capture pattern; extract a shared helper only if the second copy would trip jscpd.
  - [ ] 5.2 Add a CI job `verapdf` in `.github/workflows/ci.yml`, **on `main` only** (`if: github.event_name == 'push'`), that runs the e2e spec output through veraPDF with the PDF/UA-1 profile (`--flavour ua1`) and fails on any non-compliant result. Obtain veraPDF reproducibly (official Docker image `verapdf/cli`, or the pinned release installer; it needs a JRE). Pin the version, and record how in the ADR. Do **not** rename or touch the existing `gates`, `unit`, `e2e` jobs: they are required status checks on `main`.
  - [ ] 5.3 Decide whether the generated PDF is produced against the deployed site or the local preview server. Default: the CI `verapdf` job generates the PDF with `vite preview` of the built `dist` (deterministic, no deploy race), **and** the existing post-deploy `smoke` job in `deploy.yml` additionally opens the spike page on `https://hitl-game.github.io/` and checks it generates a non-empty `%PDF` without errors (this covers "runs on the deployed Pages site"). Keep the deploy smoke small; veraPDF itself stays in `ci`.
  - [ ] 5.4 Upload the sample PDF and the veraPDF report as workflow artifacts (`actions/upload-artifact@v7`) so a failure can be inspected.
  - [ ] 5.5 Do not add `verapdf` as a required status check (it only runs on `main`). Tiziano decides later whether to wire it into branch protection; mention it in the PR.
- [ ] **Task 6: ADR (AC 3)**
  - [ ] 6.1 Create `docs/adr/` (it does not exist yet; `docs/` is empty) and write `docs/adr/0003-tagged-pdf-pdfkit-spike.md`, or the next free number, noting that it is the outcome of architecture ADR-003.
  - [ ] 6.2 Record: **go or no-go** with the evidence (veraPDF result, timing numbers on the machine used, lazy chunk size, engines tested); font handling (source, weights, WOFF2 vs converted, subset, licence); build gotchas (Buffer/Node globals, standalone vs browser build, Vite config changes); PDFKit API gotchas found (trailing spaces, artifact marking, table structure, list structure); what Story 6.5 must reuse.
  - [ ] 6.3 On **no-go**: stop, record the failing veraPDF rule IDs and the fallback options (for example post-process tagging, server-less alternatives, or shipping the HTML document plus PNG only), and **raise it with Tiziano before E6**. Do not start a fallback implementation in this story.
- [ ] **Task 7: Housekeeping**
  - [ ] 7.1 `knip.json` lists `pdfkit` under `ignoreDependencies` because nothing imported it. Once the spike imports it, remove that entry (knip reports stale ignores, as it did for `yaml` in Story 1.1). Add the spike HTML entry to knip `entry` if needed.
  - [ ] 7.2 Run `npm run check` (all gates except e2e) and `npx playwright test` locally on Node 24; then the Agent Review Checklist and paste it, ticked, in the PR.

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created

### File List
