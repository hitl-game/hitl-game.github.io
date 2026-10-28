---
baseline_commit: 44a023f0331e1018a47f43c1f6f52b95b1a9ecd2
---

# Story 1.4: i18n catalogs and number formatters

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,
I want every word and number on screen to come from translation catalogs and consistent formatters,
so that the game reads like real software and can be translated later.

## Acceptance Criteria

Source: epics.md → Story 1.4 (FR11, NFR12, architecture D7). The "Binding clarifications" below make the literal AC text precise where it leaves a gap.

1. **Typed keys and ICU.** **Given** `locales/en/ui.json`. **When** key types are generated. **Then** `t('unknown.key')` fails typecheck, and ICU plurals and selects render correctly (`{count, plural, one {# message} other {# messages}}`).
   - **And** a typed parameter map is generated with the keys, so `t('inbox.unreadCount', { count: 3 })` is checked and a missing or misnamed argument fails typecheck.
2. **Money.** **Given** money in cents. **When** `formatCents` / `formatCompactCents` render it. **Then** values below $100,000 show full digits (`$12,400`, `$98,750`), and values from $100,000 show compact notation (`$412.5K`, `$12.4M`, `$2.03B`), with boundary tests at $99,999 and $100,000.
   - **And** negative values carry a sign (`−$1,240`, with U+2212).
3. **Other numbers.** **Given** basis points, game-ms and real-ms. **When** `formatPercentBp`, `formatGameDay` (`Day 38`) and `formatRealDuration` (`0:41`) render them. **Then** output matches the documented examples, using native `Intl` only.
4. **Content-string fallback.** **Given** a content ID and field path. **When** a non-English locale lacks a translation. **Then** the English text is used and a CI check lists the missing key as a warning, not an error.
5. **Lazy locales.** **Given** non-English locales. **When** the main bundle is built. **Then** they are dynamic `import()` chunks, never in the initial bundle.

### Binding clarifications (read before coding)

These are decisions taken by the story author (no human was available); see "Default decisions" at the end for the list to confirm.

- **C-1 Two public names, one threshold rule.** `formatCents(cents)` always renders full whole-dollar digits (use it where money must never abbreviate: receipts, PDF, tooltips). `formatCompactCents(cents)` is the Stripe-style rule used for ordinary display: full digits below $100,000, compact from $100,000 (what ECO-08 and FR11 describe). The threshold rule lives in `formatCompactCents` only; document this in the module header.
- **C-2 Sign is U+2212.** `Intl` emits ASCII `-` for en-US currency; the formatter formats the absolute value and prefixes `−` (U+2212). Negative zero and `0` render `$0`, never `−$0`. A negative value that rounds to `$0` (for example −49 cents) renders `$0` too.
- **C-3 No float arithmetic on money.** Cents are integers (project rule). Convert to whole dollars with the shared `divideRounded`-style integer rounding (half away from zero) — but `i18n/` may import only `shared/`, and `divideRounded` lives in `core/numerics`. Do **not** import core. Either (a) hand `Intl.NumberFormat.format` a decimal string built from integer division and remainder (`Intl` accepts strings and `bigint` and keeps them exact), or (b) move nothing and write the 3-line integer split locally in `i18n/`. Never `Math.round`, `toFixed` or `toLocaleString` (Charter and architecture D7). Reject non-integers and unsafe integers with `assertInvariant` (a bug, not an expected failure).
- **C-4 Compact notation.** Use `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2, minimumFractionDigits: 0 })` and assert in tests that it produces exactly `$412.5K`, `$12.4M`, `$2.03B`, `$100K`. If a runtime renders differently (Node ICU vs Safari), the fix is in the formatter options, not in the expected strings. The rollover case (`$999,950` rounding up to `$1M`, not `$1000K`) gets its own test. Whole-dollar `maximumFractionDigits: 0` for the full form.
- **C-5 `formatGameDay` takes a day length.** `i18n/` cannot import `core/` (so not `GAME_DAY_MS`). Signature: `formatGameDay(gameMs, gameDayMs)` (2 parameters) returns `Day N` with `N = floor(gameMs / gameDayMs) + 1` (the run starts on Day 1). The caller in `app/` passes `GAME_DAY_MS`. Integer division only (`Math.floor` is allowed outside `core/`). Day text comes from the catalog (`time.day` = `Day {day}`) so a translation can reorder it; the number goes through `Intl.NumberFormat` so a locale can group digits.
- **C-6 `formatRealDuration(realMs)` renders `m:ss`.** `0:41`, `1:05`, `12:00`. Rounds **up** to whole seconds (a countdown never shows `0:00` while time remains) and clamps negatives to `0:00`. Hours: `59:59` is the largest sensible window in the GDD (response windows are 10–15 s; absence is game time), so above 59 minutes it keeps counting minutes (`75:00`); do not invent an `h:mm:ss` form.
- **C-7 `formatPercentBp(bp)`.** 10,000 bp = 100 %. Whole percent when exact (`2%`), otherwise up to 2 decimals (`0.1%`, `0.5%`, `12.34%`), via `Intl.NumberFormat({ style: 'percent', maximumFractionDigits: 2 })` on an exact decimal string (`bp / 10000` as a float is fine only if `Intl` output is tested at 1, 5, 10, 50, 10000 bp; prefer the string form). Negatives use U+2212 like money.
- **C-8 Locale model.** One active locale at a time, `en` at launch. `t()` and the formatters take the locale from a module-level setter `setLocale(locale)` called by `app/` (settings), **never** from a signal in `i18n/` (signals live in `app/`; `i18n/` imports only `shared/`). Formatter instances are cached per locale (a `Map` in `i18n/` is fine; the "no `Map` in state" rule is for game state). Tests construct their own catalogs through an injectable `createTranslator(catalog, locale)` and never mutate the module singleton except in one dedicated test.
- **C-9 Content strings are lookup-only here.** No content kind exists yet (7.1). Build `lookupContentText({ locale, contentId, fieldPath, english })` → returns the locale catalog entry for `"<contentId>.<fieldPath>"` or the English text. The file format of `locales/<lang>/content/*.yaml` (keys `<contentId>.<field path>`) is architecture D7; this story reads them as an already-parsed `Record<string, string>` and does not touch the Vite content plugin. The English text stays inline in the content YAML (it is the argument), so no English content catalog is generated.
- **C-10 CI warning for missing translations.** `tools/i18n/listMissingTranslations.ts` (run as `npm run i18n:missing`) compares each `locales/<lang>/ui.json` and `locales/<lang>/content/*.yaml` against the English key set and prints one line per missing key. In GitHub Actions it prints `::warning file=...::missing translation <key>`; it always exits 0 for missing keys and exits non-zero only for a **malformed** catalog (invalid JSON, non-string value, ICU syntax error). With no non-English locale it prints nothing and exits 0. Wire it into `check` and the CI job that runs `check`'s steps.
- **C-11 The catalog is data only.** `locales/en/ui.json` is a flat object `{ "area.camelCase": "ICU message" }` (architecture naming: `inbox.unreadCount`). No nesting, no HTML, no markup tokens (UI strings are not content text). Every value must parse with `intl-messageformat`; a build-time check fails on a syntax error with key and message.
- **C-12 What goes into `ui.json` now.** Only keys with a real consumer or a test need. Seed it with the smallest set that proves the machinery and that Story 1.8 will actually use or replace: `inbox.unreadCount` (the plural from the AC), one `select` example (`message.urgency`: `{urgency, select, urgent {URGENT} other {}}` is NOT needed; use a real one if a consumer exists, else a test-only catalog), and `time.day`. Do **not** write player-facing voice-critical copy here (no Metis/Dora lines, no toasts): if a key is voice-critical it must also be registered in `locales/en/ui.status.json` with status `placeholder`, and the narrative Voice Style Guide must be read first. The seed keys above are neutral system strings and need no status entry. `ui.status.json` itself is Story 7.2/7.4 territory; do not create it here.
- **C-13 "Every ui.json key is used" is NOT enforced in this story.** CNT-08 asks for it, but with no UI consumers yet it would fail on the first key. Record it in `deferred-work.md` for Story 1.8 (first UI consumer): add `tools/i18n/` unused-key scan then. This story's tests may use fixture catalogs only for the plural/select proofs.
- **C-14 Hidden state stays hidden.** No key name or message may name Alignment or any hidden signal (UX-DR50, CNT-08). Add a catalog test that fails if a key or value matches `/alignment|infection|titleStage/i`.

## Tasks / Subtasks

### Phase A: Catalog, key types and `t()` (AC 1)

- [x] A1. Create `locales/en/ui.json` (flat, seed keys per C-12). Add it to `.prettierignore` only if Prettier would rewrite key order; otherwise leave formatted.
- [x] A2. `tools/i18n/generateUiKeyTypes.ts` (+ `writeUiKeyTypes.ts` entry, `npm run i18n:types`): reads `locales/en/ui.json`, parses each message with `new IntlMessageFormat(message, 'en').getAst()` (or the parser it re-exports; do not add a dependency), collects argument names and kinds (`argument`, `number`, `plural`, `select`, `date`, `time`) and writes `src/i18n/generated/uiKeys.ts` exporting `UiKey` (union) and `UiParams` (`{ 'inbox.unreadCount': { count: number } ... }`, `select` args typed as the union of its option names, argument-less messages typed `undefined`). Output is committed, formatted with Prettier, with a "generated, do not edit" header, excluded from jscpd, knip `ignore` and the 300-line limit as needed (each exclusion needs a written reason in the config).
- [x] A3. Drift test (like 1.3's `generateContentSchema.test.ts`): regenerating gives the committed file byte for byte; fails with a message naming `npm run i18n:types`.
- [x] A4. `src/i18n/translate.ts`: `createTranslator(catalog, locale)` returns `t(key, params?)`. Overloads or a conditional rest tuple make `params` required exactly when `UiParams[key]` is not `undefined`. Formatting through `IntlMessageFormat` instances cached per `(locale, key)`. Missing key at runtime is a bug: `assertInvariant` throws with the key (types prevent it). `t` returns `string`.
- [x] A5. `src/i18n/locale.ts`: `Locale` type (`'en'` only for now, derived from a `supportedLocales` const), module `t` bound to the active locale via `setLocale` (C-8). Export `t`, `setLocale`, `createTranslator`, `UiKey` from `src/i18n/index.ts`.
- [x] A6. Typecheck proof: a `// @ts-expect-error` test line (this is the one allowed use; give the description) showing `t('unknown.key')` and `t('inbox.unreadCount')` (missing `count`) fail typecheck. Tests run under vitest, which does not typecheck, so also add the file to `tsc -b` coverage (tsconfig.app.json includes `src`, so colocated `*.test.ts` already typechecks) and confirm `npm run typecheck` is what fails when the expect-error is removed.
- [x] A7. ICU tests: plural `one`/`other`/`#`; select; nested argument; apostrophe escaping (`'{'`); an argument given as a formatted number (`{amount, number}`) renders with the locale.

### Phase B: Formatters (AC 2, 3)

- [x] B1. `src/i18n/formatCents.ts` and `formatCompactCents.ts` per C-1..C-4 (shared integer-split helper only if two files need it: search first, extract on the second use).
- [x] B2. `src/i18n/formatPercentBp.ts` (C-7), `formatGameDay.ts` (C-5), `formatRealDuration.ts` (C-6). One file per exported function, named after it; each ≤ 40-line functions, ≤ 3 parameters.
- [x] B3. Tests (colocated, run in the `dom` project or `core`? `src/i18n` is not in `nodeOnlyTests`, so they run in happy-dom: fine, `Intl` is the same): the documented examples (`$12,400`, `$98,750`, `$412.5K`, `$12.4M`, `$2.03B`, `−$1,240`, `Day 38`, `0:41`); boundaries `$99,999` → `$99,999`, `$100,000` → `$100K`; rollover `$999,950`; `0`, `-0`, ±1 cent, `Number.MAX_SAFE_INTEGER` (no throw, no float digits); non-integer input throws. fast-check properties (no `numRuns`, use global config): for any integer cents, output always starts with `−$` or `$`, never contains `.` below $100,000 and never contains `e`/`NaN`/`Infinity`; `formatCompactCents(n)` for n ≥ 10,000,000 cents has a letter suffix; `formatRealDuration` is monotonic non-increasing in the minutes+seconds sense (more ms never shows less time).
- [x] B4. `i18n/` must not import `core/`: the boundaries lint already enforces it; keep the fixture-proof by not adding exceptions.

### Phase C: Content strings and CI warning (AC 4)

- [x] C1. `src/i18n/lookupContentText.ts` (C-9) with tests: hit, miss falls back to English, empty-string translation counts as missing, fallback never throws.
- [x] C2. `tools/i18n/listMissingTranslations.ts` (C-10) with tests using temp directories (Node `fs`, `os.tmpdir`), covering: no locales, a locale missing keys (warning lines, exit 0), a malformed JSON (error, non-zero), extra keys in a translation (also warned as "unknown key"). Add the `i18n:missing` script and add `i18n:types` + `i18n:missing` to `check` (and note it in `AGENTS.md` npm scripts table).
- [x] C3. Prove the exit-code contract in a test (missing → 0, malformed → non-zero).

### Phase D: Lazy locales (AC 5)

- [x] D1. `src/i18n/loadLocale.ts`: `createLocaleLoader(loaders)` and `loadLocale(locale)` wired to `import.meta.glob('../../locales/*/ui.json')` **excluding** `en` (`'!../../locales/en/ui.json'`), each entry a dynamic import. `en` is imported statically (it is the source catalog and the fallback, in the main bundle, ~ a few KB). Loading a non-English locale returns the catalog and calls `setLocale` only after the catalog is in place.
- [x] D2. Because no non-English locale exists yet, the real-build proof is a unit test of `createLocaleLoader` with injected loader functions (called only on demand, cached, failure returns `Result` err) plus a note in the PR that `npm run size`'s lazy-chunk check (`tools/checkInitialBundle.ts`) will cover the first real locale. Do **not** add a fake locale directory to the repo. If the dev finds the glob with zero matches breaks the build or knip, solve it in the loader and say so in the PR.
- [x] D3. Size: confirm `npm run size` still passes; the English catalog + `intl-messageformat` should be the only growth. `intl-messageformat` is already a dependency (knip `ignoreDependencies` lists it; remove that entry now that it is imported, otherwise knip hides future drift).

### Phase E: Close-out

- [x] E1. Update `knip.json` (remove `intl-messageformat` from `ignoreDependencies`, add the generated file if flagged), `AGENTS.md` scripts table (`i18n:types`, `i18n:missing`), and `_bmad-output/implementation-artifacts/deferred-work.md` (C-13).
- [x] E2. Run `npm run check`; run `npm run test:e2e` if the app shell changed (it should not).
- [ ] E3. Run the Agent Review Checklist (game-architecture.md → Implementation Patterns) and paste it ticked in the PR. Run the code-review loop (max 5 runs, stop on a clean run) before opening the PR.

## Dev Notes

### What exists today (read before touching anything)

- `src/i18n/index.ts` is `export {};` (placeholder from 1.1). `locales/en/` exists and is **empty**. No `t()`, no generated types, no `tools/i18n/`.
- `eslint.config.js` already enforces: boundaries `i18n → shared` only, `app → core, platform, i18n, shared`, `ui → app, i18n, shared`; and the JSX rule that literal user-facing text in JSX is an error ("Use t() for user-facing strings."). Do not re-implement it. `core/` bans `Intl`, `toFixed`, `Math.round`, locale methods; those bans do **not** apply to `i18n/`, but the project rule "no `toFixed` or `toLocaleString` in components" and the Charter do: use `Intl.NumberFormat` objects directly.
- `package.json` already has `intl-messageformat ~12.1.4` (dependency, not yet imported; listed in `knip.json` `ignoreDependencies`). No new dependency is needed. Do not add `@formatjs/*` packages directly; use what `intl-messageformat` exports (verify `getAst()` and the `parse` re-export in the installed version before relying on them; if neither is available, `IntlMessageFormat.formatToParts` with probing is not acceptable: raise it).
- `src/ui/App.tsx` is `<main />`; there is no UI consumer for `t()` yet. `src/app/content/loadContentIndex.ts` shows the pattern for a function (not a singleton) that tests and the debug panel can call.
- `src/core/constants.ts` has `GAME_DAY_MS = 60_000` (1 real minute = 1 game day at 1×) and `MS_PER_SECOND`. `i18n/` cannot import them; `app/` passes `GAME_DAY_MS` to `formatGameDay` (C-5).
- Vitest projects: `core` (Node) for `src/{core,shared}`, `tools/**`, `tests/**`; `dom` (happy-dom) for the rest of `src/`, so `src/i18n/*.test.ts` run in `dom`; `tools/i18n/*.test.ts` run in `core` (Node: `fs` is fine there).
- `tsconfig.app.json`: `moduleResolution: bundler`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Check that importing `locales/en/ui.json` from `src/` typechecks (`resolveJsonModule`; it is on by default with `bundler`, but confirm) and that `locales/` is reachable from `tsconfig.app.json`'s `include: ["src"]` (JSON imports pulled in by a source file are included automatically). `tools/` files run under `node tools/x.ts` (nodenext, `.ts` import extensions) and are covered by `tsconfig.node.json` or `tsconfig.tests.json` as 1.3 set up for `tools/content`: follow 1.3's choice for `tools/i18n`.
- Lint limits (enforced): function ≤ 40 lines, file ≤ 300, complexity ≤ 10, ≤ 3 parameters, nesting ≤ 3, no nested ternary, no `any`, no `!`, no default export, no TODO or commented-out code, every `eslint-disable` needs a reason. jscpd covers `src` and `tools`, tests excluded.

### Architecture patterns and constraints

- **D7.** ICU MessageFormat catalogs per locale (`locales/<lang>/ui.json`, English is the source), `intl-messageformat` behind a project `t()`, key types generated from the English catalog so an unknown key does not compile; numbers, currencies and dates use native `Intl`; content strings are gettext-style (`locales/<lang>/content/*.yaml` keyed by `<contentId>.<field path>`), missing translation falls back to English and CI warns; UI literal strings in JSX are lint errors; every number shown goes through `i18n/` formatters. [Source: game-architecture.md#Internationalisation (D7)]
- **Fixed system copy is UI strings.** `cluereplay.*`, `away.*`, `autotriage.*` will land in `locales/en/ui.json` in later stories as ICU strings with no pools; key naming is `area.camelCase`. [Source: game-architecture.md#Internationalisation (D7); #Naming (i18n keys)]
- **Layering.** `i18n → shared`, importable by `app` and `ui`. `i18n/` holds `t()`, Intl formatters and generated key types. [Source: game-architecture.md#Project Structure]
- **Typed template parameters (future).** Content templates declare `money`, `count`, `percent`… and `i18n/` formatters render them (D7). This story's formatters are those renderers; keep their signatures plain functions (`number → string`) so 7.1/2.x can map a param type to a formatter without adapters. [Source: game-architecture.md#Content Text Format]
- **Bundle.** English catalog + `intl-messageformat` in the main bundle; non-English locales are dynamic `import()` only; 150 KB gzip budget (the build was ~5 KB at 1.3). [Source: project-context.md#Performance Rules; #Lazy chunks stay lazy]
- **Hot paths.** Formatters are called per render for KPIs. Cache `Intl.NumberFormat` and `IntlMessageFormat` instances; never construct one per call. [Source: project-context.md#Performance Rules]
- **Errors.** Expected failures (a locale chunk fails to load, a malformed catalog in the tool) are `Result` / formatted tool errors; bugs (non-integer cents, a missing key at runtime) throw via `assertInvariant`. Reuse `Result` and `assertInvariant` from `shared/`. [Source: game-architecture.md#Error Handling]

### Testing standards for this story

- Colocated unit tests; names state behaviour (`it('shows compact notation from $100,000')`). No DOM snapshots. fast-check numRuns from global config; do not hard-code `numRuns`.
- Scenarios covered: **ECO-08** (money formatting boundary at $100,000, negatives) and **CNT-08** partly (typecheck fails for unknown key, ICU plurals; the "every key used" part is deferred, C-13; the "no UI string names Alignment" part is C-14). [Source: game-test-design.md#ECO-08, #CNT-08]
- Builders: nothing here needs `tests/builders` (no game state). Do not hand-build a `GameState`.
- Mock only at `platform/` boundaries: nothing to mock; `loadLocale` takes injected loaders instead of module mocking.
- `Intl` output differs slightly between ICU versions: tests assert the documented examples exactly; if one fails on Node 24, adjust formatter options, not expectations (C-4).

### Project Structure Notes

- New: `src/i18n/` (`translate.ts`, `locale.ts`, `formatCents.ts`, `formatCompactCents.ts`, `formatPercentBp.ts`, `formatGameDay.ts`, `formatRealDuration.ts`, `lookupContentText.ts`, `loadLocale.ts`, `generated/uiKeys.ts`, all public through `index.ts`), `locales/en/ui.json`, `tools/i18n/` (`generateUiKeyTypes.ts`, `writeUiKeyTypes.ts`, `listMissingTranslations.ts` + tests). Matches architecture's tree (`i18n/`, `locales/<lang>/`, `tools/`).
- No `utils.ts` / `helpers.ts`. If two formatters share the integer-to-decimal-string split, name it for what it does (for example `splitCents.ts`) and export it only if another file needs it.
- Variances to record in the PR: `GAME_DAY_MS` is passed in by the caller (C-5); `formatCompactCents` owns the threshold rule (C-1); the "unused key" check is deferred (C-13).

### Project Context Rules

Extracted from `_bmad-output/project-context.md` (binding; "when in doubt prefer the more restrictive option"):

- **Stack pins.** TypeScript 6.0.x strict; intl-messageformat 12.1; Vite 8.3; Node 24; vitest 5.0; fast-check 4.10. No new runtime dependency without PR justification (this story needs none).
- **Layers.** `ui → app → core → shared`; `i18n → shared`; `ui` never imports `core` or `platform`; import through `index.ts` only; features never import features.
- **Strings and numbers.** Every visible string comes from `t()` (UI) or content catalogs; every visible number goes through `i18n/` formatters (`formatCents`, `formatCompactCents`, `formatGameDay`…). Never `toFixed` or `toLocaleString` in components.
- **Naming.** Named exports only; functions start with a verb (`formatCents`, `lookupContentText`, `createTranslator`); unit suffix on every number with a unit (`cents`, `bp`, `gameMs`, `realMs`, `gameDayMs` as parameter names); abbreviations only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi`; i18n keys `area.camelCase`.
- **Integers only.** Money in cents, percentages in basis points; no ad hoc float rounding for money.
- **Zero runtime network calls.** Locale chunks are build outputs under the app base path, precached by the service worker (8.7); no CDN, no `fetch` of JSON at runtime.
- **Testing.** Colocated tests, test names state behaviour, no DOM snapshots, fast-check for invariants.
- **Content rules.** UI copy that is voice-critical needs `ui.status.json` (not in this story: the seed keys are neutral). Before writing any player-facing text read `narrative-design.md` → Voice Style Guide: the seed keys here are system strings (`Day {day}`, a count); if the dev adds anything beyond them, read it first.
- **Hidden state.** No UI string may name Alignment or a hidden signal (C-14).
- **Code Quality Charter.** Search before creating (`assertInvariant`, `Result` exist in `shared/`); no abstract base classes or speculative options (no locale registry beyond `en`; no plural-rules abstraction); no AI-style comments; no defensive noise; `any`, `!`, `@ts-ignore` rejected (the single `@ts-expect-error` in A6 needs a description); functions ≤ 40 lines, files ≤ 300, complexity ≤ 10, ≤ 3 params.
- **CI is the definition of done**; never disable a gate; every lint suppression needs a written reason; run the Agent Review Checklist before closing.

### Previous Story Intelligence (Stories 1.3 and 1.2)

- **1.3 built the pattern to copy for a generated, committed artifact.** `tools/content/writeContentSchemas.ts` + `generateContentSchema.ts` + a drift test; the output is prettier-ignored when Prettier would reformat it (`content/schema` is in `.prettierignore`). Follow the same shape for `src/i18n/generated/uiKeys.ts`, but prefer emitting Prettier-clean TypeScript and keeping it under Prettier, because it lives in `src/` where lint, knip and typecheck all see it. If the file is large or flagged by jscpd, exclude it in `jscpd` config with a reason.
- **1.3 put build-time code in `tools/` and kept `core/` free of parsing and I/O.** Same here: ICU parsing for key generation and catalog reading are `tools/i18n/`; the runtime `t()` is `src/i18n`. `tools/*.ts` run with `node tools/<x>.ts` (nodenext, `.ts` extensions); tests under `tools/**` run in the Node project.
- **1.3's reviews probed gate bypasses and edge input** (4 runs found real gaps in 1.2; 1.3 deferred range checks). Expect the same here: `-0` and `0` in money; `Number.MAX_SAFE_INTEGER`; non-integer or `NaN` input; compact rollover (`$999,950`); a catalog value that is not a string; duplicate keys in `ui.json` (JSON.parse keeps the last; the tool should detect duplicates, because a silent overwrite hides a translation); a key containing a space or uppercase area; a message whose argument is used with two different kinds (`{n}` and `{n, plural, …}`) which would make the generated type ambiguous: fail the generator with key and reason.
- **Lint-rule workflow from 1.2.** If a new lint rule is added (not required here), it needs a fixture listed in `tests/lint-fixtures/expected.json`. Do not weaken or disable the JSX-literal rule.
- **Deferred items relevant here** (`deferred-work.md`): none block this story. `assertInvariant` in `shared/` still awaits a non-core consumer; using it from `i18n/` becomes its second layer and closes that deferred item (note it in the PR and strike the entry).
- **Process notes from user memory.** One PR per story from branch `story/1-4-i18n-catalogs-and-number-formatters`, squash-merged; code-review loop (max 5 runs, stop on a clean run) before opening the PR; `main` needs approval and Tiziano bypasses as admin only after green CI; after the PR is open, explain it to Tiziano in Italian, plain, what and why.

### Git Intelligence

Last commits: `44a023f` close 1.3 (#9), `372f49a` Story 1.3 content and tuning pipeline (#8; `core/content`, `core/contentSchema`, `app/content`, `tools/content`, `content/tuning.yaml`, Vite content plugin, `tests/builders/makeContentPack.ts`), `5e7f298` close 1.2, `8932ca4` Story 1.2 deterministic core skeleton, `928552a` close 1.1/8.1. Convention: story PR, then a separate "Close story" PR that sets status to done. The scaffolding for this story (empty `src/i18n/index.ts`, empty `locales/en/`, JSX-literal lint rule, boundaries) came from 1.1.

### Latest Technical Information

- **intl-messageformat 12.1.** `new IntlMessageFormat(message, locales, formats?)`; `.format(values)` returns a string when all values are primitives; `.getAst()` returns the parsed AST (element `type` values from the exported `TYPE` enum: literal, argument, number, date, time, select, plural, pound, tag). Syntax errors throw `SyntaxError` with `originalMessage`. Verify these against the installed package (`node_modules/intl-messageformat`) before writing the generator; do not rely on memory for the AST shape. Run `npx ctx7@latest docs` for intl-messageformat if anything is unclear (project rule: use ctx7 for library docs).
- **`Intl.NumberFormat`** accepts decimal strings and `bigint` in `format()` (exact, no float), supports `notation: 'compact'`, `currencyDisplay`, `signDisplay`, `roundingMode` (Node 24 and the last two versions of the target browsers support it; Safari support for `roundingMode` should be checked on the targets before relying on it; the integer split in C-3 avoids needing it).
- **Compact output is ICU-dependent** (`K`, `M`, `B`, `T`) and en-US only here. `maximumFractionDigits` combined with compact notation changes rounding to fraction digits instead of significant digits: assert the five documented examples.
- No CVE or deprecation affects these package versions.

### References

- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Story 1.4: i18n catalogs and number formatters; #FR11, NFR12; #UX-DR16 (time line `Day 38 · 0:41 left`)]
- [Source: _bmad-output/game-architecture.md#Internationalisation (D7); #Content Text Format; #Project Structure; #Consistency Rules (Strings, Number display); #Agent Review Checklist]
- [Source: _bmad-output/project-context.md#Platform, Input & Build Rules (Strings and numbers); #Naming Rules; #Performance Rules; #Critical Don't-Miss Rules]
- [Source: _bmad-output/game-test-design.md#ECO-08, #CNT-08]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md (Message component time line)]
- [Source: _bmad-output/implementation-artifacts/1-3-content-and-tuning-pipeline.md#Dev Agent Record, Previous Story Intelligence; _bmad-output/implementation-artifacts/deferred-work.md]
- [Source: eslint.config.js (boundaries, jsxRestrictions); knip.json; vitest.config.ts; tsconfig.app.json; src/core/constants.ts; src/shared/*; src/app/content/loadContentIndex.ts]

## Default decisions taken without a human (confirm or overrule)

1. `formatCents` = always full digits; `formatCompactCents` = threshold rule (full below $100,000, compact from $100,000). The epics text is ambiguous about which function owns the threshold.
2. Full-form money drops cents (whole dollars, half away from zero); the GDD examples show whole dollars only.
3. `formatGameDay(gameMs, gameDayMs)` takes the day length from the caller because `i18n/` cannot import `core/`; Day 1 is the first day (`floor(gameMs / gameDayMs) + 1`). Story 1.5/1.6 must confirm that the day counter in state starts at 1.
4. `formatRealDuration` is `m:ss`, rounds up, no hours form.
5. Locale is a module-level setter (`setLocale`) in `i18n/`, not a signal; `app/` owns the signal and calls the setter.
6. Key types and a per-key parameter map are generated by a `tools/i18n` script into a committed `src/i18n/generated/uiKeys.ts` (drift-tested), instead of deriving types from the JSON import, so arguments are type-checked too.
7. The "every `ui.json` key is used" check from CNT-08 is deferred to Story 1.8 (first UI consumer) and logged in `deferred-work.md`.
8. Lazy-locale proof is a loader unit test with injected loaders; no fake non-English locale is added to the repo, so the real chunk check waits for the first real translation.
9. The missing-translation CI check exits 0 for missing keys and non-zero only for malformed catalogs.
10. `ui.json` is seeded only with neutral system keys; no voice-critical copy, so no `ui.status.json` and no narrative read were needed.

## Open Questions (for Tiziano; defaults above are applied if unanswered)

1. Does the day counter start at Day 1 or Day 0 in the UI? (Default: Day 1.)
2. Should `formatCents` show cents anywhere (for example `$12,400.50` in the PDF)? (Default: never; whole dollars.)
3. Is a `qps-ploc` pseudo-locale wanted now to exercise the lazy chunk and long-string layouts in dev? (Default: no.)

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5), gds-dev-story, unattended.

### Debug Log References

- ctx7: `/formatjs/formatjs` docs for `getAst()` and the parser `TYPE` enum; confirmed against `node_modules/intl-messageformat@12.1.4`: `getAst()` exists, `TYPE` and `parse` are **not** re-exported at runtime, a syntax error throws `SyntaxError` with the ErrorKind name as message.
- Node 24 ICU probe: compact `$412.5K`, `$12.4M`, `$2.03B`, `$100K` match C-4 with the story's options. `$999,950` renders `$999.95K` (two fraction digits keep it below the rollover); the real rollover is at `$999,995` → `$1M`.
- `npm run typecheck` fails (TS2345 on `'unknown.key'`) when the `@ts-expect-error` line in `translate.test.ts` is removed (A6 proof, checked by hand and restored).
- `npm run test:e2e`: Chromium and WebKit pass; Firefox does not launch in the local sandbox ("Could not find profile folder"), the known local-environment issue from deferred-work (8.1). The app shell is unchanged.

### Implementation Plan

- `tools/i18n/` (Node, nodenext): `collectMessageArguments` walks the `getAst()` tree and maps each argument to a TS type; `parseUiCatalog` validates a catalog (JSON, flat object, string values, `area.camelCase` keys, ICU syntax, no tags, no duplicate keys); `generateUiKeyTypes` renders `UiParams` / `UiKey` and formats with the repo Prettier config; `writeUiKeyTypes` is the `i18n:types` CLI; `findMissingTranslations` + `listMissingTranslations` (CLI) implement C-10.
- `src/i18n/`: `createTranslator` (generic over a params map, conditional rest tuple, one `IntlMessageFormat` per key cached lazily), `locale.ts` (module `t`, `getLocale`, `setLocale(locale, catalog)` merging the catalog over English), formatters on a shared `formatNumber` (Intl instances cached per locale and preset, `minusSign` parts replaced with U+2212), `toWholeDollars` (bigint, half away from zero), `lookupContentText`, `loadLocale` / `createLocaleLoader`.

### Completion Notes List

- AC1: `locales/en/ui.json` seeds `inbox.unreadCount` (the AC plural) and `time.day` (`Day {day, number}`). `npm run i18n:types` generates `src/i18n/uiKeys.ts` with `UiKey` and a typed `UiParams` map; `t('unknown.key')`, a missing `count`, a misnamed argument and an invalid select option fail typecheck (`translate.test.ts`, `locale.test.ts`). The drift test (`generateUiKeyTypes.test.ts`) names `npm run i18n:types`. The select proof uses a test-only fixture catalog (C-12).
- AC2: `formatCents` (always full) and `formatCompactCents` (threshold at $100,000 on the rounded dollars shown) with U+2212 negatives, `$0` for `0`, `-0` and values rounding to zero; boundaries, rollover, `MAX_SAFE_INTEGER`, non-integer throws, fast-check properties.
- AC3: `formatPercentBp` (exact decimal string to Intl), `formatGameDay(gameMs, gameDayMs)` (bigint division, Day 1 first, text from `time.day`), `formatRealDuration` (`m:ss`, rounds up, clamps negatives, no hours form, monotonic property).
- AC4: `lookupContentText` falls back to English on a missing or empty translation. `npm run i18n:missing` prints warnings (GitHub `::warning` annotations in Actions), exits 0 on missing keys and 1 on a malformed catalog; wired into `check` and the CI `gates` job.
- AC5: non-English catalogs come only from `import.meta.glob` (dynamic imports, `en` excluded); English is static. A zero-match glob builds fine and knip is clean. Unit tests prove the loader is on demand, cached, and returns `Result` errors.
- `assertInvariant` now has a second layer (`i18n/`): deferred-work entry struck.
- Bundle: `npm run size` unchanged at ~4.98 KB gzip, because nothing in `ui/`/`app/` imports `i18n` yet (tree-shaken). The catalog and intl-messageformat enter the initial bundle with the first consumer (1.8).
- E3 is left open on purpose: the Agent Review Checklist is ticked below for the PR, but the code-review loop and the PR are owned by the separate reviewer step of this pipeline.

Agent Review Checklist:

- [x] I searched for an existing primitive, pattern or helper before creating one (`assertInvariant`, `Result` reused; `divideRounded` not importable from `i18n/`, so `toWholeDollars` does bigint rounding locally per C-3).
- [x] No duplicated logic (one `formatNumber` for every Intl formatter, one `toWholeDollars` for both money formatters, one `parseUiCatalog` for the generator and the CI check).
- [x] Names use the GDD glossary, carry units, and need no comment (`cents`, `bp`, `gameMs`, `gameDayMs`, `realMs`).
- [x] Every comment states a why.
- [x] Core code is pure (no `core/` change).
- [x] New content kinds or predicates: none.
- [x] Tests describe behaviour; no game state, so no builders needed.
- [x] Lint, jscpd, knip, Stylelint, size-limit and tests pass.

Default decisions (beyond the story's list, which is kept as written):

1. The generated file is `src/i18n/uiKeys.ts`, not `src/i18n/generated/uiKeys.ts`: a sub-folder is a boundaries module and would need its own `index.ts`. No jscpd, knip or line-limit exclusion was needed.
2. A simple `{name}` argument is typed `string`, so a number must use `{name, number}` (or plural) and is always locale-formatted. Select arguments are the union of all option names, `other` included. `date`/`time` take `Date | number`. An argument used with two kinds, a markup tag or an ICU syntax error fails the generator with key and reason.
3. `setLocale(locale, catalog)` takes the loaded catalog as a second parameter (C-8 shows `setLocale(locale)`): the catalog is merged over English, so a missing UI translation falls back to English at runtime, the same contract as content strings.
4. `lookupContentText` takes `{ catalog, contentId, fieldPath, english }` (the active locale's parsed content catalog, `undefined` in English) instead of `locale`: no content catalog loading exists before 7.1.
5. `i18n:missing` gets an empty English content key set until Story 7.1 (logged in deferred-work); content catalogs are still checked for shape. A locale folder without `ui.json` warns every key as missing.
6. `i18n:types` runs first in `check` (regenerates; a stale commit shows as a git diff and fails the drift test in CI). CI `gates` runs only `i18n:missing`; the drift test runs in `unit`.
7. Rollover test uses `$999,995` → `$1M`; `$999,950` → `$999.95K` is asserted too (see Debug Log).
8. Formatters use the active locale (`en`), not a hard-coded `en-US`; `en` formats as en-US.

### File List

- `.github/workflows/ci.yml` (modified: `i18n:missing` step)
- `AGENTS.md` (modified: npm scripts table)
- `knip.json` (modified: `intl-messageformat` removed from `ignoreDependencies`)
- `package.json` (modified: `i18n:types`, `i18n:missing`, `check`)
- `locales/en/ui.json` (new)
- `src/i18n/index.ts` (modified)
- `src/i18n/uiKeys.ts` (new, generated)
- `src/i18n/supportedLocales.ts`, `src/i18n/translate.ts`, `src/i18n/locale.ts` (new)
- `src/i18n/formatNumber.ts`, `src/i18n/toWholeDollars.ts`, `src/i18n/formatCents.ts`, `src/i18n/formatCompactCents.ts`, `src/i18n/formatPercentBp.ts`, `src/i18n/formatGameDay.ts`, `src/i18n/formatRealDuration.ts` (new)
- `src/i18n/lookupContentText.ts`, `src/i18n/loadLocale.ts` (new)
- `src/i18n/translate.test.ts`, `src/i18n/locale.test.ts`, `src/i18n/formatCents.test.ts`, `src/i18n/formatCompactCents.test.ts`, `src/i18n/formatPercentBp.test.ts`, `src/i18n/formatGameDay.test.ts`, `src/i18n/formatRealDuration.test.ts`, `src/i18n/lookupContentText.test.ts`, `src/i18n/loadLocale.test.ts` (new)
- `tools/i18n/collectMessageArguments.ts`, `tools/i18n/parseUiCatalog.ts`, `tools/i18n/readEnglishUiCatalog.ts`, `tools/i18n/generateUiKeyTypes.ts`, `tools/i18n/writeUiKeyTypes.ts`, `tools/i18n/findMissingTranslations.ts`, `tools/i18n/listMissingTranslations.ts` (new)
- `tools/i18n/collectMessageArguments.test.ts`, `tools/i18n/parseUiCatalog.test.ts`, `tools/i18n/generateUiKeyTypes.test.ts`, `tools/i18n/findMissingTranslations.test.ts` (new)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/1-4-i18n-catalogs-and-number-formatters.md` (this story)

### Review Findings

Code review run 1 (2026-10-28, full workflow: Blind Hunter, Edge Case Hunter and Acceptance Auditor as parallel subagents; replaces an earlier skimmed pass): 0 decision_needed, 6 patch (all applied), 1 defer, 26 dismissed.

- [x] [Review][Patch] A translation could use an argument English lacks, or read one as another type, and `t()` threw at runtime; `i18n:missing` now reports it as an error (a pure drop stays valid, extra values are ignored) [tools/i18n/findMissingTranslations.ts]
- [x] [Review][Patch] Overlapping `loadLocale` calls: the slower, older request could win and leave the wrong locale active; the last request now wins [src/i18n/loadLocale.ts]
- [x] [Review][Patch] An empty-string translation in a loaded UI catalog overrode the English fallback and rendered blank; `setLocale` now ignores empty and non-string values [src/i18n/locale.ts]
- [x] [Review][Patch] An empty or comment-only content YAML failed `i18n:missing` as malformed [tools/i18n/findMissingTranslations.ts]
- [x] [Review][Patch] Warning annotations were not escaped, so a newline or `%` in a translator-supplied key could inject workflow commands [tools/i18n/findMissingTranslations.ts]
- [x] [Review][Patch] ICU argument names such as `{0}` would emit invalid TypeScript in `uiKeys.ts`; rejected at parse time. The generator also sorted argument names with `localeCompare`, which depends on the ICU build; now a plain comparison [tools/i18n/collectMessageArguments.ts, tools/i18n/generateUiKeyTypes.ts]
- [x] [Review][Defer] `locales/<lang>/` directories are not cross-checked against `supportedLocales`, so a new locale folder is linted but cannot load until `supportedLocales` is edited [src/i18n/supportedLocales.ts] — deferred, C-8 keeps one locale at launch; handle with the first translation.

Dismissed (one line each): the previous run's "dropped argument throws" wording was wrong (only a missing-but-referenced argument throws), fixed above; duplicate-key scan is heuristic but correct for the flat string-only catalogs the parser already enforces; only one problem reported for a bad key plus bad value (cosmetic); `loadLocale('en')` loading an empty catalog is intended (English is the base); recompiling formats on locale switch (negligible); `formatNumber` sign and Intl string-numeric support are covered by tests on the supported browsers; `formatGameDay` uses BigInt deliberately (C-5/C-3); `formatRealDuration` clamps negatives by C-6; `TranslateArgs` union hole is unreachable (the generator never emits `X | undefined`); `.yml` extension is not the project convention; EISDIR/ENOTDIR on malformed locale trees gives a stack trace, acceptable for a dev tool; missing English catalog throws, acceptable; `lookupContentText` dot-collision follows the architecture D7 key format; CNT-08 regex is the specified check; CI step order and `i18n:types` rewriting in `check` follow the story; unknown keys stay warnings by C-10; no `knip`/dependency issues (gates green); remaining blind-hunter style and test-strength remarks without a concrete failing input.

## Change Log

- 2026-10-28: Story created (status: ready-for-dev).
- 2026-10-28: Implemented typed UI catalog, `t()`, number formatters, content lookup, missing-translation CI check and lazy locale loader (status: review).
- 2026-10-28: Code review run 1 (full workflow): 6 patches applied, 1 item deferred.
