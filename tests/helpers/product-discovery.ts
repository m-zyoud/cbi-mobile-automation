import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

import { ProductPage } from '../../pages/ProductPage';
import { SearchPage } from '../../pages/SearchPage';

export type DiscoveredProduct = {
  searchTerm: string;
  productHref: string;
  productLabel: string;
  productUrl: string;
};

type ProductCandidate = {
  href: string;
  label: string;
};

const INVALID_TEXT =
  /logo|frontgate|ballard|garnet hill|grandin road|account|cart|bag|login|log in|sign in|sign up|register|menu|home|shop now|search|new$|sale$|learn|more|discover|customer service|credit card|privacy|order status|wishlist|facebook|instagram|pinterest|youtube|tiktok|contact|help|accessibility|terms|shipping|returns/i;

const INVALID_HREF =
  /account|login|register|customer|privacy|cart|wishlist|facebook|instagram|pinterest|youtube|tiktok|content-path|CustomerService|help|terms|accessibility/i;

const RECOMMENDATION_HREF =
  /isCrossSell=true|recToken=|strategy=|gtmPageName=May(?:%20|\+)We(?:%20|\+)Suggest/i;

function normalizeText(
  value: string
): string {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsableSearchTerm(
  text: string
): boolean {
  const normalized =
    normalizeText(text);

  if (!normalized) {
    return false;
  }

  if (
    normalized.length < 3 ||
    normalized.length > 80
  ) {
    return false;
  }

  if (
    normalized
      .split(/\s+/)
      .length > 12
  ) {
    return false;
  }

  if (
    INVALID_TEXT.test(
      normalized
    )
  ) {
    return false;
  }

  if (
    !/[A-Za-z]/.test(
      normalized
    )
  ) {
    return false;
  }

  return true;
}

function addUniqueTerm(
  terms: string[],
  text: string
): void {
  const normalized =
    normalizeText(text);

  if (
    !isUsableSearchTerm(
      normalized
    )
  ) {
    return;
  }

  const exists =
    terms.some(
      (term) =>
        term.toLowerCase() ===
        normalized.toLowerCase()
    );

  if (!exists) {
    terms.push(normalized);
  }
}

async function collectTextFromLocator(
  locator: Locator,
  terms: string[],
  limit: number
): Promise<void> {
  const count =
    Math.min(
      await locator
        .count()
        .catch(() => 0),
      limit
    );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const item =
      locator.nth(i);

    const visible =
      await item
        .isVisible()
        .catch(() => false);

    if (!visible) {
      continue;
    }

    const text =
      normalizeText(
        await item
          .innerText()
          .catch(() => '')
      );

    addUniqueTerm(
      terms,
      text
    );
  }
}

async function collectLinkTerms(
  locator: Locator,
  terms: string[],
  limit: number
): Promise<void> {
  const count =
    Math.min(
      await locator
        .count()
        .catch(() => 0),
      limit
    );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const link =
      locator.nth(i);

    const visible =
      await link
        .isVisible()
        .catch(() => false);

    if (!visible) {
      continue;
    }

    const href =
      await link
        .getAttribute(
          'href'
        )
        .catch(() => null);

    if (
      !href ||
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
      INVALID_HREF.test(
        href
      )
    ) {
      continue;
    }

    const text =
      normalizeText(
        await link
          .innerText()
          .catch(() => '')
      );

    addUniqueTerm(
      terms,
      text
    );
  }
}

function looksLikeProductHref(
  href: string
): boolean {
  if (
    !href ||
    href === '#' ||
    href === '/'
  ) {
    return false;
  }

  if (
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
    return false;
  }

  if (
    INVALID_HREF.test(
      href
    )
  ) {
    return false;
  }

  if (
    RECOMMENDATION_HREF.test(
      href
    )
  ) {
    return false;
  }

  if (
    /isRecentlyViewed=true|isCrossSell=true|strategy=|gtmPageName=/i.test(
      href
    )
  ) {
    return false;
  }

  return (
    /uniqueId=/i.test(
      href
    ) ||
    /productId=/i.test(
      href
    ) ||
    /product-id=/i.test(
      href
    ) ||
    /\/p\//i.test(
      href
    ) ||
    /\/product\//i.test(
      href
    ) ||
    /\/[^/?]+\/\d{5,}(?:\?|$)/i.test(
      href
    )
  );
}

function normalizeProductUrl(
  href: string,
  baseUrl: string
): string {
  const url =
    new URL(
      href,
      baseUrl
    );

  const removableParams = [
    'recToken',
    'strategy',
    'isCrossSell',
    'gtmPageName',
  ];

  for (
    const param of removableParams
  ) {
    url.searchParams.delete(
      param
    );
  }

  url.hash = '';

  return url.toString();
}

async function extractProductLabel(
  link: Locator
): Promise<string> {
  const candidates = [
    await link
      .innerText()
      .catch(() => ''),
    (await link
      .getAttribute('title')
      .catch(() => null)) ?? '',
    (await link
      .getAttribute('aria-label')
      .catch(() => null)) ?? '',
  ];

  for (
    const candidate of candidates
  ) {
    const normalized =
      normalizeText(candidate);

    if (
      normalized &&
      !/quick shop|view gallery|image link/i.test(
        normalized
      )
    ) {
      return normalized;
    }
  }

  const img =
    link
      .locator('img')
      .first();

  if (
    await img
      .isVisible()
      .catch(() => false)
  ) {
    const alt =
      normalizeText(
        (await img
          .getAttribute('alt')
          .catch(() => null)) ?? ''
      );

    if (
      alt &&
      !/image|photo/i.test(alt)
    ) {
      return alt;
    }
  }

  return '';
}

async function findEligibleProducts(
  page: Page,
  maxProducts = 3
): Promise<ProductCandidate[]> {
  const productLinks =
    page.locator(
      [
        'main a[href*="uniqueId="]',
        '[role="main"] a[href*="uniqueId="]',
        'main a[href*="productId="]',
        '[role="main"] a[href*="productId="]',
        'main a[href*="product-id="]',
        '[role="main"] a[href*="product-id="]',
        'main a[href*="/product/"]',
        '[role="main"] a[href*="/product/"]',
        'main a[href*="/p/"]',
        '[role="main"] a[href*="/p/"]',
        'main a[href]',
        '[role="main"] a[href]',
      ].join(',')
    );

  const count =
    Math.min(
      await productLinks
        .count()
        .catch(() => 0),
      250
    );

  console.log(
    `Link candidates after search: ${count}`
  );

  const products:
    ProductCandidate[] = [];

  for (
    let i = 0;
    i < count;
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
      await link
        .getAttribute(
          'href'
        )
        .catch(() => null);

    if (
      !href ||
      !looksLikeProductHref(
        href
      )
    ) {
      continue;
    }

    if (
      /isRecentlyViewed=true|isCrossSell=true|strategy=|gtmPageName=/i.test(
        href
      )
    ) {
      continue;
    }

    const label =
      await extractProductLabel(
        link
      );

    const normalizedUrl =
      normalizeProductUrl(
        href,
        page.url()
      );

    const duplicate =
      products.some(
        (product) =>
          normalizeProductUrl(
            product.href,
            page.url()
          ) === normalizedUrl
      );

    if (duplicate) {
      continue;
    }

    products.push({
      href,
      label,
    });

    if (
      products.length >=
      maxProducts
    ) {
      break;
    }
  }

  console.log(
    `Eligible product candidates found: ${products.length}`
  );

  return products;
}

async function collectHomepageProductTerms(
  page: Page
): Promise<string[]> {
  console.log(
    'Discovery source 0: visible homepage product names'
  );

  const products =
    await findEligibleProducts(
      page,
      8
    );

  const terms:
    string[] = [];

  for (
    const product of products
  ) {
    if (
      product.label
    ) {
      addUniqueTerm(
        terms,
        product.label
      );
    }
  }

  console.log(
    `Visible product-name terms found: ${terms.length}`
  );

  return terms;
}

async function discoverRuntimeTerms(
  page: Page,
  searchPage: SearchPage
): Promise<string[]> {
  const discoveredTerms:
    string[] = [];

  const homepageProductTerms =
    await collectHomepageProductTerms(
      page
    );

  for (
    const term of homepageProductTerms
  ) {
    addUniqueTerm(
      discoveredTerms,
      term
    );
  }

  console.log(
    'Discovery source 1: header/navigation links'
  );

  await collectLinkTerms(
    page.locator(
      [
        'nav a[href]',
        'header a[href]',
        '[role="navigation"] a[href]',
      ].join(',')
    ),
    discoveredTerms,
    80
  );

  if (
    discoveredTerms.length > 0
  ) {
    console.log(
      `Terms found after navigation scan: ${discoveredTerms.length}`
    );
  }

  if (
    discoveredTerms.length < 12
  ) {
    console.log(
      'Discovery source 2: main/category links'
    );

    await collectLinkTerms(
      page.locator(
        [
          'main a[href]',
          '[role="main"] a[href]',
          'section a[href]',
          'a[href*="category"]',
          'a[href*="catalog"]',
        ].join(',')
      ),
      discoveredTerms,
      120
    );
  }

  if (
    discoveredTerms.length < 12
  ) {
    console.log(
      'Discovery source 3: visible headings'
    );

    await collectTextFromLocator(
      page.locator(
        [
          'main h1',
          'main h2',
          'main h3',
          '[role="main"] h1',
          '[role="main"] h2',
          '[role="main"] h3',
        ].join(',')
      ),
      discoveredTerms,
      60
    );
  }

  if (
    discoveredTerms.length === 0
  ) {
    console.log(
      'Discovery source 4: search suggestions'
    );

    await searchPage
      .openSearch()
      .catch(() => undefined);

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

    const searchVisible =
      await searchInput
        .isVisible()
        .catch(() => false);

    if (searchVisible) {
      await searchInput
        .focus()
        .catch(() => undefined);

      await page.waitForTimeout(
        600
      );

      await collectTextFromLocator(
        page.locator(
          [
            '[role="option"]',
            '[role="listbox"] a',
            '[role="listbox"] button',
            '[class*="suggest" i] a',
            '[class*="suggest" i] button',
            '[class*="autocomplete" i] a',
            '[class*="autocomplete" i] button',
          ].join(',')
        ),
        discoveredTerms,
        40
      );
    }
  }

  if (
    discoveredTerms.length === 0
  ) {
    console.log(
      'Discovery source 5: generic visible links'
    );

    await collectLinkTerms(
      page.locator(
        'body a[href]'
      ),
      discoveredTerms,
      150
    );
  }

  return discoveredTerms;
}

async function isCandidateUsableForPurchase(
  page: Page,
  productUrl: string,
  siteName: string
): Promise<boolean> {
  try {
    console.log(
      `Validating PDP candidate: ${productUrl}`
    );

    await page.goto(
      productUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 20000,
      }
    );

    await page.waitForTimeout(
      700
    );

    const productPage =
      new ProductPage(page);

    await productPage
      .verifyProductPageLoaded();

    const addToCartVisible =
      await productPage
        .addToCartButton
        .isVisible()
        .catch(() => false);

    if (!addToCartVisible) {
      console.log(
        `${siteName}: candidate rejected because Add to Cart is not visible`
      );

      return false;
    }

    const addToCartEnabled =
      !(await productPage
        .addToCartButton
        .isDisabled()
        .catch(() => true));

    if (addToCartEnabled) {
      console.log(
        `${siteName}: candidate is immediately purchasable`
      );

      return true;
    }

    const hasProductOptions =
      await productPage
        .hasRequiredProductOptions()
        .catch(() => false);

    if (
      hasProductOptions
    ) {
      console.log(
        `${siteName}: candidate requires product option selection`
      );

      return true;
    }

    console.log(
      `${siteName}: candidate rejected - Add to Cart is disabled and no selectable product options were found`
    );

    return false;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.log(
      `${siteName}: candidate rejected after PDP validation failure: ${message}`
    );

    return false;
  }
}

async function tryDirectHomepageProducts(
  page: Page,
  siteName: string
): Promise<{
  href: string;
  label: string;
  url: string;
} | null> {
  console.log(
    'Trying direct homepage products before search'
  );

  const baseUrl =
    page.url();

  const products =
    await findEligibleProducts(
      page,
      3
    );

  for (
    let i = 0;
    i < products.length;
    i++
  ) {
    const product =
      products[i];

    const productUrl =
      normalizeProductUrl(
        product.href,
        baseUrl
      );

    console.log(
      `Trying homepage product ${
        i + 1
      }/${products.length}: "${
        product.label ||
        '(image link)'
      }" -> ${productUrl}`
    );

    const usable =
      await isCandidateUsableForPurchase(
        page,
        productUrl,
        siteName
      );

    if (usable) {
      return {
        href:
          product.href,
        label:
          product.label,
        url:
          productUrl,
      };
    }

    await page.goto(
      baseUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 20000,
      }
    );

    await page.waitForTimeout(
      500
    );
  }

  return null;
}

async function waitForSearchResultsReady(
  page: Page,
  searchTerm: string
): Promise<void> {
  const normalizedTerm =
    searchTerm
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  await page.waitForTimeout(
    500
  );

  await expect
    .poll(
      async () => {
        const headingText =
          (
            await page
              .locator(
                'h1, h2, [class*="search" i]'
              )
              .allInnerTexts()
              .catch(() => [])
          )
            .join(' ')
            .replace(/\s+/g, ' ')
            .toLowerCase();

        if (
          headingText.includes(
            normalizedTerm
          )
        ) {
          return true;
        }

        const hrefs =
          await page
            .locator(
              'main a[href]'
            )
            .evaluateAll(
              (links) =>
                links
                  .map(
                    (link) =>
                      link.getAttribute(
                        'href'
                      ) ?? ''
                  )
                  .filter(Boolean)
            )
            .catch(() => []);

        return hrefs.some(
          (href) => {
            try {
              const decoded =
                decodeURIComponent(
                  href
                )
                  .replace(
                    /\+/g,
                    ' '
                  )
                  .toLowerCase();

              return decoded.includes(
                normalizedTerm
              );
            } catch {
              return false;
            }
          }
        );
      },
      {
        timeout: 10000,
        intervals: [
          300,
          500,
          700,
          1000,
        ],
      }
    )
    .toBeTruthy()
    .catch(() => {
      console.log(
        `Search results did not fully synchronize for "${searchTerm}" within timeout`
      );
    });

  await page.waitForTimeout(
    500
  );
}

export async function discoverAndOpenProduct(
  page: Page,
  siteUrl: string,
  siteName: string
): Promise<DiscoveredProduct> {
  const searchPage =
    new SearchPage(page);

  console.log(
    'Discovering runtime product candidates'
  );

  if (
    !page.url().startsWith(
      new URL(siteUrl).origin
    )
  ) {
    await page.goto(
      siteUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 30000,
      }
    );

    await page.waitForTimeout(
      700
    );
  }

  const directProduct =
    await tryDirectHomepageProducts(
      page,
      siteName
    );

  if (directProduct) {
    console.log(
      `${siteName}: direct homepage product selected`
    );

    console.log(
      `Selected product: "${
        directProduct.label ||
        '(product image)'
      }"`
    );

    console.log(
      `Selected PDP URL: ${directProduct.url}`
    );

    return {
      searchTerm:
        directProduct.label ||
        'homepage product',
      productHref:
        directProduct.href,
      productLabel:
        directProduct.label,
      productUrl:
        directProduct.url,
    };
  }

  await page.goto(
    siteUrl,
    {
      waitUntil:
        'domcontentloaded',
      timeout: 30000,
    }
  );

  await page.waitForTimeout(
    700
  );

  console.log(
    'Direct homepage product path did not succeed. Falling back to search.'
  );

  const discoveredTerms =
    await discoverRuntimeTerms(
      page,
      searchPage
    );

  function getSearchTermPriority(
    term: string
  ): number {
    const normalized =
      term
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    /*
     * Never waste discovery attempts on informational/navigation
     * links that are not shopping searches.
     */
    if (
      /^(press features|store details|quick shop|view gallery|design services|order status)$/i.test(
        normalized
      )
    ) {
      return 1000;
    }

    /*
     * Runtime-proven Frontgate terms.
     * "New & Trending" has already returned a directly purchasable PDP.
     */
    /*
     * Strong signals that the term is a concrete product title.
     * Exact product searches can redirect directly to a PDP,
     * so try these before broad categories.
     */
    if (
      /set of|monogrammed|egyptian cotton|coco door mat|world'?s finest|freeze|magnolia wreath|indoor\/outdoor rug/i.test(
        normalized
      )
    ) {
      return 0;
    }

    if (
      normalized ===
      'new & trending'
    ) {
      return 1;
    }

    if (
      normalized ===
      'fall decor'
    ) {
      return 2;
    }

    const wordCount =
      normalized
        .split(/\s+/)
        .filter(Boolean)
        .length;

    if (
      wordCount >= 5
    ) {
      return 3;
    }

    if (
      wordCount >= 4
    ) {
      return 4;
    }

    if (
      wordCount >= 3
    ) {
      return 5;
    }

    if (
      wordCount >= 2
    ) {
      return 6;
    }

    return 7;
  }

  const preferredTerms =
    /frontgate/i.test(
      siteName
    )
      ? [
          'New & Trending',
          'Fall Decor',
          'Holiday Decor & Gifts',
          'Rugs & Pillows',
        ]
      : [];

  const discoveredByLower =
    new Map(
      discoveredTerms.map(
        (term) => [
          term.toLowerCase(),
          term,
        ]
      )
    );

  const prioritizedTerms: string[] = [];

  for (
    const preferred of preferredTerms
  ) {
    const exact =
      discoveredByLower.get(
        preferred.toLowerCase()
      ) ??
      preferred;

    if (
      !prioritizedTerms.some(
        (term) =>
          term.toLowerCase() ===
          exact.toLowerCase()
      )
    ) {
      prioritizedTerms.push(
        exact
      );
    }
  }

  const remainingTerms =
    [...discoveredTerms]
      .filter(
        (term) =>
          !/^(press features|store details|quick shop|view gallery|design services|order status)$/i.test(
            term.trim()
          )
      )
      .filter(
        (term) =>
          !prioritizedTerms.some(
            (existing) =>
              existing.toLowerCase() ===
              term.toLowerCase()
          )
      )
      .sort(
        (a, b) =>
          getSearchTermPriority(a) -
          getSearchTermPriority(b)
      );

  prioritizedTerms.push(
    ...remainingTerms
  );

  console.log(
    'Discovered terms:',
    discoveredTerms
  );

  console.log(
    'Prioritized terms:',
    prioritizedTerms
  );

  if (
    prioritizedTerms.length === 0
  ) {
    throw new Error(
      `${siteName}: no runtime search candidates found after all discovery strategies`
    );
  }

  /*
   * Start the fast-search budget only after homepage/runtime discovery
   * has finished. Slow homepage rendering must not consume the entire
   * product-search budget.
   */
  const discoveryStartedAt =
    Date.now();

  const discoveryDeadlineMs =
    110_000;

  const discoveryExpired = () =>
    Date.now() -
      discoveryStartedAt >=
    discoveryDeadlineMs;

  const termsToTry =
    prioritizedTerms.slice(
      0,
      4
    );

  console.log(
    `Trying up to ${termsToTry.length} fast search terms`
  );

  let selectedProductHref =
    '';

  let selectedProductLabel =
    '';

  let selectedProductUrl =
    '';

  let successfulSearchTerm =
    '';

  for (
    let attempt = 0;
    attempt <
    termsToTry.length;
    attempt++
  ) {
    if (
      discoveryExpired()
    ) {
      console.log(
        'Product discovery deadline reached before the next search attempt'
      );

      break;
    }

    const searchTerm =
      termsToTry[attempt];

    console.log(
      `\nSearch attempt ${
        attempt + 1
      }/${
        termsToTry.length
      }: "${searchTerm}"`
    );

    console.log(
      `Current page before search: ${page.url()}`
    );

    let searchWorked =
      false;

    try {
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
        timeout: 8000,
      });

      await searchInput.fill(
        searchTerm
      );

      await searchInput.press(
        'Enter'
      );

      await page
        .waitForLoadState(
          'domcontentloaded',
          {
            timeout: 10000,
          }
        )
        .catch(
          () => undefined
        );

      await page.waitForTimeout(
        700
      );

      searchWorked =
        /ProductSearch2/i.test(
          page.url()
        );
    } catch {
      searchWorked =
        false;
    }

    if (!searchWorked) {
      console.log(
        `UI search did not navigate for "${searchTerm}". Using direct search-results fallback.`
      );

      const directSearchUrl =
        new URL(
          '/ProductSearch2',
          siteUrl
        );

      directSearchUrl.searchParams.set(
        'searchTerm',
        searchTerm
      );

      await page.goto(
        directSearchUrl.toString(),
        {
          waitUntil:
            'domcontentloaded',
          timeout: 20000,
        }
      );

      await page.waitForTimeout(
        700
      );
    }

    console.log(
      `Search URL: ${page.url()}`
    );

    const configuredSiteUrl =
      new URL(siteUrl);

    const currentSearchUrl =
      new URL(page.url());

    if (
      currentSearchUrl.hostname !==
      configuredSiteUrl.hostname
    ) {
      console.log(
        `Search escaped configured environment (${currentSearchUrl.hostname}). Recovering to ${configuredSiteUrl.hostname}.`
      );

      const recoveryUrl =
        new URL(
          '/ProductSearch2',
          configuredSiteUrl.origin
        );

      recoveryUrl.searchParams.set(
        'searchTerm',
        searchTerm
      );

      const bypassToken =
        configuredSiteUrl.searchParams.get(
          'aka_bypass'
        );

      if (bypassToken) {
        recoveryUrl.searchParams.set(
          'aka_bypass',
          bypassToken
        );
      }

      await page.goto(
        recoveryUrl.toString(),
        {
          waitUntil:
            'domcontentloaded',
          timeout: 15000,
        }
      );

      await page.waitForTimeout(
        500
      );

      console.log(
        `Recovered search URL: ${page.url()}`
      );
    }

    if (
      /ProductSearch2/i.test(
        page.url()
      )
    ) {
      await waitForSearchResultsReady(
        page,
        searchTerm
      );
    }

    /*
     * CBI can redirect an exact search term directly to a PDP
     * instead of rendering ProductSearch2. Treat that as a valid
     * discovery result instead of scanning PDP/recommendation links
     * as though they were search results.
     */
    const landedUrl =
      page.url();

    if (
      !/ProductSearch2/i.test(
        landedUrl
      )
    ) {
      if (
        !looksLikeProductHref(
          landedUrl
        )
      ) {
        console.log(
          `Search resolved to a non-product page (${landedUrl}). Skipping it instead of validating it as PDP.`
        );

        continue;
      }

      console.log(
        `Search resolved directly to a PDP. Validating current page: ${landedUrl}`
      );

      const usableDirectPdp =
        await isCandidateUsableForPurchase(
          page,
          landedUrl,
          siteName
        );

      if (usableDirectPdp) {
        const directLabel =
          normalizeText(
            await page
              .locator('h1')
              .first()
              .innerText()
              .catch(
                () => searchTerm
              )
          ) ||
          searchTerm;

        selectedProductHref =
          landedUrl;

        selectedProductLabel =
          directLabel;

        selectedProductUrl =
          landedUrl;

        successfulSearchTerm =
          searchTerm;

        console.log(
          `Direct PDP selected from search term: "${searchTerm}"`
        );

        console.log(
          `Selected product: "${directLabel}"`
        );

        console.log(
          `Selected PDP URL: ${landedUrl}`
        );

        break;
      }

      console.log(
        `Directly resolved page was not purchasable for "${searchTerm}". Trying next search term...`
      );

      continue;
    }

    const searchHeading =
      page.getByRole(
        'heading',
        {
          name:
            /search results|search/i,
        }
      );

    const headingVisible =
      await searchHeading
        .first()
        .isVisible()
        .catch(() => false);

    if (headingVisible) {
      const heading =
        normalizeText(
          await searchHeading
            .first()
            .innerText()
            .catch(() => '')
        );

      if (heading) {
        console.log(
          `Search heading: ${heading}`
        );
      }
    }

    const searchResultsUrl =
      page.url();

    const products =
      await findEligibleProducts(
        page,
        2
      );

    if (
      products.length === 0
    ) {
      console.log(
        `No eligible product found for "${searchTerm}". Trying next candidate...`
      );

      continue;
    }

    for (
      let productIndex = 0;
      productIndex <
      products.length;
      productIndex++
    ) {
      if (
        discoveryExpired()
      ) {
        console.log(
          'Product discovery deadline reached during PDP validation'
        );

        break;
      }

      const product =
        products[productIndex];

      const productUrl =
        normalizeProductUrl(
          product.href,
          searchResultsUrl
        );

      console.log(
        `Trying product candidate ${
          productIndex + 1
        }/${
          products.length
        }: "${
          product.label ||
          '(image link)'
        }" -> ${productUrl}`
      );

      const usable =
        await isCandidateUsableForPurchase(
          page,
          productUrl,
          siteName
        );

      if (!usable) {
        continue;
      }

      selectedProductHref =
        product.href;

      selectedProductLabel =
        product.label;

      selectedProductUrl =
        productUrl;

      successfulSearchTerm =
        searchTerm;

      break;
    }

    if (
      selectedProductUrl
    ) {
      break;
    }

    console.log(
      `No purchasable PDP candidate found for "${searchTerm}". Trying next search term...`
    );
  }

  if (
    !selectedProductUrl
  ) {
    throw new Error(
      `${siteName}: none of the dynamically discovered products were usable for the E2E purchase flow`
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

  console.log(
    `Selected PDP URL: ${selectedProductUrl}`
  );

  if (
    page.url() !==
    selectedProductUrl
  ) {
    await page.goto(
      selectedProductUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 20000,
      }
    );

    await page.waitForTimeout(
      700
    );
  }

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
    productUrl:
      selectedProductUrl,
  };
}
