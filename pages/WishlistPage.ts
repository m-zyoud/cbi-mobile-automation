import { Page, expect } from '@playwright/test';

export class WishlistPage {
  constructor(private page: Page) {}

  async addCurrentProductToWishlist() {
    const wishlistButton = this.page
      .locator(
        'button[aria-label*="wishlist" i], button[aria-label*="favorite" i], button[class*="wishlist" i], button[class*="favorite" i]'
      )
      .first();

    await expect(wishlistButton).toBeVisible({
      timeout: 10000,
    });

    await wishlistButton.click();
  }

  async openWishlist() {
    const wishlistTrigger = this.page
      .locator(
        'a[href*="wishlist" i], button[aria-label*="wishlist" i], a[aria-label*="wishlist" i]'
      )
      .first();

    await expect(wishlistTrigger).toBeVisible({
      timeout: 10000,
    });

    await wishlistTrigger.click();

    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyWishlistLoaded() {
    await expect(this.page.locator('body')).toBeVisible();

    const wishlistHeading = this.page
      .locator(
        'h1, h2, [class*="wishlist" i], [data-testid*="wishlist" i]'
      )
      .filter({
        hasText: /wishlist|favorites|saved items/i,
      })
      .first();

    if (await wishlistHeading.count()) {
      await expect(wishlistHeading).toBeVisible();
    }
  }

  async verifyProductExists(productName: string) {
    if (!productName) {
      throw new Error('Product name is empty');
    }

    const product = this.page
      .getByText(productName, {
        exact: false,
      })
      .first();

    await expect(product).toBeVisible({
      timeout: 10000,
    });
  }

  async removeFirstWishlistItem() {
    const removeButton = this.page
      .locator(
        'button[aria-label*="remove" i], button[class*="remove" i], button:has-text("Remove")'
      )
      .first();

    await expect(removeButton).toBeVisible({
      timeout: 10000,
    });

    await removeButton.click();
  }
}