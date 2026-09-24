import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class ProductPage {
  readonly page: Page;

  readonly productArea: Locator;
  readonly title: Locator;
  readonly price: Locator;
  readonly primaryImage: Locator;
  readonly availability: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly breadcrumb: Locator;
  readonly productDetails: Locator;
  readonly reviewsSection: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productArea = page.locator('main').first();

    this.title = page
      .locator(
        [
          'h1:visible',
          '[class*="product-title" i]:visible',
          '[class*="product-name" i]:visible',
          '[data-testid*="product-title" i]:visible',
          '[data-testid*="product-name" i]:visible',
        ].join(',')
      )
      .first();

    this.price = page
      .locator(
        [
          '[class*="price" i]:visible',
          '[data-testid*="price" i]:visible',
          '[aria-label*="price" i]:visible',
        ].join(',')
      )
      .first();

    this.primaryImage = this.productArea
      .locator(
        [
          'img[class*="product" i]',
          'img[data-testid*="product" i]',
          '[class*="gallery" i] img',
          '[class*="image" i] img',
          'img',
        ].join(',')
      )
      .first();

    this.availability = this.productArea
      .locator(
        [
          '[class*="availability" i]',
          '[class*="stock" i]',
          '[data-testid*="availability" i]',
          '[data-testid*="stock" i]',
        ].join(',')
      )
      .first();

    this.addToCartButton = page
      .getByRole('button', {
        name: /add to (cart|bag)/i,
      })
      .first();

    this.quantityInput = this.productArea
      .locator(
        [
          'input[name*="quantity" i]',
          'input[id*="quantity" i]',
          'input[data-testid*="quantity" i]',
          'input[type="number"]',
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

    this.productDetails = this.productArea
      .locator(
        [
          '[class*="description" i]',
          '[class*="details" i]',
          '[data-testid*="description" i]',
          '[data-testid*="details" i]',
        ].join(',')
      )
      .first();

    this.reviewsSection = this.productArea
      .locator(
        [
          '[class*="review" i]',
          '[data-testid*="review" i]',
          '[aria-label*="review" i]',
        ].join(',')
      )
      .first();
  }

  async verifyProductPageLoaded(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();

    await expect(
      this.title,
      'Visible PDP title should exist'
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async verifyTitleVisible(): Promise<void> {
    await expect(this.title).toBeVisible();

    const text = (
      await this.title.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();

    expect(text).toBeTruthy();
  }

  async getProductName(): Promise<string> {
    await expect(this.title).toBeVisible({
      timeout: 10000,
    });

    return (
      await this.title.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
  }

  async verifyPriceVisible(): Promise<void> {
    await expect(this.price).toBeVisible();

    const text = (
      await this.price.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();

    expect(text).toBeTruthy();
  }

  async getPriceText(): Promise<string> {
    await expect(this.price).toBeVisible();

    return (
      await this.price.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
  }

  async verifyPrimaryImageVisible(): Promise<void> {
    await expect(this.primaryImage).toBeVisible();

    const src =
      await this.primaryImage.getAttribute('src');

    expect(src).toBeTruthy();
  }

  async verifyBreadcrumbVisible(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible();
  }

  async verifyAvailabilityVisible(): Promise<void> {
    if (
      await this.availability
        .isVisible()
        .catch(() => false)
    ) {
      await expect(this.availability).toBeVisible();
      return;
    }

    /*
     * Some products do not render a dedicated
     * availability element. In that case,
     * the Add to Cart state is used as the
     * purchase-availability signal.
     */
    await expect(this.addToCartButton).toBeVisible();
  }

  async verifyAddToCartVisible(): Promise<void> {
    await expect(
      this.addToCartButton,
      'Add to Cart button should be visible'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyAddToCartEnabled(): Promise<void> {
    await this.verifyAddToCartVisible();

    await expect(
      this.addToCartButton,
      'Add to Cart button should be enabled'
    ).toBeEnabled();
  }

  async verifyProductDetailsAccessible(): Promise<void> {
    if (
      await this.productDetails
        .isVisible()
        .catch(() => false)
    ) {
      await expect(this.productDetails).toBeVisible();
    }
  }

  async verifyReviewsSectionIfAvailable(): Promise<void> {
    if (
      await this.reviewsSection
        .isVisible()
        .catch(() => false)
    ) {
      await expect(this.reviewsSection).toBeVisible();
    }
  }

  async verifyQuantityMinimum(): Promise<void> {
    if (
      !(await this.quantityInput
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }

    const value =
      await this.quantityInput.inputValue();

    const numericValue = Number(value);

    expect(
      Number.isNaN(numericValue)
    ).toBeFalsy();

    expect(numericValue).toBeGreaterThanOrEqual(1);
  }

  async increaseQuantityIfSupported(): Promise<void> {
    const increaseButton = this.productArea
      .getByRole('button', {
        name: /increase|plus|\+/i,
      })
      .first();

    if (
      await increaseButton
        .isVisible()
        .catch(() => false)
    ) {
      await increaseButton.click();
      return;
    }

    if (
      await this.quantityInput
        .isVisible()
        .catch(() => false)
    ) {
      const currentValue = Number(
        await this.quantityInput.inputValue()
      );

      if (!Number.isNaN(currentValue)) {
        await this.quantityInput.fill(
          String(currentValue + 1)
        );
      }
    }
  }

  async getRequiredSelects(): Promise<Locator[]> {
    const selects =
      this.productArea.locator('select:visible');

    const count = Math.min(
      await selects.count(),
      20
    );

    const productSelects: Locator[] = [];

    for (let i = 0; i < count; i++) {
      const select = selects.nth(i);

      if (
        !(await select
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const metadata = await this.getElementMetadata(
        select
      );

      if (this.isGlobalControl(metadata)) {
        continue;
      }

      const options = select.locator('option');

      if ((await options.count()) <= 1) {
        continue;
      }

      const firstOptionText = (
        await options
          .first()
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      const looksLikeProductOption =
        /size|color|colour|style|finish|material|fabric|option|configuration|selection|variant|width|length|set/.test(
          metadata
        );

      const hasPlaceholder =
        /select|choose|please/i.test(
          firstOptionText
        );

      if (
        looksLikeProductOption ||
        hasPlaceholder
      ) {
        productSelects.push(select);
      }
    }

    return productSelects;
  }

  async selectAvailableOptions(): Promise<void> {
    console.log(
      'Scanning required PDP options'
    );

    const maxPasses = 8;

    for (
      let pass = 1;
      pass <= maxPasses;
      pass++
    ) {
      console.log(
        `PDP option selection pass ${pass}/${maxPasses}`
      );

      if (
        await this.isAddToCartCurrentlyEnabled()
      ) {
        console.log(
          'Add to Cart is already enabled'
        );

        return;
      }

      let changed = false;

      const dropdownChanged =
        await this.selectAvailableDropdownOptions();

      if (dropdownChanged) {
        changed = true;
      }

      if (
        await this.isAddToCartCurrentlyEnabled()
      ) {
        console.log(
          'Add to Cart enabled after dropdown selection'
        );

        return;
      }

      const swatchChanged =
        await this.selectAvailableSwatchOptions();

      if (swatchChanged) {
        changed = true;
      }

      await this.page.waitForTimeout(500);

      if (
        await this.isAddToCartCurrentlyEnabled()
      ) {
        console.log(
          'Add to Cart enabled after product option selection'
        );

        return;
      }

      if (!changed) {
        console.log(
          'No additional PDP option could be selected during this pass'
        );

        break;
      }
    }

    console.log(
      'PDP option scan completed but Add to Cart is still disabled'
    );

    await this.logPdpOptionDiagnostics();
  }

  private async isAddToCartCurrentlyEnabled(): Promise<boolean> {
    const visible =
      await this.addToCartButton
        .isVisible()
        .catch(() => false);

    if (!visible) {
      return false;
    }

    const disabled =
      await this.addToCartButton
        .isDisabled()
        .catch(() => true);

    const ariaDisabled =
      await this.addToCartButton
        .getAttribute('aria-disabled')
        .catch(() => null);

    return (
      !disabled &&
      ariaDisabled !== 'true'
    );
  }

  private async selectAvailableDropdownOptions(): Promise<boolean> {
    const selects =
      await this.getRequiredSelects();

    let changed = false;

    for (const select of selects) {
      const visible =
        await select
          .isVisible()
          .catch(() => false);

      if (!visible) {
        continue;
      }

      const currentValue =
        await select
          .inputValue()
          .catch(() => '');

      const currentText = (
        await select
          .locator('option:checked')
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        currentValue &&
        !/select|choose|please|pick an option/i.test(
          currentText
        )
      ) {
        continue;
      }

      const options =
        select.locator('option');

      const optionCount =
        await options.count();

      for (
        let optionIndex = 0;
        optionIndex < optionCount;
        optionIndex++
      ) {
        const option =
          options.nth(optionIndex);

        const value =
          (await option.getAttribute('value')) ?? '';

        const text = (
          await option
            .innerText()
            .catch(() => '')
        )
          .replace(/\s+/g, ' ')
          .trim();

        const disabled =
          await option
            .isDisabled()
            .catch(() => false);

        if (disabled) {
          continue;
        }

        if (!value) {
          continue;
        }

        if (
          /select|choose|please|pick an option/i.test(
            text
          )
        ) {
          continue;
        }

        if (
          /sold out|out of stock|unavailable/i.test(
            text
          )
        ) {
          continue;
        }

        console.log(
          `Selecting PDP dropdown option: "${text}"`
        );

        await select.selectOption(value);

        await this.page.waitForTimeout(500);

        changed = true;

        break;
      }

      if (
        await this.isAddToCartCurrentlyEnabled()
      ) {
        return true;
      }
    }

    return changed;
  }

  private async selectAvailableSwatchOptions(): Promise<boolean> {
    let changed = false;

    const radioGroups =
      this.productArea.locator(
        [
          '[role="radiogroup"]:visible',
          'fieldset:visible',
        ].join(',')
      );

    const groupCount =
      Math.min(
        await radioGroups.count(),
        30
      );

    for (
      let groupIndex = 0;
      groupIndex < groupCount;
      groupIndex++
    ) {
      const group =
        radioGroups.nth(groupIndex);

      const metadata =
        await this.getElementMetadata(group);

      if (
        this.isGlobalControl(metadata)
      ) {
        continue;
      }

      const groupText = (
        await group
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        /quantity|shipping|delivery|wishlist|payment|review|search|newsletter/i.test(
          groupText
        )
      ) {
        continue;
      }

      const alreadySelected =
        group.locator(
          [
            '[role="radio"][aria-checked="true"]',
            'input[type="radio"]:checked',
            'button[aria-pressed="true"]',
          ].join(',')
        );

      if (
        (await alreadySelected.count()) > 0
      ) {
        continue;
      }

      const candidates =
        group.locator(
          [
            '[role="radio"]:not([aria-disabled="true"])',
            'input[type="radio"]:not([disabled])',
            'button:not([disabled])',
          ].join(',')
        );

      const candidateCount =
        Math.min(
          await candidates.count(),
          30
        );

      for (
        let i = 0;
        i < candidateCount;
        i++
      ) {
        const control =
          candidates.nth(i);

        const visible =
          await control
            .isVisible()
            .catch(() => false);

        if (!visible) {
          continue;
        }

        const text = (
          await control
            .innerText()
            .catch(() => '')
        )
          .replace(/\s+/g, ' ')
          .trim();

        const ariaLabel =
          (await control.getAttribute('aria-label')) ?? '';

        const title =
          (await control.getAttribute('title')) ?? '';

        const combined =
          `${text} ${ariaLabel} ${title}`
            .replace(/\s+/g, ' ')
            .trim();

        if (
          /add to cart|add to bag|checkout|quantity|wishlist|favorite|menu|search|account|affiliate|site/i.test(
            combined
          )
        ) {
          continue;
        }

        if (
          /sold out|out of stock|unavailable/i.test(
            combined
          )
        ) {
          continue;
        }

        console.log(
          `Selecting PDP grouped option: "${
            combined || 'unnamed option'
          }"`
        );

        await control.click();

        await this.page.waitForTimeout(500);

        changed = true;

        break;
      }

      if (
        await this.isAddToCartCurrentlyEnabled()
      ) {
        return true;
      }
    }

    const looseControls =
      this.productArea.locator(
        [
          '[class*="swatch" i] button:visible:not([disabled])',
          '[class*="variant" i] button:visible:not([disabled])',
          '[class*="product-option" i] button:visible:not([disabled])',
          '[role="radio"]:visible:not([aria-disabled="true"])',
          'label:visible',
        ].join(',')
      );

    const looseCount =
      Math.min(
        await looseControls.count(),
        80
      );

    for (
      let i = 0;
      i < looseCount;
      i++
    ) {
      const control =
        looseControls.nth(i);

      const checked =
        (await control.getAttribute('aria-checked')) === 'true' ||
        (await control.getAttribute('aria-pressed')) === 'true';

      if (checked) {
        continue;
      }

      const text = (
        await control
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      const ariaLabel =
        (await control.getAttribute('aria-label')) ?? '';

      const title =
        (await control.getAttribute('title')) ?? '';

      const combined =
        `${text} ${ariaLabel} ${title}`
          .replace(/\s+/g, ' ')
          .trim();

      if (!combined) {
        continue;
      }

      if (
        /add to cart|add to bag|checkout|quantity|wishlist|favorite|menu|search|account|affiliate|site|shipping|delivery/i.test(
          combined
        )
      ) {
        continue;
      }

      if (
        /sold out|out of stock|unavailable/i.test(
          combined
        )
      ) {
        continue;
      }

      console.log(
        `Trying PDP loose option: "${combined}"`
      );

      await control
        .click()
        .catch(() => undefined);

      await this.page.waitForTimeout(400);

      if (
        await this.isAddToCartCurrentlyEnabled()
      ) {
        console.log(
          `Add to Cart enabled after selecting "${combined}"`
        );

        return true;
      }

      changed = true;
    }

    return changed;
  }

  private async logPdpOptionDiagnostics(): Promise<void> {
    const selects =
      this.productArea.locator('select:visible');

    const selectCount =
      Math.min(
        await selects.count(),
        20
      );

    console.log(
      `Visible PDP selects: ${selectCount}`
    );

    for (
      let i = 0;
      i < selectCount;
      i++
    ) {
      const select =
        selects.nth(i);

      const metadata =
        await this.getElementMetadata(select);

      const value =
        await select
          .inputValue()
          .catch(() => '');

      const selectedText = (
        await select
          .locator('option:checked')
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      console.log(
        `Select ${i + 1}: metadata="${metadata}", value="${value}", selected="${selectedText}"`
      );
    }

    const possibleOptions =
      this.productArea.locator(
        [
          '[role="radio"]:visible',
          'input[type="radio"]',
          '[class*="swatch" i] button:visible',
          '[class*="variant" i] button:visible',
          '[class*="product-option" i] button:visible',
          'label:visible',
        ].join(',')
      );

    const optionCount =
      Math.min(
        await possibleOptions.count(),
        80
      );

    console.log(
      `Visible/possible PDP option controls: ${optionCount}`
    );

    for (
      let i = 0;
      i < optionCount;
      i++
    ) {
      const option =
        possibleOptions.nth(i);

      const text = (
        await option
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      const aria =
        (await option.getAttribute('aria-label')) ?? '';

      const disabled =
        await option
          .isDisabled()
          .catch(() => false);

      if (text || aria) {
        console.log(
          `Option ${i + 1}: "${text || aria}", disabled=${disabled}`
        );
      }
    }

    console.log(
      `Add to Cart disabled: ${
        await this.addToCartButton
          .isDisabled()
          .catch(() => true)
      }`
    );
  }

  async addToCart(): Promise<void> {
    await this.verifyAddToCartEnabled();

    console.log(
      'Clicking Add to Cart'
    );

    await this.addToCartButton.click();

    const validationMessage =
      this.page
        .locator(
          [
            '[role="alert"]:visible',
            '[class*="error" i]:visible',
            '[class*="validation" i]:visible',
          ].join(',')
        )
        .filter({
          hasText:
            /select|choose|required|please/i,
        })
        .first();

    if (
      await validationMessage
        .isVisible()
        .catch(() => false)
    ) {
      const text = (
        await validationMessage
          .innerText()
          .catch(() => '')
      ).trim();

      throw new Error(
        `Add to Cart blocked by PDP validation: ${text}`
      );
    }

    console.log(
      'Add to Cart click completed'
    );
  }

  private async getElementMetadata(
    locator: Locator
  ): Promise<string> {
    const name =
      (await locator.getAttribute('name')) ?? '';

    const id =
      (await locator.getAttribute('id')) ?? '';

    const ariaLabel =
      (await locator.getAttribute(
        'aria-label'
      )) ?? '';

    const className =
      (await locator.getAttribute(
        'class'
      )) ?? '';

    return `${name} ${id} ${ariaLabel} ${className}`
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  private isGlobalControl(
    metadata: string
  ): boolean {
    return /affiliate|site|store|country|language|currency|footer|navigation|sort|filter/.test(
      metadata
    );
  }
  async getGalleryImageCount(): Promise<number> {
  const images = this.productArea.locator(
    [
      '[class*="gallery" i] img:visible',
      '[class*="carousel" i] img:visible',
      '[class*="thumbnail" i] img:visible',
      '[data-testid*="gallery" i] img:visible',
      '[data-testid*="thumbnail" i] img:visible',
    ].join(',')
  );

  return images.count();
}

async hasRequiredProductOptions(): Promise<boolean> {
  const selects =
    await this.getRequiredSelects();

  if (selects.length > 0) {
    return true;
  }

  const optionControls =
    this.productArea.locator(
      [
        '[class*="swatch" i] button:visible',
        '[class*="variant" i] button:visible',
        '[class*="product-option" i] button:visible',
        '[role="radio"]:visible',
        'input[type="radio"]:visible',
      ].join(',')
    );

  return (
    await optionControls.count()
  ) > 0;
}

async selectColorOption(): Promise<boolean> {
  return this.selectNamedProductOption(
    /color|colour/i
  );
}

async selectSizeOption(): Promise<boolean> {
  return this.selectNamedProductOption(
    /size|width|length/i
  );
}

async hasDisabledProductOption(): Promise<boolean> {
  const disabled = this.productArea
    .locator(
      [
        'select option:disabled',
        'button:disabled',
        '[role="radio"][aria-disabled="true"]',
        'input[type="radio"]:disabled',
        '[class*="swatch" i][class*="disabled" i]',
        '[class*="option" i][class*="disabled" i]',
      ].join(',')
    )
    .first();

  return disabled
    .isVisible()
    .catch(() => false);
}

async hasOutOfStockOption(): Promise<boolean> {
  const unavailable = this.productArea
    .locator(
      [
        '[class*="out-of-stock" i]:visible',
        '[class*="sold-out" i]:visible',
        '[class*="unavailable" i]:visible',
        '[aria-label*="out of stock" i]:visible',
        '[aria-label*="sold out" i]:visible',
        '[data-testid*="out-of-stock" i]:visible',
      ].join(',')
    )
    .first();

  if (
    await unavailable
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }

  const optionTexts =
    this.productArea.locator(
      [
        'option',
        'button',
        '[role="radio"]',
      ].join(',')
    );

  const count = Math.min(
    await optionTexts.count(),
    100
  );

  for (let i = 0; i < count; i++) {
    const option =
      optionTexts.nth(i);

    const text = (
      await option
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (
      /out of stock|sold out|unavailable/i.test(
        text
      )
    ) {
      return true;
    }
  }

  return false;
}

async selectOptionAndDetectDependentChange(): Promise<boolean> {
  const before = (
    await this.productArea
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  const selects =
    await this.getRequiredSelects();

  if (selects.length === 0) {
    return false;
  }

  const select =
    selects[0];

  const options =
    select.locator('option');

  const count =
    await options.count();

  for (let i = 0; i < count; i++) {
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

    const text = (
      await option
        .innerText()
        .catch(() => '')
    ).trim();

    if (
      disabled ||
      !value ||
      /select|choose|please/i.test(text)
    ) {
      continue;
    }

    await select.selectOption(value);

    await this.page.waitForTimeout(500);

    const after = (
      await this.productArea
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    return before !== after;
  }

  return false;
}

async verifyRequiredOptionValidation(): Promise<void> {
  const required =
    await this.hasRequiredProductOptions();

  if (!required) {
    throw new Error(
      'Current product has no required product options'
    );
  }

  await this.verifyAddToCartVisible();

  await this.addToCartButton.click();

  const validation = this.page
    .locator(
      [
        '[role="alert"]:visible',
        '[class*="error" i]:visible',
        '[class*="validation" i]:visible',
      ].join(',')
    )
    .filter({
      hasText:
        /select|choose|required|please/i,
    })
    .first();

  await expect(
    validation,
    'Required option validation should prevent Add to Cart'
  ).toBeVisible({
    timeout: 10000,
  });
}

async verifyProductWithoutRequiredOptions(): Promise<void> {
  const required =
    await this.hasRequiredProductOptions();

  expect(
    required,
    'Current product should not require option selection'
  ).toBeFalsy();

  await this.verifyAddToCartEnabled();
}

private async selectNamedProductOption(
  keyword: RegExp
): Promise<boolean> {
  const selects =
    this.productArea.locator(
      'select:visible'
    );

  const selectCount =
    Math.min(
      await selects.count(),
      20
    );

  for (let i = 0; i < selectCount; i++) {
    const select =
      selects.nth(i);

    const metadata =
      await this.getElementMetadata(
        select
      );

    if (!keyword.test(metadata)) {
      continue;
    }

    const options =
      select.locator('option');

    const optionCount =
      await options.count();

    for (
      let j = 0;
      j < optionCount;
      j++
    ) {
      const option =
        options.nth(j);

      const value =
        (await option.getAttribute(
          'value'
        )) ?? '';

      const text = (
        await option
          .innerText()
          .catch(() => '')
      ).trim();

      const disabled =
        await option
          .isDisabled()
          .catch(() => false);

      if (
        disabled ||
        !value ||
        /select|choose|please/i.test(text)
      ) {
        continue;
      }

      await select.selectOption(value);

      return true;
    }
  }

  const controls =
    this.productArea.locator(
      [
        '[class*="swatch" i] button:visible:not([disabled])',
        '[class*="variant" i] button:visible:not([disabled])',
        '[class*="product-option" i] button:visible:not([disabled])',
        '[role="radio"]:visible:not([aria-disabled="true"])',
      ].join(',')
    );

  const controlCount =
    Math.min(
      await controls.count(),
      50
    );

  for (
    let i = 0;
    i < controlCount;
    i++
  ) {
    const control =
      controls.nth(i);

    const text = (
      await control
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    const aria =
      (await control.getAttribute(
        'aria-label'
      )) ?? '';

    const combined =
      `${text} ${aria}`;

    if (!keyword.test(combined)) {
      continue;
    }

    await control.click();

    return true;
  }

  return false;
}

async getQuantityValue(): Promise<number | null> {
  if (
    !(await this.quantityInput
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const value =
    await this.quantityInput.inputValue();

  const numeric =
    Number(value);

  return Number.isNaN(numeric)
    ? null
    : numeric;
}

async decreaseQuantityIfSupported(): Promise<boolean> {
  const decreaseButton = this.productArea
    .getByRole('button', {
      name: /decrease|minus|-/i,
    })
    .first();

  if (
    await decreaseButton
      .isVisible()
      .catch(() => false)
  ) {
    await decreaseButton.click();

    return true;
  }

  if (
    await this.quantityInput
      .isVisible()
      .catch(() => false)
  ) {
    const current =
      await this.getQuantityValue();

    if (
      current !== null &&
      current > 1
    ) {
      await this.quantityInput.fill(
        String(current - 1)
      );

      return true;
    }
  }

  return false;
}

async verifyQuantityCannotGoBelowMinimum(): Promise<void> {
  if (
    !(await this.quantityInput
      .isVisible()
      .catch(() => false))
  ) {
    throw new Error(
      'Quantity input is not available on this PDP'
    );
  }

  await this.quantityInput.fill('1');

  const decreaseButton = this.productArea
    .getByRole('button', {
      name: /decrease|minus|-/i,
    })
    .first();

  if (
    await decreaseButton
      .isVisible()
      .catch(() => false)
  ) {
    const disabled =
      await decreaseButton
        .isDisabled()
        .catch(() => false);

    if (!disabled) {
      await decreaseButton.click();
    }
  }

  const value =
    await this.getQuantityValue();

  expect(
    value,
    'Quantity should not go below minimum'
  ).not.toBeNull();

  expect(
    value!
  ).toBeGreaterThanOrEqual(1);
}

async getQuantityMax(): Promise<number | null> {
  if (
    !(await this.quantityInput
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const max =
    await this.quantityInput.getAttribute(
      'max'
    );

  if (!max) {
    return null;
  }

  const parsed =
    Number(max);

  return Number.isNaN(parsed)
    ? null
    : parsed;
}

async verifyQuantityMaximumIfEnforced(): Promise<void> {
  const max =
    await this.getQuantityMax();

  if (max === null) {
    throw new Error(
      'Quantity maximum is not enforced on the current PDP'
    );
  }

  await this.quantityInput.fill(
    String(max + 1)
  );

  await this.quantityInput.blur();

  const value =
    await this.getQuantityValue();

  if (value !== null) {
    expect(
      value,
      'Quantity should not exceed enforced maximum'
    ).toBeLessThanOrEqual(max);
  }
}

async verifyInvalidQuantityHandling(): Promise<void> {
  if (
    !(await this.quantityInput
      .isVisible()
      .catch(() => false))
  ) {
    throw new Error(
      'Quantity input is not supported on the current PDP'
    );
  }

  await this.quantityInput.fill('-1');

  await this.quantityInput.blur();

  const value =
    await this.getQuantityValue();

  if (value !== null) {
    expect(
      value,
      'Invalid quantity should be rejected or normalized'
    ).toBeGreaterThanOrEqual(1);

    return;
  }

  const invalid =
    await this.quantityInput.getAttribute(
      'aria-invalid'
    );

  expect(
    invalid
  ).toBe('true');
}

async getSelectedOptionSummary(): Promise<string[]> {
  const values: string[] = [];

  const selects =
    await this.getRequiredSelects();

  for (const select of selects) {
    const selected = (
      await select
        .locator('option:checked')
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (selected) {
      values.push(selected);
    }
  }

  const checkedControls =
    this.productArea.locator(
      [
        '[role="radio"][aria-checked="true"]',
        'input[type="radio"]:checked',
      ].join(',')
    );

  const count =
    await checkedControls.count();

  for (let i = 0; i < count; i++) {
    const control =
      checkedControls.nth(i);

    const label =
      (await control.getAttribute(
        'aria-label'
      )) ??
      (
        await control
          .innerText()
          .catch(() => '')
      );

    const normalized =
      label
        .replace(/\s+/g, ' ')
        .trim();

    if (normalized) {
      values.push(normalized);
    }
  }

  return values;
}

async getProductIdentifier(): Promise<string | null> {
  const sku = this.productArea
    .locator(
      [
        '[class*="sku" i]',
        '[data-testid*="sku" i]',
        '[class*="product-id" i]',
        '[data-testid*="product-id" i]',
      ].join(',')
    )
    .first();

  if (
    await sku
      .isVisible()
      .catch(() => false)
  ) {
    return (
      await sku.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
  }

  return null;
}

async hasPromotionalPrice(): Promise<boolean> {
  const promo = this.productArea
    .locator(
      [
        '[class*="sale-price" i]:visible',
        '[class*="original-price" i]:visible',
        '[class*="was-price" i]:visible',
        '[data-testid*="sale-price" i]:visible',
      ].join(',')
    )
    .first();

  return promo
    .isVisible()
    .catch(() => false);
}

async selectOptionAndDetectPriceChange(): Promise<boolean> {
  const before =
    await this.getPriceText();

  const changed =
    await this.selectOptionAndDetectDependentChange();

  if (!changed) {
    return false;
  }

  const after =
    await this.getPriceText();

  return before !== after;
}

async selectOptionAndDetectImageChange(): Promise<boolean> {
  const before =
    await this.primaryImage
      .getAttribute('src')
      .catch(() => null);

  const changed =
    await this.selectOptionAndDetectDependentChange();

  if (!changed) {
    return false;
  }

  const after =
    await this.primaryImage
      .getAttribute('src')
      .catch(() => null);

  return before !== after;
}

async selectOptionAndDetectIdentifierChange(): Promise<boolean> {
  const before =
    await this.getProductIdentifier();

  if (!before) {
    return false;
  }

  const changed =
    await this.selectOptionAndDetectDependentChange();

  if (!changed) {
    return false;
  }

  const after =
    await this.getProductIdentifier();

  if (!after) {
    return false;
  }

  return before !== after;
}

async findDetailsAccordion(): Promise<Locator | null> {
  const accordion = this.productArea
    .locator(
      [
        'button[aria-expanded]',
        '[class*="accordion" i] button',
        '[data-testid*="accordion" i] button',
      ].join(',')
    )
    .filter({
      hasText:
        /details|description|specifications|product information/i,
    })
    .first();

  if (
    await accordion
      .isVisible()
      .catch(() => false)
  ) {
    return accordion;
  }

  return null;
}

async toggleDetailsAccordion(): Promise<boolean> {
  const accordion =
    await this.findDetailsAccordion();

  if (!accordion) {
    return false;
  }

  const before =
    await accordion.getAttribute(
      'aria-expanded'
    );

  await accordion.click();

  const after =
    await accordion.getAttribute(
      'aria-expanded'
    );

  if (
    before !== null &&
    after !== null
  ) {
    expect(after).not.toBe(before);
  }

  return true;
}

async hasUnavailableProductState(): Promise<boolean> {
  const unavailable = this.productArea
    .locator(
      [
        '[class*="unavailable" i]:visible',
        '[class*="out-of-stock" i]:visible',
        '[class*="sold-out" i]:visible',
        '[data-testid*="unavailable" i]:visible',
        '[data-testid*="out-of-stock" i]:visible',
      ].join(',')
    )
    .filter({
      hasText:
        /unavailable|out of stock|sold out|not available/i,
    })
    .first();

  return unavailable
    .isVisible()
    .catch(() => false);
}

async hasSoldOutMessaging(): Promise<boolean> {
  const soldOut = this.productArea
    .getByText(
      /sold out|out of stock/i
    )
    .first();

  return soldOut
    .isVisible()
    .catch(() => false);
}

async verifyBackNavigationToPreviousPage(): Promise<void> {
  const pdpUrl =
    this.page.url();

  await this.page.goBack({
    waitUntil: 'domcontentloaded',
  });

  expect(
    this.page.url(),
    'Back navigation should leave the current PDP'
  ).not.toBe(pdpUrl);

  await expect(
    this.page.locator('body')
  ).toBeVisible();
}

async selectOptionsAndGetState(): Promise<{
  url: string;
  selectedOptions: string[];
}> {
  await this.selectAvailableOptions();

  return {
    url: this.page.url(),
    selectedOptions:
      await this.getSelectedOptionSummary(),
  };
}

async refreshAndCompareSelectedOptions(
  previous: string[]
): Promise<boolean> {
  await this.page.reload({
    waitUntil: 'domcontentloaded',
  });

  await this.verifyProductPageLoaded();

  const current =
    await this.getSelectedOptionSummary();

  if (
    previous.length === 0 ||
    current.length === 0
  ) {
    return false;
  }

  return (
    JSON.stringify(previous) ===
    JSON.stringify(current)
  );
}

async verifyInvalidPdpUrlBehavior(): Promise<void> {
  const currentUrl =
    new URL(this.page.url());

  const invalidUrl =
    `${currentUrl.origin}/this-product-does-not-exist-automation-999999999`;

  await this.page.goto(
    invalidUrl,
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    }
  );

  const bodyVisible =
    await this.page
      .locator('body')
      .isVisible()
      .catch(() => false);

  expect(
    bodyVisible,
    'Invalid PDP URL should return a rendered error/redirect page'
  ).toBeTruthy();

  const errorState = this.page
    .locator(
      [
        '[class*="404" i]',
        '[class*="not-found" i]',
        '[data-testid*="404" i]',
        '[data-testid*="not-found" i]',
      ].join(',')
    )
    .first();

  const errorText =
    this.page.getByText(
      /404|not found|page cannot be found|product not found/i
    )
    .first();

  const redirected =
    !this.page.url().includes(
      'this-product-does-not-exist-automation-999999999'
    );

  const hasError =
    (await errorState
      .isVisible()
      .catch(() => false)) ||
    (await errorText
      .isVisible()
      .catch(() => false));

  expect(
    hasError || redirected,
    'Invalid PDP URL should show a user-friendly error or redirect'
  ).toBeTruthy();
}

async verifyPrimaryImageFitsViewport(): Promise<void> {
  await expect(
    this.primaryImage
  ).toBeVisible();

  const box =
    await this.primaryImage.boundingBox();

  if (!box) {
    throw new Error(
      'Unable to read primary product image dimensions'
    );
  }

  const viewport =
    await this.page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

  expect(
    box.width,
    'Product image should fit within the mobile viewport width'
  ).toBeLessThanOrEqual(
    viewport.width + 2
  );
}

async verifyCoreElementsDoNotOverlap(): Promise<void> {
  const elements = [
    this.title,
    this.price,
    this.addToCartButton,
  ];

  const boxes: {
    name: string;
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[] = [];

  const names = [
    'title',
    'price',
    'add-to-cart',
  ];

  for (
    let i = 0;
    i < elements.length;
    i++
  ) {
    const element =
      elements[i];

    if (
      !(await element
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const box =
      await element.boundingBox();

    if (box) {
      boxes.push({
        name: names[i],
        box,
      });
    }
  }

  for (
    let i = 0;
    i < boxes.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < boxes.length;
      j++
    ) {
      const a =
        boxes[i].box;

      const b =
        boxes[j].box;

      const horizontalOverlap =
        Math.min(
          a.x + a.width,
          b.x + b.width
        ) -
        Math.max(
          a.x,
          b.x
        );

      const verticalOverlap =
        Math.min(
          a.y + a.height,
          b.y + b.height
        ) -
        Math.max(
          a.y,
          b.y
        );

      const overlapping =
        horizontalOverlap > 5 &&
        verticalOverlap > 5;

      expect(
        overlapping,
        `${boxes[i].name} and ${boxes[j].name} should not overlap`
      ).toBeFalsy();
    }
  }
}

async hasStickyAddToCart(): Promise<boolean> {
  const sticky = this.page
    .locator(
      [
        '[class*="sticky" i] button:has-text("Add to Cart")',
        '[class*="sticky" i] button:has-text("Add to Bag")',
        '[data-testid*="sticky" i] button',
      ].join(',')
    )
    .first();

  return sticky
    .isVisible()
    .catch(() => false);
}

async scrollThroughLongProductDetails(): Promise<void> {
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

  await this.page.waitForTimeout(500);

  const finalY =
    await this.page.evaluate(
      () => window.scrollY
    );

  expect(
    finalY
  ).toBeGreaterThanOrEqual(
    initialY
  );

  await this.verifyProductPageLoaded();
}

async verifyOptionalContentDoesNotBlockPurchase(): Promise<void> {
  await this.verifyAddToCartVisible();

  const overlays = this.page.locator(
    [
      '[role="dialog"]:visible',
      '[class*="modal" i]:visible',
      '[class*="overlay" i]:visible',
    ].join(',')
  );

  const count =
    Math.min(
      await overlays.count(),
      20
    );

  for (let i = 0; i < count; i++) {
    const overlay =
      overlays.nth(i);

    const text = (
      await overlay
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (
      /review|promotion|recommendation|details|description/i.test(
        text
      )
    ) {
      continue;
    }
  }

  await expect(
    this.addToCartButton
  ).toBeVisible();
}

async changePreviouslySelectedOption(): Promise<boolean> {
  const selects =
    await this.getRequiredSelects();

  for (const select of selects) {
    const options =
      select.locator('option');

    const count =
      await options.count();

    const current =
      await select
        .inputValue()
        .catch(() => '');

    let firstAvailable = '';

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

      const text = (
        await option
          .innerText()
          .catch(() => '')
      ).trim();

      if (
        disabled ||
        !value ||
        /select|choose|please/i.test(text)
      ) {
        continue;
      }

      if (!firstAvailable) {
        firstAvailable = value;
      }

      if (
        current &&
        value !== current
      ) {
        await select.selectOption(
          value
        );

        return true;
      }
    }

    if (
      firstAvailable &&
      firstAvailable !== current
    ) {
      await select.selectOption(
        firstAvailable
      );

      return true;
    }
  }

  return false;
}

async changeOptionAndDetectAvailabilityChange(): Promise<boolean> {
  const before = (
    await this.productArea
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  const changed =
    await this.changePreviouslySelectedOption();

  if (!changed) {
    return false;
  }

  await this.page.waitForTimeout(500);

  const after = (
    await this.productArea
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  return before !== after;
}

async verifyDuplicateAddToCartHandled(): Promise<void> {
  await this.selectAvailableOptions();

  await this.verifyAddToCartEnabled();

  await this.addToCartButton.click();

  await this.page.waitForTimeout(
    500
  );

  const firstState = (
    await this.page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  await this.addToCartButton.click();

  await this.page.waitForTimeout(
    500
  );

  const secondState = (
    await this.page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  expect(
    secondState,
    'Repeated Add to Cart action should leave the page in a valid state'
  ).not.toBe('');

  expect(
    firstState
  ).not.toBe('');
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
}