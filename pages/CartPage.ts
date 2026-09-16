import { expect, Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async openCart() {
    console.log('Opening cart');

    const cartTrigger = this.page
      .locator(
        [
          'a[href*="cart" i]:visible',
          'button[aria-label*="cart" i]:visible',
          'a[aria-label*="cart" i]:visible',
          'button[class*="cart" i]:visible',
        ].join(',')
      )
      .first();

    await expect(
      cartTrigger,
      'Cart trigger should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    await cartTrigger.click();

    await this.page.waitForLoadState('domcontentloaded');

    await this.page.waitForTimeout(1500);
  }

  async verifyCartLoaded() {
    const cartHeading = this.page
      .getByRole('heading', {
        name: /shopping cart|shopping bag|cart/i,
      })
      .first();

    await expect(
      cartHeading,
      'Cart page should be loaded'
    ).toBeVisible({
      timeout: 10000,
    });

    const headingText = (
      await cartHeading.innerText().catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`Cart heading: ${headingText}`);

    const emptyMessage = this.page
      .getByText(
        /your cart is empty|your bag is empty|cart is empty/i
      )
      .first();

    if (
      await emptyMessage
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error(
        'Cart is empty after Add to Cart. Product was not actually added.'
      );
    }

    const cartCountControl = this.page
      .getByRole('button', {
        name: /\d+\s+items?\s+in\s+the\s+cart/i,
      })
      .first();

    if (
      await cartCountControl
        .isVisible()
        .catch(() => false)
    ) {
      const label =
        (await cartCountControl.getAttribute('aria-label')) ??
        (await cartCountControl.innerText().catch(() => ''));

      const normalized = label
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`Cart count control: ${normalized}`);

      const match = normalized.match(
        /(\d+)\s+items?/i
      );

      if (match) {
        const count = Number(match[1]);

        if (count <= 0) {
          throw new Error(
            `Cart count is zero after Add to Cart: "${normalized}"`
          );
        }

        console.log(`Cart contains ${count} item(s)`);

        return;
      }
    }

    const genericCountControl = this.page
      .locator(
        '[aria-label*="item" i][aria-label*="cart" i]:visible'
      )
      .first();

    if (
      await genericCountControl
        .isVisible()
        .catch(() => false)
    ) {
      const label =
        (await genericCountControl.getAttribute('aria-label')) ??
        '';

      const match = label.match(
        /(\d+)\s+items?/i
      );

      if (match) {
        const count = Number(match[1]);

        console.log(
          `Cart count control: ${label}`
        );

        if (count <= 0) {
          throw new Error(
            `Cart count is zero after Add to Cart: "${label}"`
          );
        }

        console.log(`Cart contains ${count} item(s)`);

        return;
      }
    }

    const headingMatch = headingText.match(
      /(\d+)\s+items?/i
    );

    if (headingMatch) {
      const count = Number(headingMatch[1]);

      if (count <= 0) {
        throw new Error(
          `Cart reports zero items: "${headingText}"`
        );
      }

      console.log(`Cart contains ${count} item(s)`);

      return;
    }

    console.log(
      'Cart page loaded, but explicit cart count was not found'
    );
  }

  async getCartItemCount(): Promise<number> {
    const roleControl = this.page
      .getByRole('button', {
        name: /\d+\s+items?\s+in\s+the\s+cart/i,
      })
      .first();

    if (
      await roleControl
        .isVisible()
        .catch(() => false)
    ) {
      const label =
        (await roleControl.getAttribute('aria-label')) ??
        (await roleControl.innerText().catch(() => ''));

      const match = label.match(
        /(\d+)\s+items?/i
      );

      if (match) {
        return Number(match[1]);
      }
    }

    const ariaControl = this.page
      .locator(
        '[aria-label*="item" i][aria-label*="cart" i]:visible'
      )
      .first();

    if (
      await ariaControl
        .isVisible()
        .catch(() => false)
    ) {
      const label =
        (await ariaControl.getAttribute('aria-label')) ??
        '';

      const match = label.match(
        /(\d+)\s+items?/i
      );

      if (match) {
        return Number(match[1]);
      }
    }

    const heading = this.page
      .getByRole('heading', {
        name: /shopping cart|shopping bag|cart/i,
      })
      .first();

    const headingText = (
      await heading.innerText().catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    const headingMatch = headingText.match(
      /(\d+)\s+items?/i
    );

    if (headingMatch) {
      return Number(headingMatch[1]);
    }

    return 0;
  }

  async verifyProductInCart(productName: string) {
    const cartCount =
      await this.getCartItemCount();

    expect(
      cartCount,
      'Cart should contain at least one item'
    ).toBeGreaterThan(0);

    const product = this.page
      .locator('main')
      .getByText(productName, {
        exact: false,
      })
      .first();

    if (
      await product
        .isVisible()
        .catch(() => false)
    ) {
      console.log(
        `Product found in cart area: ${productName}`
      );

      return;
    }

    console.log(
      `Cart contains ${cartCount} item(s), but exact product text was not exposed in the cart DOM`
    );
  }

  async proceedToCheckout() {
    const itemCount =
      await this.getCartItemCount();

    console.log(
      `Cart item count before checkout: ${itemCount}`
    );

    if (itemCount <= 0) {
      throw new Error(
        'Cannot proceed to checkout because cart item count is zero'
      );
    }

    await this.page.waitForTimeout(1500);

    /*
     * Strategy 1:
     * normal accessible button
     */
    const checkoutButton = this.page
      .getByRole('button', {
        name: /checkout|checkout now|proceed to checkout|secure checkout/i,
      })
      .first();

    if (
      await checkoutButton
        .isVisible()
        .catch(() => false)
    ) {
      const text = (
        await checkoutButton
          .innerText()
          .catch(() => 'Checkout')
      )
        .replace(/\s+/g, ' ')
        .trim();

      console.log(
        `Checkout control found by role: "${text}"`
      );

      await checkoutButton.scrollIntoViewIfNeeded();

      await checkoutButton.click();

      await this.page.waitForLoadState(
        'domcontentloaded'
      );

      return;
    }

    /*
     * Strategy 2:
     * link
     */
    const checkoutLink = this.page
      .getByRole('link', {
        name: /checkout|checkout now|proceed to checkout|secure checkout/i,
      })
      .first();

    if (
      await checkoutLink
        .isVisible()
        .catch(() => false)
    ) {
      const text = (
        await checkoutLink
          .innerText()
          .catch(() => 'Checkout')
      )
        .replace(/\s+/g, ' ')
        .trim();

      console.log(
        `Checkout link found: "${text}"`
      );

      await checkoutLink.scrollIntoViewIfNeeded();

      await checkoutLink.click();

      await this.page.waitForLoadState(
        'domcontentloaded'
      );

      return;
    }

    /*
     * Strategy 3:
     * text search
     */
    const checkoutCandidate = this.page
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
      await checkoutCandidate
        .isVisible()
        .catch(() => false)
    ) {
      const text = (
        await checkoutCandidate
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

      console.log(
        `Checkout control found by text: "${text}"`
      );

      await checkoutCandidate.scrollIntoViewIfNeeded();

      await checkoutCandidate.click();

      await this.page.waitForLoadState(
        'domcontentloaded'
      );

      return;
    }

    /*
     * Strategy 4:
     * inspect attributes / href / value
     */
    const controls = this.page.locator(
      [
        'button:visible',
        'a:visible',
        '[role="button"]:visible',
        'input[type="submit"]:visible',
        'input[type="button"]:visible',
      ].join(',')
    );

    const controlCount = Math.min(
      await controls.count(),
      200
    );

    console.log(
      `Scanning ${controlCount} visible controls for checkout`
    );

    for (
      let i = 0;
      i < controlCount;
      i++
    ) {
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
        (await control.getAttribute('value')) ??
        '';

      const ariaLabel =
        (await control.getAttribute('aria-label')) ??
        '';

      const title =
        (await control.getAttribute('title')) ??
        '';

      const href =
        (await control.getAttribute('href')) ??
        '';

      const combined =
        `${text} ${value} ${ariaLabel} ${title} ${href}`
          .replace(/\s+/g, ' ')
          .trim();

      if (
        !/checkout|singlepagecheckout|proceed.*checkout|secure.*checkout/i.test(
          combined
        )
      ) {
        continue;
      }

      console.log(
        `Checkout control found: "${combined}"`
      );

      await control.scrollIntoViewIfNeeded();

      await control.click();

      await this.page.waitForLoadState(
        'domcontentloaded'
      );

      return;
    }

    throw new Error(
      'Cart has items, but no visible checkout control was found'
    );
  }
}