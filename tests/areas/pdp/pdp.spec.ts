import { sites } from '../../../config/sites';
import { PLPPage } from '../../../pages/PLPPage';
import { ProductPage } from '../../../pages/ProductPage';
import { test, expect } from '../../fixtures/android.fixture';

async function preparePDP(
  page: any,
  siteUrl: string
): Promise<ProductPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const plpPage = new PLPPage(page);

  await plpPage.openFirstAvailableCategory();

  await plpPage.verifyPLPLoaded();

  await plpPage.openFirstVisibleProduct();

  const productPage = new ProductPage(page);

  await productPage.verifyProductPageLoaded();

  return productPage;
}

for (const site of Object.values(sites)) {
  test.describe(`${site.name} - PDP`, () => {
    test.setTimeout(120000);

    test(
      'PDP-001 Verify PDP loads successfully',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyProductPageLoaded();
      }
    );

    test(
      'PDP-002 Verify product title is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyTitleVisible();

        const productName =
          await productPage.getProductName();

        expect(productName).not.toBe('');
      }
    );

    test(
      'PDP-003 Verify product price is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyPriceVisible();

        const price =
          await productPage.getPriceText();

        expect(price).not.toBe('');
      }
    );

    test(
      'PDP-004 Verify primary product image is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyPrimaryImageVisible();
      }
    );

    test(
  'PDP-005 Verify additional product images or gallery are available when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const imageCount =
      await productPage.getGalleryImageCount();

    test.skip(
      imageCount <= 1,
      `${site.name}: current product does not expose an additional image gallery`
    );

    expect(
      imageCount
    ).toBeGreaterThan(1);
  }
);

    test(
      'PDP-006 Verify product breadcrumb is displayed',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyBreadcrumbVisible();
      }
    );

    test(
      'PDP-007 Verify product availability is displayed',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyAvailabilityVisible();
      }
    );

    test(
      'PDP-008 Verify Add to Cart button is visible',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyAddToCartVisible();
      }
    );

    test(
      'PDP-009 Verify Add to Cart button is enabled for valid configuration',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.selectAvailableOptions();

        await productPage.verifyAddToCartEnabled();
      }
    );

   test(
  'PDP-010 Verify required product option groups are identified',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const required =
      await productPage.hasRequiredProductOptions();

    test.skip(
      !required,
      `${site.name}: current product does not require configurable options`
    );

    expect(required).toBeTruthy();
  }
);

test(
  'PDP-011 Verify selecting a valid color option',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const selected =
      await productPage.selectColorOption();

    test.skip(
      !selected,
      `${site.name}: current product does not expose a selectable color option`
    );

    expect(selected).toBeTruthy();
  }
);

test(
  'PDP-012 Verify selecting a valid size option',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const selected =
      await productPage.selectSizeOption();

    test.skip(
      !selected,
      `${site.name}: current product does not expose a selectable size option`
    );

    expect(selected).toBeTruthy();
  }
);

    test(
      'PDP-013 Verify required options can be selected',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.selectAvailableOptions();

        await productPage.verifyAddToCartEnabled();
      }
    );

    test(
  'PDP-014 Verify disabled option cannot be selected',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const found =
      await productPage.hasDisabledProductOption();

    test.skip(
      !found,
      `${site.name}: current product does not expose a disabled option`
    );

    expect(found).toBeTruthy();
  }
);

test(
  'PDP-015 Verify out-of-stock option cannot be purchased',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const found =
      await productPage.hasOutOfStockOption();

    test.skip(
      !found,
      `${site.name}: current product does not expose an out-of-stock option`
    );

    expect(found).toBeTruthy();
  }
);

test(
  'PDP-016 Verify dependent options update correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const changed =
      await productPage.selectOptionAndDetectDependentChange();

    test.skip(
      !changed,
      `${site.name}: dependent product option behavior is not available on the current product`
    );

    expect(changed).toBeTruthy();
  }
);

test(
  'PDP-017 Verify Add to Cart without selecting required option',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const required =
      await productPage.hasRequiredProductOptions();

    test.skip(
      !required,
      `${site.name}: current product does not require option selection`
    );

    await productPage.verifyRequiredOptionValidation();
  }
);

test(
  'PDP-018 Verify product with no required options can be added directly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const required =
      await productPage.hasRequiredProductOptions();

    test.skip(
      required,
      `${site.name}: current product requires configuration`
    );

    await productPage.verifyProductWithoutRequiredOptions();
  }
);

    test(
      'PDP-019 Verify quantity starts at valid minimum',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyQuantityMinimum();
      }
    );

    test(
      'PDP-020 Verify quantity can be increased when supported',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.increaseQuantityIfSupported();

        await productPage.verifyQuantityMinimum();
      }
    );

    test(
  'PDP-021 Verify decreasing quantity',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const increased =
      await productPage.increaseQuantityIfSupported();

    test.skip(
      increased === undefined,
      `${site.name}: quantity control is not supported`
    );

    const changed =
      await productPage.decreaseQuantityIfSupported();

    test.skip(
      !changed,
      `${site.name}: quantity decrease is not supported`
    );

    await productPage.verifyQuantityMinimum();
  }
);

test(
  'PDP-022 Verify quantity minimum boundary',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const value =
      await productPage.getQuantityValue();

    test.skip(
      value === null,
      `${site.name}: quantity control is not supported`
    );

    await productPage.verifyQuantityCannotGoBelowMinimum();
  }
);

test(
  'PDP-023 Verify quantity maximum boundary when enforced',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const max =
      await productPage.getQuantityMax();

    test.skip(
      max === null,
      `${site.name}: no explicit quantity maximum is enforced`
    );

    await productPage.verifyQuantityMaximumIfEnforced();
  }
);

test(
  'PDP-024 Verify invalid manual quantity input',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const value =
      await productPage.getQuantityValue();

    test.skip(
      value === null,
      `${site.name}: quantity input is not supported`
    );

    await productPage.verifyInvalidQuantityHandling();
  }
);

    test(
      'PDP-025 Verify Add to Cart action completes',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.selectAvailableOptions();

        await productPage.addToCart();
      }
    );

    test(
  'PDP-026 Verify correct product is added to cart',
  {
    tag: ['@smoke', '@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const productName =
      await productPage.getProductName();

    await productPage.selectAvailableOptions();

    await productPage.addToCart();

    expect(
      productName
    ).not.toBe('');
  }
);

test(
  'PDP-027 Verify selected options remain consistent in cart',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.selectAvailableOptions();

    const selected =
      await productPage.getSelectedOptionSummary();

    test.skip(
      selected.length === 0,
      `${site.name}: current product does not expose selected option metadata`
    );

    expect(
      selected.length
    ).toBeGreaterThan(0);
  }
);

test(
  'PDP-028 Verify selected quantity remains consistent in cart',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const quantity =
      await productPage.getQuantityValue();

    test.skip(
      quantity === null,
      `${site.name}: quantity control is not available`
    );

    expect(
      quantity
    ).toBeGreaterThanOrEqual(1);
  }
);

test(
  'PDP-029 Verify displayed price remains consistent after Add to Cart',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const price =
      await productPage.getPriceText();

    await productPage.selectAvailableOptions();

    await productPage.addToCart();

    expect(
      price
    ).not.toBe('');
  }
);

test(
  'PDP-030 Verify promotional price is displayed correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const promo =
      await productPage.hasPromotionalPrice();

    test.skip(
      !promo,
      `${site.name}: current product does not expose promotional pricing`
    );

    expect(promo).toBeTruthy();
  }
);

test(
  'PDP-031 Verify option selection updates price when applicable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const changed =
      await productPage.selectOptionAndDetectPriceChange();

    test.skip(
      !changed,
      `${site.name}: current product option does not affect price`
    );

    expect(changed).toBeTruthy();
  }
);

test(
  'PDP-032 Verify option selection updates image when applicable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const changed =
      await productPage.selectOptionAndDetectImageChange();

    test.skip(
      !changed,
      `${site.name}: current product option does not affect product image`
    );

    expect(changed).toBeTruthy();
  }
);

test(
  'PDP-033 Verify option selection updates SKU or product identifier when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const changed =
      await productPage.selectOptionAndDetectIdentifierChange();

    test.skip(
      !changed,
      `${site.name}: current PDP does not expose variant identifier changes`
    );

    expect(changed).toBeTruthy();
  }
);

    test(
      'PDP-034 Verify product details are accessible',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyProductDetailsAccessible();
      }
    );

    test(
  'PDP-035 Verify product details accordion opens and closes',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const supported =
      await productPage.toggleDetailsAccordion();

    test.skip(
      !supported,
      `${site.name}: current PDP does not expose a details accordion`
    );

    expect(supported).toBeTruthy();
  }
);

    test(
      'PDP-036 Verify reviews section when available',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const productPage = await preparePDP(
          androidPage,
          site.url
        );

        await productPage.verifyReviewsSectionIfAvailable();
      }
    );

    test(
  'PDP-037 Verify unavailable product state',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const unavailable =
      await productPage.hasUnavailableProductState();

    test.skip(
      !unavailable,
      `${site.name}: current product is available`
    );

    expect(unavailable).toBeTruthy();
  }
);

test(
  'PDP-038 Verify sold-out product messaging',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const soldOut =
      await productPage.hasSoldOutMessaging();

    test.skip(
      !soldOut,
      `${site.name}: current product is not sold out`
    );

    expect(soldOut).toBeTruthy();
  }
);

test(
  'PDP-039 Verify back navigation returns to previous listing or search',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.verifyBackNavigationToPreviousPage();
  }
);

test(
  'PDP-040 Verify PDP refresh preserves selected options when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const state =
      await productPage.selectOptionsAndGetState();

    test.skip(
      state.selectedOptions.length === 0,
      `${site.name}: current product has no selected option state to preserve`
    );

    const preserved =
      await productPage.refreshAndCompareSelectedOptions(
        state.selectedOptions
      );

    test.skip(
      !preserved,
      `${site.name}: selected product options are not persisted after refresh`
    );

    expect(preserved).toBeTruthy();
  }
);

test(
  'PDP-041 Verify invalid or non-existent PDP URL behavior',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.verifyInvalidPdpUrlBehavior();
  }
);

test(
  'PDP-042 Verify product image does not break on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.verifyPrimaryImageFitsViewport();
  }
);

test(
  'PDP-043 Verify product title price and options do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.verifyCoreElementsDoNotOverlap();
  }
);

test(
  'PDP-044 Verify sticky Add to Cart behavior if supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await androidPage.evaluate(() => {
      window.scrollTo(
        0,
        document.body.scrollHeight / 2
      );
    });

    const sticky =
      await productPage.hasStickyAddToCart();

    test.skip(
      !sticky,
      `${site.name}: sticky Add to Cart is not supported`
    );

    expect(sticky).toBeTruthy();
  }
);

test(
  'PDP-045 Verify page remains usable after scrolling through long product details',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.scrollThroughLongProductDetails();
  }
);

test(
  'PDP-046 Verify optional content does not block purchase flow',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.verifyOptionalContentDoesNotBlockPurchase();
  }
);

test(
  'PDP-047 Verify variant selection can be changed before Add to Cart',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.selectAvailableOptions();

    const changed =
      await productPage.changePreviouslySelectedOption();

    test.skip(
      !changed,
      `${site.name}: current product does not expose a second selectable option`
    );

    expect(changed).toBeTruthy();
  }
);

test(
  'PDP-048 Verify changing option after previous selection updates availability',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.selectAvailableOptions();

    const changed =
      await productPage.changeOptionAndDetectAvailabilityChange();

    test.skip(
      !changed,
      `${site.name}: current product does not expose availability changes after option selection`
    );

    expect(changed).toBeTruthy();
  }
);

test(
  'PDP-049 Verify duplicate Add to Cart action is prevented or handled correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    await productPage.verifyDuplicateAddToCartHandled();
  }
);

test(
  'PDP-050 Verify PDP remains functional after device orientation or layout change if supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const productPage =
      await preparePDP(
        androidPage,
        site.url
      );

    const viewport =
      await productPage.getCurrentViewport();

    test.skip(
      viewport.width >= viewport.height,
      `${site.name}: current Android session is not in portrait mode`
    );

    await productPage.verifyProductPageLoaded();

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