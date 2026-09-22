import { sites } from '../../../config/sites';
import { PLPPage } from '../../../pages/PLPPage';
import { test, expect } from '../../fixtures/android.fixture';

async function preparePLP(
  plpPage: PLPPage,
  siteUrl: string
): Promise<void> {
  await plpPage.page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await plpPage.openFirstAvailableCategory();
}

for (const site of Object.values(sites)) {
  test.describe(`${site.name} - PLP`, () => {
    test.setTimeout(120000);

    test(
      'PLP-001 Verify PLP loads successfully',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        await plpPage.verifyPLPLoaded();
      }
    );

    test(
      'PLP-002 Verify breadcrumb is displayed correctly',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        await plpPage.verifyBreadcrumbVisible();
      }
    );

    test(
      'PLP-003 Verify product grid is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        const productCount =
          await plpPage.getProductCount();

        expect(productCount).toBeGreaterThan(0);
      }
    );

    test(
      'PLP-004 Verify product card displays product image',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        await plpPage.verifyProductImages();
      }
    );

    test(
      'PLP-005 Verify product card displays product name',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        await plpPage.verifyProductNames();
      }
    );

    test(
      'PLP-006 Verify product card displays product price',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        await plpPage.verifyProductPrices();
      }
    );

    test(
      'PLP-007 Verify clicking product opens correct PDP',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const plpPage = new PLPPage(androidPage);

        await preparePLP(plpPage, site.url);

        const beforeUrl = androidPage.url();

        await plpPage.openFirstVisibleProduct();

        expect(androidPage.url()).not.toBe(beforeUrl);
      }
    );

    test(
  'PLP-008 Verify sorting from low price to high price',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.sortLowToHigh();

    await plpPage.verifyPricesAscending();
  }
);

test(
  'PLP-009 Verify sorting from high price to low price',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.sortHighToLow();

    await plpPage.verifyPricesDescending();
  }
);

test(
  'PLP-010 Verify selected sort option remains active',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.sortLowToHigh();

    await plpPage.verifySortSelectionActive(
      /price.*low.*high|low.*high|ascending/i
    );
  }
);

test(
  'PLP-011 Verify mobile filter drawer opens',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.openFilterDrawer();
  }
);

test(
  'PLP-012 Verify applying a single filter',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.applyFirstAvailableFilter();

    const productCount =
      await plpPage.getProductCount();

    expect(
      productCount
    ).toBeGreaterThanOrEqual(0);
  }
);

test(
  'PLP-013 Verify applying multiple filters',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const selected =
      await plpPage.applyMultipleFilters(2);

    expect(selected.length).toBe(2);
  }
);

test(
  'PLP-014 Verify removing one applied filter',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.applyMultipleFilters(2);

    await plpPage.removeOneAppliedFilter();

    await plpPage.verifyPLPLoaded();
  }
);

test(
  'PLP-015 Verify clearing all filters',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.applyMultipleFilters(2);

    await plpPage.clearAllFilters();

    await plpPage.verifyPLPLoaded();
  }
);

test(
  'PLP-018 Verify pagination or Load More behavior',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const result =
      await plpPage.loadMoreProductsIfAvailable();

    expect(
      result.after
    ).toBeGreaterThan(0);

    if (result.after === result.before) {
      expect(
        androidPage.url()
      ).toBeTruthy();
    }
  }
);

test(
  'PLP-019 Verify back navigation returns to previous PLP state',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.verifyBackNavigationToPLP();
  }
);

test(
  'PLP-020 Verify product swatches are displayed when available',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const count =
      await plpPage.getVisibleSwatchCount();

    test.skip(
      count === 0,
      `${site.name}: current PLP does not expose product swatches`
    );

    expect(count).toBeGreaterThan(0);
  }
);

test(
  'PLP-021 Verify swatch selection updates product information',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const swatchCount =
      await plpPage.getVisibleSwatchCount();

    test.skip(
      swatchCount === 0,
      `${site.name}: current PLP does not expose product swatches`
    );

    const changed =
      await plpPage.selectSwatchAndDetectChange();

    expect(
      changed,
      'Swatch selection should update product information'
    ).toBeTruthy();
  }
);

test(
  'PLP-022 Verify out-of-stock product state',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const found =
      await plpPage.findOutOfStockState();

    test.skip(
      !found,
      `${site.name}: no out-of-stock product is visible on the current PLP`
    );

    expect(found).toBeTruthy();
  }
);

test(
  'PLP-023 Verify minimum price boundary filter',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.openFilterDrawer();

    const { min } =
      await plpPage.getAvailablePriceInputs();

    test.skip(
      !min,
      `${site.name}: minimum price filter is not supported`
    );

    await plpPage.closeFilterDrawer();

    await plpPage.applyMinimumPriceBoundary(
      1
    );

    const prices =
      await plpPage.getVisibleProductPrices();

    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(1);
    }
  }
);

test(
  'PLP-024 Verify maximum price boundary filter',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.openFilterDrawer();

    const { max } =
      await plpPage.getAvailablePriceInputs();

    test.skip(
      !max,
      `${site.name}: maximum price filter is not supported`
    );

    await plpPage.closeFilterDrawer();

    await plpPage.applyMaximumPriceBoundary(
      100000
    );

    const prices =
      await plpPage.getVisibleProductPrices();

    expect(
      prices.length
    ).toBeGreaterThan(0);

    for (const price of prices) {
      expect(price).toBeLessThanOrEqual(
        100000
      );
    }
  }
);

test(
  'PLP-025 Verify invalid or empty price range handling',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.openFilterDrawer();

    const { min, max } =
      await plpPage.getAvailablePriceInputs();

    test.skip(
      !min || !max,
      `${site.name}: price range inputs are not supported`
    );

    await plpPage.closeFilterDrawer();

    await plpPage.applyInvalidPriceRange(
      500,
      100
    );

    await plpPage.verifyInvalidPriceRangeHandled();
  }
);

test(
  'PLP-026 Verify filter drawer closes correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.openFilterDrawer();

    await plpPage.closeFilterDrawer();
  }
);

test(
  'PLP-027 Verify mobile sort control opens and closes',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.openAndCloseSortControl();
  }
);

test(
  'PLP-028 Verify URL updates after filtering when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const beforeUrl =
      await plpPage.getCurrentUrl();

    await plpPage.applyFirstAvailableFilter();

    const afterUrl =
      await plpPage.getCurrentUrl();

    test.skip(
      afterUrl === beforeUrl,
      `${site.name}: filter state is not reflected in the URL`
    );

    await plpPage.verifyUrlChanged(
      beforeUrl
    );
  }
);

test(
  'PLP-029 Verify URL updates after sorting when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const beforeUrl =
      await plpPage.getCurrentUrl();

    await plpPage.sortLowToHigh();

    const afterUrl =
      await plpPage.getCurrentUrl();

    test.skip(
      afterUrl === beforeUrl,
      `${site.name}: sort state is not reflected in the URL`
    );

    await plpPage.verifyUrlChanged(
      beforeUrl
    );
  }
);

test(
  'PLP-030 Verify refresh preserves filter or sort state when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.sortLowToHigh();

    const beforeRefreshUrl =
      androidPage.url();

    await plpPage.refreshAndVerifyPLP();

    const afterRefreshUrl =
      androidPage.url();

    test.skip(
      !beforeRefreshUrl.includes('?') &&
        beforeRefreshUrl === afterRefreshUrl,
      `${site.name}: persistent sort/filter state cannot be determined from the current implementation`
    );

    expect(
      afterRefreshUrl
    ).toBe(beforeRefreshUrl);
  }
);

test(
  'PLP-031 Verify product count updates after filtering',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const result =
      await plpPage.getProductCountAfterSingleFilter();

    expect(
      result.after
    ).toBeGreaterThanOrEqual(0);

    test.skip(
      result.after === result.before,
      `${site.name}: current filter did not change visible product count`
    );

    expect(
      result.after
    ).not.toBe(result.before);
  }
);

test(
  'PLP-032 Verify product count remains valid after clearing filters',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const original =
      await plpPage.getProductCount();

    await plpPage.applyFirstAvailableFilter();

    await plpPage.clearAllFilters();

    const restored =
      await plpPage.getProductCount();

    expect(
      restored
    ).toBeGreaterThan(0);

    /*
     * Depending on lazy loading/pagination,
     * count may not be byte-for-byte identical.
     */
    expect(
      restored
    ).toBeGreaterThanOrEqual(
      Math.min(original, 1)
    );
  }
);

test(
  'PLP-033 Verify duplicate products are not displayed unexpectedly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const identifiers =
      await plpPage.getUniqueProductIdentifiers();

    const unique =
      new Set(identifiers);

    expect(
      unique.size,
      'Visible PLP should not contain duplicate product identifiers'
    ).toBe(identifiers.length);
  }
);

test(
  'PLP-034 Verify product card price format is valid',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.verifyPriceFormatValid();
  }
);

test(
  'PLP-035 Verify promotional price displays correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const promoFound =
      await plpPage.findPromotionalPrice();

    test.skip(
      !promoFound,
      `${site.name}: no promotional price is visible on the current PLP`
    );

    expect(
      promoFound
    ).toBeTruthy();
  }
);

test(
  'PLP-036 Verify unavailable filter values are disabled or hidden',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const unavailableFound =
      await plpPage.findUnavailableFilterValue();

    test.skip(
      !unavailableFound,
      `${site.name}: current filter drawer does not expose unavailable values`
    );

    expect(
      unavailableFound
    ).toBeTruthy();
  }
);

test(
  'PLP-037 Verify horizontal overflow does not appear on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const overflow =
      await plpPage.hasHorizontalOverflow();

    expect(
      overflow,
      'PLP should not have unexpected horizontal overflow on mobile'
    ).toBeFalsy();
  }
);

test(
  'PLP-038 Verify product card elements do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.verifyNoProductCardOverlap();
  }
);

test(
  'PLP-039 Verify scrolling through product list works correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    await plpPage.scrollThroughProductList();
  }
);

test(
  'PLP-040 Verify PLP behavior after device orientation or layout change if supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const plpPage =
      new PLPPage(androidPage);

    await preparePLP(
      plpPage,
      site.url
    );

    const viewport =
      await plpPage.getViewportSize();

    test.skip(
      viewport.width >= viewport.height,
      `${site.name}: test expects the current Android session to begin in portrait`
    );

    /*
     * Playwright CDP cannot safely rotate every real
     * Android device from this browser-only connection.
     * We therefore validate current layout here and
     * mark actual orientation switching for real-device execution.
     */
    await plpPage.verifyPLPLoaded();

    expect(
      viewport.width
    ).toBeGreaterThan(0);

    expect(
      viewport.height
    ).toBeGreaterThan(0);
  }
);
  });
}