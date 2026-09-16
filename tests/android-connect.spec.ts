import { test, chromium } from '@playwright/test';
import { sites } from '../config/sites';

for (const site of Object.values(sites)) {
  test(`open ${site.name} on real Android device`, async () => {
    test.setTimeout(120000);

    console.log(`Connecting to Android Chrome for ${site.name}...`);

    const browser = await chromium.connectOverCDP(
      'http://127.0.0.1:9222'
    );

    console.log('Connected successfully');

    const contexts = browser.contexts();

    if (contexts.length === 0) {
      throw new Error('No browser context found');
    }

    const context = contexts[0];

    const pages = context.pages();

    const page =
      pages.length > 0
        ? pages[0]
        : await context.newPage();

    console.log(`Opening ${site.name}...`);

    await page.goto(site.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const title = await page.title();

    console.log(`${site.name} title: ${title}`);

    await page.waitForTimeout(3000);

    await browser.close();
  });
}