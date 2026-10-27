---
baseline_commit: 72f046336e8fec1bf7a318552a4e792ca1c3ed09
---

# Story 1.1: Project scaffold, quality gates, CI and Pages deploy

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer (human or AI agent),
I want the repository scaffolded with the pinned stack, the layer structure and every quality gate running in CI and on deploy,
so that the first line of game code is already checked against the Code Quality Charter and module boundaries.

## Acceptance Criteria

Source: epics.md → Story 1.1. The two **clarifications** come from the epics.md Prerequisites and are binding. They override the literal AC text.

1. **Scaffold builds on Node 24.** **Given** the existing repository (planning files only, no app code). **When** the scaffold is created from the Vite `preact-ts` template and the pinned versions in game-architecture.md → Setup Commands are installed. **Then** `npm ci && npm run build` succeeds on Node 24, with `.nvmrc` = `24` and `package.json` `engines.node` set.
   - **And** the `src/` tree matches the layer list in game-architecture.md → Project Structure (`core`, `platform`, `app`, `ui`, `report`, `i18n`, `shared`, `debug`). Each layer exposes its public API only through `index.ts`.
   - **And** no game code exists: the app renders one empty `<main>` landmark.
2. **ESLint rejects every Charter violation.** **Given** the lint configuration. **When** `npm run lint:fixtures` runs against a committed set of intentional-violation fixtures. **Then** each of the following is reported as an **error**:
   - `ui` importing `core`; `ui` importing `platform`; `core` importing `platform`;
   - a deep import that bypasses `index.ts`; a feature importing another feature;
   - `Math.random`, `Date`, `performance` or `setTimeout` in `core/`;
   - a literal user-facing string in JSX; `dangerouslySetInnerHTML`; `console.log`;
   - a TODO comment; commented-out code; a lint suppression without a description;
   - `export default`; `any`; a non-null `!`;
   - a function over 40 lines; a file over 300 lines; complexity over 10; more than 3 parameters; a nested ternary;
   - a magic number in `core/`.
   - **And** Stylelint rejects a raw colour, a raw spacing value, a raw font value, and any `!important` in a CSS Module fixture.
3. **CI runs every gate.** **Given** a pull request. **When** CI runs. **Then** it executes all of these and fails if any one fails: typecheck, ESLint, Stylelint, Prettier check, jscpd, knip, size-limit (initial bundle budget 150 KB gzip), Vitest, and a Playwright smoke test on Chromium.
   - **And** on `main`, the Playwright suite runs on Chromium, Firefox and WebKit.
   - **And** a `nightly` workflow runs the test suite with an elevated fast-check iteration count.
4. **Deploy to GitHub Pages.** **Given** the Prerequisites are done. **And** a push to `main` with CI green. **When** the `deploy` workflow runs. **Then** the site is published to GitHub Pages under the dedicated organization.
   - **CLARIFICATION:** the repo is the organization site `hitl-game/hitl-game.github.io`, served at `https://hitl-game.github.io/`. So Vite `base` is **`/`**, not `/<repo>/`. epics.md Prerequisites: "architecture assumptions about `/<repo>/` resolve to `/`". The same applies to PLT-04 in the test design.
   - **And** a post-deploy smoke test loads the deployed page, finds no console errors, and records no request outside the site's own origin.
5. **Pre-commit hook.** **Given** a developer commits. **When** the pre-commit hook runs. **Then** lint-staged formats and lints only the staged files, via simple-git-hooks.
6. **Agent files.** **Given** an AI agent session opens the repo. **When** it reads the root files. **Then**:
   - `.mcp.json` declares Context7, Chrome DevTools MCP and Playwright MCP at the pinned versions;
   - `AGENTS.md` points to the project-context.md rules;
   - the PR template contains the Agent Review Checklist.

**Covers:** Additional Requirements (starter template, gates, CI and deploy), NFR13 (no runtime network calls), NFR15, NFR19. Test-design scenarios: **PLT-01** (post-deploy smoke), **PLT-04** (Pages constraints), **PLT-05** (Charter fixtures), **PRF-04** (bundle budget), **XB-01** (three engines on `main`), and **DET-12** (core clocks and randomness). For DET-12, also add a `console` call in a `core/` fixture.

**Optional split** (epics.md allows it): **1.1a** = AC 1, 2, 5 (scaffold and gates). **1.1b** = AC 3, 4, 6 (CI, deploy and agent files). If you split, finish and commit 1.1a, all green locally, before starting 1.1b. Both must land before any game code.

## Tasks / Subtasks

> Work in this order. Each phase ends with its gates green locally before the next one starts.

### Phase A: Scaffold (AC 1)

- [x] **A1. Use Node 24.** The local machine has Node **26.7** and npm 11.19. Run `nvm use 24` (or `fnm use 24`) before any `npm` command, so `package-lock.json` and `engines` match CI.
- [x] **A2. Scaffold into the existing repo root.** The repo root is not empty: it holds `_bmad/`, `_bmad-output/`, `docs/`, `.claude/`, `.agents/` and `.github/agents/`. Run `npm create vite@latest` into a scratch directory with `--template preact-ts` (create-vite is 9.3.x). Then copy the generated files into the repo root.
  - Do **not** overwrite `.gitignore`. Merge it instead (see A7).
  - Do **not** create a `human-in-the-loop/` subfolder. The repo root is the project root.
- [x] **A3. Install the pinned versions** from game-architecture.md → Setup Commands, all exact-minor. They were verified on npm on 2026-10-27; resolved versions are shown in parentheses.
  - **Runtime:**
    - `preact@10.29` (10.29.8), `@preact/signals@2.11` (2.11.4)
    - `pure-rand@8.4` (8.4.2), `idb@8.0` (8.0.4), `fflate@0.8` (0.8.3), `zod@4.6` (4.6.7)
    - `intl-messageformat@12.1` (12.1.4), `pdfkit@0.20` (0.20.2)
  - **Build:**
    - `vite@8.3` (8.3.5), `@preact/preset-vite@2.10` (2.10.6), `vite-plugin-pwa@2.0` (2.0.0)
    - `typescript@6.0` (6.0.3), `yaml@2.9` (2.9.1)
  - **Tests:**
    - `vitest@5.0` (5.0.5), `happy-dom@21.0` (21.0.4), `@testing-library/preact@3.2` (3.2.6), `fast-check@4.10` (4.10.2)
    - `@playwright/test@1.64` (1.64.1), `@axe-core/playwright@4.14` (4.14.0)
  - **Gates:**
    - `eslint@10.13`, `typescript-eslint@8.72` (8.72.1), `eslint-plugin-boundaries@7.3` (7.3.0), `@eslint-community/eslint-plugin-eslint-comments@4.8` (4.8.1)
    - `prettier@3.9` (3.9.10)
    - `stylelint@17.16`, `stylelint-config-standard@40`, `stylelint-declaration-strict-value@1.12`
    - `jscpd@5.4` (5.4.2), `knip@6.43`
    - `size-limit@14.3`, `@size-limit/preset-app@14.3`
    - `lint-staged@17.6`, `simple-git-hooks@2.14`
  - **Additions you will probably need.** Each one needs a one-line justification in the PR ("No new dependency without justification"):
    - `eslint-import-resolver-typescript@4.4`: boundaries needs it to resolve TS imports.
    - `@types/node@24`: needed by the Playwright config and the Node tools scripts. TS 6 does not pick up `@types/*` automatically (see Latest Tech Information).
    - optionally `eslint-plugin-sonarjs@4`, used **only** for its `no-commented-code` rule (see B4).
  - Remove anything from the template that is not in this list (for example, any `eslint-plugin-react-*` packages the template may add).
- [x] **A4. Set up `package.json`.**
  - `"private": true`, `"type": "module"`, `"engines": { "node": ">=24 <25" }`.
  - Do **not** add `engine-strict`. Local Node 26 must still be able to run `npm i` while the developer forgets `nvm use`, and CI enforces 24 through `.nvmrc`.
- [x] **A5. Create the layer tree.** Create `src/{core,platform,app,ui,report,i18n,shared,debug}/index.ts`. Each file contains only `export {};`, except `ui/index.ts` (see A6).
  - Do **not** create domain subfolders (`core/run`, `platform/storage`…). Those belong to later stories.
  - Also create the empty top-level folders with a `.gitkeep`: `content/`, `locales/en/`, `tools/`, `tests/e2e/`, `tests/fixtures/`, `tests/builders/`, `tests/golden/`, `assets/`. Skip any folder this story already fills with real files.
- [x] **A6. Replace the template app.**
  - Delete `src/app.tsx`, `src/app.css`, `src/index.css`, `src/assets/preact.svg` and `public/vite.svg`.
  - Create `src/ui/App.tsx`: `export function App() { return <main />; }` (named export).
  - Export it from `src/ui/index.ts`.
  - `src/main.tsx` renders `<App />` into `#app`. The template's `document.getElementById('app')!` violates the no-`!` rule. Write it as: get the element, and if it is `null`, throw an `Error`. A missing root is a bug, so it throws (Charter #9).
  - Add a colocated `src/ui/App.test.tsx` that asserts `screen.getByRole('main')`. Query by role, no snapshot. This gives Vitest and the happy-dom project a real test from day one.
- [x] **A7. Update `index.html` and `.gitignore`.**
  - `index.html`:
    - `<html lang="en">` and `<title>Human in the Loop</title>`;
    - `<div id="app"></div>`;
    - module script `src/main.tsx` with a relative `src` attribute;
    - **no** external URLs;
    - a favicon that triggers no network 404, e.g. `<link rel="icon" href="data:,">`. Real icons arrive with PWA in 8.7. A favicon 404 would break the smoke test's "no console errors" check.
  - `.gitignore`: keep the existing entries. Add `playwright-report/`, `test-results/`, `blob-report/`, `.vite/`, `dev-dist/`, `*.tsbuildinfo`.
- [x] **A8. Configure TypeScript.** Keep the template's project-reference split (`tsconfig.json` → `tsconfig.app.json` and `tsconfig.node.json`).
  - Set strict mode, `moduleResolution: "bundler"`, and `jsx: "react-jsx"` with `jsxImportSource: "preact"`.
  - Set `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true`. Both support "no `undefined` vs missing-key ambiguity" (project-context, core purity).
  - Set `verbatimModuleSyntax: true`.
  - Set an explicit `types` array per tsconfig: `["vite/client"]` for the app; `["node"]` for the node configs and tools.
  - Do **not** use `baseUrl` (deprecated in TS 6, error TS5101) or path aliases. Imports are relative, through `index.ts`.
- [x] **A9. Configure Vite.** In `vite.config.ts`: `plugins: [preact()]` and `base: '/'`.
  - Do **not** wire vite-plugin-pwa yet. That is Story 8.7.
  - Do **not** set `server.host` or add a proxy.
  - Check `npm run build` and `npm run preview`.

### Phase B: Quality gates (AC 2, 5)

- [x] **B1. Write `eslint.config.js`** as a flat config. ESLint 10 is flat-only; there is no eslintrc. Base it on `typescript-eslint` `strictTypeChecked`, with `parserOptions.projectService: true`.
  - **Rules for all `src/**`:**
    - `no-console: error`
    - `no-warning-comments: ['error', { terms: ['todo','fixme','xxx','hack'], location: 'anywhere' }]`
    - `@eslint-community/eslint-comments/require-description: error`, and `no-unused-disable` (or ESLint `reportUnusedDisableDirectives: 'error'`)
    - `@typescript-eslint/no-explicit-any: error`
    - `@typescript-eslint/no-non-null-assertion: error`
    - `@typescript-eslint/ban-ts-comment`: `ts-ignore` banned; `ts-expect-error` allowed only with a description
    - `max-lines-per-function: [40, skipBlankLines, skipComments]`
    - `max-lines: [300, skipBlankLines, skipComments]`
    - `complexity: 10`, `max-params: 3`, `max-depth: 3`
    - `no-nested-ternary: error`
    - `@typescript-eslint/no-floating-promises: error` (D13)
  - **No `export default`:** use `no-restricted-syntax` with selector `ExportDefaultDeclaration` (and `ExportNamedDeclaration > ExportSpecifier[exported.name='default']`).
    - **Exemption:** root config files that require a default export (`vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `stylelint.config.js`). Scope the exemption to exactly those files.
  - **JSX rules, with zero extra dependencies, via `no-restricted-syntax`:**
    - `JSXAttribute[name.name='dangerouslySetInnerHTML']`
    - `JSXText[value=/\S/]`: a literal user-facing string
    - `JSXAttribute[name.name=/^(aria-label|aria-description|title|alt|placeholder)$/] > Literal`: a literal accessible string
    - Each selector gets a clear `message`, e.g. "Use t() for user-facing strings".
  - **Core purity (`src/core/**`):**
    - `no-restricted-globals` for `Date`, `performance`, `setTimeout`, `setInterval`, `setImmediate`, `requestAnimationFrame`, `queueMicrotask`, `crypto`, `fetch`, `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `indexedDB`.
    - `no-restricted-properties` for `Math.random`.
    - `no-restricted-imports` for `preact`, `preact/*`, `@preact/signals`, `idb`. The boundary rules also cover layer imports.
    - `@typescript-eslint/no-magic-numbers` with `ignore: [0, 1]`, `ignoreEnums`, `ignoreReadonlyClassProperties`, `ignoreTypeIndexes`. The constants file `src/core/constants.ts` will be the named home for numbers (Story 1.2). Allow numbers there only via the `as const` declaration pattern, or exempt that exact file.
  - **Tests (`**/*.test.ts(x)`, `tests/**`):** relax only `max-lines-per-function` (a `describe` block grows) and `no-magic-numbers`. Keep everything else.
- [x] **B2. Configure boundaries.** Use `eslint-plugin-boundaries` 7.x. Rule names changed in v6/v7: use **`boundaries/dependencies`** with `policies`. The old `element-types`, `entry-point` and `external` rules are deprecated.
  - Configure `settings['import/resolver'].typescript` (`alwaysTryTypes: true`).
  - **Elements:**

    | Type | Pattern | May import |
    |---|---|---|
    | `main` | file `src/main.tsx` | `ui`, `app` |
    | `core` | `src/core` | `shared` |
    | `platform` | `src/platform` | `shared` |
    | `app` | `src/app` | `core`, `platform`, `i18n`, `shared` |
    | `uiFeature` | `src/ui/features/*`, capture the feature name | `ui`, `app`, `i18n`, `shared`; **never** another `uiFeature` |
    | `ui` | `src/ui` (everything else under ui) | `app`, `i18n`, `shared` |
    | `report` | `src/report` | `core` (only `core/report` once it exists; for now `core`'s index), `shared` |
    | `i18n` | `src/i18n` | `shared` |
    | `shared` | `src/shared` | nothing |
    | `debug` | `src/debug` | `app` |

  - **`default: 'disallow'`.**
  - **Index-only imports:** any import that crosses an element boundary must target a file with `fileInternalPath` matching `index.ts` / `index.tsx`. Make this also work one level down, for future domain modules: `core/<domain>/index.ts`, `app/<module>/index.ts`, `ui/patterns`, and so on. The convention is `import { rankBacklog } from '../absence'`, never `'../absence/rankBacklog'`. Model the domain folders as elements with captures (e.g. `src/core/*`), so that deep imports between sibling modules also fail.
  - Element patterns in boundaries match from the right of the path by default. Use that so the same element definitions classify the fixture tree under `tests/lint-fixtures/src/**` (B4). Prove it with the fixtures: do not assume it.
  - **Not in this story:** the `hiddenState.ts` / `alignmentMilli` restriction belongs to Story 3.4 (test design ALN-03). Do not add it now.
- [x] **B3. Configure Prettier.** Add `.prettierrc` (pick a style and keep it: `singleQuote: true`, `printWidth: 100`, `trailingComma: 'all'` matches the architecture snippets) and a `.prettierignore` covering `dist`, `coverage`, `_bmad`, `_bmad-output`, `.claude`, `.agents`, `.github/agents`, `playwright-report`, `test-results` and `package-lock.json`.
  - Do **not** reformat `_bmad-output/`. Those are planning documents.
- [x] **B4. Build the lint fixtures: `npm run lint:fixtures`.**
  - Create `tests/lint-fixtures/`, a self-contained mini tree that mirrors `src/`: `tests/lint-fixtures/src/{core,platform,app,ui,ui/features/alpha,ui/features/beta,shared}/…` with stub `index.ts` files.
  - Add a local `tests/lint-fixtures/tsconfig.json`, so `projectService` type-checks the fixtures without adding them to the app tsconfig.
  - **One violation per fixture file.** Write a manifest `tests/lint-fixtures/expected.json` that maps each fixture file to the rule ID(s) it must trigger.
  - **Runner:** `tools/lintFixtures.ts` (or a Vitest test in `tools/lintFixtures.test.ts`) uses the ESLint Node API with `new ESLint({ ignore: false })`.
    - It asserts that every expected rule fires at **severity 2** on its fixture. A warning does not count.
    - It also asserts that no fixture in the manifest is missing.
    - It exits non-zero on any miss. With 0 errors found it **must fail**: that is the whole point.
  - **Fixtures (one each), covering every AC 2 item:**
    - ui→core, ui→platform, core→platform
    - deep import, feature→feature
    - `Math.random` in core, `Date` in core, `performance` in core, `setTimeout` in core, `console.log` in core (DET-12)
    - JSX literal text, `dangerouslySetInnerHTML`, `console.log` in ui
    - TODO, commented-out code, undescribed `eslint-disable`
    - `export default`, `any`, `!`
    - a 41-line function, a 301-line file, complexity 11, 4 params, a nested ternary
    - magic number in core
  - **Commented-out code:** ESLint core has no such rule. Prefer `eslint-plugin-sonarjs` with **only** `sonarjs/no-commented-code` enabled (do not enable the recommended set). Alternative: a small local rule in `tools/eslint/`. Either is acceptable. Justify the choice in the PR.
  - **Exclude `tests/lint-fixtures/**`** from:
    - the normal `npm run lint` (flat-config global `ignores`)
    - Prettier (`.prettierignore`)
    - jscpd, knip and the app/node tsconfigs
    - lint-staged
  - **CSS fixtures:** `tests/lint-fixtures/css/*.module.css`, one each: raw colour (`#fff`), raw spacing (`margin: 12px`), raw font (`font-family: Arial` and `font-size: 14px`), `!important`. Run them through the Stylelint Node API in the same runner, asserting an error for each.
- [x] **B5. Write `stylelint.config.js`.** Extend `stylelint-config-standard`.
  - Use `stylelint-declaration-strict-value` (`scale-unlimited/declaration-strict-value`) on colour properties (`/color$/`, `fill`, `stroke`, `background`, `border-color`, `outline-color`, `box-shadow`), spacing (`/^margin/`, `/^padding/`, `gap`, `/^inset/`, `top/right/bottom/left`), and font (`font-family`, `font-size`, `font-weight`, `line-height`).
  - Allow `ignoreValues` such as `0`, `inherit`, `currentColor`, `transparent`, `auto`, `none`, `initial`, `unset`.
  - Set `declaration-no-important: true`.
  - Allow CSS Modules' `:global`/`composes` (`selector-pseudo-class-no-unknown` ignore `global`) and camelCase class names (`selector-class-pattern`, matching the architecture's naming table).
  - Lint scripts must not fail when no CSS exists yet: `--allow-empty-input`.
- [x] **B6. Configure jscpd.** `.jscpd.json`: `path: ["src", "tools"]`, `format: ["typescript","tsx","css"]`, ignore tests and fixtures, `minTokens: 50`, `threshold: 0`, reporters `console`, `exitCode: 1`.
  - The architecture gives no number. Choose and note it in the PR; Tiziano can tune it after E1.
- [x] **B7. Configure knip.** `knip.json`: entries `src/main.tsx`, `index.html`, `tools/**/*.ts`; ignore `tests/lint-fixtures/**`.
  - **Gotcha:** AC 1 installs the full pinned stack now. Knip will then flag these unused dependencies:
    - runtime: `pure-rand`, `idb`, `fflate`, `zod`, `intl-messageformat`, `pdfkit`, `@preact/signals`
    - dev: `yaml`, `vite-plugin-pwa`, `@axe-core/playwright` if unused
  - Put exactly those in `ignoreDependencies`. Knip's configuration hints flag a stale ignore, so the list cleans itself up as Stories 1.2–8.7 start using each package.
  - The empty layer `index.ts` files will show as unused files. Declare `src/*/index.ts` as entry files for now, and state the reason in the PR. Do not use `ignore`.
  - If `@axe-core/playwright` is used in the smoke test (see C2), it is no longer unused.
- [x] **B8. Configure size-limit.** `.size-limit.json`: one entry, "initial bundle", `path: ["dist/assets/index-*.js", "dist/assets/index-*.css"]`, `limit: "150 KB"`, `gzip: true`.
  - With `@size-limit/preset-app`, set `"running": false`. Otherwise it launches headless Chrome to measure execution time: slow and flaky in CI.
  - `npm run size` runs after `npm run build`.
- [x] **B9. Configure Vitest.** In `vitest.config.ts`, use `test.projects` (the workspace file is gone):
  - `core`: environment `node`, include `src/core/**`, `src/shared/**`, `tools/**`;
  - `dom`: environment `happy-dom`, include `src/ui/**`, `src/app/**`, `src/i18n/**`, `src/platform/**`, `src/debug/**`, `src/report/**`.
  - Add a setup file `tests/setup/configureFastCheck.ts`: `fc.configureGlobal({ numRuns: Number(process.env['FC_NUM_RUNS'] ?? 100) })`. This is how the nightly run raises the iteration count (AC 3), and it makes `fast-check` a used dependency.
  - Turn on `passWithNoTests: false`. The App test exists.
- [x] **B10. Set up the pre-commit hook.**
  - `package.json`: `"simple-git-hooks": { "pre-commit": "npx lint-staged" }`, plus `"prepare": "simple-git-hooks"`.
  - `lint-staged`:
    - `*.{ts,tsx,js}` → `eslint --max-warnings=0` + `prettier --write`
    - `*.css` → `stylelint` + `prettier --write`
    - `*.{json,md,yml,yaml}` → `prettier --write`
    - exclude `_bmad-output/**` and `tests/lint-fixtures/**`
  - Check it on a real commit.
- [x] **B11. Write the npm scripts.** Keep the names stable, because CI and branch protection reference them:
  - `dev`, `build` (`tsc -b && vite build`), `preview`, `typecheck` (`tsc -b --noEmit`, or `tsc -b` if the configs already set `noEmit`)
  - `lint` (`eslint . --max-warnings=0`), `lint:fixtures`, `lint:css` (`stylelint "src/**/*.css" --allow-empty-input`)
  - `format` / `format:check` (`prettier --check .`), `dup` (`jscpd`), `knip`, `size` (`size-limit`)
  - `test` (`vitest run`), `test:e2e` (`playwright test`)
  - `check`: runs every PR gate in sequence, for local use

### Phase C: CI, deploy, agent files (AC 3, 4, 6)

- [x] **C1. Configure Playwright.** `playwright.config.ts`:
  - `testDir: 'tests/e2e'`;
  - projects `chromium`, `firefox`, `webkit`;
  - `baseURL` from `process.env['BASE_URL']` when set (post-deploy). Otherwise `webServer` runs `npm run build && npm run preview -- --port 4173 --strictPort`, with `baseURL: 'http://localhost:4173/'`;
  - `forbidOnly: !!process.env['CI']`, retries 2 on CI, `reporter` `github` + `html` on CI.
- [x] **C2. Write the smoke test.** `tests/e2e/smoke.spec.ts`, the same spec used on PRs and after deploy. Before `page.goto('./')`, collect:
  - `page.on('console')` messages of type `error`, and `page.on('pageerror')`;
  - every `page.on('request')` URL whose `origin` differs from the baseURL origin, ignoring `data:` and `blob:`.

  Then assert:
  - `getByRole('main')` is visible;
  - the error lists are empty;
  - there are no foreign requests (PLT-01 and NFR13).
  - **Optional:** an `@axe-core/playwright` scan limited to tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`, with zero violations. Cheap now, and it keeps axe wired for later stories. If you skip it, leave `@axe-core/playwright` in knip `ignoreDependencies`.
- [x] **C3. Write the `ci` workflow.** `.github/workflows/ci.yml`: on `pull_request` and on `push` to `main`. `permissions: contents: read`. Set `concurrency` to cancel superseded PR runs.
  - Use `actions/checkout@v7`, `actions/setup-node@v7` (`node-version-file: .nvmrc`, `cache: npm`), then `npm ci`.
  - **Use these job names and keep them.** After the first push, Tiziano adds them as required status checks in branch protection. Renaming a job later breaks protection.
    - `gates`: typecheck, lint, lint:fixtures, lint:css, format:check, dup, knip, build, size
    - `unit`: `npm test`
    - `e2e`:
      - On a PR: Chromium only. `npx playwright install --with-deps chromium`, then `npx playwright test --project=chromium`.
      - On a push to `main`: all three engines (matrix or `--project` for each).
      - Upload `playwright-report` with `actions/upload-artifact@v7` on failure.
  - `nightly.yml`: `schedule` cron daily (e.g. `0 3 * * *`) plus `workflow_dispatch`. Runs `npm test` with `FC_NUM_RUNS=10000`. Performance (8.8) and the full axe matrix are added later; keep the workflow open to those additions, but do not stub them.
- [x] **C4. Write the `deploy` workflow.** `.github/workflows/deploy.yml`, triggered by `workflow_run` of `ci` on `main` with `types: [completed]`. Guard with `if: github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push'`. Check out `github.event.workflow_run.head_sha`. Set `permissions: pages: write, id-token: write, contents: read`, and `concurrency: { group: pages, cancel-in-progress: false }`.
  - **Steps:**
    - `npm ci`, then `npm run build`
    - `actions/configure-pages@v6`
    - `actions/upload-pages-artifact@v5` with path `dist`
    - `actions/deploy-pages@v5` (environment `github-pages`, url = `steps.deployment.outputs.page_url`)
  - **`smoke` job** (`needs: deploy`): runs `npx playwright test --project=chromium tests/e2e/smoke.spec.ts` with `BASE_URL=${{ needs.deploy.outputs.page_url }}` (expected `https://hitl-game.github.io/`).
    - Allow for Pages propagation: retry the `goto` until a 200 (bounded), or use Playwright retries.
  - Pages source is already set to "GitHub Actions" (Prerequisite ✓), so do not use a `gh-pages` branch.
- [x] **C5. Write `.mcp.json`.** Copy it verbatim from game-architecture.md → AI Development Tooling: `@upstash/context7-mcp@4.4`, `chrome-devtools-mcp@1.12`, `@playwright/mcp@0.0.83`.
- [x] **C6. Write `AGENTS.md`.** Keep it short. Point to `_bmad-output/project-context.md` (binding rules) and `_bmad-output/game-architecture.md` (decisions, the Charter, the Agent Review Checklist). It must include:
  - the layer table in one line;
  - "CI is the definition of done; never disable a gate";
  - the npm scripts;
  - "use Node 24 (`nvm use`)";
  - "read `narrative-design.md` → Voice Style Guide before writing player-facing text";
  - **"never copy values from UX `mockups/`; DESIGN.md / EXPERIENCE.md win over mocks"**. This closes the readiness-report warning carried against 1.1.
  - Also add a one-line `CLAUDE.md` containing `@AGENTS.md`, so Claude Code sessions load it. Claude Code reads `CLAUDE.md`, not `AGENTS.md`.
- [x] **C7. Write the remaining repo files.**
  - `.github/pull_request_template.md`: summary, linked story, any new-dependency justification, and the Agent Review Checklist copied verbatim from game-architecture.md → Implementation Patterns → Agent Review Checklist.
  - `CONTRIBUTING.md`: setup (`nvm use`, `npm ci`, `npx playwright install`), scripts, the Charter summary, PR rules. Content rules point to the future `docs/content-guide.md` (Story 7.2). Do not write the guide now.
  - `README.md`: what the game is (one paragraph from the GDD overview), the live URL `https://hitl-game.github.io/`, dev quickstart.
  - `LICENSE`: see Question 1 at the end. Default to **MIT** unless Tiziano says otherwise.
  - `.vscode/extensions.json`: ESLint, Stylelint, Prettier, YAML (Red Hat).
- [x] **C8. First push and verification.**
  - Push on a branch, then open a PR. CI must be green on the PR (Chromium e2e).
  - Merge to `main`. Per Tiziano's branch protection, he uses an admin bypass **only after CI is green**.
  - Verify the three-engine run on `main`, then the `deploy` and `smoke` jobs, and that `https://hitl-game.github.io/` serves the empty `<main>`.
  - Then tell Tiziano the exact job names (`gates`, `unit`, `e2e…`) so he can add them as required status checks. That is the open Prerequisite in epics.md and sprint-status.

## Dev Notes

### Current repository state (read before touching anything)

- Branch `main`, remote `git@github.com:hitl-game/hitl-game.github.io.git`. One commit so far: `72f0463 Add planning specs`.
- **No application code exists.** What exists:
  - `_bmad-output/`: planning docs; do not lint or format them.
  - `_bmad/`, `.claude/skills/`, `.agents/skills/` and `.github/agents/*.agent.md`: the BMAD install, local only and partly gitignored. Do not touch them.
  - an empty `docs/`.
- The existing `.gitignore` ignores the BMAD install folders (`_bmad/`, `.claude/skills/bmad-*`, `gds-*`, `.github/agents/bmad-*`…). **Preserve these lines.**
- `.github/` already exists, holding `agents/`. Add `workflows/` and the PR template next to it.
- **Branch protection on `main` is already active:** 1 approval, code-owner review, no force push. **Required status checks are not set yet**; they are added after this story's first push. So the job names you choose in C3 become permanent contract names.

### Architecture guardrails that apply to this story

- **Stack pins (project-context → Technology Stack):**
  - TypeScript **6.0.x, not 7**: typescript-eslint 8.72 requires `<6.1.0`.
  - Preact **10.29, not 11, not React**: no `react` imports, no `preact/compat`, use `class` and not `className`.
  - Vite 8.3.
  - "Do not upgrade majors without an architecture change."
- **Hosting:**
  - GitHub Pages: no custom headers, no COOP/COEP or `SharedArrayBuffer`, no path routing, relative asset URLs.
  - Zero runtime network calls: no CDN, no Google Fonts, no analytics.
  - The base path here is `/` (org site).
- **Layers:** `ui → app → core → shared`; `app → platform → shared`; `ui` never imports `core` or `platform`; `core` imports only `shared`; `report → core/report + shared`; `debug → app`; `i18n → shared`. Import through `index.ts` only. Features never import features.
- **Naming:**
  - named exports only;
  - components in PascalCase with colocated `.module.css` and `.test.tsx`;
  - other modules in camelCase, named after their main export; folders in camelCase;
  - no `utils.ts` / `helpers.ts`.
- **Comments:** only a non-obvious *why*. No banners, no JSDoc restating types, no narration, no TODO. **This applies to config files too:** do not litter `eslint.config.js` with "// now we configure X". One-line *why* comments are fine where a setting is surprising (e.g. `running: false` in size-limit).
- **Builds:** `debug/`, `?scenario=` and `window.__hitl` exist only in dev/test builds, gated by `import.meta.env`. Nothing like that exists in 1.1. Do not stub it.

### What this story must NOT do (scope fence)

- No game code: no `GameState`, `Result`, branded IDs (Story 1.2), content plugin (1.3), `t()` / catalogs (1.4), tokens or primitives (1.7), service worker / PWA (8.7), veraPDF job (8.1), `hiddenState` lint rule (3.4), CODEOWNERS for `content/**` (7.2).
- No placeholder modules "for later". The `export {};` layer indexes are the only stubs, and they exist because AC 1 asks for them.
- No design tokens or CSS yet. Stylelint runs with `--allow-empty-input`; only the CSS fixtures exercise it.

### Testing standards for this story

- Unit/component: Vitest 5. The App role test runs in the `dom` project (happy-dom). Core tests run in Node with no DOM; the `core` project is empty for now, and that must not fail the run.
- E2E: Playwright smoke only. Run it locally on Chromium (`npx playwright install chromium`).
- The lint-fixture runner is itself a test of the gates. Verify that it **fails** when you temporarily break a rule: for example, comment out `no-console` in the config, run the runner, see it fail, then restore the rule. Do not commit that experiment.
- UI tests query by role and accessible name. No DOM snapshots.

### Project Structure Notes

- Target tree after this story (new files only):

  ```
  .github/workflows/{ci,deploy,nightly}.yml
  .github/pull_request_template.md
  .vscode/extensions.json
  src/main.tsx
  src/ui/{index.ts, App.tsx, App.test.tsx}
  src/{core,platform,app,report,i18n,shared,debug}/index.ts
  tests/e2e/smoke.spec.ts
  tests/setup/configureFastCheck.ts
  tests/lint-fixtures/**              (fixtures, expected.json, tsconfig.json, css/)
  tests/{fixtures,builders,golden}/.gitkeep
  tools/lintFixtures.ts               (or lintFixtures.test.ts)
  content/.gitkeep  locales/en/.gitkeep  assets/.gitkeep
  index.html  package.json  package-lock.json  .nvmrc
  tsconfig.json  tsconfig.app.json  tsconfig.node.json
  vite.config.ts  vitest.config.ts  playwright.config.ts
  eslint.config.js  stylelint.config.js  .prettierrc  .prettierignore
  knip.json  .jscpd.json  .size-limit.json  .mcp.json
  AGENTS.md  CLAUDE.md  CONTRIBUTING.md  README.md  LICENSE
  ```

- **Variance from the architecture tree:**
  - The project root is the repo root, not `human-in-the-loop/`.
  - `base` is `/`.
  - `tests/setup/` and `tests/lint-fixtures/` are additions. Both are test infrastructure, which the architecture places under `tests/`.
  - `CLAUDE.md` is an addition for Claude Code.

### Latest Tech Information (verified 2026-10-27)

- **All pinned versions exist on npm** (A3 lists the resolved patches). create-vite is 9.3.3.
- **TypeScript 6.0:**
  - `baseUrl`, `moduleResolution: node`/`node10`, `module: AMD` and similar are deprecated. They raise errors TS5101/TS5107 unless `ignoreDeprecations: "6.0"` is set. **Do not use them**, and do not silence the errors.
  - Declare `types` explicitly in each tsconfig rather than relying on automatic `@types` inclusion.
- **ESLint 10:** flat config only.
- **typescript-eslint 8.72:**
  - The `typescript-eslint` meta package exports `tseslint.config(...)` and the configs `strictTypeChecked` / `stylisticTypeChecked`.
  - `parserOptions.projectService: true` replaces `project: [...]`.
- **eslint-plugin-boundaries 7.x:**
  - Use the single rule **`boundaries/dependencies`** with `{ default: 'disallow', policies: [{ from: { element: { type } }, allow: { to: { element: { type } } } }] }`.
  - Restrict entry points with `to: { element: { fileInternalPath: 'index.ts' } }`.
  - `boundaries/element-types`, `boundaries/entry-point` and `boundaries/external` are deprecated (v6→v7 migration guide).
  - Settings: `boundaries/elements` (`type`, `pattern`, `capture`, `mode`), plus `import/resolver: { typescript: { alwaysTryTypes: true } }` with `eslint-import-resolver-typescript`.
  - The plugin exports `Config` / `Settings` types if you want typed config.
- **Vitest 5:** use `test.projects` inline. Workspace files are removed.
- **@size-limit/preset-app:** `running: false` disables the headless-Chrome timing measurement.
- **GitHub Actions latest majors (2026-10-27):**
  - `actions/checkout@v7`, `actions/setup-node@v7`, `actions/cache@v6`
  - `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`
  - `actions/upload-artifact@v7`
- **Docs lookup:** use the `ctx7` CLI or the Context7 MCP for any library question (Preact, Vite, Vitest, Playwright, boundaries). Do not rely on memory. This rule is in the user's global instructions.

### Project Context Rules (from `_bmad-output/project-context.md`, applicable here)

- **CI is the definition of done.**
  - The gates are typecheck, ESLint (boundaries, complexity, comments), Stylelint, Prettier, jscpd, knip, size-limit, the tests, and e2e on Chromium (all three engines on `main`).
  - Never disable a gate to merge. A lint suppression needs a written reason.
- **No new runtime dependency without justification in the PR.** The initial bundle is limited to 150 KB gzip. Prefer platform APIs.
- **Named exports only; no `export default`.** Config files are the only, scoped exemption.
- **No `any`, no `!`, no `@ts-ignore`, no nested ternaries.** Functions ≤ 40 lines, files ≤ 300 lines, complexity ≤ 10, ≤ 3 parameters, nesting depth ≤ 3.
- **Every visible string comes from `t()`.** The JSX-literal lint rule enforces this from day one. The empty `<main>` has no text, so 1.1 needs no `t()`.
- **Zero runtime network calls.** The smoke test enforces this.
- **Hosting:** GitHub Pages, relative URLs, no SharedArrayBuffer, no path routing.
- **Before closing:** run the Agent Review Checklist (game-architecture.md → Implementation Patterns), and paste it, ticked, in the PR.

### References

- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Story 1.1: Project scaffold, quality gates, CI and Pages deploy]
- [Source: epics.md#Prerequisites (Tiziano, before Epic 1)] — org `hitl-game`, repo `hitl-game.github.io`, `base` = `/`, Pages via Actions, branch protection pending
- [Source: epics.md#Additional Requirements] — the list of gates
- [Source: _bmad-output/game-architecture.md#Selected Stack], [#AI Development Tooling (MCP)], [#Hosting Constraints (GitHub Pages)]
- [Source: game-architecture.md#Repository Tooling (D13)], [#Testing Strategy (D12)], [#Asset Loading (D14)]
- [Source: game-architecture.md#Layers and Allowed Dependencies], [#Directory Structure], [#Naming Conventions], [#Architectural Boundaries]
- [Source: game-architecture.md#Code Quality Charter] (Limits, Agent Review Checklist), [#Development Environment → Setup Commands]
- [Source: _bmad-output/project-context.md] — all sections
- [Source: _bmad-output/game-test-design.md] — PLT-01, PLT-04, PLT-05, PRF-04, XB-01, DET-12; Test Levels table
- [Source: _bmad-output/planning-artifacts/implementation-readiness-report-2026-10-27-final.md#Warnings] — AGENTS.md mockups rule; m17 (split allowed)

## Questions for Tiziano (non-blocking; defaults are stated)

1. **License.** The GDD only says "open source". Default in this story: **MIT**. Do you prefer another one (e.g. MPL-2.0, or GPL-3.0 for the code and CC BY-SA for `content/`)?
2. **Split.** Keep 1.1 as one story (default), or split it into 1.1a/1.1b in sprint-status?

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5[1m]) via Claude Code, gds-dev-story workflow.

### Debug Log References

- create-vite 9.3 `preact-ts` now ships Preact 11 and TypeScript 7; both were replaced by the pins (10.29 / 6.0). Its tsconfig `paths` to `preact/compat` and `public/` icons were dropped (no compat; favicon is `data:,`).
- eslint-plugin-boundaries 7.3 deprecates `mode` in element descriptors: elements are always folders. `src/main.tsx` is therefore the `main` element on the `src` folder, listed last so it only catches files directly under `src/`.
- First fixture run: `magicNumber.ts` and `longFunction.ts` did not fire, because the test-file relaxations (`tests/**`) also covered `tests/lint-fixtures/**`. Fixed with an `ignores` on that block. This is exactly the class of bug the fixtures exist to catch.
- Stylelint `stylelint-config-standard` requires `currentcolor` lowercase; `ignoreValues` uses that spelling. Caught by the clean control fixture `tokensOnly.module.css`.
- Mutation checks (not committed): `no-console: off` → runner exit 1 (3 mismatches); `declaration-no-important: false` → runner exit 1. Smoke test with a 404 favicon + Google Fonts link → fails on console errors and foreign requests.
- Empty `<main>` has zero size, so Playwright reports it hidden; the smoke test asserts `toHaveCount(1)` on the `main` role instead of `toBeVisible()`.
- size-limit prints "Running JS in headless Chrome" as the step label even with `running: false`; no running time is measured (`@size-limit/time` checks `check.running !== false`).
- Local Firefox (Playwright firefox-1555, macOS Darwin 27, arm64) fails to launch: "Could not find profile folder", also outside the sandbox and with another TMPDIR. Chromium and WebKit pass locally; Firefox is covered by the three-engine CI run on `main` (Ubuntu).
- npm 11.16 `allow-scripts` leaves install scripts of `fsevents`, `simple-git-hooks` and `unrs-resolver` pending. Not needed: the hook is installed by our own `prepare` script, and the resolver works from its prebuilt binding (lint passes after a clean `npm ci`).

### Completion Notes List

- **Scaffold (AC 1):** Vite `preact-ts` scaffold merged into the repo root, all pinned versions installed with `~` (exact-minor) via a project `.npmrc` `save-prefix`, so later `npm i` keeps the same policy. `.nvmrc` = 24, `engines.node` = `>=24 <25`, no `engine-strict`. Eight layer folders with `index.ts`; the app renders one empty `<main>` (`src/ui/App.tsx`), `main.tsx` throws if `#app` is missing. Clean `npm ci && npm run build` on Node 24.18.1: 4.89 KB gzip.
- **ESLint (AC 2):** flat config on `strictTypeChecked` + `projectService`; JS config files use `disableTypeChecked`. Boundaries v7 `boundaries/dependencies` with `default: 'disallow'`: elements `uiFeature` (`src/ui/features/*`), `module` (`src/<layer>/<module>`), `layer` (`src/<layer>`) and `main`; cross-layer and sibling-module imports must target `index.ts(x)`; layer allow-list generated from one `layerImports` table. `ui` may import feature indexes (needed to mount them); features import `ui`, `app`, `i18n`, `shared` only. Core purity adds `console` to the restricted globals (DET-12). `export default` is allowed only in the exact root config files (including `lint-staged.config.js`).
- **Lint fixtures (AC 2, PLT-05, DET-12):** 44 fixtures under `tests/lint-fixtures/` (39 TS/TSX, 5 CSS, plus `expected.json`/`tsconfig.json`). Includes 13 clean control files that must report zero errors, so a config that rejects everything cannot pass. `tools/lintFixtures.ts` runs ESLint and Stylelint through their Node APIs and requires the error-severity rule set of every file to match `expected.json` exactly; unlisted or missing fixtures fail.
- **Commented-out code:** `eslint-plugin-sonarjs` with only `sonarjs/no-commented-code` enabled (chosen over a local rule: maintained, no custom code to test).
- **Stylelint:** `scale-unlimited/declaration-strict-value` on colour, spacing and font properties with `ignoreFunctions: false`, so raw values cannot hide inside `rgb()` or `calc()`. Future stories that need `calc()` with tokens must revisit this explicitly.
- **jscpd** `minTokens: 50`, `threshold: 0` (Tiziano can tune after E1). **knip:** `src/*/index.ts` are entry files while the layers are empty; `yaml` was removed from `ignoreDependencies` because knip reported it as a stale ignore; `@axe-core/playwright` is used by the smoke test. **size-limit:** 150 KB gzip, `running: false`.
- **Vitest 5** `test.projects` `core` (node) and `dom` (happy-dom); `tests/setup/configureFastCheck.ts` reads `FC_NUM_RUNS` (default 100). App role test passes.
- **Pre-commit (AC 5):** simple-git-hooks → `npx lint-staged`; `lint-staged.config.js` filters out `_bmad-output/` and `tests/lint-fixtures/` before running ESLint/Stylelint/Prettier on staged files only.
- **CI (AC 3):** `ci.yml` jobs `gates`, `unit`, `e2e`. `e2e` is a single job (stable check name) that runs Chromium on PRs and all three engines on `main`, uploading the report on failure. `nightly.yml` runs `npm test` with `FC_NUM_RUNS=10000`. **Deploy (AC 4):** `deploy.yml` on `workflow_run` of `ci` (push to `main`, success), Pages artifact from `dist`, then a `smoke` job that waits for a 200 and runs the same smoke spec against `BASE_URL`. Vite `base` is `/` (org site).
- **Smoke test (PLT-01, NFR13):** one `main` landmark, no console errors or page errors, no request outside the site origin (`data:`/`blob:` ignored), axe WCAG 2.0/2.1/2.2 A+AA with zero violations.
- **Agent files (AC 6):** `.mcp.json` verbatim from the architecture; `AGENTS.md` (+ `CLAUDE.md` → `@AGENTS.md`) with layers, rules, scripts, Node 24, Voice Style Guide and the mockups rule; PR template with the Agent Review Checklist verbatim; `CONTRIBUTING.md`, `README.md`, MIT `LICENSE` (default, Question 1), `.vscode/extensions.json`.
- **Not split:** kept as one story (Question 2 default).
- **C8 verification (2026-10-27):** PR #1 CI green (`gates`, `unit`, `e2e` Chromium); merged by Tiziano with admin bypass as `46078d7`. `ci` on `main` green with e2e 3/3 (Chromium, Firefox, WebKit), so Firefox works on Ubuntu. `deploy` + `smoke` green (smoke 1/1 against `https://hitl-game.github.io/`); the live page serves the built shell with `<div id="app">`. Required status checks `gates`, `unit`, `e2e` added to `main` branch protection, other protection settings unchanged.
- **Follow-up (not done):** on PRs, `npx playwright install --with-deps` took ~9 min of apt; the run on `main` took ~1 min. The official Playwright container would make this consistently fast if it recurs.
- **New dependencies beyond the architecture list** (to justify in the PR): `eslint-import-resolver-typescript` (boundaries resolves TS imports), `@types/node` (Node configs and tools under TS 6 explicit `types`), `eslint-plugin-sonarjs` (only `no-commented-code`).

### File List

- `.github/pull_request_template.md` (new)
- `.github/workflows/ci.yml` (new)
- `.github/workflows/deploy.yml` (new)
- `.github/workflows/nightly.yml` (new)
- `.gitignore` (modified)
- `.jscpd.json` (new)
- `.mcp.json` (new)
- `.npmrc` (new)
- `.nvmrc` (new)
- `.prettierignore` (new)
- `.prettierrc` (new)
- `.size-limit.json` (new)
- `.vscode/extensions.json` (new)
- `AGENTS.md` (new)
- `CLAUDE.md` (new)
- `CONTRIBUTING.md` (new)
- `LICENSE` (new)
- `README.md` (new)
- `assets/.gitkeep`, `content/.gitkeep`, `locales/en/.gitkeep` (new)
- `eslint.config.js` (new)
- `index.html` (new)
- `knip.json` (new)
- `lint-staged.config.js` (new)
- `package.json`, `package-lock.json` (new)
- `playwright.config.ts` (new)
- `src/main.tsx` (new)
- `src/ui/App.tsx`, `src/ui/App.test.tsx`, `src/ui/index.ts` (new)
- `src/{core,platform,app,report,i18n,shared,debug}/index.ts` (new)
- `stylelint.config.js` (new)
- `tests/builders/.gitkeep`, `tests/fixtures/.gitkeep`, `tests/golden/.gitkeep` (new)
- `tests/e2e/smoke.spec.ts` (new)
- `tests/setup/configureFastCheck.ts` (new)
- `tests/lint-fixtures/expected.json`, `tests/lint-fixtures/tsconfig.json` (new)
- `tests/lint-fixtures/src/**` (new, 39 fixture files)
- `tests/lint-fixtures/css/*.module.css` (new, 5 fixture files)
- `tools/lintFixtures.ts` (new)
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` (new)
- `vite.config.ts` (new)
- `vitest.config.ts` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified: story status)

## Change Log

| Date | Change |
|---|---|
| 2026-10-27 | Story 1.1 implemented: scaffold, Charter lint + fixtures, Stylelint, jscpd, knip, size-limit, Vitest, Playwright smoke, pre-commit hook, CI/nightly/deploy workflows, agent and repo files. |
| 2026-10-27 | First push, PR #1 merged, three-engine CI, Pages deploy and post-deploy smoke verified; required status checks set. Status → review. |
