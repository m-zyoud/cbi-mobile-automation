import { test, chromium } from '@playwright/test';
import { sites } from '../../config/sites';
import { SearchPage } from '../../pages/SearchPage';

test('search on Frontgate using real Android', async () => {
  test.setTimeout(120000);

  const browser = await chromium.connectOverCDP(
    'http://127.0.0.1:9222',
    {
      timeout: 60000,
    }
  );

  const context = browser.contexts()[0];

  const pages = context.pages();

  const page =
    pages.length > 0
      ? pages[0]
      : await context.newPage();

  await page.goto(sites.frontgate.url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const searchPage = new SearchPage(page);

  await searchPage.openSearch();

  await searchPage.searchFor('chair');

  await searchPage.verifyResultsLoaded();

  console.log('Frontgate search completed');

  await browser.close();
});