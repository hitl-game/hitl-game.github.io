import preact from '@preact/preset-vite';
import { configDefaults, defineConfig } from 'vitest/config';

const nodeOnlyTests = ['src/{core,shared}/**/*.test.{ts,tsx}'];

export default defineConfig({
  plugins: [preact()],
  test: {
    passWithNoTests: false,
    setupFiles: ['tests/setup/configureFastCheck.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          environment: 'node',
          include: [...nodeOnlyTests, 'tools/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [...configDefaults.exclude, ...nodeOnlyTests],
        },
      },
    ],
  },
});
