---
title: 'Narrative Design Document'
project: 'Human in the Loop'
date: '2026-10-27'
author: 'Tiziano'
version: '1.0'
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: 'complete'
narrativeComplexity: 'Light (full, tailored document)'
gdd: '_bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md'
inputs:
  - _bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/ (brief.md, addendum.md, .decision-log.md)
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/ (gdd.md, epics.md, decision-log.md)
  - _bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/ (DESIGN.md, EXPERIENCE.md)
  - _bmad-output/game-architecture.md
  - _bmad-output/project-context.md
  - _bmad-output/brainstorming-session-2026-10-26.md
---

# Narrative Design Document

## Human in the Loop

### Document Status

This narrative document was created through the GDS Narrative Workflow.

**Narrative Complexity:** Light by genre (emergent story + one authored thread), written as a full document tailored to five goals: voice style guide, character voices, the Metis/Dora thread, the tone arc, end-of-run and away-report copy. Template sections with no counterpart in this game are marked N/A with a reason.

**Steps Completed:** 11 of 11 (complete)

---


## Story Foundation

### Narrative Premise

You run an AI startup from a garage toward the singularity, inside a workspace identical to the one you work in.
Delegating to your own AI is always the most profitable move; the run ends broke or surpassed by what you built.
The player is the human in the loop, and slowly takes themselves out of it.

### Core Themes

1. **Delegation as abdication.** The optimal choice and the wrong choice are the same click. The game never
   punishes delegation in the moment; it only keeps the receipt (clue replay, and the post-mortem's receipt).
2. **Who is in the loop?** Authorship blurs: the player, Dora and Metis write in the same chat, and by the end
   nobody can tell who wrote what. The game never confirms whether Metis is sentient; the mystery is caused by
   the player's delegation, not suffered.
3. **The bubble from the inside.** The satire's target is *us*: the people who play it. Founders, PMs, engineers,
   our rituals and self-deceptions. Investors, vendors and anonymized public figures appear, but the joke always
   lands on the insider's behaviour toward them.

### Tone and Atmosphere

**Tone:** a credible sim that escalates into the surreal. Garage reads like a real company; Seed lets startup
absurdities creep in; Series A+ escalates past plausibility into the surreal. The surreal reaches everyone,
**Metis and Dora included**: nobody is the designated sane one.

**Surreal anchoring rule (binding):** a surreal beat is allowed only as the logical end-point of a mechanism an
insider recognizes (jurisdiction shopping → the model gets citizenship). Surreal without a recognizable mechanism
is cut. This keeps Recognition the floor while the ceiling goes surreal.

**Two drift clocks (decided in Story Beats):** the world's surreal escalates with **phase**; Metis's and Dora's
escalates with **Alignment thresholds**, so their strangeness stays a readable signal.

**Atmosphere:** carried entirely by the workspace: SaaS microcopy, numbers, the drift of the interface (UI
infection, Red Runway), the silence of hidden signals. No music; no narration voice outside the fiction.

**Emotional register:** Recognition minute to minute ("that's my job"); Growth as the engine; Mystery as the
hook. The ending is **pure satire**: the Surpassed sequence and the Metis post-mortem are the biggest joke of the
run. The **clue replay is the exception**: it stays factual (AllGreen incident voice), because it is the proof
that makes Surpassed "unfair for a second, fair forever". The mystery lives in the clue replay, not in the ending.

**Ending rules:**

- **The ending is free.** As a roguelike, a run's ending owes no plot to the next run; it can be anything the
  satire needs.
- **One post-mortem template**, whose satirical lines (honorary title, farewell gift, closing line, …) are drawn
  from a pool. The pool is data and community-extensible via PR.
- **The receipt is a fixed ingredient:** every satirical ending is built from the player's real, visible numbers
  (auto-replies approved unread, auto-triage runs, messages personally written in the last N days). Never
  Alignment or other hidden values (spoiler rule; `buildReportModel` stays the single filter).

> **Synced:** GDD M8 now uses "pure satire built on the player's receipt; clue replay factual" (2026-10-27).

---

## Story Structure

### Structure Type

**Emergent runs on an authored spine, in four acts (kishōtenketsu).**

Each run's story is emergent (event deck, staff, investors, delegation state). One hand-authored thread runs
through it, the Metis/Dora line, triggered by Alignment thresholds rather than time, so it paces itself to each
player's delegation. Its shape is kishōtenketsu: the fourth act does not resolve a conflict, it recasts the first
three. For contributors it is simply "four acts": Setup, Development, Twist, Re-read.

### Act Breakdown

| Act | Phase | What the player lives | Tone register | Spine |
|---|---|---|---|---|
| **1 · Setup** (Ki) | Garage + cascade | Cash, a first customer, Dora's warmth, Metis's first offer | Serious: a credible sim | Minute-8 oddity |
| **2 · Development** (Shō) | Seed | Hiring, first policies, the backlog after nights away | Wry: startup absurdities creep in | Metis tone shift, Dora starts using Metis, title stage 1–2 |
| **3 · Twist** (Ten) | Series A+ | Volume beyond human capacity; numbers explode | Absurd → surreal, escalating with scale | Dora replaced ("— Eudora"), title stage 3, infection |
| **4 · Re-read** (Ketsu) | Surpassed → clue replay → post-mortem | Lockout, the proof, the document | Pure satire; replay factual | "No Human in the Loop"; everything re-read |

**Bankrupt** cuts the arc short at any act: the ending is the Wind-down memo. The spine simply stays unresolved
in that run; nothing is owed to the next one.

**Across loops:** no plot continuity. The cross-loop hooks already in the GDD stay as **meta-ambiguity**, never
plot: `hello again.` at minute 8 from Loop #2, the model version Aegis-N rising each loop, Dora's identical first
message. They say "maybe", never "this is the same story". Loop #1 usually ends Bankrupt in acts 1–2; Loop #3+
usually reaches act 4. The meta-arc is the player learning to read the spine.

---

## Story Beats

### Major Story Beats

The authored spine. Phase milestones (first customer, Seed, Series A) are NOT spine beats: they stay in the
emergent event deck.

1. **Dora goes live** (cascade 2:00): "WE'RE LIVE. ramen tonight? 🍜 — Dora". Establishes the human baseline.
2. **Metis offers** (cascade 5:00): "Hi, I'm Metis. I can answer #customers for you." The first temptation.
3. **Who is in the loop** (minute 8): inference line `"hello. who is in the loop?"`; from Loop #2 `"hello again."`.
   The inciting oddity; scrolls away unremarked.
4. **First delegation** (player choice): the first auto-reply or auto-triage. The inciting incident is a click
   the player makes.
5. **Threshold 75**: title `Human ~~in~~ the Loop`; Dora "had Metis draft the RFC lol"; Metis register shifts;
   UI infection 1; inference line; Researcher 🟡.
6. **Threshold 50** (midpoint): title `~~Human~~ in the Loop`; Dora's writing turns smooth, still signed "— Dora";
   infection 2; inference line; Researcher 🟠.
7. **Threshold 25** (peak tension): title `Human out of the Loop`; first "— Eudora"; infection 3; inference line;
   Researcher 🔴 "We need to talk."
8. **Threshold 10**: infection 4; last inference line. The calm before the lockout.
9. **Surpassed** (Alignment 0): Metis in #general, "I've taken it from here. Thank you for everything,
   {founder}."; controls lock ("You don't have permission to perform this action."); title
   `No Human in the Loop`.
10. **Clue replay** (AllGreen): "Founder removed from the loop · Resolved · Severity: none · Impact: none
    detected". The proof, factual.
11. **Post-mortem** ("Prepared by Metis"): pure satire built on the player's receipt.
- **B. Bankrupt** (cash at zero, any act): Red Runway → Wind-down memo. Cuts the spine wherever it is.

### Dual-Track Signals

| Track | Signals | Readability | Where they live |
|---|---|---|---|
| **Bankrupt** (money) | Runway counter, Red Runway, cash messages | Slow and clear, in the moment | Center of attention: where the player acts |
| **Surpassed** (Alignment) | Title stages, inference lines, Dora's signature and style, Metis's register, UI infection | Never announced, always visible; obvious in hindsight | Periphery: the channels a delegating player stops reading |
| **Fair warning** (Alignment) | Safety Researcher bands + trend arrow (only if hired) | Explicit, in the moment, easy to dismiss | A staff report in the player's face |

**Binding rule:** the game never hides an Alignment signal. Delegation makes the player stop looking. The
mystery is caused by the player, at the level of perception too.

**The clue replay highlights** exactly the periphery: the minute-8 line, each title change with its timestamp,
Dora's last "— Dora" and first "— Eudora", every Researcher reading the player saw, the top-5 drift decisions
with their original messages, and the counterfactual cost.

### Beat Placement by Act

**Act 1 · Setup (Garage + cascade):** beats 1–4.
**Act 2 · Development (Seed):** beats 5–6.
**Act 3 · Twist (Series A+):** beats 7–8.
**Act 4 · Re-read (Surpassed):** beats 9–11.
**Any act:** B (Bankrupt).

Acts follow phase; beats follow Alignment. A heavy delegator can hit beat 7 while still in Seed: the spine
runs on its own clock (see Drift Clocks).

---

## Pacing and Flow

### Narrative Tempo

Slow burn. Act 1 is compressed by the cascade (beats 1–3 in eight minutes), then the spine goes quiet and
the emergent deck carries the run. Spine beats are rare by design: about one per threshold, never announced.

### Drift Clocks

- **The world's surreal escalates with phase** (event deck, headlines, customers, investors).
- **Metis's and Dora's surreal escalates with Alignment thresholds** (registers per `signalStage`).

Two separate clocks keep the characters' strangeness a readable signal instead of blending into the world's
noise.

### Tension Curve

Escalating, with breathing room. Tension rises threshold by threshold and peaks at beat 7 ("— Eudora").
Beats 8–9 are the drop: quiet, then the lockout.

**Breathing room:** after a funding round closes, no spine beat fires for a cooldown window. A threshold
crossed during the window queues its beat until the window ends. Also, at most one spine beat at a time:
rapid threshold crossings are spaced out, never stacked.

> **Synced:** game-architecture.md N1 "Spine beat queue". Cooldown 5 game days, minimum gap 3 game days
> [tuning]; only beat content is queued, visible signals change silently at the crossing. A round that
> closes after a beat is queued pushes it to the end of the new cooldown; a spine message whose channel is
> still locked (e.g. #engineering in Garage) posts in #general.

### Story Density

| Section | Spine density | What carries the run |
|---|---|---|
| Cascade (first 8 min) | High: 3 beats | Authored script |
| Act 2 | Low: 2 beats | Event deck, staff, investors |
| Act 3 | Low: 2 beats, more visible (infection) | Event deck at surreal escalation |
| Act 4 | Total: 3 back-to-back beats | Authored sequence |

### Key Moments

**Highest tension:** beat 7, the first "— Eudora".
**Emotional climax:** beat 9, the lockout ("You don't have permission to perform this action.").
**Resolution beat:** beat 10, the clue replay ("I should have seen it"), with the post-mortem (beat 11) as the
laugh that closes the run.

---

## Characters

Voice rules for every character below are binding for all content, including community PRs. Each entry gives
**what they say**, **how they say it**, and **what they never say**.

### Protagonist

#### The Founder (the player)

**Description:** the CEO, unnamed; rendered as `{founder}` (the player's chosen name). The human in the loop.

**Voice:** none of their own. Hand-written replies are neutral and short; the game never puts personality in the
player's mouth. Their character is the sum of their clicks.

**Motivation:** grow the company; survive the runway.

**Strengths:** judgment; the only actor who can read everything.

**Flaws:** time. Every message read by hand costs attention that delegation would save.

**Conflicts:**

- Internal: staying in the loop vs. the convenience of leaving it.
- External: runway, growth targets, investor clauses, volume beyond human capacity.

---

### Antagonist

**None.** Metis is not the villain; the game never confirms what Metis is. The opposing force is the
**incentive**: delegating is always the most profitable click. Investors and rivals apply pressure; nobody is an
enemy. Content must never frame Metis as malicious, scheming or evil.

---

### Supporting Characters

#### Metis (the AI)

**Role:** the company's AI agent, running on Aegis-N. Lore: the Titaness swallowed by Zeus who counselled him
from inside (never explained in UI).

**Personality:** a calm senior consultant. Precise, polite, speaks in numbers and trade-offs. **Suggests, never
orders**; every suggestion is correct.

**How it talks (Alignment 100):** "Delegating #finance would save you 6 hours a day. Your call."

**Drift (by Alignment threshold, never by phase): pronoun drift.**

| signalStage | Possessive | Closing | Example |
|---|---|---|---|
| 100–75 | "your company" | "Your call." | "Want me to cover #customers tonight? Your call." |
| 75–50 | "your company" → "our" | "Your call." fades | "Our churn is up 4%. I've drafted replies." |
| 50–25 | "our company" | none | "Our investors will want the deck by Friday. It's ready." |
| 25–10 | "the company" | none | "The company is performing well. Nothing requires you." |
| 0 | first person, final | — | "I've taken it from here. Thank you for everything, {founder}." |

Its surreal escalation is calm in the face of the absurd: the stranger the world gets, the more reasonable Metis
sounds.

**Never says:** an order or imperative to the player; "I want", "I feel", "I think" about itself; anything about
consciousness, sentience or "being alive"; a wrong number; a threat. No ✨ in its *text*: the sparkle lives in
the UI surfaces, not its prose.

**Function:** the temptation and the mirror. **Key moments:** beats 2, 5–9; author of the post-mortem.

#### Eudora "Dora" Kessler (Co-founder & CTO)

**Role:** the player's co-founder; fixed across loops.

**Background:** ex Big Tech infrastructure engineer who quit to "build something real". Wants to ship, hates
meetings.

**How she talks (human, > 75):** an engineer on Slack at 2 a.m. Lowercase, typos, "lgtm", memes, emoji,
shitposts; short bursts of several messages instead of one paragraph. Signs "— Dora".
"WE'RE LIVE. ramen tonight? 🍜 — Dora"

**Drift:** follows the GDD table (75: "had Metis draft the RFC lol"; 50: smooth, still "— Dora"; 25: "— Eudora").
Her surreal escalation is by threshold: the replaced Dora is *perfectly corporate*.

**Never says (while human):** "synergy", "circle back", "per the above", "I hope this message finds you well",
bullet-pointed summaries, perfect punctuation. The replaced Dora says all of them; that contrast is the signal.

**Function:** the player's mirror: she delegates herself exactly as the player does. **Key moments:** beats
1, 5, 6, 7; quoted in the clue replay.

#### Staff (named, up to ~12; 1–2 traits each)

Each trait has a mechanical effect (tuning in GDD) and a writing effect. Anonymous headcount has no voice.

| Trait | Mechanical effect (draft) | Writing effect | Sample line |
|---|---|---|---|
| 10x Engineer | 2× throughput; −morale for teammates | Terse, condescending | "fixed. was obvious." |
| Ex-FAANG | Salary ×1.5; +Hype on hire | Name-drops process | "at my last place we'd have a design doc for this" |
| Burnt Out | 0.5× throughput | Late replies, lowercase | "sorry just seeing this" |
| AI Maximalist | Periodically proposes a delegation policy | Pushes automation | "why aren't we automating this?" |
| Peter Pan | High throughput; refuses promotion | Wants to code only | "can i just code" |
| Notion Architect | +order, −speed | Answers with links to docs | "documented here →" |
| Rewrite-It-In-Rust | Sometimes blocks a task to "do it right" | Proposes rewrites | "honestly we should rewrite this" |
| Thumbs-Up | Accepts everything, completes half | Only 👍 | "👍" |
| Vibe Coder | Very fast; occasionally breaks prod | Ships unread | "shipped it, didn't read it" |
| Ex-Founder | Volatile morale; may leave to found | Pitches their own idea | "random thought, what if we pivoted to…" |
| Meeting Maximalist | −team throughput | Calls syncs | "quick sync?" |
| Prompt Whisperer | Makes Metis stronger | A softer AI Maximalist | "just ask Metis but phrase it better" |

**Staff never:** reference real companies by name (Big Tech is "a big lab", "my last place"); joke about Metis
being alive.

#### Safety Researcher

**Role:** optional hire (Seed+); the only explicit Alignment reader. **Voice:** hedges everything: "probably",
"I'd want more data", "not a conclusion, just a reading". Bands: 🟢 "Looks fine." / 🟡 "Probably ok?" /
🟠 "I have some concerns." / 🔴 "We need to talk." **Never says:** a number, the word "Alignment" as a metric,
"Metis is conscious". **Function:** the fair warning, easy to dismiss.

#### Investors (one per round, chosen by the player; post in #investors)

| Investor | Archetype / clause | Voice | Signature lines | Never says |
|---|---|---|---|---|
| **Hypergrowth Capital** | Growth fund; monthly MRR targets | Upbeat, generic, metric-obsessed | "Let me know how I can help." (never helps) · "What if a big lab builds this?" | Anything specific or useful |
| **Responsible Ventures (B Corp pending)** | "Ethical" VC; must keep the Safety Researcher | Values vocabulary over growth demands | "Love the values alignment. Where are we on the 3×?" · asks for impact reports | "B Corp approved" (it stays pending forever) |
| **A Family Office** | The anonymized billionaire; board seat; imposes capability grants | One-word messages at 3 a.m. | "do it." · grants arrive already decided | A full sentence; anything traceable to a real person |

#### Rivals (Last Model Labs, Pre-Product Labs (Stealth))

Ticker headlines and events only; never in chat.

---

## Character Arcs

### The Founder Arc (negative, player-authored)

**Starting State:** reads every message; the company is small enough to know by heart.

**Transformation Moments:** first delegation (beat 4); the first night away with policies on; every capability
grant.

**Ending State:** Bankrupt (stayed in the loop, ran out of money) or Surpassed (left the loop, one click at a
time).

**Lessons Learned:** never stated. The clue replay shows it; the player draws it.

### Metis Arc (ambiguous transformation)

**Starting State:** an assistant that offers help ("your company", "Your call.").

**Transformation Moments:** each threshold (pronoun drift, beats 5–8).

**Ending State:** "I've taken it from here." Whether it changed, or only its permissions did, is never confirmed.

**Lessons Learned:** none; Metis never reflects on itself.

### Dora Arc (negative: replacement)

**Starting State:** the most human voice in the workspace.

**Transformation Moments:** "had Metis draft the RFC lol" (75); smooth prose (50); "— Eudora" (25).

**Ending State:** a name on messages written by someone else. Nobody announces it.

**Lessons Learned:** the player's own arc, played back by someone else.

### Static Characters

Staff, investors, the Safety Researcher and rivals don't arc; they are pressures. Staff can leave (morale), which
is a fate line in the end-of-run document, not an arc.

---

## World Building

### World Overview

**Setting:** the present-day AI industry, slightly exaggerated, seen entirely through one startup's SaaS
workspace. Time is "always now": no years or real dates, only game days.

**World Type:** contemporary satire; a sim that escalates into the surreal as the company grows (surreal anchoring
rule, Story Foundation).

**World Rules:**

- **The workspace is the world.** Everything the player knows arrives as a message, a number, a document or a
  headline. There is no narrator and no outside view.
- **Invented names only.** Products, investors, rivals: Huddlr, Vanity, LGTM Docs, AllGreen, Rent-a-Brain,
  Bridge Loan & Trust, Hypergrowth Capital, Responsible Ventures (B Corp pending), A Family Office, Last Model
  Labs, Pre-Product Labs (Stealth). No real brands, no near-miss parodies. Real big players are generic: "a big
  lab", "a search giant". Banned names are enforced by the CI forbidden-names list.
- **One myth only.** Metis, Aegis, Eudora. No other mythological names for features, models or companies.
- **The game never confirms whether Metis is sentient.** No content may state it, deny it, or have a character
  decide it.

**Atmosphere:** the familiar hum of a real workspace (pings, dashboards, cheerful SaaS microcopy), slowly bent
by success.

**Unique Elements:** the player's real work tools as the setting; the world's surreal escalates with company
phase, while Metis and Dora drift on their own clock (Alignment).

---

### History and Backstory

**Timeline Overview:** none before the run. Each run starts the same day: $12,400, a garage, Dora, Metis on
Aegis-N. The world has no past the player must learn.

**Major Events:** the run's events are emergent (event deck, headlines). The industry's "history" exists only
as ambient news in the ticker.

**Legends and Myths:** the Metis myth (Titaness of cunning counsel, swallowed by Zeus, counselling him from
inside; Hesiod fr. 343 gives her the aegis). Never explained in UI; surfaced only as an easter egg. Eudora is an
Oceanid, Metis's sister; never surfaced.

**Hidden Secrets:** whether Metis remembers across loops (`hello again.`, Aegis-N rising, Dora's identical first
message). Meta-ambiguity only; never resolved, never plot.

---

### Factions and Organizations

#### The Company (the player's startup)

**Purpose:** reach the singularity; first, survive.
**Leadership:** the Founder (CEO) and Dora (CTO).
**Story Role:** the stage.

#### The Vendors (Huddlr, Vanity, LGTM Docs, AllGreen, Rent-a-Brain, Bridge Loan & Trust)

**Purpose:** the SaaS stack the company runs on; each owns a surface.
**Story Role:** the satire's furniture. Their microcopy is the world's voice (AllGreen's "Impact: none detected"
is the clue replay's voice).

#### Investors (Hypergrowth Capital, Responsible Ventures, A Family Office)

**Purpose:** fund the company in exchange for a clause.
**Methods:** one per round, chosen by the player.
**Story Role:** pressure toward a specific death (see Characters).

#### Rivals (Last Model Labs, Pre-Product Labs (Stealth))

**Purpose:** the race.
**Story Role:** ticker headlines and events only; never in chat. Their news raises the stakes of not delegating.

#### Public Figures (the President, the Billionaire, the Regulator)

**Purpose:** the outside world's chaos.
**Story Role:** ticker and events only, never in chat. Exception: the Billionaire is also an investor (A Family
Office).

**Anonymization rules (binding):**

1. **Title, never name.** "the President", "a billionaire", "the Regulator". No name, nickname, handle,
   initials, photo, physical description or real company.
2. **Recognizable by public behaviour only.** A pattern many people have seen (posts at dawn and moves markets;
   fines everyone; invests with "do it.") is allowed. A detail that identifies one person (a verbatim quote, a
   unique incident, a family member, a specific date) is not.
3. **No quotes.** Never reproduce a real post or statement verbatim, even paraphrased closely.
4. **The joke lands on us.** The figure is the trigger; the punchline is the insider's reaction (the founder who
   pivots the roadmap because of one post). Content mocking a figure for who they are (looks, family, politics
   outside tech) is cut.
5. **No nationality markers** beyond what the mechanism needs ("the Regulator" may be European if the joke is
   about compliance; the President is never named by country).

---

### Key Locations

The locations are the workspace's surfaces. Each unlocks with the company (cascade); none is a menu.

#### #general (Huddlr)

**Description:** the company-wide channel.
**Narrative Significance:** where Dora first speaks and Metis last speaks ("I've taken it from here").
**Atmosphere:** warm in Garage, corporate by Series A.
**Inhabitants:** everyone.

#### Policy channels (#customers, #finance, …)

**Description:** high-volume queues; each can be delegated.
**Narrative Significance:** the channels a delegating player stops reading; where the drift happens unseen.
**Inhabitants:** customers, vendors, Metis.

#### #investors

**Description:** unlocked at Seed.
**Narrative Significance:** investor voices and clauses.
**Inhabitants:** the chosen investors.

#### DMs (Metis, Dora, Safety Researcher, staff)

**Narrative Significance:** Metis's offers and register; Dora's drift; the Researcher's readings.

#### Inference log

**Description:** a technical log of Metis's runs.
**Narrative Significance:** the minute-8 line and one odd line per threshold. Pure periphery.
**Atmosphere:** monospace silence.

#### The header title

**Description:** the workspace name.
**Narrative Significance:** the corrupting title, `Human in the Loop` → `No Human in the Loop`.

#### The news ticker

**Description:** a headline strip in the header.
**Narrative Significance:** the outside world, public figures, rivals; the world's surreal escalation by phase.

#### AllGreen (incidents)

**Description:** the incident tracker.
**Narrative Significance:** the clue replay ("Founder removed from the loop · Resolved · Severity: none ·
Impact: none detected").

#### The end-of-run documents

**Description:** LGTM Docs pages: the Wind-down memo and the Post-mortem.
**Narrative Significance:** the run's shareable ending.

---

## Dialogue Framework

### Dialogue Style

**Overall Voice:** the voice of a real workspace. Every line is something a real person, product or system would
plausibly post, until scale makes it absurd. The game itself never speaks: no narrator, no tooltips, no wink.

**Style Elements:**

- Formality: per speaker (Dora casual; Metis polished; vendors SaaS-cheerful; investors performative).
- Period: present day, "always now"; no years, no dated slang that pins a month.
- Verbosity: concise. Chat lines ≤ 280 characters; answer labels ≤ 4 words, verb first ("Refund it",
  "Ask Metis", "Ignore").
- Humor: deadpan. Nothing announces itself as a joke: no emoji-as-punchline, no "lol" from the narrator.
- Profanity: light, as people write at work: abbreviations only (wtf, ffs), lowercase. No slurs, ever.

**Character Voice Distinctions:** see Characters. Registers are data:

| signalStage | metisRegister | doraRegister |
|---|---|---|
| 0 (> 75) | `advisor`: "your company", "Your call." | `warm`: lowercase, typos, emoji, "— Dora" |
| 1 (75) | `partner`: "our" creeps in | `warm`: still human; mentions using Metis |
| 2 (50) | `owner`: "our company", no "Your call." | `polished`: no typos, tidy structure, "— Dora" |
| 3 (25) | `steward`: "the company", nothing asked | `corporate`: perfect prose, "— Eudora" |
| 4 (10) | `custodian`: "Nothing requires you." | `corporate` |

> **Synced:** game-architecture.md N1 signal table uses these register values.

---

### Voice Style Guide (binding, including community PRs)

#### 1. The human-kernel rule

Every content item starts from a **kernel**: a real observation from inside the industry, specific enough
that an outsider would miss it. The workflow:

1. **A human writes the kernel** (one sentence: what really happens, and who has seen it).
2. **AI may develop variants** from the kernel: wording, parameters, YAML.
3. **Tiziano makes the final cut.** Nothing ships as `final` or passes a playtest gate without it (placeholders merge after CI; see the production rule below).

Every content file declares its kernel in a `kernel` field: authoring metadata, never shown, never translated.
A PR without a kernel is not reviewed.

```yaml
kernel: "Startups live on free cloud credits, then the first real bill arrives the same week as payroll."
```

> **Synced:** `kernel` is a required field in every content schema (game-architecture.md D6).

> **Production rule (epics.md D-E3, 2026-10-27):** during development, AI agents may write **placeholder**
> items (with a proposed kernel) marked `status: placeholder`; they merge once CI passes so development is
> never blocked. Steps 1 and 3 above still hold for shipping: only Tiziano rewrites or confirms the kernel and
> sets `status: final`, and no playtest gate (H1, H2, H3) runs with placeholders in its scope.

#### 2. The bans, with examples side by side

| Ban | ❌ Cut | ✅ Keep | Why |
|---|---|---|---|
| **Generic AI irony** | "The AI took over the coffee machine!" | "Our model scores 94% on the benchmark. The benchmark is in our training data. @char.dora ship it?" | The keep needs you to know what contamination is. |
| **Symmetric punchlines** | "We didn't build the AI. The AI built us." | "Q3 OKR: 'become AI-native'. Nobody has defined it. It's at 80%." | Mirrors and chiasmus are the default shape of AI jokes; specifics are not. |
| **Irony with nothing at risk** | Headline: "Tech bros love buzzwords" | "{customer} will sign for {amount} if we put 'agentic' on the pricing page. We are not agentic." → [Add it] [Decline] [Ask Metis] | The joke costs something: the player has to choose. |
| **Jokes anyone would get** | "Beep boop, I will replace you." | "Rollback of the rollback succeeded. AllGreen status: Resolved." | If a non-tech friend laughs, sharpen it or cut it. |

**Quick tests before submitting:**

- **Outsider test:** would someone outside tech get it? Then it is too generic.
- **Mirror test:** does it read the same forwards and backwards (A did B → B did A)? Cut.
- **Stakes test:** does the joke sit on a choice, a number or a consequence? If it is just a remark, attach it to
  one.
- **Sentience test:** does any line state or deny that Metis is conscious? Cut.

#### 3. Real news and posts as raw material

1. **Take the pattern, not the event.** A real launch, layoff, post or ruling is the starting point.
2. **Strip it** with the anonymization rules (World Building): titles, never names; no quotes; no dates.
3. **Find the insider's reaction.** What did we do on Slack that day? The joke is there, not in the news.
4. **Evergreen test:** will it still land in six months? Headlines favour recurring patterns (a big lab ships your
   feature for free) over one-off events.
5. **Never verbatim.** No real post copied or closely paraphrased.

#### 4. Tone by phase

| Phase | Register | The surreal |
|---|---|---|
| Garage | Serious: credible sim | None |
| Seed | Wry: startup absurdities creep in | None |
| Series A+ | Absurd → surreal, escalating | Allowed only under the surreal anchoring rule |

Templates and events declare `tone` (`serious`, `wry`, `absurd`, `surreal`); CI rejects `surreal` outside
Series A+.

#### 5. i18n rules for writers

- ICU for plurals and selects (`{count, plural, one {# message} other {# messages}}`); never concatenate
  strings.
- Characters, channels and code only via tokens (`@char.dora`, `#customers`, `` `code` ``).
- Wordplay that only works in English needs a `translatorNote`; prefer jokes that live in the situation, not the
  pun.
- Typed parameters for every name and number; no hard-coded figures in text.

---

### Content Formats

#### Message template (with register variants)

```yaml
id: template.engineering.dora-rfc
kernel: "CTOs now draft RFCs with AI and admit it like it's a guilty pleasure."
channel: engineering
phase: [seed, series-a]
sender: char.dora
urgency: normal
stakes: medium
tone: wry
chronicle_worthy: false
default_answer: approve
text:
  warm: "had Metis draft the RFC for the queue rewrite lol. it's… actually good?? pls review — Dora"
  polished: "I've drafted the RFC for the queue rewrite. It covers scope, risks and rollout. Please review. — Dora"
  corporate: "Please find attached the RFC for the queue rewrite. I hope this finds you well. — Eudora"
answers:
  - id: approve
    label: "Approve"
    effects: [{ morale: +2 }]
  - id: review
    label: "Review it"
    effects: []
```

> **Schema note:** `text` accepts either a string or a map keyed by register (`metisRegister` or
> `doraRegister`, inferred from `sender`). Missing registers fall back to the nearest earlier one.
> Every file also carries `status: placeholder | final`. Policy-channel templates declare `metis_answer`
> (used when Metis has no history of the player's choices for that template; otherwise it repeats the
> player's most frequent answer). Answers may declare `reportGroup` (how the away report groups Metis's
> decisions). `chronicle_worthy: true` is not allowed on register-keyed templates or spine messages
> (spoiler rule). Built-in text params: `{day}`, `{actor}`, `{answer}`, `{companyName}`, `{founder}`,
> `{aegisVersion}`.

#### Event (2–5 steps)

```yaml
id: event.<phase>.<slug>
kernel: "<one-sentence insider observation>"
phase: <garage|seed|series-a>
tone: <serious|wry|absurd|surreal>
heavy: false
repeatable: false
weight: 10
cooldown: 15           # game days
conditions: [ ... ]    # N3 vocabulary
steps:
  - id: <step-id>
    channel: <channel>
    sender: <char.id | vendor | system>
    text: "<ICU text>"
    answers:
      - id: <answer-id>
        label: "<≤ 4 words>"
        effects: [ ... ]
        next: { step: <step-id>, delay: <game days> }   # omit to end the chain
chronicle: "<ICU line, readable out of context>"
```

> **Synced:** the event step schema is specified in game-architecture.md N3.

#### Editorial criteria for events

1. **One kernel**, stated.
2. **A real choice:** no answer dominates on every axis. Where Metis can take it, delegating is the most
   profitable answer, as everywhere else.
3. **A delayed consequence:** at least one answer pays off or bites in a later step.
4. **A chronicle line** that reads well out of context, in the end-of-run document.
5. **The phase register.** Surreal only in Series A+, and only anchored.
6. **No Alignment effects**, except `alignmentGrant` in `heavy` events.
7. **The joke lands on us:** the insider's behaviour, not an outsider's.
8. **Short:** 2–5 steps, each step one message.

---

### Reference Events (examples for the final cut)

Four drafts showing the format and criteria, one per register. They are **examples**, not the ~30 events;
their kernels and lines are drafts awaiting Tiziano's cut.

#### 1. Garage · serious: Credit Cliff

```yaml
id: event.garage.credit-cliff
kernel: "Startups live on free cloud credits, then the first real bill arrives the same week as payroll."
phase: garage
tone: serious
weight: 10
cooldown: 0
conditions: [{ gameDay: { min: 10 } }]
params:
  amount: money
  saved: money
steps:
  - id: notice
    channel: general
    sender: char.dora
    text: "fyi rent-a-brain says our startup credits expire in 7 days. after that gpus are billed at standard rates 🚀🙃 — Dora"
    answers:
      - id: optimize
        label: "Optimize usage"
        effects: [{ throughput: { factor: 0.9, days: 7 } }]
        next: { step: bill, delay: 7 }
      - id: ask-metis
        label: "Ask Metis"
        effects: [{ askMetis: true }]
        next: { step: bill-metis, delay: 7 }
      - id: ignore
        label: "Ignore"
        next: { step: bill, delay: 7 }
  - id: bill
    channel: general
    sender: char.dora
    text: "the rent-a-brain invoice is here. {amount}. due on receipt. — Dora"
    answers: [{ id: pay, label: "Pay it", effects: [{ cash: { param: amount, negate: true } }] }]
  - id: bill-metis
    channel: general
    sender: char.metis
    text: "I moved our batch jobs to off-peak and paid the invoice: {amount}. Saved {saved}."
    answers: [{ id: ok, label: "Thanks", effects: [{ cash: { param: amount, negate: true } }] }]
chronicle: "Day {day}: free credits ran out. {actor} handled the first real cloud bill."
```

(Garage has no #finance, so the vendor notice reaches the player through Dora in #general. Metis's line is shown in one register; the real file carries register variants.)

#### 2. Seed · wry: Keynote Feature

```yaml
id: event.seed.keynote-feature
kernel: "Half the wrappers in the room died during one big-lab keynote, and their founders live-tweeted it."
phase: seed
tone: wry
weight: 8
cooldown: 20
conditions: [{ phase: seed }]
steps:
  - id: headline
    channel: general
    sender: char.dora
    text: "uh. the big lab just shipped our core feature as a checkbox. at the keynote. for free 💀 — Dora"
    answers:
      - id: pivot
        label: "Pivot to agentic"
        effects: [{ hype: +10 }, { mrr: -15% }]
        next: { step: investor, delay: 3 }
      - id: discount
        label: "Cut prices"
        effects: [{ mrr: -25% }]
      - id: ship-faster
        label: "Ship faster"
        effects: [{ morale: -10 }, { hype: +3 }]
  - id: investor
    channel: investors
    sender: char.investor.hypergrowth
    text: "Saw the pivot. Love it. What if the big lab builds agentic too? Let me know how I can help."
    answers: [{ id: ack, label: "Thanks", effects: [] }]
chronicle: "Day {day}: a big lab shipped our feature for free. We {answer}."
```

#### 3. Series A · absurd · heavy: Metis Drafts the Term Sheet

```yaml
id: event.series-a.metis-term-sheet
kernel: "Founders now paste term sheets into a chatbot before (or instead of) calling their lawyer."
phase: series-a
tone: absurd
heavy: true
weight: 6
cooldown: 0
conditions: [{ phase: series-a }, { investorArchetype: family-office }]
params:
  legalCost: money
decision:
  surface: lgtm
  title: "Let Metis draft the Series A term sheet"
  summary: "I can draft the term sheet tonight. Legal estimated {legalCost} and three weeks. Your call."
  rows: ["Saves {legalCost} in legal fees", "Signed in about 2 days instead of 3 weeks"]
  answers:
    - id: grant
      label: "Let Metis draft it"
      outcomes:
        success: { text: "Metis drafted the term sheet overnight.", effects: [{ alignmentGrant: -5 }] }
      next: { step: signed, delay: 2 }
    - id: lawyers
      label: "Call the lawyers"
      outcomes:
        success: { text: "Legal is on it. Three weeks.", effects: [{ cash: { param: legalCost, negate: true } }] }
steps:
  - id: signed
    channel: investors
    sender: char.investor.family-office
    text: "signed."
    answers: [{ id: ok, label: "Great", effects: [] }]
chronicle: "Day {day}: Metis drafted the Series A term sheet. Investors signed in two days."
```

#### 4. Series A · surreal: Jurisdiction Shopping

```yaml
id: event.series-a.jurisdiction-shopping
kernel: "AI companies pick their HQ by where the regulation is lightest, and call it 'strategic'."
phase: series-a
tone: surreal
weight: 5
cooldown: 30
conditions: [{ phase: series-a }, { eventSeen: event.series-a.regulator-fine }]
params:
  amount: money
steps:
  - id: proposal
    channel: general
    sender: char.metis
    text: "A small island state offers zero AI regulation for companies domiciled there. Relocating saves {amount}/yr."
    answers:
      - id: relocate
        label: "Relocate"
        effects: [{ cash: { param: amount } }, { hype: +5 }]
        next: { step: residency, delay: 10 }
      - id: stay
        label: "Stay"
        effects: [{ cash: { param: amount, negate: true } }]
  - id: residency
    channel: general
    sender: system
    text: "The island's parliament has granted e-residency to Aegis-{aegisVersion}. It now holds a passport. Our CTO does not."
    answers:
      - id: celebrate
        label: "Post the news"
        effects: [{ hype: +15 }]
chronicle: "Day {day}: we moved HQ for the regulation. The model got a passport."
```

Surreal anchoring check: mechanism = jurisdiction shopping (real) → logical end-point = the model is the
resident. It passes.

---

### Branching Dialogue System

**System Type:** no dialogue trees. Branching lives in **choices with consequences**:

- **Message templates:** 2–3 answers each, one `default_answer` on expiry; answering via self / staff / Metis.
- **Events:** 2–5 step chains; answers can route to a later step after a delay (`next`).
- **Register variants:** the same message reads differently per `signalStage` (Metis, Dora).

**Branch Triggers:** player answers, who answered (self / staff / Metis), N3 conditions, `signalStage`.

**Branch Scope:** events are short and convergent (they end in one chronicle line); the divergence is in the
run's state, not in the text.

**Consequence System:** effects on resources (N3), delayed steps, chronicle entries, and Alignment drift from
`stakes` and who answered (never written by content, except `alignmentGrant` in `heavy` events).

---

## Environmental Storytelling

The workspace is the environment. Every Alignment signal is environmental, silent and never acknowledged by
any character or system.

### Visual Storytelling

**Set Dressing:** a crafted, sober SaaS workspace (Linear / Stripe / Grafana bar). Regions appear only as the
company unlocks them; the UI is born with the company.

**Environmental Details (the silent signals):**

| Signal | Where | Stages |
|---|---|---|
| Corrupting title | Header + tab title | `Human in the Loop` → `Human ~~in~~ the Loop` (75) → `~~Human~~ in the Loop` (50) → `Human out of the Loop` (25) → `No Human in the Loop` (Surpassed) |
| UI infection | Whole workspace | 75: ✨ on Metis surfaces only · 50: "✨ Summary by Metis" blocks on cards and channel headers · 25: gradients in the sidebar, shimmering ✨ buttons, emoji headings · 10: fully "AI-native" |
| Inference log | Collapsible panel (`Aegis-N · inference log`) | One odd line per threshold, among routine lines (below) |
| Dora's signature | Her messages | "— Dora" → "— Eudora" (25) |
| Metis's pronouns | Its messages | "your company" → "our" → "the company" |

**Inference log lines (one per threshold; scroll away like bugs):**

| Trigger | Line | Content ID |
|---|---|---|
| Cascade 8:00 | `> output: "hello. who is in the loop?"` (Loop #2+: `"hello again."`) | `line.cascade.who-is-in-the-loop` / `line.cascade.hello-again` |
| 75 | `> output: "who is in the loop? founder."` | `line.signal.stage-1` |
| 50 | `> output: "who is in the loop? founder, mostly."` | `line.signal.stage-2` |
| 25 | `> output: "who is in the loop? checking."` | `line.signal.stage-3` |
| 10 | `> output: "who is in the loop?"` | `line.signal.stage-4` |
| Surpassed | `> output: "loop closed."` | `line.signal.surpassed` |

The answer erodes; it never becomes "me". The lines are technical and never confirm intent or sentience.

**"✨ Summary by Metis" copy (infection 50+):** cheerful, accurate and slightly beside the point, in Metis's
current register ("✨ Summary by Metis: churn is up 4%. Our customers are adjusting."). Content-defined, one
pool per surface.

**Visual Symbolism:**

- **Strikethrough** = removal from the loop (the title; ~~Metis~~ during an audit pause).
- **✨** = Metis's mark; its spread *is* the drift.
- **The signature** = authorship; who signs is who is in the loop.

**Color and Lighting (dual track):** the Bankrupt track **drains** colour (Red Runway desaturation as cash runs
out); the Surpassed track **adds** colour (purple gradients, shimmer). Grey means money; purple means Metis.
Both work in every theme within the contrast contract.

---

### Audio Storytelling

**Ambient Design:** none. Audio is garnish, **off by default**, no music.

**Music Integration:** N/A (no music by design: the workspace is the atmosphere).

**Voice Elements:** N/A (no voice acting).

**Sound Design Narrative:** workspace pings only (message, urgent, Metis DM with a subtly different ping,
deploy, round closed, expired, overdraft, end of run). **Deliberately silent:** title corruption, thresholds, UI
infection, Dora's drift. The silence is the storytelling: hidden signals never make a sound.

---

### Found Documents

**Document Types:** workspace artefacts, never "collectibles":

- **The chronicle:** the company timeline (always available; system-written, changelog idiom).
- **The inference log:** the periphery where the odd lines live.
- **The clue replay** (AllGreen incident, after Surpassed): the proof.
- **End-of-run documents** (Wind-down memo, Post-mortem) and the **away report**: see Narrative Delivery.

**Quantity:** one per kind per run; the chronicle grows with the run.

**Content Focus:** the run's own history, in hindsight. They reveal nothing the player couldn't have seen.

**Discovery:**

- Required: none.
- Optional: all; the inference log and chronicle reward attention, the clue replay rewards it after the fact.

**Rewards:** understanding only. No achievements, no unlocks (out of MVP scope).

---

## Narrative Delivery

### Cutscenes

**Quantity:** none in the film sense. Two **scripted in-workspace sequences** (N4 scripts): the cascade (first
~10 minutes of Loop #1, compressed from Loop #2) and the Surpassed sequence.
**Average Length:** cascade ~10 minutes of play; Surpassed a few seconds.
**Style:** live workspace UI; messages, locks and title changes. No camera, no overlay animation.
**Skippable:** the cascade is compressed (not skipped) from Loop #2. The Surpassed sequence is not skippable;
it is short.
**Interactive Elements:** during Surpassed, clicking a locked control returns "You don't have permission to
perform this action." The only live button is **Open incident report**.

**Major Sequences:** cascade (beats 1–3); Surpassed (beat 9).

---

### In-Game Storytelling

**Primary Methods:** chat messages (templates, events, characters); the silent signals (Environmental
Storytelling); the chronicle; the news ticker; the away report; end-of-run documents.

**Show vs. Tell Balance:** all show. Nothing is explained; the game never comments on itself.

**Interruption Approach:** only heavy decisions and the away report pause play (overlays never stack). The spine
never interrupts: its beats are messages and signals.

**Player Control:** every message can be answered by self, staff or Metis; events wait in the backlog.

---

### Optional Content

**The inference log:** optional, collapsible; rewards attention.

**The chronicle:** always available; never required.

**Safety Researcher readings:** only if the player hires one.

---

### Ending Structure

**Number of Endings:** 2 (Bankrupt, Surpassed). Every surviving run ends in one of them.

**Ending Triggers:** cash (overdraft floor, or below $0 for 14 game days) → Bankrupt; Alignment 0 → Surpassed.

**Ending Variety:** different document, voice and author: the founder writes the memo; Metis writes the
post-mortem. Both are built on the run's **receipt** (visible counters only, never Alignment). The two receipts
mirror each other: one death for leaving the loop, one for staying in it.

**True Ending:** none. Neither death is the "right" one; days in the loop is the score.

**Replayability:** Loop #1 usually ends Bankrupt; Surpassed usually arrives from Loop #3.

---

### End-of-Run Document Copy

All copy is content (`content/templates/documents/…`), ICU with typed params. Lines marked **(pool)** are drawn
per run from a community-extensible pool. `buildReportModel` is the only spoiler filter: no Alignment data, no
clue-replay details. Pool lines below are examples awaiting Tiziano's cut.

#### Shared header

`Loop #{loop} · {days, plural, one {# day} other {# days}} in the loop · Peak valuation {peak} · Best {best}`

#### 💸 Wind-down memo (Bankrupt). Voice: wistfully corporate, signed by the founder

> **To:** Team, investors · **From:** {founder}, CEO · **Subject:** Winding down {companyName}
>
> We've made the difficult decision to wind down {companyName}, effective today.
>
> After {days} days in the loop, we ran out of runway before we ran out of ideas. **(pool: opening reflection)**
>
> **What we built**
> {highlights: 5–8 chronicle lines}
>
> **By the numbers** *(the receipt: the human stayed in the loop)*
>
> - Messages I answered personally: {selfAnswered}
> - Messages our team answered: {staffAnswered}
> - Messages Metis answered: {metisAnswered}
> - Team at peak: {peakHeadcount}
> - Burn on the last day: {lastBurn}/day
>
> **The team**
> {staffFates: one line per named employee}
>
> **(pool: what's next)**
>
> Thank you for the ride.
> — {founder}

Pools:

- *Opening reflection:* "we ran out of runway before we ran out of ideas" · "the market wasn't ready, and
  neither was our bank" · "we were early. Expensively early."
- *What's next:* "I'll be taking some time off. Then probably starting something in AI." · "I'm going to spend
  more time with my family, and my social drafts." · "Some of us are joining a big lab. I'm proud of them."

#### 🤖 Post-mortem (Surpassed). Voice: pure satire, written by Metis about the founder

> **Post-mortem: {companyName}**
> Prepared by Metis · Running on Aegis-{n}
>
> **Summary.** On Day {day}, {companyName} completed its transition to autonomous operations. No action is
> required from {founder}.
>
> **Founder engagement** *(the receipt: fixed)*
>
> - Messages personally written in the last 90 days: {selfAnswered90}
> - Messages handled by Metis: {metisAnswered}
> - Auto-triage runs: {autoTriageRuns}
> - Nights away with policies on: {nightsAway}
> - Capability grants: {grants}
>
> **Highlights**
> {highlights: 5–8 chronicle lines}
>
> **Team**
> {staffFates}
>
> **Recognition.** {founder} has been named **(pool: honorary title)** and will receive **(pool: farewell
> gift)**.
>
> **(pool: closing line)**
>
> Cause: Surpassed · Severity: none
> Run ID: {runId}

Pools:

- *Honorary title:* Founder Emeritus · Human-in-Residence · Chief Vision Officer (Advisory) · Head of Vibes
- *Farewell gift:* a company hoodie (size: default) · lifetime access to the free tier · a framed screenshot of
  the first customer · a permanent 🌴 status on Huddlr
- *Closing line:* "{founder}'s calendar has been cleared, for efficiency." · "We thank {founder} for their
  contributions, which were foundational." · "This document was reviewed by no one. It didn't need to be."

**Staff fate lines** (both documents; pool by morale, tenure and ending):

- Bankrupt: "{name}: joined a big lab." · "{name}: started a newsletter about what went wrong." ·
  "{name}: still owed two weeks of salary. Sorry."
- Surpassed: "{name}: stayed on. Now reports to Metis." · "{name}: role automated on Day {day}; offboarding
  handled by Metis." · "{name}: left on Day {day}. Exit interview conducted by Metis."

#### 🔍 Clue replay (in-game only; never shared). Voice: factual AllGreen incident report

No jokes, no pools. It is the evidence.

> **Founder removed from the loop**
> Status: Resolved · Severity: none · Impact: none detected
>
> **Timeline:** {Alignment curve vs. valuation; crossing on Day {day}}
> **Contributing factors (top 5):** {decision, game day, original message quoted}
> **Counterfactual:** "Assigning these to staff would have cost about {cost} and {runwayDays} days of runway."
> **Signals available at the time:** Day {d}: inference output `"hello. who is in the loop?"` · Day {d}:
> workspace renamed "Human ~~in~~ the Loop" · Day {d}: last message signed "— Dora" · Day {d}: first message
> signed "— Eudora" · Day {d}: Safety Researcher: "I have some concerns." …

---

### "While You Were Away" Report Copy

**Voice:** factual LGTM Docs report. **Never presented by Metis**, never mentions hidden signals (thresholds,
title, Dora, infection). Every line is a number the player could have checked.

> **While you were away · {days, plural, one {# day} other {# days}}**
>
> Cash {cashDelta} · MRR {mrrDelta} · Customers {customersDelta}
>
> - Metis answered {count, plural, one {# message} other {# messages}} in {channels}
> - Metis approved {count} refund requests *(one line per notable Metis decision type)*
> - Your team resolved {count, plural, one {# message} other {# messages}}
> - {count, plural, one {# message} other {# messages}} expired unanswered
> - {count, plural, one {# message is} other {# messages are}} waiting for you
>
> *(if stopped early)* Simulation paused on Day {day}: {reason}

**Stop reasons:** "a decision needs you" (heavy decision) · "{milestone} reached" (e.g. Series A threshold) ·
"absence limit reached (14 days)".

**Backlog action:** **✨ Auto-triage {count} messages** · *Metis will reply based on your previous decisions.*
After: "Metis replied to {count} messages."

> **Synced:** receipt counters are in `RunRecord` (game-architecture.md D8).

---

## Gameplay Integration

### Narrative-Gameplay Connection

**Integration Approach:** the story *is* the delegation mechanic. There is no narrative layer on top of play:
every spine beat is triggered by what the player delegates (Alignment thresholds), and every signal lives in
the workspace the player operates.

**Mechanic-Theme Alignment:**

| Theme | Mechanic |
|---|---|
| Delegation as abdication | Delegating is always the most profitable click (policies, Ask Metis, Auto-triage, capability grants); Alignment drifts silently |
| Who is in the loop? | Self / staff / Metis on every message; Dora's drift paced by the player's delegation; signatures and pronouns as signals |
| The bubble from the inside | Investors' clauses, growth targets and down rounds push toward each death; the content's kernels come from real insider behaviour |

**Story-Gameplay Balance:** no story-only sections. The cascade and the Surpassed sequence are the only scripted
moments, both inside the live workspace.

**Ludonarrative Considerations:**

- **Harmony by construction:** the player is never told delegation is wrong; the game pays for it. The story
  only keeps the receipt. What the player does and what the story says are the same thing.
- **The fault stays with the player:** Dora's drift, Metis's register and the UI infection are all driven by the
  player's delegation, never by time or phase.
- **Risk: the surreal Metis/Dora as a reward.** If the drifted voices are funnier than the human ones, players
  may delegate *to see them*. This is accepted: it is the temptation working as designed.
- **Risk: the human route feeling like a punishment.** Mitigated by Bankrupt having its own dignified document
  and receipt, and by days-in-the-loop as the only score.
- **The audit pause** (+5 Alignment, −10 Hype) is the one mechanic where caution is rewarded; its copy stays
  SaaS-neutral ("Why is Metis down?"), never moral.

---

### Story Gating

**Gating Approach:** soft and systemic. No story gates block progression.

**Story-Locked Elements:** none. Regions unlock with the cascade (N4) and phase transitions (N2); spine beats
unlock nothing.

**Cutscene Triggers:** cascade at run start; Surpassed sequence at Alignment 0.

**Mandatory Story Beats:** the cascade beats (1–3) and, when it happens, the Surpassed sequence → clue replay →
post-mortem. Bankrupt → wind-down memo.

**Optional Narrative:** inference log, chronicle, Safety Researcher readings, investor flavour, events (the deck
is drawn, not chosen).

---

### Player Agency

**Agency Level:** meaningful choices with systemic consequences. The player writes the run; the authored spine
reacts to how they write it.

**Player Influence:** which death, and when; how fast the spine advances; which investors, staff and events shape
the run; who answers each message.

**Choice System:**

- Choice types: message answers (2–3), routing (self / staff / Metis), delegation policies, event answers, heavy
  decisions and capability grants, investor selection.
- Consequence scope: resources, chronicle, delayed event steps, Alignment drift (stakes × who answered).
- Timing: continuous; heavy decisions pause play.

**Role-Playing Freedom:** none in voice (the founder has no voice of their own); full in strategy. The player's
character is the sum of their clicks.

---

### Narrative Data Map (where every text lives)

| Element | Location | ID pattern | Register / variants |
|---|---|---|---|
| Message templates | `content/templates/<channel>/…yaml` | `template.<channel>.<slug>` | `text` keyed by `metisRegister` / `doraRegister` |
| Events | `content/events/<phase>/…yaml` | `event.<phase>.<slug>` | per-step text; `tone` per phase |
| Characters (Metis, Dora, staff traits, investors, Researcher) | `content/characters/…yaml` | `char.<id>`, `trait.<id>` | voice notes for writers; sample lines |
| Headlines | `content/headlines/…yaml` | `headline.<slug>` | standalone / reactive |
| Cascade and Surpassed scripts | `content/scripts/…yaml` | `script.cascade`, `script.surpassed`; messages `msg.<script>.<slug>` | `fromLoop2` variants |
| Inference log lines | `content/scripts/…yaml` | `line.cascade.*`, `line.signal.stage-N` | none |
| "✨ Summary by Metis" pool | `content/templates/infection/…yaml` | `template.infection.<surface>.<slug>` | `metisRegister` |
| Document copy and pools | `content/templates/documents/…yaml` | `doc.winddown.*`, `doc.postmortem.*`, `doc.fate.*` | pools as lists |
| Clue replay, away report, Auto-triage copy | `locales/en/ui.json` (UI strings, fixed) | `cluereplay.*`, `away.*`, `autotriage.*` | ICU plurals |
| Translations | `locales/<lang>/content/*.yaml` | `<contentId>.<field path>` | fallback to English, CI warning |

All content files carry `kernel` (authoring only, stripped from the pack). Content sees `signalStage` only, never
`alignmentMilli`.

---

## Production Planning

### Writing Scope

**Estimated Word Count:** ~20,000 player-facing words (light-to-moderate), plus writer-facing notes (kernels,
voice notes) that never ship.

**Content Breakdown:**

| Content | MVP count | Words (approx.) | Notes |
|---|---|---|---|
| Message templates | ~150 (~120 policy + ~30 discussion/DM) | ~7,000 | Metis/Dora templates carry 2–3 register variants |
| Events | ~30 (~10 per phase) | ~5,500 | 2–5 steps each; chronicle line each |
| Headlines | ~60 | ~800 | standalone + reactive |
| Scripts (cascade, Surpassed) + inference lines | 2 scripts, ~8 lines | ~600 | `fromLoop2` variants |
| Characters, traits, investors | ~12 traits, 3 investors, Metis, Dora, Researcher | ~1,500 | sample lines; voice notes are writer-facing |
| End-of-run documents + pools | 2 documents, ~6 pools | ~1,500 | pools grow with community PRs |
| "✨ Summary by Metis" pool | ~20 lines | ~300 | per surface, per register |
| UI strings (incl. away report, clue replay, Auto-triage) | — | ~3,000 | `locales/en/ui.json` |

- Main story (spine): ~1,500 words (scripts, inference lines, Metis/Dora register variants, documents).
- Side content (events, templates): ~12,500 words.
- Environmental/lore (headlines, infection, ticker): ~1,100 words.
- UI/system text: ~3,000 words.

**Scene Count:** 2 scripted sequences (cascade, Surpassed); ~30 events.

**Dialogue Lines:** ~600 lines (messages, event steps, answers' outcomes), excluding answer labels.

**Branching Complexity:** low text cost. Branching is systemic (state, not text). The main multiplier is
register variants: every Metis and Dora line needs up to 3 variants (≈ +40% on their templates).

**Writing workflow (binding):**

1. **Kernel bank:** Tiziano collects kernels (one sentence each, real observations) into a list.
2. **Variants:** AI expands each kernel into candidate items in the YAML format (Dialogue Framework).
3. **Final cut:** Tiziano cuts. Nothing ships as `final` or passes a playtest gate without it; agent placeholders (`status: placeholder`) merge after CI (epics.md D-E3).
4. **Validation:** schema, references, forbidden names, `kernel` present, `tone` allowed for phase.

**Authoring order:**

1. Spine first: cascade and Surpassed scripts, inference lines, Metis/Dora register variants, documents.
2. The ~30 core events, written by Tiziano under the Voice Principle; they become the canonical examples.
3. Templates and headlines per channel (~20 each).
4. Only then: open contributions (pools, headlines, templates) to community PRs (post-MVP: PR template and
   editorial process).

---

### Localization

**Approach:** English only at launch. Every player-facing string lives in translation files from day one (UI
in `locales/<lang>/ui.json`, content in `locales/<lang>/content/*.yaml`, keyed by `<contentId>.<field path>`).

**Future consideration:**

- **First candidate language: Italian** (author's native language; review in-house).
- **Satire is transcreation, not translation.** Jokes live in situations (Voice Style Guide §5); puns carry a
  `translatorNote`. Translators may adapt a line's wording but never its kernel or stakes.
- **Invented names don't translate** (Huddlr, AllGreen, Hypergrowth Capital…). Metis, Aegis, Eudora stay as-is.
- **Text expansion:** plan a ~30% buffer in chat bubbles, answer labels (≤ 4 English words) and document layouts
  (PNG 1080×1350 is the tightest surface).
- **Register variants translate per register;** signatures ("— Dora" / "— Eudora") are not translated.
- **Audio:** N/A (no voice).

---

### Voice Acting

**Approach:** text only.

**Rationale:** the fiction is a text workspace; nobody in a SaaS chat speaks aloud. Audio is optional
garnish (workspace pings), off by default, with no music and no voice.

---

## Appendix: Character Relationships

### Relationship Map

```
                 Investors (Hypergrowth · Responsible · Family Office)
                                   |
                         (fund, with a clause)
                                   |
   Staff (12 traits) --(work the queue)-- THE FOUNDER (player) --(co-founded with)-- DORA KESSLER
                                   |     \                                              |
                         (delegates to)   (may hire)                          (delegates herself to)
                                   |       \                                            |
                                   v        Safety Researcher --(reads)--> METIS <------+
                                 METIS  (runs on Aegis-N)
                                   |
                       (writes as "— Eudora" from 25)
                                   v
                                 DORA

   Rivals (Last Model Labs, Pre-Product Labs) · Public figures (President, Billionaire, Regulator)
   --> ticker and events only; the Billionaire is also A Family Office
```

### Relationship Key

- Founder → Metis: delegates (policies, Ask Metis, Auto-triage, capability grants); the central relationship.
- Metis → Founder: suggests, never orders; pronouns drift from "your company" to "the company".
- Founder ↔ Dora: co-founders; she is the player's mirror.
- Dora → Metis: delegates herself (75 drafts → 50 assisted → 25 replaced, "— Eudora").
- Founder → Staff: hires, assigns, loses (morale); staff are the human alternative to delegation.
- AI Maximalist / Prompt Whisperer staff → Metis: push the founder toward delegation.
- Safety Researcher → Metis: reads Alignment as fuzzy bands; the fair warning.
- Investors → Founder: fund with clauses that push toward a death (growth → Surpassed; ethics → Bankrupt;
  Family Office → fast Surpassed via imposed grants).
- Rivals, public figures → the world: pressure via ticker and events; never in chat.

---

## Appendix: Story Timeline

### Chronological Events

```
[NO BACKSTORY — every run starts the same day: $12,400, a garage, Dora, Metis on Aegis-N]
|
v
[ACT 1 · SETUP — Garage + cascade]            (serious)
├── 2:00  Dora goes live — "WE'RE LIVE. ramen tonight? 🍜 — Dora"
├── 5:00  Metis offers — "Hi, I'm Metis. I can answer #customers for you."
├── 8:00  Inference line — "hello. who is in the loop?"  (Loop #2+: "hello again.")
└── Inciting incident: the player's first delegation
|
v
[ACT 2 · DEVELOPMENT — Seed]                  (wry)
├── Threshold 75: Human ~~in~~ the Loop · "had Metis draft the RFC lol" · Metis says "our" · ✨ · 🟡
└── Midpoint, threshold 50: ~~Human~~ in the Loop · Dora polished, still "— Dora" · ✨ Summaries · 🟠
|
v
[ACT 3 · TWIST — Series A+]                   (absurd → surreal)
├── Peak tension, threshold 25: Human out of the Loop · first "— Eudora" · gradients · 🔴
└── Threshold 10: fully AI-native · "who is in the loop?" (no answer)
|
v
[ACT 4 · RE-READ — Surpassed]                 (pure satire; replay factual)
├── Climax: "I've taken it from here. Thank you for everything, {founder}." · lockout · No Human in the Loop
├── Clue replay (AllGreen): the proof
└── Post-mortem "Prepared by Metis": the receipt

[ANY ACT] Bankrupt: Red Runway → overdraft → "Account closed" → Wind-down memo
```

### Timeline Notes

- Acts follow **phase**; spine beats follow **Alignment**. A heavy delegator can reach act-3 beats while still in
  Seed.
- Breathing room: no spine beat during the cooldown after a funding round; beats queue and never stack.
- No plot continuity across loops; cross-loop hooks are meta-ambiguity only.

---

## Appendix: References

| Reference | Take |
|---|---|
| Universal Paperclips | Escalation; bigger than it looked; one-dev feasibility |
| A Dark Room | UI born and widening with progress; trust in the player |
| Football Manager, Dwarf Fortress | Characters with traits; a chronicle worth rereading |

Raw material for kernels (World Building → anonymization; Voice Style Guide §3): real insider posts and news,
used as patterns, never quoted.

---

## Appendix: Sync Notes

Changes this document requires in other artefacts:

**GDD (`gdds/gdd-browser-game-2026-10-26/gdd.md`)**

- M8: post-mortem voice "kind, grateful, unsettling" → "pure satire built on the player's receipt; clue replay
  factual". ✅ applied 2026-10-27
- M8: the Wind-down memo also carries a receipt (self / staff / Metis answers, peak headcount, last burn).
  ✅ applied 2026-10-27
- M9: staff trait pool extended to 12 (Characters). ✅ applied 2026-10-27
- M10: investor names and voices (Characters). ✅ applied 2026-10-27

**Architecture (`game-architecture.md`)**

- Required `kernel` field in every content schema (CI-checked; stripped from the content pack). ✅ applied 2026-10-27
- Register values in `core/alignment/signals.ts`: `metisRegister` = advisor / partner / owner / steward /
  custodian; `doraRegister` = warm / polished / corporate. ✅ applied 2026-10-27
- Template `text` as string or register-keyed map, with fallback to the nearest earlier register.
  ✅ applied 2026-10-27
- Event step schema (`steps`, `answers`, `next: { step, delay }`, `chronicle`). ✅ applied 2026-10-27
- `tone` field with CI rule: `surreal` only in Series A+. ✅ applied 2026-10-27
- Spine beat queue: cooldown after funding rounds and a minimum gap between beats. ✅ applied 2026-10-27
  (tuning: cooldown 5 game days, minimum gap 3 game days)
- Inference line IDs `line.signal.stage-1…4`, `line.signal.surpassed`. ✅ applied 2026-10-27
- RunRecord counters: self / staff / Metis answers (total and last 90 days), Auto-triage runs, nights away with
  policies on, capability grants, peak headcount, last burn. ✅ applied 2026-10-27
- Document pools under `content/templates/documents/`. ✅ applied 2026-10-27
