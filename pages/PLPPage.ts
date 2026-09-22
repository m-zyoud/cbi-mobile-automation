import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class PLPPage {
  readonly page: Page;

  readonly productCards: Locator;
  readonly productLinks: Locator;
  readonly sortControl: Locator;
  readonly filterControl: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productCards = page.locator(
      [
        '[class*="product-card" i]',
        '[class*="product-tile" i]',
        '[data-testid*="product" i]',
      ].join(',')
    );

    this.productLinks = page.locator(
      [
        'a[href*="/product/" i]',
        'a[href*="/p/" i]',
        '[class*="product-card" i] a[href]',
        '[class*="product-tile" i] a[href]',
      ].join(',')
    );

    this.sortControl = page
      .locator(
        [
          'select[name*="sort" i]',
          'select[id*="sort" i]',
          'button:has-text("Sort")',
          '[aria-label*="sort" i]',
          '[data-testid*="sort" i]',
        ].join(',')
      )
      .first();

    this.filterControl = page
      .locator(
        [
          'button:has-text("Filter")',
          '[aria-label*="filter" i]',
          '[data-testid*="filter" i]',
        ].join(',')
      )
      .first();

    this.breadcrumb = page
      .locator(
        [
          'nav[aria-label*="breadcrumb" i]',
          '[class*="breadcrumb" i]',
          '[data-testid*="breadcrumb" i]',
        ].join(',')
      )
      .first();
  }

  async openFirstAvailableCategory(): Promise<void> {
    /*
     * The current page may already be a PLP.
     */
    if (await this.hasProducts()) {
      return;
    }

    const startingUrl =
      this.page.url();

    /*
     * Strategy 1:
     * Try currently visible desktop/tablet navigation links.
     */
    const desktopLinks =
      this.page.locator(
        [
          'nav a[href]:visible',
          'header a[href]:visible',
          'a[href*="category" i]:visible',
          '[class*="category" i] a[href]:visible',
        ].join(',')
      );

    const desktopCandidates =
      await this.collectCategoryCandidates(
        desktopLinks
      );

    if (
      await this.tryCategoryCandidates(
        desktopCandidates
      )
    ) {
      return;
    }

    /*
     * Return to the starting page before trying
     * the mobile navigation.
     */
    if (
      this.page.url() !== startingUrl
    ) {
      await this.page.goto(
        startingUrl,
        {
          waitUntil:
            'domcontentloaded',
          timeout: 60000,
        }
      );
    }

    /*
     * Strategy 2:
     * Open the mobile / hamburger menu.
     */
    const menuButton =
      this.page
        .locator(
          [
            'button[aria-label*="menu" i]:visible',
            'button[title*="menu" i]:visible',
            'button[data-testid*="menu" i]:visible',
            '[data-testid*="menu" i] button:visible',
            'button[class*="menu" i]:visible',
            'button[class*="hamburger" i]:visible',
            '[aria-controls*="menu" i]:visible',
            '[aria-controls*="navigation" i]:visible',
          ].join(',')
        )
        .first();

    if (
      await menuButton
        .isVisible()
        .catch(() => false)
    ) {
      await menuButton.click();

      await this.page.waitForTimeout(
        500
      );

      const mobileLinks =
        this.page.locator(
          [
            'nav a[href]:visible',
            '[role="navigation"] a[href]:visible',
            '[class*="menu" i] a[href]:visible',
            '[class*="nav" i] a[href]:visible',
            '[class*="drawer" i] a[href]:visible',
            '[class*="mobile" i] a[href]:visible',
          ].join(',')
        );

      const mobileCandidates =
        await this.collectCategoryCandidates(
          mobileLinks
        );

      if (
        await this.tryCategoryCandidates(
          mobileCandidates
        )
      ) {
        return;
      }
    }

    /*
     * Strategy 3:
     * Generic same-origin fallback.
     *
     * Do not hard-code a category URL. Inspect real links from
     * the current brand and try links that can lead to a PLP.
     */
    if (
      this.page.url() !== startingUrl
    ) {
      await this.page.goto(
        startingUrl,
        {
          waitUntil:
            'domcontentloaded',
          timeout: 60000,
        }
      );
    }

    const allLinks =
      this.page.locator(
        'a[href]'
      );

    const fallbackCandidates =
      await this.collectCategoryCandidates(
        allLinks
      );

    if (
      await this.tryCategoryCandidates(
        fallbackCandidates
      )
    ) {
      return;
    }

    const diagnostic =
      fallbackCandidates
        .slice(0, 10)
        .map(
          (url) => {
            try {
              return new URL(url).pathname;
            } catch {
              return url;
            }
          }
        )
        .join(', ');

    throw new Error(
      [
        'Unable to discover a valid PLP from the current site navigation.',
        `Start URL: ${startingUrl}`,
        `Candidate links discovered: ${fallbackCandidates.length}`,
        `Sample candidates: ${diagnostic || 'none'}`,
      ].join('\n')
    );
  }

  async verifyPLPLoaded(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible();

    await this.page.waitForTimeout(
      500
    );

    const hasProducts =
      await this.hasProducts();

    expect(
      hasProducts,
      'PLP should contain at least one visible product'
    ).toBeTruthy();
  }

  async hasProducts(): Promise<boolean> {
    const cardCount =
      await this.productCards.count();

    for (
      let i = 0;
      i < Math.min(cardCount, 20);
      i++
    ) {
      if (
        await this.productCards
          .nth(i)
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
    }

    /*
     * Some CBI mobile layouts may not expose one of the exact
     * product-card classes above, while still exposing real PDP links.
     */
    const linkCount =
      await this.productLinks.count();

    for (
      let i = 0;
      i < Math.min(linkCount, 30);
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
        await link.getAttribute(
          'href'
        );

      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith(
          'javascript:'
        )
      ) {
        return true;
      }
    }

    return false;
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async verifyBreadcrumbVisible(): Promise<void> {
    await expect(
      this.breadcrumb
    ).toBeVisible();
  }

  async verifyProductImages(): Promise<void> {
    const firstCard =
      this.productCards.first();

    await expect(
      firstCard
    ).toBeVisible();

    const image =
      firstCard.locator('img').first();

    await expect(
      image
    ).toBeVisible();

    const src =
      await image.getAttribute('src');

    expect(src).toBeTruthy();
  }

  async verifyProductNames(): Promise<void> {
    const firstCard =
      this.productCards.first();

    const productName = firstCard
      .locator(
        [
          '[class*="name" i]',
          '[class*="title" i]',
          '[data-testid*="name" i]',
          '[data-testid*="title" i]',
          'h2',
          'h3',
          'a',
        ].join(',')
      )
      .first();

    await expect(
      productName
    ).toBeVisible();

    const text = (
      await productName.textContent()
    )?.trim();

    expect(text).toBeTruthy();
  }

  async verifyProductPrices(): Promise<void> {
    const prices =
      await this.getVisibleProductPrices();

    expect(
      prices.length,
      'At least one valid product price should be detected'
    ).toBeGreaterThan(0);
  }

  async getVisibleProductPrices(): Promise<number[]> {
    const cardCount = Math.min(
      await this.productCards.count(),
      30
    );

    const prices: number[] = [];

    for (
      let i = 0;
      i < cardCount;
      i++
    ) {
      const card =
        this.productCards.nth(i);

      if (
        !(await card
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const priceLocator = card
        .locator(
          [
            '[class*="price" i]',
            '[data-testid*="price" i]',
            '[aria-label*="price" i]',
          ].join(',')
        )
        .first();

      if (
        !(await priceLocator
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const text = (
        await priceLocator
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      const price =
        this.extractPrice(text);

      if (price !== null) {
        prices.push(price);
      }
    }

    return prices;
  }

  async sortLowToHigh(): Promise<void> {
    await this.selectSortOption(
      /price.*low.*high|low.*high|ascending/i
    );
  }

  async sortHighToLow(): Promise<void> {
    await this.selectSortOption(
      /price.*high.*low|high.*low|descending/i
    );
  }

  async verifyPricesAscending(): Promise<void> {
    const prices =
      await this.getVisibleProductPrices();

    expect(
      prices.length,
      'Need at least two prices to validate ascending sorting'
    ).toBeGreaterThan(1);

    const sorted = [...prices].sort(
      (a, b) => a - b
    );

    expect(prices).toEqual(sorted);
  }

  async verifyPricesDescending(): Promise<void> {
    const prices =
      await this.getVisibleProductPrices();

    expect(
      prices.length,
      'Need at least two prices to validate descending sorting'
    ).toBeGreaterThan(1);

    const sorted = [...prices].sort(
      (a, b) => b - a
    );

    expect(prices).toEqual(sorted);
  }

  async verifySortSelectionActive(
    expected: RegExp
  ): Promise<void> {
    const tagName =
      await this.sortControl.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tagName === 'select') {
      const selectedText =
        await this.sortControl
          .locator('option:checked')
          .innerText();

      expect(
        selectedText
      ).toMatch(expected);

      return;
    }

    const text = (
      await this.sortControl
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    const ariaLabel =
      (await this.sortControl.getAttribute(
        'aria-label'
      )) ?? '';

    expect(
      `${text} ${ariaLabel}`
    ).toMatch(expected);
  }

  async openFilterDrawer(): Promise<void> {
    await expect(
      this.filterControl,
      'Filter control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await this.filterControl.click();

    const drawer =
      this.getFilterDrawer();

    await expect(
      drawer,
      'Filter drawer should become visible'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async applyFirstAvailableFilter(): Promise<void> {
    await this.openFilterDrawer();

    const drawer =
      this.getFilterDrawer();

    const checkboxes =
      drawer.locator(
        [
          'input[type="checkbox"]:not([disabled])',
          '[role="checkbox"]:not([aria-disabled="true"])',
        ].join(',')
      );

    const checkboxCount =
      await checkboxes.count();

    for (
      let i = 0;
      i < checkboxCount;
      i++
    ) {
      const checkbox =
        checkboxes.nth(i);

      if (
        !(await checkbox
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const checked =
        (await checkbox
          .isChecked()
          .catch(() => false)) ||
        (await checkbox.getAttribute(
          'aria-checked'
        )) === 'true';

      if (checked) {
        continue;
      }

      await checkbox.click();

      await this.applyFilterChangesIfNeeded();

      await this.verifyFilterApplied(
        checkbox
      );

      return;
    }

    const buttons =
      drawer.locator(
        [
          'button:not([disabled])',
          '[role="radio"]:not([aria-disabled="true"])',
        ].join(',')
      );

    const buttonCount =
      Math.min(
        await buttons.count(),
        50
      );

    for (
      let i = 0;
      i < buttonCount;
      i++
    ) {
      const button =
        buttons.nth(i);

      if (
        !(await button
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const text = (
        await button
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        !text ||
        /apply|clear|close|cancel|done|filter/i.test(
          text
        )
      ) {
        continue;
      }

      await button.click();

      await this.applyFilterChangesIfNeeded();

      return;
    }

    throw new Error(
      'No usable filter option was found'
    );
  }

  async verifySortAvailable(): Promise<void> {
    await expect(
      this.sortControl
    ).toBeVisible();
  }

  async verifyFilterAvailable(): Promise<void> {
    await expect(
      this.filterControl
    ).toBeVisible();
  }

  async openFirstVisibleProduct(): Promise<void> {
    const count =
      await this.productLinks.count();

    if (count === 0) {
      throw new Error(
        'No product links found on PLP'
      );
    }

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const product =
        this.productLinks.nth(i);

      if (
        !(await product
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const href =
        await product.getAttribute('href');

      if (!href) {
        continue;
      }

      await product.click();

      await this.page.waitForLoadState(
        'domcontentloaded'
      );

      return;
    }

    throw new Error(
      'No visible product link found on PLP'
    );
  }

  private async collectCategoryCandidates(
    links: Locator
  ): Promise<string[]> {
    const count = Math.min(
      await links.count(),
      250
    );

    const currentUrl =
      new URL(
        this.page.url()
      );

    const results: string[] = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const link =
        links.nth(i);

      const href =
        await link
          .getAttribute('href')
          .catch(() => null);

      if (
        !href ||
        href === '#' ||
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

      let url: URL;

      try {
        url =
          new URL(
            href,
            currentUrl
          );
      } catch {
        continue;
      }

      /*
       * Stay inside the current brand.
       */
      if (
        url.origin !==
        currentUrl.origin
      ) {
        continue;
      }

      const path =
        url.pathname.toLowerCase();

      /*
       * Exclude clearly non-category areas.
       */
      if (
        /\/(cart|checkout|account|login|signin|register|wishlist|search|customer-service|help|contact|privacy|terms)(\/|$)/i.test(
          path
        )
      ) {
        continue;
      }

      /*
       * Avoid rediscovering the homepage.
       */
      if (
        path === '/' ||
        path === ''
      ) {
        continue;
      }

      /*
       * PDP URLs are not category candidates.
       */
      if (
        /\/product\/|\/p\//i.test(
          path
        )
      ) {
        continue;
      }

      const absolute =
        url.toString();

      if (
        !results.includes(
          absolute
        )
      ) {
        results.push(
          absolute
        );
      }
    }

    return results;
  }

  private async tryCategoryCandidates(
    candidates: string[]
  ): Promise<boolean> {
    /*
     * We only need the first real PLP, so limit exploration.
     */
    const urls =
      candidates.slice(
        0,
        40
      );

    for (const url of urls) {
      try {
        await this.page.goto(
          url,
          {
            waitUntil:
              'domcontentloaded',
            timeout: 30000,
          }
        );

        await this.page.waitForTimeout(
          400
        );

        if (
          await this.hasProducts()
        ) {
          return true;
        }
      } catch {
        /*
         * One bad navigation candidate should not prevent
         * discovery of the remaining categories.
         */
        continue;
      }
    }

    return false;
  }

  private async selectSortOption(
    optionText: RegExp
  ): Promise<void> {
    await expect(
      this.sortControl,
      'Sort control should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    const tagName =
      await this.sortControl.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tagName === 'select') {
      const options =
        this.sortControl.locator(
          'option'
        );

      const count =
        await options.count();

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const option =
          options.nth(i);

        const text = (
          await option
            .innerText()
            .catch(() => '')
        )
          .replace(/\s+/g, ' ')
          .trim();

        if (!optionText.test(text)) {
          continue;
        }

        const value =
          await option.getAttribute(
            'value'
          );

        if (!value) {
          continue;
        }

        await this.sortControl.selectOption(
          value
        );

        await this.waitForPLPUpdate();

        return;
      }

      throw new Error(
        `No matching sort option found for ${optionText}`
      );
    }

    await this.sortControl.click();

    const option = this.page
      .locator(
        [
          '[role="option"]:visible',
          '[role="menuitem"]:visible',
          'button:visible',
          'li:visible',
        ].join(',')
      )
      .filter({
        hasText: optionText,
      })
      .first();

    await expect(
      option,
      `Sort option ${optionText} should be visible`
    ).toBeVisible({
      timeout: 10000,
    });

    await option.click();

    await this.waitForPLPUpdate();
  }

  private getFilterDrawer(): Locator {
    return this.page
      .locator(
        [
          '[role="dialog"]:visible',
          '[class*="filter-drawer" i]:visible',
          '[class*="filter-panel" i]:visible',
          '[class*="filter-modal" i]:visible',
          '[data-testid*="filter" i]:visible',
          'aside[class*="filter" i]:visible',
        ].join(',')
      )
      .first();
  }

  private async applyFilterChangesIfNeeded(): Promise<void> {
    const drawer =
      this.getFilterDrawer();

    const applyButton = drawer
      .getByRole('button', {
        name:
          /apply|apply filters|view results|show results|done/i,
      })
      .first();

    if (
      await applyButton
        .isVisible()
        .catch(() => false)
    ) {
      await applyButton.click();
    }

    await this.waitForPLPUpdate();
  }

  private async verifyFilterApplied(
    control: Locator
  ): Promise<void> {
    const checked =
      (await control
        .isChecked()
        .catch(() => false)) ||
      (await control.getAttribute(
        'aria-checked'
      )) === 'true';

    /*
     * Some mobile drawers close after Apply,
     * causing the original control to detach.
     * If still attached, verify its state.
     */
    if (
      await control
        .isVisible()
        .catch(() => false)
    ) {
      expect(
        checked,
        'Selected filter should remain active'
      ).toBeTruthy();
    }

    await expect(
      this.page.locator('body')
    ).toBeVisible();
  }

  private async waitForPLPUpdate(): Promise<void> {
    await this.page
      .waitForLoadState(
        'domcontentloaded',
        {
          timeout: 10000,
        }
      )
      .catch(() => undefined);

    await expect(
      this.productCards.first()
    ).toBeVisible({
      timeout: 15000,
    });
  }

  private extractPrice(
    text: string
  ): number | null {
    /*
     * Take the first currency-looking numeric value.
     * Handles examples such as:
     * $1,299.00
     * $49.95
     * 99.00
     */
    const match =
      text.match(
        /(?:\$|USD\s*)?([\d,]+(?:\.\d{1,2})?)/
      );

    if (!match) {
      return null;
    }

    const value =
      Number(
        match[1].replace(/,/g, '')
      );

    if (Number.isNaN(value)) {
      return null;
    }

    return value;
  }

  async applyMultipleFilters(
  requiredCount = 2
): Promise<string[]> {
  const selectedLabels: string[] = [];

  for (
    let selectionIndex = 0;
    selectionIndex < requiredCount;
    selectionIndex++
  ) {
    const drawerVisible =
      await this.getFilterDrawer()
        .isVisible()
        .catch(() => false);

    if (!drawerVisible) {
      await this.openFilterDrawer();
    }

    const drawer =
      this.getFilterDrawer();

    const controls =
      drawer.locator(
        [
          'input[type="checkbox"]:not([disabled])',
          '[role="checkbox"]:not([aria-disabled="true"])',
        ].join(',')
      );

    const count =
      await controls.count();

    let selected = false;

    for (let i = 0; i < count; i++) {
      const control =
        controls.nth(i);

      if (
        !(await control
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const checked =
        (await control
          .isChecked()
          .catch(() => false)) ||
        (await control.getAttribute(
          'aria-checked'
        )) === 'true';

      if (checked) {
        continue;
      }

      const label =
        await this.getFilterControlLabel(
          control
        );

      await control.click();

      selectedLabels.push(
        label || `filter-${selectionIndex + 1}`
      );

      selected = true;

      break;
    }

    if (!selected) {
      throw new Error(
        `Unable to select filter ${selectionIndex + 1} of ${requiredCount}`
      );
    }
  }

  await this.applyFilterChangesIfNeeded();

  return selectedLabels;
}

async getSelectedFilterCount(): Promise<number> {
  const checkedInputs =
    this.page.locator(
      [
        'input[type="checkbox"]:checked',
        '[role="checkbox"][aria-checked="true"]',
      ].join(',')
    );

  return checkedInputs.count();
}

async removeOneAppliedFilter(): Promise<void> {
  const chips =
    this.page.locator(
      [
        'button[aria-label*="remove" i][aria-label*="filter" i]:visible',
        '[class*="filter-chip" i] button:visible',
        '[class*="facet-chip" i] button:visible',
        '[class*="applied-filter" i] button:visible',
      ].join(',')
    );

  if (
    await chips
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await chips.first().click();

    await this.waitForPLPUpdate();

    return;
  }

  await this.openFilterDrawer();

  const drawer =
    this.getFilterDrawer();

  const checked =
    drawer.locator(
      [
        'input[type="checkbox"]:checked',
        '[role="checkbox"][aria-checked="true"]',
      ].join(',')
    );

  const count =
    await checked.count();

  if (count === 0) {
    throw new Error(
      'No applied filter was found to remove'
    );
  }

  await checked.first().click();

  await this.applyFilterChangesIfNeeded();
}

async clearAllFilters(): Promise<void> {
  const visibleClear = this.page
    .getByRole('button', {
      name:
        /clear all|clear filters|reset filters|reset/i,
    })
    .first();

  if (
    await visibleClear
      .isVisible()
      .catch(() => false)
  ) {
    await visibleClear.click();

    await this.waitForPLPUpdate();

    return;
  }

  const drawerVisible =
    await this.getFilterDrawer()
      .isVisible()
      .catch(() => false);

  if (!drawerVisible) {
    await this.openFilterDrawer();
  }

  const drawer =
    this.getFilterDrawer();

  const clearButton = drawer
    .getByRole('button', {
      name:
        /clear all|clear filters|reset filters|reset/i,
    })
    .first();

  await expect(
    clearButton,
    'Clear All filters control should be visible'
  ).toBeVisible({
    timeout: 10000,
  });

  await clearButton.click();

  await this.waitForPLPUpdate();
}

async verifyNoResultsState(): Promise<void> {
  const emptyState =
    this.page
      .locator(
        [
          '[class*="no-results" i]',
          '[class*="empty" i]',
          '[data-testid*="no-results" i]',
          '[data-testid*="empty" i]',
        ].join(',')
      )
      .filter({
        hasText:
          /no products|no results|nothing found|0 results|no items/i,
      })
      .first();

  await expect(
    emptyState,
    'A user-friendly no-results state should be displayed'
  ).toBeVisible({
    timeout: 10000,
  });
}

async loadMoreProductsIfAvailable(): Promise<{
  before: number;
  after: number;
}> {
  const before =
    await this.getProductCount();

  const loadMore = this.page
    .getByRole('button', {
      name:
        /load more|show more|view more/i,
    })
    .first();

  if (
    await loadMore
      .isVisible()
      .catch(() => false)
  ) {
    await loadMore.scrollIntoViewIfNeeded();

    await loadMore.click();

    await this.page.waitForFunction(
      (previousCount) => {
        const selectors = [
          '[class*="product-card" i]',
          '[class*="product-tile" i]',
          '[data-testid*="product" i]',
        ];

        const current =
          document.querySelectorAll(
            selectors.join(',')
          ).length;

        return current > previousCount;
      },
      before,
      {
        timeout: 15000,
      }
    );

    return {
      before,
      after:
        await this.getProductCount(),
    };
  }

  const nextPage = this.page
    .locator(
      [
        'a[aria-label*="next" i]:visible',
        'button[aria-label*="next" i]:visible',
        'a[rel="next"]:visible',
      ].join(',')
    )
    .first();

  if (
    await nextPage
      .isVisible()
      .catch(() => false)
  ) {
    await nextPage.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    );

    return {
      before,
      after:
        await this.getProductCount(),
    };
  }

  throw new Error(
    'PLP does not expose Load More or pagination on the current category'
  );
}

async verifyBackNavigationToPLP(): Promise<void> {
  const plpUrl =
    this.page.url();

  await this.openFirstVisibleProduct();

  expect(
    this.page.url()
  ).not.toBe(plpUrl);

  await this.page.goBack({
    waitUntil: 'domcontentloaded',
  });

  expect(
    this.page.url()
  ).toBe(plpUrl);

  await this.verifyPLPLoaded();
}

async getVisibleSwatchCount(): Promise<number> {
  const swatches =
    this.productCards.locator(
      [
        '[class*="swatch" i] button:visible',
        '[class*="swatch" i] [role="radio"]:visible',
        '[class*="color" i] button:visible',
        '[data-testid*="swatch" i]:visible',
      ].join(',')
    );

  return swatches.count();
}

async selectFirstAvailableSwatch(): Promise<void> {
  const swatches =
    this.productCards.locator(
      [
        '[class*="swatch" i] button:visible:not([disabled])',
        '[class*="swatch" i] [role="radio"]:visible:not([aria-disabled="true"])',
        '[class*="color" i] button:visible:not([disabled])',
        '[data-testid*="swatch" i]:visible',
      ].join(',')
    );

  const count =
    await swatches.count();

  if (count === 0) {
    throw new Error(
      'No product swatches are available on the current PLP'
    );
  }

  await swatches.first().click();
}

private async getFilterControlLabel(
  control: Locator
): Promise<string> {
  const aria =
    (await control.getAttribute(
      'aria-label'
    )) ?? '';

  if (aria.trim()) {
    return aria.trim();
  }

  const id =
    await control.getAttribute('id');

  if (id) {
    const label =
      this.page.locator(
        `label[for="${id}"]`
      );

    if (
      await label
        .isVisible()
        .catch(() => false)
    ) {
      return (
        await label.innerText()
      ).trim();
    }
  }

  return '';
}

async selectSwatchAndDetectChange(): Promise<boolean> {
  const firstCard = this.productCards.first();

  const swatch = firstCard
    .locator(
      [
        '[class*="swatch" i] button:visible:not([disabled])',
        '[class*="swatch" i] [role="radio"]:visible:not([aria-disabled="true"])',
        '[class*="color" i] button:visible:not([disabled])',
        '[data-testid*="swatch" i]:visible',
      ].join(',')
    )
    .first();

  if (
    !(await swatch
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  const image = firstCard
    .locator('img')
    .first();

  const beforeImage =
    await image
      .getAttribute('src')
      .catch(() => null);

  const beforeText = (
    await firstCard
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  await swatch.click();

  await this.page.waitForTimeout(500);

  const afterImage =
    await image
      .getAttribute('src')
      .catch(() => null);

  const afterText = (
    await firstCard
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  return (
    beforeImage !== afterImage ||
    beforeText !== afterText
  );
}

async findOutOfStockState(): Promise<boolean> {
  const unavailable = this.page
    .locator(
      [
        '[class*="out-of-stock" i]:visible',
        '[class*="sold-out" i]:visible',
        '[class*="unavailable" i]:visible',
        '[data-testid*="out-of-stock" i]:visible',
        '[data-testid*="sold-out" i]:visible',
      ].join(',')
    )
    .filter({
      hasText:
        /out of stock|sold out|unavailable|not available/i,
    })
    .first();

  return unavailable
    .isVisible()
    .catch(() => false);
}

async getAvailablePriceInputs(): Promise<{
  min: Locator | null;
  max: Locator | null;
}> {
  const minInput = this.page
    .locator(
      [
        'input[name*="min" i][type="number"]',
        'input[id*="min" i][type="number"]',
        'input[placeholder*="min" i]',
        'input[aria-label*="minimum" i]',
      ].join(',')
    )
    .first();

  const maxInput = this.page
    .locator(
      [
        'input[name*="max" i][type="number"]',
        'input[id*="max" i][type="number"]',
        'input[placeholder*="max" i]',
        'input[aria-label*="maximum" i]',
      ].join(',')
    )
    .first();

  const minVisible =
    await minInput
      .isVisible()
      .catch(() => false);

  const maxVisible =
    await maxInput
      .isVisible()
      .catch(() => false);

  return {
    min: minVisible
      ? minInput
      : null,
    max: maxVisible
      ? maxInput
      : null,
  };
}

async applyMinimumPriceBoundary(
  value: number
): Promise<void> {
  await this.openFilterDrawer();

  const { min } =
    await this.getAvailablePriceInputs();

  if (!min) {
    throw new Error(
      'Minimum price input is not supported on the current PLP'
    );
  }

  await min.fill(String(value));

  await this.applyFilterChangesIfNeeded();
}

async applyMaximumPriceBoundary(
  value: number
): Promise<void> {
  await this.openFilterDrawer();

  const { max } =
    await this.getAvailablePriceInputs();

  if (!max) {
    throw new Error(
      'Maximum price input is not supported on the current PLP'
    );
  }

  await max.fill(String(value));

  await this.applyFilterChangesIfNeeded();
}

async applyInvalidPriceRange(
  minValue: number,
  maxValue: number
): Promise<void> {
  await this.openFilterDrawer();

  const { min, max } =
    await this.getAvailablePriceInputs();

  if (!min || !max) {
    throw new Error(
      'Price range inputs are not supported on the current PLP'
    );
  }

  await min.fill(String(minValue));
  await max.fill(String(maxValue));

  const applyButton =
    this.getFilterDrawer()
      .getByRole('button', {
        name:
          /apply|apply filters|view results|show results|done/i,
      })
      .first();

  if (
    await applyButton
      .isVisible()
      .catch(() => false)
  ) {
    await applyButton.click();
  }
}

async verifyInvalidPriceRangeHandled(): Promise<void> {
  const validation = this.page
    .locator(
      [
        '[role="alert"]:visible',
        '[class*="error" i]:visible',
        '[class*="validation" i]:visible',
        '[aria-invalid="true"]:visible',
      ].join(',')
    )
    .first();

  if (
    await validation
      .isVisible()
      .catch(() => false)
  ) {
    await expect(validation).toBeVisible();
    return;
  }

  /*
   * Some sites normalize the values instead of
   * rendering an explicit validation message.
   */
  const { min, max } =
    await this.getAvailablePriceInputs();

  if (min && max) {
    const minValue =
      Number(await min.inputValue());

    const maxValue =
      Number(await max.inputValue());

    expect(
      minValue <= maxValue ||
        Number.isNaN(minValue) ||
        Number.isNaN(maxValue),
      'Invalid price range should be rejected or normalized'
    ).toBeTruthy();

    return;
  }

  throw new Error(
    'Invalid price range behavior could not be verified'
  );
}

async closeFilterDrawer(): Promise<void> {
  const drawer =
    this.getFilterDrawer();

  await expect(
    drawer,
    'Filter drawer should be visible before closing'
  ).toBeVisible();

  const closeButton = drawer
    .locator(
      [
        'button[aria-label*="close" i]',
        'button:has-text("Close")',
        'button:has-text("Cancel")',
        '[data-testid*="close" i]',
      ].join(',')
    )
    .first();

  if (
    await closeButton
      .isVisible()
      .catch(() => false)
  ) {
    await closeButton.click();
  } else {
    await this.page.keyboard.press('Escape');
  }

  await expect(
    drawer
  ).not.toBeVisible({
    timeout: 10000,
  });
}

async openAndCloseSortControl(): Promise<void> {
  await expect(
    this.sortControl
  ).toBeVisible();

  const tagName =
    await this.sortControl.evaluate(
      (element) =>
        element.tagName.toLowerCase()
    );

  if (tagName === 'select') {
    await this.sortControl.focus();
    return;
  }

  await this.sortControl.click();

  const option = this.page
    .locator(
      [
        '[role="option"]:visible',
        '[role="menuitem"]:visible',
      ].join(',')
    )
    .first();

  await expect(
    option,
    'Sort menu should open'
  ).toBeVisible({
    timeout: 10000,
  });

  await this.page.keyboard.press('Escape');
}

async getCurrentUrl(): Promise<string> {
  return this.page.url();
}

async verifyUrlChanged(
  beforeUrl: string
): Promise<void> {
  expect(
    this.page.url(),
    'URL should change after applying state when supported'
  ).not.toBe(beforeUrl);
}

async refreshAndVerifyPLP(): Promise<void> {
  await this.page.reload({
    waitUntil: 'domcontentloaded',
  });

  await this.verifyPLPLoaded();
}

async getUniqueProductIdentifiers(): Promise<string[]> {
  const count = Math.min(
    await this.productCards.count(),
    100
  );

  const values: string[] = [];

  for (let i = 0; i < count; i++) {
    const card = this.productCards.nth(i);

    if (
      !(await card
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const link = card
      .locator('a[href]')
      .first();

    const href =
      await link.getAttribute('href');

    if (href) {
      values.push(href);
      continue;
    }

    const text = (
      await card
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (text) {
      values.push(text);
    }
  }

  return values;
}

async verifyPriceFormatValid(): Promise<void> {
  const cardCount = Math.min(
    await this.productCards.count(),
    30
  );

  let checked = 0;

  for (let i = 0; i < cardCount; i++) {
    const card = this.productCards.nth(i);

    const price = card
      .locator(
        [
          '[class*="price" i]',
          '[data-testid*="price" i]',
          '[aria-label*="price" i]',
        ].join(',')
      )
      .first();

    if (
      !(await price
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const text = (
      await price
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      continue;
    }

    checked++;

    expect(
      /(?:\$|USD)?\s*\d[\d,]*(?:\.\d{1,2})?/.test(text),
      `Invalid price format detected: "${text}"`
    ).toBeTruthy();
  }

  expect(
    checked,
    'At least one visible product price should be validated'
  ).toBeGreaterThan(0);
}

async findPromotionalPrice(): Promise<boolean> {
  const promoPrice = this.page
    .locator(
      [
        '[class*="sale-price" i]:visible',
        '[class*="promo" i] [class*="price" i]:visible',
        '[class*="original-price" i]:visible',
        '[class*="was-price" i]:visible',
        '[data-testid*="sale-price" i]:visible',
      ].join(',')
    )
    .first();

  return promoPrice
    .isVisible()
    .catch(() => false);
}

async findUnavailableFilterValue(): Promise<boolean> {
  await this.openFilterDrawer();

  const drawer =
    this.getFilterDrawer();

  const unavailable = drawer
    .locator(
      [
        'input[type="checkbox"]:disabled',
        '[role="checkbox"][aria-disabled="true"]',
        'button:disabled',
        '[class*="disabled" i]',
      ].join(',')
    )
    .first();

  return unavailable
    .isVisible()
    .catch(() => false);
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

async verifyNoProductCardOverlap(): Promise<void> {
  const count = Math.min(
    await this.productCards.count(),
    20
  );

  for (let i = 0; i < count; i++) {
    const card =
      this.productCards.nth(i);

    if (
      !(await card
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const box =
      await card.boundingBox();

    if (!box) {
      continue;
    }

    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);

    if (i === 0) {
      continue;
    }

    const previous =
      this.productCards.nth(i - 1);

    const previousBox =
      await previous.boundingBox();

    if (!previousBox) {
      continue;
    }

    const horizontalOverlap =
      Math.min(
        box.x + box.width,
        previousBox.x + previousBox.width
      ) -
      Math.max(
        box.x,
        previousBox.x
      );

    const verticalOverlap =
      Math.min(
        box.y + box.height,
        previousBox.y + previousBox.height
      ) -
      Math.max(
        box.y,
        previousBox.y
      );

    const actualOverlap =
      horizontalOverlap > 5 &&
      verticalOverlap > 5;

    expect(
      actualOverlap,
      `Product cards ${i - 1} and ${i} should not unexpectedly overlap`
    ).toBeFalsy();
  }
}

async scrollThroughProductList(): Promise<void> {
  const initialY =
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

  const afterY =
    await this.page.evaluate(
      () => window.scrollY
    );

  expect(
    afterY
  ).toBeGreaterThanOrEqual(
    initialY
  );

  await this.verifyPLPLoaded();
}

async getViewportSize(): Promise<{
  width: number;
  height: number;
}> {
  return this.page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
}

async getProductCountAfterSingleFilter(): Promise<{
  before: number;
  after: number;
}> {
  const before =
    await this.getProductCount();

  await this.applyFirstAvailableFilter();

  const after =
    await this.getProductCount();

  return {
    before,
    after,
  };
}
}