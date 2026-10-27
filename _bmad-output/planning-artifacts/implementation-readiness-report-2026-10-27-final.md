---
stepsCompleted: [step-01-document-discovery, step-02-gdd-analysis, step-03-epic-coverage-validation, step-04-ux-alignment, step-05-epic-quality-review, step-06-final-assessment]
date: 2026-10-27
run: final re-check after the second round of fixes (epics.md v2.2)
previousReport: _bmad-output/planning-artifacts/implementation-readiness-report-2026-10-27-recheck.md
project: browser-game (Human in the Loop)
assessor: gds-check-implementation-readiness (Game Producer / Scrum Master role), run unattended for Tiziano
documentsIncluded:
  gdd: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md (v1.4 per decision log)
  gddDecisionLog: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md
  epics: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md (v2.2, 94 stories)
  architecture: _bmad-output/game-architecture.md
  projectContext: _bmad-output/project-context.md
  narrative: _bmad-output/narrative-design.md
  ux:
    - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md
    - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md
  supporting:
    - _bmad-output/game-test-design.md
---

# Implementation Readiness Assessment Report (Final Re-check)

**Date:** 2026-10-27
**Project:** browser-game (Human in the Loop)
**Scope:** third pass. It verifies the 24 findings left open by the re-check (4 major, 20 minor) after the second round of fixes: epics.md v2.2 (Planning Decision D-E6), GDD decision log "Re-check fixes (v1.4)", architecture D1/D4/D7/D14/N2/N3/N4/N5, narrative Reference Events 1, 3 and 4, EXPERIENCE.md (cascade, State Patterns, capacity offer, Flow 3), project-context and the test design. It then looks for problems introduced by these fixes.

**Severity scale (unchanged):**

- **critical:** blocks implementation or breaks a core promise if built as written;
- **major:** an AI dev agent would have to guess, or two documents give conflicting instructions on something that matters;
- **minor:** an inconsistency or gap that is cheap to fix and unlikely to derail a story.

Previous IDs are kept (R-M1, N-M*, N-m*, and the residuals M6, M8, M14, m5–m8, m17). New findings in this pass use **F-M*** (major) and **F-m*** (minor).

## Document Discovery

As in the previous runs, the configured patterns (`{planning_artifacts}/*gdd*.md` and similar) match nothing at the top level of `planning-artifacts/`, because the documents live in sub-folders or in `_bmad-output/`. The documents were taken from the requester's list.

| Type | File | Size | Modified | Format |
|---|---|---|---|---|
| GDD | `planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md` | 78 KB | 2026-10-27 16:46 | Whole |
| GDD decision log | `…/gdd-browser-game-2026-10-26/decision-log.md` | 31 KB | 2026-10-27 16:47 | Whole |
| Epics & stories | `…/gdd-browser-game-2026-10-26/epics.md` (v2.2) | 195 KB | 2026-10-27 16:47 | Whole |
| Architecture | `_bmad-output/game-architecture.md` | 99 KB | 2026-10-27 16:46 | Whole |
| Project context | `_bmad-output/project-context.md` | 18 KB | 2026-10-27 16:46 | Whole |
| Narrative | `_bmad-output/narrative-design.md` | 68 KB | 2026-10-27 16:46 | Whole |
| UX (visual) | `planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md` | 41 KB | 2026-10-26 18:52 | Whole |
| UX (behaviour) | `…/ux-browser-game-2026-10-26/EXPERIENCE.md` | 37 KB | 2026-10-27 16:46 | Whole |
| Test design (supporting) | `_bmad-output/game-test-design.md` | 136 KB | 2026-10-27 16:48 | Whole |

- **Duplicates:** none.
- **Missing:** none.
- **Changed since the re-check:** every document except DESIGN.md. EXPERIENCE.md was edited this time, so the behaviour conflicts it caused last time are gone.

## GDD Analysis

The GDD still has no numbered FRs. As in the previous runs, the FR1–FR89 / NFR1–NFR19 inventory in epics.md is the requirement list, checked against the GDD text.

**Requirements reworded in v2.2:**

| ID | Change |
|---|---|
| FR9 | The offer button stays usable until used; the offer repeats every 5 game days at 100% |
| FR25 | The backlog window is real time while the game clock is paused; lapse = logged `expireBacklogItem` |
| FR55 | Adds the #product beat and "Activity and ✨ Automations" at cascade end |
| FR74 | Runs in progress are pinned; older saves migrate on load |
| NFR7 | Updates apply only on the founding screen or after a run ends |

All five match GDD v1.4 and the architecture.

**One requirement was not updated: FR7.** It still says Hype "decays ~2%/day" with no Garage exception. The GDD Economy section (line 770) and D-E6 say decay starts at Seed (see F-m2).

**GDD v1.4 closes the GDD-level gaps listed last time:**

- the stale real-time sentences (Core Simulation Systems, line 615; Seed Determinism, line 652);
- Ask Metis in the M7 drift list (line 341);
- trait numbers (M9 table, lines 469–478; tuning, line 802);
- the Hype-decay rule (line 770);
- the capacity-offer repeat (M4, line 312);
- the #product cascade beat and the timing anchor (M11, lines 511 and 517);
- the backlog time base (M1, line 180).

**Additional requirements added by D-E6, now binding on stories:**

- **#product** is born at Deploy + 4:00.
- **Region owners** are named in N2.
- **Templates** are drawn only for unlocked channels.
- **Backlog timer:** real time, with the lapse logged as a command.
- **Version pinning mechanism:** versioned caches, install refused while a run is pinned, `appVersion` in the save record.
- **Capacity offer:** repeats every 5 game days; an episode ends below 90%.
- **Hype** does not decay in the Garage.
- **Garage events** are in the `garage-events` scope (7.5 → 7.9 → H2).
- **Vocabulary semantics:** `runwayDays` dropped; `askMetis` counts as an AI decision; `throughput` does nothing without staff.

## Verification of the Previous Findings

| ID | Status | Evidence (where the fix lives now) | Residual |
|---|---|---|---|
| **R-M1** | 🟡 Partial | **Wording fixed everywhere:** architecture Hosting Constraints (line 202), D14 "Updates" (line 529), Directory Structure and System Location Mapping ("version-pinned update"), project-context lines 151 and 166, NFR7, FR74, EXPERIENCE.md State Patterns (line 113). **Mechanism:** D4 → Version pinning (versioned caches; `install` rejects while a run is pinned). **`appVersion` added** to the save record in D4, Additional Requirements and Story 1.9 AC1. **E2e added:** Story 8.7 AC4 (close every tab and relaunch with a run in progress) | Story 8.7 AC3 contradicts D4 on the worker's lifecycle state, and the step that applies the update between runs is unspecified, which leaves a race that breaks pinning. Still **major**, now narrowed to Story 8.7 → **F-M1** |
| **N-M1** | ✅ Resolved | GDD M1 Time bases (line 180); architecture D1 Time bases row "Backlog top-item window"; FR25; Story 3.8 AC1 and AC4 (with a replay test); project-context line 47 (`app/session` is an allowed real timer) | Edge cases: hidden tab or another pause during the queue (F-m8, minor) |
| **N-M2** | ✅ Resolved | D-E6; GDD M11 (4:10 #product); EXPERIENCE.md cascade (4:10, ~10:00); architecture N2 (owners, locked channels); Stories 2.3 AC5 (only unlocked channels), 2.11 AC4 (Headcount owned by the beat), 2.12 AC4, 3.6 AC4 (`backlog`), 4.4 AC2 (`timeline`), 7.3 (#product opener); test design SPN-08 | Automations entry before its page exists (F-m6); conditional Timeline unlock and the N2 list placement (F-m7). Both minor |
| **N-M3** | ✅ Resolved | `event.garage.credit-cliff` moved from 7.3 to 7.5 (D-E6, Story 7.3 AC1, Story 7.5 AC1); `params:` declared in narrative Reference Events 1, 3 and 4. The H1 critical path no longer depends on E4 vocabulary | The same timing issue moved to 7.5 (F-m4, minor: off the H1 path) |
| **M6** | ✅ Resolved | EXPERIENCE.md cascade row ~10:00 ("Timeline appears with the first chronicle entry (at cascade end if one exists)"); test design SPN-08 ("Activity/Automations ~10:00") | — |
| **M8** | ✅ Resolved | Story 2.12 AC4 lists Deploy offsets (+0:20 … ~+9:50) with the rule "table time − 0:10"; EXPERIENCE.md cascade preamble; GDD M11 Timing anchor; N4 comment; SPN-08 labels table times | — |
| **M14** | ✅ Resolved | GDD M9 table: 10x Engineer −2 morale/day per teammate; Ex-FAANG +3 Hype on hire. Tuning line 802: Peter Pan's promotion refusal is writing-only; Ex-Founder has a 2% daily chance to leave after 60 game days. Story 4.10 AC cites the values | — |
| **m5** | ✅ Resolved | Architecture D6 Scaffolding (line 392) and epics Additional Requirements (line 245) both read `content:new -- <kind> <id>` | — |
| **m6** | ✅ Resolved | N2 code example uses `cash`, `rail.team`, `inferenceLog` (all canonical) | — |
| **m7** | ✅ Resolved | Architecture Naming Conventions, line 882: "Per kind, matching the path (D6 → ID ↔ path table)" | — |
| **m8** | ✅ Resolved | EXPERIENCE.md Flow 3 (line 307): "would have cost about $1.2M" | — |
| **m17** | ✅ Resolved | Story 1.1 **Covers:** "`gds-create-story` may split it into 1.1a (scaffold + gates) and 1.1b (CI, deploy, agent files)" | — |
| **N-m1** | ✅ Resolved | Story 1.8 AC8 (links rendered, navigation verified in 1.10); Story 1.9 AC6 ("wired in Story 1.10"); Story 1.10 AC7 covers all three invokers | — |
| **N-m2** | ✅ Resolved | Story 2.2 **Covers:** minimal chronicle store; Story 4.3 AC1 (heavy events not drawable before 4.5); Stories 4.1, 4.6, 4.7 use phase fixtures until 4.11 | — |
| **N-m3** | ✅ Resolved | epics Final Validation ("2.2 → 4.2", "1.7", "2.2 precedes E7.1–7.2"); test design line 137 ("1.9–1.10"), CNT-02 trace ("2.2, 4.2, 7.1"), SPN-08 | — |
| **N-m4** | ✅ Resolved | EXPERIENCE.md State Patterns row "New app or content version available" follows version pinning (line 113); cascade row ~10:00 follows 4.4 (line 185) | — |
| **N-m5** | ✅ Resolved | Architecture D7 "UI copy status" (line 398); project-context line 153; Story 7.2 (`{ status, scope }`); Story 7.3 (Garage keys, scope `garage`); Story 7.4 AC3 (verbatim strings registered as `placeholder`); Stories 5.13 and 7.9 both list `away.*`, `autotriage.*`, `cluereplay.*` | — |
| **N-m6** | ✅ Resolved | GDD M4 (line 312); FR9; Story 3.3 AC2; EXPERIENCE.md line 90; D-E6 | Test design DEL-06 still says "at most once per capacity episode" (F-m3) |
| **N-m7** | 🟡 Partial | D-E6; GDD Economy (line 770); Story 2.4 AC2 (states why the tolerance holds); Story 4.1 AC2 | FR7, the GDD Resources table (line 295), the soft-caps line (line 691) and test design ECO-05 still say Hype decays daily without the exception (F-m2) |
| **N-m8** | 🟡 Partial | N3 semantics line (`throughput`, `askMetis`, "runway is never an effect target"); `runwayDays` removed from the N3 owner table and from narrative Reference Event 3 | Story 4.2 AC1 still ships `runwayDays` (F-m1). `throughput: -10` in Reference Event 1 does not fit the "multiplies … for a number of game days" semantics. `askMetis` behaviour at capacity or during an audit pause is undefined (F-m5) |
| **N-m9** | ✅ Resolved | `appVersion` in D4 Save record, epics Additional Requirements and Story 1.9 AC1 | — |
| **N-m10** | ✅ Resolved | GDD line 615 ("Message arrivals run in game time between steps; response windows are real seconds converted once"), line 652, M7 drift list (line 341) includes Ask Metis | — |
| **N-m11** | ✅ Resolved | N5: "samples `alignmentMilli` and implied valuation (from ARR and Hype)" | — |
| **N-m12** | ✅ Resolved | D-E6; Story 2.13 AC2 ("Garage events are not in H1's scope"); Story 7.2 scope list adds `garage-events`; Stories 7.5, 7.8, 7.9 and 5.13 | — |

**Tally:** 24 previous findings were open.

- **Resolved: 21.** N-M1, N-M2, N-M3; M6, M8, M14, m5, m6, m7, m8, m17; N-m1–N-m6 and N-m9–N-m12.
- **Partially resolved: 3.** R-M1, N-m7, N-m8. Their residuals are tracked as F-M1, F-m2, F-m1 and F-m5.
- **Open: 0.**

## Epic Coverage Validation

### Coverage Matrix

The check was repeated mechanically on the **Covers:** line of all 94 stories (v2.2).

| Set | Covered | Missing |
|---|---|---|
| FR1–FR89 | 89 / 89 | none |
| NFR1–NFR19 | 19 / 19 | none |
| UX-DR1–UX-DR50 | 50 / 50 | none |

The FR → story map is unchanged from the re-check, apart from the additions below.

| FR | Added in v2.2 |
|---|---|
| FR9 | The offer-repeat rule is in Story 3.3 |
| FR25 | Story 3.8 owns `expireBacklogItem` |
| FR55 | The #product beat is in 2.12 and 7.3 |
| FR57 | Region owners are spread across 2.12, 3.6, 4.4 and 4.14 |
| FR74 | Pinning wording; Story 1.9 |

Stories: 94 in total (E1 11 · E2 13 · E3 11 · E4 17 · E5 13 · E6 9 · E7 10 · E8 10).

### Missing Requirements

None. Coverage is complete.

Requirements that are cited but not fully specified are now only edge cases:

- FR9: overlapping offers (F-m9);
- FR25: the timer under other pause reasons (F-m8);
- FR51: when the 7.5 pack can pass CI (F-m4);
- NFR7 and FR74: the update-apply step (F-M1).

## UX Alignment Assessment

### UX Document Status

Both documents were found. EXPERIENCE.md was updated in this round; DESIGN.md is unchanged and needed no change.

### UX ↔ GDD / Epics

Resolved since the re-check:

- **Cascade table.**
  - It now carries the anchor rule ("offset from Deploy is its table time − 0:10").
  - It has the 4:10 #product beat.
  - The ~10:00 row matches 4.4 and D-E6 (Activity and ✨ Automations; Timeline with the first chronicle entry; attention list when first needed).
- **State Patterns.** "New app or content version available" follows version pinning.
- **Capacity offer** (line 90). It repeats every 5 game days and the button stays usable.
- **Flow 3 counterfactual.** It reads "would have cost about".
- **Backlog clock** (lines 40 and 98). The game clock is paused and only the top timer runs. This matches GDD M1 and D1.

Remaining UX-level gaps (all minor):

- **Automations links before the page exists.** EXPERIENCE.md line 39 says Automations opens from the channel-header "Manage" link and the Metis DM. Both exist from +4:50 / +5:05, but the `automations` region unlocks only at cascade end (F-m6).
- **Automations page in E2.** The cascade-end beat shows a "✨ Automations" entry in E2 (and in the H1 build), but the Automations page is built in Story 3.1 (F-m6).

### UX ↔ Architecture

- **Region gating (N2)** now names an owner for every non-cascade region, and locked channels are excluded from draws.
- **Backlog timer** has a defined home (`app/session`) and a logged command.
- **Version-pinning notice:** EXPERIENCE.md and D14 promise a non-blocking "new version" notice. With the D4 mechanism, the new worker fails `install` and never waits, so it is not specified how the page learns a new version exists (part of F-M1).

### Warnings (carried, not addressed; accepted risks unless Tiziano says otherwise)

- AGENTS.md (Story 1.1) does not tell agents never to copy values from UX `mockups/` (EXPERIENCE.md says the spine wins over mocks).
- H1 still runs without Timing or Game-speed settings (E8.2/8.3).

## Epic Quality Review

### Epic Structure

| Epic | Player value | Independence | Notes after v2.2 |
|---|---|---|---|
| E1 Foundations | Borderline, accepted | Stands alone | Forward references removed (N-m1); 1.1 may be split (m17) |
| E2 Triage & Cascade | Yes | Needs E1, 2.2 before 7.1, and the 7.3 pack. 7.3 no longer needs E4 vocabulary | New: the Automations entry at cascade end has no page until 3.1 (F-m6) |
| E3 Delegation & Absence | Yes | Needs E1–E2 | Backlog timer defined; pause interactions open (F-m8) |
| E4 Company Growth | Yes | Needs E1–E3 | Order residues fixed (N-m2). The 7.5 pack needs vocabulary from 4.2, 4.6, 4.7 and 4.12 (F-m4). 4.2 still lists `runwayDays` (F-m1) |
| E5 Signals & Deaths | Yes (H2) | Needs E1–E4 | `garage-events` scope added to the H2 audit |
| E6 End of Run & Loop | Yes | Needs E1–E5 and 8.1 | — |
| E7 Content Production | Parallel track | 7.1 after 2.2; 7.3 is self-contained | 7.5 ordering vs vocabulary owners (F-m4); 7.3 Modules line still lists `content/events/garage/` (F-m12) |
| E8 Accessibility & Polish | Yes | 8.1 early | 8.7 AC3 conflicts with D4 (F-M1) |

### Starter Template and Greenfield

Unchanged and correct:

- Story 1.1 starts from the Vite `preact-ts` template.
- The Prerequisites (Tiziano) are listed.
- The split of 1.1 is now allowed.

### Acceptance Criteria Quality

The ACs added in v2.2 are specific and testable:

- 2.3 AC5: only unlocked channels are drawn;
- 2.4 AC2: the tolerance and its assumption;
- 2.12 AC4: Deploy offsets;
- 3.3 AC2: repeat interval and episode end;
- 3.6 AC4: the `backlog` unlock;
- 3.8 AC4: a replay test for `expireBacklogItem`;
- 4.3 AC1: heavy events gated until 4.5;
- 4.4 AC2: "never mid-cascade";
- 8.7 AC4: relaunch e2e.

Weak spots:

- 8.7 AC3 (F-M1);
- 4.2 AC1 (`runwayDays`, F-m1);
- 4.4 AC2 (no mechanism for the conditional unlock at the cascade-end beat, F-m7).

### Dependency Analysis

| Check | v2.1 | v2.2 |
|---|---|---|
| Within E1 | 1.8 / 1.9 → 1.10 | ✅ Navigation verified in 1.10 |
| Within E4 | 4.3 → 4.4 / 4.5; 4.1 / 4.6 / 4.7 → 4.11 | ✅ Heavy events gated; fixtures declared; chronicle store in 2.2 |
| 7.3 (before E2) → E4 vocabulary | ❌ | ✅ Garage events moved to 7.5 |
| 7.5 (before E4) → 4.2 / 4.6 / 4.7 / 4.12 vocabulary | not flagged | ⚠️ New (F-m4): Reference Events 1 and 3 and Seed / Series A content use terms owned by E4 stories |
| 2.12 → 3.1 (Automations page) | — | ⚠️ New (F-m6) |
| Data created when needed | Chronicle store owner missing | ✅ |

**Cross-reference sweep:**

- Story numbers in epics.md, the test design and the decision log are consistent with v2.2.
- epics.md Final Validation and the architecture Revision History do not yet record the v2.2 / re-check round (F-m12).

**Determinism and hidden-state sweep of the new rules:**

- `expireBacklogItem` is a logged command at a frozen `atGameMs`, so replay is exact.
- Capacity-offer repeats are queue events.
- #product is an `at` beat.
- The conditional Timeline unlock reads only visible chronicle state.
- No rule exposes Alignment.
- The only determinism-relevant hole is the version-pinning race (F-M1).

## Findings

### 🔴 Critical

None.

### 🟠 Major

**F-M1 (R-M1 residual). Story 8.7 contradicts the D4 version-pinning mechanism, and the update-apply step between runs is undefined, which leaves a path that breaks pinning.**

- **Contradiction.**
  - D4 → Version pinning (Mechanism): the new worker's `install` handler rejects while a pinned run is in progress, "so it never reaches `waiting`/`activate`".
  - Story 8.7 AC3: "the new service worker stays **waiting** while a run is in progress … and it activates only on the founding screen or after the run ends".
  - These describe two different lifecycles. A rejected install also means no `waiting` worker exists, so the "non-blocking notice" (D14, EXPERIENCE.md line 113, 8.7 AC3) has no event to react to.
- **Missing step.** No document says what happens on the founding screen or the end document:
  - who calls `registration.update()`;
  - whether the app calls `skipWaiting` / `clients.claim`;
  - whether the page **reloads before `newRun`**.
- **The race.**
  1. The run ends, so the page is not "in progress", and the new worker installs successfully and waits.
  2. The player clicks "Start Loop #N+1" in the same page, which still runs the old code.
  3. `newRun` pins the new run to the **old** `appVersion`.
  4. The worker is already installed, so the install-time check never runs again. When every tab closes, it activates under a run pinned to the old version.
  5. Result: the "new replay segment" fallback triggers on a normal update. Earlier days become "not reconstructable" in the clue replay, the H2/H3 instrument.
- **Second risk.** If an agent calls `skipWaiting` on the founding screen without a reload, the old page runs against new lazy chunks (renderers, PDFKit, locales).
- **Location:** architecture D4 → Version pinning, D14 "Updates"; epics Story 8.7 AC3 and AC4, D-E6 "Version pinning mechanism"; EXPERIENCE.md State Patterns.
- **Proposed fix (a few lines in D4 and 8.7):**
  1. **Detection.** Fetch a small `version.json` (precache-excluded, content-hashed build ID) on launch and on the founding screen. Show the notice when its build ID differs from the running `appVersion`. Do not rely on a `waiting` worker.
  2. **Apply.** On the founding screen and on the end-of-run document, if a newer build exists, call `registration.update()`. Once the new worker is installed, send `skipWaiting` and **reload before `foundCompany` / `newRun`**. A run is never founded by code older than the active worker.
  3. **Guard at activation too.** The `activate` handler (or the page at boot) checks for a run pinned to another `appVersion` that is in progress. If one exists, the page loads the pinned cache `hitl-<appVersion>` via the versioned cache names.
  4. **Story 8.7.** Rewrite AC3 to match ("never reaches `waiting` while a run is in progress"). Add an e2e for "run ends → new version deployed → Start Loop #N+1 → the new run is pinned to the new version".

### 🟡 Minor

**F-m1. Story 4.2 still ships `runwayDays`** (N-m8 residual).
- Story 4.2 AC1 lists `runwayDays` among its effects.
- D-E6 and the N3 owner table dropped it ("runway is never an effect target").
- *Fix:* remove `runwayDays` from 4.2 AC1.

**F-m2. The Garage Hype-decay exception is not propagated everywhere** (N-m7 residual).
- These texts still state unconditional daily decay:
  - FR7 (epics);
  - GDD Resources table (line 295, "Daily decay (~2% of current value/day)");
  - GDD soft caps (line 691);
  - test design ECO-05.
- *Fix:* add "from Seed; no decay while hidden in the Garage" to each. ECO-05 should assert no Garage decay.

**F-m3. The test design is stale on two new rules.**
- DEL-06 still asserts "at most once per capacity episode", which contradicts the 5-game-day repeat (Story 3.3 AC2).
- ABS-10 does not assert the real-time window, the `expireBacklogItem` command or the replay (Story 3.8 AC4).
- *Fix:* update both scenarios.

**F-m4. The 7.5 pack depends on vocabulary that ships across E4.**
- Moving `event.garage.credit-cliff` to 7.5 fixed H1, but 7.5 now contains:
  - `throughput` and `askMetis` (owner 4.2);
  - `morale` (4.2; Reference Event 2);
  - `investorArchetype` (4.12; Reference Event 3);
  - Enterprise events (4.6) and trait conditions (4.7).
- N3 is a closed vocabulary, so the pack cannot pass CI before 4.12. Yet E4's intro says "Content comes from the E7.5 placeholder pack", and 7.5 is "just in time" for E4.
- *Fix:* state in 7.5 that it lands in slices after each owner story (Garage and Seed events after 4.2/4.7; Series A and round content after 4.12), and that stories 4.2–4.12 test with fixtures. Optionally add a CI hint: "term X is owned by Story N".

**F-m5. Effect semantics still under-specified** (N-m8 residual).
- N3 defines `throughput` as "multiplies staff throughput for a number of game days", but Reference Event 1 uses `throughput: -10` (no multiplier form, no duration).
- `askMetis` as an answer effect has no rule for when Metis is at capacity or paused for audit (FR17 disables Ask Metis in both cases).
- *Fix:*
  - Give `throughput` a shape such as `{ pct: -10, days: 7 }` and update Reference Event 1.
  - State that an `askMetis` answer is disabled with the FR17 inline reason when Metis is unavailable (or applies the step's default).

**F-m6. The Automations entry and links appear before the Automations page exists.**
- D-E6 and Story 2.12 AC4 unlock `automations` at the cascade-end beat in **E2**, so the H1 build shows "✨ Automations", but the page is built in Story 3.1 (E3).
- From +5:05, the channel-header "Manage" link and the Metis DM (EXPERIENCE.md line 39; Story 3.1 AC5) point to a region that is still locked.
- *Fix:*
  - In 2.12, ship a minimal Automations page: one row per unlocked policy-capable channel with the inert switch, mirroring 2.11's inert toggle. 3.1 makes it live.
  - Render the "Manage" link and the DM link inside `<Region id="automations">`.

**F-m7. The Timeline unlock and the region list need a small mechanism note.**
- N4 script actions have no conditions, so the cascade-end beat cannot express "unlock `timeline` if a chronicle entry exists".
- Story 4.4 (modules `core/chronicle`, `ui/features/timeline`) does not say how it learns that the cascade ended.
- N2 lists `channel.product` under "later" although it is now a cascade beat.
- *Fix:*
  - In 4.4, `core/chronicle` reacts to the cascade's last beat (or reads `script state = done`) and unlocks `timeline` when an entry exists; otherwise it unlocks at the next append.
  - Move `channel.product` into the "Garage cascade" list.

**F-m8. Backlog timer under other pause conditions is undefined.**
- The top-item timer runs in real time in `app/session`. No document says what it does when, during the queue:
  - the tab is hidden: FR22 says backlog items do not expire while away, and with active policies an absence would advance the company while the backlog exists;
  - Settings or the shortcut overlay opens.
- *Fix:*
  - In D1 and Story 3.8, the real timer pauses whenever another pause reason is active or the document is hidden.
  - Hiding the tab during the queue follows absence rules: the backlog stays and does not expire, and the queue resumes on return with a fresh top-item window.

**F-m9. Overlapping capacity offers are ambiguous.**
- The button "stays usable until used" and the offer repeats every 5 game days, but no rule covers:
  - whether earlier offer buttons stay live;
  - whether N and "+$X/day" are computed at offer time or at click.
- *Fix:* one live offer at a time. A repeat replaces the earlier button, which collapses to "Superseded". N and the price are recomputed at click (or frozen at offer time). Put this in GDD M4, FR9 and Story 3.3.

**F-m10. Capability-grant events can write two or three chronicle entries.**
- Story 4.4 AC1 appends an entry for "a completed event" **and** for "a capability grant".
- Story 4.5 AC3 writes "Day N · <grant> · you".
- Narrative Reference Event 3 has a `chronicle: true` effect on the grant outcome **and** an event-level `chronicle:` line.
- The result is duplicate Timeline rows and duplicate highlight candidates (FR60 picks heavy decisions first).
- *Fix:* one entry per event chain. The grant line (4.5) **is** the chain's line for heavy events. Drop `chronicle: true` from Reference Event 3, or define `chronicle: true` as "write the event's line now and suppress it at chain end".

**F-m11. Typed-parameter values have no generation rule.**
- D7 says "the core generates the values", but no document gives a range or scale for `money`, `count` or `percent` params.
- These include `amount`, `saved` and `legalCost` in Reference Events 1, 3 and 4, which drive cash effects and hence balance and the 7.1 trade-off warning.
- The D7 example also references `#billing`, which is not a channel, so it would fail the 7.1 "#channel resolves" check.
- *Fix:*
  - Params declare a range or scale, e.g. `amount: { type: money, min: 800, max: 2500 }` or `{ type: money, scale: mrr, pct: 20 }`, drawn from the `messages` / `deck` stream.
  - Fix the D7 example channel.

**F-m12. Documentation hygiene after v2.2.**
- Story 7.3 **Modules** still lists `content/events/garage/`, although its AC excludes Garage events.
- epics.md Final Validation has no v2.2 / D-E6 line.
- The architecture Revision History has no "Re-check fixes" entry.
- The epics frontmatter still cites GDD v1.2.
- *Fix:* update the four lines.

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK (narrow).**

- No critical issue.
- **One major** (F-M1), confined to version-pinning activation in Story 8.7 and its architecture text.
- **12 minors.**

The previous round's four majors are gone:

- N-M1, N-M2 and N-M3 are resolved;
- R-M1 shrank from a cross-document wording and mechanism problem to one internal contradiction plus a missing apply step.

Coverage is complete: 89/89 FRs, 19/19 NFRs, 50/50 UX-DRs.

If Tiziano accepts F-M1 as a story-creation task for 8.7, the set is effectively **READY WITH MINOR** for E1–E7.

**What can start now:**

- the Prerequisites (Tiziano);
- all of E1, including 1.9, whose save record now has `appVersion`;
- the 8.1 spike;
- 2.2, 7.1–7.3 and the rest of E2;
- E3.

**Fix before the relevant story:**

| Issue | Before |
|---|---|
| F-M1 | Story 8.7, and ideally before the first deploy to cohort testers (H2) |
| F-m6 | Story 2.12, which shows Automations in the H1 build |
| F-m7 | Story 4.4 |
| F-m8 | Story 3.8 |
| F-m9 | Story 3.3 |
| F-m4, F-m1, F-m5, F-m10, F-m11 | Stories 7.5 / 4.2 / 4.5 (E4); F-m11 also touches 2.3 |
| F-m2, F-m3, F-m12 | Any time; documentation only |

### Critical Issues Requiring Immediate Action

None.

### Recommended Next Steps

1. **Architecture D4 / D14 and Story 8.7:**
   - version detection via `version.json`;
   - apply step with reload before `newRun`;
   - activation-time guard;
   - 8.7 AC3 rewritten, plus the "start next loop after a deploy" e2e (F-M1).
2. **epics.md:**
   - 4.2 AC1 (F-m1);
   - FR7 (F-m2);
   - 7.5 slicing note (F-m4);
   - minimal Automations page in 2.12 (F-m6);
   - 4.4 mechanism (F-m7);
   - 3.8 pause rules (F-m8);
   - 3.3 overlap rule (F-m9);
   - 4.4 / 4.5 single chronicle entry (F-m10);
   - 7.3 Modules and Final Validation (F-m12).
3. **Architecture:**
   - N3 `throughput` shape and `askMetis` availability (F-m5);
   - N2 list (F-m7);
   - D1 backlog pause rules (F-m8);
   - D7 param ranges and example channel (F-m11);
   - Revision History (F-m12).
4. **GDD:**
   - Resources table and soft-caps line (F-m2);
   - M4 overlap rule (F-m9).
5. **Narrative:**
   - Reference Event 1 `throughput` shape (F-m5);
   - Reference Event 3 `chronicle: true` (F-m10);
   - param ranges (F-m11).
6. **Test design:** ECO-05, DEL-06, ABS-10 (F-m2, F-m3).
7. **Next step.** After F-M1 is written down, go straight to `gds-sprint-planning`. Another full readiness pass is not needed: the minors can be closed when their stories are created.

### Final Note

This final re-check assessed the 24 findings left open by the re-check:

- 21 are resolved;
- 3 are partially resolved (R-M1, N-m7, N-m8), with their residuals tracked as F-M1, F-m2, F-m1 and F-m5;
- 0 are still open.

It found 13 issues: 0 critical, 1 major (F-M1) and 12 minor (F-m1 to F-m12). Four of these carry residuals of the three partials above. **Open now: 0 critical, 1 major, 12 minor.**

The fixes introduced no hidden-state leak and no determinism break other than the pinning race in F-M1. The new forward dependencies are small: 2.12 → 3.1 (Automations) and 7.5 → E4 vocabulary.

**Choices made on the user's behalf (unattended run):**

- Selected [C] Continue at every menu.
- Used exactly the requester's document set, with game-test-design.md as supporting input.
- Kept the FR1–FR89 / NFR1–NFR19 inventory in epics.md as the requirement list.
- Rated F-M1 major because two documents give conflicting lifecycle instructions and the apply step must be guessed in a determinism-critical area. Everything else is minor because a reasonable agent can resolve it locally, or it only touches supporting or late material.
- Wrote this report to `implementation-readiness-report-2026-10-27-final.md`.
- Edited no other document.

*Assessor: gds-check-implementation-readiness, 2026-10-27 (final re-check).*
