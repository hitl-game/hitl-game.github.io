---
project_name: 'Human in the Loop (browser-game)'
user_name: 'Tiziano'
date: '2026-10-27'
sections_completed:
  ['technology_stack', 'engine_rules', 'performance_rules', 'organization_rules', 'testing_rules', 'platform_rules', 'anti_patterns']
status: 'complete'
rule_count: 103
optimized_for_llm: true
existing_patterns_found: 9
source: '_bmad-output/game-architecture.md'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing game code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

Pinned ranges; do not upgrade majors without an architecture change. Full rationale: game-architecture.md → Engine & Framework, Decision Summary.

- **Node.js 24 LTS** (`.nvmrc`). Vite 8 needs `^20.19 || >=22.12`.
- **TypeScript 6.0.x, strict.** NOT 7.x: typescript-eslint 8.72 requires `<6.1.0`, and lint enforces the module boundaries.
- **Preact 10.29.x** + @preact/signals 2.11.x. NOT Preact 11 and NOT React: no `react` imports, no React-only libraries.
- **Vite 8.3.x** + @preact/preset-vite 2.10.x; vite-plugin-pwa 2.0.x.
- **Game libraries:** pure-rand 8.4 (RNG), idb 8.0 (IndexedDB), fflate 0.8 (deflate), zod 4.6 (schemas), intl-messageformat 12.1 (ICU), pdfkit 0.20 (tagged PDF), yaml 2.9 (build-time only).
- **Tests:** vitest 5.0, happy-dom 21.0, @testing-library/preact 3.2, fast-check 4.10, @playwright/test 1.64, @axe-core/playwright 4.14.
- **Gates:** eslint 10.13 + typescript-eslint 8.72 + eslint-plugin-boundaries 7.3, prettier 3.9, stylelint 17.16, jscpd 5.4, knip 6.43, size-limit 14.3.
- **No new runtime dependency without justification in the PR.** The initial bundle has a size-limit budget (150 KB gzip). Prefer platform APIs: `<dialog>`, `popover`, Web Locks, `Intl`, Web Audio.
- **Hosting is GitHub Pages:** no custom headers (no COOP/COEP, no SharedArrayBuffer), no SPA fallback (no path routing), base path `/<repo>/`.

## Critical Implementation Rules

### Preact & Signals Rules

- **Imports.** Hooks from `preact/hooks`. No `preact/compat` unless a dependency requires it (justify in the PR). Use `class`, not `className`.
- **Where signals live.** Shared state is signals and `computed` in `app/` (session, selectors, settings). Inside components, only `useSignal` / `useComputed` for local UI state. Never create `signal()` or `computed()` in a component body.
- **Fine-grained updates.** Pass signals into JSX (`{cashLabel}`, not `{cashLabel.value}`) for text that changes often (timers, KPIs), so the DOM node updates without re-rendering the component.
- **Side effects.** `useSignalEffect` / `useEffect` only for DOM concerns. Game reactions to state go through domain-event reactors (`app/reactors`), never through component effects.
- **No game logic in components.** Components render selectors and `dispatch(command)`.

### Core Purity & Determinism Rules (`src/core/**`)

- **No time, randomness or I/O.** No `Date`, `performance`, `setTimeout`/`setInterval`, `Math.random`, `crypto`, DOM, Preact, signals, `fetch` or storage. Time arrives as a `GameMs` argument; randomness as an `RngStream` argument.
- **No timers for game logic, anywhere.** Everything that happens "later" is an event in the queue, processed by `advance()`. Real timers exist only in `platform/clock` (present loop), `app/backgroundPreview`, and the backlog top-item timer in `app/session`, whose lapse is dispatched as the logged command `expireBacklogItem`.
- **Plain data.** State is readonly plain data: no classes, no `Map`/`Set`, no `undefined` vs missing-key ambiguity in persisted state. Updates return new objects.
- **Deterministic order.** When order affects results, sort by an explicit key. Event-queue ties break by `(gameMs, kind priority, id)`.
- **Integers only.** Money in cents, Hype and percentages in basis points, Alignment in milli-points. Divide with the shared rounding helper, never with ad hoc `Math.round` / `toFixed`.
- **IDs from counters in state** (`msg-000417`), never `crypto.randomUUID()`.
- **The core is synchronous.** Async I/O lives in `platform/` and returns `Result`.

### Browser Platform Rules

- **Lifecycle events.** Persist on `visibilitychange → hidden` and `pagehide`. Never use `unload` or `beforeunload` (they break bfcache and are unreliable on mobile).
- **Focus.** Never call `.focus()` in response to non-player events (new message, timer, toast). Focus moves only after a player action.
- **Workers.** The simulation worker is created with `new Worker(new URL('./simulationWorker.ts', import.meta.url), { type: 'module' })`. Workers are ordinary (no SharedArrayBuffer).
- **URLs.** Asset and page URLs are relative to Vite's `base`. No absolute `/` paths (the site is served under `/<repo>/`).

### Performance Rules

Targets (GDD): background tab CPU ≈ 0 · memory < 150 MB after 8 h · interactive < 2 s cold on 4G · 60 FPS animations · 14-day return < 500 ms · PNG + PDF < 3 s.

- **Hidden tab = no work.** The present loop runs on `requestAnimationFrame` and stops when hidden. The only hidden-tab work is the ~60 s incremental preview. No other `setInterval`, polling or animation while hidden.
- **Bounded everything.** Every growing collection has a cap from tuning or the spec:
  - inference log ~50 lines;
  - toasts 3;
  - logger 500 entries;
  - rendered messages per channel view (older ones are not kept in the DOM);
  - resolved messages kept in state (see below).

  No unbounded arrays in state or UI.
- **Resolved messages leave the state.** Answered or expired messages are kept for a bounded window (`tuning.resolvedMessagesPerChannel`, ~200), then dropped. Chronicle entries keep their own quote. The clue replay re-derives anything older by replay (N5). This keeps snapshots, saves and memory flat over long runs.
- **Hot paths** (`advance`, render, selectors): no logging, no `JSON.stringify`, no fingerprinting, no array copies of whole collections per event. Fingerprint only on save, load and in tests.
- **Lists.** Keyed by entity ID (never by index). Selectors return stable references when nothing changed.
- **Animation.** Only `transform` and `opacity`. Every animation respects the motion settings and `prefers-reduced-motion`.
- **Lazy chunks stay lazy.** Report renderers, PDFKit, non-English locales and audio are dynamic `import()` only. A static import into the main bundle fails size-limit.
- **Autosave** at game-day boundaries and on visibility change, never per frame.
- **Heavy replays** (clue probe, desync check, import verification) run in `app/simulationWorker`, never on the UI thread.

### Code Organization Rules

Full tree and mapping: game-architecture.md → Project Structure.

- **Layer imports** (lint-enforced):
  - `ui → app → core → shared`;
  - `app → platform → shared`;
  - `ui` NEVER imports `core` or `platform`;
  - `core` imports only `shared`.
- **Import through `index.ts` only.** `import { rankBacklog } from '../absence'`, never `'../absence/rankBacklog'`. Anything not exported from `index.ts` is private.
- **Features never import features.** Shared UI goes to `ui/patterns/` (composite) or `ui/primitives/` (accessible base widgets). Never hand-roll a dialog, popover, radio group, switch or tooltip outside `ui/primitives/`.
- **`shared/` admission.** Used by at least two layers and knows nothing about the game. Otherwise it belongs in `core/` or in the module that uses it. No `utils.ts` or `helpers.ts` anywhere.

| New thing | Goes in |
|---|---|
| Game rule, formula, entity lifecycle | `core/<domain>/` |
| Browser API wrapper (storage, clock, notifications, audio) | `platform/<adapter>/` |
| Wiring state to UI, reacting to domain events | `app/selectors/`, `app/reactors/` |
| A screen or surface from EXPERIENCE.md | `ui/features/<surface>/` |
| A component used by 2+ features | `ui/patterns/` |
| A tuning number | `content/tuning.yaml` (never a code constant) |
| An event, template, character, headline, script | `content/<kind>/…yaml` (format and voice: `narrative-design.md`) |
| A UI string | `locales/en/ui.json` + `t()` |
| A test fixture or scenario | `tests/fixtures/` (shared with the debug panel) |

### Naming Rules

- **GDD glossary verbatim:** `alignment`, `triage`, `delegationPolicy`, `heavyDecision`, `askMetis`, `backlog`, `surpassed`. No synonyms.
- **Unit suffix on every number with a unit:** `cashCents`, `hypeBp`, `alignmentMilli`, `expiresAtGameMs`, `durationRealMs`, `absenceCapDays`. A bare `cash` or `time` is a bug.
- **Functions start with a verb** (`applyCommand`, `rankBacklog`). Booleans use `is` / `has` / `can`.
- **Commands are imperative, domain events are past tense:** `answerMessage` / `messageExpired`.
- **Named exports only.** No `export default`.
- **Files and folders.** Components in PascalCase with colocated `.module.css` and `.test.tsx`; other modules in camelCase, named after their main export; folders in camelCase; content files in kebab-case, with IDs matching the path (`event.seed.gpu-shortage`).
- **Abbreviations.** Only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi`.

### Testing Rules

Full strategy: game-architecture.md → Testing Strategy (D12) and Replay Consistency (D4).

- **Test location.** Unit tests are colocated (`burn.ts` + `burn.test.ts`). `tests/` holds only e2e, golden runs, fixtures and builders.
- **Core tests run in Node with no DOM.** If a core test needs a DOM or a browser API, the logic is in the wrong layer.
- **Builders, not hand-built objects.** Build entities and states with `tests/builders/` (`makeState()`, `makeMessage({ urgency: 'urgent' })`). Builders call the real factories. Never hand-write a `GameState` literal.
- **Mock only at `platform/` boundaries.** Fake clock, in-memory storage, fake notifications. Never mock `core/` functions: they are pure, so call them.
- **Every core change keeps the invariants green.** fast-check properties (chunk invariance, replay ≡ live, snapshot + tail ≡ full replay) and golden runs. A new mechanic adds its own property where one exists ("cash never non-integer", "a message never expires twice").
- **Golden runs change only on purpose.** If a balance or content change alters a golden fingerprint, update the golden with `npm run golden:update` in the same PR and explain why. Never update goldens to "make CI pass".
- **Shrunk counterexamples become permanent tests.** When fast-check finds a failing case, commit it as a regression test.
- **UI tests query by role and accessible name** (`getByRole('button', { name: 'Approve' })`), never by class, test-id or DOM structure. No DOM snapshot tests.
- **Every primitive in `ui/primitives/`** has an axe test and a keyboard test.
- **E2E reaches states through scenarios** (`?scenario=<name>`) and reads state through `window.__hitl` (test builds only). It never plays an hour to reach the end of a run.
- **Test names state behaviour:** `it('stops at the first heavy decision during an absence')`.

### Platform, Input & Build Rules

- **Targets.** Latest two versions of Chrome, Edge, Firefox and Safari. Desktop-first, responsive down to 320 CSS px, touch-playable on Safari iOS and Chrome Android. Test Safari explicitly: storage eviction, `persist()` behaviour, Web Locks.
- **Zero runtime network calls.** No CDN scripts, no Google Fonts, no analytics, no remote config, no external images. Everything ships in the build and is precached by the service worker.
- **Input.**
  - Every shortcut is declared once in the shortcut registry (`ui/a11y`), with its Alt alternative, localised description and optional `region`.
  - No `keydown` listeners scattered in components.
  - Every action has a pointer/touch path besides its shortcut.
  - Shortcuts act on the "current" message only.
- **Strings and numbers.** Every visible string comes from `t()` (UI) or content catalogs; every visible number goes through `i18n/` formatters (`formatCents`, `formatCompactCents`, `formatGameDay`…).
- **Styles.**
  - CSS Modules use tokens only (`var(--…)`).
  - Visual state comes from `data-` attributes set by the `theme` module: `data-theme`, `data-scheme`, `data-contrast`, `data-cvd`, `data-infection`, `data-phase`, `data-motion`, `data-surface`, `data-text-size`, `data-font`.
  - Component-level state uses `data-` attributes (`[data-urgency="urgent"]`), not modifier classes.
  - No `!important`.
- **Storage.** Only through `platform/storage` repositories; DB name `hitl`, keys prefixed `hitl:`. Never touch `localStorage` for game data.
- **Builds.**
  - `debug/`, `?scenario=` and `window.__hitl` exist only in dev/test builds, gated by `import.meta.env`, so they are tree-shaken from production.
  - A new build is used only from the next run (version pinning via per-version caches), never mid-run.
- **CI is the definition of done.** Typecheck, ESLint (boundaries, complexity, comments), Stylelint, Prettier, jscpd, knip, size-limit, unit + property + golden + content tests, and e2e on Chromium (all three engines on `main`). Never disable a gate to merge; a lint suppression needs a written reason.
- **Content PRs** pass the same CI. Content is data only: no HTML, no executable code, human units, stable IDs. Agent-written content is `status: placeholder` and merges after CI; only Tiziano sets `status: final` (CODEOWNERS), and each playtest gate requires its scope to be final (`npm run content:audit`). Voice-critical UI keys follow the same rule through `locales/en/ui.status.json`.
- **Before writing any player-facing text** (event, template, character line, headline, document copy, voice-critical UI key), read `narrative-design.md` → *Voice Style Guide* (binding, community PRs included), *Content Formats* and *Narrative Data Map*, plus the character's register under *Characters*. Every content item needs a `kernel`: one sentence with the real insider observation it starts from, taken from `docs/kernel-bank.md` when one fits; otherwise an agent proposes one from insider patterns (never a real quote) and the item stays `status: placeholder` until Tiziano's final cut (epics.md D-E3). Anonymize per *World Building*. `tone` must be allowed for the item's phase (`surreal` only from Series A).

### Critical Don't-Miss Rules

**Hidden state (the game's core twist):**
- Alignment is never shown, announced, logged to the player, or exposed to the UI. The UI reads only derived signals (`titleStage`, `infectionLevel`…). Inside `core/`, only `alignment`, `staff`, `ending`, `save` and `run` reference `alignmentMilli`; outside, only `app/selectors/hiddenState.ts` reads it, imported only by `clueReplay` and `debug`.
- Signals are silent: no toast, no announcement, no event, and no mention in the away report. Alignment changes are never domain events.
- Shared documents (PNG, PDF, future QR) are built only by `buildReportModel`, the single spoiler filter. Never add a field to a shared artifact anywhere else.

**Determinism:**
- Anything that affects the run is a command in the input log (including Timing and Game speed changes) or a run start parameter (seed, loop number, content pack version). A setting that changes replay but is not logged is a bug.
- A new random draw uses its subsystem's stream. Never borrow another stream; never add a stream without a new stable name.
- Never persist a state produced after a bug: the error boundary stops the clock and keeps the last good save.
- A run is pinned to its app and content version (architecture D4 → Version pinning): the service worker serves the pinned version's cache while a run is in progress, and a new build is used only after a reload before the next `newRun`. Never let the desync detector rewrite a run on a version mismatch.
- Cadences are game time; response windows are real seconds converted once at creation (architecture D1 → Time bases).

**UI behaviour:**
- `<Region id>` is the only visibility gate; no `if (phase === …)` in `ui/`. Locked regions are not rendered at all.
- Overlays never stack. Pausing overlays (heavy decision, away report, settings, shortcuts) pause the game clock through the clock-state rules, not through ad hoc timers.
- Content text renders only through `ui/patterns/RichText`. Never `dangerouslySetInnerHTML`, never `innerHTML`.
- Rolling numbers animate in an `aria-hidden` layer; the accessible value is always the final one.
- Reactors never dispatch commands; components never emit domain events.
- Notification permission is requested only in context (first delegation policy), never on load.

**Code Quality Charter: anti-patterns this project rejects** (full rules: game-architecture.md → Code Quality Charter):
- Duplicated components or logic. Search `ui/primitives/`, `ui/patterns/` and module `index.ts` first; extract at the second occurrence of the same concept.
- Copies per surface (`LgtmButton`, `HuddlrCard`). Variants are props, tokens and `data-` attributes.
- AI-style comments: narration ("Now we loop…"), JSDoc restating types, `// ===== SECTION =====` banners, commented-out code, TODOs (open an issue instead). Comments state only a non-obvious *why*.
- Names that need a comment, generic names (`data`, `handleData`, `processItems`, `manager`, `utils`), missing unit suffixes.
- Abstract base classes, speculative options or extension points, pass-through wrappers.
- Defensive noise: re-checking what types guarantee, empty `catch`, swallowing errors. Expected failures are `Result`; bugs throw.
- `any`, non-null `!`, `@ts-ignore`, nested ternaries; functions over 40 lines, files over 300, complexity over 10, more than 3 parameters.

**Before closing a story:** run the Agent Review Checklist in game-architecture.md → Implementation Patterns.

---

## Usage Guidelines

**For AI agents:**

- Read this file before implementing any game code; consult game-architecture.md for the full decision behind a rule.
- Follow all rules exactly. When in doubt, prefer the more restrictive option.
- If a story needs to break a rule, stop and raise it. Do not work around it.
- Propose an update to this file when a new pattern emerges.

**For humans:**

- Keep this file lean and focused on what agents get wrong.
- Update it with the technology stack and the architecture document.
- Review it periodically; remove rules that become obvious.

Last Updated: 2026-10-27
