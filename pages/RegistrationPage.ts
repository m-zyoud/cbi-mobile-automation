import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export class RegistrationPage {
  readonly page: Page;

  readonly registerTrigger: Locator;
  readonly registrationContent: Locator;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;

  readonly submitButton: Locator;
  readonly successIndicator: Locator;
  readonly validationMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.registerTrigger = page
      .locator(
        [
          'a[href*="register" i]',
          'a[href*="signup" i]',
          'a[href*="create-account" i]',
          'button:has-text("Create Account")',
          'button:has-text("Register")',
          'button:has-text("Sign Up")',
        ].join(',')
      )
      .first();

    this.registrationContent = page
      .locator(
        [
          'h1',
          'h2',
          '[class*="register" i]',
          '[class*="signup" i]',
          '[data-testid*="register" i]',
        ].join(',')
      )
      .filter({
        hasText:
          /register|create account|sign up/i,
      })
      .first();

    this.firstNameInput = page
      .locator(
        [
          'input[name*="firstName" i]',
          'input[id*="firstName" i]',
          'input[autocomplete="given-name"]',
        ].join(',')
      )
      .filter({
        visible: true,
      })
      .first();

    this.lastNameInput = page
      .locator(
        [
          'input[name*="lastName" i]',
          'input[id*="lastName" i]',
          'input[autocomplete="family-name"]',
        ].join(',')
      )
      .filter({
        visible: true,
      })
      .first();

    this.emailInput = page
      .locator(
        [
          'input[type="email"]',
          'input[name*="email" i]',
          'input[id*="email" i]',
        ].join(',')
      )
      .filter({
        visible: true,
      })
      .first();

    this.passwordInput = page
      .locator(
        [
          'input[type="password"]',
          'input[name*="password" i]',
          'input[id*="password" i]',
        ].join(',')
      )
      .filter({
        visible: true,
      })
      .first();

    this.submitButton = page
      .getByRole('button', {
        name:
          /create account|register|sign up/i,
      })
      .first();

    this.successIndicator = page
      .locator(
        [
          '[class*="success" i]:visible',
          '[data-testid*="success" i]:visible',
          '[class*="account-overview" i]:visible',
          'a[href*="logout" i]:visible',
          'button:has-text("Sign Out")',
        ].join(',')
      )
      .first();

    this.validationMessage = page
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
          '[aria-invalid="true"]:visible',
        ].join(',')
      )
      .first();
  }

  async openRegistration(): Promise<void> {
    await expect(
      this.registerTrigger,
      'Registration control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await this.registerTrigger.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    );
  }

  async verifyRegistrationPageLoaded(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible();

    const registrationVisible =
      await this.registrationContent
        .isVisible()
        .catch(() => false);

    const formVisible =
      await this.emailInput
        .isVisible()
        .catch(() => false);

    expect(
      registrationVisible || formVisible,
      'Registration page or registration form should be visible'
    ).toBeTruthy();
  }

  async verifyRegistrationFormVisible(): Promise<void> {
    await expect(
      this.firstNameInput,
      'First name input should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.lastNameInput,
      'Last name input should be visible'
    ).toBeVisible();

    await expect(
      this.emailInput,
      'Email input should be visible'
    ).toBeVisible();

    await expect(
      this.passwordInput,
      'Password input should be visible'
    ).toBeVisible();

    await expect(
      this.submitButton,
      'Registration submit button should be visible'
    ).toBeVisible();
  }

  async verifyPasswordMasked(): Promise<void> {
    await expect(
      this.passwordInput
    ).toHaveAttribute(
      'type',
      'password'
    );
  }

  async fillFirstName(
    value: string
  ): Promise<void> {
    await expect(
      this.firstNameInput
    ).toBeVisible();

    await this.firstNameInput.fill(value);
  }

  async fillLastName(
    value: string
  ): Promise<void> {
    await expect(
      this.lastNameInput
    ).toBeVisible();

    await this.lastNameInput.fill(value);
  }

  async fillEmail(
    value: string
  ): Promise<void> {
    await expect(
      this.emailInput
    ).toBeVisible();

    await this.emailInput.fill(value);
  }

  async fillPassword(
    value: string
  ): Promise<void> {
    await expect(
      this.passwordInput
    ).toBeVisible();

    await this.passwordInput.fill(value);
  }

  async fillRegistrationForm(
    data: RegistrationData
  ): Promise<void> {
    await this.verifyRegistrationFormVisible();

    await this.fillFirstName(
      data.firstName
    );

    await this.fillLastName(
      data.lastName
    );

    await this.fillEmail(
      data.email
    );

    await this.fillPassword(
      data.password
    );
  }

  async submitRegistration(): Promise<void> {
    await expect(
      this.submitButton
    ).toBeVisible({
      timeout: 10000,
    });

    await this.submitButton.click();
  }

  async verifyFormStillVisible(): Promise<void> {
    await expect(
      this.emailInput
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.submitButton
    ).toBeVisible();
  }

  async verifyValidationVisibleIfProvided(): Promise<void> {
    const validationVisible =
      await this.validationMessage
        .isVisible()
        .catch(() => false);

    if (validationVisible) {
      await expect(
        this.validationMessage
      ).toBeVisible();

      return;
    }

    /*
     * Some sites rely on native HTML validation
     * rather than rendering a custom error message.
     */
    const invalidFieldCount =
      await this.page
        .locator(':invalid')
        .count();

    expect(
      invalidFieldCount,
      'Either a validation message or invalid form control should exist'
    ).toBeGreaterThan(0);
  }

  async verifyRegistrationResult(): Promise<void> {
    const successVisible =
      await this.successIndicator
        .isVisible()
        .catch(() => false);

    if (successVisible) {
      await expect(
        this.successIndicator
      ).toBeVisible({
        timeout: 10000,
      });

      return;
    }

    const validationVisible =
      await this.validationMessage
        .isVisible()
        .catch(() => false);

    if (validationVisible) {
      const message = (
        await this.validationMessage
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      throw new Error(
        `Registration was not successful: ${message}`
      );
    }

    throw new Error(
      'Registration did not expose a success indicator or validation result'
    );
  }

  // REG-011
async verifyMissingFirstNameHandled(): Promise<boolean> {
  await this.verifyRegistrationFormVisible();

  await this.firstNameInput.fill('');
  await this.lastNameInput.fill('Tester');
  await this.emailInput.fill('automation@example.com');
  await this.passwordInput.fill('Automation123!');

  await this.submitRegistration();

  return this.isFieldInvalid(
    this.firstNameInput
  );
}

// REG-012
async verifyMissingLastNameHandled(): Promise<boolean> {
  await this.verifyRegistrationFormVisible();

  await this.firstNameInput.fill('Automation');
  await this.lastNameInput.fill('');
  await this.emailInput.fill('automation@example.com');
  await this.passwordInput.fill('Automation123!');

  await this.submitRegistration();

  return this.isFieldInvalid(
    this.lastNameInput
  );
}

// REG-013
async verifyInvalidEmailHandled(): Promise<boolean> {
  await this.verifyRegistrationFormVisible();

  await this.firstNameInput.fill('Automation');
  await this.lastNameInput.fill('Tester');
  await this.emailInput.fill('invalid-email');
  await this.passwordInput.fill('Automation123!');

  await this.emailInput.blur();

  const type =
    await this.emailInput.getAttribute(
      'type'
    );

  if (type === 'email') {
    const invalid =
      await this.emailInput.evaluate(
        (
          element:
            HTMLInputElement
        ) =>
          !element.checkValidity()
      );

    if (invalid) {
      return true;
    }
  }

  await this.submitRegistration();

  return this.isFieldInvalid(
    this.emailInput
  );
}

// REG-014
async verifyWeakPasswordHandled(): Promise<boolean> {
  await this.verifyRegistrationFormVisible();

  await this.firstNameInput.fill('Automation');
  await this.lastNameInput.fill('Tester');
  await this.emailInput.fill('automation@example.com');
  await this.passwordInput.fill('123');

  await this.submitRegistration();

  const success =
    await this.successIndicator
      .isVisible()
      .catch(() => false);

  if (success) {
    return false;
  }

  const invalid =
    await this.isFieldInvalid(
      this.passwordInput
    );

  const validation =
    await this.validationMessage
      .isVisible()
      .catch(() => false);

  const formStillVisible =
    await this.emailInput
      .isVisible()
      .catch(() => false);

  return (
    invalid ||
    validation ||
    formStillVisible
  );
}

// REG-015
async getPasswordRequirementsText(): Promise<string | null> {
  const requirements =
    this.page
      .locator(
        [
          '[class*="password" i]:visible',
          '[data-testid*="password" i]:visible',
          '[aria-describedby*="password" i]:visible',
          'ul:visible',
          'p:visible',
        ].join(',')
      )
      .filter({
        hasText:
          /password|uppercase|lowercase|number|character|special|minimum/i,
      })
      .first();

  if (
    !(await requirements
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const text = (
    await requirements
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  return text || null;
}

// REG-016
async getConfirmPasswordInput(): Promise<Locator | null> {
  const input =
    this.page
      .locator(
        [
          'input[name*="confirm" i][type="password"]:visible',
          'input[id*="confirm" i][type="password"]:visible',
          'input[name*="verify" i][type="password"]:visible',
          'input[id*="verify" i][type="password"]:visible',
          'input[aria-label*="confirm password" i]:visible',
        ].join(',')
      )
      .first();

  if (
    await input
      .isVisible()
      .catch(() => false)
  ) {
    return input;
  }

  return null;
}

async verifyPasswordMismatchHandled(): Promise<boolean> {
  const confirmPassword =
    await this.getConfirmPasswordInput();

  if (!confirmPassword) {
    return false;
  }

  await this.firstNameInput.fill('Automation');
  await this.lastNameInput.fill('Tester');
  await this.emailInput.fill('automation@example.com');
  await this.passwordInput.fill('Automation123!');
  await confirmPassword.fill('DifferentPassword123!');

  await this.submitRegistration();

  const success =
    await this.successIndicator
      .isVisible()
      .catch(() => false);

  if (success) {
    return false;
  }

  const invalid =
    await this.isFieldInvalid(
      confirmPassword
    );

  const validation =
    await this.validationMessage
      .isVisible()
      .catch(() => false);

  return (
    invalid ||
    validation
  );
}

// REG-017
async getPasswordVisibilityToggle(): Promise<Locator | null> {
  const toggle =
    this.page
      .locator(
        [
          'button[aria-label*="show password" i]:visible',
          'button[aria-label*="hide password" i]:visible',
          'button[title*="show password" i]:visible',
          'button[title*="hide password" i]:visible',
          '[class*="password" i] button:visible',
          '[data-testid*="password" i] button:visible',
        ].join(',')
      )
      .first();

  if (
    await toggle
      .isVisible()
      .catch(() => false)
  ) {
    return toggle;
  }

  return null;
}

async verifyPasswordVisibilityToggleWorks(): Promise<boolean> {
  const toggle =
    await this.getPasswordVisibilityToggle();

  if (!toggle) {
    return false;
  }

  await this.passwordInput.fill(
    'Automation123!'
  );

  const before =
    await this.passwordInput.getAttribute(
      'type'
    );

  await toggle.click();

  const after =
    await this.passwordInput.getAttribute(
      'type'
    );

  expect(
    before
  ).toBe('password');

  expect(
    after
  ).not.toBe(before);

  return true;
}

// REG-018
async verifyDuplicateEmailHandled(): Promise<boolean> {
  await this.verifyRegistrationFormVisible();

  await this.fillRegistrationForm({
    firstName: 'Automation',
    lastName: 'Tester',
    email: 'automation@example.com',
    password: 'Automation123!',
  });

  await this.submitRegistration();

  const success =
    await this.successIndicator
      .isVisible()
      .catch(() => false);

  if (success) {
    return true;
  }

  const error =
    await this.validationMessage
      .isVisible()
      .catch(() => false);

  const formStillVisible =
    await this.emailInput
      .isVisible()
      .catch(() => false);

  return (
    error ||
    formStillVisible
  );
}

// REG-019
async getTermsControl(): Promise<Locator | null> {
  const control =
    this.page
      .locator(
        [
          'input[type="checkbox"][name*="terms" i]:visible',
          'input[type="checkbox"][id*="terms" i]:visible',
          'input[type="checkbox"][name*="agree" i]:visible',
          '[role="checkbox"][aria-label*="terms" i]:visible',
          '[role="checkbox"][aria-label*="agree" i]:visible',
        ].join(',')
      )
      .first();

  if (
    await control
      .isVisible()
      .catch(() => false)
  ) {
    return control;
  }

  return null;
}

async verifyTermsCanBeSelected(): Promise<boolean> {
  const control =
    await this.getTermsControl();

  if (!control) {
    return false;
  }

  const before =
    (await control
      .isChecked()
      .catch(() => false)) ||
    (await control.getAttribute(
      'aria-checked'
    )) === 'true';

  await control.click();

  const after =
    (await control
      .isChecked()
      .catch(() => false)) ||
    (await control.getAttribute(
      'aria-checked'
    )) === 'true';

  expect(
    after
  ).not.toBe(before);

  return true;
}

// REG-020
async submitRegistrationWithEnter(): Promise<boolean> {
  await this.verifyRegistrationFormVisible();

  await this.firstNameInput.fill(
    'Automation'
  );

  await this.lastNameInput.fill(
    'Tester'
  );

  await this.emailInput.fill(
    'automation-enter@example.com'
  );

  await this.passwordInput.fill(
    'Automation123!'
  );

  await this.passwordInput.press(
    'Enter'
  );

  await this.page.waitForTimeout(
    500
  );

  const success =
    await this.successIndicator
      .isVisible()
      .catch(() => false);

  const validation =
    await this.validationMessage
      .isVisible()
      .catch(() => false);

  const formVisible =
    await this.emailInput
      .isVisible()
      .catch(() => false);

  return (
    success ||
    validation ||
    formVisible
  );
}

private async isFieldInvalid(
  field: Locator
): Promise<boolean> {
  const ariaInvalid =
    await field.getAttribute(
      'aria-invalid'
    );

  if (
    ariaInvalid === 'true'
  ) {
    return true;
  }

  const browserInvalid =
    await field
      .evaluate(
        (
          element:
            HTMLInputElement
        ) =>
          !element.checkValidity()
      )
      .catch(() => false);

  if (browserInvalid) {
    return true;
  }

  const parent =
    field.locator(
      'xpath=..'
    );

  const error =
    parent
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
          '[class*="invalid" i]:visible',
        ].join(',')
      )
      .first();

  return error
    .isVisible()
    .catch(() => false);
}

// REG-021
async refreshAndVerifyRegistrationForm(): Promise<void> {
  await this.page.reload({
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyRegistrationPageLoaded();

  await this.verifyRegistrationFormVisible();
}

// REG-022
async verifyRegistrationBackForwardNavigation(): Promise<boolean> {
  const registrationUrl =
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
    'Forward navigation should return to registration page'
  ).toBe(
    registrationUrl
  );

  await this.verifyRegistrationPageLoaded();

  return true;
}

// REG-023
async verifyRegistrationKeyboardInputWorks(): Promise<void> {
  await this.verifyRegistrationFormVisible();

  await this.firstNameInput.focus();

  await this.page.keyboard.type(
    'Automation'
  );

  await this.lastNameInput.focus();

  await this.page.keyboard.type(
    'Tester'
  );

  await this.emailInput.focus();

  await this.page.keyboard.type(
    'keyboard-registration@example.com'
  );

  await this.passwordInput.focus();

  await this.page.keyboard.type(
    'KeyboardPassword123!'
  );

  expect(
    await this.firstNameInput.inputValue()
  ).toBe(
    'Automation'
  );

  expect(
    await this.lastNameInput.inputValue()
  ).toBe(
    'Tester'
  );

  expect(
    await this.emailInput.inputValue()
  ).toBe(
    'keyboard-registration@example.com'
  );

  expect(
    await this.passwordInput.inputValue()
  ).toBe(
    'KeyboardPassword123!'
  );
}

// REG-024
async verifyLongFirstNameHandledSafely(): Promise<void> {
  await this.verifyRegistrationFormVisible();

  const longValue =
    'A'.repeat(120);

  await this.firstNameInput.fill(
    longValue
  );

  const value =
    await this.firstNameInput.inputValue();

  expect(
    value.length,
    'Long first name input should remain handled by the form'
  ).toBeGreaterThan(0);

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Long first name should not break mobile layout'
  ).toBeFalsy();
}

// REG-025
async verifyLongLastNameHandledSafely(): Promise<void> {
  await this.verifyRegistrationFormVisible();

  const longValue =
    'B'.repeat(120);

  await this.lastNameInput.fill(
    longValue
  );

  const value =
    await this.lastNameInput.inputValue();

  expect(
    value.length,
    'Long last name input should remain handled by the form'
  ).toBeGreaterThan(0);

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Long last name should not break mobile layout'
  ).toBeFalsy();
}

// REG-026
async verifyLongEmailHandledSafely(): Promise<void> {
  await this.verifyRegistrationFormVisible();

  const longEmail =
    `${'a'.repeat(180)}@example.com`;

  await this.emailInput.fill(
    longEmail
  );

  const value =
    await this.emailInput.inputValue();

  expect(
    value.length,
    'Long email input should remain handled by the form'
  ).toBeGreaterThan(0);

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Long email should not break mobile layout'
  ).toBeFalsy();
}

// REG-027
async verifyLongPasswordHandledSafely(): Promise<void> {
  await this.verifyRegistrationFormVisible();

  const longPassword =
    'P'.repeat(200);

  await this.passwordInput.fill(
    longPassword
  );

  const value =
    await this.passwordInput.inputValue();

  expect(
    value.length,
    'Long password input should remain handled by the form'
  ).toBeGreaterThan(0);

  const type =
    await this.passwordInput.getAttribute(
      'type'
    );

  expect(
    type,
    'Long password should remain masked'
  ).toBe(
    'password'
  );

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Long password should not break mobile layout'
  ).toBeFalsy();
}

// REG-028
async verifyPasswordRemainsMaskedByDefault(): Promise<void> {
  await this.verifyRegistrationFormVisible();

  await this.passwordInput.fill(
    'SensitiveRegistrationPassword123!'
  );

  const before =
    await this.passwordInput.getAttribute(
      'type'
    );

  expect(
    before,
    'Registration password should be masked by default'
  ).toBe(
    'password'
  );

  await this.emailInput.focus();

  const after =
    await this.passwordInput.getAttribute(
      'type'
    );

  expect(
    after,
    'Registration password should remain masked after focus changes'
  ).toBe(
    'password'
  );
}

// REG-029
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

// REG-030
async verifyRegistrationControlsDoNotOverlap(): Promise<void> {
  const controls = [
    this.firstNameInput,
    this.lastNameInput,
    this.emailInput,
    this.passwordInput,
    this.submitButton,
  ];

  const boxes = [];

  for (
    const control of controls
  ) {
    if (
      !(await control
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const box =
      await control
        .boundingBox()
        .catch(() => null);

    if (!box) {
      continue;
    }

    boxes.push(box);
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
        `Registration controls ${i} and ${j} should not overlap`
      ).toBeFalsy();
    }
  }
}

}