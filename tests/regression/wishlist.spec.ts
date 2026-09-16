import { test, chromium } from '@playwright/test';

import { sites } from '../../config/sites';
import { WishlistPage } from '../../pages/WishlistPage';
import { ProductPage } from '../../pages/ProductPage';

for (const site of Object.values(sites)) {
  test(`${site.name} wishlist regression`, async () => {
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

    const productPage = new ProductPage(page);
    const wishlistPage = new WishlistPage(page);

    await test.step('Open a product', async () => {
      const productLinks = page.locator(
        'a[href*="/product/" i], a[href*="/p/" i], [class*="product" i] a'
      );

      const count = await productLinks.count();

      if (count === 0) {
        throw new Error('No product links found');
      }

      for (let i = 0; i < count; i++) {
        const product = productLinks.nth(i);

        if (await product.isVisible().catch(() => false)) {
          await product.click();
          break;
        }
      }

      await page.waitForLoadState('domcontentloaded');
    });

    let productName = '';

    await test.step('Read product information', async () => {
      await productPage.verifyProductPageLoaded();

      productName = await productPage.getProductName();

      console.log(`Product: ${productName}`);
    });

    await test.step('Add product to wishlist', async () => {
      await wishlistPage.addCurrentProductToWishlist();
    });

    await test.step('Open wishlist', async () => {
      await wishlistPage.openWishlist();

      await wishlistPage.verifyWishlistLoaded();
    });

    await test.step('Verify product exists in wishlist', async () => {
      await wishlistPage.verifyProductExists(productName);
    });

    await test.step('Remove product from wishlist', async () => {
      await wishlistPage.removeFirstWishlistItem();
    });

    await browser.close();
  });
}