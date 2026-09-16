import { test, chromium } from '@playwright/test';

import { sites } from '../../config/sites';
import { testData } from '../../config/test-data';
import { RegistrationPage } from '../../pages/RegistrationPage';

for (const site of Object.values(sites)) {
  test(`${site.name} registration regression`, async () => {
    test.setTimeout(120000);

    const browser = await chromium.connectOverCDP(
      'http://127.0.0.1:9222',
      {
        timeout: 60000,
      }
    );

    const context = browser.contexts()[0];

    if (!context) {
      throw new Error('No browser context found');
    }

    const pages = context.pages();

    const page =
      pages.length > 0
        ? pages[0]
        : await context.newPage();

    await page.goto(site.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const registrationPage = new RegistrationPage(page);

    await test.step('Open registration page', async () => {
      await registrationPage.openRegistration();

      await registrationPage.verifyRegistrationPageLoaded();
    });

    await test.step('Fill registration form', async () => {
      await registrationPage.fillRegistrationForm(
        testData.registration
      );
    });

    await test.step('Submit registration', async () => {
      await registrationPage.submitRegistration();
    });

    await test.step('Verify registration result', async () => {
      await registrationPage.verifyRegistrationResult();
    });

    await browser.close();
  });
}