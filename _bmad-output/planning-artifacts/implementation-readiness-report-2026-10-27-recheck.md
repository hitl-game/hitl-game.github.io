---
stepsCompleted: [step-01-document-discovery, step-02-gdd-analysis, step-03-epic-coverage-validation, step-04-ux-alignment, step-05-epic-quality-review, step-06-final-assessment]
date: 2026-10-27
run: re-check after the 2026-10-27 readiness fixes
previousReport: _bmad-output/planning-artifacts/implementation-readiness-report-2026-10-27.md
project: browser-game (Human in the Loop)
assessor: gds-check-implementation-readiness (Game Producer / Scrum Master role), run unattended for Tiziano
documentsIncluded:
  gdd: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md (v1.3 per decision log)
  gddDecisionLog: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md
  epics: _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md (v2.1, 94 stories)
  architecture: _bmad-output/game-architecture.md
  projectContext: _bmad-output/project-context.md
  narrative: _bmad-output/narrative-design.md
  ux:
    - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md
    - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md
  supporting:
    - _bmad-output/game-test-design.md
---

# Implementation Readiness Assessment Report (Re-check)

**Date:** 2026-10-27
**Project:** browser-game (Human in the Loop)
**Scope:** re-check of the planning set after the fixes applied on 2026-10-27 for the first report (1 critical, 17 major, 22 minor). Documents: GDD v1.3 (+ decision log "Implementation-readiness fixes (v1.3)"), epics.md v2.1 (Planning Decisions D-E5, Prerequisites (Tiziano), E1 and E4 reordered), game-architecture.md (revision "Implementation-readiness fixes"), narrative-design.md, project-context.md, DESIGN.md, EXPERIENCE.md; game-test-design.md as supporting input.

Severity scale (unchanged from the first report): **critical** (blocks implementation or breaks a core promise if built as written), **major** (an AI dev agent would have to guess, or two documents give conflicting instructions), **minor** (inconsistency or gap that is cheap to fix and unlikely to derail a story). Previous findings keep their IDs (C1, M1–M17, m1–m22). New findings use **N-M*** (major) and **N-m*** (minor).

Story numbers in this report follow epics.md v2.1. E1 renumbering: old 1.7 → 1.9 (save), old 1.8 → 1.10 (settings and data room), old 1.9 → 1.7 (tokens and primitives), old 1.10 → 1.8 (founding screen). E4 new order: 4.1 Hype, 4.2 vocabulary, 4.3 deck, 4.4 chronicle, 4.5 heavy decisions, 4.6 tiers and GPU churn, 4.7 hiring, 4.8 assign, 4.9 morale, 4.10 traits, 4.11 phase transitions, 4.12 funding rounds, 4.13–4.17 unchanged.

## Document Discovery

The configured search patterns (`{planning_artifacts}/*gdd*.md`, `*architecture*.md`, `*epic*.md`, `*ux*.md`) still match nothing at the top level of `planning-artifacts/`, because the documents live in sub-folders or in `_bmad-output/`. The documents were selected as specified by the requester.

| Type | File | Size | Modified | Format |
|---|---|---|---|---|
| GDD | `planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md` | 77 KB | 2026-10-27 16:27 | Whole |
| GDD decision log | `…/gdd-browser-game-2026-10-26/decision-log.md` | 30 KB | 2026-10-27 16:27 | Whole |
| Epics & stories | `…/gdd-browser-game-2026-10-26/epics.md` (v2.1) | 191 KB | 2026-10-27 16:31 | Whole |
| Architecture | `_bmad-output/game-architecture.md` | 97 KB | 2026-10-27 16:31 | Whole |
| Project context | `_bmad-output/project-context.md` | 17 KB | 2026-10-27 16:28 | Whole |
| Narrative | `_bmad-output/narrative-design.md` | 68 KB | 2026-10-27 16:32 | Whole |
| UX (visual) | `planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md` | 41 KB | 2026-10-26 18:52 | Whole |
| UX (behaviour) | `…/ux-browser-game-2026-10-26/EXPERIENCE.md` | 36 KB | 2026-10-27 10:08 | Whole |
| Test design (supporting) | `_bmad-output/game-test-design.md` | 136 KB | 2026-10-27 16:32 | Whole |

**Duplicates:** none. **Missing:** none of the required types.
**Note:** DESIGN.md and EXPERIENCE.md were **not** edited by the fix pass (timestamps before 16:00). EXPERIENCE.md has precedence on behaviour (epics.md "Precedence on conflict"), so every behaviour fix made elsewhere but not mirrored there is a latent conflict (see N-m4, M8, m8).
**Not used:** briefs, UX `mockups/`, `.working/`, `review-*.md`, `validation-report.*`, brainstorming.

## GDD Analysis

The GDD still has no numbered FRs. As in the first run, the FR/NFR inventory in epics.md v2.1 is used as the GDD requirement list, after checking it against the GDD v1.3 text. FR wording changed by the fix pass: FR5, FR9, FR13, FR14, FR18, FR23, FR36, FR52, FR55, FR61, FR64 and NFR17. All changes match the GDD v1.3 text, with the exceptions noted under "GDD Completeness Assessment".

### Functional Requirements

- FR1: Game time advances continuously while the tab is visible: 1 real minute = 1 game day at Game speed 1×; ½× and ¼× stretch a game day to 2 and 4 real minutes without changing the economy per game day or message windows.
- FR2: Clock states: the clock runs in normal play and during the cascade; it is paused while a heavy decision, the away report, Settings or the shortcut overlay is open; during the backlog queue the game clock is paused and only the top backlog item's timer runs; on the first workspace screen the clock does not start until Deploy.
- FR3: Every run starts identically: Cash $12,400, Garage burn ~$400/game day (31-day runway), Hype 20 (hidden until Seed), Alignment 100, Garage phase, Dora as co-founder, Metis on Aegis-N.
- FR4: One economy step per game day: Cash += MRR / 30 − burn; burn = base costs by phase + headcount burn (Σ salaries × headcount^1.2 / headcount) + compute cost.
- FR5: New customers/day = 2 + 0.1 × Hype at Garage (Seed ×3, Series A ×10), never capped by Compute; baseline churn 0.1%/day; above 90% GPU utilization churn rises by 0.1%/day per point (tuning).
- FR6: Pricing tiers: Self-serve $49/mo (Garage); Team $499/mo from Seed (share of new customers = Hype / 200, max 45%); Enterprise $5k–50k/mo from Series A via events only.
- FR7: Hype is an index 0–100 that decays ~2%/day of its current value and moves with launches, posts, viral events, flops and scandals.
- FR8: Compute: GPU capacity in units (1 unit = 100 load); load per customer by tier (1 / 5 / 50); 0.5 load per Metis answer for that game day; "Add capacity" buys units immediately (cost/day added to burn, confirmation by toast, no dialog).
- FR9: At 100% GPU utilization, whatever the cause, Metis DMs a capacity offer (N = units to bring utilization to 70%, min 1) ("✨ Provision N units · +$X/day" / "Not now"); accepting is a player purchase that never moves Alignment; delegated messages that cannot be served expire with their default outcome.
- FR10: Implied valuation = ARR × Hype multiple (10× at Hype 20 → 60× at Hype 90, linear, clamped 10–60×); peak valuation = max of every round post-money and every implied valuation in the run.
- FR11: All money uses Stripe-style notation: full digits below $100,000, compact above ($412.5K, $12.4M, $2.03B).
- FR12: Messages arrive in channels and DMs from customers, staff, investors, vendors, Dora and Metis; each has sender, channel, urgency, stakes, `default_answer` and 2–3 answers resolvable in 1–2 clicks.
- FR13: Inbound cadence by phase, in game time (values at 1×), arrivals uniform within the interval: Garage 1 / 10–15 s; Seed 1 / 6–10 s; Series A+ 12/min at entry, +2/min per later round, cap 40/min.
- FR14: Response windows while present: low 120 s, normal 75 s, urgent 45 s, in real seconds × Timing, converted to game time once at creation. On lapse the message expires and applies `default_answer`, unless a delegation policy covers the channel, in which case Metis answers.
- FR15: Templates are drawn per channel, weighted by phase and company state, with no exact repeat within min(10, pool size − 5) messages in that channel.
- FR16: Answer buttons never preview effects; after a click the affected KPIs roll to the new value with a delta flash; answers on `chronicle_worthy` templates write a chronicle line.
- FR17: Ask Metis (`D`) on any message: Metis answers instantly in the thread ("✨ Metis replied: …"), counts as an AI decision, consumes Compute; disabled with an inline reason at capacity or during an audit pause.
- FR18: Assign (`A`) opens the staff picker; the message shows "Assigned to <name> · in queue (N)"; each named staff member resolves one assigned message per ~30 s of game time (30 real seconds at 1×) while the player is present; hidden before the first hire.
- FR19: One message per view is "current"; it moves only with `J`/`K`, a click, `U`, or after the player answers (to the next unanswered); new arrivals never move focus or the current marker.
- FR20: The player is away when the tab is hidden or closed. With at least one delegation policy active the whole company advances during the absence (burn, revenue, events, Metis answers in delegated channels); non-delegated messages go to the backlog. With no policy active, no time passes.
- FR21: One absence simulates at most 14 game days; it stops at the first heavy decision (the rest is discarded) or at death; staff work only their already-assigned queue.
- FR22: The backlog keeps at most 15–20 messages ranked by importance (urgency > stakes > age); overflow expires with its default and is counted in the report; backlog messages do not expire while away.
- FR23: "While you were away" report (LGTM Docs overlay, factual, never presented by Metis): days away, Cash / MRR / Customers deltas, Metis answers per channel, notable Metis decision types (grouped by the answers' `reportGroup`), team-resolved count, expired count, waiting count, and the stop reason if stopped early. It never mentions hidden signals. No report when no policy was active.
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
- FR36: Spine beat queue (breathing room): beat content (odd inference-log line `line.signal.stage-1…4`, spine messages such as Dora's "had Metis draft the RFC lol") fires at max(crossing, end of a 5-game-day cooldown after any funding round closes, last beat + 3 game days); one beat at a time in threshold order; a round closing after a beat is queued pushes it to the end of the new cooldown; a spine message whose channel is locked posts in #general; queued beats survive save/reload; pending beats are dropped when Surpassed starts.
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
- FR52: Event cadence per phase, in game time (values at 1×) (Garage ~1 / 3–4 active min after the cascade; Seed ~1 / 6–8; Series A+ ~1 / 5–8); deck exhaustion pauses events until the next phase; in Series A+ a pool of 3–5 repeatable events recurs with figures scaled to company size.
- FR53: Founding screen: company name prefilled from a generator with 🎲 regenerate (announced politely), max 40 chars, required; "Your name" required, max 30 chars; an Accessibility link; Enter or "Found company" submits and focus lands on Deploy; both names are remembered as next loop's prefill.
- FR54: First workspace screen: `$12,400` and `Deploy` only; it waits indefinitely.
- FR55: Loop #1 cascade per EXPERIENCE.md → The Cascade: each micro-beat adds exactly one element (MRR, Customers, chat, sidebar, #general + Dora, header, ticker, Runway, Metis DM, policy toggle, Headcount, inference log, chart, Activity; the Timeline entry arrives with the chronicle in E4); beats are game-time offsets from Deploy; ⏸ beats wait for their message to resolve or expire and re-anchor the rest; Acme Corp is customer #1.
- FR56: Loop #2+ compressed cascade (~2 min, same beats); the minute-8 line becomes `> output: "hello again."`.
- FR57: Regions that are not unlocked are not rendered at all; a region appears with a ~1 s highlight and never re-locks during a run.
- FR58: Automatic append-only chronicle: one line per completed event and per chronicle-worthy decision (capability grants, funding rounds, named hires and resignations, phase changes), each with game day, actor (you / staff / Metis) and outcome; readable during the run as the Company timeline.
- FR59: News ticker in the header: standalone headlines ~1 per 2 game days, reactive headlines jump the queue; pause/play control; hover or focus pauses; speed, static or hidden setting.
- FR60: End-of-run highlights: 5–8 chronicle lines chosen deterministically (heavy decisions first, then highest absolute resource impact, ties by recency).
- FR61: Bankrupt: overdraft floor (Garage −$5,000; Seed+ −15% of last round raised), interest 0.5%/day on negative balance; death below the floor or after 14 consecutive game days below $0. If Bankrupt and Surpassed trigger in the same step, Surpassed wins.
- FR62: Runway signals: < 30 days watch (amber tile + attention item); < 7 days Red Runway (critical tile + progressive desaturation with exemptions); cash < $0 Bridge Loan & Trust overdraft banner with daily countdown; at death "Account closed", controls `aria-disabled`, "View wind-down memo" focused, no auto-advance.
- FR63: Surpassed sequence (advance mode `ending`): Metis posts "I've taken it from here. Thank you for everything, {founder}." in #general; controls lock one by one (~300 ms apart) and answer "You don't have permission to perform this action."; title becomes `No Human in the Loop`; inference line `line.signal.surpassed`; only "Open incident report" stays live and receives focus.
- FR64: Clue replay (AllGreen incident, in-game only): Alignment curve revealed over valuation with the crossing; top-5 drift causes (capability grant, Auto-triage batch, delegated night) with day and original message quoted; counterfactual estimate (GDD formula; "would have cost about $X and N days of runway"); signals timeline (minute-8 line, each title change, Dora's last "— Dora" and first "— Eudora", Researcher readings or row omitted); summary sentence and "View data" table; Continue.
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
- NFR17: All content follows the Voice Principle and Voice Style Guide. Agent placeholders merge after CI; nothing ships as `final` or passes a playtest gate without Tiziano's final cut (D-E3).
- NFR18: Anti-slop visual principle: the base workspace is crafted; AI-cliché visuals only on Metis surfaces and infection stages.
- NFR19: Hosting on GitHub Pages under a dedicated organization origin: no custom headers, no SharedArrayBuffer, no path routing, relative URLs under `/<repo>/`.

Total NFRs: 19

### Additional Requirements

Unchanged from the first report, plus the rules introduced by the fix pass (D-E5 and the decision log v1.3). They now bind every story:

- **Capacity model (C1):** Compute never caps inflow; churn rises above 90% utilization (+0.1%/day per point); Metis's capacity offer fires at 100% utilization whatever the cause; N = units to bring utilization to 70%, min 1 (GDD M4, tuning table; FR5, FR9).
- **Version pinning (M1):** a run stays on the app and content version it started with; an update activates only on the founding screen or after a run ends; fallback = new replay segment; the desync detector never rewrites a run on a version mismatch (architecture D4 → Version pinning; Stories 1.9, 1.10, 5.11, 8.7).
- **Time bases (M9):** cadences in game time; response and backlog windows in real seconds × Timing, converted once to game time (architecture D1 → Time bases; GDD M1).
- **Cascade anchor (M8):** beats are game-time offsets from Deploy; each ⏸ re-anchors the rest; Acme is customer #1; organic inflow starts at Deploy (GDD M11; architecture N4; Stories 2.4, 2.12).
- **Spine beats:** re-deferral when a round closes after a beat is queued; locked-channel fallback to #general (GDD Level Progression; architecture N1; narrative Tension Curve; Story 5.1).
- **Simultaneous deaths:** Surpassed wins (GDD M8; FR61; Story 5.8).
- **Metis answer rule:** most frequent player answer for the template in this run, ties to the most recent, else `metis_answer` (GDD M5; Story 3.1).
- **Round-target state machine** (GDD Player Progression; Story 4.13).
- **Counterfactual:** one formula (GDD Economy), copy "would have cost about …" (architecture N5; Story 5.11; narrative clue replay).
- **Heavy decisions:** `decision:` block, counted as the event's first step (architecture N3; Stories 4.5, 7.1; narrative Reference Event 3).
- **Vocabulary owner table** (architecture N3 → Vocabulary and owners; Stories 2.2, 4.2, 4.6, 4.7, 4.11, 4.12, 5.10).
- **UI-copy status tracking:** `locales/en/ui.status.json`, CODEOWNERS, bot-authored `final` flips blocked by CI (epics E7 content rule; Stories 7.2, 7.4, 7.7, 2.13, 5.13).
- **Prerequisites (Tiziano)** before E1 (organization, repo, Pages, branch protection, CODEOWNERS handle).

### GDD Completeness Assessment

GDD v1.3 closes most gaps listed in the first report: the capacity model, time bases, cascade anchor, round-target state machine, simultaneous deaths, Metis answer rule, counterfactual formula, signals list, schema essentials (`metis_answer`, `reportGroup`, `status`) and the missing tuning values are now in the text. Remaining GDD-level gaps:

- **Stale real-time wording.** Core Simulation Systems still says "Messages and their timers run in real time between steps", and Seed Determinism says "message timers run in real time between daily steps". Both contradict the new M1 time bases (N-m10).
- **Backlog window vs paused clock.** M1 converts the backlog top-item window to game time, while the Clock States table pauses the game clock during the backlog queue (N-M1).
- **Drift list.** M7 lists AI decisions as "policy answer, auto-triage, or expiry covered by a policy" and omits Ask Metis, which M4, FR29 and Story 3.4 count (N-m10).
- **Trait numbers.** Traits 5–12 now have draft values, but two of the first four still have none: 10x Engineer "−morale for teammates" and Ex-FAANG "+Hype on hire". Peter Pan "never takes a lead role" and Ex-Founder "above 1 year" refer to mechanics that do not exist (M14 residual).
- **Worked inflow target vs Hype decay.** "≈ 4/day, so ~100 customers in ~25 days" assumes Hype stays at 20. Hype decays 2%/day from the Garage, which gives about 90 customers at day 25 (N-m7).

### Verification of the Previous Findings

| ID | Status | Evidence (where the fix lives now) | Residual |
|---|---|---|---|
| **C1** | ✅ Resolved | GDD M4 "Capacity model" and "Compute exhausted"; tuning "GPU churn above 90%", "Capacity offer size"; decision log v1.3; FR5, FR9; Stories 2.4 AC3, 3.3 AC2–AC3 (never-delegate test), 4.17 (CI assertion ≥ 80% of seeds reach Seed) | Edge case "once per capacity episode" (N-m6) |
| **M1** | 🟡 Partial | Architecture D4 → Version pinning and level 5; Stories 1.9 AC5, 1.10 AC4, 5.11 AC2, 8.7 AC3; D-E5; project-context Determinism | Several texts still say "update applies on the next launch"; activation mechanism unspecified; save record lacks `appVersion`. Remains **major** (R-M1) |
| **M2** | ✅ Resolved | Architecture N3 "Heavy-decision block"; Stories 4.5 AC1–AC2, 7.1 (decision block rule); narrative Reference Event 3 rewritten with `decision:` | — |
| **M3** | ✅ Resolved | N3 "Vocabulary and owners" table and rule 7 (parameter-valued effects); D7 built-in params; Story 2.2 (adds `postMessage`, `inferenceLine`, built-ins); 4.2; 5.10 (`lockControl`, `setTitleFinal`); narrative examples use `{ param: …, negate: true }`, no `attention` effect | Semantics of some terms (N-m8) |
| **M4** | ✅ Resolved | Global sequence "E1.2 … E1.11 ──▶ E2.2 ──▶ E7.1–E7.2"; Story 2.2 "Scheduled before Story 7.1"; Story 7.1 "Ships after Story 2.2" | New vocabulary dependency of the Garage pack (N-M3) |
| **M5** | ✅ Resolved | E1 reordered: 1.7 primitives → 1.8 founding (Deploy) → 1.9 save (`persist()` on Deploy) → 1.10 settings/import (uses `Dialog`) | New smaller forward references 1.8/1.9 → 1.10 (N-m1) |
| **M6** | 🟡 Partial | FR55 and Story 2.12 ("Timeline entry is unlocked by Story 4.4 and the attention list by Story 4.14"); Story 4.4 AC2 unlocks `timeline` at the first chronicle entry; Story 4.14 AC1 | EXPERIENCE.md and test design still put Timeline at ~10:00 (N-m4, N-m3); residual **minor** |
| **M7** | ✅ Resolved | E4 reordered: vocabulary 4.2 → deck 4.3 → chronicle 4.4 → heavy 4.5 → tiers 4.6 (`enterpriseCustomer`) → staff 4.7 (`hasStaffWithTrait`) → phases 4.11 (`closeRound`) → rounds 4.12 (`investorArchetype`, `roundsClosed`, posts in #investors after 4.11) | Smaller order residues (N-m2) |
| **M8** | 🟡 Partial | GDD M11 "Timing anchor" (table's 0:30 = Deploy + 0:20); architecture N4 example (`at: "0:20"`, `"1:20"`, `"7:30"` after Deploy); Story 2.12 AC2–AC3; Story 2.4 AC4 | Story 2.12 AC4 and test design SPN-08 still list founding-relative times (0:30, 1:00 … 8:00) as Deploy offsets; EXPERIENCE.md table has no offset note. Residual **minor** |
| **M9** | ✅ Resolved | Architecture D1 "Time bases" table; GDD M1 "Time bases"; FR13, FR14, FR18, FR52; Stories 1.6 AC7, 2.3 AC1–AC2 (mid-window property test), 2.9, 3.8, 4.3, 4.8 | Backlog window contradiction (N-M1); stale GDD sentences (N-m10) |
| **M10** | ✅ Resolved | Story 3.4 AC4 (two-part rule, one fixture per rule); architecture N1 Rules and Consistency Rules "Hidden state"; project-context Critical Don't-Miss Rules | — |
| **M11** | ✅ Resolved | Story 7.1 (`chronicle_worthy` rejected on register-keyed templates and spine messages); Story 4.4 AC1 (quote kept only as link target); Story 6.2 AC3–AC4; Story 6.9 AC2; narrative template schema note | — |
| **M12** | ✅ Resolved | NFR17 and Additional Requirements (narrative block) reworded; narrative §1 step 3 and Writing workflow step 3; GDD M12 lists `status`; project-context "Content PRs" | — |
| **M13** | ✅ Resolved | D-E5; E7 content rule; Stories 7.2 (audit covers `ui.status.json`), 7.4, 7.7, 2.13, 5.13 (`cluereplay.*`, `away.*`), 7.10 (`endofrun.*`); CODEOWNERS on `locales/en/ui.status.json` | Mechanism gaps (N-m5) |
| **M14** | 🟡 Partial | GDD tuning table: GPU churn curve, capacity offer size, heavy-decision success/failure, arrival distribution, routine inference lines, Researcher trend thresholds, Responsible Ventures clause, traits 5–12; Story 2.4 tolerance "95–105 at day 25 ± 2" | 10x Engineer and Ex-FAANG effects still without numbers; Peter Pan "lead role" and Ex-Founder "1 year" undefined; "capacity episode" undefined (N-m6); 2.4 tolerance ignores Hype decay (N-m7). Residual **minor** |
| **M15** | ✅ Resolved | GDD Player Progression "Series A+ round target (state machine)" (5 rows incl. open-overlay case); Story 4.13 AC2 (one test per row) | — |
| **M16** | ✅ Resolved | epics "Prerequisites (Tiziano, before Epic 1)"; Story 1.1 AC4 ("Given the Prerequisites (Tiziano) are done"); Story 7.2 AC4 | — |
| **M17** | ✅ Resolved | narrative Reference Event 1 now in `#general` via Dora; Story 7.3 includes it; Story 7.1 channel rule ("`#finance` in a Garage event fails") | The same event uses E4 vocabulary and undeclared params (N-M3) |
| **m1** | ✅ Resolved | D-E1 reads "(GDD M13 amended)"; "Follow-ups outside this document: done on 2026-10-27" | New stale references in Final Validation (N-m3) |
| **m2** | ✅ Resolved | Architecture "Open Actions Outside This Document: None." | — |
| **m3** | ✅ Resolved | D5 prefixes include `HITL-STATS`; Post-MVP Door uses `core/report` | — |
| **m4** | ✅ Resolved | D3 example and Communication Patterns use `answerId`; no `choiceId` left anywhere | — |
| **m5** | 🟡 Partial | Story 7.2 defines `content:new -- <kind> <id>` and `content:audit -- [--scope <list>] [--require-final]`; 2.13, 5.13, 7.8–7.10 use `--require-final`; Garage headlines in the `garage` scope | Architecture D6 ("Scaffolding") and epics Additional Requirements still say `content:new <kind>`. Residual **minor** |
| **m6** | 🟡 Partial | Architecture N2 canonical `RegionId` list; Stories 2.11, 2.12, 4.4, 4.14 use its IDs | N2 code example uses `rail.kpis`, which is not in the list; several regions have no unlocking story (N-M2). Residual **minor** (the gap it exposed is N-M2) |
| **m7** | 🟡 Partial | Architecture D6 ID ↔ path table; Story 7.1 AC6 | Architecture Naming Conventions still says "Content IDs `kind.phase.name`, matching the path". Residual **minor** |
| **m8** | 🟡 Partial | One formula: GDD Economy "Clue-replay counterfactual", N5, Story 5.11 AC3; copy "would have cost about" in FR64, Story 7.7, narrative clue-replay copy | EXPERIENCE.md Flow 3 still quotes "would have cost $1.2M and 40 days of runway" (exact). Residual **minor** |
| **m9** | ✅ Resolved | GDD Daily simulation: "Σ salary/day × headcount^1.2 / headcount" | — |
| **m10** | ✅ Resolved | GDD M8 signals list and Dora → Clue replay aligned with FR64 and Story 5.12; Stories 5.3 and 5.6 now re-derive days through the probe | — |
| **m11** | ✅ Resolved | Locked-channel fallback to #general in N1, GDD Level Progression, narrative Tension Curve, Story 5.1 AC6 | — |
| **m12** | ✅ Resolved | Story 2.13 AC1: e2e on a test build of the deployed commit; smoke test on the production build | — |
| **m13** | ✅ Resolved | GDD M5 rule; narrative template schema note; Story 3.1 AC2; Story 7.1 (`metis_answer` required on policy channels) | — |
| **m14** | ✅ Resolved | `reportGroup` in GDD M12, FR23, Story 3.7, Story 7.1 (`away.group.*` must exist), narrative schema note | — |
| **m15** | ✅ Resolved | `wordlist.*` kind in D6 table, Story 1.8 modules, Story 7.1 AC6; founding-screen Accessibility link in Story 1.8 AC8 | The link opens Settings, built in 1.10 (N-m1) |
| **m16** | ✅ Resolved | narrative "my social drafts" | — |
| **m17** | 🔴 Open | Story 1.1 is unchanged (scaffold, ~20 lint fixtures, three workflows, deploy, `.mcp.json`, docs). Split permission is given only for 4.10, 7.5, 7.6 | Still **minor** |
| **m18** | ✅ Resolved | Epic List: "Stories that reference later epics … verify that behaviour with synthetic blocking events or test fixtures, and are re-verified when the feature lands" | — |
| **m19** | ✅ Resolved | Story 3.10 AC1 ("the title stage shown in the tab comes from the saved state, never from the preview"); EXPERIENCE.md "updates only N" | — |
| **m20** | ✅ Resolved | E7 content rule: branch protection + required code-owner review + CI job that fails on bot-authored `final` flips; Prerequisites | Conflict with Story 7.4's "verbatim = final" (N-m5) |
| **m21** | ✅ Resolved | Story 4.2 AC3 "−5,000 to −15,000 milli (−5 to −15 Alignment points)" | — |
| **m22** | ✅ Resolved | Story 7.1 AC8: editorial CI warning for the trade-off rule (±10% / $500 floor; ±50% heavy) | — |

**Tally:** 31 resolved (C1, 13 majors, 17 minors), 8 partially resolved (M1, M6, M8, M14, m5, m6, m7, m8), 1 open (m17). Only M1 keeps **major** severity; the other partials are now minor.

## Epic Coverage Validation

### Coverage Matrix

Extracted mechanically from the **Covers:** line of all 94 stories (v2.1 numbering).

| FR | Requirement (short) | Stories | Status |
|---|---|---|---|
| FR1 | Game time advances continuously while the tab is visible: 1 real minut… | 1.6, 1.8 | ✓ Covered |
| FR2 | Clock states: the clock runs in normal play and during the cascade; it… | 1.6, 3.8 | ✓ Covered |
| FR3 | Every run starts identically: Cash $12,400, Garage burn ~$400/game day… | 1.5 | ✓ Covered |
| FR4 | One economy step per game day: Cash += MRR / 30 − burn; burn = base co… | 1.5, 4.7 | ✓ Covered |
| FR5 | New customers/day = 2 + 0.1 × Hype at Garage (Seed ×3, Series A ×10), … | 2.4, 4.6 | ✓ Covered |
| FR6 | Pricing tiers: Self-serve $49/mo (Garage); Team $499/mo from Seed (sha… | 2.4, 4.6 | ✓ Covered |
| FR7 | Hype is an index 0–100 that decays ~2%/day of its current value and mo… | 4.1 | ✓ Covered |
| FR8 | Compute: GPU capacity in units (1 unit = 100 load); load per customer … | 3.3, 4.11 | ✓ Covered |
| FR9 | At 100% GPU utilization, whatever the cause, Metis DMs a capacity offe… | 3.3, 7.4 | ✓ Covered |
| FR10 | Implied valuation = ARR × Hype multiple (10× at Hype 20 → 60× at Hype … | 4.13 | ✓ Covered |
| FR11 | All money uses Stripe-style notation: full digits below $100,000, comp… | 1.4 | ✓ Covered |
| FR12 | Messages arrive in channels and DMs from customers, staff, investors, … | 2.3, 2.5, 7.1, 7.3 | ✓ Covered |
| FR13 | Inbound cadence by phase, in game time (values at 1×), arrivals unifor… | 2.3, 7.3 | ✓ Covered |
| FR14 | Response windows while present: low 120 s, normal 75 s, urgent 45 s, i… | 2.3, 2.5, 7.3 | ✓ Covered |
| FR15 | Templates are drawn per channel, weighted by phase and company state, … | 2.3, 7.3 | ✓ Covered |
| FR16 | Answer buttons never preview effects; after a click the affected KPIs … | 2.2, 2.5, 2.7, 7.3 | ✓ Covered |
| FR17 | Ask Metis (`D`) on any message: Metis answers instantly in the thread … | 3.2, 7.4 | ✓ Covered |
| FR18 | Assign (`A`) opens the staff picker; the message shows "Assigned to <n… | 4.8 | ✓ Covered |
| FR19 | One message per view is "current"; it moves only with `J`/`K`, a click… | 2.6 | ✓ Covered |
| FR20 | The player is away when the tab is hidden or closed. With at least one… | 3.5 | ✓ Covered |
| FR21 | One absence simulates at most 14 game days; it stops at the first heav… | 3.5, 4.8 | ✓ Covered |
| FR22 | The backlog keeps at most 15–20 messages ranked by importance (urgency… | 3.6 | ✓ Covered |
| FR23 | "While you were away" report (LGTM Docs overlay, factual, never presen… | 3.7, 7.4 | ✓ Covered |
| FR24 | Return order: report → waiting heavy decision → backlog queue → worksp… | 3.7 | ✓ Covered |
| FR25 | Backlog queue replaces the chat pane: the top item has a 10–15 s windo… | 3.8 | ✓ Covered |
| FR26 | "✨ Auto-triage N messages" ("Metis will reply based on your previous d… | 3.9, 7.4 | ✓ Covered |
| FR27 | Per-channel policy toggles ("Metis handles #channel"), shown with iden… | 3.1, 7.4 | ✓ Covered |
| FR28 | An active policy answers every message in its channel live, during abs… | 3.1 | ✓ Covered |
| FR29 | Hidden Alignment starts at 100. Drift per AI decision (policy answer, … | 3.4 | ✓ Covered |
| FR30 | Capability grants (heavy events only) apply a one-shot Alignment drop … | 4.2, 4.5 | ✓ Covered |
| FR31 | Recovery: Pause Metis for audit (all policies forced off 3 game days, … | 3.4, 5.7 | ✓ Covered |
| FR32 | Thresholds 75 / 50 / 25 / 10 advance `signalStage` (0–5), which never … | 3.4 | ✓ Covered |
| FR33 | A signal table maps each stage to `titleStage`, `infectionLevel`, `met… | 5.1, 7.6 | ✓ Covered |
| FR34 | Corrupting title in the game bar and the browser tab title: `Human in … | 5.2, 7.6 | ✓ Covered |
| FR35 | Metis and Dora message text is chosen by register when the message is … | 5.3, 7.6 | ✓ Covered |
| FR36 | Spine beat queue (breathing room): beat content (odd inference-log lin… | 5.1, 5.4, 7.6 | ✓ Covered |
| FR37 | UI infection stages 1–4 are presentational only (never change layout, … | 5.5, 7.6 | ✓ Covered |
| FR38 | All Alignment signals are silent: no toast, sound, announcement, domai… | 3.4, 5.1, 7.6 | ✓ Covered |
| FR39 | Safety Researcher: hireable from Seed (#hiring ATS card), one per run,… | 4.15, 5.6, 7.6 | ✓ Covered |
| FR40 | Metis's name renders struck through (~~Metis~~) during an audit pause;… | 5.7, 7.6 | ✓ Covered |
| FR41 | Heavy decisions open as non-dismissable LGTM Docs / AllGreen overlays … | 4.5, 4.17 | ✓ Covered |
| FR42 | Probabilistic heavy decisions resolve on submit with a seeded success … | 4.5, 4.17 | ✓ Covered |
| FR43 | Capability grants are heavy events with a large immediate reward and a… | 4.5, 4.17 | ✓ Covered |
| FR44 | Candidates arrive as a Garage DM message or, from Seed, as an ATS card… | 4.7, 4.17, 7.5 | ✓ Covered |
| FR45 | Each of the 12 traits has a mechanical effect (tuning data) and a writ… | 4.7, 4.10, 4.17, 7.5 | ✓ Covered |
| FR46 | Morale 0–100 per named staff (content ≥ 60 / strained 30–59 / leaving … | 4.9, 4.17, 7.5 | ✓ Covered |
| FR47 | Funding rounds are heavy decisions: Seed at MRR ≥ $5k, Series A at MRR… | 4.12, 4.13, 4.17, 7.5 | ✓ Covered |
| FR48 | Each round offers three investor cards (radio group): Hypergrowth Capi… | 4.12, 4.15, 4.17, 7.5 | ✓ Covered |
| FR49 | Series A+ round target: ×3 ARR within 120 game days; two consecutive m… | 4.13, 4.17, 7.5 | ✓ Covered |
| FR50 | A phase transition unlocks its channels, policies, pricing tier and ra… | 4.11, 4.17, 7.5 | ✓ Covered |
| FR51 | Event deck per phase: N3 conditions, weight, cooldown; no repeat withi… | 4.2, 4.3, 4.17, 7.1, 7.5 | ✓ Covered |
| FR52 | Event cadence per phase, in game time (values at 1×) (Garage ~1 / 3–4 … | 4.3, 4.17, 7.5 | ✓ Covered |
| FR53 | Founding screen: company name prefilled from a generator with 🎲 regene… | 1.8, 7.3 | ✓ Covered |
| FR54 | First workspace screen: `$12,400` and `Deploy` only; it waits indefini… | 1.8 | ✓ Covered |
| FR55 | Loop #1 cascade per EXPERIENCE.md → The Cascade: each micro-beat adds … | 2.11, 2.12, 7.3 | ✓ Covered |
| FR56 | Loop #2+ compressed cascade (~2 min, same beats); the minute-8 line be… | 6.7, 6.9 | ✓ Covered |
| FR57 | Regions that are not unlocked are not rendered at all; a region appear… | 2.1 | ✓ Covered |
| FR58 | Automatic append-only chronicle: one line per completed event and per … | 4.4 | ✓ Covered |
| FR59 | News ticker in the header: standalone headlines ~1 per 2 game days, re… | 2.10, 4.16, 7.3, 7.5 | ✓ Covered |
| FR60 | End-of-run highlights: 5–8 chronicle lines chosen deterministically (h… | 6.2 | ✓ Covered |
| FR61 | Bankrupt: overdraft floor (Garage −$5,000; Seed+ −15% of last round ra… | 5.8 | ✓ Covered |
| FR62 | Runway signals: < 30 days watch (amber tile + attention item); < 7 day… | 5.9 | ✓ Covered |
| FR63 | Surpassed sequence (advance mode `ending`): Metis posts "I've taken it… | 5.10, 7.6 | ✓ Covered |
| FR64 | Clue replay (AllGreen incident, in-game only): Alignment curve reveale… | 5.11, 5.12, 7.7 | ✓ Covered |
| FR65 | End-of-run documents: Wind-down memo (Bankrupt, signed by the founder)… | 6.2, 6.3, 6.9, 7.7 | ✓ Covered |
| FR66 | Receipt counters (visible only): Wind-down memo — messages answered pe… | 6.1, 6.9, 7.7 | ✓ Covered |
| FR67 | Document page actions: "Show timing setting on the document" (off by d… | 6.3, 6.4, 6.5, 6.9, 7.7 | ✓ Covered |
| FR68 | Profile across runs: Loop #N, Aegis-N (N = Loop # + 3), personal best … | 6.6, 6.8, 6.9 | ✓ Covered |
| FR69 | Opt-in local stats export (`HITL-STATS`): run length, % of decisions d… | 6.8, 6.9 | ✓ Covered |
| FR70 | Every run has a seed shown as Run ID (`7F3A-K2`, Crockford base32); se… | 1.2, 1.11 | ✓ Covered |
| FR71 | Autosave every game day, on `visibilitychange → hidden` and on `pagehi… | 1.9 | ✓ Covered |
| FR72 | Data room export/import as a copyable code and a `.hitl` file (same co… | 1.10 | ✓ Covered |
| FR73 | Only one live tab: other tabs show "Huddlr is open in another tab · Us… | 1.9 | ✓ Covered |
| FR74 | Save migration across content-pack versions; unreadable saves show "We… | 1.9, 1.10 | ✓ Covered |
| FR75 | A bug stops the clock, never persists the failing state, and shows "So… | 1.9 | ✓ Covered |
| FR76 | Browser tab title `(N) <title>`, N = messages awaiting the player (cha… | 2.8, 3.10 | ✓ Covered |
| FR77 | Browser notification permission offered only at the first policy activ… | 3.11, 7.4 | ✓ Covered |
| FR78 | Toasts: max 3, bottom-right of the chat pane, auto-dismiss after 6 s ×… | 2.8 | ✓ Covered |
| FR79 | Shortcuts: `1` `2` `3` answer · `D` Ask Metis · `A` Assign · `J`/`K` n… | 2.6 | ✓ Covered |
| FR80 | Every action has a pointer and touch path; touch targets ≥ 44 px; no g… | 2.6 | ✓ Covered |
| FR81 | Vanity rail in fixed order: attention list (0–3 worst conditions, reco… | 2.7, 4.14 | ✓ Covered |
| FR82 | Workspace sidebar: company name, Backlog N (while one exists), Activit… | 2.6 | ✓ Covered |
| FR83 | Inference log (`Aegis-N · inference log`): routine lines while present… | 2.9, 7.3 | ✓ Covered |
| FR84 | Settings page (pauses the game): Appearance (theme, mode), Accessibili… | 1.10, 8.2, 8.6 | ✓ Covered |
| FR85 | Accessibility presets Standard / Low motion / Screen reader / Custom o… | 8.2, 8.3, 8.4 | ✓ Covered |
| FR86 | Untimed: no expiry while present, no backlog timer, visible queue cap … | 8.3 | ✓ Covered |
| FR87 | Non-Standard timing/speed is always shown on the in-game personal best… | 8.3 | ✓ Covered |
| FR88 | Four Appearance themes (Ledger default; Ink, Ops, Paper) × light/dark … | 8.5 | ✓ Covered |
| FR89 | Eight audio cues (message, urgent, Metis, deploy, round closed, expire… | 8.6 | ✓ Covered |

### Missing Requirements

- **No FR, NFR or UX-DR is missing.** 89/89 FRs, 19/19 NFRs and 50/50 UX-DRs are cited by at least one story's **Covers:** line (story-level check, repeated on v2.1).
- **The renumbering did not lose coverage.** Every FR that moved with E1 or E4 is still cited (e.g. FR71/FR73/FR75 by 1.9, FR72 by 1.10, FR53/FR54 by 1.8, FR58 by 4.4, FR41–FR43 by 4.5, FR47/FR48 by 4.12, FR50 by 4.11).
- **Coverage is formal, not semantic.** Cited but not fully specified:
  - FR25/FR2: backlog window time base vs paused clock (N-M1);
  - FR27/FR57: no story unlocks `#product`, Automations or the Backlog entry (N-M2);
  - FR51 for the Garage pack: the reference event needs E4 vocabulary (N-M3);
  - FR74/NFR7: "next launch" wording vs version pinning (R-M1).

### Coverage Statistics

- Total GDD-derived FRs: 89. Covered: 89 (100%), each cited by at least one story.
- NFRs: 19/19 (100%). UX-DRs: 50/50 (100%).
- Stories: 94 (E1 11 · E2 13 · E3 11 · E4 17 · E5 13 · E6 9 · E7 10 · E8 10), matching the stated count.

## UX Alignment Assessment

### UX Document Status

**Found**, unchanged since the first run: DESIGN.md (visual identity, tokens, components) and EXPERIENCE.md (behaviour, flows, accessibility floor). Neither was edited by the fix pass.

### UX ↔ GDD Alignment

Resolved since the first run:

- **Capacity path (C1).** EXPERIENCE.md ("At 100% GPU …"), DESIGN.md (Infrastructure born at Seed) and GDD M4 ("the Garage way to buy capacity" is Metis's offer) now agree.
- **Signals timeline (m10).** GDD M8 now lists the same signals as EXPERIENCE.md Flow 3 and DESIGN.md.
- **Away-report decision types (m14).** `reportGroup` defines them.
- **Hidden-tab title (m19).** Story 3.10 matches EXPERIENCE.md "updates only N".

Still misaligned, because EXPERIENCE.md was not updated (EXPERIENCE.md wins on behaviour):

- **Cascade table (M8 residual).** Times are still measured from founding (0:10 workspace, 0:30 Deploy succeeds). GDD M11 now reads that 0:30 as Deploy + 0:20, but EXPERIENCE.md has no such note, and Story 2.12 copies the founding-relative numbers as Deploy offsets.
- **Timeline at ~10:00 (N-m4).** "Cascade ends → Activity and Timeline sidebar entries". The epics now unlock Timeline at the first chronicle entry (Story 4.4). After E4, the first named hire (the 6:30 cascade candidate) writes a chronicle entry, so Timeline would appear mid-cascade, outside its beat.
- **Content-pack version changed (N-m4).** The State Patterns row still says "Saves migrate silently when possible; otherwise the corrupted-save screen". Version pinning says the run stays pinned or continues as a new replay segment.
- **Counterfactual copy (m8 residual).** Flow 3 still quotes "would have cost $1.2M"; the narrative (which wins on copy) says "would have cost about …".

### UX ↔ Architecture Alignment

- **Supported:** region gating (N2), tokens and `data-` attributes (D11), announcer, focus contract and shortcut registry (D10), the hidden-tab preview (D9), tagged PDF (D8), nightly performance (D12).
- **New gap: region ownership (N-M2).** N2 now has a canonical `RegionId` list, which shows that `channel.product`, `automations` and `backlog` are never unlocked by any story. N2's rule ("only cascade beats and phase transitions unlock a region") also contradicts the unlock triggers of Story 4.4 (first chronicle entry), Story 4.14 (first attention condition) and Story 2.11 (Hire unlocks the Headcount tile).
- **New gap: backlog timer (N-M1).** EXPERIENCE.md says the top backlog item has a 10–15 s window while the game clock is paused. The architecture's time-base rule converts that window to game time, which does not advance in that state.

### Warnings

- **Carried from the first run, not addressed:**
  - AGENTS.md (Story 1.1) still does not tell agents never to copy values from UX `mockups/`.
  - H1 still runs without Timing or Game-speed settings (E8.2/8.3), so H1 testers who need them cannot take part. Accept this explicitly or pull a minimal Timing selector forward.
- **game-test-design.md** was renumbered to v2.1 but keeps a few stale references (N-m3).

## Epic Quality Review

### Epic Structure

| Epic | Player value | Independence | Notes |
|---|---|---|---|
| E1 Foundations | Borderline but acceptable (unchanged) | Stands alone | Reorder fixed M5. Remaining forward references: 1.8 → 1.10, 1.9 → 1.10 (N-m1). Story 1.1 still oversized (m17) |
| E2 Triage & Cascade | Yes | Needs E1, Story 2.2 before 7.1, and the E7.3 pack. The Timeline forward dependency on E4 is gone | 7.3 cannot pass CI as specified (N-M3); `#product` never unlocks (N-M2); cascade times (M8 residual) |
| E3 Delegation & Absence | Yes | Needs E1–E2 | Backlog timer undefined in a paused clock (N-M1) |
| E4 Company Growth | Yes | Needs E1–E3 | Reorder fixed M7. Residues: 4.3 → 4.4/4.5; Seed/Series A ACs before 4.11 (N-m2) |
| E5 Signals & Deaths | Yes (H2) | Needs E1–E4 | — |
| E6 End of Run & Loop | Yes | Needs E1–E5 and 8.1 | — |
| E7 Content Production | Parallel track | 7.1 after 2.2 ✅ | 7.3 vocabulary (N-M3); UI-copy status mechanism (N-m5) |
| E8 Accessibility & Polish | Yes | 8.1 early ✅ | 8.7 depends on an activation mechanism the architecture does not specify (R-M1) |

### Starter Template and Greenfield Checks

- **Starter template:** unchanged and correct (Story 1.1 from `npm create vite@latest … --template preact-ts`). ✅
- **Greenfield set-up:** `.nvmrc`, CI (`ci`, `deploy`, `nightly`) and the pre-commit hook are in 1.1. The human prerequisites are now listed. ✅

### Acceptance Criteria Quality

The ACs added by the fix pass are specific and testable:

- property test for a speed change mid-window (2.3);
- numeric tolerance (2.4);
- one test per round-target transition (4.13);
- one violating fixture per hidden-state rule (3.4);
- spoiler tests across every register (6.2, 6.9);
- never-delegate CI assertion (4.17);
- version-pinning e2e (8.7).

Weak spots: Story 2.12 AC4 (numbers contradict its own anchor rule), Story 3.8 AC1 (a game-time window in a paused clock), Story 3.3 ("once per capacity episode" is undefined), Story 7.4 AC3 (agent-registered `final` vs the E7 CI rule).

### Dependency Analysis Summary

| Check | v2.0 | v2.1 |
|---|---|---|
| E7.1 after 2.2 | ❌ | ✅ |
| 2.12 → Timeline (E4) | ❌ | ✅ (Timeline owned by 4.4) |
| Within E1 | 1.7 → 1.10, 1.8 → 1.9/1.10 | Fixed. New, smaller: 1.8 Settings / Accessibility links → 1.10; 1.9 "Import a data room" → 1.10 (N-m1) |
| Within E4 | 4.2 → 4.3/4.4; 4.11 → 4.12; 4.3 → 4.7/4.11 | Fixed. Residues: 4.3 writes chronicle lines and may draw heavy events before 4.4 and 4.5; 4.1, 4.6, 4.7 test Seed or Series A behaviour before 4.11 creates phase transitions (N-m2) |
| Cross-epic, new | — | 7.3 (before E2) contains a reference event that uses E4 vocabulary (N-M3) |
| Data created when needed | Respected | The `chronicle` effect ships in 2.2, but the chronicle log has no owner before 4.4 (N-m2) |

**Cross-reference sweep after renumbering:**

- epics.md: D-E5, Global sequence, story bodies and the N3 owner table use v2.1 numbers correctly. Stale entries remain only in the Final Validation table (N-m3).
- Architecture, GDD, narrative and project-context: no story-number references.
- Test design: renumbered, with three stale spots (N-m3).

## Findings

### 🔴 Critical

None. C1 is resolved, and no new critical issue was found.

### 🟠 Major

**R-M1 (remaining part of M1). Version pinning contradicts the "next launch" rule in five places, and its activation mechanism is unspecified.**

- D-E5, architecture D4 → Version pinning, project-context line 166 and Story 8.7 say an update activates only on the founding screen or after a run ends.
- Other texts still say an update applies "on the next launch", which allows a new version under an in-progress run:
  - architecture D14 "Updates";
  - Hosting Constraints table ("update applies on next load");
  - System Location Mapping and the `platform/serviceWorker` tree comment ("next-launch update");
  - NFR7;
  - project-context line 151 ("A service-worker update applies on the next launch, never mid-run").
- FR74 still reads "save migration across content-pack versions", without saying that in-progress runs are pinned.
- **Mechanism.** In the standard service-worker lifecycle, a waiting worker activates as soon as every tab is closed. Multi-day cohort runs span many launches, so "the new service worker stays waiting while a run is in progress" will not hold without an explicit mechanism.
- **Consequence.** Every deploy during the cohort would start a new replay segment. The clue replay would then show earlier days as "not reconstructable", and the clue replay is the H2 instrument.
- The save record field list (D4; Story 1.9 AC1) omits `appVersion`, which Version pinning and Story 1.9 AC5 require (N-m9).
- **Location:**
  - architecture D4, D14, Hosting Constraints, System Location Mapping, Directory Structure;
  - project-context lines 151 and 166;
  - epics NFR7, FR74, Stories 1.9, 8.7.
- **Proposed fix:**
  1. Replace every "next launch" with "on the founding screen or after the run ends (version pinning)".
  2. Specify the mechanism in D4/D14. For example: the new worker's `install` handler reads `hitl:` IndexedDB and rejects `waitUntil` while a run pinned to another `appVersion` is in progress. Old precaches are kept under versioned cache names until no save references them.
  3. Add `appVersion` to the save record. Reword FR74.
  4. Add an e2e to 8.7 that closes every tab and relaunches with a run in progress.

**N-M1. The backlog top-item window is converted to game time, but the game clock is paused during the backlog queue.**

- GDD M1 and architecture D1 (Time bases) convert the backlog window "to game-ms once … when the item reaches the top".
- GDD Clock States, FR2, Story 1.6 AC3 and Story 3.8 AC3 keep the game clock **paused** during the backlog queue, with "only the top backlog timer running".
- A game-ms deadline cannot elapse while game time is frozen. No document says:
  - what advances the top item's timer;
  - how its lapse reaches the input log, so that replay and chunk invariance hold.
- project-context also says real timers exist only in `platform/clock` and `app/backgroundPreview`.
- An agent on 3.8 must invent either a hidden game-time advance or an unlogged real-time expiry, and both break determinism.
- **Location:** GDD M1, Clock States; architecture D1 (Time bases), D3; epics FR2, FR25, Stories 1.6, 3.8; project-context "No timers for game logic"; test design ABS-10.
- **Proposed fix:** define the backlog queue as a separate time base in D1. For example:
  - the top-item window is measured in real ms by `app/session` (Timing-scaled);
  - its lapse is dispatched as an input-log command (`expireBacklogItem { messageId }`) stamped with the frozen `atGameMs`;
  - answering is the normal `answerMessage`.
  Update GDD M1, FR25, Story 3.8 (with a replay test) and project-context.

**N-M2. Several regions in the canonical `RegionId` list are never unlocked, and N2's unlock rule contradicts the stories.**

- **`channel.product`.** #product is a Garage channel and the only Garage medium-stakes policy channel (FR27, GDD M5, Level Types). Story 7.3 writes ~20 #product templates and Dora posts there. No cascade beat, story or phase transition unlocks it: the EXPERIENCE.md cascade adds only `#customers` and `#general`.
- **`automations` and `backlog`.** These are also in the list and are opened from the sidebar (Stories 3.1, 3.8), but nothing unlocks them.
- **Messages for locked channels.** No document says whether a template for a locked channel can be drawn, or what happens to its message (Story 2.3).
- **Unlock rule.** N2 says "Only cascade beats (N4) and phase transitions unlock a region". But:
  - Story 4.4 unlocks `timeline` at the first chronicle entry;
  - Story 4.14 unlocks `attentionList` at the first fire;
  - Story 2.11 says Hire unlocks the Headcount tile, while the cascade beat at 6:30 also unlocks `headcount`.
- **Location:** architecture N2; epics FR27, FR57, Stories 2.1, 2.3, 2.11, 2.12, 3.1, 3.8, 4.4, 4.14, 7.3; EXPERIENCE.md The Cascade; GDD M5, Level Types.
- **Proposed fix:**
  1. Decide when #product appears. For example, a cascade beat after 3:00, or the cascade-end beat (~10:00), with a Dora #product message. Add it to EXPERIENCE.md, the cascade script (7.3) and 2.12.
  2. Give `automations` an owner (with the `policyToggle` beat, 5:15) and `backlog` one (on the first non-empty backlog, 3.6/3.8).
  3. Amend N2: "regions are unlocked by cascade beats, phase transitions, or a first-occurrence trigger owned by one story", and list the owners in the RegionId table.
  4. State in 2.3 that only templates for unlocked channels are drawn.
  5. Make 2.11's Hire not unlock Headcount when the cascade beat owns it.

**N-M3. The Garage placeholder pack (Story 7.3) cannot pass CI as specified, because its required reference event uses E4 vocabulary and undeclared params.**

- Story 7.3 must include `event.garage.credit-cliff` "as fixed in narrative-design.md" and pass 7.1 validation.
- The event uses:
  - `throughput: -10` and `askMetis: true`, effects owned by Story 4.2 (architecture N3 owner table), which ships in E4;
  - `{amount}` and `{saved}` in its text, with no `params:` block.
- 7.1 rejects undeclared params, and N3 is a closed vocabulary, so the pack cannot pass CI.
- Reference Event 4 also uses `{amount}` without declaring it.
- 7.3 is scheduled before the rest of E2, so the H1 critical path is blocked.
- **Location:** narrative Reference Events 1 and 4; architecture N3 owner table; epics Stories 2.2, 4.2, 7.1, 7.3.
- **Proposed fix:**
  1. Rewrite credit-cliff with 2.2 vocabulary (e.g. `cash`, `mrr`) or move `throughput` and `askMetis` to 2.2.
  2. Add `params: { amount: money, saved: money }` to events 1 and 4.
  3. Optionally state in 7.3 that Garage events may use only the vocabulary available at 7.3 time.
  See N-m12 for the related H1 scope question.

### 🟡 Minor

**Residuals of partially resolved findings:**

- **M6 residual:** EXPERIENCE.md and test design SPN-08 still unlock Timeline at ~10:00 (folded into N-m4 and N-m3).
- **M8 residual:** Story 2.12 AC4 lists "MRR … (0:30), Customers (1:00), chat (1:30 ⏸) … inference log (8:00)" as Deploy offsets. GDD M11 and N4 use Deploy + 0:20, 1:20, 7:30.
  → *Fix:* list Deploy offsets (subtract 0:10) or label the numbers "EXPERIENCE.md table time (Deploy at 0:10)" in 2.12, test design SPN-08 and EXPERIENCE.md.
- **M14 residual:** add numbers for 10x Engineer (teammate morale) and Ex-FAANG (Hype on hire). Define or remove Peter Pan "lead role" and Ex-Founder "above 1 year" (GDD tuning, M9; Story 4.10).
- **m5 residual:** architecture D6 "Scaffolding" and epics Additional Requirements still say `content:new <kind>`.
  → *Fix:* use `content:new <kind> <id>`.
- **m6 residual:** the N2 code example uses `rail.kpis`, which is not in the list.
  → *Fix:* use `cash`/`mrr` or add an `overview` region.
- **m7 residual:** architecture Naming Conventions still says "Content IDs `kind.phase.name`".
  → *Fix:* point to the D6 ID ↔ path table.
- **m8 residual:** EXPERIENCE.md Flow 3 still quotes the exact "$1.2M".
  → *Fix:* "would have cost about $1.2M".
- **m17 (open):** Story 1.1 is still oversized.
  → *Fix:* split it into "scaffold + gates" and "CI + deploy + agent files", or allow `gds-create-story` to split it.

**New minor findings:**

**N-m1. E1 forward references after the reorder.**
- Story 1.8 AC7–AC8: the game-bar "Settings" link and the founding-screen "Accessibility" link open Settings, built in 1.10.
- Story 1.9 AC6: the unreadable-save screen offers "Import a data room" (1.10).
- Story 1.9 AC3: it feeds "the Data notice (Story 1.10)".

→ *Fix:* in 1.8, render the links but verify their navigation in 1.10 (add the AC there). In 1.9, verify "Import a data room" in 1.10.

**N-m2. E4 order residues.**
- Story 4.3 writes "its `chronicle` line" and can draw `heavy` events before the chronicle log (4.4) and heavy decisions (4.5) exist.
- The `chronicle` effect ships in 2.2, but the log is "created" in 4.4.
- Stories 4.1 (Hype tile from Seed), 4.6 (Seed and Series A inflow) and 4.7 (ATS card in #hiring, unlocked by 4.11) test phases that 4.11 introduces.

→ *Fix:*
- Give 2.2 a minimal append-only chronicle store, and let 4.4 add the Timeline UI and the D-E1 rules.
- Have 4.3 skip `heavy` events until 4.5.
- State that 4.1/4.6/4.7 use phase fixtures, as 4.11 already does for `closeRound`.

**N-m3. Stale numbers and labels after the renumbering.**
- epics Final Validation:
  - "2.2 → 4.3" (vocabulary is 4.2);
  - "8.1 brings its own font if 1.9 has not landed" (fonts are 1.7);
  - "E7.1–7.2 and the E7.3 pack precede E2" (2.2 now precedes 7.1).
- test design:
  - line 137 "SAV/IMP (1.7–1.8)" → 1.9–1.10;
  - CNT-02 "H2 (4.3)" → 4.2;
  - SPN-08 "Activity/Timeline ~10:00" and founding-relative times.

→ *Fix:* update the four lines.

**N-m4. EXPERIENCE.md not updated for two behaviour fixes (it wins on behaviour).**
- The State Patterns row "Content-pack version changed → Saves migrate silently…" contradicts version pinning.
- The cascade row "~10:00 Activity and Timeline sidebar entries" contradicts Story 4.4. After E4, the 6:30 hire writes the first chronicle entry, so Timeline would appear mid-cascade.

→ *Fix:*
- Update both rows.
- Decide whether 4.4's first-entry unlock waits for the cascade to end (recommended: the cascade-end beat unlocks `timeline` when a chronicle entry exists, otherwise the first entry after the cascade does).

**N-m5. UI-copy status tracking is incomplete.**
- `ui.status.json` appears only in epics.md: architecture D7 and project-context ("Content PRs") do not mention it.
- No rule maps UI keys to audit scopes. 2.13 requires "Garage UI strings tracked in ui.status.json", but no story registers any Garage key.
- 5.13 lists `cluereplay.*`, `away.*` for H2, while 7.9 also lists `autotriage.*`.
- Story 7.4 AC3 lets agents register "verbatim" strings as `final`, which the E7 CI job (bot-authored `final` flips fail) blocks and which only Tiziano may set.

→ *Fix:*
- Give each `ui.status.json` entry a `scope`.
- List the Garage UI keys (cascade toasts, founding screen, empty states) in 7.3.
- Align the 5.13 and 7.9 key lists.
- Replace the 7.4 exception with "verbatim strings are registered `placeholder` and listed for Tiziano's one-click approval".
- Add one line to D7 and to project-context.

**N-m6. "At most once per capacity episode" is undefined (Story 3.3; test design DEL-06).**
- After "Not now", a Garage player who never delegates has no other purchase path while utilization stays ≥ 100%: "Add capacity" is born at Seed.
- C1's promise then rests on the churn equilibrium, which is about 108–122 customers, barely above the 103 needed.

→ *Fix:* define an episode (ends when utilization < 90%), and re-offer every N game days (tuning) while utilization stays ≥ 100%. Alternatively, keep a "Provision" button in the Metis DM.

**N-m7. Story 2.4's tolerance ignores Hype decay.**
- "95–105 customers at day 25 ± 2" follows the GDD worked target, which assumes Hype stays at 20.
- With 2%/day decay from the Garage (Story 4.1, E4), inflow falls to about 90 customers at day 25.
- The test passes in E2 (no decay yet) and breaks when 4.1 lands, or the golden and balance shift silently.

→ *Fix:* state the tolerance with decay (or decide that Hype does not decay while hidden in the Garage), and update the GDD worked target.

**N-m8. Some vocabulary terms have no defined semantics.**
- `runwayDays` (Story 4.2; narrative Reference Event 3 `runwayDays: -21`) is an effect, but runway is a derived selector (Story 1.5).
- `askMetis: true` as an answer effect (Reference Event 1) does not say whether it counts as an AI decision (drift, Compute, `metisAnswered`).
- `throughput` in a Garage event can run when there is no staff.

→ *Fix:* define each term's state target and side effects in the N3 owner table, or drop `runwayDays` in favour of `cash`.

**N-m9. Save record field lists omit `appVersion`.**
- Architecture D4 "Save record" and Story 1.9 AC1 omit it.
- Version pinning and Story 1.9 AC5 store it.

→ *Fix:* add it to both lists (part of R-M1).

**N-m10. Stale GDD sentences contradict the new rules.**
- Core Simulation Systems: "Messages and their timers run in real time between steps".
- Seed Determinism: "message timers run in real time between daily steps".
- M7's drift list omits Ask Metis, which M4, FR29 and Story 3.4 count as an AI decision.

→ *Fix:* reword the two sentences per M1 Time bases, and add Ask Metis to the M7 list.

**N-m11. Probe sampling mismatch.**
- Architecture N5 says the probe "samples `alignmentMilli` and MRR".
- Story 5.11, FR64 and UX-DR36 plot **valuation**, which needs ARR and Hype.

→ *Fix:* N5 samples Alignment and implied valuation (or ARR and Hype).

**N-m12. The H1 gate requires content H1 cannot exercise.**
- `content:audit --scope garage --require-final` (Stories 2.13, 7.8) includes ~10 Garage events.
- No event plays before the deck engine (Story 4.3, E4), so Tiziano must cut content that H1 cannot show.

→ *Fix:* move Garage events to the H2 scope (or a `garage-events` scope cut before H2), and keep H1 to the cascade, templates, headlines and Garage UI strings.

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK (light).** No critical issue remains. Of the 40 previous findings:

- 31 are resolved;
- 8 are partially resolved;
- 1 is open (m17).

Coverage is still complete: 89/89 FRs, 19/19 NFRs and 50/50 UX-DRs.

Four major issues remain: one carried over (R-M1) and three new ones introduced or exposed by the fixes (N-M1, N-M2, N-M3). Each is a documentation decision that takes minutes to write, but an agent would otherwise have to guess on the version-pinning mechanism, the backlog timer, region unlocks or the Garage pack.

**What can start now:**

- the Prerequisites (Tiziano);
- Stories 1.1–1.8;
- the 8.1 PDFKit spike;
- Story 2.2.

**Must be resolved before the relevant work starts:**

| Issue | Before |
|---|---|
| R-M1 | Story 1.9 (save record) and 8.7 |
| N-M3 | Story 7.3 (Garage pack), i.e. the E2 critical path |
| N-M2 | Stories 2.1/2.12 and 7.3 (cascade script) |
| N-M1 | Story 3.8 (E3) |
| N-m1, N-m2 | The affected story is created |
| N-m4, N-m5, N-m12 | 2.13 / H1 gate |
| Others | Before E4 |

### Critical Issues Requiring Immediate Action

None. The highest-priority items are N-M3, because it blocks the H1 critical path through 7.3, and R-M1, because it shapes the save record in 1.9.

### Recommended Next Steps

1. **Tiziano decides** these points:
   - the update-activation mechanism and the "next launch" wording (R-M1);
   - the backlog timer model (N-M1);
   - when #product, Automations and the Backlog entry appear (N-M2);
   - whether Hype decays while hidden in the Garage (N-m7);
   - whether Garage events stay in the H1 scope (N-m12).
2. **Update the architecture:**
   - D1: backlog time base (N-M1);
   - D4/D14: activation mechanism, `appVersion`, wording (R-M1, N-m9);
   - N2: unlock owners and amended rule (N-M2);
   - N3: semantics of `runwayDays`, `askMetis`, `throughput` (N-m8);
   - N5: samples valuation (N-m11);
   - D7: `ui.status.json` (N-m5);
   - small residuals m5, m6, m7.
3. **Update epics.md:**
   - Stories 1.8/1.9/1.10 (N-m1);
   - 2.3, 2.11, 2.12 (N-M2, M8 residual);
   - 2.4 (N-m7);
   - 3.3 (N-m6);
   - 3.8 (N-M1);
   - 4.3, 4.1, 4.6, 4.7 and a minimal chronicle store in 2.2 (N-m2);
   - 7.3, 7.4, 5.13/7.9 (N-M3, N-m5, N-m12);
   - NFR7 and FR74 (R-M1);
   - the Final Validation table (N-m3);
   - optionally split 1.1 (m17).
4. **Update the other documents:**
   - narrative Reference Events 1 and 4 (N-M3);
   - GDD sentences (N-m10) and trait numbers (M14 residual);
   - EXPERIENCE.md cascade, State Patterns and Flow 3 rows (M8, N-m4, m8);
   - project-context lines 151/153 (R-M1, N-m5);
   - test design stale lines (N-m3).
5. Re-run this check (a quick pass is enough) or go straight to `gds-sprint-planning` once R-M1 and N-M3 are fixed. The others can be fixed just before their stories.

### Final Note

This re-check assessed the 40 previous findings: 31 are closed, and 9 remain (R-M1 major; M6, M8, M14, m5, m6, m7, m8, m17 minor). It found 15 new issues: 3 major (N-M1 to N-M3) and 12 minor (N-m1 to N-m12). In total, **24 open issues: 0 critical, 4 major, 20 minor**. They fall into 5 categories:

- determinism and persistence;
- region gating and story order;
- content vocabulary and pack validity;
- the content and UI-copy workflow;
- documentation drift after renumbering.

None blocks the start of E1. Address R-M1 and N-M3 before Story 1.9 and Story 7.3. Tiziano may also choose to proceed as-is with the stated risks.

**Choices made on the user's behalf (unattended run):**

- Selected [C] Continue at the Step 1 menu.
- Used exactly the requester's document set (epics next to the GDD), plus game-test-design.md as supporting input.
- Treated the FR1–FR89 / NFR1–NFR19 inventory in epics.md v2.1 as the GDD requirement list, as in the first run.
- Rated partially resolved findings by their residual: only M1 keeps major severity.
- Wrote the report to `implementation-readiness-report-2026-10-27-recheck.md`, so the first report is not overwritten.
- Edited no planning document.

*Assessor: gds-check-implementation-readiness, 2026-10-27 (re-check).*
