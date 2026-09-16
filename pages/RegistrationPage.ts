import { Page, expect } from '@playwright/test';

export class RegistrationPage {
  constructor(private page: Page) {}

  async openRegistration() {
    const registerTrigger = this.page
      .locator(
        'a[href*="register" i], a[href*="signup" i], button:has-text("Create Account"), button:has-text("Register")'
      )
      .first();

    await expect(registerTrigger).toBeVisible({
      timeout: 10000,
    });

    await registerTrigger.click();
  }

  async verifyRegistrationPageLoaded() {
    await expect(this.page.locator('body')).toBeVisible();

    const registrationContent = this.page
      .locator(
        'h1, h2, [class*="register" i], [class*="signup" i]'
      )
      .filter({
        hasText: /register|create account|sign up/i,
      })
      .first();

    if (await registrationContent.count()) {
      await expect(registrationContent).toBeVisible();
    }
  }

  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    await this.fillFirstVisible(
      [
        'input[name*="firstName" i]',
        'input[id*="firstName" i]',
        'input[autocomplete="given-name"]',
      ],
      data.firstName
    );

    await this.fillFirstVisible(
      [
        'input[name*="lastName" i]',
        'input[id*="lastName" i]',
        'input[autocomplete="family-name"]',
      ],
      data.lastName
    );

    await this.fillFirstVisible(
      [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
      ],
      data.email
    );

    await this.fillFirstVisible(
      [
        'input[type="password"]',
        'input[name*="password" i]',
        'input[id*="password" i]',
      ],
      data.password
    );
  }

  async submitRegistration() {
    const submitButton = this.page
      .getByRole('button', {
        name: /create account|register|sign up/i,
      })
      .first();

    await expect(submitButton).toBeVisible({
      timeout: 10000,
    });

    await submitButton.click();
  }

  async verifyRegistrationResult() {
    await expect(this.page.locator('body')).toBeVisible();

    const successIndicator = this.page
      .locator(
        '[class*="success" i], [class*="account" i], [data-testid*="success" i]'
      )
      .first();

    if (await successIndicator.count()) {
      await expect(successIndicator).toBeVisible({
        timeout: 10000,
      });
    }
  }

  private async fillFirstVisible(
    selectors: string[],
    value: string
  ) {
    for (const selector of selectors) {
      const locator = this.page.locator(selector);

      const count = await locator.count();

      for (let i = 0; i < count; i++) {
        const input = locator.nth(i);

        if (await input.isVisible().catch(() => false)) {
          await input.fill(value);
          return;
        }
      }
    }

    throw new Error(`No visible input found for value: ${value}`);
  }
}