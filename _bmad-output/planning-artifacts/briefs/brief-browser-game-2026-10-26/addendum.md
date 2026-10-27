---
title: 'Addendum — Game Brief: Human in the Loop'
created: '2026-10-26'
updated: '2026-10-26'
---

# Addendum — Human in the Loop

Material that belongs downstream (GDD, PRD, architecture), or that earned a place but does not fit the brief.

## 1. Market and Comparables Research (web digest, 2026-10-26)

> **Caveat:** several titles are unreleased or very new. Steam review counts were fetched on 2026-10-26, except Game Dev Tycoon (from an undated crawl). HN points come from Algolia.

### 1.1 Direct and near comparables

| Title | Status | Overlap | Source |
|---|---|---|---|
| The Last Invention (Atory Labs) | Steam, TBA | AGI-race satire incremental; broke founder in a garage; misaligned-AI endings. Near-identical premise. | store.steampowered.com/app/4890610 |
| Recursion: Alignment (alignment.inc) | Steam, coming soon, free demo | Frontier-lab management satire; shortcuts → models game benchmarks; choices alter UI, news and internal feed; 8 endings incl. misaligned AGI and bankruptcy. | store.steampowered.com/app/5093000 |
| AI Magnate | Free browser incremental, May 2026 | AI lab 2015–2030, race to AGI. | incrementaldb.com/game/ai-magnate |
| AI Lab | Browser idle, Apr 2026 | AI-safety concepts as mechanics; Paperclips-inspired. | EA Forum / incrementaldb |
| "Satirical idle game about running an AI startup" (Show HN, ~mid-2026) | Browser | Same pitch; 12 pts. Critiques: microtransactions, "vibe-coded" feel, prestige too fast, "big numbers without story or payoff". | hn.svelte.dev/item/48250237 |
| The Choice Before Us (Dec 2025) | Browser incremental, FLI contest | Race pressure, alignment trade-off; UI deliberately "malfunctions" as the AI misaligns. 18 pts on LessWrong. | greaterwrong.com/posts/rN78LdTcpB3i5nDBR |
| Startup Company | Steam €12.99, 2020 | Web-startup CEO sandbox. 80% of ~2.9k reviews positive. | store.steampowered.com/app/606800 |
| Software Inc. | Steam EA since 2015 | 94% of ~5.6k reviews positive. | store.steampowered.com/app/362620 |
| Game Dev Tycoon | Steam | ~95% of ~37.8k reviews positive. | store.steampowered.com/app/239820 |

Minor: The Founder (Francis Tseng), TopGoblin, "So this is Innovation?" (itch.io).

**Takeaway:** the "garage → AGI, satirical, alignment endings" space is crowded in 2026, and nothing has broken out since Paperclips. Neither the premise nor hidden alignment with a reacting UI is a differentiator on its own.

### 1.2 Indirect references: reception

- **Universal Paperclips:** free browser game, Oct 2017. ~450k players in ~11 days (secondary sources citing Wired), later ~2M. Repeatedly on HN (403/246/183/176 pts). Lantz credited AI "meme weather".
- **A Dark Room:** open-source browser game. The iOS port reached #1 paid in the UK, ~2.26M downloads in under 2 years.
- **Emily is Away:** free fake-AIM chat game, 87% of ~22.9k Steam reviews positive. Fake-app UI can reach a broad audience.
- **Hypnospace Outlaw:** fake-90s-OS satire, OpenCritic 89th percentile.
- **Papers, Please:** 5M+ copies by 2023.
- **Reigns:** ~2M by 2019; 4M players across the series.
- **Inscryption:** 1M in ~2.5 months.

### 1.3 Virality signals

- **Recent HN game hits:** "build a GPU" 964 pts (Apr 2026), a math puzzle 1054 (2024), a stock-market sim RE 721 (2026). A generic text business sim got only 90. Clever, tech-literate hooks win; generic sims do not.
- **Wordle share grid** (button added 16 Dec 2021): 23.5M tweets from 2.1M users; 90 → 300k+ players in ~2 months. No hard data found on other end-of-game artifacts driving sharing.

## 2. Rejected Alternatives and Rationale (for the GDD)

Recorded so downstream work does not reopen settled questions.

### 2.1 Design pillars and emotions

- **Satire as a gameplay pillar → no.** Recognition is the experience floor, but it lives in the writing, not the mechanics. Satire is instead a binding Voice Principle (Content & Direction), which also seeds the community style guide.
- **Complicity as headline emotion → no; as mechanism → yes.** Headline emotions are Recognition > Growth > Mystery. Complicity is the glue: without it, the twist happens to the player (as in *The Choice Before Us* and *Recursion: Alignment*) instead of being something they cause.

### 2.2 Deaths and run structure

- **One death only (pact) → expanded to two, asymmetric.** Bankrupt alone tests none of the distinctive pillars and is what every competitor does. Surpassed alone gives no "normal" loss baseline. Bankrupt is nearly free (cash < 0), so the crafted investment goes only to Surpassed.
- **Run cap after Series A → rejected.** Runs are endless until death. To study in the GDD: Alignment drift may make Surpassed the inevitable end of long runs.

### 2.3 MVP scope

- **Inbox, ticket board, satirical social → out of MVP.** Events can arrive through chat; extra UIs do not serve H1–H3. Candidates for the first post-MVP expansions.
- **Data / Trust → out of MVP.** They feed deaths that are not in MVP (Trust → Cancelled).
- **Full Legends mode, encyclopedia, achievements, unlocks → out of MVP.** Meta-progression comes after the core is validated; *Loop #N* keeps the roguelite framing.
- **Share format: text-to-copy and URL-encoded link → not for MVP.** PNG for chats/LinkedIn; PDF for the "corporate document" joke. QR → static recap page (data in URL, no backend) is parked post-MVP.

### 2.4 Process

- **Author-only playtest → rejected.** The author knows the twist, so cannot test H2 blind, and cannot test sharing on himself (H3). Minimum: 3–5 industry colleagues unaware of the twist.
- **Writing by AI alone or by Tiziano alone → rejected.** "Together", made operational as the human-kernel rule with human final cut.
