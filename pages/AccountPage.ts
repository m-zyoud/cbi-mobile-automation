import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class AccountPage {
  readonly page: Page;

  readonly accountTrigger: Locator;
  readonly accountContent: Locator;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;

  readonly accountIndicator: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.accountTrigger = page
      .locator(
        [
          'a[href*="account" i]',
          'button[class*="account" i]',
          '[aria-label*="account" i]',
        ].join(',')
      )
      .first();

    this.accountContent = page
      .locator(
        [
          'h1',
          'h2',
          '[class*="account" i]',
          '[data-testid*="account" i]',
        ].join(',')
      )
      .filter({
        hasText:
          /account|sign in|login|log in/i,
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
      .first();

    this.passwordInput = page
      .locator(
        [
          'input[type="password"]',
          'input[name*="password" i]',
          'input[id*="password" i]',
        ].join(',')
      )
      .first();

    this.loginButton = page
      .getByRole('button', {
        name: /sign in|login|log in/i,
      })
      .first();

    this.forgotPasswordLink = page
      .locator(
        [
          'a:has-text("Forgot Password")',
          'a:has-text("Forgot your password")',
          'button:has-text("Forgot Password")',
          '[href*="forgot" i]',
          '[href*="password" i]',
        ].join(',')
      )
      .first();

    this.accountIndicator = page
      .locator(
        [
          'a[href*="logout" i]',
          'button:has-text("Sign Out")',
          'button:has-text("Logout")',
          '[class*="account-overview" i]',
          '[data-testid*="account-overview" i]',
        ].join(',')
      )
      .first();

    this.errorMessage = page
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
        ].join(',')
      )
      .first();
  }

  async openAccount(): Promise<void> {
    await expect(
      this.accountTrigger,
      'Account control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await this.accountTrigger.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    );
  }

  async verifyAccountPageLoaded(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible();

    const contentVisible =
      await this.accountContent
        .isVisible()
        .catch(() => false);

    const emailVisible =
      await this.emailInput
        .isVisible()
        .catch(() => false);

    expect(
      contentVisible || emailVisible,
      'Account or login content should be visible'
    ).toBeTruthy();
  }

  async verifyLoginFormVisible(): Promise<void> {
    await expect(
      this.emailInput,
      'Email input should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.passwordInput,
      'Password input should be visible'
    ).toBeVisible();

    await expect(
      this.loginButton,
      'Login button should be visible'
    ).toBeVisible();
  }

  async fillEmail(
    email: string
  ): Promise<void> {
    await expect(
      this.emailInput
    ).toBeVisible();

    await this.emailInput.fill(email);
  }

  async fillPassword(
    password: string
  ): Promise<void> {
    await expect(
      this.passwordInput
    ).toBeVisible();

    await this.passwordInput.fill(password);
  }

  async submitLogin(): Promise<void> {
    await expect(
      this.loginButton
    ).toBeVisible();

    await this.loginButton.click();
  }

  async login(
    email: string,
    password: string
  ): Promise<void> {
    await this.verifyLoginFormVisible();

    await this.fillEmail(email);

    await this.fillPassword(password);

    await this.submitLogin();
  }

  async verifyPasswordMasked(): Promise<void> {
    await expect(
      this.passwordInput
    ).toHaveAttribute(
      'type',
      'password'
    );
  }

  async verifyForgotPasswordAvailable(): Promise<void> {
    await expect(
      this.forgotPasswordLink,
      'Forgot Password control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyLoginErrorVisible(): Promise<void> {
    await expect(
      this.errorMessage,
      'Login validation or authentication error should be visible'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyLoggedIn(): Promise<void> {
    await expect(
      this.accountIndicator,
      'Logged-in account indicator should be visible'
    ).toBeVisible({
      timeout: 15000,
    });
  }

  // LOGIN-008
async submitEmptyLoginForm(): Promise<void> {
  await this.verifyLoginFormVisible();

  await this.emailInput.fill('');
  await this.passwordInput.fill('');

  await this.submitLogin();
}

async isLoginFormStillVisible(): Promise<boolean> {
  const emailVisible =
    await this.emailInput
      .isVisible()
      .catch(() => false);

  const passwordVisible =
    await this.passwordInput
      .isVisible()
      .catch(() => false);

  return (
    emailVisible &&
    passwordVisible
  );
}

// LOGIN-009
async verifyInvalidEmailHandled(
  email: string
): Promise<boolean> {
  await this.verifyLoginFormVisible();

  await this.emailInput.fill(
    email
  );

  await this.passwordInput.fill(
    'TemporaryPassword123!'
  );

  await this.emailInput.blur();

  const type =
    await this.emailInput
      .getAttribute('type');

  if (type === 'email') {
    const invalid =
      await this.emailInput
        .evaluate(
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

  await this.submitLogin();

  const errorVisible =
    await this.errorMessage
      .isVisible()
      .catch(() => false);

  const stillOnLogin =
    await this.isLoginFormStillVisible();

  return (
    errorVisible ||
    stillOnLogin
  );
}

// LOGIN-010
async loginWithInvalidCredentials(): Promise<void> {
  await this.login(
    'invalid-automation-user@example.com',
    'InvalidPassword123!'
  );
}

async verifyInvalidCredentialsRejected(): Promise<void> {
  const errorVisible =
    await this.errorMessage
      .isVisible()
      .catch(() => false);

  const loginVisible =
    await this.isLoginFormStillVisible();

  const loggedIn =
    await this.accountIndicator
      .isVisible()
      .catch(() => false);

  expect(
    loggedIn,
    'Invalid credentials must not authenticate the user'
  ).toBeFalsy();

  expect(
    errorVisible ||
      loginVisible,
    'Invalid credentials should leave user on login or show an authentication error'
  ).toBeTruthy();
}

// LOGIN-011
async verifyEmailWhitespaceHandling(
  email: string
): Promise<boolean> {
  await this.verifyLoginFormVisible();

  await this.emailInput.fill(
    `   ${email}   `
  );

  await this.emailInput.blur();

  const current =
    await this.emailInput
      .inputValue();

  /*
   * Both behaviors can be valid:
   * - browser/app trims whitespace immediately
   * - value stays temporarily but meaningful email remains intact
   */
  return (
    current.trim() === email
  );
}

// LOGIN-012
async verifyEmailCaseInputHandling(
  email: string
): Promise<void> {
  await this.verifyLoginFormVisible();

  const upperCaseEmail =
    email.toUpperCase();

  await this.emailInput.fill(
    upperCaseEmail
  );

  const current =
    await this.emailInput.inputValue();

  expect(
    current.trim().toLowerCase(),
    'Email field should preserve the same logical email value regardless of casing'
  ).toBe(
    email.trim().toLowerCase()
  );
}

// LOGIN-013
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
    'TemporaryPassword123!'
  );

  const before =
    await this.passwordInput
      .getAttribute('type');

  await toggle.click();

  const after =
    await this.passwordInput
      .getAttribute('type');

  expect(
    before
  ).toBe('password');

  expect(
    after,
    'Password visibility toggle should change password field type'
  ).not.toBe(before);

  return true;
}

// LOGIN-014
async openForgotPassword(): Promise<void> {
  await this.verifyForgotPasswordAvailable();

  await this.forgotPasswordLink.click();

  await this.page
    .waitForLoadState(
      'domcontentloaded',
      {
        timeout: 10000,
      }
    )
    .catch(() => undefined);
}

async verifyForgotPasswordStateVisible(): Promise<void> {
  const content =
    this.page
      .locator(
        [
          'h1:visible',
          'h2:visible',
          '[role="dialog"]:visible',
          '[class*="forgot" i]:visible',
          '[class*="reset" i]:visible',
          '[data-testid*="forgot" i]:visible',
        ].join(',')
      )
      .filter({
        hasText:
          /forgot password|reset password|password reset|recover password/i,
      })
      .first();

  const emailVisible =
    await this.page
      .locator(
        [
          'input[type="email"]:visible',
          'input[name*="email" i]:visible',
          'input[id*="email" i]:visible',
        ].join(',')
      )
      .first()
      .isVisible()
      .catch(() => false);

  const contentVisible =
    await content
      .isVisible()
      .catch(() => false);

  expect(
    contentVisible ||
      emailVisible,
    'Forgot Password flow should display recovery content or an email field'
  ).toBeTruthy();
}

// LOGIN-015
async verifyForgotPasswordEmptyEmailHandled(): Promise<boolean> {
  const email =
    this.page
      .locator(
        [
          'input[type="email"]:visible',
          'input[name*="email" i]:visible',
          'input[id*="email" i]:visible',
        ].join(',')
      )
      .first();

  if (
    !(await email
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await email.fill('');

  const submit =
    this.page
      .getByRole('button')
      .filter({
        hasText:
          /submit|send|reset|continue|email me|request/i,
      })
      .first();

  if (
    !(await submit
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await submit.click();

  const ariaInvalid =
    await email.getAttribute(
      'aria-invalid'
    );

  if (
    ariaInvalid === 'true'
  ) {
    return true;
  }

  const browserInvalid =
    await email
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

  const error =
    this.page
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
        ].join(',')
      )
      .first();

  return error
    .isVisible()
    .catch(() => false);
}

// LOGIN-016
async verifyForgotPasswordMalformedEmailHandled(): Promise<boolean> {
  const email =
    this.page
      .locator(
        [
          'input[type="email"]:visible',
          'input[name*="email" i]:visible',
          'input[id*="email" i]:visible',
        ].join(',')
      )
      .first();

  if (
    !(await email
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await email.fill(
    'invalid-email'
  );

  await email.blur();

  const type =
    await email.getAttribute(
      'type'
    );

  if (type === 'email') {
    const invalid =
      await email.evaluate(
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

  const submit =
    this.page
      .getByRole('button')
      .filter({
        hasText:
          /submit|send|reset|continue|request/i,
      })
      .first();

  if (
    await submit
      .isVisible()
      .catch(() => false)
  ) {
    await submit.click();
  }

  const error =
    this.page
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
        ].join(',')
      )
      .first();

  return error
    .isVisible()
    .catch(() => false);
}

// LOGIN-017
async getRememberMeControl(): Promise<Locator | null> {
  const control =
    this.page
      .locator(
        [
          'input[type="checkbox"][name*="remember" i]:visible',
          'input[type="checkbox"][id*="remember" i]:visible',
          '[role="checkbox"][aria-label*="remember" i]:visible',
          'label:has-text("Remember Me") input:visible',
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

async verifyRememberMeCanBeSelected(): Promise<boolean> {
  const control =
    await this.getRememberMeControl();

  if (!control) {
    return false;
  }

  const checkedBefore =
    (await control
      .isChecked()
      .catch(() => false)) ||
    (await control.getAttribute(
      'aria-checked'
    )) === 'true';

  await control.click();

  const checkedAfter =
    (await control
      .isChecked()
      .catch(() => false)) ||
    (await control.getAttribute(
      'aria-checked'
    )) === 'true';

  expect(
    checkedAfter
  ).not.toBe(checkedBefore);

  return true;
}

// LOGIN-018
async verifyLoginButtonAccessible(): Promise<void> {
  await expect(
    this.loginButton
  ).toBeVisible();

  await expect(
    this.loginButton
  ).toBeEnabled();

  const text = (
    await this.loginButton
      .innerText()
      .catch(() => '')
  ).trim();

  const aria =
    (await this.loginButton
      .getAttribute(
        'aria-label'
      )) ?? '';

  expect(
    `${text} ${aria}`.trim(),
    'Login button should expose an accessible label'
  ).toMatch(
    /sign in|login|log in/i
  );
}

// LOGIN-019
async verifyMultipleFailedLoginAttemptsHandled(
  attempts = 3
): Promise<void> {
  for (
    let i = 0;
    i < attempts;
    i++
  ) {
    await this.emailInput.fill(
      'invalid-automation-user@example.com'
    );

    await this.passwordInput.fill(
      'WrongPassword123!'
    );

    await this.submitLogin();

    await this.page.waitForTimeout(
      300
    );

    const loggedIn =
      await this.accountIndicator
        .isVisible()
        .catch(() => false);

    expect(
      loggedIn,
      `Invalid login attempt ${i + 1} must not authenticate`
    ).toBeFalsy();

    const stillLogin =
      await this.isLoginFormStillVisible();

    const errorVisible =
      await this.errorMessage
        .isVisible()
        .catch(() => false);

    expect(
      stillLogin ||
        errorVisible,
      'Failed attempts should be handled safely'
    ).toBeTruthy();
  }
}

// LOGIN-020
async refreshAndVerifyLoginForm(): Promise<void> {
  await this.page.reload({
    waitUntil:
      'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyAccountPageLoaded();

  await this.verifyLoginFormVisible();
}

// LOGIN-021
async verifyAccountBackForwardNavigation(): Promise<boolean> {
  const accountUrl =
    this.page.url();

  const back =
    await this.page
      .goBack({
        waitUntil:
          'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!back) {
    return false;
  }

  const forward =
    await this.page
      .goForward({
        waitUntil:
          'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!forward) {
    return false;
  }

  expect(
    this.page.url()
  ).toBe(accountUrl);

  await this.verifyAccountPageLoaded();

  return true;
}

// LOGIN-022
async verifyKeyboardInputWorks(): Promise<void> {
  await this.verifyLoginFormVisible();

  await this.emailInput.focus();

  await this.page.keyboard.type(
    'keyboard-test@example.com'
  );

  await this.passwordInput.focus();

  await this.page.keyboard.type(
    'KeyboardPassword123!'
  );

  expect(
    await this.emailInput.inputValue()
  ).toBe(
    'keyboard-test@example.com'
  );

  expect(
    await this.passwordInput.inputValue()
  ).toBe(
    'KeyboardPassword123!'
  );
}

// LOGIN-023
async submitLoginWithEnter(): Promise<boolean> {
  await this.verifyLoginFormVisible();

  await this.emailInput.fill(
    'invalid-enter-test@example.com'
  );

  await this.passwordInput.fill(
    'InvalidPassword123!'
  );

  await this.passwordInput.press(
    'Enter'
  );

  await this.page.waitForTimeout(
    500
  );

  const loggedIn =
    await this.accountIndicator
      .isVisible()
      .catch(() => false);

  if (loggedIn) {
    return false;
  }

  const stillOnLogin =
    await this.isLoginFormStillVisible();

  const errorVisible =
    await this.errorMessage
      .isVisible()
      .catch(() => false);

  return (
    stillOnLogin ||
    errorVisible
  );
}

// LOGIN-024
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

// LOGIN-025
async verifyLoginControlsDoNotOverlap(): Promise<void> {
  const controls = [
    this.emailInput,
    this.passwordInput,
    this.loginButton,
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
      await control.boundingBox();

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
        `Login controls ${i} and ${j} should not overlap`
      ).toBeFalsy();
    }
  }
}

// LOGIN-026
async verifyLoginPageScrollableAndUsable(): Promise<void> {
  const initialY =
    await this.page.evaluate(
      () => window.scrollY
    );

  const bodyHeight =
    await this.page.evaluate(
      () => document.body.scrollHeight
    );

  const viewportHeight =
    await this.page.evaluate(
      () => window.innerHeight
    );

  if (
    bodyHeight >
    viewportHeight
  ) {
    await this.page.evaluate(() => {
      window.scrollTo(
        0,
        document.body.scrollHeight
      );
    });

    await this.page.waitForTimeout(
      400
    );

    const afterY =
      await this.page.evaluate(
        () => window.scrollY
      );

    expect(
      afterY,
      'Login page should scroll vertically'
    ).toBeGreaterThanOrEqual(
      initialY
    );
  }

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  await this.verifyLoginFormVisible();
}

// LOGIN-027
async verifyLongEmailHandledSafely(): Promise<void> {
  await this.verifyLoginFormVisible();

  const longEmail =
    `${'a'.repeat(180)}@example.com`;

  await this.emailInput.fill(
    longEmail
  );

  await this.emailInput.blur();

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
    'Long email input should not break mobile layout'
  ).toBeFalsy();
}

// LOGIN-028
async verifyLongPasswordHandledSafely(): Promise<void> {
  await this.verifyLoginFormVisible();

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
  ).toBe('password');

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Long password input should not break mobile layout'
  ).toBeFalsy();
}

// LOGIN-029
async verifyPasswordNeverPlainTextByDefault(): Promise<void> {
  await this.verifyLoginFormVisible();

  await this.passwordInput.fill(
    'SensitivePassword123!'
  );

  const typeBefore =
    await this.passwordInput.getAttribute(
      'type'
    );

  expect(
    typeBefore,
    'Password must be masked by default'
  ).toBe('password');

  await this.emailInput.focus();

  const typeAfter =
    await this.passwordInput.getAttribute(
      'type'
    );

  expect(
    typeAfter,
    'Password must remain masked when focus changes'
  ).toBe('password');
}

// LOGIN-030
async verifyRepeatedLoginSubmitHandledSafely(): Promise<void> {
  await this.verifyLoginFormVisible();

  await this.emailInput.fill(
    'invalid-repeat-test@example.com'
  );

  await this.passwordInput.fill(
    'InvalidPassword123!'
  );

  await this.submitLogin();

  await this.page.waitForTimeout(
    300
  );

  const firstLoggedIn =
    await this.accountIndicator
      .isVisible()
      .catch(() => false);

  expect(
    firstLoggedIn,
    'Invalid credentials must not authenticate after first submit'
  ).toBeFalsy();

  const formStillVisible =
    await this.isLoginFormStillVisible();

  if (formStillVisible) {
    await this.submitLogin();

    await this.page.waitForTimeout(
      300
    );
  }

  const loggedIn =
    await this.accountIndicator
      .isVisible()
      .catch(() => false);

  expect(
    loggedIn,
    'Repeated invalid submission must never authenticate the user'
  ).toBeFalsy();

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
    /internal server error|application error|stack trace|uncaught exception/i
  );
}

}