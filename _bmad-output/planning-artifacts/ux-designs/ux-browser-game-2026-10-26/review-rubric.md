# Spine Pair Review — Human in the Loop

## Overall verdict

**Adequate. Fix the highs before architecture.** The pair is mechanically clean: all 212 `{path.to.token}` references resolve, DESIGN.md follows the canonical section order, the five Key Flows are well formed, and the core Pillar rules (no game UI, no visible Alignment, anti-slop, audio off by default, `$12,400` + `Deploy`) hold. It is not yet a complete contract for AI-driven development:

- Several GDD mechanics have no committed surface: hiring, GPU purchase, the chronicle and the rail's tile inventory.
- Interactive and disabled states, the icon set, and high-contrast and colour-blind-safe tokens are left open.
- The tab-title counter is described in ways that contradict each other.

Each of these gaps would be filled with generic defaults.

## 1. Flow coverage — thin

### Findings

- **[high]** **Hiring (M9) has no surface.** The spines never say how a candidate is presented (traits, salary), how the player hires or declines, or how the Safety Researcher hire works. They also leave out the named cap rolling into anonymous headcount ("Engineering (34)") and the resignation pattern. Only "Talent tile (DM from candidate)" (EXPERIENCE.md → The Cascade, 6:30) and the Assign picker (Component Patterns, Assign) exist. *Fix:* commit to the hire being a candidate DM with answer buttons (e.g. "Hire · $350/day" / "Pass") that list traits in plain text. Specify the Team rail section's anatomy (named rows, morale word, headcount groups) and the resignation message. Add a short Key Flow or State rows.
- **[high]** **Buying Compute / GPUs (M4) has no surface.** The only hint is "+ actions" in the Compute-exhausted state (EXPERIENCE.md → State Patterns). Rent-a-Brain is named only in the Do's list (DESIGN.md → Do's and Don'ts). Compute is one of four visible resources and a link in the growth loop. *Fix:* commit to where purchases happen (for example an Infrastructure rail-section action, a Rent-a-Brain quote message, or the Metis capacity DM). Specify its copy, its confirmation (or explicit lack of one) and its feedback.
- **[high]** **The chronicle (M13) is missing from both spines** (the word "chronicle" appears zero times). Pillar 3 says "a run produces a readable … chronicle", and the GDD describes it "in workspace idiom (a changelog / company timeline)". *Fix:* decide whether the chronicle is a player-viewable surface or only feeds the end-of-run highlights. A viewable surface could be an LGTM Docs "Company timeline" reached from the sidebar or rail. Add the decision to the IA table either way.
- **[high]** **The rail's content inventory is uncommitted.** "Tiles keep fixed positions and never reorder" (DESIGN.md → Components → Dashboard rail; EXPERIENCE.md → Component Patterns, KPI tile), but the spines never define:
  - which tiles exist in Overview, and their slots;
  - which metrics live in the Team, Infrastructure and Growth sections;
  - where Hype (hidden until Seed), GPU utilisation, Customers, Headcount, implied valuation, peak valuation and the enterprise pipeline appear.

  *Fix:* add a per-phase rail map (metric → tile or section → slot order → phase born), derived from GDD Level Types.
- **[medium]** **Heavy-decision outcomes are not specified.** Risky releases and crises are probabilistic (GDD → Management Mechanics), but no pattern shows success or failure after the click. No flow covers a capability grant or a crisis; Flow 2 covers only a term sheet. *Fix:* add an outcome pattern (e.g. the doc gains an "Outcome" section, or the AllGreen status changes, plus a toast). Add a short flow for a capability grant ("Give Metis production deploy access").
- **[medium]** **The Untimed queue cap has no surface.** The GDD's "visible queue cap of 30; beyond it, new messages … wait upstream" is not covered; EXPERIENCE.md → Accessibility Floor → Timing only hides timers. *Fix:* specify where the cap is shown and what "waiting upstream" looks like.
- **[medium]** **Pause Metis for audit, the only active Alignment recovery lever (Pillar 2), has no flow.** Component rows exist, but the player journey does not: discovering the action, confirming it, the 3-day pause and the cooldown. *Fix:* add a short flow or extend Flow 3 with a failed audit attempt.
- **[low]** **The GDD's urgent affordance "Red badge / @mention" (M2)** is only half addressed; @mention is never mentioned (EXPERIENCE.md → Component Patterns, Message). *Fix:* state whether @mentions exist and how they render.
- **[low]** **The opt-in local stats export (E6) is missing** from Settings → Data (DESIGN.md → Components, Settings & Accessibility screen; EXPERIENCE.md IA). *Fix:* add the row.
- **[low]** **The "Low motion" preset contents are undefined**, while the Screen reader preset is defined (EXPERIENCE.md → Accessibility Floor, Presets). *Fix:* list the settings it sets.
- **[low]** **Flow 5 (Kenji) has no failure path.** *Fix:* add one, e.g. a missed non-urgent message under the "urgent only" verbosity, or the Untimed queue cap being reached.

## 2. Token completeness — adequate

### Findings

- **[high]** **Backlog previews fail AA contrast.** They are rendered in `{colors.ink-muted}` at 60% opacity (DESIGN.md → Components → Backlog queue), which measures **2.46:1 light / 2.93:1 dark**, below the 4.5:1 WCAG 2.2 AA requirement for text the player must read. *Fix:* keep `ink-muted` at full opacity (5.4:1) and signal "waiting" through size, single-line truncation or weight.
- **[high]** **High-contrast and colour-blind-safe variants have no tokens.** DESIGN.md → Colors says they are "derived per theme in E8". The GDD makes both MVP settings (Accessibility → Contrast). *Fix:* define at least the Ledger high-contrast and colour-blind-safe sets in frontmatter (e.g. `ok-cb`, `critical-cb`, `*-hc`), with measured contrast.
- **[medium]** **The Ink, Ops and Paper palettes exist only as a prose table** (DESIGN.md → Colors, "Theme palettes"). Consumers cannot source-extract them, and the table is incomplete: no `surface-raised`, `line-control`, `on-accent`, `on-critical`, tints, Metis lines or sidebar. *Fix:* move them to frontmatter (theme-prefixed keys or one file per theme) with full key parity to Ledger. Alternatively, state a derivation rule plus the AA gate.
- **[medium]** **Dark-mode resolution for component tokens is implicit.** Every `components` entry references only unsuffixed tokens, and no rule says `{colors.x}` resolves to `x-dark` in dark mode. `sidebar-dark` has no light twin, yet the `sidebar` component uses `{colors.surface}`, so the dark sidebar colour is ambiguous. *Fix:* add one sentence to Colors ("component refs resolve to the `-dark` twin when one exists"). Add a `sidebar` light token or point the component at a sidebar token.
- **[low]** **Some values bypass tokens.** These are literals or prose:
  - `metis-button.color: '#FFFFFF'`;
  - `attention-list.edge` is written in prose;
  - the overlay shadow and the 45% scrim (DESIGN.md → Elevation & Depth);
  - the focus ring (EXPERIENCE.md → Accessibility Floor) has no component token.

  *Fix:* add `on-metis`, a `focus-ring` component and a `shadow-overlay` token.
- **[low]** **`{founder}` clashes with token syntax.** This content placeholder (EXPERIENCE.md → Component Patterns, Founding fields) uses the same syntax as token references, so a resolver will flag it. *Fix:* write it as `<founder>` or `{{founder}}`.
- **[low]** **Several tokens are never referenced:** `on-accent`, `ok-tint`, `watch-tint`, every `*-tint-dark`, `metis-*-dark` and `typography.mono`. *Fix:* state where each is used. The KPI watch state has no tint background, and no Ledger button uses an accent fill.
- **[low]** **Contrast is not stated for some pairs:**
  - `metis-ink` on `metis-tint` (6.4:1 when computed — passes);
  - stage-25 infected answer buttons, including the mono key hints on the gradient;
  - desaturated text under Red Runway.

  *Fix:* add a line to the contrast paragraph.

## 3. Component coverage — thin

### Findings

- **[high]** **DESIGN.md never specifies interactive states.** Hover, pressed, focus and disabled are missing for answer-button, primary-button, the quieter outlined buttons (Ask Metis, Assign), policy-toggle and sidebar-row hover. The disabled look carries weight: the Surpassed lock, the disabled `D` key when Compute is exhausted, and toggles during audit (EXPERIENCE.md → Component Patterns and State Patterns) all depend on it. *Fix:* add per-component state specs and tokens, plus the focus ring as a component.
- **[high]** **No icon set is named.** The GDD asks for "one icon set" (Asset Requirements), but the spines use ⚙, 🎲 and "icon + label" (DESIGN.md → Layout & Spacing, Mobile; Components → Founding screen; Components → Mobile tab bar) without choosing one. An AI developer will pick a default. *Fix:* name the set, its stroke and its size (e.g. Lucide 16/20px, 1.5 stroke), or commit to text plus a closed list of Unicode glyphs.
- **[medium]** **EXPERIENCE.md names components that have no visual spec in DESIGN.md:**
  - the staff picker (Assign);
  - investor cards (one sentence, no anatomy or selected state);
  - the in-app notification-permission banner (Notifications);
  - the tablet KPI chip and the rail drawer;
  - the text input and the 🎲 icon button;
  - the Safety Researcher's "Ask for a reading" button;
  - the chart (no frontmatter entry, axes, legend or hover);
  - the clue-replay graph.

  *Fix:* add a spec and a `components` entry for each.
- **[medium]** **DESIGN.md has components with no behaviour rule in EXPERIENCE.md:**
  - channel header;
  - chart (update cadence, time range, readout, accessible data-table alternative);
  - investor-card selection (does a click select, then confirm?);
  - mobile tab bar (badges, fire pin);
  - end-of-run document (download buttons, what "Start Loop #N" does to the save);
  - clue replay (whether the graph animates, when Continue becomes available);
  - header bar.

  *Fix:* add a row for each to Component Patterns.
- **[low]** **The disabled `D` key relies on a "tooltip 'Metis is at capacity'"** (EXPERIENCE.md → State Patterns, Compute exhausted). There is no tooltip spec, and GDD M11 says "no tooltips". *Fix:* specify it as a standard SaaS disabled-reason tooltip with its own spec, or show the reason as inline text.
- **[low]** **The "outlined destructive-style button" for Pause Metis** (DESIGN.md → Components → Policy & Metis settings page) has no tokens. *Fix:* add a `button-destructive` entry.

## 4. State coverage — adequate

### Findings

- **[high]** **The tab-title counter is described in three ways that contradict each other:**
  - "Updates live in background tabs" (EXPERIENCE.md → Component Patterns, Browser tab title);
  - "No live simulation … tab title keeps showing the last count" (State Patterns, Away);
  - "the UI must not run timers … while hidden" (Responsive & Platform).

  Flow 2 opens on `(17)` before Marco returns. The counter is the game's re-engagement hook and drives the CPU ≈ 0 architecture. *Fix:* commit to one rule, either "frozen at the last count while hidden; recomputed on return" or a low-frequency projected count with a stated budget, and align Flow 2.
- **[high]** **The cascade's trigger model is uncommitted.** Beats are listed by clock time (EXPERIENCE.md → The Cascade), but the spines don't say:
  - whether beats are gated on the player's action;
  - what happens to an idle player who never clicks `Deploy`;
  - what happens if the 1:30 customer or the 3:00 SSO message is ignored.

  *Fix:* mark each beat as time-triggered or gated on a named action, and add an idle state for the first screen.
- **[medium]** **Two tabs open on the same save has no state.** This is likely for a game played as "a tab left open". *Fix:* one tab is active; any other shows a Huddlr-style "Huddlr is open in another tab · Use here" screen.
- **[medium]** **Save-error states are missing:** local save unreadable or corrupted, content-pack version mismatch on load, storage quota exceeded. Only the rejected import and the denied persistence request are covered (State Patterns). *Fix:* add rows.
- **[medium]** **Behaviour is unspecified for:**
  - Ask Metis (`D`) and Auto-triage during an audit pause (State Patterns only covers the toggles);
  - Auto-triage when Compute is exhausted.

  *Fix:* commit to the behaviour for both.
- **[medium]** **Clock behaviour per surface is incomplete.** Settings pauses the clock (Component Patterns, Game bar), which is not in the GDD's M1 clock table. The shortcut overlay, Metis · Automations, the Archive, mobile tab switches and the tablet drawer are unstated. *Fix:* add a clock state per surface and flag the Settings pause for a GDD sync.
- **[medium]** **Backlog queue navigation is unstated:** can the player leave the queue for a channel, the rail or Settings while it is active, and what the rest of the workspace shows (Component Patterns, Backlog queue). *Fix:* commit to locked-in or free navigation and the matching return behaviour.
- **[medium]** **High-legibility fonts can't be enabled offline.** They are "downloaded only when the setting is enabled" (DESIGN.md → Typography), but the game must be playable "offline after first load" (EXPERIENCE.md → Foundation), and no state covers enabling the setting offline. *Fix:* precache the fonts, or define an "Available when online" state.
- **[low]** **Smaller missing states:**
  - PNG/PDF generation in progress and failure;
  - empty Archive;
  - browser notifications unsupported (iOS Safari without install);
  - founding-field validation (empty company name, over-length);
  - where Esc on the away report lands;
  - how "You don't have permission…" is displayed at Surpassed (toast or inline);
  - clue replay when no Safety Researcher was hired.

  *Fix:* add one-line rows.

## 5. Visual reference coverage — adequate

### Findings

- **[medium]** **`mockups/bar-names-avatars.html` still shows superseded or banned names:** "10x Ventures", "Superintelligence Inc. (Stealth)" and "ClosedAI". Both spines say they win on conflict, but neither lists what the mocks get wrong, so an agent pulling copy from the mock reintroduces near-miss brand names. *Fix:* annotate the mock, or add a "superseded in mocks" list to DESIGN.md → Visual references.
- **[low]** **Wireframe placeholder names aren't flagged.** The decision log says "Ramen Labs" and "Bluewren Analytics" are not decisions; the spines don't say so, and Flow 5 uses Bluewren Analytics as a customer. *Fix:* note that mock company names are placeholders.
- **[low]** **EXPERIENCE.md doesn't link `directions.html` or `type-title-naming.html`.** DESIGN.md links them, so there are no orphans. No fix needed.

## 6. Bloat & overspecification — strong

### Findings

- **[low]** **EXPERIENCE.md restates some GDD numbers.** It says numbers are referenced by ID, not restated (Foundation), but it repeats the backlog 10–15 s window, the runway < 30 / < 7 thresholds, the timing multipliers and the audit costs. These will drift when tuning changes. *Fix:* cite the M-ID or the `[tuning]` key instead. The Inspiration & Anti-patterns section and the cascade timings do earn their place.

## 7. Inheritance discipline — adequate

### Findings

- **[medium]** **The Metis avatar shape conflicts.** .decision-log.md (Game bar, names, avatars) says "Metis is always the gradient orb with ✨"; DESIGN.md → Shapes and Components → Avatars say a "rounded square filled with the gradient". *Fix:* decide, then update the other document.
- **[medium]** **The sidebar contents conflict.** The decision log (Workspace layout) says "company switcher, channels, DMs, policies". DESIGN.md → Components → Sidebar has no switcher and no Automations entry, yet the EXPERIENCE.md IA says Metis · Automations is reached from the "sidebar". *Fix:* add the sidebar row (e.g. "✨ Automations") or remove it from the IA, and log that the switcher was dropped.
- **[medium]** **Cascade beats add several elements each.** GDD M11 says "each beat adds exactly one element". EXPERIENCE.md → The Cascade adds the rail, a Cash tile, an MRR tile and a toast at 0:30, and the header bar, sidebar and chat at 1:30. *Fix:* log this as a deliberate UX deviation approved by the GDD owner, or split the beats.
- **[medium]** **Flow 2 includes "Metis approved: Raise Team tier to $599"** (EXPERIENCE.md → Key Flows, Flow 2, step 2). The GDD fixes the Team tier at $499 and has no pricing-change mechanic. AI agents read flows as spec. *Fix:* replace it with a decision the GDD allows.
- **[low]** **"Pre-Product Labs" (DESIGN.md → Do's and Don'ts) vs "Pre-Product Labs (Stealth)"** (EXPERIENCE.md → Open items, decision log). *Fix:* use one form.
- **[low]** **Assumptions are not reconciled.** The decision log's Flow 2 assumption ("a Seed-round heavy decision waits") is not carried into Open items, and the flow shows a Series A term sheet. "No remapping [ASSUMPTION]" (Input Schemes) is still unconfirmed. *Fix:* reconcile both and tag them consistently.
- **[low]** **The EXPERIENCE.md `sources` list omits `addendum.md`**, which DESIGN.md lists. *Fix:* align the two lists.
- **[low]** **The game bar's "Best N days" sits against the Don't "score widgets … in the bar"** (DESIGN.md → Do's and Don'ts). *Fix:* clarify that plain-text personal best is allowed and widgets are not.

**Pillar and GDD rule check:**

| Rule | Result |
|---|---|
| Pillar 1 (no game UI) | Holds. The game bar's tension is logged and mitigated. |
| Pillar 2 (no visible Alignment) | Holds. Never named, never announced. |
| Anti-slop | Holds. |
| Audio off by default | Holds. |
| First screen `$12,400` + `Deploy` | Holds. |
| Tab-title counter | Present but self-contradictory (see 4). |

## 8. Shape fit — strong

### Findings

- **[low]** **EXPERIENCE.md section order departs from the game example** (Input Schemes comes after Accessibility). This is acceptable. The invented sections (The Cascade, Signals & Infection, Notifications, Open items) earn their place.
- **[low]** **Both spines are still `status: draft`,** and DESIGN.md ends with a "Visual references" paragraph outside the canonical sections. *Fix:* set the status to final at hand-off; the trailing paragraph is fine.

## Mechanical notes

- **Token references:** 211 in DESIGN.md and 1 in EXPERIENCE.md, **0 unresolved**. The only non-token brace is `{founder}` (a content placeholder).
- **Spec validity:** all colours are valid 6-digit hex. The typography keys are spec keys; the exception is `hl-sans` and `hl-mono`, which use `note` (an allowed pattern). `rounded` and `spacing` are valid.
- **Light/dark pairs:** every workspace colour has a `-dark` twin. The deliberately mode-invariant tokens are `scrim`, `gamebar-*`, `metis-1..3` and `avatar-1..8`. `sidebar-dark` is the one token without a light twin.
- **Contrast claims:** I recomputed the claims in DESIGN.md → Colors and they all hold:

  | Pair | Light | Dark |
  |---|---|---|
  | ink / surface | 15.6 | 14.7 |
  | muted / surface | 5.4 | 5.8 |
  | accent / surface | 4.6 | 5.4 |
  | critical on its tint | 4.55 | 5.1 |
  | control line / surface | 3.3 | 3.4 |

  | Single-value pair | Ratio |
  |---|---|
  | White on Metis gradient stops (`metis-1`, `-2`, `-3`) | 5.7, 4.7, 4.6 |
  | `on-accent-dark` / `on-critical-dark` on their fills | ≈ 5.9 |

  The one failure is the backlog previews at 60% opacity: 2.46 light, 2.93 dark.
- **Mock labels:** G1, F1, R1, B1/B2, C2, T1, style "D · Flat bust" and option "A — Three panes" all exist in the mocks they are cited from.
- **Mockup links:** all 5 files in `mockups/` are linked from at least one spine, with no orphans. `.working/*-1.html` are working copies and are correctly not linked. Both spines state that the spine wins on conflict with a mock.
- **Finding counts:** 0 critical · 10 high · 18 medium · 20 low.
