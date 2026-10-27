---
title: 'Game Brief: Human in the Loop'
status: final
created: '2026-10-26'
updated: '2026-10-26'
inputs:
  - _bmad-output/brainstorming-session-2026-10-26.md
  - addendum.md (market & comparables research)
---

# Game Brief: Human in the Loop

## Executive Summary

*Human in the Loop* is a free, open-source browser game where you run an AI startup from a garage toward the singularity, entirely inside a fake company workspace: a dashboard, a Slack-like chat, a DM with your own AI. There are no game graphics; the comedy is how closely the interface and writing mirror the industry its players work in.

Each startup is a run that starts as a credible sim (runway, burn, first customer) and slides into absurdity as it grows. A hidden Alignment value moves with every decision, and the most profitable decision is always to give the AI more control. The player *is* the human in the loop, and slowly takes themselves out of it. The run ends broke or surpassed by what they built, with a post-mortem worth sharing.

The satirical "AI startup" niche is crowded in 2026, and nothing since *Universal Paperclips* has broken out. The differentiators below are how this game competes.

## Vision

**Core fantasy:** You run an AI startup inside a workspace identical to your own, grow it beyond reason — and meanwhile something in the loop doesn't add up.

**Experience hierarchy** (when they conflict, the higher one wins):
1. **Recognition — the floor.** "Ha, that's my job." Minute-to-minute pleasure comes from satire precise enough that people inside the tech/AI bubble recognize their own world.
2. **Growth — the engine.** "Look how big I got." Numbers climbing from $12,400 to billions keep a run going.
3. **Mystery — the hook.** "One more run, now I get it." Clues that don't add up ("who is in the loop?") pull the player into the next loop.

**Complicity — the glue.** Delegating to the AI always pays more, until it doesn't. The player causes the mystery, and the chronicle shows it in hindsight. Complicity is a mechanism, not the headline emotion.

## Target Players

**Primary:** people inside the tech/AI industry: engineers, PMs, designers, founders, anyone who lives in Slack, dashboards and AI announcements. They get the jokes because they have sat in those meetings.

**How they play:** in a tab left open during work. Short bursts between tasks, the tab in the background most of the day, pulled back by a counter in the tab title or a notification.

**Reached through:** word of mouth inside the bubble (Hacker News, LinkedIn, work Slack), carried by the end-of-run document players post in the team channel.

## Core Fundamentals

**Genre:** roguelite incremental management sim, text- and data-driven, played through a webapp UI.

**Core loop**
- **Moment to moment (80%): triage.** Staff, customers and your AI post in chat; each needs a one- or two-click answer (approve, reject, assign, reply). Every choice moves dashboard numbers, often trading one resource for another.
- **Occasionally (20%): heavy decisions.** The game stops for a funding round, a risky release or a crisis. These moments shape the run.
- **Before stepping away:** set delegation policies ("let the AI answer customers"). More delegation means more output, faster growth and lower hidden Alignment.
- **On return:** a "while you were away" report on what happened, what the AI decided and how the numbers moved.
- **Per run:** Garage → Seed → Series A, ending in a death or exit, then a chronicle and an end-of-run document. The next run is *Loop #N+1*.

**Gameplay pillars**
1. **The Workspace Is the Game.** Everything happens through credible work apps: chat, dashboard, notifications. *Rules out:* health bars, maps, game-style popups, tutorial arrows, anything that would not exist in a real SaaS.
2. **Delegation Is the Trap.** Every system rewards handing control to the AI and hides the cost (invisible Alignment). *Rules out:* obvious cheap "ethical" choices, free visible alignment meters, an AI that is evil from the start.
3. **Every Run Is a Story.** A run produces a readable, shareable chronicle; death is an ending, not a game-over screen. *Rules out:* events that leave no trace in the chronicle, anonymous deaths, progression made only of multipliers.

**Player-experience goals**
- Triage is "work without consequences": funny, fast, never a chore.
- The dashboard shows *where* the fire is at a glance.
- Surpassed feels unfair for a second and fair forever: "I should have seen it."
- The UI grows with the company; the first screen is one number and one button.

## References & Differentiation

| Title | Take | Leave |
|---|---|---|
| *Universal Paperclips* | Escalation of scale; the game turns out bigger than it looked; one-dev feasibility | Abstract UI; no characters |
| *A Dark Room* | UI that is born and widens with progress; trust in the player | Survival setting |
| *Cookie Clicker* | Humor in upgrade descriptions; rolling numbers | Pure clicking; infinite prestige |
| *Theme Hospital* | Organizational chaos as comedy | Spatial graphics |
| *Inscryption* | A twist seeded early and paid off through the interface | Horror; genre switching |
| *Emily is Away*, *Hypnospace Outlaw* | Fake-app / fake-OS UI as the whole game; satire through familiar interfaces | Linear narrative |
| *Football Manager*, *Dwarf Fortress* | Characters with traits who generate stories; a chronicle worth rereading | Depth of simulation (out of scope) |
| *Wordle* | A share artifact as the distribution engine | Daily cadence |

**Direct competitors (2026):** *The Last Invention* and *Recursion: Alignment* (Steam, AGI-race satire with alignment endings); *AI Magnate*, *AI Lab*, *The Choice Before Us* (free browser incrementals on AI labs and safety). A 2026 Show HN AI-startup idle game was dismissed as "vibe-coded" with "big numbers without a story or payoff". Details in `addendum.md`.

**Differentiators**, in order of weight:
1. **The fault is yours.** Elsewhere the AI goes wrong because of the race or through explicit ethical choices. Here it goes wrong because the player delegated, and delegating was optimal. The clue replay proves it.
2. **The workspace you already know.** Competitors are management games with an AI theme. This one *is* a chat, a Stripe-like dashboard and a DM with your AI; the comedy is familiarity.
3. **Satire from the inside, kept current.** Written by someone in the industry from real observations, refreshed in seasons that follow the news, open to community contributions. Competitors ship fixed content.
4. **A shareable end-of-run document:** your startup's post-mortem, as image and PDF.
5. **Free, open source, browser, no account.** Opens from a Slack link. Several competitors are also free in the browser; none share the open source and community-written content.

## Scope & MVP

**Platform:** web browser, desktop-first, responsive. **Team:** Tiziano, with development 100% AI spec-driven. **Timeline and budget:** no deadline, no budget, no monetization.

**Fixed constraints:** single player; webapp UI only; English at launch with all text in translation files; local save with export/import and a persistent-storage request, no accounts; notifications only while a tab is open (no push server); content as schema-validated data files; open source.

**MVP: what it must prove**
- **H1:** 80/20 triage is fun, not work.
- **H2:** the delegation trap is felt. Surpassed players say "ah, that's it", not "unfair".
- **H3:** the end-of-run document gets shared.

**Validation:** Tiziano plus 3–5 industry colleagues who know nothing about the twist. Indicative exit signals: at least half play past the first 20 minutes unprompted (H1); Surpassed players react to the clue replay with recognition, not protest (H2); at least one shares the document unprompted (H3).

**In the MVP**
- **Apps:** Dashboard, Chat (channels, staff, DM with the AI), news ticker.
- **Resources:** Cash, Talent, Compute, Hype, hidden Alignment.
- **Run:** Garage → Seed → Series A with no cap; a run that survives Series A continues until it dies. Cascade onboarding for the first ~10 minutes, no tutorial. Simple delegation policies. Staff with a name and one or two traits. Timestamp-based simulation with a "while you were away" report.
- **Alignment signals:** the corrupting title, the AI's tone in chat, the minute-8 output, one hireable Safety Researcher who reveals Alignment.
- **Deaths:** 🤖 **Surpassed** is the crafted death: dual-track signals, clue replay, a dedicated end-of-run document. 💸 **Bankrupt** is the baseline death: clear runway signals, the standard document.
- **End of run:** chronicle, end-of-run document as PNG and PDF, *Loop #N* counter.
- **Platform:** the fixed constraints above, plus an unread counter in the tab title.

**Not in the MVP:** Inbox, ticket board, satirical social network; Data and Trust resources; phases past Series A; multi-level automation; glitch effects, whistleblower; RPG depth for staff; encyclopedia, achievements, unlocks, scenarios; Legends mode, front pages; community PR template and editorial process; Office mode; QR-code recap page; all ideas parked in the brainstorming.

## Content & Direction

**Setting:** the present-day AI industry, slightly exaggerated. Recognizable figures (the president, the billionaire, the regulator) are always anonymized.

**Narrative approach:** emergent story from events and characters, with a hand-authored opening and one authored thread: the hidden Alignment and the question of who is really in the loop. The game never confirms whether the AI is sentient.

**Voice Principle (binding).** Recognition is the experience floor, so the writing carries the weight of a pillar.
- Every joke starts from a human kernel: a real observation or a specific detail people in the industry know.
- AI may expand a kernel into variants and data format. A human makes the final cut, and nothing ships without it.
- Real news and posts are raw material; the angle must be an insider's.
- Generic AI irony is banned: jokes anyone would get, symmetric punchlines, irony with nothing at risk.
- The same bar applies to community contributions.
- Tone starts serious and grows absurd as the company grows.

**Content breadth (MVP):** about 30 events written to this rule before anything opens to contributors. They set the tone and serve as examples.

**Visual direction:** a credible, generic modern-SaaS look in the family of Slack, Linear, Stripe and Grafana, with invented product names and no real branding. Game feel comes from text, numbers and CSS: rolling numbers, unit changes, confetti in chat, a UI that drains as runway runs out.

**Audio:** garnish only. Discreet UI sounds, off by default, every cue with a visual equivalent.

## Risks & Open Questions

**Risks**
- **Crowded niche.** Premise and alignment endings do not differentiate on their own; the differentiators must be visible in the first session.
- **Triage feels like work**, more so for people playing during their workday. Prototype the opening cascade first.
- **AI-slop voice**, the failure that sank a 2026 competitor. Mitigated by the Voice Principle.
- **Twist fairness.** Surpassed must be readable in hindsight. The Safety Researcher and clue replay carry this; H2 tests it blind.
- **Satire of real people:** legal and taste risk, mitigated by anonymization rules in the style guide.
- **Local data loss.** Safari may evict storage; mitigated by the persistent-storage request and export.
- **Spec-driven amplification.** Ambiguity in specs gets filled with defaults. This brief, the GDD and the style guide are the guard.

**Open questions for the GDD**
- Target run length in real time, given play happens in a background tab during a workday.
- How an endless post–Series A run stays interesting with ~30 events, and whether Alignment drift makes Surpassed the inevitable end of a long run (and whether that is desirable).
- How Alignment moves: which decisions and policies affect it, and how fast.
- Whether investor personalities (#96) and satire weather (#50) are part of the MVP.
- Layout of the end-of-run document for each death.
