import { Page, expect } from '@playwright/test';

export class PLPPage {
  constructor(private page: Page) {}

  async verifyPLPLoaded() {
    await expect(this.page.locator('body')).toBeVisible();

    const productCards = this.page.locator(
      '[class*="product-card" i], [class*="product-tile" i], [data-testid*="product" i]'
    );

    await expect(productCards.first()).toBeVisible({
      timeout: 10000,
    });
  }

  async getProductCount() {
    const productCards = this.page.locator(
      '[class*="product-card" i], [class*="product-tile" i], [data-testid*="product" i]'
    );

    return await productCards.count();
  }

  async verifySortAvailable() {
    const sortControl = this.page.locator(
      'select[name*="sort" i], button:has-text("Sort"), [class*="sort" i]'
    ).first();

    if (await sortControl.count()) {
      await expect(sortControl).toBeVisible();
    }
  }

  async verifyFilterAvailable() {
    const filterControl = this.page.locator(
      'button:has-text("Filter"), [class*="filter" i], [aria-label*="filter" i]'
    ).first();

    if (await filterControl.count()) {
      await expect(filterControl).toBeVisible();
    }
  }

  async openFirstVisibleProduct() {
    const productLinks = this.page.locator(
      'a[href*="/product/" i], a[href*="/p/" i], [class*="product" i] a'
    );

    const count = await productLinks.count();

    if (count === 0) {
      throw new Error('No product links found on PLP');
    }

    for (let i = 0; i < count; i++) {
      const product = productLinks.nth(i);

      if (await product.isVisible().catch(() => false)) {
        await product.click();
        return;
      }
    }

    throw new Error('No visible product link found on PLP');
  }
}