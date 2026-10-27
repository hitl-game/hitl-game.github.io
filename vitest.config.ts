import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

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
          include: ['src/core/**/*.test.ts', 'src/shared/**/*.test.ts', 'tools/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/{ui,app,i18n,platform,debug,report}/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});
