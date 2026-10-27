# Validation Report — Human in the Loop

> Snapshot of the spines before the Finalize fix pass; see .decision-log.md for resolutions.

- **DESIGN.md:** `/Users/tizianobasile/workspace/me/browser-game/_bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/DESIGN.md`
- **EXPERIENCE.md:** `/Users/tizianobasile/workspace/me/browser-game/_bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/EXPERIENCE.md`
- **Run at:** 2026-10-26

## Overall verdict

**Adequate. Fix the highs before architecture.** The pair is mechanically clean: all 212 `{path.to.token}` references resolve, DESIGN.md follows the canonical section order, the five Key Flows are well formed, and the core Pillar rules (no game UI, no visible Alignment, anti-slop, audio off by default, `$12,400` + `Deploy`) hold. It is not yet a complete contract for AI-driven development:

- Several GDD mechanics have no committed surface: hiring, GPU purchase, the chronicle and the rail's tile inventory.
- Interactive and disabled states, the icon set, and high-contrast and colour-blind-safe tokens are left open.
- The tab-title counter is described in ways that contradict each other.

Each of these gaps would be filled with generic defaults.

**Accessibility review.** The accessibility reviewer shifts the picture. It adds 2 critical focus-management findings, which the rubric review did not surface: automatic focus-follow onto new messages, and focus lost when the focused control collapses, expires or disables. As specified, the pair is **not yet AA-conformant**. The review gives a **conditional pass on intent**: the Accessibility Floor is ambitious and mostly right, the Ledger base tokens largely hold up, and the gaps are behavioural (focus, live regions, shortcuts, text alternatives) plus unspecified states such as infection stages, Red Runway and the unverified Ink, Ops and Paper palettes. Fix the two critical items and the high findings before architecture.

## Category verdicts

- Flow coverage — thin
- Token completeness — adequate
- Component coverage — thin
- State coverage — adequate
- Visual reference coverage — adequate
- Bloat & overspecification — strong
- Inheritance discipline — adequate
- Shape fit — strong

## Findings by severity

### Critical (2)

- **[Accessibility]** — Automatic focus-follow breaks keyboard and screen-reader play (§ EXPERIENCE.md → Interaction Primitives; WCAG 2.4.3, 3.2.1, 3.2.2)
  (EXPERIENCE → Interaction Primitives: "Focus follows the newest unanswered message … when the player is not already interacting"; WCAG 2.4.3 Focus Order, 3.2.1/3.2.2 unexpected context change; game-a11y "never move the player's cursor"). At Seed and Series A rates (one message every 5–10 s), focus will jump away while a screen-reader user is mid-sentence or deciding. "Not already interacting" is undefined for an AT user, whose pauses while listening look like idleness. Combined with "`1`/`2`/`3` answer the focused/top message", a key press can land on a different message than the one just heard.
  Fix: never move DOM focus on message arrival. Keep a visible "current message" pointer that moves only on `J`/`K`, on click, or after the player's own answer. Make shortcuts act only on the focused or current message, never on an implicit "top". Turn auto-follow off in the Screen reader preset at the very least; preferably remove it.

- **[Accessibility]** — Focus is lost when the focused control disappears or disables (§ EXPERIENCE.md → Message, Backlog queue, Auto-triage, Surpassed, Bankrupt, audit pause; WCAG 2.4.3, 2.1.1)
  (Message: buttons collapse into an outcome line on answer or expiry; the backlog's top item expires and the next rises; Auto-triage empties the queue; Surpassed "controls lock one by one"; Bankrupt "controls disable"; audit-pause toggles disabled; `D` disabled at capacity; WCAG 2.4.3, 2.1.1). Removing or `disabled`-ing the element that has focus drops focus to `<body>`. The next Tab press restarts from the top of the page, and a screen-reader user gets no cue. Expiry can happen *while the user is on the button*.
  Fix: specify a focus destination for every removal: the outcome line (made focusable with `tabindex=-1`), then the next unanswered message, then the new top backlog item, then the restored channel. Use `aria-disabled="true"` (focusable, announced) instead of `disabled` for capacity, audit and Surpassed locks, so the "You don't have permission…" text can be reached and announced.

### High (19)

- **[Flow coverage]** — Hiring (M9) has no surface (§ EXPERIENCE.md → The Cascade (6:30); Component Patterns → Assign)
  The spines never say how a candidate is presented (traits, salary), how the player hires or declines, or how the Safety Researcher hire works. They also leave out the named cap rolling into anonymous headcount ("Engineering (34)") and the resignation pattern. Only "Talent tile (DM from candidate)" (EXPERIENCE.md → The Cascade, 6:30) and the Assign picker (Component Patterns, Assign) exist.
  Fix: commit to the hire being a candidate DM with answer buttons (e.g. "Hire · $350/day" / "Pass") that list traits in plain text. Specify the Team rail section's anatomy (named rows, morale word, headcount groups) and the resignation message. Add a short Key Flow or State rows.

- **[Flow coverage]** — Buying Compute / GPUs (M4) has no surface (§ EXPERIENCE.md → State Patterns (Compute exhausted); DESIGN.md → Do's and Don'ts)
  The only hint is "+ actions" in the Compute-exhausted state (EXPERIENCE.md → State Patterns). Rent-a-Brain is named only in the Do's list (DESIGN.md → Do's and Don'ts). Compute is one of four visible resources and a link in the growth loop.
  Fix: commit to where purchases happen (for example an Infrastructure rail-section action, a Rent-a-Brain quote message, or the Metis capacity DM). Specify its copy, its confirmation (or explicit lack of one) and its feedback.

- **[Flow coverage]** — The chronicle (M13) is missing from both spines (§ DESIGN.md and EXPERIENCE.md (IA table); GDD M13)
  (the word "chronicle" appears zero times). Pillar 3 says "a run produces a readable … chronicle", and the GDD describes it "in workspace idiom (a changelog / company timeline)".
  Fix: decide whether the chronicle is a player-viewable surface or only feeds the end-of-run highlights. A viewable surface could be an LGTM Docs "Company timeline" reached from the sidebar or rail. Add the decision to the IA table either way.

- **[Flow coverage]** — The rail's content inventory is uncommitted (§ DESIGN.md → Components → Dashboard rail; EXPERIENCE.md → Component Patterns → KPI tile)
  "Tiles keep fixed positions and never reorder" (DESIGN.md → Components → Dashboard rail; EXPERIENCE.md → Component Patterns, KPI tile), but the spines never define:
    - which tiles exist in Overview, and their slots;
    - which metrics live in the Team, Infrastructure and Growth sections;
    - where Hype (hidden until Seed), GPU utilisation, Customers, Headcount, implied valuation, peak valuation and the enterprise pipeline appear.
  Fix: add a per-phase rail map (metric → tile or section → slot order → phase born), derived from GDD Level Types.

- **[Token completeness]** — Backlog previews fail AA contrast (§ DESIGN.md → Components → Backlog queue)
  They are rendered in `{colors.ink-muted}` at 60% opacity (DESIGN.md → Components → Backlog queue), which measures **2.46:1 light / 2.93:1 dark**, below the 4.5:1 WCAG 2.2 AA requirement for text the player must read.
  Fix: keep `ink-muted` at full opacity (5.4:1) and signal "waiting" through size, single-line truncation or weight.

- **[Token completeness]** — High-contrast and colour-blind-safe variants have no tokens (§ DESIGN.md → Colors; GDD → Accessibility → Contrast)
  DESIGN.md → Colors says they are "derived per theme in E8". The GDD makes both MVP settings (Accessibility → Contrast).
  Fix: define at least the Ledger high-contrast and colour-blind-safe sets in frontmatter (e.g. `ok-cb`, `critical-cb`, `*-hc`), with measured contrast.

- **[Component coverage]** — DESIGN.md never specifies interactive states (§ DESIGN.md → Components (answer-button, primary-button, outlined buttons, policy-toggle, sidebar row); EXPERIENCE.md → Component Patterns and State Patterns)
  Hover, pressed, focus and disabled are missing for answer-button, primary-button, the quieter outlined buttons (Ask Metis, Assign), policy-toggle and sidebar-row hover. The disabled look carries weight: the Surpassed lock, the disabled `D` key when Compute is exhausted, and toggles during audit (EXPERIENCE.md → Component Patterns and State Patterns) all depend on it.
  Fix: add per-component state specs and tokens, plus the focus ring as a component.

- **[Component coverage]** — No icon set is named (§ DESIGN.md → Layout & Spacing → Mobile; Components → Founding screen; Components → Mobile tab bar; GDD → Asset Requirements)
  The GDD asks for "one icon set" (Asset Requirements), but the spines use ⚙, 🎲 and "icon + label" (DESIGN.md → Layout & Spacing, Mobile; Components → Founding screen; Components → Mobile tab bar) without choosing one. An AI developer will pick a default.
  Fix: name the set, its stroke and its size (e.g. Lucide 16/20px, 1.5 stroke), or commit to text plus a closed list of Unicode glyphs.

- **[State coverage]** — The tab-title counter is described in three ways that contradict each other (§ EXPERIENCE.md → Component Patterns → Browser tab title; State Patterns → Away; Responsive & Platform; Key Flows (Flow 2))
  - "Updates live in background tabs" (EXPERIENCE.md → Component Patterns, Browser tab title);
    - "No live simulation … tab title keeps showing the last count" (State Patterns, Away);
    - "the UI must not run timers … while hidden" (Responsive & Platform).

    Flow 2 opens on `(17)` before Marco returns. The counter is the game's re-engagement hook and drives the CPU ≈ 0 architecture.
  Fix: commit to one rule, either "frozen at the last count while hidden; recomputed on return" or a low-frequency projected count with a stated budget, and align Flow 2.

- **[State coverage]** — The cascade's trigger model is uncommitted (§ EXPERIENCE.md → The Cascade)
  Beats are listed by clock time (EXPERIENCE.md → The Cascade), but the spines don't say:
    - whether beats are gated on the player's action;
    - what happens to an idle player who never clicks `Deploy`;
    - what happens if the 1:30 customer or the 3:00 SSO message is ignored.
  Fix: mark each beat as time-triggered or gated on a named action, and add an idle state for the first screen.

- **[Accessibility]** — The chat live region conflicts with the verbosity setting (§ EXPERIENCE.md → Accessibility Floor (chat log region, verbosity); WCAG 4.1.3, 1.3.1)
  (Accessibility Floor: "chat = a log region" plus verbosity all / urgent only / periodic; WCAG 4.1.3, 1.3.1). `role="log"` is implicitly `aria-live="polite"` and announces every insertion, so "urgent only" and "periodic summary" cannot work on it. At 12–40 messages per minute, "all" floods the queue and goes stale.
  Fix: chat container `role="log" aria-live="off"`, plus one dedicated, visually hidden announcer (`role="status"`, polite; `assertive` only for urgent items if the user opts in) driven by the verbosity setting. Throttle and coalesce it ("3 new messages in #customers, 1 urgent"). Define which channels count: all, or only the active one.

- **[Accessibility]** — Single-key shortcuts collide with screen-reader browse-mode keys (§ EXPERIENCE.md → Interaction Primitives; Key Flows (Flow 5); WCAG 2.1.1, 2.1.4)
  (Interaction Primitives `1 2 3 D A J K G`; WCAG 2.1.1, 2.1.4; Flow 5 tests only VoiceOver). In NVDA and JAWS browse mode, `1`–`3` jump between heading levels, `D` goes to the next landmark (NVDA), `A` to the next radio button or annotation, and `K` to the next link. These keys never reach the page unless the user switches to focus mode, so "fully playable with a screen reader" fails on Windows. VoiceOver Quick Nav has the same issue when single-key mode is on.
  Fix: provide modifier alternatives (e.g. `Alt+1…3`, `Alt+D`, `Alt+A`, `Alt+J/K`) that are always active alongside the single keys, list them in the `?` overlay, and add an NVDA/JAWS variant of Flow 5. Keep the 2.1.4 off switch, and consider offering "shortcuts active only while a message has focus" (the second 2.1.4 option).

- **[Accessibility]** — No text alternative for the clue-replay metrics graph or the rail chart (§ DESIGN.md → Clue replay; Dashboard rail → Chart; Flow 3; WCAG 1.1.1, 1.4.1)
  (DESIGN → Clue replay "metrics graph … crossing point ringed"; Dashboard rail → Chart; Flow 3 climax; WCAG 1.1.1, 1.4.1). The reveal ("the lines cross on day 61") is the game's climax and is purely visual. Kenji's flow stops before it. The animated drawing also has no motion setting.
  Fix: give the graph an accessible name plus a text summary written as part of the incident page ("Valuation rose from $12.4K to $41M; Alignment fell from 100 to 0; they crossed on Day 61 …"), and a "View data" table (day, valuation, Alignment, marked decisions). Label lines directly (not by colour alone) and add a dashed or solid distinction. Put the draw animation under the motion settings. Give the rail chart the same summary-plus-table pattern.

- **[Accessibility]** — The title strikethrough is not programmatically conveyed, so the signal is lost for screen-reader users (a parity defect) (§ DESIGN.md → Game bar; EXPERIENCE.md → Flow 5 step 5; WCAG 1.3.1)
  (DESIGN → Game bar "real strike-through text"; Flow 5 step 5 "read as 'Human, in struck through, the Loop'"; WCAG 1.3.1). VoiceOver, NVDA and JAWS do not announce CSS `text-decoration`. `<s>` and `<del>` are reported only with non-default formatting or verbosity settings. As specified, a screen-reader user hears "Human in the Loop" unchanged at stage 75 and stage 50, so the signal is *more hidden* for AT users, not equally silent.
  Fix: render struck words as `<s>` with a visually hidden suffix ("in, struck through") or an equivalent accessible name on the title element, so the plain-text reading matches Flow 5. This is parity, not a leak: it is read only when the user reaches the title, never announced. Also make the game-bar title the page's first heading, so it is encountered at natural navigation points.

- **[Accessibility]** — Backlog previews at 60% opacity fail text contrast (§ DESIGN.md → Components → Backlog queue; WCAG 1.4.3)
  (DESIGN → Backlog queue "`ink-muted`, 60% opacity"; WCAG 1.4.3). They measure 2.46:1 in light and 2.93:1 in dark. These are live content the player reads to plan the queue (channel and sender), not disabled controls, so the "inactive component" exemption does not apply.
  Fix: drop the opacity and use `ink-muted` at full strength (5.41 / 5.77). Signal "waiting" through size, single-line truncation and the absence of buttons instead.

- **[Accessibility]** — Infection stages 25 and 10 leave text, state and focus contrast undefined, and the obvious implementations fail (§ DESIGN.md → UI infection; WCAG 1.4.3, 1.4.11, 2.4.7)
  (DESIGN → UI infection; WCAG 1.4.3, 1.4.11, 2.4.7). Measured cases:
    - Ink text on a gradient pill: 2.74–3.40.
    - `ink-muted` sidebar rows on a "faint" gradient: 3.69 at 25% in light (passes only at 12% or less).
    - The focus ring over gradient backgrounds: 1.02–1.78.
    - At stage 10, "gradients on headers and tiles" can erase the critical-tile tint and the watch and critical edges, which are the fire signal.
  Fix: add an infection contrast contract to DESIGN.md:
  - pill text is always white (≥ 4.6 on every stop);
  - sidebar gradient tint ≤ 10% opacity in light and ≤ 25% in dark, or use `ink` for row text;
  - KPI values sit on `surface` or `metis-tint`, never on a raw gradient;
  - watch and critical edges, labels and tints are exempt from infection (as they are from Red Runway);
  - the focus ring gains a 2px `surface` (or dark) outer halo, a double ring, so it reaches ≥ 3:1 on any background.

- **[Accessibility]** — Toasts auto-dismiss outside the Timing setting and have no announcement or history (§ EXPERIENCE.md → Toast (auto-dismiss after 6 s); WCAG 2.2.1, 4.1.3)
  (EXPERIENCE → Toast "auto-dismiss after 6 s (paused on hover/focus)"; WCAG 2.2.1, 4.1.3). Toasts carry deploy results, new customers and bank notices. A keyboard user cannot reach a toast before it vanishes, a screen magnifier user may never see the top-right corner, and Extended, Relaxed and Untimed do not scale it.
  Fix: scale the dismiss time with Timing (Untimed means persistent until dismissed), announce toasts through the polite status announcer (subject to verbosity), and keep an "Activity" or notifications list in Huddlr (a SaaS idiom) so nothing is shown only in a toast.

- **[Accessibility]** — No confirmation is announced after answering, expiring, Ask Metis, Assign or Auto-triage (§ EXPERIENCE.md → Message, Ask Metis, Auto-triage, Game Feel; WCAG 4.1.3)
  (EXPERIENCE → Message, Ask Metis, Auto-triage, Game Feel; WCAG 4.1.3). Sighted players get collapsing buttons, rolling KPIs and delta flashes. Screen-reader users get nothing, because "KPI changes are not announced individually" and verbosity "urgent only" suppresses the rest. Expiry of the message under the user's focus is likewise silent.
  Fix: after each player action, one polite status message: "Answered: Put it on the roadmap. Cash −$2,000, Runway −5 days". After an expiry of an urgent message: "Expired: Refund request, default applied". After Auto-triage: "Metis replied to 15 messages". These are outcomes of the player's own visible actions, not hidden signals, so they do not leak Alignment.

- **[Accessibility]** — No way to reach urgent messages in other channels (§ EXPERIENCE.md → Interaction Primitives (J/K); Flow 5 step 3; WCAG 2.1.1, 2.4.1)
  (Interaction Primitives `J`/`K` "next/previous message"; Flow 5 step 3; WCAG 2.1.1, 2.4.1 in spirit). Announcements say "Urgent, #customers, …", but `J`/`K` move within the open channel and `G C` only reaches Chat. Mouse users click the red badge.
  Fix: add "jump to next unanswered" and "next urgent" across channels (Slack's `Alt+Shift+↓` idiom, e.g. `U` plus a modifier variant), list it in `?`, and use it in Flow 5.

### Medium (37)

- **[Flow coverage]** — Heavy-decision outcomes are not specified (§ EXPERIENCE.md → Key Flows (Flow 2); GDD → Management Mechanics)
  Risky releases and crises are probabilistic (GDD → Management Mechanics), but no pattern shows success or failure after the click. No flow covers a capability grant or a crisis; Flow 2 covers only a term sheet.
  Fix: add an outcome pattern (e.g. the doc gains an "Outcome" section, or the AllGreen status changes, plus a toast). Add a short flow for a capability grant ("Give Metis production deploy access").

- **[Flow coverage]** — The Untimed queue cap has no surface (§ EXPERIENCE.md → Accessibility Floor → Timing; GDD (Untimed queue cap))
  The GDD's "visible queue cap of 30; beyond it, new messages … wait upstream" is not covered; EXPERIENCE.md → Accessibility Floor → Timing only hides timers.
  Fix: specify where the cap is shown and what "waiting upstream" looks like.

- **[Flow coverage]** — Pause Metis for audit, the only active Alignment recovery lever (Pillar 2), has no flow (§ EXPERIENCE.md → Key Flows (Flow 3); Component rows; GDD Pillar 2)
  Component rows exist, but the player journey does not: discovering the action, confirming it, the 3-day pause and the cooldown.
  Fix: add a short flow or extend Flow 3 with a failed audit attempt.

- **[Token completeness]** — The Ink, Ops and Paper palettes exist only as a prose table (§ DESIGN.md → Colors → Theme palettes)
  (DESIGN.md → Colors, "Theme palettes"). Consumers cannot source-extract them, and the table is incomplete: no `surface-raised`, `line-control`, `on-accent`, `on-critical`, tints, Metis lines or sidebar.
  Fix: move them to frontmatter (theme-prefixed keys or one file per theme) with full key parity to Ledger. Alternatively, state a derivation rule plus the AA gate.

- **[Token completeness]** — Dark-mode resolution for component tokens is implicit (§ DESIGN.md → components frontmatter; sidebar and sidebar-dark tokens)
  Every `components` entry references only unsuffixed tokens, and no rule says `{colors.x}` resolves to `x-dark` in dark mode. `sidebar-dark` has no light twin, yet the `sidebar` component uses `{colors.surface}`, so the dark sidebar colour is ambiguous.
  Fix: add one sentence to Colors ("component refs resolve to the `-dark` twin when one exists"). Add a `sidebar` light token or point the component at a sidebar token.

- **[Component coverage]** — EXPERIENCE.md names components that have no visual spec in DESIGN.md (§ EXPERIENCE.md → Component Patterns, Notifications and State Patterns (no matching DESIGN.md spec))
  - the staff picker (Assign);
    - investor cards (one sentence, no anatomy or selected state);
    - the in-app notification-permission banner (Notifications);
    - the tablet KPI chip and the rail drawer;
    - the text input and the 🎲 icon button;
    - the Safety Researcher's "Ask for a reading" button;
    - the chart (no frontmatter entry, axes, legend or hover);
    - the clue-replay graph.
  Fix: add a spec and a `components` entry for each.

- **[Component coverage]** — DESIGN.md has components with no behaviour rule in EXPERIENCE.md (§ DESIGN.md → Components (channel header, chart, investor cards, mobile tab bar, end-of-run document, clue replay, header bar); EXPERIENCE.md → Component Patterns)
  - channel header;
    - chart (update cadence, time range, readout, accessible data-table alternative);
    - investor-card selection (does a click select, then confirm?);
    - mobile tab bar (badges, fire pin);
    - end-of-run document (download buttons, what "Start Loop #N" does to the save);
    - clue replay (whether the graph animates, when Continue becomes available);
    - header bar.
  Fix: add a row for each to Component Patterns.

- **[State coverage]** — Two tabs open on the same save has no state (§ EXPERIENCE.md → State Patterns (no multi-tab state))
  This is likely for a game played as "a tab left open".
  Fix: one tab is active; any other shows a Huddlr-style "Huddlr is open in another tab · Use here" screen.

- **[State coverage]** — Save-error states are missing (§ EXPERIENCE.md → State Patterns (save errors))
  local save unreadable or corrupted, content-pack version mismatch on load, storage quota exceeded. Only the rejected import and the denied persistence request are covered (State Patterns).
  Fix: add rows.

- **[State coverage]** — Behaviour is unspecified for (§ EXPERIENCE.md → State Patterns (audit pause, Compute exhausted))
  - Ask Metis (`D`) and Auto-triage during an audit pause (State Patterns only covers the toggles);
    - Auto-triage when Compute is exhausted.
  Fix: commit to the behaviour for both.

- **[State coverage]** — Clock behaviour per surface is incomplete (§ EXPERIENCE.md → Component Patterns → Game bar; GDD M1 clock table)
  Settings pauses the clock (Component Patterns, Game bar), which is not in the GDD's M1 clock table. The shortcut overlay, Metis · Automations, the Archive, mobile tab switches and the tablet drawer are unstated.
  Fix: add a clock state per surface and flag the Settings pause for a GDD sync.

- **[State coverage]** — Backlog queue navigation is unstated (§ EXPERIENCE.md → Component Patterns → Backlog queue)
  can the player leave the queue for a channel, the rail or Settings while it is active, and what the rest of the workspace shows (Component Patterns, Backlog queue).
  Fix: commit to locked-in or free navigation and the matching return behaviour.

- **[State coverage]** — High-legibility fonts can't be enabled offline (§ DESIGN.md → Typography; EXPERIENCE.md → Foundation (offline play))
  They are "downloaded only when the setting is enabled" (DESIGN.md → Typography), but the game must be playable "offline after first load" (EXPERIENCE.md → Foundation), and no state covers enabling the setting offline.
  Fix: precache the fonts, or define an "Available when online" state.

- **[Visual reference coverage]** — `mockups/bar-names-avatars.html` still shows superseded or banned names (§ mockups/bar-names-avatars.html; DESIGN.md → Visual references)
  "10x Ventures", "Superintelligence Inc. (Stealth)" and "ClosedAI". Both spines say they win on conflict, but neither lists what the mocks get wrong, so an agent pulling copy from the mock reintroduces near-miss brand names.
  Fix: annotate the mock, or add a "superseded in mocks" list to DESIGN.md → Visual references.

- **[Inheritance discipline]** — The Metis avatar shape conflicts (§ .decision-log.md (Game bar, names, avatars); DESIGN.md → Shapes and Components → Avatars)
  .decision-log.md (Game bar, names, avatars) says "Metis is always the gradient orb with ✨"; DESIGN.md → Shapes and Components → Avatars say a "rounded square filled with the gradient".
  Fix: decide, then update the other document.

- **[Inheritance discipline]** — The sidebar contents conflict (§ .decision-log.md (Workspace layout); DESIGN.md → Components → Sidebar; EXPERIENCE.md IA)
  The decision log (Workspace layout) says "company switcher, channels, DMs, policies". DESIGN.md → Components → Sidebar has no switcher and no Automations entry, yet the EXPERIENCE.md IA says Metis · Automations is reached from the "sidebar".
  Fix: add the sidebar row (e.g. "✨ Automations") or remove it from the IA, and log that the switcher was dropped.

- **[Inheritance discipline]** — Cascade beats add several elements each (§ EXPERIENCE.md → The Cascade; GDD M11)
  GDD M11 says "each beat adds exactly one element". EXPERIENCE.md → The Cascade adds the rail, a Cash tile, an MRR tile and a toast at 0:30, and the header bar, sidebar and chat at 1:30.
  Fix: log this as a deliberate UX deviation approved by the GDD owner, or split the beats.

- **[Inheritance discipline]** — Flow 2 includes "Metis approved: Raise Team tier to $599" (§ EXPERIENCE.md → Key Flows → Flow 2, step 2; GDD (Team tier $499))
  (EXPERIENCE.md → Key Flows, Flow 2, step 2). The GDD fixes the Team tier at $499 and has no pricing-change mechanic. AI agents read flows as spec.
  Fix: replace it with a decision the GDD allows.

- **[Accessibility]** — Accent links on the rail canvas fail (§ DESIGN.md → Colors (accent on rail canvas bg); WCAG 1.4.3)
  (rail background = `bg`; accent/bg 4.35:1; WCAG 1.4.3).
  Fix: darken `accent` to about `#1A64D6` (≥ 4.9 on bg and ≥ 5.2 on surface), or put rail links on `surface`.

- **[Accessibility]** — A green positive delta inside a critical tile fails (§ DESIGN.md → Colors (ok on critical-tint); WCAG 1.4.3)
  (ok on critical-tint 4.42:1, light; WCAG 1.4.3).
  Fix: darken `ok` to about `#16733F`, or render deltas in a critical tile in `ink` with the +/− sign.

- **[Accessibility]** — Red Runway desaturation drops dark-mode critical text to 4.34:1 (§ DESIGN.md → Red Runway; WCAG 1.4.3)
  (URGENT tags and negative deltas outside the exempt tile, attention list and banner; WCAG 1.4.3). It also greys the focus ring until it is barely distinct from control borders (1.69 between them; it still reaches 5.58 against the surface).
  Fix: exempt critical-coloured text and the focus ring from the filter. Desaturating backgrounds, avatars and chart only is enough for the effect. Re-verify both modes after the change.

- **[Accessibility]** — The Ink, Ops and Paper palettes fail as listed (§ DESIGN.md → Colors → Theme palettes; WCAG 1.4.3, 1.4.11)
  (DESIGN → Theme palettes; WCAG 1.4.3, 1.4.11). See the theme table above for the per-theme numbers.
  Fix: add `line-control`, `on-accent-dark`, `on-critical-dark` and the tints per theme, and gate E8 on a scripted contrast check of every token pair in the table.

- **[Accessibility]** — High-contrast variant and forced-colors mode are undefined (§ DESIGN.md → Colors (derived per theme in E8); WCAG 1.4.11, 1.4.1)
  (DESIGN → Colors "derived per theme in E8"; WCAG 1.4.11, 1.4.1). Under Windows forced colors, background-only signals disappear: gradient pills with no border, the timer-bar fill, toggle tracks, unread badges, the KPI tint, and desaturation.
  Fix: specify `@media (forced-colors: active)` rules: borders on every control and pill, `Highlight` for the timer fill and the toggle-on state, and system colours for the focus ring. Define what infection does in high-contrast mode (✨, emoji and pill shapes only; no gradients), so the signal survives without losing contrast.

- **[Accessibility]** — The policy toggle state relies on track colour (§ DESIGN.md → policy-toggle; WCAG 1.4.1, 1.4.11)
  (on vs off 1.72 light / 1.12 dark; WCAG 1.4.1, 1.4.11).
  Fix: specify thumb position plus an on-state glyph (✓) or "On"/"Off" text, `role="switch"` with `aria-checked`, and the visible label as its accessible name.

- **[Accessibility]** — The colour-blind-safe variant swaps OK to blue, which collides with `accent` (§ DESIGN.md → Colors (colour-blind-safe variant); WCAG 1.4.1)
  (links, focus ring, chart growth line, selected states; WCAG 1.4.1).
  Fix: choose a teal or blue clearly distinct from accent, or move accent; keep +/− signs and underlined links mandatory in that variant.

- **[Accessibility]** — Fixed heights break 200% text and text spacing (§ DESIGN.md → Layout (gamebar-height, header-height, tabbar-height); WCAG 1.4.4, 1.4.12)
  (`gamebar-height: 28px`, `header-height: 40px`, `tabbar-height: 56px`, single-line badges and key caps; 2-column KPI grid in a 320px rail; WCAG 1.4.4, 1.4.12).
  Fix: make them `min-height` in rem, let the rail KPI grid drop to one column above about 150% text, and let truncated one-line previews expand on focus with the full text available to AT.

- **[Accessibility]** — Reflow at 320 CSS px is undefined for overlay internals (§ DESIGN.md / EXPERIENCE.md → overlays; WCAG 1.4.10)
  (term-sheet "three side-by-side cards", clue-replay graph, inference-log mono lines, shortcut table; WCAG 1.4.10).
  Fix: state that cards stack, the graph scales or falls back to its table, and log lines wrap. No horizontal scroll except the ticker animation.

- **[Accessibility]** — Sticky chrome stacks up and obscures focus (§ DESIGN.md → Layout (game bar, header, banner, tab bar); WCAG 2.4.11, 1.4.10)
  (game bar + header + overdraft banner + pinned fire + 56px tab bar, about 210px of a 256px-high viewport at 400% zoom; toasts top-right over the chat's top message; tablet drawer over chat; pinned Auto-triage; WCAG 2.4.11, 1.4.10).
  Fix: - set `scroll-padding` for all sticky regions;
  - collapse the banner and the pinned fire to one line (or unpin them) at short viewport heights;
  - position toasts so they never cover the focused message, or move them on focus;
  - make the drawer modal (trap focus) or push the content aside.

- **[Accessibility]** — Desktop target size is unspecified (§ DESIGN.md → Layout & Spacing (target size); WCAG 2.5.8)
  (44px is stated for touch only; 🎲, section collapse chevrons, toggles, ⚙ in a 28px bar, "Manage" links; WCAG 2.5.8).
  Fix: add a 24×24 CSS px minimum target (or the 2.5.8 spacing exception) for every desktop control to DESIGN.md.

- **[Accessibility]** — Dialog initial focus and reading are unspecified (§ EXPERIENCE.md → Overlay documents; WCAG 2.4.3, 1.3.1)
  (Overlay doc; Flow 5 "read top to bottom"; WCAG 2.4.3, 1.3.1).
  Fix: `role="dialog" aria-modal="true"`, `aria-labelledby` set to the doc title, and initial focus on the title (`tabindex=-1`), not on the primary button. Otherwise a screen-reader user lands on "Review 17 messages" with the report unread. Document that Esc does nothing in decision docs, and say so in the dialog.

- **[Accessibility]** — Auto-advancing end sequences can cut off content (§ EXPERIENCE.md → State Patterns (Bankrupt, Surpassed); WCAG 2.2.1, 4.1.3)
  (Bankrupt "after ~2 s the Wind-down memo opens"; Surpassed lock sequence → AllGreen page opens; WCAG 2.2.1, 3.2.5 practice, 4.1.3). A 2-second transition interrupts the announcement of "Account closed" or of Metis's last line.
  Fix: end each sequence with a user-initiated "Continue" (an "Open report" link in the bank or AllGreen voice), or wait for input. Move focus to the new page's h1.

- **[Accessibility]** — Cascade births and first-screen focus are unspecified for AT (§ EXPERIENCE.md → The Cascade (M11 beats), Founding; WCAG 2.4.3, 4.1.3)
  (M11 beats; Founding → `$12,400` + Deploy; new channels and rail sections; WCAG 2.4.3, 4.1.3).
  Fix: after "Found company", focus moves to Deploy (with `$12,400` as its description). New landmarks get labels and appear in skip links once born. Born sections are not announced (parity with sighted users noticing peripherally), but a new DM or channel follows the same verbosity rule as messages.

- **[Accessibility]** — The tab-title corruption has no plain-text format (§ EXPERIENCE.md → Component Patterns → Browser tab title; WCAG 2.4.2, 1.3.1)
  (Component Patterns: "Mirrors the corruption stages"; WCAG 2.4.2, 1.3.1). `document.title` cannot carry strike-through. Combining U+0336 ("H̶u̶m̶a̶n̶") is read letter by letter or as garbage by screen readers.
  Fix: define the exact tab-title string per stage, test it in VoiceOver, NVDA and JAWS, and choose a form that reads acceptably. Otherwise keep stages 75 and 50 in the tab title as plain wording and corrupt visually only in the game bar, provided the game bar carries the accessible equivalent from the high finding above.

- **[Accessibility]** — The ticker has no on-page pause control (§ EXPERIENCE.md → Ticker; WCAG 2.2.2)
  (hover or focus pause only; static mode buried in Settings; WCAG 2.2.2).
  Fix: add a small pause/play control in the ticker (a SaaS idiom); respect `prefers-reduced-motion` by default (already stated); include static and hidden options on desktop as well as mobile.

- **[Accessibility]** — Disabled controls carry their reason only in tooltips (§ EXPERIENCE.md → State Patterns (Compute exhausted, audit pause); WCAG 1.3.1, 1.4.13, 2.1.1)
  (`D` disabled with tooltip "Metis is at capacity"; toggles "Paused for audit · N days"; WCAG 1.3.1, 1.4.13, 2.1.1).
  Fix: with `aria-disabled`, put the reason in visible inline text or `aria-describedby`. Make the tooltips focus-triggered, dismissable (Esc) and hoverable.

- **[Accessibility]** — The end-of-run PNG and PDF have no accessibility spec (§ DESIGN.md → End-of-run documents; WCAG 1.1.1, 1.3.1)
  (DESIGN → End-of-run documents; WCAG 1.1.1, 1.3.1 via PDF techniques).
  Fix: generate a tagged PDF (title, `lang`, headings, list structure, reading order, the Metis mark as an artifact). Next to Download PNG, offer "Copy alt text" (a prepared description containing the header strip, cause and highlights). The page itself stays the accessible HTML version.

- **[Accessibility]** — Transient delta information (§ EXPERIENCE.md → KPI tile (delta flash, rolling numbers off); WCAG 2.2.1, 1.3.1)
  (static +/− label "for 2 s" when rolling numbers are off; delta flash ~1.2 s; WCAG 2.2.1, 1.3.1).
  Fix: keep each tile's last delta persistently visible (e.g. "+$2,000 since last change"), and make the flash only decoration on top. Keep flashes below 3 per second during Auto-triage roll-ups (2.3.1).

### Low (31)

- **[Flow coverage]** — The GDD's urgent affordance "Red badge / @mention" (M2) (§ EXPERIENCE.md → Component Patterns → Message; GDD M2)
  is only half addressed; @mention is never mentioned (EXPERIENCE.md → Component Patterns, Message).
  Fix: state whether @mentions exist and how they render.

- **[Flow coverage]** — The opt-in local stats export (E6) is missing (§ DESIGN.md → Components → Settings & Accessibility screen; EXPERIENCE.md IA)
  from Settings → Data (DESIGN.md → Components, Settings & Accessibility screen; EXPERIENCE.md IA).
  Fix: add the row.

- **[Flow coverage]** — The "Low motion" preset contents are undefined (§ EXPERIENCE.md → Accessibility Floor → Presets)
  , while the Screen reader preset is defined (EXPERIENCE.md → Accessibility Floor, Presets).
  Fix: list the settings it sets.

- **[Flow coverage]** — Flow 5 (Kenji) has no failure path (§ EXPERIENCE.md → Key Flows (Flow 5))

  Fix: add one, e.g. a missed non-urgent message under the "urgent only" verbosity, or the Untimed queue cap being reached.

- **[Token completeness]** — Some values bypass tokens (§ DESIGN.md → components (metis-button, attention-list); Elevation & Depth; EXPERIENCE.md → Accessibility Floor (focus ring))
  These are literals or prose:
    - `metis-button.color: '#FFFFFF'`;
    - `attention-list.edge` is written in prose;
    - the overlay shadow and the 45% scrim (DESIGN.md → Elevation & Depth);
    - the focus ring (EXPERIENCE.md → Accessibility Floor) has no component token.
  Fix: add `on-metis`, a `focus-ring` component and a `shadow-overlay` token.

- **[Token completeness]** — `{founder}` clashes with token syntax (§ EXPERIENCE.md → Component Patterns → Founding fields)
  This content placeholder (EXPERIENCE.md → Component Patterns, Founding fields) uses the same syntax as token references, so a resolver will flag it.
  Fix: write it as `<founder>` or `{{founder}}`.

- **[Token completeness]** — Several tokens are never referenced (§ DESIGN.md → colors and typography frontmatter (on-accent, ok-tint, watch-tint, *-tint-dark, metis-*-dark, typography.mono))
  `on-accent`, `ok-tint`, `watch-tint`, every `*-tint-dark`, `metis-*-dark` and `typography.mono`.
  Fix: state where each is used. The KPI watch state has no tint background, and no Ledger button uses an accent fill.

- **[Token completeness]** — Contrast is not stated for some pairs (§ DESIGN.md → Colors (contrast paragraph))
  - `metis-ink` on `metis-tint` (6.4:1 when computed — passes);
    - stage-25 infected answer buttons, including the mono key hints on the gradient;
    - desaturated text under Red Runway.
  Fix: add a line to the contrast paragraph.

- **[Component coverage]** — The disabled `D` key relies on a "tooltip 'Metis is at capacity'" (§ EXPERIENCE.md → State Patterns → Compute exhausted; GDD M11)
  (EXPERIENCE.md → State Patterns, Compute exhausted). There is no tooltip spec, and GDD M11 says "no tooltips".
  Fix: specify it as a standard SaaS disabled-reason tooltip with its own spec, or show the reason as inline text.

- **[Component coverage]** — The "outlined destructive-style button" for Pause Metis (§ DESIGN.md → Components → Policy & Metis settings page)
  (DESIGN.md → Components → Policy & Metis settings page) has no tokens.
  Fix: add a `button-destructive` entry.

- **[State coverage]** — Smaller missing states (§ EXPERIENCE.md → State Patterns (various surfaces))
  - PNG/PDF generation in progress and failure;
    - empty Archive;
    - browser notifications unsupported (iOS Safari without install);
    - founding-field validation (empty company name, over-length);
    - where Esc on the away report lands;
    - how "You don't have permission…" is displayed at Surpassed (toast or inline);
    - clue replay when no Safety Researcher was hired.
  Fix: add one-line rows.

- **[Visual reference coverage]** — Wireframe placeholder names aren't flagged (§ Wireframe mockups; EXPERIENCE.md → Key Flows (Flow 5); .decision-log.md)
  The decision log says "Ramen Labs" and "Bluewren Analytics" are not decisions; the spines don't say so, and Flow 5 uses Bluewren Analytics as a customer.
  Fix: note that mock company names are placeholders.

- **[Visual reference coverage]** — EXPERIENCE.md doesn't link `directions.html` or `type-title-naming.html` (§ DESIGN.md → Visual references; EXPERIENCE.md (links))
  DESIGN.md links them, so there are no orphans. No fix needed.
  Fix: None needed (acknowledged as acceptable in the review).

- **[Bloat & overspecification]** — EXPERIENCE.md restates some GDD numbers (§ EXPERIENCE.md → Foundation; timing and audit-cost sections)
  It says numbers are referenced by ID, not restated (Foundation), but it repeats the backlog 10–15 s window, the runway < 30 / < 7 thresholds, the timing multipliers and the audit costs. These will drift when tuning changes.
  Fix: cite the M-ID or the `[tuning]` key instead. The Inspiration & Anti-patterns section and the cascade timings do earn their place.

- **[Inheritance discipline]** — "Pre-Product Labs" (DESIGN.md → Do's and Don'ts) vs "Pre-Product Labs (Stealth)" (§ DESIGN.md → Do's and Don'ts; EXPERIENCE.md → Open items; .decision-log.md)
  (EXPERIENCE.md → Open items, decision log).
  Fix: use one form.

- **[Inheritance discipline]** — Assumptions are not reconciled (§ .decision-log.md (Flow 2 assumption); EXPERIENCE.md → Open items, Input Schemes)
  The decision log's Flow 2 assumption ("a Seed-round heavy decision waits") is not carried into Open items, and the flow shows a Series A term sheet. "No remapping [ASSUMPTION]" (Input Schemes) is still unconfirmed.
  Fix: reconcile both and tag them consistently.

- **[Inheritance discipline]** — The EXPERIENCE.md `sources` list omits `addendum.md` (§ EXPERIENCE.md frontmatter (sources); DESIGN.md frontmatter)
  , which DESIGN.md lists.
  Fix: align the two lists.

- **[Inheritance discipline]** — The game bar's "Best N days" sits against the Don't "score widgets … in the bar" (§ DESIGN.md → Do's and Don'ts (game bar))
  (DESIGN.md → Do's and Don'ts).
  Fix: clarify that plain-text personal best is allowed and widgets are not.

- **[Shape fit]** — EXPERIENCE.md section order departs from the game example (§ EXPERIENCE.md section order (Input Schemes after Accessibility))
  (Input Schemes comes after Accessibility). This is acceptable. The invented sections (The Cascade, Signals & Infection, Notifications, Open items) earn their place.
  Fix: None needed (acknowledged as acceptable in the review).

- **[Shape fit]** — Both spines are still `status: draft`, (§ DESIGN.md and EXPERIENCE.md frontmatter (status); DESIGN.md → Visual references)
  and DESIGN.md ends with a "Visual references" paragraph outside the canonical sections.
  Fix: set the status to final at hand-off; the trailing paragraph is fine.

- **[Accessibility]** — Infection parity is acceptable, but should be made explicit (§ EXPERIENCE.md → Signals & Infection)
  (Signals & Infection; game-a11y parity). Stages 50, 25 and 10 each include a text-level change ("✨ Summary by Metis", emoji headings such as "chart increasing Overview", sparkles in the ticker label). Screen-reader users therefore receive the signal silently, as sighted players do. The gradient, shimmer and pill changes are visual-only, which is fine.
  Fix: state in EXPERIENCE that emoji and ✨ are not `aria-hidden`, and that infection never changes roles or accessible names. Keep the inference log `aria-live="off"` (odd lines: parity, no leak).

- **[Accessibility]** — Shimmer and seizure safety are not quantified (§ DESIGN.md → Metis surfaces, infection stage 25+; WCAG 2.3.1, 2.2.2)
  (DESIGN → Metis surfaces, infection stage 25+; WCAG 2.3.1, 2.2.2).
  Fix: specify the shimmer as a low-luminance sweep (ΔL < 10%) slower than 3 Hz, never a flash. Keep the motion toggle (2.2.2 is satisfied through Settings plus `prefers-reduced-motion`). With shimmer off, the static gradient keeps the signal.

- **[Accessibility]** — Metis bubble borders fail 3:1 (§ DESIGN.md → Metis bubble (metis-line on metis-tint); WCAG 1.4.11)
  (metis-line on metis-tint 1.58, dark 1.92; 1.4.11). This is acceptable while the bubble is not interactive.
  Fix: if bubbles become clickable, use `metis-ink` for the border.

- **[Accessibility]** — Letter logos on avatar-1 and avatar-3 are at 3.93 and 3.97 (§ DESIGN.md → avatar-1, avatar-3 letter logos; WCAG 1.4.3)
  (1.4.3; the logotype exemption is arguable).
  Fix: darken those two fills slightly or use dark letters. The sender name is always present as text.

- **[Accessibility]** — The ok-tint and line-control/bg pairs pass with almost no margin (§ DESIGN.md → ok-tint, line-control/bg, toggle-on, metis-3 end stop)
  (4.52, 3.11; dark toggle-on 3.04; the white-on-metis-3 end stop 4.60).
  Fix: add about 0.3 of headroom so anti-aliasing and future token tweaks do not tip them under.

- **[Accessibility]** — Founding form semantics (§ EXPERIENCE.md → Founding fields; WCAG 3.3.1, 3.3.2, 4.1.2)
  (WCAG 3.3.1, 3.3.2, 4.1.2).
  Fix: make "What's the name of your company?" the field's label. Give 🎲 the accessible name "Generate another name" and announce the new name politely. Give the required "Your name" an inline error and `aria-invalid`.

- **[Accessibility]** — Unread badge semantics are ambiguous (§ EXPERIENCE.md → Component Patterns (unread badge); WCAG 1.4.1, 1.3.1)
  ("urgent ones also turn the badge on"; 1.4.1, 1.3.1).
  Fix: state that the badge appears only when an urgent item exists, and give sidebar rows an accessible name such as "#customers, 4 unread, 1 urgent".

- **[Accessibility]** — Rolling numbers (§ EXPERIENCE.md → KPI tile (rolling numbers); WCAG 1.3.1)
  (1.3.1).
  Fix: the accessible text of KPI values is always the final value; render the roll in an `aria-hidden` layer.

- **[Accessibility]** — Screen reader preset timing (§ EXPERIENCE.md → Accessibility Floor → Presets (Extended))
  (Presets: Extended). Screen-reader reading plus navigation is often more than twice as slow.
  Fix: consider Relaxed as the preset default, and surface "Accessibility settings" on the founding screen (a SaaS "Preferences" link), so the Timing setting can be chosen before the first timed message. Settings already pauses the clock.

- **[Accessibility]** — The score label discloses the accessibility setting in shared documents (§ DESIGN.md / EXPERIENCE.md → end-of-run documents (score label, GDD-mandated))
  (`213 days · untimed` in PNG and PDF; GDD-mandated; game-a11y practice). Some players will not want to share their Timing setting.
  Fix: raise with the GDD owner. Option: show the label in-game and in the personal best, and make it optional in the exported image.

- **[Accessibility]** — Orientation and game speed (§ EXPERIENCE.md → Responsive & Platform; WCAG 1.3.4)
  (WCAG 1.3.4; game-a11y).
  Fix: state that orientation is never locked. Note for the GDD owner: under Untimed the game clock (1 minute = 1 day) still runs, so slower readers burn runway faster. A "game speed" accessibility option, labelled like Timing, would close that gap.

## Reviewer files

- Rubric: `/Users/tizianobasile/workspace/me/browser-game/_bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/review-rubric.md`
- Accessibility: `/Users/tizianobasile/workspace/me/browser-game/_bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/review-accessibility.md`
