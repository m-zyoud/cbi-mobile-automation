import { test, chromium } from '@playwright/test';
import { sites } from '../../config/sites';
import { HomePage } from '../../pages/HomePage';

for (const site of Object.values(sites)) {
  test(`verify ${site.name} home page on real Android`, async () => {
    test.setTimeout(120000);

    const browser = await chromium.connectOverCDP(
      'http://127.0.0.1:9222'
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

    const homePage = new HomePage(page);

    await homePage.verifyPageLoaded();

    await homePage.verifyGlobalElements();

    console.log(
      `${site.name} title: ${await homePage.getPageTitle()}`
    );

    await browser.close();
  });
}