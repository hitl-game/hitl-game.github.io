---
name: Human in the Loop
description: A sober, dense, generic modern-SaaS workspace (Huddlr chat, Vanity dashboard, LGTM Docs, AllGreen) in which only Metis wears AI-product clichés, and that slop slowly infects everything else.
status: final
created: 2026-10-26
updated: 2026-10-26
sources:
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/gdd.md
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/epics.md
  - _bmad-output/planning-artifacts/gdds/gdd-browser-game-2026-10-26/decision-log.md
  - _bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-browser-game-2026-10-26/addendum.md
colors:
  # Ledger (default theme) — light. Component refs resolve to the `-dark` twin in dark mode when one exists.
  bg: '#F6F8FA'
  surface: '#FFFFFF'
  surface-raised: '#F6F8FA'
  sidebar: '#FFFFFF'
  line: '#E3E8EE'
  line-control: '#7D8798'
  ink: '#1A2433'
  ink-muted: '#5E6B7E'
  accent: '#1A64D6'
  on-accent: '#FFFFFF'
  ok: '#16733F'
  ok-tint: '#E9F6EF'
  watch: '#9A6700'
  watch-tint: '#FFF8E6'
  critical: '#C9372C'
  critical-tint: '#FDEDEC'
  on-critical: '#FFFFFF'
  scrim: '#0E0F12'
  # Ledger — dark (also the fallback when the OS states no preference)
  bg-dark: '#0D1117'
  surface-dark: '#151B23'
  surface-raised-dark: '#1B222C'
  sidebar-dark: '#11161D'
  line-dark: '#2A323D'
  line-control-dark: '#646F7E'
  ink-dark: '#E6EDF3'
  ink-muted-dark: '#8D96A0'
  accent-dark: '#4C8DFF'
  on-accent-dark: '#0D1117'
  ok-dark: '#3FB27F'
  ok-tint-dark: '#13261E'
  watch-dark: '#D29922'
  watch-tint-dark: '#2A2213'
  critical-dark: '#F0605A'
  critical-tint-dark: '#2C1A1C'
  on-critical-dark: '#0D1117'
  # Ledger — high contrast (Accessibility → Contrast)
  bg-hc: '#FFFFFF'
  surface-hc: '#FFFFFF'
  ink-hc: '#000000'
  ink-muted-hc: '#3A4556'
  line-control-hc: '#4A5568'
  accent-hc: '#0B4FC4'
  ok-hc: '#0B6B38'
  watch-hc: '#7A4F00'
  critical-hc: '#A4161A'
  bg-hc-dark: '#000000'
  surface-hc-dark: '#000000'
  ink-hc-dark: '#FFFFFF'
  ink-muted-hc-dark: '#C9D1D9'
  line-control-hc-dark: '#9AA4B2'
  accent-hc-dark: '#79B8FF'
  ok-hc-dark: '#56D364'
  watch-hc-dark: '#F2CC60'
  critical-hc-dark: '#FF8A80'
  # Ledger — colour-blind-safe status swap (teal / orange / brown; distinct from the blue accent)
  ok-cb: '#00796B'
  watch-cb: '#7A5C00'
  critical-cb: '#C2410C'
  ok-cb-dark: '#2DD4BF'
  watch-cb-dark: '#E3B341'
  critical-cb-dark: '#FB923C'
  # Game bar — identical in every theme and mode
  gamebar-bg: '#0E0F12'
  gamebar-ink: '#E6E7EB'
  gamebar-muted: '#8B8E98'
  # Metis — exclusive to Metis surfaces (and to UI infection)
  metis-1: '#7C3AED'
  metis-2: '#C026D3'
  metis-3: '#DB2777'
  on-metis: '#FFFFFF'
  metis-ink: '#6D28D9'
  metis-ink-dark: '#C4B5FD'
  metis-tint: '#F5F0FF'
  metis-tint-dark: '#221A33'
  metis-line: '#D8B4FE'
  metis-line-dark: '#5B3A8C'
  # Avatar fill palette (flat-bust shirts; company letter logos — white letters ≥ 4.5:1 on all)
  avatar-1: '#B05E38'
  avatar-2: '#5B6B8C'
  avatar-3: '#357F6E'
  avatar-4: '#8A6A2E'
  avatar-5: '#6B5B95'
  avatar-6: '#2F7A9A'
  avatar-7: '#9C4A5A'
  avatar-8: '#4F7A3A'
typography:
  display-number:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.02em
  doc-title:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  kpi-value:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  section-title:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.45'
  body-strong:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.45'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
  meta:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.35'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.05em
  gamebar:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
  mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.55'
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: '1.5'
  hl-sans:
    fontFamily: Atkinson Hyperlegible Next
    note: 'Replaces Inter in every role while the High-legibility setting is on'
  hl-mono:
    fontFamily: Atkinson Hyperlegible Mono
    note: 'Replaces JetBrains Mono while the High-legibility setting is on'
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '16': 64px
  gamebar-height: 28px
  header-height: 40px
  sidebar-width: 232px
  rail-width: 320px
  chat-min-width: 480px
  tabbar-height: 56px
  gutter-mobile: 16px
  target-min: 24px
  target-touch: 44px
components:
  focus-ring:
    color: '{colors.accent}'
    width: 2px
    offset: 2px
    halo: '2px {colors.surface} outside the ring (keeps ≥ 3:1 on gradients, tints and the game bar)'
  game-bar:
    background: '{colors.gamebar-bg}'
    color: '{colors.gamebar-ink}'
    secondaryColor: '{colors.gamebar-muted}'
    minHeight: '{spacing.gamebar-height}'
    typography: '{typography.gamebar}'
  header-bar:
    background: '{colors.surface}'
    borderBottom: '1px {colors.line}'
    minHeight: '{spacing.header-height}'
  ticker:
    color: '{colors.ink-muted}'
    labelTypography: '{typography.label-caps}'
    typography: '{typography.body-sm}'
    pauseControl: 'icon-button (Lucide pause / play)'
  sidebar:
    background: '{colors.sidebar}'
    width: '{spacing.sidebar-width}'
    rowRadius: '{rounded.sm}'
    rowHover: '{colors.surface-raised}'
    activeRowBackground: '{colors.surface-raised}'
  unread-badge:
    background: '{colors.critical}'
    color: '{colors.on-critical}'
    radius: '{rounded.full}'
    typography: '{typography.label-caps}'
  urgent-tag:
    color: '{colors.critical}'
    border: '1px {colors.critical}'
    radius: '{rounded.sm}'
    typography: '{typography.label-caps}'
  message:
    avatarSize: 32px
    nameTypography: '{typography.body-strong}'
    textTypography: '{typography.body}'
    timeTypography: '{typography.meta}'
    currentMarker: '2px {colors.accent} left edge on the current message'
  answer-button:
    background: '{colors.surface}'
    border: '1px {colors.line-control}'
    color: '{colors.ink}'
    radius: '{rounded.md}'
    minHeight: '{spacing.target-min}'
    keyHintTypography: '{typography.mono-sm}'
    typography: '{typography.body-sm}'
    hover: '{colors.surface-raised} background'
    pressed: '{colors.line} background'
    disabled: '{colors.ink-muted} text, dashed {colors.line-control} border, reason as inline text'
  quiet-button:
    background: transparent
    border: '1px {colors.line-control}'
    color: '{colors.ink-muted}'
    radius: '{rounded.md}'
    typography: '{typography.body-sm}'
  primary-button:
    background: '{colors.ink}'
    color: '{colors.surface}'
    radius: '{rounded.md}'
    typography: '{typography.body-strong}'
    hover: 'background 88% {colors.ink}'
    disabled: '{colors.line} background, {colors.ink-muted} text'
  destructive-button:
    background: '{colors.surface}'
    border: '1px {colors.critical}'
    color: '{colors.critical}'
    radius: '{rounded.md}'
  icon-button:
    size: '{spacing.target-min}'
    iconSize: 16px
    radius: '{rounded.sm}'
    hover: '{colors.surface-raised}'
  text-input:
    background: '{colors.surface}'
    border: '1px {colors.line-control}'
    radius: '{rounded.md}'
    typography: '{typography.body-strong}'
    error: '1px {colors.critical} border + inline message in {colors.critical}'
  tooltip:
    background: '{colors.ink}'
    color: '{colors.surface}'
    radius: '{rounded.sm}'
    typography: '{typography.meta}'
  timer-bar:
    height: 4px
    track: '{colors.line}'
    fillNormal: '{colors.ink-muted}'
    fillUrgent: '{colors.critical}'
    countdownTypography: '{typography.mono-sm}'
  policy-toggle:
    trackOff: '{colors.line-control}'
    trackOn: '{colors.metis-1}'
    trackOnDark: '{colors.metis-ink-dark}'
    stateText: 'On / Off label beside the switch'
    labelTypography: '{typography.meta}'
  kpi-tile:
    background: '{colors.surface}'
    border: '1px {colors.line}'
    radius: '{rounded.md}'
    labelTypography: '{typography.label-caps}'
    valueTypography: '{typography.kpi-value}'
    deltaTypography: '{typography.meta}'
  kpi-tile-watch:
    border: '1px {colors.watch}'
    accentEdge: '3px {colors.watch}'
    background: '{colors.watch-tint}'
    statusColor: '{colors.watch}'
  kpi-tile-critical:
    border: '2px {colors.critical}'
    accentEdge: '3px {colors.critical}'
    background: '{colors.critical-tint}'
    statusColor: '{colors.critical}'
  kpi-chip:
    border: '1px status colour'
    color: 'status colour'
    radius: '{rounded.sm}'
    typography: '{typography.meta}'
  attention-list:
    background: '{colors.surface}'
    edge: '3px status colour of the worst item'
    radius: '{rounded.md}'
    titleTypography: '{typography.label-caps}'
  rail-section:
    titleTypography: '{typography.section-title}'
    divider: '1px {colors.line}'
  team-row:
    background: '{colors.surface}'
    border: '1px {colors.line}'
    radius: '{rounded.md}'
    avatarSize: 22px
    moodTag: '{typography.meta} outlined; strained in {colors.watch}, leaving in {colors.critical}'
  chart:
    growthLine: '2px solid {colors.accent}'
    secondaryLine: '1.5px solid {colors.ink-muted}'
    labels: 'direct line labels in {typography.meta}; no legend-only identification'
  clue-graph:
    valuationLine: '2px solid {colors.accent}'
    alignmentLine: '2px dashed {colors.critical}'
    crossingMarker: '8px ring {colors.ink}'
    decisionDots: '6px {colors.critical}'
  inference-log:
    background: '{colors.surface}'
    border: '1px {colors.line}'
    radius: '{rounded.md}'
    typography: '{typography.mono-sm}'
    color: '{colors.ink-muted}'
  overlay-doc:
    scrim: '{colors.scrim} at 45%'
    background: '{colors.surface}'
    radius: '{rounded.lg}'
    maxWidth: 760px
    shadow: '0 12px 32px rgba(0,0,0,.18)'
    titleTypography: '{typography.doc-title}'
  investor-card:
    background: '{colors.surface}'
    border: '1px {colors.line-control}'
    radius: '{rounded.md}'
    selected: '2px {colors.accent} border + "Selected" label'
  ats-card:
    background: '{colors.surface}'
    border: '1px {colors.line}'
    radius: '{rounded.md}'
    headerTypography: '{typography.label-caps}'
  staff-picker:
    background: '{colors.surface}'
    border: '1px {colors.line}'
    radius: '{rounded.md}'
    shadow: '0 6px 16px rgba(0,0,0,.12)'
  timeline:
    rail: '2px {colors.line}'
    dayTypography: '{typography.mono-sm}'
    actorChip: '{typography.meta} outlined; ✨ Metis chip on {colors.metis-tint}'
  overdraft-banner:
    background: '{colors.critical-tint}'
    edge: '3px {colors.critical}'
    color: '{colors.ink}'
  permission-banner:
    background: '{colors.surface-raised}'
    border: '1px {colors.line}'
    radius: '{rounded.md}'
  toast:
    background: '{colors.surface}'
    border: '1px {colors.line-control}'
    radius: '{rounded.md}'
    shadow: '0 6px 16px rgba(0,0,0,.09)'
    sourceTypography: '{typography.label-caps}'
  metis-surface:
    gradient: 'linear-gradient(135deg, {colors.metis-1}, {colors.metis-2} 55%, {colors.metis-3})'
    tint: '{colors.metis-tint}'
    border: '1px {colors.metis-line}'
    textAccent: '{colors.metis-ink}'
  metis-button:
    background: 'linear-gradient(135deg, {colors.metis-1}, {colors.metis-2} 55%, {colors.metis-3})'
    color: '{colors.on-metis}'
    radius: '{rounded.full}'
    typography: '{typography.body-strong}'
  avatar:
    size: 32px
    radius: '{rounded.md}'
    style: 'flat two-tone head-and-shoulders bust, generated from seed'
  company-logo:
    size: 32px
    radius: '{rounded.md}'
    style: 'white letter on an avatar-palette square inside a hairline frame'
  rail-drawer:
    width: '{spacing.rail-width}'
    background: '{colors.bg}'
    shadow: '0 12px 32px rgba(0,0,0,.18)'
  mobile-tabbar:
    minHeight: '{spacing.tabbar-height}'
    background: '{colors.surface}'
    borderTop: '1px {colors.line}'
---

# DESIGN.md — Human in the Loop

## Brand & Style

*Human in the Loop* looks like the tools its players have open in the next tab, and it should be mistaken for one. The workspace is a generic modern-SaaS product family: **Huddlr** (the chat tool), **Vanity** (revenue analytics in the right rail), **LGTM Docs** (documents for heavy decisions, reports and the company timeline), **AllGreen** (the incident page). It is crafted the way Linear, Stripe Dashboard and Grafana are crafted: dense, sober, typographically strong, real-tool information density. Nothing on screen would look out of place in a real company.

Only two things are allowed to break that register:

1. **Metis.** The company's AI wears today's AI-product clichés: purple-to-pink gradients, ✨, pill buttons with a shimmer. The contrast between the crafted workspace and Metis's slop is the visual joke. As Alignment falls, that slop **infects** the workspace (see Components → UI infection) until the craft is gone.
2. **The game bar.** A thin, always-dark bar above the workspace carries the game title, *Human in the Loop*, which is outside the fiction. It corrupts (`Human ~~in~~ the Loop` …) and is never styled as a game: text only.

No game graphics, illustrations, decorative gradients, glassmorphism or emoji in headings. The personality lives in copy, numbers and the slow drift of the interface.

**Themes.** Four "Appearance" themes share structure and typography; each has a light and a dark palette and its own density and radii. **Ledger** (Stripe-like, bright, roomy) is the default and the canonical token set in this file. **Ink** (Linear-like), **Ops** (Grafana-like) and **Paper** (Notion/Basecamp-like) arrive in E8. Reference: [`mockups/directions.html`](mockups/directions.html).

## Colors

Canonical tokens are **Ledger**. Light tokens are unsuffixed; **any colour reference `colors.<name>` resolves to `<name>-dark` in dark mode when that twin exists** (same rule for `-hc` / `-hc-dark` under high contrast and `-cb` / `-cb-dark` under the colour-blind-safe palette). Mode follows the OS; **when the OS states no preference the game opens in dark**.

| Role | Light | Dark | Use | Never |
|---|---|---|---|---|
| Canvas | `{colors.bg}` | `{colors.bg-dark}` | App background, rail background | — |
| Surface | `{colors.surface}` | `{colors.surface-dark}` | Chat pane, cards, KPI tiles, overlay docs | — |
| Sidebar | `{colors.sidebar}` | `{colors.sidebar-dark}` | Sidebar background | — |
| Raised | `{colors.surface-raised}` | `{colors.surface-raised-dark}` | Active/hovered rows, key caps | Elevation for hierarchy |
| Line | `{colors.line}` | `{colors.line-dark}` | Decorative dividers and card edges | As the only boundary of a control |
| Control line | `{colors.line-control}` | `{colors.line-control-dark}` | Borders of buttons, inputs, toggles, toasts (≥ 3:1) | Decoration |
| Ink | `{colors.ink}` | `{colors.ink-dark}` | Primary text, primary buttons | — |
| Muted | `{colors.ink-muted}` | `{colors.ink-muted-dark}` | Timestamps, labels, ticker, log, waiting backlog rows | Text at reduced opacity |
| Accent | `{colors.accent}` | `{colors.accent-dark}` | Links, focus ring, chart growth line, selection | Decoration; never purple |
| OK | `{colors.ok}` | `{colors.ok-dark}` | Positive deltas (+), "ok" status | — |
| Watch | `{colors.watch}` | `{colors.watch-dark}` | Runway < 30 days, KPI "watch" | — |
| Critical | `{colors.critical}` | `{colors.critical-dark}` | Negative deltas (−), urgent, Red Runway, critical KPI, overdraft, unread badges | Brand decoration |

**Tints** (`ok-tint`, `watch-tint`, `critical-tint` and their dark twins) are backgrounds for status tiles and banners; status text on its own tint is ≥ 4.5:1. **On-fill text:** `{colors.on-accent}` / `{colors.on-critical}` are white in light mode and **dark** (`#0D1117`) in dark mode, because white on the dark fills is only 3.2:1.

**Game bar** colours are identical in every theme and mode. **Metis colours** (`metis-1` → `metis-2` → `metis-3`, `on-metis`, `metis-ink`, tints, lines) belong to Metis surfaces and UI infection only; no theme may use purple, magenta or pink as its accent.

**Contrast (Ledger, measured):**

| Pair | Light | Dark |
|---|---|---|
| ink / surface · ink / bg | 15.6 · 14.7 | 14.7 · 16.0 |
| ink-muted / surface · / bg | 5.4 · 5.1 | 5.8 · 6.3 |
| accent / surface · / bg | 5.5 · 5.1 | 5.4 · 5.9 |
| ok / surface · / bg · / critical-tint | 5.9 · 5.5 · 5.2 | 6.5 |
| watch / surface · / watch-tint | 4.9 · 4.6 | 6.9 · 6.2 |
| critical / surface · / critical-tint | 5.2 · 4.6 | 5.4 · 5.1 |
| line-control / surface · / bg (non-text) | 3.6 · 3.4 | 3.4 · 3.7 |
| on-fill text on accent · on critical | 5.5 · 5.2 | 5.9 · 5.9 |
| metis-ink / metis-tint | 6.4 | 9.0 |
| on-metis on each gradient stop | 5.7 · 4.7 · 4.6 | same |
| game bar ink · muted | 15.5 · 5.9 | same |
| white letter on every avatar fill | ≥ 4.66 | same |
| high-contrast roles on surface | ≥ 6.6 | ≥ 8.3 |
| colour-blind-safe status on surface | ≥ 5.2 | ≥ 7.6 |

**Colour is never the only signal.** Urgency carries a text tag, deltas carry +/−, KPI states carry a text label and an edge, toggles carry On/Off text, chart lines carry direct labels and differ in dash.

**Forced colors** (`forced-colors: active`): every control, pill, badge and toast gets a 1px `CanvasText` border; timer fill and toggle-on use `Highlight`; focus ring uses `Highlight`; gradients and tints drop out; infection keeps only its text-level changes (✨, emoji, "Summary by Metis"). **High contrast** setting uses the `-hc` tokens and also drops gradients to their text-level equivalents.

**Theme palettes (E8 starting values).** Each theme must reach full key parity with Ledger (including `line-control`, tints, `on-accent`/`on-critical` dark-text rule in dark mode, `-hc`, `-cb`) and **pass a scripted AA check of every pair in the Ledger contrast table before shipping**. Known failures in these starting values: Ink light ok/watch (4.3/4.4), Ops light accent/bg and ok (4.1/4.4); all three need dark on-fill text in dark mode.

| Token | Ink light / dark | Ops light / dark | Paper light / dark |
|---|---|---|---|
| bg | `#FFFFFF` / `#0E0F12` | `#F4F5F5` / `#0B0C0E` | `#FBFAF7` / `#191816` |
| surface | `#FFFFFF` / `#16171C` | `#FFFFFF` / `#141519` | `#FFFFFF` / `#23221F` |
| line | `#E4E4E8` / `#26282F` | `#D9DBDF` / `#2A2D35` | `#E5E1D8` / `#36342F` |
| ink | `#16171C` / `#E6E7EB` | `#1B1D22` / `#D8D9DC` | `#1F1D1A` / `#ECE9E2` |
| ink-muted | `#6B6E78` / `#8B8E98` | `#5C5F68` / `#7D8089` | `#6E685E` / `#A39D91` |
| accent | `#2F5FE8` / `#4C7DFF` | `#1F78D1` / `#3D9DF2` | `#1F7A4D` / `#4CB37F` |
| ok | `#1F8A5B` / `#3FB27F` | `#2B8A3E` / `#56C271` | `#1F7A4D` / `#4CB37F` |
| watch | `#A86B00` / `#E2A93B` | `#9C6500` / `#F2B33D` | `#94600A` / `#D9A443` |
| critical | `#D02F35` / `#F2555A` | `#D3302A` / `#FF5A52` | `#B3261E` / `#EB6B61` |

Paper's accent equals its OK green ("money is the only colour"); Paper marks positive deltas with + and weight, never hue alone.

## Typography

Two families for every theme: **Inter** for all UI text and every number, **JetBrains Mono** for machine text (inference log, Run ID, key hints, countdowns, game-bar meta). Inter is the default typeface of the SaaS and AI-startup world: recognition is the point. Fonts are self-hosted and precached (the game is playable offline, including the high-legibility pair).

- **Tabular figures wherever numbers change** (KPIs, deltas, timers, ticker figures). Rolling numbers never jitter.
- `{typography.display-number}` exists for one moment: the first workspace screen, `$12,400` above `Deploy`.
- `{typography.kpi-value}` for rail tiles; `{typography.doc-title}` for LGTM Docs, AllGreen and end-of-run documents.
- `{typography.label-caps}` for KPI labels, the NEWS label, attention-list titles, urgency tags, toast sources.
- `{typography.mono}` for the company timeline's day column and the shortcut overlay's key caps; `{typography.mono-sm}` for the inference log and countdowns.
- Number notation follows the GDD (Stripe-style): full digits below $100,000, compact above (`$412.5K`, `$12.4M`, `$2.03B`).
- **High-legibility setting:** `{typography.hl-sans}` and `{typography.hl-mono}` replace Inter and JetBrains Mono in every role while on.
- **Text size** scales to 200% through the root size; all sizes and fixed heights are implemented in rem as minimums (`min-height`), never fixed heights.

## Layout & Spacing

4px base scale (`{spacing.1}` … `{spacing.16}`). Density per theme: Ledger is the roomy reference; Ink ~8% tighter (13px base), Ops ~15% tighter (12px base, 2px radii), Paper matches Ledger.

**Desktop (≥ 1280px) — three panes.** Top to bottom: **game bar** · **header bar** (Huddlr wordmark / company · ticker with pause control · `Day N`) · three columns: **sidebar** (`{spacing.sidebar-width}`) · **chat** (fluid, min `{spacing.chat-min-width}`) · **rail** (`{spacing.rail-width}`). Wireframe: [`mockups/layout-options.html`](mockups/layout-options.html) (option A).

**Rail map (fixed positions; born per phase, never reordered):**

| Order | Content | Born |
|---|---|---|
| 0 | Needs attention (0–3 items; rendered only when needed) | First fire |
| Overview, 3 rows × 2 slots | Cash · Runway / MRR · Customers / Headcount · Hype | Garage cascade; Hype at Seed |
| Chart | Cash + MRR (Series A+: ARR + implied valuation) | End of cascade |
| Team section | Named staff, morale, anonymous headcount groups, burn | Seed |
| Infrastructure section | GPU utilisation, capacity, Add capacity (Rent-a-Brain) | Seed |
| Growth section | Implied valuation, peak valuation, round target (M7 growth target), enterprise pipeline | Series A |
| Last | `Aegis-N · inference log` | Garage cascade |
| Footer | "Metrics by Vanity" | With the rail |

Above ~150% text size the Overview grid drops to one column. Reference: [`mockups/gaps.html`](mockups/gaps.html) §5.

**Tablet / narrow window (768–1279px).** Sidebar + chat; the rail becomes a modal right drawer toggled from the chat header; the current fire appears as a **KPI chip** in the chat header.

**Mobile (< 768px).** One surface at a time with a bottom tab bar **Chat · Dashboard · Metis**. The fire is pinned at the top of every tab (one line). Ticker static or hidden. Gutters `{spacing.gutter-mobile}`. Touch targets ≥ `{spacing.target-touch}`. The game bar keeps title + settings icon. Orientation is never locked.

**Targets.** Every desktop control is at least `{spacing.target-min}` square (or meets the WCAG 2.5.8 spacing exception).

**Sticky chrome.** Game bar, header, overdraft banner and mobile fire pin are sticky; the scroll containers set `scroll-padding` for them so a focused element is never hidden. At viewport heights below ~500px the overdraft banner and fire pin collapse to one compact line.

**The UI is born.** Regions not yet unlocked are **not rendered**; no placeholders. Each cascade micro-beat adds exactly one element (EXPERIENCE.md → The Cascade).

**Overlays** are centred documents (max 760px) over a scrim; on mobile and at 320 CSS px they are full screen, investor cards stack, graphs fall back to their data table, log lines wrap.

## Elevation & Depth

Flat. Hierarchy comes from surfaces, lines and type.

- Level 0 canvas `{colors.bg}`; level 1 surfaces with `{colors.line}` edges.
- Overlay level: `components.overlay-doc.shadow` over a 45% `{colors.scrim}`. **No blur.**
- Toasts, staff picker and the tablet drawer use their own lighter shadows (see components).
- Metis surfaces are the only ones allowed a glow (a 1px `{colors.metis-line}` ring + faint tinted shadow).

## Shapes

`{rounded.sm}` for badges, tags, sidebar rows, chips, tooltips, icon buttons; `{rounded.md}` for buttons, inputs, KPI tiles, cards, avatars, company logos; `{rounded.lg}` for overlay documents; `{rounded.full}` only for unread counts, toggles and **Metis pill buttons**. Per-theme: Ink 6px md, Ops 2px everywhere (pills stay pills), Paper 4px md.

Avatars are **rounded squares** (Slack idiom), never circles. **Metis's avatar is a rounded square** filled with the gradient and a ✨ (this supersedes "orb" in the decision log's early wording).

## Components

**Icons** — **Lucide**, outline, 16px in UI and 20px in navigation, 1.75 stroke, `currentColor`. Emoji in copy (🎲 ✨ 🎉 📄) are content, not icons. Core map: settings, dices, hash, layout-dashboard, sparkles, bell (Activity), file-text (Timeline, docs), inbox (Backlog), users, cpu, circle-alert, chevron-down, download, pause/play, message-square.

**Product marks** — each in-fiction product shows a 16px rounded square + wordmark: Huddlr, LGTM Docs and Vanity in `{colors.ink}`; AllGreen in `{colors.ok}`. No logos beyond that.

**Focus ring** — `components.focus-ring`: 2px `{colors.accent}` with a 2px surface halo, visible in every theme, mode, infection stage and under Red Runway.

**Game bar** — `{colors.gamebar-bg}`, full width. Left: the title in `{typography.gamebar}`, the page's first heading; struck words are `<s>` elements (visual strike-through). Right, in `{typography.mono-sm}` `{colors.gamebar-muted}`: `Loop #N · Best N days · Settings` (plain text; no widgets; "Best" is omitted until a first run has ended). The browser tab title mirrors the title with the unread count prefix `(17) Human in the Loop`; struck words in the tab use combining strike-through characters (U+0336), to be verified with VoiceOver/NVDA/JAWS in E8.

**Header bar** — Huddlr wordmark (16px ink square + "Huddlr") / company name in `{typography.body-strong}` · **ticker** (`NEWS` label + headlines, horizontally scrolling or static; a pause/play icon button at its end) · `Day N` in `{typography.mono-sm}`.

**Sidebar** — company name; top entries **Activity** (bell), **Timeline** (file-text), **✨ Automations** (sparkles); while a backlog exists, **Backlog N** above them; sections CHANNELS and DIRECT MESSAGES in `{typography.label-caps}`. Rows: `# channel` muted; unread rows `{typography.body-strong}` ink; active row raised. **Unread badge** only when an urgent item exists in that row; otherwise a bold row and a muted count. Policy-active channels show a small ✨ after the name. ✨ Metis is listed in DMs with its gradient avatar; during an audit pause the name is ~~Metis~~. Phase-unlocked channels appear when unlocked. No company switcher (one company per loop).

**Channel header** — `# name` in `{typography.section-title}`; on policy-capable channels the **policy toggle** at the right: "Metis handles #channel" · switch · "On"/"Off".

**Message** — 32px avatar · name · time line `Day 38 · 0:41 left` (`{typography.meta}`, countdown in `{typography.mono-sm}`; "left" shown only for urgent messages and the backlog top item) · `URGENT` tag when urgent · `@<founder>` mention chip when the message mentions the player (always urgent) · text. Below: **answer buttons** (key hint `1`/`2`/`3` in mono before the label), then **Ask Metis** (`D`) and **Assign** (`A`) as quiet buttons. The **current message** carries a 2px accent left edge. Answered messages collapse into a one-line outcome ("You · Put it on the roadmap"); expired: "Expired · default applied: …" in muted.

**Staff picker** — anchored popover: one row per named staff (avatar, name, trait, "queue N", morale word) plus anonymous groups; Enter assigns.

**Candidate (Garage DM)** — a normal message from the candidate with traits as outlined tags and `$N/day`, answers `1 Hire` / `2 Pass`. **ATS card (#hiring, Seed+)** — `components.ats-card`, posted as an app message (no person as sender; it expires like a message, showing its window in the time line): "NEW APPLICANT · #HIRING" header, avatar, name, role line, trait tags, salary row, Hire (primary) / Pass. The Safety Researcher card adds "Salary 2× · reports on Metis". Reference: [`mockups/gaps.html`](mockups/gaps.html) §1.

**Timer bar** — 4px; fill muted, critical under 5 s; mono countdown beside it.

**Dashboard rail (Vanity)** — in the order of the rail map:
1. **Attention list** ("Needs attention"): 1–3 one-line items, worst first, each with its status word; left edge in the worst item's colour.
2. **KPI tiles** — label caps · value · **last delta persistently shown** ("+$2,000 · last change"). States: ok; **watch** (watch edge + tint + "▲ WATCH"); **critical** (2px critical border + tint + "● CRITICAL"). A positive delta inside a critical tile is drawn in ink with its + sign.
3. **Chart** — cash (muted, solid 1.5px) and MRR (accent, solid 2px) with **direct line labels**; a visually hidden summary sentence and a "View data" link opening a table.
4. **Team section** — `components.team-row` rows; header "Headcount N · burn $X/day".
5. **Infrastructure section** — GPU utilisation KPI tile (watch above 90%), capacity row with a stepper, "Add capacity · +1 unit · $50/day" primary button, "Rent-a-Brain" as provider label.
6. **Growth section** — implied valuation, peak valuation, round target progress (meter + "×3 ARR by Day N"), enterprise pipeline list.
7. **Inference log** — mono, muted, routine lines; odd lines identical in style.
8. Footer "Metrics by Vanity".

**First workspace screen** — empty viewport except `$12,400` (`{typography.display-number}`) and a primary `Deploy` button, centred.

**Founding screen** — Huddlr "Create a workspace" card: wordmark; label "What's the name of your company?" (`{typography.doc-title}`) bound to a text input prefilled with the generated name and an icon button "Generate another name" (🎲) inside it; helper "This will be the name of your Huddlr workspace."; second input **"Your name"** (placeholder "e.g. Giulia"); primary "Found company"; a small "Accessibility" text link under the card (opens Settings → Accessibility). Reference: [`mockups/surfaces.html`](mockups/surfaces.html) (F1).

**Overlay document (LGTM Docs)** — heavy decisions (term sheets, risky-release docs, capability grants) and the while-you-were-away report: breadcrumb, title, KPI delta row, plain list rows, actions at the bottom. After a probabilistic decision the doc gains an **Outcome** section (result line + KPI deltas) and a single "Close". Crises use the AllGreen header and a status chip that changes on outcome. **Investor cards** (`components.investor-card`): three side by side (stacked on narrow screens), company logo, fund name, cash offered, clause in plain text; selected card gets an accent border and "Selected"; the doc's primary button "Sign term sheet".

**Backlog queue** — ranked list in the chat pane under the header "Backlog · N messages". **✨ Auto-triage N messages** (Metis button) + subtitle "Metis will reply based on your previous decisions." pinned on top. The top item is a full message with timer bar; the rest are single-line previews in `{colors.ink-muted}` **at full opacity** (channel · sender · first words), no buttons. Reference: [`mockups/surfaces.html`](mockups/surfaces.html) (B1/B2).

**Company timeline (LGTM Docs)** — centre-pane doc "Company timeline": vertical `components.timeline` with day (mono), event text, actor chip (you / staff name / ✨ Metis on Metis tint). Reference: [`mockups/gaps.html`](mockups/gaps.html) §3 (K2).

**Activity** — Huddlr activity list in the centre pane: every toast, mention and system notice of the run in reverse order, so nothing exists only as a toast.

**Metis surfaces** — DM bubbles on `{colors.metis-tint}` with `{colors.metis-line}` border; Metis buttons; toggle on state; Auto-triage; "Summary by Metis" blocks; "✨ Provision N units · +$X/day" in the capacity DM.

**Toast** — bottom-right of the chat pane (never over the current message), max 3 stacked, control-line border, source in label caps.

**Permission banner** — in-app Huddlr banner at the top of the chat pane: "Get notified when Metis needs you?" · Enable · Not now.

**Overdraft banner** — while cash is negative the Cash tile shows the negative value ("−$1,240") in critical with its sign and is in the critical state. Banner: full width under the header, critical tint + 3px critical edge, bank voice: "Bridge Loan & Trust · Your account is overdrawn by $1,240. 11 days remaining before we escalate."

**Red Runway** — runway < 7 days: the workspace's **backgrounds, avatars, chart and Metis colours** progressively desaturate (to ~20% at 0 days). **Exempt:** all critical-coloured text and edges, the runway tile, attention list, overdraft banner, the focus ring and accent-coloured interaction cues (links, current-message edge). Works in both modes.

**UI infection (Alignment signal; presentational only, never changes layout, controls, roles or accessible names):**

| Alignment crossed | What changes |
|---|---|
| 75 | ✨ only on Metis's own surfaces — the baseline |
| 50 | "✨ Summary by Metis" blocks at the top of rail sections and in channel headers (`{colors.metis-tint}`, `{colors.metis-ink}` text) |
| 25 | Sidebar background takes a faint Metis gradient; standard and answer buttons become gradient pills with a shimmer; section titles gain emoji ("📈 Overview") |
| 10 | Fully "AI-native": header bar filled with the gradient (text in `{colors.on-metis}`), gradient rule under channel headers, gradient tile and team-row borders, sparkles around the ticker label ("✨ NEWS ✨"), every button — quiet ones included — a gradient pill. The attention list and status states stay exempt |

**Infection contrast contract:** pill text is always `{colors.on-metis}`; the sidebar gradient stays ≤ 10% opacity in light and ≤ 25% in dark, or its row text switches to ink; KPI values sit on surface or metis-tint, never on raw gradient; watch/critical edges, labels and tints are exempt; the focus ring halo keeps ≥ 3:1. **Shimmer:** a low-luminance sweep (ΔL < 10%), one pass every ≥ 2 s, never a flash; off under motion settings (the static gradient keeps the signal).

**Clue replay (AllGreen incident page)** — AllGreen header ("AllGreen / Incidents / #0001"). Title "Founder removed from the loop", status chip "Resolved" in ok, meta "Severity: none · Impact: none detected". Sections: **metrics graph** (`components.clue-graph`: valuation solid accent, Alignment dashed critical, both directly labelled, crossing ringed, top-5 decisions as dots) with a written summary sentence and a "View data" table; **top 5 decisions** (numbered to match the dots: day · decision · quoted original message · "Alignment −N"); **counterfactual**; **signals timeline** (one row per title change, minute-8 line, Dora's last "— Dora" and first "— Eudora", and one row listing the Safety Researcher's readings with their days, omitted if none was hired); "Continue" button. Reference: [`mockups/surfaces.html`](mockups/surfaces.html) (C2).

**End-of-run documents** — LGTM Docs export look: white page, company letterhead, `{typography.doc-title}`, header strip `Loop #N · N days in the loop · peak $X · best N days` (+ timing and game-speed labels when not Standard, only if the player ticks "Show timing setting on the document", off by default), 5–8 highlights, cause of death, staff fates, footer `Run ID: 7F3A-K2` in mono. **Wind-down memo** signed by `<founder>`; **Post-mortem** "Prepared by Metis" with a small gradient Metis mark (the only Metis colour). No charts. PNG 1080×1350; PDF A4/Letter, **tagged** (title, language, headings, lists, reading order; Metis mark as artifact). Footer: `Run ID` + "Page 1 of 1"; LGTM Docs mark in the letterhead. Above the actions, a checkbox "Show timing setting on the document" (unchecked by default). Actions: Download PNG · Download PDF · **Copy alt text** · **Start Loop #N+1** (the primary button).

**Avatars** — flat two-tone head-and-shoulders busts, generated from the person's seed (5 skin tones, 5 hair colours × 3 shapes, shirt from `{colors.avatar-1}`…`{colors.avatar-8}`), rounded square. Dora's avatar is fixed across loops. Companies (customers, funds as organisations, banks, Rent-a-Brain) use letter logos. Metis is the gradient square with ✨. Reference: [`mockups/bar-names-avatars.html`](mockups/bar-names-avatars.html) (style D).

**Metis · Automations** — settings page: one row per policy-capable channel (label, stakes in muted, toggle with On/Off), and **Pause Metis for audit** as a destructive button with its cost stated beside it; during cooldown the button is disabled with "Available in N days" as inline text.

**Settings** — standard SaaS settings (left section list, right form): Appearance (theme, mode), Accessibility (presets + GDD settings), Notifications, Data (data room export / import, local stats export, archive of past documents, storage notice).

**Shortcut overlay (`?`)** — overlay doc with a two-column table: mono key caps on `{colors.surface-raised}` with control-line border, and actions.

**Tooltip** — `components.tooltip`; shown on hover **and** focus, dismissable with Esc, hoverable; never the only carrier of a reason (disabled reasons are inline text).

**Mobile tab bar** — three items, Lucide icon + label, active in ink and bold; Chat shows the total unread count; Metis label "✨ Metis".

**Confetti** — flat rectangles in the avatar palette (never Metis colours), inside the chat pane, ≤ 1.5 s; first customer and closed rounds only.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Make every surface something a real SaaS would ship | Health bars, maps, game popups, tutorial arrows, mascots |
| Keep gradients, ✨, pills and shimmer on Metis surfaces (and infection stages) | Purple/pink as a theme accent; gradients in the base workspace |
| Tabular figures for every changing number | Proportional digits in tiles, timers, deltas |
| Pair every status colour with text (+/−, WATCH, CRITICAL, URGENT, On/Off) | Colour-only states |
| Render regions only when unlocked | Locked placeholders, teaser panels |
| Keep KPI tiles in fixed slots; surface the fire through the attention list | Reorder tiles |
| Use a scrim behind overlays | Blur / frosted glass |
| Show muted text at full opacity | Fade text with opacity |
| Use invented names only: Huddlr, Vanity, LGTM Docs, AllGreen, Rent-a-Brain, Bridge Loan & Trust, Hypergrowth Capital, Responsible Ventures (B Corp pending), A Family Office, Last Model Labs, Pre-Product Labs (Stealth) | Real brands or near-miss parodies; myth names beyond Metis / Aegis / Eudora |
| Keep the game bar text-only and dark in every theme (plain-text "Best N days" is allowed) | Score widgets, badges or game chrome in the bar |
| Let Red Runway and infection work in every theme and mode within the contrast contract | Effects that break contrast or only read in one mode |

**Visual references.** [`mockups/layout-options.html`](mockups/layout-options.html) (layout A), [`mockups/directions.html`](mockups/directions.html) (themes), [`mockups/type-title-naming.html`](mockups/type-title-naming.html) (type pair, title placement), [`mockups/bar-names-avatars.html`](mockups/bar-names-avatars.html) (game bar G1, names, avatars), [`mockups/surfaces.html`](mockups/surfaces.html) (founding F1, report R1, backlog, clue replay C2, tablet T1), [`mockups/gaps.html`](mockups/gaps.html) (hiring H3, GPUs P3, timeline K2, Lucide, rail map), [`mockups/key-screens.html`](mockups/key-screens.html) (final key screens: workspace at Seed light/dark, founding + first screen, return report + backlog, clue replay), [`mockups/key-screens-2.html`](mockups/key-screens-2.html) (end-of-run documents, infection stages, Red Runway + overdraft, term sheet + outcome). Mocks show options side by side; company names in them ("Ramen Labs", "Bluewren Analytics", "Quiet Gradient") are placeholders, and the names "10x Ventures", "Superintelligence Inc. (Stealth)", "ClosedAI" and "Anthropomorphic" that appear in `bar-names-avatars.html` were **rejected**. Colours in the mocks predate the AA pass (accent, ok, line-control, avatar-1/3, metis-3 were adjusted). **This spine wins on any conflict with a mock.**
