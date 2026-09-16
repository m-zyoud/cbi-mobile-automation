import { test, chromium } from '@playwright/test';
import { sites } from '../../config/sites';

test('inspect Frontgate search elements', async () => {
  test.setTimeout(120000);

  const browser = await chromium.connectOverCDP(
    'http://127.0.0.1:9222',
    {
      timeout: 60000,
    }
  );

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

  await page.goto(sites.frontgate.url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.waitForTimeout(2000);

  console.log('\n===== INPUTS =====');

  const inputs = await page.locator('input').evaluateAll(elements =>
    elements.map((el, index) => ({
      index,
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      id: el.getAttribute('id'),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
      autocomplete: el.getAttribute('autocomplete'),
      className: el.getAttribute('class'),
    }))
  );

  console.log(JSON.stringify(inputs, null, 2));

  console.log('\n===== SEARCH-RELATED BUTTONS =====');

  const buttons = await page.locator('button').evaluateAll(elements =>
    elements
      .map((el, index) => ({
        index,
        text: el.textContent?.trim(),
        ariaLabel: el.getAttribute('aria-label'),
        title: el.getAttribute('title'),
        className: el.getAttribute('class'),
      }))
      .filter(item =>
        JSON.stringify(item).toLowerCase().includes('search')
      )
  );

  console.log(JSON.stringify(buttons, null, 2));

  await browser.close();
});