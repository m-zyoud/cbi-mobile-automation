import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 120000,

  expect: {
    timeout: 10000,
  },

  fullyParallel: false,

  workers: 1,

  retries: 0,

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],

  use: {
    trace: 'retain-on-failure',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    actionTimeout: 15000,

    navigationTimeout: 60000,
  },

  outputDir: 'test-results',
});