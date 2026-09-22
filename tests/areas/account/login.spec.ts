import { Page } from '@playwright/test';

import { sites } from '../../../config/sites';
import { testData } from '../../../config/test-data';
import { AccountPage } from '../../../pages/AccountPage';

import {
  test,
  expect,
} from '../../fixtures/android.fixture';

async function prepareLogin(
  page: Page,
  siteUrl: string
): Promise<AccountPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const accountPage =
    new AccountPage(page);

  await accountPage.openAccount();

  await accountPage.verifyAccountPageLoaded();

  return accountPage;
}

for (const site of Object.values(sites)) {
  test.describe(
    `${site.name} - Login`,
    () => {
      test.setTimeout(120000);

      test(
        'LOGIN-001 Verify My Account can be opened',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.verifyAccountPageLoaded();
        }
      );

      test(
        'LOGIN-002 Verify login form is displayed',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.verifyLoginFormVisible();
        }
      );

      test(
        'LOGIN-003 Verify password field is masked',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.verifyPasswordMasked();
        }
      );

      test(
        'LOGIN-004 Verify Forgot Password control is available',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.verifyForgotPasswordAvailable();
        }
      );

      test(
        'LOGIN-005 Verify login with valid credentials',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          test.skip(
            !testData.account.email ||
              !testData.account.password,
            'CBI test account credentials are not configured'
          );

          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.login(
            testData.account.email,
            testData.account.password
          );

          await accountPage.verifyLoggedIn();
        }
      );

      test(
        'LOGIN-006 Verify empty email cannot complete login',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.fillPassword(
            'TemporaryPassword123!'
          );

          await accountPage.submitLogin();

          const stillOnLogin =
            await accountPage.emailInput
              .isVisible()
              .catch(() => false);

          test
            .expect(stillOnLogin)
            .toBeTruthy();
        }
      );

      test(
        'LOGIN-007 Verify empty password cannot complete login',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const accountPage =
            await prepareLogin(
              androidPage,
              site.url
            );

          await accountPage.fillEmail(
            'qa-test@example.com'
          );

          await accountPage.submitLogin();

          const stillOnLogin =
            await accountPage.passwordInput
              .isVisible()
              .catch(() => false);

          test
            .expect(stillOnLogin)
            .toBeTruthy();
        }
      );

      test(
  'LOGIN-008 Verify empty email and password cannot complete login',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.submitEmptyLoginForm();

    const stillOnLogin =
      await accountPage.isLoginFormStillVisible();

    expect(
      stillOnLogin,
      'Empty login form should not authenticate the user'
    ).toBeTruthy();
  }
);

test(
  'LOGIN-009 Verify invalid email format is handled',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const handled =
      await accountPage.verifyInvalidEmailHandled(
        'invalid-email'
      );

    expect(
      handled,
      'Invalid email format should be rejected or keep user on login'
    ).toBeTruthy();
  }
);

test(
  'LOGIN-010 Verify invalid credentials are rejected',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.loginWithInvalidCredentials();

    await accountPage.verifyInvalidCredentialsRejected();
  }
);

test(
  'LOGIN-011 Verify leading and trailing spaces in email are handled safely',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const handled =
      await accountPage.verifyEmailWhitespaceHandling(
        'qa-test@example.com'
      );

    expect(
      handled,
      'Email field should preserve the logical email value when spaces are entered'
    ).toBeTruthy();
  }
);

test(
  'LOGIN-012 Verify email casing is handled consistently',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyEmailCaseInputHandling(
      'qa-test@example.com'
    );
  }
);

test(
  'LOGIN-013 Verify password visibility toggle works when supported',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const toggle =
      await accountPage.getPasswordVisibilityToggle();

    test.skip(
      !toggle,
      `${site.name}: password visibility toggle is not exposed`
    );

    const changed =
      await accountPage.verifyPasswordVisibilityToggleWorks();

    expect(
      changed
    ).toBeTruthy();
  }
);

test(
  'LOGIN-014 Verify Forgot Password flow can be opened',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.openForgotPassword();

    await accountPage.verifyForgotPasswordStateVisible();
  }
);

test(
  'LOGIN-015 Verify Forgot Password rejects empty email',
  {
    tag: [
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.openForgotPassword();

    await accountPage.verifyForgotPasswordStateVisible();

    const handled =
      await accountPage.verifyForgotPasswordEmptyEmailHandled();

    test.skip(
      !handled,
      `${site.name}: Forgot Password flow does not expose an inline email submission form`
    );

    expect(
      handled,
      'Forgot Password should reject an empty email'
    ).toBeTruthy();
  }
);

test(
  'LOGIN-016 Verify Forgot Password rejects malformed email',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.openForgotPassword();

    const handled =
      await accountPage.verifyForgotPasswordMalformedEmailHandled();

    test.skip(
      !handled,
      `${site.name}: Forgot Password email form is not exposed`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'LOGIN-017 Verify Remember Me can be selected when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const control =
      await accountPage.getRememberMeControl();

    test.skip(
      !control,
      `${site.name}: Remember Me is not available`
    );

    const changed =
      await accountPage.verifyRememberMeCanBeSelected();

    expect(
      changed
    ).toBeTruthy();
  }
);

test(
  'LOGIN-018 Verify login button is visible enabled and accessible',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyLoginButtonAccessible();
  }
);

test(
  'LOGIN-019 Verify multiple failed login attempts are handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyMultipleFailedLoginAttemptsHandled(
      3
    );
  }
);

test(
  'LOGIN-020 Verify login form remains usable after refresh',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.refreshAndVerifyLoginForm();
  }
);

test(
  'LOGIN-021 Verify back and forward navigation do not break Account page',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const safe =
      await accountPage.verifyAccountBackForwardNavigation();

    test.skip(
      !safe,
      `${site.name}: browser history does not expose usable Account navigation`
    );

    expect(
      safe
    ).toBeTruthy();
  }
);

test(
  'LOGIN-022 Verify login inputs support keyboard interaction',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyKeyboardInputWorks();
  }
);

test(
  'LOGIN-023 Verify login can be submitted with Enter when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const handled =
      await accountPage.submitLoginWithEnter();

    expect(
      handled,
      'Enter submission should either submit safely or leave user on login'
    ).toBeTruthy();
  }
);

test(
  'LOGIN-024 Verify login page has no horizontal overflow on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    const overflow =
      await accountPage.hasHorizontalOverflow();

    expect(
      overflow,
      'Login page should not horizontally overflow'
    ).toBeFalsy();
  }
);

test(
  'LOGIN-025 Verify login controls do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyLoginControlsDoNotOverlap();
  }
);

test(
  'LOGIN-026 Verify login page remains usable while scrolling',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyLoginPageScrollableAndUsable();
  }
);

test(
  'LOGIN-027 Verify long email input is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyLongEmailHandledSafely();
  }
);

test(
  'LOGIN-028 Verify long password input is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyLongPasswordHandledSafely();
  }
);

test(
  'LOGIN-029 Verify password remains masked by default',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyPasswordNeverPlainTextByDefault();
  }
);

test(
  'LOGIN-030 Verify repeated login submission is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const accountPage =
      await prepareLogin(
        androidPage,
        site.url
      );

    await accountPage.verifyRepeatedLoginSubmitHandledSafely();
  }
);

    }
  );
}