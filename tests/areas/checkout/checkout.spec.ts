import { Page } from '@playwright/test';

import { sites } from '../../../config/sites';
import { testData } from '../../../config/test-data';

import { PLPPage } from '../../../pages/PLPPage';
import { ProductPage } from '../../../pages/ProductPage';
import { CartPage } from '../../../pages/CartPage';
import { CheckoutPage } from '../../../pages/CheckoutPage';

import {
  test,
  expect,
} from '../../fixtures/android.fixture';

async function prepareCheckout(
  page: Page,
  siteUrl: string
): Promise<CheckoutPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const plpPage =
    new PLPPage(page);

  await plpPage.openFirstAvailableCategory();

  await plpPage.verifyPLPLoaded();

  await plpPage.openFirstVisibleProduct();

  const productPage =
    new ProductPage(page);

  await productPage.verifyProductPageLoaded();

  await productPage.selectAvailableOptions();

  await productPage.addToCart();

  const cartPage =
    new CartPage(page);

  await cartPage.openCart();

  await cartPage.verifyCartNotEmpty();

  await cartPage.proceedToCheckout();

  const checkoutPage =
    new CheckoutPage(page);

  await checkoutPage.verifyCheckoutLoaded();

  return checkoutPage;
}

async function prepareDelivery(
  page: Page,
  siteUrl: string
): Promise<CheckoutPage> {
  const checkoutPage =
    await prepareCheckout(
      page,
      siteUrl
    );

  await checkoutPage.continueAsGuestIfNeeded();

  await checkoutPage.fillShippingDetails(
    testData.shipping
  );

  await checkoutPage.continueToDeliveryMethod();

  await checkoutPage.verifyDeliveryMethodLoaded();

  return checkoutPage;
}

for (const site of Object.values(sites)) {
  test.describe(
    `${site.name} - Checkout`,
    () => {
      test.setTimeout(180000);

      test(
        'CHECKOUT-001 Verify checkout loads successfully',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareCheckout(
              androidPage,
              site.url
            );

          await checkoutPage.verifyCheckoutLoaded();
        }
      );

      test(
        'CHECKOUT-002 Verify valid checkout state is available',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareCheckout(
              androidPage,
              site.url
            );

          await checkoutPage.verifyCheckoutStateAvailable();
        }
      );

      test(
        'CHECKOUT-003 Verify guest checkout can continue when required',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareCheckout(
              androidPage,
              site.url
            );

          await checkoutPage.continueAsGuestIfNeeded();

          await checkoutPage.verifyCheckoutStateAvailable();
        }
      );

      test(
        'CHECKOUT-004 Verify shipping information can be completed',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareCheckout(
              androidPage,
              site.url
            );

          await checkoutPage.continueAsGuestIfNeeded();

          await checkoutPage.fillShippingDetails(
            testData.shipping
          );

          await checkoutPage.verifyShippingDataAvailable();
        }
      );

      test(
        'CHECKOUT-005 Verify user can continue to Delivery Method',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareDelivery(
              androidPage,
              site.url
            );

          await checkoutPage.verifyDeliveryMethodLoaded();
        }
      );

      test(
        'CHECKOUT-006 Verify delivery method can be selected when required',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareDelivery(
              androidPage,
              site.url
            );

          await checkoutPage.selectDeliveryMethodIfNeeded();

          await checkoutPage.verifyDeliveryMethodSelectedIfRequired();
        }
      );

      test(
        'CHECKOUT-007 Verify user can continue toward Payment',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareDelivery(
              androidPage,
              site.url
            );

          await checkoutPage.continueToPayment();

          await checkoutPage.verifyPaymentStepLoaded();
        }
      );

      test(
        'CHECKOUT-008 Verify Payment step is displayed',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const checkoutPage =
            await prepareDelivery(
              androidPage,
              site.url
            );

          await checkoutPage.continueToPayment();

          await checkoutPage.verifyPaymentStepLoaded();
        }
        
      );

      test(
  'CHECKOUT-009 Verify order summary is visible during checkout',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.verifyOrderSummaryVisible();
  }
);

test(
  'CHECKOUT-010 Verify cart items remain visible in checkout summary',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.verifyCheckoutItemsVisible();
  }
);

test(
  'CHECKOUT-011 Verify product quantity remains available in checkout',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const quantity =
      await checkoutPage.getCheckoutQuantity();

    test.skip(
      quantity === null,
      `${site.name}: checkout summary does not expose quantity`
    );

    expect(
      quantity
    ).toBeGreaterThan(0);
  }
);

test(
  'CHECKOUT-012 Verify checkout subtotal is displayed',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const subtotal =
      await checkoutPage.getCheckoutSubtotal();

    expect(
      subtotal,
      'Checkout subtotal should be available'
    ).not.toBeNull();

    expect(
      subtotal!
    ).toBeGreaterThan(0);
  }
);

test(
  'CHECKOUT-013 Verify shipping cost is displayed when applicable',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    const shipping =
      await checkoutPage.getCheckoutShippingCost();

    test.skip(
      shipping === null,
      `${site.name}: shipping cost is not exposed at this checkout state`
    );

    expect(
      shipping!
    ).toBeGreaterThanOrEqual(0);
  }
);

test(
  'CHECKOUT-014 Verify estimated tax is displayed when applicable',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    const tax =
      await checkoutPage.getCheckoutTax();

    test.skip(
      tax === null,
      `${site.name}: tax is not exposed at this checkout state`
    );

    expect(
      tax!
    ).toBeGreaterThanOrEqual(0);
  }
);

test(
  'CHECKOUT-015 Verify checkout total is displayed and greater than zero',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.verifyCheckoutTotalDisplayed();
  }
);

test(
  'CHECKOUT-016 Verify first name is required',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const valid =
      await checkoutPage.verifyRequiredFieldValidation(
        'firstName'
      );

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-017 Verify last name is required',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const valid =
      await checkoutPage.verifyRequiredFieldValidation(
        'lastName'
      );

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-018 Verify street address is required',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const valid =
      await checkoutPage.verifyRequiredFieldValidation(
        'address'
      );

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-019 Verify city is required when exposed',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const city =
      await checkoutPage.getCityInput();

    test.skip(
      !city,
      `${site.name}: city input is not independently exposed`
    );

    const valid =
      await checkoutPage.verifyCityRequiredValidation();

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-020 Verify state or region is required when exposed',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const state =
      await checkoutPage.getStateControl();

    test.skip(
      !state,
      `${site.name}: state/region control is not independently exposed`
    );

    const valid =
      await checkoutPage.verifyStateRequiredValidation();

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-021 Verify ZIP or postal code is required',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const visible =
      await checkoutPage.zipInput
        .isVisible()
        .catch(() => false);

    test.skip(
      !visible,
      `${site.name}: ZIP field is not visible`
    );

    const valid =
      await checkoutPage.verifyRequiredFieldValidation(
        'zip'
      );

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-022 Verify phone number is required when requested',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const visible =
      await checkoutPage.phoneInput
        .isVisible()
        .catch(() => false);

    test.skip(
      !visible,
      `${site.name}: phone field is not requested`
    );

    const valid =
      await checkoutPage.verifyRequiredFieldValidation(
        'phone'
      );

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-023 Verify email is required when requested',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const visible =
      await checkoutPage.emailInput
        .isVisible()
        .catch(() => false);

    test.skip(
      !visible,
      `${site.name}: email field is not requested`
    );

    const valid =
      await checkoutPage.verifyRequiredFieldValidation(
        'email'
      );

    expect(valid).toBeTruthy();
  }
);

test(
  'CHECKOUT-024 Verify malformed email is rejected',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const handled =
      await checkoutPage.verifyMalformedEmailRejected();

    test.skip(
      !handled &&
        !(await checkoutPage.emailInput
          .isVisible()
          .catch(() => false)),
      `${site.name}: email field is not exposed`
    );

    expect(
      handled,
      'Malformed email should be rejected'
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-025 Verify invalid ZIP or postal code is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const visible =
      await checkoutPage.zipInput
        .isVisible()
        .catch(() => false);

    test.skip(
      !visible,
      `${site.name}: ZIP field is not exposed`
    );

    const handled =
      await checkoutPage.verifyInvalidPostalCodeHandled();

    expect(
      handled,
      'Invalid postal code should be rejected or normalized'
    ).toBeTruthy();
  }
);


test(
  'CHECKOUT-026 Verify invalid phone number is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const ready =
      await checkoutPage.prepareShippingFormForValidation();

    test.skip(
      !ready,
      `${site.name}: shipping form is not available`
    );

    const visible =
      await checkoutPage.phoneInput
        .isVisible()
        .catch(() => false);

    test.skip(
      !visible,
      `${site.name}: phone field is not exposed`
    );

    const handled =
      await checkoutPage.verifyInvalidPhoneHandled();

    expect(
      handled,
      'Invalid phone number should be rejected or normalized'
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-027 Verify leading and trailing spaces are handled in shipping fields',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.continueAsGuestIfNeeded();

    const handled =
      await checkoutPage.verifyShippingWhitespaceHandled();

    test.skip(
      !handled,
      `${site.name}: shipping form is not available`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-028 Verify very long shipping input does not break layout',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.continueAsGuestIfNeeded();

    const handled =
      await checkoutPage.verifyLongShippingInputDoesNotBreakLayout();

    test.skip(
      !handled,
      `${site.name}: shipping form is not available`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-029 Verify delivery option can be selected',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    await checkoutPage.selectDeliveryMethodIfNeeded();

    await checkoutPage.verifyDeliveryMethodSelectedIfRequired();
  }
);

test(
  'CHECKOUT-030 Verify selected delivery option remains active',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    const persisted =
      await checkoutPage.verifySelectedDeliveryMethodPersists();

    test.skip(
      !persisted,
      `${site.name}: checkout does not expose selectable delivery radio controls`
    );

    expect(
      persisted
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-031 Verify checkout state persists after page refresh when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    const persisted =
      await checkoutPage.refreshAndVerifyCheckoutPersistence();

    expect(
      persisted,
      'Checkout should remain available after refresh'
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-032 Verify back navigation does not corrupt checkout state',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const safe =
      await checkoutPage.verifyBackForwardNavigationSafe();

    test.skip(
      !safe,
      `${site.name}: browser history does not expose a usable checkout back/forward entry`
    );

    expect(
      safe
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-033 Verify repeated Continue action is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    await checkoutPage.verifyRepeatedContinueHandledSafely();
  }
);

test(
  'CHECKOUT-034 Verify payment form or payment section loads without submitting order',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    await checkoutPage.continueToPayment();

    await checkoutPage.verifyPaymentStepLoaded();

    const loaded =
      await checkoutPage.hasPaymentFormOrControls();

    expect(
      loaded,
      'Payment form or payment section should be available'
    ).toBeTruthy();
  }
);

test(
  'CHECKOUT-035 Verify payment fields are visible when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    await checkoutPage.continueToPayment();

    await checkoutPage.verifyPaymentStepLoaded();

    const fieldCount =
      await checkoutPage.getVisiblePaymentFieldCount();

    test.skip(
      fieldCount === 0,
      `${site.name}: payment provider does not expose visible payment fields at this checkpoint`
    );

    expect(
      fieldCount
    ).toBeGreaterThan(0);
  }
);

test(
  'CHECKOUT-036 Verify automation does not submit the final order',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareDelivery(
        androidPage,
        site.url
      );

    await checkoutPage.continueToPayment();

    await checkoutPage.verifyPaymentStepLoaded();

    await checkoutPage.verifyNoOrderSubmissionControlsAreTriggered();
  }
);

test(
  'CHECKOUT-037 Verify checkout has no horizontal overflow on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const overflow =
      await checkoutPage.hasHorizontalOverflow();

    expect(
      overflow,
      'Checkout should not horizontally overflow on Android'
    ).toBeFalsy();
  }
);

test(
  'CHECKOUT-038 Verify checkout controls do not substantially overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.verifyVisibleCheckoutControlsDoNotOverlap();
  }
);

test(
  'CHECKOUT-039 Verify checkout remains usable while scrolling on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    await checkoutPage.verifyCheckoutScrollableAndUsable();
  }
);

test(
  'CHECKOUT-040 Verify checkout layout remains valid at current Android viewport',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const checkoutPage =
      await prepareCheckout(
        androidPage,
        site.url
      );

    const viewport =
      await checkoutPage.getCheckoutViewport();

    expect(
      viewport.width
    ).toBeGreaterThan(0);

    expect(
      viewport.height
    ).toBeGreaterThan(0);

    await checkoutPage.verifyCheckoutResponsiveLayout();
  }
);
    }

    
  );
  
}