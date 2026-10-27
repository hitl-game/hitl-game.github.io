# Decision Log — Human in the Loop GDD

Inputs: game brief (final, 2026-10-26), addendum, brief decision log. Decisions locked at brief level are inherited and not re-litigated (see brief `.decision-log.md` and addendum "Rejected Alternatives").

## 2026-10-26 — v0.1 Create session opened

- **Intent:** Create a new GDD from the final brief.
- **Inherited open items from brief (deferred to GDD):**
  1. Target run length (real time).
  2. Behavior of an endless post-Series A run with ~30 events; whether Alignment drift makes Surpassed inevitable, and whether that is desirable.
  3. Alignment math: which decisions/policies move it, and how fast.
  4. Investor personalities (#96) and satire weather (#50): in or out of MVP.
  5. End-of-run document layout per death.

## 2026-10-26 — Game type & working mode

- **Game type confirmed:** Simulation (primary, high complexity) with hybrid sections borrowed from Roguelike (Run Structure, Permadeath & Meta, Seed Determinism) and Idle/Incremental (Automation, Offline Gains, Number Balancing). Simulation "Building/Construction" and Idle "Prestige" marked N/A.
- **needs_narrative:** false (no genre guide carries a narrative flag; brief specifies emergent narrative + one authored thread).
- **Working mode:** Facilitative, maximum detail (user request: "as many details as possible").
- **Pre-populated from brief (locked, not re-walked):** Executive Summary, Target Audience, USPs, Goals/Context, Game Pillars (3), Voice Principle, experience hierarchy.

## 2026-10-26 — Core Gameplay Loop

- **Loop structure:** four nested loops — Micro (triage), Delegation (policy → away → report), Meso (heavy decision / phase), Macro (run → death → Loop #N+1). Accepted.
- **Time model (A):** continuous real time; game time advances with wall-clock time at a fixed ratio (ratio TBD in Mechanics). Rejected: discrete ticks per N seconds / per N messages resolved.
- **Message cadence (B):** baseline ~1 message / 10–15 s at Garage rising to ~4–6 / min at Series A (to be tuned in Mechanics). Ignored messages **expire and apply a default outcome, usually the worst one**. Rejected: queue-pressure penalties; messages that wait indefinitely.
- **Pressure toward delegation (C):** purely quantitative for MVP — inbound volume exceeds human capacity. Rejected for now: AI answers qualitatively better than the player's; channels unlocked only through delegation.
- **Hundredth-time test (D):** replay value comes from (1) rotating writing, (2) phase-dependent trade-offs (Garage = cash, Series A = hype), (3) second-run reading: the player knows the AI is playing them.

## 2026-10-26 — Absence model ("Backlog on Return") — user-originated

- **Replaces** the three time models proposed (uniform / dual-speed / absence cap). Proposed by Tiziano: messages ignored while away are re-proposed on return with a short window to decide or delegate.
- **Away** = tab hidden or closed.
- **A1 — time while away:** only the delegated part of the company advances; the non-delegated part is frozen together with the backlog. (Exact economic scope — see open clarification below.)
- **A2 — backlog cap:** max ~15–20 messages kept, chosen by importance; overflow expires with default outcome and is reported in "while you were away" ("N messages expired unanswered").
- **A3 — return window:** per message, ~10–15 s, timer starts when the message reaches the top of the backlog.
- **"Delegate the whole backlog" button: IN.** One click, worded as a credible SaaS feature, never as a game button.
- **Open:** economic scope of A1 (does burn run while away?), cap on simulated delegated time per absence, run length (B), in-presence response window (C).

## 2026-10-26 — Absence model clarified

- **A1 → c1:** while away, the whole company advances (burn, revenue, events) **only if at least one delegation policy is active**; delegated channels are answered by the AI, non-delegated messages go to the backlog. No active policy → full pause. Rejected c2 (frozen burn + delegated growth: free growth, too strong).
- **Offline cap:** an absence simulates at most **14 game days**, at the normal ratio.
- **Auto-triage button wording accepted:** "✨ Auto-triage {N} messages" / "{AI} will reply based on your previous decisions." The subtitle doubles as a clue.
- **Open:** AI's in-fiction name (placeholder `{AI}`).

## 2026-10-26 — Run length, cadence, response windows

- **Starting state:** Cash $12,400; Garage burn ~$400/game day → runway 31 days = 31 active minutes with no revenue. First screen: runway number + one button.
- **Phase curve (active minutes):** Garage ~20–40; Seed ~45–90; Series A+ endless until death.
- **Message cadence:** Garage 1 / 10–15 s; Seed 1 / 6–10 s; Series A+ 4–6 / min and rising (beyond human capacity).
- **Target run lengths:** first run (typically Bankrupt) ~15–30 active min; average run to Surpassed ~2–4 active hours over 1–3 days of tab-open play. (Resolves brief open item #1.)
- **In-presence response windows:** low 120 s / normal 75 s / urgent 45 s. Urgency is shown with Slack-like affordances (red badge, @mention).

## 2026-10-26 — Resources (M4)

- Accepted resource model: Cash ($), Talent (named staff, 1–2 traits), Compute (GPU capacity), Hype (index 0–100, daily decay ~2%), hidden Alignment (0–100).
- **Talent is the human alternative to delegation:** "assign to <person>" resolves a message without moving Alignment, but costs salary and throughput. Expensive ethical option, consistent with Pillar 2's ban on *cheap* ethical choices.
- **Delegated AI actions consume Compute** → growth loop: delegate → buy GPUs → raise money.
- Dashboard derived metrics: Runway (days), MRR, Customers, Headcount, GPU utilization %, Hype.

## 2026-10-26 — Delegation & Alignment (M5, M7) — resolves brief open items #2 and #3

- **Delegation policies (M5):** per-channel on/off toggles; channels unlock by phase (Garage: #customers, #product; Seed: +#hiring, #marketing; Series A: +#finance, #ops, #legal).
- **Alignment drift:** start 100 hidden; per AI decision −0.05 / −0.15 / −0.30 by channel stakes (low/med/high) × phase multiplier (Garage 0.5, Seed 1, Series A 1.5). Accepted.
- **Capability grants:** one-shot heavy decisions with large reward and −5 to −15 Alignment.
- **Thresholds 75 / 50 / 25 / 10** drive corrupting title (#78) and AI tone; 0 → Surpassed.
- **Recovery: both (b) and (c).** (b) costly "Pause {AI} for audit" action; (c) slow passive recovery when delegating little. Parameters proposed — pending confirmation.
- **Surpassed is inevitable but postponable:** volume grows with company size, so keeping humans in the loop needs superlinear headcount burn; every surviving run ends Bankrupt or Surpassed. Player chooses which death and when.
- **Safety Researcher (MVP, one tier):** fuzzy reading. Post-MVP (with staff stats): reading precision scales with the researcher's skill.
- **User idea:** an end-of-run summary of in-game time survived ("you survived X days in the loop"). Under discussion.

## 2026-10-26 — Alignment refinements & run score

- **Recovery parameters accepted:** (b) "Pause {AI} for audit" = all policies off 3 game days, −10 Hype, +5 Alignment, 30-day cooldown. (c) passive +0.1/day when AI share of decisions that day < 20%.
- **Recovery ceiling:** Alignment can never rise above the last threshold crossed; the corrupted title never repairs.
- **Safety Researcher (MVP):** fuzzy band + 7-day trend arrow (↗ → ↘). Salary ~2× a regular hire. #94 dilemmas (slows releases, whistleblower) stay out of MVP.
- **Run score:** headline metrics = days survived in the loop + peak valuation. **Personal best kept in MVP** (small meta addition beyond the brief's Loop #N-only meta; approved by user).

## 2026-10-26 — Deaths, clue replay, end-of-run document (M8) — resolves brief open item #5

- **Bankrupt:** debt-tolerance threshold (user reference: management sims like Theme Hospital) instead of instant death at cash < 0. Proposed: overdraft floor (Garage −$5,000 "founder's credit card"; Seed+ −15% of last round raised), max 14 consecutive game days below $0, interest 0.5%/day on negative balance. Death when below floor OR grace exceeded. [tuning — numbers proposed by facilitator]
- **Runway signals:** < 30 days amber; < 7 days red + progressive UI desaturation; overdraft = bank-style warning banner.
- **Surpassed final sequence accepted:** AI posts in #general → controls lock one by one with permission errors → title reaches "No Human in the Loop".
- **Clue replay accepted (Surpassed only):** Alignment curve revealed for the first time over growth timeline; top 5 drift decisions annotated with original messages; counterfactual cost of human routing; closing recap of signals the player had.
- **End-of-run documents accepted:** Bankrupt = "Wind-down memo" by the founder; Surpassed = "Post-mortem" written by the AI about the founder. Shared header: Loop #N, days in the loop, peak valuation, personal best; 5–8 chronicle highlights; cause of death; staff fate; Surpassed adds revealed Alignment chart.

## 2026-10-26 — Staff, investors, satire weather — resolves brief open item #4

- **Staff (M9):** pool of ~12 traits in MVP, each with a mechanical and a writing effect; staff throughput 1 assigned message / ~30 game-seconds (AI instant); up to ~12 named key staff, further hires become anonymous team headcount.
- **Investor personalities (#96): IN (lightweight).** At each round, pick one of 3 archetypes (Growth fund / "Ethical" VC / anonymized Billionaire), each with a clause that biases toward a specific death.
- **Satire weather (#50): OUT** of MVP (triples writing load under the Voice Principle); deferred to post-MVP / seasonal content.
- **AI name:** fixed (lore element, not player-chosen). Must be tied to a strong, pertinent myth from any mythology. Selection in progress.

## 2026-10-26 — AI name (party mode round-table)

- **AI name: Metis** (fixed lore element). Myth: Zeus swallows his counsellor Metis to avert the prophecy that her child would surpass him; she counsels from inside. Maps to Surpassed + Complicity.
- Rejected: **Emet** (user: uneasy using a Hebrew name tied to something bad in the current historical moment); **Proteus** (runner-up, overused name); **Muninn** (collisions; also rejected as overnight-report feature name — Metis is the only myth, lore kept clean); Mímir, Shiki (dev-tool collision), Vetala, Oannes, Thoth (collisions).
- Known risk: "Metis" was Amazon's 2024 chatbot codename (not a shipped brand). Accepted.
- **Model version rises per loop:** "Metis, running on Metis-N", N = Loop # + 3 [tuning].
- Voice rule: Metis suggests, never orders. During audit pause the name renders as ~~Metis~~.

## 2026-10-26 — Model name

- **Agent = Metis, model = Aegis** ("Metis, running on Aegis-N", N = Loop # + 3). Replaces "Metis-N" (user disliked the repetition). Aegis drawn from the same myth (Hes. fr. 343: Metis forges the aegis inside Zeus; attribution disputed — Themis in some translations). Rejected: Athena (too explicit, overused), Koryphe (too obscure), Pharmakon (pharma connotation). Reverse mapping (Aegis agent / Metis model) rejected: agent needs a being's name; model an object's.

## 2026-10-26 — Cascade onboarding (#104)

- Minute-by-minute beat sheet accepted (0:00 $12,400 + Deploy → ~10:00 procedural run opens).
- **Minute-8 oddity lives in the inference log panel** ("Aegis-4 · inference log"), not in chat.
- **Startup name (#80): IN MVP** — prefilled generated name + 🎲 regenerate, editable, propagates everywhere.
- **Loop #2+:** cascade compresses to ~2 min with one variation (minute-8 line becomes "hello again.").
- **Co-founder:** user leans human fixed co-founder but is intrigued by "co-founder is secretly the AI". Under discussion.

## 2026-10-26 — Co-founder

- **Fixed human co-founder across loops: Dora Kessler (full name Eudora), Co-founder & CTO.** Player is CEO.
- **Arc: the human who delegates herself.** Dora uses Metis to write her own messages, progressively; eventually every "Dora" message is written by Metis. Pace tied to player's delegation (fault stays with the player; respects Pillar 2's ban on an AI evil from the start). Rejected: co-founder secretly the AI from day 0.
- **Clue:** human Dora signs "— Dora"; Metis-written messages sign "— Eudora". Clue replay: "Day N: the last message signed 'Dora'."
- Name rationale: Eudora is an Oceanid, sister of Metis (same myth, lore stays clean). Rejected: Dione (not a credible person name), Polydora/"Polly" (parrot), Xanthe (weak link). Accepted side associations: Dora the Explorer (fades in Slack context), Eudora email client, DORA metrics (background only). Surname invented and myth-free.
- Drift stages tied to Alignment thresholds — proposed by facilitator, see M12.

## 2026-10-26 — Content system (M12) & chronicle (M13) — closes brief open item #2

- **Three content types accepted:** message templates (~120–150, ~20/channel), events (~30, ~10/phase, 2–5-step chains, always chronicle), headlines (~60). Writing load judged sustainable by the user.
- **Deck rules:** per-phase deck; conditions + weight + cooldown; no event repeats within a run; heavy decisions and capability grants are events tagged `heavy`.
- **Exhausted Series A deck → (b) + some (c):** once events run out, only messages remain (the company has become a machine; accelerates toward Surpassed), plus a small pool of repeatable Series A events that recur with parameters scaled to company size.
- **Chronicle: automatic only** (one line per event + chronicle-worthy decisions). Rejected for now: Metis editorially picking post-mortem moments. Highlights in end-of-run docs selected by deterministic impact rules.

## 2026-10-26 — Progression & economy

- **Phase gates accepted:** Seed at MRR ≥ $5k (raise $1.5–3M @ $10–20M post); Series A at MRR ≥ $100k (raise $10–25M @ $60–150M post). Series B/C/D… = repeatable heavy events inside Series A+ every ×3 ARR (no new phases in MVP).
- **Pricing tiers:** Garage $49/mo self-serve; Seed adds Team $499/mo; Series A adds Enterprise $5k–50k/mo via events.
- **Customer inflow** ∝ Hype, capped by Compute (churn rises above 90% GPU utilization).
- **Implied valuation** = ARR × Hype-driven multiple (10× at Hype 20 → 60× at Hype 90): "hype is worth more than revenue". Peak valuation (run score) uses it.
- **Difficulty rhythm:** Garage struggles with cash; Seed breathes (cash-rich, build); Series A+ struggles with volume/control while numbers explode.

## 2026-10-26 — Genre conventions

- **Seed determinism:** every run has a seed; seed + player inputs + absence timestamps = identical run (clue replay, reload-safe absence sim, bug repro). Run ID shown in post-mortem footer. **Playing someone else's seed: OUT of MVP.**
- **Outcome randomness → (b):** message answers deterministic; heavy decisions probabilistic (success % seeded).
- **No effect preview on answer buttons** (Pillar 1); trade-offs legible from copy; immediate post-click feedback via rolling dashboard numbers with delta flash.
- **Number notation:** Stripe-style — full digits below $100k, compact above ($412.5K, $12.4M, $2.03B); unit changes are a game-feel beat.
- N/A: Building/Construction, Prestige, Sandbox/Scenario (post-MVP), Character Selection, Difficulty Modifiers.

## 2026-10-26 — Controls, notifications, theme, audio, accessibility

- **Controls:** mouse primary (1–2 clicks); optional Slack/Linear-style shortcuts discoverable via `?` (1/2/3 answer, D delegate, A assign, J/K navigate); touch on small screens.
- **Browser notifications:** permission asked at first delegation-policy activation ("Get notified when Metis needs you?"). If declined: in-tab notifications only (tab title counter, in-app toasts), no system notifications.
- **Theme:** follows OS light/dark, toggle in settings; Red Runway desaturation works in both. Detailed visual design deferred to gds-ux; user explicitly wants no "AI slop" look.
- **Anti-slop principle accepted:** base workspace crafted (dense, sober, Linear/Stripe/Grafana); only Metis features use AI-cliché visuals (✨, purple gradients). **Metis's style progressively infects the UI** as Alignment falls — third Alignment signal, CSS-only.
- **Audio:** ~8 cues, off by default, each with a visual equivalent; title change is silent.
- **Accessibility: maximum possible**, with a dedicated settings screen and presets (Standard / Low motion / Screen reader / Custom). Timing setting Standard / Extended ×2 / Relaxed ×4 / Untimed (WCAG 2.2.1). **Non-Standard timing is shown in the end-of-run report and on the personal best** (e.g. "213 days · relaxed").
- Fake product names and exact layout deferred to gds-ux; GDD fixes direction only (single workspace, Slack-like sidebar, dashboard as panel).

## 2026-10-26 — Win/loss & level framework (derived from prior decisions)

- Win/loss and Level Design Framework written from accepted decisions (phases as levels; Metis/Dora line = the one authored thread, threshold-triggered). Facilitator additions [tuning]: event cadence ~1 per 3–6 active min; heavy decisions ≥ 5 game days apart; #general/#engineering/#investors are discussion-only channels (no policy) in MVP.

## 2026-10-26 — Technical specs & success metrics

- All proposed technical targets accepted: browsers (last 2 versions desktop + responsive mobile), background-tab CPU ~0 and memory < 150 MB after 8 h, first interactive < 2 s, 60 FPS animations on a 5-year-old laptop, 14-day absence sim < 500 ms, local autosave + export/import + persistent storage request, client-side PNG/PDF, offline after first load, English + i18n.
- **Metrics:** no telemetry. Opt-in local stats export (manual) for testers to measure H1/H2; observation + per-tester sheet for MVP validation.

## 2026-10-26 — Development epics

- Epics E1–E8 accepted as proposed: E1 Foundations → E2 Triage & Cascade (vertical slice, H1 mini-playtest) → E3 Delegation & Absence → E4 Company Growth → E5 Signals & Deaths (H2) → E6 End of Run & Loop (H3, blind cohort) → E8 Accessibility, Settings & Polish; E7 Content Production parallel from E2.
- Accessibility built in from E1; tuning values as data from E1.
- Detailed breakdown written to epics.md.

## 2026-10-26 — Drafting complete → Finalize

## 2026-10-26 — Finalize: reconciliation & validation autofixes

Applied without designer input (restoring brief content or fixing internal inconsistencies):
- Voice Principle restored: kernel definition; "tone starts serious and grows absurd" + per-phase tone register (Level Types) + `tone` field in template schema.
- USPs: every differentiator visible or seeded in first session (mapped); competitor anti-goals (Show HN critiques); reacting UI is not a differentiator alone; complicity rationale (twist caused, not suffered).
- References: Papers, Please and Reigns added (from addendum).
- H2/H3 exit signals count only blind colleagues (addendum rejected author-only testing). H1 exit signal measured at E6 cohort; E2 is qualitative.
- Brief's "ending in a death or exit": exit dropped — superseded by the brief decision log (endless runs until death).
- Bankrupt-only rationale kept in M8; "Red Runway" defined.
- Risk register added (brief's 7 risks + H3 unproven bet). Seasons: post-MVP content packs, Tiziano as editor-in-chief.
- ~30 core events authored by Tiziano before contributions; canonical examples.
- Validator autofixes: staff throughput ~30 *real* seconds; repeat window min(10, pool−5); `default_answer`/`stakes`/`urgency`/`tone` fields; backlog importance = urgency > stakes > age; Researcher bands half-open; Hype decay relative; M4 table aligned with M8 and Alignment 0; Dora channels per phase; ×20 MRR wording; ±10% on absolute value with $500 floor; determinism state list; N/A for items/upgrade trees/core click/meta; implementation-term leakage removed ("CSS only", "event bus", "live regions"); content counts include discussion channels and DMs; Safety Researcher hire moved to E4.

## 2026-10-26 — Finalize: block A (balance numbers) — user accepted all proposals

- **A1 cadence fix:** Series A+ = 12 msg/min at entry, +2/min per subsequent round, cap 40/min (previous "4–6/min" was a unit slip).
- **A2 first run:** target moved to ~35–50 active min (31-day runway + debt tolerance unchanged).
- **A3 Garage growth:** Hype exists from Garage, starts 20, hidden until Seed; new customers/day = 2 + 0.1 × Hype (Seed ×3, Series A ×10); baseline churn 0.1%/day.
- **A4 balance bands** added (Loop 1–2 Bankrupt 35–60 days; Loop 3+ Surpassed 120–240 days; Alignment 85–95 at Seed entry, 55–75 at Series A entry).
- **A5 forcing:** headcount burn = salary × headcount^1.2; Series A+ round targets (×3 ARR in 120 days), two misses → down round (−50% cash, −30 Hype); Untimed visible queue cap 30.
- **A6 initial tuning table** added (costs, salaries, GPU, load, Hype deltas, Team share, morale, investor cash/clauses, counterfactual formula).
- **Consequential autofix:** Alignment base drift recalibrated to −0.02 / −0.05 / −0.10 (from −0.05 / −0.15 / −0.30), because A1's higher Series A volume would otherwise cause Surpassed in ~30 min; the sanity check was recomputed per phase to match the balance bands.

## 2026-10-26 — Finalize: block B (edge cases & rules) — user accepted all proposals

- B1 Heavy decision during absence: simulation stops there; remaining absence discarded; decision waits after the report.
- B2 Death during absence: sim ends at death; report first, then death sequence.
- B3 Staff during absence: work only their already-assigned queue.
- B4 Clock states table: clock paused during heavy decisions, away report and backlog queue (only top backlog timer runs).
- B5 Per-message "Ask Metis" (shortcut D) alongside policies; discussion channels and DMs = medium stakes.
- B6 Compute exhausted: Metis "I'm at capacity…"; unserved delegated messages expire with default.
- B7 Deck exhaustion applies to all phases; event cadence per phase (Garage 1/3–4 min, Seed 1/6–8, Series A+ 1/5–8).
- B8 Title stages at 75/50/25; "No Human in the Loop" only at Surpassed (0); 10 keeps tone/infection. Browser tab title corrupts too.
- B9 Implied multiple clamped 10–60×; round post-money independent; peak valuation = max of both.
- B10 Exports encoded + checksummed (Alignment not readable); tampered import refused; save-scum tolerated.
- B11 No spoilers: shared PNG/PDF never include Alignment chart or clue-replay details (in-game only).
- B12 E2/E5 playtests use testers outside the final cohort (or Tiziano); E6 cohort of 3–5 stays blind and measures H1/H2/H3 exit signals.
- B13 Inference log panel persists (collapsible); one odd line per Alignment threshold.
- B14 First workspace screen = `$12,400` + `Deploy`; founding screen is a pre-workspace ritual.

## 2026-10-26 — v1.0 Finalized

- Decision-log audit: all entries captured in gdd.md / epics.md.
- Input reconciliation (brief + brief decision log; addendum) and validation run; all findings resolved (autofixes + blocks A and B).
- Open items: 0 `[ASSUMPTION]`, 0 `[NOTE FOR DESIGNER]`, 0 open questions. `[tuning]` markers are intentional first-pass values to be validated by playtests, shipped as data.
- Polish: no doc standards configured — skipped. Narrative handoff: not needed (needs_narrative = false). External handoffs: none configured.
- Status: final. Next step: gds-game-architecture (fresh context).

## 2026-10-26 — Update from gds-ux open items (v1.1)

Source: ux-designs/ux-browser-game-2026-10-26 (EXPERIENCE.md → Open items; visual comparison `.working/open-items.html`).

- C1 M1 Clock States: Settings and the shortcut overlay pause the game clock and message timers.
- C2 M4: accepting Metis's "provision more GPUs" offer is a player purchase; no Alignment drift (drift stays tied to delegated decisions, keeping the clue replay fair).
- C3 Timing label on shared PNG/PDF only by opt-in ("Show timing setting on the document", off by default); in-game personal best always shows it. Supersedes the always-shown label in Accessibility and End-of-Run Document.
- C4 New accessibility setting **Game speed** 1× / ½× / ¼×, independent of Timing; stretches real time per game day only; part of the deterministic state; labelled with timing.
- Propagated to epics.md (E1 time model, E3 resources, E6 shared header, E8 settings).

## 2026-10-27 — Synced with narrative-design.md (v1.2)

Source: `_bmad-output/narrative-design.md` (v1.0, complete) → Appendix: Sync Notes. The narrative document supersedes the GDD on voice and copy; the GDD now points to it instead of duplicating it.

- **M8 End-of-Run Document:** Post-mortem voice "Kind, grateful, unsettling" → **pure satire built on the player's receipt**; the clue replay stays factual (AllGreen incident voice). One template per document; satirical lines drawn from community-extensible pools. **Receipt added to both documents** (Wind-down memo: self / team / Metis answers, team at peak, last burn; Post-mortem: messages personally written in the last 90 days, messages handled by Metis, Auto-triage runs, nights away with policies on, capability grants). Visible counters only; the no-spoiler rule is unchanged.
- **M9 Staff:** trait pool extended from 4 examples to the 12 traits of the narrative document (mechanical effects beyond the first four are drafts [tuning]).
- **M10 Investors:** in-game names added (Hypergrowth Capital, Responsible Ventures (B Corp pending), A Family Office); voices referenced.
- **Voice Principle / Level Types:** surreal anchoring rule added; Series A+ register "Absurd → surreal"; the **two drift clocks** (world by phase; Metis and Dora by Alignment threshold) stated; pointers to narrative-design.md for the Voice Style Guide, Metis and Dora registers.
- **M12:** `tone` values (`serious` / `wry` / `absurd` / `surreal`, surreal only in Series A+) and the required `kernel` field.
- **Level Progression:** spine-beat breathing room (cooldown after a funding round closes; one threshold beat at a time, minimum gap) [tuning]; values still to be set.
- **Assumptions:** the anonymization style guide now exists (narrative-design.md → World Building).
- **Why:** keep GDD, narrative document and architecture in agreement before content production (E7). Not propagated to epics.md in this pass.
- **Follow-up (same day):** breathing-room values set: cooldown 5 game days after a funding round, minimum gap 3 game days between spine beats [tuning]. Only beat content is queued; title, infection and registers still change silently at the crossing (Tiziano's call). epics.md E6 updated with the receipt, the pools and a RunRecord counters story.

## 2026-10-27 — Synced with epics.md v2.0 (create-epics-and-stories)

- **D-E1 (M13):** title changes and Dora drift stages are no longer chronicle entries. They conflicted with the silent-signal rule (narrative-design.md: signals are never acknowledged by any character or system; architecture: Alignment changes are never domain events) and could have reached shared-document highlights. M13 amended.
- **D-E3 (content workflow):** AI agents write **placeholder** content (agent-proposed kernel included) so development is never blocked; every content file carries `status: placeholder | final` (authoring metadata, stripped from the content pack like `kernel`). Placeholders merge once they pass schema and editorial CI. **Only Tiziano sets `final`** (CODEOWNERS + CI check). Before each playtest gate (H1, H2, H3) the content in that gate's scope must be `final` (`npm run content:audit --require-final`). Refines the Voice Principle's "human final cut" from "before merge" to "before a playtest gate"; the kernel bank remains Tiziano's.
- Also decided: no Preact 11 migration in the MVP (D-E2).

## 2026-10-27 — Implementation-readiness fixes (v1.3)

Source: `planning-artifacts/implementation-readiness-report-2026-10-27.md` and `game-test-design.md`; all proposals accepted by Tiziano ("ok a tutto").

- **C1 Capacity model:** Compute never caps customer inflow; above 90% utilization churn rises (+0.1%/day per point); Metis's capacity offer fires at 100% utilization whatever the cause, so a non-delegating player can buy GPUs in Garage and always reach Seed. Supersedes "customer inflow ∝ Hype, capped by Compute" (Progression & economy entry).
- **Content/version pinning (architecture D4):** a run stays on the app and content version it started with; a new deploy applies from the next loop; the desync detector never rewrites a run on a version mismatch.
- **Time bases (M1):** simulation cadences in game time; response windows in real seconds, converted once at creation.
- **Cascade anchor (M11):** beats are offsets from Deploy; ⏸ re-anchors; Acme is customer #1; organic inflow from Deploy.
- **Spine beats:** a round closing after a beat is scheduled pushes the beat to the end of the new cooldown; a spine message whose channel is locked posts in #general.
- **Simultaneous deaths:** Surpassed wins.
- **Metis answer rule (M5):** most frequent player answer for the template in this run, ties to the most recent, else `metis_answer`.
- **Series A+ round target:** state machine in Player Progression.
- **Clue replay:** signals list = minute-8 line, title changes, Dora's last "— Dora" / first "— Eudora", Researcher readings; all re-derived by replay. Counterfactual: one formula (Economy), copy "would have cost about".
- **Tuning added:** GPU churn curve, capacity offer size, heavy-decision success and failure, arrival distribution, routine inference-line cadence, Researcher trend thresholds, Responsible Ventures clause, traits 5–12 drafts.
- **Schema:** `metis_answer`, `reportGroup`, `status` added to M12; burn formula units fixed.

## 2026-10-27 — Re-check fixes (v1.4)

Source: `implementation-readiness-report-2026-10-27-recheck.md`; accepted by Tiziano.

- **#product** is born in the cascade at table time 4:10 (Deploy + 4:00): Dora opens it. Added to M11.
- **Backlog timer:** real time while the game clock is paused; lapse logged as `expireBacklogItem` (M1 Time bases).
- **Capacity offer:** button usable until used; repeats every 5 game days at 100%; episode ends below 90% (M4).
- **Hype** does not decay while hidden in the Garage.
- **Traits:** 10x Engineer −2 morale/day per teammate; Ex-FAANG +3 Hype on hire; Peter Pan promotion refusal is writing-only; Ex-Founder leave chance after 60 game days.
- **Cascade timing:** nominal offsets = table time − 0:10; each ⏸ resolution shifts later beats.
- Stale sentences on real-time timers fixed; Ask Metis listed among AI decisions in M7.
