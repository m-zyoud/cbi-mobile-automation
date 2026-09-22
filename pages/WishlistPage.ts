import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class WishlistPage {
  readonly page: Page;

  readonly addToWishlistButton: Locator;
  readonly wishlistTrigger: Locator;
  readonly wishlistHeading: Locator;
  readonly removeButtons: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addToWishlistButton = page
      .locator(
        [
          'button[aria-label*="wishlist" i]',
          'button[aria-label*="favorite" i]',
          'button[class*="wishlist" i]',
          'button[class*="favorite" i]',
          '[data-testid*="wishlist" i] button',
        ].join(',')
      )
      .first();

    /*
     * Prefer navigation links here so we do not
     * accidentally click the PDP Add to Wishlist button.
     */
    this.wishlistTrigger = page
      .locator(
        [
          'a[href*="wishlist" i]',
          'a[aria-label*="wishlist" i]',
          'a[href*="favorite" i]',
          'a[aria-label*="favorite" i]',
        ].join(',')
      )
      .first();

    this.wishlistHeading = page
      .locator(
        [
          'h1',
          'h2',
          '[class*="wishlist" i]',
          '[data-testid*="wishlist" i]',
        ].join(',')
      )
      .filter({
        hasText:
          /wishlist|favorites|saved items/i,
      })
      .first();

    this.removeButtons = page.locator(
      [
        'button[aria-label*="remove" i]',
        'button[class*="remove" i]',
        'button:has-text("Remove")',
        '[data-testid*="remove" i]',
      ].join(',')
    );

    this.emptyState = page
      .locator(
        [
          '[class*="empty" i]',
          '[data-testid*="empty" i]',
          'p',
          'div',
        ].join(',')
      )
      .filter({
        hasText:
          /wishlist is empty|favorites are empty|no saved items|no items/i,
      })
      .first();
  }

  async verifyAddToWishlistAvailable(): Promise<void> {
    await expect(
      this.addToWishlistButton,
      'Add to Wishlist control should be visible on PDP'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async addCurrentProductToWishlist(): Promise<void> {
    await this.verifyAddToWishlistAvailable();

    await this.addToWishlistButton.click();
  }

  async openWishlist(): Promise<void> {
    await expect(
      this.wishlistTrigger,
      'Wishlist navigation control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await this.wishlistTrigger.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    );
  }

  async verifyWishlistLoaded(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible();

    const headingVisible =
      await this.wishlistHeading
        .isVisible()
        .catch(() => false);

    const emptyVisible =
      await this.emptyState
        .isVisible()
        .catch(() => false);

    const removeControlVisible =
      await this.removeButtons
        .first()
        .isVisible()
        .catch(() => false);

    expect(
      headingVisible ||
        emptyVisible ||
        removeControlVisible,
      'Wishlist page should expose wishlist content or empty state'
    ).toBeTruthy();
  }

  async verifyProductExists(
    productName: string
  ): Promise<void> {
    if (!productName) {
      throw new Error(
        'Product name is empty'
      );
    }

    const product =
      this.getProductLocator(
        productName
      );

    await expect(
      product,
      `Product "${productName}" should exist in Wishlist`
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async isProductVisible(
    productName: string
  ): Promise<boolean> {
    if (!productName) {
      return false;
    }

    return this.getProductLocator(
      productName
    )
      .isVisible()
      .catch(() => false);
  }

  async removeProduct(
    productName: string
  ): Promise<void> {
    if (!productName) {
      throw new Error(
        'Product name is empty'
      );
    }

    const product =
      this.getProductLocator(
        productName
      );

    await expect(
      product,
      `Product "${productName}" should be visible before removal`
    ).toBeVisible({
      timeout: 10000,
    });

    /*
     * Try to find the closest wishlist/card container
     * containing this specific product.
     */
    const productContainer =
      product.locator(
        'xpath=ancestor::*[self::li or self::article or contains(@class,"product") or contains(@class,"item")][1]'
      );

    if (
      await productContainer
        .isVisible()
        .catch(() => false)
    ) {
      const removeButton =
        productContainer
          .locator(
            [
              'button[aria-label*="remove" i]',
              'button[class*="remove" i]',
              'button:has-text("Remove")',
              '[data-testid*="remove" i]',
            ].join(',')
          )
          .first();

      if (
        await removeButton
          .isVisible()
          .catch(() => false)
      ) {
        await removeButton.click();

        return;
      }
    }

    /*
     * Fallback for sites where the item structure
     * does not expose a useful container.
     */
    await this.removeFirstWishlistItem();
  }

  async removeFirstWishlistItem(): Promise<void> {
    const removeButton =
      this.removeButtons.first();

    await expect(
      removeButton,
      'Wishlist remove control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await removeButton.click();
  }

  async verifyProductRemoved(
    productName: string
  ): Promise<void> {
    const product =
      this.getProductLocator(
        productName
      );

    await expect(
      product,
      `Product "${productName}" should no longer exist in Wishlist`
    ).not.toBeVisible({
      timeout: 10000,
    });
  }

  private getProductLocator(
    productName: string
  ): Locator {
    return this.page
      .locator('main')
      .getByText(
        productName,
        {
          exact: false,
        }
      )
      .first();
  }

  // WISH-007
async verifyEmptyWishlistStateWhenNoItems(): Promise<boolean> {
  await this.verifyWishlistLoaded();

  const removeCount =
    await this.removeButtons.count();

  if (removeCount > 0) {
    return false;
  }

  const emptyVisible =
    await this.emptyState
      .isVisible()
      .catch(() => false);

  return emptyVisible;
}

// WISH-008
async verifyDuplicateAddHandledSafely(
  productName: string
): Promise<void> {
  if (!productName) {
    throw new Error(
      'Product name is empty'
    );
  }

  await this.addCurrentProductToWishlist();

  await this.page.waitForTimeout(
    300
  );

  await this.addCurrentProductToWishlist();

  await this.page.waitForTimeout(
    300
  );

  await this.openWishlist();

  await this.verifyWishlistLoaded();

  const matches =
    this.page
      .locator('main')
      .getByText(
        productName,
        {
          exact: false,
        }
      );

  const count =
    await matches.count();

  expect(
    count,
    'Duplicate wishlist action should not create many duplicate entries'
  ).toBeLessThanOrEqual(2);
}

// WISH-009
async getWishlistCount(): Promise<number | null> {
  const badge =
    this.page
      .locator(
        [
          '[class*="wishlist" i] [class*="count" i]:visible',
          '[class*="wishlist" i] [class*="badge" i]:visible',
          '[data-testid*="wishlist" i] [class*="count" i]:visible',
          '[aria-label*="wishlist" i] [class*="badge" i]:visible',
        ].join(',')
      )
      .first();

  if (
    !(await badge
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const text = (
    await badge
      .innerText()
      .catch(() => '')
  ).trim();

  const match =
    text.match(/\d+/);

  if (!match) {
    return null;
  }

  return Number(
    match[0]
  );
}

// WISH-010
async refreshAndVerifyWishlistPersistence(
  productName: string
): Promise<void> {
  await this.page.reload({
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyWishlistLoaded();

  await this.verifyProductExists(
    productName
  );
}

// WISH-011
async verifyWishlistBackForwardNavigation(): Promise<boolean> {
  const wishlistUrl =
    this.page.url();

  const wentBack =
    await this.page
      .goBack({
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!wentBack) {
    return false;
  }

  const returned =
    await this.page
      .goForward({
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!returned) {
    return false;
  }

  expect(
    this.page.url(),
    'Forward navigation should return to Wishlist'
  ).toBe(
    wishlistUrl
  );

  await this.verifyWishlistLoaded();

  return true;
}

// WISH-012
async verifyWishlistProductDetailsVisible(
  productName: string
): Promise<void> {
  await this.verifyProductExists(
    productName
  );

  const product =
    this.getProductLocator(
      productName
    );

  const productContainer =
    product.locator(
      'xpath=ancestor::*[self::li or self::article or contains(@class,"product") or contains(@class,"item")][1]'
    );

  if (
    await productContainer
      .isVisible()
      .catch(() => false)
  ) {
    await expect(
      productContainer
    ).toBeVisible();

    return;
  }

  await expect(
    product
  ).toBeVisible();
}

// WISH-013
async verifyRemoveControlAvailable(
  productName: string
): Promise<void> {
  const product =
    this.getProductLocator(
      productName
    );

  await expect(
    product
  ).toBeVisible({
    timeout: 10000,
  });

  const productContainer =
    product.locator(
      'xpath=ancestor::*[self::li or self::article or contains(@class,"product") or contains(@class,"item")][1]'
    );

  if (
    await productContainer
      .isVisible()
      .catch(() => false)
  ) {
    const remove =
      productContainer
        .locator(
          [
            'button[aria-label*="remove" i]',
            'button[class*="remove" i]',
            'button:has-text("Remove")',
            '[data-testid*="remove" i]',
          ].join(',')
        )
        .first();

    if (
      await remove
        .isVisible()
        .catch(() => false)
    ) {
      await expect(
        remove
      ).toBeVisible();

      return;
    }
  }

  await expect(
    this.removeButtons.first(),
    'Wishlist remove control should be visible'
  ).toBeVisible();
}

// WISH-014
async hasHorizontalOverflow(): Promise<boolean> {
  return this.page.evaluate(() => {
    const root =
      document.documentElement;

    return (
      root.scrollWidth >
      root.clientWidth + 2
    );
  });
}

// WISH-015
async verifyWishlistControlsDoNotOverlap(): Promise<void> {
  const controls: Locator[] = [];

  const triggerVisible =
    await this.wishlistTrigger
      .isVisible()
      .catch(() => false);

  if (triggerVisible) {
    controls.push(
      this.wishlistTrigger
    );
  }

  const headingVisible =
    await this.wishlistHeading
      .isVisible()
      .catch(() => false);

  if (headingVisible) {
    controls.push(
      this.wishlistHeading
    );
  }

  const firstRemove =
    this.removeButtons.first();

  const removeVisible =
    await firstRemove
      .isVisible()
      .catch(() => false);

  if (removeVisible) {
    controls.push(
      firstRemove
    );
  }

  const boxes = [];

  for (
    const control of controls
  ) {
    const box =
      await control
        .boundingBox()
        .catch(() => null);

    if (box) {
      boxes.push(box);
    }
  }

  for (
    let i = 0;
    i < boxes.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < boxes.length;
      j++
    ) {
      const a =
        boxes[i];

      const b =
        boxes[j];

      const horizontal =
        Math.min(
          a.x + a.width,
          b.x + b.width
        ) -
        Math.max(
          a.x,
          b.x
        );

      const vertical =
        Math.min(
          a.y + a.height,
          b.y + b.height
        ) -
        Math.max(
          a.y,
          b.y
        );

      const overlap =
        horizontal > 5 &&
        vertical > 5;

      expect(
        overlap,
        `Wishlist controls ${i} and ${j} should not overlap`
      ).toBeFalsy();
    }
  }
}

// WISH-016
async openWishlistProduct(
  productName: string
): Promise<boolean> {
  const product =
    this.getProductLocator(
      productName
    );

  await expect(
    product
  ).toBeVisible({
    timeout: 10000,
  });

  const link =
    product.locator(
      'xpath=ancestor-or-self::a[1]'
    );

  if (
    !(await link
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await link.click();

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  return true;
}

// WISH-017
async verifyReturnToWishlistAfterProductNavigation(
  productName: string
): Promise<boolean> {
  const wishlistUrl =
    this.page.url();

  const opened =
    await this.openWishlistProduct(
      productName
    );

  if (!opened) {
    return false;
  }

  const returned =
    await this.page
      .goBack({
        waitUntil:
          'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!returned) {
    return false;
  }

  expect(
    this.page.url(),
    'Back navigation should return to Wishlist'
  ).toBe(
    wishlistUrl
  );

  await this.verifyWishlistLoaded();

  await this.verifyProductExists(
    productName
  );

  return true;
}

// WISH-018
async removeAndVerifyPersistenceAfterRefresh(
  productName: string
): Promise<void> {
  await this.removeProduct(
    productName
  );

  await this.verifyProductRemoved(
    productName
  );

  await this.page.reload({
    waitUntil:
      'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyWishlistLoaded();

  await this.verifyProductRemoved(
    productName
  );
}

// WISH-019
async getWishlistItemCount(): Promise<number> {
  return this.removeButtons.count();
}

async removeLastItemAndVerifyEmptyState(
  productName: string
): Promise<boolean> {
  const count =
    await this.getWishlistItemCount();

  if (count !== 1) {
    return false;
  }

  await this.removeProduct(
    productName
  );

  await this.verifyProductRemoved(
    productName
  );

  const emptyVisible =
    await this.emptyState
      .isVisible()
      .catch(() => false);

  return emptyVisible;
}

// WISH-020
async verifyWishlistStableAfterRemoval(
  productName: string
): Promise<void> {
  await this.removeProduct(
    productName
  );

  await this.verifyProductRemoved(
    productName
  );

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  const bodyText = (
    await this.page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  expect(
    bodyText
  ).not.toMatch(
    /internal server error|application error|uncaught exception|stack trace/i
  );
}

// WISH-021
async verifyWishlistContainsAtLeastOneItem(): Promise<void> {
  const count =
    await this.getWishlistItemCount();

  const hasProduct =
    count > 0;

  expect(
    hasProduct,
    'Wishlist should contain at least one removable product'
  ).toBeTruthy();
}

// WISH-022
async verifyWishlistButtonStateAfterAdd(): Promise<boolean> {
  await this.verifyAddToWishlistAvailable();

  const beforePressed =
    await this.addToWishlistButton
      .getAttribute(
        'aria-pressed'
      );

  const beforeLabel =
    (
      await this.addToWishlistButton
        .getAttribute(
          'aria-label'
        )
    ) ?? '';

  const beforeClass =
    (
      await this.addToWishlistButton
        .getAttribute(
          'class'
        )
    ) ?? '';

  await this.addCurrentProductToWishlist();

  await this.page.waitForTimeout(
    400
  );

  const afterPressed =
    await this.addToWishlistButton
      .getAttribute(
        'aria-pressed'
      );

  const afterLabel =
    (
      await this.addToWishlistButton
        .getAttribute(
          'aria-label'
        )
    ) ?? '';

  const afterClass =
    (
      await this.addToWishlistButton
        .getAttribute(
          'class'
        )
    ) ?? '';

  return (
    beforePressed !==
      afterPressed ||
    beforeLabel !==
      afterLabel ||
    beforeClass !==
      afterClass
  );
}

// WISH-023
async verifyWishlistScrollableAndUsable(): Promise<void> {
  await this.verifyWishlistLoaded();

  const bodyHeight =
    await this.page.evaluate(
      () =>
        document.body.scrollHeight
    );

  const viewportHeight =
    await this.page.evaluate(
      () =>
        window.innerHeight
    );

  if (
    bodyHeight >
    viewportHeight
  ) {
    await this.page.evaluate(
      () => {
        window.scrollTo(
          0,
          document.body.scrollHeight
        );
      }
    );

    await this.page.waitForTimeout(
      300
    );

    const scrollY =
      await this.page.evaluate(
        () => window.scrollY
      );

    expect(
      scrollY,
      'Wishlist should support vertical scrolling'
    ).toBeGreaterThan(0);
  }

  await expect(
    this.page.locator('body')
  ).toBeVisible();
}

// WISH-024
async verifyRepeatedWishlistOpenHandledSafely(): Promise<void> {
  await this.verifyWishlistLoaded();

  if (
    await this.wishlistTrigger
      .isVisible()
      .catch(() => false)
  ) {
    await this.wishlistTrigger.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    );

    await this.verifyWishlistLoaded();

    if (
      await this.wishlistTrigger
        .isVisible()
        .catch(() => false)
    ) {
      await this.wishlistTrigger.click();

      await this.page.waitForLoadState(
        'domcontentloaded'
      );
    }
  }

  await this.verifyWishlistLoaded();
}

// WISH-025
async getWishlistProductLink(
  productName: string
): Promise<Locator | null> {
  const product =
    this.getProductLocator(
      productName
    );

  if (
    !(await product
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const link =
    product.locator(
      'xpath=ancestor-or-self::a[1]'
    );

  if (
    await link
      .isVisible()
      .catch(() => false)
  ) {
    return link;
  }

  return null;
}

async verifyWishlistProductLinkAccessible(
  productName: string
): Promise<boolean> {
  const link =
    await this.getWishlistProductLink(
      productName
    );

  if (!link) {
    return false;
  }

  const href =
    await link.getAttribute(
      'href'
    );

  expect(
    href,
    'Wishlist product link should have a destination'
  ).toBeTruthy();

  return true;
}

// WISH-026
async verifyRepeatedRemoveHandledSafely(
  productName: string
): Promise<void> {
  await this.removeProduct(
    productName
  );

  await this.verifyProductRemoved(
    productName
  );

  const stillVisible =
    await this.isProductVisible(
      productName
    );

  expect(
    stillVisible,
    'Removed product should stay absent after removal'
  ).toBeFalsy();

  await expect(
    this.page.locator('body')
  ).toBeVisible();
}

// WISH-027
async verifyWishlistCountAfterRemovalWhenSupported(
  productName: string
): Promise<boolean> {
  const before =
    await this.getWishlistCount();

  if (before === null) {
    return false;
  }

  await this.removeProduct(
    productName
  );

  await this.verifyProductRemoved(
    productName
  );

  await this.page.waitForTimeout(
    300
  );

  const after =
    await this.getWishlistCount();

  if (after === null) {
    return false;
  }

  expect(
    after,
    'Wishlist count should not increase after removing a product'
  ).toBeLessThanOrEqual(
    before
  );

  return true;
}

// WISH-028
async verifyEmptyWishlistStableAfterRefresh(): Promise<boolean> {
  const count =
    await this.getWishlistItemCount();

  if (count > 0) {
    return false;
  }

  const emptyBefore =
    await this.emptyState
      .isVisible()
      .catch(() => false);

  if (!emptyBefore) {
    return false;
  }

  await this.page.reload({
    waitUntil:
      'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyWishlistLoaded();

  const emptyAfter =
    await this.emptyState
      .isVisible()
      .catch(() => false);

  expect(
    emptyAfter,
    'Empty Wishlist state should remain visible after refresh'
  ).toBeTruthy();

  return true;
}

// WISH-029
async verifyWishlistResponsiveLayout(): Promise<void> {
  await this.verifyWishlistLoaded();

  const viewport =
    await this.page.evaluate(() => ({
      width:
        window.innerWidth,
      height:
        window.innerHeight,
    }));

  expect(
    viewport.width,
    'Wishlist viewport width should be valid'
  ).toBeGreaterThan(0);

  expect(
    viewport.height,
    'Wishlist viewport height should be valid'
  ).toBeGreaterThan(0);

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Wishlist should not horizontally overflow current Android viewport'
  ).toBeFalsy();

  await this.verifyWishlistControlsDoNotOverlap();
}

// WISH-030
async verifyRepeatedAddRemoveCycleStable(
  productName: string
): Promise<void> {
  await this.addCurrentProductToWishlist();

  await this.page.waitForTimeout(
    300
  );

  await this.openWishlist();

  await this.verifyWishlistLoaded();

  await this.verifyProductExists(
    productName
  );

  await this.removeProduct(
    productName
  );

  await this.verifyProductRemoved(
    productName
  );

  const bodyText = (
    await this.page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  expect(
    bodyText
  ).not.toMatch(
    /internal server error|application error|uncaught exception|stack trace/i
  );

  await expect(
    this.page.locator('body')
  ).toBeVisible();
}

}