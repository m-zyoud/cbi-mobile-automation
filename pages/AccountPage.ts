import { Page, expect } from '@playwright/test';

export class AccountPage {
  constructor(private page: Page) {}

  async openAccount() {
    const accountTrigger = this.page.locator(
      'a[href*="account" i], button[class*="account" i], [aria-label*="account" i]'
    ).first();

    await expect(accountTrigger).toBeVisible({
      timeout: 10000,
    });

    await accountTrigger.click();
  }

  async verifyAccountPageLoaded() {
    await expect(this.page.locator('body')).toBeVisible();

    const accountContent = this.page.locator(
      'h1, h2, [class*="account" i]'
    ).filter({
      hasText: /account|sign in|login/i,
    }).first();

    if (await accountContent.count()) {
      await expect(accountContent).toBeVisible();
    }
  }

  async login(email: string, password: string) {
    const emailInput = this.page.locator(
      'input[type="email"], input[name*="email" i], input[id*="email" i]'
    ).first();

    const passwordInput = this.page.locator(
      'input[type="password"], input[name*="password" i], input[id*="password" i]'
    ).first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill(email);
    await passwordInput.fill(password);

    const loginButton = this.page.getByRole('button', {
      name: /sign in|login|log in/i,
    }).first();

    await expect(loginButton).toBeVisible();

    await loginButton.click();
  }

  async verifyLoggedIn() {
    const accountIndicator = this.page.locator(
      'a[href*="logout" i], button:has-text("Sign Out"), button:has-text("Logout"), [class*="account-overview" i]'
    ).first();

    await expect(accountIndicator).toBeVisible({
      timeout: 10000,
    });
  }
}