import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { watchPageProblems } from './watchPageProblems.ts';

// NFR6: PNG and PDF generation stays under 3 s.
const generationBudgetMs = 3000;
const outputDir = path.join('test-results', 'pdf-spike');

const generateSamplePdf = async (page: Page): Promise<number> => {
  await page.getByRole('button', { name: 'Generate sample PDF' }).click();
  const status = page.getByRole('status');
  await expect(status).toHaveAttribute('data-generation-duration-ms', /^\d+$/);
  return Number(await status.getAttribute('data-generation-duration-ms'));
};

const downloadSamplePdf = async (page: Page, filePath: string): Promise<Buffer> => {
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download sample PDF' }).click();
  await (await downloadEvent).saveAs(filePath);
  return readFile(filePath);
};

test('generates the sample tagged PDF in the browser without cross-origin isolation', async ({
  page,
  baseURL,
  browserName,
}) => {
  const problems = watchPageProblems(page, baseURL);
  await page.goto('./spike/pdf.html');
  expect(await page.evaluate('globalThis.crossOriginIsolated')).toBe(false);

  const coldDurationMs = await generateSamplePdf(page);
  const warmDurationMs = await generateSamplePdf(page);
  await mkdir(outputDir, { recursive: true });
  const pdf = await downloadSamplePdf(page, path.join(outputDir, `sample-${browserName}.pdf`));
  await writeFile(
    path.join(outputDir, `timing-${browserName}.json`),
    JSON.stringify({ browserName, coldDurationMs, warmDurationMs, pdfBytes: pdf.byteLength }),
  );

  const pdfText = pdf.toString('latin1');
  expect(pdfText.startsWith('%PDF-1.7')).toBe(true);
  expect(pdfText).toContain('/Marked true');
  expect(pdfText).toContain('/StructTreeRoot');
  expect(pdfText).toContain('/Lang (en-US)');
  expect(coldDurationMs).toBeLessThan(generationBudgetMs);
  expect(warmDurationMs).toBeLessThan(generationBudgetMs);
  expect(problems.errors).toEqual([]);
  expect(problems.foreignRequests).toEqual([]);
});
