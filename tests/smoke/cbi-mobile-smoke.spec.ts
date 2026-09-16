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

          let productName = '';
          let productUrl = '';

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
            }
          );

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

              const invalidTerms =
                /logo|frontgate|ballard|garnet hill|grandin road|account|cart|login|sign in|sign up|menu|home|shop now|search|new$|sale$|learn|more|discover|customer service|credit card|privacy|order status/i;

              for (
                let i = 0;
                i < navCount;
                i++
              ) {
                const link =
                  navLinks.nth(i);

                if (
                  !(await link
                    .isVisible()
                    .catch(
                      () => false
                    ))
                ) {
                  continue;
                }

                const text = (
                  await link
                    .innerText()
                    .catch(() => '')
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

                if (
                  !discoveredTerms.some(
                    (term) =>
                      term.toLowerCase() ===
                      text.toLowerCase()
                  )
                ) {
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
                      name: /search results/i,
                    }
                  );

                if (
                  await searchHeading
                    .first()
                    .isVisible()
                    .catch(
                      () => false
                    )
                ) {
                  console.log(
                    `Search heading: ${(
                      await searchHeading
                        .first()
                        .innerText()
                        .catch(
                          () => ''
                        )
                    ).trim()}`
                  );
                }

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

                  if (
                    !(await link
                      .isVisible()
                      .catch(
                        () =>
                          false
                      ))
                  ) {
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

                if (
                  selectedProductHref
                ) {
                  break;
                }

                console.log(
                  `No product found for "${searchTerm}". Trying next candidate...`
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

          await test.step(
            `SM-005 Select ${site.name} options dynamically`,
            async () => {
              console.log(
                'Selecting available product options'
              );

              await productPage.selectAvailableOptions();
            }
          );

          await test.step(
            `SM-006 Add ${site.name} product to cart`,
            async () => {
              console.log(
                'Adding product to cart'
              );

              await productPage.addToCart();
            }
          );

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
            }
          );

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
            }
          );

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
      'Shipping → Delivery Method completed successfully'
    );
  }
);

          await test.step(
  'SM-010 Delivery checkpoint',
  async () => {
    console.log(
      'Frontgate checkout successfully reached Delivery Method'
    );

    console.log(
      'Payment automation will be handled as the next isolated step'
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