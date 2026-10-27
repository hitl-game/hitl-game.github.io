import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { watchPageProblems } from './watchPageProblems.ts';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

test('loads the empty shell with no errors and no foreign requests', async ({ page, baseURL }) => {
  const problems = watchPageProblems(page, baseURL);

  await page.goto('./');

  await expect(page.getByRole('main')).toHaveCount(1);
  expect(problems.errors).toEqual([]);
  expect(problems.foreignRequests).toEqual([]);
  const axeResults = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(axeResults.violations).toEqual([]);
});
