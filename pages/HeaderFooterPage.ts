import { Page, expect } from '@playwright/test';

export class HeaderFooterPage {
  constructor(private page: Page) {}

  async verifyHeaderVisible() {
    const header = this.page.locator('header').first();

    await expect(header).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyFooterVisible() {
    const footer = this.page.locator('footer').first();

    await expect(footer).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyLogoVisible() {
    const logo = this.page.locator(
      'header img[alt*="logo" i], header [class*="logo" i], header a[class*="logo" i]'
    ).first();

    await expect(logo).toBeVisible({
      timeout: 10000,
    });
  }

  async verifySearchAvailable() {
    const search = this.page.locator(
      'header button[class*="search" i], header [aria-label*="search" i], header [class*="search" i]'
    ).first();

    await expect(search).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyCartAvailable() {
    const cart = this.page.locator(
      'header a[href*="cart" i], header button[class*="cart" i], header [aria-label*="cart" i]'
    ).first();

    await expect(cart).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyAccountAvailable() {
    const account = this.page.locator(
      'header a[href*="account" i], header [class*="account" i], header [aria-label*="account" i]'
    ).first();

    await expect(account).toBeVisible({
      timeout: 10000,
    });
  }
}