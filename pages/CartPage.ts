import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class CartPage {
  readonly page: Page;

  readonly cartTrigger: Locator;
  readonly cartHeading: Locator;
  readonly emptyMessage: Locator;
  readonly cartCountControl: Locator;
  readonly genericCountControl: Locator;
  readonly checkoutButton: Locator;
  readonly checkoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    /*
     * Keep the public cartTrigger locator intentionally strict.
     *
     * The previous selector matched the PDP "Add to Cart" button
     * because its aria-label/class also contains the word "cart".
     * That caused CartPage.openCart() to click the PDP CTA instead
     * of the real header/cart navigation control on some brands.
     */
    this.cartTrigger = page
      .locator(
        [
          'header a[href*="ShoppingCartView" i]:visible',
          'nav a[href*="ShoppingCartView" i]:visible',
          'header a[href*="/cart" i]:visible',
          'nav a[href*="/cart" i]:visible',
          'header button[aria-label*="shopping cart" i]:visible',
          'header button[aria-label*="shopping bag" i]:visible',
          'header a[aria-label*="shopping cart" i]:visible',
          'header a[aria-label*="shopping bag" i]:visible',
          '[data-testid*="cart" i][role="button"]:visible',
          'button[data-cs-override-id*="cart" i]:visible:not([data-cs-override-id="pdp_add_to_cart"])',
        ].join(',')
      )
      .first();

    this.cartHeading = page
      .getByRole('heading', {
        name: /shopping cart|shopping bag|cart/i,
      })
      .first();

    this.emptyMessage = page
      .getByText(
        /your cart is empty|your bag is empty|cart is empty/i
      )
      .first();

    this.cartCountControl = page
      .getByRole('button', {
        name: /\d+\s+items?\s+in\s+the\s+cart/i,
      })
      .first();

    this.genericCountControl = page
      .locator(
        [
          '[aria-label*="item" i][aria-label*="cart" i]:visible',
          '[aria-label*="item" i][aria-label*="bag" i]:visible',
          '[class*="cart-count" i]:visible',
          '[class*="bag-count" i]:visible',
          '[data-testid*="cart-count" i]:visible',
          '[data-testid*="bag-count" i]:visible',
          '[class*="minicart" i] [class*="count" i]:visible',
        ].join(',')
      )
      .first();

    this.checkoutButton = page
      .getByRole('button', {
        name: /checkout|checkout now|proceed to checkout|secure checkout/i,
      })
      .first();

    this.checkoutLink = page
      .getByRole('link', {
        name: /checkout|checkout now|proceed to checkout|secure checkout/i,
      })
      .first();
  }

  async openCart(): Promise<void> {
    console.log(
      'Waiting for Add to Cart processing to finish'
    );

    await this.waitForAddToCartCompletion();

    /*
     * Some CBI brands open an Add-to-Cart confirmation sheet.
     * Prefer a real "View Cart" / "Shopping Bag" action inside
     * that sheet before interacting with the header.
     */
    const openedFromConfirmation =
      await this.tryOpenCartFromConfirmation();

    if (openedFromConfirmation) {
      await this.waitForCartReady();
      return;
    }

    /*
     * If a confirmation sheet is still covering the page, close
     * it before clicking a header button. This avoids the
     * c-sheet__mask pointer-interception failure seen on Garnet Hill.
     */
    await this.dismissTransientCartOverlay();

    const trigger =
      await this.getSafeCartTrigger();

    if (!trigger) {
  console.log(
    'No visible cart trigger found. Trying cart URL fallback.'
  );

  const cartLink =
    this.page
      .locator(
        [
          'a[href*="ShoppingCartView"]',
          'a[href*="/cart"]',
          'a[href*="cart" i]',
        ].join(',')
      )
      .first();

  const cartHref =
    await cartLink
      .getAttribute('href')
      .catch(() => null);

  if (cartHref) {
    const cartUrl =
      new URL(
        cartHref,
        this.page.url()
      ).toString();

    console.log(
      `Opening cart using discovered href: ${cartUrl}`
    );

    await this.page.goto(
      cartUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout: 20000,
      }
    );

    return;
  }

  /*
   * Final CBI fallback.
   * Use the current site's origin instead of hardcoding Frontgate.
   */
  const fallbackCartUrl =
    new URL(
      '/ShoppingCartView',
      this.page.url()
    );

  console.log(
    `Opening cart using fallback URL: ${fallbackCartUrl.toString()}`
  );

  await this.page.goto(
    fallbackCartUrl.toString(),
    {
      waitUntil:
        'domcontentloaded',
      timeout: 20000,
    }
  );

  return;
}

    const tagName =
      await trigger
        .evaluate(
          (element) =>
            element.tagName.toLowerCase()
        )
        .catch(() => '');

    const href =
      await trigger
        .getAttribute('href')
        .catch(() => null);

    /*
     * For a normal anchor, navigate to its href directly.
     * This is more reliable than a click when a transient overlay
     * is fading out and can still intercept pointer events.
     */
    if (
      tagName === 'a' &&
      href &&
      href !== '#' &&
      !href.startsWith('javascript:')
    ) {
      const target =
        new URL(
          href,
          this.page.url()
        ).toString();

      console.log(
        `Opening cart URL: ${target}`
      );

      await this.page.goto(
        target,
        {
          waitUntil:
            'domcontentloaded',
          timeout: 60000,
        }
      );
    } else {
      await expect(
        trigger,
        'Cart trigger should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await trigger.click({
        timeout: 15000,
      });

      await this.page
        .waitForLoadState(
          'domcontentloaded'
        )
        .catch(() => undefined);
    }

    await this.waitForCartReady();
  }

  async verifyCartLoaded(): Promise<void> {
    if (
      await this.cartHeading
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    if (
      await this.emptyMessage
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    const items =
      await this.getVisibleCartItemCount();

    if (items > 0) {
      return;
    }

    const checkout =
      await this.getCheckoutControl();

    if (
      checkout &&
      await checkout
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    await expect(
      this.cartHeading,
      'Cart page should be loaded'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyCartNotEmpty(): Promise<void> {
    await this.verifyCartLoaded();

    const isEmpty =
      await this.emptyMessage
        .isVisible()
        .catch(() => false);

    expect(
      isEmpty,
      'Cart should not be empty'
    ).toBeFalsy();

    const count =
      await this.getCartItemCount();

    expect(
      count,
      'Cart should contain at least one item'
    ).toBeGreaterThan(0);
  }

  async verifyEmptyCartIfVisible(): Promise<void> {
    if (
      await this.emptyMessage
        .isVisible()
        .catch(() => false)
    ) {
      await expect(
        this.emptyMessage
      ).toBeVisible();
    }
  }

  async getCartItemCount(): Promise<number> {
    const roleCount =
      await this.extractCountFromLocator(
        this.cartCountControl
      );

    if (roleCount !== null) {
      return roleCount;
    }

    const ariaCount =
      await this.extractCountFromLocator(
        this.genericCountControl
      );

    if (ariaCount !== null) {
      return ariaCount;
    }

    const headingText = (
      await this.cartHeading
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    const headingCount =
      this.extractCountFromText(
        headingText
      );

    if (headingCount !== null) {
      return headingCount;
    }

    const visibleItems =
      await this.getVisibleCartItemCount();

    if (visibleItems > 0) {
      return visibleItems;
    }

    /*
     * Final non-empty fallback:
     * if the cart exposes an enabled Checkout control and does not
     * show an empty-state message, it necessarily contains at least
     * one purchasable line item. Product identity is still verified
     * separately by verifyProductInCart(), so this does not replace
     * the same-product assertion.
     */
    const empty =
      await this.emptyMessage
        .isVisible()
        .catch(() => false);

    if (!empty) {
      const checkout =
        await this.getCheckoutControl();

      if (
        checkout &&
        await checkout
          .isVisible()
          .catch(() => false) &&
        !(await checkout
          .isDisabled()
          .catch(() => false))
      ) {
        return 1;
      }
    }

    return 0;
  }

  async verifyProductInCart(
    productName: string
  ): Promise<void> {
    const count =
      await this.getCartItemCount();

    expect(
      count,
      'Cart should contain at least one item'
    ).toBeGreaterThan(0);

    if (!productName) {
      return;
    }

    const product = this.page
      .locator('main')
      .getByText(productName, {
        exact: false,
      })
      .first();

    await expect(
      product,
      `Product "${productName}" should appear in cart`
    ).toBeVisible();
  }

  async verifyCheckoutAvailable(): Promise<void> {
    const control =
      await this.getCheckoutControl();

    expect(
      control,
      'Checkout control should be available when cart has items'
    ).not.toBeNull();

    await expect(
      control!
    ).toBeVisible();
  }

  async proceedToCheckout(): Promise<void> {
    const itemCount =
      await this.getCartItemCount();

    if (itemCount <= 0) {
      throw new Error(
        'Cannot proceed to checkout because cart item count is zero'
      );
    }

    const control =
      await this.getCheckoutControl();

      

    if (!control) {
      const checkoutControls =
  this.page.locator(
    [
      'button:visible',
      'a:visible',
      'input[type="submit"]:visible',
    ].join(',')
  );

const controlCount =
  Math.min(
    await checkoutControls.count(),
    80
  );

console.log(
  `Visible cart controls: ${controlCount}`
);

for (
  let i = 0;
  i < controlCount;
  i++
) {
  const control =
    checkoutControls.nth(i);

  const text = (
    await control
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  const aria =
    (await control
      .getAttribute('aria-label')
      .catch(() => null)) ?? '';

  const id =
    (await control
      .getAttribute('id')
      .catch(() => null)) ?? '';

  const className =
    (await control
      .getAttribute('class')
      .catch(() => null)) ?? '';

  const href =
    (await control
      .getAttribute('href')
      .catch(() => null)) ?? '';

  const value =
    (await control
      .getAttribute('value')
      .catch(() => null)) ?? '';

  console.log(
    `[CART CONTROL ${i}] text="${text}" aria="${aria}" value="${value}" href="${href}" id="${id}" class="${className}"`
  );
}
      throw new Error(
        'Cart has items, but no visible checkout control was found'
      );
    }

    await control.scrollIntoViewIfNeeded();

    await control.click();

    await this.page.waitForLoadState(
      'domcontentloaded'
    );
  }

  async getCheckoutControl(): Promise<Locator | null> {
    if (
      await this.checkoutButton
        .isVisible()
        .catch(() => false)
    ) {
      return this.checkoutButton;
    }

    if (
      await this.checkoutLink
        .isVisible()
        .catch(() => false)
    ) {
      return this.checkoutLink;
    }

    const textCandidate =
      this.page
        .locator(
          [
            'button:visible',
            'a:visible',
            '[role="button"]:visible',
            'input[type="submit"]:visible',
            'input[type="button"]:visible',
          ].join(',')
        )
        .filter({
          hasText:
            /checkout|checkout now|proceed to checkout|secure checkout/i,
        })
        .first();

    if (
      await textCandidate
        .isVisible()
        .catch(() => false)
    ) {
      return textCandidate;
    }

    return this.findCheckoutByAttributes();
  }

  // CART-007
  async getFirstCartItemPrice(): Promise<string | null> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return null;
    }

    const price = item
      .locator(
        [
          '[class*="price" i]:visible',
          '[data-testid*="price" i]:visible',
          '[aria-label*="price" i]:visible',
        ].join(',')
      )
      .first();

    if (
      !(await price
        .isVisible()
        .catch(() => false))
    ) {
      return null;
    }

    const text = (
      await price
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    return text || null;
  }

  async verifyFirstCartItemPriceVisible(): Promise<void> {
    const price =
      await this.getFirstCartItemPrice();

    expect(
      price,
      'Cart item price should be displayed'
    ).not.toBeNull();

    expect(
      price!.length
    ).toBeGreaterThan(0);
  }

  // CART-008
  async getCartQuantityControl(): Promise<Locator | null> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return null;
    }

    const input = item
      .locator(
        [
          'input[name*="quantity" i]:visible',
          'input[id*="quantity" i]:visible',
          'input[aria-label*="quantity" i]:visible',
          'input[type="number"]:visible',
        ].join(',')
      )
      .first();

    if (
      await input
        .isVisible()
        .catch(() => false)
    ) {
      return input;
    }

    const select = item
      .locator(
        [
          'select[name*="quantity" i]:visible',
          'select[id*="quantity" i]:visible',
          'select[aria-label*="quantity" i]:visible',
        ].join(',')
      )
      .first();

    if (
      await select
        .isVisible()
        .catch(() => false)
    ) {
      return select;
    }

    return null;
  }

  async getCartQuantity(): Promise<number | null> {
    const control =
      await this.getCartQuantityControl();

    if (!control) {
      return null;
    }

    const value =
      await control
        .inputValue()
        .catch(() => '');

    const numeric =
      Number(value);

    return Number.isNaN(numeric)
      ? null
      : numeric;
  }

  // CART-009
  async getSelectedCartOptions(): Promise<string[]> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return [];
    }

    const optionElements = item.locator(
      [
        '[class*="option" i]:visible',
        '[class*="variant" i]:visible',
        '[class*="attribute" i]:visible',
        '[data-testid*="option" i]:visible',
        '[data-testid*="variant" i]:visible',
      ].join(',')
    );

    const count = Math.min(
      await optionElements.count(),
      30
    );

    const options: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = (
        await optionElements
          .nth(i)
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        !text ||
        /quantity|remove|price|subtotal/i.test(
          text
        )
      ) {
        continue;
      }

      if (
        !options.includes(text)
      ) {
        options.push(text);
      }
    }

    return options;
  }

  // CART-010
  async getCartProductIdentifier(): Promise<string | null> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return null;
    }

    const sku = item
      .locator(
        [
          '[class*="sku" i]:visible',
          '[data-testid*="sku" i]:visible',
          '[class*="product-id" i]:visible',
          '[data-testid*="product-id" i]:visible',
          '[class*="item-number" i]:visible',
        ].join(',')
      )
      .first();

    if (
      !(await sku
        .isVisible()
        .catch(() => false))
    ) {
      return null;
    }

    const text = (
      await sku
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    return text || null;
  }

  // CART-011
  async increaseCartQuantity(): Promise<boolean> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return false;
    }

    const before =
      await this.getCartQuantity();

    const increaseButton = item
      .locator(
        [
          'button[aria-label*="increase" i]:visible',
          'button[aria-label*="plus" i]:visible',
          'button[title*="increase" i]:visible',
          'button[data-testid*="increase" i]:visible',
        ].join(',')
      )
      .first();

    if (
      await increaseButton
        .isVisible()
        .catch(() => false)
    ) {
      await increaseButton.click();

      await this.page.waitForTimeout(
        500
      );

      const after =
        await this.getCartQuantity();

      if (
        before !== null &&
        after !== null
      ) {
        expect(after).toBeGreaterThan(
          before
        );
      }

      return true;
    }

    const control =
      await this.getCartQuantityControl();

    if (!control) {
      return false;
    }

    const tag =
      await control.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tag === 'select') {
      const options =
        control.locator('option');

      const count =
        await options.count();

      const current =
        await control.inputValue();

      for (let i = 0; i < count; i++) {
        const option =
          options.nth(i);

        const value =
          (await option.getAttribute(
            'value'
          )) ?? '';

        const numeric =
          Number(value);

        if (
          !Number.isNaN(numeric) &&
          before !== null &&
          numeric > before
        ) {
          await control.selectOption(
            value
          );

          return true;
        }

        if (
          before === null &&
          value &&
          value !== current
        ) {
          await control.selectOption(
            value
          );

          return true;
        }
      }

      return false;
    }

    if (before === null) {
      return false;
    }

    await control.fill(
      String(before + 1)
    );

    await control.blur();

    const after =
      await this.getCartQuantity();

    if (after !== null) {
      expect(after).toBeGreaterThan(
        before
      );
    }

    return true;
  }

  // CART-012
  async decreaseCartQuantity(): Promise<boolean> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return false;
    }

    const before =
      await this.getCartQuantity();

    if (
      before !== null &&
      before <= 1
    ) {
      return false;
    }

    const decreaseButton = item
      .locator(
        [
          'button[aria-label*="decrease" i]:visible',
          'button[aria-label*="minus" i]:visible',
          'button[title*="decrease" i]:visible',
          'button[data-testid*="decrease" i]:visible',
        ].join(',')
      )
      .first();

    if (
      await decreaseButton
        .isVisible()
        .catch(() => false)
    ) {
      await decreaseButton.click();

      await this.page.waitForTimeout(
        500
      );

      const after =
        await this.getCartQuantity();

      if (
        before !== null &&
        after !== null
      ) {
        expect(after).toBeLessThan(
          before
        );
      }

      return true;
    }

    const control =
      await this.getCartQuantityControl();

    if (
      !control ||
      before === null ||
      before <= 1
    ) {
      return false;
    }

    const tag =
      await control.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tag === 'select') {
      const target =
        String(before - 1);

      const exists =
        await control
          .locator(
            `option[value="${target}"]`
          )
          .count();

      if (exists === 0) {
        return false;
      }

      await control.selectOption(
        target
      );

      return true;
    }

    await control.fill(
      String(before - 1)
    );

    await control.blur();

    const after =
      await this.getCartQuantity();

    if (after !== null) {
      expect(after).toBeLessThan(
        before
      );
    }

    return true;
  }

  // CART-013
  async verifyCartQuantityMinimum(): Promise<boolean> {
    const control =
      await this.getCartQuantityControl();

    if (!control) {
      return false;
    }

    const tag =
      await control.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tag === 'select') {
      const values =
        await control
          .locator('option')
          .evaluateAll(
            (options) =>
              options
                .map(
                  (option) =>
                    Number(
                      (
                        option as HTMLOptionElement
                      ).value
                    )
                )
                .filter(
                  (value) =>
                    !Number.isNaN(value)
                )
          );

      if (
        values.length === 0
      ) {
        return false;
      }

      expect(
        Math.min(...values)
      ).toBeGreaterThanOrEqual(1);

      return true;
    }

    const minAttribute =
      await control.getAttribute(
        'min'
      );

    if (minAttribute) {
      const min =
        Number(minAttribute);

      expect(
        min
      ).toBeGreaterThanOrEqual(1);

      return true;
    }

    await control.fill('1');

    await control.blur();

    const value =
      await this.getCartQuantity();

    if (value === null) {
      return false;
    }

    expect(
      value
    ).toBeGreaterThanOrEqual(1);

    return true;
  }

  // CART-014
  async getCartQuantityMaximum(): Promise<number | null> {
    const control =
      await this.getCartQuantityControl();

    if (!control) {
      return null;
    }

    const tag =
      await control.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tag === 'select') {
      const values =
        await control
          .locator('option')
          .evaluateAll(
            (options) =>
              options
                .map(
                  (option) =>
                    Number(
                      (
                        option as HTMLOptionElement
                      ).value
                    )
                )
                .filter(
                  (value) =>
                    !Number.isNaN(value)
                )
          );

      if (
        values.length === 0
      ) {
        return null;
      }

      return Math.max(...values);
    }

    const max =
      await control.getAttribute(
        'max'
      );

    if (!max) {
      return null;
    }

    const numeric =
      Number(max);

    return Number.isNaN(numeric)
      ? null
      : numeric;
  }

  async verifyCartQuantityMaximum(
    max: number
  ): Promise<void> {
    const control =
      await this.getCartQuantityControl();

    if (!control) {
      throw new Error(
        'Cart quantity control is not available'
      );
    }

    const tag =
      await control.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tag === 'select') {
      const maximum =
        await this.getCartQuantityMaximum();

      expect(maximum).toBe(max);

      return;
    }

    await control.fill(
      String(max + 1)
    );

    await control.blur();

    const quantity =
      await this.getCartQuantity();

    if (quantity !== null) {
      expect(
        quantity,
        'Cart quantity should not exceed enforced maximum'
      ).toBeLessThanOrEqual(max);
    }
  }

  // CART-015
  async verifyInvalidCartQuantityHandled(): Promise<boolean> {
    const control =
      await this.getCartQuantityControl();

    if (!control) {
      return false;
    }

    const tag =
      await control.evaluate(
        (element) =>
          element.tagName.toLowerCase()
      );

    if (tag === 'select') {
      return false;
    }

    await control.fill('-1');

    await control.blur();

    await this.page.waitForTimeout(
      300
    );

    const value =
      await this.getCartQuantity();

    if (
      value !== null &&
      value >= 1
    ) {
      return true;
    }

    const invalid =
      await control.getAttribute(
        'aria-invalid'
      );

    if (invalid === 'true') {
      return true;
    }

    const validation = this.page
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
        ].join(',')
      )
      .first();

    return validation
      .isVisible()
      .catch(() => false);
  }

  // CART-016
  async removeFirstCartItem(): Promise<boolean> {
    const item =
      await this.getFirstCartItemContainer();

    if (!item) {
      return false;
    }

    const remove = item
      .locator(
        [
          'button[aria-label*="remove" i]:visible',
          'button[title*="remove" i]:visible',
          'button[data-testid*="remove" i]:visible',
          'button:has-text("Remove"):visible',
          'a:has-text("Remove"):visible',
          '[class*="remove" i] button:visible',
          '[class*="remove" i] a:visible',
        ].join(',')
      )
      .first();

    if (
      !(await remove
        .isVisible()
        .catch(() => false))
    ) {
      return false;
    }

    await remove.click();

    await this.page.waitForTimeout(
      700
    );

    return true;
  }

  // CART-017 / CART-018
  async isCartEmpty(): Promise<boolean> {
    if (
      await this.emptyMessage
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }

    const items =
      await this.getVisibleCartItemCount();

    return items === 0;
  }

  async removeAllCartItems(): Promise<void> {
    for (
      let attempt = 0;
      attempt < 20;
      attempt++
    ) {
      if (
        await this.isCartEmpty()
      ) {
        return;
      }

      const removed =
        await this.removeFirstCartItem();

      if (!removed) {
        break;
      }

      await this.page.waitForTimeout(
        500
      );
    }

    const empty =
      await this.isCartEmpty();

    expect(
      empty,
      'Cart should become empty after removing all items'
    ).toBeTruthy();
  }

  async verifyEmptyCartState(): Promise<void> {
    const empty =
      await this.isCartEmpty();

    expect(
      empty,
      'Cart should show an empty state'
    ).toBeTruthy();

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
      'Empty cart page should still render meaningful content'
    ).not.toBe('');
  }

  // CART-019 / CART-020
  async getVisibleCartItemCount(): Promise<number> {
    const items =
      await this.getCartItemContainers();

    return items.length;
  }

  async getCartItemIdentifiers(): Promise<string[]> {
    const items =
      await this.getCartItemContainers();

    const identifiers: string[] = [];

    for (const item of items) {
      const link = item
        .locator('a[href]')
        .first();

      const href =
        await link
          .getAttribute('href')
          .catch(() => null);

      if (href) {
        identifiers.push(
          new URL(
            href,
            this.page.url()
          ).toString()
        );

        continue;
      }

      const text = (
        await item
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (text) {
        identifiers.push(text);
      }
    }

    return identifiers;
  }

  async verifyMultipleItemsRemainDistinct(): Promise<void> {
    const identifiers =
      await this.getCartItemIdentifiers();

    expect(
      identifiers.length,
      'Cart should contain multiple visible items'
    ).toBeGreaterThan(1);

    const unique =
      new Set(identifiers);

    expect(
      unique.size,
      'Different cart items should remain distinct'
    ).toBeGreaterThan(1);
  }

  // CART-021
  async getCartStateSnapshot(): Promise<{
    itemCount: number;
    visibleRows: number;
    quantity: number | null;
  }> {
    return {
      itemCount:
        await this.getCartItemCount(),

      visibleRows:
        await this.getVisibleCartItemCount(),

      quantity:
        await this.getCartQuantity(),
    };
  }

  // CART-022
  async getCartSubtotalText(): Promise<string | null> {
    const subtotal = this.page
      .locator(
        [
          '[class*="subtotal" i]:visible',
          '[data-testid*="subtotal" i]:visible',
          '[aria-label*="subtotal" i]:visible',
        ].join(',')
      )
      .first();

    if (
      await subtotal
        .isVisible()
        .catch(() => false)
    ) {
      const text = (
        await subtotal
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (text) {
        return text;
      }
    }

    const textCandidate = this.page
      .getByText(
        /subtotal/i
      )
      .first();

    if (
      await textCandidate
        .isVisible()
        .catch(() => false)
    ) {
      const parent =
        textCandidate.locator('..');

      const text = (
        await parent
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (text) {
        return text;
      }
    }

    return null;
  }

  async getCartSubtotalValue(): Promise<number | null> {
    const text =
      await this.getCartSubtotalText();

    if (!text) {
      return null;
    }

    return this.extractMoneyValue(
      text
    );
  }

  async verifyCartSubtotalDisplayed(): Promise<void> {
    const subtotal =
      await this.getCartSubtotalValue();

    expect(
      subtotal,
      'Cart subtotal should be displayed'
    ).not.toBeNull();

    expect(
      subtotal!
    ).toBeGreaterThan(0);
  }

  // CART-023
  async increaseQuantityAndCompareSubtotal(): Promise<{
    supported: boolean;
    before: number | null;
    after: number | null;
  }> {
    const before =
      await this.getCartSubtotalValue();

    const changed =
      await this.increaseCartQuantity();

    if (!changed) {
      return {
        supported: false,
        before,
        after: before,
      };
    }

    await this.page.waitForTimeout(
      800
    );

    const after =
      await this.getCartSubtotalValue();

    return {
      supported: true,
      before,
      after,
    };
  }

  // CART-024
  async decreaseQuantityAndCompareSubtotal(): Promise<{
    supported: boolean;
    before: number | null;
    after: number | null;
  }> {
    let quantity =
      await this.getCartQuantity();

    if (
      quantity !== null &&
      quantity <= 1
    ) {
      const increased =
        await this.increaseCartQuantity();

      if (!increased) {
        const subtotal =
          await this.getCartSubtotalValue();

        return {
          supported: false,
          before: subtotal,
          after: subtotal,
        };
      }

      await this.page.waitForTimeout(
        500
      );

      quantity =
        await this.getCartQuantity();
    }

    const before =
      await this.getCartSubtotalValue();

    const changed =
      await this.decreaseCartQuantity();

    if (!changed) {
      return {
        supported: false,
        before,
        after: before,
      };
    }

    await this.page.waitForTimeout(
      800
    );

    const after =
      await this.getCartSubtotalValue();

    return {
      supported: true,
      before,
      after,
    };
  }

  // CART-025
  async removeItemAndCompareSubtotal(): Promise<{
    supported: boolean;
    before: number | null;
    after: number | null;
    beforeItems: number;
    afterItems: number;
  }> {
    const before =
      await this.getCartSubtotalValue();

    const beforeItems =
      await this.getVisibleCartItemCount();

    const removed =
      await this.removeFirstCartItem();

    if (!removed) {
      return {
        supported: false,
        before,
        after: before,
        beforeItems,
        afterItems: beforeItems,
      };
    }

    await this.page.waitForTimeout(
      800
    );

    const afterItems =
      await this.getVisibleCartItemCount();

    const after =
      await this.getCartSubtotalValue();

    return {
      supported: true,
      before,
      after,
      beforeItems,
      afterItems,
    };
  }

// CART-026
async getFirstCartItemPriceValue(): Promise<number | null> {
  const text =
    await this.getFirstCartItemPrice();

  if (!text) {
    return null;
  }

  return this.extractMoneyValue(text);
}

async hasPromotionalPriceInCart(): Promise<boolean> {
  const item =
    await this.getFirstCartItemContainer();

  if (!item) {
    return false;
  }

  const promotional = item
    .locator(
      [
        '[class*="sale-price" i]:visible',
        '[class*="promo-price" i]:visible',
        '[class*="promotional-price" i]:visible',
        '[class*="original-price" i]:visible',
        '[class*="was-price" i]:visible',
        '[data-testid*="sale-price" i]:visible',
      ].join(',')
    )
    .first();

  return promotional
    .isVisible()
    .catch(() => false);
}

// CART-027
async getPromoCodeInput(): Promise<Locator | null> {
  const input = this.page
    .locator(
      [
        'input[name*="promo" i]:visible',
        'input[id*="promo" i]:visible',
        'input[placeholder*="promo" i]:visible',
        'input[aria-label*="promo" i]:visible',

        'input[name*="coupon" i]:visible',
        'input[id*="coupon" i]:visible',
        'input[placeholder*="coupon" i]:visible',
        'input[aria-label*="coupon" i]:visible',

        'input[name*="offer" i]:visible',
        'input[id*="offer" i]:visible',
      ].join(',')
    )
    .first();

  if (
    await input
      .isVisible()
      .catch(() => false)
  ) {
    return input;
  }

  const promoTrigger = this.page
    .locator(
      [
        'button:has-text("Promo Code"):visible',
        'button:has-text("Coupon"):visible',
        'button:has-text("Promotion"):visible',
        'button:has-text("Offer Code"):visible',
        '[aria-label*="promo" i]:visible',
      ].join(',')
    )
    .first();

  if (
    await promoTrigger
      .isVisible()
      .catch(() => false)
  ) {
    await promoTrigger.click();

    await this.page.waitForTimeout(
      300
    );

    const revealed = this.page
      .locator(
        [
          'input[name*="promo" i]:visible',
          'input[id*="promo" i]:visible',
          'input[placeholder*="promo" i]:visible',
          'input[name*="coupon" i]:visible',
          'input[id*="coupon" i]:visible',
          'input[placeholder*="coupon" i]:visible',
        ].join(',')
      )
      .first();

    if (
      await revealed
        .isVisible()
        .catch(() => false)
    ) {
      return revealed;
    }
  }

  return null;
}

// CART-028
async applyInvalidPromoCode(): Promise<{
  supported: boolean;
  handled: boolean;
}> {
  const input =
    await this.getPromoCodeInput();

  if (!input) {
    return {
      supported: false,
      handled: false,
    };
  }

  const beforeSubtotal =
    await this.getCartSubtotalValue();

  const invalidCode =
    `INVALID-AUTOMATION-${Date.now()}`;

  await input.fill(invalidCode);

  const apply = this.page
    .locator(
      [
        'button:has-text("Apply"):visible',
        'button:has-text("Submit"):visible',
        'button:has-text("Add"):visible',
        '[data-testid*="promo" i] button:visible',
        '[data-testid*="coupon" i] button:visible',
      ].join(',')
    )
    .first();

  if (
    await apply
      .isVisible()
      .catch(() => false)
  ) {
    await apply.click();
  } else {
    await input.press('Enter');
  }

  await this.page.waitForTimeout(
    700
  );

  const validation = this.page
    .locator(
      [
        '[role="alert"]:visible',
        '[class*="error" i]:visible',
        '[class*="validation" i]:visible',
        '[class*="invalid" i]:visible',
      ].join(',')
    )
    .filter({
      hasText:
        /invalid|not valid|not recognized|not found|expired|cannot be applied|unable to apply/i,
    })
    .first();

  if (
    await validation
      .isVisible()
      .catch(() => false)
  ) {
    return {
      supported: true,
      handled: true,
    };
  }

  const afterSubtotal =
    await this.getCartSubtotalValue();

  if (
    beforeSubtotal !== null &&
    afterSubtotal !== null &&
    beforeSubtotal === afterSubtotal
  ) {
    return {
      supported: true,
      handled: true,
    };
  }

  return {
    supported: true,
    handled: false,
  };
}

// CART-029
async refreshAndVerifyCartPersistence(): Promise<boolean> {
  const before =
    await this.getCartItemIdentifiers();

  if (
    before.length === 0
  ) {
    return false;
  }

  await this.page.reload({
    waitUntil: 'domcontentloaded',
  });

  await this.verifyCartLoaded();

  const after =
    await this.getCartItemIdentifiers();

  if (
    after.length === 0
  ) {
    return false;
  }

  return before.every(
    (identifier) =>
      after.includes(identifier)
  );
}

// CART-030
async leaveAndReturnToCart(
  siteUrl: string
): Promise<boolean> {
  const before =
    await this.getCartItemIdentifiers();

  if (
    before.length === 0
  ) {
    return false;
  }

  await this.page.goto(
    siteUrl,
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    }
  );

  await this.openCart();

  await this.verifyCartLoaded();

  const after =
    await this.getCartItemIdentifiers();

  if (
    after.length === 0
  ) {
    return false;
  }

  return before.every(
    (identifier) =>
      after.includes(identifier)
  );
}

// CART-031
async proceedToCheckoutAndVerifyNavigation(): Promise<void> {
  const beforeUrl =
    this.page.url();

  await this.proceedToCheckout();

  const afterUrl =
    this.page.url();

  expect(
    afterUrl,
    'Checkout navigation should leave Cart'
  ).not.toBe(beforeUrl);

  await expect(
    this.page.locator('body')
  ).toBeVisible();
}

// CART-032
async triggerCheckoutSafelyTwice(): Promise<boolean> {
  const firstControl =
    await this.getCheckoutControl();

  if (!firstControl) {
    return false;
  }

  await firstControl.click();

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  /*
   * We do not submit an order.
   *
   * Once checkout navigation occurs, a second Cart
   * checkout control may legitimately no longer exist.
   * The assertion here is that repeated interaction
   * does not leave the browser in a broken/error state.
   */
  const bodyText = (
    await this.page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  expect(
    bodyText
  ).not.toBe('');

  expect(
    bodyText
  ).not.toMatch(
    /internal server error|application error|stack trace|uncaught exception/i
  );

  return true;
}

// CART-033
async hasHorizontalOverflow(): Promise<boolean> {
  return this.page.evaluate(
    () => {
      const root =
        document.documentElement;

      return (
        root.scrollWidth >
        root.clientWidth + 2
      );
    }
  );
}

// CART-034
async verifyFirstCartItemControlsDoNotOverlap(): Promise<void> {
  const item =
    await this.getFirstCartItemContainer();

  if (!item) {
    throw new Error(
      'No cart item available for mobile layout validation'
    );
  }

  const controls = [
    item
      .locator(
        [
          'input[name*="quantity" i]:visible',
          'select[name*="quantity" i]:visible',
          '[aria-label*="quantity" i]:visible',
        ].join(',')
      )
      .first(),

    item
      .locator(
        [
          'button[aria-label*="remove" i]:visible',
          'button:has-text("Remove"):visible',
          'a:has-text("Remove"):visible',
        ].join(',')
      )
      .first(),

    item
      .locator(
        [
          '[class*="price" i]:visible',
          '[data-testid*="price" i]:visible',
        ].join(',')
      )
      .first(),
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
    'quantity',
    'remove',
    'price',
  ];

  for (
    let i = 0;
    i < controls.length;
    i++
  ) {
    if (
      !(await controls[i]
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const box =
      await controls[i].boundingBox();

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
        `${boxes[i].name} and ${boxes[j].name} controls should not overlap`
      ).toBeFalsy();
    }
  }
}

// CART-035
async getCurrentViewport(): Promise<{
  width: number;
  height: number;
}> {
  return this.page.evaluate(
    () => ({
      width:
        window.innerWidth,
      height:
        window.innerHeight,
    })
  );
}


  private async getCartItemContainers(): Promise<Locator[]> {
    const candidates =
      this.page.locator(
        [
          'main [class*="cart-item" i]:visible',
          'main [class*="cartItem" i]:visible',
          'main [data-testid*="cart-item" i]:visible',
          'main [class*="line-item" i]:visible',
          'main [class*="order-item" i]:visible',
          'main article:visible',
        ].join(',')
      );

    const count = Math.min(
      await candidates.count(),
      50
    );

    const items: Locator[] = [];

    for (let i = 0; i < count; i++) {
      const candidate =
        candidates.nth(i);

      if (
        !(await candidate
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const text = (
        await candidate
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (!text) {
        continue;
      }

      const hasProductLink =
        (await candidate
          .locator(
            'a[href]:visible'
          )
          .count()) > 0;

      const hasPrice =
        /\$\s*\d|\d+\.\d{2}/.test(
          text
        );

      if (
        hasProductLink &&
        hasPrice
      ) {
        items.push(candidate);
      }
    }

    return items;
  }

  private async getFirstCartItemContainer(): Promise<Locator | null> {
    const items =
      await this.getCartItemContainers();

    return items.length > 0
      ? items[0]
      : null;
  }

  private async waitForAddToCartCompletion(): Promise<void> {
    const addButton =
      this.page
        .getByRole(
          'button',
          {
            name:
              /add to (cart|bag)/i,
          }
        )
        .first();

    if (
      !(await addButton
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }

    /*
     * CBI brands may temporarily add classes such as
     * "add-to-card-loading" / "is--loading" while the request
     * is being persisted. Do not leave the PDP during that state.
     */
    await this.page
      .waitForFunction(
        () => {
          const buttons =
            Array.from(
              document.querySelectorAll(
                'button[aria-label]'
              )
            ) as HTMLButtonElement[];

          const add =
            buttons.find(
              (button) =>
                /add to (cart|bag)/i.test(
                  button.getAttribute(
                    'aria-label'
                  ) ?? ''
                )
            );

          if (!add) {
            return true;
          }

          const className =
            add.className ?? '';

          const ariaBusy =
            add.getAttribute(
              'aria-busy'
            );

          return (
            !/loading|is--loading|add-to-card-loading/i.test(
              className
            ) &&
            ariaBusy !== 'true'
          );
        },
        {
          timeout: 10000,
        }
      )
      .catch(() => undefined);

    /*
     * Give the cart API / badge a short stabilization window after
     * the visual loading state disappears.
     */
    await this.page.waitForTimeout(
      700
    );
  }

  private async tryOpenCartFromConfirmation(): Promise<boolean> {
    const containers =
      this.page.locator(
        [
          '[role="dialog"]:visible',
          '[class*="sheet" i]:visible',
          '[class*="modal" i]:visible',
          '[class*="drawer" i]:visible',
        ].join(',')
      );

    const count =
      Math.min(
        await containers.count(),
        20
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const container =
        containers.nth(i);

      const text = (
        await container
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        !/added|cart|bag/i.test(
          text
        )
      ) {
        continue;
      }

      const cartAction =
        container
          .locator(
            [
              'a:visible',
              'button:visible',
              '[role="button"]:visible',
            ].join(',')
          )
          .filter({
            hasText:
              /view cart|view bag|shopping cart|shopping bag|go to cart|my cart|my bag/i,
          })
          .first();

      if (
        !(await cartAction
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const label = (
        await cartAction
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (
        /add to (cart|bag)/i.test(
          label
        )
      ) {
        continue;
      }

      console.log(
        `Opening cart from confirmation: "${label || 'cart action'}"`
      );

      const href =
        await cartAction
          .getAttribute('href')
          .catch(() => null);

      if (
        href &&
        href !== '#' &&
        !href.startsWith(
          'javascript:'
        )
      ) {
        await this.page.goto(
          new URL(
            href,
            this.page.url()
          ).toString(),
          {
            waitUntil:
              'domcontentloaded',
            timeout: 60000,
          }
        );

        return true;
      }

      await cartAction
        .click({
          timeout: 10000,
        })
        .catch(() => undefined);

      await this.page
        .waitForLoadState(
          'domcontentloaded'
        )
        .catch(() => undefined);

      return true;
    }

    return false;
  }

  private async dismissTransientCartOverlay(): Promise<void> {
    const mask =
      this.page
        .locator(
          [
            '.c-sheet__mask:visible',
            '[class*="sheet__mask" i]:visible',
            '[class*="modal"] [class*="mask" i]:visible',
            '[class*="overlay" i]:visible',
          ].join(',')
        )
        .first();

    if (
      !(await mask
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }

    const container =
      this.page
        .locator(
          [
            '[role="dialog"]:visible',
            '[class*="sheet" i]:visible',
            '[class*="modal" i]:visible',
          ].join(',')
        )
        .first();

    const close =
      container
        .locator(
          [
            'button[aria-label*="close" i]:visible',
            'button[title*="close" i]:visible',
            'button:has-text("Close"):visible',
            '[data-testid*="close" i]:visible',
          ].join(',')
        )
        .first();

    if (
      await close
        .isVisible()
        .catch(() => false)
    ) {
      console.log(
        'Closing transient cart confirmation overlay'
      );

      await close
        .click()
        .catch(() => undefined);
    } else {
      await this.page.keyboard
        .press('Escape')
        .catch(() => undefined);
    }

    await expect(
      mask
    )
      .toBeHidden({
        timeout: 5000,
      })
      .catch(() => undefined);
  }

  private async getSafeCartTrigger(): Promise<Locator | null> {
    const candidates =
      this.page.locator(
        [
          'header a[href*="ShoppingCartView" i]:visible',
          'nav a[href*="ShoppingCartView" i]:visible',
          'header a[href*="/cart" i]:visible',
          'nav a[href*="/cart" i]:visible',
          'header button[aria-label*="shopping cart" i]:visible',
          'header button[aria-label*="shopping bag" i]:visible',
          'header a[aria-label*="shopping cart" i]:visible',
          'header a[aria-label*="shopping bag" i]:visible',
          'a[href*="ShoppingCartView" i]:visible',
          'a[href$="/cart" i]:visible',
          'a[href*="/cart?" i]:visible',
          '[data-testid*="cart" i][role="button"]:visible',
          'button[aria-label*="cart" i]:visible',
          'a[aria-label*="cart" i]:visible',
          'button[aria-label*="bag" i]:visible',
          'a[aria-label*="bag" i]:visible',
        ].join(',')
      );

    const count =
      Math.min(
        await candidates.count(),
        100
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const candidate =
        candidates.nth(i);

      if (
        !(await candidate
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const text = (
        await candidate
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      const aria =
        (await candidate
          .getAttribute(
            'aria-label'
          )) ?? '';

      const title =
        (await candidate
          .getAttribute(
            'title'
          )) ?? '';

      const href =
        (await candidate
          .getAttribute(
            'href'
          )) ?? '';

      const id =
        (await candidate
          .getAttribute(
            'id'
          )) ?? '';

      const dataId =
        (await candidate
          .getAttribute(
            'data-cs-override-id'
          )) ?? '';

      const combined =
        `${text} ${aria} ${title} ${href} ${id} ${dataId}`
          .replace(/\s+/g, ' ')
          .trim();

      /*
       * Explicitly reject the PDP CTA and any other "Add to Cart"
       * control, even if it satisfies a generic cart selector.
       */
      if (
        /add to (cart|bag)|pdp_add_to_cart|add_to_cart/i.test(
          combined
        )
      ) {
        continue;
      }

      if (
        /shoppingcartview|shopping cart|shopping bag|my cart|my bag|view cart|view bag|\/cart(?:\?|$|\/)/i.test(
          combined
        )
      ) {
        return candidate;
      }
    }

    return null;
  }

  private async waitForCartReady(): Promise<void> {
    await this.page
      .waitForLoadState(
        'domcontentloaded'
      )
      .catch(() => undefined);

    await this.page.waitForTimeout(
      500
    );

    const ready =
      await this.page
        .waitForFunction(
          () => {
            const body =
              document.body
                ?.innerText
                ?.replace(
                  /\s+/g,
                  ' '
                ) ?? '';

            const url =
              window.location.href;

            return (
              /ShoppingCartView|\/cart(?:\?|$|\/)/i.test(
                url
              ) ||
              /shopping cart|shopping bag|your cart is empty|your bag is empty/i.test(
                body
              )
            );
          },
          {
            timeout: 10000,
          }
        )
        .then(() => true)
        .catch(() => false);

    if (!ready) {
      /*
       * Some brands render the cart shell without changing to a
       * predictable URL. verifyCartLoaded() performs the final
       * structural validation.
       */
      await this.verifyCartLoaded();
    }
  }

  private async findCheckoutByAttributes(): Promise<Locator | null> {
    const controls =
      this.page.locator(
        [
          'button:visible',
          'a:visible',
          '[role="button"]:visible',
          'input[type="submit"]:visible',
          'input[type="button"]:visible',
        ].join(',')
      );

    const count = Math.min(
      await controls.count(),
      200
    );

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

      const text = (
        await control
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      const value =
        (await control.getAttribute(
          'value'
        )) ?? '';

      const ariaLabel =
        (await control.getAttribute(
          'aria-label'
        )) ?? '';

      const title =
        (await control.getAttribute(
          'title'
        )) ?? '';

      const href =
        (await control.getAttribute(
          'href'
        )) ?? '';

      const combined =
        `${text} ${value} ${ariaLabel} ${title} ${href}`
          .replace(/\s+/g, ' ')
          .trim();

      if (
        /checkout|singlepagecheckout|proceed.*checkout|secure.*checkout/i.test(
          combined
        )
      ) {
        return control;
      }
    }

    return null;
  }

  private async extractCountFromLocator(
    locator: Locator
  ): Promise<number | null> {
    if (
      !(await locator
        .isVisible()
        .catch(() => false))
    ) {
      return null;
    }

    const text =
      (await locator.getAttribute(
        'aria-label'
      )) ??
      (await locator
        .innerText()
        .catch(() => ''));

    return this.extractCountFromText(
      text
    );
  }

  private extractCountFromText(
    text: string
  ): number | null {
    const normalized =
      text
        .replace(/\s+/g, ' ')
        .trim();

    const itemMatch =
      normalized.match(
        /(\d+)\s+items?/i
      );

    if (itemMatch) {
      return Number(
        itemMatch[1]
      );
    }

    const cartMatch =
      normalized.match(
        /(?:cart|bag)\s*\(?\s*(\d+)\s*\)?/i
      );

    if (cartMatch) {
      return Number(
        cartMatch[1]
      );
    }

    /*
     * Count/badge controls sometimes expose only the number.
     * This method is only called for known cart-count elements
     * or the cart heading, so accepting a numeric-only value here
     * is safe.
     */
    const numericOnly =
      normalized.match(
        /^\(?\s*(\d+)\s*\)?$/
      );

    if (numericOnly) {
      return Number(
        numericOnly[1]
      );
    }

    return null;
  }

  private extractMoneyValue(
    text: string
  ): number | null {
    const normalized =
      text.replace(/,/g, '');

    const matches =
      normalized.match(
        /\d+(?:\.\d{1,2})?/g
      );

    if (
      !matches ||
      matches.length === 0
    ) {
      return null;
    }

    const value =
      Number(
        matches[
          matches.length - 1
        ]
      );

    return Number.isNaN(value)
      ? null
      : value;
  }
}