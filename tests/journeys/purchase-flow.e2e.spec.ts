import {
  test,
  expect,
} from '../fixtures/android.fixture';

import { sites } from '../../config/sites';
import { testData } from '../../config/test-data';

import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

import {
  discoverAndOpenProduct,
} from '../helpers/product-discovery';

test.describe(
  'CBI Mobile End-to-End Purchase Journey',
  () => {
    for (
      const site of Object.values(
        sites
      )
    ) {
      test(
        `${site.name} E2E dynamic purchase journey`,
        async ({ androidPage }) => {
          test.setTimeout(300000);

          console.log(
            `\n===== ${site.name} =====`
          );

          const page =
            androidPage;

          const homePage =
            new HomePage(page);

          const productPage =
            new ProductPage(page);

          const cartPage =
            new CartPage(page);

          const checkoutPage =
            new CheckoutPage(page);

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
           * Discover and open a real product dynamically.
           */
          await test.step(
            `SM-003 Dynamically search ${site.name}`,
            async () => {
              const discoveredProduct =
                await discoverAndOpenProduct(
                  page,
                  site.url,
                  site.name
                );

              productUrl =
                discoveredProduct.productUrl;

              console.log(
                `Search term used: ${discoveredProduct.searchTerm}`
              );

              console.log(
                `Discovered product URL: ${productUrl}`
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
                productName,
                'Product name should be available on PDP'
              ).not.toBe('');

              console.log(
                `Product: ${productName}`
              );

              console.log(
                `PDP URL: ${productUrl}`
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
           * Verify shopping cart and ensure the same
           * PDP product appears in the cart.
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

              await cartPage.verifyProductInCart(
                productName
              );

              console.log(
                `Verified cart count: ${cartCount}`
              );

              console.log(
                `Verified same product in cart: ${productName}`
              );

              console.log(
                `Original PDP URL: ${productUrl}`
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
           * Guest checkout + shipping + delivery method.
           */
          await test.step(
            `SM-009 Complete ${site.name} shipping and delivery`,
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

              await checkoutPage.verifyDeliveryMethodSelectedIfRequired();

              console.log(
                `${site.name}: Shipping → Delivery Method completed successfully`
              );
            }
          );

          /*
           * SM-010
           * Continue safely to Payment.
           *
           * IMPORTANT:
           * Automation stops at Payment and must never
           * submit/place the final order.
           */
          await test.step(
            `SM-010 Reach ${site.name} payment checkpoint safely`,
            async () => {
              console.log(
                'Continuing from Delivery to Payment'
              );

              await checkoutPage.continueToPayment();

              await checkoutPage.verifyPaymentStepLoaded();

              const paymentAvailable =
                await checkoutPage.hasPaymentFormOrControls();

              expect(
                paymentAvailable,
                `${site.name}: Payment section or controls should be available`
              ).toBeTruthy();

              console.log(
                `${site.name}: Payment checkpoint reached successfully`
              );

              await checkoutPage.verifyNoOrderSubmissionControlsAreTriggered();

              console.log(
                `${site.name}: Verified automation stopped before order submission`
              );
            }
          );

          console.log(
            `===== ${site.name} E2E purchase journey completed safely at Payment =====`
          );
        }
      );
    }
  }
);
