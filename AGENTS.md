# Agent instructions

Human in the Loop is a browser game built with Preact, TypeScript and Vite, deployed to GitHub Pages.

## Read first

- `_bmad-output/project-context.md`: the binding rules for all code. Follow them exactly.
- `_bmad-output/game-architecture.md`: the decisions behind the rules, the Code Quality Charter and the Agent Review Checklist.
- Before writing any player-facing text, read `_bmad-output/narrative-design.md` → Voice Style Guide.
- UX: `_bmad-output/planning-artifacts/ux-designs/ux-browser-game-2026-10-26/`. Never copy values from UX `mockups/`; DESIGN.md / EXPERIENCE.md win over mocks.

## Layers

`ui → app → core → shared` · `app → platform → shared` · `report → core + shared` · `i18n → shared` · `debug → app` · `spike → report` (Story 8.1 PDF spike page only; Story 6.5 removes it). `ui` never imports `core` or `platform`. Import through `index.ts` only. Features never import features.

## Working rules

- Use Node 24 (`nvm use`).
- CI is the definition of done; never disable a gate. A lint suppression needs a written reason.
- Before closing a story, run the Agent Review Checklist and paste it, ticked, in the PR.

## npm scripts

| Script                      | What it does                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `dev` / `build` / `preview` | Vite dev server, production build, preview of the build                                                          |
| `typecheck`                 | `tsc -b`                                                                                                         |
| `lint` / `lint:css`         | ESLint (Charter and boundaries) / Stylelint (tokens only)                                                        |
| `lint:fixtures`             | Proves every Charter rule still fails on its violation fixture                                                   |
| `format` / `format:check`   | Prettier                                                                                                         |
| `dup` / `knip` / `size`     | Duplication, dead code and dependencies, bundle budget plus the lazy-chunk check (`tools/checkInitialBundle.ts`) |
| `test` / `test:e2e`         | Vitest / Playwright                                                                                              |
| `content:schema`            | Regenerates `content/schema/*.schema.json` from the Zod content schemas (commit the result)                      |
| `i18n:types`                | Regenerates `src/i18n/uiKeys.ts` (typed UI keys and arguments) from `locales/en/ui.json` (commit the result)     |
| `i18n:missing`              | Lists missing or unknown translation keys as warnings; fails only on a malformed catalog                         |
| `check`                     | Every PR gate except e2e, in sequence                                                                            |
