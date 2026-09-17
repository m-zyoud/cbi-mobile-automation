import {
  test,
  expect,
  chromium,
} from '@playwright/test';

import { sites } from '../../config/sites';
import { testData } from '../../config/test-data';

import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.describe(
  'CBI Mobile Cross-Site Smoke',
  () => {
    test.describe.configure({
      mode: 'serial',
    });

    for (
      const site of Object.values(
        sites
      )
    ) {
      test(
        `${site.name} dynamic mobile purchase flow`,
        async () => {
          test.setTimeout(300000);

          console.log(
            `\n===== ${site.name} =====`
          );

          /*
           * Connect Playwright to the Chrome instance
           * running on the real Android device through CDP.
           */
          const browser =
            await chromium.connectOverCDP(
              'http://127.0.0.1:9222',
              {
                timeout: 60000,
              }
            );

          const contexts =
            browser.contexts();

          expect(
            contexts.length,
            'A real Android Chrome context is required'
          ).toBeGreaterThan(0);

          const context =
            contexts[0];

          const pages =
            context.pages();

          const page =
            pages.length > 0
              ? pages[0]
              : await context.newPage();

          /*
           * Page Objects
           */
          const homePage =
            new HomePage(page);

          const searchPage =
            new SearchPage(page);

          const productPage =
            new ProductPage(page);

          const cartPage =
            new CartPage(page);

          const checkoutPage =
            new CheckoutPage(page);

          /*
           * Runtime data.
           *
           * Product name, product URL and search term
           * are discovered dynamically.
           */
          let productName = '';
          let productUrl = '';

          /*
           * SM-001
           * Open brand website.
           */
          await test.step(
            `SM-001 Open ${site.name}`,
            async () => {
              console.log(
                `Opening ${site.name}`
              );

              await page.goto(
                site.url,
                {
                  waitUntil:
                    'domcontentloaded',
                  timeout: 60000,
                }
              );

              await page.waitForTimeout(
                2000
              );

              await homePage.verifyPageLoaded();

              await expect(
                page.locator('body')
              ).toBeVisible();
            }
          );

          /*
           * SM-002
           * Verify reusable global elements.
           */
          await test.step(
            `SM-002 Verify ${site.name} global elements`,
            async () => {
              console.log(
                'Verifying global elements'
              );

              await homePage.verifyGlobalElements();

              await expect(
                page
                  .locator('header')
                  .first()
              ).toBeVisible();

              await expect(
                page
                  .locator('footer')
                  .first()
              ).toBeVisible();

              console.log(
                `${site.name} global elements verified`
              );
            }
          );

          /*
           * SM-003
           *
           * Discover possible search terms from
           * the site's own visible navigation.
           *
           * No hardcoded product name or search term.
           */
          await test.step(
            `SM-003 Dynamically search ${site.name}`,
            async () => {
              console.log(
                'Discovering runtime search candidates'
              );

              const navLinks =
                page.locator(
                  'nav a[href], header a[href]'
                );

              const navCount =
                Math.min(
                  await navLinks.count(),
                  60
                );

              const discoveredTerms:
                string[] = [];

              /*
               * Prevent utility/navigation controls
               * from becoming search terms.
               */
              const invalidTerms =
                /logo|frontgate|ballard|garnet hill|grandin road|account|cart|login|sign in|sign up|menu|home|shop now|search|new$|sale$|learn|more|discover|customer service|credit card|privacy|order status/i;

              for (
                let i = 0;
                i < navCount;
                i++
              ) {
                const link =
                  navLinks.nth(i);

                const visible =
                  await link
                    .isVisible()
                    .catch(
                      () => false
                    );

                if (!visible) {
                  continue;
                }

                const text = (
                  await link
                    .innerText()
                    .catch(
                      () => ''
                    )
                )
                  .replace(
                    /\s+/g,
                    ' '
                  )
                  .trim();

                const href =
                  await link.getAttribute(
                    'href'
                  );

                if (
                  !href ||
                  href === '#' ||
                  href === '/' ||
                  !text
                ) {
                  continue;
                }

                if (
                  invalidTerms.test(
                    text
                  )
                ) {
                  continue;
                }

                if (
                  text.length < 4 ||
                  text.length > 40
                ) {
                  continue;
                }

                if (
                  text.split(/\s+/)
                    .length > 5
                ) {
                  continue;
                }

                if (
                  !/^[A-Za-z][A-Za-z0-9 &'/-]+$/.test(
                    text
                  )
                ) {
                  continue;
                }

                const duplicate =
                  discoveredTerms.some(
                    (term) =>
                      term.toLowerCase() ===
                      text.toLowerCase()
                  );

                if (!duplicate) {
                  discoveredTerms.push(
                    text
                  );
                }
              }

              console.log(
                'Discovered terms:',
                discoveredTerms
              );

              if (
                discoveredTerms.length ===
                0
              ) {
                throw new Error(
                  `${site.name}: no runtime search candidates found`
                );
              }

              /*
               * Limit retries so a broken search
               * does not create an endless test.
               */
              const termsToTry =
                discoveredTerms.slice(
                  0,
                  10
                );

              console.log(
                `Trying up to ${termsToTry.length} search terms`
              );

              let selectedProductHref =
                '';

              let selectedProductLabel =
                '';

              let successfulSearchTerm =
                '';

              /*
               * Try discovered search terms until
               * a real product link is found.
               */
              for (
                let attempt = 0;
                attempt <
                termsToTry.length;
                attempt++
              ) {
                const searchTerm =
                  termsToTry[attempt];

                console.log(
                  `\nSearch attempt ${
                    attempt + 1
                  }/${
                    termsToTry.length
                  }: "${searchTerm}"`
                );

                await searchPage.openSearch();

                const searchInput =
                  page
                    .locator(
                      [
                        'input[type="search"]',
                        'input[name*="search" i]',
                        'input[id*="search" i]',
                        'input[placeholder*="search" i]',
                        'input[placeholder*="find" i]',
                      ].join(',')
                    )
                    .first();

                await expect(
                  searchInput
                ).toBeVisible({
                  timeout: 10000,
                });

                await searchInput.fill(
                  searchTerm
                );

                await searchInput.press(
                  'Enter'
                );

                await page.waitForLoadState(
                  'domcontentloaded'
                );

                console.log(
                  `Search URL: ${page.url()}`
                );

                await page.waitForTimeout(
                  3000
                );

                const searchHeading =
                  page.getByRole(
                    'heading',
                    {
                      name:
                        /search results/i,
                    }
                  );

                const headingVisible =
                  await searchHeading
                    .first()
                    .isVisible()
                    .catch(
                      () => false
                    );

                if (
                  headingVisible
                ) {
                  const heading =
                    (
                      await searchHeading
                        .first()
                        .innerText()
                        .catch(
                          () => ''
                        )
                    ).trim();

                  console.log(
                    `Search heading: ${heading}`
                  );
                }

                /*
                 * Product links generally contain
                 * a uniqueId or numeric product ID.
                 */
                const productLinks =
                  page.locator(
                    [
                      'a[href*="uniqueId="]',
                      'main a[href]',
                    ].join(',')
                  );

                const productLinkCount =
                  Math.min(
                    await productLinks.count(),
                    250
                  );

                console.log(
                  `Link candidates after search: ${productLinkCount}`
                );

                for (
                  let i = 0;
                  i <
                  productLinkCount;
                  i++
                ) {
                  const link =
                    productLinks.nth(
                      i
                    );

                  const visible =
                    await link
                      .isVisible()
                      .catch(
                        () => false
                      );

                  if (!visible) {
                    continue;
                  }

                  const href =
                    await link.getAttribute(
                      'href'
                    );

                  if (!href) {
                    continue;
                  }

                  const label = (
                    await link
                      .innerText()
                      .catch(
                        () => ''
                      )
                  )
                    .replace(
                      /\s+/g,
                      ' '
                    )
                    .trim();

                  /*
                   * Reject utility URLs.
                   */
                  if (
                    href === '#' ||
                    href === '/' ||
                    href.startsWith(
                      'javascript:'
                    ) ||
                    href.startsWith(
                      'mailto:'
                    ) ||
                    href.startsWith(
                      'tel:'
                    )
                  ) {
                    continue;
                  }

                  if (
                    /account|login|register|customer|privacy|cart|wishlist|facebook|instagram|pinterest|content-path|CustomerService/i.test(
                      href
                    )
                  ) {
                    continue;
                  }

                  const looksLikeProduct =
                    /uniqueId=/i.test(
                      href
                    ) ||
                    /\/\d{5,}(?:\?|$)/.test(
                      href
                    );

                  if (
                    !looksLikeProduct
                  ) {
                    continue;
                  }

                  selectedProductHref =
                    href;

                  selectedProductLabel =
                    label;

                  successfulSearchTerm =
                    searchTerm;

                  console.log(
                    `Product found: "${
                      label ||
                      '(image link)'
                    }" -> ${href}`
                  );

                  break;
                }

                /*
                 * Product found.
                 */
                if (
                  selectedProductHref
                ) {
                  break;
                }

                console.log(
                  `No product found for "${searchTerm}". Trying next candidate...`
                );

                /*
                 * Reset to home before another
                 * dynamic search attempt.
                 */
                await page.goto(
                  site.url,
                  {
                    waitUntil:
                      'domcontentloaded',
                    timeout: 60000,
                  }
                );

                await page.waitForTimeout(
                  1500
                );
              }

              if (
                !selectedProductHref
              ) {
                throw new Error(
                  `${site.name}: none of the dynamically discovered search terms returned an eligible product`
                );
              }

              console.log(
                `Successful search term: "${successfulSearchTerm}"`
              );

              console.log(
                `Selected product: "${
                  selectedProductLabel ||
                  '(product image)'
                }"`
              );

              /*
               * Convert relative PDP URL into
               * an absolute URL.
               */
              const productDestination =
                new URL(
                  selectedProductHref,
                  page.url()
                ).toString();

              console.log(
                `Opening PDP: ${productDestination}`
              );

              await page.goto(
                productDestination,
                {
                  waitUntil:
                    'domcontentloaded',
                  timeout: 60000,
                }
              );

              await page.waitForTimeout(
                1500
              );

              console.log(
                `PDP URL: ${page.url()}`
              );
            }
          );

          /*
           * SM-004
           * Verify product detail page.
           */
          await test.step(
            `SM-004 Verify ${site.name} PDP`,
            async () => {
              console.log(
                'Verifying PDP'
              );

              await productPage.verifyProductPageLoaded();

              productName =
                await productPage.getProductName();

              productUrl =
                page.url();

              expect(
                productName
              ).not.toBe('');

              console.log(
                `Product: ${productName}`
              );
            }
          );

          /*
           * SM-005
           * Dynamically handle required PDP options.
           */
          await test.step(
            `SM-005 Select ${site.name} options dynamically`,
            async () => {
              console.log(
                'Selecting available product options'
              );

              await productPage.selectAvailableOptions();

              console.log(
                'PDP option selection completed'
              );
            }
          );

          /*
           * SM-006
           * Add product to cart.
           */
          await test.step(
            `SM-006 Add ${site.name} product to cart`,
            async () => {
              console.log(
                'Adding product to cart'
              );

              await productPage.addToCart();

              console.log(
                `${site.name} product added to cart`
              );
            }
          );

          /*
           * SM-007
           * Verify shopping cart.
           */
          await test.step(
            `SM-007 Verify ${site.name} cart`,
            async () => {
              console.log(
                'Opening cart'
              );

              await cartPage.openCart();

              await cartPage.verifyCartLoaded();

              const cartCount =
                await cartPage.getCartItemCount();

              console.log(
                `Cart count returned: ${cartCount}`
              );

              expect(
                cartCount,
                'Cart should contain at least one item after Add to Cart'
              ).toBeGreaterThan(0);

              console.log(
                `Verified cart count: ${cartCount}`
              );

              console.log(
                `Original PDP URL: ${productUrl}`
              );

              console.log(
                `Product under test: ${productName}`
              );
            }
          );

          /*
           * SM-008
           * Enter checkout.
           */
          await test.step(
            `SM-008 Proceed through ${site.name} checkout`,
            async () => {
              console.log(
                'Proceeding to checkout'
              );

              console.log(
                `URL before checkout: ${page.url()}`
              );

              await cartPage.proceedToCheckout();

              console.log(
                `URL after checkout: ${page.url()}`
              );

              console.log(
                `Title after checkout: ${await page.title()}`
              );

              await page.waitForTimeout(
                3000
              );

              await checkoutPage.verifyCheckoutLoaded();

              console.log(
                `${site.name} checkout loaded`
              );
            }
          );

          /*
           * SM-009
           * Guest checkout + shipping +
           * delivery method.
           */
          await test.step(
            `SM-009 Complete ${site.name} shipping and reach delivery`,
            async () => {
              console.log(
                'Starting shipping checkout flow'
              );

              await checkoutPage.continueAsGuestIfNeeded();

              await checkoutPage.fillShippingDetails(
                testData.shipping
              );

              await checkoutPage.continueToDeliveryMethod();

              await checkoutPage.verifyDeliveryMethodLoaded();

              await checkoutPage.selectDeliveryMethodIfNeeded();

              await checkoutPage.printDeliveryControls();

              console.log(
                `${site.name}: Shipping → Delivery Method completed successfully`
              );
            }
          );

          /*
           * SM-010
           *
           * Stable delivery checkpoint.
           *
           * IMPORTANT:
           * This is generic for every configured CBI site.
           */
          await test.step(
            `SM-010 ${site.name} delivery checkpoint`,
            async () => {
              await checkoutPage.verifyDeliveryMethodLoaded();

              console.log(
                `${site.name} checkout successfully reached Delivery Method`
              );

              console.log(
                `${site.name} payment automation is available as the next checkout step`
              );
            }
          );

          console.log(
            `===== ${site.name} smoke flow completed =====`
          );
        }
      );
    }
  }
);