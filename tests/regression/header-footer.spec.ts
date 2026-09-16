import { test, chromium } from '@playwright/test';

import { sites } from '../../config/sites';
import { HeaderFooterPage } from '../../pages/HeaderFooterPage';

for (const site of Object.values(sites)) {
  test(`${site.name} header and footer regression`, async () => {
    test.setTimeout(120000);

    const browser = await chromium.connectOverCDP(
      'http://127.0.0.1:9222',
      {
        timeout: 60000,
      }
    );

    const contexts = browser.contexts();

    if (contexts.length === 0) {
      throw new Error('No browser context found');
    }

    const context = contexts[0];

    const pages = context.pages();

    const page =
      pages.length > 0
        ? pages[0]
        : await context.newPage();

    await page.goto(site.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const headerFooterPage =
      new HeaderFooterPage(page);

    await test.step('Verify header', async () => {
      await headerFooterPage.verifyHeaderVisible();
    });

    await test.step('Verify logo', async () => {
      await headerFooterPage.verifyLogoVisible();
    });

    await test.step('Verify search', async () => {
      await headerFooterPage.verifySearchAvailable();
    });

    await test.step('Verify cart', async () => {
      await headerFooterPage.verifyCartAvailable();
    });

    await test.step('Verify account', async () => {
      await headerFooterPage.verifyAccountAvailable();
    });

    await test.step('Verify footer', async () => {
      await headerFooterPage.verifyFooterVisible();
    });

    console.log(
      `${site.name} header/footer regression completed`
    );

    await browser.close();
  });
}