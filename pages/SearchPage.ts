import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class SearchPage {
  readonly page: Page;

  readonly searchButton: Locator;

  readonly searchInput: Locator;

  readonly searchHeading: Locator;

  readonly productLinks: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchButton = page
      .locator(
        [
          'button.t-header__universal-search-btn',
          'button[aria-label*="search" i]',
          'button:has-text("What can we help you find?")',
          '[data-testid*="search" i]',
        ].join(',')
      )
      .first();

    this.searchInput = page
      .locator(
        [
          'input[type="search"]',
          'input[name*="search" i]',
          'input[id*="search" i]',
          'input[placeholder*="search" i]',
          'input[placeholder*="find" i]',
        ].join(',')
      )
      .filter({
        visible: true,
      })
      .first();

    this.searchHeading = page
      .getByRole('heading', {
        name: /search results/i,
      })
      .first();

    this.productLinks = page.locator(
      [
        'a[href*="uniqueId="]',
        'main a[href]',
      ].join(',')
    );
  }

  async openSearch(): Promise<void> {
    await expect(
      this.searchButton,
      'Search control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await this.searchButton.click();

    await expect(
      this.searchInput,
      'Search input should be visible after opening search'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async searchFor(
    term: string
  ): Promise<void> {
    await this.openSearch();

    await this.searchInput.fill(term);

    await this.searchInput.press('Enter');

    await this.page.waitForLoadState(
      'domcontentloaded'
    );
  }

  async submitRawQuery(
    term: string
  ): Promise<void> {
    await this.openSearch();

    await this.searchInput.fill(term);

    await this.searchInput.press('Enter');

    await this.page.waitForLoadState(
      'domcontentloaded'
    );
  }

  async verifyResultsLoaded(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible();

    const hasHeading =
      await this.searchHeading
        .isVisible()
        .catch(() => false);

    const productCount =
      await this.getEligibleProductCount();

    expect(
      hasHeading || productCount > 0,
      'Search results page should show either a search heading or eligible products'
    ).toBeTruthy();
  }

  async getSearchHeadingText(): Promise<
    string | null
  > {
    if (
      !(await this.searchHeading
        .isVisible()
        .catch(() => false))
    ) {
      return null;
    }

    return (
      await this.searchHeading.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
  }

  async verifySearchTermInResults(
    term: string
  ): Promise<void> {
    const heading =
      await this.getSearchHeadingText();

    if (heading) {
      expect(
        heading.toLowerCase()
      ).toContain(
        term.toLowerCase()
      );

      return;
    }

    const bodyText = (
      await this.page
        .locator('body')
        .innerText()
    ).toLowerCase();

    expect(
      bodyText
    ).toContain(
      term.toLowerCase()
    );
  }

  async getEligibleProductCount(): Promise<number> {
    const count = Math.min(
      await this.productLinks.count(),
      250
    );

    let eligibleCount = 0;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const link =
        this.productLinks.nth(i);

      if (
        !(await link
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const href =
        await link.getAttribute('href');

      if (!href) {
        continue;
      }

      if (
        this.isEligibleProductHref(
          href
        )
      ) {
        eligibleCount++;
      }
    }

    return eligibleCount;
  }

  async getFirstEligibleProduct(): Promise<{
    href: string;
    label: string;
  } | null> {
    const count = Math.min(
      await this.productLinks.count(),
      250
    );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const link =
        this.productLinks.nth(i);

      if (
        !(await link
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const href =
        await link.getAttribute('href');

      if (!href) {
        continue;
      }

      if (
        !this.isEligibleProductHref(
          href
        )
      ) {
        continue;
      }

      const label = (
        await link
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      return {
        href,
        label,
      };
    }

    return null;
  }

  async getEligibleProductLabels(): Promise<
    string[]
  > {
    const count = Math.min(
      await this.productLinks.count(),
      100
    );

    const labels: string[] = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const link =
        this.productLinks.nth(i);

      if (
        !(await link
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const href =
        await link.getAttribute('href');

      if (
        !href ||
        !this.isEligibleProductHref(
          href
        )
      ) {
        continue;
      }

      const label = (
        await link
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (label) {
        labels.push(label);
      }
    }

    return labels;
  }

  async openFirstEligibleProduct(): Promise<void> {
    const product =
      await this.getFirstEligibleProduct();

    if (!product) {
      throw new Error(
        'No eligible product link found in search results'
      );
    }

    const destination =
      new URL(
        product.href,
        this.page.url()
      ).toString();

    await this.page.goto(
      destination,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 60000,
      }
    );
  }

  async discoverSearchTerms(): Promise<string[]> {
    const navLinks =
      this.page.locator(
        'nav a[href], header a[href]'
      );

    const count = Math.min(
      await navLinks.count(),
      60
    );

    const terms: string[] = [];

    const invalidTerms =
      /logo|frontgate|ballard|garnet hill|grandin road|account|cart|login|sign in|sign up|menu|home|shop now|search|new$|sale$|learn|more|discover|customer service|credit card|privacy|order status/i;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const link =
        navLinks.nth(i);

      if (
        !(await link
          .isVisible()
          .catch(() => false))
      ) {
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
        text.split(/\s+/).length >
        5
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
        terms.some(
          (term) =>
            term.toLowerCase() ===
            text.toLowerCase()
        );

      if (!duplicate) {
        terms.push(text);
      }
    }

    return terms;
  }

  async findWorkingSearchTerm(
    siteUrl: string
  ): Promise<{
    term: string;
    productHref: string;
    productLabel: string;
  }> {
    const discoveredTerms =
      await this.discoverSearchTerms();

    if (
      discoveredTerms.length ===
      0
    ) {
      throw new Error(
        'No runtime search candidates found'
      );
    }

    const termsToTry =
      discoveredTerms.slice(
        0,
        10
      );

    for (
      let attempt = 0;
      attempt <
      termsToTry.length;
      attempt++
    ) {
      const term =
        termsToTry[attempt];

      await this.searchFor(term);

      const product =
        await this.getFirstEligibleProduct();

      if (product) {
        return {
          term,
          productHref:
            product.href,
          productLabel:
            product.label,
        };
      }

      await this.page.goto(
        siteUrl,
        {
          waitUntil:
            'domcontentloaded',
          timeout: 60000,
        }
      );
    }

    throw new Error(
      'No discovered search term returned an eligible product'
    );
  }

  // SEARCH-007
  async verifyRelevantSearchResults(
    term: string
  ): Promise<void> {
    const productCount =
      await this.getEligibleProductCount();

    expect(
      productCount,
      `Search "${term}" should return at least one eligible product`
    ).toBeGreaterThan(0);

    const heading =
      await this.getSearchHeadingText();

    if (
      heading &&
      heading
        .toLowerCase()
        .includes(
          term.toLowerCase()
        )
    ) {
      return;
    }

    const labels =
      await this.getEligibleProductLabels();

    const normalizedTerm =
      term
        .toLowerCase()
        .trim();

    const words =
      normalizedTerm
        .split(/\s+/)
        .filter(
          (word) =>
            word.length >= 3
        );

    const relevant =
      labels.some((label) => {
        const normalizedLabel =
          label.toLowerCase();

        return (
          normalizedLabel.includes(
            normalizedTerm
          ) ||
          words.some(
            (word) =>
              normalizedLabel.includes(
                word
              )
          )
        );
      });

    expect(
      relevant,
      `Search results should contain content relevant to "${term}"`
    ).toBeTruthy();
  }

  // SEARCH-008
  async createPartialSearchTerm(
    term: string
  ): Promise<string | null> {
    const normalized =
      term.trim();

    if (
      normalized.length < 5
    ) {
      return null;
    }

    const firstWord =
      normalized.split(/\s+/)[0];

    if (
      firstWord.length >= 5
    ) {
      return firstWord.slice(
        0,
        Math.max(
          4,
          firstWord.length - 2
        )
      );
    }

    return normalized.slice(
      0,
      Math.max(
        4,
        normalized.length - 2
      )
    );
  }

  // SEARCH-009
  async verifyCaseInsensitiveSearch(
    term: string,
    siteUrl: string
  ): Promise<void> {
    const lower =
      term.toLowerCase();

    const upper =
      term.toUpperCase();

    await this.searchFor(lower);

    const lowerCount =
      await this.getEligibleProductCount();

    expect(
      lowerCount,
      `Lowercase search "${lower}" should return products`
    ).toBeGreaterThan(0);

    await this.page.goto(
      siteUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 60000,
      }
    );

    await this.searchFor(upper);

    const upperCount =
      await this.getEligibleProductCount();

    expect(
      upperCount,
      `Uppercase search "${upper}" should return products`
    ).toBeGreaterThan(0);
  }

  // SEARCH-010 / SEARCH-011
  async verifyQueryHandledSafely(
    query: string
  ): Promise<void> {
    await this.submitRawQuery(
      query
    );

    await this.verifyPageDidNotCrash();

    const hasResults =
      (await this.getEligibleProductCount()) >
      0;

    const hasNoResults =
      await this.hasNoResultsState();

    const hasHeading =
      await this.searchHeading
        .isVisible()
        .catch(() => false);

    expect(
      hasResults ||
        hasNoResults ||
        hasHeading,
      `Search query "${query}" should be handled safely`
    ).toBeTruthy();
  }

  // SEARCH-012
  async searchForGuaranteedUnknownTerm(): Promise<string> {
    const term =
      `zzzzautomationnoresult${Date.now()}`;

    await this.searchFor(term);

    return term;
  }

  async hasNoResultsState(): Promise<boolean> {
    const noResults = this.page
      .locator(
        [
          '[class*="no-results" i]',
          '[class*="noresult" i]',
          '[data-testid*="no-results" i]',
          '[data-testid*="empty" i]',
        ].join(',')
      )
      .first();

    if (
      await noResults
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }

    const message =
      this.page
        .getByText(
          /no results|no products|nothing found|didn't find|did not find|0 results|we couldn't find/i
        )
        .first();

    if (
      await message
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }

    const count =
      await this.getEligibleProductCount();

    return count === 0;
  }

  async verifyNoResultsState(): Promise<void> {
    const noResults =
      await this.hasNoResultsState();

    expect(
      noResults,
      'Unknown search term should show a no-results state'
    ).toBeTruthy();
  }

  // SEARCH-013 / SEARCH-014
  async verifyEmptyOrWhitespaceSearchHandled(
    query: string
  ): Promise<void> {
    await this.submitRawQuery(
      query
    );

    await this.verifyPageDidNotCrash();

    const bodyVisible =
      await this.page
        .locator('body')
        .isVisible();

    expect(
      bodyVisible
    ).toBeTruthy();
  }

  // SEARCH-015
  async verifySpecialCharacterSearchHandled(): Promise<void> {
    await this.submitRawQuery(
      '!@#$%^&*()'
    );

    await this.verifyPageDidNotCrash();

    const bodyVisible =
      await this.page
        .locator('body')
        .isVisible();

    expect(
      bodyVisible
    ).toBeTruthy();
  }

  // SEARCH-016
  async verifyNumericSearchHandled(
    query = '12345'
  ): Promise<void> {
    await this.submitRawQuery(
      query
    );

    await this.verifyPageDidNotCrash();

    const hasResults =
      (await this.getEligibleProductCount()) >
      0;

    const hasNoResults =
      await this.hasNoResultsState();

    const hasHeading =
      await this.searchHeading
        .isVisible()
        .catch(() => false);

    expect(
      hasResults ||
        hasNoResults ||
        hasHeading,
      'Numeric search should be handled safely'
    ).toBeTruthy();
  }

  async getSuggestionCount(): Promise<number> {
  const suggestions = this.page.locator(
    [
      '[role="option"]:visible',
      '[role="listbox"] [role="option"]:visible',
      '[class*="suggestion" i]:visible',
      '[class*="autocomplete" i] li:visible',
      '[data-testid*="suggestion" i]:visible',
    ].join(',')
  );

  return suggestions.count();
}

async openSearchAndType(
  term: string
): Promise<void> {
  await this.openSearch();

  await this.searchInput.fill(term);

  await this.page.waitForTimeout(500);
}

async getFirstSuggestion(): Promise<Locator | null> {
  const suggestion = this.page
    .locator(
      [
        '[role="option"]:visible',
        '[role="listbox"] [role="option"]:visible',
        '[class*="suggestion" i]:visible',
        '[class*="autocomplete" i] li:visible',
        '[data-testid*="suggestion" i]:visible',
      ].join(',')
    )
    .first();

  if (
    await suggestion
      .isVisible()
      .catch(() => false)
  ) {
    return suggestion;
  }

  return null;
}

async selectFirstSuggestion(): Promise<boolean> {
  const suggestion =
    await this.getFirstSuggestion();

  if (!suggestion) {
    return false;
  }

  await suggestion.click();

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  return true;
}

async getSuggestionTexts(): Promise<string[]> {
  const suggestions = this.page.locator(
    [
      '[role="option"]:visible',
      '[role="listbox"] [role="option"]:visible',
      '[class*="suggestion" i]:visible',
      '[class*="autocomplete" i] li:visible',
      '[data-testid*="suggestion" i]:visible',
    ].join(',')
  );

  const count = Math.min(
    await suggestions.count(),
    20
  );

  const texts: string[] = [];

  for (let i = 0; i < count; i++) {
    const text = (
      await suggestions
        .nth(i)
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (text) {
      texts.push(text);
    }
  }

  return texts;
}

async getFirstProductCard(): Promise<Locator | null> {
  const product = await this.getFirstEligibleProduct();

  if (!product) {
    return null;
  }

  const link = this.page
    .locator(`a[href="${product.href}"]`)
    .first();

  if (
    await link
      .isVisible()
      .catch(() => false)
  ) {
    return link.locator(
      'xpath=ancestor::*[self::article or contains(@class,"product")][1]'
    );
  }

  return null;
}

async verifyFirstResultImageVisible(): Promise<void> {
  const product =
    await this.getFirstEligibleProduct();

  if (!product) {
    throw new Error(
      'No eligible search result found'
    );
  }

  const link = this.page
    .locator(`a[href="${product.href}"]`)
    .first();

  const container = link.locator(
    'xpath=ancestor::*[self::article or contains(@class,"product")][1]'
  );

  const image = container
    .locator('img')
    .first();

  await expect(
    image,
    'Search result should display a product image'
  ).toBeVisible();
}

async verifyFirstResultNameVisible(): Promise<void> {
  const product =
    await this.getFirstEligibleProduct();

  if (!product) {
    throw new Error(
      'No eligible search result found'
    );
  }

  expect(
    product.label,
    'Search result product name should not be empty'
  ).not.toBe('');
}

async verifyFirstResultPriceVisible(): Promise<void> {
  const product =
    await this.getFirstEligibleProduct();

  if (!product) {
    throw new Error(
      'No eligible search result found'
    );
  }

  const link = this.page
    .locator(`a[href="${product.href}"]`)
    .first();

  const container = link.locator(
    'xpath=ancestor::*[self::article or contains(@class,"product")][1]'
  );

  const price = container
    .locator(
      [
        '[class*="price" i]',
        '[data-testid*="price" i]',
        '[aria-label*="price" i]',
      ].join(',')
    )
    .first();

  await expect(
    price,
    'Search result should display a price'
  ).toBeVisible();

  const text = (
    await price
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  expect(text).not.toBe('');
}

async getDisplayedResultCount(): Promise<number | null> {
  const countElement = this.page
    .locator(
      [
        '[class*="result-count" i]',
        '[class*="results-count" i]',
        '[data-testid*="result-count" i]',
      ].join(',')
    )
    .first();

  if (
    !(await countElement
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const text = (
    await countElement.innerText()
  )
    .replace(/\s+/g, ' ')
    .trim();

  const match = text.match(/\d+/);

  if (!match) {
    return null;
  }

  return Number(match[0]);
}

async getEligibleProductIdentifiers(): Promise<string[]> {
  const count = Math.min(
    await this.productLinks.count(),
    250
  );

  const identifiers: string[] = [];

  for (let i = 0; i < count; i++) {
    const link =
      this.productLinks.nth(i);

    if (
      !(await link
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const href =
      await link.getAttribute('href');

    if (
      !href ||
      !this.isEligibleProductHref(href)
    ) {
      continue;
    }

    const absolute =
      new URL(
        href,
        this.page.url()
      ).toString();

    identifiers.push(absolute);
  }

  return identifiers;
}

async loadMoreResultsIfAvailable(): Promise<{
  supported: boolean;
  before: number;
  after: number;
}> {
  const before =
    await this.getEligibleProductCount();

  const loadMore = this.page
    .getByRole('button', {
      name:
        /load more|show more|view more|more results/i,
    })
    .first();

  if (
    !(await loadMore
      .isVisible()
      .catch(() => false))
  ) {
    return {
      supported: false,
      before,
      after: before,
    };
  }

  await loadMore.click();

  await this.page.waitForTimeout(1000);

  const after =
    await this.getEligibleProductCount();

  return {
    supported: true,
    before,
    after,
  };
}

async getCurrentSearchValue(): Promise<string> {
  if (
    !(await this.searchInput
      .isVisible()
      .catch(() => false))
  ) {
    return '';
  }

  return this.searchInput.inputValue();
}

async verifySearchQueryPersisted(
  expected: string
): Promise<boolean> {
  const value =
    await this.getCurrentSearchValue();

  if (!value) {
    return false;
  }

  return (
    value.trim().toLowerCase() ===
    expected.trim().toLowerCase()
  );
}

async verifyBackNavigationToSearchResults(): Promise<void> {
  const product =
    await this.getFirstEligibleProduct();

  if (!product) {
    throw new Error(
      'No eligible product available for back-navigation validation'
    );
  }

  const searchUrl =
    this.page.url();

  await this.openFirstEligibleProduct();

  expect(
    this.page.url()
  ).not.toBe(searchUrl);

  await this.page.goBack({
    waitUntil: 'domcontentloaded',
  });

  expect(
    this.page.url(),
    'Back navigation should return to search results'
  ).toBe(searchUrl);

  await this.verifyResultsLoaded();
}

async refreshSearchResults(): Promise<void> {
  await this.page.reload({
    waitUntil: 'domcontentloaded',
  });

  await this.verifyPageDidNotCrash();

  await this.verifyResultsLoaded();
}

async searchUrlContainsQuery(
  term: string
): Promise<boolean> {
  const url =
    decodeURIComponent(
      this.page.url()
    ).toLowerCase();

  const normalized =
    term
      .trim()
      .toLowerCase();

  return url.includes(normalized);
}

async replaceCurrentSearch(
  term: string
): Promise<void> {
  await this.openSearch();

  await this.searchInput.fill('');

  await this.searchInput.fill(term);

  await this.searchInput.press(
    'Enter'
  );

  await this.page.waitForLoadState(
    'domcontentloaded'
  );
}

async getSearchSortControl(): Promise<Locator | null> {
  const sort = this.page
    .locator(
      [
        'select[name*="sort" i]:visible',
        'select[id*="sort" i]:visible',
        'button[aria-label*="sort" i]:visible',
        'button:has-text("Sort"):visible',
        '[data-testid*="sort" i]:visible',
      ].join(',')
    )
    .first();

  if (
    await sort
      .isVisible()
      .catch(() => false)
  ) {
    return sort;
  }

  return null;
}

async interactWithSearchSort(): Promise<boolean> {
  const sort =
    await this.getSearchSortControl();

  if (!sort) {
    return false;
  }

  const tag =
    await sort.evaluate(
      (element) =>
        element.tagName.toLowerCase()
    );

  if (tag === 'select') {
    const options =
      sort.locator('option');

    const count =
      await options.count();

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const option =
        options.nth(i);

      const value =
        (await option.getAttribute(
          'value'
        )) ?? '';

      const disabled =
        await option
          .isDisabled()
          .catch(() => false);

      if (
        !value ||
        disabled
      ) {
        continue;
      }

      await sort.selectOption(value);

      return true;
    }

    return false;
  }

  await sort.click();

  return true;
}

async getSearchFilterControl(): Promise<Locator | null> {
  const filter = this.page
    .locator(
      [
        'button[aria-label*="filter" i]:visible',
        'button:has-text("Filter"):visible',
        '[data-testid*="filter" i]:visible',
      ].join(',')
    )
    .first();

  if (
    await filter
      .isVisible()
      .catch(() => false)
  ) {
    return filter;
  }

  return null;
}

async interactWithSearchFilter(): Promise<boolean> {
  const filter =
    await this.getSearchFilterControl();

  if (!filter) {
    return false;
  }

  await filter.click();

  const filterUi = this.page
    .locator(
      [
        '[role="dialog"]:visible',
        '[class*="filter" i]:visible',
        '[data-testid*="filter" i]:visible',
      ].join(',')
    )
    .first();

  return filterUi
    .isVisible()
    .catch(() => false);
}

async clearSearchInput(): Promise<void> {
  await this.openSearch();

  await this.searchInput.fill('');

  await expect(
    this.searchInput
  ).toHaveValue('');
}

async closeSearchIfPossible(): Promise<boolean> {
  const close = this.page
    .locator(
      [
        'button[aria-label*="close" i]:visible',
        'button:has-text("Close"):visible',
        '[data-testid*="close" i]:visible',
      ].join(',')
    )
    .first();

  if (
    !(await close
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await close.click();

  return true;
}

async reopenSearchAfterClose(): Promise<boolean> {
  await this.openSearch();

  const closed =
    await this.closeSearchIfPossible();

  if (!closed) {
    return false;
  }

  await this.openSearch();

  return this.searchInput
    .isVisible()
    .catch(() => false);
}

async submitSearchRepeatedly(
  term: string
): Promise<void> {
  await this.openSearch();

  await this.searchInput.fill(term);

  await this.searchInput.press(
    'Enter'
  );

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  await this.verifyPageDidNotCrash();
}

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

async verifySearchCardsDoNotOverlap(): Promise<void> {
  const identifiers =
    await this.getEligibleProductIdentifiers();

  expect(
    identifiers.length
  ).toBeGreaterThan(0);

  const cards: Locator[] = [];

  for (
    const identifier of identifiers.slice(
      0,
      20
    )
  ) {
    const url =
      new URL(identifier);

    const relative =
      `${url.pathname}${url.search}`;

    const link = this.page
      .locator(
        `a[href="${relative}"], a[href="${identifier}"]`
      )
      .first();

    const card = link.locator(
      'xpath=ancestor::*[self::article or contains(@class,"product")][1]'
    );

    if (
      await card
        .isVisible()
        .catch(() => false)
    ) {
      cards.push(card);
    }
  }

  for (
    let i = 0;
    i < cards.length;
    i++
  ) {
    const first =
      await cards[i].boundingBox();

    if (!first) {
      continue;
    }

    for (
      let j = i + 1;
      j < cards.length;
      j++
    ) {
      const second =
        await cards[j].boundingBox();

      if (!second) {
        continue;
      }

      const horizontalOverlap =
        Math.min(
          first.x + first.width,
          second.x + second.width
        ) -
        Math.max(
          first.x,
          second.x
        );

      const verticalOverlap =
        Math.min(
          first.y + first.height,
          second.y + second.height
        ) -
        Math.max(
          first.y,
          second.y
        );

      const overlapping =
        horizontalOverlap > 5 &&
        verticalOverlap > 5;

      expect(
        overlapping,
        `Search result cards ${i} and ${j} should not overlap`
      ).toBeFalsy();
    }
  }
}

async scrollThroughSearchResults(): Promise<void> {
  const before =
    await this.page.evaluate(
      () => window.scrollY
    );

  await this.page.evaluate(() => {
    window.scrollTo(
      0,
      document.body.scrollHeight
    );
  });

  await this.page.waitForTimeout(
    500
  );

  const after =
    await this.page.evaluate(
      () => window.scrollY
    );

  expect(
    after
  ).toBeGreaterThanOrEqual(
    before
  );

  await this.verifyPageDidNotCrash();
}

async verifySearchUsableAfterBackFromPDP(): Promise<void> {
  const searchUrl =
    this.page.url();

  await this.openFirstEligibleProduct();

  await this.page.goBack({
    waitUntil: 'domcontentloaded',
  });

  expect(
    this.page.url()
  ).toBe(searchUrl);

  await this.verifyResultsLoaded();
}

async getCurrentViewport(): Promise<{
  width: number;
  height: number;
}> {
  return this.page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
}

  private async verifyPageDidNotCrash(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible();

    const bodyText = (
      await this.page
        .locator('body')
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    expect(
      bodyText,
      'Page should render content after Search submission'
    ).not.toBe('');

    expect(
      bodyText
    ).not.toMatch(
      /internal server error|application error|stack trace|uncaught exception/i
    );
  }

  private isEligibleProductHref(
    href: string
  ): boolean {
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
      return false;
    }

    if (
      /account|login|register|customer|privacy|cart|wishlist|facebook|instagram|pinterest|content-path|CustomerService/i.test(
        href
      )
    ) {
      return false;
    }

    return (
      /uniqueId=/i.test(
        href
      ) ||
      /\/\d{5,}(?:\?|$)/.test(
        href
      )
    );
  }
}