---
title: 'Game Architecture'
project: 'browser-game'
date: '2026-10-26'
author: 'Tiziano'
version: '1.0'
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
status: 'complete'
engine: 'none (web stack: Preact 10 + TypeScript 6 + Vite 8)'
platform: 'web browser (static, GitHub Pages)'

# Source Documents
gdd: '_bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md'
epics: '_bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md'
brief: '_bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/brief.md'
ux: '_bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/ (DESIGN.md, EXPERIENCE.md)'
narrative: '_bmad-output/narrative-design.md'
---

# Game Architecture — Human in the Loop

## Executive Summary

**Human in the Loop** is a Preact 10 + TypeScript 6 web app built with Vite 8 and served from GitHub Pages (dedicated organization origin). It targets the latest two versions of desktop browsers and is responsive on mobile. It has no backend, no accounts and no telemetry, and works offline after the first visit.

**Key architectural decisions:**

- **Simulation.** A pure, deterministic discrete-event core: one `advance()` serves present play, hidden tabs (incremental preview) and closed tabs (return from absence), with chunk invariance as a tested invariant.
- **Source of truth.** Seed + input log. Snapshots are caches; replay consistency is verified at five levels, including a runtime desync detector, and every import is verified by replay.
- **Data.** Integer units (cents, basis points, Alignment milli-points). Content is schema-validated YAML (Zod) for PR contributions. ICU i18n with typed keys.
- **Outputs.** Spoiler-safe end-of-run documents from one `ReportModel`: PNG via Canvas 2D, tagged PDF/UA via PDFKit.
- **Quality.** A Code Quality Charter and layer boundaries enforced by ESLint, jscpd, knip, Stylelint and size-limit, so AI agents produce consistent, non-duplicated, self-explanatory code.

**Project structure:** layers (`core`, `platform`, `app`, `ui`, `report`, `i18n`, `shared`, `debug`) with game domains inside; 27 systems mapped.

**Implementation patterns:** 5 novel patterns (Signal pipeline, Region gating, Declarative conditions, Timed scripts, Clue replay probes), 4 standard patterns, and the Charter with examples and a review checklist.

**Ready for:** epic and story creation.

## Project Context

### Game Overview

**Human in the Loop** — a free, open-source, single-player browser game: a roguelite incremental management sim in which the player runs an AI startup from a garage toward being surpassed by its own AI, entirely inside a fake SaaS workspace (Huddlr chat, Vanity dashboard rail, LGTM Docs, AllGreen incidents). No game graphics: the UI *is* the game.

### Technical Scope

- **Platform:** Web browser — desktop-first (latest 2 versions of Chrome, Edge, Firefox, Safari), responsive and touch-playable on Safari iOS / Chrome Android.
- **Genre:** Simulation (management) with Roguelike run structure and Idle/Incremental offline progression.
- **Project Level:** Medium-high complexity. Low rendering complexity (DOM/CSS only); high simulation, determinism, persistence and accessibility complexity.
- **Hard constraints:** no backend, no accounts, static hosting, open source, offline after first load, no telemetry, 100% AI spec-driven development.

### Core Systems

| System | Complexity | GDD Reference |
|---|---|---|
| Time & clock states (present / away / paused; game speed) | High | M1, Clock States |
| Unified simulation step (economy daily step + real-time message timers) | High | M1, M4, Economy |
| Absence simulation & backlog on return (14-day cap, stop on heavy decision / death) | High | M3 |
| Seed determinism, RNG, input log, replay | High | Seed Determinism |
| Triage & message lifecycle (windows, expiry, default outcome) | Medium | M2 |
| Delegation policies, Ask Metis, Auto-triage, Compute | Medium | M4, M5 |
| Hidden Alignment (drift, thresholds, ceiling, recovery) | Medium | M7 |
| Signals (corrupting title, tone, Dora drift, UI infection, inference log) | Medium | M7, DESIGN UI infection |
| Staff, traits, morale, assign route | Medium | M9 |
| Investors, rounds, phases, UI widening | Medium | M10, Progression |
| Event deck engine (conditions, weights, cooldowns, exhaustion) | Medium-High | M12 |
| Heavy decisions (probabilistic, capability grants) | Medium | M6 |
| Cascade onboarding (script runner, UI born element by element) | Medium | M11, EXPERIENCE Cascade |
| Chronicle & news ticker | Low-Medium | M13 |
| Deaths, Surpassed sequence, clue replay (reconstruction + counterfactual) | High | M8 |
| End-of-run documents (PNG 1080×1350, tagged PDF A4/Letter) | High (tagged PDF) | M8, DESIGN End-of-run |
| Persistence (autosave, persistent storage, single-tab lock, migration) | High | Platform Details |
| Export/import (encoded, checksummed data room) | Medium | Platform Details |
| Content pipeline (schema-validated data, PR contributions, tuning as data) | Medium | M12, Platform Details |
| i18n (UI strings + content strings, English at launch) | Medium | Platform Details |
| Notifications (tab-title counter, background projection, browser notifications) | Medium | Controls, EXPERIENCE Notifications |
| Accessibility layer (announcer, focus rules, shortcuts + Alt set, presets, timing) | High | Accessibility, EXPERIENCE Accessibility Floor |
| Theming (4 themes × light/dark × HC × CB, infection stages, Red Runway) | Medium | DESIGN |
| Audio cues (8, off by default) | Low | Audio |
| Offline / PWA (fonts precached) | Low-Medium | Platform Details |

### Technical Requirements

- **Performance:** background tab CPU ≈ 0; memory < 150 MB after 8 h; first interactive < 2 s (cold, 4G, mid-range laptop); 60 FPS for rolling numbers / confetti / ticker; 14-day absence simulated and rendered < 500 ms; PNG + PDF < 3 s.
- **Networking:** none. Single player; no server; static assets only.
- **Persistence:** local autosave every game day and on tab close; persistent-storage request; export/import encoded + checksummed; tampered import refused; save migration across content-pack versions.
- **Determinism:** seed + ordered inputs (game-time ms timestamps) + absence timestamps + sim-affecting settings + content-pack version → identical run.
- **Accessibility:** WCAG 2.2 AA; full keyboard and screen-reader play (VoiceOver, NVDA, JAWS); 320 CSS px reflow; 200% text.
- **Localization:** every player-facing string in translation files from day one; English at launch.
- **Future-proofing (not built):** post-MVP QR recap page with run data encoded in the URL.

### Complexity Drivers

**High complexity:**

- A single simulation path that serves live play, background tab and closed tab, immune to timer throttling.
- Determinism over multi-hour, multi-day runs with real-time message timers between daily economy steps.
- Clue replay: reconstructing the full Alignment curve and top-5 drift decisions from seed + log.
- Persistence durability on Safari (eviction) and the single-live-tab rule.
- Accessibility as architecture (announcer, focus contract, parity of hidden signals).

**Novel concepts (no off-the-shelf pattern):**

- Hidden-state signal pipeline: Alignment thresholds → title, tone, Dora drift, CSS infection, inference log; silent by design and never announced.
- UI "born" element by element (cascade), then phase widening; regions not rendered until unlocked.
- Background tab-title projection: counting waiting messages without running the economy.
- Spoiler-safe shareable artifacts generated client-side (no Alignment data in PNG/PDF).

### Technical Risks

| Risk | Note |
|---|---|
| Tagged (accessible) PDF generation in-browser | **Resolved by D8:** PDFKit emits tagged PDF/UA in the browser; validated by an E8 spike with veraPDF |
| Determinism drift (floats, iteration order, content changes) | Integer money, split RNG streams, content-pack version in state |
| Input log / save growth over long runs | Snapshots + log compaction without breaking replay |
| Safari storage eviction | persist() + export nudges; not fully mitigable |
| AI-agent implementation drift | Explicit module boundaries, conventions, lint-enforced import rules |
| Content contributions breaking runs | Schema validation in CI; content-pack versioning and save migration |


## Engine & Framework

### Selected Stack

No game engine. *Human in the Loop* is a web application whose UI is the game, so the "engine" is a web stack:

| Layer | Choice | Version (verified 2026-10-26) |
|---|---|---|
| Language | TypeScript (strict) | 6.0.x (7.x blocked: typescript-eslint 8.72 peer `<6.1.0`) |
| Runtime for tooling | Node.js LTS, pinned in `.nvmrc` and `engines` | 24.x "Krypton" (24.22.x; Vite 8 needs `^20.19 \|\| >=22.12`); move to 26.x once it is LTS |
| UI | Preact | 10.29.x (no 11.x migration in the MVP) |
| Reactivity bridge | @preact/signals | 2.11.x |
| Build / dev server | Vite + @preact/preset-vite | 8.3.x / 2.10.x |
| Offline / service worker | vite-plugin-pwa | 2.0.x |
| Hosting | GitHub Pages (static) on a **dedicated GitHub organization** (own origin), deployed by GitHub Actions | — |

**Rationale:**

- Canvas-based engines (Phaser, PixiJS, Godot/Unity web) would discard native accessibility (screen readers, focus, 200% text, reflow), which the Accessibility Floor requires.
- Preact gives React's JSX and hooks API, which AI agents know well, at ~4 KB.
- Signals give fine-grained DOM updates for timers, rolling numbers and high message volume without whole-tree re-renders.
- Preact 10.x is chosen over the one-month-old 11.x for tooling maturity.
- TypeScript 6.0.x, not 7.x: lint is what enforces module boundaries, and typescript-eslint does not support 7 yet. Upgrade when it does.
- Accessibility primitives are built in-house on native elements (`<dialog>`, `popover`, ARIA roles) and live only in `ui/primitives/`. Each one ships with an axe test and a keyboard test. Feature code never hand-rolls a dialog, popover or radio group.
- **Escape clause:** if a composite widget (e.g. the staff picker) becomes a sink, a targeted accessible-widget library may be adopted for that widget only, behind the same `ui/primitives/` API.

### Code Quality Charter (summary; full rules in *Implementation Patterns*)

Fixed before any code is written:

- **Reuse before create.** Before adding a component or helper, search `ui/primitives/`, `ui/patterns/` and the shared modules. Extract a shared abstraction at the **second occurrence** when the two cases are genuinely the same concept. No speculative abstraction.
- **Variants are data, not copies.** Surface differences (Huddlr, LGTM Docs, AllGreen, Vanity rail), themes and infection stages are expressed through props, design tokens and `data-` attributes on one component, never by duplicating it.
- **Ubiquitous language.** Identifiers use the GDD glossary verbatim (`alignment`, `triage`, `delegationPolicy`, `heavyDecision`, `askMetis`). Same names in docs, code and tests.
- **Self-explanatory code.** Comments explain *why*, never *what*. No JSDoc restating TypeScript signatures, no section banners, no commented-out code, no narrating comments. A name that needs a comment gets renamed.
- **Functions and composition.** Small pure functions and plain data. No abstract base classes, no "for the future" layers.
- **Enforced in CI:** `jscpd` duplication threshold, ESLint import-boundary rules, max function length and complexity, `no-warning-comments`. A review checklist covers what lint cannot judge.

### AI Development Tooling (MCP)

| MCP | Version | Purpose |
|---|---|---|
| Context7 (`upstash/context7`) | — | Current docs for Preact, Signals, Vite, Vitest, Playwright |
| Chrome DevTools MCP (`chrome-devtools-mcp`) | 1.12.x | Console, performance traces, background-tab CPU and memory checks against GDD targets |
| Playwright MCP (`@playwright/mcp`) | 0.0.8x | Agent-driven exploration via the accessibility tree; keyboard-only play checks |

MCPs are for agent exploration and diagnosis. The test suites of record are Vitest (core, in Node) and `@playwright/test` (e2e, in CI).

**Setup:** a committed `.mcp.json` at the repo root declares the three servers, so every agent session gets them:

```json
{
  "mcpServers": {
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp@4.4"] },
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@1.12"] },
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@0.0.83"] }
  }
}
```

Agents use the dev server with `?scenario=<name>` (Debug Tools) to reach any game state in one step.

### Project Initialization

```bash
npm create vite@latest human-in-the-loop -- --template preact-ts
cd human-in-the-loop
npm i @preact/signals
npm i -D vite-plugin-pwa
```

The first implementation story (E1) turns this scaffold into the module structure defined in *Project Structure*.

### Hosting Constraints (GitHub Pages)

| Constraint | Architectural consequence |
|---|---|
| No custom HTTP headers | No COOP/COEP → no `SharedArrayBuffer` / threaded WASM; any library requiring cross-origin isolation is excluded. CSP, if any, via `<meta>`. |
| No SPA fallback | No path-based routing. The game is one page with internal view state. Future pages are separate static entries (Vite multi-page), e.g. the post-MVP `recap.html`. |
| Served under `/<repo>/` without a custom domain | Vite `base` set; all asset paths relative; service-worker scope = base path. |
| Shared origin `<user>.github.io` | Storage, quota, persistence grant and SW are shared with every other Pages project on that origin. **Decided: dedicated GitHub organization** (own `<org>.github.io` origin). All storage keys/DB names namespaced (`hitl:`). |
| Fixed short cache TTL | Content-hashed assets; service worker precache for offline; an update applies only on the founding screen or after a run ends (D4 → Version pinning), with a non-blocking "new version" notice. |

### Post-MVP Door: QR Recap Page (not built)

- The recap is a separate static entry, `recap.html`, that reads a versioned, compact run summary from the **URL fragment** (`#v1.<payload>`).
- The fragment is never sent to the server, so it works on static hosting and leaks nothing to server logs.
- MVP obligation: the run-summary data shape is defined, versioned and spoiler-safe (same rules as the PNG/PDF) in `core/report`. No recap UI or QR code is built.

### Engine-Provided Architecture

| Component | Solution | Notes |
|---|---|---|
| Rendering | DOM + CSS via Preact | No canvas except optional confetti |
| Reactivity | @preact/signals | UI reads state; never owns game logic |
| Input | Native DOM events | Keyboard shortcut layer is ours |
| Audio | Web Audio API / `HTMLAudioElement` | 8 cues, off by default |
| Build, dev server, HMR, asset hashing | Vite | Multi-page ready |
| Offline caching | vite-plugin-pwa (Workbox) | Fonts and content precached |
| Physics / scenes | N/A | Not needed |

### Remaining Architectural Decisions (Step 4)

1. Simulation core: unified `advance()` time model, clock states, game speed, throttling immunity.
2. Determinism: PRNG algorithm and stream splitting, integer/fixed-point numerics, input-log format, snapshot and compaction policy.
3. State management: core → UI snapshot boundary, action dispatch, derived selectors.
4. Persistence: IndexedDB wrapper, schema versioning and migrations, autosave triggers, `storage.persist()`, single-tab lock.
5. Export/import encoding and checksum.
6. Content pipeline: schema library, file format, validation in CI, content-pack versioning, tuning file.
7. i18n library and message format (plurals, numbers, currencies), content-string separation.
8. End-of-run document generation: PNG and **tagged** PDF without cross-origin isolation.
9. Background projection and notifications (tab title, Notification API).
10. Accessibility infrastructure: announcer, focus manager, shortcut layer.
11. Theming and infection stages (CSS tokens, data attributes).
12. Testing stack (unit, determinism regression, e2e, a11y checks).
13. Repository tooling: lint/format, module-boundary enforcement, CI.

## Architectural Decisions

### Decision Summary

Versions verified on npm on 2026-10-27.

| # | Category | Decision | Version | Rationale |
|---|---|---|---|---|
| D1 | Simulation time | Discrete-event simulation behind one pure `advance()`; chunk invariance; core never reads a clock | — | One code path for present and away; cost scales with events, not elapsed time |
| D2 | Randomness and numerics | pure-rand, one stream per subsystem derived from the run seed; integer cents, basis points, Alignment in milli-points | pure-rand 8.4.x | Adding content in one subsystem never shifts draws in another; no float drift |
| D3 | State management | Functional, command-driven core; immutable plain-data state; signals only in the `app` layer | @preact/signals 2.11.x | "Seed + inputs → run" becomes the code structure; core testable in Node |
| D4 | Persistence | IndexedDB via idb; input log never compacted during a run; snapshot is a cache | idb 8.0.x | Replay is always possible; durable and async |
| D5 | Export/import | Single `codec`: JSON → deflate → base64url, versioned prefix, SHA-256 checksum; import verified by replay | fflate 0.8.x | Same codec serves the post-MVP QR payload; tampering detected by replay |
| D6 | Content pipeline | YAML files validated by Zod, compiled to JSON at build | yaml 2.9.x, zod 4.6.x | Most writable format for PR contributors; one schema for CI, build and import |
| D7 | i18n | ICU messages via intl-messageformat behind a typed `t()`; content strings gettext-style | intl-messageformat 12.1.x | Missing keys are compile errors; contributors write content in one place |
| D8 | End-of-run documents | One `ReportModel`, two renderers: Canvas 2D (PNG) and PDFKit (tagged PDF/UA) | pdfkit 0.20.x | Accessible PDF in the browser; single spoiler filter |
| D9 | Background tab | Hidden-tab preview runs the same `advance()` on a throwaway copy, incrementally | — | Tab title can never disagree with the real return |
| D10 | Accessibility infrastructure | Central announcer, focus contract, data-driven shortcut registry | — | Consistent behaviour; no per-component a11y logic |
| D11 | Styling and theming | CSS Modules + design tokens (custom properties) + `@layer`; visual state as `data-` attributes on `<html>` | Stylelint 17.16.x | Variants and infection are data; components are theme-agnostic |
| D12 | Testing | Vitest (Node) + fast-check + golden runs + Playwright + axe + veraPDF | vitest 5.0.x, fast-check 4.10.x, @playwright/test 1.64.x, @axe-core/playwright 4.14.x, happy-dom 21.0.x, @testing-library/preact 3.2.x | Determinism is the highest risk; it is tested without a browser |
| D13 | Repository tooling | ESLint + typescript-eslint + eslint-plugin-boundaries, Prettier, jscpd, knip, Stylelint, lint-staged + simple-git-hooks | eslint 10.13.x, typescript-eslint 8.72.x, eslint-plugin-boundaries 7.3.x, prettier 3.9.x, jscpd 5.4.x, knip 6.43.x, lint-staged 17.6.x, simple-git-hooks 2.14.x | Code Quality Charter and module boundaries enforced by machines, visible in the editor |
| D14 | Asset loading | Core, content pack and English in the main bundle; locales, report renderers and audio lazy; bundle budget in CI | size-limit 14.3.x, vite-plugin-pwa 2.0.x | < 2 s first interactive on 4G; offline after first visit |

### Simulation Time Model (D1)

**Approach:** discrete-event simulation.

- The core keeps an ordered event queue: message arrivals, message expiries, staff work completions, daily economy steps, scheduled events.
- `advance(state, untilGameMs, mode)` processes events in order up to `untilGameMs`. It stops early at the first **blocking event** (heavy decision, death) and reports why it stopped.
- `mode` is `present`, `away` or `ending` (Surpassed sequence: only script events run, see N4). Away applies M3 rules: no delegation policy means full pause; non-delegated messages go to the backlog; staff never pick up new work; the absence is capped at 14 game days.
- Ties in the queue are broken by a deterministic key (time, event kind priority, stable id). Iteration order never depends on object key order or `Map` insertion side effects.

**Invariants:**

- **Chunk invariance.** For any state `s` and times `t1 ≤ t2`, `advance(advance(s, t1), t2)` equals `advance(s, t2)`, given the same commands. This makes live play (many small steps) and return from absence (one large step) produce the same run.
- **Clock-free core.** `core/` never reads `Date.now`, `performance.now` or timers. The `clock` module in the shell converts real time into game time:
  - present: `performance.now()` deltas × game-speed factor, frozen while a pausing overlay is open (Clock States table);
  - away: `Date.now()` difference between leaving and returning, recorded as an absence input;
  - a negative real delta (system clock moved back) counts as zero.

**Time bases** (GDD M1):

| Quantity | Base | Rule |
|---|---|---|
| Economy step, message arrivals, staff throughput, event cadence, ticker, routine inference lines, spine beat gaps | Game time | Defined in game-ms (values quoted "per second" are at 1×); Game speed never changes them per game day |
| Message response windows | Real seconds × Timing | Converted to game-ms **once** at creation with the speed in force; never recomputed after a speed change (property test) |
| Backlog top-item window | Real seconds × Timing, measured in real time | The game clock is paused during the backlog queue, so `app/session` measures the window with a real timer; on lapse it dispatches `expireBacklogItem { messageId }` stamped with the frozen `atGameMs`, so the expiry is in the input log and replays exactly. Answering uses the normal `answerMessage`. |
| Toast duration, rolling-number and flash animations | Real time | Presentation only; outside the core |

### Randomness and Numerics (D2)

- **One stream per subsystem.** Each subsystem draws from its own stream, derived from `hash(runSeed, streamName)`. Stream names: `messages`, `deck`, `candidates`, `investors`, `outcomes`, `headlines`, `documents`, plus new names as needed. A stream name, once released, is never renamed.
- **Seed and Run ID.** The seed comes from `crypto.getRandomValues` in the shell. It is displayed as the Run ID in Crockford base32, incident-ID format (`7F3A-K2`).
- **Integer state.** No floats in persisted state:
  - money in integer **cents**;
  - percentages and Hype in integer **basis points** (100.00 → `10000`);
  - Alignment in integer **milli-points** (100 → `100000`), because GDD drift values such as −0.075 are not whole basis points.
  - Division rounds with one shared helper; there are no ad hoc `Math.round` calls.
- **Lint.** `Math.random`, `Date`, `performance` and timer globals are banned inside `core/`.

### State Management (D3)

- **State.** Plain, serialisable, immutable data: no classes, no methods, no `Map`/`Set` in persisted state.
- **Commands.** The UI never mutates state. It dispatches **commands**, a TypeScript discriminated union such as `{ type: 'answerMessage', messageId, answerId }`.
- **Core entry points** (two):
  - `applyCommand(state, command, atGameMs)`: validates, appends to the input log, returns the new state;
  - `advance(state, untilGameMs, mode)`: time progression (D1).
- **Layers.** `app` owns the live state, calls the two entry points and publishes the state through signals. Views read derived `computed` selectors. Components contain no game rules.
- **Replay.** `replay(start, inputLog)` folds the same two entry points (`replay(start, log)` = `replayFrom(newRun(start), log)`; snapshot + tail uses `replayFrom`). It is the same code, not a parallel implementation.

### Data Persistence (D4)

**Save system:** IndexedDB via `idb`.

- **Database.** Named `hitl`. All keys are prefixed `hitl:`. The game is deployed on a dedicated GitHub organization origin.
- **Save record:** `{ saveVersion, appVersion, contentPackVersion, seed, settingsLog, inputLog, snapshot, lastSeenWallClock }`.
- **Source of truth.** The input log is the source of truth and is **never compacted during a run**. The snapshot is a load-time cache.
- **Autosave.** Every game day, on `visibilitychange → hidden`, and on `pagehide`.
- **`navigator.storage.persist()`.** Requested after the first meaningful player action. If it is denied, a non-blocking export nudge is shown.
- **Single live tab.** Web Locks API (`navigator.locks.request('hitl:live', { ifAvailable: true })`). Other tabs show "Huddlr is open in another tab · Use here"; the hand-over is coordinated with `BroadcastChannel`.
- **Migrations.** A chain of pure functions `vN → vN+1`, each covered by fixture saves.
- **Bounded state.** Resolved (answered or expired) messages stay in state for a bounded window (`tuning.resolvedMessagesPerChannel`, ~200), then are dropped. Chronicle entries keep their own quotes, and the clue replay re-derives older data by replay (N5). Snapshots, saves and memory stay flat over multi-hour runs.
- **Run start parameters.** `newRun(start: RunStart)` with `RunStart = { seed, loopNumber, contentPackVersion, settings }` (one options object: `max-params` is 3). They are stored in the save, so replay never depends on the profile.

#### Meta-progression (profile)

- **Record.** `hitl:profile` in IndexedDB, outside any run: `loopCount`, `personalBest` (days plus timing/speed label), `lastCompanyName`, `lastFounderName`, and `archive`.
- **Archive.** One `ReportModel` per finished run (a few KB each). PNG and PDF are regenerated on demand by the D8 renderers.
- **Code.** Pure rules in `core/meta/` (next loop number, personal-best update); persistence through `profileRepository` in `platform/storage`.
- **Export.** The profile is part of the data-room export alongside the save. The opt-in stats export (E6) uses the D5 codec with prefix `HITL-STATS`.

#### Replay Consistency (mandatory)

**Invariant:** `replay(start, inputLog)` reproduces the saved state exactly.

**State fingerprint.** States are compared by fingerprint: canonical serialisation (sorted keys, integers only) hashed with SHA-256.

**Five levels of verification:**

1. **Property tests (fast-check, Node).** Random seeds, valid command sequences, random time jumps, and save/reload at random points. They assert:
   - live state ≡ full replay;
   - snapshot + log tail ≡ full replay;
   - chunk invariance.

   Shrunk counterexamples are committed as permanent regression tests.
2. **Golden runs.** Recorded full runs are stored with their expected fingerprint. Intentional balance changes update the goldens explicitly, and the diff is visible in the PR.
3. **Migration fixtures.** One save per past format version: migrate, replay, assert consistency.
4. **End-to-end (Playwright).** Play, save, close, simulate an absence, reopen; the fingerprint must equal the replay. The fingerprint is read through a debug hook present only in test builds.
5. **Runtime desync detector.** After a save loads, the log is replayed during idle time and compared with the snapshot. On mismatch **with the same app and content version**, the replay wins and a local, exportable diagnostic is recorded: seed, versions, first diverging input. On a version mismatch it never rewrites the run (see Version pinning).

#### Version pinning (per run)

Replay depends on the core code and the content pack, so a run is pinned to the version it started with.

- **Pinned version.** `newRun` records `appVersion` (build hash) and `contentPackVersion`. Whatever service worker is active, the page a player gets is the build of the run in progress; a new build is used only from the next `newRun` ("new version on next loop").
- **Mechanism (version routing, not activation timing).**
  - Every build precaches into its own cache, `hitl-<appVersion>`, and writes a small `version.json` that is **not** precached, so the app can detect a newer deploy.
  - The service worker installs and activates normally (`skipWaiting` + `clients.claim`), so the lifecycle is standard and testable. Its `fetch` handler routes requests for the app shell and hashed assets to the cache of the **pinned** `appVersion` read from `hitl:` IndexedDB while a run is in progress, and to the newest cache otherwise. Closing every tab or relaunching changes nothing: the run's own build keeps being served.
  - When `version.json` reports a newer build, the app shows the non-blocking notice "A new version will be used from your next loop."
  - **Applying it:** on the founding screen and on "Start Loop #N+1", if a newer build is cached, the page reloads into it **before** `foundCompany` / `newRun`, so the new run is always pinned to the new version (no race).
  - Old caches are deleted only when no save or archived run references their version.
  - E2e: deploy during a run → close every tab → relaunch → the run keeps its `appVersion`; then end the run → Start Loop #N+1 → the new run is pinned to the new version.
- **Fallback (cache evicted or a non-PWA load). If the pinned version is no longer available, the run continues on the current version as a new **replay segment**: the current snapshot becomes the replay base, tagged with the new versions. The desync detector and import verification replay only the current segment; the clue probe replays the current segment and marks earlier days as "not reconstructable" in the clue replay (a visible, honest gap). This is logged as `versionSegmentStarted`.
- **Golden runs** gate every change: a PR that changes a golden fingerprint changes simulation behaviour, which is exactly what pinning protects runs from.

### Export / Import Codec (D5)

- **One module, `codec`:** `encode(kind, version, data)` and `decode(text)`.
- **Format.** `<PREFIX><version>.<base64url(deflate(json))>.<checksum>`, where the checksum is a truncated SHA-256.
  - Prefixes: `HITL-SAVE` (MVP), `HITL-STATS` (opt-in stats export, MVP) and `HITL-RECAP` (reserved for the post-MVP QR page).
- **Checks.** `decode` verifies prefix, version, checksum and Zod schema, and fails with a typed error that the UI maps to a clear message.
- **Import replays the log.** The import is refused if the replay fingerprint does not match the embedded snapshot. This is stated honestly as integrity protection, not anti-cheat: a fabricated but valid log cannot be detected in an open-source single-player game.
- **Delivery.** The `.hitl` file download and the copy-to-clipboard code have the same content.

### Content Pipeline (D6)

- **Authoring.** One YAML file per content item under `content/` (`events/`, `characters/`, `templates/`, `headlines/`, `scripts/`; phase subfolders where relevant). English text is written inline. End-of-run document copy and its pools live under `content/templates/documents/` (`doc.winddown.*`, `doc.postmortem.*`, `doc.fate.*`). Where every text lives: narrative-design.md → Narrative Data Map.
- **Validation.** One Zod schema per content kind. It is the same schema used by the build plugin, the CI check and save import. JSON Schema is generated from Zod for editor autocompletion.
- **Authoring metadata.** Every content schema has a required `kernel` field (one sentence: the insider observation the item starts from), a required `status` (`placeholder` | `final`; only Tiziano sets `final`, epics.md D-E3) and an optional `translatorNote`. All are writer-facing: never shown, never translated, and **stripped from the compiled content pack**, so they never affect `contentPackVersion`. `npm run content:audit` reports placeholders per scope and fails with `--require-final`.
- **Tone.** Templates and events declare `tone`: `serious` | `wry` | `absurd` | `surreal`. `surreal` is valid only when the item's `phase` is Series A+ alone.
- **CI checks beyond the schema:** referential integrity (every `char.*`, `event.*` reference resolves), unique IDs, a forbidden-names list for tone rules, `kernel` present, and `tone` allowed for the declared phase.
- **Stable IDs.** IDs are stable strings (`event.seed.gpu-shortage`) and are never renamed once released, because saves reference them. ID ↔ path rules (CI-checked):

| Kind | ID pattern | Path |
|---|---|---|
| Template | `template.<channel>.<slug>` | `content/templates/<channel>/<slug>.yaml` |
| Infection pool | `template.infection.<surface>.<slug>` | `content/templates/infection/<surface>/<slug>.yaml` |
| Document copy / pools | `doc.winddown.<slug>`, `doc.postmortem.<slug>`, `doc.fate.<slug>` | `content/templates/documents/<slug>.yaml` |
| Event | `event.<phase>.<slug>` | `content/events/<phase>/<slug>.yaml` |
| Character | `char.<id>` (incl. `char.investor.<id>`) | `content/characters/<id>.yaml` |
| Vendor (sender) | `vendor.<id>` | `content/characters/vendors/<id>.yaml` |
| Trait | `trait.<id>` | `content/characters/traits/<id>.yaml` |
| Headline | `headline.<slug>` | `content/headlines/<slug>.yaml` |
| Script | `script.<name>`; its messages `msg.<name>.<slug>` | `content/scripts/<name>.yaml` |
| Inference line | `line.cascade.<slug>`, `line.signal.stage-N`, `line.signal.surpassed`, `line.routine.<slug>` | `content/scripts/lines/<slug>.yaml` |
| Word list | `wordlist.<name>` | `content/wordlists/<name>.yaml` |

`system` is a reserved sender with no file.
- **Tuning.** All GDD `[tuning]` values live in `content/tuning.yaml`, validated the same way. No tuning constants in code.
- **Build.** A Vite plugin compiles YAML into one JSON content pack. `contentPackVersion` is the hash of that compiled pack and is stored in every save.
- **Scaffolding.** `npm run content:new -- <kind> <id>` generates a skeleton file at the path matching the ID.

### Internationalisation (D7)

- **UI strings.** ICU MessageFormat catalogs per locale (`locales/<lang>/ui.json`; `locales/en/ui.json` is the source catalog), rendered by `intl-messageformat` behind a project `t()`. Key types are generated from the English catalog, so an unknown key does not compile. Numbers, currencies and dates use native `Intl`.
- **Content strings (gettext model).** English stays inline in the content YAML. Translations live in `locales/<lang>/content/*.yaml`, keyed by `<contentId>.<field path>`. The build splits mechanics (content pack) from text (per-locale catalogs). A missing translation falls back to English, and CI reports it as a warning.
- **UI copy status.** Voice-critical UI keys are listed in `locales/en/ui.status.json` as `{ key: { status: placeholder | final, scope } }`; `content:audit` reads it, and only Tiziano sets `final` (CODEOWNERS).
- **Fixed system copy is UI strings, not content.** The clue replay (`cluereplay.*`), the "While you were away" report (`away.*`) and the Auto-triage action (`autotriage.*`) are ICU strings in `locales/en/ui.json`, with no pools and no register variants.
- **Lint.** Literal user-facing strings in JSX are an error.
- **Formatting.** Every number shown to the player goes through `i18n/` formatters: `formatCents`, `formatCompactCents` (Stripe-style `$1.2M`), `formatPercentBp`, `formatGameDay`, `formatRealDuration`. No `toFixed` or `toLocaleString` in components.

#### Content Text Format

Content text uses **ICU MessageFormat** (same formatter as UI strings) plus three inline tokens:

| Token | Meaning | Rendered as |
|---|---|---|
| `@char.<id>` | Mention of a character | Mention chip; accessible name "mention: <name>" |
| `#<channel>` | Channel reference | Channel link |
| `` `text` `` | Code fragment (inference log) | Inline code |

- **Typed parameters.** Templates declare typed parameters (`money`, `count`, `percent`, `companyName`, `personName`…). The core generates the values; `i18n/` formatters render them. Generated parameters declare a range and step (`amount: { type: money, min: 2000, max: 8000, step: 100 }`, human units), drawn with the subsystem's stream when the item is instanced; a bare type (`amount: money`) uses the tuning default range for that type. **Built-in parameters** available to every text without declaration: `day`, `actor`, `answer`, `companyName`, `founder`, `aegisVersion`.
- **Build validation.** Unknown mentions, channels or undeclared parameters fail the build.
- **One renderer.** Text becomes a token list rendered by one component, `ui/patterns/RichText`, as Preact elements, **never as HTML**. No other component renders raw content text.

```yaml
id: template.customers.refund-hallucination
params:
  customer: companyName
  product: productName
  amount: money
text: >
  {customer} wants a {amount} refund, says {product} hallucinated their invoice.
  @char.dora can you look? cc #customers
```

### End-of-Run Documents (D8)

```
RunRecord ──▶ buildReportModel() ──▶ ReportModel ─┬─▶ renderPng()  Canvas 2D, 1080×1350
              (spoiler filter)                     └─▶ renderPdf()  PDFKit, tagged PDF/UA, A4/Letter
```

- **One spoiler filter.** `buildReportModel` is a pure function and the **only** place that decides what is spoiler-safe (no Alignment data). The post-MVP recap payload reuses it.
- **Receipt counters.** `RunRecord` carries the visible counters both documents print as their receipt, and `buildReportModel` exposes them (still no Alignment data):
  - `selfAnswered`, `staffAnswered`, `metisAnswered` (run totals; `metisAnswered` includes policy answers, Ask Metis, Auto-triage and policy-covered expiries);
  - `selfAnsweredLast90Days`, from a bounded per-game-day ring of 90 entries (no unbounded history);
  - `autoTriageRuns` (Auto-triage clicks), `nightsAwayWithPolicies` (absences simulated with at least one delegation policy active), `capabilityGrants`;
  - `peakHeadcount`, `lastBurnCents` (burn per game day on the last day).
- **Document copy.** Templates and pools come from `content/templates/documents/`; pool lines are drawn with a dedicated RNG stream (`documents`), so the document is reproducible from the run.
- **Shared tokens.** Both renderers share layout tokens (fonts, colours, spacing) with the UI theme.
- **PDF.** PDFKit with `tagged: true`, `subset: 'PDF/UA'`, `pdfVersion: '1.7'`, `lang`, `displayTitle`, and a full structure tree (`H`, `P`, `Table`, `Figure` with `alt`). Decorative content is marked as artifacts.
- **Loading.** The renderers, PDFKit and embeddable fonts are a separate lazy chunk, prefetched when the post-mortem approaches.
- **E8 spike** (first story): PDFKit standalone build in Vite, WOFF2 font embedding, veraPDF validation in CI.

### Background Tab and Notifications (D9)

- **Hidden tab.** While the tab is hidden, a ~60 s timer runs `advance(copy, now, 'away')` **incrementally from the previous preview** (valid by chunk invariance) on a throwaway copy. It derives the backlog count and blocking events, and updates `document.title` (`(4) Human in the Loop`, following the title corruption stages) and notifications.
- **The preview is never persisted.** On return, the real `advance` runs from the saved state, so a corrupted preview cannot reach a save.
- **Notifications.**
  - The tab-title counter works without notification permission.
  - Permission is requested in context (for example on the first delegation policy), never on load.
  - What is notified follows EXPERIENCE.md.
- **No push.** No push service and no server: nothing is delivered while the tab is closed.

### Accessibility Infrastructure (D10)

Three services in `ui/a11y/`:

- **Announcer.**
  - The single path to assistive technology: a polite and an assertive live region.
  - Queue with de-duplication and rate limiting; bursts are grouped ("5 new messages in #customers").
  - Hidden Alignment signals are **never** announced, by design.
- **Focus contract.**
  - The system never moves focus on its own.
  - Focus moves only on a player action; dialogs return focus to their invoker on close.
  - Enforced in `ui/primitives/`.
- **Shortcut registry.**
  - Every shortcut is data: key, Alt alternative, action, localised description.
  - Handlers, the shortcut overlay and documentation all derive from this single source.
  - Every shortcut action also has a pointer and touch path.

### Styling and Theming (D11)

- **Component styles.** CSS Modules per component; design tokens as CSS custom properties.
- **Layer order:** `@layer reset, tokens, primitives, patterns, features`. No `!important`.
- **Visual state.** Expressed as attributes on `<html>`, set only by the `theme` module: `data-theme`, `data-scheme`, `data-contrast`, `data-cvd`, `data-infection`, `data-phase`, `data-motion`, `data-surface` (Huddlr / LGTM Docs / AllGreen / Vanity skin), `data-text-size`, `data-font` (high-legibility font). Token files react to these attributes; components never know which theme, stage or surface is active.
- **Stylelint** (with `stylelint-declaration-strict-value`) forbids raw colours, spacing and font values in component CSS: only `var(--…)`.

### Testing Strategy (D12)

| Level | Tooling | Scope | Runs |
|---|---|---|---|
| Core unit | Vitest | Economy, triage, Alignment, deck, migrations | Node, every PR |
| Properties | fast-check | Chunk invariance, replay ≡ live, economy invariants | Node, every PR; high iteration count nightly |
| Golden runs | Vitest + fixtures | Fingerprints of recorded runs | Node, every PR |
| Content | Vitest + Zod | Schema, references, unique IDs, forbidden names | Node, every PR |
| UI components | Vitest + happy-dom + @testing-library/preact | Primitives and patterns: rendering, keyboard, ARIA roles; queries by role and text only | Node, every PR |
| End-to-end | @playwright/test | Cascade, triage, absence and return, export/import, second tab | Chromium on PRs; Chromium, Firefox, WebKit on `main` |
| Accessibility | @axe-core/playwright | WCAG 2.2 AA in every view and theme/contrast mode | Inside e2e |
| PDF | veraPDF | PDF/UA conformance | `main` |
| Performance | Playwright + CDP | 14-day return < 500 ms; long-session memory | Nightly |

**Rules:**

- Core tests never need a DOM.
- Shared test builders live in `tests/builders/` (`makeState()`, `makeMessage()`). No hand-built fixtures per file.
- No DOM snapshot tests.

### Repository Tooling (D13)

| Tool | Enforces |
|---|---|
| typescript-eslint (strict) | No `any`, no floating promises |
| eslint-plugin-boundaries | `core` imports nothing from other layers; `ui` reaches `core` only through `app`; features do not import each other |
| ESLint restricted globals and syntax | No clock or `Math.random` in `core/`; no literal UI strings in JSX; no `dangerouslySetInnerHTML` anywhere |
| @eslint-community/eslint-plugin-eslint-comments 4.8.x | Every lint suppression states its reason |
| ESLint complexity rules | Maximum function length, file length, cyclomatic complexity |
| ESLint `no-warning-comments` + commented-code rule | No orphan TODOs, no commented-out code |
| jscpd | Duplication threshold |
| knip | Dead code, unused exports, unused dependencies |
| Stylelint | Token-only CSS values |
| Prettier | Formatting |
| size-limit | Initial bundle budget (D14) |

**Workflow:**

- **Pre-commit:** lint-staged via simple-git-hooks (format and lint changed files only).
- **CI:** runs everything.
- **Community PRs:** the same checks, plus a PR template.

### Asset Loading (D14)

- **Main bundle:** core, app, UI, compiled content pack, English catalogs.
- **Lazy chunks:** other locales; end-of-run renderers with PDFKit and embeddable fonts; audio cues, fetched only when audio is enabled and played via Web Audio.
- **Fonts:** self-hosted WOFF2, used weights only, `font-display: swap`. No third-party font requests at runtime.
- **Offline.** vite-plugin-pwa precaches the main bundle, fonts and the active locale; lazy chunks are cached on first use.
- **Updates.** A new build is used only from the next run (D4 → Version pinning: per-version caches, version routing in the service worker, reload before `newRun`), with a non-blocking notice, never mid-run. The app build and content pack are part of determinism.
- **Bundle budget.** `size-limit` fails CI when the initial bundle exceeds its budget. Starting value: 150 KB gzip, adjusted after E1.

### Architecture Decision Records

**ADR-001: Discrete-event simulation with chunk invariance.**
- **Context:** the GDD requires identical outcomes for live play and absence, throttling immunity, and a 14-day return under 500 ms.
- **Decision:** one pure `advance()` over an event queue; chunk invariance as a tested invariant; clock handling outside the core.
- **Consequences:**
  - Tie-breaking and event ordering must be fully deterministic.
  - Every new mechanic must be expressible as scheduled events.

**ADR-002: Input log as source of truth.**
- **Context:** seed determinism, clue replay, reproducible bug reports, tamper detection on import.
- **Decision:** persist seed + full input log; snapshots are caches; replay consistency verified at five levels, including at runtime.
- **Consequences:**
  - Save size grows linearly with commands. This is acceptable: a few thousand per run.
  - Any non-determinism is a release-blocking bug.

**ADR-003: Tagged PDF via PDFKit.**
- **Context:** DESIGN.md requires an accessible PDF; mainstream browser PDF libraries do not tag.
- **Decision:** PDFKit with a PDF/UA structure tree, fed by the same `ReportModel` as the PNG.
- **Consequences:**
  - Two renderers to maintain over one model.
  - E8 starts with a spike and veraPDF in CI.

**ADR-004: Hidden-tab preview through the real simulation.**
- **Context:** the tab title and notifications must reflect absence without live simulation or duplicated logic.
- **Decision:** incremental `advance` on a throwaway copy every ~60 s.
- **Consequences:**
  - Small periodic CPU cost.
  - The title can never disagree with the actual return.

**ADR-005: Machine-enforced Code Quality Charter.**
- **Context:** 100% AI-agent implementation; the user requires no duplication and self-explanatory code.
- **Decision:** boundaries, duplication, dead code, complexity, token-only CSS and string externalisation enforced by lint and CI, plus a review checklist.
- **Consequences:**
  - More configuration up front.
  - Violations are caught where agents write code, not in human review.


## Cross-cutting Concerns

These patterns apply to ALL systems and must be followed by every implementation.

### Error Handling

**Strategy:** two kinds of errors, two mechanisms.

| Kind | Examples | Mechanism |
|---|---|---|
| **Expected** (part of the domain or platform) | Answering an expired message, import checksum mismatch, IndexedDB quota exceeded, notification permission denied | `Result<T, E>` with a typed error code; the caller must handle it |
| **Bug** (violated invariant) | Non-integer cash, dangling content reference, unordered event queue | Exception via `assertInvariant`; never caught inside `core/` |

**Rules:**

- **`Result` is ours.** `Result` is a ~10-line project type in `shared/result.ts`. No library.
- **One handler for bugs.** A single boundary handler in `app` catches bugs (including `window.onerror` and `unhandledrejection`):
  1. it stops the clock;
  2. it does **not** persist the failing state; the last good save stays;
  3. it shows the "Something broke. Your save is safe." panel with **Reload** and **Export diagnostic** (seed, versions, input log, log buffer, stack).
- **Previous state is intact.** Because the core never mutates in place, the previous state survives any bug.
- **Player-facing messages.** Every expected error code maps to a translated message (`errors.<area>.<code>`). Technical messages are never shown to players.

```ts
type CommandError = 'messageExpired' | 'messageNotFound' | 'insufficientCash';

function applyCommand(state: GameState, command: Command, atGameMs: number):
  Result<CoreStep, CommandError>

assertInvariant(Number.isInteger(state.cashCents), 'cash must be integer cents');
```

### Logging

**Format:** structured entries `{ atMs, level, module, event, data }`. `event` is a camelCase code, not prose.

**Destination:**
- an in-memory ring buffer (~500 entries), included in **Export diagnostic**;
- the console in development builds only.
- **Nothing ever leaves the browser** (no telemetry).

**Levels:**

| Level | Use | Production |
|---|---|---|
| `error` | Bug or failure the player notices | Buffered |
| `warn` | Handled anomaly (persist denied, low quota, desync detected) | Buffered |
| `info` | Lifecycle milestones (save loaded, migration applied, SW update found) | Buffered |
| `debug` | Diagnostic detail | Stripped from production build |

**Rules:**

- **Shell only.** `core/` never logs; what it does is described by domain events and reproducible by replay.
- **No raw console.** `no-console` lint outside the logger module.
- **Hot paths.** No logging in render or `advance`; only at boundaries.
- **No player free text in logs.**

```ts
const log = createLogger('persistence');

log.warn('persistDenied', { estimateQuotaMb: 120 });
log.error('saveFailed', { reason: error.name });
```

### Configuration

**Approach:** four kinds of configuration, one home each.

| Kind | Examples | Home | Affects the run |
|---|---|---|---|
| Game constants | Absence cap (14 days), phase list, RNG stream names | `core/constants.ts` (`as const`) | Yes (release-bound) |
| Tuning | Burn, arrival rates, Hype decay, response windows: every GDD `[tuning]` value | `content/tuning.yaml`, Zod-validated, part of `contentPackVersion` | Yes |
| Simulation settings | Timing, Game speed | IndexedDB; **every mid-run change is a command in the input log** | Yes |
| Presentation preferences | Theme, scheme, contrast, CVD, motion toggles, audio, ticker, locale, notifications | IndexedDB record `hitl:preferences`, outside the run | No |
| Build configuration | Base path, debug panel, test hooks | Vite `import.meta.env`, resolved at build | No |

**Rules:**

- **No remote configuration.**
- **No magic numbers.** `no-magic-numbers` is enabled in `core/`, with 0 and 1 allowed. A value is either a named constant or tuning.
- **Classify first.** A new setting is classified before it is written. The test: "would replay differ without this value?" If yes, it is a simulation setting.
- **One `settings` module** exposes preferences to the UI as signals. Nothing else reads IndexedDB directly.

```ts
dispatch({ type: 'changeGameSpeed', speed: 'half' });   // simulation setting → input log
preferences.motion.confetti.value = false;              // presentation only
```

### Event System

**Pattern:** typed domain events returned by the core, delivered by `app` to registered reactors.

- **Core.** `applyCommand` and `advance` return `{ state, events: DomainEvent[] }`. `DomainEvent` is a discriminated union, so events are data and replay regenerates them identically.
- **Delivery.** `app` delivers events **synchronously, in production order, after committing the state** to reactors registered in one place: announcer, audio, notifications and tab title, logger, visual effects.
- **Reactors never dispatch commands.** Effects flow from the core to the world, never in a loop.
- **Alignment is never a public event.** Hidden signals (infection stage, title corruption) are state read by `theme`, so no reactor can disclose them.
- **Components never emit domain events.** They dispatch commands or use local UI state.

**Naming:**
- events are past-tense camelCase facts (`messageExpired`, `phaseChanged`);
- commands are imperative camelCase (`answerMessage`, `setDelegationPolicy`).

```ts
type DomainEvent =
  | { type: 'messageArrived'; messageId: MessageId; channel: ChannelId; urgency: Urgency }
  | { type: 'messageExpired'; messageId: MessageId; outcome: 'default' | 'delegated' }
  | { type: 'phaseChanged'; from: Phase; to: Phase }
  | { type: 'heavyDecisionOpened'; decisionId: DecisionId }
  | { type: 'runEnded'; cause: DeathCause };

onDomainEvent('messageExpired', (event) =>
  announcer.polite(t('announce.messageExpired', { channel: event.channel })));
```

### Debug Tools

**Activation:**
- **Development and test builds only.** The debug panel is tree-shaken from production builds via `import.meta.env.DEV`. Production keeps only **Export diagnostic**.
- **Shortcut:** `Ctrl+Shift+D`.

**Available tools:**

| Tool | Purpose |
|---|---|
| State inspector | Full state including Alignment, plus current fingerprint |
| Time controls | +1 day, +1 hour, simulate an N-day absence, ×10 speed |
| Scenarios | Load named states (`garage-start`, `seed-first-policy`, `series-a-back-from-14-days`, `red-runway`…). **They are the test fixtures** (no second copy). Loadable in dev via `?scenario=<name>` so agents using Playwright MCP reach any state in one step. |
| Force content | Trigger an event or message by ID to check new content |
| Determinism check | Replay the log and compare fingerprints on demand |
| Log and events | Logger ring buffer and recent domain events |
| Visual switcher | Theme, contrast, CVD, infection stage, Red Runway |
| Performance HUD | FPS, queued events, last `advance` duration |

**Test hook:** `window.__hitl` exists only in test builds. It exposes a read-only fingerprint and state, plus scenario loading, for e2e (Replay Consistency level 4).

**Rule:** debug tools use only the core's public API (commands, `advance`, `replay`). They never edit state directly, so what debug shows is what the game does.


## Project Structure

### Organization Pattern

**Pattern:** layers at the top level, game domains inside each layer.

**Rationale:**
- Layer boundaries become path rules that eslint-plugin-boundaries checks mechanically.
- The pure simulation stays one block, testable in Node.
- Cross-domain systems (`advance`, deck, replay) have a natural home.

### Layers and Allowed Dependencies

```
ui ──▶ app ──▶ core ──▶ shared
        │
        └──▶ platform ──▶ shared
report (lazy) ──▶ core/report (model and types only)
debug (dev only) ──▶ app
i18n ──▶ shared          (importable by app and ui)
```

| Layer | Contains | May import |
|---|---|---|
| `core/` | Pure simulation, by game domain | `shared/` |
| `platform/` | Browser adapters | `shared/` |
| `app/` | Orchestration: session, signals, reactors, settings, error boundary | `core/`, `platform/`, `i18n/`, `shared/` |
| `ui/` | Presentation | `app/`, `i18n/`, `shared/`. **Never** `core/` or `platform/` |
| `report/` | Lazy PNG/PDF renderers | `core/report` model and types, `shared/` |
| `i18n/` | `t()`, Intl formatters, generated key types | `shared/` |
| `shared/` | Domain-agnostic pure types and helpers (`Result`, branded IDs) | nothing |
| `debug/` | Development panel (stripped from production) | `app/` |

**`shared/` admission rule:** used by at least two layers and knows nothing about the game. Domain knowledge belongs in `core/`.

### Directory Structure

```
human-in-the-loop/
├── src/
│   ├── main.tsx
│   ├── core/
│   │   ├── run/                 GameState, Command, DomainEvent, applyCommand, newRun,
│   │   │                        replay, fingerprint, invariants
│   │   ├── time/                event queue, advance, clock-state pause rules      (M1)
│   │   ├── rng/                 per-subsystem streams                              (D2)
│   │   ├── numerics/            divideRounded, the only rounding path               (D2)
│   │   ├── messages/            lifecycle, windows, expiry, template instancing    (M2)
│   │   ├── economy/             cash, burn, MRR, customers, Hype, compute          (M4)
│   │   ├── delegation/          policies, Ask Metis, Auto-triage, capacity, audit  (M4, M5)
│   │   ├── alignment/           drift, thresholds, signal stages                   (M7)
│   │   ├── staff/               hiring, traits, morale, assignment queue           (M9)
│   │   ├── investors/           rounds, phases, term sheets                        (M10)
│   │   ├── deck/                event deck: conditions, weights, cooldowns         (M12)
│   │   ├── decisions/           heavy decisions, outcomes, capability grants       (M6)
│   │   ├── absence/             away rules, backlog ranking, return-report content (M3)
│   │   ├── cascade/             unlocked regions                                   (M11)
│   │   ├── scripts/             timed script runner (cascade, Surpassed)           (N4)
│   │   ├── chronicle/           company timeline, headline selection               (M13)
│   │   ├── ending/              deaths, Surpassed, clue-replay analysis            (M8)
│   │   ├── report/              buildReportModel, ReportModel, recap payload shape (D8)
│   │   ├── content/             Zod schemas and types for content and tuning       (D6)
│   │   ├── save/                save schema, migrations vN→vN+1                    (D4)
│   │   ├── meta/                loop number, personal best, archive rules          (E6)
│   │   └── constants.ts
│   ├── platform/
│   │   ├── clock/               real time → game time                              (D1)
│   │   ├── storage/             idb; save and preference repositories              (D4)
│   │   ├── tabLock/             Web Locks + BroadcastChannel                       (D4)
│   │   ├── visibility/          visibilitychange, pagehide
│   │   ├── notifications/       Notification API, contextual permission            (D9)
│   │   ├── audio/               Web Audio, lazy cues                               (D14)
│   │   ├── codec/               encode/decode, deflate, checksum                   (D5)
│   │   ├── logger/              createLogger, ring buffer                          (C2)
│   │   └── serviceWorker/       registration, version-pinned update                (D14)
│   ├── app/
│   │   ├── session/             live state in signals, dispatch, present loop      (D3)
│   │   ├── selectors/           computed view selectors
│   │   ├── reactors/            announce, audio, notify, tabTitle, log, effects    (C4)
│   │   ├── backgroundPreview/   incremental hidden-tab preview                     (D9)
│   │   ├── settings/            preferences and simulation settings                (C3)
│   │   ├── errors/              bug boundary, Export diagnostic                    (C1)
│   │   └── replayCheck/         runtime desync detector                            (D4)
│   ├── ui/
│   │   ├── primitives/          Button, Dialog, Popover, RadioGroup, Switch, Tooltip,
│   │   │                        Toast, VisuallyHidden
│   │   ├── patterns/            MessageCard, SidebarRow, KpiTile, Chart, DataTable,
│   │   │                        OverlayDoc, Ticker, Stepper, AttentionList
│   │   ├── a11y/                announcer, focus contract, shortcut registry       (D10)
│   │   ├── theme/               theme module (data- attributes), tokens/*.css      (D11)
│   │   ├── layout/              GameBar, Sidebar, ChatPane, Rail, region gating
│   │   └── features/            founding, channel, metisDm, activity, timeline,
│   │                            automations, backlog, awayReport, heavyDecision,
│   │                            dashboardRail, surpassed, clueReplay, endOfRun,
│   │                            settings, shortcutOverlay
│   ├── report/
│   │   ├── layout/              layout tokens shared by both renderers
│   │   ├── png/                 Canvas 2D renderer
│   │   └── pdf/                 PDFKit renderer, PDF/UA structure tree
│   ├── i18n/                    t(), Intl formatters, generated key types          (D7)
│   ├── shared/                  Result, Brand, assertInvariant, sha256Hex
│   └── debug/                   dev panel, scenario loader                         (C5)
├── content/                     events/, characters/, templates/ (incl. documents/), headlines/,
│                                scripts/, tuning.yaml
├── locales/<lang>/              ui.json, content/*.yaml (en/ui.json is the source catalog)
├── assets/                      fonts (WOFF2), audio
├── public/                      favicon, PWA icons, robots.txt
├── tests/
│   ├── e2e/                     Playwright
│   ├── golden/                  recorded runs + expected fingerprints
│   ├── fixtures/                scenarios (shared with debug panel), past-version saves
│   └── builders/                makeState(), makeMessage()…
├── tools/                       content Vite plugin, content:new, JSON Schema generator,
│                                golden updater
├── docs/                        architecture, content guide, style guide, ADRs
├── .github/                     workflows (ci, deploy, nightly), PR and issue templates
├── index.html                   game entry (recap.html reserved for post-MVP)
├── AGENTS.md                    agent rules
├── CONTRIBUTING.md, README.md, LICENSE
└── package.json, tsconfig.json, vite.config.ts, vitest.config.ts, playwright.config.ts,
    eslint.config.js, stylelint.config.js, .prettierrc, knip.json, .jscpd.json, .size-limit.json
```

**Placement rules:**

- **Unit tests** are colocated (`burn.ts` + `burn.test.ts`). `tests/` holds only cross-module suites, fixtures and builders.
- **Surfaces are skins, not folders.** Huddlr, LGTM Docs, AllGreen and Vanity are visual skins (`data-surface`), not folders. `features/` follows the functional surfaces of EXPERIENCE.md.
- **Cascade is state.** `core/cascade` decides unlocked regions; `ui/layout` renders only unlocked regions. There is no cascade-specific UI code.
- **Features never import other features.** Anything needed by two features moves to `ui/patterns/` (second-occurrence rule).

### System Location Mapping

| System (Project Context) | Location | Responsibility |
|---|---|---|
| Time and clock states | `core/time`, `platform/clock` | Event queue and `advance`; real → game time conversion |
| Unified simulation step | `core/time`, `core/run` | `advance`, `applyCommand` |
| Absence and backlog | `core/absence` | Away rules, cap, stop conditions, backlog ranking |
| Seed determinism, replay | `core/rng`, `core/numerics`, `core/run`, `app/replayCheck` | Streams, rounding, replay, fingerprint, desync detection |
| Triage and message lifecycle | `core/messages`, `ui/features/channel`, `ui/patterns/MessageCard` | Windows, expiry, outcomes; message UI |
| Delegation, Ask Metis, Auto-triage, compute | `core/delegation`, `core/economy`, `ui/features/automations`, `ui/features/metisDm` | Policies, capacity, audit |
| Hidden Alignment | `core/alignment` | Drift and thresholds; never exposed as events |
| Signals and UI infection | `core/alignment` (stages), `ui/theme` (tokens) | Stage → `data-infection` → tokens |
| Staff | `core/staff` | Hiring, traits, morale, assignment queue |
| Investors and phases | `core/investors`, `ui/features/heavyDecision` | Rounds, term sheets |
| Event deck | `core/deck`, `content/events` | Conditions, weights, cooldowns |
| Heavy decisions | `core/decisions`, `ui/features/heavyDecision` | Outcomes, capability grants |
| Cascade onboarding | `core/cascade`, `ui/layout` | Script and region gating |
| Chronicle and ticker | `core/chronicle`, `ui/features/timeline`, `ui/patterns/Ticker` | Timeline, headline selection |
| Deaths, Surpassed, clue replay | `core/ending`, `ui/features/surpassed`, `ui/features/clueReplay` | End detection, curve and top-5 drift analysis |
| End-of-run documents | `core/report`, `report/`, `ui/features/endOfRun` | Spoiler-safe model, PNG/PDF renderers |
| Persistence | `platform/storage`, `platform/tabLock`, `core/save` | IDB, lock, migrations |
| Export/import | `platform/codec`, `core/save` | Codec; schema and replay verification |
| Content pipeline | `content/`, `core/content`, `tools/` | YAML, schemas, build plugin |
| i18n | `i18n/`, `locales/` | `t()`, catalogs |
| Notifications and tab title | `app/reactors`, `app/backgroundPreview`, `platform/notifications` | Counter, preview, permission |
| Accessibility layer | `ui/a11y`, `ui/primitives` | Announcer, focus, shortcuts |
| Theming | `ui/theme` | Attributes and tokens |
| Audio | `platform/audio`, `app/reactors` | Cues on domain events |
| Offline / PWA | `platform/serviceWorker`, `vite.config.ts` | Precache, version-pinned update (D4) |
| Error handling, logging | `app/errors`, `platform/logger` | Boundary, diagnostic, ring buffer |
| Settings | `app/settings`, `ui/features/settings` | Preferences and simulation settings |
| Debug tools | `debug/`, `tests/fixtures` | Dev panel, scenarios |
| Meta-progression (Loop #N, personal best, archive) | `core/meta`, `platform/storage` (`profileRepository`) | Loop counter, best, archived `ReportModel`s |
| Content text rendering | `ui/patterns/RichText`, `i18n/` | ICU + inline tokens, never HTML |

### Naming Conventions

#### Files

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase; CSS module and test alongside | `MessageCard.tsx`, `MessageCard.module.css`, `MessageCard.test.tsx` |
| Other TS modules | camelCase, named after the main export | `advance.ts`, `buildReportModel.ts` |
| Folders | camelCase | `metisDm/`, `tabLock/` |
| Content files | kebab-case | `content/events/seed/gpu-shortage.yaml` |
| Content IDs | Per kind, matching the path (D6 → ID ↔ path table; CI-checked) | `event.seed.gpu-shortage` |

#### Code Elements

| Element | Convention | Example |
|---|---|---|
| Types | PascalCase, no `I` prefix | `GameState`, `ReportModel` |
| Branded IDs | `<Thing>Id` | `MessageId`, `CharacterId` |
| Functions | camelCase, verb first | `applyCommand`, `rankBacklog` |
| Booleans | `is` / `has` / `can` | `isExpired`, `hasActivePolicy` |
| Numbers with units | **unit suffix required**: `Cents`, `Bp`, `Milli`, `GameMs`, `RealMs`, `Days` | `cashCents`, `hypeBp`, `alignmentMilli`, `expiresAtGameMs` |
| True constants | UPPER_SNAKE | `ABSENCE_CAP_DAYS` |
| `as const` objects | camelCase | `rngStreams` |
| Commands / domain events | imperative / past tense, camelCase | `answerMessage` / `messageExpired` |
| i18n keys | `area.camelCase` | `inbox.unreadCount` |
| CSS Module classes | camelCase; state via `data-` attributes, not modifier classes | `.card[data-urgency="urgent"]` |
| CSS custom properties | kebab-case by category | `--color-surface`, `--space-2` |
| Storage keys | `hitl:` prefix | `hitl:preferences` |

#### General Rules

- **GDD vocabulary.** Identifiers use the GDD glossary verbatim; no synonyms.
- **Abbreviations.** Only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi`.
- **Exports.** Named exports only; no `export default` (lint-enforced).
- **Test names** state behaviour as a sentence: `it('stops at the first heavy decision during an absence')`.

#### Game Assets

| Asset | Convention | Example |
|---|---|---|
| Fonts | `assets/fonts/<family>-<weight>.woff2` | `inter-500.woff2` |
| Audio cues | `assets/audio/<cue-name>.<ext>`, cue names matching the GDD audio list | `message-urgent.ogg` |

### Architectural Boundaries

Enforced by eslint-plugin-boundaries and CI; a violation fails the build.

1. **Layer dependencies** are only those in the table above. `ui` never imports `core` or `platform`.
2. **Public API.** Every module exposes its public API through `index.ts`. Deep imports across modules are forbidden; anything not exported from `index.ts` is private.
3. **Purity of `core/`.**
   - It imports only `shared/`.
   - No DOM, no Preact, no signals, no clocks, no `Math.random`, no I/O.
4. **Features are isolated.** `ui/features/*` never import each other; shared UI goes to `ui/patterns/` or `ui/primitives/`.
5. **Accessibility primitives.** Dialogs, popovers, radio groups, switches and tooltips exist only in `ui/primitives/`.
6. **Debug and test hooks** (`debug/`, `window.__hitl`) never ship in production builds.
7. **Content is data.** `content/` contains no executable code; it reaches the game only through the build plugin and the Zod schemas.


## Implementation Patterns

These patterns ensure consistent implementation across all AI agents.

### Novel Patterns

#### N1 — Signal Pipeline

**Purpose:** turn hidden Alignment into silent, irreversible, mutually consistent signals (GDD M7) without duplicating threshold logic or leaking the number.

**Components:**

- `signalStage` (0–5) in core state: 0 = none, 1 = 75, 2 = 50, 3 = 25, 4 = 10, 5 = Surpassed. Written only by `core/alignment`; it never decreases.
- **Signal table** (`core/alignment/signals.ts`): one row per stage with `titleStage`, `infectionLevel`, `metisRegister`, `doraRegister`. A new signal is a new column, not new threshold logic.
- **Registers** (narrative-design.md → Dialogue Framework): `metisRegister` = `advisor` | `partner` | `owner` | `steward` | `custodian`; `doraRegister` = `warm` | `polished` | `corporate`.
- **Tone and Dora** are content: a template's `text` is either a string or a map keyed by register. The register kind is inferred from `sender` (`char.metis` → `metisRegister`, `char.dora` → `doraRegister`). The core picks the variant **when it creates the message**, so a message never changes text after it arrives. A missing register falls back to the nearest earlier one; CI requires the stage-0 key (`advisor` / `warm`) in every map, so the fallback always resolves.
- **Inference log** is core state. At each stage crossing, the core appends the odd line (`line.signal.stage-1` … `line.signal.stage-4`, in `content/scripts/`) as an ordinary log entry of the same kind, so the UI cannot tell it apart. `line.signal.surpassed` is appended by the Surpassed script (N4); the cascade lines stay `line.cascade.*`.

**Data flow:**

```
applyDrift → alignmentMilli (ceiling) → signalStage ─┬─▶ titleStage → GameBar, tab title
                                                     ├─▶ infectionLevel → data-infection → tokens
                                                     ├─▶ metisRegister / doraRegister → message text variant (core)
                                                     └─▶ odd inference-log line (core)
```

**Rules:**

- The UI reads derived signals only. The hidden-state boundary has two parts (eslint-plugin-boundaries + restricted-syntax):
  - **inside `core/`**, only `core/alignment`, `core/staff` (Researcher readings), `core/ending` (clue probe), `core/save` and `core/run` (fingerprint, replay) may reference `alignmentMilli`;
  - **outside `core/`**, only `app/selectors/hiddenState.ts` reads it, and only `ui/features/clueReplay` and `debug/` may import that file.
- Crossing several thresholds in one `advance` (absence): the stage jumps, one odd line per threshold is appended in order (spaced by the spine beat queue below), and the away report does not mention it.
- Recovery (audit, passive) never lowers the stage.

**Spine beat queue (breathing room, narrative-design.md → Tension Curve).** A threshold crossing has two parts:

- **Signal state** (`signalStage` and every column of the signal table: title, infection, registers) updates **immediately and silently** at the crossing, as above. The stage stays the single truth for register selection, title and infection, and the clue replay timestamps.
- **Beat content** (the odd inference-log line and any spine message the stage posts) is scheduled as a `spineBeat` event in the D1 queue at `max(crossingGameMs, roundCooldownEndGameMs, lastSpineBeatGameMs + minGap)`:
  - no beat fires during the cooldown window after a funding round closes (Seed, Series A and every later round); the beats of thresholds crossed in the window wait for its end;
  - beats fire one at a time, in threshold order, at least `minGap` apart; several crossings in one `advance` (absence) produce several queued beats, never a stack;
  - queued beats are ordinary queue events, so they survive save/reload and keep chunk invariance;
  - the cascade (N4) and the Surpassed sequence are scripts, not queued beats; beats still pending when Surpassed starts are dropped.
- Tuning (`content/tuning.yaml`): `spineBeatRoundCooldownDays: 5`, `spineBeatMinGapDays: 3` [tuning].
- The cooldown holds back beat content only. Visible signal state (title, infection, registers) is never delayed: the signals stay silent, so they need no breathing room.
- A round that closes after a beat was scheduled pushes that beat to the end of the new cooldown (the queue re-schedules pending beats when a round closes).
- A spine message whose channel is not unlocked when the beat fires posts in #general.

```ts
const signalTable = [
  { titleStage: 0, infectionLevel: 0, metisRegister: 'advisor',   doraRegister: 'warm' },      // > 75
  { titleStage: 1, infectionLevel: 1, metisRegister: 'partner',   doraRegister: 'warm' },      // 75
  { titleStage: 2, infectionLevel: 2, metisRegister: 'owner',     doraRegister: 'polished' },  // 50
  { titleStage: 3, infectionLevel: 3, metisRegister: 'steward',   doraRegister: 'corporate' }, // 25
  { titleStage: 3, infectionLevel: 4, metisRegister: 'custodian', doraRegister: 'corporate' }, // 10
  { titleStage: 4, infectionLevel: 4, metisRegister: 'custodian', doraRegister: 'corporate' }, // Surpassed
] as const;

export const titleStage = computed(() => signalsFor(session.state.value.signalStage).titleStage);
```

#### N2 — Region Gating

**Purpose:** let the UI be born element by element (cascade, M11) and widen per phase (M10) without visibility conditions scattered across components.

**Components:**

- **`RegionId`** (`core/cascade/regions.ts`): the single, canonical list of everything that can appear. Content, scripts and stories use these IDs only:
  - Garage cascade: `cash`, `deployButton`, `mrr`, `customers`, `chat`, `channel.customers`, `sidebar`, `channel.general`, `header`, `ticker`, `runway`, `channel.product`, `dm.metis`, `policyToggle`, `headcount`, `inferenceLog`, `chart`, `activity`;
  - later: `timeline` (E4 chronicle), `attentionList` (first fire), `automations`, `backlog`, `hype`, `rail.team`, `rail.infrastructure`, `rail.growth`, `channel.hiring`, `channel.marketing`, `channel.engineering`, `channel.investors`, `channel.finance`, `channel.ops`, `channel.legal`.
- **`unlockedRegions`** in core state. A region is unlocked by a cascade beat (N4), a phase transition, or a first-occurrence trigger owned by exactly one story; a region never re-locks during a run. Owners of non-cascade regions: `timeline` (4.4: core rule, not a script action — the first chronicle entry unlocks it, but while the cascade script is running the unlock is deferred to the script's end), `attentionList` (4.14: first fire), `automations` (3.1: the first time a policy switch is turned on), `backlog` (3.6: first non-empty backlog), phase channels and rail sections (4.11).
- **Locked channels.** Templates and event steps are drawn only for unlocked channels (spine messages fall back to #general, N1).
- **`<Region id>`** (`ui/layout`):
  - renders nothing while locked (no CSS hiding, nothing in the DOM);
  - sets `data-born` on first appearance for the ~1 s highlight (motion permitting);
  - never moves focus.
- **Shortcuts.** Registry entries may declare a `region`; while it is locked, the shortcut does not exist and is absent from the `?` overlay.

**Rules:**

- `<Region>` is the only visibility gate. `if (phase === …)` in `ui/` is a review failure.
- The Surpassed lockdown uses a separate `lockedControls` state driven by N4; regions do not re-lock.

```tsx
<Rail>
  <Region id="cash"><KpiTile kpi="cash" /></Region>
  <Region id="rail.team"><TeamPanel /></Region>
  <Region id="inferenceLog"><InferenceLog /></Region>
</Rail>
```

#### N3 — Declarative Conditions and Effects

**Purpose:** contributors declare when content appears and what answers do, as data, evaluated in one place.

**Components:**

- `core/content/conditions.ts`: Zod schema plus `evaluateConditions(conditions, context)`.
- `core/content/effects.ts`: Zod schema plus `applyEffects(state, effects)`.
- `ConditionContext`: a read-only projection of the state, built once per draw.

**Rules:**

1. **Closed vocabulary.** Every predicate and effect has a schema and a case in an exhaustive `switch`. A new kind needs its schema, implementation and test in the same PR.
2. **No expression strings.**
3. **Limited nesting.** `any` / `not` nest at most two levels deep; beyond that, write a named predicate.
4. **Human units in YAML** (dollars, percent, points). The build converts them to cents, basis points and milli-points, and rejects values that are not exactly representable.
5. **Content sees `signalStage` only**, never `alignmentMilli`.
6. **No direct Alignment effects.** Drift comes from `stakes` and who answered (M7). The single exception is `alignmentGrant`, allowed only in `heavy` events (CI-checked).
7. **Parameter-valued effects.** An effect may take a typed parameter instead of a literal: `cash: { param: legalCost }` (sign from the parameter, or `negate: true`). Expressions are still forbidden.

**Vocabulary and owners** (the story that ships each term adds its schema, implementation and test):

| Term | Kind | Owner story |
|---|---|---|
| `phase`, `cash`, `gameDay`, `eventSeen`, `signalStage`, `any`, `not` | condition | 2.2 |
| `cash`, `mrr`, `customers`, `hype`, `chronicle`, `unlockRegion`, `postMessage`, `inferenceLine` | effect / action | 2.2 |
| `computeUsage`, `mrr`, `customers`, `hype`, `headcount` | condition | 4.2 |
| `morale`, `throughput`, `gpuUnits`, `askMetis`, `alignmentGrant` | effect | 4.2 |
| `enterpriseCustomer` | effect | 4.6 |
| `closeRound` | effect (phase change, region unlocks) | 4.11 |
| `hasStaffWithTrait` | condition | 4.7 |
| `investorArchetype`, `roundsClosed` | condition | 4.12 |
| `lockControl`, `setTitleFinal` | script action | 5.10 |

Semantics: `throughput: { factor: 0.9, days: 7 }` multiplies staff throughput for that many game days (no-op without staff); `askMetis: true` makes Metis answer the next step, counting as an AI decision (drift, Compute, `metisAnswered`) — if Metis is at capacity or paused for audit, that step is not auto-answered and waits for the player like any message; runway is never an effect target (use `cash`). Inside events, the `chronicle` effect is not allowed: an event writes exactly one chronicle line, its `chronicle` field, when the chain ends.

**Heavy-decision block.** An event with `heavy: true` presents its first step as a document, not a chat message. The `decision:` block counts as the event's first step (2–5 steps in total); answers' `next` continues into `steps:`.

```yaml
decision:
  surface: lgtm | allgreen
  title: "<ICU>"
  summary: "<ICU>"
  rows: ["<ICU>", ...]                 # plain list rows (reward stated in numbers)
  status: { initial: investigating, success: resolved, failure: degraded }   # allgreen only
  answers:
    - id: <answer-id>
      label: "<≤ 4 words>"
      successChance: 70%               # omit for deterministic answers
      outcomes:
        success: { text: "<ICU>", effects: [ ... ] }
        failure: { text: "<ICU>", effects: [ ... ] }   # default: reward withheld, downside doubled
      next: { step: <step-id>, delay: <game days> }
```

```yaml
conditions:
  - phase: seed
  - cash: { min: 50000 }
  - computeUsage: { min: 70 }
  - signalStage: { max: 2 }
  - eventSeen: event.garage.first-hire
  - any:
      - hasStaffWithTrait: notion-architect
      - investorArchetype: family-office
  - not: { eventSeen: event.seed.press-leak }
answers:
  - id: rent
    effects:
      - cash: -15000
      - hype: +2
      - chronicle: true
```

**Event step schema.** An event is a chain of 2–5 steps (GDD M12). N3 conditions gate the whole event; effects live on step answers. Format and editorial criteria: narrative-design.md → Content Formats.

```yaml
id: event.<phase>.<slug>
kernel: "<one-sentence insider observation>"      # required, stripped from the pack (D6)
phase: <garage|seed|series-a>
tone: <serious|wry|absurd|surreal>
heavy: false                                      # true: heavy decision; only then may effects use alignmentGrant
repeatable: false
weight: 10
cooldown: 15                                      # game days
conditions: [ ... ]                               # N3 vocabulary
steps:
  - id: <step-id>
    channel: <channel>
    sender: <char.id | vendor.id | system>
    text: "<ICU text>"                            # string or register-keyed map (N1)
    answers:
      - id: <answer-id>
        label: "<≤ 4 words>"
        effects: [ ... ]                          # N3 vocabulary
        next: { step: <step-id>, delay: <game days> }   # omit to end the chain
chronicle: "<ICU line, readable out of context>"  # written when the chain ends
```

- The first step fires when the event is drawn. `next` schedules the target step as a D1 queue event after `delay` game days, so pending steps are saved and replayed like any other event.
- CI checks: step IDs unique within the event; every `next.step` resolves; no cycles; 2–5 steps; `chronicle` present.

#### N4 — Timed Scripts

**Purpose:** hand-authored sequences (cascade, compressed cascade from Loop #2, Surpassed sequence) that stay deterministic, savable mid-way and throttling-immune.

**Components:**

- **Scripts are content** in `content/scripts/*.yaml`. They use the N3 action vocabulary (`unlockRegion`, `postMessage`, `inferenceLine`, `lockControl`, `setTitleFinal`…).
- **Runner** (`core/scripts/`): schedules each ready beat into the D1 event queue, where `advance` executes it.
- **Beat types:**
  - `at`: nominal game time from the anchor (the cascade anchors on `deploy`);
  - `waitFor`: a ⏸ beat; when that message is answered or expires, every later beat shifts by the time taken past the beat's nominal time.
- **Script state in the save:** `{ scriptId, nextBeat, anchorGameMs }`.
- **Compression and per-loop variants** (`compression`, `fromLoop2`) are script data, not code branches.
- **`advance` mode `ending`.** Used for the Surpassed sequence: economy, messages and timers are frozen; only script events run.

```yaml
id: script.cascade
compressedFromLoop: 2
compression: 0.2
anchor: { command: deploy }          # founding and the $12,400 screen are UI states, not beats
beats:
  - at: "0:20"                        # game time after Deploy
    do: [{ unlockRegion: mrr }, { postMessage: msg.cascade.first-customer }]
  - at: "1:20"
    do: [{ unlockRegion: chat }, { postMessage: msg.cascade.acme-question }]
    waitFor: msg.cascade.acme-question # ⏸: later beats re-anchor on its resolution
  - at: "7:50"
    do: [{ unlockRegion: inferenceLog }, { inferenceLine: line.cascade.who-is-in-the-loop }]
    fromLoop2: [{ unlockRegion: inferenceLog }, { inferenceLine: line.cascade.hello-again }]
# nominal offsets = EXPERIENCE.md table time − 0:10 (Deploy happens at 0:10)
```

#### N5 — Clue Replay Probes

**Purpose:** reconstruct the Alignment curve, the top-5 drift causes and the counterfactual (M8) without recording anything during play.

**Components:**

- **`replay(seed, inputLog, { probe })`.** `probe` is a pure reducer over read-only steps (`before`, `after`, `cause`). A test asserts that the final fingerprint is identical with and without a probe.
- **`core/ending/clueProbe.ts`.**
  - It samples `alignmentMilli` and implied valuation (from ARR and Hype) once per game day.
  - It groups drift by cause: one player command (capability grant), one auto-triage click (batch), one absence with active policies (delegated night).
  - The top 5 causes are quoted with their original message text.
- **Counterfactual: analytic estimate,** exactly the GDD formula (Economy and Resources → Clue-replay counterfactual): staff-days = Σ Metis-handled messages × 30 s ÷ one game day; cost = staff-days × phase salary/day × headcount^0.2 at that moment; shown in $ and runway days, always as "would have cost about …". Parameters live in `content/tuning.yaml`.
- **`app/simulationWorker`.** A module Web Worker running pure core code. It is shared by the clue probe, the runtime desync detector (D4 level 5) and import verification (D5). The clue probe starts when the Surpassed sequence begins.

```
seed + inputLog ──▶ replay(…, { probe: clueProbe }) ──▶ ProbeResult ──▶ buildClueReplay() ──▶ ui/features/clueReplay
                     (in simulationWorker)
```

### Communication Patterns

**Pattern:** commands in, signals and domain events out.

| Direction | Mechanism | Never |
|---|---|---|
| UI → game | `dispatch(command)` | Mutating state, calling the core directly |
| Game → UI | Signals and `computed` selectors | Components subscribing to domain events |
| Game → world (audio, announcer, notifications) | Domain events → reactors | Reactors dispatching commands |
| Component → component | Props; shared UI state as a signal in `app` | Event buses, ad hoc global contexts |
| UI services | Direct import from `ui/a11y` public API | Local re-implementations |

No service locator and no DI container. Dependencies are explicit function parameters (content index, RNG stream).

```tsx
function AnswerButton({ messageId, answer }: AnswerButtonProps) {
  return (
    <Button onClick={() => dispatch({ type: 'answerMessage', messageId, answerId: answer.id })}>
      {answer.label}
    </Button>
  );
}
```

### Entity Patterns

**Creation:** pure factories per domain, each taking its own RNG stream; instance IDs come from a deterministic counter in state.

```ts
createMessage(template: MessageTemplate, context: CreationContext, rng: RngStream): Message
// id: 'msg-000417' (counter), never a random UUID
```

**Tests** create entities through `tests/builders/` (`makeMessage({ urgency: 'urgent' })`), which call the same factories with defaults.

### State Patterns

**Pattern:** a discriminated union per lifecycle, with explicit transition functions.

- Applies to: message, candidate (`offered → hired → leaving → gone`), heavy decision (`open → resolved`), investment round, run (`founding → cascade → playing → ending → ended`).
- Invalid transitions do not compile, or return a typed error (C1).
- No parallel booleans (`isAnswered`, `isExpired`).

```ts
type Message =
  | { status: 'waiting';  id: MessageId; expiresAtGameMs: number }
  | { status: 'assigned'; id: MessageId; staffId: StaffId }
  | { status: 'answered'; id: MessageId; answerId: AnswerId; by: 'player' | 'metis' | 'staff' }
  | { status: 'expired';  id: MessageId; outcome: 'default' | 'delegated' };

function answerMessage(message: WaitingMessage, answerId: AnswerId, by: Responder): AnsweredMessage
```

### Data Patterns

**Access:**

- **Content.** A read-only `ContentIndex` is built once from the content pack and passed into the core. Typed lookups: `content.event(id)`, `content.templatesFor(channel, phase)`.
- **State.** The core reads the state it receives; the UI reads selectors only.
- **Persistence.** Only `platform/storage` repositories (`saveRepository`, `preferencesRepository`, `profileRepository`) touch IndexedDB.

```ts
const templates = content.templatesFor(channel, state.phase);
const template = pickWeighted(templates, rng);
```

### Code Quality Charter

Mandatory for every change. Lint and CI enforce what they can; the review checklist covers the rest.

#### 1. Reuse before create

Before adding a component, hook or helper, search `ui/primitives/`, `ui/patterns/`, the module's `index.ts`, and `shared/`. When the same concept appears a **second** time, extract it, if the two cases really are the same concept. Similar-looking code that models different things stays separate.

```tsx
// ✗ two near-identical cards in two features
function CustomerMessage(…) { return <article class={styles.card}>…</article>; }
function InvestorMessage(…) { return <article class={styles.card}>…</article>; }

// ✓ one pattern, variants as data
<MessageCard message={message} />            // ui/patterns/MessageCard
```

#### 2. Variants are data, not copies

```tsx
// ✗
<LgtmButton /> <AllGreenButton /> <HuddlrButton />

// ✓ skin chosen by tokens and attributes
<section data-surface="lgtm"><Button>Sign term sheet</Button></section>
```

#### 3. Names replace comments

```ts
// ✗
// check if the message has expired
if (m.e < t) { … }

// ✓
if (isExpired(message, nowGameMs)) { … }
```

#### 4. Comments explain why, never what

```ts
// ✓ a non-obvious reason, with its source
// Ceiling rule (GDD M7): recovery never exceeds the last crossed threshold.
const recoveredMilli = Math.min(candidateMilli, ceilingMilli);

// ✗ narration, restated signatures, banners, commented-out code, TODOs
// Now we loop through all messages to find the expired ones
/** @param state the state @returns the new state */
// ===== HELPERS =====
// const old = legacyRank(backlog);
// TODO: handle edge case
```

Open an issue instead of writing a TODO. Lint suppressions (`// eslint-disable-next-line`) must state their reason (`@eslint-community/eslint-plugin-eslint-comments` `require-description`).

#### 5. Functions and composition, no class hierarchies

```ts
// ✗
abstract class BaseManager<T> { abstract update(dt: number): void }
class MessageManager extends BaseManager<Message> { … }

// ✓
export function expireDueMessages(messages: readonly Message[], nowGameMs: number): ExpiryResult
```

#### 6. Units in names, integers in state

```ts
// ✗
const cash = 12400;
const drift = -0.05;

// ✓
const cashCents = 1_240_000;
const driftMilli = -50;
```

#### 7. Immutable, readonly data

State types are `readonly`. Updates return new objects; no in-place mutation, no `push` on state arrays.

#### 8. No speculative generality

- No unused parameters, options or "future" extension points (knip and review).
- No pass-through wrappers that only call another function.
- No generic names: `utils.ts`, `helpers.ts`, `manager`, `handleData`, `processItems`.

#### 9. No defensive noise

Types already guarantee shape. Do not re-check what the compiler proves, and do not swallow errors.

```ts
// ✗
try { save(); } catch {}
if (message && message.id && typeof message.id === 'string') { … }

// ✓ expected failures are Results; bugs throw (C1)
const result = await saveRepository.write(record);
if (!result.ok) return showSaveFailed(result.error);
```

#### 10. Components are thin

Components render and dispatch. Derivations live in selectors, rules in the core. No literal user-facing strings (`t()` only).

#### Limits (lint-enforced)

| Metric | Limit |
|---|---|
| Function length | 40 lines |
| File length | 300 lines |
| Cyclomatic complexity | 10 |
| Parameters | 3 (use an options object beyond that) |
| Nesting depth | 3 |
| Nested ternaries | none |
| `any`, non-null `!`, `@ts-ignore` | none (`@ts-expect-error` with reason only in tests) |

#### Agent Review Checklist (before closing a story)

- [ ] I searched for an existing primitive, pattern or helper before creating one.
- [ ] No duplicated logic. Second occurrences are extracted where the concept is the same.
- [ ] Names use the GDD glossary, carry units, and need no comment.
- [ ] Every comment states a *why* that the code cannot.
- [ ] Core code is pure: no clocks, no `Math.random`, no I/O.
- [ ] New content kinds or predicates have schema, implementation and test.
- [ ] Tests describe behaviour and use the shared builders.
- [ ] Lint, jscpd, knip, Stylelint, size-limit and tests pass.

### Consistency Rules

| Pattern | Convention | Enforcement |
|---|---|---|
| Layer boundaries | Dependency table (Project Structure) | eslint-plugin-boundaries |
| Public API | Import modules via `index.ts` only | eslint-plugin-boundaries |
| Core purity | No DOM, Preact, signals, clocks, `Math.random`, I/O | ESLint restricted imports and globals |
| Hidden state | `alignmentMilli`: inside `core/` only in alignment, staff, ending, save, run; outside only via `hiddenState.ts` | eslint-plugin-boundaries |
| Visibility gating | `<Region>` only | Review checklist |
| Commands / events | Imperative / past tense, discriminated unions | TypeScript |
| Lifecycles | Discriminated unions + transition functions | TypeScript, review |
| Entity IDs | Deterministic counters | Replay consistency tests |
| Integer units | `Cents`, `Bp`, `Milli`, `GameMs`, `RealMs`, `Days` suffixes | Review, property tests |
| Content | Closed vocabulary, human units, stable IDs | Zod, content CI |
| Strings | `t()` only, typed keys | TypeScript, ESLint |
| Content text | ICU + `@char` / `#channel` / `` `code` `` tokens via `RichText`; never HTML | Content build, ESLint |
| Number display | `i18n/` formatters only | Review |
| CSS | Tokens only; state via `data-` | Stylelint |
| Duplication | Second-occurrence extraction | jscpd |
| Dead code | None | knip |
| Exports | Named only | ESLint |
| Errors | `Result` for expected, throw for bugs | Review, TypeScript |
| Logging | `createLogger` only | ESLint `no-console` |


## Architecture Validation

### Validation Summary

| Check | Result | Notes |
|---|---|---|
| Decision Compatibility | Pass | No conflicting decisions. Text inconsistencies from later decisions fixed (Alignment milli-points, translation paths, `advance` modes, tab-title example, theme attributes). |
| GDD Coverage | Pass | 25/25 core systems plus meta-progression mapped to locations. All technical requirements addressed (performance, persistence, determinism, accessibility, localisation, offline, QR door). |
| Pattern Completeness | Pass | Entity creation, communication, state, errors, data access, events, formatting, content text. Plus 5 novel patterns. |
| Epic Mapping | Pass | E1–E8 map to `core/`, `app/`, `ui/features/`, `report/` and `content/` (System Location Mapping); E6 meta-progression and stats export added. |
| Document Completeness | Pass | Executive summary, versions (verified 2026-10-26/27), initialization, decision table, complete tree, cross-cutting concerns, patterns with examples, naming conventions; no placeholders. |

### Coverage Report

- **Systems covered:** 27/27 (25 from Project Context, plus meta-progression and content text rendering).
- **Patterns defined:** 5 novel (N1–N5) + 4 standard (P1–P4) + Code Quality Charter (10 rules, limits, review checklist).
- **Decisions made:** 14 architectural (D1–D14) + 5 cross-cutting (C1–C5) + 4 structural (S1–S4) + 2 from validation (V1–V2).

### Issues Resolved

1. Alignment unit changed from basis points to milli-points, so GDD drift values stay exact integers.
2. Meta-progression defined (`hitl:profile`, `core/meta`, loop number as a run start parameter).
3. Content text format defined (ICU + three inline tokens, `RichText`, never HTML).
4. Tagged-PDF risk resolved by PDFKit (D8), pending the E8 spike.
5. Node.js 24 LTS pinned; MCP setup (`.mcp.json`) documented.
6. Tab-title example aligned with EXPERIENCE.md corruption stages.
7. `dangerouslySetInnerHTML` banned; lint suppressions require a reason.
8. Number formatting centralised in `i18n/` formatters.

### Open Actions Outside This Document

None.

### Validation Date

2026-10-27

### Revision History

**2026-10-27 — Final readiness fixes:** D4 version pinning by version routing in the service worker (per-version caches, `version.json`, reload before `newRun`); N2 region owners (`automations` on first policy, `timeline` deferred to cascade end, `channel.product` in the cascade); N3 `throughput`/`askMetis` semantics and one chronicle line per event; D7 parameter ranges.

**2026-10-27 — Implementation-readiness fixes:** D1 time bases; D4 version pinning (no "replay wins" on version mismatch); D5 `HITL-STATS`; recap shape in `core/report`; D6 ID ↔ path table; D7 built-in params; N1 two-part hidden-state boundary, beat re-deferral after a round, locked-channel fallback; N2 canonical `RegionId` list; N3 parameter-valued effects, vocabulary owners, heavy-decision block; N4 example anchored on Deploy; N5 counterfactual = GDD formula; `answerId` everywhere.

**2026-10-27 — Synced with epics.md v2.0:** D6 adds the `status` authoring field and `content:audit`; N4 runner lives in `core/scripts/`; test builders in `tests/builders/`; no Preact 11 migration in the MVP.

**2026-10-27 — Synced with narrative-design.md** (its Appendix: Sync Notes):

- D6: required `kernel` and optional `translatorNote` (CI-checked, stripped from the content pack); `tone` field with `surreal` only in Series A+; `scripts/` and `templates/documents/` folders.
- D7: clue replay, away report and Auto-triage copy are UI strings in `locales/en/ui.json`.
- D8: `RunRecord` receipt counters exposed by `buildReportModel` (no Alignment data); document pools drawn from a `documents` RNG stream.
- N1: register values replace the `neutral` / `eager` placeholders; register-keyed template `text` with fallback; inference line IDs `line.signal.stage-1…4`, `line.signal.surpassed`; spine beat queue (round cooldown, minimum gap) with signal state still updating immediately.
- N3: event step schema; example condition IDs aligned with the trait pool and investor archetypes.

## Development Environment

### Prerequisites

- **Node.js 24 LTS** (24.22.x), pinned in `.nvmrc` and `package.json` `engines`; npm 11+.
- **Browsers for testing:** Chrome, Firefox and Safari (latest two versions); WebKit, Chromium and Firefox are installed by Playwright for automated runs.
- **Screen readers** for manual accessibility passes: VoiceOver (macOS/iOS), NVDA (Windows).
- **VS Code** with recommended extensions in `.vscode/extensions.json`: ESLint, Stylelint, Prettier, YAML (Red Hat; uses the generated JSON Schemas for content autocompletion).
- **veraPDF** CLI (used in CI for PDF/UA; optional locally).

### AI Tooling (MCP Servers)

The following MCP servers were selected during architecture to support AI-assisted development:

| MCP Server | Purpose | Install Type |
|---|---|---|
| Context7 (`@upstash/context7-mcp` 4.4.x) | Current docs for Preact, Signals, Vite, Vitest, Playwright, PDFKit, Zod | `npx`, declared in `.mcp.json` |
| Chrome DevTools MCP (`chrome-devtools-mcp` 1.12.x) | Console, performance traces, memory and background-CPU checks | `npx`, declared in `.mcp.json` |
| Playwright MCP (`@playwright/mcp` 0.0.83) | Accessibility-tree browser driving; keyboard-only play checks | `npx`, declared in `.mcp.json` |

**Setup:** the committed `.mcp.json` (see *Engine & Framework → AI Development Tooling*) is picked up automatically by MCP-capable agents. Start the dev server (`npm run dev`) and open `http://localhost:5173/?scenario=<name>` to reach any game state.

### Setup Commands

```bash
npm create vite@latest human-in-the-loop -- --template preact-ts
cd human-in-the-loop
echo "24" > .nvmrc

# runtime
npm i preact@10.29 @preact/signals@2.11 pure-rand@8.4 idb@8.0 fflate@0.8 zod@4.6 intl-messageformat@12.1 pdfkit@0.20

# build, content, offline
npm i -D vite@8.3 @preact/preset-vite@2.10 vite-plugin-pwa@2.0 typescript@6.0 yaml@2.9

# tests
npm i -D vitest@5.0 happy-dom@21.0 @testing-library/preact@3.2 fast-check@4.10 @playwright/test@1.64 @axe-core/playwright@4.14
npx playwright install --with-deps

# quality gates
npm i -D eslint@10.13 typescript-eslint@8.72 eslint-plugin-boundaries@7.3 @eslint-community/eslint-plugin-eslint-comments@4.8 \
  prettier@3.9 stylelint@17.16 stylelint-config-standard@40 stylelint-declaration-strict-value@1.12 \
  jscpd@5.4 knip@6.43 size-limit@14.3 @size-limit/preset-app@14.3 lint-staged@17.6 simple-git-hooks@2.14
```

### First Steps

1. **Scaffold and gates (E1, first story).** Turn the Vite scaffold into the *Project Structure* tree. Configure every quality gate (boundaries, Charter limits, jscpd, knip, Stylelint, size-limit, pre-commit) and the CI and Pages deploy workflows **before** any game code, so the first line of game code is already checked.
2. **Core skeleton with its invariants.** `core/run`, `core/rng`, `core/time` with `advance`, fingerprint and replay, plus the fast-check properties (chunk invariance, replay ≡ live) running in CI from day one.
3. **Content pipeline.** Zod schemas, YAML build plugin, `contentPackVersion`, `tuning.yaml`, `content:new`.
4. **Configure the MCP servers** via `.mcp.json` and the `?scenario=` loader.
5. **Persistence and codec.** `saveRepository`, migrations chain, tab lock, export/import with replay verification.
6. Continue with the E1 → E2 vertical slice per `epics.md`.

