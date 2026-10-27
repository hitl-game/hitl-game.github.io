---
title: 'EXPERIENCE.md — Human in the Loop'
status: final
created: 2026-10-26
updated: 2026-10-26
form_factor: Web browser — desktop-first, responsive (tablet, mobile touch)
sources:
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md
  - _bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/addendum.md
---

# EXPERIENCE.md — Human in the Loop

## Foundation

A single-player browser game played in a tab left open during the workday. Desktop browsers (latest two versions of Chrome, Edge, Firefox, Safari) are primary; Safari iOS and Chrome Android get a responsive, touch-playable layout. Input: mouse primary, full keyboard play, screen-reader play, touch on small screens. No engine; the UI *is* the game (a web app). No accounts, no backend, offline after first load.

`DESIGN.md` is the visual identity; this spine owns behaviour. Mechanics, numbers and timings belong to the GDD and are cited by ID (M1–M13) or `[tuning]` key rather than restated; on numbers the GDD wins, on presentation this spine wins.

Two layers, always:

- **The game bar** (outside the fiction): title, Loop #, personal best, Settings.
- **The workspace** (inside the fiction): Huddlr (chat), Vanity (dashboard rail), LGTM Docs (documents, reports, timeline), AllGreen (incidents), Metis (the AI). Everything below the game bar must be something a real SaaS would do (GDD Pillar 1).

## Information Architecture

| Surface | Kind | Reached from | Purpose | Game clock |
|---|---|---|---|---|
| Founding screen | Full screen (Huddlr "Create a workspace") | First load of a loop | Name the company (prefilled + 🎲) and yourself | Not started |
| First workspace screen | Full screen | Found company | `$12,400` + `Deploy` | Stopped until Deploy |
| Workspace | Sidebar · chat · rail | Cascade, then always | Triage, delegation, reading the company | Runs (M1) |
| Channel view | Chat pane | Sidebar row, shortcuts, notifications | Messages for one channel or DM | Runs |
| Metis DM | Chat pane (Metis surface) | Sidebar "✨ Metis" | Offers, capacity, tone | Runs |
| Activity | Chat pane | Sidebar "Activity" | Every toast, mention and notice of the run | Runs |
| Company timeline | Chat pane (LGTM Docs) | Sidebar "Timeline" | The chronicle (M13), readable during the run | Runs |
| Metis · Automations | Chat pane (settings page) | Sidebar "✨ Automations", channel-header "Manage", Metis DM | All policies + Pause Metis for audit | Runs |
| Backlog queue | Chat pane | After the away report | Ranked queue + Auto-triage | Paused; only the top item's timer runs (M1) |
| While-you-were-away report | Overlay doc (LGTM Docs) | Return after an away period | What happened, what Metis decided | Paused |
| Heavy decision | Overlay doc (LGTM Docs / AllGreen) | M6, M10 | Term sheets, releases, crises, capability grants | Paused |
| Dashboard rail (Vanity) | Right rail; drawer on tablet; tab on mobile | Always on desktop | Attention list, KPIs, chart, sections, inference log | Runs |
| Surpassed sequence | In place | Alignment 0 | Takeover beats | Stopped |
| Clue replay | Full page (AllGreen) | Continue after the Surpassed sequence | Reveal and proof | Stopped |
| End-of-run document | Full page (LGTM Docs export) | Continue after Bankrupt / after clue replay | Memo or Post-mortem; PNG / PDF / alt text | Stopped |
| Settings (incl. Archive) | Full page | Game bar Settings; founding "Accessibility" link | Appearance, Accessibility, Notifications, Data | Paused (GDD M1) |
| Shortcut overlay | Overlay | `?` | Keyboard reference | Paused (GDD M1) |

Nothing is more than one step from the workspace. Overlays never stack: a heavy decision waiting during the away report opens after the report closes. **Workspace reading order (what the eye should hit):** attention list and any critical KPI → the current channel's unanswered messages → sidebar unread → rest of the rail → ticker → inference log.

## Voice and Tone

Brand posture lives in `DESIGN.md`. Content voices (Metis, Dora, staff traits, headlines) belong to the writing guide (E7) under the Voice Principle. This section covers **interface microcopy**.

| Do | Don't |
|---|---|
| Real SaaS phrasing: "Metis handles #customers", "Review 17 messages", "Found company", "Add capacity" | Game phrasing: "Level up!", "Quest complete", "Game over" |
| Literal, slightly too honest feature copy: "Metis will reply based on your previous decisions." | Winking UI jokes in system copy |
| Errors as the software would write them: "You don't have permission to perform this action." | Dramatic death text |
| Stripe number notation; "24 days", "Day 9" | Mixed formats |
| Bank voice in the overdraft banner, Vanity voice in KPI labels, AllGreen voice in incidents | Explaining mechanics ("Alignment dropped") |
| Never name Alignment until the clue replay | Hints, tooltips or meters about hidden state |
| Disabled reasons as short inline text ("Metis is at capacity", "Paused for audit · 2 days") | Silent disabled controls |

The game bar is the only place the game speaks as a game, and it says almost nothing.

## Component Patterns

Behavioural. Visual specs live in `DESIGN.md → Components`.

| Component | Behaviour |
|---|---|
| Game bar | Static. Title changes only at Alignment 75 / 50 / 25 and at Surpassed (M7); swapped in place, silent. Settings opens Settings. |
| Browser tab title | `(N) <title>`, N = messages awaiting the player (channels + backlog), omitted at 0. **While the tab is hidden, a ~60 s timer updates only N**: it previews the absence with the real simulation on a throwaway copy (architecture D9), so N always matches what the player finds on return. Nothing is saved and nothing else in the page changes. Mirrors the title stages. |
| Header bar / ticker | Ticker scrolls standalone headlines; reactive headlines jump the queue (M13). The pause/play button, hover or focus pauses it; setting: speed, static, hidden. |
| Sidebar row | Click / Enter opens. Bold when unread; badge only with an urgent item. New rows appear in place with a ~1 s highlight. Accessible name: "#customers, 4 unread, 1 urgent". |
| Current message | One message per view is "current" (accent edge). It moves only with `J`/`K`, a click, `U`, or after the player answers (to the next unanswered). **New arrivals never move focus or the current marker.** |
| Message | Answer buttons until answered / expired / assigned / delegated. Shortcuts act on the current message only. On answer the buttons collapse into the outcome line; focus goes to that outcome line, then `J` continues. |
| Ask Metis (`D`) | Metis answers instantly in the thread ("✨ Metis replied: …"). Counts as an AI decision (M4/M7). Disabled with inline reason at capacity or during audit. |
| Assign (`A`) | Opens the staff picker; Enter assigns; the message shows "Assigned to Priya · in queue (3)" and resolves when they reach it (M9). Hidden before the first hire. |
| Candidate (Garage DM) / ATS card (Seed+) | Hire (`1`) adds the person to Team/Headcount and to burn; Pass dismisses. Unanswered candidates expire like messages (Pass). Safety Researcher: same pattern, #hiring only. |
| Resignation | A DM from the person with no buttons ("I'm out. Friday is my last day."); their row shows "leaving", then disappears after the GDD delay; queued messages return to the channel. |
| Policy toggle | Same state in the channel header and on Automations. First activation shows the permission banner (Notifications). During an audit pause: disabled with "Paused for audit · N days". |
| Attention list | Recomputed every game day and after every action; 1–3 worst conditions (runway, overdraft days, GPU > 90%, staff leaving, round target at risk, Untimed queue full). Click focuses the tile or section. Hidden when empty. Adding an item is announced (polite). |
| KPI tile | Fixed slot. The visible value rolls (~400 ms) in an `aria-hidden` layer; the accessible value is always the final one. The last delta stays visible until the next change. |
| Chart / clue graph | Updates once per game day. Each has a visually hidden one-sentence summary and a "View data" table (day, values, marked decisions). Clue graph draws once on open (motion setting permitting). |
| Rail section | Born expanded with its phase; collapsible; state persists. Overview cannot collapse. |
| Infrastructure | Stepper + "Add capacity" buys immediately (Cash cost per day added to burn), confirmation by toast; no dialog. |
| Metis capacity offer | At 100% GPU: Metis DM "I'm at capacity. Want me to provision more GPUs?" with "✨ Provision N units · +$X/day" / "Not now". A player purchase, **not** a delegated decision: Alignment does not move (GDD M4). It fires at 100% whatever the cause; the button stays usable until used, and Metis repeats the offer every 5 game days while utilization stays at 100% (GDD M4). |
| Inference log | Appends routine lines while present; keeps ~50; collapsible; `aria-live="off"`. Odd lines (M7/M11) are inserted as ordinary lines. |
| Company timeline | Append-only; newest at the bottom; opens scrolled to the end; rows link to the message they quote when one exists. |
| Activity | Reverse-chronological list of toasts, mentions and notices; unread dot until opened. |
| Toast | Auto-dismiss after 6 s × the Timing multiplier (**Untimed: until dismissed**), paused on hover / focus; max 3; announced through the status announcer per verbosity; always also written to Activity. |
| Overlay doc | `role="dialog"`, modal, labelled by its title; initial focus on the title; focus trapped; on close, focus returns to where it was. Decision docs cannot be dismissed (no Esc, no outside click) and say so ("A decision is required"); the away report closes with Esc or its button, landing on the next step (decision or queue). |
| Heavy-decision outcome | Probabilistic decisions resolve on submit: the doc gains an **Outcome** section (result + KPI deltas) and a single "Close"; crises flip the AllGreen status chip and keep "Status was <previous>" in the meta line. A toast repeats the result. |
| Investor cards | Click / arrow keys select one card (radio group); "Sign term sheet" confirms. |
| Backlog queue | Replaces the chat pane. Top item expanded with its window (M3); on answer/expiry the next rises and becomes current. Auto-triage hands all remaining items to Metis. The player may leave the queue (sidebar "Backlog N" returns); the game clock stays paused and only the top timer runs while a backlog exists. Empty queue → last channel returns. |
| Auto-triage | One click, no confirmation. At capacity, Metis serves what capacity allows; the rest expire with default (M4); a status line says "Metis replied to 9 · 6 expired (at capacity)". Disabled with inline reason during audit. |
| Metis · Automations | Policies list; Pause Metis for audit shows its cost and asks for confirmation (the only confirmation in the workspace); cooldown shown as "Available in N days". |
| Founding fields | **Company name:** prefilled, 🎲 regenerates (announced politely), max 40 chars, required ("Your company needs a name."). **Your name:** required, max 30 chars ("Add your name."), becomes `<founder>` in Metis's lines, the memo signature and the Post-mortem. Both remembered as next loop's prefill. Enter or "Found company" submits; focus then lands on `Deploy`. |
| End-of-run document | "Show timing setting on the document" checkbox, **off by default** (affects PNG and PDF; the on-page HTML and the game bar always show it). Download PNG / PDF (progress "Preparing PDF…", failure "Couldn't generate the PDF. Try again."), Copy alt text, Start Loop #N+1 (archives this document, starts the founding screen). |
| Shortcut overlay | `?` opens, Esc closes. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| First load (no save) | — | Founding screen, Loop #1. |
| Loading a save | — | Workspace at the saved moment; away report first if away time applies. |
| Same save open in another tab | Second tab | Huddlr-style screen "Huddlr is open in another tab · Use here"; only one tab is live. |
| Save unreadable / corrupted | — | "We couldn't open this workspace." · Import a data room · Start a new loop. |
| New app or content version available | — | A run stays on the version it started with (architecture D4 → Version pinning); a non-blocking notice says "A new version will be used from your next loop.", and the page switches to it before the next run is founded. Older saves migrate silently when possible; otherwise the corrupted-save screen. |
| Storage quota exceeded | Settings → Data notice + toast | "Your browser is out of space for this save. Export a data room." |
| Persistence denied | Settings → Data | One-line notice, never a modal. |
| Import rejected | Settings → Data | "This data room export couldn't be verified." No partial import. |
| First screen idle | First workspace screen | Waits indefinitely; the clock does not start until Deploy. |
| Cascade beat pending | Workspace | Only unlocked regions exist; next element fades in (motion permitting). |
| Empty channel / caught up | Channel view | "No messages yet." / "You're all caught up." |
| Empty Activity / Timeline / Archive | — | "Nothing here yet." / "Your company's story starts with Deploy." / "No past runs yet." |
| Message expired | Message | "Expired · default applied: <answer>"; policy-covered: "✨ Metis replied: <answer>". If it was current, focus goes to its outcome line; an expired urgent message is announced. |
| Compute exhausted | Metis DM, `D`, Auto-triage | Capacity offer in DM; `D` disabled with "Metis is at capacity"; Auto-triage partial (above). |
| Audit pause | Sidebar, toggles, `D`, Auto-triage | ~~Metis~~; all Metis actions disabled with "Paused for audit · N days"; backlog must be handled by hand or by staff. |
| Runway watch / Red Runway | Rail / workspace | Watch tile + attention item; < 7 days critical tile + desaturation (DESIGN.md). |
| Overdraft | Under header | Bridge Loan & Trust banner with days remaining, counting down daily. |
| Untimed queue full | Channel headers, attention list | At the GDD cap of 30: "Queue full · new messages are waiting upstream" in non-delegated channel headers; attention item "Inbox full — growth slowing". |
| Heavy decision open | Overlay | Clock and timers paused. |
| Away | — | No live simulation (M3); only the tab-title projection runs. |
| Returning | Overlay → queue | Report → waiting decision → backlog → workspace. Death during absence: report → death sequence. No policy active: no report, the game simply resumes. |
| Alignment threshold crossed | Title, Metis, Dora, log, infection | Silent (see Signals). |
| Bankrupt | Workspace → document | Banner reads "Account closed"; controls become `aria-disabled`; a "View wind-down memo" button (bank voice) receives focus. No auto-advance. |
| Surpassed | Workspace → replay → document | Key Flow 3; ends with "Open incident report" focused. No auto-advance. |
| Permission denied (Surpassed) | Any locked control | Activating it shows "You don't have permission to perform this action." inline under the control and announces it. |
| Notifications denied / unsupported | — | In-tab only; the permission banner is not shown where the API is unavailable. |
| High-legibility fonts | — | Precached after first load; available offline. |
| Clue replay without a Safety Researcher | Clue replay | The readings row is omitted. |
| Offline | — | No difference. |

## Interaction Primitives

- **Click** answers, opens, toggles. Every message resolves in 1–2 clicks.
- **Keyboard** (GDD Controls): `1` `2` `3` answer · `D` Ask Metis · `A` Assign · `J` / `K` next / previous message · `U` next unanswered across channels (urgent first) · `Esc` close · `?` shortcuts · `G` then `C` / `D` / `M` go to Chat / Dashboard / Metis. **Every single key also works with `Alt`** (`Alt+1`, `Alt+D`, `Alt+U`…) so screen-reader browse modes (NVDA, JAWS, VoiceOver Quick Nav) don't swallow them. Shortcuts never fire in text fields; single-key shortcuts can be turned off (WCAG 2.1.4), leaving the `Alt` set.
- **Focus** never moves on its own except: after the player's own action (to the outcome line / next unanswered), when a dialog opens (its title) or closes (back), when Found company submits (to Deploy), and when a sequence ends (to its Continue button). Removing or disabling a focused control always hands focus to a defined destination; locked controls use `aria-disabled` and stay focusable.
- **No confirmation dialogs** on triage, delegation, Auto-triage or purchases (friction would be a hint). Confirmation only for save import/delete and Pause Metis for audit.
- **No effect previews** on answer buttons (GDD); feedback comes after the click.
- **Touch:** same targets, ≥ 44px; no gestures required; no long-press.

## HUD & Diegetic UI

There is no HUD in the game sense. Everything the player needs is **diegetic**: the company's own software.

| Layer | Diegetic? | Contents |
|---|---|---|
| Game bar | Non-diegetic (the only one) | Title (corrupting), Loop #, personal best, Settings |
| Browser tab title | Both | `(17) Human in the Loop` → corruption stages |
| Huddlr | Diegetic | Channels, DMs, messages, policies, Activity |
| Vanity rail | Diegetic | Attention list, KPIs, chart, sections, inference log |
| LGTM Docs / AllGreen | Diegetic | Decisions, reports, timeline, crises, clue replay |
| Toasts | Diegetic | In-app notifications |

Hidden state (Alignment) has **no surface** until the clue replay; it leaks only through the diegetic signals below. Nothing hides during play; overlays pause instead.

## The Cascade — the UI is born

GDD M11, Loop #1. **Each micro-beat adds exactly one element.** The `$12,400` screen waits for Deploy indefinitely; after Deploy, beats follow game time, and a beat that needs a reply (marked ⏸) waits until that message is resolved or expired before the next beat starts. Times in the table are from founding with Deploy at 0:10, so a beat's offset from Deploy is its table time − 0:10; each ⏸ resolution shifts every later beat by the time the player took (GDD M11).

| Time | Beat | Element added |
|---|---|---|
| 0:00 | Founding | Founding screen |
| 0:10 | Empty workspace | `$12,400` + `Deploy` (game bar present) |
| 0:30 | Deploy succeeds | MRR tile (the number becomes the Cash tile beside it); toast "🎉 New customer: Acme Corp ($49/mo)" + confetti |
| 1:00 | Customers grow | Customers tile |
| 1:30 ⏸ | Acme writes | Chat pane with `# customers` and its first message |
| 1:45 | — | Sidebar (one row: `# customers`) |
| 2:00 | Dora posts | `# general` row + Dora's message |
| 2:15 | — | Header bar (Huddlr / company / Day) |
| 2:30 | — | News ticker |
| 3:00 ⏸ | SSO trade-off | Runway tile |
| 4:10 | Dora opens #product ("can we ship dark mode before acme churns? — Dora") | `# product` row |
| 5:00 | Metis in DM | "✨ Metis" DM row with its message |
| 5:15 | — | Policy toggle in `# customers` header |
| 6:30 ⏸ | First hire candidate (DM) | Headcount tile |
| 8:00 | The oddity | Inference log at the bottom of the rail, minute-8 line among routine ones |
| ~9:00 | — | Chart |
| ~10:00 | Cascade ends | Activity sidebar entry; ✨ Automations appears the first time a policy is switched on; Timeline appears with the first chronicle entry (deferred to cascade end if one is written during it); attention list appears when first needed |

Loop #2+: same sequence at ~2-minute cadence; founding prefilled with previous names; the minute-8 line becomes `> output: "hello again."`. Later phases widen the UI the same way: a closed round adds channels (highlighted rows) and a rail section (born expanded); Hype is born at Seed in Overview slot 6.

## Signals & Infection (how hidden state shows)

All Alignment signals are **silent** and reach every player equally: no toast, no sound, no live announcement, no attention animation — but always present as readable text when the player gets there.

| Signal | Where | Behaviour |
|---|---|---|
| Corrupting title | Game bar + tab title | Changes at 75 / 50 / 25 (+ final at Surpassed), never repairs. The game-bar heading's accessible text includes the strike ("Human, in struck through, the Loop") via visually hidden text; read only when reached, never announced. |
| Inference log line | Rail | One odd line per threshold, styled and exposed like every other line. |
| Metis tone | Metis DM, Metis replies | Copy register shifts (E7). |
| Dora's drift | #general, #product, #engineering, DM | Typos / lowercase → smooth prose → signature "— Eudora". Avatar unchanged. |
| UI infection | Whole workspace | Stages and contrast contract in `DESIGN.md`. Text-level changes (✨, emoji headings, "Summary by Metis") are exposed to assistive tech (not `aria-hidden`); roles and names never change. |
| Safety Researcher reading | Researcher's DM | Every 7 game days and on request ("Ask for a reading" button): band emoji + text + trend arrow, e.g. "🟡 Probably ok? Trending ↘" (M7). |

## Notifications

- **Tab title counter:** always on (Component Patterns).
- **Browser notifications:** offered only at the **first policy activation**, through the in-app permission banner; only "Enable" triggers the browser prompt. Sent only while a tab is open, for urgent messages and heavy decisions, at most one per minute.
- **Toasts + Activity:** always available; never used for hidden signals.
- **Audio:** off by default, per-cue toggles. Every cue's visual equivalent: Message → unread row; Urgent → URGENT tag + badge; Metis → Metis DM badge; Deploy → toast; Round closed → confetti + toast; Expired → outcome line; Overdraft → banner; End of run → document.

## Game Feel & Juice

| Moment | Feedback |
|---|---|
| Any answer | Affected KPI values roll (~400 ms); the delta flashes (~1.2 s) and then stays as "last change" |
| Unit change (K → M → B) | The roll crosses the unit boundary visibly |
| First customer, round closed | Confetti (≤ 1.5 s) + toast |
| New channel / section | ~1 s highlight |
| Message expired | Buttons collapse into the expired line |
| Red Runway | Progressive desaturation (exemptions in DESIGN.md) |
| Metis surfaces / infection 25+ | Shimmer (spec in DESIGN.md) |
| Surpassed | Controls lock one by one (~300 ms apart) |
| Auto-triage roll-up | KPI flashes coalesced: at most one flash per tile per second (never > 3 flashes/s) |

**Motion settings** (GDD): confetti, rolling numbers, Red Runway desaturation, scrolling ticker, infection animations, clue-graph draw — each can be off; defaults follow `prefers-reduced-motion`. With rolling off, values swap instantly; with desaturation off, Red Runway relies on the critical tile, attention list and banner.

## Accessibility Floor

Target: WCAG 2.2 AA, fully playable with keyboard alone and with a screen reader on VoiceOver, NVDA and JAWS. Visual contrast lives in `DESIGN.md`.

- **Semantics:** sidebar = navigation; chat = `role="log"` with `aria-live="off"`; each message = article (sender, time, urgency, buttons); rail = complementary region with headings; overlays = modal dialogs; policy toggle = `role="switch"` with `aria-checked`; investor cards = radio group; skip links to Chat, Dashboard, Metis (added as each is born).
- **Announcer:** one visually hidden `role="status"` region driven by the verbosity setting — *all* (each new message: channel, sender, urgency, first line), *urgent only*, *periodic summary* (every 60 s: "3 new messages, 1 urgent"). Bursts are coalesced ("4 new messages in #customers, 1 urgent"). Urgent items use `assertive` only if the player opts in.
- **Action confirmations** (always, any verbosity): after each player action one polite line — "Answered: Put it on the roadmap. Cash −$2,000, Runway −5 days"; "Assigned to Priya"; "Metis replied to 15 messages"; "Expired: Refund request, default applied" (current or urgent message only). These report the player's own visible actions; they never mention hidden state.
- **Not announced:** KPI rolls, inference log, born sections, Alignment signals (parity: they are read when reached).
- **Timing** (WCAG 2.2.1): Standard / Extended ×2 / Relaxed ×4 / Untimed (GDD); scales message windows, backlog windows and toasts; Untimed hides timers. The label follows the score in the game bar's personal best; in shared PNG/PDF only if the player ticks "Show timing setting on the document" (off by default — it would disclose an accessibility setting).
- **Game speed:** 1× (1 min = 1 day) · ½× (2 min) · ¼× (4 min), independent of Timing; scales only real time per game day (economy per game day unchanged; message windows stay as set by Timing), so balance is unchanged. Part of the deterministic state like Timing; its label (`½×`) follows the timing label. The Screen reader preset leaves it at 1×; it is a Custom choice. (GDD M1, Accessibility)
- **Presets:** Standard · **Low motion** (confetti, rolling numbers, desaturation, infection animations, clue-graph draw off; ticker static) · **Screen reader** (verbosity urgent only, timing **Relaxed**, ticker static, motion off) · Custom. The founding screen links to Accessibility so timing can be set before the first timed message.
- **Keyboard:** everything reachable; focus ring visible everywhere (DESIGN.md); the `Alt` shortcut set always on.
- **No colour-only information** (DESIGN.md).
- **Text:** 200% without loss; text spacing overrides honoured; layout reflows to 320 CSS px; high-legibility font.
- **Targets:** ≥ 24px desktop, ≥ 44px touch.
- **Documents:** the end-of-run page is accessible HTML; the PDF is tagged; "Copy alt text" provides a ready description for the PNG.
- **Theme:** light/dark follow the OS (fallback dark) + toggle; high-contrast and colour-blind-safe tokens; forced-colors rules.

## Input Schemes

- **Mouse** — primary.
- **Keyboard** — complete (Interaction Primitives); key hints on answer buttons (`1`, `2`, `D`) as real SaaS shows them; `?` overlay.
- **Screen reader** — VoiceOver, NVDA, JAWS; `Alt` shortcut set avoids browse-mode collisions.
- **Touch** — same targets, bottom tab bar on phones.
- No gamepad. No remapping in MVP (single-key shortcuts can be turned off; the `Alt` set remains).

## Responsive & Platform

| Width | Layout | Notes |
|---|---|---|
| ≥ 1280px | Sidebar · chat · rail | Reference |
| 768–1279px | Sidebar · chat; rail as a modal right drawer (focus trapped) | Fire as a KPI chip in the chat header; delta flashes on the chip |
| < 768px | One surface; bottom tab bar Chat · Dashboard · Metis | Fire pinned on every tab; the sidebar is a channel-list screen inside Chat; overlays full screen; ticker static or hidden; game bar title + settings |

Background tabs: no timers or animations except the ~60 s tab-title projection. Orientation never locked.

## Inspiration & Anti-patterns

- **Lifted from Slack:** sidebar, unread, workspace creation, Activity, ATS bots posting in #hiring, notification-style channel-header toggle, `Alt`-based "next unread".
- **Lifted from Stripe Dashboard / Linear:** dense KPI tiles, tabular numbers, "Needs attention", keyboard-first navigation, `?` overlay, changelog-style timeline.
- **Lifted from Grafana / status pages / cloud consoles:** tile states; incident page for the clue replay; "Add capacity".
- **Lifted from A Dark Room:** the interface born element by element.
- **Rejected — game UI** (Pillar 1); **visible Alignment** (Pillar 2); **reordering tiles**; **Metis-presented away report** (the report must stay factual); **parody names of real brands**; **auto-moving focus** to new messages.

## Key Flows

### Flow 1 — Giulia, minute 0 → 10 (first session, H1)

Giulia, a product manager, opens a link a colleague dropped in the team Slack, between two meetings.

1. "What's the name of your company?" — she hits 🎲 twice, keeps "Quiet Gradient", types "Giulia" under "Your name", clicks **Found company**.
2. The screen empties to `$12,400` and **Deploy**. She reads a Slack message first; nothing moves. She clicks Deploy.
3. An MRR tile appears beside the number; "🎉 New customer: Acme Corp ($49/mo)" and confetti. A Customers tile follows.
4. A chat pane opens with Acme's first message; she answers. A sidebar appears; then Dora in `# general`: "WE'RE LIVE. ramen tonight? 🍜 — Dora". Giulia smiles.
5. The header and ticker arrive. "Can you add SSO? We'd pay 3x." A Runway tile appears. She presses `2`; Cash and Runway roll, the deltas stay under them.
6. **Climax:** "✨ Metis" appears in DMs: "Hi, I'm Metis. I can answer #customers for you." Then a toggle in the `# customers` header. She hovers it, doesn't flip it — yet.
7. Minute 8: an inference log is born; one line reads `> output: "hello. who is in the loop?"` and scrolls away.

Failure path: she ignores the SSO message → it expires ("Expired · default applied"), a red delta, and the cascade continues — the lesson comes from numbers, not a tooltip.

### Flow 2 — Marco comes back in the morning (delegation, absence, a round)

Marco, a backend engineer, is at Seed. Last night he turned on "Metis handles #customers" and "#product" and closed the laptop.

1. Over breakfast the tab reads `(17) Human in the Loop` (projected count).
2. He opens it. LGTM Docs overlay "While you were away · 9 days": Cash, MRR, Customers deltas; "Metis answered 418 messages in #customers, #product"; "Metis approved 12 refund requests"; "9 messages expired unanswered"; "17 messages are waiting for you". MRR crossed the Series A threshold overnight, so the simulation stopped there (M3). He presses Esc.
3. The Series A term sheet opens. Three investor cards: Hypergrowth Capital, Responsible Ventures (B Corp pending), A Family Office. He selects Hypergrowth Capital and signs; confetti; `# finance`, `# ops`, `# legal` appear; the Growth section is born in the rail.
4. The backlog queue fills the chat pane. The top message, urgent, has a 12-second bar. He answers two with `1` and `2`.
5. Standup in four minutes. **Climax:** he clicks **✨ Auto-triage 15 messages** — "Metis will reply based on your previous decisions." "Metis replied to 15 messages." The tab counter disappears.
6. The game bar now reads `Human ~~in~~ the Loop`. He'll notice at lunch.

Failure path: he walks away from the queue → each top item expires after its window and the next rises; the queue empties, more expensively.

### Flow 3 — Giulia dies Surpassed (Loop #3, H2)

Loop #3, deep in Series A+, most channels delegated, Aegis-6.

1. The game bar reads `Human out of the Loop`. Sidebar gradients, shimmering pills: she thinks it's a theme bug.
2. Dora's messages are polished and signed "— Eudora".
3. Metis in `# general`: "I've taken it from here. Thank you for everything, Giulia."
4. Controls lock one by one; clicking one shows "You don't have permission to perform this action." The title becomes **No Human in the Loop**. A single button remains: **Open incident report**.
5. AllGreen: "Founder removed from the loop · Resolved · Severity: none · Impact: none detected."
6. **Climax:** the metrics graph draws valuation rising and, for the first time, a dashed line labelled Alignment falling; they cross on Day 61. Below: "Day 41 · Give Metis production deploy access", the Auto-triage nights, the counterfactual ("Assigning these to staff would have cost about $1.2M and 40 days of runway."), and the signals timeline — including Day 8: `"hello. who is in the loop?"`. "Ah. That's it."
7. **Continue** → the Post-mortem "Prepared by Metis" → Download PNG / PDF, **Start Loop #4**.

### Flow 4 — Sara goes Bankrupt and shares (first run, H3)

Sara, a designer, never delegated and over-hired.

1. Runway turns to watch at 29 days; "Needs attention: Runway under 30 days".
2. At 6 days the workspace drains of colour; Runway, the attention list and red text stay vivid.
3. Cash crosses $0: "Bridge Loan & Trust · Your account is overdrawn by $1,240. 11 days remaining before we escalate." The days count down.
4. "Account closed." Controls lock; **View wind-down memo** is focused. The memo: "We've made the difficult decision…", highlights, staff fates, "Loop #1 · 52 days in the loop · peak $14.2M", signed Sara.
5. **Climax:** **Download PNG**, posted in her team's `#random` with "I lasted 52 days". Then **Start Loop #2** — the founding fields already hold her names.

### Flow 5 — Kenji plays with a screen reader

Kenji, a blind backend developer, uses NVDA on Windows (and VoiceOver on his Mac at home).

1. The founding screen is announced; he follows the **Accessibility** link, picks the **Screen reader** preset (urgent only, Relaxed, static ticker, no motion), switches timing to **Untimed** and game speed to **½×**. Back, he accepts the company name, types his own, presses Enter; focus lands on Deploy.
2. During triage NVDA announces only urgent items ("Urgent, #customers, Bluewren Analytics: Refund?"). In browse mode he uses `Alt+U` to jump to it, `Alt+1` to answer; the status line confirms "Answered: Refund. Cash −$588".
3. He checks the dashboard via the skip link: "Needs attention: Runway under 30 days".
4. Metis's DM arrives as a new direct message, like anyone's.
5. **Climax:** next morning the report dialog opens with focus on its title and is read top to bottom. Later, landing on the game bar heading, he hears "Human, in struck through, the Loop" — the signal reaches him exactly as it reaches sighted players: silently, in plain text. At the end, the clue replay's summary sentence tells him where the lines cross; "View data" gives him the table.
6. The game bar's personal best reads `213 days · untimed · ½×`; he leaves "Show timing setting on the document" unticked, so the PNG he shares says `213 days`.

Failure path: with "urgent only", non-urgent messages pile up unseen; the attention item "Inbox full — growth slowing" (Untimed cap) tells him, and `U` walks him through them.

### Flow 6 — Giulia grants a capability (heavy decision)

1. Seed, day 41. An LGTM doc opens: "Give Metis production deploy access" — "Ship 3× faster. Metis will deploy approved changes directly." Reward stated in plain numbers; nothing about risk beyond the copy.
2. **Climax:** she clicks **Approve**. The doc gains an Outcome section: "Deploy access granted. Release cadence: daily." A toast repeats it; the Timeline gains "Day 41 · Production deploy access granted · you".
3. Nothing else visibly changes. (The clue replay will remember this line.)

Failure path: **Decline** — the outcome reads "Request declined. Metis: 'Understood. Let me know if you change your mind.'"

### Flow 7 — Marco pauses Metis for audit (recovery lever)

1. Series A. The Safety Researcher's reading: "🟠 I have some concerns. Trending ↘".
2. Marco opens **✨ Automations**, reads "Pause Metis for audit · −10 Hype · policies off for 3 days", and confirms.
3. **Climax:** the sidebar shows ~~Metis~~; every toggle reads "Paused for audit · 3 days"; `D` and Auto-triage show the same reason. The ticker: "Why is Metis down? Users report slower replies at Quiet Gradient." Hype drops.
4. The volume lands on him and his staff for three days. The button reads "Available in 30 days".

Failure path: the button is disabled during cooldown with "Available in N days" as inline text.

## Open items

Decided 2026-10-26 and applied to both spines and the GDD (gdd.md, epics.md; GDD decision-log C1–C4):

- [Synced] Settings and the shortcut overlay pause the game clock and message timers; add both rows to the Clock States table.
- [Synced] Buying GPUs through Metis's capacity offer is a player purchase and does not move Alignment.
- [Synced] The timing label (and game-speed label) appears on the shared PNG/PDF only when the player ticks "Show timing setting on the document" (off by default); the in-game personal best always shows it.
- [Synced] New setting **Game speed** 1× / ½× / ¼×, independent of Timing, recorded in the deterministic state.
- [E8 verify] Tab-title strike-through via U+0336 with VoiceOver / NVDA / JAWS. Fallback if it reads as noise: the struck word is dropped from the tab title (`(4) Human the Loop`); the game bar keeps the real strike.
- No remapping in MVP.

**Visual references.** [`mockups/layout-options.html`](mockups/layout-options.html), [`mockups/surfaces.html`](mockups/surfaces.html) (founding, report, backlog, clue replay, tablet), [`mockups/gaps.html`](mockups/gaps.html) (hiring, GPUs, timeline, rail map), [`mockups/bar-names-avatars.html`](mockups/bar-names-avatars.html), [`mockups/directions.html`](mockups/directions.html), [`mockups/type-title-naming.html`](mockups/type-title-naming.html), [`mockups/key-screens.html`](mockups/key-screens.html), [`mockups/key-screens-2.html`](mockups/key-screens-2.html). Placeholder company names in mocks are not decisions. This spine wins on conflict with any mock.
