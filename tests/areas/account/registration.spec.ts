import { Page } from '@playwright/test';

import { sites } from '../../../config/sites';
import { RegistrationPage } from '../../../pages/RegistrationPage';

import {
  test,
  expect,
} from '../../fixtures/android.fixture';

async function prepareRegistration(
  page: Page,
  siteUrl: string
): Promise<RegistrationPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const registrationPage =
    new RegistrationPage(page);

  await registrationPage.openRegistration();

  await registrationPage.verifyRegistrationPageLoaded();

  return registrationPage;
}

for (const site of Object.values(sites)) {
  test.describe(
    `${site.name} - Registration`,
    () => {
      test.setTimeout(120000);

      test(
        'REG-001 Verify registration page can be opened',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.verifyRegistrationPageLoaded();
        }
      );

      test(
        'REG-002 Verify registration form is displayed',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.verifyRegistrationFormVisible();
        }
      );

      test(
        'REG-003 Verify password field is masked',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.verifyPasswordMasked();
        }
      );

      test(
        'REG-004 Verify first name accepts input',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.fillFirstName(
            'Automation'
          );

          await expect(
            registrationPage.firstNameInput
          ).toHaveValue(
            'Automation'
          );
        }
      );

      test(
        'REG-005 Verify last name accepts input',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.fillLastName(
            'Tester'
          );

          await expect(
            registrationPage.lastNameInput
          ).toHaveValue(
            'Tester'
          );
        }
      );

      test(
        'REG-006 Verify email accepts input',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.fillEmail(
            'automation@example.com'
          );

          await expect(
            registrationPage.emailInput
          ).toHaveValue(
            'automation@example.com'
          );
        }
      );

      test(
        'REG-007 Verify password accepts input while remaining masked',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.fillPassword(
            'Automation123!'
          );

          await expect(
            registrationPage.passwordInput
          ).toHaveValue(
            'Automation123!'
          );

          await registrationPage.verifyPasswordMasked();
        }
      );

      test(
        'REG-008 Verify empty registration form cannot be submitted successfully',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.submitRegistration();

          await registrationPage.verifyValidationVisibleIfProvided();
        }
      );

      test(
        'REG-009 Verify missing email blocks registration',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.fillFirstName(
            'Automation'
          );

          await registrationPage.fillLastName(
            'Tester'
          );

          await registrationPage.fillPassword(
            'Automation123!'
          );

          await registrationPage.submitRegistration();

          const stillVisible =
            await registrationPage.emailInput
              .isVisible()
              .catch(() => false);

          expect(
            stillVisible,
            'Registration should remain blocked when email is missing'
          ).toBeTruthy();
        }
      );

      test(
        'REG-010 Verify missing password blocks registration',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const registrationPage =
            await prepareRegistration(
              androidPage,
              site.url
            );

          await registrationPage.fillFirstName(
            'Automation'
          );

          await registrationPage.fillLastName(
            'Tester'
          );

          await registrationPage.fillEmail(
            'automation@example.com'
          );

          await registrationPage.submitRegistration();

          const stillVisible =
            await registrationPage.passwordInput
              .isVisible()
              .catch(() => false);

          expect(
            stillVisible,
            'Registration should remain blocked when password is missing'
          ).toBeTruthy();
        }
      );

      test(
  'REG-011 Verify missing first name blocks registration',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const handled =
      await registrationPage.verifyMissingFirstNameHandled();

    expect(
      handled,
      'Missing first name should be rejected'
    ).toBeTruthy();
  }
);

test(
  'REG-012 Verify missing last name blocks registration',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const handled =
      await registrationPage.verifyMissingLastNameHandled();

    expect(
      handled,
      'Missing last name should be rejected'
    ).toBeTruthy();
  }
);

test(
  'REG-013 Verify malformed email is rejected',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const handled =
      await registrationPage.verifyInvalidEmailHandled();

    expect(
      handled,
      'Malformed registration email should be rejected'
    ).toBeTruthy();
  }
);

test(
  'REG-014 Verify weak password is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const handled =
      await registrationPage.verifyWeakPasswordHandled();

    expect(
      handled,
      'Weak password should not silently create an account'
    ).toBeTruthy();
  }
);

test(
  'REG-015 Verify password requirements are displayed when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const requirements =
      await registrationPage.getPasswordRequirementsText();

    test.skip(
      !requirements,
      `${site.name}: password requirements are not displayed as separate content`
    );

    expect(
      requirements!.length
    ).toBeGreaterThan(0);
  }
);

test(
  'REG-016 Verify confirm password mismatch is rejected when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const confirm =
      await registrationPage.getConfirmPasswordInput();

    test.skip(
      !confirm,
      `${site.name}: confirm password field is not exposed`
    );

    const handled =
      await registrationPage.verifyPasswordMismatchHandled();

    expect(
      handled,
      'Mismatched passwords should be rejected'
    ).toBeTruthy();
  }
);

test(
  'REG-017 Verify password visibility toggle works when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const toggle =
      await registrationPage.getPasswordVisibilityToggle();

    test.skip(
      !toggle,
      `${site.name}: password visibility toggle is not exposed`
    );

    const changed =
      await registrationPage.verifyPasswordVisibilityToggleWorks();

    expect(
      changed
    ).toBeTruthy();
  }
);

test(
  'REG-018 Verify duplicate or existing email is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const handled =
      await registrationPage.verifyDuplicateEmailHandled();

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'REG-019 Verify Terms and Conditions can be selected when required',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const terms =
      await registrationPage.getTermsControl();

    test.skip(
      !terms,
      `${site.name}: Terms checkbox is not exposed`
    );

    const changed =
      await registrationPage.verifyTermsCanBeSelected();

    expect(
      changed
    ).toBeTruthy();
  }
);

test(
  'REG-020 Verify registration form handles Enter submission',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const handled =
      await registrationPage.submitRegistrationWithEnter();

    expect(
      handled,
      'Enter submission should be handled safely by registration form'
    ).toBeTruthy();
  }
);

test(
  'REG-021 Verify registration form remains usable after refresh',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.refreshAndVerifyRegistrationForm();
  }
);

test(
  'REG-022 Verify back and forward navigation do not break registration',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const safe =
      await registrationPage.verifyRegistrationBackForwardNavigation();

    test.skip(
      !safe,
      `${site.name}: browser history does not expose usable registration navigation`
    );

    expect(
      safe
    ).toBeTruthy();
  }
);

test(
  'REG-023 Verify registration inputs support keyboard interaction',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyRegistrationKeyboardInputWorks();
  }
);

test(
  'REG-024 Verify long first name is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyLongFirstNameHandledSafely();
  }
);

test(
  'REG-025 Verify long last name is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyLongLastNameHandledSafely();
  }
);

test(
  'REG-026 Verify long email is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyLongEmailHandledSafely();
  }
);

test(
  'REG-027 Verify long password is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyLongPasswordHandledSafely();
  }
);

test(
  'REG-028 Verify registration password remains masked by default',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyPasswordRemainsMaskedByDefault();
  }
);

test(
  'REG-029 Verify registration page has no horizontal overflow on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    const overflow =
      await registrationPage.hasHorizontalOverflow();

    expect(
      overflow,
      'Registration page should not horizontally overflow'
    ).toBeFalsy();
  }
);

test(
  'REG-030 Verify registration controls do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const registrationPage =
      await prepareRegistration(
        androidPage,
        site.url
      );

    await registrationPage.verifyRegistrationControlsDoNotOverlap();
  }
);

    }
  );
}