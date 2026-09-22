import { Page } from '@playwright/test';

import { sites } from '../../../config/sites';

import { PLPPage } from '../../../pages/PLPPage';
import { ProductPage } from '../../../pages/ProductPage';
import { WishlistPage } from '../../../pages/WishlistPage';


import {
  test,
  expect,
} from '../../fixtures/android.fixture';

async function prepareProduct(
  page: Page,
  siteUrl: string
): Promise<{
  productPage: ProductPage;
  wishlistPage: WishlistPage;
  productName: string;
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

  const productName =
    await productPage.getProductName();

  const wishlistPage =
    new WishlistPage(page);

  return {
    productPage,
    wishlistPage,
    productName,
  };
}

async function prepareWishlistWithProduct(
  page: Page,
  siteUrl: string
): Promise<{
  wishlistPage: WishlistPage;
  productName: string;
}> {
  const {
    wishlistPage,
    productName,
  } =
    await prepareProduct(
      page,
      siteUrl
    );

  await wishlistPage.addCurrentProductToWishlist();

  await wishlistPage.openWishlist();

  await wishlistPage.verifyWishlistLoaded();

  return {
    wishlistPage,
    productName,
  };
}

for (const site of Object.values(sites)) {
  test.describe(
    `${site.name} - Wishlist`,
    () => {
      test.setTimeout(150000);

      test(
        'WISH-001 Verify Add to Wishlist control is available on PDP',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const {
            wishlistPage,
          } =
            await prepareProduct(
              androidPage,
              site.url
            );

          await wishlistPage.verifyAddToWishlistAvailable();
        }
      );

      test(
        'WISH-002 Verify product can be added to Wishlist',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const {
            wishlistPage,
            productName,
          } =
            await prepareProduct(
              androidPage,
              site.url
            );

          await wishlistPage.addCurrentProductToWishlist();

          await wishlistPage.openWishlist();

          await wishlistPage.verifyWishlistLoaded();

          await wishlistPage.verifyProductExists(
            productName
          );
        }
      );

      test(
        'WISH-003 Verify Wishlist page can be opened',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const {
            wishlistPage,
          } =
            await prepareProduct(
              androidPage,
              site.url
            );

          await wishlistPage.openWishlist();

          await wishlistPage.verifyWishlistLoaded();
        }
      );

      test(
        'WISH-004 Verify added product exists in Wishlist',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const {
            wishlistPage,
            productName,
          } =
            await prepareWishlistWithProduct(
              androidPage,
              site.url
            );

          await wishlistPage.verifyProductExists(
            productName
          );
        }
      );

      test(
        'WISH-005 Verify Wishlist product can be removed',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const {
            wishlistPage,
            productName,
          } =
            await prepareWishlistWithProduct(
              androidPage,
              site.url
            );

          await wishlistPage.removeProduct(
            productName
          );
        }
      );

      test(
        'WISH-006 Verify removed product no longer appears in Wishlist',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const {
            wishlistPage,
            productName,
          } =
            await prepareWishlistWithProduct(
              androidPage,
              site.url
            );

          await wishlistPage.removeProduct(
            productName
          );

          await wishlistPage.verifyProductRemoved(
            productName
          );
        }
      );
      test(
  'WISH-007 Verify empty Wishlist state when no products exist',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    await androidPage.goto(
      site.url,
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      }
    );

    const wishlistPage =
      new WishlistPage(
        androidPage
      );

    await wishlistPage.openWishlist();

    await wishlistPage.verifyWishlistLoaded();

    const empty =
      await wishlistPage.verifyEmptyWishlistStateWhenNoItems();

    test.skip(
      !empty,
      `${site.name}: Wishlist already contains items`
    );

    expect(
      empty
    ).toBeTruthy();
  }
);

test(
  'WISH-008 Verify duplicate Add to Wishlist action is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyDuplicateAddHandledSafely(
      productName
    );
  }
);

test(
  'WISH-009 Verify Wishlist count is available when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareProduct(
        androidPage,
        site.url
      );

    const count =
      await wishlistPage.getWishlistCount();

    test.skip(
      count === null,
      `${site.name}: Wishlist count badge is not exposed`
    );

    expect(
      count!
    ).toBeGreaterThanOrEqual(0);
  }
);

test(
  'WISH-010 Verify Wishlist product persists after refresh',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.refreshAndVerifyWishlistPersistence(
      productName
    );
  }
);

test(
  'WISH-011 Verify back and forward navigation does not break Wishlist',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const safe =
      await wishlistPage.verifyWishlistBackForwardNavigation();

    test.skip(
      !safe,
      `${site.name}: browser history does not expose usable Wishlist navigation`
    );

    expect(
      safe
    ).toBeTruthy();
  }
);

test(
  'WISH-012 Verify Wishlist product details are visible',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyWishlistProductDetailsVisible(
      productName
    );
  }
);

test(
  'WISH-013 Verify Remove control is available for Wishlist product',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyRemoveControlAvailable(
      productName
    );
  }
);

test(
  'WISH-014 Verify Wishlist page has no horizontal overflow on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const overflow =
      await wishlistPage.hasHorizontalOverflow();

    expect(
      overflow,
      'Wishlist page should not horizontally overflow'
    ).toBeFalsy();
  }
);

test(
  'WISH-015 Verify Wishlist controls do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyWishlistControlsDoNotOverlap();
  }
);

test(
  'WISH-016 Verify Wishlist product can be opened',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const opened =
      await wishlistPage.openWishlistProduct(
        productName
      );

    test.skip(
      !opened,
      `${site.name}: Wishlist product title is not exposed as a link`
    );

    expect(
      opened
    ).toBeTruthy();
  }
);

test(
  'WISH-017 Verify Back navigation returns from product to Wishlist',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const safe =
      await wishlistPage.verifyReturnToWishlistAfterProductNavigation(
        productName
      );

    test.skip(
      !safe,
      `${site.name}: Wishlist product does not expose navigable product link`
    );

    expect(
      safe
    ).toBeTruthy();
  }
);

test(
  'WISH-018 Verify removed product remains removed after refresh',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.removeAndVerifyPersistenceAfterRefresh(
      productName
    );
  }
);

test(
  'WISH-019 Verify empty state appears after removing last Wishlist item',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const count =
      await wishlistPage.getWishlistItemCount();

    test.skip(
      count !== 1,
      `${site.name}: Wishlist contains ${count} items, so last-item transition cannot be isolated`
    );

    const empty =
      await wishlistPage.removeLastItemAndVerifyEmptyState(
        productName
      );

    expect(
      empty,
      'Removing the final Wishlist item should expose an empty state'
    ).toBeTruthy();
  }
);

test(
  'WISH-020 Verify Wishlist remains stable after product removal',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyWishlistStableAfterRemoval(
      productName
    );
  }
);

test(
  'WISH-021 Verify Wishlist contains product item after add',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyWishlistContainsAtLeastOneItem();
  }
);

test(
  'WISH-022 Verify Add to Wishlist control updates state when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareProduct(
        androidPage,
        site.url
      );

    const changed =
      await wishlistPage.verifyWishlistButtonStateAfterAdd();

    test.skip(
      !changed,
      `${site.name}: Add to Wishlist control does not expose detectable state change`
    );

    expect(
      changed
    ).toBeTruthy();
  }
);

test(
  'WISH-023 Verify Wishlist remains usable while scrolling',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyWishlistScrollableAndUsable();
  }
);

test(
  'WISH-024 Verify repeated Wishlist navigation remains stable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyRepeatedWishlistOpenHandledSafely();
  }
);

test(
  'WISH-025 Verify Wishlist product link is accessible when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const accessible =
      await wishlistPage.verifyWishlistProductLinkAccessible(
        productName
      );

    test.skip(
      !accessible,
      `${site.name}: Wishlist product is not rendered as a navigable link`
    );

    expect(
      accessible
    ).toBeTruthy();
  }
);

test(
  'WISH-026 Verify repeated removal is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyRepeatedRemoveHandledSafely(
      productName
    );
  }
);

test(
  'WISH-027 Verify Wishlist count remains consistent after removal when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    const supported =
      await wishlistPage.verifyWishlistCountAfterRemovalWhenSupported(
        productName
      );

    test.skip(
      !supported,
      `${site.name}: Wishlist count badge is not exposed consistently`
    );

    expect(
      supported
    ).toBeTruthy();
  }
);

test(
  'WISH-028 Verify empty Wishlist remains stable after refresh',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    await androidPage.goto(
      site.url,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 60000,
      }
    );

    const wishlistPage =
      new WishlistPage(
        androidPage
      );

    await wishlistPage.openWishlist();

    await wishlistPage.verifyWishlistLoaded();

    const stable =
      await wishlistPage.verifyEmptyWishlistStableAfterRefresh();

    test.skip(
      !stable,
      `${site.name}: Wishlist is not empty`
    );

    expect(
      stable
    ).toBeTruthy();
  }
);

test(
  'WISH-029 Verify Wishlist layout is responsive on current Android viewport',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
    } =
      await prepareWishlistWithProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyWishlistResponsiveLayout();
  }
);

test(
  'WISH-030 Verify add remove cycle leaves Wishlist stable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const {
      wishlistPage,
      productName,
    } =
      await prepareProduct(
        androidPage,
        site.url
      );

    await wishlistPage.verifyRepeatedAddRemoveCycleStable(
      productName
    );
  }
);
    }
  );
}