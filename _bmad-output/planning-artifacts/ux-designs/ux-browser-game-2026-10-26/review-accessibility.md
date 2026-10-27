# Accessibility Review — Human in the Loop

Scope: DESIGN.md, EXPERIENCE.md, .decision-log.md (2026-10-26 drafts), checked against WCAG 2.2 AA and game-accessibility practice, with the GDD (Accessibility, Controls and Input, M1–M3, M7–M8, M11, Art Style) as the set of constraints. Contrast ratios below were recomputed with the WCAG 2.x relative-luminance formula. Opacity and gradient cases were alpha-blended. Red Runway was modelled as CSS `saturate(0.2)`.

**Deliberate design versus defect.** Alignment signals are meant to stay silent: no toast, no announcement, no highlight. This review does not flag that silence. It flags places where the spec makes a signal **less** perceivable for an assistive-technology (AT) user than for a sighted player (a parity defect), or **more** perceivable (a leak). It also flags places where a deliberate effect (infection, desaturation, shimmer) breaks a WCAG requirement that the effect does not need to break.

## Overall verdict

**Not yet AA-conformant as specified. Conditional pass on intent.** The Accessibility Floor is ambitious and mostly right: Timing options that meet 2.2.1, a verbosity setting, presets, no colour-only states, single-key shortcuts that can be turned off, a high-legibility font and 44px touch targets. The Ledger base tokens mostly hold up, and the contrast claims in DESIGN.md are accurate for the pairs they list.

The gaps are behavioural, and they are where a screen-reader or keyboard player lives:

- focus is moved automatically to new messages;
- focus is lost when buttons collapse, expire or lock;
- the chat live-region strategy conflicts with the verbosity setting;
- browse-mode screen readers swallow the single-key shortcuts;
- the climax chart has no text alternative;
- the strikethrough on the title is not programmatically conveyed;
- toasts auto-dismiss outside the Timing setting.

Visually, the problems are not in the base Ledger palette. They are in states the spec leaves unspecified:

- backlog previews at 60% opacity;
- text, edges and focus rings on infection gradients;
- Red Runway in dark mode;
- the unverified Ink, Ops and Paper palettes, several of which fail.

Flow 5 (Kenji) is credible only after the critical and high findings are fixed, and it should be extended to the clue replay and to an NVDA/JAWS user.

**Counts:** 2 critical · 9 high · 19 medium · 11 low.

## Contrast table (Ledger, recomputed)

Thresholds: text 4.5:1. Large text (≥ 24px, or ≥ 18.66px bold) 3:1. Non-text and UI components (1.4.11) 3:1.

| Pair | Light | Dark | Need | Result |
|---|---|---|---|---|
| ink / surface | 15.62 | 14.65 | 4.5 | Pass |
| ink / bg | 14.68 | 16.02 | 4.5 | Pass |
| ink-muted / surface | 5.41 | 5.77 | 4.5 | Pass |
| ink-muted / bg (rail canvas) | 5.08 | 6.31 | 4.5 | Pass |
| ink-muted / surface-raised | 5.08 | 5.34 | 4.5 | Pass |
| **ink-muted at 60% opacity / surface (backlog previews)** | **2.46** | **2.93** | 4.5 | **Fail** |
| accent / surface (links) | 4.63 | 5.41 | 4.5 | Pass (light is marginal) |
| **accent / bg (links in the rail, which sits on canvas)** | **4.35** | 5.0+ | 4.5 | **Fail (light)** |
| on-accent / accent | 4.63 | 5.91 (dark text) | 4.5 | Pass |
| primary button (surface on ink) | 15.62 | 14.65 | 4.5 | Pass |
| ok / surface · ok / bg | 5.02 · 4.72 | 6.50 | 4.5 | Pass |
| ok / ok-tint | 4.52 | 5.96 | 4.5 | Pass (light: 0.02 margin) |
| **ok / critical-tint (green delta inside a critical tile)** | **4.42** | 6.20 | 4.5 | **Fail (light)** |
| watch / surface · watch / bg | 4.87 · 4.57 | 6.86 | 4.5 | Pass |
| watch / watch-tint | 4.59 | 6.22 | 4.5 | Pass |
| critical / surface · critical / bg | 5.16 · 4.85 | 5.38 | 4.5 | Pass |
| critical / critical-tint | 4.55 | 5.13 | 4.5 | Pass |
| ink / critical-tint (banner, critical tile) | 13.77 | 13.98 | 4.5 | Pass |
| ink-muted / critical-tint (KPI label in a critical tile) | 4.77 | 5.51 | 4.5 | Pass |
| Unread badge text on critical (11px caps) | 5.16 (white) | 5.88 (dark text) | 4.5 | Pass |
| line-control / surface · bg | 3.31 · 3.11 | 3.39 · 3.71 | 3.0 | Pass (light bg is marginal) |
| line-control-dark / surface-raised-dark | — | 3.14 | 3.0 | Pass (marginal) |
| line / surface (card edges, toast edge, timer track) | 1.23 | 1.34 | 3.0 | Fail, but acceptable only where the line is decorative |
| Timer fill (muted / critical) vs track | 4.39 / 4.19 | 4.32 / 4.02 | 3.0 | Pass |
| Toggle on (metis-1) / surface | 5.70 | **3.04** | 3.0 | Pass (dark is marginal) |
| **Toggle on versus off (metis-1 vs line-control)** | **1.72** | **1.12** | — | State must not rely on fill colour (1.4.1) |
| Focus ring (accent) / surface | 4.63 | 5.41 | 3.0 | Pass |
| Focus ring / critical-tint · metis-tint | 4.08 · 4.15 | 5.19 | 3.0 | Pass |
| Focus ring / game bar | 4.14 | 5.99 | 3.0 | Pass |
| **Focus ring on Metis gradient (infection sidebar or headers, or no offset)** | **1.02–1.23** | **1.78** | 3.0 | **Fail** |
| KPI watch / critical edge vs surface | 4.87 / 4.55 (on tint) | 6.86 / 5.13 | 3.0 | Pass |
| metis-ink / metis-tint | 6.36 | 9.00 | 4.5 | Pass |
| ink / metis-tint (Metis DM body) | 13.98 | — | 4.5 | Pass |
| White / metis-1 · mid · metis-2 · mid · metis-3 | 5.70 · 5.31 · 4.71 · 4.71 · 4.60 | same | 4.5 | Pass (the 4.60 end stop is marginal) |
| **Ink text on a gradient pill (if answer buttons keep ink at infection stage 25)** | **2.74–3.40** | — | 4.5 | **Fail unless the text turns white** |
| **ink-muted on a "faint" sidebar gradient (25% metis-1)** | **3.69** (4.51 at 12%) | 4.62 (25% metis-2) | 4.5 | **Fail above about 12% in light** |
| metis-line / metis-tint (bubble border) | 1.58 | 1.92 | 3.0 | Fail, acceptable while decorative |
| Game bar ink / muted | 15.51 / 5.86 | same | 4.5 | Pass |
| **Red Runway: critical text in dark mode after desaturation** | 7.33 | **4.34** | 4.5 | **Fail (dark)** |
| Red Runway: ok vs critical luminance difference | 1.28 | 1.35 | — | Hue is lost; the +/− signs carry the meaning (OK) |
| Letter logos: white on avatar-1 #C2683F / avatar-3 #3C8D7A | 3.93 / 3.97 | — | 4.5 | Fail (arguably exempt as logotypes) |

**Theme palettes (E8, unverified).** Failures against their own surfaces:

| Theme | Light failures | Dark failures |
|---|---|---|
| Ink | ok 4.33, watch 4.40 | white on accent 3.69, white on critical 3.37 (needs dark on-fill tokens) |
| Ops | accent/bg 4.12, ok 4.37 | white on accent 2.88, white on critical 3.07; muted 4.62 is marginal |
| Paper | none for text | white on accent 2.60, white on critical 3.08 |

All three themes lack a `line-control` token (their `line` is 1.22–1.39), so control borders are undefined.

## Critical

- **[critical]** **Automatic focus-follow breaks keyboard and screen-reader play** (EXPERIENCE → Interaction Primitives: "Focus follows the newest unanswered message … when the player is not already interacting"; WCAG 2.4.3 Focus Order, 3.2.1/3.2.2 unexpected context change; game-a11y "never move the player's cursor"). At Seed and Series A rates (one message every 5–10 s), focus will jump away while a screen-reader user is mid-sentence or deciding. "Not already interacting" is undefined for an AT user, whose pauses while listening look like idleness. Combined with "`1`/`2`/`3` answer the focused/top message", a key press can land on a different message than the one just heard. *Fix:* never move DOM focus on message arrival. Keep a visible "current message" pointer that moves only on `J`/`K`, on click, or after the player's own answer. Make shortcuts act only on the focused or current message, never on an implicit "top". Turn auto-follow off in the Screen reader preset at the very least; preferably remove it.

- **[critical]** **Focus is lost when the focused control disappears or disables** (Message: buttons collapse into an outcome line on answer or expiry; the backlog's top item expires and the next rises; Auto-triage empties the queue; Surpassed "controls lock one by one"; Bankrupt "controls disable"; audit-pause toggles disabled; `D` disabled at capacity; WCAG 2.4.3, 2.1.1). Removing or `disabled`-ing the element that has focus drops focus to `<body>`. The next Tab press restarts from the top of the page, and a screen-reader user gets no cue. Expiry can happen *while the user is on the button*. *Fix:* specify a focus destination for every removal: the outcome line (made focusable with `tabindex=-1`), then the next unanswered message, then the new top backlog item, then the restored channel. Use `aria-disabled="true"` (focusable, announced) instead of `disabled` for capacity, audit and Surpassed locks, so the "You don't have permission…" text can be reached and announced.

## High

- **[high]** **The chat live region conflicts with the verbosity setting** (Accessibility Floor: "chat = a log region" plus verbosity all / urgent only / periodic; WCAG 4.1.3, 1.3.1). `role="log"` is implicitly `aria-live="polite"` and announces every insertion, so "urgent only" and "periodic summary" cannot work on it. At 12–40 messages per minute, "all" floods the queue and goes stale. *Fix:* chat container `role="log" aria-live="off"`, plus one dedicated, visually hidden announcer (`role="status"`, polite; `assertive` only for urgent items if the user opts in) driven by the verbosity setting. Throttle and coalesce it ("3 new messages in #customers, 1 urgent"). Define which channels count: all, or only the active one.

- **[high]** **Single-key shortcuts collide with screen-reader browse-mode keys** (Interaction Primitives `1 2 3 D A J K G`; WCAG 2.1.1, 2.1.4; Flow 5 tests only VoiceOver). In NVDA and JAWS browse mode, `1`–`3` jump between heading levels, `D` goes to the next landmark (NVDA), `A` to the next radio button or annotation, and `K` to the next link. These keys never reach the page unless the user switches to focus mode, so "fully playable with a screen reader" fails on Windows. VoiceOver Quick Nav has the same issue when single-key mode is on. *Fix:* provide modifier alternatives (e.g. `Alt+1…3`, `Alt+D`, `Alt+A`, `Alt+J/K`) that are always active alongside the single keys, list them in the `?` overlay, and add an NVDA/JAWS variant of Flow 5. Keep the 2.1.4 off switch, and consider offering "shortcuts active only while a message has focus" (the second 2.1.4 option).

- **[high]** **No text alternative for the clue-replay metrics graph or the rail chart** (DESIGN → Clue replay "metrics graph … crossing point ringed"; Dashboard rail → Chart; Flow 3 climax; WCAG 1.1.1, 1.4.1). The reveal ("the lines cross on day 61") is the game's climax and is purely visual. Kenji's flow stops before it. The animated drawing also has no motion setting. *Fix:* give the graph an accessible name plus a text summary written as part of the incident page ("Valuation rose from $12.4K to $41M; Alignment fell from 100 to 0; they crossed on Day 61 …"), and a "View data" table (day, valuation, Alignment, marked decisions). Label lines directly (not by colour alone) and add a dashed or solid distinction. Put the draw animation under the motion settings. Give the rail chart the same summary-plus-table pattern.

- **[high]** **The title strikethrough is not programmatically conveyed, so the signal is lost for screen-reader users (a parity defect)** (DESIGN → Game bar "real strike-through text"; Flow 5 step 5 "read as 'Human, in struck through, the Loop'"; WCAG 1.3.1). VoiceOver, NVDA and JAWS do not announce CSS `text-decoration`. `<s>` and `<del>` are reported only with non-default formatting or verbosity settings. As specified, a screen-reader user hears "Human in the Loop" unchanged at stage 75 and stage 50, so the signal is *more hidden* for AT users, not equally silent. *Fix:* render struck words as `<s>` with a visually hidden suffix ("in, struck through") or an equivalent accessible name on the title element, so the plain-text reading matches Flow 5. This is parity, not a leak: it is read only when the user reaches the title, never announced. Also make the game-bar title the page's first heading, so it is encountered at natural navigation points.

- **[high]** **Backlog previews at 60% opacity fail text contrast** (DESIGN → Backlog queue "`ink-muted`, 60% opacity"; WCAG 1.4.3). They measure 2.46:1 in light and 2.93:1 in dark. These are live content the player reads to plan the queue (channel and sender), not disabled controls, so the "inactive component" exemption does not apply. *Fix:* drop the opacity and use `ink-muted` at full strength (5.41 / 5.77). Signal "waiting" through size, single-line truncation and the absence of buttons instead.

- **[high]** **Infection stages 25 and 10 leave text, state and focus contrast undefined, and the obvious implementations fail** (DESIGN → UI infection; WCAG 1.4.3, 1.4.11, 2.4.7). Measured cases:
  - Ink text on a gradient pill: 2.74–3.40.
  - `ink-muted` sidebar rows on a "faint" gradient: 3.69 at 25% in light (passes only at 12% or less).
  - The focus ring over gradient backgrounds: 1.02–1.78.
  - At stage 10, "gradients on headers and tiles" can erase the critical-tile tint and the watch and critical edges, which are the fire signal.

  *Fix:* add an infection contrast contract to DESIGN.md:
  - pill text is always white (≥ 4.6 on every stop);
  - sidebar gradient tint ≤ 10% opacity in light and ≤ 25% in dark, or use `ink` for row text;
  - KPI values sit on `surface` or `metis-tint`, never on a raw gradient;
  - watch and critical edges, labels and tints are exempt from infection (as they are from Red Runway);
  - the focus ring gains a 2px `surface` (or dark) outer halo, a double ring, so it reaches ≥ 3:1 on any background.

- **[high]** **Toasts auto-dismiss outside the Timing setting and have no announcement or history** (EXPERIENCE → Toast "auto-dismiss after 6 s (paused on hover/focus)"; WCAG 2.2.1, 4.1.3). Toasts carry deploy results, new customers and bank notices. A keyboard user cannot reach a toast before it vanishes, a screen magnifier user may never see the top-right corner, and Extended, Relaxed and Untimed do not scale it. *Fix:* scale the dismiss time with Timing (Untimed means persistent until dismissed), announce toasts through the polite status announcer (subject to verbosity), and keep an "Activity" or notifications list in Huddlr (a SaaS idiom) so nothing is shown only in a toast.

- **[high]** **No confirmation is announced after answering, expiring, Ask Metis, Assign or Auto-triage** (EXPERIENCE → Message, Ask Metis, Auto-triage, Game Feel; WCAG 4.1.3). Sighted players get collapsing buttons, rolling KPIs and delta flashes. Screen-reader users get nothing, because "KPI changes are not announced individually" and verbosity "urgent only" suppresses the rest. Expiry of the message under the user's focus is likewise silent. *Fix:* after each player action, one polite status message: "Answered: Put it on the roadmap. Cash −$2,000, Runway −5 days". After an expiry of an urgent message: "Expired: Refund request, default applied". After Auto-triage: "Metis replied to 15 messages". These are outcomes of the player's own visible actions, not hidden signals, so they do not leak Alignment.

- **[high]** **No way to reach urgent messages in other channels** (Interaction Primitives `J`/`K` "next/previous message"; Flow 5 step 3; WCAG 2.1.1, 2.4.1 in spirit). Announcements say "Urgent, #customers, …", but `J`/`K` move within the open channel and `G C` only reaches Chat. Mouse users click the red badge. *Fix:* add "jump to next unanswered" and "next urgent" across channels (Slack's `Alt+Shift+↓` idiom, e.g. `U` plus a modifier variant), list it in `?`, and use it in Flow 5.

## Medium

- **[medium]** **Accent links on the rail canvas fail** (rail background = `bg`; accent/bg 4.35:1; WCAG 1.4.3). *Fix:* darken `accent` to about `#1A64D6` (≥ 4.9 on bg and ≥ 5.2 on surface), or put rail links on `surface`.
- **[medium]** **A green positive delta inside a critical tile fails** (ok on critical-tint 4.42:1, light; WCAG 1.4.3). *Fix:* darken `ok` to about `#16733F`, or render deltas in a critical tile in `ink` with the +/− sign.
- **[medium]** **Red Runway desaturation drops dark-mode critical text to 4.34:1** (URGENT tags and negative deltas outside the exempt tile, attention list and banner; WCAG 1.4.3). It also greys the focus ring until it is barely distinct from control borders (1.69 between them; it still reaches 5.58 against the surface). *Fix:* exempt critical-coloured text and the focus ring from the filter. Desaturating backgrounds, avatars and chart only is enough for the effect. Re-verify both modes after the change.
- **[medium]** **The Ink, Ops and Paper palettes fail as listed** (DESIGN → Theme palettes; WCAG 1.4.3, 1.4.11). See the theme table above for the per-theme numbers. *Fix:* add `line-control`, `on-accent-dark`, `on-critical-dark` and the tints per theme, and gate E8 on a scripted contrast check of every token pair in the table.
- **[medium]** **High-contrast variant and forced-colors mode are undefined** (DESIGN → Colors "derived per theme in E8"; WCAG 1.4.11, 1.4.1). Under Windows forced colors, background-only signals disappear: gradient pills with no border, the timer-bar fill, toggle tracks, unread badges, the KPI tint, and desaturation. *Fix:* specify `@media (forced-colors: active)` rules: borders on every control and pill, `Highlight` for the timer fill and the toggle-on state, and system colours for the focus ring. Define what infection does in high-contrast mode (✨, emoji and pill shapes only; no gradients), so the signal survives without losing contrast.
- **[medium]** **The policy toggle state relies on track colour** (on vs off 1.72 light / 1.12 dark; WCAG 1.4.1, 1.4.11). *Fix:* specify thumb position plus an on-state glyph (✓) or "On"/"Off" text, `role="switch"` with `aria-checked`, and the visible label as its accessible name.
- **[medium]** **The colour-blind-safe variant swaps OK to blue, which collides with `accent`** (links, focus ring, chart growth line, selected states; WCAG 1.4.1). *Fix:* choose a teal or blue clearly distinct from accent, or move accent; keep +/− signs and underlined links mandatory in that variant.
- **[medium]** **Fixed heights break 200% text and text spacing** (`gamebar-height: 28px`, `header-height: 40px`, `tabbar-height: 56px`, single-line badges and key caps; 2-column KPI grid in a 320px rail; WCAG 1.4.4, 1.4.12). *Fix:* make them `min-height` in rem, let the rail KPI grid drop to one column above about 150% text, and let truncated one-line previews expand on focus with the full text available to AT.
- **[medium]** **Reflow at 320 CSS px is undefined for overlay internals** (term-sheet "three side-by-side cards", clue-replay graph, inference-log mono lines, shortcut table; WCAG 1.4.10). *Fix:* state that cards stack, the graph scales or falls back to its table, and log lines wrap. No horizontal scroll except the ticker animation.
- **[medium]** **Sticky chrome stacks up and obscures focus** (game bar + header + overdraft banner + pinned fire + 56px tab bar, about 210px of a 256px-high viewport at 400% zoom; toasts top-right over the chat's top message; tablet drawer over chat; pinned Auto-triage; WCAG 2.4.11, 1.4.10). *Fix:*
  - set `scroll-padding` for all sticky regions;
  - collapse the banner and the pinned fire to one line (or unpin them) at short viewport heights;
  - position toasts so they never cover the focused message, or move them on focus;
  - make the drawer modal (trap focus) or push the content aside.
- **[medium]** **Desktop target size is unspecified** (44px is stated for touch only; 🎲, section collapse chevrons, toggles, ⚙ in a 28px bar, "Manage" links; WCAG 2.5.8). *Fix:* add a 24×24 CSS px minimum target (or the 2.5.8 spacing exception) for every desktop control to DESIGN.md.
- **[medium]** **Dialog initial focus and reading are unspecified** (Overlay doc; Flow 5 "read top to bottom"; WCAG 2.4.3, 1.3.1). *Fix:* `role="dialog" aria-modal="true"`, `aria-labelledby` set to the doc title, and initial focus on the title (`tabindex=-1`), not on the primary button. Otherwise a screen-reader user lands on "Review 17 messages" with the report unread. Document that Esc does nothing in decision docs, and say so in the dialog.
- **[medium]** **Auto-advancing end sequences can cut off content** (Bankrupt "after ~2 s the Wind-down memo opens"; Surpassed lock sequence → AllGreen page opens; WCAG 2.2.1, 3.2.5 practice, 4.1.3). A 2-second transition interrupts the announcement of "Account closed" or of Metis's last line. *Fix:* end each sequence with a user-initiated "Continue" (an "Open report" link in the bank or AllGreen voice), or wait for input. Move focus to the new page's h1.
- **[medium]** **Cascade births and first-screen focus are unspecified for AT** (M11 beats; Founding → `$12,400` + Deploy; new channels and rail sections; WCAG 2.4.3, 4.1.3). *Fix:* after "Found company", focus moves to Deploy (with `$12,400` as its description). New landmarks get labels and appear in skip links once born. Born sections are not announced (parity with sighted users noticing peripherally), but a new DM or channel follows the same verbosity rule as messages.
- **[medium]** **The tab-title corruption has no plain-text format** (Component Patterns: "Mirrors the corruption stages"; WCAG 2.4.2, 1.3.1). `document.title` cannot carry strike-through. Combining U+0336 ("H̶u̶m̶a̶n̶") is read letter by letter or as garbage by screen readers. *Fix:* define the exact tab-title string per stage, test it in VoiceOver, NVDA and JAWS, and choose a form that reads acceptably. Otherwise keep stages 75 and 50 in the tab title as plain wording and corrupt visually only in the game bar, provided the game bar carries the accessible equivalent from the high finding above.
- **[medium]** **The ticker has no on-page pause control** (hover or focus pause only; static mode buried in Settings; WCAG 2.2.2). *Fix:* add a small pause/play control in the ticker (a SaaS idiom); respect `prefers-reduced-motion` by default (already stated); include static and hidden options on desktop as well as mobile.
- **[medium]** **Disabled controls carry their reason only in tooltips** (`D` disabled with tooltip "Metis is at capacity"; toggles "Paused for audit · N days"; WCAG 1.3.1, 1.4.13, 2.1.1). *Fix:* with `aria-disabled`, put the reason in visible inline text or `aria-describedby`. Make the tooltips focus-triggered, dismissable (Esc) and hoverable.
- **[medium]** **The end-of-run PNG and PDF have no accessibility spec** (DESIGN → End-of-run documents; WCAG 1.1.1, 1.3.1 via PDF techniques). *Fix:* generate a tagged PDF (title, `lang`, headings, list structure, reading order, the Metis mark as an artifact). Next to Download PNG, offer "Copy alt text" (a prepared description containing the header strip, cause and highlights). The page itself stays the accessible HTML version.
- **[medium]** **Transient delta information** (static +/− label "for 2 s" when rolling numbers are off; delta flash ~1.2 s; WCAG 2.2.1, 1.3.1). *Fix:* keep each tile's last delta persistently visible (e.g. "+$2,000 since last change"), and make the flash only decoration on top. Keep flashes below 3 per second during Auto-triage roll-ups (2.3.1).

## Low

- **[low]** **Infection parity is acceptable, but should be made explicit** (Signals & Infection; game-a11y parity). Stages 50, 25 and 10 each include a text-level change ("✨ Summary by Metis", emoji headings such as "chart increasing Overview", sparkles in the ticker label). Screen-reader users therefore receive the signal silently, as sighted players do. The gradient, shimmer and pill changes are visual-only, which is fine. *Fix:* state in EXPERIENCE that emoji and ✨ are not `aria-hidden`, and that infection never changes roles or accessible names. Keep the inference log `aria-live="off"` (odd lines: parity, no leak).
- **[low]** **Shimmer and seizure safety are not quantified** (DESIGN → Metis surfaces, infection stage 25+; WCAG 2.3.1, 2.2.2). *Fix:* specify the shimmer as a low-luminance sweep (ΔL < 10%) slower than 3 Hz, never a flash. Keep the motion toggle (2.2.2 is satisfied through Settings plus `prefers-reduced-motion`). With shimmer off, the static gradient keeps the signal.
- **[low]** **Metis bubble borders fail 3:1** (metis-line on metis-tint 1.58, dark 1.92; 1.4.11). This is acceptable while the bubble is not interactive. *Fix:* if bubbles become clickable, use `metis-ink` for the border.
- **[low]** **Letter logos on avatar-1 and avatar-3 are at 3.93 and 3.97** (1.4.3; the logotype exemption is arguable). *Fix:* darken those two fills slightly or use dark letters. The sender name is always present as text.
- **[low]** **The ok-tint and line-control/bg pairs pass with almost no margin** (4.52, 3.11; dark toggle-on 3.04; the white-on-metis-3 end stop 4.60). *Fix:* add about 0.3 of headroom so anti-aliasing and future token tweaks do not tip them under.
- **[low]** **Founding form semantics** (WCAG 3.3.1, 3.3.2, 4.1.2). *Fix:* make "What's the name of your company?" the field's label. Give 🎲 the accessible name "Generate another name" and announce the new name politely. Give the required "Your name" an inline error and `aria-invalid`.
- **[low]** **Unread badge semantics are ambiguous** ("urgent ones also turn the badge on"; 1.4.1, 1.3.1). *Fix:* state that the badge appears only when an urgent item exists, and give sidebar rows an accessible name such as "#customers, 4 unread, 1 urgent".
- **[low]** **Rolling numbers** (1.3.1). *Fix:* the accessible text of KPI values is always the final value; render the roll in an `aria-hidden` layer.
- **[low]** **Screen reader preset timing** (Presets: Extended). Screen-reader reading plus navigation is often more than twice as slow. *Fix:* consider Relaxed as the preset default, and surface "Accessibility settings" on the founding screen (a SaaS "Preferences" link), so the Timing setting can be chosen before the first timed message. Settings already pauses the clock.
- **[low]** **The score label discloses the accessibility setting in shared documents** (`213 days · untimed` in PNG and PDF; GDD-mandated; game-a11y practice). Some players will not want to share their Timing setting. *Fix:* raise with the GDD owner. Option: show the label in-game and in the personal best, and make it optional in the exported image.
- **[low]** **Orientation and game speed** (WCAG 1.3.4; game-a11y). *Fix:* state that orientation is never locked. Note for the GDD owner: under Untimed the game clock (1 minute = 1 day) still runs, so slower readers burn runway faster. A "game speed" accessibility option, labelled like Timing, would close that gap.
