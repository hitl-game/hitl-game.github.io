# Deferred work

Items a code review found real but not actionable in the story under review. Each entry names the review that raised it and the decision or story it waits for.

## Deferred from: code review of 8-1-pdfkit-tagged-pdf-spike (2026-10-27)

- **Firefox has never run `tests/e2e/pdfSpike.spec.ts`.** Playwright's Firefox does not launch in the local sandbox ("Could not find profile folder"). The three-engine `e2e` job on `main` is the first run; a Firefox-only failure would block the Pages deploy once. Decision for Tiziano: run `npx playwright test --project=firefox tests/e2e/pdfSpike.spec.ts` once outside the sandbox before merging, or accept the first-run risk.
- **`verapdf` job pulls `verapdf/cli` anonymously from Docker Hub** (`.github/workflows/ci.yml`). A registry rate limit or outage fails `ci` on `main`, and so the deploy, for an unrelated reason. Decision for Tiziano: accept and re-run, or mirror the image (GHCR) later.
- **Footer helpers assume a one-page body** (`src/report/pdf/addRunId.ts`, `src/report/pdf/drawPageLabel.ts`). Fine for the fixed sample; Story 6.5 must draw the footer per page and take the page label from `doc.bufferedPageRange()`. Recorded in ADR 0003 → PDFKit API gotchas.
