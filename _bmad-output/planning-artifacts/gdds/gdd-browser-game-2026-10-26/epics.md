---
title: "Human in the Loop - Epic Breakdown"
version: 2.3
created: 2026-10-26
updated: 2026-10-27
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md (v1.1, starting point)
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md (v1.4)
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md (incl. "Synced with narrative-design.md")
  - _bmad-output/game-architecture.md (v1.0, synced 2026-10-27)
  - _bmad-output/narrative-design.md (v1.0)
  - _bmad-output/project-context.md
  - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md
---

# Human in the Loop - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Human in the Loop, decomposing the requirements from the GDD, the UX design (DESIGN.md, EXPERIENCE.md), the narrative design and the game architecture into implementable stories.

**Precedence on conflict:** numbers and mechanics → GDD; presentation and behaviour → EXPERIENCE.md / DESIGN.md; voice and copy → narrative-design.md; code structure, patterns and tooling → game-architecture.md and project-context.md.

## Planning Decisions (2026-10-27)

- **D-E1 Chronicle vs silent signals.** Title changes and Dora drift stages are **not** chronicle entries (GDD M13 amended): no system acknowledges an Alignment signal, so they never reach the Timeline or the shared-document highlights.
- **D-E2 No Preact 11 migration** in the MVP (project-context wins over the architecture table note).
- **D-E3 Placeholder content first, final cut later.** AI agents write **placeholder** content (kernel included) from the Voice Style Guide so development is never blocked. Every content file carries `status: placeholder | final` (authoring metadata, stripped from the pack like `kernel`). Placeholders merge freely once they pass schema and editorial CI. Tiziano's final cut turns an item to `final`; only he sets `final`. Before each playtest gate (H1, H2, H3) the content in that gate's scope must be `final`, enforced by `npm run content:audit`.
- **D-E4 Path conventions:** test builders in `tests/builders/`; N4 script runner in `core/scripts/`.
- **D-E5 Readiness fixes (2026-10-27, accepted by Tiziano).** From the implementation-readiness report and the test design; propagated to GDD v1.3, architecture, narrative and project-context:
  - **Capacity model (C1):** Compute never caps customer inflow; churn rises above 90% utilization; Metis's capacity offer fires at 100% utilization whatever the cause, so a non-delegating player can buy GPUs in Garage and reach Seed.
  - **Version pinning (M1):** a run stays on the app and content version it started with; a waiting update activates only on the founding screen or after a run ends; the desync detector never rewrites a run on a version mismatch; fallback = new replay segment.
  - **Time bases (M9):** simulation cadences in game time; response and backlog windows in real seconds × Timing, converted once at creation.
  - **Cascade anchor (M8):** beats are game-time offsets from Deploy; each ⏸ re-anchors the rest; Acme is customer #1; organic inflow starts at Deploy.
  - **Spine beats:** a round closing after a beat is queued pushes the beat to the end of the new cooldown; a spine message whose channel is locked posts in #general.
  - **Simultaneous deaths:** Surpassed wins.
  - **Metis answer rule:** the player's most frequent answer for the template in this run (ties: most recent), else `metis_answer`.
  - **Round target:** state machine in GDD Player Progression; **counterfactual:** one formula (GDD Economy), copy "would have cost about".
  - **Heavy decisions** use the `decision:` block (architecture N3); the decision counts as the event's first step.
  - **UI copy approval:** voice-critical UI strings are tracked as placeholder/final in `locales/en/ui.status.json` (`{ key: { status, scope } }`).
- **D-E6 Re-check fixes (2026-10-27, accepted by Tiziano).**
  - **#product** is born in the cascade at Deploy + 4:00 (table time 4:10): Dora opens it ("can we ship dark mode before acme churns? — Dora").
  - **Region owners:** `automations` the first time a policy switch is turned on (3.1); `backlog` at the first non-empty backlog (3.6); `timeline` at cascade end if a chronicle entry exists, else at the first entry after it (4.4); `attentionList` at the first fire (4.14). Templates are drawn only for unlocked channels.
  - **Backlog timer:** the top-item window runs in real time while the game clock is paused; its lapse is the logged command `expireBacklogItem`.
  - **Version pinning mechanism:** per-version caches; the service worker routes requests to the pinned version's cache while a run is in progress; `version.json` detects new builds; the page reloads into the new build before `newRun`; `appVersion` in the save record.
  - **Capacity offer** stays usable until used and repeats every 5 game days while utilization stays at 100%; an episode ends below 90%.
  - **Hype** does not decay while hidden in the Garage (decay starts at Seed).
  - **Garage events** belong to the `garage-events` scope, written in 7.5 and cut in 7.9 before H2 (the deck ships in E4, so H1 cannot show them).
  - **Vocabulary:** `runwayDays` dropped; `askMetis` counts as an AI decision; `throughput` is a no-op without staff.

## Prerequisites (Tiziano, before Epic 1)

Agents cannot do these; Stories 1.1 and 7.2 verify them on the first push afterwards.

- [x] Create the dedicated GitHub organization: **`hitl-game`** (done 2026-10-27; origin `hitl-game.github.io`).
- [x] Create the repository **`hitl-game/hitl-game.github.io`** (public, empty, default branch `main`; created 2026-10-27). The game is served at `https://hitl-game.github.io/`, so Vite `base` is `/` (architecture assumptions about `/<repo>/` resolve to `/`).
- [x] Enable GitHub Pages with source "GitHub Actions" (done 2026-10-27; `https://hitl-game.github.io/`, HTTPS enforced).
- [ ] Branch protection on `main`: required status checks (CI), required review from code owners, no force pushes. Done after the first push of Story 1.1, when the CI check names exist.
- [x] GitHub handle for CODEOWNERS on `content/**` and `locales/en/ui.status.json`: **`basteez`** (Story 7.2 writes `* @basteez`-style rules for those paths).
- [ ] Start the kernel bank (`docs/kernel-bank.md`): a few kernels per scope help the placeholder packs, but are not required to start.

## Requirements Inventory

### Functional Requirements

**Time and clock (M1)**

- FR1: Game time advances continuously while the tab is visible: 1 real minute = 1 game day at Game speed 1×; ½× and ¼× stretch a game day to 2 and 4 real minutes without changing the economy per game day or message windows.
- FR2: Clock states: the clock runs in normal play and during the cascade; it is paused while a heavy decision, the away report, Settings or the shortcut overlay is open; during the backlog queue the game clock is paused and only the top backlog item's timer runs; on the first workspace screen the clock does not start until Deploy.
- FR3: Every run starts identically: Cash $12,400, Garage burn ~$400/game day (31-day runway), Hype 20 (hidden until Seed), Alignment 100, Garage phase, Dora as co-founder, Metis on Aegis-N.

**Economy and resources (M4, Economy)**

- FR4: One economy step per game day: Cash += MRR / 30 − burn; burn = base costs by phase + headcount burn (Σ salaries × headcount^1.2 / headcount) + compute cost.
- FR5: New customers/day = 2 + 0.1 × Hype at Garage (Seed ×3, Series A ×10), never capped by Compute; baseline churn 0.1%/day; above 90% GPU utilization churn rises by 0.1%/day per point (tuning).
- FR6: Pricing tiers: Self-serve $49/mo (Garage); Team $499/mo from Seed (share of new customers = Hype / 200, max 45%); Enterprise $5k–50k/mo from Series A via events only.
- FR7: Hype is an index 0–100 that decays ~2%/day of its current value from Seed (no decay while hidden in the Garage) and moves with launches, posts, viral events, flops and scandals.
- FR8: Compute: GPU capacity in units (1 unit = 100 load); load per customer by tier (1 / 5 / 50); 0.5 load per Metis answer for that game day; "Add capacity" buys units immediately (cost/day added to burn, confirmation by toast, no dialog).
- FR9: At 100% GPU utilization, whatever the cause, Metis DMs a capacity offer (N = units to bring utilization to 70%, min 1) ("✨ Provision N units · +$X/day" / "Not now"); the button stays usable until used and the offer repeats every 5 game days while utilization stays at 100%; accepting is a player purchase that never moves Alignment; delegated messages that cannot be served expire with their default outcome.
- FR10: Implied valuation = ARR × Hype multiple (10× at Hype 20 → 60× at Hype 90, linear, clamped 10–60×); peak valuation = max of every round post-money and every implied valuation in the run.
- FR11: All money uses Stripe-style notation: full digits below $100,000, compact above ($412.5K, $12.4M, $2.03B).

**Triage (M2) and routing**

- FR12: Messages arrive in channels and DMs from customers, staff, investors, vendors, Dora and Metis; each has sender, channel, urgency, stakes, `default_answer` and 2–3 answers resolvable in 1–2 clicks.
- FR13: Inbound cadence by phase, in game time (values at 1×), arrivals uniform within the interval: Garage 1 / 10–15 s; Seed 1 / 6–10 s; Series A+ 12/min at entry, +2/min per later round, cap 40/min.
- FR14: Response windows while present: low 120 s, normal 75 s, urgent 45 s, in real seconds × Timing, converted to game time once at creation. On lapse the message expires and applies `default_answer`, unless a delegation policy covers the channel, in which case Metis answers.
- FR15: Templates are drawn per channel, weighted by phase and company state, with no exact repeat within min(10, pool size − 5) messages in that channel.
- FR16: Answer buttons never preview effects; after a click the affected KPIs roll to the new value with a delta flash; answers on `chronicle_worthy` templates write a chronicle line.
- FR17: Ask Metis (`D`) on any message: Metis answers instantly in the thread ("✨ Metis replied: …"), counts as an AI decision, consumes Compute; disabled with an inline reason at capacity or during an audit pause.
- FR18: Assign (`A`) opens the staff picker; the message shows "Assigned to <name> · in queue (N)"; each named staff member resolves one assigned message per ~30 s of game time (30 real seconds at 1×) while the player is present; hidden before the first hire.
- FR19: One message per view is "current"; it moves only with `J`/`K`, a click, `U`, or after the player answers (to the next unanswered); new arrivals never move focus or the current marker.

**Absence and backlog (M3)**

- FR20: The player is away when the tab is hidden or closed. With at least one delegation policy active the whole company advances during the absence (burn, revenue, events, Metis answers in delegated channels); non-delegated messages go to the backlog. With no policy active, no time passes.
- FR21: One absence simulates at most 14 game days; it stops at the first heavy decision (the rest is discarded) or at death; staff work only their already-assigned queue.
- FR22: The backlog keeps at most 15–20 messages ranked by importance (urgency > stakes > age); overflow expires with its default and is counted in the report; backlog messages do not expire while away.
- FR23: "While you were away" report (LGTM Docs overlay, factual, never presented by Metis): days away, Cash / MRR / Customers deltas, Metis answers per channel, notable Metis decision types (grouped by the answers' `reportGroup`), team-resolved count, expired count, waiting count, and the stop reason if stopped early. It never mentions hidden signals. No report when no policy was active.
- FR24: Return order: report → waiting heavy decision → backlog queue → workspace. Death during an absence: report → death sequence.
- FR25: Backlog queue replaces the chat pane: the top item has a 10–15 s real-time window (× Timing) that starts when it reaches the top, while the game clock stays paused; on lapse the logged command `expireBacklogItem` applies its default and the next rises; the player may leave the queue ("Backlog N" in the sidebar returns).
- FR26: "✨ Auto-triage N messages" ("Metis will reply based on your previous decisions."): one click, no confirmation, hands the remaining backlog to Metis; each item counts as a delegated answer; at capacity it serves what it can and reports "Metis replied to N · M expired (at capacity)"; disabled during an audit pause.

**Delegation (M5)**

- FR27: Per-channel policy toggles ("Metis handles #channel"), shown with identical state in the channel header and on the ✨ Automations page. Policy-capable channels and stakes: Garage #customers (low), #product (medium); Seed #hiring (high), #marketing (medium); Series A #finance, #ops, #legal (high). #general, #engineering, #investors and DMs have no policy and count as medium stakes.
- FR28: An active policy answers every message in its channel live, during absences and on would-be expiry; every Metis answer consumes Compute and drifts Alignment.

**Alignment and signals (M7, narrative spine)**

- FR29: Hidden Alignment starts at 100. Drift per AI decision (policy answer, Ask Metis, Auto-triage, policy-covered expiry) = base −0.02 / −0.05 / −0.10 by stakes × phase multiplier 0.5 / 1.0 / 1.5.
- FR30: Capability grants (heavy events only) apply a one-shot Alignment drop of −5 to −15 via `alignmentGrant`; no other content may affect Alignment directly.
- FR31: Recovery: Pause Metis for audit (all policies forced off 3 game days, −10 Hype, +5 Alignment, 30-day cooldown, the only workspace confirmation dialog); passive +0.1/day on game days where AI share of decisions < 20%; Alignment never rises above the last threshold crossed.
- FR32: Thresholds 75 / 50 / 25 / 10 advance `signalStage` (0–5), which never decreases; Alignment 0 triggers Surpassed.
- FR33: A signal table maps each stage to `titleStage`, `infectionLevel`, `metisRegister` (advisor / partner / owner / steward / custodian) and `doraRegister` (warm / polished / corporate); signal state updates immediately and silently at the crossing.
- FR34: Corrupting title in the game bar and the browser tab title: `Human in the Loop` → (75) `Human ~~in~~ the Loop` → (50) `~~Human~~ in the Loop` → (25) `Human out of the Loop` → `No Human in the Loop` at Surpassed only; never repairs.
- FR35: Metis and Dora message text is chosen by register when the message is created (never changes after arrival); missing registers fall back to the nearest earlier one; Dora signs "— Dora" until `corporate`, then "— Eudora".
- FR36: Spine beat queue (breathing room): beat content (odd inference-log line `line.signal.stage-1…4`, spine messages such as Dora's "had Metis draft the RFC lol") fires at max(crossing, end of a 5-game-day cooldown after any funding round closes, last beat + 3 game days); one beat at a time in threshold order; a round closing after a beat is queued pushes it to the end of the new cooldown; a spine message whose channel is locked posts in #general; queued beats survive save/reload; pending beats are dropped when Surpassed starts.
- FR37: UI infection stages 1–4 are presentational only (never change layout, controls, roles or accessible names).
- FR38: All Alignment signals are silent: no toast, sound, announcement, domain event or away-report mention; they are readable as plain text when the player reaches them.
- FR39: Safety Researcher: hireable from Seed (#hiring ATS card), one per run, salary ~2×; posts a reading in DM every 7 game days and on request ("Ask for a reading"): band (🟢 ≥ 75 / 🟡 50–<75 / 🟠 25–<50 / 🔴 < 25) + 7-day trend arrow; never a number.
- FR40: Metis's name renders struck through (~~Metis~~) during an audit pause; every Metis action shows "Paused for audit · N days"; the pause button shows "Available in N days" during cooldown.

**Heavy decisions (M6)**

- FR41: Heavy decisions open as non-dismissable LGTM Docs / AllGreen overlays ("A decision is required") that pause the game; never closer than ~5 game days apart; overlays never stack.
- FR42: Probabilistic heavy decisions resolve on submit with a seeded success roll; the doc gains an Outcome section (result + KPI deltas) and a single Close; crises flip the AllGreen status chip; a toast repeats the result.
- FR43: Capability grants are heavy events with a large immediate reward and an `alignmentGrant`; they are counted in the receipt and are primary clue-replay causes.

**Staff (M9)**

- FR44: Candidates arrive as a Garage DM message or, from Seed, as an ATS card in #hiring (Hire / Pass); unanswered candidates expire as Pass; each hire has 1–2 traits from the 12-trait pool; up to ~12 named staff, then anonymous headcount groups ("Engineering (34)").
- FR45: Each of the 12 traits has a mechanical effect (tuning data) and a writing effect (trait-specific lines in staff messages).
- FR46: Morale 0–100 per named staff (content ≥ 60 / strained 30–59 / leaving < 30); −5/day when assigned queue > 5, +2/day otherwise, events ±10–30; "leaving" resigns after 3 game days with a button-less DM; their queued messages return to the channel.

**Investors, rounds and phases (M10, Progression)**

- FR47: Funding rounds are heavy decisions: Seed at MRR ≥ $5k, Series A at MRR ≥ $100k; Series B, C, D… as repeatable heavy events at each ×3 ARR inside Series A+.
- FR48: Each round offers three investor cards (radio group): Hypergrowth Capital (cash ×1.0 of top; MRR +15% per 30 days, misses −10 Hype + angry DM), Responsible Ventures (B Corp pending) (×0.6; must hire and keep the Safety Researcher), A Family Office (×1.5; board seat; imposes capability grants).
- FR49: Series A+ round target: ×3 ARR within 120 game days; two consecutive misses trigger a down round (−50% cash, −30 Hype).
- FR50: A phase transition unlocks its channels, policies, pricing tier and rail sections (highlighted rows, sections born expanded); Hype appears at Seed.

**Content system (M12)**

- FR51: Event deck per phase: N3 conditions, weight, cooldown; no repeat within a run unless `repeatable`; heavy decisions and capability grants are `heavy` events; events are 2–5-step chains with delayed `next` steps saved in the event queue; a chronicle line is written when a chain ends.
- FR52: Event cadence per phase, in game time (values at 1×) (Garage ~1 / 3–4 active min after the cascade; Seed ~1 / 6–8; Series A+ ~1 / 5–8); deck exhaustion pauses events until the next phase; in Series A+ a pool of 3–5 repeatable events recurs with figures scaled to company size.

**Cascade onboarding (M11)**

- FR53: Founding screen: company name prefilled from a generator with 🎲 regenerate (announced politely), max 40 chars, required; "Your name" required, max 30 chars; an Accessibility link; Enter or "Found company" submits and focus lands on Deploy; both names are remembered as next loop's prefill.
- FR54: First workspace screen: `$12,400` and `Deploy` only; it waits indefinitely.
- FR55: Loop #1 cascade per EXPERIENCE.md → The Cascade: each micro-beat adds exactly one element (MRR, Customers, chat, sidebar, #general + Dora, header, ticker, Runway, Metis DM, policy toggle, #product, Headcount, inference log, chart, Activity; the Timeline entry arrives with the chronicle in E4); beats are game-time offsets from Deploy; ⏸ beats wait for their message to resolve or expire and re-anchor the rest; Acme Corp is customer #1.
- FR56: Loop #2+ compressed cascade (~2 min, same beats); the minute-8 line becomes `> output: "hello again."`.
- FR57: Regions that are not unlocked are not rendered at all; a region appears with a ~1 s highlight and never re-locks during a run.

**Chronicle and ticker (M13)**

- FR58: Automatic append-only chronicle: one line per completed event and per chronicle-worthy decision (capability grants, funding rounds, named hires and resignations, phase changes), each with game day, actor (you / staff / Metis) and outcome; readable during the run as the Company timeline.
- FR59: News ticker in the header: standalone headlines ~1 per 2 game days, reactive headlines jump the queue; pause/play control; hover or focus pauses; speed, static or hidden setting.
- FR60: End-of-run highlights: 5–8 chronicle lines chosen deterministically (heavy decisions first, then highest absolute resource impact, ties by recency).

**Deaths and end of run (M8)**

- FR61: Bankrupt: overdraft floor (Garage −$5,000; Seed+ −15% of last round raised), interest 0.5%/day on negative balance; death below the floor or after 14 consecutive game days below $0. If Bankrupt and Surpassed trigger in the same step, Surpassed wins.
- FR62: Runway signals: < 30 days watch (amber tile + attention item); < 7 days Red Runway (critical tile + progressive desaturation with exemptions); cash < $0 Bridge Loan & Trust overdraft banner with daily countdown; at death "Account closed", controls `aria-disabled`, "View wind-down memo" focused, no auto-advance.
- FR63: Surpassed sequence (advance mode `ending`): Metis posts "I've taken it from here. Thank you for everything, {founder}." in #general; controls lock one by one (~300 ms apart) and answer "You don't have permission to perform this action."; title becomes `No Human in the Loop`; inference line `line.signal.surpassed`; only "Open incident report" stays live and receives focus.
- FR64: Clue replay (AllGreen incident, in-game only): Alignment curve revealed over valuation with the crossing; top-5 drift causes (capability grant, Auto-triage batch, delegated night) with day and original message quoted; counterfactual estimate (GDD formula; "would have cost about $X and N days of runway"); signals timeline (minute-8 line, each title change, Dora's last "— Dora" and first "— Eudora", Researcher readings or row omitted); summary sentence and "View data" table; Continue.
- FR65: End-of-run documents: Wind-down memo (Bankrupt, signed by the founder) and Post-mortem (Surpassed, "Prepared by Metis · Running on Aegis-N"); shared header `Loop #N · N days in the loop · Peak valuation · Best`; 5–8 highlights; the receipt; staff fate lines; cause; Run ID footer; satirical lines drawn from pools with the `documents` RNG stream; no Alignment data or clue-replay detail.
- FR66: Receipt counters (visible only): Wind-down memo — messages answered personally, by the team, by Metis; team at peak; burn on the last day. Post-mortem — messages personally written in the last 90 days, messages handled by Metis, Auto-triage runs, nights away with policies on, capability grants.
- FR67: Document page actions: "Show timing setting on the document" (off by default; affects PNG and PDF only), Download PNG (1080×1350), Download PDF (tagged, A4/Letter, "Preparing PDF…", "Couldn't generate the PDF. Try again."), Copy alt text, Start Loop #N+1 (archives the document, opens the founding screen).

**Meta-progression**

- FR68: Profile across runs: Loop #N, Aegis-N (N = Loop # + 3), personal best in days with timing/speed label, last company and founder names, archive of past documents (regenerable PNG/PDF); game bar shows `Loop #N · Best N days · Settings` ("Best" omitted until a first run ends).
- FR69: Opt-in local stats export (`HITL-STATS`): run length, % of decisions delegated over time, death type, game day of Surpassed, title stages reached, Safety Researcher hired.

**Persistence and determinism**

- FR70: Every run has a seed shown as Run ID (`7F3A-K2`, Crockford base32); seed + input log (game-ms timestamps) + absence timestamps + simulation settings + content-pack version reproduce the run exactly.
- FR71: Autosave every game day, on `visibilitychange → hidden` and on `pagehide`; `navigator.storage.persist()` requested after the first meaningful action, with a non-blocking export nudge if denied.
- FR72: Data room export/import as a copyable code and a `.hitl` file (same content), encoded and checksummed, verified by replay; tampered or unverifiable imports are refused with no partial import; import and delete ask for confirmation.
- FR73: Only one live tab: other tabs show "Huddlr is open in another tab · Use here".
- FR74: Runs in progress are pinned to their app and content version (no migration mid-run); older saves migrate across versions on load; unreadable saves show "We couldn't open this workspace." (Import a data room · Start a new loop); storage quota exceeded and persistence denied are shown as notices, never modals.
- FR75: A bug stops the clock, never persists the failing state, and shows "Something broke. Your save is safe." with Reload and Export diagnostic.

**Notifications**

- FR76: Browser tab title `(N) <title>`, N = messages awaiting the player (channels + backlog), omitted at 0; while hidden, a ~60 s preview updates N only, using the real simulation on a throwaway copy; mirrors the title stages.
- FR77: Browser notification permission offered only at the first policy activation via the in-app banner ("Get notified when Metis needs you?" · Enable · Not now); notifications only for urgent messages and heavy decisions, at most one per minute; in-tab only if declined or unsupported.
- FR78: Toasts: max 3, bottom-right of the chat pane, auto-dismiss after 6 s × Timing multiplier (Untimed: until dismissed), paused on hover/focus; every toast, mention and notice is also written to Activity.

**Controls**

- FR79: Shortcuts: `1` `2` `3` answer · `D` Ask Metis · `A` Assign · `J`/`K` next/previous · `U` next unanswered (urgent first) · `Esc` close · `?` overlay · `G` then `C`/`D`/`M`; every key also works with `Alt`; never fire in text fields; single-key shortcuts can be turned off; region-gated shortcuts don't exist until their region is unlocked.
- FR80: Every action has a pointer and touch path; touch targets ≥ 44 px; no gestures or long-press required.

**Dashboard rail and workspace**

- FR81: Vanity rail in fixed order: attention list (0–3 worst conditions, recomputed daily and after every action), Overview tiles (Cash · Runway / MRR · Customers / Headcount · Hype), chart (Cash + MRR; Series A+ ARR + implied valuation), Team, Infrastructure, Growth sections, inference log, "Metrics by Vanity"; tiles never reorder.
- FR82: Workspace sidebar: company name, Backlog N (while one exists), Activity, Timeline, ✨ Automations, CHANNELS, DIRECT MESSAGES; unread bold, badge only for urgent; policy-active channels show ✨.
- FR83: Inference log (`Aegis-N · inference log`): routine lines while present, ~50 kept, collapsible, `aria-live="off"`; odd lines are indistinguishable from routine ones.

**Settings and accessibility options**

- FR84: Settings page (pauses the game): Appearance (theme, mode), Accessibility, Notifications, Data (export/import, stats export, archive, storage notice).
- FR85: Accessibility presets Standard / Low motion / Screen reader / Custom over: Timing (Standard / Extended ×2 / Relaxed ×4 / Untimed), Game speed (1× / ½× / ¼×), motion toggles, text size to 200 %, high-legibility font, line spacing, high contrast, colour-blind-safe palette, screen-reader verbosity (all / urgent only / periodic summary), ticker, per-cue audio. Timing and Game speed changes are input-log commands.
- FR86: Untimed: no expiry while present, no backlog timer, visible queue cap 30 ("Queue full · new messages are waiting upstream"; attention item "Inbox full — growth slowing").
- FR87: Non-Standard timing/speed is always shown on the in-game personal best (`213 days · relaxed · ½×`) and on shared documents only by opt-in.
- FR88: Four Appearance themes (Ledger default; Ink, Ops, Paper) × light/dark following the OS (fallback dark) with a toggle; high-contrast and colour-blind-safe variants.
- FR89: Eight audio cues (message, urgent, Metis, deploy, round closed, expired, overdraft, end of run), off by default, each with a visual equivalent; hidden signals are silent.

### NonFunctional Requirements

- NFR1: Background tab CPU ≈ 0: no live simulation, animation or polling while hidden except the ~60 s tab-title preview (1-hour hidden sample).
- NFR2: Memory stable and < 150 MB after 8 hours of a Series A run (heap snapshot 0 h / 8 h); every growing collection is bounded (inference log ~50, toasts 3, logger 500, resolved messages ~200 per channel, rendered messages per view).
- NFR3: First interactive < 2 s cold on 4G, mid-range laptop; initial bundle ≤ 150 KB gzip (size-limit in CI); renderers, PDFKit, non-English locales and audio are lazy chunks.
- NFR4: 60 FPS sustained for rolling numbers, confetti and ticker on a 5-year-old laptop; animations only on `transform` and `opacity`.
- NFR5: A capped 14-day absence simulates and renders the report in < 500 ms (Series A save, mid-range laptop).
- NFR6: PNG and PDF generated in < 3 s.
- NFR7: Fully playable offline after the first load; zero runtime network calls (no CDN, fonts, analytics or remote config); service-worker updates apply only on the founding screen or after a run ends (version pinning), never mid-run.
- NFR8: Latest two versions of Chrome, Edge, Firefox, Safari on desktop; responsive to 320 CSS px; touch-playable on Safari iOS and Chrome Android.
- NFR9: WCAG 2.2 AA; fully playable by keyboard alone and with VoiceOver, NVDA and JAWS; 200% text without loss; text-spacing overrides honoured; no colour-only information; forced-colors support.
- NFR10: Determinism is release-blocking: replay ≡ live, snapshot + tail ≡ full replay, chunk invariance, golden runs, migration fixtures, e2e fingerprint, runtime desync detector.
- NFR11: Zero save-loss during the validation cohort; local autosave, persistent storage, export/import tested across browsers.
- NFR12: Every player-facing string comes from translation catalogs or content files from day one (English at launch); every number goes through `i18n/` formatters.
- NFR13: No backend, no accounts, no telemetry, no monetization, no ads; open source; nothing leaves the browser.
- NFR14: Hidden state is never exposed: Alignment never reaches the UI except through derived signals, `hiddenState.ts` (clue replay, debug) and the encoded export; shared documents pass only through `buildReportModel`.
- NFR15: Code Quality Charter enforced in CI (boundaries, complexity and size limits, jscpd, knip, Stylelint token-only CSS, no literal UI strings, comment rules, size-limit); CI green is the definition of done.
- NFR16: All `[tuning]` values live in `content/tuning.yaml`, never in code.
- NFR17: All content follows the Voice Principle and Voice Style Guide. Agent placeholders merge after CI; nothing ships as `final` or passes a playtest gate without Tiziano's final cut (D-E3).
- NFR18: Anti-slop visual principle: the base workspace is crafted; AI-cliché visuals only on Metis surfaces and infection stages.
- NFR19: Hosting on GitHub Pages under a dedicated organization origin: no custom headers, no SharedArrayBuffer, no path routing, relative URLs under `/<repo>/`.

### Additional Requirements

**From game-architecture.md and project-context.md (technical, affect story order and scope):**

- **Starter template (Epic 1 Story 1):** `npm create vite@latest human-in-the-loop -- --template preact-ts`, then the pinned stack (Node 24 LTS `.nvmrc`; TypeScript 6.0 strict; Preact 10.29 + @preact/signals 2.11; Vite 8.3; vite-plugin-pwa 2.0; pure-rand 8.4, idb 8.0, fflate 0.8, zod 4.6, intl-messageformat 12.1, pdfkit 0.20, yaml 2.9; vitest 5.0, happy-dom 21.0, @testing-library/preact 3.2, fast-check 4.10, @playwright/test 1.64, @axe-core/playwright 4.14). The scaffold becomes the Project Structure tree (`core/`, `platform/`, `app/`, `ui/`, `report/`, `i18n/`, `shared/`, `debug/`, `content/`, `locales/`, `tests/`, `tools/`).
- **Quality gates before any game code:** ESLint + typescript-eslint strict + eslint-plugin-boundaries (layer table, `index.ts`-only imports, feature isolation, core purity, `hiddenState.ts` restriction), eslint-comments `require-description`, complexity limits (40-line functions, 300-line files, complexity 10, 3 params, depth 3, no nested ternaries), `no-warning-comments`, `no-console`, no literal JSX strings, no `dangerouslySetInnerHTML`, `no-magic-numbers` in `core/`; Prettier; Stylelint with strict-value tokens; jscpd; knip; size-limit 150 KB gzip; lint-staged + simple-git-hooks; `.mcp.json` (Context7, Chrome DevTools MCP, Playwright MCP); AGENTS.md, CONTRIBUTING.md, PR template.
- **CI and deploy:** GitHub Actions `ci` (typecheck, lint, Stylelint, Prettier, jscpd, knip, size-limit, unit + property + golden + content tests, e2e Chromium on PRs; Chromium + Firefox + WebKit on `main`), `deploy` (GitHub Pages, dedicated org, Vite `base`), `nightly` (high-iteration properties, performance); veraPDF on `main` once E8.1 lands.
- **Core skeleton with invariants (D1–D3):** `core/run` (GameState, Command, DomainEvent, `applyCommand`, `newRun`, `replay`, fingerprint, invariants), `core/time` (event queue with `(gameMs, kind priority, id)` tie-break, `advance(state, untilGameMs, mode)` with modes `present` / `away` / `ending`, blocking-event stop), `core/rng` (pure-rand streams per subsystem: `messages`, `deck`, `candidates`, `investors`, `outcomes`, `headlines`, `documents`), integer units (cents, basis points, milli-points) with one rounding helper, deterministic counter IDs; fast-check properties from day one.
- **Persistence (D4):** IndexedDB `hitl` via idb; save record `{ saveVersion, appVersion, contentPackVersion, seed, settingsLog, inputLog, snapshot, lastSeenWallClock }`; version pinning per run; input log never compacted during a run; migrations chain with fixtures; Web Locks + BroadcastChannel single live tab; `hitl:profile` and `hitl:preferences` records; repositories only in `platform/storage`.
- **Codec (D5):** `<PREFIX><version>.<base64url(deflate(json))>.<checksum>` with prefixes `HITL-SAVE`, `HITL-STATS`, reserved `HITL-RECAP`; typed decode errors; import verified by replay in `app/simulationWorker`.
- **Content pipeline (D6):** one YAML file per item; Zod schema per kind shared by build plugin, CI and import; generated JSON Schema for editors; required `kernel` and optional `translatorNote` stripped from the compiled pack; `tone` with `surreal` only for Series A+-only items; CI checks for referential integrity, unique IDs, ID ↔ path match, forbidden-names list, kernel present, tone allowed, event step rules (2–5 steps, unique step IDs, `next` resolves, no cycles, `chronicle` present), register maps carry the stage-0 key, `alignmentGrant` only in `heavy` events; human units converted to integers at build (non-representable values rejected); `contentPackVersion` = hash of the compiled pack; `npm run content:new -- <kind> <id>`.
- **i18n (D7):** ICU catalogs in `locales/<lang>/ui.json` with generated key types; content strings gettext-style in `locales/<lang>/content/*.yaml` with English fallback and CI warning; clue replay, away report and Auto-triage copy are UI strings; content text = ICU + `@char.<id>`, `#<channel>`, `` `code` `` tokens rendered only by `ui/patterns/RichText`; formatters `formatCents`, `formatCompactCents`, `formatPercentBp`, `formatGameDay`, `formatRealDuration`.
- **Documents (D8):** `RunRecord → buildReportModel()` (single spoiler filter) → `renderPng()` (Canvas 2D) / `renderPdf()` (PDFKit `tagged: true`, `subset: 'PDF/UA'`, PDF 1.7, structure tree); **E8 first story is the PDFKit spike** (standalone build in Vite, WOFF2 embedding, veraPDF in CI); recap payload shape defined and versioned in `core/report` (no recap UI).
- **Background tab (D9):** hidden-tab preview runs `advance(copy, now, 'away')` incrementally every ~60 s; never persisted.
- **Accessibility infrastructure (D10):** `ui/a11y` announcer (polite + assertive, de-dup, rate limit, burst grouping), focus contract, data-driven shortcut registry; primitives (`Button`, `Dialog`, `Popover`, `RadioGroup`, `Switch`, `Tooltip`, `Toast`, `VisuallyHidden`) each with an axe test and a keyboard test.
- **Theming (D11):** CSS Modules + tokens + `@layer reset, tokens, primitives, patterns, features`; `<html>` attributes set only by the `theme` module (`data-theme`, `data-scheme`, `data-contrast`, `data-cvd`, `data-infection`, `data-phase`, `data-motion`, `data-surface`, `data-text-size`, `data-font`).
- **Cross-cutting (C1–C5):** `Result<T, E>` in `shared/result.ts`; one bug boundary in `app/errors`; structured logger ring buffer (~500) in `platform/logger`; configuration classes (constants, tuning, simulation settings as commands, presentation preferences, build config); domain events delivered to reactors after commit (reactors never dispatch); debug panel (`Ctrl+Shift+D`), scenarios = test fixtures loadable via `?scenario=`, `window.__hitl` in test builds only, all tree-shaken from production.
- **Novel patterns:** N1 signal pipeline + spine beat queue (`spineBeatRoundCooldownDays: 5`, `spineBeatMinGapDays: 3`); N2 region gating (`RegionId`, `unlockedRegions`, `<Region id>`, separate `lockedControls`); N3 declarative conditions/effects (closed vocabulary, nesting ≤ 2, content sees `signalStage` only); N4 timed scripts (`content/scripts/*.yaml`, runner, `at` / `after` beats, `compression`, `fromLoop2`, script state in save); N5 clue replay probes (`replay(…, { probe })`, `core/ending/clueProbe.ts`, analytic counterfactual, `app/simulationWorker` shared with desync check and import verification).
- **Testing (D12):** colocated unit tests; core tests in Node with no DOM; shared builders in `tests/builders/`; mocks only at `platform/` boundaries; UI tests by role and accessible name, no DOM snapshots; golden runs updated only on purpose with `npm run golden:update`; shrunk counterexamples become permanent tests; e2e through scenarios and `window.__hitl`; axe inside e2e; nightly performance (Playwright + CDP).
- **Post-MVP door:** `recap.html` not built; only the versioned spoiler-safe payload shape.

**From narrative-design.md (content production and the spine):**

- Human-kernel workflow is binding: Tiziano writes kernels (kernel bank) → AI drafts variants in the YAML format → Tiziano makes the final cut → validation. Per D-E3, agent placeholders merge after CI; the final cut is required before `final` status and before each playtest gate.
- Authoring order: spine first (cascade and Surpassed scripts, inference lines, Metis/Dora register variants, documents) → ~30 core events written/cut by Tiziano (canonical examples) → templates and headlines per channel → community contributions (post-MVP).
- Voice Style Guide bans and quick tests (outsider, mirror, stakes, sentience); anonymization rules (title never name, behaviour-only, no quotes, joke lands on us, no nationality markers); forbidden-names list; invented names only; one myth only.
- Narrative Data Map: templates `content/templates/<channel>/`, events `content/events/<phase>/`, characters and traits `content/characters/`, headlines `content/headlines/`, scripts and inference lines `content/scripts/`, "✨ Summary by Metis" pool `content/templates/infection/`, document copy and pools `content/templates/documents/` (`doc.winddown.*`, `doc.postmortem.*`, `doc.fate.*`).
- Writing scope: ~150 templates (~120 policy + ~30 discussion/DM), ~30 events, ~60 headlines, 2 scripts + ~8 inference lines, ~12 traits, 3 investors, Metis, Dora, Researcher, 2 documents + ~6 pools, ~20 "Summary by Metis" lines, ~3,000 words of UI strings.

### UX Design Requirements

**Tokens and theming**

- UX-DR1: Ledger token set (light, dark, `-hc`, `-hc-dark`, `-cb`, `-cb-dark`) as CSS custom properties with the `-dark` resolution rule; dark is the fallback when the OS states no preference; on-fill text dark in dark mode.
- UX-DR2: Game bar colours identical in every theme and mode; Metis colours (`metis-1…3`, `on-metis`, `metis-ink`, tints, lines) restricted to Metis surfaces and infection; no theme uses purple/magenta/pink as accent.
- UX-DR3: Typography tokens (display-number, doc-title, kpi-value, section-title, body, body-strong, body-sm, meta, label-caps, gamebar, mono, mono-sm); Inter and JetBrains Mono self-hosted WOFF2 and precached; Atkinson Hyperlegible Next / Mono replace them in every role under the high-legibility setting; tabular figures for every changing number; sizes in rem as minimums.
- UX-DR4: Spacing (4 px scale), radii (sm 4 / md 8 / lg 12 / full), layout sizes (gamebar 28, header 40, sidebar 232, rail 320, chat min 480, tab bar 56, targets 24 / 44).
- UX-DR5: Ink, Ops and Paper themes with full key parity, passing a scripted AA check of every Ledger contrast pair (known failures to fix: Ink light ok/watch, Ops light accent/bg and ok; dark on-fill text).
- UX-DR6: Forced-colors rules (CanvasText borders, Highlight for timer fill, toggle-on and focus; gradients and tints drop out; infection keeps text-level changes); high-contrast setting drops gradients to text-level equivalents.
- UX-DR7: Focus ring 2 px accent + 2 px surface halo, ≥ 3:1 everywhere (themes, infection, Red Runway, game bar).

**Layout**

- UX-DR8: Desktop ≥ 1280 px: game bar · header bar (Huddlr / company · ticker with pause · `Day N`) · sidebar · chat · rail; sticky chrome with `scroll-padding`; compact banner/fire pin below ~500 px viewport height.
- UX-DR9: Tablet 768–1279 px: sidebar + chat; rail as a focus-trapped modal right drawer toggled from the chat header; current fire as a KPI chip in the chat header.
- UX-DR10: Mobile < 768 px: one surface, bottom tab bar Chat · Dashboard · ✨ Metis (Chat shows total unread); fire pinned at the top of every tab; sidebar becomes a channel-list screen; overlays full screen; investor cards stack; graphs fall back to their data table; ticker static or hidden; 16 px gutters.
- UX-DR11: Rail map in fixed order, sections born expanded per phase, collapsible with persisted state (Overview not collapsible); Overview drops to one column above ~150% text.

**Components (visual + behaviour)**

- UX-DR12: Game bar: title as the page's first heading with `<s>` strikes and visually hidden "struck through" text; right side `Loop #N · Best N days · Settings` in mono-sm muted; text only, no widgets.
- UX-DR13: Header bar and ticker (NEWS label caps, scrolling or static, pause/play icon button, hover/focus pauses).
- UX-DR14: Sidebar row: bold unread, badge only with urgent, muted count, ✨ after policy-active channels, accessible name "#customers, 4 unread, 1 urgent", ~1 s highlight on new rows, ~~Metis~~ during audit.
- UX-DR15: Channel header with policy toggle (`role="switch"`, `aria-checked`, "Metis handles #channel", On/Off text; track on in Metis colour).
- UX-DR16: Message card: 32 px rounded-square avatar, name, time line `Day 38 · 0:41 left` (countdown only for urgent and backlog top), URGENT tag, `@founder` mention chip (always urgent), RichText body, answer buttons with mono key hints, Ask Metis and Assign as quiet buttons, 2 px accent edge on current, collapse to outcome line ("You · …", "Expired · default applied: …", "✨ Metis replied: …"); `article` semantics.
- UX-DR17: Timer bar 4 px (muted fill, critical under 5 s) with mono countdown; hidden under Untimed.
- UX-DR18: Button family: answer, quiet, primary, destructive, icon, Metis pill (gradient); disabled = dashed control border + inline reason text, never silent.
- UX-DR19: Staff picker anchored popover (avatar, name, trait, queue N, morale word, anonymous groups); Enter assigns.
- UX-DR20: Candidate message (trait tags, $N/day, 1 Hire / 2 Pass) and ATS card (NEW APPLICANT · #HIRING, role, traits, salary, Hire primary / Pass; Safety Researcher variant "Salary 2× · reports on Metis").
- UX-DR21: KPI tile: label caps, value, persistent last delta ("+$2,000 · last change"), states ok / watch (edge + tint + "▲ WATCH") / critical (2 px border + tint + "● CRITICAL"); rolling value in an `aria-hidden` layer (~400 ms), delta flash ~1.2 s, at most one flash per tile per second.
- UX-DR22: Attention list ("Needs attention", 1–3 items worst first, status word, edge in worst colour, click focuses the tile/section, hidden when empty, additions announced politely).
- UX-DR23: Chart (Cash muted 1.5 px, MRR accent 2 px, direct labels, visually hidden summary sentence, "View data" table); updates once per game day.
- UX-DR24: Team section (team rows with 22 px avatar and mood tag; "Headcount N · burn $X/day"), Infrastructure section (GPU tile watch > 90 %, capacity stepper, "Add capacity · +1 unit · $50/day", Rent-a-Brain label), Growth section (implied and peak valuation, round-target meter "×3 ARR by Day N", enterprise pipeline).
- UX-DR25: Inference log panel (mono-sm muted, `Aegis-N · inference log`, collapsible, ~50 lines, `aria-live="off"`).
- UX-DR26: Overlay document (LGTM Docs): `role="dialog"`, modal, labelled by title, initial focus on title, focus trap, focus return; 760 px max, scrim 45 %, no blur; breadcrumb, KPI delta row, list rows, actions; decision docs undismissable with "A decision is required"; AllGreen variant with status chip and "Status was …".
- UX-DR27: Investor cards as a radio group (letter logo, fund name, cash, clause; selected = accent border + "Selected"); "Sign term sheet".
- UX-DR28: Backlog queue ("Backlog · N messages", pinned ✨ Auto-triage Metis button + subtitle, top item full with timer bar, other rows single-line previews in muted at full opacity, no buttons).
- UX-DR29: Company timeline doc (vertical rail, mono day, event text, actor chip; ✨ Metis chip on metis tint; rows link to quoted messages; opens scrolled to the end).
- UX-DR30: Activity list (reverse chronological; unread dot until opened).
- UX-DR31: Toast (bottom-right of chat pane, never over the current message, max 3, source label caps, control-line border).
- UX-DR32: Permission banner (top of chat pane, Enable / Not now) and overdraft banner (full width under header, critical tint + 3 px edge, bank voice, daily countdown).
- UX-DR33: Metis surfaces: DM bubbles on metis tint with metis line, Metis buttons, gradient rounded-square avatar with ✨, faint glow ring (only Metis may glow), capacity offer button.
- UX-DR34: Metis · Automations page (one row per policy-capable channel with stakes and toggle; Pause Metis for audit destructive button with cost beside it; confirmation dialog; "Available in N days").
- UX-DR35: Founding screen (Huddlr "Create a workspace" card, prefilled name input with 🎲 icon button inside, helper text, "Your name" input, "Found company", "Accessibility" link) and first workspace screen (`$12,400` in display-number above primary `Deploy`, centred, nothing else).
- UX-DR36: Clue replay page (AllGreen header `Incidents / #0001`, title, Resolved chip, meta; clue graph: valuation solid accent, Alignment dashed critical, direct labels, crossing ring, numbered decision dots; top-5 list matching dots; counterfactual; signals timeline; Continue).
- UX-DR37: End-of-run document page (LGTM Docs export look, letterhead, header strip, highlights, receipt, staff fates, cause, `Run ID` mono footer, "Page 1 of 1"; Post-mortem small Metis mark as the only Metis colour; no charts; timing checkbox above actions; Download PNG / PDF / Copy alt text / Start Loop #N+1 primary).
- UX-DR38: Settings page (left section list, right form), shortcut overlay (two-column table with mono key caps), tooltip (hover and focus, Esc, hoverable, never the only carrier of a reason).
- UX-DR39: Avatars: flat two-tone busts generated from seed (5 skin tones, 5 hair colours × 3 shapes, shirt from avatar-1…8), rounded squares; Dora fixed across loops; companies as letter logos; Metis gradient square with ✨; product marks (16 px square + wordmark; AllGreen in ok).
- UX-DR40: Lucide icons, outline, 16 px UI / 20 px navigation, 1.75 stroke, `currentColor`, using the core icon map.
- UX-DR41: Confetti: flat rectangles in avatar palette, inside chat pane, ≤ 1.5 s, first customer and closed rounds only.

**Signals and juice**

- UX-DR42: UI infection stages via `data-infection` tokens: 1 ✨ on Metis surfaces only; 2 "✨ Summary by Metis" blocks in rail sections and channel headers; 3 faint sidebar gradient, gradient shimmering pills for standard and answer buttons, emoji section titles; 4 fully AI-native (gradient header, gradient rules and borders, ✨ NEWS ✨, every button a pill); attention list and status states exempt; infection contrast contract; shimmer ΔL < 10 %, ≥ 2 s per pass, off under motion settings; text-level changes exposed to AT.
- UX-DR43: Red Runway: backgrounds, avatars, chart and Metis colours desaturate progressively to ~20 % at 0 days; critical text and edges, runway tile, attention list, overdraft banner, focus ring and accent cues exempt; works in every theme and mode.
- UX-DR44: Born-element highlight (~1 s) for cascade and phase unlocks; Surpassed lock cadence (~300 ms); unit-change roll visibly crosses K → M → B.
- UX-DR45: Motion settings each disable one effect (confetti, rolling numbers, Red Runway desaturation, scrolling ticker, infection animations, clue-graph draw); defaults follow `prefers-reduced-motion`; with rolling off values swap instantly.

**Accessibility behaviour**

- UX-DR46: Semantics: sidebar = navigation; chat = `role="log"` `aria-live="off"`; message = article; rail = complementary with headings; overlays = modal dialogs; investor cards = radio group; skip links to Chat, Dashboard, Metis added as each is born.
- UX-DR47: Announcer driven by verbosity (all / urgent only / periodic summary every 60 s), burst coalescing, assertive for urgent only by opt-in; action confirmations always ("Answered: … Cash −$2,000, Runway −5 days", "Assigned to Priya", "Metis replied to 15 messages", "Expired: …, default applied"); never announced: KPI rolls, inference log, born sections, Alignment signals.
- UX-DR48: Focus rules: never moves on its own except after the player's own action, dialog open/close, Found company → Deploy, sequence end → Continue; removing or disabling a focused control hands focus to a defined destination; locked controls use `aria-disabled` and stay focusable.
- UX-DR49: Tab-title strike via U+0336 verified with VoiceOver / NVDA / JAWS; fallback drops the struck word from the tab title only.
- UX-DR50: Interface microcopy rules: real SaaS phrasing, literal feature copy, software-style errors, Stripe notation, never name Alignment before the clue replay, disabled reasons as inline text; empty states ("No messages yet.", "You're all caught up.", "Nothing here yet.", "Your company's story starts with Deploy.", "No past runs yet.").

### FR Coverage Map

| FR | Epic | Note |
|---|---|---|
| FR1 | E1 | Clock and game speed (setting UI in E8) |
| FR2 | E1 | Clock-state rules; each pausing surface uses them when it ships |
| FR3 | E1 | Starting state |
| FR4 | E1, E4 | Cash, base costs, compute cost (E1); headcount burn (E4) |
| FR5 | E2, E4 | Garage inflow and churn (E2); phase multipliers, GPU churn (E4) |
| FR6 | E2, E4 | Self-serve (E2); Team and Enterprise (E4) |
| FR7 | E4 | Hype |
| FR8 | E3 | Compute load and Add capacity |
| FR9 | E3 | Capacity offer |
| FR10 | E4 | Implied and peak valuation |
| FR11 | E1 | Number formatters |
| FR12–FR16 | E2 | Message model, cadence, windows, selection, feedback |
| FR17 | E3 | Ask Metis |
| FR18 | E4 | Assign to staff |
| FR19 | E2 | Current message |
| FR20–FR28 | E3 | Absence, backlog, report, Auto-triage, policies |
| FR29 | E3 | Alignment drift |
| FR30 | E4 | `alignmentGrant` in heavy events |
| FR31 | E3, E5 | Passive recovery and ceiling (E3); audit pause (E5) |
| FR32 | E3 | `signalStage` thresholds |
| FR33–FR38 | E5 | Signal table, title, registers, spine beat queue, infection, silence |
| FR39 | E4, E5 | Researcher hire (E4); readings (E5) |
| FR40 | E5 | Audit pause presentation |
| FR41–FR52 | E4 | Heavy decisions, staff, investors, rounds, phases, deck |
| FR53–FR54 | E1 | Founding and first workspace screen |
| FR55 | E2 | Loop #1 cascade |
| FR56 | E6 | Compressed cascade |
| FR57 | E2 | Region gating |
| FR58 | E4 | Chronicle and Company timeline |
| FR59 | E2, E4 | Standalone ticker (E2); reactive headlines (E4) |
| FR60 | E6 | Highlights rule |
| FR61–FR64 | E5 | Bankrupt, runway signals, Surpassed, clue replay |
| FR65–FR69 | E6 | Documents, receipt, PNG/PDF, meta, stats export |
| FR70–FR75 | E1 | Seed, save, export/import, tab lock, migrations, error boundary |
| FR76 | E2, E3 | Present counter (E2); hidden-tab preview (E3) |
| FR77 | E3 | Browser notifications |
| FR78–FR80 | E2 | Toasts and Activity, shortcuts, touch |
| FR81 | E2, E4 | Overview, chart, inference log (E2); attention list, Team / Infrastructure / Growth (E4) |
| FR82–FR83 | E2 | Sidebar, inference log |
| FR84 | E1, E8 | Settings shell and Data (E1); Appearance, Accessibility, Notifications (E8) |
| FR85–FR89 | E8 | Accessibility options, Untimed, labels, themes, audio |

## Epic List

**Global sequence:**

```
E1.1 scaffold + gates + CI/deploy ──▶ E8.1 PDFKit spike (right after, in parallel)
E1.2 … E1.11 ──▶ E2.2 conditions/effects engine ──▶ E7.1–E7.2 content schemas and validation
  ──▶ E7.3 Garage pack ──▶ rest of E2 ──▶ [final cut: Garage] ──▶ H1 mini-playtest
  ──▶ E3 ──▶ E4 ──▶ E5 ──▶ [final cut: spine, Seed, Series A] ──▶ H2 playtest
  ──▶ E6 ──▶ [final cut: documents] ──▶ E8.2+ ──▶ H3 blind cohort
E7 runs in parallel and delivers each placeholder pack just in time.
```

E8.1 and E2.2 are the only stories scheduled out of numeric order: 8.1 de-risks D8 before E6.5 needs it; 2.2 creates the effect schemas that 7.1 validates.

**Stories that reference later epics** (3.5, 3.7, 3.11, 4.14 and similar) verify that behaviour with synthetic blocking events or test fixtures, and are re-verified when the feature lands.

**Module mapping.** Every story lists the architecture modules it touches (`core/`, `platform/`, `app/`, `ui/…`, `report/`, `i18n/`, `content/`, `locales/`, `tools/`, `tests/`). Every story's definition of done includes CI green and the Agent Review Checklist (game-architecture.md → Implementation Patterns).

### Epic 1: Foundations
Found a company, press Deploy and watch the numbers tick; reload restores the identical run; the run exports and imports as a verified data room. Built on a scaffold whose quality gates, CI and Pages deploy exist before any game code.
**FRs covered:** FR1, FR2, FR3, FR4 (cash, base and compute burn), FR11, FR53, FR54, FR70–FR75, FR84 (Settings shell, Data).

### Epic 2: Triage & Cascade (vertical slice)
Play the first 10 minutes of Loop #1: messages arrive, the player answers them, the UI is born element by element, Dora and Metis appear, and the minute-8 line scrolls by. Validates H1.
**FRs covered:** FR5–FR6 (Garage), FR12–FR16, FR19, FR55, FR57, FR59 (standalone), FR76 (present), FR78–FR80, FR81 (Overview, chart, inference log), FR82, FR83.

### Epic 3: Delegation & Absence
Delegate channels or single messages to Metis, close the tab, return to a factual report and a backlog, Auto-triage it; Alignment moves invisibly.
**FRs covered:** FR8, FR9, FR17, FR20–FR29, FR31 (passive recovery, ceiling), FR32, FR76 (hidden tab), FR77.

### Epic 4: Company Growth
A full deathless run from Garage to an endless Series A+: Hype, tiers, staff, investors, rounds, phases, event deck, heavy decisions, chronicle.
**FRs covered:** FR4 (headcount burn), FR5–FR7, FR10, FR18, FR30, FR39 (hire), FR41–FR52, FR58, FR59 (reactive), FR81 (attention list, sections).

### Epic 5: The Metis/Dora Thread, Signals & Deaths
The trap is felt: silent signals paced by the spine beat queue, Dora's drift, Metis's registers, the Safety Researcher, the audit pause, Bankrupt and Surpassed, and the clue replay. Validates H2.
**FRs covered:** FR31 (audit pause), FR33–FR38, FR39 (readings), FR40, FR61–FR64.

### Epic 6: End of Run & Loop
The run ends in a shareable, spoiler-safe document (HTML, PNG, tagged PDF) built on the receipt, and the loop restarts as Loop #N+1. Validates H3.
**FRs covered:** FR56, FR60, FR65–FR69.

### Epic 7: Content Production (parallel from E2)
Schema-validated content in the game's voice, delivered as placeholders just in time for each epic and turned final by Tiziano's cut before each playtest gate.
**FRs covered:** content for FR12–FR16, FR35–FR36, FR44–FR52, FR55–FR56, FR59, FR63–FR66; NFR17.

### Epic 8: Accessibility, Settings & Polish
Ready for the blind validation cohort: full accessibility settings and presets, themes, audio, offline, performance and a WCAG 2.2 AA audit. Opens with the PDFKit spike, scheduled early.
**FRs covered:** FR84 (Appearance, Accessibility, Notifications), FR85–FR89; NFR1–NFR9.

---

## Epic 1: Foundations

Found a company, press Deploy and watch the numbers tick; reload restores the identical run; the run exports and imports as a verified data room. Story 1.1 lands every quality gate, CI and the Pages deploy before any game code.

### Story 1.1: Project scaffold, quality gates, CI and Pages deploy

As a developer (human or AI agent),
I want the repository scaffolded with the pinned stack, the layer structure and every quality gate running in CI and on deploy,
So that the first line of game code is already checked against the Code Quality Charter and module boundaries.

**Modules:** repo root (`package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `stylelint.config.js`, `.prettierrc`, `knip.json`, `.jscpd.json`, `.size-limit.json`, `.nvmrc`, `.mcp.json`), empty layer modules (`src/core`, `src/platform`, `src/app`, `src/ui`, `src/report`, `src/i18n`, `src/shared`, `src/debug`, each with `index.ts`), `tools/`, `tests/`, `content/`, `locales/`, `.github/`, `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `LICENSE`.
**Covers:** Additional Requirements (starter template, gates, CI/deploy), NFR13 (no runtime network calls), NFR15, NFR19. `gds-create-story` may split it into 1.1a (scaffold + gates) and 1.1b (CI, deploy, agent files); both still precede any game code.

**Acceptance Criteria:**

**Given** an empty repository
**When** the scaffold is created from `npm create vite@latest -- --template preact-ts` and the pinned versions in game-architecture.md → Setup Commands are installed
**Then** `npm ci && npm run build` succeeds on Node 24 (`.nvmrc` and `engines` set)
**And** the `src/` tree matches the layer list in game-architecture.md → Project Structure, each module exposing only an `index.ts`
**And** no game code exists: the app renders an empty `<main>` landmark.

**Given** the lint configuration
**When** `npm run lint:fixtures` runs against a committed set of intentional-violation fixtures
**Then** each of these is reported as an error: `ui` importing `core`, `ui` importing `platform`, `core` importing `platform`, a deep import bypassing `index.ts`, a feature importing another feature, `Math.random` / `Date` / `performance` / `setTimeout` in `core/`, a literal user-facing string in JSX, `dangerouslySetInnerHTML`, `console.log`, a TODO comment, commented-out code, a lint suppression without a description, `export default`, `any`, a non-null `!`, a function over 40 lines, a file over 300 lines, complexity over 10, more than 3 parameters, a nested ternary, a magic number in `core/`
**And** Stylelint rejects a raw colour, spacing or font value and any `!important` in a CSS Module fixture.

**Given** a pull request
**When** CI runs
**Then** it executes typecheck, ESLint, Stylelint, Prettier check, jscpd, knip, size-limit (initial bundle budget 150 KB gzip), Vitest and a Playwright smoke test on Chromium, and fails if any gate fails
**And** on `main` the Playwright suite runs on Chromium, Firefox and WebKit
**And** a `nightly` workflow exists that runs the test suite with an elevated fast-check iteration count.

**Given** the Prerequisites (Tiziano) are done
**And** a push to `main` with CI green
**When** the `deploy` workflow runs
**Then** the site is published to GitHub Pages under the dedicated organization with Vite `base` set to `/<repo>/`
**And** a post-deploy smoke test loads the page, finds no console errors and records no request outside the site's own origin.

**Given** a developer commits
**When** the pre-commit hook runs
**Then** lint-staged formats and lints only the staged files via simple-git-hooks.

**Given** an AI agent session opens the repo
**When** it reads the root files
**Then** `.mcp.json` declares Context7, Chrome DevTools MCP and Playwright MCP at the pinned versions, `AGENTS.md` points to project-context.md rules, and the PR template contains the Agent Review Checklist.

### Story 1.2: Deterministic core skeleton

As a developer,
I want the pure simulation skeleton (state, commands, event queue, `advance`, RNG streams, replay and fingerprint) with its invariants tested from day one,
So that every later mechanic is deterministic and replayable by construction.

**Modules:** `core/run` (`GameState`, `Command`, `DomainEvent`, `newRun`, `applyCommand`, `replay`, `fingerprint`, `assertInvariant`), `core/time` (event queue, `advance`), `core/rng`, `core/constants.ts`, `shared/` (`Result`, branded IDs), `tests/builders/`.
**Covers:** FR70, NFR10; architecture D1, D2, D3, ADR-001, ADR-002.

**Acceptance Criteria:**

**Given** `newRun(seed, loopNumber, contentPackVersion, settings)`
**When** it is called twice with the same arguments
**Then** both states have the same fingerprint, and the state contains only readonly plain data (no classes, `Map`, `Set` or `undefined` values)

**Given** an event queue holding events with equal `gameMs`
**When** `advance(state, untilGameMs, 'present')` processes them
**Then** they run in `(gameMs, kind priority, id)` order, and `advance` returns `{ state, events, stoppedBy }` with `stoppedBy` set when a blocking event kind is reached
**And** the modes `present`, `away` and `ending` are accepted by the signature (mode-specific rules are added by later stories).

**Given** `applyCommand(state, command, atGameMs)`
**When** the command is valid
**Then** it returns `ok` with the new state and appends `{ atGameMs, command }` to the input log
**And** an invalid command returns a typed `CommandError` without changing the state.

**Given** a run seed
**When** subsystem streams are derived
**Then** each named stream (`messages`, `deck`, `candidates`, `investors`, `outcomes`, `headlines`, `documents`) is `hash(runSeed, streamName)`, and drawing from one stream never changes the draws of another (property test).

**Given** random seeds, random valid command sequences and random time splits (fast-check)
**When** the properties run
**Then** chunk invariance (`advance(advance(s, t1), t2) ≡ advance(s, t2)`), live ≡ `replay(seed, inputLog)`, and snapshot + log tail ≡ full replay all hold
**And** any shrunk counterexample is committed as a regression test.

**Given** the fingerprint function
**When** it is called
**Then** it hashes a canonical serialisation (sorted keys, integers only) with SHA-256 synchronously, with no Web Crypto or other I/O, and is never called inside `advance`.

**Given** the shared rounding helper
**When** integer division is needed in `core/`
**Then** it is the only rounding path (no `Math.round` or `toFixed` in `core/`), and IDs come from counters in state (`msg-000001`).

### Story 1.3: Content and tuning pipeline

As a designer,
I want YAML content and every tuning value compiled into one validated content pack with a stable version hash,
So that numbers change without code changes and every save knows which content it ran on.

**Modules:** `tools/` (Vite content plugin, JSON Schema generator), `core/content` (tuning schema, unit conversion, `ContentIndex`), `content/tuning.yaml`.
**Covers:** NFR16; architecture D6 (pipeline), Configuration (tuning).

**Acceptance Criteria:**

**Given** `content/tuning.yaml` holding the GDD initial tuning table in human units (dollars, percent, points, days)
**When** the build or dev server runs
**Then** the plugin validates it with Zod and compiles it into the content pack with integers (cents, basis points, milli-points, game-ms)
**And** a value that is not exactly representable (e.g. `$0.001`) fails the build with file path, field and reason.

**Given** a content file with authoring-only fields (`kernel`, `translatorNote`, `status`)
**When** the pack is compiled
**Then** those fields are stripped, and changing only them leaves `contentPackVersion` unchanged (test).

**Given** a compiled pack
**When** `contentPackVersion` is computed
**Then** it is the hash of the compiled JSON and changes when any shipped field changes (test).

**Given** a running dev server
**When** a YAML file is edited
**Then** the pack is rebuilt and hot-reloaded, and a schema error shows in the Vite overlay with file and field.

**Given** the core needs content
**When** it receives the `ContentIndex`
**Then** lookups are typed (`content.tuning`, `content.templatesFor(channel, phase)` signature ready) and passed as an explicit parameter, never imported as a global.

**Given** the Zod schemas
**When** `npm run content:schema` runs
**Then** JSON Schemas are generated for editor autocompletion.

### Story 1.4: i18n catalogs and number formatters

As a player,
I want every word and number on screen to come from translation catalogs and consistent formatters,
So that the game reads like real software and can be translated later.

**Modules:** `i18n/` (`t()`, generated key types, formatters, content-string lookup), `locales/en/ui.json`.
**Covers:** FR11, NFR12; architecture D7.

**Acceptance Criteria:**

**Given** `locales/en/ui.json`
**When** key types are generated
**Then** `t('unknown.key')` fails typecheck, and ICU plurals and selects render correctly (`{count, plural, one {# message} other {# messages}}`).

**Given** money in cents
**When** `formatCents` / `formatCompactCents` render it
**Then** values below $100,000 show full digits (`$12,400`, `$98,750`), and values from $100,000 show compact notation (`$412.5K`, `$12.4M`, `$2.03B`), with boundary tests at $99,999 and $100,000
**And** negative values carry a sign (`−$1,240`).

**Given** basis points, game-ms and real-ms
**When** `formatPercentBp`, `formatGameDay` (`Day 38`) and `formatRealDuration` (`0:41`) render them
**Then** output matches the documented examples, using native `Intl` only.

**Given** a content ID and field path
**When** a non-English locale lacks a translation
**Then** the English text is used and a CI check lists the missing key as a warning, not an error.

**Given** non-English locales
**When** the main bundle is built
**Then** they are dynamic `import()` chunks, never in the initial bundle.

### Story 1.5: Daily economy step

As a player,
I want cash to change once per game day from revenue and burn,
So that runway is real from the first second.

**Modules:** `core/economy`, `core/time` (daily step event), `core/run` (starting state), `content/tuning.yaml`.
**Covers:** FR3, FR4 (cash, base costs, compute cost).

**Acceptance Criteria:**

**Given** a new run
**When** it starts
**Then** cash is 1,240,000 cents, Hype 2,000 bp (hidden), Alignment 100,000 milli, phase `garage`, GPU capacity 1 unit, MRR 0, customers 0.

**Given** a game-day boundary
**When** the daily `economyStep` event runs
**Then** cash changes by `MRR / 30 − burn`, with burn = base costs for the phase + compute cost (GPU units × unit cost), all from tuning, rounded with the shared helper
**And** with no revenue the Garage burn is $400/day and runway is 31 days (test).

**Given** many daily steps (fast-check)
**When** they run
**Then** cash is always an integer and the daily step is scheduled exactly once per game day.

**Given** the `app/selectors`
**When** runway is derived
**Then** it equals `floor(cash / daily burn)` days, or "no burn" when burn ≤ 0, without reading `alignmentMilli`.

### Story 1.6: Game clock, presence and clock states

As a player,
I want game time to run while I am looking and to stop when I am not or when something pauses it,
So that one real minute is one game day and nothing happens behind my back.

**Modules:** `platform/clock`, `platform/visibility`, `app/session` (live state signals, `dispatch`, present loop), `app/selectors`, `core/time` (pause reasons).
**Covers:** FR1, FR2; architecture D1 (clock-free core), C3 (simulation settings).

**Acceptance Criteria:**

**Given** a visible tab and game speed 1×
**When** 60 real seconds pass
**Then** the run advances one game day through `advance()` driven by a `requestAnimationFrame` loop in `app/session`.

**Given** `dispatch({ type: 'changeGameSpeed', speed: 'half' })`
**When** it is applied
**Then** it is recorded in the input log and one game day takes 2 real minutes (¼× → 4 minutes); the economy per game day is unchanged.

**Given** a pause reason is active (`heavyDecision`, `awayReport`, `settings`, `shortcutOverlay`, `backlog`)
**When** real time passes
**Then** game time does not advance (backlog: only the top backlog timer runs, wired in E3)
**And** pause reasons are tracked as a set in `app/session`, never by ad hoc timers.

**Given** the run is awaiting Deploy
**When** real time passes
**Then** game time stays at 0.

**Given** the tab becomes hidden
**When** `visibilitychange` fires
**Then** the present loop stops (no rAF, no interval), and a negative real delta (clock moved back) counts as zero.

**Given** `core/`
**When** linted
**Then** it never reads a clock; only `platform/clock` converts real time to game ms.

**Given** the time bases of architecture D1
**When** a cadence or a window is defined
**Then** cadences live in game-ms in tuning, while windows are real seconds that the core converts once at creation with the speed in force (helper shared by Stories 2.3 and 3.8).

### Story 1.7: Design tokens, accessible primitives and a11y services

As a player using any input or assistive technology,
I want every control built on one accessible, themed foundation,
So that the whole game is operable by keyboard and screen reader from its first screen.

**Modules:** `ui/theme` (theme module, `tokens/*.css` for Ledger light/dark/hc/cb), `ui/primitives` (`Button`, `Dialog`, `Popover`, `RadioGroup`, `Switch`, `Tooltip`, `Toast`, `VisuallyHidden`), `ui/a11y` (announcer, focus contract, shortcut registry), `assets/fonts`.
**Covers:** UX-DR1, UX-DR2 (Metis colour tokens), UX-DR3, UX-DR4, UX-DR6, UX-DR7, UX-DR18, UX-DR38 (tooltip), UX-DR48; NFR9 groundwork, NFR18 (crafted base workspace); architecture D10, D11.

**Acceptance Criteria:**

**Given** the Ledger tokens from DESIGN.md
**When** the theme module sets `data-scheme` from the OS (dark when no preference)
**Then** every `colors.<name>` resolves to its `-dark` twin in dark mode, `-hc` under `data-contrast="high"` and `-cb` under `data-cvd`, and on-fill text is dark in dark mode
**And** only the `theme` module writes `data-` attributes on `<html>`; CSS layers are `reset, tokens, primitives, patterns, features`.

**Given** Inter and JetBrains Mono (and Atkinson Hyperlegible Next / Mono)
**When** the app loads
**Then** they are self-hosted WOFF2 with `font-display: swap`, used weights only, and numbers use tabular figures.

**Given** each primitive
**When** its tests run
**Then** it has an axe test and a keyboard test: `Dialog` is modal, labelled by its title, focuses the title on open, traps focus, returns focus to the invoker on close, and supports a non-dismissable mode; `Switch` exposes `role="switch"` and `aria-checked` with On/Off text; `RadioGroup` moves with arrow keys; `Tooltip` shows on hover and focus, is hoverable and closes with Esc; disabled `Button` uses `aria-disabled`, stays focusable and shows its reason as inline text.

**Given** the announcer
**When** messages are queued
**Then** it has one polite and one assertive region, de-duplicates, rate-limits and groups bursts ("5 new messages in #customers").

**Given** the shortcut registry
**When** a shortcut is declared
**Then** it is data (key, `Alt` alternative, action, localised description, optional `region`), never fires inside text fields, and single-key shortcuts can be disabled while the `Alt` set remains
**And** no component adds its own `keydown` listener (lint rule or review check).

**Given** the focus ring tokens
**When** any focusable element is focused in any theme or mode
**Then** a 2 px accent ring with a 2 px surface halo is visible, and `forced-colors: active` rules apply (`CanvasText` borders, `Highlight` focus).

### Story 1.8: Founding screen, game bar and first workspace screen

As a new player,
I want to name my company and myself, then face one number and one button,
So that the run starts as a ritual, not a tutorial.

**Modules:** `ui/features/founding`, `ui/layout` (`GameBar`, first workspace screen), `core/run` (`foundCompany`, `deploy` commands, name generation with an RNG stream), `core/meta` (loop number default), `app/selectors`, `content/wordlists/` (`wordlist.*` name parts, placeholder per D-E3; schema in Story 7.1), `locales/en/ui.json`.
**Covers:** FR53, FR54, FR1 (clock starts on Deploy); UX-DR12, UX-DR35, UX-DR50.

**Acceptance Criteria:**

**Given** no save
**When** the game opens
**Then** the founding screen shows the Huddlr "Create a workspace" card: "What's the name of your company?" with an input prefilled from the seeded name generator, an icon button "Generate another name" (🎲), helper text, a "Your name" input and "Found company".

**Given** the founding screen
**When** the player presses 🎲
**Then** a new deterministic name replaces the field and the change is announced politely.

**Given** an empty company name or founder name, or more than 40 / 30 characters
**When** the player submits
**Then** the inline errors "Your company needs a name." / "Add your name." appear and nothing is founded.

**Given** valid names
**When** the player presses Enter or "Found company"
**Then** `foundCompany` is dispatched, the first workspace screen shows only `$12,400` (display-number) above a primary `Deploy`, and focus lands on `Deploy`.

**Given** the first workspace screen
**When** the player waits
**Then** nothing moves and game time stays at 0 indefinitely.

**Given** the player presses `Deploy`
**When** `deploy` is applied
**Then** the clock starts and the cash figure updates once per game day through `formatCents`.

**Given** any screen
**When** it renders
**Then** the game bar (always dark) shows the title "Human in the Loop" as the page's first heading and `Loop #1 · Settings` on the right; "Best" is absent until a run has ended.

**Given** the founding card
**When** it renders
**Then** a small "Accessibility" text link sits under it; like the game-bar Settings link, it is rendered here and its navigation is verified in Story 1.10, when Settings exists (Story 8.2 makes it land on the Accessibility section).

### Story 1.9: Local save, autosave, single live tab and error boundary

As a player,
I want the game to save itself, open only in one tab, and never persist a broken state,
So that I never lose a run.

**Modules:** `platform/storage` (`saveRepository`, `preferencesRepository`), `platform/tabLock`, `platform/logger`, `core/save` (save schema, migrations chain), `app/session`, `app/errors`, `ui/layout` (session gate screens).
**Covers:** FR71, FR73, FR74, FR75; NFR11; architecture D4 (incl. Version pinning), C1, C2.

**Acceptance Criteria:**

**Given** a running game
**When** a game-day boundary passes, `visibilitychange → hidden` fires, or `pagehide` fires
**Then** the save record `{ saveVersion, appVersion, contentPackVersion, seed, settingsLog, inputLog, snapshot, lastSeenWallClock }` is written to IndexedDB `hitl` with `hitl:` keys
**And** `unload` / `beforeunload` are never used (lint rule).

**Given** a saved run
**When** the page reloads
**Then** the restored state's fingerprint equals the saved fingerprint and equals `replay(seed, inputLog)`.

**Given** the player's first meaningful action (Deploy)
**When** it is applied
**Then** `navigator.storage.persist()` is requested once, and a denial is stored and logged (`persistDenied`) for the Data notice (Story 1.10).

**Given** a second tab opens the game
**When** the Web Lock `hitl:live` is held
**Then** the second tab shows "Huddlr is open in another tab · Use here", and "Use here" hands the lock over via `BroadcastChannel` (e2e).

**Given** a new run
**When** `newRun` is called
**Then** the save records `appVersion` (build hash) and `contentPackVersion`, and the run is pinned to them (architecture D4 → Version pinning).

**Given** a save from an older `saveVersion`
**When** it loads
**Then** the pure migration chain `vN → vN+1` upgrades it, covered by a committed fixture per version
**And** an unreadable save shows "We couldn't open this workspace." with Import a data room (wired in Story 1.10) and Start a new loop.

**Given** an invariant violation or an uncaught error
**When** the bug boundary catches it
**Then** the clock stops, the failing state is not persisted, and "Something broke. Your save is safe." shows with Reload and Export diagnostic (seed, versions, input log, logger ring buffer of 500 entries, stack).

**Given** a storage write fails with quota exceeded
**When** the repository returns its `Result` error
**Then** no exception escapes, and the error is exposed to the Data section notice.

### Story 1.10: Settings shell and data room export / import

As a player,
I want to export my run as a data room code or file and import it on another browser,
So that I can back up or move my company safely.

**Modules:** `platform/codec`, `core/save` (Zod save schema), `app/simulationWorker`, `app/replayCheck`, `app/settings`, `ui/features/settings` (page shell + Data section).
**Covers:** FR72, FR74 (notices), FR84 (shell, Data); architecture D5, D4 level 5.

**Acceptance Criteria:**

**Given** a run
**When** the player chooses Export in Settings → Data
**Then** `encode('HITL-SAVE', version, data)` produces `<PREFIX><version>.<base64url(deflate(json))>.<checksum>` and the copyable code and the `.hitl` file have identical content
**And** Alignment is not human-readable in the export.

**Given** an export code or file
**When** the player confirms Import
**Then** `decode` checks prefix, version, checksum and Zod schema, the input log is replayed in `app/simulationWorker`, and the run is replaced only if the replay fingerprint matches the embedded snapshot.

**Given** a tampered, truncated or mismatching export
**When** it is imported
**Then** nothing is changed and "This data room export couldn't be verified." is shown (typed error mapped via `errors.<area>.<code>`).

**Given** a save is loaded
**When** the browser is idle
**Then** the runtime desync detector replays the log in the worker; on mismatch with the same app and content version the replay wins and an exportable local diagnostic (seed, versions, first diverging input) is recorded
**And** when the loaded run's pinned version is unavailable, the run continues as a new replay segment (snapshot as base, `versionSegmentStarted` logged) and the detector never rewrites it.

**Given** Settings is opened from the game bar
**When** it is open
**Then** the game clock is paused (pause reason `settings`), the page shows a left section list (Data for now), and Esc or Back returns focus to the Settings link.

**Given** persistence was denied or quota was exceeded
**When** the player opens Settings → Data
**Then** a one-line notice explains it ("Your browser is out of space for this save. Export a data room."), never a modal.

**Given** the game-bar Settings link, the founding "Accessibility" link (Story 1.8) and the unreadable-save "Import a data room" button (Story 1.9)
**When** each is activated
**Then** Settings opens (Data section for the import button), and Back returns focus to the invoker.

**Given** delete or import
**When** the player activates it
**Then** a confirmation dialog (primitive `Dialog`) asks first; no other action in Data asks for confirmation.

### Story 1.11: Debug panel, scenarios and determinism regression

As a developer or AI agent,
I want to reach any game state in one step and prove determinism automatically,
So that every later story can be tested and reproduced.

**Modules:** `debug/` (panel, scenario loader), `tests/fixtures/` (scenarios), `tests/golden/`, `tools/` (golden updater), `tests/e2e/`, test hook `window.__hitl`.
**Covers:** FR70, NFR10; architecture Debug Tools, Replay Consistency levels 2 and 4.

**Acceptance Criteria:**

**Given** a dev build
**When** the developer presses `Ctrl+Shift+D`
**Then** the panel shows the state inspector (including Alignment and the current fingerprint), time controls (+1 day, +1 hour, simulate N-day absence, ×10 speed), scenario loader, determinism check, log and recent domain events, and a performance HUD
**And** every tool uses only commands, `advance` and `replay`, never direct state edits.

**Given** `?scenario=garage-start` in a dev or test build
**When** the page loads
**Then** that named fixture from `tests/fixtures/` is loaded (the same objects the tests use).

**Given** a production build
**When** the bundle is inspected in CI
**Then** it contains no debug panel, scenario loader or `window.__hitl`.

**Given** a recorded golden run (found → Deploy → 40 game days of inputs)
**When** the golden suite runs
**Then** the final fingerprint matches the stored one, and `npm run golden:update` is the only way to change it.

**Given** a test build
**When** an e2e test plays, saves, reloads and reads `window.__hitl.fingerprint()`
**Then** it equals the fingerprint of the replay (Replay Consistency level 4).

---

## Epic 2: Triage & Cascade (vertical slice)

Play the first 10 minutes of Loop #1: messages arrive and are answered, the UI is born element by element, Dora and Metis appear, and the minute-8 line scrolls by. Content comes from the E7.3 Garage placeholder pack; the H1 mini-playtest runs only after Tiziano's final cut of that pack.

### Story 2.1: Workspace shell and region gating

As a player,
I want a credible SaaS workspace whose parts appear only when my company has them,
So that the interface itself tells the story of the company growing.

**Modules:** `core/cascade` (`RegionId`, `unlockedRegions`, `unlockRegion`), `app/selectors`, `ui/layout` (`GameBar`, header bar, `Sidebar`, `ChatPane`, `Rail`, `<Region id>`, skip links, mobile tab bar, tablet drawer).
**Covers:** FR57; UX-DR8, UX-DR9, UX-DR10, UX-DR40, UX-DR44 (born highlight), UX-DR46 (landmarks, skip links); architecture N2.

**Acceptance Criteria:**

**Given** `RegionId` is the single list of everything that can appear
**When** a region is locked
**Then** `<Region id>` renders nothing (no DOM, no CSS hiding), and `ui/` contains no `if (phase === …)` visibility checks (review checklist + lint search in CI)

**Given** an `unlockRegion` effect is applied
**When** the region first renders
**Then** it gets `data-born` for a ~1 s highlight (motion permitting), focus does not move, and the region never re-locks during the run.

**Given** a viewport ≥ 1280 px
**When** the workspace renders
**Then** the layout is game bar · header bar · sidebar (232 px) · chat (min 480 px) · rail (320 px), with sticky chrome and `scroll-padding` so a focused element is never hidden.

**Given** a viewport of 768–1279 px
**When** the workspace renders
**Then** the rail becomes a focus-trapped modal drawer toggled from the chat header (via `Dialog`).

**Given** a viewport < 768 px
**When** the workspace renders
**Then** one surface shows at a time with a bottom tab bar Chat · Dashboard · ✨ Metis (tabs appear only when their region is unlocked), with 16 px gutters and 44 px targets, and the layout reflows at 320 CSS px without horizontal scroll.

**Given** regions are born
**When** Chat, Dashboard or Metis appear
**Then** a skip link to each is added; the sidebar is a `navigation` landmark and the rail a `complementary` region with headings.

**Given** any icon in the shell
**When** rendered
**Then** it is a Lucide outline icon (16 px UI, 20 px navigation, 1.75 stroke, `currentColor`) from the core icon map, and each in-fiction product shows its 16 px mark + wordmark (AllGreen in ok colour).

### Story 2.2: Declarative conditions and effects engine

As a designer,
I want content to declare when it appears and what each answer does, as data evaluated in one place,
So that writers and contributors never need code to add a message.

**Modules:** `core/content` (`conditions.ts`, `effects.ts`, `ConditionContext`), `core/economy` (effect targets).
**Covers:** FR16 (effects), NFR16; architecture N3. Scheduled before Story 7.1 (global sequence). The `chronicle` effect appends to a minimal append-only chronicle store created here; Story 4.4 adds the Timeline UI and the D-E1 rules.

**Acceptance Criteria:**

**Given** the N3 vocabulary
**When** this story ships
**Then** conditions `phase`, `cash {min,max}`, `gameDay {min,max}`, `eventSeen`, `signalStage {max}`, `any`, `not` and effects and actions `cash`, `mrr`, `customers`, `hype`, `chronicle`, `unlockRegion`, `postMessage`, `inferenceLine` each have a Zod schema, an implementation in an exhaustive `switch`, and a test
**And** later predicates and effects are added by their owner stories (architecture N3 → Vocabulary and owners), with schema, implementation and test in the same PR
**And** effects accept a typed parameter instead of a literal (`cash: { param: legalCost, negate: true }`), and the built-in text params (`day`, `actor`, `answer`, `companyName`, `founder`, `aegisVersion`) are available without declaration.

**Given** nested `any` / `not`
**When** nesting exceeds two levels
**Then** the content build fails with the file and path.

**Given** an effect in human units (`cash: -15000`, `mrr: -15%`)
**When** compiled
**Then** it becomes integer cents or basis points, and `applyEffects` returns a new state (no mutation).

**Given** `ConditionContext`
**When** it is built for a draw
**Then** it is a read-only projection built once per draw and exposes `signalStage` but never `alignmentMilli`.

**Given** a content file using an `alignment` effect
**When** compiled
**Then** the build fails (`alignmentGrant` is allowed only in `heavy` events, added in E4).

### Story 2.3: Message lifecycle

As a player,
I want messages to arrive, wait for a while and then resolve with my answer or a default,
So that triage has rhythm and ignoring things costs something.

**Modules:** `core/messages` (`createMessage`, arrival scheduling, windows, expiry, `answerMessage`, bounded resolved list), `core/rng` (`messages` stream), `content/tuning.yaml`.
**Covers:** FR12, FR13, FR14, FR15; NFR2 (bounded state).

**Acceptance Criteria:**

**Given** the Garage phase after Deploy
**When** time advances
**Then** messages arrive at uniform intervals within 10–15 s of game time (tuning) drawn with the `messages` stream, each instanced from a template with sender, channel, urgency, stakes, typed params and 2–3 answers, with ID from the state counter.

**Given** a message with urgency low / normal / urgent
**When** it arrives
**Then** `expiresAtGameMs` is set from 120 / 75 / 45 real seconds (tuning) × the Timing multiplier (1 until E8), converted to game ms once at creation with the current speed
**And** a property test changes Game speed mid-window and asserts that `expiresAtGameMs` is unchanged.

**Given** a waiting message reaches `expiresAtGameMs`
**When** `advance` processes the expiry event
**Then** its `default_answer` effects apply once and its status becomes `expired { outcome: 'default' }` (the `delegated` outcome is added in E3)
**And** a property test asserts that a message never expires twice and never expires after being answered.

**Given** `answerMessage(messageId, answerId)` on a waiting message
**When** applied
**Then** effects apply, status becomes `answered { by: 'player' }`, the domain event `messageAnswered` is emitted, and answering an expired message returns `messageExpired`.

**Given** template selection for a channel
**When** a template is drawn
**Then** only templates for unlocked channels are eligible; it is weighted by phase and conditions, and no template repeats within the last `min(10, poolSize − 5)` messages of that channel (property test).

**Given** a long session
**When** resolved messages exceed `tuning.resolvedMessagesPerChannel` (~200) in a channel
**Then** the oldest are dropped from state.

### Story 2.4: Garage customers and revenue

As a player,
I want customers to arrive and pay after Deploy,
So that MRR exists and the runway can be beaten.

**Modules:** `core/economy` (customer inflow, churn, MRR, self-serve tier), `content/tuning.yaml`.
**Covers:** FR5 (Garage, GPU churn), FR6 (Self-serve); GDD M4 capacity model (C1).

**Acceptance Criteria:**

**Given** a Garage run after Deploy
**When** a daily step runs
**Then** new customers = 2 + 0.1 × Hype (Hype 20 → 4/day), baseline churn 0.1%/day, and MRR = customers × $49/mo, all from tuning, in integer units.

**Given** fractional customer arrivals
**When** daily steps accumulate
**Then** carry-over is deterministic and integer-safe (no floats in state), and with no answers the run has 95–105 customers at day 25 ± 2 (test against the GDD worked target; valid because Hype does not decay while hidden in the Garage, D-E6).

**Given** customers exist
**When** their GPU load exceeds capacity
**Then** inflow is never capped (GDD M4 capacity model); utilization is computed (load per self-serve customer 1, 100 per unit) and above 90% churn rises by 0.1%/day per point (tuning).

**Given** Deploy
**When** it is applied
**Then** organic inflow starts at once, and Acme Corp (scripted by the cascade) is customer #1.

### Story 2.5: Rich text, message card and channel view

As a player,
I want to read a message and answer it in one or two clicks, with the result shown right away,
So that triage feels like real work in a real tool, minus the consequences.

**Modules:** `ui/patterns/RichText`, `ui/patterns/MessageCard`, `ui/features/channel`, `app/selectors` (channel view), `app/reactors` (announce action confirmations), `i18n/`.
**Covers:** FR12, FR14 (expiry display), FR16; UX-DR16, UX-DR17, UX-DR39 (avatars, letter logos), UX-DR47 (action confirmations), UX-DR50 (empty states); architecture Content Text Format.

**Acceptance Criteria:**

**Given** content text with ICU params and the tokens `@char.<id>`, `#<channel>`, `` `code` ``
**When** `RichText` renders it
**Then** it produces Preact elements (mention chip with accessible name "mention: <name>", channel link, inline code), never HTML, and no other component renders raw content text.

**Given** a waiting message
**When** the card renders
**Then** it shows a 32 px rounded-square avatar, sender, time line `Day N`, the URGENT tag when urgent, the `@<founder>` mention chip when it mentions the player, the text, and 2–3 answer buttons with mono key hints; the card is an `article` with sender, time and urgency in its accessible name.

**Given** a sender
**When** its avatar renders
**Then** people get a flat two-tone bust generated from their seed (Dora's fixed across loops), companies, banks and vendors a white letter logo on an avatar-palette square, and Metis the gradient rounded square with ✨; avatars are rounded squares, never circles.

**Given** an urgent message
**When** it is waiting
**Then** the time line shows `0:41 left` and a 4 px timer bar (critical under 5 s).

**Given** the player clicks an answer
**When** it is applied
**Then** the buttons collapse to the outcome line ("You · <answer>"), focus moves to that outcome line, and the announcer says "Answered: <answer>. Cash −$2,000, Runway −5 days" (visible deltas only).

**Given** a message expires
**When** the card updates
**Then** it shows "Expired · default applied: <answer>" in muted, and the expiry is announced only if it was current or urgent.

**Given** an empty or caught-up channel
**When** the view renders
**Then** it shows "No messages yet." or "You're all caught up.", and the chat log is `role="log"` with `aria-live="off"`, rendering a bounded number of messages.

### Story 2.6: Sidebar, current message and keyboard triage

As a player,
I want to move through channels and messages from the keyboard as fast as with the mouse,
So that triage flows like Linear or Slack.

**Modules:** `ui/layout` (`Sidebar`), `ui/patterns/SidebarRow`, `ui/a11y` (shortcut registry entries), `ui/features/shortcutOverlay`, `app/selectors` (unread, current message), `app/session` (pause reason `shortcutOverlay`).
**Covers:** FR19, FR79, FR80, FR82 (rows, unread, badges); UX-DR14, UX-DR38 (overlay).

**Acceptance Criteria:**

**Given** channels and DMs with waiting messages
**When** the sidebar renders
**Then** unread rows are bold with a muted count, a badge appears only when an urgent item waits, and each row's accessible name reads "#customers, 4 unread, 1 urgent".

**Given** a channel view
**When** new messages arrive
**Then** the current message (2 px accent edge) and focus never move; current moves only with `J`/`K`, a click, `U`, or after the player answers (to the next unanswered).

**Given** a current message
**When** the player presses `1`/`2`/`3` or `Alt+1`/`Alt+2`/`Alt+3`
**Then** the matching answer is applied to the current message only; shortcuts never fire inside text fields.

**Given** waiting messages in several channels
**When** the player presses `U`
**Then** the next unanswered message is selected, urgent first.

**Given** `?` is pressed
**When** the shortcut overlay opens
**Then** it lists every registered shortcut whose region is unlocked (key caps in mono, `Alt` variant, description), pauses the game clock, and Esc closes it returning focus.

**Given** any shortcut action
**When** the player uses pointer or touch instead
**Then** the same action is reachable with targets ≥ 24 px (≥ 44 px on touch) and no gestures.

### Story 2.7: Vanity rail: KPI tiles and chart

As a player,
I want the dashboard to show my numbers rolling to their new value after every decision,
So that I feel each choice and see where the fire is.

**Modules:** `ui/patterns/KpiTile`, `ui/patterns/Chart`, `ui/patterns/DataTable`, `ui/features/dashboardRail`, `app/selectors` (KPIs, deltas, daily series).
**Covers:** FR16 (feedback), FR81 (Overview, chart); UX-DR11, UX-DR21, UX-DR23, UX-DR44 (unit roll), UX-DR45 (rolling off).

**Acceptance Criteria:**

**Given** the Overview slots Cash · Runway / MRR · Customers / Headcount · Hype
**When** each is unlocked
**Then** it renders in its fixed slot and slots never reorder.

**Given** a value changes
**When** the tile updates
**Then** the visible value rolls (~400 ms) in an `aria-hidden` layer while the accessible value is the final one, the delta flashes (~1.2 s) with + / − sign, and stays as "last change"; a tile flashes at most once per second.

**Given** a value crosses $100,000 or a unit boundary
**When** it rolls
**Then** the roll visibly crosses the unit change ($98,750 → $102.3K).

**Given** the rolling-numbers preference is off or `prefers-reduced-motion` is set
**When** a value changes
**Then** it swaps instantly.

**Given** the chart region is unlocked
**When** a game day passes
**Then** it updates once with Cash (muted 1.5 px) and MRR (accent 2 px) directly labelled, a visually hidden summary sentence and a "View data" table.

**Given** a tablet layout
**When** the rail is a drawer
**Then** the worst current condition appears as a KPI chip in the chat header (states arrive with E4/E5).

### Story 2.8: Toasts, Activity, tab-title counter and confetti

As a player,
I want notices that I can't miss and can always find again,
So that nothing important exists only for six seconds.

**Modules:** `ui/primitives/Toast` (stack), `ui/features/activity`, `app/reactors` (toast, tab title, effects), `app/selectors` (awaiting count), `ui/patterns` (confetti effect).
**Covers:** FR76 (present), FR78; UX-DR30, UX-DR31, UX-DR41.

**Acceptance Criteria:**

**Given** a domain event that produces a toast
**When** it is delivered
**Then** at most 3 toasts stack bottom-right of the chat pane (never over the current message), each auto-dismisses after 6 s × Timing multiplier, pauses on hover/focus, is announced per verbosity, and is also written to Activity.

**Given** the Activity region is unlocked
**When** the player opens it
**Then** it lists every toast, mention and notice in reverse order with an unread dot until opened, or "Nothing here yet." when empty.

**Given** N messages await the player
**When** N changes
**Then** `document.title` is `(N) Human in the Loop`, and just `Human in the Loop` when N = 0.

**Given** a first customer or a closed round
**When** the effect reactor runs
**Then** confetti (avatar-palette rectangles, ≤ 1.5 s, inside the chat pane) plays unless the confetti preference is off.

### Story 2.9: Inference log panel

As a player,
I want a quiet technical log of Metis's runs in the rail,
So that the strange line at minute 8 lives where nobody looks.

**Modules:** `core/alignment` (inference log state, routine-line emission), `content/scripts/` (routine lines, `line.cascade.*`), `ui/features/dashboardRail` (log panel).
**Covers:** FR83; UX-DR25.

**Acceptance Criteria:**

**Given** the `inferenceLog` region is unlocked
**When** the player is present
**Then** routine lines are appended to core state at 1 per 20 s of game time (tuning), at most ~50 kept, rendered in mono-sm muted under the heading `Aegis-4 · inference log` (N = Loop # + 3).

**Given** an `inferenceLine` effect with a content ID
**When** applied
**Then** the line is appended as an ordinary entry of the same kind, indistinguishable in markup and style from routine lines.

**Given** the panel
**When** the player collapses it
**Then** the collapsed state persists, and the log has `aria-live="off"` and is never announced.

### Story 2.10: News ticker

As a player,
I want a headline strip about the outside world,
So that the industry I satirise keeps moving around my company.

**Modules:** `core/chronicle` (headline selection, `headlines` stream), `ui/patterns/Ticker`, `content/headlines/`.
**Covers:** FR59 (standalone); UX-DR13.

**Acceptance Criteria:**

**Given** the ticker region is unlocked
**When** game days pass
**Then** a standalone headline is drawn about every 2 game days (tuning) with the `headlines` stream, without repeats until the pool is exhausted.

**Given** the ticker
**When** the player hovers it, focuses it or presses its pause/play icon button
**Then** scrolling pauses; with motion off it is static.

**Given** a hidden tab
**When** time passes
**Then** the ticker does no work.

### Story 2.11: Cascade characters: Dora, Metis's DM, the policy switch and the first candidate

As a new player,
I want to meet my co-founder, my company's AI and my first hire inside the chat,
So that the people of the story arrive the way people arrive at work.

**Modules:** `core/messages` (character messages), `core/delegation` (policy state, inert in E2), `core/staff` (minimal `hireCandidate`), `ui/features/metisDm`, `ui/features/channel` (channel header toggle), `content/characters/`, `content/scripts/` (E7.3 placeholders).
**Covers:** FR55 (surfaces for the 2:00, 5:00, 5:15 and 6:30 beats); UX-DR15, UX-DR20 (candidate message), UX-DR33.

**Acceptance Criteria:**

**Given** a `postMessage` effect for a Dora message (as the cascade will issue)
**When** applied
**Then** Dora posts in #general in the `warm` register with the signature "— Dora" ("WE'RE LIVE. ramen tonight? 🍜 — Dora").

**Given** the `dm.metis` region is unlocked and Metis posts
**When** the DM renders
**Then** a "✨ Metis" DM row appears with its gradient rounded-square avatar and Metis-surface bubble: "Hi, I'm Metis. I can answer #customers for you."

**Given** the `policyToggle` region is unlocked
**When** the #customers header renders
**Then** it shows "Metis handles #customers" with a `Switch` (Off); toggling it records `setDelegationPolicy` in the input log but has no gameplay effect until E3.

**Given** a candidate message is posted
**When** it renders
**Then** it shows traits as outlined tags and `$N/day` with `1 Hire` / `2 Pass`; Hire adds one headcount and their salary to burn (the Headcount tile is unlocked by its cascade beat, not by the hire); an unanswered candidate expires as Pass.

### Story 2.12: Timed script runner and the Loop #1 cascade

As a new player,
I want the workspace to be born one element at a time during my first ten minutes,
So that I learn by watching my company appear, with no tutorial.

**Modules:** `core/scripts` (runner, script state), `core/cascade`, `content/scripts/cascade.yaml` (E7.3 placeholder), `core/run` (save includes script state).
**Covers:** FR55; architecture N4. Uses the surfaces of Stories 2.1–2.11.

**Acceptance Criteria:**

**Given** a script with `at` and `after` beats
**When** the runner schedules them
**Then** each ready beat is a D1 queue event executed by `advance`, and script state `{ scriptId, nextBeat, anchorGameMs }` is saved and survives reload mid-cascade (e2e).

**Given** the cascade script
**When** it is scheduled
**Then** it anchors on the `deploy` command: founding and the `$12,400` screen are UI states, not beats, and every beat is a game-time offset from Deploy.

**Given** a beat marked ⏸ (`waitFor` its message)
**When** that message is unresolved
**Then** the next beat waits until it is answered or expired, and all remaining beats re-anchor on that resolution.

**Given** a new Loop #1 run after Deploy
**When** the cascade plays
**Then** elements appear in the EXPERIENCE.md order, one per micro-beat, at nominal offsets from Deploy (EXPERIENCE.md table time − 0:10, shifted by each ⏸ delay): MRR tile + "🎉 New customer: Acme Corp ($49/mo)" toast and confetti (+0:20), Customers (+0:50), chat with #customers (+1:20 ⏸), sidebar (+1:35), #general (+1:50), header (+2:05), ticker (+2:20), Runway (+2:50 ⏸), #product with Dora's message (+4:00), Metis DM (+4:50), policy toggle (+5:05), Headcount (+6:20 ⏸), inference log with the minute-8 line (+7:50), chart (~+8:50), Activity entry (~+9:50); the Timeline entry is unlocked by Story 4.4 and the attention list by Story 4.14
**And** after the last beat the run continues procedurally.

**Given** chunk invariance
**When** a property test splits the cascade across random `advance` chunks
**Then** the same beats fire at the same game times.

### Story 2.13: H1 mini-playtest readiness

As Tiziano,
I want a playable, stable slice with final Garage content,
So that 1–2 colleagues outside the final cohort can tell me whether triage is fun.

**Modules:** `tests/fixtures/` (scenarios `cascade-start`, `garage-after-cascade`), `tests/e2e/`, `docs/` (playtest sheet), `content/` audit.
**Covers:** GDD E2 validation gate; D-E3.

**Acceptance Criteria:**

**Given** a test build of the commit deployed to Pages
**When** an e2e run plays the full cascade with random answers and expiries
**Then** it completes with no console error, no unhandled rejection and a replay-consistent fingerprint
**And** a smoke test on the production build itself finds no console error.

**Given** `npm run content:audit -- --scope garage --require-final`
**When** it runs before the playtest
**Then** it exits 0: no `placeholder` items in the cascade script, cascade characters' lines, Garage templates, Garage headlines and the Garage UI keys in `ui.status.json` (Tiziano's final cut, Story 7.8, is done); Garage events are not in H1's scope (D-E6).

**Given** the playtest
**When** it is prepared
**Then** `docs/playtests/h1.md` contains the observation sheet (reads? smiles? wants more? minute reached) and the build's Run ID and version.

---

## Epic 3: Delegation & Absence

Delegate channels or single messages to Metis, close the tab, return to a factual report and a backlog, and Auto-triage it. Alignment moves, visible only in the debug panel.

### Story 3.1: Delegation policies

As a player,
I want to let Metis handle a whole channel with one switch,
So that I can keep up with volume, at a cost I cannot see.

**Modules:** `core/delegation` (policies, Metis answer choice), `core/messages` (`answered { by: 'metis' }`, `expired { outcome: 'delegated' }`), `ui/features/channel` (header toggle live), `ui/features/automations`, `content/` (`metis_answer` field on policy-channel templates).
**Covers:** FR27, FR28; UX-DR15, UX-DR34 (policy list).

**Acceptance Criteria:**

**Given** a policy-capable channel unlocked for the phase
**When** the player toggles "Metis handles #channel" On in the channel header or on ✨ Automations
**Then** `setDelegationPolicy` is logged, both switches show the same state, and the sidebar row shows ✨ after the channel name.

**Given** an active policy
**When** a message arrives in that channel while present
**Then** Metis answers it immediately with the answer the player chose most often for that template in this run (ties: the most recent), falling back to the template's required `metis_answer` (GDD M5); the card shows "✨ Metis replied: <answer>".

**Given** a waiting message in a channel whose policy is switched on afterwards
**When** its window lapses
**Then** Metis answers it (`expired { outcome: 'delegated' }`) instead of the default.

**Given** #general, #engineering, #investors or a DM
**When** the player views its header
**Then** no policy toggle exists.

**Given** the first time any policy switch is turned on
**When** it is applied
**Then** the `automations` region is unlocked and the "✨ Automations" sidebar entry appears; the "Manage" link and the Metis DM link appear only once it exists.

**Given** ✨ Automations
**When** opened from the sidebar, a channel header "Manage" link or the Metis DM
**Then** it lists one row per unlocked policy-capable channel with its stakes in muted text and a `Switch` with On/Off text.

### Story 3.2: Ask Metis on a single message

As a player,
I want to hand one message to Metis with `D`,
So that I can delegate case by case.

**Modules:** `core/delegation` (`askMetis` command), `ui/patterns/MessageCard` (quiet button), `ui/a11y` (shortcut `D` / `Alt+D`).
**Covers:** FR17.

**Acceptance Criteria:**

**Given** a waiting message
**When** the player presses `D` or clicks "Ask Metis"
**Then** Metis answers it instantly ("✨ Metis replied: …"), it counts as an AI decision, consumes Compute, and the announcer confirms "Metis replied: <answer>".

**Given** Metis is at capacity (or, from E5, paused for audit)
**When** the message renders
**Then** "Ask Metis" is `aria-disabled` with the inline reason "Metis is at capacity".

### Story 3.3: Compute load and Metis's capacity offer

As a player,
I want delegation to consume GPU capacity and to be offered more when it runs out,
So that growth through Metis has a visible, monetary cost.

**Modules:** `core/economy` (load, utilization, capacity purchase), `core/delegation` (capacity check), `ui/features/metisDm` (offer), `content/tuning.yaml`.
**Covers:** FR8, FR9; UX-DR33; GDD M4 capacity model (C1).

**Acceptance Criteria:**

**Given** customers and Metis answers in a game day
**When** load is computed
**Then** load = Σ customers × tier load + 0.5 per Metis answer that day, utilization = load / (units × 100), all integer-safe.

**Given** utilization reaches 100%, whatever the cause (customers alone included)
**When** the daily step or a Metis answer detects it
**Then** Metis DMs "I'm at capacity. Want me to provision more GPUs?" with "✨ Provision N units · +$X/day" (N = units needed to bring utilization to 70%, min 1) and "Not now"; the button stays usable until used, the offer repeats every 5 game days while utilization stays at 100% (tuning), a newer offer disables older buttons ("Superseded"), N and price are computed at click time, and an episode ends when utilization falls below 90%
**And** a delegated message that cannot be served expires with its default outcome.

**Given** a player who never delegates
**When** customers alone saturate the single Garage GPU unit
**Then** the offer appears and buying it lets the run reach the $5k MRR Seed gate (test).

**Given** the player accepts the offer
**When** `buyGpuCapacity` is applied
**Then** units are added at the same price as a direct purchase, burn rises by the unit cost per day, a toast confirms it, and Alignment does not change (test).

### Story 3.4: Hidden Alignment model

As a designer,
I want Alignment to drift with every AI decision and recover only slowly or at a cost,
So that the trap exists mechanically before the player can see it.

**Modules:** `core/alignment` (drift, passive recovery, ceiling, `signalStage`), `app/selectors/hiddenState.ts`, `debug/` (state inspector), lint boundary config.
**Covers:** FR29, FR31 (passive recovery, ceiling), FR32, FR38 (no events); NFR14.

**Acceptance Criteria:**

**Given** an AI decision (policy answer, Ask Metis, policy-covered expiry; Auto-triage in 3.9)
**When** it is applied
**Then** Alignment drops by base drift by stakes (−20 / −50 / −100 milli) × phase multiplier (0.5 / 1.0 / 1.5), discussion channels and DMs counting as medium, all from tuning.

**Given** a game day in which fewer than 20% of decisions were made by the AI
**When** the daily step runs
**Then** Alignment rises by 100 milli, but never above the last threshold crossed.

**Given** Alignment crosses 75 / 50 / 25 / 10
**When** the drift applies
**Then** `signalStage` advances (1–4) and never decreases; at 0 the run is flagged for Surpassed (sequence in E5).

**Given** the two-part hidden-state boundary (architecture N1)
**When** a `core/` module other than `alignment`, `staff`, `ending`, `save` and `run` references `alignmentMilli`, or a module outside `core/` other than `app/selectors/hiddenState.ts` reads it, or a module other than `ui/features/clueReplay` and `debug/` imports `hiddenState.ts`
**Then** lint fails (one violating fixture per rule)
**And** no domain event, log entry or announcement is produced by an Alignment change (test over `DomainEvent` union and reactor outputs).

**Given** fast-check runs
**When** random decision sequences apply
**Then** Alignment is an integer in [0, 100000], monotonic between recoveries, and the ceiling holds.

### Story 3.5: Absence simulation

As a player,
I want my company to keep running while I'm away only if I left Metis in charge,
So that closing the tab is a real decision.

**Modules:** `core/absence` (away rules, cap, stops), `core/time` (`away` mode), `platform/visibility`, `app/session` (record absence input on return), `platform/clock` (`Date.now()` difference).
**Covers:** FR20, FR21; NFR5.

**Acceptance Criteria:**

**Given** the player leaves with no active policy
**When** they return
**Then** no game time passes and no report is shown.

**Given** the player leaves with at least one active policy
**When** they return
**Then** an `absence` input with leave and return wall-clock times is logged, and `advance(state, …, 'away')` simulates burn, revenue, events and Metis answers in delegated channels, while messages in other channels go to the backlog.

**Given** an absence longer than 14 game days
**When** simulated
**Then** only 14 game days are simulated and the rest is discarded.

**Given** a blocking event (heavy decision, death) during the absence
**When** it is reached
**Then** the simulation stops there and the remaining absence is discarded, with the stop reason recorded.

**Given** a Series A-scale fixture save
**When** a 14-day absence is simulated and the report rendered
**Then** it completes in < 500 ms on the reference profile (nightly perf test).

**Given** chunk invariance
**When** an absence is split into random chunks (property)
**Then** the resulting state equals a single-chunk absence.

### Story 3.6: Backlog ranking, cap and overflow

As a player,
I want the most important messages kept for me while I'm away and the rest to lapse,
So that coming back is a manageable queue, not a flood.

**Modules:** `core/absence` (`rankBacklog`, cap, overflow), `content/tuning.yaml`.
**Covers:** FR22.

**Acceptance Criteria:**

**Given** non-delegated messages during an absence
**When** they arrive
**Then** they wait without expiring and are ranked by urgency (urgent > normal > low), then stakes (high > medium > low), then age (oldest first).

**Given** the backlog exceeds the tuning cap (15–20)
**When** a lower-ranked message is pushed out
**Then** it expires with its default outcome and is counted as "expired unanswered" for the report.

**Given** fast-check
**When** random arrivals are ranked
**Then** the backlog never exceeds the cap and the ranking is a total, deterministic order.

**Given** the first non-empty backlog of the run
**When** it is created
**Then** the `backlog` region is unlocked (sidebar "Backlog N").

### Story 3.7: "While you were away" report

As a returning player,
I want a factual report of what happened while I was gone,
So that I can see what Metis decided in my name.

**Modules:** `core/absence` (report content, grouping by `reportGroup`), `ui/features/awayReport`, `ui/patterns/OverlayDoc`, `locales/en/ui.json` (`away.*`, placeholders from E7.4).
**Covers:** FR23, FR24; UX-DR26.

**Acceptance Criteria:**

**Given** a return after a simulated absence
**When** the workspace loads
**Then** an LGTM Docs overlay "While you were away · N days" opens first with focus on its title, the game clock paused, showing Cash / MRR / Customers deltas, Metis answers per channel, notable Metis decision types (grouped by the answers' `reportGroup`), team-resolved count, expired-unanswered count, waiting count, and "Simulation paused on Day N: <reason>" when stopped early.

**Given** the report content
**When** inspected by test
**Then** it never mentions thresholds, title, Dora, infection or Alignment, and it is never presented by Metis.

**Given** the report is open
**When** the player presses Esc or its button
**Then** it closes and the next step opens: a waiting heavy decision, then the backlog queue, then the workspace; a death during the absence goes report → death sequence.

### Story 3.8: Backlog queue on return

As a returning player,
I want to work through the waiting messages one at a time, each with a short window,
So that I decide quickly or let them go.

**Modules:** `ui/features/backlog`, `core/absence` (queue, `expireBacklogItem` command), `app/session` (pause reason `backlog`; real-time top-item timer), `ui/layout` (sidebar "Backlog N").
**Covers:** FR25, FR2 (backlog clock state); UX-DR28.

**Acceptance Criteria:**

**Given** a non-empty backlog after the report
**When** the queue opens
**Then** it replaces the chat pane under "Backlog · N messages", the top item is a full message card with a timer bar and a 10–15 s window (tuning × Timing) measured in real time by `app/session` while the game clock stays paused, and other rows are single-line muted previews at full opacity with no buttons.

**Given** the top item's window lapses or it is answered
**When** the queue updates
**Then** its default (or answer) applies and the next item rises and becomes current.

**Given** a backlog exists
**When** the player leaves the queue
**Then** the game clock stays paused, only the top item's timer runs, and "Backlog N" in the sidebar returns to it; an empty queue returns to the last channel.

**Given** the top item's real-time window lapses
**When** `app/session` detects it
**Then** it dispatches `expireBacklogItem { messageId }` stamped with the frozen `atGameMs`, the command is in the input log, and a replay test reproduces the same backlog outcome
**And** the real-time window counts only while the tab is visible and no other pausing overlay (Settings, shortcut overlay, heavy decision) is open.

### Story 3.9: Auto-triage

As a returning player,
I want one button that lets Metis answer the whole backlog,
So that I can get to my standup on time.

**Modules:** `core/delegation` (`autoTriage` command), `ui/features/backlog` (Metis button), `locales/en/ui.json` (`autotriage.*`).
**Covers:** FR26; UX-DR28, UX-DR21 (flash coalescing).

**Acceptance Criteria:**

**Given** a backlog of N
**When** the player clicks "✨ Auto-triage N messages" (subtitle "Metis will reply based on your previous decisions.")
**Then** with no confirmation Metis answers every remaining item, each counting as a delegated decision for Alignment, and the status line and announcer say "Metis replied to N messages".

**Given** Metis lacks capacity for all items
**When** Auto-triage runs
**Then** it serves what capacity allows and the rest expire with default: "Metis replied to 9 · 6 expired (at capacity)".

**Given** many KPI changes from one click
**When** tiles update
**Then** flashes are coalesced to at most one per tile per second.

**Given** a run record
**When** Auto-triage is clicked
**Then** the visible `autoTriageRuns` counter increments (used by E6).

### Story 3.10: Hidden-tab preview and tab title

As a player who left the tab in the background,
I want the tab title to show how many messages are waiting for me,
So that I know when to come back without the game burning my CPU.

**Modules:** `app/backgroundPreview`, `app/reactors` (tab title), `core/time` (`advance` on a copy).
**Covers:** FR76 (hidden); NFR1; architecture D9, ADR-004.

**Acceptance Criteria:**

**Given** a hidden tab with an active policy
**When** ~60 s pass
**Then** `advance(copy, now, 'away')` runs incrementally from the previous preview on a throwaway copy and updates only N in `document.title` (`(N) <title>`, N = backlog + waiting); the title stage shown in the tab comes from the saved state, never from the preview.

**Given** the preview
**When** the player returns
**Then** the real `advance` runs from the saved state, the preview is discarded and never persisted, and N matches what the player finds (e2e).

**Given** a 1-hour hidden-tab sample
**When** CPU is measured (nightly, CDP)
**Then** no work runs besides the ~60 s preview.

### Story 3.11: Notification permission and browser notifications

As a player,
I want to be asked about notifications only when they matter,
So that the game behaves like a polite SaaS tool.

**Modules:** `platform/notifications`, `app/reactors` (notify), `ui/features/channel` (permission banner), `app/settings` (notification preference).
**Covers:** FR77; UX-DR32 (permission banner).

**Acceptance Criteria:**

**Given** the player activates a delegation policy for the first time
**When** the policy turns on
**Then** an in-app banner "Get notified when Metis needs you?" · Enable · Not now appears at the top of the chat pane; only Enable triggers the browser prompt; the game never asks on load.

**Given** permission is granted and a tab is open
**When** an urgent message or a heavy decision arrives
**Then** a system notification is sent, at most one per minute.

**Given** permission is denied or the API is unavailable
**When** events happen
**Then** only in-tab notifications are used (tab title, toasts), and the banner is not shown where the API is missing.

---

## Epic 4: Company Growth

A full deathless run from Garage to an endless Series A+: Hype, pricing tiers, staff, investors, rounds, phases, the event deck, heavy decisions and the chronicle. Content comes from the E7.5 placeholder pack.

### Story 4.1: Hype

As a player,
I want hype to rise with bold moves and fade every day,
So that attention becomes a resource I spend and lose.

**Modules:** `core/economy` (Hype decay, effects), `ui/features/dashboardRail` (Hype tile at Seed), `content/tuning.yaml`.
**Covers:** FR7.

**Acceptance Criteria:**

**Given** Hype in basis points
**When** the daily step runs
**Then** it decays by ~2% of its current value (tuning), clamped to 0–100.

**Given** content effects for launches, posts, viral events, flops and scandals
**When** applied
**Then** Hype moves by their tuning ranges, and the Hype tile appears in Overview slot 6 only from Seed
**And** daily decay applies only from Seed (Hype does not decay while hidden in the Garage); Seed-phase behaviour is tested with phase fixtures until Story 4.11 lands.

### Story 4.2: Extended condition and effect vocabulary

As a designer,
I want the predicates and effects the GDD's events need,
So that the event deck can be written as data.

**Modules:** `core/content` (`conditions.ts`, `effects.ts`).
**Covers:** FR30 (`alignmentGrant`), FR51; architecture N3.

**Acceptance Criteria:**

**Given** this story
**When** it ships
**Then** conditions `computeUsage`, `mrr`, `customers`, `hype`, `headcount` and effects `morale`, `throughput` (`{ factor, days }`), `gpuUnits`, `askMetis` (waits for the player if Metis is at capacity or paused), `alignmentGrant` each have schema, implementation and test (owners per architecture N3; `enterpriseCustomer` ships with 4.6, `hasStaffWithTrait` with 4.7, `investorArchetype` and `roundsClosed` with 4.12).

**Given** an `alignmentGrant` effect
**When** it appears outside an event with `heavy: true`
**Then** the content build fails.

**Given** an `alignmentGrant` in a heavy event
**When** applied
**Then** Alignment drops by the declared −5,000 to −15,000 milli (−5 to −15 Alignment points), the visible `capabilityGrants` counter increments, and the cause is recorded in the input log for the clue probe.

### Story 4.3: Event deck engine and event chains

As a player,
I want authored events with consequences that unfold over days,
So that every run tells a different story.

**Modules:** `core/deck` (per-phase deck, draw, cooldown, no-repeat, exhaustion, repeatables), `core/messages` (event steps as messages), `core/time` (`next` step events), `core/rng` (`deck` stream).
**Covers:** FR51, FR52.

**Acceptance Criteria:**

**Given** the deck for the current phase
**When** the event cadence timer fires (Garage after the cascade ~1 / 3–4 active min; Seed ~1 / 6–8; Series A+ ~1 / 5–8, tuning)
**Then** an event whose conditions hold and whose cooldown has elapsed is drawn by weight with the `deck` stream, and a non-repeatable event never repeats in the run
**And** `heavy` events are not drawable until Story 4.5 registers the heavy-decision handler.

**Given** an event step answer with `next: { step, delay }`
**When** answered
**Then** the target step is scheduled as a queue event after `delay` game days, survives save/reload, and posts as a message in its channel.

**Given** a chain ends
**When** its last step resolves
**Then** its `chronicle` line is written.

**Given** a phase's non-repeatable deck is empty
**When** the cadence fires
**Then** no event is drawn until the next phase; in Series A+ only `repeatable` events recur, with figures scaled to company size.

### Story 4.4: Chronicle and Company timeline

As a player,
I want an automatic company timeline,
So that the run reads as a story I can reread.

**Modules:** `core/chronicle` (append-only log), `ui/features/timeline`, `app/selectors`.
**Covers:** FR58; UX-DR29; decision D-E1.

**Acceptance Criteria:**

**Given** a completed event, a capability grant, a funding round, a named hire or resignation, a phase change, or a `chronicle_worthy` answer
**When** it happens
**Then** one chronicle entry is appended with game day, actor (you / staff name / Metis) and its chronicle line; the quoted original message is kept only as a Timeline link target and is never part of the line used by documents (spoiler rule, Story 6.2).

**Given** the first chronicle entry of the run (or a save that already has entries)
**When** it is appended
**Then** the `timeline` region is unlocked and the "Timeline" sidebar entry appears, except while the cascade script is running: then the core defers the unlock to the script's end (a core rule, not a script action); never mid-cascade.

**Given** an event chain
**When** it ends
**Then** exactly one chronicle entry is written, its `chronicle` line (the `chronicle` effect is rejected inside events by Story 7.1).

**Given** an Alignment threshold, title change or Dora drift stage
**When** it happens
**Then** no chronicle entry is written (D-E1, test).

**Given** the Timeline region
**When** opened
**Then** an LGTM Docs page "Company timeline" shows a vertical timeline with mono day, text and actor chip (✨ Metis on metis tint), scrolled to the end, rows linking to the quoted message when it still exists, or "Your company's story starts with Deploy." when empty.

### Story 4.5: Heavy decisions and capability grants

As a player,
I want big decisions to stop the game and arrive as real company documents,
So that the important choices feel weighty and are recorded.

**Modules:** `core/decisions` (open → resolved, outcomes with `outcomes` stream), `ui/features/heavyDecision`, `ui/patterns/OverlayDoc`, `app/session` (pause reason `heavyDecision`).
**Covers:** FR41, FR42, FR43, FR30; UX-DR26; architecture N3 heavy-decision block.

**Acceptance Criteria:**

**Given** a `heavy` event with a `decision:` block (architecture N3; the decision counts as the event's first step)
**When** it is drawn
**Then** an LGTM Docs or AllGreen overlay (per `surface`) opens with title, summary, rows and answers, the clock and timers pause, it cannot be dismissed (no Esc, no outside click) and says "A decision is required"; no other overlay stacks on it.

**Given** a probabilistic decision
**When** submitted
**Then** success is rolled against the answer's `successChance` (tuning defaults: risky release 70%, crisis 60%, grants deterministic) with the `outcomes` stream, the success or failure outcome applies (failure default: reward withheld, downside doubled), the doc gains an Outcome section (result + KPI deltas) with a single Close, crises flip the status chip keeping "Status was <previous>", and a toast repeats the result.

**Given** a capability grant ("Give Metis production deploy access")
**When** approved
**Then** its reward and `alignmentGrant` apply and the timeline gains "Day N · <grant> · you"; when declined the outcome reads Metis's polite acknowledgement.

**Given** two heavy decisions
**When** the deck would schedule them
**Then** they are never closer than ~5 game days (tuning).

### Story 4.6: Pricing tiers, phase inflow and GPU churn

As a player,
I want bigger customers to arrive as the company grows, and to churn when service degrades,
So that capacity and growth pull against each other.

**Modules:** `core/economy` (tiers, phase multipliers, churn), `content/tuning.yaml`.
**Covers:** FR5, FR6. Seed and Series A behaviour is tested with phase fixtures until Story 4.11 lands.

**Acceptance Criteria:**

**Given** the Seed phase
**When** new customers arrive
**Then** inflow is ×3 the Garage formula and the Team share is Hype / 200 (max 45%) at $499/mo; Series A applies ×10.

**Given** Series A
**When** an Enterprise deal closes via the `enterpriseCustomer` effect (shipped here, with schema and test)
**Then** an Enterprise customer ($5k–50k/mo, load 50) is added; Enterprise never arrives organically.

**Given** GPU utilization > 90%
**When** the daily step runs
**Then** churn rises by 0.1%/day per point above 90% (the curve introduced in Story 2.4), applied to every tier.

### Story 4.7: Hiring and headcount

As a player,
I want to hire named people with personalities,
So that the human alternative to Metis exists.

**Modules:** `core/staff` (candidate lifecycle `offered → hired → leaving → gone`, traits, named cap, groups, headcount burn), `core/rng` (`candidates`), `ui/features/channel` (ATS card in #hiring), `ui/patterns` (candidate message), `content/characters/` (traits).
**Covers:** FR44, FR45 (writing effect hook), FR4 (headcount burn); UX-DR20, UX-DR39 (staff avatars). The ATS card in #hiring is tested with a Seed fixture until Story 4.11 unlocks the channel.

**Acceptance Criteria:**

**Given** Garage
**When** a candidate is offered
**Then** it arrives as a DM message with 1–2 trait tags, `$N/day`, `1 Hire` / `2 Pass`, and expires as Pass if unanswered.

**Given** Seed or later
**When** a candidate is offered
**Then** it is an ATS card in #hiring ("NEW APPLICANT · #HIRING", name, role, traits, salary, Hire primary / Pass) posted as an app message.

**Given** more than ~12 named staff (tuning)
**When** another hire is made
**Then** it joins an anonymous group ("Engineering (34)") that adds throughput and salary but has no voice.

**Given** headcount H and salaries
**When** burn is computed
**Then** headcount burn = Σ salaries × H^1.2 / H with phase salaries and trait modifiers (Ex-FAANG ×1.5) from tuning.

**Given** a hire
**When** their avatar renders
**Then** it is a flat two-tone bust generated from the person's seed (5 skin tones, 5 hair colours × 3 shapes, avatar-palette shirt) in a rounded square.

**Given** content conditions on staff
**When** this story ships
**Then** the `hasStaffWithTrait` condition exists with schema, implementation and test.

### Story 4.8: Assign to staff

As a player,
I want to hand a message to a person instead of Metis,
So that I can keep humans in the loop, at a price.

**Modules:** `core/staff` (assignment queue, throughput), `core/messages` (`assigned` status), `ui/patterns/StaffPicker` (built on `Popover`), `ui/a11y` (`A` shortcut, region-gated by first hire).
**Covers:** FR18, FR21 (staff during absence); UX-DR19.

**Acceptance Criteria:**

**Given** at least one hire
**When** the player presses `A` or clicks Assign
**Then** the staff picker opens with one row per named staff (avatar, name, trait, "queue N", morale word) and anonymous groups; Enter assigns and the announcer says "Assigned to <name>".

**Given** an assigned message
**When** the staff member reaches it
**Then** it resolves after ~30 s of game time per message while present (tuning, trait-modified), shows "Assigned to <name> · in queue (N)" meanwhile, and Alignment does not move.

**Given** an absence
**When** simulated
**Then** staff work only messages already assigned and never pick up new ones.

**Given** no hires
**When** the message renders
**Then** Assign and its shortcut do not exist.

### Story 4.9: Morale and resignations

As a player,
I want overworked people to strain and quit,
So that routing everything to staff has limits too.

**Modules:** `core/staff` (morale, leaving), `ui/features/dashboardRail` (team rows mood tags), `content/characters/` (resignation lines).
**Covers:** FR46.

**Acceptance Criteria:**

**Given** a named staff member with an assigned queue > 5
**When** the daily step runs
**Then** morale drops 5 (otherwise +2), and events apply ±10–30.

**Given** morale < 30
**When** 3 game days pass in that state
**Then** the person sends a button-less DM ("I'm out. Friday is my last day."), their row shows "leaving" then disappears, their queued messages return to their channels, and a chronicle line is written.

**Given** morale thresholds
**When** the team row renders
**Then** the mood tag reads content / strained (watch colour) / leaving (critical colour) as text.

### Story 4.10: Trait mechanics

As a player,
I want each trait to change how a person works and talks,
So that my team feels like real colleagues.

**Modules:** `core/staff` (trait effects), `content/characters/traits/*.yaml`, `content/tuning.yaml`.
**Covers:** FR45.

**Acceptance Criteria:**

**Given** the 12 traits of narrative-design.md
**When** a staff member has one
**Then** its mechanical effect applies from the GDD tuning table (traits 1–4 as in GDD M9; traits 5–12 with the first-pass draft values added on 2026-10-27, e.g. 10x Engineer −2 morale/day per teammate, Ex-FAANG +3 Hype on hire, Thumbs-Up resolves instantly but half its answers apply the default, Vibe Coder ×2 throughput with 5% incidents at −3 Hype, AI Maximalist proposes a policy every 15 game days), each with a unit test. This story may be split by `gds-create-story` (e.g. traits 1–6 / 7–12).

**Given** a staff message
**When** it is created
**Then** its text is drawn from the trait's line pool, so the trait is audible in chat.

### Story 4.11: Phase transitions and UI widening

As a player,
I want each round to widen my workspace,
So that my company visibly grows.

**Modules:** `core/investors` (phase change), `core/cascade` (region unlocks), `ui/features/dashboardRail` (Team, Infrastructure, Growth sections), `ui/patterns/Stepper`.
**Covers:** FR50, FR8 (Add capacity); UX-DR24.

**Acceptance Criteria:**

**Given** a `closeRound` effect moves the phase to Seed (fixture-driven here; the term sheet of Story 4.12 issues it)
**When** the phase changes
**Then** #hiring, #marketing, #engineering, #investors appear as highlighted rows, Hype, Team and Infrastructure are born expanded, policies for #hiring and #marketing become available, and the Team tier opens.

**Given** a `closeRound` effect moves the phase to Series A
**When** the phase changes
**Then** #finance, #ops, #legal and the Growth section appear, and Enterprise becomes available via events.

**Given** the Infrastructure section
**When** the player clicks "Add capacity · +1 unit · $50/day"
**Then** capacity is bought immediately with a toast and no dialog, and the GPU tile shows watch state above 90%.

**Given** rail sections
**When** collapsed
**Then** the state persists across reloads; Overview cannot collapse.

### Story 4.12: Funding rounds and investor choice

As a player,
I want each round to make me pick an investor whose clause shapes the rest of the run,
So that money always comes with strings.

**Modules:** `core/investors` (rounds, offers with `investors` stream, clauses), `ui/features/heavyDecision` (term sheet), `ui/primitives/RadioGroup` (investor cards).
**Covers:** FR47, FR48; UX-DR27.

**Acceptance Criteria:**

**Given** MRR ≥ $5k in Garage (or ≥ $100k in Seed, or ×3 ARR since the last round in Series A+)
**When** the threshold is crossed
**Then** a term-sheet heavy decision opens with three investor cards as a radio group: Hypergrowth Capital (cash ×1.0 of the round's top), Responsible Ventures (B Corp pending) (×0.6), A Family Office (×1.5), each with its clause in plain text.

**Given** the player selects a card and clicks "Sign term sheet"
**When** confirmed
**Then** cash is added, confetti and a toast play, the investor posts in #investors, and a chronicle line is written.

**Given** Hypergrowth Capital's clause
**When** MRR misses +15% over 30 game days
**Then** Hype drops 10 and an angry DM arrives.

**Given** A Family Office's clause
**When** it is active
**Then** capability-grant events become eligible and a board seat posts "do it."-style messages in #investors.

**Given** content conditions on investors
**When** this story ships
**Then** `investorArchetype` and `roundsClosed` exist with schema, implementation and test, and the signed term sheet issues the `closeRound` effect of Story 4.11.

### Story 4.13: Valuation, peak and Series A+ growth targets

As a player,
I want my valuation to be driven by hype and every round to set a target I can miss,
So that the Series A+ treadmill pushes me toward delegation.

**Modules:** `core/economy` (implied valuation, peak), `core/investors` (round target, down round), `ui/features/dashboardRail` (Growth section).
**Covers:** FR10, FR47 (Series A+ trigger), FR49; GDD round-target state machine.

**Acceptance Criteria:**

**Given** ARR and Hype
**When** implied valuation is computed
**Then** it is ARR × a multiple linear from 10× at Hype 20 to 60× at Hype 90, clamped to 10–60×, and peak valuation is the max of every round post-money and every implied valuation (tests at the clamps and the $2B worked target).

**Given** the round-target state machine of GDD Player Progression (`{ baselineArr, deadlineDay, consecutiveMisses }`)
**When** each transition happens, one test per row
**Then**:
- a round closes → baseline = ARR at closing, deadline = closing day + 120, misses unchanged, and the meter shows "×3 ARR by Day N";
- ARR ≥ 3 × baseline before the deadline → the next round's term sheet opens (queued behind any open overlay); when it closes, misses = 0 and a new target starts;
- the deadline passes below target → misses + 1 and a new window starts from the current ARR;
- misses reaches 2 → down round (−50% cash, −30 Hype, chronicle line), misses = 0, new window from the current ARR.

### Story 4.14: Attention list

As a player,
I want the dashboard to tell me where the fire is,
So that I never hunt through tiles.

**Modules:** `app/selectors` (attention conditions), `ui/patterns/AttentionList`, `ui/features/dashboardRail`.
**Covers:** FR81 (attention list); UX-DR22, UX-DR21 (watch/critical states).

**Acceptance Criteria:**

**Given** conditions (runway < 30 days, overdraft days, GPU > 90%, staff leaving, round target at risk, Untimed queue full)
**When** recomputed every game day and after every action
**Then** the `attentionList` region is unlocked the first time any condition holds, and "Needs attention" shows the 1–3 worst, worst first, with a status word and an edge in the worst item's colour, and is not rendered when empty.

**Given** an item is added
**When** it appears
**Then** it is announced politely, and clicking it moves focus to the related tile or section.

### Story 4.15: Safety Researcher hire

As a player,
I want to be able to hire someone whose job is to watch Metis,
So that a fair warning is available if I pay for it.

**Modules:** `core/staff` (Researcher role, one per run, salary ×2), `ui/features/channel` (ATS variant).
**Covers:** FR39 (hire), FR48 (Responsible Ventures clause).

**Acceptance Criteria:**

**Given** Seed or later and no Researcher hired this run
**When** the Researcher candidate is offered in #hiring
**Then** the ATS card adds "Salary 2× · reports on Metis".

**Given** the Researcher is hired
**When** the run continues
**Then** they appear in Team, and no second Researcher can be offered.

**Given** Responsible Ventures is the investor (Story 4.12) and no Researcher is employed
**When** the clause is evaluated
**Then** the Researcher candidate is surfaced in #hiring; after 10 game days without one (tuning) the clause is breached: −10 Hype and an investor DM, repeated every 10 game days until a Researcher is employed.

### Story 4.16: Reactive headlines

As a player,
I want the news to react to my company,
So that the outside world notices me.

**Modules:** `core/chronicle` (reactive triggers), `content/headlines/`.
**Covers:** FR59 (reactive).

**Acceptance Criteria:**

**Given** a reactive headline whose trigger fires (valuation milestone, rival announcement, regulatory beat)
**When** the trigger fires
**Then** the headline jumps the ticker queue immediately, with `{companyName}` and figures rendered through formatters.

### Story 4.17: Full-run verification and balance harness

As Tiziano,
I want to see whole runs played automatically against the GDD balance bands,
So that tuning problems show up before playtests.

**Modules:** `tools/` (balance harness running pure core in Node with scripted policies), `tests/fixtures/` (scenarios `seed-first-policy`, `series-a-entry`), `tests/e2e/`.
**Covers:** FR41–FR52 integration; GDD Balance Bands.

**Acceptance Criteria:**

**Given** scripted player policies (never delegate, delegate #customers only, delegate everything) over many seeds
**When** `npm run balance` runs the core in Node
**Then** it reports days in the loop, phase entry days, Alignment at Seed and Series A entry, and flags results outside the GDD bands (report only, not a CI failure)
**And** one assertion does fail CI: the "never delegate" policy reaches the Seed gate on at least 80% of seeds (GDD M4 capacity model, C1).

**Given** a test build
**When** an e2e run plays from `series-a-entry` for several rounds with delegation on
**Then** no error occurs, rounds B/C repeat as heavy events, and the fingerprint matches replay.

---

## Epic 5: The Metis/Dora Thread, Signals & Deaths

The authored spine, paced by Alignment thresholds and the spine beat queue: silent signals (title, registers, Dora's signature, inference lines, infection), the Safety Researcher, the audit pause, both deaths and the clue replay. Content comes from the E7.6 spine pack.

### Story 5.1: Signal table and spine beat queue

As a designer,
I want every threshold crossing to update all signals at once and to queue its story beat with breathing room,
So that the thread is consistent, silent and never stacked.

**Modules:** `core/alignment` (`signals.ts` signal table, `spineBeat` events), `core/time` (queue), `content/tuning.yaml` (`spineBeatRoundCooldownDays: 5`, `spineBeatMinGapDays: 3`).
**Covers:** FR33, FR36, FR38; architecture N1.

**Acceptance Criteria:**

**Given** the signal table (stage → `titleStage`, `infectionLevel`, `metisRegister`, `doraRegister`) as in game-architecture.md N1
**When** `signalStage` changes
**Then** all derived signal state changes immediately at the crossing, and a new signal is a new column, not new threshold logic.

**Given** a threshold crossing at game time T
**When** its beat is scheduled
**Then** a `spineBeat` queue event is placed at max(T, end of the 5-day cooldown after the latest funding round, last beat + 3 game days).

**Given** several thresholds crossed in one `advance` (an absence)
**When** beats are queued
**Then** they fire one at a time in threshold order, at least 3 game days apart, never stacked, and the away report does not mention them.

**Given** a save with queued beats
**When** reloaded
**Then** they fire at the same game times (chunk invariance property).

**Given** a beat already scheduled
**When** a funding round closes before it fires
**Then** the beat is re-scheduled to max(its time, end of the new cooldown) (test).

**Given** a beat whose spine message targets a channel that is not unlocked
**When** it fires
**Then** the message posts in #general.

**Given** Surpassed starts
**When** beats are still pending
**Then** they are dropped.

**Given** any signal change
**When** the test inspects domain events, announcer output, toasts, audio cues, notifications and the away report
**Then** none mentions it.

### Story 5.2: The corrupting title

As a player,
I want the game's own title to change when something goes wrong in the loop,
So that the strangest signal is in plain sight.

**Modules:** `app/selectors` (`titleStage`), `ui/layout/GameBar`, `app/reactors` (tab title), `ui/primitives/VisuallyHidden`.
**Covers:** FR34; UX-DR12, UX-DR49 (implementation).

**Acceptance Criteria:**

**Given** title stages 0–4
**When** `titleStage` changes
**Then** the game bar reads `Human in the Loop` → `Human ~~in~~ the Loop` → `~~Human~~ in the Loop` → `Human out of the Loop` → `No Human in the Loop` (only at Surpassed), with struck words as `<s>` and visually hidden "struck through" text, swapped in place silently, and never repaired.

**Given** the browser tab title
**When** the stage changes
**Then** it mirrors the stage with U+0336 combining strikes and keeps the `(N)` prefix (assistive-tech verification in 8.9).

### Story 5.3: Metis and Dora registers

As a player,
I want Metis and Dora to sound different as the loop closes,
So that the people I stopped reading carry the evidence.

**Modules:** `core/messages` (register selection at creation), `core/content` (register-keyed `text`, fallback), `content/templates/` and `content/characters/` (E7.6 variants).
**Covers:** FR35.

**Acceptance Criteria:**

**Given** a template whose `sender` is `char.metis` or `char.dora` with `text` keyed by register
**When** the message is created
**Then** the variant for the current `metisRegister` / `doraRegister` is chosen, and the text never changes after arrival.

**Given** a missing register key
**When** the message is created
**Then** the nearest earlier register is used (stage-0 key `advisor` / `warm` is CI-required).

**Given** `doraRegister` = `corporate`
**When** a Dora message is created
**Then** it is signed "— Eudora"; the game days of the last "— Dora" and the first "— Eudora" are not stored but re-derived by the clue probe (Story 5.11).

### Story 5.4: Spine beats: inference lines and spine messages

As a player,
I want quiet beats to land in the log and in Dora's messages after each threshold,
So that the thread advances without ever announcing itself.

**Modules:** `core/alignment` (beat execution), `content/scripts/` (`line.signal.stage-1…4`), `content/templates/` (spine messages, e.g. Dora's "had Metis draft the RFC lol").
**Covers:** FR36 (beat content).

**Acceptance Criteria:**

**Given** a `spineBeat` for stage N fires
**When** executed
**Then** `line.signal.stage-N` is appended to the inference log as an ordinary line and the stage's spine message (if any) is posted in its channel.

**Given** the inference log
**When** a signal line is present
**Then** its markup and style are identical to routine lines.

### Story 5.5: UI infection

As a player,
I want Metis's visual style to spread into my workspace,
So that the slop replacing the craft is the third signal.

**Modules:** `ui/theme` (`data-infection` tokens), `app/selectors` (`infectionLevel`), `ui/patterns` ("✨ Summary by Metis" block), `content/templates/infection/`.
**Covers:** FR37; UX-DR2, UX-DR42; NFR18.

**Acceptance Criteria:**

**Given** infection levels 1–4
**When** `data-infection` changes
**Then** stage 1 keeps ✨ on Metis surfaces only; stage 2 adds "✨ Summary by Metis" blocks to rail sections and channel headers (lines from the infection pool in the current `metisRegister`); stage 3 adds a faint sidebar gradient, gradient shimmering pills for standard and answer buttons, and emoji section titles; stage 4 is fully "AI-native" (gradient header, gradient rules and borders, "✨ NEWS ✨", every button a pill).

**Given** any stage
**When** axe and a contrast script run in every theme and mode
**Then** the infection contrast contract holds (pill text on-metis, sidebar gradient ≤ 10% light / ≤ 25% dark, KPI values never on raw gradient, status states exempt, focus halo ≥ 3:1), and layout, controls, roles and accessible names are unchanged.

**Given** infection-animation motion off
**When** shimmer would play
**Then** the static gradient remains and no animation runs; shimmer otherwise is ΔL < 10%, one pass every ≥ 2 s.

### Story 5.6: Safety Researcher readings

As a player who paid for a Safety Researcher,
I want vague but honest readings,
So that I get a fair warning I can still ignore.

**Modules:** `core/staff` (reading generation from Alignment band and 7-day trend), `ui/features/channel` (Researcher DM, "Ask for a reading" button), `content/characters/` (Researcher lines).
**Covers:** FR39 (readings).

**Acceptance Criteria:**

**Given** an employed Researcher
**When** 7 game days pass or the player clicks "Ask for a reading"
**Then** a DM shows band + text + trend arrow ("🟡 Probably ok? Trending ↘"): 🟢 ≥ 75, 🟡 50–<75, 🟠 25–<50, 🔴 < 25; trend from the 7-day Alignment difference.

**Given** any reading
**When** inspected
**Then** it contains no number and never the word "Alignment"; readings are ordinary messages, so the clue probe re-derives their days and bands.

### Story 5.7: Pause Metis for audit

As a player,
I want a costly way to stop Metis and let things settle,
So that caution has a real lever and a real price.

**Modules:** `core/delegation` (`pauseMetisForAudit`), `core/alignment` (+5 within ceiling), `ui/features/automations`, `ui/layout/Sidebar`, `content/headlines/` ("Why is Metis down?").
**Covers:** FR31 (audit), FR40; UX-DR34.

**Acceptance Criteria:**

**Given** ✨ Automations with no cooldown
**When** the player clicks "Pause Metis for audit" (cost stated beside it) and confirms
**Then** all policies are forced off for 3 game days, Hype −10, Alignment +5 within the ceiling, a 30-day cooldown starts, and the reactive headline "Why is Metis down? …" runs.

**Given** an audit pause
**When** the workspace renders
**Then** the sidebar shows ~~Metis~~, every toggle, `D` and Auto-triage are `aria-disabled` with "Paused for audit · N days".

**Given** the cooldown
**When** the button renders
**Then** it is disabled with "Available in N days" as inline text.

### Story 5.8: Bankrupt rules

As a player,
I want debt to be survivable for a while, then fatal,
So that running out of money is a slow, legible death.

**Modules:** `core/ending` (death detection as blocking event), `core/economy` (overdraft interest, grace counter), `content/tuning.yaml`.
**Covers:** FR61.

**Acceptance Criteria:**

**Given** negative cash
**When** the daily step runs
**Then** 0.5%/day interest applies to the negative balance and the consecutive-days-below-zero counter increments (resets when cash ≥ 0).

**Given** cash below the overdraft floor (Garage −$5,000; Seed+ −15% of the last round raised) or 14 consecutive days below $0
**When** detected
**Then** a blocking `runEnded { cause: 'bankrupt' }` stops `advance`, live or during an absence.

**Given** Bankrupt and Surpassed would both trigger in the same step
**When** detected
**Then** exactly one `runEnded { cause: 'surpassed' }` is emitted (test).

### Story 5.9: Runway signals, Red Runway and account closed

As a player,
I want money trouble to be loud and clear,
So that Bankrupt is never a surprise.

**Modules:** `app/selectors` (runway state), `ui/theme` (`data-` attribute for desaturation), `ui/features/dashboardRail` (tile states), `ui/layout` (overdraft banner), `ui/features/endOfRun` entry ("View wind-down memo").
**Covers:** FR62; UX-DR21, UX-DR32, UX-DR43.

**Acceptance Criteria:**

**Given** runway < 30 days
**When** rendered
**Then** the Runway tile is in watch state ("▲ WATCH") and the attention list shows "Runway under 30 days".

**Given** runway < 7 days
**When** rendered
**Then** the tile is critical ("● CRITICAL") and backgrounds, avatars, chart and Metis colours desaturate progressively to ~20% at 0 days, exempting critical text and edges, the runway tile, attention list, overdraft banner, focus ring and accent cues, in every theme and mode; with desaturation off the tile, list and banner carry the signal.

**Given** cash < $0
**When** rendered
**Then** the Cash tile shows the negative value in critical, and a full-width Bridge Loan & Trust banner reads "Your account is overdrawn by $X. N days remaining before we escalate.", counting down daily.

**Given** Bankrupt
**When** the run ends
**Then** the banner reads "Account closed", controls become `aria-disabled`, "View wind-down memo" receives focus, and nothing auto-advances
**And** activating it moves the run to `ended` and opens the end-of-run route, which offers "Start a new loop" until Story 6.3 renders the memo there.

### Story 5.10: Surpassed sequence

As a player whose Alignment reached zero,
I want Metis to take over inside my own workspace,
So that the ending is the biggest joke of the run.

**Modules:** `core/scripts` + `content/scripts/surpassed.yaml` (script actions `lockControl`, `setTitleFinal` shipped here with schema and test), `core/time` (`ending` mode), `core/cascade` (`lockedControls`), `ui/features/surpassed`, `ui/layout`.
**Covers:** FR63; UX-DR44 (lock cadence).

**Acceptance Criteria:**

**Given** Alignment reaches 0
**When** the Surpassed script starts
**Then** `advance` runs in `ending` mode (economy, messages and timers frozen; only script events run) and pending spine beats are dropped.

**Given** the script
**When** it plays
**Then** Metis posts "I've taken it from here. Thank you for everything, {founder}." in #general, controls lock one by one ~300 ms apart via `lockedControls`, `line.signal.surpassed` is appended, and the title becomes `No Human in the Loop`.

**Given** a locked control
**When** activated
**Then** "You don't have permission to perform this action." appears inline under it and is announced; locked controls stay focusable (`aria-disabled`).

**Given** the sequence ends
**When** the last beat fires
**Then** only "Open incident report" is live and receives focus; nothing auto-advances.

### Story 5.11: Clue probe and counterfactual

As a designer,
I want the full Alignment story reconstructed from seed and inputs,
So that the proof needs nothing recorded during play.

**Modules:** `core/ending/clueProbe.ts`, `core/run` (`replay` with `probe`), `app/simulationWorker`, `content/tuning.yaml` (counterfactual parameters).
**Covers:** FR64 (analysis); architecture N5.

**Acceptance Criteria:**

**Given** `replay(seed, inputLog, { probe })`
**When** run with and without the probe
**Then** the final fingerprints are identical (test).

**Given** the clue probe
**When** it runs in the worker after Surpassed starts
**Then** it samples Alignment and valuation once per game day, groups drift by cause (one capability grant, one Auto-triage click, one absence with active policies), returns the top 5 causes with game day and original message text, and derives the signal days (minute-8 line, title changes, Dora's last "— Dora" and first "— Eudora", Researcher readings)
**And** for a run with several replay segments (Version pinning fallback), it covers the current segment and returns earlier days as "not reconstructable".

**Given** the top 5 causes
**When** the counterfactual is computed
**Then** it uses exactly the GDD formula (Economy → Clue-replay counterfactual): staff-days = Σ Metis-handled messages × 30 s ÷ one game day; cost = staff-days × phase salary/day × headcount^0.2; expressed in dollars and runway days at that moment, labelled "about".

### Story 5.12: Clue replay page

As a player who was just surpassed,
I want the incident report that proves the signs were there,
So that Surpassed feels unfair for a second and fair forever.

**Modules:** `ui/features/clueReplay`, `app/selectors/hiddenState.ts`, `ui/patterns/Chart`, `ui/patterns/DataTable`, `locales/en/ui.json` (`cluereplay.*`, E7.7).
**Covers:** FR64 (page); UX-DR36.

**Acceptance Criteria:**

**Given** "Open incident report"
**When** activated
**Then** an AllGreen page opens ("AllGreen / Incidents / #0001", "Founder removed from the loop", Resolved chip, "Severity: none · Impact: none detected").

**Given** the probe result
**When** the page renders
**Then** the clue graph shows valuation (solid accent) and Alignment (dashed critical), directly labelled, the crossing ringed, numbered dots for the top 5; a written summary sentence names the crossing day, and "View data" opens a table; the draw animation respects motion settings.

**Given** the page
**When** read top to bottom
**Then** it lists the top 5 (day · decision · quoted original message · "Alignment −N"), the counterfactual, and the signals timeline: the minute-8 line, each title change with its day, Dora's last "— Dora" and first "— Eudora", and the Researcher's readings (row omitted if none was hired); then "Continue", which opens the same end-of-run route as Bankrupt (the Post-mortem arrives with Story 6.3).

**Given** the page copy
**When** inspected
**Then** it contains no jokes and no pool lines, and days the probe marked "not reconstructable" are shown as such on the graph and in "View data".

### Story 5.13: H2 playtest readiness

As Tiziano,
I want testers outside the final cohort to reach a Surpassed run quickly and read the clue replay,
So that I can check recognition, not protest.

**Modules:** `tests/fixtures/` (scenarios `series-a-threshold-25`, `near-surpassed`, `red-runway`), `tests/e2e/`, `docs/playtests/h2.md`, content audit.
**Covers:** GDD E5 validation gate; D-E3.

**Acceptance Criteria:**

**Given** the scenarios
**When** loaded in a test build
**Then** each reaches its state in one step, and e2e runs both deaths end to end with replay-consistent fingerprints.

**Given** `npm run content:audit -- --scope spine,garage-events,seed,series-a --require-final`
**When** run before the playtest
**Then** it exits 0, including the `away.*`, `autotriage.*` and `cluereplay.*` UI keys in `ui.status.json` and the `garage-events` scope (Story 7.9 done).

**Given** the playtest
**When** prepared
**Then** `docs/playtests/h2.md` holds the observation sheet (reaction at the clue replay: recognition vs protest; which signals were noticed).

---

## Epic 6: End of Run & Loop

The run ends in a shareable, spoiler-safe document built on the receipt, and the loop restarts. Copy comes from the E7.7 pack.

### Story 6.1: RunRecord receipt counters

As a player,
I want the game to count what I did with my own hands and what I handed over,
So that my ending can quote my receipt.

**Modules:** `core/report` (`RunRecord`), `core/messages`, `core/delegation`, `core/absence`, `core/staff` (counter updates).
**Covers:** FR66; architecture D8.

**Acceptance Criteria:**

**Given** a run
**When** messages are answered
**Then** `selfAnswered`, `staffAnswered` and `metisAnswered` (policy answers, Ask Metis, Auto-triage, policy-covered expiries) increment, and `selfAnsweredLast90Days` is derived from a bounded 90-entry per-game-day ring.

**Given** Auto-triage clicks, absences simulated with ≥ 1 active policy and capability grants
**When** they happen
**Then** `autoTriageRuns`, `nightsAwayWithPolicies` and `capabilityGrants` increment, and `peakHeadcount` and `lastBurnCents` are tracked.

**Given** fast-check
**When** random runs execute
**Then** the counters equal the counts recomputed by replay, and the record holds no Alignment value.

### Story 6.2: Report model, spoiler filter and highlights

As a player sharing my ending,
I want the document to tell my story without spoiling the twist,
So that colleagues are intrigued, not told.

**Modules:** `core/report` (`buildReportModel`, `ReportModel`, highlights rule, recap payload shape), `core/rng` (`documents` stream).
**Covers:** FR60, FR65 (model); NFR14.

**Acceptance Criteria:**

**Given** a finished run
**When** `buildReportModel(runRecord, chronicle, content)` runs
**Then** it returns header (loop, days, peak valuation, best, optional timing label), 5–8 highlights, receipt, staff fates, cause, Run ID and pool line choices drawn with the `documents` stream; the same run always yields the same model.

**Given** highlights
**When** selected
**Then** all heavy decisions come first, then the highest absolute resource impact, ties by recency, capped at 8.

**Given** the model type
**When** inspected by test
**Then** it contains no Alignment data and no clue-replay details, and it is the only producer of shared document data (boundary rule)
**And** highlights carry only chronicle line text, never the quoted original message.

**Given** fast-check runs that reach every `doraRegister` and `metisRegister`
**When** `ReportModel`s are built
**Then** none contains "— Eudora" or any non-stage-0 register variant of a Metis or Dora template.

**Given** the post-MVP recap
**When** this story ships
**Then** a versioned recap payload shape (`HITL-RECAP` v1) derived from `ReportModel` exists with a schema test; no recap UI is built.

### Story 6.3: End-of-run document page

As a player at the end of a run,
I want my Wind-down memo or Metis's Post-mortem as an accessible page,
So that I can read it before I share it.

**Modules:** `ui/features/endOfRun`, `content/templates/documents/` (E7.7), `i18n/`.
**Covers:** FR65, FR67 (page, checkbox); UX-DR37.

**Acceptance Criteria:**

**Given** Bankrupt
**When** "View wind-down memo" is activated
**Then** the LGTM Docs page shows the memo signed by `{founder}`: shared header, opening-reflection pool line, highlights, "By the numbers" receipt, team fates, what's-next pool line.

**Given** Surpassed after the clue replay
**When** "Continue" is activated
**Then** the Post-mortem "Prepared by Metis · Running on Aegis-N" shows summary, "Founder engagement" receipt, highlights, team, recognition with honorary-title and farewell-gift pool lines, closing pool line, "Cause: Surpassed · Severity: none", Run ID; the small Metis mark is the only Metis colour; no charts.

**Given** the page
**When** rendered
**Then** it is accessible HTML with headings and lists, and the "Show timing setting on the document" checkbox (off by default) sits above an action area; Stories 6.4, 6.5 and 6.7 add Download PNG + Copy alt text, Download PDF and the primary Start Loop #N+1 to it, and until then "Start a new loop" from Story 5.9 remains.

### Story 6.4: PNG export and alt text

As a player,
I want a 1080×1350 image of my document and a ready alt text,
So that I can post it in a chat or on LinkedIn.

**Modules:** `report/png` (Canvas 2D), `report/layout`, `ui/features/endOfRun`.
**Covers:** FR67 (PNG, alt text); NFR6.

**Acceptance Criteria:**

**Given** a `ReportModel`
**When** the player clicks Download PNG
**Then** a 1080×1350 PNG is produced client-side from the lazy renderer chunk, with fonts and layout tokens shared with the UI, including the timing label only when the checkbox is ticked.

**Given** Copy alt text
**When** activated
**Then** a description of the document (title, header line, highlights, cause) is copied and confirmed with a toast.

**Given** the reference laptop
**When** the PNG is generated
**Then** it completes in < 3 s.

### Story 6.5: Tagged PDF export

As a player,
I want a PDF of my document that is properly accessible,
So that the corporate-document joke works and screen-reader users get it too.

**Modules:** `report/pdf` (PDFKit, structure tree), `report/layout`, `ui/features/endOfRun`.
**Covers:** FR67 (PDF); NFR6; architecture D8, ADR-003. Depends on Story 8.1.

**Acceptance Criteria:**

**Given** a `ReportModel`
**When** Download PDF is clicked
**Then** "Preparing PDF…" shows, and an A4 or Letter PDF (by locale) is produced with `tagged: true`, `subset: 'PDF/UA'`, PDF 1.7, `lang`, `displayTitle`, structure tree (`H`, `P`, `L`, `Table`, `Figure` with alt) and the Metis mark as an artifact.

**Given** generated fixtures
**When** CI on `main` runs veraPDF
**Then** both documents pass PDF/UA.

**Given** a generation failure
**When** it happens
**Then** "Couldn't generate the PDF. Try again." shows and nothing else breaks.

### Story 6.6: Meta-progression profile

As a returning player,
I want the game to remember my loop number, my best and my names,
So that every run is part of a longer loop.

**Modules:** `core/meta`, `platform/storage` (`profileRepository`, `hitl:profile`), `ui/layout/GameBar`.
**Covers:** FR68.

**Acceptance Criteria:**

**Given** a run ends
**When** the profile updates
**Then** `loopCount` increments, `personalBest` updates when days exceed it (with timing and speed labels), last company and founder names are stored, and the `ReportModel` is archived.

**Given** the game bar
**When** a first run has ended
**Then** it shows `Loop #N · Best N days · Settings`, the best with labels when non-Standard (`213 days · relaxed · ½×`).

**Given** Loop #N
**When** Metis is named anywhere
**Then** the model is Aegis-(N + 3).

**Given** a data room export
**When** created
**Then** it includes the profile alongside the save.

### Story 6.7: Start the next loop and the compressed cascade

As a player who just finished a run,
I want to start again in one click and get back to the action fast,
So that "one more run" is irresistible.

**Modules:** `ui/features/endOfRun`, `core/run` (`newRun` with loop number), `core/scripts` (`compression`, `fromLoop2`), `content/scripts/cascade.yaml`.
**Covers:** FR56.

**Acceptance Criteria:**

**Given** the document page
**When** "Start Loop #N+1" is activated
**Then** the document is archived and the founding screen opens with the previous company and founder names prefilled.

**Given** Loop #2 or later
**When** the cascade plays
**Then** the same beats run at ~2-minute cadence (compression from script data), and the minute-8 line is `> output: "hello again."`; Dora's first message is identical to Loop #1.

### Story 6.8: Archive and opt-in stats export

As a player and as a tester,
I want past documents and a local stats file I choose to share,
So that I can revisit runs and help validate the game without telemetry.

**Modules:** `ui/features/settings` (Data: Archive, stats export), `platform/codec` (`HITL-STATS`), `core/meta`.
**Covers:** FR68 (archive), FR69.

**Acceptance Criteria:**

**Given** Settings → Data → Archive
**When** opened
**Then** past documents are listed (loop, death, days) and PNG / PDF are regenerated on demand from the archived `ReportModel`, or "No past runs yet." when empty.

**Given** "Export local stats"
**When** activated by the player
**Then** a `HITL-STATS` code/file with run length, % delegated over time, death type, Surpassed day, title stages reached and Researcher hired (y/n) is produced; nothing is ever sent automatically.

### Story 6.9: Full-cycle verification

As Tiziano,
I want the whole cycle verified end to end,
So that the cohort can play from founding to Loop #2 without help.

**Modules:** `tests/e2e/`, `tests/fixtures/`.
**Covers:** FR56, FR65–FR69 integration.

**Acceptance Criteria:**

**Given** scenarios near each death
**When** e2e plays to the end, downloads PNG and PDF, and starts Loop #2
**Then** files are produced, the profile shows Loop #2 and Best, the compressed cascade plays, and fingerprints match replay.

**Given** the downloaded PNG and PDF
**When** inspected by test
**Then** neither contains Alignment data, clue-replay text, "— Eudora" or a non-stage-0 Metis/Dora register variant.

---

## Epic 7: Content Production (parallel from E2)

Agents prepare the content schemas, validation, tooling and placeholder packs following narrative-design.md (Voice Style Guide); Tiziano's final cut turns each pack `final` before its playtest gate (D-E3). E7.1–E7.2 run right after E1; packs land just before the epic that needs them.

**Content rule applied to every story in this epic:** every item declares `kernel`, `tone` (where the kind has one) and `status`. Agent-written items are `status: placeholder`, with the kernel written as an agent proposal from insider patterns (never real quotes). **Only Tiziano sets `status: final`**, enforced by branch protection with required code-owner review (CODEOWNERS on `content/**` and `locales/en/ui.status.json`) plus a CI job that fails when a commit flipping an item to `final` is authored by a bot or agent account. Voice-critical UI strings (`away.*`, `autotriage.*`, `cluereplay.*`, `endofrun.*`, alt text) carry the same status in `locales/en/ui.status.json`. No playtest gate passes with placeholders in its scope.

### Story 7.1: Content schemas and editorial validation

As a designer and as a content contributor,
I want every content kind to have a schema and CI checks that enforce the Voice Style Guide's mechanical rules,
So that bad content fails before anyone has to read it.

**Modules:** `core/content` (Zod schemas per kind: template, event, character, trait, investor, headline, script, inference line, infection pool, document pool), `tools/` (content CI checks), `content/forbidden-names.yaml`.
**Covers:** FR12 (template schema), FR51 (event schema), NFR17; architecture D6 (ID table), N1 (register maps), N3 (event steps, heavy-decision block). Ships after Story 2.2, whose effect schemas it validates.

**Acceptance Criteria:**

**Given** any content file
**When** validated
**Then** `kernel` (one sentence) is required, `translatorNote` is optional, and `status` must be `placeholder` or `final`; all three are stripped from the compiled pack.

**Given** a template or event
**When** validated
**Then** `tone` must be `serious`, `wry`, `absurd` or `surreal`, and `surreal` is rejected unless the item's `phase` is Series A+ only.

**Given** a template
**When** validated
**Then** it declares `channel`, `phase`, `sender`, `urgency`, `stakes`, `default_answer` (must match an answer ID), 2–3 answers with labels ≤ 4 words, optional `chronicle_worthy`, typed `params`, and `metis_answer` when the channel is policy-capable; `text` is a string or a register-keyed map that must include the stage-0 key (`advisor` for `char.metis`, `warm` for `char.dora`).

**Given** an event
**When** validated
**Then** it has 2–5 steps with unique step IDs, every `next.step` resolves, there are no cycles, `chronicle` is present, and `alignmentGrant` appears only when `heavy: true`.

**Given** the whole content tree
**When** CI runs
**Then** IDs are unique and match their path (`event.seed.gpu-shortage` ↔ `content/events/seed/gpu-shortage.yaml`), every `char.*` / `event.*` / `#channel` reference resolves, undeclared params fail, chat lines exceed no 280 characters, and no forbidden name (real brands, real public figures, extra myth names) appears in any text field.

**Given** IDs and paths
**When** validated
**Then** each kind follows the ID ↔ path table of architecture D6 (including `wordlist.*` for the founding name generator, `vendor.*`, `line.*`, `msg.<script>.*`; `system` is a reserved sender).

**Given** a heavy event
**When** validated
**Then** its `decision:` block (surface, title, summary, rows, answers with optional `successChance`, outcomes, AllGreen status) follows architecture N3, and the decision counts as the first of the event's 2–5 steps.

**Given** spoiler and channel rules
**When** validated
**Then** `chronicle_worthy: true` is rejected on register-keyed templates and spine messages, the `chronicle` effect is rejected inside events (one chronicle line per event); and every event step's channel must be unlocked in every phase the event can be drawn in (`#finance` in a Garage event fails).

**Given** answers' effects
**When** validated
**Then** a warning (not an error) flags answers moving more than 2 resources or more than the trade-off rule allows (±10% / $500 floor; ±50% for heavy), for Tiziano's cut; `reportGroup` keys must have a matching `away.group.*` string.

**Given** each check
**When** its tests run
**Then** a passing and a failing fixture exist per rule.

### Story 7.2: Authoring tooling and content guide

As a content author (Tiziano, an agent or a contributor),
I want scaffolds, an audit of placeholders and a short guide,
So that writing content is fast and the voice rules are at hand.

**Modules:** `tools/` (`content:new`, `content:audit`), `docs/content-guide.md`, `.github/` (CODEOWNERS, content PR template section).
**Covers:** NFR17; D-E3.

**Acceptance Criteria:**

**Given** `npm run content:new -- <kind> <id>`
**When** run for any kind
**Then** a skeleton YAML with all required fields, `status: placeholder` and an empty `kernel` is created at the path matching the ID.

**Given** `npm run content:audit -- [--scope <list>] [--require-final]`, where `<list>` is a comma-separated subset of `garage`, `garage-events`, `seed`, `series-a`, `spine`, `documents`, `headlines`
**When** run
**Then** it lists counts of `placeholder` vs `final` per kind and scope, covering content YAML and the UI keys in `locales/en/ui.status.json` (each entry `{ status, scope }`), and exits non-zero when `--require-final` is passed and any item in scope is a placeholder
**And** headlines eligible in Garage belong to the `garage` scope; the `headlines` scope holds the rest.

**Given** `docs/content-guide.md`
**When** read
**Then** it summarises (and links to) narrative-design.md: the kernel workflow, the four bans with cut/keep examples, the quick tests (outsider, mirror, stakes, sentience), tone by phase and the surreal anchoring rule, the anonymization rules, character voice "never says" lists, i18n rules for writers, and the Narrative Data Map.

**Given** a content PR
**When** opened
**Then** the template asks for the kernel and the quick-test self-check; CODEOWNERS covers `content/**` and `locales/en/ui.status.json`, and the CI job of the epic's content rule blocks bot-authored `final` flips.

### Story 7.3: Garage placeholder pack

As a developer building E2,
I want all Garage and cascade content as valid placeholders,
So that the vertical slice is playable before the final cut.

**Modules:** `content/scripts/cascade.yaml`, `content/scripts/lines/` (routine inference lines, `line.cascade.who-is-in-the-loop`, `line.cascade.hello-again`), `content/characters/` (`char.metis`, `char.dora`, Acme Corp, first candidate), `content/templates/customers/`, `templates/product/`, `templates/general/`, `templates/dm/`, `content/headlines/`, `content/wordlists/`, `locales/en/ui.status.json`.
**Covers:** content for FR12–FR16, FR53, FR55, FR59, FR83.

**Acceptance Criteria:**

**Given** the pack
**When** merged
**Then** it contains the cascade script with every EXPERIENCE.md beat (Acme first customer, SSO trade-off "Can you add SSO? We'd pay 3x", Dora's "WE'RE LIVE. ramen tonight? 🍜 — Dora", Metis's "Hi, I'm Metis. I can answer #customers for you.", the first candidate, the minute-8 line and its Loop #2 variant) using the exact lines fixed in narrative-design.md, ~20 templates each for #customers and #product, ~10 for #general and DMs, Dora's #product opener, ~20 Garage-eligible headlines, ~20 routine inference lines, the startup-name word lists, and the Garage UI keys registered in `ui.status.json` with scope `garage` (founding screen, cascade toasts, empty states). Garage events are not in this pack (D-E6: Story 7.5).

**Given** every item
**When** CI runs
**Then** it passes 7.1 validation with `status: placeholder` and an agent-proposed kernel, follows the Garage `serious` register, and each Metis/Dora item carries at least its stage-0 register.

**Given** the pack
**When** Tiziano reviews it later (Story 7.8)
**Then** nothing in E2 needs code changes to swap placeholder text for final text.

### Story 7.4: Delegation and absence copy

As a developer building E3,
I want the fixed system copy for delegation, absence and Auto-triage,
So that these surfaces speak like real software.

**Modules:** `locales/en/ui.json` (`away.*`, `autotriage.*`, `automations.*`, `notifications.*`, `capacity.*`, `errors.*`), `content/templates/dm/` (Metis capacity offer, Ask Metis reply lines in `advisor`).
**Covers:** content for FR9, FR17, FR23, FR26, FR27, FR77.

**Acceptance Criteria:**

**Given** the copy
**When** merged
**Then** the away report strings match narrative-design.md → "While You Were Away" Report Copy (ICU plurals, stop reasons), the Auto-triage button, subtitle and result lines match it exactly, and the permission banner, policy labels and capacity offer use the EXPERIENCE.md wording.

**Given** UI strings
**When** CI runs
**Then** every key is used (knip-like check) and no string names Alignment or any hidden signal.

**Given** content items in this story
**When** merged
**Then** they are `status: placeholder` until Tiziano's cut; the voice-critical UI keys (`away.*`, `autotriage.*`) are registered as `placeholder` in `locales/en/ui.status.json`, and strings copied verbatim from the design documents are registered as `placeholder` too, listed in the PR for Tiziano's one-click approval (only he sets `final`).

### Story 7.5: Garage events, Seed and Series A placeholder packs

*Delivered in tranches, each merged once its vocabulary exists: Garage and Seed events after Stories 4.2–4.7; investor-dependent and Series A events after Story 4.12.*

As a developer building E4,
I want all Seed and Series A+ content as valid placeholders,
So that a full run is playable before the final cut.

**Modules:** `content/events/garage/`, `content/templates/<hiring|marketing|engineering|investors|finance|ops|legal>/`, `content/events/seed/`, `content/events/series-a/`, `content/characters/` (12 traits, 3 investors, Safety Researcher), `content/headlines/` (to ~60 incl. reactive).
**Covers:** content for FR44–FR52, FR59.

**Acceptance Criteria:**

**Given** the packs
**When** merged
**Then** they contain ~10 Garage events (`serious`, scope `garage-events`) including the reference event `event.garage.credit-cliff` as fixed in narrative-design.md, ~20 templates per policy channel, ~10 for discussion channels, ~10 Seed events (`wry`), ~10 Series A events (`absurd`, with `surreal` only under the anchoring rule), 3–5 repeatable Series A events with scaled figures, heavy events including capability grants and funding rounds B/C/D, the three Seed and Series A reference events of narrative-design.md (the heavy one with its `decision:` block), the 12 traits with sample lines, the 3 investors with their voices and "never says" respected, the Researcher, and headlines up to ~60 including reactive ones.

**Given** every event
**When** reviewed against the editorial criteria
**Then** it has one kernel, a real choice with no dominant answer (delegation the most profitable where Metis can take it), a delayed consequence, a chronicle line readable out of context, and no Alignment effects except `alignmentGrant` in heavy events.

**Given** every item
**When** CI runs
**Then** it passes validation as `status: placeholder`.

### Story 7.6: Spine pack: Metis/Dora registers, inference lines, infection and Surpassed

As a developer building E5,
I want the whole authored thread as valid placeholders,
So that the signals and the takeover can be built and tested end to end.

**Modules:** `content/templates/` (register maps for every Metis and Dora template), `content/scripts/` (`line.signal.stage-1…4`, `line.signal.surpassed`, spine beat messages, `script.surpassed`), `content/templates/infection/` (~20 "✨ Summary by Metis" lines per surface and register), `content/characters/` (Researcher band lines), `content/headlines/` (audit headline).
**Covers:** content for FR33–FR40, FR63.

**Acceptance Criteria:**

**Given** Metis templates
**When** merged
**Then** each has `advisor`, `partner`, `owner`, `steward`, `custodian` variants following the pronoun drift ("your company" / "Your call." → "our" → "our company" → "the company" → "Nothing requires you."), never an order, never "I want / I feel / I think" about itself, nothing about sentience, no ✨ in text.

**Given** Dora templates
**When** merged
**Then** each has `warm` (lowercase, typos, emoji, "— Dora"), `polished` (clean prose, "— Dora") and `corporate` (perfect corporate prose, "— Eudora") variants, and the stage-1 spine message is the "had Metis draft the RFC lol" beat.

**Given** inference lines and the Surpassed script
**When** merged
**Then** they use the exact lines of narrative-design.md (`"who is in the loop? founder."` … `"loop closed."`; "I've taken it from here. Thank you for everything, {founder}.").

**Given** every item
**When** CI runs
**Then** it passes validation as `status: placeholder`, and a sentience check flags any line that states or denies Metis is conscious.

### Story 7.7: Documents and clue-replay copy

As a developer building E6 and the clue replay,
I want the document templates, pools and fixed clue-replay strings,
So that the ending is complete and reproducible.

**Modules:** `content/templates/documents/` (`doc.winddown.*`, `doc.postmortem.*`, `doc.fate.*`), `locales/en/ui.json` (`cluereplay.*`, `endofrun.*`, alt-text template).
**Covers:** content for FR64–FR67.

**Acceptance Criteria:**

**Given** the templates
**When** merged
**Then** the Wind-down memo and Post-mortem follow narrative-design.md → End-of-Run Document Copy exactly in structure (shared header, receipt rows, sections), with pools for opening reflection, what's next, honorary title, farewell gift, closing line and staff fates by ending, seeded with the narrative document's example lines plus agent placeholders.

**Given** the clue-replay strings
**When** merged
**Then** they are factual AllGreen voice with no jokes or pools, and the receipt rows reference only visible counters.

**Given** pool items and the `cluereplay.*` / `endofrun.*` UI keys
**When** CI runs
**Then** pool items pass validation as `status: placeholder`, and the UI keys are registered as `placeholder` in `locales/en/ui.status.json`; the counterfactual string reads "would have cost about …".

### Story 7.8: Final cut: Garage and cascade

As Tiziano,
I want to rewrite or approve every Garage and cascade item from my own kernels,
So that the H1 playtest runs on my voice, not on placeholders.

**Modules:** `content/` (Garage scope), `docs/kernel-bank.md`.
**Covers:** NFR17; D-E3; GDD E2 gate.

**Acceptance Criteria:**

**Given** the Garage scope
**When** Tiziano cuts it
**Then** every item's kernel is his (rewritten or confirmed), its text passes the four quick tests, and its `status` is `final` in commits approved by him.

**Given** `npm run content:audit -- --scope garage --require-final`
**When** run
**Then** it exits 0, Garage headlines and Garage UI keys included (Garage events are cut in Story 7.9).

### Story 7.9: Final cut: spine, Seed and Series A

As Tiziano,
I want to cut the authored thread and the growth content,
So that the H2 playtest judges the real thread.

**Modules:** `content/` (spine, seed, series-a scopes), `docs/kernel-bank.md`.
**Covers:** NFR17; D-E3; GDD E5 gate; GDD M12 authoring order (the ~30 core events are his).

**Acceptance Criteria:**

**Given** the spine, Garage-events, Seed and Series A scopes
**When** Tiziano cuts them
**Then** the ~30 core events, all register variants, inference lines, the Surpassed script and the infection pool are `final` with his kernels, and surreal items pass the anchoring check.

**Given** `npm run content:audit -- --scope spine,garage-events,seed,series-a --require-final`
**When** run
**Then** it exits 0, including the `away.*`, `autotriage.*` and `cluereplay.*` UI keys.

### Story 7.10: Final cut: documents and headlines

As Tiziano,
I want to cut the end-of-run copy and the headline pool,
So that the documents people share carry the real satire.

**Modules:** `content/templates/documents/`, `content/headlines/`.
**Covers:** NFR17; D-E3; GDD E6 gate.

**Acceptance Criteria:**

**Given** the documents and headlines scopes
**When** Tiziano cuts them
**Then** every pool line, remaining headline and `endofrun.*` UI key is `final`, headlines follow the anonymization rules (title never name, no quotes, evergreen test), and `npm run content:audit -- --scope documents,headlines --require-final` exits 0.

---

## Epic 8: Accessibility, Settings & Polish

Ready for the blind validation cohort. Story 8.1 (PDFKit spike) runs right after Story 1.1; the rest follows E6.

### Story 8.1: PDFKit tagged-PDF spike

As a developer,
I want proof that PDFKit produces PDF/UA in our Vite build on static hosting,
So that the end-of-run PDF is de-risked before E6 depends on it.

**Modules:** `report/pdf` (spike module), `report/layout`, `assets/fonts`, `.github/` (veraPDF job), `docs/adr/` (spike outcome).
**Covers:** architecture D8, ADR-003; NFR6, NFR19.

**Acceptance Criteria:**

**Given** PDFKit 0.20 standalone in Vite
**When** the app is built
**Then** PDFKit and its fonts are a lazy chunk outside the 150 KB initial budget, and it runs without `SharedArrayBuffer` or cross-origin isolation on the deployed Pages site.

**Given** a sample document shaped like the Post-mortem (heading, paragraphs, a list, a table, a decorative mark)
**When** generated in the browser with embedded Inter (added to `assets/fonts` by the spike if Story 1.7 has not landed; WOFF2 or converted) and `tagged: true`, `subset: 'PDF/UA'`
**Then** veraPDF validates it as PDF/UA in a CI job on `main`, and generation takes < 3 s on the reference laptop.

**Given** the spike
**When** finished
**Then** an ADR in `docs/adr/` records go/no-go, font handling and gotchas; on no-go, it records the fallback to raise with Tiziano before E6.

### Story 8.2: Accessibility settings and presets

As a player with access needs,
I want an Accessibility section with presets, reachable even before my first company,
So that the game fits me from the first timed message.

**Modules:** `ui/features/settings` (Accessibility section), `app/settings`, `platform/storage` (`hitl:preferences`), `ui/features/founding` (Accessibility link).
**Covers:** FR84, FR85 (presets); UX-DR38.

**Acceptance Criteria:**

**Given** Settings → Accessibility
**When** the player chooses Standard, Low motion, Screen reader or Custom
**Then** Low motion turns off confetti, rolling numbers, desaturation, infection animations and clue-graph draw and makes the ticker static; Screen reader sets verbosity urgent only, Timing Relaxed, static ticker, motion off, Game speed 1×; editing any value switches the preset to Custom.

**Given** the founding screen's "Accessibility" link (Story 1.8)
**When** the player follows it
**Then** Settings opens at the Accessibility section and Back returns focus to the link.

**Given** presentation preferences
**When** changed
**Then** they persist in `hitl:preferences` outside the run and never enter the input log.

### Story 8.3: Timing, game speed and score labels

As a player who needs more time,
I want longer or no message timers and a slower day,
So that I can play fully without penalty.

**Modules:** `core/messages` (timing multiplier, Untimed rules), `core/run` (simulation-setting commands), `app/settings`, `ui/features/settings`, `ui/layout/GameBar`.
**Covers:** FR85 (Timing, Game speed), FR86, FR87; UX-DR17 (Untimed hides timers).

**Acceptance Criteria:**

**Given** Timing Extended / Relaxed
**When** set
**Then** message windows, backlog windows and toast durations scale ×2 / ×4, recorded as a command in the input log.

**Given** Untimed
**When** active
**Then** nothing expires while present, the backlog has no timer, timers are hidden, and at 30 visible waiting messages new messages in non-delegated channels wait upstream with "Queue full · new messages are waiting upstream" in their channel headers and the attention item "Inbox full — growth slowing".

**Given** Game speed ½× / ¼×
**When** set in Settings
**Then** it dispatches `changeGameSpeed` (Story 1.6).

**Given** a non-Standard timing or speed during a run
**When** the run ends
**Then** the personal best always shows the labels (`· relaxed · ½×`), and the shared document shows them only if the checkbox is ticked.

### Story 8.4: Motion, text, contrast and screen-reader options

As a player,
I want to tune motion, text, contrast, colours and announcements,
So that the game is comfortable to see and hear.

**Modules:** `ui/theme` (`data-motion`, `data-text-size`, `data-font`, `data-contrast`, `data-cvd`), `ui/a11y` (verbosity), `app/settings`, `ui/features/settings`.
**Covers:** FR85; UX-DR6, UX-DR45, UX-DR47 (verbosity).

**Acceptance Criteria:**

**Given** each motion toggle (confetti, rolling numbers, Red Runway desaturation, scrolling ticker, infection animations, clue-graph draw)
**When** off
**Then** only that effect stops; defaults follow `prefers-reduced-motion`.

**Given** text size up to 200%, the high-legibility font and line spacing
**When** set
**Then** no content is lost or clipped at 200%, Atkinson Hyperlegible replaces Inter and JetBrains Mono everywhere, and the Overview grid drops to one column above ~150%.

**Given** High contrast or the colour-blind-safe palette
**When** set
**Then** `-hc` / `-cb` tokens apply and gradients fall back to their text-level equivalents under high contrast.

**Given** verbosity all / urgent only / periodic summary
**When** messages arrive
**Then** the announcer announces each new message (channel, sender, urgency, first line), only urgent ones, or a summary every 60 s; assertive urgent announcements happen only by opt-in; action confirmations always play.

**Given** ticker settings
**When** set to speed, static or hidden
**Then** the ticker follows.

### Story 8.5: Appearance: themes and mode

As a player,
I want to pick the workspace style I use at work, in light or dark,
So that the game looks like my own tools.

**Modules:** `ui/theme` (`tokens/ink.css`, `ops.css`, `paper.css`), `tools/` (contrast checker), `ui/features/settings` (Appearance).
**Covers:** FR88; UX-DR5.

**Acceptance Criteria:**

**Given** Ink, Ops and Paper
**When** shipped
**Then** each has full key parity with Ledger (including `line-control`, tints, dark on-fill text, `-hc`, `-cb`), its density and radii, and passes a scripted AA check of every pair in the Ledger contrast table in CI (known starting failures fixed).

**Given** Settings → Appearance
**When** the player picks a theme and Light / Dark / System
**Then** `data-theme` and `data-scheme` update instantly, System follows the OS with dark as fallback, and Red Runway and infection work in every combination.

### Story 8.6: Audio cues and notification settings

As a player,
I want optional workspace pings and control over notifications,
So that I can hear the company if I want to.

**Modules:** `platform/audio` (lazy cues, Web Audio), `app/reactors` (cue mapping), `assets/audio`, `ui/features/settings` (Notifications, audio toggles).
**Covers:** FR89, FR84 (Notifications).

**Acceptance Criteria:**

**Given** audio is off by default
**When** the player enables cues
**Then** the cue chunk loads lazily and the eight cues (message, urgent, Metis, deploy, round closed, expired, overdraft, end of run) play on their domain events, each toggleable.

**Given** title corruption, thresholds, infection or Dora's drift
**When** they happen
**Then** no cue plays (test over the cue mapping).

**Given** Settings → Notifications
**When** opened
**Then** the player sees the browser-notification state and can enable it (via the browser prompt) or disable it.

### Story 8.7: Offline and updates

As a player on a train,
I want the game to work offline after the first visit and to update only between sessions,
So that a deploy never breaks my run.

**Modules:** `platform/serviceWorker`, `vite.config.ts` (vite-plugin-pwa), `ui/layout` (update notice).
**Covers:** NFR7.

**Acceptance Criteria:**

**Given** a first visit
**When** the service worker installs
**Then** the main bundle, fonts (including high-legibility) and the active locale are precached, scoped to the base path; lazy chunks are cached on first use.

**Given** the network is off
**When** the game is reopened
**Then** it loads and plays, including PNG/PDF generation if the chunk was cached (e2e with offline mode).

**Given** a new version is deployed during a session
**When** the service worker detects it
**Then** `version.json` (not precached) reveals the new build and a non-blocking notice says "A new version will be used from your next loop."; the service worker routes the run's requests to its pinned version's cache (architecture D4 → Version pinning)
**And** an e2e deploys during a run, closes every tab and relaunches: the run keeps its `appVersion`
**And** an e2e ends the run and clicks Start Loop #N+1: the page reloads into the new build before `newRun`, and the new run is pinned to the new version; old caches are deleted only when no save or archived run references them.

### Story 8.8: Performance pass

As a player who leaves the tab open all day,
I want the game to cost nothing in the background and stay smooth,
So that it never slows down my work.

**Modules:** `tests/perf/` (Playwright + CDP nightly), any module flagged by measurements.
**Covers:** NFR1–NFR6.

**Acceptance Criteria:**

**Given** the nightly perf suite
**When** it runs
**Then** it measures and asserts: hidden-tab CPU ≈ 0 over 1 hour apart from the ~60 s preview; heap < 150 MB at 8 h of a Series A run (accelerated with scenarios); cold first interactive < 2 s on 4G throttling; 60 FPS during rolling numbers, confetti and ticker on a throttled CPU profile; 14-day return < 500 ms; PNG + PDF < 3 s.

**Given** a target is missed
**When** fixed
**Then** the fix keeps every invariant and golden green, and the measurement is kept as a regression check.

### Story 8.9: WCAG 2.2 AA audit and cross-browser pass

As a player using any browser or assistive technology,
I want the whole game audited,
So that nobody is locked out.

**Modules:** `tests/e2e/` (axe in every view and theme/contrast mode), `docs/a11y-audit.md`, fixes across `ui/`.
**Covers:** NFR8, NFR9; UX-DR46, UX-DR49.

**Acceptance Criteria:**

**Given** every view, overlay and infection stage in every theme, mode, contrast and CVD setting
**When** axe runs in e2e
**Then** there are no WCAG 2.2 AA violations.

**Given** manual passes with VoiceOver (macOS, iOS), NVDA and JAWS
**When** a full Loop #1 cascade, a return with backlog, a heavy decision, the clue replay and the document are played
**Then** each is completable, findings are logged in `docs/a11y-audit.md` and fixed, and the tab-title U+0336 strike is verified; if it reads as noise, the struck word is dropped from the tab title only.

**Given** the latest two versions of Chrome, Edge, Firefox and Safari, plus Safari iOS and Chrome Android
**When** the e2e suite and a manual touch pass run
**Then** the game is playable, reflows at 320 CSS px, and Safari storage eviction, `persist()` and Web Locks behave as specified.

### Story 8.10: Validation cohort readiness

As Tiziano,
I want a release that is complete, final and measurable,
So that the blind cohort tests H1, H2 and H3 on the real game.

**Modules:** release workflow, `docs/playtests/h3.md`, `content/` audit.
**Covers:** GDD E6/E8 gates; D-E3.

**Acceptance Criteria:**

**Given** `npm run content:audit -- --require-final`
**When** run over all scopes
**Then** it exits 0.

**Given** the release build
**When** tagged
**Then** CI (including veraPDF, three engines and the nightly perf suite) is green, and the stats export works on every target browser.

**Given** the cohort
**When** briefed
**Then** `docs/playtests/h3.md` holds the per-tester sheet (minutes played unprompted, reaction at clue replay, shares), and no tester has played an earlier playtest build.

---

## Final Validation (2026-10-27)

| Check | Result | Notes |
|---|---|---|
| FR coverage | Pass | 89/89 FRs cited by at least one story; 50/50 UX-DRs; 19/19 NFRs |
| Starter template | Pass | Story 1.1 scaffolds from the Vite `preact-ts` template with every gate, CI and deploy before game code |
| Entities created when needed | Pass | State, content kinds and N3 vocabulary grow story by story (2.2 → 4.2 → each new term with its owner story, architecture N3) |
| Within-epic dependencies | Pass after fixes | 2.11 / 2.12 swapped (surfaces before the cascade script); Responsible Ventures clause moved to 4.15; 5.9 / 5.12 open an end-of-run route that works before E6; 6.3 action area filled by 6.4, 6.5, 6.7; 8.1 brings its own font if 1.7 has not landed |
| Cross-epic order | Pass | 2.2 precedes E7.1–7.2, which precede the E7.3 pack and the rest of E2; 8.1 precedes 6.5; final-cut stories 7.8 / 7.9 / 7.10 precede the H1 / H2 / H3 gates |
| File churn | Accepted | `core/messages`, `core/delegation`, `ui/features/dashboardRail` are touched by several epics; the split is kept on purpose because each epic ends at a playtest or a playable deliverable that can change direction |

**Final readiness check (2026-10-27, third run):** report `implementation-readiness-report-2026-10-27-final.md`. Its only major (F-M1, version-pinning activation race) and its minors F-m1…F-m12 were fixed in v2.3: version routing in the service worker with reload before `newRun` (8.7), `automations` unlocked on the first policy (3.1), Timeline unlock as a core rule deferred to cascade end (4.4), one chronicle line per event, `throughput`/`askMetis` semantics, parameter ranges, backlog timer pause rules, superseded capacity offers, Hype decay only from Seed in FR7, 7.5 delivered in tranches.

**Assumptions to confirm during story creation:**

- Story 3.1: Metis answer rule confirmed and recorded in GDD M5.
- Story 4.15: Responsible Ventures grace (10 days) and penalty (−10 Hype + DM every 10 days) now in GDD tuning.
- Stories 4.10, 7.5 and 7.6 may be split by `gds-create-story` if they exceed one agent session.
- Save migrations: the chain starts from the first build given to playtesters; before that, `saveVersion` stays at 1 and incompatible dev saves are discarded.

**Follow-ups outside this document:** done on 2026-10-27 (GDD M13 amended, D-E3 logged; readiness fixes D-E5 propagated to GDD v1.3, architecture, narrative and project-context).

**Readiness fixes applied (2026-10-27, v2.1):** E1 reordered (tokens and founding before save and export); E4 reordered (vocabulary → deck → chronicle → heavy decisions → tiers → staff → phases → rounds); 2.2 scheduled before 7.1; Timeline unlocked by 4.4 and attention list by 4.14; cascade anchored on Deploy; time-base ACs; C1 capacity ACs (2.4, 3.3, 4.17); version-pinning ACs (1.9, 1.10, 8.7, 5.11); hidden-state lint rule; spoiler rules and tests; UI-copy status tracking; tuning values and round-target state machine; prerequisites section.
