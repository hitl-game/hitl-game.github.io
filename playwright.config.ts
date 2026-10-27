import { defineConfig, devices } from '@playwright/test';

const deployedBaseUrl = process.env['BASE_URL'];
const isCi = Boolean(process.env['CI']);
const previewUrl = 'http://localhost:4173/';

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: deployedBaseUrl ?? previewUrl,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  ...(deployedBaseUrl === undefined && {
    webServer: {
      command: 'npm run build && npm run preview -- --port 4173 --strictPort',
      url: previewUrl,
      reuseExistingServer: !isCi,
    },
  }),
});
