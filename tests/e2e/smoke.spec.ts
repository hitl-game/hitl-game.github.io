import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const localSchemes = new Set(['data:', 'blob:']);

test('loads the empty shell with no errors and no foreign requests', async ({ page, baseURL }) => {
  const siteOrigin = new URL(baseURL ?? '').origin;
  const errors: string[] = [];
  const foreignRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!localSchemes.has(url.protocol) && url.origin !== siteOrigin) {
      foreignRequests.push(url.href);
    }
  });

  await page.goto('./');

  await expect(page.getByRole('main')).toHaveCount(1);
  expect(errors).toEqual([]);
  expect(foreignRequests).toEqual([]);
  const axeResults = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(axeResults.violations).toEqual([]);
});
