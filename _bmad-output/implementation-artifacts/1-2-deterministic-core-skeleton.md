---
baseline_commit: 928552a1677e8fcee14257812b07ec0b1cf88f35
---
# Story 1.2: Deterministic core skeleton

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the pure simulation skeleton (state, commands, event queue, `advance`, RNG streams, replay and fingerprint) with its invariants tested from day one,
so that every later mechanic is deterministic and replayable by construction.

## Acceptance Criteria

Source: epics.md → Story 1.2. The **clarifications** under "Binding clarifications" below override the literal AC text where they differ (they exist because the literal text collides with a lint limit or leaves a gap).

1. **`newRun` is deterministic and plain-data.** **Given** `newRun` called with `seed`, `loopNumber`, `contentPackVersion` and `settings`. **When** it is called twice with the same arguments. **Then** both states have the same fingerprint.
   - **And** the state contains only readonly plain data: no classes, `Map`, `Set` or `undefined` values, and every number is a safe integer.
2. **`advance` orders the queue and reports why it stopped.** **Given** an event queue holding events with equal `gameMs`. **When** `advance(state, untilGameMs, 'present')` processes them. **Then** they run in `(gameMs, kind priority, id)` order, whatever the insertion order.
   - **And** `advance` returns `{ state, events, stoppedBy }`, with `stoppedBy` set when a blocking event kind is reached.
   - **And** the modes `present`, `away` and `ending` are accepted by the signature (mode-specific rules are added by later stories).
3. **`applyCommand` validates and logs.** **Given** `applyCommand(state, command, atGameMs)`. **When** the command is valid. **Then** it returns `ok` with the new state and appends `{ atGameMs, command }` to the input log.
   - **And** an invalid command returns a typed `CommandError` without changing the state (DET-10).
4. **RNG streams are isolated.** **Given** a run seed. **When** subsystem streams are derived. **Then** each named stream (`messages`, `deck`, `candidates`, `investors`, `outcomes`, `headlines`, `documents`) is `hash(runSeed, streamName)`.
   - **And** drawing from one stream never changes the draws of another (property test, DET-05).
5. **The three replay invariants hold under fast-check (DET-01, DET-02, DET-03).** **Given** random seeds, random valid command sequences and random time splits. **When** the properties run. **Then** chunk invariance (`advance(advance(s, t1), t2) ≡ advance(s, t2)`), live ≡ `replay(…, inputLog)`, and snapshot + log tail ≡ full replay all hold.
   - **And** any shrunk counterexample is committed as a regression test.
6. **Fingerprint is canonical, synchronous and never in `advance`.** **Given** the fingerprint function. **When** it is called. **Then** it hashes a canonical serialisation (sorted keys, integers only) with SHA-256 synchronously, with no Web Crypto or other I/O.
   - **And** it is never called inside `advance` (nor `applyCommand`).
7. **One rounding path, IDs from counters.** **Given** the shared rounding helper. **When** integer division is needed in `core/`. **Then** it is the only rounding path: no `Math.round` or `toFixed` in `core/`, and `lint:fixtures` proves both are rejected.
   - **And** IDs come from counters in state (`evt-000001`), never from random values.
8. **Gates stay green.** `npm run check` passes on Node 24 (typecheck, lint, `lint:fixtures`, `lint:css`, `format:check`, `dup`, `knip`, build, `size`, tests) and the e2e smoke test still passes. No gate is disabled.

### Binding clarifications (read before coding)

- **C-1. `newRun` takes one options object.** The epic writes `newRun(seed, loopNumber, contentPackVersion, settings)`, but `max-params` is 3 (lint-enforced). Use `newRun(start: RunStart)` where `RunStart = { seed, loopNumber, contentPackVersion, settings }`. "Same arguments" in AC 1 means a structurally equal `RunStart`.
- **C-2. `replay` takes the whole `RunStart`.** The epic writes `replay(seed, inputLog)`, but replay also depends on `loopNumber`, `contentPackVersion` and `settings` (architecture D4: "stored in the save, so replay never depends on the profile"). Use `replay(start: RunStart, inputLog)`. Also export `replayFrom(state, inputLog)`: `replay` is `replayFrom(newRun(start), inputLog)`, and snapshot + tail uses `replayFrom(snapshot, tail)`. One code path (D3: "the same code, not a parallel implementation").
- **C-3. The input log lives inside `GameState`** (`state.inputLog: readonly InputLogEntry[]`). This lets `applyCommand(state, command, atGameMs)` keep three parameters, makes the fingerprint cover the log, and makes snapshot + tail trivial (`tail = fullLog.slice(snapshot.inputLog.length)`). Story 1.9 owns the save record and may store the log once, outside the snapshot; that is a save-format concern, not a core one. Never compact the log (ADR-002).
- **C-4. Time contract.** `state.nowGameMs` is the current game time. `advance(state, untilGameMs, mode)` sets it to `untilGameMs`, or to the `gameMs` of the blocking event when it stops early. `applyCommand` requires `atGameMs === state.nowGameMs`; anything else is a caller bug, so it throws via `assertInvariant` (not a `CommandError`). Live play and replay both do "advance, then apply", so the log entry's `atGameMs` is the state's `nowGameMs` at that moment. A command logged while the run is blocked carries the blocking event's `gameMs`.
- **C-5. Skeleton event kinds.** There is no gameplay yet, but AC 2 needs ties between different kinds and a blocking kind. Ship exactly two kinds in `core/time/eventKinds.ts`, as the table later stories extend:
  - `dayBoundary`: non-blocking, priority 10. Its handler emits the domain event `gameDayStarted` and schedules the next `dayBoundary` one `GAME_DAY_MS` later. `newRun` schedules the first one at `GAME_DAY_MS`. Stories 1.5 (economy) and 1.9 (autosave per game day) hang off this.
  - `heavyDecisionDue`: **blocking**, priority 20. Its handler emits `heavyDecisionOpened` and `advance` stops right after processing it (`stoppedBy = { kind, eventId, atGameMs }`). It has no payload yet; Epic 4 replaces it with the real decision flow.
  - Nothing in `newRun` schedules `heavyDecisionDue`; tests enqueue it through the builders. Do not add more kinds or payload fields "for later".
- **C-6. Skeleton commands.** Ship only the two commands that already change replay and are named in the architecture (D2 → Configuration, DET-09): `{ type: 'changeGameSpeed'; speed: GameSpeed }` and `{ type: 'changeTiming'; timing: Timing }`. They update `state.settings`. Their only `CommandError` is `settingUnchanged` (a no-op is invalid and must not be logged). Story 1.6 owns the `app/session` `dispatch` wiring and clock behaviour; Story 8.x owns the Timing UI. Do not add gameplay commands, `foundCompany` (1.8) or message commands (2.x).
- **C-7. Settings values.** `GameSpeed = 'full' | 'half' | 'quarter'` (the architecture example uses `'half'`) and `Timing = 'standard' | 'extended' | 'relaxed' | 'untimed'` (GDD Accessibility table). Default for tests: `{ timing: 'standard', gameSpeed: 'full' }`. Settings only live in state here; nothing in `core/` reads them yet.
- **C-8. Game-day length.** `GAME_DAY_MS = 60_000` in `core/constants.ts`: game-ms equal real ms at 1× and "1 real minute = 1 game day" (GDD Time bases). Define it once; never write `60_000` elsewhere.

## Tasks / Subtasks

> Work in this order. Each phase ends with its tests green locally. Use Node 24 (`nvm use 24`; this machine's default is newer). Run `npm run check` before closing.

### Phase A: Foundations in `shared/` and `core/constants.ts` (AC 6, 7)

- [x] **A1. `shared/result.ts`:** `Result<T, E>`, `ok(value)`, `err(error)` (~10 lines, no library; architecture C1). Export from `shared/index.ts`.
- [x] **A2. `shared/brand.ts`:** `Brand<T, Name>` helper type for branded IDs. Do not create `MessageId`, `StaffId` and the like: each domain story adds its own ID type when it needs it.
- [x] **A3. `shared/sha256.ts`:** `sha256Hex(text: string): string`, synchronous, pure JS, UTF-8 via `TextEncoder`, no `crypto`/`SubtleCrypto`. Put the 64 round constants in `shared/sha256Constants.ts` and keep every function ≤ 40 lines. `shared/` admission holds: the fingerprint (`core`) and the D5 codec checksum (`platform/codec`, Story 1.10) both need it, and it knows nothing about the game.
  - Tests (`sha256.test.ts`, Node): NIST vectors (`""`, `"abc"`, the 448-bit `"abcdbcdecdef…nopq"` message), a multi-byte UTF-8 string, a length of 55, 56, 63, 64 and 65 bytes (padding boundaries), and a cross-check against `node:crypto` over a fast-check string property. `node:*` is only banned inside `core/`, so this test may import `node:crypto`.
  - If the dev prefers a dependency over hand-written code (`@noble/hashes` is already in `node_modules` transitively), stop and raise it: project-context says "no new runtime dependency without justification in the PR". Default is hand-written.
- [x] **A4. `core/constants.ts`:** `GAME_DAY_MS`, the `rngStreams` `as const` object (names exactly as in AC 4; "a stream name, once released, is never renamed"), the ID sequence width (6), and any other number the code needs. `no-magic-numbers` is off only in this file; everywhere else in `core/` only 0 and 1 are allowed.
- [x] **A5. `core/numerics/divideRounded.ts`:** the single rounding helper, integer arithmetic only (use `%` and subtraction: no `Math.round`, no `toFixed`, no float division). Rule: round half away from zero; a zero denominator is a bug (`assertInvariant`). Export from `core/numerics/index.ts` (a new module folder; add it to the Project Structure tree in game-architecture.md and keep the mapping row "Seed determinism, replay"). Test with positive and negative operands, exact multiples and exact halves. Add other rounding modes only when a story needs one.
- [x] **A6. Lint: ban `Math.round` and `.toFixed` in `core/`** (AC 7). Extend `no-restricted-properties` in the `core/**` block of `eslint.config.js` (an entry with `property: 'toFixed'` and no `object` matches any receiver), keeping the existing `Math.random` entry. Add fixtures `tests/lint-fixtures/src/core/mathRound.ts` and `toFixed.ts` and list both in `tests/lint-fixtures/expected.json` as `["no-restricted-properties"]`. Optional but cheap and in the same spirit (DET risk): ban `localeCompare`, `toLocaleString` and `Intl` in `core/` the same way, with fixtures. Remember the run proves each fixture fails and the clean controls still pass.

### Phase B: `core/rng` (AC 4)

- [x] **B1. Stream state is plain data.** pure-rand generators are stateful objects, so they never live in `GameState`. A stream's state is the `readonly number[]` returned by `generator.getState()` (xoroshiro128plus: four int32). To draw: rebuild with `xoroshiro128plusFromState(state)`, draw (`uniformInt` mutates only that throwaway instance), read `getState()` again and return `[value, nextState]`. Import from the sub-paths (`pure-rand/generator/xoroshiro128plus`, `pure-rand/distribution/uniformInt`); the package has no useful root export for tree-shaking. Verify the ESM type resolution works under `moduleResolution: bundler`; if not, raise it.
- [x] **B2. `deriveRngStreams(runSeed): RngStreams`** returns one state per name in `rngStreams`. State of stream `name` = `xoroshiro128plus(int32 from the first 4 bytes of sha256Hex(`${runSeed}:${name}`)).getState()`. The exact derivation is free as long as it is `hash(runSeed, streamName)`, documented in one *why* comment, stable, and tested for distinct states across names and seeds.
- [x] **B3. `drawInt(stream, min, max)`** returns `readonly [number, RngStreamState]`. Draws are by stream name through the state: `state.rngStreams[name]`. A helper that updates one stream and leaves the others referentially untouched is the unit the isolation test targets.
- [x] **B4. Tests:** DET-05 property (extra draws from stream A never change the next draws of every other stream); same seed → same draws; different names → different sequences; bounds respected.
- [x] **B5. Remove `pure-rand` from `ignoreDependencies` in `knip.json`.** It is now used; knip reports a stale ignore otherwise (same thing happened with `yaml` in 1.1).

### Phase C: `core/time` and `core/run` types (AC 1, 2, 3, 7)

- [x] **C1. Types** (readonly everywhere, discriminated unions, units in names, one concept per file):
  - `GameState` = `{ seed, loopNumber, contentPackVersion, settings, nowGameMs, queue: readonly QueuedEvent[], rngStreams, counters, inputLog }`. `seed` is a non-negative integer (`RunSeed` brand, see Open questions); `counters` holds the next sequence per ID prefix (`event` for now).
  - `QueuedEvent` = `{ id: EventId; gameMs: number; kind: EventKind }`; `EventId = Brand<string, 'EventId'>`, format `evt-000001` (zero-padded to the width in constants).
  - `Command`, `CommandError`, `InputLogEntry` = `{ atGameMs, command }`, `DomainEvent` = `gameDayStarted | heavyDecisionOpened`, `AdvanceMode`, `AdvanceResult` = `{ state, events, stoppedBy }`, `CoreStep` = `{ state, events }`.
  - `stoppedBy` is `null` when nothing blocked (no `undefined`; `undefined` is banned in state and avoided in results for the same reason).
- [x] **C2. `core/time/scheduleEvent.ts`:** takes the next ID from `state.counters`, inserts the event keeping `queue` sorted by `compareQueuedEvents`, returns a new state. No `push`, no mutation.
- [x] **C3. `core/time/compareQueuedEvents.ts`:** compares `(gameMs, kindPriority, id)`. Compare IDs as strings with `<`/`>` (zero-padded, so order equals creation order). **Never `localeCompare`**: it depends on the locale of the machine and would break cross-engine determinism (DET-08).
- [x] **C4. `core/time/advance.ts`:** loop while the head of the queue has `gameMs <= untilGameMs`: pop it, run its handler (`eventHandlers[kind](state, event, { mode })`), collect domain events in production order, stop right after a blocking kind (set `nowGameMs` to that event's `gameMs`, return `stoppedBy`). When it never stops, set `nowGameMs = untilGameMs`. `untilGameMs < state.nowGameMs` is a caller bug: `assertInvariant`. The handler table is typed `Record<EventKind, …>` so a new kind that has no handler does not compile. `mode` is passed to handlers through the context object and is otherwise unused for now; do not add an unused parameter.
  - No `Date`, timers, `console`, fingerprinting or `JSON.stringify` inside `advance` (project-context hot-path rule).
  - Keep functions ≤ 40 lines and ≤ 3 parameters: split event processing into `processNextEvent`.
- [x] **C5. `core/run/assertInvariant.ts`:** `assertInvariant(condition, message): asserts condition`; throws a plain `Error`. Bugs throw and are never caught in `core/` (architecture C1). Add `assertStateIsValid(state)`: walks the state and checks plain data and safe integers (see AC 1), queue sorted, IDs unique, `nowGameMs` safe. Call it at the end of `newRun` and `replayFrom` and from tests. Per call to `advance`/`applyCommand` only cheap checks (queue order of the touched slice, `nowGameMs` monotonic): do not walk the whole state per event.
- [x] **C6. `core/run/newRun.ts`:** builds the initial state from `RunStart`: derives streams, empty log, `nowGameMs = 0`, counters at 0, schedules the first `dayBoundary` at `GAME_DAY_MS`. No gameplay fields (cash, hype, alignment, phase come in 1.5 and later; do not pre-add them).
- [x] **C7. `core/run/applyCommand.ts`:** `Result<CoreStep, CommandError>`. Validate (`settingUnchanged`), apply, append `{ atGameMs, command }`, return `{ state, events: [] }`. On error return the error and nothing else: the caller keeps its previous state.
- [x] **C8. `core/run/replay.ts`:** `replayFrom(state, inputLog)` folds the log: for each entry, `advance(state, entry.atGameMs, 'present')` then `applyCommand`. An `err` while replaying a log entry means the log or the code is corrupt, so it throws (bug), it is not swallowed. `replay(start, inputLog)` = `replayFrom(newRun(start), inputLog)`. The folded domain events are returned too (`CoreStep`), so tests can compare events.
- [x] **C9. Public API in `core/run/index.ts`, `core/time/index.ts`, `core/rng/index.ts`, `core/numerics/index.ts`, `core/index.ts`.** Export only what other modules or tests consume; `core/run` and `core/time` import each other's public API only through `index.ts`. Watch for an import cycle `run → time → run` (types): keep shared types in the module that owns them and let `time` depend on `run` types through `index.ts` only if the boundaries rule allows it; if it makes a cycle, move the state types that both need into `core/run` and make `time` take a narrow structural type for what it reads/writes. Resolve it before writing logic.

### Phase D: Fingerprint (AC 1, 6)

- [x] **D1. `core/run/canonicalize.ts`:** deterministic string for plain data: object keys sorted with the default string order, arrays in order, integers only. It **throws** (`assertInvariant`) on `undefined`, `NaN`, non-integers, `bigint`, functions, symbols, `Map`, `Set`, class instances (prototype must be `Object.prototype` or `Array.prototype`) and cycles. Do not use `JSON.stringify` key order.
- [x] **D2. `core/run/fingerprint.ts`:** `fingerprint(state): string = sha256Hex(canonicalize(state))`. Called only from tests, save/load and the debug panel; never from `advance` or `applyCommand` (AC 6; the test below).
- [x] **D3. Tests:** same data with different key insertion order gives the same fingerprint; changing any of seed, loop number, content pack version, settings or the log changes it; the rejections listed in D1; a negative-zero check (`-0` is not canonical: reject or normalise, pick one and test it).
- [x] **D4. "Never called inside `advance`" test:** spy-free and simple: `advance` and `applyCommand` live in files that do not import `fingerprint` (assert with a small test that reads the two source files' import lists, or enforce with a lint `no-restricted-imports` override for `core/time/**`). Prefer the lint rule + fixture if it is a few lines; otherwise the import-list test.

### Phase E: Builders and property tests (AC 1–5)

- [x] **E1. `tests/builders/makeState.ts`** (+ `makeEvent`, `makeRunStart`): call the real `newRun`, then apply overrides (`makeState({ queue: [...] })`). Never hand-write a `GameState` literal. Export through `tests/builders/index.ts`; drop `tests/builders/.gitkeep`. Consider a `deepFreeze` in the builder so any in-place mutation inside the core throws during tests.
  - **Hazard to check first:** `tsconfig.node.json` includes `tests/` under `module: nodenext`, and `src/` files import each other without extensions. Importing `src/core` from `tests/builders` may fail `tsc -b` ("relative import paths need explicit file extensions"). Try it before writing the builders. If it fails, add `tsconfig.tests.json` (bundler resolution, same strict flags, includes `tests/builders`, `tests/fixtures`, `tests/golden`, `src`), reference it from the root `tsconfig.json`, and exclude those folders from `tsconfig.node.json`. Do not add extensions to `src/` imports and do not relax the strict flags. Confirm ESLint's `projectService` still finds a project for the builder files.
- [x] **E2. Arbitraries** (`tests/builders/arbitraries.ts` or colocated, whichever the properties need): seeds (`RunSeed` range), `RunStart`, valid command sequences with non-decreasing game times, random time splits.
- [x] **E3. Properties** in colocated tests (`core/run/replay.test.ts`, `core/time/advance.test.ts`; Node, no DOM). Scenarios from the test design:
  - **DET-01** live ≡ replay: apply commands live with interleaved `advance` calls, then compare `fingerprint(live)` with `fingerprint(advance(replay(start, live.inputLog), finalGameMs))`. Replay ends at the last log entry, so advance it to the live final time (chunk invariance makes that equal). Commands rejected by `applyCommand` (`settingUnchanged`) are not in the log and must not affect equality.
  - **DET-02** chunk invariance for random `t1 ≤ t2`: same fingerprint **and** the same domain events in the same order (concatenate the chunks' events).
  - **DET-03** snapshot + tail: snapshot at a random log index; `replayFrom(snapshot, fullLog.slice(snapshot.inputLog.length))` ≡ `replay(start, fullLog)`.
  - **DET-04** tie order: events inserted in random order via `makeState`/`scheduleEvent` with equal `gameMs`, both kinds, many IDs, run in `(gameMs, kind priority, id)` order; also a unit test that a `dayBoundary` and a `heavyDecisionDue` at the same `gameMs` run in that order and then stop.
  - **DET-06 (this story's part)** a walk over states after random runs: plain data, safe integers, no `Map`/`Set`/`undefined`/class instance (reuse `assertStateIsValid`, do not duplicate the walker).
  - **DET-10** unit: invalid command → `err`, previous state unchanged (same reference), log length unchanged.
  - Blocking: `advance` stops at `heavyDecisionDue`, `stoppedBy` set, later events stay queued, a second `advance` call resumes after it (it is not re-processed).
  - Absence-style big jump (one `advance` over 14 game days = 14 × `GAME_DAY_MS`) equals many small ones (a plain unit test, no new rules).
  - `mode` values `'present' | 'away' | 'ending'` all accepted and, for now, give identical results (unit test that pins this, so a later story changing it does it on purpose).
- [x] **E4. Regression tests:** if any property finds and shrinks a counterexample while building this story, commit it as a named permanent test (`it('keeps order when …')`, with the seed and path in the test). Do not commit an empty regression file.
- [x] **E5. Do not** create `tests/golden/` content or `npm run golden:update` (Story 1.11), a `window.__hitl` hook, a debug panel, save/IndexedDB code, Run ID formatting (Story 1.8), content-pack code (Story 1.3) or any `app/` wiring.

### Phase F: Close-out

- [x] **F1.** `npm run check` and `npm run test:e2e` (Chromium) green on Node 24. Confirm `npm run size` is unchanged (nothing in `core/` is imported by `main.tsx` yet; the budget must not move).
- [x] **F2.** Update docs that this story makes stale: the Project Structure tree for `core/numerics/` and `shared/` file names in game-architecture.md; `AGENTS.md` only if a rule or script changed (it should not).
- [x] **F3.** Run the Agent Review Checklist (game-architecture.md → Implementation Patterns) and paste it, ticked, in the PR. Code review loop before opening the PR (max 5 runs).
- [x] **F4.** Fill the Dev Agent Record below and set status to `review`.

### Review Findings

Code review run 1 (2026-10-28, gds-code-review: Blind Hunter, Edge Case Hunter, Acceptance Auditor). 13 patched, 7 deferred (see `deferred-work.md`), 6 dismissed.

- [x] [Review][Patch] DET-01 property could fail spuriously: `catchUp` skipped the live run's trailing zero-length advance that opened a second decision at the same `gameMs`; the driver now records the trailing advance, plus a named regression test [src/core/run/replay.test.ts]
- [x] [Review][Patch] `assertStateIsValid` accepted unknown event kinds, malformed or uncounted event ids (next `scheduleEvent` minted a duplicate), malformed or all-zero RNG streams, unknown settings values and out-of-range seeds [src/core/run/assertStateIsValid.ts]
- [x] [Review][Patch] An unknown command type from a corrupt log crashed with a TypeError instead of an invariant [src/core/run/applyCommand.ts]
- [x] [Review][Patch] `canonicalize` accepted sparse arrays (`[1,,3]`) and threw a hand-built `Error` instead of `assertInvariant` [src/core/run/canonicalize.ts]
- [x] [Review][Patch] "Only rounding path" lint gap: `Math.floor`/`ceil`/`trunc`, `toPrecision`, `toExponential` now banned in `core/`; fixtures added for them, for `toLocaleLowerCase`/`toLocaleUpperCase`, and for the hot-path ban, which now also covers the core root (`..`, `../../core`) [eslint.config.js, tests/lint-fixtures]
- [x] [Review][Patch] Input-log fingerprint test passed vacuously if the command was rejected [src/core/run/fingerprint.test.ts]
- [x] [Review][Patch] Released-derivation snapshot covered one stream only; a swapped stream went unnoticed [src/core/rng/deriveRngStreams.test.ts]
- [x] [Review][Patch] `divideRounded` property allowed any tie-breaking rule; exact halves now pinned away from zero [src/core/numerics/divideRounded.test.ts]
- [x] [Review][Patch] `newRun` spread every own field of `RunStart` into the state, so stray decoded fields reached the fingerprint [src/core/run/newRun.ts]
- [x] [Review][Patch] `drawInt` silently skewed draws for ranges wider than 2^53 [src/core/rng/drawInt.ts]
- [x] [Review][Patch] DET-02 and DET-04 properties never varied the run start (AC 5 "random seeds") [src/core/time/advance.test.ts, tests/builders/makeState.ts]
- [x] [Review][Patch] Replay contract for Story 1.6 lived only in the Dev Agent Record; added to game-architecture.md D3 [_bmad-output/game-architecture.md]
- [x] [Review][Patch] `arbitraries.ts` declared a constant above its imports and duplicated the settings value lists; core now exports `gameSpeeds`/`timings` [tests/builders/arbitraries.ts, src/core/run/settings.ts]
- [x] [Review][Defer] Two commands applied back to back without an `advance` between them replay differently (replay's zero-length advance can process another event due at that time) [src/core/run/replay.ts] — deferred, contract documented; enforcement is a Story 1.6 decision
- [x] [Review][Defer] `advance` and `scheduleEvent` copy the whole queue per event, against the hot-path rule [src/core/time/advance.ts:31, src/core/time/scheduleEvent.ts:27] — deferred, needs a queue representation decision
- [x] [Review][Defer] `assertInvariant` sits in `shared/` while only `core/` uses it (admission rule) [src/shared/assertInvariant.ts] — deferred, needs Tiziano's sign-off or a move to a `core` module
- [x] [Review][Defer] Event ids cap at 999,999 per run (`ID_SEQUENCE_WIDTH = 6`) [src/core/constants.ts] — deferred, decide before saves exist (Story 1.9)
- [x] [Review][Defer] Commands and `RunStart` are not decoded or normalised (extra fields logged by reference, invalid values accepted live, `loopNumber` unchecked) [src/core/run/applyCommand.ts] — deferred to the save/import decoder (Stories 1.9/1.10)
- [x] [Review][Defer] `sha256Hex` maps lone surrogates to U+FFFD (fingerprint is safe: `canonicalize` escapes them) [src/shared/sha256.ts] — deferred to Story 1.10 (export checksum caller)
- [x] [Review][Defer] Hot-path import ban covers `applyCommand.ts` and `core/time` but not helpers they import [eslint.config.js] — deferred, convention until a helper exists

Code review run 2 (2026-10-28, gds-code-review: Blind Hunter, Edge Case Hunter, Acceptance Auditor). 6 patched, 2 deferred (see `deferred-work.md`), 1 dismissed.

- [x] [Review][Patch] `-0` passed every time guard (`-0 === 0`), so `advance(state, -0)`, `scheduleEvent` at `-0` or `applyCommand(…, -0)` put `-0` into the state and log, after which `fingerprint`, `assertStateIsValid` and `replay` threw; new `core/numerics/withoutNegativeZero` normalises at those entry points (and in `divideRounded`), with regression tests [src/core/time/advance.ts, src/core/time/scheduleEvent.ts, src/core/run/applyCommand.ts, src/core/numerics/withoutNegativeZero.ts]
- [x] [Review][Patch] `assertStateIsValid` accepted an input log with entries after `nowGameMs` or out of order, a state its own log cannot replay [src/core/run/assertStateIsValid.ts]
- [x] [Review][Patch] `assertStateIsValid` accepted unreleased `rngStreams` keys and unknown `counters` keys, which then changed the fingerprint [src/core/run/assertStateIsValid.ts]
- [x] [Review][Patch] Run-1 `newRun` stray-field patch was partial: `settings` was still copied by reference with any stray keys; now picked field by field, and the "structurally equal starts" property uses `structuredClone` [src/core/run/newRun.ts, src/core/run/newRun.test.ts]
- [x] [Review][Patch] Hot-path import ban blocked only the `fingerprint` module name: `applyCommand`/`core/time` could import `canonicalize` plus `sha256Hex`, `assertStateIsValid`, `newRun` or `replay`; all now banned, with fixtures [eslint.config.js, tests/lint-fixtures]
- [x] [Review][Patch] The shrunk DET-04 counterexample (`[{ gameMs: 0, kind: 'dayBoundary' }]`) was not committed (AC 5, E4); now a named regression test [src/core/time/advance.test.ts]
- [x] [Review][Defer] Rounding lint ban does not catch truncation through `| 0`, `~~`, `>>> 0` or `parseInt` (and plain `/` is allowed) [eslint.config.js] — deferred: banning bitwise ops breaks int32 RNG/SHA code; review checklist covers it until a typed lint rule is worth writing
- [x] [Review][Defer] `replay` always advances in `'present'` mode; the live mode is not logged [src/core/run/replay.ts:14] — deferred: no handler reads `mode` yet; Story 1.6 (away/ending) must log mode changes as input

## Dev Notes

### What exists today (read before touching anything)

- `src/core/index.ts` and `src/shared/index.ts` are both `export {};`. `src/core/` and `src/shared/` contain nothing else. This story fills them; there is no existing game code to preserve.
- Layer rules are already lint-enforced (`eslint.config.js`): `core` imports only `shared` through its `index.ts`; sibling modules inside `core` import each other only through `index.ts`; deep imports fail. `core/**` also bans 26 restricted globals (including `crypto`, `console`, `globalThis`, `process`, `self`), `Math.random`, `node:*` imports, `preact`/`@preact/signals`/`idb` imports and dynamic `import()`. `no-magic-numbers` (0 and 1 allowed) applies in `core/` except `core/constants.ts` and test files.
- Limits that shape the code: function ≤ 40 lines, file ≤ 300, complexity ≤ 10, ≤ 3 parameters, nesting ≤ 3, no nested ternary, no `any`, no `!`, no `export default`, no TODO or commented-out code, every `eslint-disable` needs a description. `jscpd` (50 tokens, threshold 0) ignores tests but not `src` non-test files: extract at the second occurrence.
- TypeScript is strict with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `erasableSyntaxOnly` (no `enum`, no `namespace`, no parameter properties) and `verbatimModuleSyntax` (use `import type`). `lib` includes DOM for `src/` (so DOM globals typecheck there; the lint rule is what keeps `core/` pure).
- Vitest 5 has two projects: `core` (node, includes `src/{core,shared}/**/*.test.ts`) and `dom` (happy-dom, the rest of `src/`). Core and shared tests therefore run with no DOM. `FC_NUM_RUNS` (default 100, nightly 10000) is applied globally through `tests/setup/configureFastCheck.ts`; do not hard-code `numRuns` in properties.
- `tools/lintFixtures.ts` requires the error rule set of every fixture to match `tests/lint-fixtures/expected.json` exactly and fails on unlisted fixtures. New fixtures go under `tests/lint-fixtures/src/core/` and must be listed.
- `pure-rand`, `fast-check`, `fflate` etc. are installed (`~` pins). Installed pure-rand is 8.4.2: generators expose `next()`, `clone()`, `getState()`; `xoroshiro128plus(seed)` and `xoroshiro128plusFromState(state)` exist; the `jump()` method is on the jumpable generators.

### Architecture patterns and constraints

- **D1 / ADR-001:** one pure `advance(state, untilGameMs, mode)` over an ordered queue; chunk invariance is a tested invariant; ties break by `(gameMs, kind priority, id)`; never depend on object key order or `Map` insertion. Every later mechanic must be expressible as scheduled events: no timers for game logic.
- **D2:** one stream per subsystem, `hash(runSeed, streamName)`; stream names live in `core/constants.ts`; no float in persisted state; integers only (cents, basis points, milli-points, game-ms). Division only through the shared helper.
- **D3:** the UI never mutates state; two core entry points, `applyCommand` and `advance`; `replay` folds the same two. Commands are imperative, domain events past tense; events are data and replay regenerates them identically.
- **Error handling (C1):** expected failures are `Result` with a typed code (`CommandError`); bugs are exceptions via `assertInvariant`, never caught inside `core/`. `Result` is our own ~10-line type in `shared/result.ts`.
- **Entity IDs:** deterministic counters in state (`msg-000417`), never `crypto.randomUUID()`.
- **Replay Consistency (D4):** fingerprint = canonical serialisation (sorted keys, integers only) hashed with SHA-256. Fingerprint on save, load and in tests only: not in hot paths.
- **Naming:** unit suffix on every unit number (`atGameMs`, `untilGameMs`, `nowGameMs`, `gameMs`); `RunSeed` and `loopNumber` are counts/ids, not unit quantities; verbs first for functions; `as const` objects camelCase (`rngStreams`); true constants UPPER_SNAKE (`GAME_DAY_MS`); named exports only; file named after its main export; no `utils.ts` or `helpers.ts`; abbreviations only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi`.
- **Hidden state:** `alignmentMilli` does not exist yet. Do not add it. When it does (1.5+), only `alignment`, `staff`, `ending`, `save` and `run` may reference it inside `core/`.
- **Scope fences (other stories own these):** economy and starting cash (1.5), game clock / `app/session` / `platform/clock` / pause reasons (1.6), content pack and tuning (1.3), save record and IndexedDB (1.9), data-room export (1.10), debug panel, scenarios, goldens and `window.__hitl` (1.11), `foundCompany`/Run ID display (1.8), messages (2.3), the conditions/effects engine (2.2). The `stoppedBy` mechanism, the three modes and the log shape are the extension points they will use.

### Design decisions taken in this story (so the dev does not have to guess)

| Topic | Decision | Why |
|---|---|---|
| `newRun`, `replay` signatures | Options object / `RunStart` | `max-params` = 3; replay needs all start parameters (C-1, C-2) |
| Input log location | Inside `GameState` | Keeps `applyCommand` at 3 params, fingerprint covers the log, snapshot + tail is a slice (C-3) |
| Stream state | `readonly number[]` from `getState()`, rebuilt per draw | pure-rand generators are mutable classes; state must be plain data |
| SHA-256 | Hand-written in `shared/`, no new dependency | `crypto`/Web Crypto banned and async; two layers need it (fingerprint, codec checksum) |
| Rounding | `core/numerics/divideRounded`, half away from zero, `%`-based | Only rounding path; no `Math.round`/`toFixed` (AC 7) |
| Commands | `changeGameSpeed`, `changeTiming` only | Only commands that exist before gameplay and already affect replay (DET-09) |
| Event kinds | `dayBoundary` (non-blocking) and `heavyDecisionDue` (blocking) | Minimum that makes tie-break and `stoppedBy` real without inventing gameplay |
| `commandAtWrongTime` | Throws (bug), not `CommandError` | The caller always advances first; it is not a player-reachable failure |

### Testing standards for this story

- Unit tests colocated (`advance.ts` + `advance.test.ts`); `tests/` holds only builders here. Core tests run in Node, no DOM, no mocks of `core/` functions (they are pure: call them).
- Builders, not hand-built states. Test names state behaviour: `it('stops at the first blocking event and leaves later events queued')`.
- Properties use fast-check 4.10 through the global `numRuns`; shrunk counterexamples become permanent tests.
- Mutation sanity check before closing (not committed): break the tie-break comparator, swap two stream names, and make `advance` read `nowGameMs` differently; each must fail a named test. Record the result in the Debug Log.

### Project Structure Notes

- New files (all under the layer paths of game-architecture.md → Project Structure; one main export per file, named after it):
  - `src/shared/`: `result.ts`, `brand.ts`, `sha256.ts`, `sha256Constants.ts`, `index.ts` (+ `sha256.test.ts`, `result.test.ts` only if there is logic worth testing).
  - `src/core/constants.ts`.
  - `src/core/numerics/`: `divideRounded.ts`, `index.ts`.
  - `src/core/rng/`: `deriveRngStreams.ts`, `drawInt.ts`, types, `index.ts`.
  - `src/core/time/`: `eventKinds.ts`, `scheduleEvent.ts`, `compareQueuedEvents.ts`, `advance.ts`, handlers, `index.ts`.
  - `src/core/run/`: state, command, event and error types, `newRun.ts`, `applyCommand.ts`, `replay.ts`, `canonicalize.ts`, `fingerprint.ts`, `assertInvariant.ts`, `index.ts`.
  - `tests/builders/`: `makeState.ts`, `makeEvent.ts`, `makeRunStart.ts`, arbitraries, `index.ts`.
  - `tests/lint-fixtures/src/core/`: `mathRound.ts`, `toFixed.ts` (+ optional `localeCompare.ts` and friends), `expected.json` updated.
- Variance from the architecture tree: `core/numerics/` is new (the tree has no home for the rounding helper; the epic only says "shared rounding helper"). It is not `shared/` because no second layer needs it yet and the admission rule is "used by at least two layers". Move it to `shared/` if one does.
- Conflict to resolve in the PR: the epic and architecture sketch `newRun(seed, loopNumber, contentPackVersion, settings)` and `replay(seed, inputLog)`; this story deviates for the reasons in C-1/C-2. Update the epic text or the architecture snippet in the same PR so later stories read the real signatures.

### Project Context Rules

Extracted from `_bmad-output/project-context.md` and applying to this story:

- **Core purity.** No `Date`, `performance`, `setTimeout`/`setInterval`, `Math.random`, `crypto`, DOM, Preact, signals, `fetch` or storage in `src/core/**`. Time arrives as a `GameMs` argument; randomness as an `RngStream` argument. Everything that happens later is an event in the queue processed by `advance()`. The core is synchronous.
- **Plain data.** Readonly, no classes, no `Map`/`Set`, no `undefined` vs missing-key ambiguity; updates return new objects. No in-place mutation, no `push` on state arrays.
- **Deterministic order.** Sort by an explicit key whenever order matters; ties break by `(gameMs, kind priority, id)`.
- **Integers only; one rounding helper.** No ad hoc `Math.round` or `toFixed`.
- **IDs from counters in state.**
- **Determinism rules:** anything that affects the run is a command in the input log or a run start parameter (seed, loop number, content pack version); a setting that changes replay but is not logged is a bug. A new random draw uses its subsystem's stream; never borrow another stream and never rename a released stream name.
- **Hot paths** (`advance`, render, selectors): no logging, no `JSON.stringify`, no fingerprinting, no whole-collection array copies per event. Fingerprint only on save, load and in tests.
- **Testing:** every core change keeps the invariants green (chunk invariance, replay ≡ live, snapshot + tail ≡ full replay); builders not hand-built states; mock only at `platform/` boundaries; shrunk counterexamples become permanent tests; test names state behaviour.
- **Layers and imports:** `core` imports only `shared`, through `index.ts`; named exports only; no `utils.ts`/`helpers.ts`; `shared/` admission = used by at least two layers and game-agnostic.
- **Code Quality Charter:** reuse before create; names replace comments; comments only state a non-obvious *why*; no abstract base classes, speculative options or pass-through wrappers; expected failures are `Result`, bugs throw; no `any`, `!`, `@ts-ignore`; limits as above.
- **Before closing the story:** run the Agent Review Checklist and paste it, ticked, in the PR. CI is the definition of done; never disable a gate; a lint suppression needs a written reason.
- **No new runtime dependency** without justification in the PR. This story needs none.

### Previous Story Intelligence (Story 1.1; Story 8.1 is unrelated to this one)

- Node: the machine default is newer than 24; run `nvm use 24` before every `npm` command so the lockfile and engines match CI.
- The lint fixture runner is the proof that a rule works: every new rule needs a fixture that fails and is listed in `expected.json`; a config that rejects everything must not pass (keep clean control files). 1.1 found real bugs this way (test-file relaxations were silently covering the fixtures).
- ESLint's `tests/**` relaxations (`no-magic-numbers` off, function length off) apply to `tests/builders/**` and `*.test.ts`, not to `src/**`.
- knip reported stale `ignoreDependencies` entries for packages that became used (`yaml`). Same will happen with `pure-rand`: remove it from `knip.json` (task B5). `fast-check` is a devDependency already used by `tests/setup`.
- `tsc -b` uses two projects (`tsconfig.app.json` for `src`, `tsconfig.node.json` for configs, `tools`, `tests`); see the nodenext hazard in E1.
- Review loop after implementation found gate bypasses; expect the review to probe: can `core/` reach a clock or random source through a path the lint missed (aliasing, `globalThis`, `Intl`, `toLocale*`)?
- Follow-up from 1.1 (not this story): PR e2e install time; no action here.
- Deferred work ledger (`deferred-work.md`) has nothing for core or shared.

### Git Intelligence

Last commits: `928552a` close 1.1/8.1, `03a2cc9` Story 8.1 PDFKit spike (`report/` only, plus CI verapdf job and ADR 0003), `6d5ac8d` 1.1 review fixes (stricter fixtures and globals), `c8173de`, `46078d7` scaffold. Convention: one PR per story from branch `story/<key>`, squash-merged, story file in `_bmad-output/implementation-artifacts/`, status moves `ready-for-dev → in-progress → review → done`, and a final "Close story" PR. Nothing so far touches `core/` or `shared/`.

### Latest Technical Information

- pure-rand **8.4.2** (installed): sub-path exports only (`pure-rand/generator/xoroshiro128plus`, `pure-rand/distribution/uniformInt`, `pure-rand/utils/purify`, `skipN`, `generateN`); no root export. `xoroshiro128plus` is jumpable; `uniformInt(rng, min, max)` mutates the generator it is given. State round trip: `xoroshiro128plusFromState(generator.getState())`.
- fast-check **4.10** with Vitest 5: use `fc.assert(fc.property(...))`; `numRuns` comes from the global config; a failing run prints `seed` and `path` to replay (put both in the regression test).
- Node and all supported browsers must produce the same fingerprint (DET-08, checked in 1.11 on all four engines): avoid anything engine-dependent (locale APIs, `Number.prototype.toString` with radix on non-integers, key order of numeric-like keys). Integer arithmetic below 2^53 only.
- No web research was needed beyond the installed package API.

### References

- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Story 1.2: Deterministic core skeleton]
- [Source: _bmad-output/game-architecture.md#Simulation Time Model (D1); #Randomness and Numerics (D2); #State Management (D3); #Data Persistence (D4) → Replay Consistency; #Architecture Decision Records (ADR-001, ADR-002); #Cross-cutting Concerns → Error Handling, Event System, Configuration; #Project Structure; #Implementation Patterns → Entity Patterns, Code Quality Charter, Agent Review Checklist]
- [Source: _bmad-output/project-context.md#Core Purity & Determinism Rules; #Testing Rules; #Code Organization Rules; #Critical Don't-Miss Rules → Determinism]
- [Source: _bmad-output/game-test-design.md#1.1 Core Loop: Determinism and Replay (DET-01 to DET-06, DET-10, DET-12)]
- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md#Time bases; #Accessibility → Timing, Game speed]
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffold-quality-gates-ci-and-pages-deploy.md#Dev Agent Record]
- [Source: eslint.config.js (core block, limits, boundaries); vitest.config.ts; tools/lintFixtures.ts; tests/lint-fixtures/expected.json; knip.json; tsconfig.node.json]

## Open Questions (for Tiziano; defaults are applied if unanswered)

1. **Seed range.** The Run ID is 6 Crockford base32 characters (`7F3A-K2`), i.e. 30 bits. Default: `RunSeed` is an integer in `0..2^30-1` so the Run ID and the seed map one to one (Story 1.8 formats it). If a wider seed is wanted, the Run ID format changes.
2. **Skeleton event kinds and commands (C-5, C-6).** Default as written. If you prefer 1.2 to ship with test-only kinds instead, the cost is that production code and tests diverge.
3. **Input log inside the state (C-3).** Default as written; the alternative is a separate log argument to `applyCommand`/`advance`, which breaks the three-parameter signatures in the architecture.
4. **Hand-written SHA-256 versus `@noble/hashes`.** Default hand-written (no dependency).

## Dev Agent Record

### Agent Model Used

Story created by claude-sonnet-5-5 (Claude Code, gds-create-story). Implemented by claude-fable-5-1 (Claude Code, gds-dev-story), autonomous run on 2026-10-28, Node 24.18.1.

### Debug Log References

- **Phase order and gates.** A (shared, constants, numerics, lint rule) → B (rng) → C/D (time, run, fingerprint) → E (builders, properties) → F. Each phase ended green locally; `npm run check` green at close; `npm run test:e2e`: chromium and webkit green (the PR gate is chromium), Firefox could not launch on this machine (`Could not find profile folder`, Playwright Firefox Nightly build issue, unrelated to the story).
- **Lint rule probe (A6/D4).** First attempt put `'..'` in a `no-restricted-imports` `group`; gitignore-style matching turned it into a prefix and banned every `../x` import. Exact names (`.`, `./index`, `..`, `../index`) moved to `paths`; the `group` keeps `**/run`, `**/run/*`, `**/fingerprint`. The fixture runner caught it (8 false positives in `core/time`).
- **`no-magic-numbers` and object literals.** The rule ignores object-property values by default (`detectObjects: false`), so `eventKinds` can keep `priority: 10 | 20` in `core/time/eventKinds.ts` without a suppression. `-1` is flagged, so `SORT_BEFORE`/`SORT_AFTER` live in `core/constants.ts`.
- **`tsconfig.node.json` hazard (E1).** Confirmed: 11 TS2834/TS2835 errors on the builders under `nodenext`. Added `tsconfig.tests.json` (bundler resolution, same strict flags, includes `tests/builders`, `tests/fixtures`, `tests/golden`, `src`), referenced from the root, and excluded those folders from `tsconfig.node.json`. ESLint's `projectService` finds a project for the builders (lint green).
- **fast-check null prototypes.** `fc.record` generates `__proto__: null` objects by default; `canonicalize` rejects them by design (every command and save record has `Object.prototype`). The arbitraries pass `{ noNullPrototype: true }` and a `null-prototype object` rejection case is pinned in `canonicalize.test.ts`.
- **Shrunk counterexamples.** One property failed while building (DET-04, `[{ gameMs: 0, kind: 'dayBoundary' }]`): the test oracle ignored that a day boundary processed before `GAME_DAY_MS` reschedules inside the horizon. Oracle fixed (horizon `GAME_DAY_MS - 1`); no core bug. Code review run 2 committed it as a named regression test anyway (AC 5, E4). No other property found a counterexample at 100 or 1000 runs (`FC_NUM_RUNS=1000`).
- **Mutation sanity check (not committed).** Comparator id order reversed → 2 named tests fail (`orders by id, in creation order…`, `agrees with lexicographic order…`). Comparator priority reversed → 3 fail (incl. `runs a day boundary before a heavy decision due at the same gameMs, then stops`). `messages`/`deck` derivations swapped → `keeps the released derivation stable` fails. `advance` no longer sets `nowGameMs` per event → 5 fail (blocking, DET-01, DET-02, DET-03). `advance` never sets `nowGameMs = untilGameMs` → `moves nowGameMs to untilGameMs when nothing is due` fails. All five mutations reverted; working tree verified clean of `.bak` files.
- **Size.** Initial bundle 4.98 kB gzip, identical to the value recorded by Story 8.1; nothing in `core/` or `shared/` is imported by `main.tsx`.

### Completion Notes List

- **Decisions taken in place of asking (no human mid-run):**
  - Open question 1 (seed range): default applied, `RunSeed` is `0..2^30-1` (`RUN_SEED_MAX`), created through `toRunSeed` (asserts the range).
  - Open questions 2–4: defaults applied (production `dayBoundary`/`heavyDecisionDue` kinds and `changeGameSpeed`/`changeTiming` commands, input log inside `GameState`, hand-written SHA-256, no new dependency).
  - **`assertInvariant` lives in `shared/`, not `core/run`** (deviation from C5's path). `core/time` needs it (`advance`, `scheduleEvent`, `formatEventId`) and `core/time` must not import `core/run` (cycle; now lint-enforced). It is game-agnostic and `platform/codec` (1.10) and `app/errors` will use it. `core/run` keeps `assertStateIsValid`.
  - **No `run ↔ time` cycle:** `core/time` is generic over a narrow structural `TimeState` (`nowGameMs`, `queue`, `counters.event`); `GameState extends RunStart` and satisfies it. `DomainEvent` lives in `core/time` (its handlers produce the two events); `core/index.ts` re-exports everything.
  - **Stream derivation:** all four xoroshiro128+ state words come from the first 16 bytes of `sha256Hex(`${seed}:${name}`)` instead of `xoroshiro128plus(int32)`, whose initial state is the weak `[-1, ~seed, seed, 0]`. Still `hash(runSeed, streamName)`; pinned by an inline snapshot so a renamed or re-derived stream fails a named test. The constant is `rngStreamNames` (a readonly tuple), not an object, to leave `RngStreams` free for the state record type.
  - **Domain events carry `atGameMs`** (the fact of when they happened) and nothing else; `stoppedBy` carries `{ kind, eventId, atGameMs }`.
  - **Replay contract (C-4 made precise):** `replayFrom` does exactly one `advance(state, entry.atGameMs)` per log entry, then `applyCommand`. The log is replayable iff the live session never advances past a blocking stop before a command is logged at that time (the property test's live driver follows this; the final game's decision-resolution command satisfies it by construction). Story 1.6's `app/session` must keep this contract: after `stoppedBy`, no further `advance` until a command is dispatched. Replay throws (`corrupt log`) on an entry after an unresolved blocking stop or on a rejected command.
  - **Chunk invariance with blocks (DET-02):** stated as "if the first step stops at a block, the one-step result stops at the same block with the same state and events; otherwise the two-step result equals the one-step result".
  - **D4 enforcement:** lint rule + fixtures (preferred by the story): `core/time/**` (non-test) and `core/run/applyCommand.ts` cannot import `**/run`, `**/run/*`, `**/fingerprint`, `.`, `./index`, `..`, `../index`.
  - **Extra bans (A6 optional, taken):** `localeCompare`, `toLocaleString`, `toLocaleLowerCase`, `toLocaleUpperCase` properties and the `Intl` global in `core/`, each with a fixture.
  - **SHA-256 oracle in tests:** Web Crypto (`crypto.subtle.digest`) instead of `node:crypto`, so the cross-check needs no Node types in `tsconfig.app.json` and is itself cross-engine.
  - `canonicalize` accepts strings, booleans, `null`, safe integers (never `-0`), plain arrays and `Object.prototype` objects; rejects everything else with `assertInvariant`. `assertStateIsValid` reuses it as the single walker, then checks queue order, unique ids, `nowGameMs >= 0`, events not before `nowGameMs`.
  - `advance` sets `nowGameMs` to each processed event's `gameMs` as it goes (handlers see the current time), to the blocking event's time on a stop, and to `untilGameMs` otherwise; per-event checks are cheap (`head.gameMs >= nowGameMs`).
- **What was built:** `shared/` (`Result`, `Brand`, `assertInvariant`, `sha256Hex`), `core/constants.ts`, `core/numerics/divideRounded`, `core/rng` (`deriveRngStreams`, `drawInt`, `drawIntFromStreams`), `core/time` (`eventKinds`, `compareQueuedEvents`, `scheduleEvent`, `formatEventId`, handlers, `advance`), `core/run` (`RunSeed`/`toRunSeed`, `Settings`, `RunStart`, `GameState`, `Command`/`CommandError`, `InputLogEntry`, `CoreStep`, `newRun`, `applyCommand`, `replay`/`replayFrom`, `canonicalize`, `fingerprint`, `assertStateIsValid`), `tests/builders` (`makeRunStart`, `makeState`, `makeStateWithEvents`, `makeEvent`, arbitraries, `deepFreeze`), lint rules + 8 fixtures, `tsconfig.tests.json`.
- **Tests (126 total, 92 new in core/shared):** NIST vectors, padding boundaries and a Web Crypto property for SHA-256; rounding table, `-0`, zero denominator and an error-bound property for `divideRounded`; DET-05 isolation, bounds, determinism and the released-derivation snapshot for rng; comparator oracle property; sorted insertion property; blocking, resume, tie order (DET-04), chunk invariance (DET-02), 14-day jump, three modes, time-travel bug; `newRun` determinism (AC 1), plain-data walk (DET-06), seed range; `applyCommand` log append and DET-10; canonicalize key order and 14 rejections; fingerprint sensitivity to every start parameter and the log; DET-01 (with and without blocking stops), DET-03, folded events, two corrupt-log cases.
- **Docs updated (F2):** `game-architecture.md` (tree: `core/numerics/`, `shared/` contents; mapping row; D3 `replay(start, inputLog)`/`replayFrom`; D4 `newRun(start: RunStart)` and the replay invariant line) and `epics.md` Story 1.2 AC text and the two `replay(seed, inputLog)` mentions (1.2, 1.9). `AGENTS.md` unchanged (no rule or script changed).
- **Agent Review Checklist (game-architecture.md → Implementation Patterns):**
  - [x] I searched for an existing primitive, pattern or helper before creating one (`src/core` and `src/shared` were empty; `pure-rand`/`fast-check` already installed; no new dependency).
  - [x] No duplicated logic. Second occurrences are extracted where the concept is the same (jscpd: 0 clones; one walker `canonicalize`; one rounding path; `drawIntFromStreams` wraps `drawInt`).
  - [x] Names use the GDD glossary, carry units, and need no comment (`nowGameMs`, `untilGameMs`, `atGameMs`, `gameMs`, `GAME_DAY_MS`, `heavyDecisionDue`, `RunSeed`, `loopNumber`).
  - [x] Every comment states a *why* that the code cannot (FIPS references, hash derivation, C-4 replay contract, `-0`, locale ban, why `time` is generic).
  - [x] Core code is pure: no clocks, no `Math.random`, no I/O (lint-enforced; new bans on `Math.round`, `toFixed`, locale APIs, `Intl`, and hot-path fingerprint imports, each proven by a fixture).
  - [x] New content kinds or predicates have schema, implementation and test (not applicable: no content in this story).
  - [x] Tests describe behaviour and use the shared builders (`makeState`, `makeStateWithEvents`, `makeEvent`, `makeRunStart`, arbitraries; no hand-written `GameState` literal).
  - [x] Lint, jscpd, knip, Stylelint, size-limit and tests pass (`npm run check` green on Node 24.18.1).
- **Known gaps / follow-ups:** Firefox e2e could not be verified locally (browser launch failure; CI runs it on `main`). `replayFrom` copies the input log once per command (`[...inputLog, entry]`), acceptable while commands are rare; revisit if a story logs per-frame commands. `core/numerics` stays in `core/` until a second layer needs rounding.

### File List

New:

- `src/shared/result.ts`, `src/shared/brand.ts`, `src/shared/assertInvariant.ts`, `src/shared/assertInvariant.test.ts`, `src/shared/sha256.ts`, `src/shared/sha256Constants.ts`, `src/shared/sha256.test.ts`
- `src/core/constants.ts`
- `src/core/numerics/divideRounded.ts`, `src/core/numerics/divideRounded.test.ts`, `src/core/numerics/index.ts`
- `src/core/rng/rngStreams.ts`, `src/core/rng/isRngStreamState.ts`, `src/core/rng/deriveRngStreams.ts`, `src/core/rng/deriveRngStreams.test.ts`, `src/core/rng/drawInt.ts`, `src/core/rng/drawInt.test.ts`, `src/core/rng/drawIntFromStreams.ts`, `src/core/rng/index.ts`
- `src/core/time/eventKinds.ts`, `src/core/time/queuedEvent.ts`, `src/core/time/timeState.ts`, `src/core/time/domainEvent.ts`, `src/core/time/advanceMode.ts`, `src/core/time/formatEventId.ts`, `src/core/time/compareQueuedEvents.ts`, `src/core/time/compareQueuedEvents.test.ts`, `src/core/time/scheduleEvent.ts`, `src/core/time/scheduleEvent.test.ts`, `src/core/time/eventHandler.ts`, `src/core/time/eventHandlers.ts`, `src/core/time/handleDayBoundary.ts`, `src/core/time/handleHeavyDecisionDue.ts`, `src/core/time/advance.ts`, `src/core/time/advance.test.ts`, `src/core/time/index.ts`
- `src/core/run/runSeed.ts`, `src/core/run/settings.ts`, `src/core/run/runStart.ts`, `src/core/run/gameState.ts`, `src/core/run/command.ts`, `src/core/run/inputLogEntry.ts`, `src/core/run/coreStep.ts`, `src/core/run/canonicalize.ts`, `src/core/run/canonicalize.test.ts`, `src/core/run/fingerprint.ts`, `src/core/run/fingerprint.test.ts`, `src/core/run/assertStateIsValid.ts`, `src/core/run/assertStateIsValid.test.ts`, `src/core/run/newRun.ts`, `src/core/run/newRun.test.ts`, `src/core/run/applyCommand.ts`, `src/core/run/applyCommand.test.ts`, `src/core/run/replay.ts`, `src/core/run/replay.test.ts`, `src/core/run/index.ts`
- `tests/builders/arbitraries.ts`, `tests/builders/deepFreeze.ts`, `tests/builders/index.ts`, `tests/builders/makeEvent.ts`, `tests/builders/makeRunStart.ts`, `tests/builders/makeState.ts`
- `tests/lint-fixtures/src/core/mathRound.ts`, `tests/lint-fixtures/src/core/toFixed.ts`, `tests/lint-fixtures/src/core/localeCompare.ts`, `tests/lint-fixtures/src/core/toLocaleString.ts`, `tests/lint-fixtures/src/core/intl.ts`, `tests/lint-fixtures/src/core/run/fingerprint.ts`, `tests/lint-fixtures/src/core/run/applyCommand.ts`, `tests/lint-fixtures/src/core/time/importsRun.ts`, `tests/lint-fixtures/src/core/otherRounding.ts`, `tests/lint-fixtures/src/core/toLocaleCase.ts`, `tests/lint-fixtures/src/core/time/importsCoreRoot.ts`
- `tsconfig.tests.json`

Modified:

- `src/shared/index.ts`, `src/core/index.ts`
- `eslint.config.js` (rounding/locale property bans, `Intl` global, hot-path import rule), `tests/lint-fixtures/expected.json` (8 new fixtures; `deepSiblingImport.ts` now also reports `no-restricted-imports`)
- `knip.json` (`pure-rand` removed from `ignoreDependencies`), `tsconfig.json` (references `tsconfig.tests.json`), `tsconfig.node.json` (excludes `tests/builders`, `tests/fixtures`, `tests/golden`)
- `_bmad-output/game-architecture.md`, `_bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`, this story file

Deleted:

- `tests/builders/.gitkeep`

## Change Log

- 2026-10-28: Story created (status ready-for-dev).
- 2026-10-28: Story implemented (phases A–F): shared foundations and SHA-256, `core/constants`, `core/numerics`, `core/rng`, `core/time`, `core/run`, builders and fast-check properties (DET-01…06, DET-10), lint bans with fixtures, `tsconfig.tests.json`, architecture/epic signature updates. `npm run check` green; e2e green on chromium and webkit. Status → review.
- 2026-10-28: Code review run 1: 13 findings patched (state validation, corrupt-log guards, rounding/locale/hot-path lint bans with fixtures, test-harness and property fixes, replay contract in architecture D3), 7 deferred, 6 dismissed. `npm run check` and chromium e2e green.
