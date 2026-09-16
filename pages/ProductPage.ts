import { expect, Page } from '@playwright/test';

export class ProductPage {
  constructor(private readonly page: Page) {}

  async verifyProductPageLoaded() {
    const title = this.page
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

    await expect(
      title,
      'Visible PDP title should exist'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async getProductName(): Promise<string> {
    const title = this.page
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

    await expect(title).toBeVisible({
      timeout: 10000,
    });

    return (
      await title.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();
  }

  async selectAvailableOptions() {
  console.log('Scanning required PDP options');

  const productArea = this.page.locator('main').first();

  /*
   * Only inspect dropdowns inside the main PDP area.
   * Avoid global/footer dropdowns such as Affiliate Sites.
   */
  const selects = productArea.locator('select:visible');

  const selectCount = Math.min(
    await selects.count(),
    20
  );

  for (let i = 0; i < selectCount; i++) {
    const select = selects.nth(i);

    if (
      !(await select
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const name =
      (await select.getAttribute('name')) ?? '';

    const id =
      (await select.getAttribute('id')) ?? '';

    const ariaLabel =
      (await select.getAttribute('aria-label')) ?? '';

    const className =
      (await select.getAttribute('class')) ?? '';

    const metadata =
      `${name} ${id} ${ariaLabel} ${className}`
        .replace(/\s+/g, ' ')
        .toLowerCase();

    /*
     * Explicitly ignore site/global selectors.
     */
    if (
      /affiliate|site|store|country|language|currency|footer|navigation|sort|filter/.test(
        metadata
      )
    ) {
      console.log(
        `Skipping non-product dropdown: ${metadata}`
      );

      continue;
    }

    /*
     * Product option dropdowns usually represent
     * size/color/style/finish/material/etc.
     */
    const looksLikeProductOption =
      /size|color|colour|style|finish|material|fabric|option|configuration|selection|variant|width|length|set/.test(
        metadata
      );

    const options =
      select.locator('option');

    const optionCount =
      await options.count();

    if (optionCount <= 1) {
      continue;
    }

    const currentValue =
      await select.inputValue().catch(() => '');

    const firstOptionText = (
      await options
        .first()
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    /*
     * If metadata doesn't clearly identify a product option,
     * only continue when the first option looks like
     * a typical product "Select / Choose" placeholder.
     */
    const hasOptionPlaceholder =
      /select|choose|please/i.test(
        firstOptionText
      );

    if (
      !looksLikeProductOption &&
      !hasOptionPlaceholder
    ) {
      console.log(
        `Skipping unrelated dropdown: ${metadata || firstOptionText}`
      );

      continue;
    }

    let selected = false;

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
        await option.isDisabled().catch(() => false);

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

      if (value === currentValue) {
        continue;
      }

      console.log(
        `Selecting PDP dropdown option: ${text}`
      );

      await select.selectOption(value);

      selected = true;

      break;
    }

    if (selected) {
      await this.page.waitForTimeout(500);
    }
  }

  /*
   * Handle product swatches / radio-style options,
   * but only inside the PDP main area.
   */
  const optionControls = productArea.locator(
    [
      '[role="radio"]:visible:not([aria-disabled="true"])',
      'input[type="radio"]:visible:not([disabled])',
      '[class*="swatch" i] button:visible:not([disabled])',
      '[class*="variant" i] button:visible:not([disabled])',
      '[class*="product-option" i] button:visible:not([disabled])',
    ].join(',')
  );

  const controlCount = Math.min(
    await optionControls.count(),
    40
  );

  for (
    let i = 0;
    i < controlCount;
    i++
  ) {
    const control =
      optionControls.nth(i);

    if (
      !(await control
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const checked =
      (await control.getAttribute('aria-checked')) ===
        'true' ||
      (await control.getAttribute('checked')) !==
        null;

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
      (await control.getAttribute('aria-label')) ??
      '';

    const combined =
      `${text} ${ariaLabel}`
        .replace(/\s+/g, ' ')
        .trim();

    if (
      /add to cart|add to bag|checkout|quantity|wishlist|favorite|menu|search|account|affiliate|site/i.test(
        combined
      )
    ) {
      continue;
    }

    console.log(
      `Selecting PDP option control: "${combined || 'unnamed option'}"`
    );

    await control.click();

    await this.page.waitForTimeout(500);

    /*
     * Choose only the first relevant radio/swatch group
     * candidate rather than clicking random page controls.
     */
    break;
  }

  console.log(
    'PDP option scan completed'
  );
}

  async addToCart() {
    console.log(
      'Looking for visible Add to Cart button'
    );

    const addButton = this.page
      .locator(
        [
          'button:visible',
          'input[type="submit"]:visible',
          'input[type="button"]:visible',
        ].join(',')
      )
      .filter({
        hasText:
          /add to cart|add to bag/i,
      })
      .first();

    const roleButton = this.page
      .getByRole('button', {
        name: /add to (cart|bag)/i,
      })
      .first();

    const button =
      (await addButton.count()) > 0
        ? addButton
        : roleButton;

    await expect(
      button,
      'Add to Cart button should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      button,
      'Add to Cart button should be enabled'
    ).toBeEnabled({
      timeout: 10000,
    });

    console.log('Clicking Add to Cart');

    await button.click();

    /*
     * Give the site's cart mutation time to finish.
     */
    await this.page.waitForTimeout(2500);

    /*
     * Check for common validation messages.
     * If required options were missed, fail here
     * instead of pretending the add succeeded.
     */
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
}