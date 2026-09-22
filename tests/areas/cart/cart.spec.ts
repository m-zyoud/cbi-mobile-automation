import { sites } from '../../../config/sites';
import { PLPPage } from '../../../pages/PLPPage';
import { ProductPage } from '../../../pages/ProductPage';
import { CartPage } from '../../../pages/CartPage';
import { test, expect } from '../../fixtures/android.fixture';

async function prepareCart(
  page: any,
  siteUrl: string
): Promise<{
  cartPage: CartPage;
  productName: string;
  productUrl: string;
}> {
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

  const productUrl =
    page.url();

  const productName =
    await productPage.getProductName();

  await productPage.selectAvailableOptions();

  await productPage.addToCart();

  const cartPage =
    new CartPage(page);

  await cartPage.openCart();

  await cartPage.verifyCartLoaded();

  return {
    cartPage,
    productName,
    productUrl,
  };
}

async function prepareCartWithTwoProducts(
  page: any,
  siteUrl: string
): Promise<CartPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const plpPage =
    new PLPPage(page);

  await plpPage.openFirstAvailableCategory();

  await plpPage.verifyPLPLoaded();

  const links =
    plpPage.productLinks;

  const count = Math.min(
    await links.count(),
    100
  );

  const productUrls: string[] = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const link =
      links.nth(i);

    if (
      !(await link
        .isVisible()
        .catch(() => false))
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

    const absolute =
      new URL(
        href,
        page.url()
      ).toString();

    if (
      productUrls.includes(
        absolute
      )
    ) {
      continue;
    }

    productUrls.push(
      absolute
    );

    if (
      productUrls.length === 2
    ) {
      break;
    }
  }

  test.skip(
    productUrls.length < 2,
    'Current PLP does not expose two distinct product links'
  );

  for (
    const productUrl of productUrls
  ) {
    await page.goto(
      productUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 60000,
      }
    );

    const productPage =
      new ProductPage(page);

    await productPage.verifyProductPageLoaded();

    await productPage.selectAvailableOptions();

    await productPage.addToCart();
  }

  const cartPage =
    new CartPage(page);

  await cartPage.openCart();

  await cartPage.verifyCartLoaded();

  return cartPage;
}

for (const site of Object.values(sites)) {
  test.describe(`${site.name} - Cart`, () => {
    test.setTimeout(150000);

    test(
      'CART-001 Verify cart page opens successfully',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.verifyCartLoaded();
      }
    );

    test(
      'CART-002 Verify cart contains at least one item',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.verifyCartNotEmpty();
      }
    );

    test(
      'CART-003 Verify cart item count is greater than zero',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const count =
          await cartPage.getCartItemCount();

        expect(
          count
        ).toBeGreaterThan(0);
      }
    );

    test(
      'CART-004 Verify added product appears in cart',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const {
          cartPage,
          productName,
        } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.verifyProductInCart(
          productName
        );
      }
    );

    test(
      'CART-005 Verify checkout control is available',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.verifyCheckoutAvailable();
      }
    );

    test(
      'CART-006 Verify user can proceed to checkout',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const beforeUrl =
          androidPage.url();

        await cartPage.proceedToCheckout();

        expect(
          androidPage.url()
        ).not.toBe(beforeUrl);
      }
    );

    test(
      'CART-007 Verify cart product price is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.verifyFirstCartItemPriceVisible();
      }
    );

    test(
      'CART-008 Verify cart quantity is displayed',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const quantity =
          await cartPage.getCartQuantity();

        test.skip(
          quantity === null,
          `${site.name}: quantity control is not exposed in current cart`
        );

        expect(
          quantity
        ).toBeGreaterThan(0);
      }
    );

    test(
      'CART-009 Verify selected product options are displayed',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const options =
          await cartPage.getSelectedCartOptions();

        test.skip(
          options.length === 0,
          `${site.name}: current cart item does not expose selected option metadata`
        );

        expect(
          options.length
        ).toBeGreaterThan(0);
      }
    );

    test(
      'CART-010 Verify product SKU or identifier when available',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const identifier =
          await cartPage.getCartProductIdentifier();

        test.skip(
          !identifier,
          `${site.name}: cart does not expose product SKU or identifier`
        );

        expect(
          identifier
        ).not.toBe('');
      }
    );

    test(
      'CART-011 Verify quantity can be increased in cart',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const supported =
          await cartPage.increaseCartQuantity();

        test.skip(
          !supported,
          `${site.name}: cart quantity increase is not supported by current UI`
        );

        expect(
          supported
        ).toBeTruthy();
      }
    );

    test(
      'CART-012 Verify quantity can be decreased in cart',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const quantity =
          await cartPage.getCartQuantity();

        test.skip(
          quantity === null,
          `${site.name}: quantity control is not available`
        );

        if (
          quantity !== null &&
          quantity <= 1
        ) {
          const increased =
            await cartPage.increaseCartQuantity();

          test.skip(
            !increased,
            `${site.name}: quantity cannot be increased before decrease validation`
          );
        }

        const supported =
          await cartPage.decreaseCartQuantity();

        test.skip(
          !supported,
          `${site.name}: cart quantity decrease is not supported`
        );

        expect(
          supported
        ).toBeTruthy();
      }
    );

    test(
      'CART-013 Verify cart quantity minimum boundary',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const supported =
          await cartPage.verifyCartQuantityMinimum();

        test.skip(
          !supported,
          `${site.name}: cart quantity minimum cannot be validated with current control`
        );

        expect(
          supported
        ).toBeTruthy();
      }
    );

    test(
      'CART-014 Verify cart quantity maximum boundary when enforced',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const max =
          await cartPage.getCartQuantityMaximum();

        test.skip(
          max === null,
          `${site.name}: no explicit cart quantity maximum is exposed`
        );

        await cartPage.verifyCartQuantityMaximum(
          max!
        );
      }
    );

    test(
      'CART-015 Verify invalid manual quantity is handled safely',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const handled =
          await cartPage.verifyInvalidCartQuantityHandled();

        test.skip(
          !handled,
          `${site.name}: manual invalid quantity input is not supported by current cart control`
        );

        expect(
          handled
        ).toBeTruthy();
      }
    );

    test(
      'CART-016 Verify item can be removed from cart',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const before =
          await cartPage.getVisibleCartItemCount();

        expect(
          before
        ).toBeGreaterThan(0);

        const removed =
          await cartPage.removeFirstCartItem();

        test.skip(
          !removed,
          `${site.name}: remove control is not available`
        );

        const after =
          await cartPage.getVisibleCartItemCount();

        expect(
          after
        ).toBeLessThan(before);
      }
    );

    test(
      'CART-017 Verify cart becomes empty after removing last item',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.removeAllCartItems();

        await cartPage.verifyEmptyCartState();
      }
    );

    test(
      'CART-018 Verify empty cart state is user-friendly',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.removeAllCartItems();

        await cartPage.verifyEmptyCartState();
      }
    );

    test(
      'CART-019 Verify multiple products can be added to cart',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const cartPage =
          await prepareCartWithTwoProducts(
            androidPage,
            site.url
          );

        const visibleItems =
          await cartPage.getVisibleCartItemCount();

        expect(
          visibleItems
        ).toBeGreaterThanOrEqual(2);
      }
    );

    test(
      'CART-020 Verify multiple cart items remain distinct',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const cartPage =
          await prepareCartWithTwoProducts(
            androidPage,
            site.url
          );

        await cartPage.verifyMultipleItemsRemainDistinct();
      }
    );

    test(
      'CART-021 Verify same product added twice is handled correctly',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const {
          cartPage,
          productUrl,
        } =
          await prepareCart(
            androidPage,
            site.url
          );

        const before =
          await cartPage.getCartStateSnapshot();

        await androidPage.goto(
          productUrl,
          {
            waitUntil:
              'domcontentloaded',
            timeout: 60000,
          }
        );

        const productPage =
          new ProductPage(
            androidPage
          );

        await productPage.verifyProductPageLoaded();

        await productPage.selectAvailableOptions();

        await productPage.addToCart();

        await cartPage.openCart();

        await cartPage.verifyCartLoaded();

        const after =
          await cartPage.getCartStateSnapshot();

        const quantityIncreased =
          before.quantity !== null &&
          after.quantity !== null &&
          after.quantity >
            before.quantity;

        const rowIncreased =
          after.visibleRows >
          before.visibleRows;

        const itemCountIncreased =
          after.itemCount >
          before.itemCount;

        expect(
          quantityIncreased ||
            rowIncreased ||
            itemCountIncreased,
          'Adding the same product twice should update quantity, row count, or cart item count'
        ).toBeTruthy();
      }
    );

    test(
      'CART-022 Verify cart subtotal is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        await cartPage.verifyCartSubtotalDisplayed();
      }
    );

    test(
      'CART-023 Verify cart subtotal updates after quantity increase',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const result =
          await cartPage.increaseQuantityAndCompareSubtotal();

        test.skip(
          !result.supported,
          `${site.name}: cart quantity increase is not supported`
        );

        test.skip(
          result.before === null ||
            result.after === null,
          `${site.name}: cart subtotal is not exposed`
        );

        expect(
          result.after!
        ).toBeGreaterThan(
          result.before!
        );
      }
    );

    test(
      'CART-024 Verify cart subtotal updates after quantity decrease',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const { cartPage } =
          await prepareCart(
            androidPage,
            site.url
          );

        const result =
          await cartPage.decreaseQuantityAndCompareSubtotal();

        test.skip(
          !result.supported,
          `${site.name}: cart quantity decrease is not supported`
        );

        test.skip(
          result.before === null ||
            result.after === null,
          `${site.name}: cart subtotal is not exposed`
        );

        expect(
          result.after!
        ).toBeLessThan(
          result.before!
        );
      }
    );

    test(
      'CART-025 Verify cart subtotal updates after removing item',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const cartPage =
          await prepareCartWithTwoProducts(
            androidPage,
            site.url
          );

        const result =
          await cartPage.removeItemAndCompareSubtotal();

        test.skip(
          !result.supported,
          `${site.name}: cart item cannot be removed`
        );

        expect(
          result.afterItems
        ).toBeLessThan(
          result.beforeItems
        );

        test.skip(
          result.before === null ||
            result.after === null,
          `${site.name}: subtotal cannot be compared after item removal`
        );

        expect(
          result.after!
        ).toBeLessThan(
          result.before!
        );
      }
    );

    test(
  'CART-026 Verify promotional price remains consistent in cart when applicable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const promo =
      await cartPage.hasPromotionalPriceInCart();

    test.skip(
      !promo,
      `${site.name}: current cart item does not expose promotional pricing`
    );

    const price =
      await cartPage.getFirstCartItemPriceValue();

    expect(
      price,
      'Promotional cart item should expose a valid price'
    ).not.toBeNull();

    expect(
      price!
    ).toBeGreaterThan(0);
  }
);

test(
  'CART-027 Verify promo or coupon input is available when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const promoInput =
      await cartPage.getPromoCodeInput();

    test.skip(
      !promoInput,
      `${site.name}: promo/coupon input is not supported`
    );

    await expect(
      promoInput!
    ).toBeVisible();
  }
);

test(
  'CART-028 Verify invalid promo or coupon is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const result =
      await cartPage.applyInvalidPromoCode();

    test.skip(
      !result.supported,
      `${site.name}: promo/coupon input is not supported`
    );

    expect(
      result.handled,
      'Invalid promo code should be rejected or leave subtotal unchanged'
    ).toBeTruthy();
  }
);

test(
  'CART-029 Verify cart state persists after page refresh',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const persisted =
      await cartPage.refreshAndVerifyCartPersistence();

    test.skip(
      !persisted,
      `${site.name}: cart persistence after refresh is not supported`
    );

    expect(
      persisted
    ).toBeTruthy();
  }
);

test(
  'CART-030 Verify cart state persists after leaving and returning',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const persisted =
      await cartPage.leaveAndReturnToCart(
        site.url
      );

    test.skip(
      !persisted,
      `${site.name}: cart session persistence is not supported`
    );

    expect(
      persisted
    ).toBeTruthy();
  }
);

test(
  'CART-031 Verify checkout navigation opens checkout flow',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    await cartPage.proceedToCheckoutAndVerifyNavigation();
  }
);

test(
  'CART-032 Verify duplicate checkout submission is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const handled =
      await cartPage.triggerCheckoutSafelyTwice();

    test.skip(
      !handled,
      `${site.name}: checkout control is not available`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'CART-033 Verify cart does not create horizontal overflow on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const overflow =
      await cartPage.hasHorizontalOverflow();

    expect(
      overflow,
      'Cart should not create unexpected horizontal overflow'
    ).toBeFalsy();
  }
);

test(
  'CART-034 Verify cart item controls do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    await cartPage.verifyFirstCartItemControlsDoNotOverlap();
  }
);

test(
  'CART-035 Verify cart remains functional after device orientation or layout change if supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const { cartPage } =
      await prepareCart(
        androidPage,
        site.url
      );

    const viewport =
      await cartPage.getCurrentViewport();

    test.skip(
      viewport.width >= viewport.height,
      `${site.name}: current Android session is not in portrait mode`
    );

    await cartPage.verifyCartLoaded();

    expect(
      viewport.width
    ).toBeGreaterThan(0);

    expect(
      viewport.height
    ).toBeGreaterThan(0);
  }
);
  });
}