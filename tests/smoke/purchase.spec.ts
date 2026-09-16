import { test, chromium } from '@playwright/test';

import { sites } from '../../config/sites';
import { testData } from '../../config/test-data';

import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

for (const site of Object.values(sites)) {
  test(`${site.name} mobile smoke purchase flow`, async () => {
    test.setTimeout(180000);

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

    console.log(`Opening ${site.name}...`);

    await page.goto(site.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Verify home page', async () => {
      await homePage.verifyPageLoaded();
      await homePage.verifyGlobalElements();
    });

    await test.step('Search for a product', async () => {
      const searchTerm =
        testData.searchTerms[
          Math.floor(
            Math.random() * testData.searchTerms.length
          )
        ];

      console.log(`Search term: ${searchTerm}`);

      await searchPage.openSearch();

      await searchPage.searchFor(searchTerm);

      await searchPage.verifyResultsLoaded();
    });

    await test.step('Open a product', async () => {
      const productLinks = page.locator(
        'a[href*="/product/" i], a[href*="/p/" i], [class*="product" i] a'
      );

      const productCount = await productLinks.count();

      if (productCount === 0) {
        throw new Error('No products found');
      }

      for (let i = 0; i < productCount; i++) {
        const product = productLinks.nth(i);

        if (await product.isVisible().catch(() => false)) {
          await product.click();
          break;
        }
      }

      await page.waitForLoadState('domcontentloaded');
    });

    let productName = '';

    await test.step('Verify PDP and select options', async () => {
      await productPage.verifyProductPageLoaded();

      productName = await productPage.getProductName();

      console.log(`Selected product: ${productName}`);

      await productPage.selectAvailableOptions();
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart();
    });

    await test.step('Verify cart', async () => {
      await cartPage.openCart();

      await cartPage.verifyCartLoaded();

      await cartPage.verifyProductInCart(productName);

      const itemCount =
        await cartPage.getCartItemCount();

      console.log(`Cart item count: ${itemCount}`);
    });

    await test.step('Proceed to checkout', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.verifyCheckoutLoaded();
    });

    await test.step('Fill shipping information', async () => {
      await checkoutPage.fillShippingDetails(
        testData.shipping
      );
    });

    await test.step('Continue to payment', async () => {
      await checkoutPage.continueToPayment();

      await checkoutPage.verifyPaymentStepLoaded();
    });

    console.log(
      `${site.name} smoke flow reached payment successfully`
    );

    await browser.close();
  });
}