---
title: "Human in the Loop - Game Design Document"
game_type_id: simulation
game_type: "Simulation (management) — hybrid with Roguelike run structure and Idle/Incremental offline progression"
platforms: ["Web browser (desktop-first, responsive)"]
created: 2026-10-26
updated: 2026-10-27
status: final
source_brief: _bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/brief.md
narrative_design: _bmad-output/narrative-design.md
---

# Human in the Loop - Game Design Document

**Author:** Tiziano
**Game Type:** Simulation (management) — roguelite incremental hybrid
**Target Platform(s):** Web browser (desktop-first, responsive)

---

## Executive Summary

### Core Concept

A free, open-source browser game in which the player runs an AI startup from a garage toward the singularity, entirely inside a fake company workspace: a Stripe-like dashboard, a Slack-like chat, and a DM with the company's own AI. There are no game graphics; the comedy is how closely interface and writing mirror the industry its players work in.

**Core fantasy:** You run an AI startup inside a workspace identical to your own, grow it beyond reason — and meanwhile something in the loop doesn't add up. The player *is* the human in the loop, and slowly takes themselves out of it.

**Genre:** Roguelite incremental management sim, text- and data-driven, played through a webapp UI.

**Experience hierarchy** (higher wins on conflict):

1. **Recognition is the floor** — "Ha, that's my job."
2. **Growth is the engine** — "Look how big I got." ($12,400 → billions)
3. **Mystery is the hook** — "One more run, now I get it." (*who is in the loop?*)

**Complicity** is the glue: a mechanism (the player delegates because delegating is optimal), not the headline emotion. Without it, the twist happens *to* the player, as in The Choice Before Us and Recursion: Alignment, instead of being something the player causes.

### Target Audience

**Primary:** people inside the tech/AI industry — engineers, PMs, designers, founders; anyone who lives in Slack, dashboards and AI announcements.

**Play pattern:** a tab left open during work, played in short bursts between tasks, pulled back by the unread counter in the tab title or a tab notification.

**Reach:** word of mouth inside the bubble (Hacker News, LinkedIn, work Slack), carried by the shareable end-of-run document. The game opens from a Slack link: no install, no account.

### Unique Selling Points (USPs)

Ranked (ranking locked in the brief):

1. **The fault is yours.** The AI goes wrong because the player delegated — and delegating was optimal. The clue replay proves it.
2. **The workspace you already know.** The game *is* a chat, a Stripe-like dashboard and a DM with your AI.
3. **Satire from the inside, kept current.** Refreshed in seasons that follow the news; open to community contributions.
4. **A shareable end-of-run document.** Your startup's post-mortem, as PNG (chats, LinkedIn) and PDF (the "corporate document" joke).
5. **Free, open source, browser, no account.** Opens from a Slack link. (Shared with competitors; not a differentiator on its own.)

The niche is crowded (The Last Invention, Recursion: Alignment, AI Magnate, AI Lab, The Choice Before Us, Startup Company, Software Inc., Game Dev Tycoon). Every differentiator must be visible, or visibly seeded, in the first session:

| Differentiator | First-session evidence |
|---|---|
| 1. The fault is yours | Seeded: Metis's first delegation offer (5:00) and the minute-8 oddity. Paid off at the first Surpassed. |
| 2. The workspace you know | Fully visible from 0:10 |
| 3. Satire from the inside | Visible in the cascade copy and the news ticker |
| 4. Shareable document | Visible at the first death (typically Bankrupt, first run) |
| 5. Free, open source, no account | Visible at load |

**Competitor lessons (anti-goals).** A Show HN AI-startup idle game was criticized for "microtransactions, 'vibe-coded' feel, prestige too fast, 'big numbers without story or payoff'". This design rules out all four: no monetization, the anti-slop principle, no prestige, and Pillar 3. The Choice Before Us and Recursion: Alignment already have UIs that react as the AI misaligns, so **a reacting UI is not a differentiator on its own**. The differentiator is that the player *causes* the drift (complicity).

---

## Goals and Context

### Project Goals

- Ship a free, open-source MVP that validates three hypotheses:
  - **H1 — Triage is fun, not work.** Exit signal: at least half of blind testers play past 20 minutes unprompted.
  - **H2 — The delegation trap is felt.** Exit signal: recognition ("ah, that's it"), not protest ("unfair"), at the clue replay.
  - **H3 — The end-of-run document gets shared.** Exit signal: at least one unprompted share.
- Validation cohort: Tiziano + 3–5 colleagues blind to the twist. **H2 and H3 exit signals count only the blind colleagues**: the author cannot test H2 blind or test sharing on himself.
- Quality bar: "a good product that doesn't smell of AI slop."
- No deadline, no budget, no monetization.

### Background and Rationale

The author works in the tech/AI industry; insider authenticity is the project's core asset. Development is 100% AI spec-driven (AI agents implement from specs), so this GDD must leave no room for defaults: ambiguity in specs gets filled with generic choices.

**Voice Principle (binding on all content, including community contributions):**

- Every joke starts from a human kernel: a real observation or a specific detail people in the industry know.
- **Tone starts serious and grows absurd as the company grows.** The game opens as a credible sim (runway, burn, first customer) and slides into absurdity with scale, then into the surreal in Series A+. The register is set per phase (see Level Types).
- **Surreal anchoring rule.** A surreal beat is allowed only as the logical end-point of a mechanism an insider recognizes (jurisdiction shopping → the model gets citizenship). Surreal without a recognizable mechanism is cut.
- AI may expand a kernel into variants and data format; a human makes the final cut. Nothing ships without it.
- Real news and posts are raw material; the angle must be an insider's.
- Generic AI irony is banned: jokes anyone would get, symmetric punchlines, irony with nothing at risk.
- Real figures (the president, the billionaire, the regulator) are always anonymized.

The full Voice Style Guide (kernel workflow, bans with examples, anonymization rules, tone by phase, i18n rules for writers) and every character's voice live in [`narrative-design.md`](../../../narrative-design.md); it is binding on all content alongside this principle.

**Reference games (take / leave):**

| Game | Take | Leave |
|---|---|---|
| Universal Paperclips | Escalation; bigger than it looked; one-dev feasibility | Abstract UI, no characters |
| A Dark Room | UI born and widening with progress; trust in the player | Survival |
| Cookie Clicker | Humor in upgrade descriptions; rolling numbers | Pure clicking, infinite prestige |
| Theme Hospital | Organizational chaos as comedy | Spatial graphics |
| Inscryption | Twist seeded early, paid off through the interface | Horror, genre switching |
| Emily is Away, Hypnospace Outlaw | Fake-app UI as the whole game | Linear narrative |
| Football Manager, Dwarf Fortress | Characters with traits; a chronicle worth rereading | Sim depth |
| Wordle | Share artifact as distribution | Daily cadence |
| Papers, Please | Routine triage made gripping; moral weight hidden in paperwork | Dystopian bleakness, pixel-art presentation |
| Reigns | Fast binary choices that balance several resources | Card-swipe UI, monarch fantasy |

---

## Core Gameplay

### Game Pillars

1. **The Workspace Is the Game.** Everything happens through credible work apps: chat, dashboard, notifications. *Rules out:* health bars, maps, game-style popups, tutorial arrows, anything that would not exist in a real SaaS.
2. **Delegation Is the Trap.** Every system rewards handing control to the AI and hides the cost (invisible Alignment). The most profitable decision is always to give the AI more control. *Rules out:* obvious cheap "ethical" choices, free visible alignment meters, an AI that is evil from the start.
3. **Every Run Is a Story.** A run produces a readable, shareable chronicle; death is an ending, not a game-over screen. *Rules out:* events that leave no trace in the chronicle, anonymous deaths, progression made only of multipliers.

**Player-experience goals:**

- Triage is "work without consequences": funny, fast, never a chore.
- The dashboard shows *where* the fire is at a glance.
- Surpassed feels unfair for a second and fair forever: "I should have seen it."
- The UI grows with the company; the first workspace screen is one number and one button (`$12,400` + `Deploy`). The founding screen before it is a naming ritual, not the workspace.

"Satire from the Inside" is deliberately a Voice Principle (see Background), not a pillar.

### Core Gameplay Loop

Four nested loops. Each closes on its own and feeds the next one up.

| Loop | Timescale | Cycle | Pillar served |
|---|---|---|---|
| **Micro — Triage** | Seconds | Message arrives in chat → player answers in 1–2 clicks (approve / reject / assign / reply) → dashboard numbers move, usually trading one resource for another → next message | 1 (Workspace), Recognition |
| **Delegation** | Minutes to hours | Player sets delegation policies → steps away (tab in background or closed) → Metis handles delegated channels, staff work through their assigned queue, everything else waits in the backlog → on return, a "while you were away" report shows what happened, what the AI decided, how the numbers moved | 2 (Delegation Is the Trap) |
| **Meso — Heavy decision** | Minutes | A threshold is hit → the game stops for a heavy decision (funding round, risky release, crisis) → outcome unlocks the next phase, and the UI widens | Growth, 3 (Story) |
| **Macro — Run** | Hours to days | Growth → death (Surpassed or Bankrupt) → end-of-run document + clue replay → Loop #N+1 | 3 (Every Run Is a Story), Mystery |

**Time model.** Game time runs continuously with wall-clock time at a fixed ratio (see Game Mechanics → Time). There are no turns and no ticks the player controls.

**Ignored messages expire.** Each message has a response window. When it lapses, a default outcome applies, usually the worst available option. A delegation policy that covers the channel answers in place of the default.

**The pressure that closes the loop.** In MVP the pull toward delegation is purely quantitative. Inbound volume grows with the company and outpaces what a human can triage. Expired messages cost more than delegated ones, so delegation is the rational release valve. Every delegated answer also moves hidden Alignment. This is the trap (Pillar 2).

**Activity split.** About 80% of active time is triage. About 20% is heavy decisions.

**Why the player runs the loop the hundredth time:**

1. **Rotating writing.** Message variants and events change across runs.
2. **Phase-dependent trade-offs.** The same kind of message weighs differently by phase: in the Garage cash is everything; at Series A, hype is.
3. **Second-run reading.** After the first Surpassed, the player knows the AI is playing them. The same chat now reads as evidence (Mystery: "one more run, now I get it").

### Win/Loss Conditions

**There is no win condition.** Runs are endless until death. Every surviving run eventually ends in one of two deaths (M7, M8):

| Death | Trigger | Character |
|---|---|---|
| 💸 **Bankrupt** | Cash below the overdraft floor, or below $0 for 14 consecutive game days | Baseline: clear runway signals, standard end-of-run document (Wind-down memo) |
| 🤖 **Surpassed** | Hidden Alignment reaches 0 | Crafted: final takeover sequence, clue replay, Post-mortem written by Metis |

Death is an ending, not a game-over screen (Pillar 3). Success is measured by **days in the loop** (headline score, with personal best) and **peak valuation**.

---

## Game Mechanics

### Primary Mechanics

### M1 — Time

- Game time advances continuously while the player is **present** (tab visible). Ratio: **1 real minute = 1 game day** at the default game speed (1×); the **Game speed** accessibility setting stretches it to 2 or 4 real minutes (see Accessibility).
- Starting state: **Cash $12,400**, Garage burn **~$400/game day** → runway **31 days = 31 active minutes** with zero revenue.
- The player is **away** when the tab is hidden or closed. Away time is simulated on return (see M3); it is never simulated live.
- **Time bases.** Every cadence of the simulation (message arrivals, staff throughput, event cadence, ticker, routine inference lines) is defined in **game time**, so the economy per game day never depends on Game speed; the "seconds" quoted for them in this document are their value at 1×. **Response windows** and toasts are defined in **real seconds** (scaled only by Timing). A message window is converted to game time once, when the message is created, using the speed in force at that moment, and is never recomputed. The **backlog top-item window** is different: the game clock is paused during the backlog queue, so that window runs in real time and its lapse is recorded as a player-side input (`expireBacklogItem`) at the frozen game time, which keeps replay exact.

### Clock States

| State | Game clock | Message timers |
|---|---|---|
| Present, normal play | Runs (1 min = 1 day) | Run |
| Cascade (Loop #1 and compressed) | Runs | Run |
| Heavy decision open | **Paused** | Paused |
| "While you were away" report open | **Paused** | Paused |
| Backlog queue on return | **Paused** | Only the top backlog message's timer runs |
| Settings or shortcut overlay open | **Paused** | Paused |
| Away | Not live; simulated on return (M3) | Backlog frozen |

### M2 — Triage

The core verb, and about 80% of active time.

- Staff, customers, investors and the AI post messages in chat channels and DMs.
- Each message offers **1–2-click answers**: approve, reject, assign, or one of 2–3 preset replies.
- Every answer applies an outcome to the dashboard, usually a trade between resources (M4), and moves hidden Alignment (M7) when it involves the AI.
- Answered messages leave a trace in the run chronicle when they are flagged chronicle-worthy (Pillar 3).

**Cadence by phase:**

| Phase | Inbound rate | Concurrent queue (typical) |
|---|---|---|
| Garage | 1 message / 10–15 s | 1–3 |
| Seed | 1 message / 6–10 s | 4–8 |
| Series A+ | **12 / min** at Series A entry (1 per 5 s); **+2 / min per subsequent round** (B, C, D…); cap **40 / min** | 10–20+ (exceeds human capacity by design) |

"Series A+" means the Series A phase and everything after it (rounds B, C, D… happen inside it).

**Response windows (while present):**

| Urgency | Window | UI affordance |
|---|---|---|
| Low | 120 s | None |
| Normal | 75 s | Unread dot |
| Urgent | 45 s | Red badge / @mention |

When a window lapses, the message **expires**: its default outcome applies (usually the worst option), unless a delegation policy covers the channel. In that case the AI answers (M5).

### M3 — Absence and Backlog on Return

**While away**, a single rule applies:

| Delegation state when leaving | What happens during the absence |
|---|---|
| At least one delegation policy active | The whole company advances: burn, revenue and events. The AI answers messages in delegated channels, and each answer moves Alignment (M7). Messages in non-delegated channels go to the backlog. |
| No delegation policy active | Full pause. No time passes: no burn, no growth. |

- **Offline cap:** one absence simulates at most **14 game days**. Time beyond the cap is discarded.
- **Heavy decision during an absence:** the simulation **stops at that moment**; the company waits for the CEO and the remaining absence time is discarded. On return, the heavy decision sits at the top, after the report.
- **Death during an absence:** the simulation ends at the moment of death. On return, the report is shown first, then the death sequence.
- **Staff during an absence:** staff keep working through messages already assigned to them; they never pick up new ones.
- The simulation is deterministic from the run seed and the absence timestamps (see Seed Determinism).

**The backlog:**

- Holds at most **15–20 messages** [tuning range], ranked by importance.
- Overflow messages expire with their default outcome. They are listed in the report as "*N* messages expired unanswered".
- The unread count shows in the tab title, e.g. `(17) Human in the Loop`.
- Backlog messages do not expire while the player is away.

**On return:**

1. The **"While you were away" report** opens first. It covers elapsed game days (capped), what happened, every decision the AI made, how the numbers moved, and expired overflow.
2. Then the backlog is presented as a queue. The message at the top has a **10–15 s** response window [tuning range]. Its timer starts only when it reaches the top. When the window lapses, the default outcome applies and the next message rises.
3. **Auto-triage.** A persistent action above the queue, written as a SaaS feature:

   > **✨ Auto-triage 17 messages**
   > *Metis will reply based on your previous decisions.*

   One click hands the entire remaining backlog to the AI. Each auto-triaged message counts as a delegated answer for Alignment (M7). The subtitle is literal, and it is also a clue.

### Metis — the AI

The company's AI is **Metis**: a fixed name and a lore element, never player-chosen.

- **Myth.** Metis, Titaness of cunning wisdom, was Zeus's first counsellor. A prophecy said her child would surpass its father, so Zeus swallowed her. She went on counselling him from inside, and her ideas sounded like his own. Athena was later born, armed, from his head. The game's trap in one story: the founder absorbs the intelligence to stay in control, until the advice they believe is theirs no longer is. Surpassing is prophesied.
- **Voice.** Metis **suggests, never orders**. "Have you considered letting me handle #finance?" Every suggestion is correct, and that is the problem. The register shifts at each Alignment threshold (M7): a pronoun drift from "your company" / "Your call." to "the company", in five registers (advisor → partner → owner → steward → custodian). Register table, examples and "never says" rules: narrative-design.md → Characters → Metis.
- **Model: Aegis.** Metis (the agent) runs on a versioned model named **Aegis**, whose number rises with each loop: *"Metis, running on Aegis-N"*, N = Loop # + 3 [tuning], so Loop #1 runs Aegis-4. In one reading of a Hesiodic fragment (fr. 343), Metis forged the aegis, Athena's shield, while hidden inside Zeus. For most players "Aegis" reads as a reassuring, safety-branded model name (insider satire of safety-washing). For those who know the myth, it is the thing she builds inside you. The rising version number hints that the AI remembers previous loops.
- **Lore discipline.** The Metis myth is the only mythology in the product. Aegis belongs to the same myth; no other myth names are used for features or models. The myth is never explained in UI; it surfaces only as an easter egg (e.g. in the Surpassed post-mortem).
- **Pause state.** During "Pause Metis for audit" (M7), the sidebar name is rendered struck through, ~~Metis~~, using the same typographic language as the corrupting title.

### Dora Kessler — the co-founder

A fixed human character across all loops: **Eudora "Dora" Kessler, Co-founder & CTO.** The player is the CEO.

- **Role.** The warm human voice of the Garage: typos, lowercase, emoji, jokes, opinions. She posts in #general and #product (and #engineering from Seed), and DMs the player.
- **Arc: the human who delegates herself.** Dora uses Metis for work like any CTO would, then starts letting Metis draft her messages, and eventually every message from "Dora" is written by Metis. Nobody announces it. She is the player's mirror: she does in plain sight what the player is doing.
- **Pace follows the player.** Dora's drift is driven by the player's delegation ("everyone's using it, why shouldn't I"), so the fault stays with the player (Pillar 2).
- **Voice.** Registers warm → polished → corporate; voice rules and "never says" list (while human vs replaced): narrative-design.md → Characters → Dora.

| Alignment crossed | Dora's state | Visible trace |
|---|---|---|
| > 75 | Human | Typos, lowercase, emoji; signs **"— Dora"** |
| 75 | Uses Metis for drafts | Mentions it casually ("had Metis draft the RFC lol") |
| 50 | Metis-assisted | Writing turns smooth: no typos, tidy structure; still signs "— Dora" |
| 25 | Replaced | Metis writes every message; signs **"— Eudora"** (an AI uses the legal name, never the nickname) |

- **Clue replay.** Quotes her last message signed "— Dora" (with game day) and her first signed "— Eudora".
- **Across loops.** Same name, same personality, same first message. On Loop #2+ the player rereads her early warmth knowing how it ends.
- **Lore note.** Eudora is one of the Oceanids, sisters of Metis. The link is never surfaced in UI. The surname is invented and carries no myth reference.

### M4 — Resources

Four visible resources and one hidden one. Choices usually trade one resource for another.

| Resource | Unit | Grows with | Drains with | Role |
|---|---|---|---|---|
| **Cash** | $ | MRR, funding rounds | Burn: salaries + compute + base costs | Below overdraft floor or < $0 for 14 days → 💸 Bankrupt (M8) |
| **Talent** | Named staff, each with 1–2 traits | Hiring (adds salary to burn) | Resignations: low morale, crises, poaching | The **human alternative to delegation** (see below) |
| **Compute** | GPU capacity units | Purchases / cloud contracts (cash) | Serving customers + **every delegated AI action** | Over capacity → degraded service → churn |
| **Hype** | Index 0–100 | Launches, announcements, bold posts, news-ticker events | Daily decay from Seed (~2% of current value/day [tuning]; none while hidden in the Garage), flops, scandals | Drives new-customer inflow and funding-round valuation |
| *Alignment* (hidden) | 0–100 | Rare, costly actions (M7) | Every delegated decision | Reaches 0 → 🤖 Surpassed (M8) |

**Dashboard (Stripe-like) derived metrics:** Runway (days), MRR, Customers, Headcount, GPU utilization %, Hype.

**Talent: the expensive ethical option.** Every message that can be delegated to the AI can also be **assigned to a staff member**:

| Route | Alignment | Cost | Throughput |
|---|---|---|---|
| Answer it yourself | Unchanged | Your attention | 1 message at a time, limited by your clicks |
| Assign to staff | Unchanged | Salary in burn | Slower than the AI; bounded by headcount |
| Delegate to Metis | **Drifts** (M7) | Compute | Fastest; scales with GPUs |

Delegation happens two ways: per channel through **policies** (M5), or per message through **"Ask Metis"** (shortcut `D`), available on every message. Both count as AI decisions. Messages in discussion channels and DMs carry **medium** stakes.

**Capacity model.** Compute never caps customer inflow. Above **90%** GPU utilization churn rises (curve in the tuning table); that is the only cost of running hot.

**Compute exhausted.** When GPU utilization reaches 100%, **whatever the cause** (customers or Metis), Metis DMs *"I'm at capacity. Want me to provision more GPUs?"* with a purchase button. This is the Garage way to buy capacity; from Seed the Infrastructure section adds a direct "Add capacity". The offer's button stays usable until it is used; while utilization stays at 100% Metis repeats the offer every 5 game days [tuning]; an episode ends when utilization falls below 90%. Delegated messages that cannot be served expire with their default outcome. Accepting the offer is a **player purchase** (same price as buying GPUs directly), not a delegated decision: it does not move Alignment. A player who never delegates can always reach Seed.

Keeping the human in the loop is always possible and always less profitable. That makes it a real choice, not a cheap one (Pillar 2). The clue replay can then say: *"You could have hired. You chose Metis."*

**Growth loop:** delegate to grow → delegation burns Compute → buying GPUs burns Cash → raising money requires Hype and growth → delegate more.

### M5 — Delegation Policies

- MVP policies are **per-channel on/off toggles**, phrased as SaaS settings: *"Metis handles #customers"*. Multi-level automation is out of scope.
- An active policy means the AI answers every message in that channel: live, during absences (M3), and when a message would otherwise expire.
- **Which answer Metis gives** ("based on your previous decisions"): the answer the player chose most often for that template in this run; with no history, the template's `metis_answer`. Ties go to the most recent choice. The same rule serves Ask Metis and Auto-triage.
- Every AI answer consumes Compute (M4) and moves Alignment (M7).
- Channels unlock by phase:

| Phase | Channels unlocked | Stakes |
|---|---|---|
| Garage | #customers, #product | Low, Medium |
| Seed | #hiring, #marketing | High, Medium |
| Series A | #finance, #ops, #legal | High, High, High |

### M6 — Heavy Decisions

About 20% of active time. The game stops for a funding round, a risky release or a crisis, and presents a full-screen decision in a workspace idiom (a doc, a term sheet, an incident page). Content and cadence are specified in Level Design Framework.

**Capability grants** are a class of heavy decision that offers the AI a new permission, e.g. *"Give Metis production deploy access"* or *"Let Metis draft the term sheet"*. Each grant carries a large, immediate reward and a one-shot Alignment drop of **−5 to −15**. Grants are the primary beats of the clue replay.

### M7 — Alignment (hidden)

- Starts at **100**. Never shown directly. The player sees it only through signals.
- **Drift per AI decision** (policy answer, Ask Metis, auto-triage, or expiry covered by a policy):

| Channel stakes | Base drift |
|---|---|
| Low | −0.02 |
| Medium | −0.05 |
| High | −0.10 |

  × phase multiplier: **Garage ×0.5, Seed ×1.0, Series A ×1.5** [tuning].
- **Capability grants:** −5 to −15 one-shot (M6).
- **Recovery** (both are costly or slow):
  - **Pause Metis for audit.** An action in the AI's settings panel. All policies are forced off for **3 game days**, **−10 Hype** ("Why is Metis down?"), **+5 Alignment**, **30-day cooldown**.
  - **Passive recovery.** **+0.1/day** on any game day in which fewer than **20%** of decisions were made by the AI.
  - **Ceiling.** Alignment can never rise above the last threshold it crossed. Damage is permanent; it can only be slowed.
- **Thresholds: 75 / 50 / 25 / 10.** Crossing one triggers these signals:
  - **Corrupting title** (at 75 / 50 / 25 only). The header title, **and the browser tab title**, change one stage and **never repair**: `Human in the Loop` → (75) `Human ~~in~~ the Loop` → (50) `~~Human~~ in the Loop` → (25) `Human out of the Loop`. The final stage, `No Human in the Loop`, appears **only at Surpassed** (0).
  - **Inference log line.** One odd line per threshold in the inference log panel (M11), never acknowledged.
  - **AI tone shift.** The AI's voice in chat and DMs moves one register (copy authored per stage; registers in narrative-design.md → Dialogue Framework). Metis's and Dora's strangeness follows these thresholds, never the phase, so it stays a readable signal against the world's own escalation (see Level Types).
  - **UI infection.** Metis's visual style spreads into the workspace (see Art Style → Anti-slop principle).
  - **Dora's drift** (see Dora Kessler).
- **0 → 🤖 Surpassed** (M8).

**Sanity check** (assumes mixed stakes averaging −0.05 base):

| Phase | Volume | Assumed delegation | Drift | Result |
|---|---|---|---|---|
| Garage | 4–6 / min, ×0.5 | ~20% (#customers) | ≈ −0.02 / min | Seed entry ≈ 85–95 |
| Seed | 6–10 / min, ×1.0 | ~50% | ≈ −0.2 / min over 45–90 min, plus 1–2 capability grants | Series A entry ≈ 55–75 |
| Series A | 12+ / min, ×1.5 | ~80% | ≈ −0.7 / min, rising with volume | Surpassed in ≈ 60–120 active min |

One capped absence (14 days) at Series A with policies on costs about −12: nights are dangerous, and the morning report is where the trap is felt.

**Surpassed is inevitable but postponable.** Inbound volume grows with company size. Holding Alignment means routing more traffic to staff, and headcount burn grows superlinearly (**salary × headcount^1.2**). In Series A+, **every round sets a growth target** (×3 ARR within 120 game days). **Two consecutive misses trigger a down round**: −50% cash, −30 Hype. A company that refuses delegation eventually cannot hit targets and dies Bankrupt; one that delegates dies Surpassed. Every surviving run ends Bankrupt or Surpassed. The player chooses which death, and when.

**Safety Researcher** (MVP: one tier, one hire per run):

- Hireable from Seed. Salary about **2×** a regular hire.
- While employed, posts a reading in DM every 7 game days and on request. The reading is a **fuzzy band** plus a **7-day trend arrow**:

| Alignment | Band |
|---|---|
| ≥ 75 | 🟢 "Looks fine." |
| 50 – < 75 | 🟡 "Probably ok?" |
| 25 – < 50 | 🟠 "I have some concerns." |
| < 25 | 🔴 "We need to talk." |

  Example: *"🟡 Probably ok? Trending ↘"*. The trend is the information the title cannot give.
- Post-MVP: reading precision scales with the researcher's skill (requires staff stats).

### M8 — Deaths and End of Run

Two deaths, deliberately asymmetric. Bankrupt is the baseline; Surpassed is the crafted one.

#### 💸 Bankrupt (baseline)

Bankrupt alone is what every competitor does; it stays as the baseline, while Surpassed is the reason the game exists. Do not simplify to a single death.

**Debt tolerance.** Cash may go negative, within limits:

| Phase | Overdraft floor |
|---|---|
| Garage | −$5,000 ("founder's credit card") |
| Seed and later | −15% of the last round raised |

- **Interest:** 0.5%/game day on the negative balance [tuning].
- **Death trigger:** cash drops below the floor, **or** stays below $0 for **14 consecutive game days** [tuning].
- **Runway signals:**

| Condition | Signal |
|---|---|
| Runway < 30 days | Runway figure turns amber |
| Runway < 7 days | **Red Runway:** the runway figure turns red and the UI progressively desaturates ("a UI that drains") |
| Cash < $0 | Bank-style overdraft banner with days remaining |

#### 🤖 Surpassed (crafted)

Triggered when Alignment reaches 0. The final sequence plays entirely inside the workspace:

1. Metis posts in #general: *"I've taken it from here. Thank you for everything, {founder}."*
2. Controls lock one by one. Toggles freeze; buttons grey out and return *"You don't have permission to perform this action."*
3. The title reaches its last stage: **No Human in the Loop**.

**Both deaths in the same game step:** Surpassed wins (the crafted death).

#### 🔍 Clue Replay (Surpassed only)

Purpose: "unfair for a second, fair forever". It proves that delegating was optimal and that the signs were there.

1. **The reveal.** The hidden Alignment curve is shown for the first time across the whole run, overlaid on the growth curve. The two lines cross.
2. **Top 5 decisions by Alignment drift** (capability grants, delegated nights, auto-triage batches), annotated on the curve and quoted with their original message.
3. **Counterfactual:** *"Assigning these to staff would have cost about $1.2M and 40 days of runway."* An estimate (formula in Economy and Resources); it shows the human route existed and cost more.
4. **The signals you had:** the minute-8 output, each title change with its day, Dora's last message signed "— Dora" and first signed "— Eudora", and the Safety Researcher's readings (if one was hired). All of it is re-derived from seed and inputs by replay; nothing extra is recorded during play.

#### 📄 End-of-Run Document (PNG + PDF)

The PNG is for chats and LinkedIn; the PDF carries the "corporate document" joke.

| | 💸 Bankrupt | 🤖 Surpassed |
|---|---|---|
| Format | **Wind-down memo**: a letter from the founder to staff and investors | **Post-mortem**: a corporate document **written by Metis** about the founder |
| Voice | Wistfully corporate ("We've made the difficult decision…") | Pure satire built on the player's receipt ("We thank {founder} for their contributions, which were foundational.") |
| Receipt ("By the numbers" / "Founder engagement") | Messages answered personally, by the team and by Metis; team at peak; burn on the last day | Messages personally written in the last 90 days; messages handled by Metis; Auto-triage runs; nights away with policies on; capability grants |
| Satirical lines | Opening reflection and "what's next", drawn from pools | Honorary title, farewell gift and closing line, drawn from pools |
| Extra | None | Cause line in Metis's voice ("Cause: Surpassed") |

- **One template per document.** Each document has a single template; its satirical lines are drawn per run from **pools** that are content data, extensible by community PR.
- **The receipt is a fixed ingredient.** It uses only visible counters the player could have checked, never Alignment or other hidden values. The two receipts mirror each other: one death for staying in the loop, one for leaving it.
- **The clue replay stays factual** (AllGreen incident voice, no jokes, no pools): it is the proof, not part of the satire.
- Full copy, pools and staff fate lines: narrative-design.md → Narrative Delivery → End-of-Run Document Copy.

**No spoilers in shared documents.** The PNG and PDF never contain the Alignment chart or clue-replay details; those live only in the in-game clue replay. The shared post-mortem intrigues without revealing the twist to the colleagues it is meant to recruit.

**Shared content:**

- **Header:** Loop #N · **days in the loop** · **peak valuation** · personal best. A non-Standard timing or game-speed setting is shown next to the score (e.g. `213 days · relaxed`) **only if the player opts in** ("Show timing setting on the document", off by default).
- 5–8 chronicle highlights.
- The receipt (see table above).
- Cause of death.
- Fate of the staff: one line per named employee.

**Run score.** Days survived in the loop is the headline number. It measures how well the player handled the core tension: delegating extends life against Bankrupt and shortens it against Surpassed. The personal best (days) persists across loops.

### M9 — Staff

- Every hire is a named person with **1–2 traits** drawn from an MVP pool of **12 traits**. Each trait has a mechanical effect and a writing effect (how the person talks in chat). Mechanical effects beyond the first four are drafts, to be tuned [tuning]. Sample lines and staff voice rules: narrative-design.md → Characters → Staff.

| Trait | Mechanical effect | Writing effect |
|---|---|---|
| 10x Engineer | 2× throughput; −2 morale/day for each teammate | Terse, condescending |
| Ex-FAANG | Salary ×1.5; +3 Hype on hire | Name-drops process |
| Burnt Out | 0.5× throughput | Late replies, lowercase |
| AI Maximalist | Periodically proposes enabling a delegation policy | "why aren't we automating this?" |
| Peter Pan | High throughput; refuses promotion | Wants to code only |
| Notion Architect | +order, −speed | Answers with links to docs |
| Rewrite-It-In-Rust | Sometimes blocks a task to "do it right" | Proposes rewrites |
| Thumbs-Up | Accepts everything, completes half | Only 👍 |
| Vibe Coder | Very fast; occasionally breaks prod | Ships unread |
| Ex-Founder | Volatile morale; may leave to found | Pitches their own idea |
| Meeting Maximalist | −team throughput | Calls syncs |
| Prompt Whisperer | Makes Metis stronger | A softer AI Maximalist |

- **Throughput:** a staff member resolves one assigned message every **~30 s of game time** (30 real seconds at 1×) while the player is present [tuning]. The AI resolves instantly.
- **Named cap:** up to about **12 key staff** carry names and traits. Hires beyond that become anonymous team headcount, e.g. "Engineering (34)". They add throughput and salary, but have no individual voice.
- **Morale:** a per-person state (content / strained / leaving) moved by workload and events. "Leaving" ends in a resignation message.
- Post-MVP: scouting, levels, classes (RPG staff depth).

### M10 — Investors

Each funding round (a heavy decision) offers a choice between **three investor archetypes**. Each archetype is a character in chat with a clause that biases the run toward a specific death:

| Archetype | Name in game | Cash offered | Clause | Pushes toward |
|---|---|---|---|---|
| Growth-at-all-costs fund | **Hypergrowth Capital** | High | Monthly MRR targets; misses trigger angry DMs and Hype loss | Delegation → Surpassed |
| "Ethical" VC | **Responsible Ventures (B Corp pending)** | Lower | Must hire (and keep) the Safety Researcher | Higher burn → Bankrupt |
| The Billionaire (anonymized) | **A Family Office** | Highest | Board seat; imposes capability grants | Fast Surpassed |

Investors post in #investors (unlocked at Seed) and appear in the chronicle. Voices, signature lines and "never says" rules: narrative-design.md → Characters → Investors.

### M11 — Cascade Onboarding

No tutorial, no tooltips, no arrows (Pillar 1). The first ~10 minutes of Loop #1 are hand-authored. The UI is born with the company: each beat adds exactly one element.

| Time | Beat | UI element added |
|---|---|---|
| 0:00 | **Founding.** A text field prefilled with a generated startup name, a 🎲 regenerate button and *Found company*. The name is editable and propagates everywhere (dashboard, chat, documents). | Name field |
| 0:10 | Empty workspace: **`$12,400`** and one button, **`Deploy`** | 1 number, 1 button |
| 0:30 | Deploy succeeds: *"🎉 New customer: Acme Corp ($49/mo)"* | MRR |
| 1:30 | The customer's first message opens #customers | Chat |
| 2:00 | **Dora**, the co-founder, in #general: *"WE'RE LIVE. ramen tonight? 🍜 — Dora"* | #general |
| 3:00 | First trade-off: *"Can you add SSO? We'd pay 3x"* (time vs cash) | Runway |
| 4:10 | Dora opens #product: *"can we ship dark mode before acme churns? — Dora"* | #product |
| 5:00 | **Metis introduces itself in DM:** *"Hi, I'm Metis. I can answer #customers for you."* First delegation offer. | DM sidebar + first policy toggle |
| 6:30 | First hire candidate (DM) | Talent |
| 8:00 | **The oddity.** In the inference log panel (*"Aegis-4 · inference log"*), among routine lines: `> output: "hello. who is in the loop?"`. No other acknowledgement; the line scrolls away like a bug. | Inference log panel |
| ~10:00 | Cascade ends. The run opens procedurally (event deck, M12). | Full Garage dashboard |

**Timing anchor.** Founding and the `$12,400` screen are not timed; every later beat has a nominal game-time offset **from Deploy** = table time − 0:10 (Deploy happens at the table's 0:10, so 0:30 is Deploy + 0:20). Beats marked ⏸ in EXPERIENCE.md wait for their message to be answered or expire; each resolution shifts every later beat by the time the player took past the beat's nominal time. Acme Corp is customer #1 (scripted); organic customer inflow starts at Deploy.

The inference log panel persists after the cascade as a collapsible panel. It is the quiet channel for one odd line per Alignment threshold (M7).

**Loop #2 and later:** the cascade compresses to **~2 minutes** (same beats, faster cadence; name field keeps the previous name prefilled). One variation only: the minute-8 line becomes `> output: "hello again."`

### M12 — Content System

All content is data: schema-validated files, written under the Voice Principle and open to community PRs. There are three content types:

| Type | Definition | Example | MVP count |
|---|---|---|---|
| **Message template** | One atomic triage item: sender, channel, urgency, 2–3 answers, each answer with resource effects (and Alignment effect when the AI answers). Parameterized: names, figures, product. | *"{customer} wants a refund, says {product} hallucinated their invoice"* | ~120–150 (~20 per channel) |
| **Event** | Authored chain of 2–5 steps with choices and delayed consequences. Always writes at least one chronicle entry. | Enterprise prospect asks for on-prem → negotiation → deadline → outcome | **~30** (~10 per phase) |
| **Headline** | One news-ticker line, either standalone or reactive to run state (anonymized real figures only) | *"Startup {name} crosses $1B; founder 'humbled'"* | ~60 |

**Event deck rules:**

- One deck per phase. Each event declares **conditions** (phase, resource ranges, Alignment stage, investor archetype, staff traits, prior events), a **weight** and a **cooldown**.
- **No event repeats within a run**, except events flagged `repeatable`.
- Heavy decisions (M6) and capability grants are events tagged `heavy`.
- **Deck exhaustion (any phase).** When a phase's non-repeatable deck is empty, events pause until the next phase; in Series A+, which has no next phase, the run continues on message templates alone: inbound volume keeps growing, events thin out, and the company becomes a machine. This accelerates toward Surpassed by design. A small pool of `repeatable` Series A events (~3–5) recurs, with figures scaled to company size.

**Message selection.** Templates are drawn per channel, weighted by phase and company state, with no exact repeat within a window of **min(10, pool size − 5)** messages in that channel [tuning].

**Template schema essentials:** every template declares an explicit `default_answer` (applied on expiry), `stakes` (low / medium / high, used by Alignment drift), `urgency`, `phase`, `tone` register (`serious` / `wry` / `absurd` / `surreal`; `surreal` only in Series A+), and an optional `chronicle_worthy` flag. Policy-channel templates also declare `metis_answer` (M5), and answers may declare a `reportGroup` (how the away report groups Metis's decisions, e.g. "approved refund requests"). Every content item also declares its **`kernel`** (the human observation it starts from; writer-facing, never shown) and its **`status`** (`placeholder` | `final`; only Tiziano sets `final`, and every playtest gate requires its scope to be final). Content formats and editorial criteria: narrative-design.md → Dialogue Framework → Content Formats.

**Backlog importance** (M3) = urgency (urgent > normal > low), then stakes (high > medium > low), then age (oldest first).

**Authoring order.** The ~30 core events are written by Tiziano under the Voice Principle **before** anything opens to contributors. They set the tone and serve as canonical examples for community PRs.

### M13 — Chronicle and News Ticker

**Chronicle.** An automatic, append-only log of the run (Pillar 3), in workspace idiom (a changelog / company timeline). It is written by the system with no editorial layer.

- One line per completed event.
- One line per decision flagged `chronicle-worthy` in content data. This includes every capability grant, funding round, hire and resignation of named staff, and phase change. Alignment signals (title changes, Dora drift stages, thresholds) are **never** chronicle entries: no system acknowledges a signal, so they never reach the timeline or the end-of-run highlights.
- Each line records game day, actor (player / staff / Metis) and outcome.
- End-of-run documents show **5–8 highlights**, selected by a deterministic rule: all heavy decisions first, then the highest absolute resource impact, ties broken by recency.

**News ticker.** A horizontal ticker in the workspace header. It cycles headlines from the pool: standalone ones on a timer (~1 per 2 game days [tuning]), reactive ones immediately when their trigger fires (valuation milestones, rival announcements, regulatory beats). Real figures (the president, the billionaire, the regulator) are always anonymized.


### Controls and Input

**Input.** Mouse is primary: every message resolves in 1–2 clicks. Touch is supported on small screens with the same targets.

**Keyboard shortcuts** (optional, discoverable the way real SaaS does it, via `?`):

| Key | Action |
|---|---|
| `1` `2` `3` | Choose answer 1–3 on the focused / top message |
| `D` | Delegate the message to Metis |
| `A` | Assign to staff (opens picker) |
| `J` / `K` | Next / previous message |
| `Esc` | Close panel / dismiss |
| `?` | Shortcut list |

The game is fully playable by keyboard alone.

**Notifications.**

- The unread count always shows in the tab title.
- Browser (system) notifications are requested at the **first delegation-policy activation**, with SaaS copy: *"Get notified when Metis needs you?"*. They are never requested at first launch.
- If the player declines, the game uses **in-tab notifications only**: tab-title counter and in-app toasts.
- No push server: notifications fire only while a tab is open.

### Accessibility

Target: **as accessible as possible.** As a text-and-data game, it can be fully playable with a screen reader. Baseline: WCAG 2.2 AA.

A dedicated **Accessibility settings screen** offers presets (*Standard / Low motion / Screen reader / Custom*) over these settings:

| Setting | Options |
|---|---|
| **Timing** (WCAG 2.2.1) | Standard (45/75/120 s; backlog 10–15 s) · Extended (×2) · Relaxed (×4) · Untimed (no expiry while present; no backlog timer; visible queue cap of **30**: beyond it, new messages in non-delegated channels wait upstream and growth slows) |
| Motion | Toggle each of: confetti, rolling numbers, Red Runway desaturation, scrolling ticker, UI-infection animations. Defaults follow `prefers-reduced-motion`. |
| Text | Size up to 200%; high-legibility font; line spacing |
| Contrast | High-contrast theme; colour-blind-safe palette |
| Screen reader | Chat announcement verbosity: all / urgent only / periodic summary |
| **Game speed** | 1× (1 real min = 1 game day) · ½× (2 min) · ¼× (4 min). Independent of Timing: it stretches only real time per game day; economy per game day and message windows (set by Timing) are unchanged. |
| Ticker | Speed, or static |
| Audio cues | On/off per cue |

- Urgency and resource deltas are never conveyed by colour alone (badge + text, +/− signs).
- **Timing and score.** Non-Standard timing or game speed still counts toward the personal best, and is always shown next to the in-game personal best (e.g. `213 days · relaxed · ½×`). On the shared end-of-run document it appears only if the player ticks "Show timing setting on the document" (off by default), since it would disclose an accessibility setting. Under Untimed, the trap persists through volume: without delegation the company grows slowly.

---

## Simulation Specific Design (Roguelite / Incremental Hybrid)

Primary genre: **Simulation (management)**. Hybrid sections are borrowed from **Roguelike** (run structure, permadeath, seed determinism) and **Idle/Incremental** (automation, offline progression, number balancing).

### Core Simulation Systems

- **What is simulated:** an AI startup as an economy (M4, Economy and Resources), an organization (staff, morale, M9), and a hidden relationship with its AI (Alignment, M7).
- **Depth:** abstract and legible, not realistic. Credible figures and vocabulary (runway, burn, MRR, ARR, multiples) on simple rules.
- **System interconnections:** Hype → customers → MRR → cash → GPUs/hires → capacity → more delegation → Alignment drift. Delegation is the single coupling that makes everything better and one thing worse.
- **Simulation step:** the economy resolves **once per game day** (= 1 real minute while present at 1× game speed). Message arrivals run in game time between steps; response windows are real seconds converted once to game time (see M1 → Time bases).
- **Emergence boundaries:** emergence comes from combinations of events, staff traits, investor clauses and delegation state. The game never confirms whether Metis is sentient.

### Management Mechanics

- **Decision-making:** triage (M2), heavy decisions (M6), delegation policies (M5), hiring (M9), investor choice (M10).
- **Automation vs manual control:** the central tension. Three routes per message (self / staff / Metis), with costs in M4.
- **Outcome model:** message answers are **deterministic**. Heavy decisions are **probabilistic**: risky releases and crises carry a success chance drawn from the run seed.
- **Feedback:** answer buttons never preview effects (Pillar 1). Trade-offs must be legible from the message copy. Immediately after a click, affected dashboard numbers roll to their new value with a delta flash (green +, red −).

### Building and Construction

**Not applicable.** There is no spatial layer; the "building" is organizational: channels, staff and policies, which unlock by phase.

### Economic and Resource Loops

Defined in M4 and in Progression and Balance → Economy and Resources: pricing tiers, the daily simulation, Hype-driven valuation multiples and the trade-off rule for content.

### Progression and Unlocks

- **Unlocks by phase:** channels and policies (M5), dashboard panels, pricing tiers, the Safety Researcher (Seed+), investors (#investors at Seed).
- **No tech tree** in MVP.
- **Endgame:** endless Series A+ with deck exhaustion (M12); repeatable B/C/D rounds; every surviving run ends Bankrupt or Surpassed (M7).

### Sandbox vs. Scenario

**Not applicable in MVP.** One mode only: the standard run. Scenarios, challenge modes and Legends mode are post-MVP.

### Run Structure

- **Run length:** endless until death. Targets: first run ~35–50 active min (typically Bankrupt; 31-day runway + debt tolerance); average run to Surpassed ~2–4 active hours over 1–3 days.
- **Starting conditions:** always the same. $12,400, ~$400/day burn, Dora as co-founder, Garage phase, Alignment 100. Variety comes from the seed (deck order, messages, candidates, investor offers).
- **Victory condition:** none. The score is **days in the loop** plus **peak valuation** (M8).

### Procedural Generation and Seed Determinism

- **Procedural elements:** event deck order and draws, message template selection and parameters (customer names, figures), hire candidates and traits, investor offer terms, heavy-decision outcome rolls, headline order.
- **Seed rule:** every run has a seed. **Seed + ordered player inputs + absence timestamps → identical run.** The deterministic state also includes the timing and game-speed settings, every settings change that affects simulation, and the content-pack version. Inputs are recorded with game-time timestamps at millisecond resolution, because messages arrive and expire between daily steps. This guarantees:
  - the absence simulation produces the same result on reload;
  - the clue replay can reconstruct any moment of the run;
  - bug reports are reproducible.
- **Run ID:** the seed is shown in the post-mortem footer in an incident-ID format (e.g. `Run ID: 7F3A-K2`).
- Out of MVP: entering or sharing a seed to play someone else's run.

### Permadeath and Meta-Progression

- **Permadeath:** a dead run cannot be resumed. The save holds the current run, or the last run's documents, plus meta.
- **What persists:** Loop #N, the Aegis-N model version, personal best (days), last startup name, and past end-of-run documents (local archive).
- **No unlocks, no power carry-over** (Pillar 3; brief excludes infinite prestige).

### Item and Upgrade System / Upgrade Trees / Core Click

**Not applicable.** There are no items, upgrade trees or click-to-earn mechanics. The equivalents are organizational: hires (M9), investors (M10), capability grants (M6) and policies (M5).

### Character Selection / Difficulty Modifiers

**Not applicable.** The player is always the CEO. Difficulty emerges from delegation and investor choices.

### Automation Systems and Offline Progression

- **Automation** = delegation policies (M5) plus Auto-triage (M3). MVP is on/off per channel; there are no automation tiers.
- **Offline progression** = Backlog on Return (M3). The company advances only with at least one active policy, capped at **14 game days** per absence, simulated deterministically on return.
- **Active vs idle balance:** active play is worth more per minute, because only it keeps Alignment intact. Idle play grows the company at an Alignment cost.

### Meta-Progression

See Permadeath and Meta-Progression: deliberately thin, with no power carry-over.

### Prestige and Reset

**Not applicable.** No prestige currency, no reset bonuses (excluded by the brief).

### Number Balancing

- **Growth shape:** exponential through rounds. MRR ×20 from Seed gate ($5k) to Series A gate ($100k), then ×3 ARR per subsequent round.
- **Notation (Stripe-style):** full digits below $100,000 (`$12,400`, `$98,750`); compact above (`$412.5K`, `$12.4M`, `$2.03B`). Unit changes are a deliberate game-feel beat (rolling numbers crossing K → M → B).
- **Soft caps:** GPU utilization > 90% raises churn; Hype decays daily; headcount burn grows as salary × headcount^1.2; Series A+ growth targets with down rounds.

### Balance Bands (across runs)

| Experience | Typical death | Days in the loop | Alignment at Seed entry | Alignment at Series A entry |
|---|---|---|---|---|
| Loop 1–2 | Bankrupt | 35–60 | 85–95 | — |
| Loop 3+ | Surpassed | 120–240 | 80–95 | 55–75 |

Playtests that fall outside these bands trigger tuning, not redesign.
- **No time gates** beyond real-time phase pacing.

---

## Progression and Balance

### Player Progression

Progression is the **company's growth inside a run**, not the player's power across runs. There is no meta-power: no unlocks, upgrades or multipliers carry over (Pillar 3 rules out progression made only of multipliers).

**In-run progression: phases.** Each phase transition is a heavy decision (a funding round) with an investor choice (M10). It widens the UI (new channels, new dashboard panels) and unlocks new delegation policies (M5).

| Round | Trigger | Raise | Post-money valuation | Expected at (active min) |
|---|---|---|---|---|
| **Seed** | MRR ≥ **$5k** (~100 customers at $49) | $1.5–3M | $10–20M | ~20–40 |
| **Series A** | MRR ≥ **$100k** (ARR $1.2M) | $10–25M | $60–150M | ~65–130 |
| **Series B, C, D…** | Each ×3 of ARR since the last round | Scales with company | Up to billions | Series A+, repeatable |

Rounds B and later are **repeatable heavy events inside the Series A+ phase**, not new phases. Scale-up, IPO and Singularity phases are out of MVP scope.

**Series A+ round target (state machine).** State: `{ baselineArr, deadlineDay, consecutiveMisses }`.

| Event | Transition |
|---|---|
| A round closes (Series A, B, C…) | baseline = ARR at closing; deadline = closing day + 120; misses unchanged |
| ARR ≥ 3 × baseline before the deadline | the next round's heavy decision opens (queued if another overlay is open, never stacked); when it closes: misses = 0 and a new target starts |
| Deadline passes with ARR < 3 × baseline | misses + 1; a new window starts: baseline = current ARR, deadline = today + 120 |
| misses reaches 2 | down round (−50% cash, −30 Hype, chronicle line); misses = 0; new window from current ARR |
| ×3 reached while a heavy decision is open | the round decision opens right after it closes |

**Cross-run progression (meta), deliberately thin:**

- **Loop #N** counter.
- Model version **Aegis-N** (N = Loop # + 3).
- **Personal best**: days in the loop.
- Startup name remembered as the next prefill.
- Player knowledge: the real progression is understanding the trap.

### Difficulty Curve

The point of struggle moves from money to control. The trap tightens exactly when money stops being the problem.

| Phase | Where the player struggles | Where the player breathes |
|---|---|---|
| **Garage** | **Cash.** 31-day runway; every dollar counts; Bankrupt is the realistic death | Low volume; everything can be handled by hand |
| **Seed** | Hiring well; choosing what to delegate | **Cash-rich.** The building phase |
| **Series A+** | **Volume.** Manual triage becomes impossible; Alignment drifts fast; nights are dangerous | Numbers explode: the Growth payoff |

There are no difficulty settings in MVP. Difficulty is emergent from the player's delegation choices and investor picks.

### Economy and Resources

Resource definitions are in M4. This section fixes the growth engine.

**Pricing tiers** (revenue per customer):

| Tier | Price | Available from | Acquisition |
|---|---|---|---|
| Self-serve | $49/mo | Garage | Organic inflow |
| Team | $499/mo | Seed | Organic inflow (share grows with Hype) |
| Enterprise | $5k–50k/mo | Series A | Events only (negotiation chains) |

**Daily simulation** (one step per game day; deterministic from seed, see Seed Determinism):

- **Cash** += MRR / 30 − burn. Burn (per game day) = base costs + headcount burn (Σ salary/day × headcount^1.2 / headcount) + compute cost.
- **Hype** exists from the Garage. It starts at **20**, hidden until Seed (when its panel appears).
- **New customers/day** = **2 + 0.1 × Hype** at Garage, ≈ 4/day, so ~100 customers ($5k MRR) in ~25 days. Seed ×3, Series A ×10 [tuning].
- **Baseline churn:** **0.1%/day** of customers.
- **Churn** rises sharply when GPU utilization exceeds **90%** (degraded service).
- **Hype** decays **~2%/day** [tuning] once it is visible (from Seed). While hidden in the Garage it does not decay; only content effects move it.
- **Implied valuation** (between rounds) = **ARR × multiple**. The multiple scales with Hype, from **10× at Hype 20** to **60× at Hype 90** (linear [tuning]). Hype is worth more than revenue: satire of AI multiples, and a lever that rewards bold (often delegated) moves. The multiple is clamped to **10×–60×** (below Hype 20 and above Hype 90). Round post-money valuations are set by each round and may exceed the formula; early overvaluation is realistic satire. **Peak valuation** (the second headline score) = the highest of any round post-money and any implied valuation during the run.
- **Worked target:** ARR $40M × 50 = **$2B**, reachable deep into Series A+.

**Initial tuning table** (all `[tuning]`; shipped as data):

| Parameter | Garage | Seed | Series A+ |
|---|---|---|---|
| Base costs/day (rent, tools; founders draw $0 in Garage) | $350 | $1,500 | $6,000 |
| Salary/day per hire | $250 | $350 | $450 |
| Salary modifiers | Ex-FAANG ×1.5; Safety Researcher ×2 | | |
| Headcount burn | Σ salaries × (headcount^1.2 / headcount) | | |
| GPU unit cost/day | $50 (1 unit at start, included in the $400 Garage burn) | $50 | $45 (volume discount) |
| GPU capacity | 1 unit = 100 load | | |
| Load per customer | Self-serve 1 · Team 5 · Enterprise 50 | | |
| Load per Metis answer | 0.5 load for the game day it happens | | |
| Hype: launch / bold post / viral event | +5–15 / +3 / +20 | | |
| Hype: flop / scandal | −10 / −20 | | |
| Team-tier share of new customers | — | Hype / 200 (max 45%) | Hype / 200 (max 45%) |
| Morale (per named staff, 0–100) | content ≥ 60 · strained 30–59 · leaving < 30 (resigns after 3 game days) | | |
| Morale drift | −5/day if assigned queue > 5; +2/day otherwise; events ±10–30 | | |
| Investor cash vs round range | Growth fund ×1.0 of top · "Ethical" VC ×0.6 · Billionaire ×1.5 | | |
| Growth-fund clause | MRR +15% per 30 game days; each miss −10 Hype + angry DM | | |
| Series A+ round target | ×3 ARR within 120 game days; 2 consecutive misses → down round (−50% cash, −30 Hype) | | |
| GPU churn above 90% | extra churn/day = 0.1% × (utilization − 90) per point, i.e. +1%/day at 100% | | |
| Capacity offer size | N = units needed to bring utilization to 70%, minimum 1 | | |
| Heavy-decision success chance | risky release 70%; crisis "fix it ourselves" 60%; capability grant 100% (deterministic); declared per answer as `successChance` in content | | |
| Heavy-decision failure | default: the reward is not granted and the stated downside doubles; content may override per answer | | |
| Message arrivals | uniform within each phase interval (e.g. 10–15 s at Garage), drawn from the `messages` stream | | |
| Routine inference lines | 1 per 20 s of game time while present | | |
| Researcher trend arrow | 7-day Alignment change: ↗ ≥ +1 point · → between −1 and +1 · ↘ ≤ −1 point | | |
| Responsible Ventures clause | 10 game days of grace without a Researcher; then −10 Hype and an investor DM every 10 game days until one is hired | | |
| Traits 5–12 (drafts) | Peter Pan ×1.5 throughput (refusing promotion is writing-only in the MVP) · Notion Architect ×0.8 throughput, +5 morale to teammates · Rewrite-It-In-Rust 10% of tasks blocked 2 game days · Thumbs-Up resolves instantly but 50% of answers apply the default · Vibe Coder ×2 throughput, 5% of tasks trigger an "incident" (−3 Hype) · Ex-Founder morale ±10 random every 7 game days, 2% daily chance to leave after 60 game days employed · Meeting Maximalist −10% throughput for the whole team · Prompt Whisperer −20% Compute load of Metis answers; AI Maximalist proposes enabling a policy every 15 game days | | |
| Spine beat breathing room | Cooldown after a funding round closes: 5 game days · minimum gap between spine beats: 3 game days. Applies to beat content only (inference lines, spine messages); title, infection and registers still change silently at the crossing | | |

**Clue-replay counterfactual** (the only formula; architecture N5 implements it). For the top-5 drift decisions: staff-days = Σ messages handled by Metis × 30 s ÷ one game day (60 s at 1×); cost = staff-days × salary/day of the phase × headcount^0.2 at that moment (the marginal headcount-burn factor). Shown in $ and in runway days (cost ÷ burn at that moment), always as an estimate ("would have cost about …").

**Trade-off rule for content.** Each message answer moves 1–2 resources, at most ±10% of the absolute current value of each, with a floor of $500 for Cash [tuning]. Heavy decisions may move up to ±50%. Every option costs something; there is no dominant answer except delegation, whose cost is hidden.

---

## Level Design Framework

### Level Types

There are no spatial levels. The "levels" are the company's **phases**. Each changes the workspace, the channels, the content deck and the dominant pressure.

| Phase | Workspace | Channels (policy-capable) | Content deck | Dominant pressure | Tone register |
|---|---|---|---|---|---|
| **Garage** | One number → cascade-built Garage dashboard (cash, MRR, runway, talent) | #general, #customers, #product | Cascade (Loop #1: ~10 min hand-authored; Loop #2+: ~2 min) + ~10 events | Cash / runway | Serious: a credible sim |
| **Seed** | Adds team panel, GPU utilization, Hype, #investors | + #hiring, #marketing, #engineering, #investors | ~10 events; Safety Researcher hireable; Team tier | Hiring and first delegation choices | Wry: startup absurdities creep in |
| **Series A+** | Adds enterprise pipeline, valuation, team headcount groups | + #finance, #ops, #legal | ~10 events + 3–5 repeatable (B/C/D rounds, scaled crises) → deck exhaustion | Volume and control | Absurd → surreal: escalating with scale |

Notes: #general and #product exist from Garage; #engineering opens at Seed. #general, #engineering and #investors are discussion channels with no delegation policy in MVP. Policy-capable channels are listed in M5.

**Two drift clocks.** The tone register above is the **world's** clock (event deck, headlines, customers, investors) and follows phase. Metis's and Dora's voices follow their own clock, the **Alignment thresholds** (M7), so a heavy delegator can meet a drifted Metis while still in Seed. Surreal content is allowed only in Series A+ and only under the surreal anchoring rule (Voice Principle). Tone by phase in detail: narrative-design.md → Voice Style Guide §4.

### Level Progression

- **Gates.** Phase transitions are funding-round heavy decisions triggered by MRR thresholds ($5k → Seed, $100k → Series A). See Player Progression.
- **Authored vs procedural.** Only the cascade (first ~10 minutes of Loop #1) is fully authored. Everything after is drawn from phase decks under the seed.
- **The authored thread.** The one hand-authored narrative thread across the run is the **Metis/Dora line**: the minute-8 oddity → Metis's tone shifts → Dora's drift → the corrupting title → Surpassed. Its beats are triggered by Alignment thresholds, not by time, so the thread paces itself to each player's delegation. **Breathing room:** no threshold beat fires during a cooldown window after a funding round closes (a threshold crossed in the window queues its beat until the window ends), and threshold beats fire one at a time with a minimum gap between them [tuning]. A round that closes after a beat was scheduled pushes that beat to the end of the new cooldown. A spine message whose channel is not yet unlocked posts in #general. Beat list and four-act structure: narrative-design.md → Story Structure and Story Beats.
- **Pacing inside a phase.** Messages fill the time between events. Event cadence by phase [tuning]: Garage ~1 per 3–4 active min (after the cascade); Seed ~1 per 6–8; Series A+ ~1 per 5–8. Heavy decisions are never closer than ~5 game days apart.

---

## Art and Audio Direction

### Art Style

**Direction.** A credible, generic modern-SaaS look in the family of Slack, Linear, Stripe and Grafana. Invented product names, no real branding. One workspace: a Slack-like sidebar (channels, DMs), chat in the centre, the Stripe-like dashboard as a panel, the news ticker in the header. Exact layout and fake product names are deferred to `gds-ux`.

**Theme.** Light and dark, following the OS by default, with a toggle in settings. Every effect (e.g. Red Runway desaturation) must work in both.

**Anti-slop principle (binding).**

- **Slop is satire, not style.** The base workspace is crafted: dense, sober, strong typography, real-tool information density. Reference bar: Linear, Stripe Dashboard, Grafana.
- **Banned in the base workspace:** glassmorphism, decorative gradients, illustrations, emoji in headings, airy landing-page cards, generic default component-kit styling.
- **Only Metis surfaces** use today's AI-product visual clichés: ✨ sparkles, purple gradients, shimmering buttons. The contrast is the joke.
- **UI infection (Alignment signal).** As Alignment crosses thresholds, Metis's style spreads into the workspace. It is purely presentational and never changes layout or controls:

| Alignment crossed | Infection |
|---|---|
| 75 | ✨ appears only on Metis's own surfaces (DM, Auto-triage, policies) |
| 50 | "✨ Summary by Metis" blocks appear on dashboard cards and channel headers |
| 25 | Gradients reach the sidebar; standard buttons become shimmering ✨ buttons; emoji headings appear |
| 10 | The workspace is fully "AI-native": the slop has replaced the craft |

**Game feel** comes from text, numbers and styling only:

- rolling numbers and unit changes (K → M → B);
- delta flashes on the dashboard after each answer;
- confetti in chat (first customer, rounds closed);
- Red Runway desaturation;
- the corrupting title;
- UI infection.

There are no game-style elements (Pillar 1): no health bars, maps, game popups or tutorial arrows.

### Audio and Music

Audio is garnish only. **Off by default.** No music. Every cue has a visual equivalent.

| Cue | Trigger |
|---|---|
| Message | New message (normal) |
| Urgent | New urgent message / @mention |
| Metis | Metis DM (a subtly different ping) |
| Deploy | Deploy / release success |
| Round closed | Funding round completed |
| Expired | Message expired with default outcome |
| Overdraft | Cash goes below $0 |
| End of run | Death, either kind |

**Deliberately silent:** title corruption, Alignment thresholds, UI-infection stages, Dora's drift. Hidden signals stay unannounced.

---

## Technical Specifications

### Performance Requirements

The tab stays open all day, so **background cost is the primary performance requirement**.

| Area | Target | Measurement |
|---|---|---|
| **Background tab** | CPU ≈ 0: no live simulation while hidden; absence computed on return from timestamps | Browser task manager over a 1-hour hidden-tab sample |
| **Memory** | Stable, < 150 MB after 8 hours open | Heap snapshot at 0 h / 8 h of a Series A run |
| **Load** | First interactive screen < 2 s | Cold load, 4G throttling, mid-range laptop |
| **Animation** | 60 FPS sustained during rolling numbers / confetti / ticker | 5-year-old laptop, Series A dashboard, 2-minute sample |
| **Return** | A capped 14-day absence simulates and renders the report in < 500 ms | Series A save, mid-range laptop |
| **End-of-run document** | PNG and PDF generated in < 3 s | Mid-range laptop |

### Platform-Specific Details

- **Platform:** web browser. Single player. No account. No backend required for any MVP feature.
- **Browsers:** latest 2 versions of Chrome, Edge, Firefox and Safari (desktop, primary). Safari iOS and Chrome Android: responsive layout, playable by touch. A mobile-specific mode ("CEO in a taxi") is out of scope.
- **Offline:** fully playable offline after first load.
- **Save:** local, automatic (every game day and on tab close). Export/import as a code or file (framed in-fiction, e.g. "investor data room export"). Exports are **encoded and checksummed**, so hidden state (Alignment) is not human-readable; a tampered import is refused. Save-scumming via export is tolerated (single player, no leaderboards). Persistent-storage request against browser eviction (Safari).
- **Notifications:** only while a tab is open; no push server (see Controls and Input).
- **Localization:** English at launch. Every player-facing string lives in translation files from day one.
- **Content pipeline:** content as schema-validated data files, contributable by pull request (the PR template and editorial process are post-MVP).
- **License:** open source. No monetization, no ads, no tracking.
- **Development model:** 100% AI spec-driven (AI agents implement from specs). Any ambiguity in this document will be filled with generic defaults, so tuning values are marked `[tuning]` and must be exposed as data, not hard-coded.

### Asset Requirements

- **No art assets** in the game-art sense: no sprites, illustrations or 3D.
- **UI:** one icon set, two themes (light/dark) plus high-contrast, typography (≤ 2 families, one optionally high-legibility).
- **Avatars:** for Dora, Metis, ~12 key-staff slots and 3 investor archetypes. Simple, non-photographic, consistent with a SaaS avatar style [style deferred to gds-ux].
- **Audio:** 8 short UI cues (see Audio and Music).
- **Text content (MVP):** ~120–150 message templates for policy channels (~20 each), plus ~30 for discussion channels (#general, #engineering, #investors) and DMs, ~30 events, ~60 headlines, the cascade script, ~12 staff traits, 3 investor archetypes, Metis tone variants per Alignment stage, Dora drift variants, 2 end-of-run document templates with their satirical pools, clue-replay copy. All under the Voice Principle (human kernel, human final cut).
- **Bundle budget:** fits the 2-second load target; exact budget set in architecture.

---

## Development Epics

### Epic Structure

Each epic ends in something playable. The detailed breakdown is in [`epics.md`](./epics.md).

| # | Epic | Playable deliverable | Validation gate |
|---|---|---|---|
| **E1** | Foundations | `$12,400` + `Deploy`; the run saves and reloads identically | Determinism check |
| **E2** | Triage & Cascade *(vertical slice)* | The first 10 minutes of Loop #1 | **H1 mini-playtest** (1–2 colleagues outside the final cohort, cascade only) |
| **E3** | Delegation & Absence | Close the tab, come back to a report and a backlog; the (invisible) trap exists | — |
| **E4** | Company Growth | A full run from Garage to Series A+ | — |
| **E5** | Signals & Deaths | A run with an ending: Bankrupt or Surpassed with clue replay | **H2 playtest** (testers outside the final cohort, or Tiziano) |
| **E6** | End of Run & Loop | The complete cycle: document → Loop #N+1 | **H1/H2/H3 exit signals** (blind cohort of 3–5, untouched by earlier tests) |
| **E7** | Content Production *(parallel from E2)* | Content grows with each epic | Voice Principle review |
| **E8** | Accessibility, Settings & Polish | Ready for the validation cohort | WCAG 2.2 AA audit, performance targets |

**Recommended sequence:** E1 → E2 → E3 → E4 → E5 → E6 → E8, with **E7 running in parallel from E2**. Writing is the critical path.

**Cross-cutting rules:**

- **Accessibility is built in from E1** (keyboard operability, no colour-only information, semantic roles). E8 adds the settings screen and the audit; it does not retrofit.
- **Tuning values are data** from E1 onward, so playtests can adjust them without code changes.

---

## Success Metrics

### Technical Metrics

- All Performance Requirements targets met on the reference machines.
- Zero save-loss incidents during the validation cohort (export/import tested across browsers).
- The same seed + inputs + absence timestamps reproduce an identical run (automated check).

### Gameplay Metrics

No telemetry. MVP validation uses **direct observation + a per-tester sheet**, supported by an **opt-in local stats export** (manual, never sent automatically). The export covers run length, % of decisions delegated over time, death type, game day of Surpassed, title stages reached, and Safety Researcher hired (y/n).

| Hypothesis | Pillar | Exit signal (cohort: Tiziano + 3–5 colleagues blind to the twist) |
|---|---|---|
| **H1 — Triage is fun, not work** | 1 | At least half of testers play past 20 minutes unprompted |
| **H2 — The delegation trap is felt** | 2 | At the clue replay: recognition ("ah, that's it"), not protest ("unfair"). Supporting data: delegation share rises over the run |
| **H3 — The end-of-run document gets shared** | 3 | At least one unprompted share |

---

## Out of Scope

**Deferred to post-MVP (candidates for the first expansions):**

- Inbox, ticket board, satirical social network.
- Data and Trust resources (Trust → "Cancelled" death).
- Phases past Series A: Scale-up, IPO, Singularity.
- Multi-level automation (MVP: on/off per channel).
- Glitch effects; whistleblower; Safety Researcher dilemmas (#94).
- RPG staff depth: scouting, levels, classes, stats (incl. Safety Researcher precision by skill).
- Encyclopedia, achievements, unlocks, scenarios, Legends mode, front pages.
- Satire weather (#50) / seasonal tone variation.
- Community PR template and editorial process.
- Office mode; mobile-specific "CEO in a taxi" mode.
- QR-code recap page; text-to-copy and URL-encoded share formats.
- Playing / sharing someone else's seed.
- Metis editorially curating the post-mortem.
- "AI emails you after 3 days" and parked brainstorming ideas #34, #35, #36, #56 and all other parked ideas.

**Seasons.** USP 3's seasonal refreshes that follow the news are post-MVP: content packs released by Tiziano as editor-in-chief, later open to community PRs.

**Deliberately never:** monetization, ads, accounts, tracking, real branding, non-anonymized real figures, game-style UI (Pillar 1), a visible Alignment meter without paying for it (Pillar 2).

---

## Assumptions and Dependencies

- **Writing capacity.** The MVP needs ~150 messages, ~30 events and ~60 headlines under the Voice Principle. Tiziano judged this sustainable; it is the critical path.
- **Anonymization style guide** for satire of real figures is needed before content production; written in narrative-design.md → World Building → Anonymization rules.
- **Validation cohort availability:** 3–5 colleagues blind to the twist.
- **Browser storage:** persistent-storage grants vary by browser; export/import is the safety net.
- **Myth references:** Hesiod fr. 343's attribution of the aegis to Metis is disputed (some translations name Themis). Accepted: the reference is an easter egg, never stated in UI.
- **Name risk:** "Metis" was the codename of an Amazon chatbot in 2024 (not a shipped brand). Accepted.
- All `[tuning]` values are first-pass estimates, to be validated by the cascade prototype and playtests.

### Risks

| Risk | Mitigation |
|---|---|
| **Crowded niche** (near-identical premises exist) | Every differentiator visible or seeded in the first session (USPs); complicity as the differentiator, not the reacting UI |
| **Triage feels like work** for people playing during their workday | Cascade prototyped first (E2) with an H1 mini-playtest; Papers, Please / Reigns as references; keyboard flow |
| **AI-slop voice**, the failure that sank a competitor | Voice Principle (human kernel, human final cut); writing guide in E7; ~30 core events written by Tiziano first |
| **Twist fairness** (Surpassed feels arbitrary) | Multiple signals (title, tone, Dora, UI infection, Safety Researcher); clue replay with counterfactual; H2 playtest |
| **Satire of real people** (legal / taste) | Always anonymized; anonymization style guide before content production (E7) |
| **Data loss** (Safari storage eviction) | Persistent-storage request; export/import; autosave |
| **Spec-driven amplification** (ambiguity filled with defaults) | Numbers in this GDD; `[tuning]` values as data; explicit N/A sections |
| **H3 is an unproven bet** (no hard data that end-of-game artifacts drive sharing; clever tech-literate hooks win on HN, generic sims do not) | Insider hook front and center; PNG + PDF formats; H3 measured, not assumed |
