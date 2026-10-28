---
baseline_commit: 5cc114a3f82b592b63562fc566b7f7545dfbee8f
---

# Story 1.5: Daily economy step

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,
I want cash to change once per game day from revenue and burn,
so that runway is real from the first second.

## Acceptance Criteria

Source: epics.md → Story 1.5 (FR3, FR4; test scenarios ECO-01, ECO-02, DET-06). The "Binding clarifications" below make the literal AC text precise where it leaves a gap.

1. **Canonical start.** **Given** a new run. **When** it starts. **Then** cash is 1,240,000 cents, Hype 2,000 bp (hidden), Alignment 100,000 milli, phase `garage`, GPU capacity 1 unit, MRR 0, customers 0.
2. **Daily step.** **Given** a game-day boundary. **When** the daily `economyStep` event runs. **Then** cash changes by `MRR / 30 − burn`, with burn = base costs for the phase + compute cost (GPU units × unit cost), all from tuning, rounded with the shared helper.
   - **And** with no revenue the Garage burn is $400/day and runway is 31 days (test).
3. **Invariants under many steps.** **Given** many daily steps (fast-check). **When** they run. **Then** cash is always an integer and the daily step is scheduled exactly once per game day.
4. **Runway selector.** **Given** the `app/selectors`. **When** runway is derived. **Then** it equals `floor(cash / daily burn)` days, or "no burn" when burn ≤ 0, without reading `alignmentMilli`.

### Binding clarifications (read before coding)

These are decisions taken by the story author (no human was available); see "Default decisions" at the end for the list to confirm.

- **C-1 Starting values come from tuning, not constants.** `content/tuning.yaml → start` already holds them (`cashUsd: 12400`, `hypeIndex: 20`, `alignmentPoints: 100`, `gpuCapacityUnits: 1`), compiled to `tuning.start.cashCents` (1,240,000), `hypeBp` (2,000), `alignmentMilli` (100,000), `gpuCapacityUnits` (1). `newRun` copies them; the only literals allowed in code are `phase: 'garage'`, `mrrCents: 0`, `customerCount: 0` (0 and 1 pass `no-magic-numbers`; they are run-start facts, not tuning).
- **C-2 New `GameState` fields (flat, unit suffix on each):** `phase: Phase`, `cashCents`, `mrrCents`, `customerCount`, `hypeBp`, `alignmentMilli`, `gpuCapacityUnits`. `alignmentMilli` lives in `core/run` (`GameState`), which is one of the five core modules allowed to name it; nothing else in this story reads or writes it. Hype is stored but unused by the step here (Story 4.1 owns Hype); it is hidden state in the UI sense (never shown before Seed) and has no selector in this story. Update `assertStateIsValid`: add the new keys to `gameStateKeys`; `cashCents` is a safe integer (may be negative: overdraft is Story 5.8/5.9), `mrrCents`, `customerCount`, `hypeBp`, `alignmentMilli`, `gpuCapacityUnits` are non-negative safe integers; `phase` is one of `phases`.
- **C-3 Tuning reaches the core as an argument (architecture D6: "passed to the core as an argument, never imported").** Today `advance(state, untilGameMs, mode)` and `newRun(start)` take no tuning, and `HandlerContext` is `{ mode }`. This story must change the signatures; `max-params` is 3, so:
  - `advance(state, untilGameMs, context)` where `AdvanceContext = { readonly mode: AdvanceMode; readonly tuning: EconomyTuning }` (rename or widen `HandlerContext`; one type, no second one);
  - `newRun(start, tuning)`, `replay(start, inputLog, tuning)`, `replayFrom(state, inputLog, tuning)`; `applyCommand` is unchanged (no command needs tuning yet).
  - `EconomyTuning` is a readonly slice of the compiled tuning: `{ start, phases, economy }` (plus `compute` only if the dev uses it; this story needs `compute` for nothing, GPU unit cost is in `phases`). Declare it in `core/economy` as a type derived from `CompiledTuning` (type-only import from `../contentSchema` follows `core/content/contentPack.ts`). `core/time` must not import `core/content` or `core/run` (import cycle; lint hot-path rule), so the slice type has to live where `core/time` may import it.
  - Update the architecture text (D1 and D3 signatures) and the 1.2 contract notes in the same PR, as 1.2 did for `newRun`. This is a deliberate deviation from the epic/architecture sketch `advance(state, untilGameMs, mode)`.
- **C-4 One new event kind `economyStep`, self-rescheduling like `dayBoundary`.** Add to `eventKinds` as `{ priority: 15, blocking: false }` (after `dayBoundary` 10 so `gameDayStarted` is emitted first at the same `gameMs`; before `heavyDecisionDue` 20 so a decision never opens before that day's cash is applied). `newRun` schedules the first one at `GAME_DAY_MS`, next to the first `dayBoundary`. The handler applies the step, then schedules the next at `event.gameMs + GAME_DAY_MS`. Do not fold the step into `handleDayBoundary` (the epic names a separate `economyStep` event and later stories add more daily kinds). `eventHandlers` is a `Record<EventKind, …>`, so the table forces the handler. Emit one domain event `dailyEconomyApplied { atGameMs, cashChangeCents }` (past tense, no cash balance, nothing hidden) so Story 1.8/2.7 reactors can drive the cash tile and delta flash; the dev may drop it only if no consumer is wired and knip flags it (then record why).
- **C-5 Step timing and day counting.** The step at `k × GAME_DAY_MS` settles day `k` (the day that just ended): the first deduction happens at 60,000 ms, so at day 0 (`nowGameMs = 0`) cash is the full 1,240,000 and runway is 31; after 31 steps cash is exactly 0. "Day 1 is the first day" (default 3 of Story 1.4): the UI shows `Day 1` from 0 to 59,999 ms. The step never fires at `nowGameMs = 0`.
- **C-6 Formula, all integer (project rule: cents, `divideRounded`, no float).**
  - `dailyBurnCents = phases[phase].baseCostsPerDayCents + gpuCapacityUnits × phases[phase].gpuUnitCostPerDayCents`. Garage: 35,000 + 1 × 5,000 = 40,000 cents = $400/day.
  - `dailyRevenueCents = divideRounded(mrrCents, billingMonthDays)` where `billingMonthDays = divideRounded(economy.billingMonthGameMs, GAME_DAY_MS)` (tuning key `billingMonthDays: 30` compiles to `billingMonthGameMs`; dividing by the day count first keeps every intermediate a safe integer, unlike `mrrCents × GAME_DAY_MS`). `assertInvariant` that `billingMonthGameMs` is a positive whole multiple of `GAME_DAY_MS` (see C-9).
  - `cashCents' = cashCents + dailyRevenueCents − dailyBurnCents`. Rounding is half away from zero, applied once to revenue (the burn terms are already whole cents).
  - **Out of scope here, do not add:** salaries and headcount burn (`salaryPerHirePerDay`, `headcountBurnExponent`; Stories 4.7/4.9, ECO-07), compute utilization/churn (3.3), overdraft interest and below-zero death (5.8/5.9), customers and MRR growth (2.4, 4.6), Hype decay (4.1). FR4's full formula arrives in pieces; this story ships base costs + GPU cost + MRR / 30 only, and leaves `phase` fixed at `garage` (nothing changes phase yet, Story 4.11). Do not add placeholder parameters or `headcount: 0` fields "for later".
- **C-7 Where the pieces live.**
  - `core/economy/` (new module, pure): `EconomyState` (the slice `cashCents`, `mrrCents`, `phase`, `gpuCapacityUnits`), `EconomyTuning`, `computeDailyBurnCents(state, tuning)`, `computeDailyRevenueCents(state, tuning)`, `computeRunwayDays(state, tuning)`, `applyDailyEconomy(state, tuning)` (returns the new state slice), `createStartingEconomy(tuning)` (the start values; `newRun` spreads it). Public through `core/economy/index.ts`, re-exported from `core/index.ts`. `core/economy` imports only `shared`, `constants` and `numerics` (never `time` or `run`).
  - `core/time/handleEconomyStep.ts`: the handler, generic over `S extends TimeState & EconomyState` (so `EventHandler` and `eventHandlers` widen to that bound; `TimeState` stays the queue slice, `EconomyState` is a type-only import from `core/economy`; `economy` must not import `time`). It calls `applyDailyEconomy` and `scheduleEvent`.
  - `app/selectors/` (new folder, first selector): `selectRunway(state, tuning)` returning `{ kind: 'days'; days: number } | { kind: 'noBurn' }`, delegating to `computeRunwayDays` so the rule lives once. It never touches `alignmentMilli`. There is no live session or `computed` yet (Story 1.6 owns `app/session`), so the selector is a plain function now; wrapping it in `computed` is 1.6/1.8's job. Files named `selectRunway.ts` plus `index.ts`; the folder's `index.ts` is exported from `app/index.ts`.
- **C-8 Runway rule.** `floor(cashCents / dailyBurnCents)` in whole days; `dailyBurnCents <= 0` gives "no burn" (`noBurn`, not `Infinity`, which cannot be persisted or formatted). Cash at or below zero gives `0` days (clamped; the epic text says `floor(cash / burn)` literally, which would show negative days: default, see decisions). Compute the floor with integer arithmetic, not `Math.floor(a / b)` on floats in `core/` (lint bans plain rounding helpers there; `divideRounded` rounds half away and is the wrong function for a floor, so use `(cash − cash % burn) / burn` on non-negative cash). Rendering ("31 days") belongs to a later UI story and goes through `t()`/`formatNumber`; do not add UI strings here.
- **C-9 Range checks for the tuning this story consumes (closes part of the 1.3 deferred item).** `economy.billingMonthDays: 0` and negative costs build clean today and would divide by zero or reverse the sign of burn. Add schema bounds only for the fields read here: `billingMonthDays` ≥ 1, `phases.*.baseCostsPerDayUsd` ≥ 0, `phases.*.gpuUnitCostPerDayUsd` ≥ 0, `start.cashUsd` ≥ 0 (Zod `.min` through the field-group helper; keep the regenerated JSON Schema in sync with `npm run content:schema`, a drift test fails otherwise). Do not add bounds to the other groups (their stories will). If extending `defineFieldGroup` for bounds looks heavy, a single refinement on the economy group is acceptable; do not touch other groups.
- **C-10 The content pack version changes?** No: `tuning.yaml` values do not change (the keys already exist and `cashUsd` already carries the "Story 1.5" comment). Do not edit the comment's value, only remove the "Story 1.5:" prefix if it reads stale after the story.

## Tasks / Subtasks

### Phase A: Economy module and run start (AC 1)

- [x] A1. Create `src/core/economy/`: `economyState.ts`, `economyTuning.ts`, `createStartingEconomy.ts`, and the pure functions of C-7 in files named after their export, plus `index.ts`. Re-export from `src/core/index.ts`.
- [x] A2. Extend `GameState` (C-2): `GameState extends RunStart, EconomyState` plus `hypeBp`, `alignmentMilli`, `customerCount`. Update `newRun(start, tuning)` to spread `createStartingEconomy(tuning)` and the hidden fields, and schedule the first `economyStep`. Keep the "fields picked one by one" pattern.
- [x] A3. Update `assertStateIsValid` (C-2): key list, integer and range checks, `phase` membership. Add the cases to its tests (a float cash, a negative MRR, an unknown phase, a stray key).
- [x] A4. Builders: `makeContentPack().tuning` already compiles the real file. Add `makeEconomyTuning(overrides?)` (or reuse `makeContentPack(overrides).tuning`) and a `makeAdvanceContext(mode = 'present', tuningOverrides?)` in `tests/builders/`; update `makeState` and `makeStateWithEvents` to build through the new `newRun(start, tuning)`. No hand-written `GameState` literals.

### Phase B: The daily step (AC 2, 3)

- [x] B1. Add `economyStep` to `eventKinds` (C-4), `handleEconomyStep.ts`, and its row in `eventHandlers`. Widen `EventHandler`/`HandlerContext` to carry `tuning` (C-3), keeping `advance` free of `core/run` imports (hot-path lint).
- [x] B2. Change the `advance` signature to `(state, untilGameMs, context)` and thread `context` into the handlers. Update every caller: `src/core/time/advance.test.ts`, `src/core/run/replay.ts`, `src/core/run/replay.test.ts`, `src/core/run/fingerprint.test.ts`, `src/core/run/newRun.test.ts`, `tests/builders/makeState.ts`, and the lint fixtures under `tests/lint-fixtures/src/core/**` and `tests/lint-fixtures/src/app/allowedImports.ts` if they call the changed functions (the fixtures mirror `src/`, and `npm run lint:fixtures` must still prove every rule fails).
- [x] B3. Update `arbitraries.ts`: `pendingEventsArbitrary` draws from `fc.constantFrom('dayBoundary', 'heavyDecisionDue')`; add `economyStep` there so the existing chunk-invariance and tie-break properties exercise it, and extend the live-driver arbitrary only if replay-equals-live needs a different input (it should not).
- [x] B4. Unit tests (ECO-01, ECO-02), by behaviour: start values equal the canonical table; one step at `GAME_DAY_MS` takes exactly 40,000 cents from a Garage start; 31 steps leave cash at 0 and `computeRunwayDays` is 31 at day 0 and 0 after; with MRR 3,000,000 cents revenue is 100,000 cents/day and rounding is half away from zero for MRR not divisible by 30 (for example 1,015 → 34, 1,014 → 34, 1,004 → 33; compute each with `divideRounded` expectations, not literals copied from the implementation); a GPU capacity of 3 raises burn by 2 × 5,000; the step at `nowGameMs = 0` never runs; tuning overrides (`makeContentPack({ 'phases.garage.baseCostsPerDayUsd': 500 })`) change the burn without touching code (proves "all from tuning").
- [x] B5. Properties (fast-check; DET-06, ECO-02): for random `RunStart`, random GPU/MRR (through a builder override, MRR bounded so sums stay safe) and random horizons up to the existing 20-day arbitrary: every step leaves `cashCents` a safe integer and `assertStateIsValid` passes; exactly one `economyStep` is queued after any `advance`, at the next multiple of `GAME_DAY_MS` after `nowGameMs`; the number of `dailyEconomyApplied` events over `advance(s, t)` equals `floor(t / GAME_DAY_MS)` (days settled, none doubled or skipped); chunk invariance still holds with the new kind (the existing property, now covering it). The existing replay-equals-live property must stay green.

### Phase C: Runway selector (AC 4)

- [x] C1. `src/core/economy/computeRunwayDays.ts` per C-8, and `src/app/selectors/selectRunway.ts` + `index.ts`; export through `app/index.ts`.
- [x] C2. Tests: 12,400 dollars with burn 400 gives `{ kind: 'days', days: 31 }`; cash 39,999 with burn 40,000 gives 0 (floor), 40,000 gives 1; burn 0 (tuning override to zero costs and zero GPU units) gives `noBurn`; negative cash gives 0; a state with `alignmentMilli` changed gives the same runway (it is not read). Add an ESLint boundary check by running `npm run lint`: `app/selectors` must not import `hiddenState`-only data (the file does not exist yet; Story 5.x adds it).
- [x] C3. Core tests stay in Node (`src/core/**` runs in the `core` project); `src/app/selectors/*.test.ts` run in `dom` as `src/app/content` tests do; neither needs a DOM or mocks.

### Phase D: Schema bounds and close-out

- [x] D1. Schema bounds per C-9 with failing-input tests in `tuningSchema.test.ts` (0, negative, fractional-day month); regenerate `content/schema/tuning.schema.json` with `npm run content:schema` and commit it.
- [x] D2. Update docs in the same PR: `game-architecture.md` (D1/D3 `advance` and `newRun` signatures, the new event kind in the D1 queue list if it names kinds, the `GameState` fields), the stale "Story 1.5" comment in `tuning.yaml` if any, `deferred-work.md` (strike or annotate the 1.3 "Tuning values have no range checks" item for the fields covered; strike nothing else). Update the 1.2 replay contract wording only for the new parameter.
- [x] D3. Run `npm run check`. `npm run test:e2e` only if the app shell changed (it should not; nothing renders yet). Check `npm run size`: this story adds no dependency and only small core code.
- [x] D4. Run the Agent Review Checklist (game-architecture.md → Implementation Patterns) and paste it ticked in the PR. Run the code-review loop (max 5 runs, stop on a clean run) before opening the PR.

## Dev Notes

### What exists today (read before touching anything)

- **Tuning is ready.** `content/tuning.yaml` has `start` (`cashUsd: 12400`, `hypeIndex: 20`, `alignmentPoints: 100`, `gpuCapacityUnits: 1`), `phases.garage` (`baseCostsPerDayUsd: 350`, `gpuUnitCostPerDayUsd: 50`) and `economy.billingMonthDays: 30`. Compiled key names (verified in `core/contentSchema/fieldGroup.ts`): `start.cashCents`, `start.hypeBp`, `start.alignmentMilli`, `start.gpuCapacityUnits`, `phases.garage.baseCostsPerDayCents`, `phases.garage.gpuUnitCostPerDayCents`, `economy.billingMonthGameMs` (a `days` field compiles to game-ms: 1,800,000), `economy.headcountBurnExponentBp`. Arithmetic check: 350 + 50 = $400 = 40,000 cents; 1,240,000 / 40,000 = 31.
- **`GameState`** (`core/run/gameState.ts`) is `RunStart` plus `nowGameMs`, `queue`, `rngStreams`, `counters: { event }`, `inputLog`. There is no economy, phase or hidden state yet. `assertStateIsValid` checks an exact key list (`gameStateKeys`), so every new field must be added there or the validator throws.
- **`newRun(start)`** (`core/run/newRun.ts`) builds an empty state and schedules one `dayBoundary` at `GAME_DAY_MS`. **`advance`** (`core/time/advance.ts`) pops the head event, calls `eventHandlers[kind](popped, head, { mode })`, stops after a blocking kind. `handleDayBoundary` reschedules itself one day later and emits `gameDayStarted`; this is the model for the new handler.
- **`core/time` is generic over `TimeState`** (`nowGameMs`, `queue`, `counters.event`) specifically to avoid a `run` import cycle, and lint forbids `core/time/**` and `core/run/applyCommand.ts` from importing `run`, `fingerprint`, `canonicalize`, `assertStateIsValid`, `newRun`, `replay` or the `core` root (hot-path rule). The economy handler must respect this: that is why `EconomyState` lives in `core/economy` and the handler is generic over `TimeState & EconomyState`.
- **`eventKinds`** is the single table (`priority`, `blocking`); `eventHandlers` is `Record<EventKind, EventHandler>` so a kind without a handler does not compile. `assertStateIsValid` checks every queued kind exists in the table.
- **`divideRounded`** (`core/numerics`) is the only rounding path: half away from zero, no `-0`. `withoutNegativeZero` also exists. The lint bans `Math.round`, `toFixed`, `Intl` and similar in `core/`, and `no-magic-numbers` is on (0 and 1 allowed): every other number is a named constant (`core/constants.ts` already has `GAME_DAY_MS`, `CENTS_PER_DOLLAR`, `Phase`/`phases`) or tuning.
- **Tests and builders.** `tests/builders/makeState.ts` builds through `newRun` and deep-freezes; `makeContentPack(overrides)` compiles the real `content/tuning.yaml` with dotted-path overrides in authoring units; `arbitraries.ts` has `runStartArbitrary`, `pendingEventsArbitrary`, `timeSplitArbitrary` and a live-step driver used by the replay-equals-live property. Existing tests that call `advance(...,'present')` or `newRun(start)` all change with C-3; grep for `advance(`, `newRun(`, `replay(`, `replayFrom(` (found in `advance.test.ts`, `newRun.test.ts`, `replay.test.ts`, `fingerprint.test.ts`, `makeState.ts`, `replay.ts`, `newRun.ts`, plus lint fixtures).
- **No golden runs exist yet** (`tests/golden/.gitkeep`); fingerprints in tests are compared run-to-run, not against stored hex, so adding state fields changes no stored value. Story 1.11 owns the first golden.
- **`app/`** has only `content/` today (`loadContentIndex`); there is no `app/selectors/`, `app/session` or signals yet. `core/content/createContentIndex` exposes `tuning` (deep-frozen); an `app` caller will later pass `index.tuning` to `advance`, `newRun` and the selectors. This story does not wire a session.

### Architecture patterns and constraints

- **D1 time model:** economy is game time; one step per game day regardless of Game speed ("the economy per game day is unchanged", 1.6 AC). The step is a queue event processed by `advance`; no timers anywhere in `core/`. [Source: game-architecture.md#Simulation Time Model (D1)]
- **D2 numerics:** integer cents, one rounding helper, no float in persisted state. [Source: game-architecture.md#Randomness and Numerics (D2)]
- **D3 state:** plain readonly data, commands and `advance` as the two entry points; `replay` folds the same code. [Source: game-architecture.md#State Management (D3)]
- **D6 tuning:** no tuning constants in code; the core receives the compiled tuning as an argument. [Source: game-architecture.md#Content pipeline, Tuning]
- **Hidden state:** `alignmentMilli` is named only inside `core/` modules alignment, staff, ending, save and run; outside `core/`, only `app/selectors/hiddenState.ts`. `selectRunway` must not read it, and no signal, toast or log may expose Hype before Seed or Alignment ever. [Source: project-context.md#Critical Don't-Miss Rules]
- **Replay contract is untouched:** nothing here adds a command or an input, so the "advance before every command" contract and the input log are unchanged. Tuning is part of the pinned content pack (`contentPackVersion`), so replay with the same pack gives the same run; do not read tuning from anywhere but the argument. [Source: game-architecture.md#Data Persistence (D4)]
- **Performance:** the step runs once per game day (and once per day inside a 14-day absence catch-up): no logging, no `JSON.stringify`, no collection copies beyond the queue ops that already exist. [Source: project-context.md#Performance Rules]

### Testing standards for this story

- Colocated unit tests; names state behaviour (`it('leaves 31 days of runway at the Garage burn')`). Core tests run in Node without DOM. No DOM snapshots. fast-check `numRuns` comes from global config; do not hard-code it.
- Scenarios covered: **ECO-01** (canonical start), **ECO-02** (31-day runway, one step per day), **DET-06** (integers only after steps; the property extends to the new fields). **ECO-03** (inflow target) and **ECO-07** (headcount burn) are NOT this story. [Source: game-test-design.md#ECO-01, #ECO-02, #DET-06]
- Builders only: `makeState`, `makeContentPack`, `makeRunStart`. Never hand-build a `GameState` or a tuning literal; test overrides go through `makeContentPack({ 'dotted.path': value })`.
- Never mock `core/`; call the pure functions.
- Shrunk counterexamples from fast-check become permanent regression tests.
- Probe, as 1.2/1.4 reviews did: MRR not divisible by 30 (half away from zero, both signs of rounding), MRR at a large safe value (no overflow in revenue), GPU units 0 (burn is base costs only), burn 0 (`noBurn`), cash exactly at a multiple of burn (floor boundary), cash 0 and negative, a step landing at the same `gameMs` as `dayBoundary` and `heavyDecisionDue` (order 10, 15, 20), `advance` to exactly `GAME_DAY_MS` (inclusive), and `advance` over 14 days in one call equals fourteen one-day calls.

### Project Structure Notes

- New: `src/core/economy/**`, `src/core/time/handleEconomyStep.ts`, `src/app/selectors/**`, builders in `tests/builders/`. Matches the architecture tree (`core/economy` "cash, burn, MRR, customers, Hype, compute (M4)", `app/selectors`). No `utils.ts` or `helpers.ts`.
- Variances to record in the PR: the `advance`/`newRun`/`replay` signature change (C-3); `EconomyState` in `core/economy` rather than in `run` (C-7); runway clamped at 0 (C-8); `economyStep` separate from `dayBoundary` (C-4).

### Project Context Rules

Extracted from `_bmad-output/project-context.md` (binding; "when in doubt prefer the more restrictive option"):

- **Stack pins.** TypeScript 6.0.x strict; zod 4.6 (build-time only, never in the runtime bundle: `core/economy` imports a type from `contentSchema`, never a value); Vitest 5.0; fast-check 4.10; Node 24. No new dependency (none is needed).
- **Core purity.** No `Date`, `performance`, timers, `Math.random`, I/O, `Intl`, DOM, signals. Everything that happens later is a queue event. State is readonly plain data, no `Map`/`Set`/classes, updates return new objects. Deterministic order: ties by `(gameMs, kind priority, id)`. IDs from counters.
- **Integers only.** Money in cents, Hype and percentages in basis points, Alignment in milli-points; divide only with `divideRounded`.
- **Naming.** GDD glossary verbatim; unit suffix on every number with a unit (`cashCents`, `mrrCents`, `hypeBp`, `alignmentMilli`, `gpuCapacityUnits`); functions start with a verb (`computeDailyBurnCents`, `applyDailyEconomy`, `selectRunway`); booleans `is`/`has`/`can`; commands imperative, events past tense (`dailyEconomyApplied`); named exports only; folders camelCase; abbreviations only `id`, `url`, `ms`, `rng`, `ui`, `gpu`, `mrr`, `kpi`.
- **Layers.** `ui → app → core → shared`; `app → platform → shared`; `core` imports only `shared`; import through `index.ts` only; `ui` never imports `core`. `core/time` must not import `core/run` or the `core` root.
- **Tuning.** A tuning number lives in `content/tuning.yaml`, never a code constant; the pack version covers it.
- **Testing.** Colocated; `tests/` only for e2e, goldens, fixtures, builders; builders not literals; mock only at `platform/`; every core change keeps the invariants green (chunk invariance, replay equals live, snapshot + tail equals full replay) and a new mechanic adds its own property ("cash never non-integer").
- **Hidden state.** Alignment is never exposed; Hype is hidden until Seed; signals are silent: no toast, announcement, event or log for them.
- **Strings and numbers.** No UI is built here. When a later story shows runway or cash, it goes through `t()` and the `i18n/` formatters; do not add strings now.
- **Code Quality Charter.** Search before creating (`divideRounded`, `assertInvariant`, `scheduleEvent`, `makeContentPack` exist); extract at the second occurrence; no AI-style comments (comments state a non-obvious why only); no abstract bases, speculative options, placeholder fields for later stories; no defensive noise (types guarantee integers; use `assertInvariant` only at real boundaries such as tuning division); no `any`, `!`, `@ts-ignore`; functions ≤ 40 lines, files ≤ 300, complexity ≤ 10, ≤ 3 parameters.
- **CI is the definition of done**; never disable a gate; a suppression needs a written reason; run the Agent Review Checklist before closing.

### Previous Story Intelligence (Stories 1.4, 1.3, 1.2)

- **1.2 built the engine this story extends.** Its reviews (4 runs) found real gaps in validation and replay edge cases: expect probing of `assertStateIsValid` (every new field needs a type check before any comparison, because `canonicalize` lets `null`, booleans and strings through and `>=` coerces them: use the `isGameMs`-style typeof check) and of chunk invariance. It also deferred "queue domain invariants unchecked" (exactly one pending `dayBoundary`); this story's property "exactly one `economyStep` pending" should be asserted in tests; adding the same check to `assertStateIsValid` is optional and, if done, should cover both kinds and be noted in `deferred-work.md` (do not silently expand scope: default is tests only).
- **1.2 deferred "Replay ignores the advance mode"** and "`GameState` holds current settings, not start settings" (Story 1.6/1.9 decisions): do not try to solve them here; widening `advance`'s third parameter must keep `mode` semantics identical.
- **1.3 built the tuning pipeline** (compiled key naming, `makeContentPack` overrides, `content:schema` drift test, range checks deferred). C-9 closes only the fields this story reads.
- **1.4 added `i18n/` formatters** (`formatCents`, `formatCompactCents`, `formatGameDay`): a later UI story renders cash and `Day N` with them; this story adds none. Its "Day 1 vs Day 0" open question is answered by C-5 (Day 1 default), so Story 1.6 only has to keep it.
- **Process notes from user memory.** One PR per story from branch `story/1-5-daily-economy-step`, squash-merged; code-review loop (max 5 runs, stop on a clean run) before opening the PR; `main` needs approval and Tiziano bypasses as admin only after green CI; after the PR is open, explain it to Tiziano in Italian, plain, what and why.

### Git Intelligence

Last commits: `5cc114a` close 1.4 (#11), `60d6168` Story 1.4 i18n (#10), `44a023f` close 1.3 (#9), `372f49a` Story 1.3 content and tuning pipeline (#8: `core/content`, `core/contentSchema`, `app/content`, `tools/content`, `content/tuning.yaml`, `tests/builders/makeContentPack.ts`), `8932ca4` Story 1.2 deterministic core skeleton (#6: `core/time`, `core/run`, `core/rng`, `core/numerics`). Convention: a story PR, then a separate "Close story" PR that sets status to done.

### Latest Technical Information

No external library is involved; nothing to research. Relevant platform fact: IEEE 754 doubles are exact for integers up to 2^53 − 1, so every intermediate here must stay a safe integer (the reason for dividing MRR by the day count, C-6, instead of multiplying by `GAME_DAY_MS`); `%` on negative numbers keeps the dividend's sign (the reason the runway floor is computed on non-negative cash only, C-8).

### References

- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md#Story 1.5: Daily economy step; #FR3, FR4; Story 1.6 (the economy per game day is unchanged by Game speed)]
- [Source: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md (Starting conditions: $12,400, ~$400/day burn, 31-day runway; Runway signals; Simulation step)]
- [Source: _bmad-output/game-architecture.md#Simulation Time Model (D1); #Randomness and Numerics (D2); #State Management (D3); #Content pipeline (Tuning); #Project Structure (core/economy, app/selectors); #Agent Review Checklist]
- [Source: _bmad-output/project-context.md#Core Purity & Determinism Rules; #Naming Rules; #Testing Rules; #Critical Don't-Miss Rules]
- [Source: _bmad-output/game-test-design.md#ECO-01, #ECO-02, #DET-06]
- [Source: _bmad-output/implementation-artifacts/1-2-deterministic-core-skeleton.md; 1-3-content-and-tuning-pipeline.md; 1-4-i18n-catalogs-and-number-formatters.md; deferred-work.md]
- [Source: src/core/time/{advance,eventKinds,eventHandlers,eventHandler,handleDayBoundary,timeState}.ts; src/core/run/{gameState,newRun,runStart,assertStateIsValid,replay}.ts; src/core/numerics/divideRounded.ts; src/core/constants.ts; src/core/contentSchema/{fieldGroup,tuningSchema/*}.ts; content/tuning.yaml; tests/builders/*; eslint.config.js]

## Default decisions taken without a human (confirm or overrule)

1. Tuning is passed to the core as part of an `AdvanceContext` (`{ mode, tuning }`) and as a second/third argument to `newRun`/`replay`/`replayFrom`; this deviates from the architecture sketch `advance(state, untilGameMs, mode)` (3-parameter lint limit) and the doc is updated in the PR.
2. `economyStep` is its own event kind (priority 15), self-rescheduling, scheduled by `newRun` beside `dayBoundary`, rather than being folded into `handleDayBoundary`.
3. The step at `k × GAME_DAY_MS` settles the day that just ended; no step at day 0; the UI day counter starts at Day 1.
4. Burn in this story is base costs + GPU units × unit cost only; salaries/headcount, overdraft interest, churn and Hype decay arrive with their own stories. `phase` stays `garage`.
5. Daily revenue is `divideRounded(mrrCents, billingMonthGameMs / GAME_DAY_MS)` (half away from zero, once), to keep intermediates safe integers.
6. Runway is clamped at 0 for cash at or below zero (the epic says `floor(cash / burn)`); burn ≤ 0 returns `noBurn`.
7. `selectRunway` is a plain function in `app/selectors` delegating to a `core/economy` function; `computed` wrapping waits for `app/session` (1.6).
8. New `GameState` fields: `phase`, `cashCents`, `mrrCents`, `customerCount`, `hypeBp`, `alignmentMilli`, `gpuCapacityUnits`; Hype and Alignment are stored but unused here.
9. Schema range checks are added only for the tuning fields this story reads (C-9); other groups stay as deferred.
10. A `dailyEconomyApplied { atGameMs, cashChangeCents }` domain event is emitted for later reactors (no balance, nothing hidden).

## Open Questions (for Tiziano; defaults above are applied if unanswered)

1. Should a negative-cash runway show `0 days` (default) or stay literal `floor(cash / burn)` (negative days)? Story 5.9 (red runway, account closed) is the real consumer.
2. Should the economy settle at the end of the day (default: first deduction at 60,000 ms) or at its start (a deduction at game time 0, so a new run begins at 1,200,000 and runway shows 30)? ECO-02 and the GDD say 31 days at day 0, which favours the default.
3. Is changing the `advance` signature acceptable now, or should tuning be bound once into a core "simulation" object created in `app` (for example `createSimulation(tuning)` returning bound `newRun`/`advance`/`replay`)? Default: explicit arguments; the bound form can be a later refactor.

## Dev Agent Record

### Agent Model Used

Claude (Fable 5.1, `claude-fable-5-1`), unattended run of `gds-dev-story` on 2026-10-28.

### Debug Log References

- `npm run check`: green (typecheck, lint, lint:fixtures 85/85, lint:css, format:check, jscpd 0 clones, knip clean, i18n:missing, build, size 4.98 kB gzip of 150 kB, vitest 449/449 in 44 files). The only build notice is the pre-existing PDFKit lazy chunk (> 500 kB) warning.
- `npm run test:e2e`: Chromium and WebKit 4/4 green. The two Firefox cases fail to launch the browser in this sandbox ("Could not find profile folder"), the known local limitation already recorded in `deferred-work.md` (8.1); the PR gate runs Chromium only, `main` runs all three engines.
- Two inherited expectations moved because `newRun` now mints two events (`counters.event` starts at 2): `scheduleEvent` "takes the next zero-padded id" and `assertStateIsValid` "an event id the counter has not reached" (now `formatEventId(3)`).

### Completion Notes List

**Implemented (all ACs, ECO-01, ECO-02, DET-06).**

- `src/core/economy/` (new, pure, imports only `shared`, `constants`, `numerics` and a type from `contentSchema`): `EconomyState` (`phase`, `cashCents`, `mrrCents`, `gpuCapacityUnits`), `EconomyTuning = Readonly<Pick<CompiledTuning, 'start' | 'phases' | 'economy'>>`, `createStartingEconomy`, `computeDailyBurnCents`, `computeDailyRevenueCents`, `applyDailyEconomy` (returns `{ state, cashChangeCents }` so the handler emits the change without computing twice), `computeRunwayDays` returning `Runway = { kind: 'days', days } | { kind: 'noBurn' }`.
- `GameState extends RunStart, EconomyState` plus `customerCount`, `hypeBp`, `alignmentMilli`; `newRun(start, tuning)` spreads `createStartingEconomy(tuning)`, copies Hype and Alignment from `tuning.start`, and schedules `dayBoundary` then `economyStep` at `GAME_DAY_MS` (ids `evt-000001`, `evt-000002`).
- `assertStateIsValid`: seven new keys in `gameStateKeys`; `phase` membership; `cashCents` safe integer (negative allowed); the other five non-negative integers, type-checked before any comparison (`isGameMs` renamed `isNonNegativeInteger`, same predicate).
- `core/time`: `economyStep { priority: 15, blocking: false }`; `handleEconomyStep` (generic over `SimulationState = TimeState & EconomyState`); `HandlerContext` renamed `AdvanceContext = { mode, tuning }`; `advance(state, untilGameMs, context)`; `DomainEvent` gains `dailyEconomyApplied { atGameMs, cashChangeCents }`. The hot-path lint still passes: `core/time` imports `../economy`, never `run`.
- `replay(start, inputLog, tuning)`, `replayFrom(state, inputLog, tuning)`; `applyCommand` unchanged.
- `app/selectors/selectRunway(state, tuning)` delegating to `computeRunwayDays`; exported through `app/index.ts`. Tests run in the `dom` project without a DOM.
- Schema bounds (C-9) through two new field-group helpers, `atLeast(unit, min)` and `wholeAtLeast(unit, min)` (`BoundedSpec`), applied only to `start.cashUsd`, `phases.*.baseCostsPerDayUsd`, `phases.*.gpuUnitCostPerDayUsd` (≥ 0) and `economy.billingMonthDays` (whole, ≥ 1). `content/schema/tuning.schema.json` regenerated; the diff touches exactly those fields.
- Builders: `makeEconomyTuning(overrides?)` (default pack parsed once per test file, overrides recompile) and `makeAdvanceContext(mode = 'present', tuningOverrides?)`; `makeState` / `makeStateWithEvents` take an optional third `tuning`. `pendingEventsArbitrary` now draws `economyStep` too, so DET-04 tie-break and DET-02 chunk invariance cover it; the live driver was not changed (replay ≡ live stays green with the new kind scheduled by `newRun`).
- Tests added by behaviour: canonical start table; first deduction at `GAME_DAY_MS` inclusive and never at day 0; 31 steps to exactly 0; MRR 3,000,000 → 100,000/day; half-away-from-zero rounding (1,015 → 34, 1,014 → 34, 1,004 → 33, checked against `divideRounded`); `MAX_SAFE_INTEGER` MRR stays safe; GPU 3 adds 2 × 5,000; GPU 0 is base costs only; tuning override changes burn without code; same-`gameMs` order `dayBoundary` → `economyStep` → `heavyDecisionDue`; 14-day jump ≡ 14 single days (29 events); properties: cash always a safe integer and `assertStateIsValid` green under random GPU/MRR/horizon, exactly one `economyStep` pending at the next day multiple after `nowGameMs`, `dailyEconomyApplied` count = `floor(t / GAME_DAY_MS)`; runway floor boundaries (39,999 → 0, 40,000 → 1), cash 0 and negative → 0, zero costs → `noBurn`, Alignment/Hype changes do not move the runway; a non-whole billing month in the compiled tuning throws; schema rejects 0, negative and fractional-day months and negative costs/cash with the field path and message.
- Docs: `game-architecture.md` D1 (queue list names `economyStep` and its priority; `advance` context), D3 (entry point, replay signatures, replay contract wording), D4 (`newRun(start, tuning)`, new `GameState` fields); `tuning.yaml` comment prefix "Story 1.5:" removed (value unchanged, pack version unchanged); `deferred-work.md` 1.3 range-check item annotated as partly resolved for the covered fields.

**Decisions and defaults applied (all ten story defaults confirmed by the caller; extra choices below).**

1. `applyDailyEconomy` returns `{ state, cashChangeCents }` rather than the bare slice, so `handleEconomyStep` emits `dailyEconomyApplied` without a second revenue/burn computation.
2. `EconomyTuning` is `Readonly<Pick<CompiledTuning, …>>` (shallow readonly) rather than a deep-readonly type: `core/content`'s `DeepReadonly` is private, `shared/` admission needs two layers, and the pack is deep-frozen at runtime anyway. A `DeepReadonly<CompiledTuning>` value is assignable to it (no arrays in the tuning).
3. The handler bound is named `SimulationState` (`TimeState & EconomyState`) and exported from `core/time` next to `AdvanceContext`; `TimeState` stays the queue slice.
4. Schema bounds use a `BoundedSpec` (`{ unit, min, whole }`) with two helpers rather than a refinement on the economy group, so the JSON Schema carries `minimum` / `integer` for editors. Count fields keep their `integer` type (the generated schema diff touches only the four bounded fields).
5. `selectRunway` is, as the story prescribes, a pass-through to `computeRunwayDays` (Charter "pass-through wrapper" exception, recorded here): it is the `app` seam Story 1.8 wraps in `computed`, and it fixes the rule that the UI reads the economy slice only.
6. The validator's queue-domain invariant (exactly one pending `economyStep` / `dayBoundary`) stays in tests only (the story's default), unchanged in `deferred-work.md`.
7. D4 (code-review loop and pasting the checklist in a PR) is left to the separate reviewer, as instructed; the checklist is ticked below.

**Open points for the reviewer / Tiziano.**

- `game-architecture.md` N5 and `epics.md` Story 8.x still sketch `replay(start, inputLog, { probe })`; with `tuning` as the third parameter the probe form will need an options object or a different entry point (`max-params` 3). Not changed here: the clue-replay story owns it.
- `hypeBp` is validated as non-negative; Story 4.1 (flop −10, scandal −20 Hype changes) decides whether Hype may go below zero and relaxes the check if so.
- `AdvanceContext.tuning` is the economy slice only; later stories widen the type as handlers need more groups.

**Agent Review Checklist (game-architecture.md → Implementation Patterns).**

- [x] I searched for an existing primitive, pattern or helper before creating one (`divideRounded`, `assertInvariant`, `scheduleEvent`, `makeContentPack`, `defineFieldGroup`, `range` reused; `atLeast` / `wholeAtLeast` added beside `range`).
- [x] No duplicated logic. Second occurrences are extracted where the concept is the same (jscpd 0 clones; `unitOf` extracted when the spec union grew).
- [x] Names use the GDD glossary, carry units, and need no comment (`cashCents`, `mrrCents`, `hypeBp`, `alignmentMilli`, `gpuCapacityUnits`, `billingMonthGameMs`, `dailyEconomyApplied`).
- [x] Every comment states a *why* that the code cannot.
- [x] Core code is pure: no clocks, no `Math.random`, no I/O (lint restrictions green; tuning arrives as an argument).
- [x] New content kinds or predicates have schema, implementation and test (bounds: schema helpers, regenerated JSON Schema, failing-input tests).
- [x] Tests describe behaviour and use the shared builders (no hand-written `GameState` or tuning literal; one deliberately broken `EconomyTuning` spread in a test to hit the `assertInvariant`).
- [x] Lint, jscpd, knip, Stylelint, size-limit and tests pass (`npm run check` green; e2e green on Chromium and WebKit).

### File List

New:

- `src/core/economy/index.ts`
- `src/core/economy/economyState.ts`
- `src/core/economy/economyTuning.ts`
- `src/core/economy/createStartingEconomy.ts`
- `src/core/economy/createStartingEconomy.test.ts`
- `src/core/economy/computeDailyBurnCents.ts`
- `src/core/economy/computeDailyRevenueCents.ts`
- `src/core/economy/applyDailyEconomy.ts`
- `src/core/economy/applyDailyEconomy.test.ts`
- `src/core/economy/computeRunwayDays.ts`
- `src/core/economy/computeRunwayDays.test.ts`
- `src/core/time/handleEconomyStep.ts`
- `src/app/selectors/index.ts`
- `src/app/selectors/selectRunway.ts`
- `src/app/selectors/selectRunway.test.ts`
- `tests/builders/makeEconomyTuning.ts`

Modified:

- `src/core/index.ts`
- `src/core/run/gameState.ts`
- `src/core/run/newRun.ts`
- `src/core/run/newRun.test.ts`
- `src/core/run/replay.ts`
- `src/core/run/replay.test.ts`
- `src/core/run/assertStateIsValid.ts`
- `src/core/run/assertStateIsValid.test.ts`
- `src/core/run/fingerprint.test.ts`
- `src/core/time/advance.ts`
- `src/core/time/advance.test.ts`
- `src/core/time/domainEvent.ts`
- `src/core/time/eventHandler.ts`
- `src/core/time/eventHandlers.ts`
- `src/core/time/eventKinds.ts`
- `src/core/time/index.ts`
- `src/core/time/scheduleEvent.test.ts`
- `src/core/contentSchema/fieldGroup.ts`
- `src/core/contentSchema/tuningSchema/economy.ts`
- `src/core/contentSchema/tuningSchema/startAndPhases.ts`
- `src/core/contentSchema/tuningSchema/tuningSchema.test.ts`
- `src/app/index.ts`
- `tests/builders/index.ts`
- `tests/builders/makeState.ts`
- `tests/builders/arbitraries.ts`
- `content/tuning.yaml` (comment only)
- `content/schema/tuning.schema.json` (regenerated)
- `_bmad-output/game-architecture.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-5-daily-economy-step.md`

### Review Findings

Code review run 1 (2026-10-28, full workflow: Blind Hunter, Edge Case Hunter and Acceptance Auditor as parallel subagents). 0 decision_needed, 8 patch (all applied), 3 defer, 15 dismissed.

- [x] [Review][Patch] Start Hype, Alignment and GPU units had no lower bound, so a negative start built clean and crashed in `newRun`'s validation; now `atLeast(…, 0)`, JSON Schema regenerated, failing-input tests [src/core/contentSchema/tuningSchema/startAndPhases.ts, tuningSchema.test.ts, content/schema/tuning.schema.json]
- [x] [Review][Patch] The daily settlement could push cash past the safe-integer range silently (found only at the next fingerprint); `applyDailyEconomy` now asserts the change and the new balance are safe integers, with a test [src/core/economy/applyDailyEconomy.ts, applyDailyEconomy.test.ts]
- [x] [Review][Patch] The "exact half" rounding test held no exact half; titles fixed and 15 → 1, 45 → 2, 44 → 1 pinned as literals [src/core/economy/applyDailyEconomy.test.ts]
- [x] [Review][Patch] B4's 31-day scenario did not assert the runway; it now checks 31 days at start and 0 after [src/core/time/advance.test.ts]
- [x] [Review][Patch] The tuning-override test of `newRun` left Alignment out [src/core/run/newRun.test.ts]
- [x] [Review][Patch] `countKeys` named fields that are not counts and needed a comment; renamed `nonNegativeKeys` [src/core/run/assertStateIsValid.ts]
- [x] [Review][Patch] The D3 replay invariant still read `replay(start, inputLog)` [_bmad-output/game-architecture.md]
- [x] [Review][Patch] A code comment cited the story clarification "(Story 1.5 C-6)", which goes stale [src/core/contentSchema/tuningSchema/economy.ts]
- [x] [Review][Defer] No validator check for exactly one pending `economyStep` on the day grid [src/core/run/assertStateIsValid.ts] — deferred, widens the existing "Queue domain invariants unchecked" item (story default: tests only)
- [x] [Review][Defer] Replay does not tie tuning to `contentPackVersion` [src/core/run/replay.ts] — deferred to the Story 1.9 load path
- [x] [Review][Defer] Hidden-state import boundary has no lint rule [eslint.config.js] — deferred, `hiddenState.ts` arrives with Story 5.x

Dismissed (one line each): billing the ended day at state changed by an earlier same-`gameMs` event is the approved settle-at-day-end default, and nothing changes phase or GPU units yet; per-day rounding drift against monthly MRR is the specified D2 rounding (C-6); tests that compare against `divideRounded` are what B4 prescribes, now backed by literal half cases; the float-cash case matching `/safe integers/` is the earlier canonicalize check rejecting it, the intended behaviour; `selectRunway`'s "never reads Alignment" test is required by C2 and lives in a test file, not a production read; `makeEconomyTuning`'s shared default is already deep-frozen by `makeContentPack`; unknown phase giving a `TypeError` needs an unvalidated state, and a phase missing from `phasesTuning` fails to compile; event-id space halving (about 500k game days) is far beyond any run; `applyDailyEconomy` returning `{ state, cashChangeCents }` and the `replay` probe collision are recorded deviations and open points; `selectRunway`'s Story 1.6/1.8 comment states why it is a plain function; runway from gross burn is C-8 as specified; stale signatures in `epics.md` belong to Stories 1.2 (historical ACs) and 1.9 (owns its replay form); hype/alignment upper bounds wait for the stories that move them (the 1.3 range-check defer).

Code review run 2 (2026-10-28, full workflow: Blind Hunter, Edge Case Hunter and Acceptance Auditor as parallel subagents). 0 decision_needed, 6 patch (all applied), 0 defer, 12 dismissed.

- [x] [Review][Patch] The daily burn could leave the safe-integer range unchecked (`start.gpuCapacityUnits: 2**50` with a $1,000 unit cost builds clean): `computeRunwayDays` returned a plausible 0 days from an inexact float, and run 1's guard on the difference could pass an inexact sum; `computeDailyBurnCents` now asserts its result, with a test [src/core/economy/computeDailyBurnCents.ts, applyDailyEconomy.test.ts]
- [x] [Review][Patch] The `eventKinds` comment read as if the starting day's cash settles; reworded to say the next day starts, then the ended day settles [src/core/time/eventKinds.ts]
- [x] [Review][Patch] The `Runway` comment called the runway persisted; it is derived and shown [src/core/economy/computeRunwayDays.ts]
- [x] [Review][Patch] A "what" comment on `defineHumanNumber` removed (Charter: comments state a why) [src/core/contentSchema/fieldGroup.ts]
- [x] [Review][Patch] D9 hidden-tab text still read `advance(copy, now, 'away')` [_bmad-output/game-architecture.md]
- [x] [Review][Patch] The deferred range-check note omitted the `start` bounds run 1 added (Hype, Alignment, GPU units); the Completion Notes' "exactly those fields" predates that run-1 patch [_bmad-output/implementation-artifacts/deferred-work.md]

Dismissed (one line each): the queue-shape invariant and replay/pack-version binding are run-1 defers; salary and `belowZeroLimit` bounds are out of scope by C-9 (their stories add them); the `selectRunway` hidden-state test and shared default tuning were dismissed in run 1; the float-cash `/safe integers/` case was dismissed in run 1 (string and null cases cover the `cashCents` branch); `typeof` before `Number.isSafeInteger` mirrors the validator's type-check-first pattern; Hype and Alignment set in `newRun` rather than `createStartingEconomy` follows C-7 (`EconomyState` is the economy slice only); `divideRounded` after the divisibility assert is the project's only division path; `tuning.yaml` trailing comments (`# Daily simulation`, `# M7`) are GDD source tags, unchanged; the JSON Schema `maximum` on `billingMonthDays` (from `z.int()`) is above the compile ceiling, but the build rejects with a clear message and the editor schema is advisory; reactors seeing `gameDayStarted` before `dailyEconomyApplied` at one `gameMs` is the approved C-4 order.

Code review run 3 (2026-10-28, full workflow: Blind Hunter, Edge Case Hunter and Acceptance Auditor as parallel subagents). 0 decision_needed, 2 patch (both applied, naming and test-title only), 0 defer, 9 dismissed. No logic or behaviour finding.

- [x] [Review][Patch] The helper `unitOf` did not start with a verb (project-context Naming Rules); renamed `readUnitName` [src/core/contentSchema/fieldGroup.ts:103]
- [x] [Review][Patch] The `it.each` title "rounds MRR %i half away from zero" also covered non-half cases; now "rounds MRR %i to the nearest cent" (the literal half cases keep their own test) [src/core/economy/applyDailyEconomy.test.ts:59]

Dismissed (one line each): day start before settlement, per-day rounding drift, unbounded salary, the `billingMonthDays` JSON Schema `maximum`, the `selectRunway` hidden-state test and the float-cash `/safe integers/` case were dismissed in runs 1–2 and no failing input was found; random `economyStep` events in `pendingEventArbitrary` feed the generic chunk-invariance and tie-break properties (the queue-shape invariant is the run-1 defer, and ECO-02's property covers the real schedule); `noBurn` winning over negative cash needs burn ≤ 0 with cash below zero, which no current path reaches (start cash ≥ 0, costs ≥ 0); `atLeast` / `wholeAtLeast` and the test helpers `countOf` / `expectedEventOf` follow the existing `range` and `issuesOf` precedents.

Code review run 4 (2026-10-28, full workflow: Blind Hunter, Edge Case Hunter and Acceptance Auditor as parallel subagents). 0 decision_needed, 2 patch (both applied, tests only), 1 defer, 15 dismissed. No logic or behaviour finding in production code.

- [x] [Review][Patch] The `> 0` half of the billing-month invariant had no test. A compiled `billingMonthGameMs: 0` passes `% GAME_DAY_MS === 0`, so deleting `> 0` would let a division by zero through. The test now covers 90,000 and 0 [src/core/economy/applyDailyEconomy.test.ts]
- [x] [Review][Patch] "accepts the bounds themselves" did not cover the zero `start` bounds added in run 1 (Hype, Alignment, GPU units) and never asserted the compiled GPU unit cost. All of them are now pinned at 0 [src/core/contentSchema/tuningSchema/tuningSchema.test.ts]
- [x] [Review][Defer] The runway uses gross burn. That is correct while MRR is 0, but it becomes misleading once Story 2.4 moves MRR (net burn, and `noBurn` when profitable) [src/core/economy/computeRunwayDays.ts]. Deferred to Story 2.4. C-8 is unchanged here.

Dismissed (one line each): the float-cash `/safe integers/` case, the `selectRunway` hidden-state test, revenue tests compared against `divideRounded`, per-day rounding drift and the `billingMonthDays` JSON Schema `maximum` were all dismissed in runs 1–3, and no new failing input came up. `typeof` before `Number.isSafeInteger` was dismissed in run 2. A huge `start.gpuCapacityUnits` (1e15) builds clean and then fails at the first burn read: run 2 chose that fail-fast assert, and upper bounds belong to the 1.3 range-check defer. The `selectRunway` comment says it "can never leak", which is true at the type level the comment describes. The `selectRunway` tests repeat the runway cases because C2 asks for selector tests. Completion Notes "exactly those fields" is a historical dev record, and run 2 corrected the live note in `deferred-work.md`. `unknown phase ${state.phase}` without `String()` only produces a poor message for a non-string phase on a corrupt snapshot, and the lint gate accepts it. `game-test-design.md` uses `replay(start, inputLog)` as scenario shorthand, like the `epics.md` signatures dismissed in run 1. The `advance(state, entry.atGameMs)` in the Story 1.2 deferral is shorthand inside a historical note that still holds. In the DET-06 property, burn from the final state matches today because nothing changes GPU or phase, which is the run-1 settle-at-day-end dismissal.

Code review run 5 (2026-10-28, full workflow: Blind Hunter, Edge Case Hunter and Acceptance Auditor as parallel subagents). 0 decision_needed, 1 patch (applied, comment only), 0 defer, 9 dismissed. No logic, behaviour or test finding. The Edge Case Hunter found nothing new, and a scratch run confirmed `-0` tuning, a one-day billing month, zero costs and chunked advance.

- [x] [Review][Patch] The `SimulationState` comment said what the type is ("every slice a handler may read or write"), not why it exists (Charter #4). It now gives the reason: a slice bound keeps `core/time` from importing `core/run` [src/core/time/eventHandler.ts:13]

Dismissed (one line each): the queue-shape invariant for `economyStep` and replay not tied to `contentPackVersion` are run-1 defers, and no new failing input came up. Snapshots from before this story are rejected by the exact-key check, but no save format exists yet (Story 1.9 owns it). `gameDayStarted` before `dailyEconomyApplied` at one `gameMs` is the approved C-4 order (dismissed in run 2). Unbounded `salaryPerHirePerDay` is out of scope by C-9 (run 2). The `selectRunway` hidden-state test and the shared default tuning were dismissed in run 1. Burn and revenue `describe` blocks share `applyDailyEconomy.test.ts`: the rule asks for colocated tests, which these are, and `handleDayBoundary` and `formatEventId` are likewise tested through another colocated file. The hard-coded `billingMonthDays = 30` in the revenue test mirrors AC 2's literal `MRR / 30`, and the expectations still go through `divideRounded` as B4 asks.

## Change Log

- 2026-10-28: Story created (status ready-for-dev) by gds-create-story, unattended.
- 2026-10-28: Implemented by gds-dev-story, unattended (status review): `core/economy` module, `economyStep` event and handler, `AdvanceContext` (`advance`/`newRun`/`replay` now take tuning), `GameState` economy and hidden fields with validation, `app/selectors/selectRunway`, tuning schema bounds for the fields read here, builders, tests and docs. `npm run check` and e2e (Chromium, WebKit) green.
- 2026-10-28: Code review run 1 (full workflow): 8 patches applied, 3 items deferred.
- 2026-10-28: Code review run 2 (full workflow): 6 patches applied, nothing deferred.
- 2026-10-28: Code review run 3 (full workflow): 2 cosmetic patches applied (naming, test title), nothing deferred.
- 2026-10-28: Code review run 4 (full workflow): 2 test-only patches applied, 1 item deferred (net-burn runway, Story 2.4).
- 2026-10-28: Code review run 5 (full workflow): 1 comment-only patch applied, nothing deferred.
