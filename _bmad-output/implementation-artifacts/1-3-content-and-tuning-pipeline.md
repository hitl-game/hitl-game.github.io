---
baseline_commit: 8932ca4146bf6e6bbf30b9acc18c1973d836a965
---

# Story 1.3: Content and tuning pipeline

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a designer,
I want YAML content and every tuning value compiled into one validated content pack with a stable version hash,
so that numbers change without code changes and every save knows which content it ran on.

## Acceptance Criteria

Source: epics.md → Story 1.3. The **clarifications** under "Binding clarifications" below make the literal AC text precise where it leaves a gap or collides with a lint rule (`Math.round` and `toFixed` are banned in `core/`).

1. **Tuning compiles from human units to exact integers, or the build fails.** **Given** `content/tuning.yaml` holding the GDD initial tuning table in human units (dollars, percent, points, days). **When** the build or the dev server runs. **Then** the plugin validates it with Zod and compiles it into the content pack with integers (cents, basis points, milli-points, game-ms).
   - **And** a value that is not exactly representable (for example `$0.001`) fails the build with file path, field path and reason.
2. **Authoring-only fields never reach the pack.** **Given** a content file with `kernel`, `translatorNote` and `status`. **When** the pack is compiled. **Then** those three fields are stripped, and a test proves that changing only them leaves `contentPackVersion` unchanged (CNT-05).
3. **`contentPackVersion` is the hash of the compiled pack.** **Given** a compiled pack. **When** `contentPackVersion` is computed. **Then** it is the SHA-256 of the canonical serialisation of the compiled JSON, and a test proves it changes when any shipped field changes (CNT-05).
4. **Dev server rebuilds and reloads; errors show in the Vite overlay.** **Given** a running dev server. **When** a YAML file under `content/` is edited. **Then** the pack is rebuilt and the page reloads with it, and a schema error shows in the Vite error overlay with file and field.
5. **The core receives content as a typed, explicit parameter.** **Given** the core needs content. **When** it receives the `ContentIndex`. **Then** lookups are typed (`content.tuning`, and the `content.templatesFor(channel, phase)` signature exists) and the index is passed as an argument, never imported as a global.
6. **JSON Schemas are generated for editors.** **Given** the Zod schemas. **When** `npm run content:schema` runs. **Then** JSON Schemas are generated for editor autocompletion.
7. **Gates stay green.** `npm run check` passes on Node 24 and the e2e smoke test still passes. No gate is disabled; any lint suppression has a written reason.

### Binding clarifications (read before coding)

- **C-1. Zero floats, zero `Math.round`, zero `toFixed`.** YAML parses `0.07` as the float `0.07`, and `0.07 * 100` is `7.000000000000001`. Core code may not round (`Math.round`, `toFixed` and locale APIs are lint-banned in `core/`; the only rounding path is `divideRounded`). So unit conversion is **exact decimal arithmetic**: take the shortest decimal text of the YAML number (`String(value)`), split it into an integer mantissa and a count of decimal places, multiply the mantissa by the integer unit factor, and require that the product divides exactly by `10^places` (use `divideRounded` for the division, which is exact here). If it does not divide exactly, the value is "not representable" and the build fails. Reject exponent notation (`1e-7`), non-finite numbers, and results that are not safe integers. `-0` normalises to `0` through `withoutNegativeZero`. Property test: for any integer `n`, converting the shortest decimal text of `n / 100` as dollars gives `n` cents.
- **C-2. Unit factors are named constants in `core/constants.ts`** (`no-magic-numbers` applies in `core/`): cents per dollar `100`, basis points per percent `100`, basis points per whole multiplier `10_000`, basis points per Hype index point `100`, milli-points per Alignment point `1_000`, ms per second `1_000`, game-ms per game day is the existing `GAME_DAY_MS` (60,000). Do not redefine it.
- **C-3. Human-unit suffix in the YAML key, integer-unit suffix in the compiled key.** Project naming rule: every unit number carries its unit. In `tuning.yaml` a key ends in the human unit (`baseCostsPerDayUsd: 350`, `churnPerDayPercent: 0.1`, `windowSeconds: 10`, `graceDays: 10`, `alignmentPoints: 100`, `hypeIndex: 20`, `multiplier: 1.5`). The compiled pack uses the integer unit (`baseCostsPerDayCents: 35000`, `churnPerDayBp: 10`, `windowRealMs: 10000`, `graceGameMs: 600000`, `alignmentMilli: 100000`, `hypeBp: 2000`, `multiplierBp: 15000`). A bare `cash` or `time` is a bug. Counts (GPU units, headcount, messages) stay plain integers with a unit-free noun suffix (`Units`, `Count`) and must already be integers in YAML. Define the field once in a declarative table (name, human unit, kind) so the YAML key, the compiled key and the generated JSON Schema cannot drift, and so `jscpd` stays at zero clones.
- **C-4. Response windows are real time, cadences are game time** (architecture D1 → Time bases). Seconds-based windows compile to `…RealMs` (× 1,000). Per-day and per-"active minute" cadences compile to `…GameMs`. The compiled pack stores the base value at 1× speed; the Timing multiplier is applied once at message creation by a later story, never here.
- **C-5. Never invent a number.** Include exactly what the GDD states. Where the GDD gives a value for some phases only (for example "10–15 s at Garage"), include the stated values and make the rest of that field optional in the schema; list every such gap under "Tuning gaps" in the Completion Notes so the owner story fills it. Ranges are `{ min, max }` pairs (for example Hype launch `+5…+15`).
- **C-6. Content registry is the seam Story 7.1 uses; ship it with exactly one real kind.** `compileContentPack` takes the file sources plus a list of kinds `{ name, matches(path), schema }`. The production list has one entry (`tuning`). Story 7.1 appends template, event, character… kinds without touching the compiler. The authoring-metadata test (AC 2, CNT-05) uses a test-only kind that carries `kernel`, `translatorNote`, `status` (tuning itself has none of them). **Strip only at the top level of a content item**: `status` is also a legitimate shipped field nested inside a heavy event (the AllGreen status in the `decision:` block), so a deep strip is a bug.
- **C-7. The version hash reuses existing code.** `contentPackVersion = sha256Hex(canonicalize(pack))` using `shared/sha256Hex` and `core/run`'s `canonicalize` (already exported through `core/run/index.ts`). Do not write a second serialiser. `canonicalize` sorts keys and accepts only strings, booleans, `null` and safe integers, which makes it an enforcement point: a float that slipped into the compiled pack throws instead of hashing. Key order, comments and whitespace in YAML never change the version (test). The value is the full 64-character lowercase hex string (no truncation); a short display form is a later UI concern.
- **C-8. `core/content` must not depend on `core/run` in a way that later forms a cycle.** `core/content` imports `canonicalize` from `core/run` (through its `index.ts`). Therefore `core/run` and `core/time` must **not** import `core/content` (Story 1.2 hit the same hazard and made `core/time` generic over a narrow structural type). Later stories that need content inside `advance` or `applyCommand` get it through an explicit argument typed structurally, or through a context object decided in the story that first needs it (see Open Question 4).
- **C-9. Core never imports the pack.** The pack reaches the code through one virtual module, `virtual:content-pack`, imported only by `app/content`. Add a lint rule banning `virtual:*` imports in `core/**` (with a fixture listed in `tests/lint-fixtures/expected.json`), so "never imported as a global" is machine-enforced, not a convention.

## Tasks / Subtasks

Run `nvm use 24` before every `npm` command. Phases end green locally.

### Phase A: Units, constants and tuning schema in `core/content` (AC 1, 3, 5)

- [x] A1. Add the unit-factor constants (C-2) and the `phases` tuple (`garage`, `seed`, `seriesA`) to `core/constants.ts`; export `phases` and `type Phase` through `core/index.ts`. Story 1.5 reuses them for `state.phase`; do not add a second phase list there.
- [x] A2. `core/content/exactUnits.ts` (name after its main export): exact decimal conversion per C-1, returning `Result` (`ok(integer)` or `err({ reason })`) because "not representable" is an expected failure, not a bug. One function per unit (`usdToCents`, `percentToBp`, `multiplierToBp`, `hypeIndexToBp`, `alignmentPointsToMilli`, `secondsToRealMs`, `daysToGameMs`) built on one shared `scaleDecimal(value, factor)` so there is a single conversion path.
- [x] A3. Zod field helpers `usd()`, `percent()`, … that run the conversion in a `.transform` and surface the failure as a Zod issue with the reason, so Zod's path (`phases.garage.baseCostsPerDayUsd`) is the "field" in the build error. Plain-integer helpers for counts reject non-integers.
- [x] A4. `core/content/tuningSchema/*.ts`: the tuning schema, split into group files (economy, hype and customers, compute, morale and staff, investors and rounds, messages and pacing, alignment, spine) so no file exceeds 300 lines and no function exceeds 40. Use `.strict()` objects so an unknown key fails (a typo must not silently become "default").
- [x] A5. Fill `content/tuning.yaml` from the inventory in Dev Notes → "Tuning inventory" (C-5). Keep the group order of the GDD table. Put `# yaml-language-server: $schema=../content/schema/tuning.schema.json` (adjust the relative path) on the first line. Comments in YAML are fine (they are data files, not code), but keep them to units and the GDD source row.
- [x] A6. `core/content/contentPack.ts`: `ContentPack` type (`{ tuning: CompiledTuning }`, every number a safe integer, readonly), `computeContentPackVersion(pack)` per C-7.
- [x] A7. `core/content/createContentIndex.ts`: `createContentIndex(pack: ContentPack): ContentIndex` with `tuning` and `templatesFor(channel, phase)`. Until Story 7.1 adds the template kind, `templatesFor` returns an empty readonly array typed `readonly TemplateContent[]`, where `TemplateContent` is the smallest type 7.1 will widen (`{ readonly id: string }`). The index is frozen plain data plus pure lookups; no class, no `Map` kept in persisted state (the index is not persisted).
- [x] A8. Export only the public surface from `core/content/index.ts` (schemas, `ContentPack`, `ContentIndex`, `createContentIndex`, `computeContentPackVersion`, `stripAuthoringMetadata`, the kinds seam types) and re-export it from `core/index.ts`.
- [x] A9. Lint: add `virtual:*` to the core `no-restricted-imports` patterns (C-9) with a fixture under `tests/lint-fixtures/src/core/` and its entry in `expected.json`. Check that `zod` is not accidentally restricted for `core/` (it is not today).

### Phase B: Compiler and tooling in `tools/content` (AC 1, 2, 3, 6)

- [x] B1. `tools/content/compileContentPack.ts`: pure function `compileContentPack(sources, kinds)` where `sources` is a list of `{ path, text }` (so tests need no filesystem). Parse with `yaml` (build-time only; `yaml` is already a devDependency and must never enter the runtime bundle), validate with the kind's schema, strip authoring metadata at the item's top level (C-6), assemble the pack, compute the version. Return `Result<{ pack, contentPackVersion }, ContentError[]>`. Collect all errors, not only the first. Each error is `{ path, field, reason }`; the formatted message is `content/tuning.yaml: phases.garage.baseCostsPerDayUsd: 0.001 is not a whole number of cents`. Duplicate keys in YAML are an error (the `yaml` package reports them), because a duplicated key silently drops a value.
- [x] B2. `tools/content/readContentSources.ts`: walk `content/**/*.yaml` deterministically (sorted paths, forward slashes on every OS) and read the text. Only `content/tuning.yaml` exists today; an unknown file with no matching kind is an error ("no content kind for this path"), so a misplaced file never gets silently ignored.
- [x] B3. `tools/content/contentPlugin.ts`: Vite plugin. `resolveId`/`load` for `virtual:content-pack` (internal id prefixed `\0`), module text `export const contentPack = …; export const contentPackVersion = …;`. Build: on error call `this.error` with the formatted message so the build fails with path and field. Dev: `configureServer` adds `content/**` to the watcher; `handleHotUpdate` for a file under `content/` recompiles, then either (success) invalidates the virtual module and sends `full-reload` (Open Question 2) or (failure) sends `{ type: 'error', err: { message, stack: '', plugin, id } }` over `server.ws` so the overlay shows file and field, and keeps serving the last good pack. Verify the exact hook and overlay payload against the installed Vite 8.3 (`npx ctx7@latest docs /vitejs/vite/v8.0.10 "..."`), as the plugin API is the part of this story most likely to differ from memory.
- [x] B4. Register the plugin in `vite.config.ts` **and** `vitest.config.ts` (the `dom` project extends the root config; tests import the virtual module through the same plugin). The plugin file lives in `tools/`, so the config imports it directly.
- [x] B5. `tools/content/generateContentSchema.ts` plus script `npm run content:schema`: converts each registered kind to JSON Schema with Zod 4's `z.toJSONSchema` using the **input** side (`io: 'input'`) so editors see the human-unit keys authors write, not the compiled ones. Writes `content/schema/<kind>.schema.json` deterministically (stable key order, trailing newline). Commit the generated file and add `content/schema/` to `.prettierignore` (generator output is not prettier-stable); a unit test regenerates in memory and asserts the committed file is identical, so drift fails CI without adding a new `check` step.
- [x] B6. **Node cannot run `tools/` scripts that import `src/core` directly**: `core/` uses extensionless imports, and `node tools/x.ts` (native type stripping, how `lint:fixtures` runs) refuses them. Run `content:schema` through Vite's programmatic API (`runnerImport` is exported by the installed Vite; confirm its signature) or any equivalent that already ships with the project. Adding `tsx` or `vite-node` needs a justification in the PR; default is not to.
- [x] B7. **`tsc -b` resolution hazard (same as Story 1.2 E1).** `tools/content/**` imports `src/core` extensionless, which `tsconfig.node.json` (`nodenext`) rejects with TS2834/TS2835. Add `tools/content` to `tsconfig.tests.json` (bundler resolution, same strict flags; add `"node"` to its `types` for `node:fs`/`node:path`) and exclude it from `tsconfig.node.json`. Check that ESLint's `projectService` still finds a project for these files, and that `lint-staged` and `knip` (entry `tools/**/*.ts`) are happy.

### Phase C: App wiring (AC 4, 5)

- [x] C1. `src/vite-env`-style declaration for `virtual:content-pack` (one `.d.ts` under `src/app/content/`, typed with `ContentPack` and `string`; no `any`).
- [x] C2. `src/app/content/loadContentIndex.ts` + `index.ts`: builds the `ContentIndex` once from the virtual module and returns `{ contentIndex, contentPackVersion }`. It is a function, not a module-level singleton export, so tests and the debug panel can build their own. Nothing imports it yet (Stories 1.5/1.8/1.9 will); it is reachable through `src/app/index.ts` so `knip` treats it as public.
- [x] C3. Prove the initial bundle is not hurt: temporarily import `loadContentIndex` from `main.tsx`, run `npm run build && npm run size`, confirm Zod and `yaml` are **not** in the initial chunk (only compiled integers plus `createContentIndex` are), then revert the temporary import. If Zod leaks in, move the schemas behind a path the app does not import, and record the decision in the Completion Notes (project rule: lazy chunks stay lazy, 150 KB gzip budget).

### Phase D: Tests (AC 1–6)

Unit tests are colocated; core tests run in Node with no DOM; use `tests/builders/` for anything that builds a `ContentPack` (add `makeContentPack()` there, calling the real compile path or the real factory, never a hand-written literal).

- [x] D1. `exactUnits.test.ts`: table of representable values per unit (`12400` → `1_240_000` cents, `0.1` percent → `10` bp, `20` hype index → `2000` bp, `-0.02` alignment points → `-20` milli, `0.5` days → `30_000` game-ms, `10` seconds → `10_000` real-ms, `1.5` multiplier → `15_000` bp); failures (`0.001` USD, `1e-7`, `NaN`, `Infinity`, a result above `Number.MAX_SAFE_INTEGER`); `-0` gives `0`; fast-check property from C-1; a classic float trap (`0.07`, `1.15`, `4.35` dollars) converts exactly.
- [x] D2. `tuningSchema.test.ts`: the real `content/tuning.yaml` passes and compiles to the expected integers (named cases: Garage base costs plus one GPU is `40_000` cents per day, which with 1,240,000 cents gives the 31-day runway Story 1.5 tests; start cash `1_240_000`, start Hype `2000` bp, start Alignment `100_000` milli); an unknown key fails; a wrong type fails with the field path; the failing `$0.001` fixture reports file, field and reason (AC 1, CNT-06).
- [x] D3. `compileContentPack.test.ts`: authoring metadata stripped at top level and **not** from a nested `status` (C-6); packs of two trees that differ only in `kernel`, `translatorNote`, `status` have identical JSON and version (AC 2, CNT-05); changing any shipped leaf changes the version (fast-check picks a leaf path); YAML key order, comments and whitespace do not change the version; duplicate YAML keys, unknown path with no kind, and multiple errors are all reported; error message format.
- [x] D4. `computeContentPackVersion.test.ts`: pinned inline snapshot of the version of a tiny fixed pack (so a changed hashing path fails loudly, like the rng derivation snapshot in 1.2); a float in the pack throws through `canonicalize`.
- [x] D5. `createContentIndex.test.ts`: `tuning` is the pack's tuning, `templatesFor` is callable with `(channel, phase)` and returns an empty array today, the index is not a global (a `core/` source scan or the lint fixture from A9 is the proof).
- [x] D6. `contentPlugin.test.ts` (`tools/`, Node): `load` of the virtual id returns the module text; a broken source makes `buildStart`/`load` throw an error whose message contains path and field; `handleHotUpdate` with a fake server sends `error` for a broken file (with the same text) and `full-reload` after the file is fixed, and keeps the last good pack in between. Use a fake `server.ws` (a test double at the boundary, not a mock of `core/`).
- [x] D7. `generateContentSchema.test.ts`: the committed `content/schema/tuning.schema.json` equals the freshly generated one; a known human-unit key is present, a compiled key is not.
- [x] D8. `loadContentIndex.test.ts` (`dom` project): imports the real virtual module through the plugin configured in `vitest.config.ts`; `contentPackVersion` is a 64-character hex string; the Garage tuning values match D2.
- [x] D9. A real dev-server check, by hand, recorded in the Completion Notes: `npm run dev`, edit `content/tuning.yaml` (valid change reloads; `0.001` USD shows the overlay with file and field; fixing it clears the overlay). Playwright cannot easily cover the overlay; the plugin unit test (D6) is the automated proof.

### Phase E: Close-out

- [x] E1. Add `content:schema` to `package.json` scripts and a row to the npm scripts table in `AGENTS.md`. Update `game-architecture.md` → D6 (the virtual module name, the `core/content` public surface, human-unit key suffix rule C-3) and the directory tree only where it now differs.
- [x] E2. Remove `zod` from `knip.json` `ignoreDependencies` (it is now used); keep `idb`, `intl-messageformat`, `@preact/signals`, `vite-plugin-pwa` until their stories land. Run `npm run knip` to confirm no other stale entry.
- [x] E3. `npm run check` green on Node 24; `npm run test:e2e` smoke test still green (chromium is the PR gate; Firefox may not launch on the dev machine, see `deferred-work.md` for 8.1).
- [x] E4. Run a content-free sanity: `npm run build` fails when `content/tuning.yaml` is temporarily broken (record the message in the Completion Notes), then restore the file.
- [x] E5. Paste the Agent Review Checklist, ticked, in the story and the PR. Follow `review-before-merge`: code review loop (max 5 runs, stop when one finds nothing) before opening the PR.

## Dev Notes

### What exists today (read before touching anything)

- `content/` is an **empty directory** (no `tuning.yaml`, no kinds). `locales/en/` exists; `tests/fixtures/` and `tests/golden/` are empty.
- `src/core/` has `constants.ts`, `numerics/` (`divideRounded`, `withoutNegativeZero`), `rng/`, `run/` (including `canonicalize`, `fingerprint`, `newRun`, `replay`) and `time/`. `src/shared/` has `Result` (`ok`, `err`), `Brand`, `assertInvariant`, `sha256Hex`. There is **no** `core/content`, no `app/content`, no `i18n` code, no `tools/content`.
- `RunStart.contentPackVersion` is a plain `string` that `newRun(start)` stores in state and `replay` re-uses. It is opaque to the core. This story is the first producer of the real value; callers (Story 1.8/1.9) will pass `contentPackVersion` from `loadContentIndex()`. Do not change `RunStart`'s type.
- `tools/` contains `checkInitialBundle.ts`, `findInitialChunks.ts`, `lintFixtures.ts` (run with `node tools/<x>.ts`, nodenext, `.ts` extensions in imports) and `findInitialChunks.test.ts`. `vitest.config.ts`: project `core` (node) includes `src/{core,shared}/**`, `tools/**` and `tests/**` tests; project `dom` (happy-dom) includes the rest of `src/`.
- `vite.config.ts` registers only `@preact/preset-vite`; `vitest.config.ts` likewise. `knip.json` entries include `tools/**/*.ts` and `src/*/index.ts`.
- `package.json` already has `zod ~4.6.7` (dependency) and `yaml ~2.9.1` (devDependency); no new dependency is needed. Zod 4's `z.toJSONSchema` is part of the package.
- `tsconfig.tests.json` (added by Story 1.2) uses bundler resolution and includes `tests/builders`, `tests/fixtures`, `tests/golden`, `src`; `tsconfig.node.json` excludes those folders. `tools/` is currently under `tsconfig.node.json` (nodenext).
- Lint limits that shape the code (all enforced): function ≤ 40 lines, file ≤ 300, complexity ≤ 10, ≤ 3 parameters, nesting ≤ 3, no nested ternary, no `any`, no `!`, no `export default`, no TODO or commented-out code, every `eslint-disable` needs a description. `jscpd` covers `src` and `tools` (tests excluded): 50 tokens, threshold 0.
- `core/**` lint bans: 26 restricted globals (`crypto`, `console`, `globalThis`, `process`, `self`, `Intl` …), `Math.random`, `Math.round`, `toFixed`, locale methods, `node:*` imports, `preact`/`@preact/signals`/`idb` imports and dynamic `import()`. `no-magic-numbers` (0 and 1 allowed) applies in `core/` except `core/constants.ts` and test files. `core/content` therefore cannot read files or parse YAML; that is exactly why parsing and I/O live in `tools/`.

### Architecture patterns and constraints

- **D6 (content pipeline).** One Zod schema per content kind, the same schema used by the build plugin, the CI check and save import; JSON Schema generated from Zod; `kernel`, `status`, `translatorNote` are writer-facing and stripped from the pack so they never affect `contentPackVersion`; tuning lives in `content/tuning.yaml`, validated the same way, no tuning constants in code; a Vite plugin compiles YAML into one JSON content pack; `contentPackVersion` is the hash of that compiled pack and is stored in every save. [Source: game-architecture.md#Content Pipeline (D6)]
- **Configuration.** Tuning is one of four configuration kinds: "every GDD `[tuning]` value" in `content/tuning.yaml`, part of `contentPackVersion`. Game constants (absence cap 14 days, phase list, RNG stream names) stay in `core/constants.ts`: do **not** duplicate the absence cap into tuning. The test: "would replay differ without this value?" decides simulation settings versus presentation; tuning always affects the run. [Source: game-architecture.md#Cross-cutting Concerns → Configuration]
- **Data patterns.** "A read-only `ContentIndex` is built once from the content pack and passed into the core. Typed lookups: `content.event(id)`, `content.templatesFor(channel, phase)`." Only `tuning` and `templatesFor` are in scope here; `event(id)` arrives with the event kind (7.1 / 4.3). [Source: game-architecture.md#Implementation Patterns → Data Patterns]
- **Version pinning (D4).** A run is pinned to its `contentPackVersion`; replay depends on core code plus the pack; a mismatch is never silently rewritten (SAV-10, risk R6). This story only produces and exposes the version; pinning, mismatch handling and migration are Stories 1.9 and 8.7 and the open item A-12 in the test design. [Source: game-architecture.md#Version pinning; game-test-design.md#R6, SAV-10, A-12]
- **Integers only.** Money in cents, Hype and percentages in basis points, Alignment in milli-points, time in game-ms. The compiled pack has no float anywhere, which `canonicalize` enforces at hash time. [Source: project-context.md#Core Purity & Determinism Rules]
- **Error handling.** Expected failures (bad authoring input) are `Result` with typed errors; bugs throw through `assertInvariant`. Build-time content errors are expected failures, formatted for authors. [Source: game-architecture.md#Error Handling]
- **Bundle and laziness.** The compiled pack and English strings are in the main bundle; Zod schemas and `yaml` are build-time (C3 verifies it). 150 KB gzip budget; currently ~5 KB. [Source: game-architecture.md#Asset Loading (D14); project-context.md#Performance Rules]
- **Zero runtime network calls.** The pack ships inside the build; no `fetch` of YAML or JSON at runtime. [Source: project-context.md#Platform, Input & Build Rules]

### Design decisions taken in this story (so the dev does not have to guess)

- **Virtual module, not a generated file.** `virtual:content-pack` keeps the pack out of git, makes the dev reload natural, and gives tests the same path as production. Alternative (write `src/generated/contentPack.json`) was rejected: generated files in `src/` invite stale commits.
- **Pack shape today is `{ tuning }`.** No `packFormat` field: adding one later changes every hash, which is the correct behaviour anyway. Do not add speculative empty collections for kinds that do not exist yet.
- **One source of truth for fields (C-3).** A declarative field table drives schema, compiled key naming and JSON Schema. If a developer finds themselves typing a field name three times, stop and extract.
- **Tuning is grouped by who reads it, per phase where the GDD is per phase.** `phases.garage|seed|seriesA` hold per-phase numbers; global numbers sit in named groups. A reader (Story 1.5 economy) must be able to write `content.tuning.phases[state.phase].baseCostsPerDayCents` with no remapping.

### Tuning inventory (source: gdd.md → Initial tuning table and every inline `[tuning]` tag)

The dev greps `[tuning]` in `gdd.md` to confirm nothing is missed. Values below are the GDD's; units show the human unit used in YAML. Anything not stated here and not in the GDD is **not** to be invented (C-5).

| Group | Values (human units) | Notes |
|---|---|---|
| `start` | cash $12,400 · Hype index 20 · Alignment 100 points · GPU capacity 1 unit | epics 1.5 AC states 1,240,000 cents / 2,000 bp / 100,000 milli; the $12,400 start cash is also the `$400/day → 31-day` runway |
| `phases.*.baseCostsPerDay` | Garage $350 · Seed $1,500 · Series A+ $6,000 | founders draw $0 in Garage |
| `phases.*.salaryPerHirePerDay` | $250 · $350 · $450 | modifiers: Ex-FAANG ×1.5, Safety Researcher ×2 (`multiplier`) |
| `phases.*.gpuUnitCostPerDay` | $50 · $50 · $45 | 1 unit included in Garage $400 burn |
| `compute` | capacity 100 load per unit · load per customer: Self-serve 1, Team 5, Enterprise 50 · load per Metis answer 0.5 (load is a count in tenths? see note) · churn threshold 90 % utilisation · extra churn 0.1 % per utilisation point above 90 · capacity offer target 70 % utilisation, minimum 1 unit · offer repeat every 5 game days | 0.5 load is not an integer: store load in half-units or milli-load (`loadMilli`, 100 load = 100,000) and say so in the YAML key; one choice, applied to all load values |
| `hype` | launch +5…+15 · bold post +3 · viral +20 · flop −10 · scandal −20 · decay 2 %/day (visible from Seed) · valuation multiple 10× at Hype 20 to 60× at Hype 90 (linear, clamped 10×–60×) | all in Hype index points except decay (percent) and multiple (`multiplier`); the multiple has two anchor points |
| `customers` | new/day = 2 + 0.1 × Hype (Garage) · phase factor Seed ×3, Series A ×10 · Team-tier share Hype / 200, max 45 % · baseline churn 0.1 %/day · prices: Self-serve $49/mo, Team $499/mo, Enterprise $5k–50k/mo | the 2 + 0.1×Hype is two numbers; keep them as `baseNewCustomersPerDay` and a per-Hype-point rate in a unit that is exact (`…Milli`) |
| `economy` | MRR divisor 30 game days per month · overdraft interest 0.5 %/game day · death after 14 consecutive game days below $0 · floors: Garage −$5,000, Seed+ −15 % of last round | the 30 is a game constant if the GDD treats a month as 30 days everywhere; decide with Story 1.5 and note it |
| `staff` | throughput one message per 30 s of game time · morale bands (content ≥ 60, strained 30–59, leaving < 30, resigns after 3 game days) · drift −5/day if queue > 5, +2/day otherwise, events ±10–30 · Safety Researcher salary ×2 · Ex-FAANG ×1.5 | traits 1–4 are specified elsewhere; the draft numeric effects of traits 5–12 (×1.5, ×0.8, +5 morale, 10 % blocked for 2 days, 50 % default, ×2 throughput + 5 % incident −3 Hype, ±10 every 7 days, 2 % daily leave after 60 days, −10 % team throughput, −20 % Metis load, policy proposal every 15 days) go under `traits` keyed by trait name |
| `investors` | cash vs round range: Growth fund ×1.0, "Ethical" VC ×0.6, Billionaire ×1.5 · Growth-fund clause MRR +15 % per 30 game days, miss −10 Hype · Responsible Ventures grace 10 game days, then −10 Hype every 10 game days | round ranges (Seed $1.5–3M, Series A $10–25M) and post-money ranges are GDD progression numbers; include them under `rounds` |
| `rounds` | Series A+ target ×3 ARR within 120 game days · 2 consecutive misses → down round (−50 % cash, −30 Hype) · Seed trigger MRR ≥ $5k · Series A trigger MRR ≥ $100k · later rounds each ×3 ARR | |
| `heavyDecisions` | risky release 70 % · crisis "fix it ourselves" 60 % · capability grant 100 % · min gap ~5 game days · failure doubles the stated downside (a ×2 `multiplier`) | success chances are defaults; content declares per-answer `successChance` (Story 7.1) |
| `messages` | backlog cap 15–20 · Garage arrival window 10–15 s · top-item response window 10–15 s · no repeat within min(10, pool − 5) · trade-off cap ±10 % with $500 floor, heavy ±50 % · routine inference line 1 per 20 s game time | arrival windows for Seed and Series A are **not** in the GDD (C-5: leave optional, list as a gap) |
| `pacing` | event cadence Garage ~1 per 3–4 active min · Seed 6–8 · Series A+ 5–8 · ticker ~1 per 2 game days | active min = game-ms |
| `alignment` | drift per AI decision: Low −0.02 · Medium −0.05 · High −0.10 points · phase multiplier Garage ×0.5, Seed ×1.0, Series A ×1.5 · capability grant −5…−15 · pause for audit: 3 game days off, −10 Hype, +5 points, 30-day cooldown · Researcher trend ↗ ≥ +1, ↘ ≤ −1 point per 7 days | |
| `spine` | breathing room after a round closes: 5 game days · minimum gap between spine beats: 3 game days | |
| `meta` | Aegis version = loop number + 3 (offset `3`) | architecture lists loop counter under `core/meta`; keep the offset as tuning per the GDD tag |
| `clueReplay` | one staff message = 30 s ÷ one game day (60 s at 1×); marginal headcount factor exponent 0.2 | the formula lives in code (N5); only the numbers belong here |

Not tuning (do not duplicate): the 14-day absence cap, phase names, RNG stream names (all `core/constants.ts`); UI copy; the clue-replay *wording*.

**Numbers that are not integers in the GDD and how to store them:** multipliers (×1.5, ×0.6, ×0.8) as `…MultiplierBp` (× 10,000); the headcount burn exponent 1.2 (and 0.2 for the clue replay) as basis points (12,000 and 2,000); load 0.5 as milli-load (C-1 style). **Risk:** evaluating `headcount^1.2` with `Math.pow` is not guaranteed bit-identical across engines (DET-08 runs on four engines). Choosing the integer method is Story 1.5 / 4.7's job (a precomputed integer table per headcount is the likely answer); this story only fixes how the exponent is stored.

### Testing standards for this story

- Core and `core/content` tests run in Node with no DOM; `tools/` tests also run in the `core` project (Node). Only `loadContentIndex.test.ts` needs the `dom` project because it lives in `src/app`.
- Builders, not hand-built objects: add `makeContentPack()` to `tests/builders/` (and export it from its `index.ts`); it calls the real compile or the real factory with the real `tuning.yaml` text, with optional field overrides by path. Never hand-write a `ContentPack` literal in a test.
- Mock only at boundaries: the Vite `server.ws` in the plugin test is the one fake. Never mock `core/` functions.
- fast-check numRuns comes from the global config (`FC_NUM_RUNS`); do not hard-code `numRuns`. A shrunk counterexample becomes a permanent named regression test.
- Test names state behaviour: `it('keeps contentPackVersion when only kernel, translatorNote and status change')`.
- Scenarios covered: CNT-05 (authoring metadata never changes the pack), CNT-06 (human units compile to exact integers or fail), part of CNT-01 groundwork (one pass fixture, one fail fixture for the tuning schema). [Source: game-test-design.md#CNT-05, CNT-06]

### Project Structure Notes

- New: `src/core/content/` (public through `index.ts`), `src/app/content/`, `tools/content/`, `content/tuning.yaml`, `content/schema/tuning.schema.json` (generated, committed, prettier-ignored). All match architecture D6 and the directory tree (`content/`, `core/content`, `tools/`).
- Variances to record in the PR: `tools/content` is added to `tsconfig.tests.json` (bundler resolution) instead of `tsconfig.node.json`; the Vite plugin and tests share one config path for `virtual:content-pack`; `phases` is added to `core/constants.ts` ahead of Story 1.5.
- `core/content` depends on `core/run` (for `canonicalize`) and on `shared`; nothing in `core` depends on `core/content` yet (C-8). `ui` never imports `core`; the UI will see tuning only through `app/selectors`.

### Project Context Rules

Extracted from `_bmad-output/project-context.md` (binding; "when in doubt prefer the more restrictive option"):

- **Stack pins.** TypeScript 6.0.x strict; zod 4.6; yaml 2.9 **build-time only**; Vite 8.3; Node 24 LTS; vitest 5.0; fast-check 4.10. No new runtime dependency without PR justification (this story needs none). GitHub Pages: no custom headers, base path `/<repo>/` (the pack is bundled, so no URL concerns).
- **Core purity.** No time, randomness or I/O in `src/core/**`; plain readonly data; integers only (cents, bp, milli, game-ms); division only through `divideRounded`; IDs from counters. Everything with a unit has the unit suffix (`…Cents`, `…Bp`, `…Milli`, `…GameMs`, `…RealMs`).
- **Code organisation.** Layers `ui → app → core → shared`; `app → platform → shared`; import through `index.ts` only; `core` imports only `shared`; no `utils.ts`/`helpers.ts`; a tuning number goes in `content/tuning.yaml`, never a code constant; a content file is kebab-case with the ID matching the path.
- **Naming.** Named exports only; functions start with a verb; abbreviations only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi` (so `Bp` and `Usd` appear only as unit suffixes, which the GDD glossary and the architecture already use).
- **Testing.** Colocated unit tests; core tests with no DOM; builders not literals; fast-check invariants; no DOM snapshot tests; test names state behaviour.
- **Content rules (apply from 7.1; relevant here for the seam).** Content is data only (no HTML, no executable code, human units, stable IDs); agent-written content is `status: placeholder`; only Tiziano sets `final` (CODEOWNERS); `kernel`, `status`, `translatorNote` are stripped from the pack. Before writing player-facing text read `narrative-design.md` → Voice Style Guide: **this story has no player-facing text** (the tuning file has none), so the narrative documents are not needed.
- **Determinism.** A setting or content value that changes replay must be in the input log or the run start parameters: content pack version is a run start parameter (`RunStart.contentPackVersion`). Never let a newer pack rewrite an older run.
- **Code Quality Charter.** Search before creating (`divideRounded`, `canonicalize`, `sha256Hex`, `Result`, `assertInvariant` exist and must be reused); no abstract base classes or speculative options (the kinds registry is the single justified seam, per C-6); no AI-style comments, no defensive noise; `any`, `!`, `@ts-ignore`, nested ternaries are rejected; functions ≤ 40 lines, files ≤ 300, complexity ≤ 10, ≤ 3 parameters (use an options object, as `newRun(start)` does).
- **CI is the definition of done**; never disable a gate; every lint suppression needs a written reason; before closing, run the Agent Review Checklist (game-architecture.md → Implementation Patterns).

### Previous Story Intelligence (Story 1.2)

- `RunStart.contentPackVersion` already exists and is an opaque `string`; `newRun`, `replay` and `assertStateIsValid` treat it as such. Pin a real version as a fixture in later tests; the 1.2 builders use a placeholder string.
- **`sha256Hex` is hand-written in `src/shared/`** (no dependency, synchronous, NIST-vector tested). Reuse it for the pack hash; do not add `node:crypto` or `@noble/hashes`. Deferred item: `sha256Hex` maps lone surrogates to U+FFFD, so two different strings could hash alike. `canonicalize` escapes lone surrogates through `JSON.stringify`, so hashing `canonicalize(pack)` is safe; hashing raw YAML text would not be. Hash the canonical form only.
- **`canonicalize` rejects anything but plain integers**, `null`-prototype objects included. `yaml` and Zod outputs can produce objects with unusual prototypes or `undefined` fields; normalise to plain objects (and drop `undefined`) before hashing, or the version computation throws. A test should cover a Zod-transformed object going through `computeContentPackVersion`.
- **Lint-rule workflow from 1.2.** New rules need a fixture that fails, listed in `tests/lint-fixtures/expected.json` (the runner requires an exact match and fails on unlisted fixtures); keep clean control files; a config that rejects everything must not pass. Gotcha found in 1.2: `no-restricted-imports` `group` uses gitignore-style matching, so a bare `'..'` banned every `../x` import; put exact names in `paths` and globs in `patterns`/`group` carefully, and run `npm run lint:fixtures`.
- **`tsconfig.tests.json`** exists because `tests/builders` could not typecheck under `nodenext`; reuse it for `tools/content` (B7). ESLint's `projectService` found it without extra config.
- **`no-magic-numbers`** flags `-1` and any non-0/1 literal in `core/` except `core/constants.ts`: that is why the unit factors go to constants (C-2). Object-property values are not flagged by default (`detectObjects: false`).
- **Reviews will probe gate bypasses** (1.2 ran four review runs, each finding real gaps: `-0`, stray keys, partial validation). Expect: can `core/` reach the pack or a float through a path the lint missed; does `exactUnits` accept `-0`, `1e21`, `'12'` (a string where a number is expected), `true`; does an unknown key silently pass; does the version change with key order.
- **Deferred items relevant here** (`deferred-work.md`): "Commands and `RunStart` not decoded" (the save/import decoder in 1.9/1.10 will validate `contentPackVersion` format; make the 64-hex format explicit so it can); `assertInvariant` in `shared/` is awaiting its second consumer (this story's `tools/` is not a layer, so it does not settle it); "Rounding ban misses bitwise truncation" (do not use `| 0`/`~~` in `exactUnits`; use `divideRounded` and integer checks).
- **Review loop expectations from the user's memory notes:** code review loop (max 5 runs, stop when one finds nothing) **before** opening any PR; `main` requires approval and Tiziano bypasses as admin only after green CI.

### Git Intelligence

Last commits: `8932ca4` Story 1.2 deterministic core skeleton (#6; added `core/`, `shared/`, `tests/builders`, `tsconfig.tests.json`, lint rules and fixtures), `928552a` close 1.1/8.1, `03a2cc9` Story 8.1 PDFKit spike (`report/` only), `6d5ac8d` 1.1 review fixes, `c8173de` close 1.1. Convention: one PR per story from branch `story/<key>` (here `story/1-3-content-and-tuning-pipeline`), squash-merged, the story file in `_bmad-output/implementation-artifacts/`, status moves `ready-for-dev → in-progress → review → done`, and a final "Close story" PR. `sprint-status.yaml` on this branch may still show 1.2 as `review` until its close PR merges; do not edit that line here.

### Latest Technical Information

- **Vite 8.3 (installed).** Virtual modules use `resolveId` returning an internal id prefixed with `\0`, and `load` returning the module text; Vite 8's docs show the filter form (`resolveId: { filter, handler }`), the plain function form also works. `handleHotUpdate(ctx)` receives `{ file, timestamp, modules, read, server }`; to force a reload, invalidate the module (`server.moduleGraph.invalidateModule`) and send `server.ws.send({ type: 'full-reload' })`, returning `[]`. Plugin errors during `transform`/`load` reach the overlay with the message; for custom errors send `{ type: 'error', err: { message, stack, plugin, id? } }`. `runnerImport` is exported from `vite` for running a TS module with the project's config from a script. Confirm signatures with `npx ctx7@latest docs /vitejs/vite/v8.0.10 "<question>"` before coding the plugin (the project rule prefers fetched docs over memory).
- **Zod 4.6.** `z.toJSONSchema(schema, { io: 'input' })` is the JSON Schema generator (it lives in `zod/v4/core`, re-exported from `zod`). Transforms (`.transform`) cannot be represented in the output side; use `io: 'input'` (human-unit keys) and confirm the output for `.strict()` objects (`additionalProperties: false`) and for ranges. Zod issues carry a `path` array: join it with `.` for the "field" in the error.
- **yaml 2.9.** `parseDocument(text, { uniqueKeys: true })` reports duplicate keys and syntax errors with line and column in `doc.errors`; `doc.toJS()` yields plain objects. Optionally use `LineCounter` to add `line:col` to the error (nice to have, not required by the AC).
- No web research beyond the installed packages was needed; no CVEs or deprecations affect these versions.

### References

- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Story 1.3: Content and tuning pipeline]
- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Epic 1 Story 1.5 (start values), Story 7.1 (schemas and ID/path table), D-E3, D-E6]
- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md#Initial tuning table; #Daily simulation; #Alignment drift; #Economy and Resources; #Difficulty Curve and every `[tuning]` tag]
- [Source: _bmad-output/game-architecture.md#Content Pipeline (D6); #Configuration; #Implementation Patterns → Data Patterns, Code Quality Charter, Agent Review Checklist; #Data Persistence (D4) → Version pinning; #Simulation Time Model (D1) → Time bases; #Randomness and Numerics (D2); #Project Structure → Directory Structure, System Location Mapping]
- [Source: _bmad-output/project-context.md#Core Purity & Determinism Rules; #Code Organization Rules; #Naming Rules; #Testing Rules; #Platform, Input & Build Rules; #Critical Don't-Miss Rules → Determinism]
- [Source: _bmad-output/game-test-design.md#CNT-05, CNT-06 (and CNT-01 groundwork), R6, SAV-10, A-12]
- [Source: _bmad-output/implementation-artifacts/1-2-deterministic-core-skeleton.md#Dev Agent Record, Binding clarifications; _bmad-output/implementation-artifacts/deferred-work.md]
- [Source: eslint.config.js (core block, boundaries, limits); vitest.config.ts; vite.config.ts; knip.json; tsconfig.tests.json; tsconfig.node.json; tests/lint-fixtures/expected.json; .prettierignore; src/core/constants.ts, src/core/numerics/divideRounded.ts, src/core/run/canonicalize.ts, src/shared/*]

## Open Questions (for Tiziano; defaults are applied if unanswered)

1. **Scope of `tuning.yaml`.** Default: the full GDD initial tuning table plus every inline `[tuning]` tag, but no invented numbers (C-5); phase-partial values are optional with a "Tuning gaps" list. Alternative: only the rows Epic 1 stories read (start values, base costs, salary, GPU, Hype basics), leaving the rest to their owner stories. The default avoids "no tuning constants in code" violations later.
2. **Dev hot reload = full page reload.** Default: invalidate the virtual module and send `full-reload` (simple, always consistent; a content edit mid-run in dev restarts the app, which is acceptable because a run is pinned to its pack anyway). Alternative: custom HMR that swaps the `ContentIndex` live, which risks a mid-run content change that desyncs replay.
3. **Version string.** Default: full 64-char lowercase SHA-256 hex. Alternative: a truncated 12-char form; shorter in diagnostics, tiny collision risk, and a later format change would itself be a save-format change.
4. **How content reaches `advance`/`applyCommand` (Story 1.5 decision, flagged now).** `advance(state, untilGameMs, mode)` and `applyCommand(state, command, atGameMs)` already use all three parameters allowed by `max-params`. Economy handlers need `content.tuning`. Default recorded here: this story only makes `ContentIndex` available; the first story that needs it chooses between a bound-closure (`createCore(content)` returning `advance`/`applyCommand`) and an options object, and documents it. Do not smuggle content into `GameState` (it would enter the fingerprint and the save).
5. **`templatesFor` placeholder type.** Default: `readonly TemplateContent[]` with `TemplateContent = { id: string }`, always empty until 7.1. Alternative: omit the method until 7.1. The AC says "signature ready", so the default keeps it.
6. **Generated JSON Schema is committed** (`content/schema/`, prettier-ignored, drift-tested). Alternative: gitignore it and generate on `postinstall`; this keeps the repo smaller but breaks editor autocompletion until someone runs the script.
7. **Exponent and fractional load storage.** Default: basis points for multipliers and exponents, milli-load for load values (see inventory). The deterministic evaluation of `headcount^1.2` across engines is **not** solved here (risk for Story 1.5/4.7 and DET-08).

## Dev Agent Record

### Agent Model Used

Story created by claude-sonnet-5-5 (Claude Code, gds-create-story), autonomous run on 2026-10-28.
Implemented by claude-opus-5-5 (Claude Code, gds-dev-story), autonomous run on 2026-10-28.

### Debug Log References

- C3 bundle probe, first try: with the schemas exported from `core/content` (re-exported by `core/index.ts`), a temporary `loadContentIndex()` import in `main.tsx` grew the initial chunk to 28.8 KB gzip with Zod inside (`unrecognized_keys`, `toJSONSchema` found in `index-*.js`). After moving the schemas to `core/contentSchema` (not re-exported by `core/index.ts`): 6.84 KB gzip, no Zod and no `yaml` in the initial chunk, the pack itself present (`baseCostsPerDayCents` x3). The temporary import was reverted.
- Vite printed `(!) Your Vite config uses features that are unsupported by configLoader: 'native'` once the config imported the plugin, which imported `src/core` (extensionless). Fixed by loading the compiler through `runnerImport` inside the plugin and using `.ts` import specifiers on the config → plugin path; the warning is gone.
- `tsc -b` failed on `tests/builders/makeContentPack.ts` (`node:fs` unknown) because `tsconfig.app.json` reaches the builders through `src/**/*.test.ts`. The builder now imports the YAML with Vite's `?raw` query instead of `node:fs`.
- `eslint.config.js` passed 300 lines with the `virtual:*` pattern (`max-lines`). The core restriction lists moved to `eslint/coreRestrictions.js` unchanged; no rule was disabled.
- E4: `npx vite build` with `baseCostsPerDayUsd: 0.001` exits 1 with `[plugin hitl-content-pack] RolldownError: content/tuning.yaml: phases.garage.baseCostsPerDayUsd: 0.001 is not a whole number of cents`. File restored.
- D9 (real dev server, `npx vite --port 5199`): a script connected to the HMR socket and a headless Chromium page. Broken edit → socket received `{"type":"error","err":{"message":"content/tuning.yaml: phases.garage.baseCostsPerDayUsd: 0.001 is not a whole number of cents","stack":"","plugin":"hitl-content-pack","id":"…/content/tuning.yaml"}}`; the page showed `<vite-error-overlay>` with that exact message; `/@id/__x00__virtual:content-pack` kept serving the last good version. Fix (value 400) → `{"type":"full-reload"}`, page reloaded, overlay gone, new version served with `"baseCostsPerDayCents":40000`. File restored.

### Completion Notes List

**What was built**

- `core/constants.ts`: `phases` (`garage`, `seed`, `seriesA`) and `Phase`, exported from `core/index.ts`; integer unit factors (`CENTS_PER_DOLLAR`, `BP_PER_PERCENT`, `BP_PER_MULTIPLIER`, `BP_PER_HYPE_POINT`, `MILLI_PER_POINT`, `MS_PER_SECOND`, `SECONDS_PER_MINUTE`, `DECIMAL_BASE`); `GAME_DAY_MS` reused for days.
- `core/contentSchema/exactUnits.ts`: one `scaleDecimal` path (shortest decimal text → integer mantissa and decimal places → exact division through `divideRounded`, reducing by the common factor first so intermediates stay safe integers). Rejects non-finite values, exponent notation, too many digits, non-whole results and unsafe results; `-0` → `0`. Per-unit converters: `usdToCents`, `percentToBp`, `multiplierToBp`, `hypeIndexToBp`, `alignmentPointsToMilli`, `toMilli`, `secondsToRealMs`, `secondsToGameMs`, `activeMinutesToGameMs`, `daysToGameMs`.
- `core/contentSchema/fieldGroup.ts`: the declarative unit table (C-3). `defineFieldGroup({ baseCostsPerDay: 'usd', eventInterval: range('activeMinutes') })` builds the strict Zod object with human keys (`baseCostsPerDayUsd`), converts each value in a transform (failures become Zod issues with the reason), and renames to the integer keys (`baseCostsPerDayCents`) with a precise mapped TypeScript type. Ranges are `{ min, max }` with `min <= max`. Counts are integers (`z.int`), `-0` normalised.
- `core/contentSchema/tuningSchema/*`: 9 group files plus `index.ts` (`tuningSchema`, `CompiledTuning`), all `.strict()`.
- `core/contentSchema/contentKind.ts`: the kinds seam (`{ name, matches, schema, cardinality }`), production list = `tuning` only.
- `core/content`: `ContentPack` (deep-readonly), `computeContentPackVersion` (`sha256Hex(canonicalize(pack))`), `createContentIndex` (frozen `{ tuning, templatesFor }`, `templatesFor` returns a frozen empty array), `stripAuthoringMetadata` (top level only).
- `content/tuning.yaml` (17 groups, human units, schema comment on line 1) and the generated, committed `content/schema/tuning.schema.json`.
- `tools/content`: `compileContentPack` (pure, collects all errors, unique YAML keys, `file: field: reason` messages, one error per unknown key), `readContentSources` (sorted POSIX paths, every non-hidden file under `content/` except `content/schema/`), `compileContentDir`, `contentPlugin` (virtual module, build failure, dev overlay + last good pack + full reload), `generateContentSchema` (`z.toJSONSchema(..., { io: 'input' })`), `writeContentSchemas` (`npm run content:schema`, through `runnerImport`, no new dependency).
- `app/content`: `virtual:content-pack` declaration and `loadContentIndex()` (function, not singleton), public through `app/index.ts`.
- Lint: `virtual:*` banned in `core/**` (fixture `tests/lint-fixtures/src/core/importsVirtualModule.ts`).
- Builders: `makeContentPack(overrides)`, `makeTuningInput(overrides)`, `readTuningSource()`, `tuningSourcePath` (real file, real schema, dotted human-unit overrides).
- Tests: 239 in total, 77 of them in the new test files: `exactUnits.test.ts` (table, float traps, failures, `-0`, fast-check property from C-1), `tuningSchema.test.ts` (start values, 31-day runway, units and suffixes, safe integers only, unknown/missing keys, wrong types, `$0.001`, fractional count, `-0`, bad ranges), `contentPack.test.ts` (pinned hash `262f3e1e…939a`, cross-checked with `shasum -a 256` on the canonical text; key order; Zod-built pack; float throws), `createContentIndex.test.ts`, `compileContentPack.test.ts` (CNT-05 strip/version, nested `status` kept, fast-check over every shipped leaf, key order/comments/whitespace, error collection and format, duplicate keys, syntax error, unknown path, missing single kind, `many` kind order), `contentPlugin.test.ts` (fake `server.ws` / `moduleGraph` only), `generateContentSchema.test.ts` (drift), `loadContentIndex.test.ts` (`dom` project, through the real plugin).

**Decisions taken in place of asking (Open Questions and gaps found while coding)**

1. OQ1 scope: default applied, the full GDD initial tuning table plus every inline `[tuning]` tag.
2. OQ2: full page reload on a good content edit.
3. OQ3: full 64-character lowercase SHA-256 hex.
4. OQ4: not decided here; nothing in `core/run` or `core/time` imports `core/content` (C-8).
5. OQ5: `templatesFor(channel: string, phase: Phase): readonly TemplateContent[]` kept, always empty. `channel` is a plain `string` because no channel type exists yet.
6. OQ6: JSON Schema committed, prettier-ignored, drift-tested.
7. OQ7: multipliers and exponents in basis points (`…MultiplierBp`, `…ExponentBp`), load in thousandths (`…LoadMilli`).
8. **Schemas moved to `core/contentSchema`** (C3 says to do this if Zod leaks; it did). `core/index.ts` re-exports `core/content` only; `tools/` and tests import `core/contentSchema` directly. `game-architecture.md` D6, N3, the tree and the system mapping now say so.
9. **The plugin loads the compiler through `runnerImport`**, so the Vite config chain stays loadable by `configLoader: 'native'` (planned Vite default). The config and the plugin use `.ts` import specifiers; `tsconfig.tests.json` gains `allowImportingTsExtensions` (it is `noEmit`).
10. **`vite.config.ts` and `vitest.config.ts` moved from `tsconfig.node.json` to `tsconfig.tests.json`** with `tools/content` (B7): a config that imports the plugin pulls `tools/content` into its project, and `nodenext` rejects its extensionless `src` imports. `tsconfig.tests.json` gains `"node"` in `types`.
11. **Kinds carry `cardinality: 'single' | 'many'`** so Story 7.1 adds collection kinds without touching the compiler (C-6); a `single` kind with zero or several files is an error.
12. **Every non-hidden file under `content/` is read** (not only `*.yaml`), except `content/schema/`, so a misplaced file fails. `content/.gitkeep` was deleted (the folder now has content).
13. **Unit naming**: unit `hypeIndex` turns `launchHype` into `launchHypeIndex` → `launchHypeBp` (and `hype` → `hypeIndex` → `hypeBp`, the C-3 example); `alignmentPoints` turns `alignment` into `alignmentPoints` → `alignmentMilli`; `…GameSeconds`, `…Days`, `…ActiveMinutes` → `…GameMs`; `…Seconds` → `…RealMs`; counts keep a unit-free noun (`gpuCapacityUnits`, `backlogCapMessages`, `contentMinMorale`).
14. **Formulas expressed exactly**: "Hype / 200" is `teamSharePerHypePointPercent: 0.5`; "2 + 0.1 × Hype" is `baseNewCustomersPerDay: 2` plus `newCustomersPerDayPerHypePoint: 0.1` (→ `…Milli: 100`); the Garage phase factor for new customers is `1` (the GDD formula at Garage has no factor); the valuation multiple is two anchors (`low`, `high`, each `{ hypeIndex, valuationMultiplier }`).
15. **MRR divisor kept as tuning**: `economy.billingMonthDays: 30` → `billingMonthGameMs: 1_800_000`. Story 1.5 decides whether it becomes a game constant.
16. **Overdraft floors in `economy`** (`garageOverdraftFloorUsd: -5000`, `overdraftFloorOfLastRoundPercent: 15`), not per phase, because Garage and Seed+ use different units.
17. YAML warnings (not errors) are not turned into build errors; only `doc.errors` fail.

**Deviations from the story**

- `core/content` public surface (A8) is split: schemas, kinds and `IntegerRange` are in `core/contentSchema/index.ts`, not in `core/content/index.ts` or `core/index.ts` (C3 decision above). `exactUnits.test.ts` lives beside `exactUnits.ts` in `core/contentSchema/`.
- A3: no individual `usd()`/`percent()` helpers; the unit table plus `defineFieldGroup`/`range` play that role (one table drives schema, keys and JSON Schema).
- Inventory said Seed and Series A arrival intervals are not in the GDD. They are (GDD M2 Cadence by phase: Seed 1 per 6–10 s; Series A+ 12/min = 1 per 5 s at entry, +2/min per later round, cap 40/min), so they are included (C-5: include what the GDD states). There are therefore no optional per-phase fields.
- The pinned version test is `contentPack.test.ts` (named after the module), not `computeContentPackVersion.test.ts`.
- `eslint/coreRestrictions.js` is new (extracted from `eslint.config.js` for `max-lines`; content unchanged apart from the new pattern).
- E5 (review loop and PR) is not done here by instruction: a separate reviewer runs the code-review loop; nothing pushed, no PR.

**Tuning gaps (owner stories fill them; nothing invented)**

- No per-phase gaps remain (see the arrival intervals above).
- Numbers stated in the GDD but not tagged `[tuning]` and not in the inventory, so left out: response windows by urgency 45/75/120 s (M2; also the Timing setting), passive Alignment recovery `+0.1/day` when under 20% AI decisions and the threshold list 75/50/25/10 (M7), traits 1–4 effects (e.g. 10x Engineer 2× throughput, −2 morale/day per teammate), capacity-offer episode end below 90% utilisation (same number as the churn threshold, may reuse it), Untimed visible queue cap 30.

**Known gaps and risks**

- `alignmentMilli` appears as a tuning key (`start.alignmentMilli`, drift values `…Milli`) as C-3 prescribes. The future hidden-state lint (architecture Consistency Rules: `alignmentMilli` only in alignment, staff, ending, save, run) must target state, not tuning, or tuning must be renamed then.
- `headcount^1.2` cross-engine determinism is not solved (OQ7; Story 1.5 / 4.7, DET-08). Only storage (`headcountBurnExponentBp: 12000`) is fixed.
- `runnerImport` is marked `@experimental` in Vite 8.3; `handleHotUpdate` is the classic hook (the environment-aware `hotUpdate` exists too). Both are covered by the plugin test and the manual dev check.
- Firefox e2e not run locally (known environment limit, see `deferred-work.md` for 8.1); Chromium and WebKit pass.

**Gates (Node 24.18.1)**

- `npm run check`: exit 0 (typecheck, lint, lint:fixtures 85/85, lint:css, format:check, jscpd 0 clones, knip clean, build, size 4.98 KB gzip + initial bundle check, 239 tests passed).
- `npx playwright test --project=chromium --project=webkit`: 4 passed.

**Agent Review Checklist**

- [x] I searched for an existing primitive, pattern or helper before creating one. (`divideRounded`, `withoutNegativeZero`, `canonicalize`, `sha256Hex`, `Result`, `GAME_DAY_MS`, `deepFreeze` reused; no second serialiser or hasher.)
- [x] No duplicated logic. Second occurrences are extracted where the concept is the same. (One conversion path; one unit table for keys, schema and JSON Schema; jscpd 0 clones.)
- [x] Names use the GDD glossary, carry units, and need no comment. (Every compiled number ends in `Cents`, `Bp`, `MultiplierBp`, `ExponentBp`, `Milli`, `GameMs`, `RealMs` or a count noun.)
- [x] Every comment states a *why* that the code cannot.
- [x] Core code is pure: no clocks, no `Math.random`, no I/O. (Parsing and file access live in `tools/`; `core/` is lint-banned from `virtual:*`.)
- [x] New content kinds or predicates have schema, implementation and test. (`tuning` kind: schema, compiler, tests; test-only `events` kind exercises the seam.)
- [x] Tests describe behaviour and use the shared builders. (`makeContentPack`, `makeTuningInput`; no hand-written `ContentPack` literal except the tiny pinned-hash input.)
- [x] Lint, jscpd, knip, Stylelint, size-limit and tests pass.

### File List

New:

- `content/tuning.yaml`
- `content/schema/tuning.schema.json` (generated)
- `eslint/coreRestrictions.js`
- `src/app/content/contentPackModule.d.ts`
- `src/app/content/index.ts`
- `src/app/content/loadContentIndex.ts`
- `src/app/content/loadContentIndex.test.ts`
- `src/core/content/contentPack.ts`
- `src/core/content/contentPack.test.ts`
- `src/core/content/createContentIndex.ts`
- `src/core/content/createContentIndex.test.ts`
- `src/core/content/index.ts`
- `src/core/content/stripAuthoringMetadata.ts`
- `src/core/contentSchema/contentKind.ts`
- `src/core/contentSchema/exactUnits.ts`
- `src/core/contentSchema/exactUnits.test.ts`
- `src/core/contentSchema/fieldGroup.ts`
- `src/core/contentSchema/index.ts`
- `src/core/contentSchema/tuningSchema/alignment.ts`
- `src/core/contentSchema/tuningSchema/compute.ts`
- `src/core/contentSchema/tuningSchema/economy.ts`
- `src/core/contentSchema/tuningSchema/hypeAndCustomers.ts`
- `src/core/contentSchema/tuningSchema/index.ts`
- `src/core/contentSchema/tuningSchema/investorsAndRounds.ts`
- `src/core/contentSchema/tuningSchema/messagesAndPacing.ts`
- `src/core/contentSchema/tuningSchema/spineAndMeta.ts`
- `src/core/contentSchema/tuningSchema/staff.ts`
- `src/core/contentSchema/tuningSchema/startAndPhases.ts`
- `src/core/contentSchema/tuningSchema/tuningSchema.test.ts`
- `tests/builders/makeContentPack.ts`
- `tests/lint-fixtures/src/core/importsVirtualModule.ts`
- `tools/content/compileContentDir.ts`
- `tools/content/compileContentPack.ts`
- `tools/content/compileContentPack.test.ts`
- `tools/content/contentPlugin.ts`
- `tools/content/contentPlugin.test.ts`
- `tools/content/generateContentSchema.ts`
- `tools/content/generateContentSchema.test.ts`
- `tools/content/readContentSources.ts`
- `tools/content/writeContentSchemas.ts`

Modified:

- `.prettierignore`
- `AGENTS.md`
- `_bmad-output/game-architecture.md`
- `_bmad-output/implementation-artifacts/1-3-content-and-tuning-pipeline.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `eslint.config.js`
- `knip.json`
- `package.json`
- `src/app/index.ts`
- `src/core/constants.ts`
- `src/core/index.ts`
- `tests/builders/index.ts`
- `tests/lint-fixtures/expected.json`
- `tsconfig.node.json`
- `tsconfig.tests.json`
- `vite.config.ts`
- `vitest.config.ts`

Deleted:

- `content/.gitkeep`

## Change Log

- 2026-10-28: story file created (status ready-for-dev).
- 2026-10-28: implemented content and tuning pipeline (tuning.yaml, exact unit conversion, Zod schemas, compiler, Vite plugin with virtual:content-pack, JSON Schema generation, ContentIndex); schemas split into core/contentSchema to keep Zod out of the runtime bundle; status → review.

### Review Findings

Review run 1 (no code defects found):

- Bundle figures reconciled: 4.98 KB gzip is the real initial chunk (`main.tsx` does not import `loadContentIndex` yet, so no pack, Zod or yaml is in it; verified with `npm run build`, grep of every dist chunk). 6.84 KB was the temporary C3 probe with `loadContentIndex()` imported (pack included, still no Zod/yaml).
- Deferred: dev server does not react to added/removed content files (see deferred-work.md).
- Dismissed: schema JSON out of date (regenerated, no diff).

Review run 1 (full workflow: Blind Hunter, Edge Case Hunter, Acceptance Auditor):

- [x] [Review][Patch] Overlapping dev compiles could let an older one overwrite `latest`/`lastGood` [tools/content/contentPlugin.ts] — compiles now run serially
- [x] [Review][Patch] A rejected pipeline load was cached forever [tools/content/contentPlugin.ts] — cache cleared on failure
- [x] [Review][Patch] Unresolved YAML alias (`a: *x`) made `toJS()` throw out of the Result pipeline [tools/content/compileContentPack.ts] — now a `file: : reason` error, tested
- [x] [Review][Patch] Missing `content/` or a file vanishing mid-read rejected instead of returning an error [tools/content/compileContentDir.ts] — now an author-facing error, tested
- [x] [Review][Patch] `ContentIndex` only shallow-frozen over a shared mutable pack literal [src/core/content/createContentIndex.ts] — tuning is deep-frozen, tested
- [x] [Review][Defer] Tuning values have no range checks (zero divisors, probabilities over 100, low/high ordering) [src/core/contentSchema] — deferred, product decision on bounds
- [x] [Review][Defer] Duplicate ids in a `many` kind, symlinked content files, `vite build --watch` not watching content, dev runner caches edited Zod schemas — deferred until a `many` kind or those workflows exist
- Dismissed: hidden files ignored (intentional), `content/schema/*.json` triggering a reload (harmless), missing unit suffixes in YAML keys (within C-3), brittle hard-coded values in tests, bundle growth (budgeted), locale text outside the pack hash (design), sort comparator never returns 0 (paths are unique).
