import {
  expect,
  Page,
} from '@playwright/test';

import { SearchPage } from '../../pages/SearchPage';

export type DiscoveredProduct = {
  searchTerm: string;
  productHref: string;
  productLabel: string;
  productUrl: string;
};

export async function discoverAndOpenProduct(
  page: Page,
  siteUrl: string,
  siteName: string
): Promise<DiscoveredProduct> {
  const searchPage =
    new SearchPage(page);

  console.log(
    'Discovering runtime search candidates'
  );

  const navLinks =
    page.locator(
      'nav a[href], header a[href]'
    );

  const navCount =
    Math.min(
      await navLinks.count(),
      60
    );

  const discoveredTerms:
    string[] = [];

  const invalidTerms =
    /logo|frontgate|ballard|garnet hill|grandin road|account|cart|login|sign in|sign up|menu|home|shop now|search|new$|sale$|learn|more|discover|customer service|credit card|privacy|order status/i;

  for (
    let i = 0;
    i < navCount;
    i++
  ) {
    const link =
      navLinks.nth(i);

    const visible =
      await link
        .isVisible()
        .catch(() => false);

    if (!visible) {
      continue;
    }

    const text = (
      await link
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    const href =
      await link.getAttribute(
        'href'
      );

    if (
      !href ||
      href === '#' ||
      href === '/' ||
      !text
    ) {
      continue;
    }

    if (
      invalidTerms.test(text)
    ) {
      continue;
    }

    if (
      text.length < 4 ||
      text.length > 40
    ) {
      continue;
    }

    if (
      text.split(/\s+/).length > 5
    ) {
      continue;
    }

    if (
      !/^[A-Za-z][A-Za-z0-9 &'/-]+$/.test(
        text
      )
    ) {
      continue;
    }

    const duplicate =
      discoveredTerms.some(
        (term) =>
          term.toLowerCase() ===
          text.toLowerCase()
      );

    if (!duplicate) {
      discoveredTerms.push(text);
    }
  }

  console.log(
    'Discovered terms:',
    discoveredTerms
  );

  if (
    discoveredTerms.length === 0
  ) {
    throw new Error(
      `${siteName}: no runtime search candidates found`
    );
  }

  const termsToTry =
    discoveredTerms.slice(0, 10);

  console.log(
    `Trying up to ${termsToTry.length} search terms`
  );

  let selectedProductHref = '';
  let selectedProductLabel = '';
  let successfulSearchTerm = '';

  for (
    let attempt = 0;
    attempt < termsToTry.length;
    attempt++
  ) {
    const searchTerm =
      termsToTry[attempt];

    console.log(
      `\nSearch attempt ${
        attempt + 1
      }/${
        termsToTry.length
      }: "${searchTerm}"`
    );

    await searchPage.openSearch();

    const searchInput =
      page
        .locator(
          [
            'input[type="search"]',
            'input[name*="search" i]',
            'input[id*="search" i]',
            'input[placeholder*="search" i]',
            'input[placeholder*="find" i]',
          ].join(',')
        )
        .first();

    await expect(
      searchInput
    ).toBeVisible({
      timeout: 10000,
    });

    await searchInput.fill(
      searchTerm
    );

    await searchInput.press(
      'Enter'
    );

    await page.waitForLoadState(
      'domcontentloaded'
    );

    console.log(
      `Search URL: ${page.url()}`
    );

    await page.waitForTimeout(
      3000
    );

    const searchHeading =
      page.getByRole(
        'heading',
        {
          name:
            /search results/i,
        }
      );

    const headingVisible =
      await searchHeading
        .first()
        .isVisible()
        .catch(() => false);

    if (headingVisible) {
      const heading = (
        await searchHeading
          .first()
          .innerText()
          .catch(() => '')
      ).trim();

      console.log(
        `Search heading: ${heading}`
      );
    }

    const productLinks =
      page.locator(
        [
          'a[href*="uniqueId="]',
          'main a[href]',
        ].join(',')
      );

    const productLinkCount =
      Math.min(
        await productLinks.count(),
        250
      );

    console.log(
      `Link candidates after search: ${productLinkCount}`
    );

    for (
      let i = 0;
      i < productLinkCount;
      i++
    ) {
      const link =
        productLinks.nth(i);

      const visible =
        await link
          .isVisible()
          .catch(() => false);

      if (!visible) {
        continue;
      }

      const href =
        await link.getAttribute(
          'href'
        );

      if (!href) {
        continue;
      }

      const label = (
        await link
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        href === '#' ||
        href === '/' ||
        href.startsWith(
          'javascript:'
        ) ||
        href.startsWith(
          'mailto:'
        ) ||
        href.startsWith(
          'tel:'
        )
      ) {
        continue;
      }

      if (
        /account|login|register|customer|privacy|cart|wishlist|facebook|instagram|pinterest|content-path|CustomerService/i.test(
          href
        )
      ) {
        continue;
      }

      const looksLikeProduct =
        /uniqueId=/i.test(
          href
        ) ||
        /\/\d{5,}(?:\?|$)/.test(
          href
        );

      if (!looksLikeProduct) {
        continue;
      }

      selectedProductHref =
        href;

      selectedProductLabel =
        label;

      successfulSearchTerm =
        searchTerm;

      console.log(
        `Product found: "${
          label || '(image link)'
        }" -> ${href}`
      );

      break;
    }

    if (selectedProductHref) {
      break;
    }

    console.log(
      `No product found for "${searchTerm}". Trying next candidate...`
    );

    await page.goto(
      siteUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 60000,
      }
    );

    await page.waitForTimeout(
      1500
    );
  }

  if (!selectedProductHref) {
    throw new Error(
      `${siteName}: none of the dynamically discovered search terms returned an eligible product`
    );
  }

  console.log(
    `Successful search term: "${successfulSearchTerm}"`
  );

  console.log(
    `Selected product: "${
      selectedProductLabel ||
      '(product image)'
    }"`
  );

  const productUrl =
    new URL(
      selectedProductHref,
      page.url()
    ).toString();

  console.log(
    `Opening PDP: ${productUrl}`
  );

  await page.goto(
    productUrl,
    {
      waitUntil:
        'domcontentloaded',
      timeout: 60000,
    }
  );

  await page.waitForTimeout(
    1500
  );

  console.log(
    `PDP URL: ${page.url()}`
  );

  return {
    searchTerm:
      successfulSearchTerm,
    productHref:
      selectedProductHref,
    productLabel:
      selectedProductLabel,
    productUrl,
  };
}
