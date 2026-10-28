# Contributing

## Setup

```bash
nvm use               # Node 24, from .nvmrc
npm ci                # also installs the pre-commit hook
npx playwright install
```

The pre-commit hook runs ESLint, Stylelint and Prettier on the staged files only.

## Scripts

| Script                              | What it does                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                       | Dev server                                                                                                                                |
| `npm run build` / `npm run preview` | Production build and a local preview of it                                                                                                |
| `npm run check`                     | Every PR gate except e2e: typecheck, ESLint, lint fixtures, Stylelint, Prettier, jscpd, knip, build, size-limit, lazy-chunk check, Vitest |
| `npm test`                          | Vitest                                                                                                                                    |
| `npm run test:e2e`                  | Playwright (Chromium, Firefox, WebKit)                                                                                                    |
| `npm run lint:fixtures`             | Checks that every Charter rule still reports its intentional violation in `tests/lint-fixtures/`                                          |

## Code Quality Charter

The full rules are in `_bmad-output/game-architecture.md` → Code Quality Charter, and the binding summary is in `_bmad-output/project-context.md`. In short:

- Reuse before create; extract at the second occurrence of the same concept.
- Variants are props, tokens and `data-` attributes, never copies.
- Names replace comments. Comments state only a non-obvious _why_. No TODOs: open an issue.
- Small pure functions and plain readonly data. No class hierarchies, no speculative options.
- Numbers carry their unit in the name (`cashCents`, `expiresAtGameMs`).
- Named exports only. No `any`, no non-null `!`, no `@ts-ignore`, no nested ternaries.
- Functions ≤ 40 lines, files ≤ 300 lines, complexity ≤ 10, ≤ 3 parameters, nesting ≤ 3.
- Layers: `ui → app → core → shared`, `app → platform → shared`. Import through `index.ts` only. `core/` is pure: no clocks, randomness or I/O.
- Every visible string comes from `t()`. CSS uses design tokens only.

## Pull requests

- CI must be green: it is the definition of done. Never disable a gate; a lint suppression needs a written reason.
- Fill in the PR template, including the Agent Review Checklist.
- Justify every new dependency in one line. The initial bundle budget is 150 KB gzip.

## Content

Game content (events, characters, headlines, UI copy) follows its own rules. The content guide will live in `docs/content-guide.md`. Until then, read `_bmad-output/narrative-design.md` → Voice Style Guide before writing any player-facing text.
