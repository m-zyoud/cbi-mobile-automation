import { test, chromium } from '@playwright/test';
import { sites } from './config/sites';

test('seed real Android Chrome environment', async () => {
  test.setTimeout(120000);

  console.log('Connecting to real Android Chrome...');

  const browser = await chromium.connectOverCDP(
    'http://127.0.0.1:9222',
    {
      timeout: 60000,
    }
  );

  const contexts = browser.contexts();

  if (contexts.length === 0) {
    throw new Error('No Android Chrome browser context found');
  }

  const context = contexts[0];

  const pages = context.pages();

  const page =
    pages.length > 0
      ? pages[0]
      : await context.newPage();

  console.log('Opening Frontgate as seed environment...');

  await page.goto(sites.frontgate.url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  console.log('Seed page title:', await page.title());

  await page.waitForTimeout(2000);

  await browser.close();
});