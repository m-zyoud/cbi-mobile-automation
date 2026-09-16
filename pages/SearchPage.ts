import { Page, expect } from '@playwright/test';

export class SearchPage {
  constructor(private page: Page) {}

  async openSearch() {
    const searchButton = this.page
      .locator('button.t-header__universal-search-btn')
      .filter({ hasText: 'What can we help you find?' })
      .first();

    await expect(searchButton).toBeVisible();

    await searchButton.click();

    await this.page.waitForTimeout(500);
  }

  async searchFor(term: string) {
    const searchInput = this.page
      .locator(
        'input[type="search"], input[name*="search" i], input[id*="search" i], input[placeholder*="search" i], input[placeholder*="find" i]'
      )
      .filter({ visible: true })
      .first();

    await expect(searchInput).toBeVisible({
      timeout: 10000,
    });

    await searchInput.fill(term);

    await searchInput.press('Enter');
  }

  async verifyResultsLoaded() {
    await this.page.waitForLoadState('domcontentloaded');

    await expect(this.page.locator('body')).toBeVisible();
  }
}