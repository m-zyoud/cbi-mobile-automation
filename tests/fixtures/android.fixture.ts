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
    const browser =
      await chromium.connectOverCDP(
        'http://127.0.0.1:9222',
        {
          timeout: 60000,
        }
      );

    await use(browser);

    /*
     * Do NOT call browser.close() here.
     *
     * We are connected to a real Android Chrome instance through CDP.
     * Closing the Browser object can also close the real Chrome
     * session/pages and break the following brand test.
     */
  },

  androidContext: async (
    { androidBrowser },
    use
  ) => {
    const context =
      androidBrowser.contexts()[0];

    if (!context) {
      throw new Error(
        'No Android Chrome browser context found. Make sure the Android device is connected and CDP forwarding is active.'
      );
    }

    await use(context);
  },

  androidPage: async (
    { androidContext },
    use
  ) => {
    const pages =
      androidContext.pages();

    const usablePages: Page[] = [];

    for (const page of pages) {
      if (page.isClosed()) {
        continue;
      }

      const url =
        page.url();

      if (
        url.startsWith('chrome://') ||
        url === 'about:blank'
      ) {
        continue;
      }

      usablePages.push(page);
    }

    /*
     * Prefer the newest usable tab instead of pages[0].
     * Android Chrome can retain tabs from previous E2E runs.
     */
    const page =
      usablePages.length > 0
        ? usablePages[
            usablePages.length - 1
          ]
        : pages.length > 0
          ? pages[
              pages.length - 1
            ]
          : await androidContext.newPage();

    console.log(
      `Android CDP page selected: ${page.url()}`
    );

    await use(page);

    /*
     * Do not close the real Android tab here.
     * The E2E journey controls navigation explicitly.
     */
  },
});

export { expect } from '@playwright/test';