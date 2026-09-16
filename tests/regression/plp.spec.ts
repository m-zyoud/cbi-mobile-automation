import { test, chromium } from '@playwright/test';

import { sites } from '../../config/sites';
import { PLPPage } from '../../pages/PLPPage';

for (const site of Object.values(sites)) {
  test(`${site.name} PLP regression`, async () => {
    test.setTimeout(120000);

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

    const plpPage = new PLPPage(page);

    await test.step('Open a category or PLP', async () => {
      const categoryLink = page
        .locator(
          'a[href*="category" i], nav a, [class*="category" i] a'
        )
        .filter({
          visible: true,
        })
        .first();

      await categoryLink.click();

      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify PLP loaded', async () => {
      await plpPage.verifyPLPLoaded();

      const productCount =
        await plpPage.getProductCount();

      console.log(
        `${site.name} PLP product count: ${productCount}`
      );
    });

    await test.step('Verify sort control', async () => {
      await plpPage.verifySortAvailable();
    });

    await test.step('Verify filter control', async () => {
      await plpPage.verifyFilterAvailable();
    });

    await test.step('Open first visible product', async () => {
      await plpPage.openFirstVisibleProduct();
    });

    await browser.close();
  });
}