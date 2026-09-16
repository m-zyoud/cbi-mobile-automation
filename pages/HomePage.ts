import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async verifyPageLoaded() {
    await expect(this.page).toHaveTitle(/.+/);
  }

  async verifyGlobalElements() {
    await expect(this.page.locator('body')).toBeVisible();

    const header = this.page.locator('header');

    if (await header.count()) {
      await expect(header.first()).toBeVisible();
    }

    const footer = this.page.locator('footer');

    if (await footer.count()) {
      await expect(footer.first()).toBeVisible();
    }
  }

  async getPageTitle() {
    return await this.page.title();
  }
}