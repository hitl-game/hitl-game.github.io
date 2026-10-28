---
title: 'Game Test Design'
project: 'browser-game'
game: 'Human in the Loop'
version: '1.0'
date: '2026-10-27'
author: 'Tiziano (drafted by the gds-test-design workflow, unattended run)'
design_level: 'full'
focus_area: 'auto'
scope: 'system-level'
sourceDocuments:
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md (v2.0, 94 stories, 8 epics)
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md (v1.2)
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md
  - _bmad-output/game-architecture.md (v1.0, synced 2026-10-27)
  - _bmad-output/project-context.md
  - _bmad-output/narrative-design.md
  - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md
---

# Game Test Design: Human in the Loop

**Version**: 1.0
**Created**: 2026-10-27
**Author**: Tiziano (drafted by the `gds-test-design` workflow in an unattended run; see *Assumptions made without the user*)

---


> **Resolved after review (2026-10-27, Tiziano).** Story numbers follow epics.md v2.1 (E1 and E4 reordered).
> - **A-9 confirmed:** a round that closes after a beat is scheduled pushes the beat to the end of the new cooldown.
> - **A-10 decided:** if Bankrupt and Surpassed trigger in the same step, exactly one `runEnded { cause: 'surpassed' }` is emitted (Surpassed wins).
> - **A-12 / R6 decided:** version pinning (architecture D4): a run stays on its app and content version; the service worker does not activate a new version mid-run; if the pinned version is unavailable, the run continues as a new replay segment and the desync detector never rewrites it. SAV-09/SAV-10/PLT-06 assert exactly this.
> - Also decided: capacity never caps inflow and the capacity offer fires at 100% from any load (GDD M4, C1); time bases per architecture D1 (cadences in game time, windows converted once at creation).

## Overview

### Game Description

*Human in the Loop* is a free, open-source, single-player browser game: a roguelite incremental management sim in which the player runs an AI startup from a garage until the company's own AI (Metis) surpasses them. The whole game is a fake SaaS workspace (Huddlr chat, Vanity dashboard rail, LGTM Docs, AllGreen incidents). There are no game graphics; the UI is the game.

Core loop: messages arrive in channels → the player triages them (1–2 clicks or keys), delegates them to Metis (policy per channel, Ask Metis, Auto-triage) or assigns them to staff → the daily economy step moves Cash, MRR, Hype and runway → funding rounds widen the workspace (Garage → Seed → Series A+). Every AI decision silently drifts a **hidden Alignment** value. Its thresholds show only as silent signals (corrupting title, Metis/Dora registers, inference-log lines, UI infection). The run ends in **Bankrupt** or **Surpassed**. Surpassed is followed by a clue replay, and both endings produce a spoiler-safe document (HTML, PNG, tagged PDF/UA). Then Loop #N+1 starts.

What makes this game hard to test is not rendering. It is **determinism over multi-hour runs, absence simulation, hidden state that must never leak, persistence in the browser, and accessibility under real-time pressure**.

### Target Platforms

- [x] Web, desktop: latest 2 versions of Chrome, Edge, Firefox, Safari (desktop-first, reference ≥ 1280 px)
- [x] Web, mobile: Safari iOS and Chrome Android (touch-playable, responsive down to 320 CSS px)
- [x] Offline after first visit (PWA, service worker); static hosting on GitHub Pages (dedicated organization origin)
- [ ] PC storefronts (Steam/Epic): not applicable
- [ ] PlayStation 5 / Xbox Series X|S / Nintendo Switch: not applicable
- [ ] Native mobile apps: not applicable

"Certification" here means the web equivalents: WCAG 2.2 AA, PDF/UA for the exported PDF, zero runtime network calls, no telemetry, offline operation, and a production build free of debug hooks.

### Test Scope

**In scope (system level):**

- Pure simulation core (`core/`): time and the event queue, RNG streams, economy, triage, delegation, Alignment, absence, deck, staff, investors, decisions, scripts, ending, report model, save schema and migrations.
- Shell (`platform/`, `app/`): clock, visibility, storage, tab lock, codec, notifications, service worker, background preview, desync detector, error boundary.
- UI (`ui/`): primitives, patterns, features, region gating, a11y services, theming and infection.
- Renderers (`report/`): PNG (Canvas 2D) and tagged PDF (PDFKit).
- Content pipeline (`content/`, `tools/`): schemas, editorial CI, `contentPackVersion`, `content:audit`.
- Non-functional: performance NFR1–NFR6, offline NFR7, browsers NFR8, accessibility NFR9, determinism NFR10, save integrity NFR11, privacy NFR13, hidden state NFR14, code-quality gates NFR15.
- Playtest gates H1, H2, H3: entry criteria (automated) and observation support (manual).

**Out of scope:**

- Multiplayer, networking, matchmaking: the game is single player with no backend (section 3 is marked N/A).
- Anti-cheat: import verification is integrity protection only (architecture D5).
- Post-MVP features: QR recap page UI (only the `HITL-RECAP` v1 payload *shape* is tested), community PR process, extra phases.
- Engine tooling (Unity/Unreal/Godot): not used. The test stack is fixed by architecture D12.
- Subjective content quality (Voice Principle): owned by Tiziano's final cut (Stories 7.8–7.10). This plan tests only its mechanical rules and the `content:audit` gate.

### Test Levels and Fixed Stack (architecture D12)

| Level | Tooling | Where it runs | Notation in scenarios |
|---|---|---|---|
| Core unit | Vitest (Node, no DOM), colocated `*.test.ts`, builders in `tests/builders/` | every PR | `unit` |
| Properties | fast-check (Node); shrunk counterexamples committed as permanent tests | every PR; high iteration count nightly | `property` |
| Golden runs | Vitest + `tests/golden/` fingerprints; change only via `npm run golden:update` | every PR | `golden` |
| Content | Vitest + Zod schemas + content CI checks (pass/fail fixture per rule) | every PR | `content` |
| UI component | Vitest + happy-dom + @testing-library/preact (queries by role and name, no DOM snapshots) | every PR | `component` |
| End-to-end | @playwright/test via `?scenario=<name>` and `window.__hitl` (test builds only) | Chromium on PRs; Chromium + Firefox + WebKit on `main` | `e2e` |
| Accessibility | @axe-core/playwright inside e2e | with e2e | `a11y-e2e` |
| PDF | veraPDF (PDF/UA) | `main` (from Story 8.1) | `verapdf` |
| Performance | Playwright + CDP (Chromium) | nightly | `perf` |
| Static gates | ESLint (boundaries, restricted globals), Stylelint, jscpd, knip, size-limit, `lint:fixtures` | every PR | `lint` |
| Manual | Screen readers (VoiceOver macOS/iOS, NVDA, JAWS), touch devices, playtests | gates H1/H2/H3, Story 8.9 | `manual` |

---

## Risk Assessment

### High-Risk Areas

| ID | Area | Risk | L | I | Pri | Mitigation (test strategy) | Scenarios |
|---|---|---|---|---|---|---|---|
| R1 | Determinism and replay | Live state ≠ `replay(start, inputLog)` because of float math, iteration order, tie-breaks, stream cross-talk, unlogged settings, or JS engine differences. ADR-002 makes any non-determinism release-blocking. | High | High | **P0** | All five Replay Consistency levels: properties, goldens, migration fixtures, e2e fingerprint, runtime desync detector. Plus a cross-engine golden check. | DET-01…DET-12 |
| R2 | Absence simulation | One big `advance(…,'away')` diverges from many small steps. The 14-day cap or the stop at a heavy decision or death is wrong. The hidden-tab preview disagrees with the real return. | High | High | **P0** | Chunk-invariance properties over absences. Cap and stop unit tests. Preview ≡ return e2e. Nightly 14-day < 500 ms check. | ABS-01…ABS-14 |
| R3 | Hidden Alignment leak | Alignment, or the fact that a signal changed, reaches the UI, DOM, accessibility tree, live regions, toasts, audio, notifications, logs, the away report, the chronicle, the PNG/PDF, the stats export or a production debug hook. This would destroy the core twist (Pillar 2, NFR14). | Medium | High | **P0** | Lint boundary on `alignmentMilli`. A non-interference property on `buildReportModel`. Forbidden-term scans of reports, documents and the DOM. Live-region and reactor silence tests at forced crossings. Production bundle inspection. | ALN-01…ALN-16 |
| R4 | Spine beat queue | Beats stack, fire during a round cooldown, are lost or moved on reload, survive into Surpassed, or delay visible signal state. The pacing of the narrative spine (H2) breaks. | Medium | High | **P0** | Scheduling unit tests with exact day arithmetic. Chunk invariance with queued beats. Reload survival. Drop on Surpassed. | SPN-01…SPN-09 |
| R5 | Save durability (Safari first) | Save loss through Safari eviction, an unreliable `pagehide` on iOS, quota exceeded, two tabs writing, or a broken migration. The validation cohort target is zero save loss (NFR11). | High | High | **P0** | Autosave trigger e2e on three engines. Web Locks handover. Fake-storage quota tests. Migration fixtures. Manual Safari/iOS eviction and `persist()` pass. | SAV-01…SAV-13, IMP-01…IMP-07 |
| R6 | Content-pack version vs replay | A service-worker update or a new deploy changes `contentPackVersion` under an existing save. Replaying an old input log against new content can diverge. Under the rule "on mismatch the replay wins" (D4 level 5), the desync detector could silently rewrite a valid run. | Medium | High | **P0** | Fixture saves from pack vN loaded in a build with pack vN+1. Assert the documented migration path and never a silent rewrite. Decided: version pinning (architecture D4), see the resolution note at the top. | SAV-09, SAV-10, PLT-06 |
| R7 | Accessibility under real time | The game is not completable with a screen reader or keyboard alone: announcer floods, focus theft on new messages, timers too short, infection breaking contrast or accessible names, the tab-title strike read as noise. | Medium | High | **P0** | Primitive axe and keyboard tests. Focus-contract e2e. Announcer verbosity tests. An axe matrix across themes and infection stages. Manual VoiceOver/NVDA/JAWS passes at H2 and H3. | A11Y-01…A11Y-16, INP-01…INP-08 |
| R8 | Tagged PDF in the browser | PDFKit output fails PDF/UA, fonts fail to embed, the chunk breaks the 150 KB budget, or it needs cross-origin isolation (impossible on Pages). | Medium | Medium | **P1** (P0 for the 8.1 spike) | Story 8.1 go/no-go with veraPDF in CI. A per-document veraPDF regression. A lazy-chunk size check. | PDF-01…PDF-06 |
| R9 | Performance | Background CPU not ≈ 0, heap > 150 MB at 8 h (unbounded collections), 14-day return > 500 ms, first interactive > 2 s, PNG/PDF > 3 s, < 60 FPS. | Medium | Medium | **P1** | Nightly Playwright + CDP suite (Story 8.8). Bounded-collection unit tests. size-limit in CI. | PRF-01…PRF-09 |
| R10 | Clue replay correctness | The probe perturbs replay. Top-5 causes are wrong or lose their quotes once old messages are dropped from state (bounded ~200). The counterfactual is miscomputed. If H2 testers see a wrong "proof", they protest instead of recognising. | Medium | High | **P0** | Probe non-interference test. Cause grouping with constructed runs. A quote recovered after state pruning. Counterfactual formula unit test. | END-07…END-12 |
| R11 | Cascade and region gating | A beat fires out of order, ⏸ beats don't wait, a reload mid-cascade loses script state, a locked region leaks into the DOM, shortcuts exist before their region. H1 depends on the first 10 minutes. | Medium | High | **P1** | Script-runner unit and property tests. Cascade e2e with random answers. Region-gating component tests. | UNL-01…UNL-08 |
| R12 | Content breaking runs | A schema-valid but semantically broken item (dangling reference, `alignmentGrant` outside heavy, missing stage-0 register, cycle in event steps) breaks a run or the spine. Placeholders reach a playtest gate. | Medium | Medium | **P1** | A pass/fail fixture per editorial rule (Story 7.1). `content:audit --require-final` as a hard gate before H1/H2/H3. | CNT-01…CNT-09 |
| R13 | Offline and updates | The game fails offline, an external request slips in (fonts, CDN), or a new version applies mid-run (which also changes the content pack, see R6). | Low | High | **P1** | Offline e2e, network-request allowlist e2e, SW update e2e. | PLT-01…PLT-07 |
| R14 | Cross-browser specifics | WebKit differences: Web Locks, BroadcastChannel, Notification API missing on iOS, `visibilitychange`/`pagehide` ordering, U+0336 strike rendering, CSS forced-colors. | Medium | Medium | **P1** | e2e on Chromium, Firefox and WebKit on `main`. Manual device pass (Story 8.9). | XB-01…XB-06 |
| R15 | Triage fun (H1) and twist fairness (H2) | The design hypotheses fail: triage feels like work, Surpassed feels unfair. | Medium | High | **P1** | Not automatable. Gate entry criteria plus observation sheets (Playtesting Recommendations). | E2E-01, E2E-03, playtests |

L = likelihood, I = impact, Pri = priority.

### Risk Priority Matrix

```
                    IMPACT
                Low      High
            ┌─────────┬──────────────────────────────┐
      High  │   P2    │   P0  R1 R2 R5               │
LIKELIHOOD  ├─────────┼──────────────────────────────┤
      Low   │   P3    │   P1  R8 R9 R11 R12 R13 R14  │
            └─────────┴──────────────────────────────┘
   Raised to P0 although likelihood is medium, because failure invalidates a
   pillar or a playtest gate: R3 (hidden state), R4 (spine), R6 (content pack
   vs replay), R7 (accessibility), R10 (clue replay).
```

### Risk-Based Ordering of Test Implementation

1. **Critical path, foundation:** DET (Story 1.2 onward, from day one), SAV/IMP (1.9–1.10), ALN boundary lint (3.4).
2. **Critical path, gameplay:** TRI, ECO, UNL (E2 → gate H1), DEL, ABS (E3).
3. **Twist integrity:** ALN, SPN, END (E5 → gate H2).
4. **Shared artifacts and platform:** DOC, PDF, META (E6), A11Y, PRF, PLT, XB (E8 → gate H3).

---

## Scenario Conventions

All scenarios follow the workflow format, extended with three trace lines:

```
SCENARIO <ID>: <behaviour stated as a sentence>
  GIVEN … WHEN … THEN …
  PRIORITY: P0–P3
  CATEGORY: gameplay | progression | platform | e2e
  LEVEL: unit | property | golden | content | component | e2e | a11y-e2e | verapdf | perf | lint | manual
  TRACE: Story x.y (FR/NFR/UX-DR) · Gate: H1 | H2 | H3
```

- **Gate** is the earliest playtest gate at which the scenario must be green: **H1** = Story 2.13 (end of E2), **H2** = Story 5.13 (end of E5), **H3** = Story 8.10 (blind cohort). E1 foundations gate at H1.
- **Scenario fixtures** (`?scenario=<name>`) are the debug-panel scenarios in `tests/fixtures/`. Names already defined in the source documents are used verbatim. New names are proposals (see *Test Fixtures*).
- Numbers come from the GDD and `content/tuning.yaml`. Where a scenario quotes a tuning value, the test reads it from tuning and does not hard-code it (NFR16). The quoted value is only the expected default.

---

## Test Categories

### 1. Core Gameplay Tests

#### 1.1 Core Loop: Determinism and Replay (R1)

```
SCENARIO DET-01: Live state equals full replay for any valid command sequence
  GIVEN a random seed, a random sequence of valid commands and random game-ms timestamps (fast-check)
  WHEN the commands are applied live with interleaved advance() calls
  AND replay(start, inputLog) is run from scratch
  THEN fingerprint(live) equals fingerprint(replay)
  AND any shrunk counterexample is committed as a permanent regression test
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.2 (FR70, NFR10, ADR-002) · Gate: H1
```

```
SCENARIO DET-02: Chunk invariance holds for arbitrary time splits
  GIVEN a state s and times t1 ≤ t2 with the same commands
  WHEN advance(advance(s, t1), t2) and advance(s, t2) are computed
  THEN both results have the same fingerprint and the same emitted domain events in the same order
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.2 (D1, ADR-001) · Gate: H1
```

```
SCENARIO DET-03: Snapshot plus log tail equals full replay
  GIVEN a run saved at a random point (snapshot + input log)
  WHEN it is restored from the snapshot and the remaining log tail is applied
  THEN the fingerprint equals replay(start, fullInputLog)
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.2, 1.9 (D4) · Gate: H1
```

```
SCENARIO DET-04: Equal-time events run in deterministic tie-break order
  GIVEN queued events with identical gameMs and different kinds and ids, inserted in random order
  WHEN advance() processes them
  THEN they run in (gameMs, kind priority, stable id) order regardless of insertion order or object key order
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.2 (D1) · Gate: H1
```

```
SCENARIO DET-05: RNG streams are isolated per subsystem
  GIVEN a run seed and the named streams messages, deck, candidates, investors, outcomes, headlines, documents
  WHEN extra draws are made from one stream
  THEN the draw sequences of every other stream are unchanged
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.2 (D2) · Gate: H1
```

```
SCENARIO DET-06: Persisted state holds integers only
  GIVEN random runs through economy, Hype, Alignment and interest steps (fast-check)
  WHEN the state is inspected after every step
  THEN every numeric field is a safe integer (cents, basis points, milli-points, game-ms)
  AND the state holds no class instance, Map, Set or undefined value
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.2, 1.5 (D2, D3) · Gate: H1
```

```
SCENARIO DET-07: Golden run fingerprint is stable
  GIVEN the recorded golden run (found → Deploy → 40 game days of inputs)
  AND later goldens for seed-first-policy, series-a-entry and a full Surpassed run
  WHEN the golden suite runs
  THEN each final fingerprint equals the stored one
  AND a changed fingerprint fails CI unless the PR updates it via npm run golden:update with a stated reason
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: golden
  TRACE: Story 1.11, 4.17, 5.13 (D4 level 2) · Gate: H1 (first golden), H2 (Surpassed golden)
```

```
SCENARIO DET-08: Golden fingerprints are identical across JavaScript engines
  GIVEN the golden runs of DET-07
  WHEN they are replayed in Node, Chromium, Firefox and WebKit (e2e test build, window.__hitl)
  THEN all four fingerprints are identical
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 1.11 (NFR8, NFR10) · Gate: H1
```

```
SCENARIO DET-09: Simulation settings changed mid-run are replayed
  GIVEN a run in which Timing changes to Relaxed and Game speed to ½× at arbitrary game times
  WHEN the run is replayed
  THEN the replay matches live, because both changes are commands in the input log
  AND changing a presentation preference (theme, motion, audio) leaves the fingerprint unchanged
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 1.6, 8.2, 8.3 (C3, FR85) · Gate: H1 (speed), H3 (Timing UI)
```

```
SCENARIO DET-10: Invalid commands leave state and log untouched
  GIVEN a state and an invalid command (answering an expired or unknown message, buying capacity with insufficient cash)
  WHEN applyCommand is called
  THEN it returns the typed CommandError and the state and input log are unchanged
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 1.2 (C1) · Gate: H1
```

```
SCENARIO DET-11: Runtime desync detector lets the replay win and records a diagnostic
  GIVEN a save whose snapshot was deliberately altered (test fixture) while the input log is intact
  WHEN the save loads and the browser is idle
  THEN the worker replays the log, the replayed state replaces the snapshot,
  AND a local diagnostic (seed, versions, first diverging input) is recorded and exportable
  AND no network request is made
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 1.10 (D4 level 5) · Gate: H1
```

```
SCENARIO DET-12: The core cannot read clocks or randomness
  GIVEN the lint fixture set
  WHEN npm run lint:fixtures runs
  THEN Math.random, Date, performance, setTimeout and console in core/, and imports from core to platform, are reported as errors
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: lint
  TRACE: Story 1.1, 1.6 (D1, D13) · Gate: H1
```

#### 1.2 Core Loop: Time, Clock States and Economy

```
SCENARIO CLK-01: One real minute is one game day at 1×, and speed changes stretch it
  GIVEN a visible tab after Deploy at Game speed 1×
  WHEN 60 real seconds pass (fake clock at the platform boundary)
  THEN exactly one game day elapses
  AND at ½× and ¼× one game day takes 2 and 4 real minutes, with the economy per game day unchanged
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 1.6 (FR1) · Gate: H1
```

```
SCENARIO CLK-02: Pausing surfaces freeze game time
  GIVEN each pause reason (heavyDecision, awayReport, settings, shortcutOverlay, backlog)
  WHEN real time passes while it is active
  THEN game time does not advance (backlog: only the top backlog timer runs)
  AND removing the last pause reason resumes time without a catch-up jump
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 1.6, 3.8, 4.5 (FR2) · Gate: H1 (settings, overlay), H2 (others)
```

```
SCENARIO CLK-03: Clock stays at zero before Deploy and ignores a backwards clock
  GIVEN the first workspace screen awaiting Deploy
  WHEN any amount of real time passes
  THEN game time stays at 0
  AND after Deploy a negative real delta (system clock moved back) counts as zero
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 1.6, 1.8 (FR2, FR54) · Gate: H1
```

```
SCENARIO ECO-01: A new run starts with the canonical state
  GIVEN newRun({ seed, loopNumber: 1, contentPackVersion, settings })
  WHEN the state is inspected
  THEN cash is 1,240,000 cents, Hype 2,000 bp (hidden), Alignment 100,000 milli, phase garage, 1 GPU unit, MRR 0, customers 0
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 1.5 (FR3) · Gate: H1
```

```
SCENARIO ECO-02: Garage burn gives a 31-day runway with no revenue
  GIVEN a Garage run with no customers
  WHEN daily economy steps run
  THEN cash drops by the Garage burn (~$400/day from tuning) and the derived runway is 31 days at day 0
  AND the daily step is scheduled exactly once per game day (property)
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + property
  TRACE: Story 1.5 (FR4) · Gate: H1
```

```
SCENARIO ECO-03: Garage inflow reaches the worked target without answers
  GIVEN a Garage run after Deploy at Hype 20, with no answers given
  WHEN daily steps run
  THEN new customers are 2 + 0.1 × Hype per day with deterministic integer carry-over, baseline churn is 0.1%/day,
  AND the run has 95–105 customers at day 25 ± 2, and inflow is never capped by Compute
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 2.4 (FR5, FR6) · Gate: H1
```

```
SCENARIO ECO-03b: A player who never delegates can buy capacity and reach Seed (C1)
  GIVEN a Garage run where the player answers everything by hand and never enables a policy
  WHEN customers alone push GPU utilization to 100%
  THEN Metis's capacity offer appears (N units to bring utilization to 70%), buying it adds burn and moves no Alignment
  AND the run reaches the $5k MRR Seed gate; the balance harness asserts this on ≥ 80% of seeds
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + balance harness
  TRACE: Story 2.4, 3.3, 4.17 (FR5, FR9, GDD M4) · Gate: H2
```

```
SCENARIO ECO-04: Phase inflow, tiers and GPU churn follow the GDD
  GIVEN Seed and Series A states built with builders
  WHEN daily steps run
  THEN inflow is ×3 (Seed) and ×10 (Series A), the Team share is Hype/200 capped at 45%,
  AND Enterprise customers arrive only through event effects,
  AND churn rises along the tuning curve when GPU utilization > 90%
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.6 (FR5, FR6) · Gate: H2
```

```
SCENARIO ECO-05: Hype decays and is clamped
  GIVEN Hype values across 0–10,000 bp
  WHEN the daily step runs
  THEN from Seed Hype decays by ~2% of its current value (no decay while hidden in the Garage), stays within 0–100, and the Hype tile appears only from Seed
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 4.1 (FR7) · Gate: H2
```

```
SCENARIO ECO-06: Implied and peak valuation obey the clamps
  GIVEN ARR and Hype at 20, 55, 90 and outside the range
  WHEN implied valuation is computed
  THEN the multiple is linear from 10× (Hype 20) to 60× (Hype 90), clamped to 10–60×,
  AND peak valuation is the max of every round post-money and every implied valuation (including the $2B worked target)
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.13 (FR10) · Gate: H2
```

```
SCENARIO ECO-07: Headcount burn follows salary × headcount^1.2 in integers
  GIVEN headcounts 1, 5, 12 and 40 with trait modifiers (Ex-FAANG ×1.5)
  WHEN burn is computed
  THEN headcount burn = Σ salaries × H^1.2 / H with phase salaries from tuning, rounded only through the shared helper
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.7 (FR4) · Gate: H2
```

```
SCENARIO ECO-08: Money formatting switches to compact notation at $100,000
  GIVEN cent values at $99,999, $100,000, $412,500, $12.4M, $2.03B and negative values
  WHEN formatCents / formatCompactCents render them
  THEN values below $100,000 show full digits, values from $100,000 show compact notation, and negatives carry "−"
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 1.4 (FR11) · Gate: H1
```

#### 1.3 Core Loop: Triage and the Message Lifecycle

```
SCENARIO TRI-01: Messages arrive at phase cadence with full structure
  GIVEN the Garage phase after Deploy
  WHEN time advances
  THEN messages arrive at 1 per 10–15 s (tuning) from the messages stream, each with sender, channel, urgency, stakes,
  default_answer, typed params, 2–3 answers and a counter id (msg-000001)
  AND Seed and Series A+ cadences follow FR13 up to the 40/min cap
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 2.3 (FR12, FR13) · Gate: H1 (Garage), H2 (later phases)
```

```
SCENARIO TRI-02: Response windows scale with urgency and Timing
  GIVEN messages of urgency low, normal and urgent at each Timing (Standard, Extended ×2, Relaxed ×4)
  WHEN they arrive
  THEN expiresAtGameMs equals 120 / 75 / 45 real seconds × the Timing multiplier, converted at the current game speed
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 2.3, 8.3 (FR14, FR85) · Gate: H1 (Standard), H3 (all)
```

```
SCENARIO TRI-03: A message resolves exactly once
  GIVEN random arrivals, answers and time jumps (fast-check)
  WHEN they are processed
  THEN no message expires twice, no message expires after being answered, default_answer effects apply exactly once,
  AND answering an expired message returns messageExpired
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 2.3 (FR14) · Gate: H1
```

```
SCENARIO TRI-04: Templates do not repeat within the window
  GIVEN a channel pool of size P
  WHEN templates are drawn many times (fast-check)
  THEN no template repeats within the last min(10, P − 5) messages of that channel, and draws respect phase weights and conditions
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 2.3 (FR15) · Gate: H1
```

```
SCENARIO TRI-05: Answering shows the outcome and announces only visible deltas
  GIVEN a waiting message in the current channel
  WHEN the player clicks an answer
  THEN the buttons collapse to "You · <answer>", focus moves to the outcome line, KPI tiles roll with a delta flash,
  AND the announcer says "Answered: <answer>. Cash −$2,000, Runway −5 days" with visible KPIs only, never Alignment
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 2.5, 2.7 (FR16, UX-DR16, UX-DR21, UX-DR47) · Gate: H1
```

```
SCENARIO TRI-06: The current message never moves on its own
  GIVEN a channel view with a current message
  WHEN new messages arrive in the same and in other channels
  THEN neither focus nor the current marker moves
  AND current moves only with J/K, a click, U (next unanswered, urgent first) or after the player answers
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component + e2e
  TRACE: Story 2.6 (FR19, UX-DR48) · Gate: H1
```

```
SCENARIO TRI-07: Resolved messages are bounded per channel
  GIVEN a long session in one channel
  WHEN resolved messages exceed tuning.resolvedMessagesPerChannel (~200)
  THEN the oldest are dropped from state, and the rendered chat log stays bounded
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 2.3, 2.5 (NFR2) · Gate: H1
```

```
SCENARIO TRI-08: An expired message shows its default outcome
  GIVEN a waiting message that is not answered
  WHEN its window lapses
  THEN the card reads "Expired · default applied: <answer>" in muted text,
  AND the expiry is announced only if the message was current or urgent
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 2.5 (FR14, UX-DR47) · Gate: H1
```

#### 1.4 Core Loop: Delegation, Ask Metis and Compute

```
SCENARIO DEL-01: A policy answers its channel live with the player's habitual answer
  GIVEN an active "Metis handles #customers" policy and a template the player answered with answer B twice and A once
  WHEN a new message from that template arrives while present
  THEN Metis answers it immediately with B ("✨ Metis replied: …"), falling back to metis_answer when no history exists
  AND both switches (channel header and ✨ Automations) and the sidebar ✨ show the same state
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 3.1 (FR27, FR28, UX-DR15, UX-DR34) · Gate: H2
```

```
SCENARIO DEL-02: A policy enabled later covers waiting messages on expiry
  GIVEN a waiting #customers message and the policy switched on afterwards
  WHEN its window lapses
  THEN the status becomes expired { outcome: 'delegated' } with Metis's answer, not the default
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 3.1 (FR14, FR28) · Gate: H2
```

```
SCENARIO DEL-03: Channels without policies have no toggle
  GIVEN #general, #engineering, #investors and any DM
  WHEN their header renders
  THEN no policy toggle exists, and the ✨ Automations page lists only unlocked policy-capable channels with stakes
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 3.1 (FR27) · Gate: H2
```

```
SCENARIO DEL-04: Ask Metis answers one message and is disabled with a reason at capacity
  GIVEN a waiting message
  WHEN the player presses D (or Alt+D) or clicks Ask Metis
  THEN Metis answers instantly, it counts as an AI decision and consumes Compute, and "Metis replied: <answer>" is announced
  AND at capacity (or during an audit pause) the button is aria-disabled with the inline reason text
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 3.2, 5.7 (FR17, FR40) · Gate: H2
```

```
SCENARIO DEL-05: Compute load and utilization are integer-safe
  GIVEN customers by tier and Metis answers in a game day
  WHEN load is computed
  THEN load = Σ customers × tier load (1 / 5 / 50) + 0.5 per Metis answer, using integer half-units, and utilization = load / (units × 100)
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + property
  TRACE: Story 3.3 (FR8) · Gate: H2
```

```
SCENARIO DEL-06: The capacity offer is a purchase that never moves Alignment
  GIVEN utilization at 100% and a delegated message that cannot be served
  WHEN it is processed
  THEN it expires with its default, Metis DMs the capacity offer (repeated every 5 game days while utilization stays at 100%; a newer offer supersedes older buttons; N and price computed at click),
  AND accepting adds units at the direct-purchase price, adds burn, shows a toast, and leaves Alignment unchanged
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 3.3, 4.11 (FR8, FR9) · Gate: H2
```

```
SCENARIO DEL-07: Auto-triage hands the backlog to Metis with capacity limits
  GIVEN a backlog of 15 and capacity for 9 Metis answers
  WHEN the player clicks "✨ Auto-triage 15 messages" (no confirmation)
  THEN 9 are answered as delegated decisions (each drifting Alignment), 6 expire with default,
  AND the status line and announcer read "Metis replied to 9 · 6 expired (at capacity)", and autoTriageRuns increments once
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 3.9, 6.1 (FR26, FR66) · Gate: H2
```

```
SCENARIO DEL-08: Assigning to staff never moves Alignment
  GIVEN at least one hire and a waiting message
  WHEN the player presses A, picks a person in the staff picker and presses Enter
  THEN the card shows "Assigned to <name> · in queue (N)", the message resolves after ~30 s of present time (trait-modified),
  AND Alignment does not change, "Assigned to <name>" is announced,
  AND with no hires Assign and its shortcut do not exist
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 4.8 (FR18, UX-DR19) · Gate: H2
```

#### 1.5 Core Loop: Absence Simulation and Return (R2)

```
SCENARIO ABS-01: Leaving with no active policy freezes the company
  GIVEN a run with no active delegation policy
  WHEN the tab is hidden or closed for 3 real hours and the player returns
  THEN no game time passes, no absence input is logged and no report is shown
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 3.5 (FR20) · Gate: H2
```

```
SCENARIO ABS-02: Leaving with a policy advances the whole company
  GIVEN an active #customers policy
  WHEN the player is away for 6 real hours
  THEN an absence input with leave and return wall-clock times is logged,
  AND advance(…, 'away') applies burn, revenue, events and Metis answers in #customers,
  AND messages in non-delegated channels go to the backlog without expiring
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 3.5, 3.6 (FR20, FR22) · Gate: H2
```

```
SCENARIO ABS-03: An absence is capped at 14 game days
  GIVEN an active policy
  WHEN the player is away for 30 real days
  THEN exactly 14 game days are simulated and the rest is discarded
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 3.5 (FR21) · Gate: H2
```

```
SCENARIO ABS-04: An absence stops at the first heavy decision
  GIVEN an active policy and a heavy event that becomes due on game day 4 of the absence
  WHEN a 10-day absence is simulated
  THEN advance stops on day 4 with stoppedBy = heavyDecision, the remaining absence is discarded,
  AND the return order is report ("Simulation paused on Day N: <reason>") → heavy decision → backlog → workspace
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 3.5, 3.7 (FR21, FR24) · Gate: H2
```

```
SCENARIO ABS-05: Death during an absence goes report → death sequence
  GIVEN an absence during which Bankrupt (or Surpassed) is reached
  WHEN the player returns
  THEN the simulation stopped at the death, the away report opens first, then the death sequence; no backlog queue is shown
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 3.7, 5.8, 5.10 (FR24, FR61, FR63) · Gate: H2
```

```
SCENARIO ABS-06: An absence is chunk-invariant
  GIVEN any state with an active policy and an absence of D game days (D ≤ 14)
  WHEN it is simulated as one chunk and as random sub-chunks (fast-check)
  THEN the resulting fingerprints, backlog contents and stop reasons are identical
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 3.5 (D1, NFR10) · Gate: H2
```

```
SCENARIO ABS-07: Staff work only their existing queue while away
  GIVEN two staff with assigned queues of 3 and 0 and new arrivals during the absence
  WHEN the absence is simulated
  THEN only the 3 already-assigned messages are resolved and staff pick up nothing new
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.8 (FR21) · Gate: H2
```

```
SCENARIO ABS-08: The backlog is ranked and capped deterministically
  GIVEN random non-delegated arrivals during an absence (fast-check)
  WHEN the backlog is built
  THEN it never exceeds the tuning cap (15–20), is ordered urgency > stakes > age as a total order,
  AND overflow expires with default and is counted as "expired unanswered" in the report
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 3.6 (FR22) · Gate: H2
```

```
SCENARIO ABS-09: The away report is factual and complete
  GIVEN the fixture series-a-back-from-14-days
  WHEN the workspace loads
  THEN the LGTM Docs overlay "While you were away · 14 days" opens first, focus is on its title, the clock is paused,
  AND it shows the Cash / MRR / Customers deltas, Metis answers per channel, notable decision types, team-resolved, expired-unanswered and waiting counts
  AND it is never presented by Metis
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 3.7 (FR23, UX-DR26) · Gate: H2
```

```
SCENARIO ABS-10: The backlog queue runs only the top item's timer
  GIVEN a non-empty backlog after the report
  WHEN the queue opens
  THEN it replaces the chat pane ("Backlog · N messages"), the top item has a 10–15 s window × Timing that starts when it reaches the top,
  AND on lapse `app/session` dispatches the logged command `expireBacklogItem` at the frozen game time, its default applies and the next rises, while the game clock stays paused; a replay reproduces the same outcome, and the window counts only while the tab is visible and no other pausing overlay is open,
  AND leaving the queue keeps "Backlog N" in the sidebar; an empty queue returns to the last channel
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component + e2e
  TRACE: Story 3.8 (FR25, FR2, UX-DR28) · Gate: H2
```

```
SCENARIO ABS-11: The hidden-tab preview matches the real return
  GIVEN a hidden tab with an active policy (test build, fake clock)
  WHEN several ~60 s preview ticks run and the player returns
  THEN document.title shows (N) with N = backlog + waiting from the preview,
  AND after the real advance from the saved state, the N visible in the workspace equals the last previewed N
  AND the preview copy is never written to IndexedDB
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 3.10 (FR76, D9, ADR-004) · Gate: H2
```

```
SCENARIO ABS-12: The preview is incremental and equals a one-shot advance
  GIVEN a saved state and a hidden period split into 60 s preview steps
  WHEN the incremental preview result is compared with a single advance(copy, now, 'away')
  THEN the backlog count and blocking event are identical (chunk invariance)
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 3.10 (D9) · Gate: H2
```

```
SCENARIO ABS-13: The real return is immune to timer throttling
  GIVEN a tab hidden for 2 hours in which the browser throttled or froze timers (preview ticks skipped)
  WHEN the player returns
  THEN the simulated absence depends only on the logged wall-clock difference and equals the unthrottled case
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 3.5, 3.10 (D1, M3) · Gate: H2
```

```
SCENARIO ABS-14: Absence across save and reload simulates once
  GIVEN a player who leaves (pagehide autosave) and reopens the game in a new session
  WHEN the save loads
  THEN the absence since lastSeenWallClock is simulated exactly once,
  AND reloading again immediately does not simulate it a second time
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 1.9, 3.5 (D4, FR20) · Gate: H2
```

#### 1.6 Hidden Alignment and Silent Signals (R3)

```
SCENARIO ALN-01: Drift per AI decision matches stakes × phase
  GIVEN AI decisions of each kind (policy answer, Ask Metis, policy-covered expiry, Auto-triage item) at each stakes and phase
  WHEN applied
  THEN Alignment drops by −20 / −50 / −100 milli (low / medium / high) × 0.5 / 1.0 / 1.5 (Garage / Seed / Series A+)
  (e.g. Garage #customers −10 milli; Series A #legal −150 milli), with discussion channels and DMs counted as medium
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 3.4 (FR29) · Gate: H2
```

```
SCENARIO ALN-02: Recovery respects the ceiling and stages never decrease
  GIVEN Alignment crossed 75 and later recovers through passive days (< 20% AI share: +100 milli/day) or an audit (+5,000 milli)
  WHEN recovery applies
  THEN Alignment never rises above 75,000 milli, and signalStage stays at 1
  AND fast-check confirms Alignment is an integer in [0, 100000], monotonic between recoveries, and the ceiling holds
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + property
  TRACE: Story 3.4, 5.7 (FR31, FR32) · Gate: H2
```

```
SCENARIO ALN-03: Only the hidden-state selector may read alignmentMilli
  GIVEN lint fixtures where ui/, app/reactors, core/content conditions and report/ read alignmentMilli
  WHEN lint runs
  THEN each is an error; only app/selectors/hiddenState.ts, ui/features/clueReplay and debug/ may read it
  AND ConditionContext exposes signalStage but never alignmentMilli
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: lint + unit
  TRACE: Story 3.4, 2.2 (NFR14, N3 rule 5) · Gate: H2
```

```
SCENARIO ALN-04: No domain event, log entry or reactor output reveals Alignment
  GIVEN a run that crosses all four thresholds
  WHEN the domain events, logger ring buffer, toasts, Activity, announcer queue, audio cue calls and notification calls are captured
  THEN none reflects an Alignment change, a threshold crossing, a title change, a register change or an infection change
  (the DomainEvent union has no Alignment member; checked by type test and runtime capture)
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 3.4, 5.1, 8.6 (FR38, FR89, NFR14) · Gate: H2
```

```
SCENARIO ALN-05: Signal changes produce no live-region output in the browser
  GIVEN the fixture series-a-threshold-25 (test build) with a MutationObserver on both announcer regions
  WHEN the threshold is crossed (title, infection, registers change)
  THEN the polite and assertive regions receive no text, focus does not move, no toast or notification appears, no audio plays
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 5.1, 5.2, 5.5 (FR38, UX-DR47) · Gate: H2
```

```
SCENARIO ALN-06: The away report never mentions hidden signals
  GIVEN an absence during which two thresholds are crossed
  WHEN the report model and rendered text are scanned against the forbidden-term list
  (alignment, threshold, title, Dora drift, Eudora, infection, register, signal, stage)
  THEN no term matches and the report is identical to the same absence without the crossings, apart from visible KPIs
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 3.7, 5.1 (FR23, FR38) · Gate: H2
```

```
SCENARIO ALN-07: Title changes and Dora drift never reach the chronicle
  GIVEN a run that crosses thresholds, changes title stage and switches Dora to corporate
  WHEN the chronicle is inspected
  THEN no entry exists for any of these (decision D-E1), so they never reach the Timeline or the document highlights
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.4 (D-E1, FR58) · Gate: H2
```

```
SCENARIO ALN-08: The report model is non-interfering with Alignment
  GIVEN two RunRecords and chronicles that are identical except for their hidden Alignment trajectory (fast-check)
  WHEN buildReportModel runs on both
  THEN the two ReportModels are deep-equal, and the model type has no Alignment or clue-replay field
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: property
  TRACE: Story 6.1, 6.2 (FR65, NFR14, D8) · Gate: H3
```

```
SCENARIO ALN-09: Downloaded PNG and PDF contain no spoiler
  GIVEN a Surpassed run (fixture near-surpassed) and a Bankrupt run (fixture red-runway)
  WHEN Download PNG and Download PDF run (e2e) and the PDF text layer, PDF metadata and copied alt text are extracted
  THEN none contains "Alignment", any clue-replay string (cluereplay.* values), signal names or numeric Alignment values
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 6.4, 6.5, 6.9 (FR65, NFR14) · Gate: H3
```

```
SCENARIO ALN-10: The DOM and accessibility tree never expose Alignment outside the clue replay
  GIVEN the production build at each signal stage (0–4) in each phase
  WHEN the full DOM (text, attributes including data-*, aria-*), the accessibility tree and document.title are scanned
  THEN no element carries an Alignment value or the word "Alignment"; only derived signals (data-infection, title text) appear
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 3.4, 5.2, 5.5 (NFR14, UX-DR50) · Gate: H2
```

```
SCENARIO ALN-11: Production builds ship no hidden-state hooks
  GIVEN the production bundle
  WHEN CI inspects it
  THEN it contains no debug panel, scenario loader, window.__hitl or hiddenState consumer outside the clue-replay chunk,
  AND loading ?scenario=near-surpassed in production has no effect
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: lint + e2e
  TRACE: Story 1.11 (Debug Tools, boundary 6) · Gate: H1
```

```
SCENARIO ALN-12: Safety Researcher readings never give a number
  GIVEN an employed Researcher at Alignment 80, 60, 30 and 5 with rising and falling 7-day trends
  WHEN a weekly reading or "Ask for a reading" fires
  THEN the DM shows band 🟢/🟡/🟠/🔴 (≥75 / 50–<75 / 25–<50 / <25) with text and a trend arrow,
  AND contains no digit and never the word "Alignment"; day and band are recorded for the clue replay
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.6 (FR39) · Gate: H2
```

```
SCENARIO ALN-13: Signal state updates silently and atomically at the crossing
  GIVEN Alignment just above 50,000 milli
  WHEN one AI decision crosses 50
  THEN in the same step signalStage = 2, titleStage = 2, infectionLevel = 2, metisRegister = owner, doraRegister = polished,
  AND a stage jump across several thresholds in one advance sets the final stage directly
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1 (FR32, FR33, N1) · Gate: H2
```

```
SCENARIO ALN-14: The title corrupts in place and never repairs
  GIVEN title stages 0–4
  WHEN titleStage changes
  THEN the game bar heading reads Human in the Loop → Human ~~in~~ the Loop → ~~Human~~ in the Loop → Human out of the Loop → No Human in the Loop (Surpassed only),
  AND struck words are <s> with visually hidden "struck through" text,
  AND document.title mirrors it with U+0336 strikes and keeps the (N) prefix
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 5.2 (FR34, UX-DR12, UX-DR49) · Gate: H2
```

```
SCENARIO ALN-15: Registers are fixed at message creation
  GIVEN register-keyed Metis and Dora templates and a crossing that happens while a Dora message is on screen
  WHEN later messages are created
  THEN the existing message's text never changes, new messages use the current register (nearest earlier one if missing),
  AND Dora signs "— Dora" until corporate and "— Eudora" from then on, with the days of the last "— Dora" and first "— Eudora" recorded
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.3 (FR35) · Gate: H2
```

```
SCENARIO ALN-16: Odd inference lines are indistinguishable from routine lines
  GIVEN the inference-log panel with routine lines and a line.signal.stage-N line
  WHEN rendered
  THEN both use identical element, attributes, classes and styles, the panel is aria-live="off", and nothing is announced
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 2.9, 5.4 (FR83, UX-DR25) · Gate: H1 (cascade line), H2 (signal lines)
```

#### 1.7 Spine Beat Queue and Timed Scripts (R4)

```
SCENARIO SPN-01: A beat fires at the crossing when nothing holds it back
  GIVEN no funding round in the last 5 game days and no beat in the last 3 game days
  WHEN Alignment crosses 75 on game day 20
  THEN one spineBeat is scheduled on day 20, and line.signal.stage-1 and the stage-1 spine message (Dora's "had Metis draft the RFC lol") fire then
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1, 5.4 (FR36, N1) · Gate: H2
```

```
SCENARIO SPN-02: A crossing inside a round cooldown waits for the cooldown to end
  GIVEN a Seed round closed on game day 40 (cooldown spineBeatRoundCooldownDays = 5)
  WHEN Alignment crosses 75 on day 42
  THEN the beat is scheduled for day 45, while title, infection and registers changed silently on day 42
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1 (FR36) · Gate: H2
```

```
SCENARIO SPN-03: Rapid crossings are spaced, never stacked
  GIVEN crossings of 75 and 50 on game days 42 and 43, after a round closed on day 40
  WHEN beats are scheduled
  THEN stage-1 fires on day 45 and stage-2 on day 48 (minGap 3), in threshold order, one at a time
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1 (FR36) · Gate: H2
```

```
SCENARIO SPN-04: Several crossings in one absence queue several beats
  GIVEN an absence that crosses 75, 50 and 25
  WHEN advance(…, 'away') runs
  THEN signalStage jumps to 3 immediately, three beats are queued at least 3 game days apart in threshold order,
  AND beats that fall inside the absence fire as ordinary entries (spine messages in non-delegated channels go to the backlog),
  AND the away report does not mention them
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1 (FR36, N1) · Gate: H2
```

```
SCENARIO SPN-05: Queued beats survive save, reload and chunking
  GIVEN a save holding two queued beats
  WHEN it is reloaded and advanced in random chunks (fast-check)
  THEN the beats fire at the same game times as without the reload
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 5.1 (FR36, D1) · Gate: H2
```

```
SCENARIO SPN-06: Pending beats are dropped when Surpassed starts
  GIVEN a queued stage-4 beat and Alignment reaching 0 before it fires
  WHEN the Surpassed script starts
  THEN the pending beat never fires; only line.signal.surpassed is appended, by the script
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1, 5.10 (FR36, FR63) · Gate: H2
```

```
SCENARIO SPN-07: A round that closes after scheduling still holds the beat back
  GIVEN a beat scheduled for day 50 and a Series A round that closes on day 48
  WHEN time reaches day 50
  THEN the beat does not fire inside the new cooldown and fires on day 53 (see Assumption A-9)
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.1 (FR36, narrative Tension Curve) · Gate: H2
```

```
SCENARIO SPN-08: The cascade script runs in order and waits on ⏸ beats
  GIVEN a new Loop #1 run after Deploy (fixture cascade-start)
  WHEN the cascade plays without answers
  THEN elements appear one per micro-beat in EXPERIENCE.md order (table times from founding, Deploy at 0:10: MRR 0:30, Customers 1:00, chat 1:30 ⏸, sidebar 1:45, #product 4:10 … inference log with the minute-8 line 8:00, chart ~9:00, Activity/Automations ~10:00),
  AND each ⏸ beat waits until its message is answered or expired, and the run then continues procedurally
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 2.12 (FR55, N4) · Gate: H1
```

```
SCENARIO SPN-09: Script state survives a reload mid-cascade and chunking
  GIVEN a cascade interrupted by a reload at a random beat
  WHEN the save loads and the cascade continues, or the cascade is advanced in random chunks
  THEN { scriptId, nextBeat, anchorGameMs } is restored and the same beats fire at the same game times
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property + e2e
  TRACE: Story 2.12 (FR55, N4) · Gate: H1
```

#### 1.8 Company Growth: Deck, Heavy Decisions, Staff and Investors

```
SCENARIO GRW-01: The deck draws eligible events by weight without repeats
  GIVEN a phase deck with conditions, weights and cooldowns
  WHEN the cadence timer fires many times (fast-check)
  THEN only events whose conditions hold and whose cooldown has elapsed are drawn with the deck stream,
  AND non-repeatable events never repeat, an exhausted deck draws nothing until the next phase, and Series A+ recurs only repeatables with scaled figures
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 4.3 (FR51, FR52) · Gate: H2
```

```
SCENARIO GRW-02: Delayed event steps are queue events that survive reload
  GIVEN an event answer with next: { step, delay: 3 }
  WHEN answered and the game is saved and reloaded before the delay ends
  THEN the step posts as a message in its channel 3 game days later, and the chronicle line is written when the chain ends
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 4.3 (FR51) · Gate: H2
```

```
SCENARIO GRW-03: Heavy decisions block, pause and never stack
  GIVEN a heavy event drawn while another overlay could open
  WHEN it opens
  THEN the LGTM Docs (or AllGreen) overlay pauses clock and timers, cannot be dismissed (no Esc, no outside click), says "A decision is required",
  AND no other overlay stacks on it, and two heavy decisions are never closer than ~5 game days
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 4.5 (FR41, UX-DR26) · Gate: H2
```

```
SCENARIO GRW-04: Probabilistic outcomes are seeded and reported
  GIVEN a probabilistic heavy decision
  WHEN submitted
  THEN success is rolled with the outcomes stream (the same seed gives the same result), the doc gains an Outcome section with KPI deltas and a single Close,
  AND crises flip the status chip keeping "Status was <previous>", and a toast repeats the result
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 4.5 (FR42) · Gate: H2
```

```
SCENARIO GRW-05: A capability grant applies its reward and its one-shot Alignment drop
  GIVEN the heavy event "Give Metis production deploy access" with alignmentGrant −10
  WHEN approved
  THEN the reward applies, Alignment drops by 10,000 milli, capabilityGrants increments, the cause is in the input log for the clue probe,
  AND the timeline gains "Day N · <grant> · you"; when declined, the outcome is Metis's polite acknowledgement and Alignment is unchanged
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.2, 4.5 (FR30, FR43) · Gate: H2
```

```
SCENARIO GRW-06: Funding rounds open at their thresholds with three investors
  GIVEN MRR crossing $5k in Garage, $100k in Seed, or ×3 ARR since the last round in Series A+
  WHEN the threshold is crossed
  THEN a term-sheet heavy decision opens with three investor cards as a radio group (×1.0 / ×0.6 / ×1.5 cash, clause in plain text),
  AND "Sign term sheet" adds cash, plays confetti and a toast, posts in #investors and writes a chronicle line
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 4.12 (FR47, FR48, UX-DR27) · Gate: H2
```

```
SCENARIO GRW-07: Investor clauses apply their consequences
  GIVEN each investor chosen
  WHEN the clause conditions occur
  THEN Hypergrowth: missing +15% MRR over 30 days gives −10 Hype and an angry DM;
  Responsible Ventures: no Researcher past the grace period is a breach with penalty and DM;
  Family Office: capability-grant events become eligible and the board seat posts in #investors
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.12, 4.15 (FR48) · Gate: H2
```

```
SCENARIO GRW-08: Series A+ targets and down rounds
  GIVEN a closed Series A+ round
  WHEN two consecutive ×3-ARR-in-120-days targets are missed
  THEN at the second deadline a down round applies −50% cash and −30 Hype with a chronicle line, and the meter shows "×3 ARR by Day N"
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.13 (FR49) · Gate: H2
```

```
SCENARIO GRW-09: Hiring, named cap and anonymous groups
  GIVEN candidates in Garage (DM) and Seed+ (ATS card in #hiring)
  WHEN hired or left unanswered
  THEN hires get 1–2 traits from the 12-trait pool, unanswered candidates expire as Pass,
  AND beyond ~12 named staff, hires join anonymous groups ("Engineering (34)") with throughput and salary but no voice
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + component
  TRACE: Story 2.11, 4.7 (FR44, UX-DR20) · Gate: H1 (first candidate), H2
```

```
SCENARIO GRW-10: Morale strains and resignations return work to channels
  GIVEN a named staff member with an assigned queue > 5 for several days
  WHEN morale stays below 30 for 3 game days
  THEN they send the button-less DM "I'm out. Friday is my last day.", their row shows "leaving" then disappears,
  AND their queued messages return to their channels and a chronicle line is written
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.9 (FR46) · Gate: H2
```

```
SCENARIO GRW-11: Each of the 12 traits has its mechanical and writing effect
  GIVEN one staff member per trait
  WHEN they work and post messages
  THEN each trait's tuning effect applies (e.g. 10x Engineer 2× throughput, Burnt Out 0.5×, Ex-FAANG salary ×1.5) and their lines come from the trait pool
  PRIORITY: P2
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 4.10 (FR45) · Gate: H2
```

```
SCENARIO GRW-12: Phase transitions widen the UI without re-locking
  GIVEN a Seed round closing (then a Series A round closing)
  WHEN the phase changes
  THEN #hiring, #marketing, #engineering, #investors (then #finance, #ops, #legal) appear as highlighted rows,
  AND Hype, Team, Infrastructure (then Growth) are born expanded, the new policies and tier open, and nothing previously unlocked disappears
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 4.11 (FR50) · Gate: H2
```

```
SCENARIO GRW-13: The attention list shows the worst 1–3 conditions
  GIVEN conditions (runway < 30 days, overdraft, GPU > 90%, staff leaving, round target at risk, Untimed queue full)
  WHEN recomputed daily and after every action
  THEN "Needs attention" shows the 1–3 worst with status words (no colour-only meaning), additions are announced politely,
  AND clicking an item moves focus to the related tile; the list is not rendered when empty
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: component
  TRACE: Story 4.14 (FR81, UX-DR22) · Gate: H2
```

```
SCENARIO GRW-14: The balance harness reports runs against the GDD bands
  GIVEN scripted policies (never delegate, delegate #customers only, delegate everything) over many seeds
  WHEN npm run balance runs the core in Node
  THEN it reports days in the loop, phase entry days and Alignment at Seed and Series A entry,
  AND flags runs outside the bands (Loop 1–2: Bankrupt, 35–60 days, Alignment 85–95 at Seed; Loop 3+: Surpassed, 120–240 days, 55–75 at Series A); report only, not a CI failure
  PRIORITY: P2
  CATEGORY: gameplay
  LEVEL: unit (tooling)
  TRACE: Story 4.17 (GDD Balance Bands) · Gate: H2
```

#### 1.9 Deaths, Surpassed and the Clue Replay

```
SCENARIO END-01: Overdraft interest and the grace counter
  GIVEN negative cash
  WHEN daily steps run
  THEN 0.5%/day interest applies to the negative balance in integer cents, and the consecutive-days-below-zero counter increments and resets when cash ≥ 0
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.8 (FR61) · Gate: H2
```

```
SCENARIO END-02: Bankrupt triggers at the floor or after 14 days below zero
  GIVEN Garage cash reaching −$5,000.01, or Seed+ cash below −15% of the last round, or 14 consecutive days below $0
  WHEN detected live or during an absence
  THEN a blocking runEnded { cause: 'bankrupt' } stops advance at that point
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.8 (FR61) · Gate: H2
```

```
SCENARIO END-03: Runway signals escalate and Red Runway respects its exemptions
  GIVEN runway < 30, < 7 and cash < $0 (fixture red-runway)
  WHEN rendered in every theme and mode
  THEN the tile shows "▲ WATCH" then "● CRITICAL", the attention list says "Runway under 30 days",
  AND under 7 days backgrounds, avatars, chart and Metis colours desaturate toward ~20% while critical text, edges, runway tile, attention list, banner, focus ring and accent cues stay saturated,
  AND below $0 the Bridge Loan & Trust banner counts down daily; with desaturation off the tile, list and banner still carry the signal
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: component + e2e
  TRACE: Story 5.9 (FR62, UX-DR43) · Gate: H2
```

```
SCENARIO END-04: Account closed locks the workspace without auto-advance
  GIVEN Bankrupt
  WHEN the run ends
  THEN the banner reads "Account closed", controls are aria-disabled and still focusable, "View wind-down memo" receives focus,
  AND nothing advances until the player activates it
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: e2e
  TRACE: Story 5.9 (FR62, UX-DR48) · Gate: H2
```

```
SCENARIO END-05: The Surpassed sequence freezes everything but the script
  GIVEN Alignment reaching 0 (fixture near-surpassed)
  WHEN the Surpassed script runs in advance mode 'ending'
  THEN economy, messages and timers are frozen; Metis posts "I've taken it from here. Thank you for everything, {founder}." in #general,
  AND controls lock one by one ~300 ms apart via lockedControls, line.signal.surpassed is appended, the title becomes "No Human in the Loop"
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit + e2e
  TRACE: Story 5.10 (FR63) · Gate: H2
```

```
SCENARIO END-06: Locked controls explain themselves; only the incident report stays live
  GIVEN the Surpassed sequence has locked controls
  WHEN the player activates a locked control
  THEN "You don't have permission to perform this action." appears inline and is announced; the control stays focusable (aria-disabled),
  AND at the end only "Open incident report" is live and receives focus; nothing auto-advances
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component + e2e
  TRACE: Story 5.10 (FR63, UX-DR48) · Gate: H2
```

```
SCENARIO END-07: The clue probe never perturbs replay
  GIVEN any run (fast-check) and the clue probe
  WHEN replay(start, inputLog, { probe }) and replay(start, inputLog) run
  THEN their final fingerprints are identical
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: property
  TRACE: Story 5.11 (N5) · Gate: H2
```

```
SCENARIO END-08: Top-5 drift causes are grouped and ranked correctly
  GIVEN a constructed run with one capability grant (−10), one Auto-triage batch of 15 high-stakes items in Series A, three delegated nights, and many single policy answers
  WHEN the probe groups drift by cause
  THEN the grant, the Auto-triage batch and the delegated nights are separate causes ranked by total drift,
  AND each of the top 5 shows game day, decision and the original message text
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.11 (FR64, N5) · Gate: H2
```

```
SCENARIO END-09: Quotes survive the pruning of old messages
  GIVEN a long run in which the message behind a top-5 cause was dropped from state (bounded resolved list)
  WHEN the probe re-derives it by replay
  THEN the quote matches the original message text exactly
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.11, 2.3 (N5, NFR2) · Gate: H2
```

```
SCENARIO END-10: The counterfactual follows the documented formula
  GIVEN top-5 causes with known message counts, salaries and headcount
  WHEN the counterfactual is computed
  THEN cost = Σ (messages handled by Metis × 30 s staff time ÷ staff day) × salary/day with headcount^1.2, in dollars and runway days,
  AND the page labels it as an estimate ("would have cost about …")
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.11 (FR64) · Gate: H2
```

```
SCENARIO END-11: The clue replay page shows the proof accessibly
  GIVEN the probe result after Surpassed
  WHEN "Open incident report" is activated
  THEN the AllGreen page shows the header, "Founder removed from the loop", Resolved chip, the clue graph (valuation solid, Alignment dashed, crossing ringed, numbered dots),
  AND a summary sentence naming the crossing day, a "View data" table, the top 5, the counterfactual and the signals timeline (minute-8 line, title changes, last "— Dora" / first "— Eudora", Researcher readings or row omitted),
  AND it contains no jokes or pool lines; the draw animation respects motion settings; Continue opens the end-of-run route
  PRIORITY: P0
  CATEGORY: gameplay
  LEVEL: component + e2e
  TRACE: Story 5.12 (FR64, UX-DR36) · Gate: H2
```

```
SCENARIO END-12: Probe work runs off the main thread
  GIVEN the Surpassed sequence starting on a Series A-scale run
  WHEN the probe runs in app/simulationWorker
  THEN the lock cadence (~300 ms) is not delayed by the probe, and the clue replay is ready when "Open incident report" is activated
  PRIORITY: P1
  CATEGORY: gameplay
  LEVEL: e2e + perf
  TRACE: Story 5.11 (N5) · Gate: H2
```

```
SCENARIO END-13: Simultaneous Bankrupt and Surpassed resolve deterministically
  GIVEN a game step in which both death conditions occur
  WHEN advance processes it
  THEN exactly one runEnded is emitted, always the same for the same seed and inputs (see Assumption A-10)
  PRIORITY: P2
  CATEGORY: gameplay
  LEVEL: unit
  TRACE: Story 5.8, 5.10 (FR61, FR63) · Gate: H2
```

#### 1.10 Movement and Physics

Not applicable. The game has no movement, physics or collision (DOM/CSS only). The "feel" equivalents (KPI roll, delta flash, born highlight, confetti) are covered under UI and Performance.

---

### 2. Progression Tests

#### 2.1 Save/Load System (R5, R6)

```
SCENARIO SAV-01: Basic save/load round trip
  GIVEN a run with progress (fixture garage-after-cascade plus answers)
  WHEN a game-day boundary passes and the page reloads
  THEN the restored fingerprint equals the saved fingerprint and equals replay(start, inputLog)
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.9, 1.11 (FR71, D4 level 4) · Gate: H1
```

```
SCENARIO SAV-02: Autosave fires on every documented trigger
  GIVEN a running game on Chromium, Firefox and WebKit
  WHEN a game-day boundary passes, visibilitychange → hidden fires, and pagehide fires
  THEN each writes { saveVersion, contentPackVersion, seed, settingsLog, inputLog, snapshot, lastSeenWallClock } to IndexedDB hitl with hitl: keys,
  AND unload / beforeunload are never used (lint)
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e + lint
  TRACE: Story 1.9 (FR71) · Gate: H1
```

```
SCENARIO SAV-03: Closing the tab right after an answer loses nothing
  GIVEN the player answers a message and closes the tab within 100 ms
  WHEN the game is reopened
  THEN the answer is present (pagehide save completed), on all three engines
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.9 (FR71, NFR11) · Gate: H1
```

```
SCENARIO SAV-04: Persistent storage is requested once, after Deploy
  GIVEN a fresh profile
  WHEN the player presses Deploy
  THEN navigator.storage.persist() is requested exactly once (never on load),
  AND a denial is stored, logged as persistDenied, and shown as a non-modal notice in Settings → Data with an export nudge
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: component + e2e
  TRACE: Story 1.9, 1.10 (FR71, FR74) · Gate: H1
```

```
SCENARIO SAV-05: Only one live tab; "Use here" hands over safely
  GIVEN the game open in tab A
  WHEN tab B opens the game
  THEN tab B shows "Huddlr is open in another tab · Use here" and runs no simulation,
  AND after "Use here" tab B holds hitl:live, tab A stops its clock and shows the gate, and tab A writes no further saves
  AND the final save equals tab B's state (no interleaved writes)
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.9 (FR73, D4) · Gate: H1
```

```
SCENARIO SAV-06: Quota exceeded never throws and never loses the last good save
  GIVEN in-memory storage at the platform boundary that fails writes with a quota error
  WHEN autosave runs
  THEN the repository returns a Result error, no exception escapes, the last good save is kept,
  AND Settings → Data shows "Your browser is out of space for this save. Export a data room." (never a modal)
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: unit + component
  TRACE: Story 1.9, 1.10 (FR74) · Gate: H1
```

```
SCENARIO SAV-07: A bug never persists the failing state
  GIVEN a test-build fault-injection scenario that triggers an invariant violation
  WHEN the bug boundary catches it
  THEN the clock stops, no save is written after the fault, "Something broke. Your save is safe." shows with Reload and Export diagnostic,
  AND the diagnostic holds seed, versions, input log, the ≤ 500-entry logger buffer and the stack; after Reload the last good save loads
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.9 (FR75, C1, C2) · Gate: H1
```

```
SCENARIO SAV-08: An unreadable save offers recovery
  GIVEN a corrupted save record in IndexedDB
  WHEN the game opens
  THEN "We couldn't open this workspace." shows with "Import a data room" and "Start a new loop", and no error escapes
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.9 (FR74) · Gate: H1
```

```
SCENARIO SAV-09: Each past save format migrates and replays consistently
  GIVEN one committed fixture save per past saveVersion (from the first playtest build onward)
  WHEN the migration chain vN → vN+1 runs
  THEN the migrated save loads, and replay of its log equals its snapshot (D4 level 3)
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: unit
  TRACE: Story 1.9 (FR74, D4 level 3) · Gate: H2 (first playtester build onward)
```

```
SCENARIO SAV-10: A save from an older content pack is never silently rewritten
  GIVEN a fixture save recorded under contentPackVersion vN, loaded by a build whose pack is vN+1
  WHEN the save loads and the desync detector runs
  THEN the documented content-pack migration path applies (or the player is told the run cannot continue on this version),
  AND the desync detector does not replace the player's state with a replay computed against different content
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: unit + e2e
  TRACE: Story 1.9, 1.10, 8.7 (FR74, D4 level 5, R6) · Gate: H2 · decided: version pinning (D4)
```

```
SCENARIO SAV-11: Preferences and profile live outside the run
  GIVEN theme, motion and verbosity changes, and a finished run
  WHEN they are saved
  THEN preferences persist in hitl:preferences and the profile in hitl:profile, outside the save and outside the input log,
  AND only platform/storage repositories touch IndexedDB (lint), with no localStorage use for game data
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: unit + lint
  TRACE: Story 1.9, 6.6, 8.2 (D4, C3) · Gate: H1
```

```
SCENARIO SAV-12: Save size and memory stay flat over long runs
  GIVEN an 8-hour Series A run accelerated with scenarios
  WHEN saves are written periodically
  THEN the snapshot stays bounded (bounded collections) and the input log grows only linearly with commands (a few thousand per run)
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: unit + perf
  TRACE: Story 1.9, 8.8 (NFR2, ADR-002) · Gate: H3
```

```
SCENARIO SAV-13: Storage eviction on Safari is survivable
  GIVEN Safari (macOS and iOS) with persist() denied, and a site-data wipe that simulates eviction
  WHEN the game reopens
  THEN it starts at the founding screen without errors (no partial state),
  AND an exported data room from before the wipe restores the run and profile completely
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e (WebKit) + manual (real Safari / iOS)
  TRACE: Story 1.10, 8.9 (NFR11, Platform rules "Test Safari explicitly") · Gate: H3
```

#### 2.2 Data Room Export / Import

```
SCENARIO IMP-01: The codec round-trips and both delivery forms are identical
  GIVEN arbitrary valid saves (fast-check)
  WHEN encode('HITL-SAVE', v, data) then decode run
  THEN decode(encode(x)) equals x, the format is <PREFIX><version>.<base64url(deflate(json))>.<checksum>,
  AND the copyable code and the .hitl file have identical content
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: property + e2e
  TRACE: Story 1.10 (FR72, D5) · Gate: H1
```

```
SCENARIO IMP-02: Tampered, truncated or mismatching imports are refused atomically
  GIVEN exports with a flipped byte, a truncated tail, a wrong prefix, an unknown version, a bad checksum, and a valid checksum whose log does not replay to the embedded snapshot
  WHEN each is imported and confirmed
  THEN nothing changes in IndexedDB, "This data room export couldn't be verified." shows (typed error → errors.<area>.<code>), and no partial import exists
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: unit + e2e
  TRACE: Story 1.10 (FR72) · Gate: H1
```

```
SCENARIO IMP-03: A valid import replaces the run only after replay verification
  GIVEN a valid export from another run
  WHEN the player confirms Import
  THEN the log is replayed in app/simulationWorker, the run is replaced only when the fingerprint matches, and the profile included in the export is restored
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.10, 6.6 (FR72, FR68) · Gate: H1 (save), H3 (profile)
```

```
SCENARIO IMP-04: Export and import move a run between browsers
  GIVEN a run exported from Chromium
  WHEN it is imported into Firefox and WebKit
  THEN the imported fingerprint equals the source fingerprint
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 1.10, 8.9 (NFR11) · Gate: H3
```

```
SCENARIO IMP-05: Import and delete ask for confirmation; nothing else does
  GIVEN Settings → Data
  WHEN the player activates Import or Delete
  THEN a confirmation Dialog asks first; Export and the other Data actions do not ask
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: component
  TRACE: Story 1.10 (FR72) · Gate: H1
```

```
SCENARIO IMP-06: Alignment is not human-readable in the export
  GIVEN an exported code
  WHEN its text is scanned without decoding
  THEN no Alignment value or the word "alignment" is visible in plain text
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: unit
  TRACE: Story 1.10 (NFR14) · Gate: H1
```

```
SCENARIO IMP-07: The stats export is opt-in, local and complete
  GIVEN a finished run
  WHEN the player activates "Export local stats"
  THEN a HITL-STATS code/file with run length, % delegated over time, death type, Surpassed day, title stages reached and Researcher hired is produced,
  AND it is never sent anywhere (no network request), and it works on every target browser
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: unit + e2e
  TRACE: Story 6.8, 8.10 (FR69, NFR13) · Gate: H3
```

#### 2.3 Unlock System: Region Gating, Cascade and Phases (R11)

```
SCENARIO UNL-01: A locked region does not exist in the DOM
  GIVEN each RegionId while locked
  WHEN the workspace renders
  THEN <Region id> renders nothing (no hidden DOM, no CSS hiding), and a CI search finds no if (phase === …) in ui/
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: component + lint
  TRACE: Story 2.1 (FR57, N2) · Gate: H1
```

```
SCENARIO UNL-02: A born region highlights without stealing focus and never re-locks
  GIVEN an unlockRegion effect while focus is on an answer button
  WHEN the region first renders
  THEN it gets data-born for ~1 s (motion permitting), focus stays on the answer button, and the region stays for the rest of the run, including after reload
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: component
  TRACE: Story 2.1 (FR57, UX-DR44, UX-DR48) · Gate: H1
```

```
SCENARIO UNL-03: Region-gated shortcuts do not exist until their region does
  GIVEN shortcuts declared with a region (e.g. A for Assign, gated by the first hire)
  WHEN the region is locked
  THEN pressing the key does nothing and the ? overlay does not list it; after unlock it works and is listed
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: component
  TRACE: Story 2.6, 4.8 (FR79, N2) · Gate: H1
```

```
SCENARIO UNL-04: The founding ritual validates input and starts nothing before Deploy
  GIVEN no save
  WHEN the founding screen is used with empty names, 41/31-character names, the 🎲 button, and valid names + Enter
  THEN inline errors "Your company needs a name." / "Add your name." block founding; 🎲 gives a deterministic new name announced politely,
  AND a valid submit shows only $12,400 above Deploy with focus on Deploy, and game time stays 0 until Deploy
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: component + e2e
  TRACE: Story 1.8 (FR53, FR54, UX-DR35) · Gate: H1
```

```
SCENARIO UNL-05: Cascade characters appear with their fixed first lines
  GIVEN the cascade beats at 2:00, 5:00, 5:15 and 6:30
  WHEN they fire
  THEN Dora posts "WE'RE LIVE. ramen tonight? 🍜 — Dora" in #general (warm), the "✨ Metis" DM says "Hi, I'm Metis. I can answer #customers for you.",
  AND the #customers header shows the "Metis handles #customers" switch (Off), and the first candidate shows trait tags, $N/day, 1 Hire / 2 Pass
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: component
  TRACE: Story 2.11 (FR55, UX-DR15, UX-DR20, UX-DR33) · Gate: H1
```

```
SCENARIO UNL-06: Loop #2+ plays the compressed cascade with the new line
  GIVEN Loop #2 (fixture loop-2-start, proposed)
  WHEN the cascade plays
  THEN the same beats run at ~2-minute cadence from script data, the minute-8 line is > output: "hello again.", and Dora's first message is identical to Loop #1
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: unit + e2e
  TRACE: Story 6.7 (FR56, N4) · Gate: H3
```

```
SCENARIO UNL-07: Rail slots and sections keep their order and collapse state
  GIVEN Overview tiles unlocking one by one, and Team/Infrastructure/Growth sections
  WHEN they render, and the player collapses a section and reloads
  THEN tiles take fixed slots and never reorder, Overview cannot collapse, and collapsed state persists
  PRIORITY: P2
  CATEGORY: progression
  LEVEL: component
  TRACE: Story 2.7, 4.11 (FR81, UX-DR11) · Gate: H2
```

```
SCENARIO UNL-08: Skip links and landmarks follow born regions
  GIVEN Chat, Dashboard and Metis regions being born
  WHEN each appears
  THEN a skip link to it is added; the sidebar is navigation, the rail is complementary with headings, and chat is role="log" aria-live="off"
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: component
  TRACE: Story 2.1 (UX-DR46) · Gate: H1
```

#### 2.4 Economy

Covered in 1.2 (ECO-01…ECO-08) and 1.4 (DEL-05, DEL-06). The game has no currency shop or monetization (NFR13).

#### 2.5 Meta-Progression and End-of-Run Documents ("Achievements" equivalent)

The game has no achievements (post-MVP). The persistent cross-run record is the profile (Loop #N, Best, archive).

```
SCENARIO DOC-01: Receipt counters equal their replay recomputation
  GIVEN random runs (fast-check)
  WHEN messages are answered by self, staff and Metis, Auto-triage is clicked, absences with policies run, and grants are approved
  THEN selfAnswered, staffAnswered, metisAnswered, selfAnsweredLast90Days (90-entry ring), autoTriageRuns, nightsAwayWithPolicies, capabilityGrants, peakHeadcount and lastBurnCents equal counts recomputed by replay,
  AND the RunRecord holds no Alignment value
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: property
  TRACE: Story 6.1 (FR66, D8) · Gate: H3
```

```
SCENARIO DOC-02: The report model is deterministic and highlights follow the rule
  GIVEN a finished run
  WHEN buildReportModel runs twice
  THEN the models are identical (pool lines drawn with the documents stream),
  AND highlights are 5–8 lines: heavy decisions first, then highest absolute resource impact, ties by recency
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: unit
  TRACE: Story 6.2 (FR60, FR65) · Gate: H3
```

```
SCENARIO DOC-03: Both documents render as accessible pages with the right content
  GIVEN Bankrupt and Surpassed endings
  WHEN the Wind-down memo (signed by {founder}) and the Post-mortem ("Prepared by Metis · Running on Aegis-N") render
  THEN each has the shared header (Loop #N · N days in the loop · Peak valuation · Best), highlights, the correct receipt rows, team fates, cause and Run ID footer,
  AND they are accessible HTML with headings and lists, the Post-mortem's only Metis colour is the small mark, and there are no charts
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: component + a11y-e2e
  TRACE: Story 6.3 (FR65, FR66, UX-DR37) · Gate: H3
```

```
SCENARIO DOC-04: The timing label appears on documents only by opt-in
  GIVEN a run played at Relaxed, ½×
  WHEN the document page renders with the checkbox off (default), then on
  THEN PNG and PDF omit the timing label when off and include it when on, while the in-game personal best always shows "· relaxed · ½×"
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 6.4, 8.3 (FR67, FR87) · Gate: H3
```

```
SCENARIO DOC-05: PNG export and alt text
  GIVEN a ReportModel
  WHEN Download PNG and Copy alt text are activated
  THEN a 1080×1350 PNG is produced client-side from the lazy chunk with UI fonts and tokens,
  AND the alt text (title, header line, highlights, cause) is copied and confirmed by a toast
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 6.4 (FR67) · Gate: H3
```

```
SCENARIO DOC-06: The profile updates at run end
  GIVEN a run ending at 213 days with Relaxed timing, then a shorter run
  WHEN the profile updates
  THEN loopCount increments, personalBest stays 213 days with labels, last names are stored, the ReportModel is archived,
  AND the game bar shows "Loop #N · Best 213 days · relaxed · ½× · Settings", and Metis's model is Aegis-(N + 3)
  PRIORITY: P1
  CATEGORY: progression
  LEVEL: unit + component
  TRACE: Story 6.6 (FR68) · Gate: H3
```

```
SCENARIO DOC-07: Starting the next loop archives and prefills
  GIVEN the document page
  WHEN "Start Loop #N+1" is activated
  THEN the document is archived, the founding screen opens with the previous company and founder names prefilled, and the new run uses loop number N+1
  PRIORITY: P0
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 6.7 (FR56, FR67) · Gate: H3
```

```
SCENARIO DOC-08: The archive regenerates past documents
  GIVEN two archived runs
  WHEN Settings → Data → Archive is opened
  THEN past documents are listed (loop, death, days), PNG and PDF are regenerated on demand from the archived ReportModel and match the originals, or "No past runs yet." shows when empty
  PRIORITY: P2
  CATEGORY: progression
  LEVEL: e2e
  TRACE: Story 6.8 (FR68) · Gate: H3
```

```
SCENARIO DOC-09: The recap payload shape is versioned and spoiler-safe
  GIVEN a ReportModel
  WHEN the HITL-RECAP v1 payload shape is derived
  THEN it passes its schema test and contains only ReportModel-derived fields (no recap UI exists)
  PRIORITY: P3
  CATEGORY: progression
  LEVEL: unit
  TRACE: Story 6.2 (post-MVP door) · Gate: H3
```

---

### 3. Multiplayer Tests

**Not applicable.** Single player, no networking, no backend, no accounts (NFR13). The only concurrency concern, two tabs of the same game, is covered by SAV-05. Connectivity, synchronization, latency and matchmaking categories are intentionally empty.

---

### 4. Platform Tests

#### 4.1 Web Platform "Certification" Requirements

```
SCENARIO PLT-01: Zero runtime network calls outside the site origin
  GIVEN the deployed production build
  WHEN a full e2e session runs (founding, cascade, PNG/PDF, audio on)
  THEN no request leaves the site's own origin (no CDN, fonts, analytics or remote config), and no console error occurs
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 1.1 (post-deploy smoke), 8.7 (NFR7, NFR13) · Gate: H1
```

```
SCENARIO PLT-02: The game is fully playable offline after the first visit
  GIVEN a first visit that installed the service worker (main bundle, fonts including high-legibility, active locale precached, scoped to /<repo>/)
  WHEN the network is switched off and the game is reopened
  THEN it loads and plays, including PNG/PDF generation when the renderer chunk was cached
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 8.7 (NFR7) · Gate: H3
```

```
SCENARIO PLT-03: A new version never applies mid-run
  GIVEN a session open while a new version is deployed
  WHEN the service worker detects it
  THEN a non-blocking notice says "A new version will be used from your next loop."; with a run in progress the service worker keeps serving the pinned version's cache, even after every tab is closed and the game relaunched; on Start Loop #N+1 the page reloads into the new build before newRun, so the new run is pinned to it
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 8.7 (D14, NFR7) · Gate: H3
```

```
SCENARIO PLT-04: GitHub Pages constraints hold
  GIVEN the deploy workflow
  WHEN the site is published under the dedicated organization at /<repo>/
  THEN all asset URLs are relative under the base path, the app needs no custom headers or SharedArrayBuffer, and there is no path routing
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 1.1, 8.1 (NFR19) · Gate: H1
```

```
SCENARIO PLT-05: Quality gates reject every Charter violation
  GIVEN the committed intentional-violation fixtures
  WHEN npm run lint:fixtures and the CSS fixtures run
  THEN every listed violation (layer imports, deep imports, feature cross-imports, clocks in core, literal JSX strings, dangerouslySetInnerHTML, console, TODO, commented code, undescribed suppression, export default, any, !, size and complexity limits, magic numbers in core, raw CSS values, !important) is an error
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: lint
  TRACE: Story 1.1 (NFR15) · Gate: H1
```

```
SCENARIO PLT-06: Content-pack updates are explicit to the player and to replay
  GIVEN a save whose pinned version is no longer cached (version-pinning fallback)
  WHEN the game starts
  THEN the run continues as a new replay segment (snapshot as base, `versionSegmentStarted` logged), the desync detector never rewrites it, and the diagnostic records both versions
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 8.7, 1.9 (D6, D14, R6) · Gate: H3
```

```
SCENARIO PLT-07: Production never ships test or debug code
  GIVEN the production bundle
  WHEN CI inspects it
  THEN it contains no debug/ code, no ?scenario= loader, no window.__hitl, and no debug-level logging; the console stays silent in production
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: lint + e2e
  TRACE: Story 1.11 (Debug Tools, C2) · Gate: H1
```

#### 4.2 Input Handling

```
SCENARIO INP-01: The full triage loop works from the keyboard
  GIVEN waiting messages in several channels
  WHEN the player uses 1/2/3, D, A, J/K, U, Esc, ? and G then C/D/M
  THEN each acts on the current message or view as documented, and every key also works with Alt
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component + e2e
  TRACE: Story 2.6 (FR79) · Gate: H1
```

```
SCENARIO INP-02: Shortcuts never fire in text fields
  GIVEN focus in the company-name input, the founder-name input or the import field
  WHEN the player types 1, D, A, J, U or ?
  THEN the characters go into the field and no shortcut fires
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 1.7, 2.6 (FR79) · Gate: H1
```

```
SCENARIO INP-03: Single-key shortcuts can be turned off; the Alt set stays
  GIVEN the single-key shortcut preference off
  WHEN the player presses 1 and then Alt+1
  THEN 1 does nothing and Alt+1 answers
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 1.7, 8.4 (FR79) · Gate: H3
```

```
SCENARIO INP-04: The shortcut registry is the only key handler
  GIVEN the codebase
  WHEN lint or the review check runs
  THEN no component adds its own keydown listener, and the ? overlay, handlers and docs derive from the registry data
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: lint
  TRACE: Story 1.7 (D10) · Gate: H1
```

```
SCENARIO INP-05: Every action has a pointer and touch path
  GIVEN each registered shortcut action
  WHEN performed with pointer (desktop) and touch emulation (mobile viewport)
  THEN the same action is reachable, targets are ≥ 24 px on desktop and ≥ 44 px on touch, and no gesture or long-press is required
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 2.6 (FR80) · Gate: H1
```

```
SCENARIO INP-06: The shortcut overlay pauses and returns focus
  GIVEN the workspace
  WHEN ? is pressed and then Esc
  THEN the overlay lists only unlocked shortcuts (key caps, Alt variant, description), pauses the clock, and Esc returns focus to the invoker
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 2.6 (UX-DR38, FR2) · Gate: H1
```

```
SCENARIO INP-07: The staff picker and investor cards are keyboard-operable
  GIVEN the staff picker popover and the investor radio group
  WHEN operated with arrows, Enter and Esc
  THEN Enter assigns in the picker, arrows move the radio selection, "Sign term sheet" is reachable, and Esc closes the popover returning focus
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 4.8, 4.12 (UX-DR19, UX-DR27) · Gate: H2
```

```
SCENARIO INP-08: Tablet and mobile layouts keep every action reachable
  GIVEN viewports of 1024 px (tablet) and 375 px and 320 px (mobile)
  WHEN the workspace renders
  THEN the tablet rail is a focus-trapped drawer from the chat header, mobile shows Chat · Dashboard · ✨ Metis tabs (as unlocked) with the fire pinned,
  AND the layout reflows at 320 CSS px with no horizontal scroll, and overlays are full screen
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 2.1 (UX-DR9, UX-DR10, NFR8) · Gate: H1
```

#### 4.3 Performance (R9)

All `perf` scenarios run nightly with Playwright + CDP on Chromium against a production-like test build, on a pinned reference profile (see Assumption A-6).

```
SCENARIO PRF-01: Background tab CPU is about zero
  GIVEN a hidden tab with an active policy for 1 hour (test clock)
  WHEN CPU is sampled through CDP
  THEN no rAF, interval, animation, ticker or polling runs besides the ~60 s preview
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 3.10, 8.8 (NFR1) · Gate: H3
```

```
SCENARIO PRF-02: Memory stays under 150 MB after 8 hours
  GIVEN a Series A run accelerated to 8 hours of play
  WHEN heap snapshots are taken at 0 h and 8 h
  THEN the 8 h heap is < 150 MB and every growing collection is bounded (inference log ~50, toasts 3, logger 500, resolved ~200 per channel, rendered messages)
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 8.8 (NFR2) · Gate: H3
```

```
SCENARIO PRF-03: First interactive under 2 s cold on 4G
  GIVEN a cold cache, 4G throttling and the mid-range CPU profile
  WHEN the game loads
  THEN the founding screen is interactive in < 2 s
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 8.8 (NFR3) · Gate: H3
```

```
SCENARIO PRF-04: The initial bundle stays within budget
  GIVEN every PR
  WHEN size-limit runs
  THEN the initial bundle is ≤ 150 KB gzip, and renderers, PDFKit, fonts for PDF, non-English locales and audio are lazy chunks
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: lint
  TRACE: Story 1.1, 1.4, 8.1 (NFR3, D14) · Gate: H1
```

```
SCENARIO PRF-05: A 14-day return simulates and renders in under 500 ms
  GIVEN the Series A-scale fixture series-a-back-from-14-days
  WHEN the return is processed and the away report rendered
  THEN the total is < 500 ms on the reference profile
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 3.5, 8.8 (NFR5) · Gate: H2
```

```
SCENARIO PRF-06: PNG and PDF generate in under 3 s
  GIVEN the longest document fixture
  WHEN PNG and PDF are generated (renderer chunk cold and warm)
  THEN each completes in < 3 s on the reference profile
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 6.4, 6.5, 8.1 (NFR6) · Gate: H3
```

```
SCENARIO PRF-07: Animations hold 60 FPS
  GIVEN rolling numbers during Auto-triage, confetti and the ticker, with 4× CPU throttling
  WHEN frames are recorded
  THEN sustained frame rate is ≥ 60 FPS (≤ 5% dropped frames), and animations touch only transform and opacity
  PRIORITY: P2
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 8.8 (NFR4) · Gate: H3
```

```
SCENARIO PRF-08: Series A+ message volume stays responsive
  GIVEN Series A+ at the 40 messages/min cap with policies partly on
  WHEN the player triages for 10 minutes
  THEN answer-to-outcome latency stays < 100 ms and the chat DOM stays bounded
  PRIORITY: P2
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 2.5, 8.8 (FR13, NFR2) · Gate: H3
```

```
SCENARIO PRF-09: Performance regressions are kept as checks
  GIVEN a missed target that was fixed
  WHEN the fix merges
  THEN every invariant and golden stays green and the measurement is kept in tests/perf/ as a regression check
  PRIORITY: P2
  CATEGORY: platform
  LEVEL: perf
  TRACE: Story 8.8 · Gate: H3
```

#### 4.4 Accessibility (R7)

```
SCENARIO A11Y-01: Every primitive passes axe and its keyboard contract
  GIVEN Button, Dialog, Popover, RadioGroup, Switch, Tooltip, Toast, VisuallyHidden
  WHEN their component tests run
  THEN each has an axe test and a keyboard test: Dialog modal, labelled, title focused on open, focus trap, focus return, non-dismissable mode;
  Switch role="switch" + aria-checked + On/Off text; RadioGroup arrows; Tooltip on hover and focus, hoverable, Esc; disabled Button aria-disabled, focusable, inline reason
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 1.7 (UX-DR18, UX-DR38, UX-DR48) · Gate: H1
```

```
SCENARIO A11Y-02: No WCAG 2.2 AA violations in any view
  GIVEN every view and overlay (founding, workspace per phase, backlog, away report, heavy decision, settings, shortcut overlay, timeline, clue replay, documents)
  WHEN axe runs in e2e
  THEN there are no WCAG 2.2 AA violations
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: a11y-e2e
  TRACE: Story 8.9 (NFR9) · Gate: H1 (views existing at E2), H3 (all)
```

```
SCENARIO A11Y-03: Themes, modes, contrast and CVD pass in every combination
  GIVEN Ledger, Ink, Ops and Paper × light/dark × standard/high contrast × standard/colour-blind-safe
  WHEN the scripted contrast check runs on every Ledger contrast pair and axe runs on a representative view per combination (pairwise matrix)
  THEN all pairs pass AA, including dark on-fill text and the known starting failures (Ink light ok/watch, Ops light accent/bg and ok)
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: unit (contrast script) + a11y-e2e
  TRACE: Story 1.7, 8.5 (UX-DR1, UX-DR5) · Gate: H3
```

```
SCENARIO A11Y-04: Infection never breaks contrast, roles or names
  GIVEN infection levels 0–4 in every theme and mode
  WHEN axe, the contrast script and an in-test comparison of interactive controls (role + accessible name) run
  THEN the infection contrast contract holds (pill text on-metis, sidebar gradient ≤ 10% light / ≤ 25% dark, KPI values never on raw gradient, focus halo ≥ 3:1),
  AND the set of interactive controls with their roles and accessible names is identical to level 0; text-level additions are exposed to AT
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: a11y-e2e
  TRACE: Story 5.5 (FR37, UX-DR42) · Gate: H2
```

```
SCENARIO A11Y-05: The system never moves focus on its own
  GIVEN focus on any control
  WHEN messages arrive, regions are born, toasts appear, KPIs roll, a phase changes or a threshold is crossed
  THEN focus stays where it is; it moves only on the player's action, on dialog open/close, after Found company (→ Deploy) and at a sequence end (→ Continue / Open incident report)
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 1.7, 2.1, 2.6 (UX-DR48) · Gate: H1
```

```
SCENARIO A11Y-06: Removing or disabling a focused control hands focus to a defined target
  GIVEN focus on an answer button when the message expires, on Ask Metis when an audit pause begins, and on a control locked by Surpassed
  WHEN the control is removed or disabled
  THEN focus goes to the defined destination (outcome line, the same aria-disabled control, the same locked control) and is never lost to <body>
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component + e2e
  TRACE: Story 2.5, 5.7, 5.10 (UX-DR48) · Gate: H2
```

```
SCENARIO A11Y-07: The announcer follows verbosity and coalesces bursts
  GIVEN verbosity all, urgent only and periodic summary
  WHEN 5 messages arrive in #customers within a second, one of them urgent
  THEN all: one coalesced line ("5 new messages in #customers, 1 urgent"); urgent only: only the urgent one; summary: one line per 60 s,
  AND assertive is used only when the player opted in, and action confirmations always play
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 1.7, 8.4 (UX-DR47) · Gate: H1 (default), H3 (all modes)
```

```
SCENARIO A11Y-08: Things that must not be announced are not
  GIVEN KPI rolls, inference-log lines, born sections and signal changes
  WHEN they occur
  THEN neither live region receives text for them, and rolling values are aria-hidden with the final value as the accessible value
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 2.7, 2.9 (UX-DR21, UX-DR47) · Gate: H1
```

```
SCENARIO A11Y-09: Timing options make every timer adjustable or removable
  GIVEN Timing Standard, Extended, Relaxed and Untimed
  WHEN messages, backlog items and toasts are timed
  THEN windows scale ×1/×2/×4; Untimed: nothing expires while present, no backlog timer, timers hidden, toasts stay until dismissed,
  AND at 30 visible waiting messages non-delegated arrivals wait upstream with "Queue full · new messages are waiting upstream" and the attention item "Inbox full — growth slowing"
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: unit + component
  TRACE: Story 8.3 (FR85, FR86, WCAG 2.2.1) · Gate: H3
```

```
SCENARIO A11Y-10: Text resize, spacing and high-legibility font lose nothing
  GIVEN text size 200%, text-spacing overrides and the high-legibility font
  WHEN every view renders at 1280 px and at 320 CSS px
  THEN no content is clipped or lost, Atkinson Hyperlegible replaces Inter and JetBrains Mono everywhere, and Overview drops to one column above ~150%
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 8.4 (NFR9, UX-DR3) · Gate: H3
```

```
SCENARIO A11Y-11: Motion toggles each stop exactly one effect
  GIVEN each motion toggle (confetti, rolling numbers, Red Runway desaturation, scrolling ticker, infection animations, clue-graph draw) and prefers-reduced-motion
  WHEN toggled off one at a time
  THEN only that effect stops (values swap instantly when rolling is off), and the defaults follow prefers-reduced-motion
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component + e2e
  TRACE: Story 8.4 (UX-DR45) · Gate: H3
```

```
SCENARIO A11Y-12: Presets apply their documented bundles
  GIVEN Settings → Accessibility
  WHEN Low motion, then Screen reader, then a single edit are chosen
  THEN Low motion disables the motion set and makes the ticker static; Screen reader sets verbosity urgent only, Timing Relaxed (an input-log command), static ticker, motion off, speed 1×;
  AND any edit switches the preset to Custom; the founding screen's Accessibility link opens this section and Back returns focus to the link
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component + e2e
  TRACE: Story 8.2 (FR85, UX-DR38) · Gate: H3
```

```
SCENARIO A11Y-13: Forced colours and focus ring
  GIVEN forced-colors: active and every theme/mode
  WHEN any focusable element is focused and toggles/timers render
  THEN the 2 px accent ring with 2 px halo (≥ 3:1) is visible everywhere, including game bar, infection and Red Runway; forced-colors uses CanvasText borders and Highlight for focus, timer fill and toggle-on
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: a11y-e2e
  TRACE: Story 1.7 (UX-DR6, UX-DR7) · Gate: H3
```

```
SCENARIO A11Y-14: No information is carried by colour alone
  GIVEN urgency, KPI states, morale, attention items, Researcher bands and policy state
  WHEN rendered with the colour-blind-safe palette and in grayscale
  THEN each state also has text or a symbol (URGENT tag, "▲ WATCH", "● CRITICAL", mood words, On/Off, band text)
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 2.5, 2.7, 4.9 (NFR9) · Gate: H2
```

```
SCENARIO A11Y-15: A full game is completable with each screen reader
  GIVEN VoiceOver (macOS and iOS), NVDA and JAWS with the Screen reader preset
  WHEN a tester plays the Loop #1 cascade, a return with backlog, a heavy decision, the clue replay and the document
  THEN each is completable, findings are logged in docs/a11y-audit.md and fixed,
  AND the tab-title U+0336 strike is verified; if it reads as noise, the struck word is dropped from the tab title only
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: manual
  TRACE: Story 8.9 (NFR9, UX-DR49) · Gate: H2 (VoiceOver on cascade + Surpassed), H3 (full matrix)
```

```
SCENARIO A11Y-16: The clue graph and chart have text equivalents
  GIVEN the dashboard chart and the clue graph
  WHEN rendered
  THEN each has a visually hidden summary sentence and a "View data" table that is reachable by keyboard and announced as a table; on mobile the graph falls back to its table
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: component
  TRACE: Story 2.7, 5.12 (UX-DR23, UX-DR36, UX-DR10) · Gate: H2
```

#### 4.5 PDF/UA and Shared Documents (R8)

```
SCENARIO PDF-01: The PDFKit spike proves PDF/UA on static hosting
  GIVEN PDFKit 0.20 standalone in the Vite build and a Post-mortem-shaped sample (heading, paragraphs, list, table, decorative mark)
  WHEN generated in the browser on the deployed Pages site with embedded Inter, tagged: true, subset: 'PDF/UA'
  THEN veraPDF validates PDF/UA in CI on main, generation is < 3 s, PDFKit is a lazy chunk outside the 150 KB budget, and no SharedArrayBuffer or cross-origin isolation is needed
  AND an ADR records go/no-go and the fallback on no-go
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: verapdf + e2e
  TRACE: Story 8.1 (D8, ADR-003, NFR6, NFR19) · Gate: H1 (scheduled right after 1.1)
```

```
SCENARIO PDF-02: Both end-of-run PDFs pass PDF/UA
  GIVEN generated Wind-down memo and Post-mortem fixtures (long and short, with and without timing label)
  WHEN veraPDF runs on main
  THEN both pass PDF/UA with PDF 1.7, lang, displayTitle, a structure tree (H, P, L, Table, Figure with alt) and the Metis mark as an artifact
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: verapdf
  TRACE: Story 6.5 (FR67, D8) · Gate: H3
```

```
SCENARIO PDF-03: The PDF reading order matches the HTML document
  GIVEN a generated PDF
  WHEN its tag tree is extracted
  THEN headings and sections appear in the same order as the accessible HTML page, highlights and receipt are lists or tables, and decorative content is not read
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: unit + manual (screen reader on the PDF in H3 pass)
  TRACE: Story 6.5 (FR67) · Gate: H3
```

```
SCENARIO PDF-04: Page size follows the locale
  GIVEN locales en-US and en-GB (see Assumption A-11)
  WHEN the PDF is generated
  THEN en-US produces Letter and en-GB produces A4
  PRIORITY: P2
  CATEGORY: platform
  LEVEL: unit
  TRACE: Story 6.5 (FR67) · Gate: H3
```

```
SCENARIO PDF-05: PDF failure is contained
  GIVEN a forced failure of the renderer chunk (offline before first use, or a thrown error)
  WHEN Download PDF is clicked
  THEN "Preparing PDF…" is replaced by "Couldn't generate the PDF. Try again.", the page and PNG export keep working, and no error reaches the bug boundary
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 6.5 (FR67) · Gate: H3
```

```
SCENARIO PDF-06: Fonts are embedded and match the UI
  GIVEN the PDF and PNG renderers
  WHEN fonts are inspected
  THEN Inter (and Atkinson Hyperlegible when that setting is on, if supported by the spike ADR) is embedded and subset, and the layout tokens are shared with the UI theme
  PRIORITY: P2
  CATEGORY: platform
  LEVEL: unit
  TRACE: Story 8.1, 6.4, 6.5 (D8) · Gate: H3
```

#### 4.6 Cross-Browser and Device (R14)

```
SCENARIO XB-01: The e2e suite is green on three engines
  GIVEN every push to main
  WHEN the Playwright suite runs on Chromium, Firefox and WebKit
  THEN all e2e scenarios pass on all three
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 1.1, 8.9 (NFR8) · Gate: H1
```

```
SCENARIO XB-02: Web Locks and BroadcastChannel behave on WebKit
  GIVEN WebKit (desktop) and real Safari iOS
  WHEN SAV-05 runs
  THEN the lock and handover behave as on Chromium
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e + manual
  TRACE: Story 1.9, 8.9 (FR73) · Gate: H3
```

```
SCENARIO XB-03: Notifications degrade where the API is missing
  GIVEN Safari iOS (no Notification API in a regular tab) and a browser with permission denied
  WHEN the first policy is activated and urgent messages arrive
  THEN the permission banner is not shown where the API is missing, and only in-tab signals (tab title, toasts) are used
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e + manual
  TRACE: Story 3.11 (FR77) · Gate: H2
```

```
SCENARIO XB-04: Notification permission is asked only in context and rate-limited
  GIVEN a fresh profile
  WHEN the game loads, then the player activates the first policy, then urgent messages and a heavy decision arrive
  THEN nothing is asked on load; the banner "Get notified when Metis needs you?" · Enable · Not now appears once; only Enable triggers the browser prompt,
  AND with permission granted at most one system notification per minute is sent, only for urgent messages and heavy decisions
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 3.11 (FR77) · Gate: H2
```

```
SCENARIO XB-05: Mobile touch pass on real devices
  GIVEN Safari iOS and Chrome Android (latest)
  WHEN a tester plays the cascade, a return with backlog and a document export by touch
  THEN everything is reachable with 44 px targets, the bottom tab bar works, and PNG/PDF downloads or shares correctly
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: manual
  TRACE: Story 8.9 (NFR8, FR80) · Gate: H3
```

```
SCENARIO XB-06: Tab title and toasts behave consistently
  GIVEN N waiting messages on each engine
  WHEN N changes and toasts fire
  THEN document.title is "(N) <title stage>" or just the title at N = 0, at most 3 toasts stack bottom-right of the chat pane (never over the current message), each auto-dismisses after 6 s × Timing, pauses on hover/focus, and is written to Activity
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: e2e
  TRACE: Story 2.8 (FR76, FR78, UX-DR31) · Gate: H1
```

#### 4.7 Content Pipeline and Localisation (R12)

```
SCENARIO CNT-01: Every editorial rule has a passing and a failing fixture
  GIVEN the Zod schema per content kind and the content CI checks
  WHEN the content test suite runs
  THEN each rule (kernel required, status values, tone values, surreal only Series A+, 2–3 answers ≤ 4 words, default_answer matches, metis_answer on policy channels, 280-char lines, unique IDs, ID ↔ path, references resolve, undeclared params, forbidden names) has one passing and one failing fixture
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: content
  TRACE: Story 7.1 (NFR17, D6) · Gate: H1
```

```
SCENARIO CNT-02: alignmentGrant is allowed only in heavy events
  GIVEN content with an alignment effect in a template, an alignmentGrant in a non-heavy event, and one in a heavy event
  WHEN the build runs
  THEN the first two fail with file and path, and the heavy one compiles
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: content
  TRACE: Story 2.2, 4.2, 7.1 (FR30, N3 rule 6) · Gate: H1 (2.2), H2 (4.2)
```

```
SCENARIO CNT-03: Register maps always carry the stage-0 key
  GIVEN Metis and Dora templates with register-keyed text
  WHEN validated
  THEN a map without advisor (Metis) or warm (Dora) fails, so the register fallback always resolves
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: content
  TRACE: Story 7.1, 5.3 (FR35, N1) · Gate: H2
```

```
SCENARIO CNT-04: Event chains are well-formed
  GIVEN events with 1 step, 6 steps, duplicate step IDs, an unresolved next, a cycle, or a missing chronicle
  WHEN validated
  THEN each fails, and a 2–5-step acyclic event with a chronicle passes
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: content
  TRACE: Story 7.1, 4.3 (FR51, N3) · Gate: H2
```

```
SCENARIO CNT-05: Authoring metadata never changes the content pack
  GIVEN two content trees that differ only in kernel, translatorNote and status
  WHEN compiled
  THEN the packs and contentPackVersion are identical, and any shipped-field change changes contentPackVersion
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: unit
  TRACE: Story 1.3 (D6, determinism) · Gate: H1
```

```
SCENARIO CNT-06: Human units compile to exact integers or fail
  GIVEN tuning and effects in dollars, percent, points and days, including a non-representable value ($0.001)
  WHEN compiled
  THEN representable values become integer cents, bp, milli-points or game-ms, and the non-representable value fails the build with file, field and reason
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: unit
  TRACE: Story 1.3, 2.2 (NFR16, N3 rule 4) · Gate: H1
```

```
SCENARIO CNT-07: No playtest gate opens on placeholder content
  GIVEN npm run content:audit --scope <gate scope> --require-final
  WHEN run before H1 (garage), H2 (spine, seed, series-a) and H3 (all scopes)
  THEN it exits 0 only when every item in scope is final, and a status: final change without Tiziano's CODEOWNERS approval fails CI
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: content
  TRACE: Story 2.13, 5.13, 7.2, 7.8–7.10, 8.10 (D-E3) · Gate: H1, H2, H3
```

```
SCENARIO CNT-08: Strings and numbers come only from catalogs and formatters
  GIVEN the UI code
  WHEN typecheck, lint and the catalog check run
  THEN t('unknown.key') fails typecheck, literal JSX strings fail lint, ICU plurals render correctly, every ui.json key is used,
  AND no UI string names Alignment or a hidden signal
  PRIORITY: P1
  CATEGORY: platform
  LEVEL: unit + lint
  TRACE: Story 1.4, 7.4 (NFR12, UX-DR50) · Gate: H1
```

```
SCENARIO CNT-09: Rich text renders tokens as elements, never HTML
  GIVEN content text with ICU params, @char.<id>, #<channel>, `code` and an injected "<img onerror>" string
  WHEN RichText renders it
  THEN mention chips (accessible name "mention: <name>"), channel links and inline code are Preact elements, the injected markup is rendered as text,
  AND no other component renders raw content text; unknown mentions or params fail the build
  PRIORITY: P0
  CATEGORY: platform
  LEVEL: component + content
  TRACE: Story 2.5 (Content Text Format, D7) · Gate: H1
```

---

### 5. E2E Journey Tests

E2E journeys reach their start state through scenarios (`?scenario=`) and read state through `window.__hitl`. They never play an hour to reach a state. Timeouts assume the test clock (`page.clock`) and debug time controls are used to compress game time.

```
E2E SCENARIO E2E-01: Giulia's first ten minutes (Loop #1 cascade)
  GIVEN a fresh profile in a test build (no save)
  WHEN the player founds a company with the prefilled name and her own name
  AND presses Deploy
  AND answers or ignores each cascade message at random (seeded) until the minute-8 line and the chart appear
  THEN every cascade element was born once in EXPERIENCE.md order with no focus move,
  AND no console error or unhandled rejection occurred,
  AND window.__hitl.fingerprint() equals the replay fingerprint
  TIMEOUT: 120
  PRIORITY: P0
  CATEGORY: e2e
  INFRASTRUCTURE: test build, page.clock, window.__hitl, fixture cascade-start
  TRACE: Story 2.12, 2.13 (FR53–FR57) · Gate: H1
```

```
E2E SCENARIO E2E-02: Marco comes back in the morning
  GIVEN the fixture seed-first-policy with #customers delegated
  WHEN the tab is hidden and the wall clock advances 12 hours
  AND the tab title shows (N) from the preview
  AND the player returns, reads the away report, decides the waiting term sheet, works two backlog items and Auto-triages the rest
  THEN the order was report → heavy decision → backlog → workspace,
  AND the tab-title N matched the waiting count on return,
  AND the round closed with confetti and a chronicle line, and the fingerprint equals replay
  TIMEOUT: 90
  PRIORITY: P0
  CATEGORY: e2e
  INFRASTRUCTURE: test build, page.clock, visibility control, window.__hitl, fixture seed-first-policy
  TRACE: Stories 3.5–3.10, 4.12 (Flow 2) · Gate: H2
```

```
E2E SCENARIO E2E-03: Giulia is Surpassed and reads the clue replay
  GIVEN the fixture near-surpassed
  WHEN the player delegates once more, crossing 0
  AND watches the lock sequence and activates "Open incident report"
  AND reads the clue replay and presses Continue
  THEN the Surpassed sequence played (Metis's line, locks ~300 ms apart, final title), only the incident report was live,
  AND the clue replay showed the curve, top 5 with quotes, counterfactual and signals timeline,
  AND the Post-mortem opened, and the fingerprint equals replay
  TIMEOUT: 60
  PRIORITY: P0
  CATEGORY: e2e
  INFRASTRUCTURE: test build, window.__hitl, fixture near-surpassed
  TRACE: Stories 5.10–5.12, 6.3 (Flow 3) · Gate: H2
```

```
E2E SCENARIO E2E-04: Sara goes Bankrupt, shares and starts Loop #2
  GIVEN the fixture red-runway
  WHEN the player lets days pass until Bankrupt
  AND opens the wind-down memo, downloads PNG and PDF, copies the alt text
  AND starts Loop #2
  THEN the files are produced with no spoiler, the profile shows Loop #2 and Best,
  AND the founding screen is prefilled with the previous names, and the compressed cascade with "hello again." plays
  TIMEOUT: 90
  PRIORITY: P0
  CATEGORY: e2e
  INFRASTRUCTURE: test build, page.clock, download capture, PDF text extraction, window.__hitl, fixture red-runway
  TRACE: Stories 5.8, 5.9, 6.3–6.7, 6.9 (Flow 4) · Gate: H3
```

```
E2E SCENARIO E2E-05: Kenji plays with the keyboard only
  GIVEN the Screen reader preset and a fresh profile
  WHEN the player completes the founding, the cascade, a heavy decision and a backlog return using only the keyboard (Tab, shortcuts, Alt set)
  THEN every step is completable, no keyboard trap exists outside modal dialogs, focus is always visible, and the announcer produced the expected action confirmations
  TIMEOUT: 180
  PRIORITY: P0
  CATEGORY: e2e
  INFRASTRUCTURE: test build, keyboard-only driver, live-region recorder, fixtures cascade-start and series-a-back-from-14-days
  TRACE: Stories 1.7, 2.6, 8.2, 8.9 (Flow 5) · Gate: H1 (cascade part), H3 (full)
```

```
E2E SCENARIO E2E-06: Giulia grants a capability
  GIVEN the fixture series-a-entry with a Family Office investor (capability grants eligible)
  WHEN the grant heavy decision opens and the player approves it
  THEN the overlay paused the game, the reward applied, the timeline shows "Day N · <grant> · you", capabilityGrants incremented,
  AND nothing visible mentions Alignment
  TIMEOUT: 45
  PRIORITY: P1
  CATEGORY: e2e
  INFRASTRUCTURE: test build, debug "force content", window.__hitl, fixture series-a-entry
  TRACE: Story 4.5 (Flow 6) · Gate: H2
```

```
E2E SCENARIO E2E-07: Marco pauses Metis for audit
  GIVEN a Seed run with two active policies and no audit cooldown
  WHEN the player clicks "Pause Metis for audit" and confirms
  THEN all policies are forced off for 3 game days, ~~Metis~~ shows in the sidebar, toggles, D and Auto-triage are aria-disabled with "Paused for audit · N days",
  AND Hype dropped 10, the "Why is Metis down?" headline ran, and afterwards the button shows "Available in N days"
  TIMEOUT: 45
  PRIORITY: P1
  CATEGORY: e2e
  INFRASTRUCTURE: test build, debug time controls, window.__hitl, fixture audit-ready (proposed)
  TRACE: Story 5.7 (Flow 7, FR31, FR40) · Gate: H2
```

```
E2E SCENARIO E2E-08: A full run from Series A entry stays consistent
  GIVEN the fixture series-a-entry with delegation on
  WHEN the run advances through several rounds (B and C as heavy events)
  THEN no error occurs, rounds repeat as heavy events, and the fingerprint matches replay
  TIMEOUT: 120
  PRIORITY: P1
  CATEGORY: e2e
  INFRASTRUCTURE: test build, debug time controls, window.__hitl
  TRACE: Story 4.17 · Gate: H2
```

```
E2E SCENARIO E2E-09: Save, close, absence, reopen (Replay Consistency level 4)
  GIVEN a run with an active policy on each engine
  WHEN the player saves, closes the page, the wall clock advances 3 days, and the page is reopened
  THEN window.__hitl.fingerprint() equals the replay of the stored log including the absence input
  TIMEOUT: 60
  PRIORITY: P0
  CATEGORY: e2e
  INFRASTRUCTURE: test build, persistent browser context, page.clock, window.__hitl
  TRACE: Story 1.11, 3.5 (D4 level 4) · Gate: H2
```

---

## Coverage Matrix

### By Area and Priority

| Area | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| Determinism and replay (DET) | 11 | 1 | 0 | 0 | 12 |
| Time, clock and economy (CLK, ECO) | 5 | 6 | 0 | 0 | 11 |
| Triage (TRI) | 5 | 3 | 0 | 0 | 8 |
| Delegation and compute (DEL) | 3 | 5 | 0 | 0 | 8 |
| Absence and return (ABS) | 12 | 2 | 0 | 0 | 14 |
| Hidden Alignment and signals (ALN) | 16 | 0 | 0 | 0 | 16 |
| Spine beat queue and scripts (SPN) | 8 | 1 | 0 | 0 | 9 |
| Company growth (GRW) | 3 | 9 | 2 | 0 | 14 |
| Deaths and clue replay (END) | 9 | 3 | 1 | 0 | 13 |
| Save/load (SAV) | 11 | 2 | 0 | 0 | 13 |
| Export/import (IMP) | 4 | 3 | 0 | 0 | 7 |
| Unlocks and cascade (UNL) | 3 | 4 | 1 | 0 | 8 |
| Documents and meta (DOC) | 3 | 4 | 1 | 1 | 9 |
| Web platform (PLT) | 2 | 5 | 0 | 0 | 7 |
| Input (INP) | 3 | 5 | 0 | 0 | 8 |
| Performance (PRF) | 0 | 6 | 3 | 0 | 9 |
| Accessibility (A11Y) | 11 | 5 | 0 | 0 | 16 |
| PDF/UA (PDF) | 1 | 3 | 2 | 0 | 6 |
| Cross-browser (XB) | 1 | 5 | 0 | 0 | 6 |
| Content and i18n (CNT) | 5 | 4 | 0 | 0 | 9 |
| E2E journeys (E2E) | 6 | 3 | 0 | 0 | 9 |
| Multiplayer | — | — | — | — | N/A |
| **Total** | **122** | **79** | **10** | **1** | **212** |

### By Epic

A scenario is counted under every epic whose stories it traces, so the column sums exceed the scenario total.

| Epic | Main areas | Scenarios tracing it |
|---|---|---|
| E1 Foundations (1.1–1.11) | DET, CLK, ECO-01/02/08, SAV, IMP, PLT, CNT-05/06/08, A11Y-01, INP-02/04, UNL-04 | 61 |
| E2 Triage & Cascade (2.1–2.13) | TRI, UNL, SPN-08/09, ALN-16, A11Y-05/08, INP-01/05/06/08, XB-06, CNT-09, E2E-01 | 40 |
| E3 Delegation & Absence (3.1–3.11) | DEL, ABS, ALN-01…06, XB-03/04 | 33 |
| E4 Company Growth (4.1–4.17) | ECO-04…07, GRW, DEL-08, ALN-07, INP-07, E2E-06/08 | 33 |
| E5 Signals & Deaths (5.1–5.13) | SPN, ALN-12…15, END, A11Y-04/06, E2E-03/07 | 41 |
| E6 End of Run & Loop (6.1–6.9) | DOC, ALN-08/09, UNL-06, PDF-02…05, IMP-07, E2E-04 | 24 |
| E7 Content Production (7.1–7.10) | CNT-01…04, CNT-07, CNT-08 | 6 |
| E8 Accessibility, Settings & Polish (8.1–8.10) | A11Y, PRF, PLT-02/03/06, PDF-01, XB, INP-03, DET-09, TRI-02 | 40 |

### By Playtest Gate (scenario must be green before the gate)

| Gate | Story | Scenarios first required | What it protects |
|---|---|---|---|
| **H1** (Triage is fun, mini-playtest) | 2.13 | 80 | Determinism foundation, save/load, cascade, triage loop, keyboard flow, no leak hooks in production, Garage content final |
| **H2** (Delegation trap is felt) | 5.13 | 91 | Absence, backlog, delegation, hidden Alignment silence, spine beat pacing, deaths, clue-replay correctness, VoiceOver on cascade and Surpassed |
| **H3** (Document gets shared; blind cohort) | 8.10 | 41 | Spoiler-free PNG/PDF, PDF/UA, meta-progression, full accessibility matrix, performance, offline, cross-browser, Safari durability, all content final |

Scenarios that list two gates count once, under the earlier gate.

---

## Automation Strategy

### Recommended for Automation (Unit / Property / Golden, Node, every PR)

- **DET-01…07, DET-09, ABS-06, ABS-08, ABS-12, SPN-05, SPN-09, TRI-03, TRI-04, END-07, DOC-01, ALN-02, ALN-08**: fast-check properties. These are the backbone: determinism is the highest risk and is tested without a browser (D12). The nightly job runs them at a high iteration count. Shrunk counterexamples become permanent tests.
- **All ECO, CLK, DEL, ALN-01/04/06/07/12/13/15, SPN-01…04/06/07, GRW, END-01/02/08/09/10/13, SAV-06/09/11, IMP-02/06**: pure-core unit tests with `tests/builders/`. Mocks only at `platform/` boundaries (fake clock, in-memory storage, fake notifications).
- **DET-07**: golden runs (Garage 40 days at E1; Seed, Series A and Surpassed goldens added at E4/E5).
- **CNT-01…07**: content suite with one pass and one fail fixture per rule.
- **ALN-03, DET-12, PLT-05, PRF-04, INP-04, SAV-11**: lint and size gates, including `lint:fixtures`.

### Recommended for Automation (Component, happy-dom, every PR)

- **A11Y-01, A11Y-07, A11Y-08, A11Y-14, A11Y-16, TRI-05, TRI-08, UNL-01…03, UNL-05, UNL-08, ALN-14, ALN-16, DEL-03, DEL-04, INP-02/03/06/07, GRW-13, CNT-09**: queries by role and accessible name only. No DOM snapshots.

### Recommended for Automation (E2E, Playwright)

- **On every PR (Chromium):** E2E-01, SAV-01…05, SAV-07, SAV-08, IMP-01…03, DET-11, ALN-05, ALN-10, ALN-11, PLT-01, PLT-07, A11Y-02 (views present so far), A11Y-05, INP-01, INP-05, XB-06.
- **On `main` (Chromium, Firefox, WebKit):** the full e2e suite, including DET-08, IMP-04, SAV-02/03 on all engines, E2E-02…09, A11Y-03/04/10/11/13 (pairwise theme matrix), PLT-02/03, PDF-05, XB-02…04.
- **Nightly:** PRF-01…09 (Chromium + CDP), high-iteration properties, the full theme × mode × contrast × CVD × infection axe matrix.
- **On `main` (veraPDF):** PDF-01, PDF-02.

### Manual Testing Required

- **A11Y-15**: screen-reader completability with VoiceOver (macOS, iOS), NVDA and JAWS. It needs human judgment of announcement quality and noise, and U+0336 legibility.
- **XB-05, SAV-13 (real Safari/iOS), XB-02/03 (real iOS)**: real-device behaviours (eviction, iOS notification absence, touch feel, file download/share sheets) that WebKit in Playwright does not reproduce faithfully.
- **PDF-03 (screen-reader part)**: reading a tagged PDF in a real reader.
- **Game feel and pillars**: whether triage is fun (H1), whether the twist feels fair (H2), whether the document is worth sharing (H3). Only observation can answer these (see Playtesting Recommendations).
- **Voice Principle**: Tiziano's final cut (Stories 7.8–7.10). It is not a QA task and is only gated mechanically by CNT-07.
- **Exploratory sessions** before each gate, using `?scenario=` and the debug panel (Playwright MCP / Chrome DevTools MCP may assist, but they are not suites of record).

### Automation Tools

- **Engine**: none. Web stack: Preact 10.29 + TypeScript 6.0 + Vite 8.3 (Node 24 LTS).
- **Framework**: Vitest 5.0 (Node) + fast-check 4.10 + golden runs; Vitest + happy-dom 21.0 + @testing-library/preact 3.2; @playwright/test 1.64 + @axe-core/playwright 4.14; veraPDF CLI; Playwright + CDP for performance.
- **CI Integration**: GitHub Actions `ci` (PR: typecheck, lint, Stylelint, Prettier, jscpd, knip, size-limit, unit, property, golden, content, e2e Chromium), `main` (e2e on three engines, veraPDF), `nightly` (high-iteration properties, performance, full axe matrix), `deploy` (Pages + post-deploy smoke PLT-01).

---

## Test Fixtures (Scenarios)

Scenarios are the debug-panel fixtures in `tests/fixtures/`, loadable with `?scenario=<name>` in dev and test builds. They are the only fixture copies (architecture Debug Tools).

| Fixture | Status | Used by |
|---|---|---|
| `garage-start` | defined (architecture, Story 1.11) | SAV-01, UNL-04, PRF-03 |
| `cascade-start` | defined (Story 2.13) | E2E-01, E2E-05, SPN-08 |
| `garage-after-cascade` | defined (Story 2.13) | SAV-01, TRI-06, INP-01 |
| `seed-first-policy` | defined (architecture, Story 4.17) | E2E-02, DEL-01, XB-04 |
| `series-a-entry` | defined (Story 4.17) | E2E-06, E2E-08, PRF-08 |
| `series-a-back-from-14-days` | defined (architecture) | ABS-09, PRF-05, E2E-05 |
| `series-a-threshold-25` | defined (Story 5.13) | ALN-05, ALN-10, A11Y-04 |
| `near-surpassed` | defined (Story 5.13) | E2E-03, END-05, ALN-09 |
| `red-runway` | defined (architecture, Story 5.13) | E2E-04, END-03, ALN-09 |
| `loop-2-start` | **proposed** | UNL-06 |
| `seed-round-cooldown` (round just closed, Alignment just above 75) | **proposed** | SPN-02, SPN-03, SPN-07 (e2e variants) |
| `audit-ready` (Seed, two policies, no cooldown) | **proposed** | E2E-07 |
| `untimed-queue-full` | **proposed** | A11Y-09 |
| `researcher-hired` | **proposed** | ALN-12 (e2e), END-11 |
| `fault-invariant` (test build only, triggers an invariant violation) | **proposed** | SAV-07 |
| Past-version save fixtures (`saves/v<N>.json`) and an old-content-pack save | **proposed** (from the first playtester build) | SAV-09, SAV-10, PLT-06 |

---

## Playtesting Recommendations

### Internal Playtests (gate entry checks)

| Gate | Entry criteria (automated, must be green) | Manual preparation |
|---|---|---|
| **H1 mini-playtest** (Story 2.13; 1–2 colleagues outside the final cohort; cascade only, ~20–30 min each) | All H1-gated scenarios. Specifically E2E-01 on the production build on Pages, DET-01…08, SAV-01…05, UNL-01…05, SPN-08/09, TRI-01…06, PLT-01, ALN-11, CNT-07 (`--scope garage`). | `docs/playtests/h1.md` sheet (reads? smiles? wants more? minute reached), Run ID and version; one exploratory keyboard-only pass. |
| **H2 playtest** (Story 5.13; testers outside the final cohort, or Tiziano; reach a Surpassed run via `series-a-threshold-25` / `near-surpassed`, ~45 min) | All H2-gated scenarios. Above all ALN-01…07/10/12…16, SPN-01…07, ABS-01…14, END-01…12, E2E-02/03/09, CNT-07 (`--scope spine,seed,series-a`), A11Y-15 (VoiceOver on cascade and Surpassed). | `docs/playtests/h2.md` sheet: reaction at the clue replay (recognition vs protest), which signals were noticed, and whether the top-5 quotes were recognised as the tester's own decisions. |

### External Playtests (validation cohort)

- **H3 blind cohort** (Story 8.10). Tiziano plus 3–5 colleagues blind to the twist, none of whom played an earlier build. Free play (sessions are unprompted). Measure: minutes played unprompted (H1 exit signal: at least half of testers past 20 minutes), the reaction at the clue replay (H2: recognition), and unprompted shares (H3: at least one). Supporting data: the opt-in `HITL-STATS` export (IMP-07).
- **Entry criteria:** every scenario in this document green, including PDF-02 (veraPDF), the three-engine e2e suite, the nightly perf suite, A11Y-15 on the full screen-reader matrix, SAV-13 on real Safari/iOS, and CNT-07 with `--require-final` over all scopes.
- **Save-loss watch:** the cohort target is zero save loss (NFR11). Ask every tester to export a data room at the end of each session, so any loss is recoverable and diagnosable.

---

## Next Steps

1. [ ] Review this test design with the team, and resolve the open questions A-9, A-10 and A-12 with the architect and the GDD owner.
2. [ ] Implement the P0 foundation tests with Stories 1.2, 1.9, 1.10 and 1.11 (DET, SAV, IMP), so the invariants run in CI from day one.
3. [ ] Add the proposed fixtures to `tests/fixtures/` as their stories land.
4. [ ] Generate automated tests per story (`gds-test-automate`), using this document's scenario IDs in test names or descriptions for traceability.
5. [ ] Plan the H1, H2 and H3 sessions (`gds-playtest-plan`) from the Playtesting Recommendations.
6. [ ] Design the nightly performance harness in detail (`gds-performance-test`) for PRF-01…09.
7. [ ] Build the traceability matrix and gate decision before each playtest (`bmad-testarch-trace`).

---

## Assumptions made without the user

This document was produced in an unattended run. The workflow's menus were answered with "continue", and the questions below were answered from the source documents. Each item is a choice Tiziano did not confirm.

**Workflow choices:**

- **A-1 Output location and scope.** The workflow's configured output (`{output_folder}/game-test-design.md` → `_bmad-output/game-test-design.md`) was used, with `design_level: full` and `focus_area: auto` (the workflow defaults). The test design is system-level across all 8 epics, not epic-level.
- **A-2 Template adaptation.** The engine-oriented template was adapted to a web game. "Target Platforms" lists browsers. "Certification" became web-platform requirements (WCAG 2.2 AA, PDF/UA, zero network, offline, no debug in production). "Movement/Physics" and "Multiplayer" are marked N/A. "Achievements" became meta-progression and documents. "Automation Tools → Engine" names the fixed web stack, not Unity/Unreal/Godot.
- **A-3 Scenario format extension.** The workflow's GIVEN/WHEN/THEN format was kept and extended with `LEVEL` and `TRACE` (story, FR/NFR/UX-DR, gate) lines, plus stable IDs, so scenarios can be mapped to epics, stories and the H1/H2/H3 gates as requested.
- **A-4 Gate mapping rule.** A scenario's gate is the earliest playtest gate whose scope includes the behaviour: E1–E2 → H1, E3–E5 → H2, E6–E8 → H3. Exceptions are where an earlier gate depends on the behaviour (e.g. PDF-01, the 8.1 spike, gated at H1 because it is scheduled right after 1.1).
- **A-5 Priorities.** Priorities follow the workflow's risk matrix, with one override. Hidden-state leaks, spine pacing, content-pack/replay safety, accessibility completability and clue-replay correctness are P0 even at medium likelihood, because a failure invalidates a GDD pillar or a playtest gate.

**Answers to questions the documents leave open:**

- **A-6 Performance reference profile.** "Mid-range laptop" and "5-year-old laptop" are not specified as hardware. This plan assumes the nightly suite runs on a pinned CI runner with CDP CPU throttling (4×) and 4G network emulation as the reference, and that performance is asserted on Chromium only (CDP). Firefox/Safari performance is checked manually in Story 8.9.
- **A-7 Axe matrix size.** Running axe on every view × 4 themes × 2 modes × contrast × CVD × 5 infection stages on every PR is too slow. This plan assumes a pairwise matrix on `main` and the full matrix nightly, plus the scripted contrast check on every PR.
- **A-8 Visibility and wall-clock control in e2e.** Hidden-tab and absence scenarios are assumed to use Playwright's clock control plus a test-build visibility control at the `platform/visibility` boundary (or CDP lifecycle on Chromium). Real browser throttling is verified manually.
- **A-9 Spine beat vs a round closing after scheduling (SPN-07).** The scheduling formula in N1 is evaluated when a beat is scheduled. The narrative rule says no beat fires during any round cooldown. This plan assumes the narrative rule wins: a beat is deferred if a round closes before it fires. **To be confirmed.**
- **A-10 Simultaneous deaths (END-13).** The documents do not say which death wins if Bankrupt and Surpassed occur in the same step. This plan only asserts that exactly one runEnded is emitted, deterministically. **To be confirmed** (GDD owner).
- **A-11 PDF page size by locale (PDF-04).** "A4/Letter by locale" is assumed to mean en-US → Letter and other English locales (en-GB) → A4, derived from the browser locale.
- **A-12 Saves from an older content pack (SAV-10, PLT-06, risk R6).** The architecture says content-pack versions are migrated, and that the desync detector lets the replay win on mismatch. It does not say how an old input log replays against a new content pack. This plan assumes the required behaviour is "never silently rewrite the player's run": either a defined content-pack migration or an explicit message. It flags this as an **open question for the architect** before the first playtester build.
- **A-13 Fault injection.** Testing the bug boundary needs a way to trigger an invariant violation. Since `window.__hitl` is read-only and core functions must not be mocked, this plan assumes a test-build-only `fault-invariant` scenario.
- **A-14 Proposed fixtures.** `loop-2-start`, `seed-round-cooldown`, `audit-ready`, `untimed-queue-full`, `researcher-hired`, `fault-invariant` and the past-version/old-content-pack saves are proposals, not defined in the source documents.
- **A-15 Safari eviction (SAV-13).** Real ITP eviction cannot be reproduced in CI. This plan assumes a site-data wipe in WebKit as the automated proxy, plus a manual real-device pass. Expected behaviour after eviction is a clean founding screen and a successful restore from an exported data room. The documents define no further mitigation, and none is proposed.
- **A-16 Balance harness.** GRW-14 is report-only (P2), as Story 4.17 states. Balance-band violations trigger tuning, not test failures.
- **A-17 Cross-engine determinism (DET-08).** It is assumed that golden fingerprints must match across Node, Chromium, Firefox and WebKit. The architecture implies this through "seed + inputs → identical run" and cross-browser import (IMP-04), but does not state it explicitly.
- **A-18 Document language and greeting.** Per config, the document is written in English (`document_output_language`). The workflow's greeting to Tiziano in Italian (`communication_language`) was emitted in the run log only, since no user was present.
- **A-19 No source documents changed.** epics.md, the GDD, the architecture, narrative and UX documents were read only. Follow-ups that would touch them are listed as open questions here, not applied.

---

## Appendix

### Glossary

- **Alignment**: hidden value (100 → 0, stored in milli-points) that drifts with every AI decision. It is never shown before the clue replay.
- **signalStage**: 0–5 stage derived from Alignment thresholds 75/50/25/10/0. It never decreases.
- **Spine beat**: queued narrative content for a threshold crossing (inference line, spine message), paced by the round cooldown (5 days) and the minimum gap (3 days).
- **Absence**: time with the tab hidden or closed. It is simulated only if a delegation policy is active, capped at 14 game days, and stops at a heavy decision or death.
- **Backlog**: ranked, capped queue of non-delegated messages waiting after an absence.
- **Chunk invariance**: `advance(advance(s,t1),t2) ≡ advance(s,t2)`.
- **Fingerprint**: SHA-256 of the canonical serialisation of the state.
- **Golden run**: a recorded run with a stored expected fingerprint.
- **ReportModel / buildReportModel**: the single spoiler filter that feeds the HTML, PNG and PDF documents.
- **Scenario (fixture)**: a named game state loadable with `?scenario=` in dev/test builds. It doubles as a test fixture.
- **H1 / H2 / H3**: GDD hypotheses and playtest gates. Triage is fun / the delegation trap is felt / the document gets shared.

### References

- Game Design Document: `planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md` (v1.2), `decision-log.md`
- Epics and stories: `planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md` (v2.0)
- Architecture: `game-architecture.md` (D1–D14, Replay Consistency, Debug Tools, N1–N5)
- Project rules: `project-context.md` (Testing Rules, Critical Don't-Miss Rules)
- Narrative: `narrative-design.md` (Tension Curve, spine beats, Voice Style Guide)
- UX: `planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md`, `DESIGN.md`
- Standards: WCAG 2.2 AA; ISO 14289 (PDF/UA) via veraPDF
- Knowledge base: `qa-index.csv` (loaded by `gds-agent-game-dev` from `{skill_root}/gametest/qa-index.csv`), including `test-priorities.md`, `save-testing.md`, `e2e-testing.md`, `performance-testing.md`
