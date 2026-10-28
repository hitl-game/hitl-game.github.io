import type { Page } from '@playwright/test';

export interface PageProblems {
  readonly errors: string[];
  readonly foreignRequests: string[];
}

const localSchemes = new Set(['data:', 'blob:']);

export const watchPageProblems = (page: Page, baseUrl: string | undefined): PageProblems => {
  const siteOrigin = new URL(baseUrl ?? '').origin;
  const problems: PageProblems = { errors: [], foreignRequests: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') problems.errors.push(message.text());
  });
  page.on('pageerror', (error) => problems.errors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!localSchemes.has(url.protocol) && url.origin !== siteOrigin) {
      problems.foreignRequests.push(url.href);
    }
  });
  return problems;
};
