import { test, chromium } from '@playwright/test';

import { sites } from '../../config/sites';
import { testData } from '../../config/test-data';
import { AccountPage } from '../../pages/AccountPage';

for (const site of Object.values(sites)) {
  test(`${site.name} login regression`, async () => {
    test.setTimeout(120000);

    test.skip(
      !testData.account.email || !testData.account.password,
      'CBI test account credentials are not configured'
    );

    const browser = await chromium.connectOverCDP(
      'http://127.0.0.1:9222',
      {
        timeout: 60000,
      }
    );

    const context = browser.contexts()[0];

    if (!context) {
      throw new Error('No browser context found');
    }

    const pages = context.pages();

    const page =
      pages.length > 0
        ? pages[0]
        : await context.newPage();

    await page.goto(site.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const accountPage = new AccountPage(page);

    await test.step('Open My Account', async () => {
      await accountPage.openAccount();

      await accountPage.verifyAccountPageLoaded();
    });

    await test.step('Login', async () => {
      await accountPage.login(
        testData.account.email,
        testData.account.password
      );
    });

    await test.step('Verify user is logged in', async () => {
      await accountPage.verifyLoggedIn();
    });

    await browser.close();
  });
}