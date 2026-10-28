---
baseline_commit: 13f16980defc4e598f8969fe07f46d04a850849f
---

# Story 1.6: Game clock, presence and clock states

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,
I want game time to run while I am looking and to stop when I am not or when something pauses it,
so that one real minute is one game day and nothing happens behind my back.

## Acceptance Criteria

Source: epics.md → Story 1.6 (FR1, FR2; test scenarios CLK-01, CLK-02, CLK-03, DET-09). The "Binding clarifications" below make the literal AC text precise where it leaves a gap.

1. **One minute is one day.** **Given** a visible tab and game speed 1×. **When** 60 real seconds pass. **Then** the run advances one game day through `advance()`, driven by a `requestAnimationFrame` loop in `app/session`.
2. **Game speed is a logged command.** **Given** `dispatch({ type: 'changeGameSpeed', speed: 'half' })`. **When** it is applied. **Then** it is recorded in the input log and one game day takes 2 real minutes (`quarter`: 4 minutes). **And** the economy per game day is unchanged.
3. **Pause reasons freeze time.** **Given** a pause reason is active (`heavyDecision`, `awayReport`, `settings`, `shortcutOverlay`, `backlog`). **When** real time passes. **Then** game time does not advance (backlog: only the top backlog timer runs, wired in E3). **And** pause reasons are tracked as a set in `app/session`, never by ad hoc timers. **And** removing the last reason resumes time without a catch-up jump.
4. **Awaiting Deploy.** **Given** the run is awaiting Deploy. **When** real time passes. **Then** game time stays at 0.
5. **Hidden tab.** **Given** the tab becomes hidden. **When** `visibilitychange` fires. **Then** the present loop stops (no rAF, no interval). **And** a negative real delta (system clock moved back) counts as zero.
6. **Clock-free core.** **Given** `core/`. **When** linted. **Then** it never reads a clock; only `platform/clock` converts real time to game ms.
7. **Time bases.** **Given** the time bases of architecture D1. **When** a cadence or a window is defined. **Then** cadences live in game-ms in tuning, while windows are real seconds that the core converts once at creation with the speed in force (a helper shared by Stories 2.3 and 3.8).

### Binding clarifications (read before coding)

These are decisions taken by the story author (no human was available); see "Default decisions" at the end for the list to confirm.

- **C-1 Three small pieces, one per layer.** This story builds the first real-time machinery. Keep each layer to its own job:
  - `core/time` (pure): the pause-reason vocabulary, the game-speed table and the real-window to game-ms helper (C-5, C-6). No clock, no signals.
  - `platform/clock` and `platform/visibility` (browser adapters, import only `shared`): the real-time to game-ms conversion, the rAF frame loop, and `visibilitychange`. They are the only code that reads `performance.now` or calls `requestAnimationFrame`.
  - `app/session` (orchestration): live `GameState` in a signal, `dispatch`, the pause-reason set, the awaiting-Deploy flag, and the present loop that calls `advance`. It wires the two adapters.
  - No UI, no `main.tsx` wiring, no screen: Story 1.8 renders the first consumer. Nothing in `ui/` changes here.
- **C-2 Clock conversion is anchor-based, not an accumulation of frame deltas.** `platform/clock` keeps `anchorRealMs` and `anchorGameMs`. Game time at real time `t` is `anchorGameMs + floor(max(0, t − anchorRealMs) / realMsPerGameMs)`. The clock re-anchors on every start, pause, resume and speed change. Rationale: it cannot drift (flooring each 16 ms frame delta at ¼× would lose about 6%), it needs no float state, and the negative-delta rule is one `max(0, …)`. A system clock moved back inside a running period therefore freezes game time until the clock passes the anchor again; if `performance.now` itself ever went backwards the same rule holds. The result is a safe integer; `advance` already asserts "never moves time backwards", so session also takes `max(state.nowGameMs, target)`.
- **C-3 The conversion factor is an integer divisor owned by the core.** `GameSpeed` is `'full' | 'half' | 'quarter'` today (`core/run/settings.ts`). The game constants (`core/constants.ts`, "Game constants" row of the configuration table) get `REAL_MS_PER_GAME_MS_BY_SPEED = { full: 1, half: 2, quarter: 4 } as const` (a `Record<GameSpeed, number>`; `no-magic-numbers` forces a named constant). `platform/clock` receives the divisor as a plain number argument (it imports only `shared`, so it never sees `GameSpeed`); `app/session` maps the speed in force to the divisor. GAME_DAY_MS equals one real minute at 1×, so game-ms equal real ms there (see the comment on `GAME_DAY_MS`).
- **C-4 `GameSpeed` moves into `core/time` so both Stories 2.3 and 3.8 can use the helper without an import cycle.** Today `GameSpeed` and `gameSpeeds` live in `core/run/settings.ts`, and `core/run` imports `core/time`, so `core/messages` (Story 2.3) cannot import the speed from `run` and `time` cannot either. Move `GameSpeed`, `gameSpeeds` and the divisor table to `core/time` (new file `gameSpeed.ts`, exported through `core/time/index.ts`); `core/run/settings.ts` imports `GameSpeed` from `../time` and keeps `Timing`, `timings` and `Settings`. Keep the public exports of `core/run/index.ts` and `core/index.ts` unchanged so no caller breaks (re-export from the run index if needed, once). `core/time` must not import `core/run` (existing hot-path lint rule).
- **C-5 The shared window helper.** `core/time/convertRealWindowToGameMs.ts`: `convertRealWindowToGameMs(windowRealMs, speed): number`, returning `divideRounded(windowRealMs, REAL_MS_PER_GAME_MS_BY_SPEED[speed])`. It is the one place that turns a "real seconds" window into game-ms. Stories 2.3 (message response windows, `× Timing` is applied by the caller) and 3.8 (backlog window) call it once at creation with the speed in force; this story ships and tests the helper but has no caller. Property test: converting at speed `s`, then letting `windowRealMs` of real time pass at `s` (through the clock), consumes the whole window; and a later speed change never alters an already-converted value (it is a number, the test asserts the helper is pure). Cadences stay in game-ms in tuning and are never passed through this helper.
- **C-6 Pause reasons.** `core/time/pauseReasons.ts`: `export const pauseReasons = ['heavyDecision', 'awayReport', 'settings', 'shortcutOverlay', 'backlog'] as const; export type PauseReason = (typeof pauseReasons)[number];` These five and no others (the epic list, the GDD Clock States table). The core owns the vocabulary because the rules live in "`core/time` clock-state pause rules" (architecture tree); it does not own the set itself.
  - In `app/session` the active reasons are `signal<ReadonlySet<PauseReason>>` replaced on every change (immutable update so subscribers see a new reference). A `Set` is fine here: it is live UI/session state, never persisted (the "no `Set` in persisted state" rule is about `GameState`).
  - `pause(reason)` / `resume(reason)` are idempotent set add/remove, not counters: two surfaces cannot stack a reason, and overlays never stack anyway (project-context UI rule).
  - `backlog` pauses the game clock like the others. The "only the top backlog timer runs" real timer and `expireBacklogItem` are Story 3.8; do not build any timer here.
- **C-7 Awaiting Deploy is a session flag, not a command yet.** The `deploy` command and `foundCompany` belong to Story 1.8 (`core/run`). Until then `app/session` holds `isAwaitingDeploy` (a signal), `true` for a fresh run, with one explicit seam `markDeployed()` that sets it to `false` and starts the clock. Story 1.8 replaces that seam with the real logged `deploy` command and the cascade anchor (Story 2.12). While `isAwaitingDeploy` is `true` the clock is stopped and game time stays at 0, however much real time passes (CLK-03). Do not add a `deploy` command, a run-phase field in `GameState`, or any queue event for it in this story. A session created from a loaded save later (Story 1.9) will pass `isAwaitingDeploy: false` for a run that already deployed; expose it as a creation option now.
- **C-8 "The clock runs" is one derived boolean.** `isClockRunning = isVisible && !isAwaitingDeploy && pauseReasons.size === 0 && !isBlockedByStop`. It is a `computed` in `app/session`; the frame loop starts when it becomes true and stops when it becomes false. Every change of this boolean re-anchors the clock (so resuming never produces a catch-up jump, CLK-02 second clause).
- **C-9 Hidden tab: stop the loop and drop the hidden time (for now).** On `visibilitychange → hidden` the frame loop is cancelled (project-context: hidden tab = no work; no `setInterval`, no polling). On `→ visible` the clock re-anchors at the current real time, so the time spent hidden is not simulated in this story. Simulating it is Story 3.5 (absence: `Date.now()` difference recorded as an absence input, `advance` in `'away'` mode) and the ~60 s hidden preview is Story 3.10. Both build on this loop; do not add `Date.now` handling or an `away` mode here. State this in a one-line comment at the visibility handler (a non-obvious why).
- **C-10 Enforce the replay contract in `app/session` (resolves the 1.2 deferred decision).** Architecture D3 → "Replay contract": live play must call `advance(state, nowGameMs, { mode: 'present', tuning })` before every command, because replay does exactly one `advance` per logged entry. Decision: enforce it in `app/session.dispatch`, not with a new core `step()` entry point. `dispatch(command)`:
  1. unless the session is blocked after a blocking stop (below), computes the target game ms from the clock (or `state.nowGameMs` when the clock is stopped) and calls `advance` to it;
  2. calls `applyCommand(state, command, state.nowGameMs)`;
  3. on `ok`, commits the new state; on `err`, leaves the state intact and returns the `Result` to the caller (`settingUnchanged` is an expected error, not a bug);
  4. when the accepted command is `changeGameSpeed`, re-anchors the clock with the new divisor (game time continues from the current point at the new rate; no jump).
  - **Blocking stop.** When `advance` returns `stoppedBy !== null` (heavy decision, death: Epics 4 and 5 add the kinds, `heavyDecisionDue` already exists in `eventKinds`), the session sets `isBlockedByStop`, stops the clock, and from then until a command has been logged makes no `advance` call of any length, not even a zero-length one (D3: a zero-length advance would process a second blocking event due at the same `gameMs` that replay leaves queued). In this story only the session mechanism and its test exist; no UI clears the stop. The `dispatch` that logs a command clears it, and in that case step 1 is skipped. Test it with a queued `heavyDecisionDue` through the existing `makeStateWithEvents`.
  - **Mode.** The present loop always advances in `'present'`, which is what replay does. The 1.2 deferred item "Replay ignores the advance mode" stays open: Stories 3.5 and 5.10 must log mode changes as input before they introduce `away` or `ending`; note it in `deferred-work.md` as still pending, do not solve it here.
- **C-11 Domain events.** `advance` returns `events`. No reactor registry exists yet (Story 2.8 and 1.x reactors arrive later, architecture C4). Do not build one. Keep the event list returned from the internal advance step so the delivery point is one obvious place later; do not store events in state or signals, and do not invent an event bus (speculative extension point, Code Quality Charter).
- **C-12 Loop details.** The frame callback computes the target once per frame, calls `advance`, and commits via a single `state` signal write per frame (fine-grained updates: no per-event writes). It must not log, `JSON.stringify` or fingerprint (hot path). A frame never schedules a second frame after `dispose()`. `dispose()` cancels the pending frame and removes the visibility listener (needed by tests and by the Story 1.9 tab hand-over). The rAF callback receives the timestamp argument; use `performance.now()` through the injected clock source so tests drive one fake source for frames and time.
- **C-13 Boundaries and testability ("mock only at `platform/` boundaries").**
  - `platform/clock/` exports a small factory taking an options object (`max-params` is 3): `{ readNowRealMs, requestFrame, cancelFrame }`, defaulting to `performance.now` / `requestAnimationFrame` / `cancelAnimationFrame` bound in the module, and returns the clock API (`start(divisor)`, `stop()`, `readGameMs()`, `changeDivisor`, frame subscription). Tests pass fakes; no test mocks `core/` or `app/`.
  - `platform/visibility/` exports `watchVisibility(onChange): () => void` plus a `isDocumentVisible()` reader, over `document.visibilityState` and `visibilitychange`. Never `unload`/`beforeunload`. (`pagehide` autosave is Story 1.9; do not subscribe to it here.)
  - Both adapters return plain values, not `Result`: they cannot fail in a way a caller handles. Do not catch anything in them.
  - `app/session` imports `platform` only through `platform/index.ts` and `core` through `core/index.ts`.
- **C-14 Signals enter the codebase here.** `@preact/signals` is installed but unused and listed in `knip.json → ignoreDependencies`. This story is its first use: remove `@preact/signals` from `ignoreDependencies` in the same PR so knip proves the dependency is used (leave `idb` and `vite-plugin-pwa` there). Shared signals are created only in `app/` (project-context), never in `core`, `platform`, or components. Session exposes read-only views (`ReadonlySignal`); mutation goes through `dispatch`, `pause`, `resume`, `markDeployed`.
- **C-15 Not in scope (do not add).** Game-speed or timing settings UI (Stories 8.2, 8.3); `changeTiming` handling beyond what `applyCommand` already does (the session just dispatches it like any command); the day counter or any visible time (Story 1.8 uses `formatGameDay`); autosave (1.9); tab lock (1.9); the "while you were away" simulation (3.5); the hidden-tab preview (3.10); a command for Deploy (1.8); any `ui/` or CSS change; any new tuning key (the speed divisors are game constants, C-3, and nothing in `content/tuning.yaml` changes, so `contentPackVersion` is unchanged).

## Tasks / Subtasks

### Phase A: Core vocabulary (AC 2, 3, 6, 7)

- [x] A1. Move `GameSpeed` / `gameSpeeds` to `core/time/gameSpeed.ts` (C-4); update `core/run/settings.ts` to import it; keep `core/index.ts` public exports intact. Add `REAL_MS_PER_GAME_MS_BY_SPEED` to `core/constants.ts` (C-3) and a test that 1× is 1, ½× is 2 and ¼× is 4 and that every `gameSpeeds` entry has an integer divisor ≥ 1.
- [x] A2. Add `core/time/pauseReasons.ts` (C-6) and export through `core/time/index.ts` and `core/index.ts`.
- [x] A3. Add `core/time/convertRealWindowToGameMs.ts` with tests (C-5): 1× identity, ½× halves, ¼× quarters, half-away rounding through `divideRounded`, zero window, large safe value.
- [x] A4. Confirm the lint rules still hold: `core/time/**` imports nothing from `run`, no `performance`, no timers. Run `npm run lint` and `npm run lint:fixtures`.

### Phase B: Platform adapters (AC 1, 5, 6)

- [x] B1. `src/platform/clock/`: anchor-based real → game-ms conversion (C-2), frame loop over injected `requestFrame` / `cancelFrame`, `index.ts`; export through `src/platform/index.ts` (the file currently holds `export {};`). Colocated tests with a fake time source: 60,000 real ms at divisor 1 gives 60,000 game ms; at 2 gives 30,000; at 4 gives 15,000; sub-millisecond real values; a backwards `readNowRealMs` yields no negative delta and no decrease; re-anchoring at a speed change continues from the current game ms without a jump; `stop()` then `start()` after a long real gap adds nothing.
- [x] B2. `src/platform/visibility/`: `watchVisibility`, `isDocumentVisible`, `index.ts`. Test with happy-dom by setting `document.visibilityState` and dispatching `visibilitychange`; the returned function removes the listener.
- [x] B3. Boundaries: `platform` imports only `shared`; check `eslint-plugin-boundaries` accepts the new folders (they match the existing `platform` element).

### Phase C: Session (AC 1 to 5)

- [x] C1. `src/app/session/`: `createSession(options)` returning the API of C-6, C-7, C-8, C-10, C-14 (signals for `state`, `pauseReasons`, `isAwaitingDeploy`, `isClockRunning`; functions `dispatch`, `pause`, `resume`, `markDeployed`, `dispose`). Options: the initial `GameState`, the `EconomyTuning`, optional `isAwaitingDeploy` (default `true`), and the injectable platform sources (C-13). Split into files named after their export, each ≤ 40 lines per function.
- [x] C2. Present loop (C-12): the frame handler computes the target from the clock, applies `max(state.nowGameMs, target)`, calls `advance`, commits one state write, and on `stoppedBy` applies the blocking-stop rule of C-10.
- [x] C3. `dispatch` per C-10, including the `changeGameSpeed` re-anchor. Return type `Result<void, CommandError>` (the core's `CommandError`, no new error code).
- [x] C4. Wire visibility (C-9): hidden stops the loop; visible re-anchors and restarts it when `isClockRunning` is true; `dispose` unsubscribes.
- [x] C5. Export from `src/app/session/index.ts` and `src/app/index.ts`. Leave `selectRunway` a plain function (Story 1.8 wraps it in `computed`).
- [x] C6. Remove `@preact/signals` from `knip.json → ignoreDependencies` (C-14); run `npm run knip`.

### Phase D: Tests for the scenarios (AC 1 to 5)

- [x] D1. **CLK-01** (unit, fake clock): after `markDeployed`, 60 real seconds give exactly one game day (`nowGameMs === GAME_DAY_MS`, one `economyStep` applied, cash 1,240,000 − 40,000); after `dispatch changeGameSpeed 'half'` a day takes 120 s, `'quarter'` 240 s; the cash change per game day is identical at all three speeds.
- [x] D2. **CLK-02** (unit): for each of the five pause reasons, real time passes with no game-time change; removing the last reason resumes with no catch-up jump (game time after resume + 1 s equals game time before + 1 s); two reasons active and one removed stays paused; `pause` twice then one `resume` resumes (set semantics, not a counter).
- [x] D3. **CLK-03** (unit): a new session awaiting Deploy stays at game time 0 for any amount of real time; after `markDeployed` it runs; a backwards real clock mid-run adds zero and never moves game time back.
- [x] D4. **Visibility** (unit): hidden cancels the pending frame (no frame requested while hidden: assert the fake scheduler has none queued); visible re-anchors, game time does not include the hidden period.
- [x] D5. **DET-09 / DET-01 live equals replay** (property, fast-check): a live session driven by a fake clock with arbitrary real-time chunks, pause/resume and `changeGameSpeed` / `changeTiming` commands at arbitrary times ends with a state whose `fingerprint` equals `replay(start, state.inputLog, tuning)`. This is the proof for C-10's "advance before every command". Add the speed-change case explicitly: two speed changes at arbitrary game times replay to the live fingerprint. A presentation-only action (pause/resume, visibility) leaves the fingerprint unchanged.
- [x] D6. **Blocking stop** (unit): with a `heavyDecisionDue` queued, a frame stops at it, `isClockRunning` is `false`, further frames and a following `dispatch` make no `advance` call before the command is logged, and the log then replays to the same fingerprint as the live state (the exact "back-to-back commands" case the 1.2 review deferred).
- [x] D7. Probe edge cases the way 1.2/1.4/1.5 reviews did: a frame with zero real delta; a very large real gap (a laptop that slept with the tab visible): one `advance` call, cost scales with events, state valid (`assertStateIsValid`); a command dispatched at the same real instant as a frame; `dispose()` then a late frame callback does nothing; speed change at `nowGameMs === 0` before Deploy (allowed, logged at 0, no `-0`).

### Phase E: Close-out

- [x] E1. Update `_bmad-output/game-architecture.md` (D1 time bases and clock text, "Replay contract", the system location table) with: the pause-reason vocabulary in `core/time`, the divisor table and `convertRealWindowToGameMs`, the anchor-based clock, and that `app/session.dispatch` enforces the replay contract. Update `project-context.md` only if a rule changes (none expected).
- [x] E2. Update `deferred-work.md`: mark "Back-to-back commands without an `advance` replay differently" resolved by this story (session enforces; test D6); restate "Replay ignores the advance mode" as still pending for 3.5 / 5.10; add anything the dev finds and cannot fix here (hidden-time handling, C-9, is already tracked as Story 3.5).
- [x] E3. `npm run check` plus `npm run test:e2e` (Chromium) green; run the Agent Review Checklist and paste it ticked in the PR.

## Dev Notes

### What exists today (read before touching anything)

- **`core/time`** (`src/core/time/`): `advance(state, untilGameMs, context)` with `AdvanceContext = { mode, tuning: EconomyTuning }`, `AdvanceResult = { state, events, stoppedBy }`, `eventKinds` table (`dayBoundary` 10, `economyStep` 15, `heavyDecisionDue` 20 blocking), `scheduleEvent`, `TimeState`. `advance` asserts `Number.isSafeInteger(untilGameMs) && untilGameMs >= state.nowGameMs`, stops after a blocking kind and reports `stoppedBy`. `core/time` may not import `core/run`, `fingerprint`, `canonicalize`, `assertStateIsValid`, `newRun`, `replay` or the `core` root (hot-path ESLint rule). It has no `index.ts` entries for pause reasons or speed.
- **`core/run`**: `applyCommand(state, command, atGameMs)` asserts `atGameMs === state.nowGameMs` (advance first), returns `Result<CoreStep, CommandError>`, and handles only `changeGameSpeed` and `changeTiming`, both returning `settingUnchanged` when the value equals the current one. It writes `{ atGameMs: state.nowGameMs, command }` to `inputLog`. `Command = changeGameSpeed | changeTiming`; `CommandError = 'settingUnchanged'`. `Settings = { timing, gameSpeed }` lives in `GameState.settings`; `GameSpeed`, `gameSpeeds`, `Timing`, `timings` in `core/run/settings.ts`. `replay(start, inputLog, tuning)` does one `advance(state, entry.atGameMs, { mode: 'present', tuning })` then `applyCommand` per entry; `replayFrom` resumes from a snapshot. `newRun(start, tuning)` schedules `dayBoundary` and `economyStep` at `GAME_DAY_MS`.
- **`core/constants.ts`**: `GAME_DAY_MS = 60_000` ("one real minute is one game day at 1×, so game-ms equal real ms"), `MS_PER_SECOND`, `SECONDS_PER_MINUTE`, and the other named constants. Anything numeric the new code needs is named here or lives in tuning.
- **`app/`** holds only `content/` (`loadContentIndex`) and `selectors/` (`selectRunway`, a plain function waiting for `computed`). There is no `app/session`, no signals use anywhere, and no `platform/clock` or `platform/visibility`: `src/platform/index.ts` is `export {};`.
- **Tests and builders:** `tests/builders/` has `makeState`, `makeStateWithEvents`, `makeRunStart`, `makeEconomyTuning`, `makeContentPack`, `arbitraries.ts` (`runStartArbitrary`, `pendingEventsArbitrary`, `timeSplitArbitrary` and a live-step driver used by the existing replay-equals-live property). Vitest runs `src/{core,shared}/**` in Node and everything else in happy-dom (`vitest.config.ts`), so platform and app tests get a DOM; core tests never do.
- **Nothing renders the clock.** `src/ui/App.tsx` is the scaffold; `main.tsx` renders it. This story does not touch either.

### Architecture patterns and constraints

- **D1 time model:** discrete-event simulation behind one pure `advance()`; the clock module in the shell converts real time to game time; present is `performance.now()` deltas × game-speed factor, frozen while a pausing overlay is open; a negative real delta counts as zero. [Source: game-architecture.md#Simulation Time Model (D1)]
- **Time bases:** economy, arrivals and cadences are game time in game-ms and Game speed never changes them per game day; message response windows are real seconds × Timing converted to game-ms once at creation with the speed in force and never recomputed after a speed change; the backlog top-item window is a real timer in `app/session` (Story 3.8). [Source: game-architecture.md#Time bases]
- **D3 entry points and Replay contract:** `app` owns the live state, calls `applyCommand` and `advance`, publishes through signals; callers advance up to `nowGameMs` before every command except right after a blocking stop. [Source: game-architecture.md#State Management (D3)]
- **C3 configuration:** Timing and Game speed are simulation settings; every mid-run change is a command in the input log; presentation preferences are not. A setting that changes replay but is not logged is a bug. [Source: game-architecture.md#Configuration; project-context.md#Critical Don't-Miss Rules]
- **Performance:** the present loop runs on `requestAnimationFrame` and stops when hidden; the only hidden-tab work is the preview in Story 3.10; no other `setInterval`, polling or animation while hidden; hot paths (`advance`, render) have no logging, no `JSON.stringify`, no fingerprinting and no whole-collection copies per event. [Source: project-context.md#Performance Rules]
- **Timers:** "no timers for game logic, anywhere". Real timers exist only in `platform/clock` (present loop), `app/backgroundPreview` and the backlog top-item timer in `app/session`. This story creates the first of these and none other. [Source: project-context.md#Core Purity & Determinism Rules]
- **Browser lifecycle:** persist on `visibilitychange → hidden` and `pagehide`, never `unload`/`beforeunload`. Persisting is Story 1.9; this story only subscribes to `visibilitychange` for the loop. [Source: project-context.md#Browser Platform Rules]
- **Overlays pause through the clock-state rules**, never ad hoc timers; overlays never stack. [Source: project-context.md#Critical Don't-Miss Rules]
- **Files to change (UPDATE):** `src/core/constants.ts`, `src/core/run/settings.ts`, `src/core/time/index.ts`, `src/core/index.ts`, `src/platform/index.ts`, `src/app/index.ts`, `knip.json`, `_bmad-output/game-architecture.md`, `_bmad-output/implementation-artifacts/deferred-work.md`. For each, read the whole file first; preserve: every existing export name, the `core → shared` import rule, and the exact semantics of `applyCommand`/`advance`/`replay` (no behaviour change in `core/run`).
- **Files to create (NEW):** `src/core/time/{gameSpeed,pauseReasons,convertRealWindowToGameMs}.ts` (+ tests), `src/platform/clock/**`, `src/platform/visibility/**`, `src/app/session/**` (+ tests). No `utils.ts`/`helpers.ts`.

### Testing standards for this story

- Colocated unit tests; names state behaviour (`it('adds no game time while Deploy is pending')`). Core tests run in Node with no DOM; platform and app tests run in happy-dom. No DOM snapshots. fast-check `numRuns` comes from global config; do not hard-code it.
- Scenarios covered: **CLK-01**, **CLK-02**, **CLK-03** (all P0, H1 gate), **DET-09** (speed changes replay; presentation actions do not move the fingerprint), plus DET-01-style live-equals-replay through the session. Not this story: CLK-04 and later (away, backlog timers), ABS-*, UI scenarios. [Source: game-test-design.md#CLK-01, #CLK-02, #CLK-03, #DET-09]
- Mock only at the `platform/` boundary: a fake `readNowRealMs`, a fake frame scheduler (manual `tick`), a fake visibility source. Never mock `core/`: call it. Build states through `makeState`/`makeStateWithEvents`, never `GameState` literals.
- Shrunk fast-check counterexamples become permanent regression tests.

### Project Structure Notes

- Matches the architecture tree: `core/time` ("event queue, advance, clock-state pause rules"), `platform/clock` ("real time → game time"), `platform/visibility` ("visibilitychange, pagehide"), `app/session` ("live state in signals, dispatch, present loop"). Variances to record in the PR: `GameSpeed` moves from `core/run` to `core/time` (C-4); the replay contract is enforced in `app/session` and not by a new core `step()` (C-10); the pause set lives in `app/session` while its vocabulary lives in `core/time` (C-6); `isAwaitingDeploy` is a session flag until Story 1.8 (C-7).
- `pagehide` is declared in the `platform/visibility` folder purpose but belongs to autosave (Story 1.9); do not add it now.

### Project Context Rules

Extracted from `_bmad-output/project-context.md` (binding; "when in doubt prefer the more restrictive option"):

- **Stack pins.** TypeScript 6.0.x strict; Preact 10.29.x + @preact/signals 2.11.x (no React, no `preact/compat`); Vitest 5.0 + happy-dom 21; fast-check 4.10; Node 24. No new dependency (none needed).
- **Core purity.** No `Date`, `performance`, timers, `Math.random`, DOM, signals in `core/`. Everything that happens later is a queue event. Updates return new objects. Integers only; divide with `divideRounded`.
- **Signals.** Shared signals live in `app/` only. Never `signal()`/`computed()` in a component body. Fine-grained updates; one state write per frame.
- **Naming.** Unit suffix on every number with a unit (`windowRealMs`, `anchorGameMs`, `realMsPerGameMs`); functions start with a verb (`createSession`, `convertRealWindowToGameMs`, `watchVisibility`); booleans `is`/`has`/`can`; commands imperative, events past tense; named exports only; folders camelCase; abbreviations only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi`.
- **Layers.** `ui → app → core → shared`; `app → platform → shared`; `core` imports only `shared`; import through `index.ts` only; `ui` never imports `core` or `platform`.
- **Determinism.** Anything that affects the run is a command in the input log; `changeGameSpeed` is. Pausing, visibility and the awaiting-Deploy hold are presentation/clock state outside the log (they only decide when `advance` is called, and replay never needs them because chunk invariance makes the same events happen at the same game times).
- **Hidden state.** Nothing here reads `alignmentMilli`/`hypeBp` or exposes them; the session exposes `state` to `app` internals only. No selector for hidden fields.
- **Strings and numbers.** No UI is built here, so no `t()` strings and no formatters. Do not add `locales/en/ui.json` keys.
- **Tuning.** No new tuning key (C-15). Speed divisors are game constants.
- **Testing.** Builders not literals; mock only at `platform/`; keep the invariants green (chunk invariance, replay equals live, snapshot + tail equals full replay).
- **Code Quality Charter.** Search before creating (`divideRounded`, `assertInvariant`, `Result`, `makeStateWithEvents` exist); no abstract bases, speculative options, event buses or pass-through wrappers; no AI-style comments (a comment states a non-obvious why only: C-9 and the replay contract each deserve one line); no defensive noise; no `any`, `!`, `@ts-ignore`; functions ≤ 40 lines, files ≤ 300, complexity ≤ 10, ≤ 3 parameters (use an options object).
- **CI is the definition of done**; never disable a gate; a suppression needs a written reason; run the Agent Review Checklist before closing.

### Previous Story Intelligence (Stories 1.5, 1.4, 1.3, 1.2)

- **1.5 changed the signatures this story calls:** `advance(state, untilGameMs, { mode, tuning })`, `newRun(start, tuning)`, `replay(start, inputLog, tuning)`. The session takes the `EconomyTuning` as an option and passes the same object everywhere; never read tuning from another source (replay depends on the pinned pack). `app/content/loadContentIndex` exposes `tuning` for the later wiring (Story 1.8/1.9), not used here.
- **1.5 left `selectRunway` as a plain function "until app/session exists (Story 1.6); 1.8 wraps it in `computed`".** Leave it; the wrapping needs a consumer.
- **1.5 reviews (5 runs)** found gaps in boundaries and test strength: probe zero/overflow/negative, same-`gameMs` ordering, `advance` over many days equal to many single-day calls. Expect the same scrutiny of: frame deltas of 0, a huge frame gap, speed change at the exact day boundary (`nowGameMs === GAME_DAY_MS`), and `dispose` races.
- **1.2 deferred two items this story must address or restate:** "Back-to-back commands without an `advance` replay differently" (resolved here by C-10) and "Replay ignores the advance mode" (restated for 3.5/5.10). It also deferred "Queue copied per event on the hot path"; irrelevant at today's queue sizes, do not touch.
- **1.4 gave `formatGameDay` (`Day 38`) and the "Day 1 is the first day" rule** (1.5 C-5): this story shows no time, so it adds no formatting; Story 1.8 renders `Day N` from `state.nowGameMs`.
- **Process notes from user memory.** One PR per story from branch `story/1-6-game-clock-presence-and-clock-states`, squash-merged; code-review loop (max 5 runs, stop on a clean run) before opening the PR; `main` needs approval and Tiziano bypasses as admin only after green CI; after the PR is open, explain it to Tiziano in Italian, plain, what and why; a separate "Close story" PR sets status to done.

### Git Intelligence

Last commits: `13f1698` close 1.5 (#13), `c095892` Story 1.5 daily economy step (#12: `core/economy`, `economyStep` event, `AdvanceContext`, `app/selectors/selectRunway`, tuning schema bounds), `5cc114a` close 1.4 (#11), `60d6168` Story 1.4 i18n (#10), `44a023f` close 1.3 (#9). Pattern: each story adds a new pure module with an `index.ts`, colocated tests, builders in `tests/builders/`, an architecture-doc update in the same PR, and a `deferred-work.md` edit for review leftovers.

### Latest Technical Information

- `requestAnimationFrame` is paused by browsers in hidden tabs (Chrome, Firefox, Safari), but not reliably on every engine/mode and never to be relied on for correctness: stop the loop explicitly on `visibilitychange` (AC 5) and re-anchor on visible, instead of trusting the browser to stop calling the callback.
- `performance.now()` is monotonic within a page, so a "negative real delta" only arises from the system wall clock (`Date.now`) in the away path (Story 3.5); the `max(0, …)` guard here is defence for injected clocks and test doubles, and the AC wording requires it.
- `performance.now()` returns a double with sub-millisecond precision (reduced to 100 µs or 1 ms in some browsers for privacy); flooring the total elapsed time once, as the anchor model does, is exact enough and drift-free.
- `@preact/signals` 2.11: `signal`, `computed`, `effect`, `batch` from `@preact/signals`; `ReadonlySignal<T>` is the exported read-only type. Use `batch` only where two writes must be observed together; one `state` write per frame needs no batch. No external research needed beyond that; no library API is introduced.

### References

- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Story 1.6: Game clock, presence and clock states; #FR1, FR2, FR54; Story 1.8 (Deploy), 2.3 and 3.8 (real-seconds windows), 3.5 (away), 3.10 (hidden preview), 8.3 (speed UI)]
- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md#Clock States, M1]
- [Source: _bmad-output/game-architecture.md#Simulation Time Model (D1); #State Management (D3) → Replay contract; #Configuration; #Project Structure (core/time, platform/clock, platform/visibility, app/session); #Agent Review Checklist]
- [Source: _bmad-output/project-context.md#Core Purity & Determinism Rules; #Browser Platform Rules; #Performance Rules; #Critical Don't-Miss Rules; #Testing Rules]
- [Source: _bmad-output/game-test-design.md#CLK-01, #CLK-02, #CLK-03, #DET-09]
- [Source: _bmad-output/implementation-artifacts/1-5-daily-economy-step.md; 1-2-deterministic-core-skeleton.md; deferred-work.md (1.2 run entries)]
- [Source: src/core/time/{advance,eventHandler,eventKinds,timeState,index}.ts; src/core/run/{applyCommand,command,settings,gameState,replay,newRun}.ts; src/core/constants.ts; src/app/selectors/selectRunway.ts; tests/builders/*; knip.json; vitest.config.ts; eslint.config.js]

## Default decisions taken without a human (confirm or overrule)

1. **Anchor-based clock** (`anchor + floor(max(0, nowReal − anchorReal) / divisor)`), re-anchored on start, pause, resume, speed change and visible; not a sum of frame deltas (C-2).
2. **Speed divisors as game constants** (`full` 1, `half` 2, `quarter` 4) in `core/constants.ts`, not tuning: they are the GDD's fixed definition of the speeds, and putting them in tuning would let a pack change what "½×" means (C-3).
3. **`GameSpeed` moves to `core/time`** so the shared real-window helper can live there and Stories 2.3 and 3.8 can import it without a cycle (C-4, C-5).
4. **Pause vocabulary in `core/time`, the live set in `app/session`** as an immutable `ReadonlySet` signal with idempotent add/remove; `backlog` is only a pause reason here, its top-item timer is Story 3.8 (C-6).
5. **Awaiting Deploy is a session flag with a `markDeployed()` seam**, replaced by the logged `deploy` command in Story 1.8; no `GameState` field, no queue event (C-7).
6. **Hidden time is dropped, not simulated** until Story 3.5 adds the away simulation; the loop re-anchors on visible (C-9).
7. **The replay contract is enforced in `app/session.dispatch`** (always advance before a command, never advance after a blocking stop until a command is logged), not through a new core `step()` entry point; this resolves the 1.2 deferred decision (C-10).
8. **The present loop only uses `'present'` mode**; the advance-mode-not-in-the-log gap stays open for 3.5 and 5.10 (C-10).
9. **No domain-event delivery yet**: events returned by `advance` are not routed anywhere until reactors exist (C-11).
10. **`@preact/signals` leaves knip's `ignoreDependencies`** as its first real use (C-14).
11. **No UI, no `main.tsx` wiring** in this story; verification is unit and property tests with fake platform sources, and the existing Chromium smoke e2e must stay green (C-1, C-15).

## Open Questions (for Tiziano; defaults above are applied if unanswered)

1. Should the time spent in a hidden tab before Story 3.5 lands be dropped (default) or simulated on return with a plain `advance`? Dropping keeps hidden = no work and avoids a catch-up spike in H1 playtests; 3.5 replaces it with the capped away simulation either way.
2. Is a one-session `markDeployed()` seam acceptable until Story 1.8, or should this story already add a `deploy` command to `core/run` (which would also need the input-log entry and a `GameState` field)? Default: seam only, because the command's shape (and its cascade anchor in Story 2.12) belongs with the founding flow.
3. Should the stop on a blocking event pause the clock through the `heavyDecision` pause reason (set by the session when the stop kind is `heavyDecisionDue`) instead of the separate `isBlockedByStop` flag? Default: the separate flag, since a death (Story 5.x) also stops and is not a pause reason; Story 4.5 can add the mapping when the heavy-decision overlay exists.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5[1m]), gds-dev-story, unattended.

### Debug Log References

- `npm run check`: exit 0 (i18n:types, typecheck, lint, lint:fixtures, lint:css, format:check, dup 0 clones, knip, i18n:missing, build, size 4.98 kB gzip, vitest 51 files / 512 tests).
- `npm run test:e2e`: Chromium 2/2 and WebKit 2/2 pass; Firefox 0/2 because the local Playwright Firefox binary fails to launch in this sandbox (`browserType.launch: Failed to launch the browser process`), before any page loads. Not related to this story (no UI change); CI runs Chromium on PRs.
- Mutation probes on `createDispatch`: removing the advance-before-command makes the live-equals-replay property, the back-to-back regression test and the between-frames test fail; advancing after a blocking stop makes both blocking-stop tests fail.

### Implementation Plan

- `core/time`: `gameSpeed.ts` (moved from `core/run/settings.ts`), `pauseReasons.ts`, `convertRealWindowToGameMs.ts`; `REAL_MS_PER_GAME_MS_BY_SPEED` in `core/constants.ts` (`as const satisfies Record<GameSpeed, number>`, type-only import from `./time`).
- `platform/clock`: `createGameClock({ onFrame, sources })` with `start(fromGameMs, realMsPerGameMs)`, `stop()`, `readGameMs()`; anchor-based conversion; one frame requested at a time, next frame requested only after `onFrame` (which may stop the clock). `browserClockSources` binds `performance.now` / `requestAnimationFrame` / `cancelAnimationFrame` lazily.
- `platform/visibility`: `isDocumentVisible`, `watchVisibility`, and a `VisibilitySource` pair (`browserVisibility`) so the session can take a fake.
- `app/session`: `createSessionSignals` (state, pause set, awaiting Deploy, visibility, blocked-by-stop, `isClockRunning` and `realMsPerGameMs` computeds), `createPresentLoop` (the one `advance` call site, the frame handler, an `effect` that starts/stops/re-anchors the clock whenever `isClockRunning` or the speed divisor changes), `createDispatch` (replay contract), `updatePauseReasons`, `createSession` (wiring, visibility subscription, public API).

### Completion Notes List

- All ACs covered: CLK-01 (60 s = 1 day at 1×, 120 s at ½×, 240 s at ¼×, same cash per day), CLK-02 (each of the five reasons freezes time; no catch-up on resume; set semantics), CLK-03 (game time 0 while awaiting Deploy; backwards real clock adds zero), hidden tab (pending frame cancelled, hidden time excluded), DET-01/DET-09 live-equals-replay property through the session with pauses, visibility, Deploy, stops and setting changes, explicit two-speed-change property, presentation actions keep the fingerprint, AC 7 window property (a window converted at speed s runs out after exactly its real time through the clock).
- New choices beyond the Default decisions:
  1. **Clock API is `start(fromGameMs, divisor)` / `stop()` / `readGameMs()` plus an `onFrame` option**, not a separate `changeDivisor` or frame subscription: `start` on a running clock re-anchors, which is all a speed change needs; one callback at creation replaces a subscription list (no speculative extension point).
  2. **The session re-anchors through one `effect`** on `isClockRunning` and a `realMsPerGameMs` computed of the current `gameSpeed`; `dispatch` itself therefore needs no special case for `changeGameSpeed` (C-10 step 4 is satisfied by the effect).
  3. **Frames with no game-time progress write nothing** (`target > nowGameMs` guard), so a zero-delta frame keeps the state reference. Commands still always advance (even zero-length) so same-`gameMs` events are processed as replay does; chunk invariance makes the skipped zero-length frame equivalent.
  4. **The sub-frame time between the last frame and a stop is dropped** (no extra advance on stop). Determinism is unaffected; recorded in `deferred-work.md`.
  5. **A rejected command (`settingUnchanged`) does not clear a blocking stop**: only a logged command does (C-10 wording).
  6. **Test harness in `tests/builders/`**: `makeFakeClockSources` (manual time and frame scheduler) and `makeSessionHarness` (session on fake clock and fake visibility, real core). `commandArbitrary` is now exported for the session property.
  7. `GameSpeed`/`gameSpeeds` are no longer exported by `core/run/index.ts` (they come from `core/time/index.ts`); `core/index.ts` still exports both, so no public import changed. `REAL_MS_PER_GAME_MS_BY_SPEED` is added to `core/index.ts`.
- Story 1.6's Open Questions were answered with the defaults (hidden time dropped; `markDeployed()` seam; separate `isBlockedByStop` flag).
- The Firefox e2e launch failure is environmental (see Debug Log); Chromium, the PR gate, is green.

#### Agent Review Checklist (ticked, for the PR)

- [x] I searched for an existing primitive, pattern or helper before creating one. (`divideRounded`, `Result`/`ok`, `advance`, `applyCommand`, `replayFrom`, `makeState`/`makeStateWithEvents`, `makeEconomyTuning` reused; no `utils`/`helpers`.)
- [x] No duplicated logic. Second occurrences are extracted where the concept is the same. (One `advance` call site in `createPresentLoop`; jscpd 0 clones.)
- [x] Names use the GDD glossary, carry units, and need no comment. (`heavyDecision`, `backlog`; `windowRealMs`, `anchorGameMs`, `realMsPerGameMs`, `fromGameMs`.)
- [x] Every comment states a *why* that the code cannot. (Anchor vs frame deltas, replay contract, hidden time dropped, set not counter, GameSpeed location.)
- [x] Core code is pure: no clocks, no `Math.random`, no I/O. (Only `platform/clock` reads `performance.now` / rAF; core lint and lint fixtures green.)
- [x] New content kinds or predicates have schema, implementation and test. (None added; no tuning or content change, `contentPackVersion` unchanged.)
- [x] Tests describe behaviour and use the shared builders. (Mock only at `platform/`: fake clock sources and fake visibility; core never mocked.)
- [x] Lint, jscpd, knip, Stylelint, size-limit and tests pass. (`npm run check` exit 0; knip now proves `@preact/signals` is used.)

### File List

New:
- `src/core/time/gameSpeed.ts`
- `src/core/time/gameSpeed.test.ts`
- `src/core/time/pauseReasons.ts`
- `src/core/time/convertRealWindowToGameMs.ts`
- `src/core/time/convertRealWindowToGameMs.test.ts`
- `src/platform/clock/clockSources.ts`
- `src/platform/clock/createGameClock.ts`
- `src/platform/clock/createGameClock.test.ts`
- `src/platform/clock/index.ts`
- `src/platform/visibility/watchVisibility.ts`
- `src/platform/visibility/watchVisibility.test.ts`
- `src/platform/visibility/index.ts`
- `src/app/session/session.ts`
- `src/app/session/createSession.ts`
- `src/app/session/createSessionSignals.ts`
- `src/app/session/createPresentLoop.ts`
- `src/app/session/createDispatch.ts`
- `src/app/session/updatePauseReasons.ts`
- `src/app/session/index.ts`
- `src/app/session/createSession.test.ts`
- `src/app/session/createSession.edgeCases.test.ts`
- `src/app/session/createSession.replay.test.ts`
- `tests/builders/makeFakeClockSources.ts`
- `tests/builders/makeSessionHarness.ts`

Modified:
- `src/core/constants.ts`
- `src/core/index.ts`
- `src/core/time/index.ts`
- `src/core/run/settings.ts`
- `src/core/run/command.ts`
- `src/core/run/index.ts`
- `src/core/run/assertStateIsValid.ts`
- `src/platform/index.ts`
- `src/app/index.ts`
- `tests/builders/arbitraries.ts`
- `tests/builders/index.ts`
- `knip.json`
- `_bmad-output/game-architecture.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-6-game-clock-presence-and-clock-states.md`

## Change Log

- 2026-10-28: Story created (status ready-for-dev) by gds-create-story, unattended.
- 2026-10-28: Implemented by gds-dev-story (unattended): `core/time` game speeds, pause reasons and real-window helper; `platform/clock` anchor-based clock and frame loop; `platform/visibility`; `app/session` with signals, pause set, awaiting-Deploy seam, present loop and replay-contract `dispatch`; CLK-01/02/03, DET-01/09 and edge-case tests; architecture and deferred-work updates. Status → review.

### Review Findings

Run 1 (3 layers: Blind Hunter, Edge Case Hunter, Acceptance Auditor): 0 decision_needed, 3 patch, 5 defer, rest dismissed as noise or duplicates (disclosed deviations, tests-only robustness, already-deferred sub-frame loss).

- [x] [Review][Patch] A throwing `onFrame` left the clock running with no frame requested [src/platform/clock/createGameClock.ts:runFrame] — fixed with try/finally, test added
- [x] [Review][Patch] "Window unchanged by a later speed change" test was tautological [src/app/session/createSession.replay.test.ts] — removed (the core property covers purity)
- [x] [Review][Patch] `passRealMs` looped forever on `frameRealMs <= 0` [tests/builders/makeSessionHarness.ts] — now throws
- [x] [Review][Defer] Window conversion rounds, clock floors — deferred, spec mandates `divideRounded`; decide with 2.3 / 3.8
- [x] [Review][Defer] Stop cleared by the same dispatch / any command clears a stop — deferred, default decision C-10; revisit in 4.5
- [x] [Review][Defer] `Session.state` exposes full `GameState` to `ui` — deferred to 1.8
- [x] [Review][Defer] Calls after `dispose` still mutate — deferred to 1.8 lifecycle
- [x] [Review][Defer] Long visible gap (sleep) simulated in one frame — deferred to 3.5


Run 2 (single pass by the reviewer; the three layers were not run as separate subagents, so run 3 repeated the full workflow): 0 decision_needed, 0 patch, 0 new defer. Checked the run 1 fix (try/finally in `runFrame`), the effect re-anchoring on speed change and stop, the stop-then-dispatch path, pause/hidden frame-tail loss (under one frame, dropped by design, C-9) and the boundary and knip changes; all correct. Nothing new found; `npm run check` green.

Run 3 (3 layers as parallel subagents: Blind Hunter, Edge Case Hunter, Acceptance Auditor): 0 decision_needed, 0 patch, 1 new defer. Deferred: a session built from a state already at a blocking stop starts unblocked (Story 1.9 load path). Dismissed: stop cleared by the same dispatch (already deferred, C-10), sub-frame loss on pause/re-anchor (already deferred), no input validation in `createGameClock` (internal typed callers, constant divisors), stale rAF callback after `cancelFrame` (real rAF cancels reliably), `clock` TDZ in the closure (works, only called after assignment), a throwing `onFrame` rescheduling forever (run 1 fix, by design), a rejected command keeping the pre-advance (matches D3 and replay), weak-test nitpicks, the type-only `core/constants` to `core/time` import (prescribed by C-3, no runtime cycle). `npm run check` green.
