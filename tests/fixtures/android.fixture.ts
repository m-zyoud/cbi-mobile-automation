import {
  Browser,
  BrowserContext,
  chromium,
  Page,
  test as base,
} from '@playwright/test';

type AndroidFixtures = {
  androidBrowser: Browser;
  androidContext: BrowserContext;
  androidPage: Page;
};

export const test = base.extend<AndroidFixtures>({
  androidBrowser: async ({}, use) => {
    const browser = await chromium.connectOverCDP(
      'http://127.0.0.1:9222',
      {
        timeout: 60000,
      }
    );

    await use(browser);

    await browser.close();
  },

  androidContext: async ({ androidBrowser }, use) => {
    const context = androidBrowser.contexts()[0];

    if (!context) {
      throw new Error(
        'No Android Chrome browser context found. Make sure the Android device is connected and CDP forwarding is active.'
      );
    }

    await use(context);
  },

  androidPage: async ({ androidContext }, use) => {
    const pages = androidContext.pages();

    const page =
      pages.length > 0
        ? pages[0]
        : await androidContext.newPage();

    await use(page);
  },
});

export { expect } from '@playwright/test';