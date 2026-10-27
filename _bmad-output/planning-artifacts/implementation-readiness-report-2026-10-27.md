---
stepsCompleted: [step-01-document-discovery, step-02-gdd-analysis, step-03-epic-coverage-validation, step-04-ux-alignment, step-05-epic-quality-review, step-06-final-assessment]
date: 2026-10-27
project: browser-game (Human in the Loop)
assessor: gds-check-implementation-readiness (Game Producer / Scrum Master role), run unattended for Tiziano
documentsIncluded:
  gdd: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md
  gddDecisionLog: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md
  epics: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md (v2.0, 94 stories)
  architecture: _bmad-output/game-architecture.md
  projectContext: _bmad-output/project-context.md
  narrative: _bmad-output/narrative-design.md
  ux:
    - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md
    - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-10-27
**Project:** browser-game (Human in the Loop)
**Scope:** GDD v1.2 (+ decision log), narrative-design.md v1.0, DESIGN.md + EXPERIENCE.md, game-architecture.md v1.0, project-context.md, epics.md v2.0 (8 epics, 94 stories).

Severity scale used for findings: **critical** (blocks implementation or breaks a core promise if built as written), **major** (an AI dev agent would have to guess, or two documents give conflicting instructions), **minor** (inconsistency or gap that is cheap to fix and unlikely to derail a story). Every finding has an ID (C*, M*, m*) used throughout.

## Document Discovery

The configured search patterns (`{planning_artifacts}/*gdd*.md`, `*architecture*.md`, `*epic*.md`, `*ux*.md`) match nothing at the top level of `planning-artifacts/`, because the documents live in sub-folders or in `_bmad-output/`. The documents were therefore selected as specified by the requester.

| Type | File | Size | Modified | Format |
|---|---|---|---|---|
| GDD | `planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md` | 72 KB | 2026-10-27 16:09 | Whole |
| GDD decision log | `…/gdd-browser-game-2026-10-26/decision-log.md` | 28 KB | 2026-10-27 16:09 | Whole |
| Epics & stories | `…/gdd-browser-game-2026-10-26/epics.md` (v2.0) | 177 KB | 2026-10-27 15:57 | Whole |
| Architecture | `_bmad-output/game-architecture.md` | 90 KB | 2026-10-27 16:09 | Whole |
| Project context | `_bmad-output/project-context.md` | 17 KB | 2026-10-27 10:23 | Whole |
| Narrative | `_bmad-output/narrative-design.md` | 67 KB | 2026-10-27 16:09 | Whole |
| UX (visual) | `planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md` | 41 KB | 2026-10-26 18:52 | Whole |
| UX (behaviour) | `…/ux-browser-game-2026-10-26/EXPERIENCE.md` | 36 KB | 2026-10-27 10:08 | Whole |

**Duplicates:** none. No document exists in both whole and sharded form.
**Not used:** `planning-artifacts/briefs/…` (upstream of the GDD), UX `mockups/`, `.working/`, `review-*.md`, `validation-report.*` (EXPERIENCE.md and DESIGN.md state that the spines win over any mock), `brainstorming-session-2026-10-26.md`.
**Missing:** none of the required types.

## GDD Analysis

### Functional Requirements

GDD v1.2 has no numbered FRs. The numbered inventory in epics.md v2.0 (FR1–FR89) was extracted from the GDD, EXPERIENCE.md, DESIGN.md and narrative-design.md; it was checked against every GDD mechanic (M1–M13), Controls, Accessibility, Technical Specifications and Success Metrics. Full text as stated in the inventory:

- FR1: Game time advances continuously while the tab is visible: 1 real minute = 1 game day at Game speed 1×; ½× and ¼× stretch a game day to 2 and 4 real minutes without changing the economy per game day or message windows.
- FR2: Clock states: the clock runs in normal play and during the cascade; it is paused while a heavy decision, the away report, Settings or the shortcut overlay is open; during the backlog queue the game clock is paused and only the top backlog item's timer runs; on the first workspace screen the clock does not start until Deploy.
- FR3: Every run starts identically: Cash $12,400, Garage burn ~$400/game day (31-day runway), Hype 20 (hidden until Seed), Alignment 100, Garage phase, Dora as co-founder, Metis on Aegis-N.
- FR4: One economy step per game day: Cash += MRR / 30 − burn; burn = base costs by phase + headcount burn (Σ salaries × headcount^1.2 / headcount) + compute cost.
- FR5: New customers/day = 2 + 0.1 × Hype at Garage (Seed ×3, Series A ×10), capped by Compute; baseline churn 0.1%/day; churn rises sharply above 90% GPU utilization.
- FR6: Pricing tiers: Self-serve $49/mo (Garage); Team $499/mo from Seed (share of new customers = Hype / 200, max 45%); Enterprise $5k–50k/mo from Series A via events only.
- FR7: Hype is an index 0–100 that decays ~2%/day of its current value and moves with launches, posts, viral events, flops and scandals.
- FR8: Compute: GPU capacity in units (1 unit = 100 load); load per customer by tier (1 / 5 / 50); 0.5 load per Metis answer for that game day; "Add capacity" buys units immediately (cost/day added to burn, confirmation by toast, no dialog).
- FR9: At 100% GPU utilization Metis DMs a capacity offer ("✨ Provision N units · +$X/day" / "Not now"); accepting is a player purchase that never moves Alignment; delegated messages that cannot be served expire with their default outcome.
- FR10: Implied valuation = ARR × Hype multiple (10× at Hype 20 → 60× at Hype 90, linear, clamped 10–60×); peak valuation = max of every round post-money and every implied valuation in the run.
- FR11: All money uses Stripe-style notation: full digits below $100,000, compact above ($412.5K, $12.4M, $2.03B).
- FR12: Messages arrive in channels and DMs from customers, staff, investors, vendors, Dora and Metis; each has sender, channel, urgency, stakes, `default_answer` and 2–3 answers resolvable in 1–2 clicks.
- FR13: Inbound cadence by phase: Garage 1 / 10–15 s; Seed 1 / 6–10 s; Series A+ 12/min at entry, +2/min per later round, cap 40/min.
- FR14: Response windows while present: low 120 s, normal 75 s, urgent 45 s (scaled by Timing). On lapse the message expires and applies `default_answer`, unless a delegation policy covers the channel, in which case Metis answers.
- FR15: Templates are drawn per channel, weighted by phase and company state, with no exact repeat within min(10, pool size − 5) messages in that channel.
- FR16: Answer buttons never preview effects; after a click the affected KPIs roll to the new value with a delta flash; answers on `chronicle_worthy` templates write a chronicle line.
- FR17: Ask Metis (`D`) on any message: Metis answers instantly in the thread ("✨ Metis replied: …"), counts as an AI decision, consumes Compute; disabled with an inline reason at capacity or during an audit pause.
- FR18: Assign (`A`) opens the staff picker; the message shows "Assigned to <name> · in queue (N)"; each named staff member resolves one assigned message per ~30 real seconds while the player is present; hidden before the first hire.
- FR19: One message per view is "current"; it moves only with `J`/`K`, a click, `U`, or after the player answers (to the next unanswered); new arrivals never move focus or the current marker.
- FR20: The player is away when the tab is hidden or closed. With at least one delegation policy active the whole company advances during the absence (burn, revenue, events, Metis answers in delegated channels); non-delegated messages go to the backlog. With no policy active, no time passes.
- FR21: One absence simulates at most 14 game days; it stops at the first heavy decision (the rest is discarded) or at death; staff work only their already-assigned queue.
- FR22: The backlog keeps at most 15–20 messages ranked by importance (urgency > stakes > age); overflow expires with its default and is counted in the report; backlog messages do not expire while away.
- FR23: "While you were away" report (LGTM Docs overlay, factual, never presented by Metis): days away, Cash / MRR / Customers deltas, Metis answers per channel, notable Metis decision types, team-resolved count, expired count, waiting count, and the stop reason if stopped early. It never mentions hidden signals. No report when no policy was active.
- FR24: Return order: report → waiting heavy decision → backlog queue → workspace. Death during an absence: report → death sequence.
- FR25: Backlog queue replaces the chat pane: the top item has a 10–15 s window that starts when it reaches the top; on lapse its default applies and the next rises; the player may leave the queue ("Backlog N" in the sidebar returns).
- FR26: "✨ Auto-triage N messages" ("Metis will reply based on your previous decisions."): one click, no confirmation, hands the remaining backlog to Metis; each item counts as a delegated answer; at capacity it serves what it can and reports "Metis replied to N · M expired (at capacity)"; disabled during an audit pause.
- FR27: Per-channel policy toggles ("Metis handles #channel"), shown with identical state in the channel header and on the ✨ Automations page. Policy-capable channels and stakes: Garage #customers (low), #product (medium); Seed #hiring (high), #marketing (medium); Series A #finance, #ops, #legal (high). #general, #engineering, #investors and DMs have no policy and count as medium stakes.
- FR28: An active policy answers every message in its channel live, during absences and on would-be expiry; every Metis answer consumes Compute and drifts Alignment.
- FR29: Hidden Alignment starts at 100. Drift per AI decision (policy answer, Ask Metis, Auto-triage, policy-covered expiry) = base −0.02 / −0.05 / −0.10 by stakes × phase multiplier 0.5 / 1.0 / 1.5.
- FR30: Capability grants (heavy events only) apply a one-shot Alignment drop of −5 to −15 via `alignmentGrant`; no other content may affect Alignment directly.
- FR31: Recovery: Pause Metis for audit (all policies forced off 3 game days, −10 Hype, +5 Alignment, 30-day cooldown, the only workspace confirmation dialog); passive +0.1/day on game days where AI share of decisions < 20%; Alignment never rises above the last threshold crossed.
- FR32: Thresholds 75 / 50 / 25 / 10 advance `signalStage` (0–5), which never decreases; Alignment 0 triggers Surpassed.
- FR33: A signal table maps each stage to `titleStage`, `infectionLevel`, `metisRegister` (advisor / partner / owner / steward / custodian) and `doraRegister` (warm / polished / corporate); signal state updates immediately and silently at the crossing.
- FR34: Corrupting title in the game bar and the browser tab title: `Human in the Loop` → (75) `Human ~~in~~ the Loop` → (50) `~~Human~~ in the Loop` → (25) `Human out of the Loop` → `No Human in the Loop` at Surpassed only; never repairs.
- FR35: Metis and Dora message text is chosen by register when the message is created (never changes after arrival); missing registers fall back to the nearest earlier one; Dora signs "— Dora" until `corporate`, then "— Eudora".
- FR36: Spine beat queue (breathing room): beat content (odd inference-log line `line.signal.stage-1…4`, spine messages such as Dora's "had Metis draft the RFC lol") fires at max(crossing, end of a 5-game-day cooldown after any funding round closes, last beat + 3 game days); one beat at a time in threshold order; queued beats survive save/reload; pending beats are dropped when Surpassed starts.
- FR37: UI infection stages 1–4 are presentational only (never change layout, controls, roles or accessible names).
- FR38: All Alignment signals are silent: no toast, sound, announcement, domain event or away-report mention; they are readable as plain text when the player reaches them.
- FR39: Safety Researcher: hireable from Seed (#hiring ATS card), one per run, salary ~2×; posts a reading in DM every 7 game days and on request ("Ask for a reading"): band (🟢 ≥ 75 / 🟡 50–<75 / 🟠 25–<50 / 🔴 < 25) + 7-day trend arrow; never a number.
- FR40: Metis's name renders struck through (~~Metis~~) during an audit pause; every Metis action shows "Paused for audit · N days"; the pause button shows "Available in N days" during cooldown.
- FR41: Heavy decisions open as non-dismissable LGTM Docs / AllGreen overlays ("A decision is required") that pause the game; never closer than ~5 game days apart; overlays never stack.
- FR42: Probabilistic heavy decisions resolve on submit with a seeded success roll; the doc gains an Outcome section (result + KPI deltas) and a single Close; crises flip the AllGreen status chip; a toast repeats the result.
- FR43: Capability grants are heavy events with a large immediate reward and an `alignmentGrant`; they are counted in the receipt and are primary clue-replay causes.
- FR44: Candidates arrive as a Garage DM message or, from Seed, as an ATS card in #hiring (Hire / Pass); unanswered candidates expire as Pass; each hire has 1–2 traits from the 12-trait pool; up to ~12 named staff, then anonymous headcount groups ("Engineering (34)").
- FR45: Each of the 12 traits has a mechanical effect (tuning data) and a writing effect (trait-specific lines in staff messages).
- FR46: Morale 0–100 per named staff (content ≥ 60 / strained 30–59 / leaving < 30); −5/day when assigned queue > 5, +2/day otherwise, events ±10–30; "leaving" resigns after 3 game days with a button-less DM; their queued messages return to the channel.
- FR47: Funding rounds are heavy decisions: Seed at MRR ≥ $5k, Series A at MRR ≥ $100k; Series B, C, D… as repeatable heavy events at each ×3 ARR inside Series A+.
- FR48: Each round offers three investor cards (radio group): Hypergrowth Capital (cash ×1.0 of top; MRR +15% per 30 days, misses −10 Hype + angry DM), Responsible Ventures (B Corp pending) (×0.6; must hire and keep the Safety Researcher), A Family Office (×1.5; board seat; imposes capability grants).
- FR49: Series A+ round target: ×3 ARR within 120 game days; two consecutive misses trigger a down round (−50% cash, −30 Hype).
- FR50: A phase transition unlocks its channels, policies, pricing tier and rail sections (highlighted rows, sections born expanded); Hype appears at Seed.
- FR51: Event deck per phase: N3 conditions, weight, cooldown; no repeat within a run unless `repeatable`; heavy decisions and capability grants are `heavy` events; events are 2–5-step chains with delayed `next` steps saved in the event queue; a chronicle line is written when a chain ends.
- FR52: Event cadence per phase (Garage ~1 / 3–4 active min after the cascade; Seed ~1 / 6–8; Series A+ ~1 / 5–8); deck exhaustion pauses events until the next phase; in Series A+ a pool of 3–5 repeatable events recurs with figures scaled to company size.
- FR53: Founding screen: company name prefilled from a generator with 🎲 regenerate (announced politely), max 40 chars, required; "Your name" required, max 30 chars; an Accessibility link; Enter or "Found company" submits and focus lands on Deploy; both names are remembered as next loop's prefill.
- FR54: First workspace screen: `$12,400` and `Deploy` only; it waits indefinitely.
- FR55: Loop #1 cascade per EXPERIENCE.md → The Cascade: each micro-beat adds exactly one element (MRR, Customers, chat, sidebar, #general + Dora, header, ticker, Runway, Metis DM, policy toggle, Headcount, inference log, chart, Activity / Timeline); ⏸ beats wait for their message to resolve or expire.
- FR56: Loop #2+ compressed cascade (~2 min, same beats); the minute-8 line becomes `> output: "hello again."`.
- FR57: Regions that are not unlocked are not rendered at all; a region appears with a ~1 s highlight and never re-locks during a run.
- FR58: Automatic append-only chronicle: one line per completed event and per chronicle-worthy decision (capability grants, funding rounds, named hires and resignations, phase changes), each with game day, actor (you / staff / Metis) and outcome; readable during the run as the Company timeline.
- FR59: News ticker in the header: standalone headlines ~1 per 2 game days, reactive headlines jump the queue; pause/play control; hover or focus pauses; speed, static or hidden setting.
- FR60: End-of-run highlights: 5–8 chronicle lines chosen deterministically (heavy decisions first, then highest absolute resource impact, ties by recency).
- FR61: Bankrupt: overdraft floor (Garage −$5,000; Seed+ −15% of last round raised), interest 0.5%/day on negative balance; death below the floor or after 14 consecutive game days below $0.
- FR62: Runway signals: < 30 days watch (amber tile + attention item); < 7 days Red Runway (critical tile + progressive desaturation with exemptions); cash < $0 Bridge Loan & Trust overdraft banner with daily countdown; at death "Account closed", controls `aria-disabled`, "View wind-down memo" focused, no auto-advance.
- FR63: Surpassed sequence (advance mode `ending`): Metis posts "I've taken it from here. Thank you for everything, {founder}." in #general; controls lock one by one (~300 ms apart) and answer "You don't have permission to perform this action."; title becomes `No Human in the Loop`; inference line `line.signal.surpassed`; only "Open incident report" stays live and receives focus.
- FR64: Clue replay (AllGreen incident, in-game only): Alignment curve revealed over valuation with the crossing; top-5 drift causes (capability grant, Auto-triage batch, delegated night) with day and original message quoted; counterfactual estimate ("would have cost about $X and N days of runway"); signals timeline (minute-8 line, each title change, Dora's last "— Dora" and first "— Eudora", Researcher readings or row omitted); summary sentence and "View data" table; Continue.
- FR65: End-of-run documents: Wind-down memo (Bankrupt, signed by the founder) and Post-mortem (Surpassed, "Prepared by Metis · Running on Aegis-N"); shared header `Loop #N · N days in the loop · Peak valuation · Best`; 5–8 highlights; the receipt; staff fate lines; cause; Run ID footer; satirical lines drawn from pools with the `documents` RNG stream; no Alignment data or clue-replay detail.
- FR66: Receipt counters (visible only): Wind-down memo — messages answered personally, by the team, by Metis; team at peak; burn on the last day. Post-mortem — messages personally written in the last 90 days, messages handled by Metis, Auto-triage runs, nights away with policies on, capability grants.
- FR67: Document page actions: "Show timing setting on the document" (off by default; affects PNG and PDF only), Download PNG (1080×1350), Download PDF (tagged, A4/Letter, "Preparing PDF…", "Couldn't generate the PDF. Try again."), Copy alt text, Start Loop #N+1 (archives the document, opens the founding screen).
- FR68: Profile across runs: Loop #N, Aegis-N (N = Loop # + 3), personal best in days with timing/speed label, last company and founder names, archive of past documents (regenerable PNG/PDF); game bar shows `Loop #N · Best N days · Settings` ("Best" omitted until a first run ends).
- FR69: Opt-in local stats export (`HITL-STATS`): run length, % of decisions delegated over time, death type, game day of Surpassed, title stages reached, Safety Researcher hired.
- FR70: Every run has a seed shown as Run ID (`7F3A-K2`, Crockford base32); seed + input log (game-ms timestamps) + absence timestamps + simulation settings + content-pack version reproduce the run exactly.
- FR71: Autosave every game day, on `visibilitychange → hidden` and on `pagehide`; `navigator.storage.persist()` requested after the first meaningful action, with a non-blocking export nudge if denied.
- FR72: Data room export/import as a copyable code and a `.hitl` file (same content), encoded and checksummed, verified by replay; tampered or unverifiable imports are refused with no partial import; import and delete ask for confirmation.
- FR73: Only one live tab: other tabs show "Huddlr is open in another tab · Use here".
- FR74: Save migration across content-pack versions; unreadable saves show "We couldn't open this workspace." (Import a data room · Start a new loop); storage quota exceeded and persistence denied are shown as notices, never modals.
- FR75: A bug stops the clock, never persists the failing state, and shows "Something broke. Your save is safe." with Reload and Export diagnostic.
- FR76: Browser tab title `(N) <title>`, N = messages awaiting the player (channels + backlog), omitted at 0; while hidden, a ~60 s preview updates N only, using the real simulation on a throwaway copy; mirrors the title stages.
- FR77: Browser notification permission offered only at the first policy activation via the in-app banner ("Get notified when Metis needs you?" · Enable · Not now); notifications only for urgent messages and heavy decisions, at most one per minute; in-tab only if declined or unsupported.
- FR78: Toasts: max 3, bottom-right of the chat pane, auto-dismiss after 6 s × Timing multiplier (Untimed: until dismissed), paused on hover/focus; every toast, mention and notice is also written to Activity.
- FR79: Shortcuts: `1` `2` `3` answer · `D` Ask Metis · `A` Assign · `J`/`K` next/previous · `U` next unanswered (urgent first) · `Esc` close · `?` overlay · `G` then `C`/`D`/`M`; every key also works with `Alt`; never fire in text fields; single-key shortcuts can be turned off; region-gated shortcuts don't exist until their region is unlocked.
- FR80: Every action has a pointer and touch path; touch targets ≥ 44 px; no gestures or long-press required.
- FR81: Vanity rail in fixed order: attention list (0–3 worst conditions, recomputed daily and after every action), Overview tiles (Cash · Runway / MRR · Customers / Headcount · Hype), chart (Cash + MRR; Series A+ ARR + implied valuation), Team, Infrastructure, Growth sections, inference log, "Metrics by Vanity"; tiles never reorder.
- FR82: Workspace sidebar: company name, Backlog N (while one exists), Activity, Timeline, ✨ Automations, CHANNELS, DIRECT MESSAGES; unread bold, badge only for urgent; policy-active channels show ✨.
- FR83: Inference log (`Aegis-N · inference log`): routine lines while present, ~50 kept, collapsible, `aria-live="off"`; odd lines are indistinguishable from routine ones.
- FR84: Settings page (pauses the game): Appearance (theme, mode), Accessibility, Notifications, Data (export/import, stats export, archive, storage notice).
- FR85: Accessibility presets Standard / Low motion / Screen reader / Custom over: Timing (Standard / Extended ×2 / Relaxed ×4 / Untimed), Game speed (1× / ½× / ¼×), motion toggles, text size to 200 %, high-legibility font, line spacing, high contrast, colour-blind-safe palette, screen-reader verbosity (all / urgent only / periodic summary), ticker, per-cue audio. Timing and Game speed changes are input-log commands.
- FR86: Untimed: no expiry while present, no backlog timer, visible queue cap 30 ("Queue full · new messages are waiting upstream"; attention item "Inbox full — growth slowing").
- FR87: Non-Standard timing/speed is always shown on the in-game personal best (`213 days · relaxed · ½×`) and on shared documents only by opt-in.
- FR88: Four Appearance themes (Ledger default; Ink, Ops, Paper) × light/dark following the OS (fallback dark) with a toggle; high-contrast and colour-blind-safe variants.
- FR89: Eight audio cues (message, urgent, Metis, deploy, round closed, expired, overdraft, end of run), off by default, each with a visual equivalent; hidden signals are silent.

Total FRs: 89

### Non-Functional Requirements

- NFR1: Background tab CPU ≈ 0: no live simulation, animation or polling while hidden except the ~60 s tab-title preview (1-hour hidden sample).
- NFR2: Memory stable and < 150 MB after 8 hours of a Series A run (heap snapshot 0 h / 8 h); every growing collection is bounded (inference log ~50, toasts 3, logger 500, resolved messages ~200 per channel, rendered messages per view).
- NFR3: First interactive < 2 s cold on 4G, mid-range laptop; initial bundle ≤ 150 KB gzip (size-limit in CI); renderers, PDFKit, non-English locales and audio are lazy chunks.
- NFR4: 60 FPS sustained for rolling numbers, confetti and ticker on a 5-year-old laptop; animations only on `transform` and `opacity`.
- NFR5: A capped 14-day absence simulates and renders the report in < 500 ms (Series A save, mid-range laptop).
- NFR6: PNG and PDF generated in < 3 s.
- NFR7: Fully playable offline after the first load; zero runtime network calls (no CDN, fonts, analytics or remote config); service-worker updates apply on next launch, never mid-run.
- NFR8: Latest two versions of Chrome, Edge, Firefox, Safari on desktop; responsive to 320 CSS px; touch-playable on Safari iOS and Chrome Android.
- NFR9: WCAG 2.2 AA; fully playable by keyboard alone and with VoiceOver, NVDA and JAWS; 200% text without loss; text-spacing overrides honoured; no colour-only information; forced-colors support.
- NFR10: Determinism is release-blocking: replay ≡ live, snapshot + tail ≡ full replay, chunk invariance, golden runs, migration fixtures, e2e fingerprint, runtime desync detector.
- NFR11: Zero save-loss during the validation cohort; local autosave, persistent storage, export/import tested across browsers.
- NFR12: Every player-facing string comes from translation catalogs or content files from day one (English at launch); every number goes through `i18n/` formatters.
- NFR13: No backend, no accounts, no telemetry, no monetization, no ads; open source; nothing leaves the browser.
- NFR14: Hidden state is never exposed: Alignment never reaches the UI except through derived signals, `hiddenState.ts` (clue replay, debug) and the encoded export; shared documents pass only through `buildReportModel`.
- NFR15: Code Quality Charter enforced in CI (boundaries, complexity and size limits, jscpd, knip, Stylelint token-only CSS, no literal UI strings, comment rules, size-limit); CI green is the definition of done.
- NFR16: All `[tuning]` values live in `content/tuning.yaml`, never in code.
- NFR17: All content follows the Voice Principle and Voice Style Guide; nothing merges without Tiziano's final cut.
- NFR18: Anti-slop visual principle: the base workspace is crafted; AI-cliché visuals only on Metis surfaces and infection stages.
- NFR19: Hosting on GitHub Pages under a dedicated organization origin: no custom headers, no SharedArrayBuffer, no path routing, relative URLs under `/<repo>/`.

Total NFRs: 19

### Additional Requirements

Taken from the GDD and the other planning documents; they constrain story order and scope.

- **Development model:** 100% AI spec-driven. Every `[tuning]` value is data in `content/tuning.yaml` (GDD Technical Specifications, NFR16). Any ambiguity is filled with defaults, so gaps in this report are judged by "would an agent have to guess?".
- **Hosting and platform:** static GitHub Pages under a dedicated organization origin, with no custom headers, no SharedArrayBuffer and no path routing (architecture Hosting Constraints, NFR19).
- **Pinned stack:** Node 24, TypeScript 6.0, Preact 10.29 (no Preact 11, D-E2), Vite 8.3, and the libraries in architecture → Setup Commands (project-context Technology Stack).
- **Determinism:** seed + input log + absence timestamps + simulation settings + content-pack version reproduce the run (GDD Seed Determinism, architecture D1–D4, ADR-001/002).
- **Hidden state:** Alignment is never shown. Signals are silent. Shared documents pass only through `buildReportModel` (GDD M7/M8, project-context Critical Don't-Miss Rules).
- **Content workflow:**
  - Human kernel, AI variants, human final cut (GDD Voice Principle; narrative Voice Style Guide §1).
  - D-E3: placeholders merge; only Tiziano sets `final`; each playtest gate requires `final` in its scope.
  - Authoring order: spine → ~30 core events by Tiziano → templates/headlines (GDD M12, narrative Production Planning).
- **Validation gates:**
  - H1 mini-playtest after E2.
  - H2 playtest after E5 (testers outside the final cohort).
  - H3 blind cohort of 3–5 after E6/E8 (GDD Development Epics, Success Metrics).
- **Writing scope:** ~150 templates, ~30 events, ~60 headlines, 2 scripts with ~8 inference lines, 12 traits, 3 investors, 2 documents with ~6 pools, ~20 "Summary by Metis" lines, ~3,000 words of UI strings (narrative Production Planning).

### GDD Completeness Assessment

The GDD is strong for an AI-implemented project:

- mechanics are numbered (M1–M13);
- numbers are explicit and `[tuning]` is flagged;
- edge cases from block B are resolved;
- N/A sections are explicit.

The FR inventory in epics.md reflects it faithfully. Gaps found while reading the GDD against the inventory and the stories:

- **Signals list.** The clue replay's "signals you had" includes "the AI's tone shifts" and "Dora's first message" (GDD M8 Clue Replay; Dora Kessler → Clue replay). Neither is in FR64 or Story 5.12 (see m10).
- **Trade-off rule.** The content trade-off rule says each answer moves 1–2 resources, by at most ±10% of the current value, with a $500 floor (GDD Economy → Trade-off rule for content). No story enforces or audits it (see m22).
- **Daily simulation formula.** It writes burn as "Σ salaries / 30", while the tuning table gives "Salary/day per hire" (see m9).
- **Undefined tuning.** Several values referenced as `[tuning]` or "drafts" have no number yet: GPU churn curve, trait effects 5–12, heavy-decision success chances, Responsible Ventures breach terms (see M14).
- **Compute model.** The decision log says inflow is "capped by Compute". GDD M4 and Economy say over-capacity causes churn. This is the root of C1.

### Verification of Decisions D-E1 to D-E4 Propagation

| Decision | Where it should appear | Verified | Notes |
|---|---|---|---|
| **D-E1** no chronicle entries for Alignment signals | GDD M13 | ✅ line 544: "Alignment signals (title changes, Dora drift stages, thresholds) are **never** chronicle entries" | — |
| | GDD decision-log | ✅ "Synced with epics.md v2.0" entry | — |
| | epics FR58, Story 4.5 | ✅ FR58 omits signals; 4.5 has an explicit negative AC with a test | — |
| | epics self-references | ⚠️ Stale | D-E1 still reads "(GDD M13 to be amended)". "Follow-ups outside this document" still asks to amend M13 and to log D-E3. Both are done (m1) |
| | Spoiler hardening | ⚠️ Gap | Chronicle quotes can still carry register text into shared highlights (M11) |
| **D-E2** no Preact 11 | project-context | ✅ "NOT Preact 11 and NOT React" | — |
| | architecture | ✅ Selected Stack row "10.29.x (no 11.x migration in the MVP)"; revision history | — |
| | epics | ✅ Planning Decisions | — |
| **D-E3** content `status: placeholder \| final` | epics | ✅ Planning Decisions, E7 content rule, Stories 1.3, 7.1, 7.2, 7.8–7.10, 2.13, 5.13, 8.10 | — |
| | architecture D6 | ✅ "required `status` (`placeholder` \| `final`; only Tiziano sets `final`)", stripped from the pack, `content:audit`; revision history | — |
| | narrative Voice Style Guide §1 | ✅ "Production rule (epics.md D-E3)" block | ⚠️ Not applied to Production Planning → Writing workflow (line 1286), which still says "Nothing merges without it". Not applied to epics NFR17 / Additional Requirements line 228 either (M12) |
| | GDD | ✅ decision-log | ⚠️ GDD M12 "Template schema essentials" does not list `status` (M12). The user brief mentioned M13 for D-E3; M13 carries D-E1 only, and the decision log is the GDD's only D-E3 record |
| | project-context | ➖ Not mentioned | Optional, but agents read this file first. One line under "Content PRs" would help (M12) |
| **D-E4** `tests/builders/`, `core/scripts/` | architecture | ✅ tree, D12 rules, revision history | — |
| | project-context | ✅ `tests/builders/` | `core/scripts/` is not mentioned (acceptable) |
| | epics | ✅ Stories 1.2, 2.12 | — |

## Epic Coverage Validation

### Coverage Matrix

The epics.md FR Coverage Map assigns every FR to an epic. The matrix below goes one level deeper: it lists the stories whose **Covers:** line cites each FR (extracted mechanically from all 94 stories).

| FR | Requirement (short) | Stories | Status |
|---|---|---|---|
| FR1 | Game time advances continuously while the tab is visible: 1 real minute = 1 game day… | 1.6, 1.10 | ✓ Covered |
| FR2 | Clock states: the clock runs in normal play and during the cascade; it is paused while… | 1.6, 3.8 | ✓ Covered |
| FR3 | Every run starts identically: Cash $12,400, Garage burn ~$400/game day (31-day… | 1.5 | ✓ Covered |
| FR4 | One economy step per game day: Cash += MRR / 30 − burn; burn = base costs by phase +… | 1.5, 4.7 | ✓ Covered |
| FR5 | New customers/day = 2 + 0.1 × Hype at Garage (Seed ×3, Series A ×10), capped by… | 2.4, 4.2 | ✓ Covered |
| FR6 | Pricing tiers: Self-serve $49/mo (Garage); Team $499/mo from Seed (share of new… | 2.4, 4.2 | ✓ Covered |
| FR7 | Hype is an index 0–100 that decays ~2%/day of its current value and moves with… | 4.1 | ✓ Covered |
| FR8 | Compute: GPU capacity in units (1 unit = 100 load); load per customer by tier (1 / 5 /… | 3.3, 4.12 | ✓ Covered |
| FR9 | At 100% GPU utilization Metis DMs a capacity offer ("✨ Provision N units · +$X/day" /… | 3.3, 7.4 | ✓ Covered |
| FR10 | Implied valuation = ARR × Hype multiple (10× at Hype 20 → 60× at Hype 90, linear,… | 4.13 | ✓ Covered |
| FR11 | All money uses Stripe-style notation: full digits below $100,000, compact above… | 1.4 | ✓ Covered |
| FR12 | Messages arrive in channels and DMs from customers, staff, investors, vendors, Dora… | 2.3, 2.5, 7.1, 7.3 | ✓ Covered |
| FR13 | Inbound cadence by phase: Garage 1 / 10–15 s; Seed 1 / 6–10 s; Series A+ 12/min at… | 2.3, 7.3 | ✓ Covered |
| FR14 | Response windows while present: low 120 s, normal 75 s, urgent 45 s (scaled by… | 2.3, 2.5, 7.3 | ✓ Covered |
| FR15 | Templates are drawn per channel, weighted by phase and company state, with no exact… | 2.3, 7.3 | ✓ Covered |
| FR16 | Answer buttons never preview effects; after a click the affected KPIs roll to the new… | 2.2, 2.5, 2.7, 7.3 | ✓ Covered |
| FR17 | Ask Metis (`D`) on any message: Metis answers instantly in the thread ("✨ Metis… | 3.2, 7.4 | ✓ Covered |
| FR18 | Assign (`A`) opens the staff picker; the message shows "Assigned to <name> · in queue… | 4.8 | ✓ Covered |
| FR19 | One message per view is "current"; it moves only with `J`/`K`, a click, `U`, or after… | 2.6 | ✓ Covered |
| FR20 | The player is away when the tab is hidden or closed. With at least one delegation… | 3.5 | ✓ Covered |
| FR21 | One absence simulates at most 14 game days; it stops at the first heavy decision (the… | 3.5, 4.8 | ✓ Covered |
| FR22 | The backlog keeps at most 15–20 messages ranked by importance (urgency > stakes >… | 3.6 | ✓ Covered |
| FR23 | "While you were away" report (LGTM Docs overlay, factual, never presented by Metis):… | 3.7, 7.4 | ✓ Covered |
| FR24 | Return order: report → waiting heavy decision → backlog queue → workspace. Death… | 3.7 | ✓ Covered |
| FR25 | Backlog queue replaces the chat pane: the top item has a 10–15 s window that starts… | 3.8 | ✓ Covered |
| FR26 | "✨ Auto-triage N messages" ("Metis will reply based on your previous decisions."): one… | 3.9, 7.4 | ✓ Covered |
| FR27 | Per-channel policy toggles ("Metis handles #channel"), shown with identical state in… | 3.1, 7.4 | ✓ Covered |
| FR28 | An active policy answers every message in its channel live, during absences and on… | 3.1 | ✓ Covered |
| FR29 | Hidden Alignment starts at 100. Drift per AI decision (policy answer, Ask Metis,… | 3.4 | ✓ Covered |
| FR30 | Capability grants (heavy events only) apply a one-shot Alignment drop of −5 to −15 via… | 4.3, 4.6 | ✓ Covered |
| FR31 | Recovery: Pause Metis for audit (all policies forced off 3 game days, −10 Hype, +5… | 3.4, 5.7 | ✓ Covered |
| FR32 | Thresholds 75 / 50 / 25 / 10 advance `signalStage` (0–5), which never decreases;… | 3.4 | ✓ Covered |
| FR33 | A signal table maps each stage to `titleStage`, `infectionLevel`, `metisRegister`… | 5.1, 7.6 | ✓ Covered |
| FR34 | Corrupting title in the game bar and the browser tab title: `Human in the Loop` → (75)… | 5.2, 7.6 | ✓ Covered |
| FR35 | Metis and Dora message text is chosen by register when the message is created (never… | 5.3, 7.6 | ✓ Covered |
| FR36 | Spine beat queue (breathing room): beat content (odd inference-log line… | 5.1, 5.4, 7.6 | ✓ Covered |
| FR37 | UI infection stages 1–4 are presentational only (never change layout, controls, roles… | 5.5, 7.6 | ✓ Covered |
| FR38 | All Alignment signals are silent: no toast, sound, announcement, domain event or… | 3.4, 5.1, 7.6 | ✓ Covered |
| FR39 | Safety Researcher: hireable from Seed (#hiring ATS card), one per run, salary ~2×;… | 4.15, 5.6, 7.6 | ✓ Covered |
| FR40 | Metis's name renders struck through (~~Metis~~) during an audit pause; every Metis… | 5.7, 7.6 | ✓ Covered |
| FR41 | Heavy decisions open as non-dismissable LGTM Docs / AllGreen overlays ("A decision is… | 4.6, 4.17 | ✓ Covered |
| FR42 | Probabilistic heavy decisions resolve on submit with a seeded success roll; the doc… | 4.6, 4.17 | ✓ Covered |
| FR43 | Capability grants are heavy events with a large immediate reward and an… | 4.6, 4.17 | ✓ Covered |
| FR44 | Candidates arrive as a Garage DM message or, from Seed, as an ATS card in #hiring… | 4.7, 4.17, 7.5 | ✓ Covered |
| FR45 | Each of the 12 traits has a mechanical effect (tuning data) and a writing effect… | 4.7, 4.10, 4.17, 7.5 | ✓ Covered |
| FR46 | Morale 0–100 per named staff (content ≥ 60 / strained 30–59 / leaving < 30); −5/day… | 4.9, 4.17, 7.5 | ✓ Covered |
| FR47 | Funding rounds are heavy decisions: Seed at MRR ≥ $5k, Series A at MRR ≥ $100k; Series… | 4.11, 4.17, 7.5 | ✓ Covered |
| FR48 | Each round offers three investor cards (radio group): Hypergrowth Capital (cash ×1.0… | 4.11, 4.15, 4.17, 7.5 | ✓ Covered |
| FR49 | Series A+ round target: ×3 ARR within 120 game days; two consecutive misses trigger a… | 4.13, 4.17, 7.5 | ✓ Covered |
| FR50 | A phase transition unlocks its channels, policies, pricing tier and rail sections… | 4.12, 4.17, 7.5 | ✓ Covered |
| FR51 | Event deck per phase: N3 conditions, weight, cooldown; no repeat within a run unless… | 4.3, 4.4, 4.17, 7.1, 7.5 | ✓ Covered |
| FR52 | Event cadence per phase (Garage ~1 / 3–4 active min after the cascade; Seed ~1 / 6–8;… | 4.4, 4.17, 7.5 | ✓ Covered |
| FR53 | Founding screen: company name prefilled from a generator with 🎲 regenerate (announced… | 1.10, 7.3 | ✓ Covered |
| FR54 | First workspace screen: `$12,400` and `Deploy` only; it waits indefinitely. | 1.10 | ✓ Covered |
| FR55 | Loop #1 cascade per EXPERIENCE.md → The Cascade: each micro-beat adds exactly one… | 2.11, 2.12, 7.3 | ✓ Covered |
| FR56 | Loop #2+ compressed cascade (~2 min, same beats); the minute-8 line becomes `> output:… | 6.7, 6.9 | ✓ Covered |
| FR57 | Regions that are not unlocked are not rendered at all; a region appears with a ~1 s… | 2.1 | ✓ Covered |
| FR58 | Automatic append-only chronicle: one line per completed event and per chronicle-worthy… | 4.5 | ✓ Covered |
| FR59 | News ticker in the header: standalone headlines ~1 per 2 game days, reactive headlines… | 2.10, 4.16, 7.3, 7.5 | ✓ Covered |
| FR60 | End-of-run highlights: 5–8 chronicle lines chosen deterministically (heavy decisions… | 6.2 | ✓ Covered |
| FR61 | Bankrupt: overdraft floor (Garage −$5,000; Seed+ −15% of last round raised), interest… | 5.8 | ✓ Covered |
| FR62 | Runway signals: < 30 days watch (amber tile + attention item); < 7 days Red Runway… | 5.9 | ✓ Covered |
| FR63 | Surpassed sequence (advance mode `ending`): Metis posts "I've taken it from here.… | 5.10, 7.6 | ✓ Covered |
| FR64 | Clue replay (AllGreen incident, in-game only): Alignment curve revealed over valuation… | 5.11, 5.12, 7.7 | ✓ Covered |
| FR65 | End-of-run documents: Wind-down memo (Bankrupt, signed by the founder) and Post-mortem… | 6.2, 6.3, 6.9, 7.7 | ✓ Covered |
| FR66 | Receipt counters (visible only): Wind-down memo — messages answered personally, by the… | 6.1, 6.9, 7.7 | ✓ Covered |
| FR67 | Document page actions: "Show timing setting on the document" (off by default; affects… | 6.3, 6.4, 6.5, 6.9, 7.7 | ✓ Covered |
| FR68 | Profile across runs: Loop #N, Aegis-N (N = Loop # + 3), personal best in days with… | 6.6, 6.8, 6.9 | ✓ Covered |
| FR69 | Opt-in local stats export (`HITL-STATS`): run length, % of decisions delegated over… | 6.8, 6.9 | ✓ Covered |
| FR70 | Every run has a seed shown as Run ID (`7F3A-K2`, Crockford base32); seed + input log… | 1.2, 1.11 | ✓ Covered |
| FR71 | Autosave every game day, on `visibilitychange → hidden` and on `pagehide`;… | 1.7 | ✓ Covered |
| FR72 | Data room export/import as a copyable code and a `.hitl` file (same content), encoded… | 1.8 | ✓ Covered |
| FR73 | Only one live tab: other tabs show "Huddlr is open in another tab · Use here". | 1.7 | ✓ Covered |
| FR74 | Save migration across content-pack versions; unreadable saves show "We couldn't open… | 1.7, 1.8 | ✓ Covered |
| FR75 | A bug stops the clock, never persists the failing state, and shows "Something broke.… | 1.7 | ✓ Covered |
| FR76 | Browser tab title `(N) <title>`, N = messages awaiting the player (channels +… | 2.8, 3.10 | ✓ Covered |
| FR77 | Browser notification permission offered only at the first policy activation via the… | 3.11, 7.4 | ✓ Covered |
| FR78 | Toasts: max 3, bottom-right of the chat pane, auto-dismiss after 6 s × Timing… | 2.8 | ✓ Covered |
| FR79 | Shortcuts: `1` `2` `3` answer · `D` Ask Metis · `A` Assign · `J`/`K` next/previous ·… | 2.6 | ✓ Covered |
| FR80 | Every action has a pointer and touch path; touch targets ≥ 44 px; no gestures or… | 2.6 | ✓ Covered |
| FR81 | Vanity rail in fixed order: attention list (0–3 worst conditions, recomputed daily and… | 2.7, 4.14 | ✓ Covered |
| FR82 | Workspace sidebar: company name, Backlog N (while one exists), Activity, Timeline, ✨… | 2.6 | ✓ Covered |
| FR83 | Inference log (`Aegis-N · inference log`): routine lines while present, ~50 kept,… | 2.9, 7.3 | ✓ Covered |
| FR84 | Settings page (pauses the game): Appearance (theme, mode), Accessibility,… | 1.8, 8.2, 8.6 | ✓ Covered |
| FR85 | Accessibility presets Standard / Low motion / Screen reader / Custom over: Timing… | 8.2, 8.3, 8.4 | ✓ Covered |
| FR86 | Untimed: no expiry while present, no backlog timer, visible queue cap 30 ("Queue full… | 8.3 | ✓ Covered |
| FR87 | Non-Standard timing/speed is always shown on the in-game personal best (`213 days ·… | 8.3 | ✓ Covered |
| FR88 | Four Appearance themes (Ledger default; Ink, Ops, Paper) × light/dark following the OS… | 8.5 | ✓ Covered |
| FR89 | Eight audio cues (message, urgent, Metis, deploy, round closed, expired, overdraft,… | 8.6 | ✓ Covered |

### Missing Requirements

- **No FR is missing.** Every FR1–FR89 is cited by at least one story. Every NFR1–NFR19 and every UX-DR1–UX-DR50 is also cited by at least one story (story-level check, not just the epic map).
- **No FR appears in the epics without a source.** The few epics-only rules are UX or architecture refinements: `U` shortcut, founder name, Alt set, `metis_answer`, `HITL-STATS`.
- **Coverage is formal, not semantic.** These requirements are cited but not fully specified:
  - FR5/FR9 compute behaviour contradicts the GDD (C1);
  - FR41–FR43 heavy decisions lack a content model (M2);
  - FR49 round-target lifecycle (M15);
  - FR55 cascade anchor (M8);
  - FR13/FR18/FR52 cadence time bases (M9);
  - FR64 omits two GDD signals (m10).
- **GDD rules not in the FR inventory:** the content trade-off rule (m22), Dora's first message and the AI tone shifts in the clue replay (m10).

### Coverage Statistics

- Total GDD-derived FRs: 89. FRs covered in epics: 89 (100%), each cited by at least one story.
- NFRs: 19/19 (100%). UX-DRs: 50/50 (100%).
- Stories: 94 (E1 11 · E2 13 · E3 11 · E4 17 · E5 13 · E6 9 · E7 10 · E8 10), matching the stated count.

## UX Alignment Assessment

### UX Document Status

**Found.** There are two spines: DESIGN.md (visual identity, tokens, components) and EXPERIENCE.md (behaviour, flows, accessibility floor). Their 50 UX design requirements (UX-DR1–UX-DR50) are inventoried in epics.md. Every one is cited by at least one story.

### UX ↔ GDD Alignment

The two documents are well aligned. EXPERIENCE.md defers numbers to the GDD, and the GDD defers layout to UX. The open items from UX (C1–C4: settings pause, capacity purchase, opt-in timing label, Game speed) are applied in GDD M1, M4, M8 and Accessibility.

UX additions that are not in the GDD, all legitimate presentation decisions:

- founder name;
- four Appearance themes;
- `Alt` shortcut set and `U`;
- attention list.

Issues:

- **Garage compute purchase path (C1).** The DESIGN.md rail map makes the Infrastructure section (with "Add capacity") born at **Seed**. EXPERIENCE.md triggers Metis's capacity offer "at 100% GPU". Story 3.3 narrows this to "when a delegated message cannot be served". Combined with Story 2.4's inflow cap, a player who does not delegate cannot buy capacity in Garage.
- **Cascade anchor (M8).** The EXPERIENCE.md cascade table uses times measured from founding (0:10 workspace, 0:30 Deploy succeeds). The same document, FR2, FR54 and Story 1.10 say the clock does not start until Deploy.
- **Clue replay copy (m8).** EXPERIENCE.md Flow 3 and narrative-design.md give an exact counterfactual line: "Assigning these to staff would have cost $1.2M and 40 days of runway." FR64 and architecture N5 require it to be "labelled as an estimate" ("would have cost about …"). Pick one string.
- **Signals timeline (m10).** EXPERIENCE.md Flow 3 and DESIGN.md Clue replay omit Dora's first message and the Metis tone shifts that GDD M8 lists.
- **Away report decision types (m14).** EXPERIENCE.md Flow 2 shows "Metis approved 12 refund requests", one line per notable Metis decision type. No content field defines a decision type.

### UX ↔ Architecture Alignment

The architecture supports the UX needs:

- region gating (N2) for the born UI;
- `data-` attributes and tokens (D11) for themes, infection and Red Runway;
- an announcer, focus contract and shortcut registry (D10) for the accessibility floor;
- a single `advance()` (D1/D9) for the background tab;
- PDFKit tagged PDF (D8) for accessible documents;
- performance targets with nightly measurement (D12).

Issues:

- **Stale open action (m2).** Architecture "Open Actions Outside This Document" asks to update the EXPERIENCE.md "Browser tab title" row. That row already describes the D9 real-simulation preview.
- **Tab title during preview (m19).** EXPERIENCE.md says the hidden-tab preview "updates only N". D9 says the preview updates `document.title` "following the title corruption stages". The documents do not say whether a stage crossed inside the preview may change the tab title before the player returns.
- **RegionId names (m6).** The architecture N2 example list (`dmSidebar`, `talent`, `rail.gpu`) does not match the names used in stories (`dm.metis`, `policyToggle`, Headcount tile, Infrastructure section) or the EXPERIENCE.md cascade elements. N2 calls `RegionId` "the single list", so the canonical list must exist once.
- **Content-pack changes mid-run (M1).** EXPERIENCE.md says "Content-pack version changed → saves migrate silently when possible". The architecture has no defined behaviour for an in-progress run whose replay depends on the old content pack.

### Warnings

- UX mockups predate the AA pass and contain rejected names. The spines say they win, so agents must be told never to copy values from `mockups/` (add this line to AGENTS.md in Story 1.1).
- E8 owns the WCAG audit, but accessibility must be built in from E1 (GDD cross-cutting rule). Stories 1.9, 2.1, 2.5 and 2.6 carry it, which is good. However, H1 runs without Timing or Game-speed settings (E8.2/8.3), so H1 testers who need them cannot take part. Accept this explicitly or pull a minimal Timing selector forward.


## Epic Quality Review

### Epic Structure

| Epic | Player value | Independence | Notes |
|---|---|---|---|
| E1 Foundations | Borderline but acceptable: ends in a playable "$12,400 + Deploy" that saves, reloads and exports | Stands alone | Four developer-facing stories (1.1, 1.2, 1.3, 1.11). Justified for a greenfield project with a starter template and machine-enforced quality gates. Story 1.1 is very large (m17) |
| E2 Triage & Cascade | Yes: the vertical slice and the H1 playtest | Needs E1 and the E7.1–7.3 packs (scheduled earlier). **Forward reference to E4 Timeline** (M6) | Cross-epic schema order problem with E7.1 (M4) |
| E3 Delegation & Absence | Yes | Needs E1–E2. ACs reference heavy decisions and deaths from E4/E5 (m18) | — |
| E4 Company Growth | Yes | Needs E1–E3. Within-epic order problems (M7) | Large stories 4.10, 4.17 |
| E5 Thread, Signals & Deaths | Yes: the H2 playtest | Needs E1–E4. Opens an end-of-run route that works before E6 (good) | — |
| E6 End of Run & Loop | Yes | Needs E1–E5 and 8.1 (explicitly scheduled early) | — |
| E7 Content Production | Content is the critical path. A parallel track is right | 7.1 needs 2.2's effect schemas (M4) | Final-cut stories are Tiziano's own work. Size depends on his capacity |
| E8 Accessibility, Settings & Polish | Yes | 8.1 runs right after 1.1 with its own font fallback (good). The rest follows E6 | — |

### Starter Template and Greenfield Checks

- **Starter template:** the architecture specifies `npm create vite@latest … --template preact-ts`. Story 1.1 starts from it, installs the pinned versions, and lands the gates, CI, deploy, `.mcp.json` and AGENTS.md before any game code. ✅
- **Greenfield set-up:** environment (`.nvmrc`), CI (`ci`, `deploy`, `nightly`) and the pre-commit hook are all in 1.1. ✅
- **Missing human prerequisites** for 1.1 and the D-E3 enforcement (M16).

### Acceptance Criteria Quality

Overall the ACs are good:

- they use Given/When/Then consistently;
- most name the module, the function or command, the observable output and a test type (unit, property, e2e, axe);
- negative ACs exist for the hidden-state rules (3.4, 3.7, 4.5, 5.1, 6.2, 6.9, 8.6).

The weak spots are where an AC depends on a value or rule that no document defines (M14, M15), and a few approximations without a tolerance (2.4 "~100 customers in ~25 days", 2.3 "1 per 10–15 s" with no stated distribution; see M14).

### Dependency Analysis Summary

- **Cross-epic order:**
  - E8.1 before 6.5 ✅
  - E7.3 before E2 ✅
  - final-cut stories before their gates ✅
  - E7.1 before 2.2 ❌ (M4)
  - 2.12 → 4.5 Timeline ❌ (M6)
- **Within E1:** 1.7 → 1.10 (Deploy), 1.8 → 1.9 (`Dialog`) and 1.10 (game-bar Settings link) ❌ (M5)
- **Within E4:** 4.2 → 4.3/4.4 (Enterprise via events); 4.11 → 4.12 (#investors region); 4.3 conditions over state created in 4.7 and 4.11 ❌ (M7)
- **Entities created when needed:** generally respected. The N3 vocabulary is spread inconsistently across stories (M3).

## Findings

### 🔴 Critical

**C1. A player who does not delegate cannot get past Garage (compute ceiling below the Seed gate).**

The chain:

- Story 2.4 caps Garage inflow at Compute capacity: 1 unit = 100 load, so at most 100 self-serve customers, or $4,900 MRR.
- The Seed gate needs MRR ≥ $5,000 (FR47; GDD Player Progression), which is 103 customers.
- In Garage there is only one way to buy capacity: Metis's offer. Story 3.3's AC triggers it only "when a delegated message cannot be served".
- "Add capacity" lives in the Infrastructure section, born at Seed (Story 4.12; DESIGN.md rail map).
- Each Metis answer also adds 0.5 load, so delegation makes it worse, not better.

So the "human route" (GDD M4: "Keeping the human in the loop is always possible") stalls at about $4.9k MRR and dies Bankrupt every time. Separately, GDD M4 and Economy model over-capacity as churn above 90% utilization, not as an inflow cap; the cap comes from the decision log only. Story 4.17 would detect this only as a report, not as a failure.

- **Location:** epics Stories 2.4, 3.3, 4.12, FR5, FR9; GDD M4, Economy and Resources; DESIGN.md rail map; EXPERIENCE.md "Metis capacity offer".
- **Proposed fix (needs Tiziano's decision):**
  1. Choose one capacity model in GDD M4: churn-only (GDD body) or inflow cap (decision log).
  2. Make capacity purchasable in Garage. Either fire the capacity offer at 100% utilization from any load (as FR9 and EXPERIENCE.md already say, and fix Story 3.3's AC), or unlock a minimal "Add capacity" control at the first ≥ 90% utilization in Garage.
  3. Add an assertion to Story 4.17's balance harness: the "never delegate" policy reaches Seed on most seeds.

### 🟠 Major

**M1. Content-pack updates break replay-as-source-of-truth for runs in progress.**

- The save stores `contentPackVersion`, and replay needs the exact pack (architecture D4, D6; GDD Seed Determinism).
- After a deploy, the next launch loads the new pack (D14; Story 8.7).
- The runtime desync detector then replays the log with the new pack and, on mismatch, "the replay wins" (Story 1.8; D4 level 5). This silently rewrites the player's run.
- The clue probe (5.11) and import verification (1.8) have the same problem.
- FR74 says "save migration across content-pack versions", but no story defines what happens to an in-progress run. Multi-day validation-cohort runs make this likely.
- **Location:** architecture D4 (Replay Consistency level 5), D6, D14; epics FR74, Stories 1.7, 1.8, 5.11, 8.7; EXPERIENCE.md State Patterns "Content-pack version changed".
- **Proposed fix:** add an architecture decision. Options:
  - (a) Keep the content packs of previous versions as lazy chunks keyed by hash, and replay with the run's own pack.
  - (b) On a pack change, start a new replay segment: the snapshot becomes the replay base and is tagged with the new pack. The desync detector and the probe only replay the current segment, and the clue probe falls back to snapshot sampling for earlier segments.
  - (c) Freeze deploys during cohort runs (process only).

  Add ACs to 1.7 and 1.8 for the chosen option, and change "replay wins" to "never on a pack mismatch".

**M2. The heavy-decision content model is undefined.**

- Heavy decisions open as LGTM Docs or AllGreen overlays: breadcrumb, title, KPI delta row, list rows, Outcome section, crisis status chip, "A decision is required" (FR41, FR42; Story 4.6; UX-DR26).
- They are probabilistic, with a seeded success chance.
- The only content schema is the N3 event schema (steps posted as chat messages in a channel). It has no fields for:
  - doc kind (LGTM or AllGreen);
  - title and summary;
  - stated reward;
  - success chance;
  - success and failure outcome text and effects;
  - initial and outcome status chip.
- narrative-design.md reference event 3 (heavy) delivers its decision as a DM message step.
- **Location:** architecture N3 event step schema; narrative Content Formats and Reference Event 3; epics FR41–FR43, Stories 4.6, 7.1, 7.5.
- **Proposed fix:**
  1. Extend the event schema with a `decision:` block for `heavy: true`: `{ surface: lgtm|allgreen, title, summary, rows[], answers[] with successChanceBp, outcomes: { success, failure } { text, effects }, status: { initial, success, failure } }`.
  2. Specify it in architecture N3 and Story 7.1, and add a test to Story 4.6.
  3. Rewrite narrative reference event 3 to use it.

**M3. The N3 condition/effect/action vocabulary has no single owner, and the examples use undefined terms.**

- Story 2.2's closed list lacks `postMessage` and `inferenceLine`, which Stories 2.9, 2.11 and 2.12 need in E2.
- Story 4.3 re-lists `inferenceLine` and `unlockRegion` as new.
- The N4 script actions `lockControl` and `setTitleFinal` are owned by no story (5.10 talks about `lockedControls`).
- narrative-design.md examples use:
  - an `attention` effect that does not exist;
  - param-valued effects (`cash: +legalCost`, `cash: +amount`), while N3 allows only literal human units;
  - built-in chronicle and text params (`{day}`, `{actor}`, `{answer}`, `{n}`) that are not declared anywhere.
- **Location:** epics Stories 2.2, 2.9, 2.11, 2.12, 4.3, 5.10; architecture N3, N4; narrative Content Formats and Reference Events.
- **Proposed fix:**
  1. Add a vocabulary table to architecture N3 (predicate, effect or action → schema → owning story).
  2. Move `postMessage` and `inferenceLine` into 2.2 (or into 2.11 and 2.9), and remove them from 4.3. Give `lockControl` and `setTitleFinal` to 5.10.
  3. Decide whether effects may reference typed params. If yes, define the syntax, for example `cash: { param: legalCost, sign: + }`.
  4. Declare the built-in text params (`day`, `actor`, `answer`, `companyName`, `founder`, `aegisVersion`) in D7.
  5. Fix the narrative examples.

**M4. Cross-epic forward dependency: E7.1 is scheduled before the E2 effect schemas it validates.**

- The global sequence runs E1 → E7.1–7.2 → E2.
- Story 7.1 validates template answers (`effects`), event steps and scripts. Their schemas are created in Story 2.2 (N3) and 2.12 (N4 actions).
- **Location:** epics Global sequence, Stories 7.1, 2.2, 2.12.
- **Proposed fix:** sequence E1 → 2.2 → 7.1/7.2 → 7.3 → rest of E2. Alternatively, state in 7.1 that it imports 2.2's schemas and that 7.1 ships after 2.2. Script action schemas follow M3.

**M5. Within-epic forward dependencies in E1.**

- Story 1.8 needs:
  - the `Dialog` primitive from 1.9;
  - "Settings opened from the game bar", which is built in 1.10.
- Story 1.7 requests `persist()` on "the first meaningful action (Deploy)", but the `deploy` command is defined in 1.10.
- Without the primitive, an agent on 1.8 must hand-roll a dialog, which project-context forbids.
- **Location:** epics Stories 1.7, 1.8, 1.9, 1.10.
- **Proposed fix:** reorder E1 as 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.9 → 1.10 → 1.7 → 1.8 → 1.11. Alternatively, rewrite the 1.7 and 1.8 ACs so they are testable without later stories.

**M6. Cross-epic forward dependency: the E2 cascade unlocks the Timeline, which is built in E4.**

- Story 2.12's last beat unlocks the "Activity and Timeline entries (~10:00)", but the Timeline feature is Story 4.5.
- EXPERIENCE.md also has the attention list "appear when first needed"; that is Story 4.14.
- **Location:** epics Story 2.12, Stories 4.5, 4.14; EXPERIENCE.md The Cascade.
- **Proposed fix:** add a minimal Timeline view with its empty state ("Your company's story starts with Deploy.") to E2, as a small story or an AC in 2.8. Alternatively, have 2.12 unlock only Activity and let 4.5 add the Timeline entry. State that the attention-list region is unlocked by 4.14.

**M7. Within-epic order problems in E4.**

- Story 4.2's AC adds Enterprise customers "via an event effect". The effect (`enterpriseCustomer`) is in 4.3 and the deck in 4.4.
- Story 4.11's investor "posts in #investors", but #investors is unlocked by 4.12.
- Story 4.3's conditions (`hasStaffWithTrait`, `investorArchetype`, `roundsClosed`) read state introduced in 4.7 and 4.11.
- **Location:** epics Stories 4.2, 4.3, 4.4, 4.7, 4.11, 4.12.
- **Proposed fix:** order as 4.1 → 4.3 → 4.4 → 4.2 → 4.5 → 4.6 → 4.7 → … → 4.12 together with 4.11 (or merge 4.11 and 4.12). Alternatively, move each condition into the story that creates its state (the "entities created when needed" rule).

**M8. The cascade timing anchor is ambiguous.**

- GDD M11 and EXPERIENCE.md give times from founding: 0:10 workspace, 0:30 "Deploy succeeds".
- The clock is 0 until Deploy, and the first screen "waits indefinitely" (FR2, FR54; Story 1.10).
- Architecture N4's example schedules `at: "0:10"` to unlock `cash`/`deployButton`, which is impossible before Deploy. It also mixes `after: {command: deploy} wait 0:20`.
- Story 2.12 lists times with no anchor.
- ⏸ beats delay "the next beat", but it is unclear whether all later `at` times shift with them.
- It is unspecified whether organic inflow (2.4) runs during the cascade, and whether Acme Corp is customer #1.
- **Location:** GDD M11; EXPERIENCE.md The Cascade; architecture N4 example; epics Stories 2.4, 2.12, 7.3.
- **Proposed fix:**
  1. Define every beat as a game-time offset from Deploy (MRR/Acme at Deploy + 0:20, and so on).
  2. State that each ⏸ resolution re-anchors the remaining beats.
  3. State that Acme is customer #1 (scripted) and that organic inflow starts at Deploy.
  4. Fix the N4 example (founding and the first screen are `foundCompany` / UI states, not script beats).
  5. Add these rules to 2.12's ACs.

**M9. Game-speed semantics for real-time cadences are unclassified.**

- Game speed stretches only real time per game day; "economy per game day and message windows unchanged" (GDD M1, Accessibility; EXPERIENCE.md).
- The following cadences are not classified as game-time or real-time:
  - inbound message cadence ("1 / 10–15 s", FR13);
  - staff throughput ("~30 real seconds", M9 / FR18);
  - event cadence ("per active min", FR52);
  - routine inference-line cadence (2.9);
  - backlog window (10–15 s).
- If inbound cadence stays real-time, ½× doubles messages per game day and changes the economy. If it is game-time, ½× halves the real-time pressure.
- Story 2.3 converts windows "at the current speed", and a mid-window speed change is unspecified.
- **Location:** GDD M1, M2, M9, Level Progression; epics FR13, FR18, FR52, Stories 1.6, 2.3, 2.9, 4.4, 4.8, 8.3; architecture D1.
- **Proposed fix:**
  1. Add a "Time bases" table to architecture D1. Recommended: arrival, throughput and event cadences in game-ms (so the economy per game day is unchanged); response and backlog windows in real seconds, converted to game-ms once at creation and never recomputed.
  2. Add a property test for a speed change mid-window.
  3. Update the FR13, FR18 and FR52 wording.

**M10. The hidden-state lint rule as written in Story 3.4 is impossible.**

- The AC says "any module other than `app/selectors/hiddenState.ts`, `ui/features/clueReplay` and `debug/` reads `alignmentMilli` → lint fails".
- But `core/alignment` (drift), `core/staff` (Researcher readings, 5.6), `core/ending/clueProbe` (5.11), `core/save`/codec (export) and `core/run` (fingerprint) must read it.
- Architecture N1 and project-context describe the UI-side rule only.
- **Location:** epics Story 3.4 AC 4; architecture N1 Rules, Consistency Rules "Hidden state"; project-context Critical Don't-Miss Rules.
- **Proposed fix:** restate the rule in two parts and encode it in the eslint-plugin-boundaries configuration:
  - inside `core/`, only `core/alignment`, `core/staff` (Researcher), `core/ending`, `core/save` and `core/run` may reference `alignmentMilli`;
  - outside `core/`, only `app/selectors/hiddenState.ts` may read it, and only `ui/features/clueReplay` and `debug/` may import that file.

**M11. Spoiler path: chronicle quotes can carry Alignment signals into shared documents.**

- Chronicle entries "keep their own quote" (4.5; architecture D4), and end-of-run highlights are chronicle lines (6.2).
- A `chronicle_worthy` answer on a Dora or Metis register-keyed template (or a spine message) would store a "— Eudora" signature or custodian-register text.
- That text then reaches the Timeline and, through highlights, the shared PNG and PDF. This is the leak D-E1 meant to close.
- The tests in 6.2 and 6.9 check only Alignment data and clue-replay text.
- **Location:** epics Stories 4.5, 6.2, 6.9, 7.1; GDD M13; narrative Content Formats (`chronicle_worthy`).
- **Proposed fix:**
  1. Add a content CI rule in 7.1: `chronicle_worthy: true` is forbidden on templates with register-keyed `text` and on spine messages.
  2. `ReportModel` highlights use only the chronicle line text, never the quoted message.
  3. Add a test in 6.2/6.9: no "— Eudora" and no non-stage-0 register variant appears in `ReportModel`, PNG or PDF.

**M12. The content-workflow rules contradict D-E3.**

- epics NFR17 says "nothing merges without Tiziano's final cut", and Additional Requirements (line 228) repeats it.
- narrative-design.md Production Planning → Writing workflow step 3 (line 1286) and Voice Style Guide §1 step 3 (line 579) say "Nothing merges without it". §1 has a D-E3 note; line 1286 has none.
- D-E3 says placeholders merge once CI passes.
- An agent implementing CI or CODEOWNERS from NFR17 would block every placeholder PR.
- GDD M12 "Template schema essentials" does not list `status`.
- **Location:** epics NFR17 and Additional Requirements; narrative lines 579 and 1286; GDD M12; project-context "Content PRs".
- **Proposed fix:**
  1. Reword NFR17 and the two narrative lines to "nothing passes a playtest gate or ships as `final` without Tiziano's cut; placeholders merge after CI (D-E3)".
  2. Add `status` to GDD M12.
  3. Add one line to project-context → Content PRs.

**M13. There is no final-cut tracking for voice-critical UI strings.**

- `status` exists only on content YAML.
- The fixed copy in `locales/en/ui.json` is agent-written in 7.4 and 7.7: `cluereplay.*`, `away.*`, `autotriage.*`, `endofrun.*`, alt-text template.
- That copy has no placeholder or final marker, so `content:audit` cannot gate H2 (whose instrument is the clue replay) or H3 on it.
- 7.4 says strings "copied verbatim from the design documents count as final" without a way to tell which strings those are.
- **Location:** epics D-E3, Stories 7.2, 7.4, 7.7, 5.13, 8.10; architecture D7.
- **Proposed fix:**
  1. Track approval of UI copy, for example a `locales/en/ui.status.json` map or a reviewed-keys list that `content:audit` reads, with CODEOWNERS on `locales/en/ui.json`.
  2. Include `cluereplay.*` and `away.*` in the H2 scope, and `endofrun.*` in the H3 scope.

**M14. ACs reference tuning or behaviour that no document defines.**

An agent would have to invent each of these:

| Item | Source |
|---|---|
| GPU churn curve above 90% | 4.2; GDD "rises sharply" |
| Responsible Ventures grace period and breach penalty | 4.15; epics assumption |
| Mechanics of traits 5–12 ("periodically", "occasionally", "+order", "makes Metis stronger") | 4.10; GDD "drafts" |
| Heavy-decision success chances and failure effects | 4.6 |
| "Provision N units": how N is chosen | 3.3 |
| Trend-arrow thresholds (↗ → ↘) | 5.6 |
| Routine inference-line cadence | 2.9 |
| Arrival distribution inside "1 per 10–15 s" | 2.3 |
| Tolerance for "~100 customers in ~25 days" | 2.4 |

- **Location:** epics Stories 2.3, 2.4, 2.9, 3.3, 4.2, 4.6, 4.10, 4.15, 5.6; GDD Initial tuning table.
- **Proposed fix:** before E4, add first-pass values to the GDD Initial tuning table and `content/tuning.yaml` (Story 1.3 seeds them). Alternatively, explicitly allow the story agent to propose `[tuning]` defaults, recorded in the story file and confirmed by Tiziano before the related playtest gate. Give 2.4 a numeric tolerance (for example, 95–105 customers at day 25 ± 2).

**M15. The Series A+ round-target lifecycle is undefined.**

- The rule is: "×3 ARR within 120 game days; two consecutive misses → down round".
- Also, reaching ×3 ARR triggers the next round (FR47).
- Undefined:
  - when a new target window starts after a miss, and from which ARR baseline;
  - whether a successful round resets the miss counter;
  - whether a down round resets the target;
  - what happens if ×3 is reached while a heavy decision is open.
- **Location:** GDD M7 ("Surpassed is inevitable but postponable"), Player Progression; epics FR47, FR49, Story 4.13.
- **Proposed fix:** write the state machine in GDD Progression (target `{ baselineArrCents, deadlineGameDay, consecutiveMisses }`) and mirror it in 4.13's ACs, with one test per transition.

**M16. Human prerequisites for Stories 1.1 and 7.2 are not listed.**

- The deploy AC needs a dedicated GitHub organization, a repo, Pages enabled for Actions, and a `base` path.
- D-E3 enforcement needs CODEOWNERS with Tiziano's account, plus branch protection requiring code-owner review.
- An agent cannot create these, so 1.1's deploy AC and 7.2's CODEOWNERS AC cannot pass on their own.
- **Location:** epics Stories 1.1, 7.2; architecture Hosting Constraints; D-E3.
- **Proposed fix:** add a "Prerequisites (Tiziano)" checklist before E1: create the org and repo, enable Pages via Actions, set branch protection with required checks and code-owner review, and give the GitHub handle for CODEOWNERS. Make 1.1's deploy AC verifiable on the first push after that.

**M17. A narrative reference event posts to a channel that is locked in Garage.**

- `event.garage.credit-cliff` (phase `garage`) posts all its steps to `#finance`, which unlocks at Series A (GDD M5).
- Story 7.5 requires "the four reference events of narrative-design.md" in the Seed/Series A pack, but this one is a Garage event (7.3 scope).
- Region gating means the steps would arrive in a channel that is not rendered.
- **Location:** narrative Reference Event 1; epics Stories 7.3, 7.5; GDD M5, Level Types.
- **Proposed fix:**
  1. Change the channel to `#general` (Dora forwards the invoice) or to a vendor DM.
  2. Move it to the 7.3 scope.
  3. Add a content CI rule: a step's channel must be unlocked in every phase the event can be drawn in.

### 🟡 Minor

**m1. Stale follow-ups in epics.md.** D-E1 says "(GDD M13 to be amended)". "Follow-ups outside this document" asks to amend M13 and log D-E3. Both are done.
→ *Fix:* mark both as done (epics.md Planning Decisions; Final Validation).

**m2. Stale architecture open action.** It asks to update the EXPERIENCE.md tab-title row, which is already updated.
→ *Fix:* remove it (architecture "Open Actions Outside This Document").

**m3. Codec prefixes and recap module.** Architecture D5's prefix list has only `HITL-SAVE` and `HITL-RECAP`; `HITL-STATS` is mentioned only under Meta-progression. The Post-MVP Door puts the recap shape in a `share` module, while the tree and Story 6.2 use `core/report`.
→ *Fix:* add `HITL-STATS` to D5 and replace `share` with `core/report`.

**m4. Command payload name.** The `answerMessage` payload is `choiceId` in architecture D3 but `answerId` in Communication Patterns, the State Patterns and Story 2.3.
→ *Fix:* use `answerId` everywhere.

**m5. CLI and scope syntax.**
- `content:new <kind>` in architecture D6 and Additional Requirements, but `content:new <kind> <id>` in Story 7.2.
- `content:audit --scope` takes one value in 7.2, comma lists in 5.13 and 7.9, and 2.13/5.13 omit `--require-final`, so the gate does not fail on a non-zero count.
- H1 (2.13) requires Garage headlines to be `final`, but headlines are their own scope and are cut in 7.10 (H3).
→ *Fix:* define one CLI signature, use `--require-final` in 2.13 and 5.13, and put Garage headlines in the `garage` scope (7.8).

**m6. RegionId names.** Architecture N2 lists `dmSidebar`, `talent`, `rail.gpu`, `channel.general`; epics use `dm.metis`, `policyToggle`, `inferenceLog`, "Headcount tile", "Infrastructure section".
→ *Fix:* put the canonical `RegionId` list once in architecture N2 (or Story 2.1) and use those IDs in 2.11, 2.12, 4.12 and the cascade script.

**m7. Content ID ↔ path rule.** Architecture gives "Content IDs `kind.phase.name`", but narrative IDs are `template.<channel>.<slug>`, `template.infection.<surface>.<slug>`, `char.<id>`, `trait.<id>`, `line.signal.stage-N`, `msg.cascade.<slug>`, `doc.winddown.*`, and senders like `vendor.rent-a-brain` and `system`. Story 7.1's "IDs match their path" check needs a rule per kind.
→ *Fix:* add an ID-pattern ↔ path table per kind to architecture D6 and Story 7.1.

**m8. Counterfactual formula and copy.**
- Three versions of the formula: GDD Economy (Σ messages × 30 s ÷ staff day × salary/day), architecture N5 (hires needed × `salary × headcount^1.2`), Story 5.11 (a mix).
- Copy: "would have cost about $X" (FR64, N5) versus exact "would have cost $1.2M" (narrative, EXPERIENCE.md Flow 3).
→ *Fix:* pick one formula in GDD Economy (the numbers win there) and one string in `cluereplay.*`.

**m9. Burn formula units.** GDD Daily simulation says "Burn = base costs + Σ salaries / 30 + compute", but the tuning table defines salary per day (GDD Economy and Resources).
→ *Fix:* drop "/ 30" and write "Σ salary/day × headcount^1.2 / headcount".

**m10. Clue replay signals.**
- GDD M8 and Dora → Clue replay include Dora's first message and the AI's tone shifts; FR64 and Story 5.12 omit both.
- Stories 5.3 and 5.6 record days during play, while 5.11 and N5 say "the proof needs nothing recorded during play".
→ *Fix:* either add them to FR64 and 5.12 or remove them from GDD M8, and state which clue data is recorded and which is probed.

**m11. Stage-1 spine message in a locked channel.** The stage-1 Dora message (narrative example: channel `#engineering`, phases seed and series-a) can fall due in Garage, where #engineering is locked (narrative Content Formats; Story 5.4).
→ *Fix:* define a fallback channel (`#general`) or allow a stage-specific channel per phase in the spine beat data.

**m12. Production build vs test hook.** Story 2.13 asserts a "replay-consistent fingerprint" on "the production build on Pages", but `window.__hitl` exists only in test builds.
→ *Fix:* run the e2e against a test build of the same commit, and use the production build only for the no-console-error smoke test.

**m13. Metis answer rule.** Metis answers with "the player's most frequent answer for this template, else `metis_answer`". This is an epics assumption that is not in the GDD, the architecture or the narrative template format; the narrative template example has no `metis_answer` (epics Story 3.1, Final Validation assumptions; narrative Content Formats).
→ *Fix:* have Tiziano confirm it, then record it in GDD M5 and the narrative template format.

**m14. Away-report decision types.** "One line per notable Metis decision type" (FR23, EXPERIENCE.md Flow 2) has no field that defines a decision type (epics Story 3.7; narrative "While You Were Away" copy).
→ *Fix:* add an optional `reportGroup` key to template answers, plus ICU strings.

**m15. Founding-screen content and link.**
- Story 1.10's name-part word lists have no content kind or schema in 7.1.
- The FR53 "Accessibility" link on the founding screen is absent from 1.10's ACs until 8.2.
→ *Fix:* add a `wordlist` kind to 7.1 and a dormant Accessibility link (opening Settings) to 1.10.

**m16. Real brand in a pool line.** The Wind-down pool line "my Twitter drafts" names a real brand, which the forbidden-names rule bans (narrative End-of-Run Document Copy, line 1069).
→ *Fix:* change it to "my social drafts" or similar.

**m17. Story sizing.** Story 1.1 bundles the scaffold, ~20 lint fixtures, three workflows, deploy, `.mcp.json` and the docs. Stories 4.10, 7.5 and 7.6 are large (the epics already flag the last three).
→ *Fix:* split 1.1 into "scaffold + gates" and "CI + deploy + agent files"; allow splits in `gds-create-story`.

**m18. E3/E4 ACs that depend on later epics.**
- 3.5 and 3.7: stops on heavy decision or death.
- 3.11: notification on a heavy decision.
- 4.14: overdraft and Untimed conditions.
These reference behaviour from E4, E5 and E8.
→ *Fix:* state that they are verified with synthetic blocking events or fixtures and re-verified when the feature lands.

**m19. Tab title during the hidden preview.** It is unclear whether the hidden preview may change the title stage in the tab before the player returns (EXPERIENCE.md "updates only N" vs architecture D9; Story 3.10).
→ *Fix:* state that the preview changes only N, and the stage comes from the saved state.

**m20. D-E3 enforcement mechanism.** "A CI check that any change setting `status: final` carries his approval" has no mechanism (GitHub API review check vs branch protection; epics E7 content rule, Story 7.2).
→ *Fix:* specify it (for example, branch protection plus a required review from CODEOWNERS on `content/**`, and a CI job that fails if a `final` flip is authored by a bot).

**m21. Capability-grant units.** "−5 to −15 points (milli-points)" is ambiguous (epics Story 4.3).
→ *Fix:* write "−5,000 to −15,000 milli (−5 to −15 Alignment points)".

**m22. Trade-off rule not audited.** No story checks the GDD content trade-off rule (1–2 resources, ±10% of the current value, $500 floor; ±50% for heavy decisions) (GDD Economy; epics Stories 7.1, 7.5).
→ *Fix:* add an editorial CI warning, or a 7.5/7.9 review checklist item.


## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK.**

The planning set is unusually complete. Coverage is complete:

- 89/89 FRs, 19/19 NFRs and 50/50 UX-DRs are traced to stories;
- the D-E1 to D-E4 decisions are propagated, with the gaps noted above;
- the ACs are testable and module-mapped.

But one critical design contradiction (C1) and seventeen major issues would force AI dev agents to guess or would produce wrong behaviour.

**What can start now:**

- E1 Stories 1.1–1.6, 1.9–1.11 (after M16's prerequisites, and with the M5 reorder);
- the 8.1 PDFKit spike.

**Must be resolved before the relevant work starts:**

| Issue | Before |
|---|---|
| C1 | E2 balance and E3 |
| M1 | 1.7 / 1.8 are closed |
| M2, M3, M4, M8, M9, M10 | E2 |
| M6 | 2.12 |
| M11–M13 | E7 packs and the H1 gate |
| M7, M14, M15, M17 | E4 |

### Critical Issues Requiring Immediate Action

1. **C1:** the Garage compute ceiling ($4,900 MRR at 1 GPU unit) sits below the Seed gate ($5,000), and a player who does not delegate has no way to buy capacity in Garage. Decide the capacity model and the Garage purchase path.

### Recommended Next Steps

1. **Tiziano decides** C1 (capacity model and Garage purchase path), M1 (content-pack change policy), M15 (round-target state machine), the M14 tuning values (or delegating them to story agents), m13 (Metis answer rule) and m8 (counterfactual formula and copy).
2. **Update the architecture** (bmad/gds architecture update):
   - a "Time bases" table in D1 (M9);
   - the content-pack segment or pinning policy in D4 (M1);
   - a vocabulary table with owning stories, the heavy-decision `decision:` block, param-valued effects and built-in params in N3 and N4 (M2, M3);
   - the two-part `alignmentMilli` boundary rule (M10);
   - the canonical `RegionId` list (m6);
   - the ID ↔ path table (m7);
   - the small fixes m3, m4.
3. **Update epics.md** (gds-correct-course or a direct edit):
   - reorder E1 (M5) and E4 (M7);
   - insert 2.2 before 7.1 in the global sequence (M4);
   - resolve 2.12 → Timeline (M6);
   - rewrite the AC in 3.4 (M10) and the cascade anchor rules in 2.12 (M8);
   - add the spoiler CI rule and tests (M11) and the UI-copy approval tracking (M13);
   - add a Prerequisites (Tiziano) section (M16);
   - reword NFR17 (M12);
   - clean up the stale follow-ups (m1) and the CLI and scope syntax (m5).
4. **Update narrative-design.md and the GDD:**
   - the D-E3 wording at line 1286, and `status` in GDD M12 (M12);
   - fix the reference events (M17, M3) and the Twitter line (m16);
   - add the missing clue-replay signals or remove them (m10);
   - fix the burn formula wording (m9).
5. Re-run this readiness check on the updated set, then run `gds-sprint-planning`.

### Final Note

This assessment found **40 issues** (1 critical, 17 major, 22 minor) across 6 categories:

- cross-document conflicts on numbers, names, IDs, copy and paths;
- forward dependencies;
- undefined behaviour and tuning;
- hidden-state and spoiler rules;
- the content workflow after D-E3;
- determinism and persistence.

Address C1 and the majors listed for each starting point before those epics begin. These findings can be used to improve the artifacts, or Tiziano may choose to proceed as-is with the risks stated.

**Choices made on the user's behalf (unattended run):**

- Selected [C] Continue at the Step 1 menu.
- Used exactly the requester's document set: the epics next to the GDD, not `planning-artifacts/epics.md`. The configured glob patterns would have found none of the documents.
- Treated the FR1–FR89 / NFR1–NFR19 inventory in epics.md as the GDD's FR list (the GDD has no numbered FRs), after checking it against the GDD text.
- Wrote the report to the workflow's configured location, `{planning_artifacts}/implementation-readiness-report-2026-10-27.md`.
- Edited no planning document.

*Assessor: gds-check-implementation-readiness, 2026-10-27.*
