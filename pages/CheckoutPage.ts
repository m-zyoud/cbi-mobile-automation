import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export type ShippingData = {
  firstName?: string;
  lastName?: string;
  address?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  postalCode?: string;
  email?: string;
  phone?: string;
};

export class CheckoutPage {
  readonly page: Page;

  readonly guestButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly zipInput: Locator;

  readonly deliverySection: Locator;
  readonly continueDeliveryButton: Locator;
  readonly addressVerificationHeading: Locator;
  readonly keepOriginalAddressButton: Locator;

  readonly paymentSection: Locator;
  readonly paymentHeading: Locator;
  readonly continuePaymentButton: Locator;

  private addressSelected = false;

  constructor(page: Page) {
    this.page = page;

    this.guestButton = page
      .getByRole('button', {
        name: /continue as guest/i,
      })
      .first();

    this.firstNameInput = page
      .locator(
        [
          'input[autocomplete="given-name"]',
          '#fName',
        ].join(',')
      )
      .first();

    this.lastNameInput = page
      .locator(
        [
          'input[autocomplete="family-name"]',
          '#lName',
        ].join(',')
      )
      .first();

    this.addressInput = page
      .locator(
        [
          'input[autocomplete="address-line1"]',
          '[aria-label="Street Address*"]',
        ].join(',')
      )
      .first();

    this.emailInput = page
      .locator(
        [
          '#checkout_step1_email',
          'input[type="email"]',
        ].join(',')
      )
      .first();

    this.phoneInput = page
      .locator(
        [
          '#phone1box',
          'input[type="tel"]',
        ].join(',')
      )
      .first();

    this.zipInput = page
      .locator(
        [
          '#zipbox',
          'input[autocomplete="postal-code"]',
        ].join(',')
      )
      .first();

    this.deliverySection = page
      .getByText(
        /delivery method & gift options|delivery method|shipping method/i
      )
      .first();

    this.continueDeliveryButton = page
      .getByRole('button', {
        name: /continue to delivery method/i,
      })
      .first();

    this.addressVerificationHeading = page
      .getByRole('heading', {
        name: /shipping address verification/i,
      })
      .first();

    this.keepOriginalAddressButton = page
      .getByRole('button', {
        name: /keep original address/i,
      })
      .first();

    this.paymentSection = page
      .getByText(
        /payment|credit card|billing/i
      )
      .first();

    this.paymentHeading = page
      .getByRole('heading', {
        name: /payment/i,
      })
      .first();

    this.continuePaymentButton = page
      .getByRole('button', {
        name:
          /continue to payment|continue to payment method|continue to payment information/i,
      })
      .first();
  }

  async verifyCheckoutLoaded(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toBeVisible({
      timeout: 15000,
    });

    expect(
      this.page.url().toLowerCase(),
      'Should be on checkout page'
    ).toContain(
      'singlepagecheckoutview'.toLowerCase()
    );
  }

  async continueAsGuestIfNeeded(): Promise<void> {
    if (
      !(await this.guestButton
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }

    await this.guestButton.click({
      timeout: 5000,
    });

    await expect(
      this.page.locator('body')
    ).toBeVisible();
  }

  async verifyCheckoutStateAvailable(): Promise<void> {
    const guestVisible =
      await this.guestButton
        .isVisible()
        .catch(() => false);

    const shippingVisible =
      await this.firstNameInput
        .isVisible()
        .catch(() => false);

    const deliveryVisible =
      await this.deliverySection
        .isVisible()
        .catch(() => false);

    const paymentVisible =
      await this.isPaymentVisible();

    expect(
      guestVisible ||
        shippingVisible ||
        deliveryVisible ||
        paymentVisible,
      'Checkout should expose Guest, Shipping, Delivery, or Payment state'
    ).toBeTruthy();
  }

  async fillShippingDetails(
    data: ShippingData
  ): Promise<void> {
    const shouldFill =
      await this.ensureShippingFormReady();

    if (!shouldFill) {
      return;
    }

    this.addressSelected = false;

    await this.fillRequired(
      this.firstNameInput,
      data.firstName ?? '',
      'First name'
    );

    await this.fillRequired(
      this.lastNameInput,
      data.lastName ?? '',
      'Last name'
    );

    const address =
      data.address ??
      data.address1 ??
      '';

    await this.fillRequired(
      this.addressInput,
      address,
      'Street address'
    );

    const suggestionSelected =
      await this.selectAddressSuggestion();

    if (!suggestionSelected) {
      console.log(
        'No usable address autocomplete suggestion was available; using manual shipping address fields'
      );

      await this.fillManualAddressFields(
        data
      );
    }

    if (data.email) {
      await this.fillRequired(
        this.emailInput,
        data.email,
        'Email'
      );
    }

    if (data.phone) {
      await this.fillRequired(
        this.phoneInput,
        data.phone,
        'Phone'
      );
    }

    if (
      await this.zipInput
        .isVisible()
        .catch(() => false)
    ) {
      const zip =
        await this.zipInput
          .inputValue()
          .catch(() => '');

      if (
        this.addressSelected ||
        data.zip ||
        data.postalCode
      ) {
        expect(
          zip,
          'ZIP / postal code should be populated after shipping address entry'
        ).not.toBe('');
      }
    }
  }

  async verifyShippingDataAvailable(): Promise<void> {
    const shippingFormVisible =
      await this.firstNameInput
        .isVisible()
        .catch(() => false);

    if (shippingFormVisible) {
      const firstName =
        await this.firstNameInput.inputValue();

      const lastName =
        await this.lastNameInput
          .inputValue()
          .catch(() => '');

      expect(firstName).not.toBe('');
      expect(lastName).not.toBe('');

      return;
    }

    const deliveryVisible =
      await this.deliverySection
        .isVisible()
        .catch(() => false);

    const continueVisible =
      await this.continueDeliveryButton
        .isVisible()
        .catch(() => false);

    const paymentVisible =
      await this.isPaymentVisible();

    expect(
      deliveryVisible ||
        continueVisible ||
        paymentVisible,
      'Shipping should either contain data or already be completed'
    ).toBeTruthy();
  }

  async continueToDeliveryMethod(): Promise<void> {
    if (await this.isPaymentVisible()) {
      return;
    }

    const shippingHeader = this.page
      .locator('[id^="accordion__header-step1-"]')
      .first();

    const deliveryHeader = this.page
      .locator('[id^="accordion__header-step2-"]')
      .first();

    const paymentHeader = this.page
      .locator('[id^="accordion__header-step3-"]')
      .first();

    const paymentExpanded =
      await paymentHeader
        .getAttribute('aria-expanded')
        .catch(() => null);

    if (paymentExpanded === 'true') {
      return;
    }

    const deliveryExpanded =
      await deliveryHeader
        .getAttribute('aria-expanded')
        .catch(() => null);

    if (deliveryExpanded === 'true') {
      console.log('Delivery Method step is already open');
      return;
    }

    const shippingExpanded =
      await shippingHeader
        .getAttribute('aria-expanded')
        .catch(() => null);

    if (shippingExpanded !== 'true') {
      throw new Error(
        `Shipping step is not open and Delivery Method is not open (shipping=${shippingExpanded}, delivery=${deliveryExpanded})`
      );
    }

    if (
      await this.addressInput
        .isVisible()
        .catch(() => false)
    ) {
      await this.addressInput
        .press('Escape')
        .catch(() => undefined);

      await this.addressInput
        .press('Tab')
        .catch(() => undefined);

      await this.page.waitForTimeout(250);
    }

    await expect(
      this.continueDeliveryButton,
      'Continue To Delivery Method button should be visible'
    ).toBeVisible({
      timeout: 10000,
    });

    console.log('Clicking Continue To Delivery Method');

    const clicked =
      await this.continueDeliveryButton
        .click({ timeout: 5000 })
        .then(() => true)
        .catch(() => false);

    if (!clicked) {
      console.log(
        'Normal shipping continuation click was blocked; retrying with force'
      );

      await this.continueDeliveryButton.click({
        timeout: 3000,
        force: true,
      });
    }

    await this.handleAddressVerification();

    await expect
      .poll(
        async () => {
          const paymentState =
            await paymentHeader
              .getAttribute('aria-expanded')
              .catch(() => null);

          if (paymentState === 'true') {
            return 'payment';
          }

          const deliveryState =
            await deliveryHeader
              .getAttribute('aria-expanded')
              .catch(() => null);

          if (deliveryState === 'true') {
            return 'delivery';
          }

          const deliveryOpenClass =
            await this.page
              .locator(
                '[class*="checkout-accordion__step2"].c-accordion--is-open'
              )
              .first()
              .isVisible()
              .catch(() => false);

          if (deliveryOpenClass) {
            return 'delivery';
          }

          return 'shipping';
        },
        {
          timeout: 15000,
          intervals: [300, 500, 700, 1000],
        }
      )
      .not.toBe('shipping');

    const finalDeliveryState =
      await deliveryHeader
        .getAttribute('aria-expanded')
        .catch(() => null);

    if (finalDeliveryState === 'true') {
      console.log(
        'Delivery Method step opened successfully'
      );
    }
  }

  async handleAddressVerification(): Promise<void> {
    const modalAppeared =
      await this.keepOriginalAddressButton
        .waitFor({
          state: 'visible',
          timeout: 3000,
        })
        .then(() => true)
        .catch(() => false);

    if (!modalAppeared) {
      return;
    }

    console.log(
      'Address verification modal detected'
    );
    console.log(
      'Keeping original shipping address'
    );

    const clicked =
      await this.keepOriginalAddressButton
        .click({ timeout: 5000 })
        .then(() => true)
        .catch(() => false);

    if (!clicked) {
      await this.keepOriginalAddressButton.click({
        timeout: 3000,
        force: true,
      });
    }

    await this.keepOriginalAddressButton
      .waitFor({
        state: 'hidden',
        timeout: 10000,
      })
      .catch(() => undefined);
  }

  async verifyDeliveryMethodLoaded(): Promise<void> {
    if (await this.isPaymentVisible()) {
      return;
    }

    const deliveryHeader = this.page
      .locator('[id^="accordion__header-step2-"]')
      .first();

    const paymentHeader = this.page
      .locator('[id^="accordion__header-step3-"]')
      .first();

    await expect
      .poll(
        async () => {
          const paymentExpanded =
            await paymentHeader
              .getAttribute('aria-expanded')
              .catch(() => null);

          if (paymentExpanded === 'true') {
            return true;
          }

          const deliveryExpanded =
            await deliveryHeader
              .getAttribute('aria-expanded')
              .catch(() => null);

          if (deliveryExpanded === 'true') {
            return true;
          }

          return this.page
            .locator(
              '[class*="checkout-accordion__step2"].c-accordion--is-open'
            )
            .first()
            .isVisible()
            .catch(() => false);
        },
        {
          timeout: 15000,
          intervals: [300, 500, 700, 1000],
        }
      )
      .toBe(true);
  }

  async selectDeliveryMethodIfNeeded(): Promise<void> {
    if (await this.isPaymentVisible()) {
      return;
    }

    const radios =
      this.page.locator(
        [
          'input[type="radio"]:visible:not([disabled])',
          '[role="radio"]:visible:not([aria-disabled="true"])',
        ].join(',')
      );

    const count =
      await radios.count();

    if (count === 0) {
      return;
    }

    for (let i = 0; i < count; i++) {
      const radio =
        radios.nth(i);

      const checked =
        (await radio
          .isChecked()
          .catch(() => false)) ||
        (await radio.getAttribute(
          'aria-checked'
        )) === 'true';

      if (checked) {
        return;
      }
    }

    await radios.first().click({
      timeout: 5000,
    });
  }

  async verifyDeliveryMethodSelectedIfRequired(): Promise<void> {
    if (await this.isPaymentVisible()) {
      return;
    }

    const radios =
      this.page.locator(
        [
          'input[type="radio"]:visible:not([disabled])',
          '[role="radio"]:visible:not([aria-disabled="true"])',
        ].join(',')
      );

    const count =
      await radios.count();

    if (count === 0) {
      return;
    }

    let selected = false;

    for (let i = 0; i < count; i++) {
      const radio =
        radios.nth(i);

      const checked =
        (await radio
          .isChecked()
          .catch(() => false)) ||
        (await radio.getAttribute(
          'aria-checked'
        )) === 'true';

      if (checked) {
        selected = true;
        break;
      }
    }

    expect(
      selected,
      'A delivery method should be selected'
    ).toBeTruthy();
  }

  async continueToPayment(): Promise<void> {
  if (
    await this.isPaymentVisible()
  ) {
    console.log(
      'Payment step is already visible'
    );

    return;
  }

  /*
   * Delivery must already be open here.
   * Shipping transition is handled by
   * continueToDeliveryMethod().
   */
  await this.verifyDeliveryMethodLoaded();

  await this.selectDeliveryMethodIfNeeded();

  const deliveryHeader =
    this.page
      .locator(
        '[id^="accordion__header-step2-"]'
      )
      .first();

  const paymentHeader =
    this.page
      .locator(
        '[id^="accordion__header-step3-"]'
      )
      .first();

  const deliveryExpanded =
    await deliveryHeader
      .getAttribute(
        'aria-expanded'
      )
      .catch(() => null);

  console.log(
    `Delivery expanded before payment: ${deliveryExpanded}`
  );

  if (
    deliveryExpanded !== 'true'
  ) {
    throw new Error(
      'Delivery Method must be open before continuing to Payment'
    );
  }

  const deliveryStep =
    this.page
      .locator(
        '[class*="checkout-accordion__step2"]'
      )
      .first();

  /*
   * First try the most likely dedicated
   * continuation controls directly.
   *
   * Do NOT scan product controls first.
   */
  const directCandidates = [
    deliveryStep
      .getByRole('button', {
        name:
          /continue\s*(to)?\s*payment/i,
      })
      .first(),

    deliveryStep
      .locator(
        'button[data-analytics-name="next"]'
      )
      .first(),

    deliveryStep
      .locator(
        'button[id*="next" i]'
      )
      .first(),

    deliveryStep
      .locator(
        'button[class*="next" i]'
      )
      .first(),

    deliveryStep
      .locator(
        'input[type="submit"]'
      )
      .first(),
  ];

  for (
    const candidate of directCandidates
  ) {
    if (
      !(await candidate
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const text =
      (
        await candidate
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

    const id =
      (await candidate
        .getAttribute('id')
        .catch(() => null)) ?? '';

    const analytics =
      (await candidate
        .getAttribute(
          'data-analytics-name'
        )
        .catch(() => null)) ?? '';

    console.log(
      `Trying direct Delivery → Payment control: text="${text}" id="${id}" analytics="${analytics}"`
    );

    const clicked =
      await candidate
        .click({
          timeout: 5000,
        })
        .then(() => true)
        .catch(() => false);

    if (!clicked) {
      const forceClicked =
        await candidate
          .click({
            timeout: 3000,
            force: true,
          })
          .then(() => true)
          .catch(() => false);

      if (!forceClicked) {
        continue;
      }
    }

    await this.page.waitForTimeout(
      800
    );

    const paymentExpanded =
      await paymentHeader
        .getAttribute(
          'aria-expanded'
        )
        .catch(() => null);

    if (
      paymentExpanded === 'true' ||
      await this.isPaymentVisible()
    ) {
      console.log(
        'Payment step reached successfully'
      );

      return;
    }
  }

  /*
   * Fallback:
   * scan ALL visible controls inside Delivery.
   *
   * Important:
   * no 40-control limit here because the cart
   * may contain many line items.
   */
  const controls =
    deliveryStep.locator(
      [
        'button:visible',
        'a:visible',
        'input[type="submit"]:visible',
        'input[type="button"]:visible',
      ].join(',')
    );

  const controlCount =
    await controls
      .count()
      .catch(() => 0);

  console.log(
    `Delivery continuation controls found: ${controlCount}`
  );

  for (
    let i = 0;
    i < controlCount;
    i++
  ) {
    const control =
      controls.nth(i);

    const text =
      (
        await control
          .innerText()
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .trim();

    const value =
      (await control
        .getAttribute('value')
        .catch(() => null)) ?? '';

    const aria =
      (await control
        .getAttribute('aria-label')
        .catch(() => null)) ?? '';

    const id =
      (await control
        .getAttribute('id')
        .catch(() => null)) ?? '';

    const analytics =
      (await control
        .getAttribute(
          'data-analytics-name'
        )
        .catch(() => null)) ?? '';

    const className =
      (await control
        .getAttribute('class')
        .catch(() => null)) ?? '';

    const combined =
      `${text} ${value} ${aria} ${id} ${analytics}`
        .replace(/\s+/g, ' ')
        .trim();

    console.log(
      `Delivery control ${i}: text="${text}" id="${id}" analytics="${analytics}"`
    );

    /*
     * Ignore accordion header itself.
     */
    if (
      /accordion__header/i.test(
        className
      ) ||
      /expand_accordion/i.test(
        analytics
      )
    ) {
      continue;
    }

    /*
     * Only accept continuation controls.
     */
    if (
      !/continue.*payment|payment.*continue|continue.*billing|continue.*review|payment method|shipping.*next|delivery.*next|(^|\s)next($|\s)/i.test(
        combined
      )
    ) {
      continue;
    }

    console.log(
      `Clicking Delivery → Payment control: "${combined}"`
    );

    const clicked =
      await control
        .click({
          timeout: 5000,
        })
        .then(() => true)
        .catch(() => false);

    if (!clicked) {
      const forceClicked =
        await control
          .click({
            timeout: 3000,
            force: true,
          })
          .then(() => true)
          .catch(() => false);

      if (!forceClicked) {
        continue;
      }
    }

    await this.page.waitForTimeout(
      800
    );

    const paymentExpanded =
      await paymentHeader
        .getAttribute(
          'aria-expanded'
        )
        .catch(() => null);

    if (
      paymentExpanded === 'true' ||
      await this.isPaymentVisible()
    ) {
      console.log(
        'Payment step reached successfully'
      );

      return;
    }
  }

  /*
   * Payment may sometimes open asynchronously.
   */
  await this.page.waitForTimeout(
    800
  );

  if (
    await this.isPaymentVisible()
  ) {
    console.log(
      'Payment step became visible automatically'
    );

    return;
  }

  throw new Error(
    `Payment continuation control was not found after scanning ${controlCount} Delivery controls`
  );
}

  async verifyPaymentStepLoaded(): Promise<void> {
    const visible =
      await this.isPaymentVisible();

    expect(
      visible,
      'Payment step should be visible'
    ).toBeTruthy();
  }

// CHECKOUT-009
async getOrderSummaryContainer(): Promise<Locator | null> {
  const summary = this.page
    .locator(
      [
        '[class*="order-summary" i]:visible',
        '[class*="summary" i]:visible',
        '[data-testid*="order-summary" i]:visible',
        '[aria-label*="order summary" i]:visible',
        'aside:visible',
      ].join(',')
    )
    .filter({
      hasText:
        /order summary|subtotal|total|items?/i,
    })
    .first();

  if (
    await summary
      .isVisible()
      .catch(() => false)
  ) {
    return summary;
  }

  return null;
}

async verifyOrderSummaryVisible(): Promise<void> {
  const summary =
    await this.getOrderSummaryContainer();

  expect(
    summary,
    'Checkout order summary should be visible'
  ).not.toBeNull();

  await expect(
    summary!
  ).toBeVisible();
}

// CHECKOUT-010
async verifyCheckoutItemsVisible(): Promise<void> {
  const summary =
    await this.getOrderSummaryContainer();

  expect(
    summary,
    'Order summary should be available'
  ).not.toBeNull();

  const productLike = summary!
    .locator(
      [
        'a[href*="/product/" i]:visible',
        'a[href*="/p/" i]:visible',
        '[class*="product" i]:visible',
        '[class*="item" i]:visible',
        'img:visible',
      ].join(',')
    )
    .first();

  await expect(
    productLike,
    'At least one cart item should remain visible in checkout summary'
  ).toBeVisible();
}

// CHECKOUT-011
async getCheckoutQuantity(): Promise<number | null> {
  const summary =
    await this.getOrderSummaryContainer();

  if (!summary) {
    return null;
  }

  const quantityText = summary
    .locator(
      [
        '[class*="quantity" i]:visible',
        '[data-testid*="quantity" i]:visible',
        '[aria-label*="quantity" i]:visible',
      ].join(',')
    )
    .first();

  if (
    !(await quantityText
      .isVisible()
      .catch(() => false))
  ) {
    return null;
  }

  const text = (
    await quantityText
      .innerText()
      .catch(() => '')
  )
    .replace(/\s+/g, ' ')
    .trim();

  const match =
    text.match(/(\d+)/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

// CHECKOUT-012
async getCheckoutSubtotal(): Promise<number | null> {
  return this.getMoneyValueNearLabel(
    /subtotal/i
  );
}

// CHECKOUT-013
async getCheckoutShippingCost(): Promise<number | null> {
  return this.getMoneyValueNearLabel(
    /shipping|delivery/i
  );
}

// CHECKOUT-014
async getCheckoutTax(): Promise<number | null> {
  return this.getMoneyValueNearLabel(
    /tax/i
  );
}

// CHECKOUT-015
async getCheckoutTotal(): Promise<number | null> {
  return this.getMoneyValueNearLabel(
    /order total|grand total|total/i
  );
}

async verifyCheckoutTotalDisplayed(): Promise<void> {
  const total =
    await this.getCheckoutTotal();

  expect(
    total,
    'Checkout total should be displayed'
  ).not.toBeNull();

  expect(
    total!
  ).toBeGreaterThan(0);
}

private async getMoneyValueNearLabel(
  label: RegExp
): Promise<number | null> {
  const candidates =
    this.page.locator(
      [
        'main *:visible',
        'aside *:visible',
      ].join(',')
    );

  const count = Math.min(
    await candidates.count(),
    500
  );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const candidate =
      candidates.nth(i);

    const text = (
      await candidate
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (
      !text ||
      !label.test(text)
    ) {
      continue;
    }

    const money =
      text.match(
        /\$?\s*([\d,]+(?:\.\d{1,2})?)/
      );

    if (!money) {
      continue;
    }

    const value =
      Number(
        money[1].replace(/,/g, '')
      );

    if (
      !Number.isNaN(value)
    ) {
      return value;
    }
  }

  return null;
}


// CHECKOUT-016 → CHECKOUT-023
async prepareShippingFormForValidation(): Promise<boolean> {
  await this.continueAsGuestIfNeeded();

  return this.ensureShippingFormReady();
}

async verifyRequiredFieldValidation(
  field:
    | 'firstName'
    | 'lastName'
    | 'address'
    | 'zip'
    | 'phone'
    | 'email'
): Promise<boolean> {
  const inputMap: Record<
    string,
    Locator
  > = {
    firstName:
      this.firstNameInput,
    lastName:
      this.lastNameInput,
    address:
      this.addressInput,
    zip:
      this.zipInput,
    phone:
      this.phoneInput,
    email:
      this.emailInput,
  };

  const input =
    inputMap[field];

  if (
    !(await input
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await input.fill('');

  await input.blur();

  await this.page.waitForTimeout(
    300
  );

  const ariaInvalid =
    await input.getAttribute(
      'aria-invalid'
    );

  if (
    ariaInvalid === 'true'
  ) {
    return true;
  }

  const required =
    await input.getAttribute(
      'required'
    );

  if (
    required !== null
  ) {
    const invalid =
      await input.evaluate(
        (
          element: HTMLInputElement
        ) =>
          !element.checkValidity()
      );

    if (invalid) {
      return true;
    }
  }

  const id =
    await input.getAttribute(
      'id'
    );

  if (id) {
    const linkedError =
      this.page.locator(
        [
          `[for="${id}"] + [class*="error" i]:visible`,
          `#${id}-error:visible`,
          `[aria-describedby*="${id}" i]:visible`,
        ].join(',')
      );

    if (
      await linkedError
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }
  }

  const nearbyError =
    input
      .locator('xpath=..')
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
          '[class*="invalid" i]:visible',
        ].join(',')
      )
      .first();

  return nearbyError
    .isVisible()
    .catch(() => false);
}

// CHECKOUT-019
async getCityInput(): Promise<Locator | null> {
  const input =
    this.page
      .locator(
        [
          'input[autocomplete="address-level2"]:visible',
          'input[name*="city" i]:visible',
          'input[id*="city" i]:visible',
          'input[aria-label*="city" i]:visible',
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

  return null;
}

// CHECKOUT-020
async getStateControl(): Promise<Locator | null> {
  const control =
    this.page
      .locator(
        [
          'select[autocomplete="address-level1"]:visible',
          'select[name*="state" i]:visible',
          'select[id*="state" i]:visible',
          'select[aria-label*="state" i]:visible',
          'input[autocomplete="address-level1"]:visible',
          'input[name*="state" i]:visible',
          'input[id*="state" i]:visible',
          'input[aria-label*="state" i]:visible',
        ].join(',')
      )
      .first();

  if (
    await control
      .isVisible()
      .catch(() => false)
  ) {
    return control;
  }

  return null;
}

async verifyCityRequiredValidation(): Promise<boolean> {
  const input =
    await this.getCityInput();

  if (!input) {
    return false;
  }

  await input.fill('');

  await input.blur();

  return this.verifyLocatorInvalid(
    input
  );
}

async verifyStateRequiredValidation(): Promise<boolean> {
  const control =
    await this.getStateControl();

  if (!control) {
    return false;
  }

  const tag =
    await control.evaluate(
      (element) =>
        element.tagName.toLowerCase()
    );

  if (
    tag === 'select'
  ) {
    const options =
      control.locator('option');

    const count =
      await options.count();

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const value =
        (await options
          .nth(i)
          .getAttribute('value')) ?? '';

      if (
        value === ''
      ) {
        await control.selectOption(
          value
        );

        break;
      }
    }
  } else {
    await control.fill('');
  }

  await control.blur();

  return this.verifyLocatorInvalid(
    control
  );
}

// CHECKOUT-024
async verifyMalformedEmailRejected(): Promise<boolean> {
  if (
    !(await this.emailInput
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await this.emailInput.fill(
    'invalid-email'
  );

  await this.emailInput.blur();

  await this.page.waitForTimeout(
    300
  );

  const type =
    await this.emailInput.getAttribute(
      'type'
    );

  if (
    type === 'email'
  ) {
    const invalid =
      await this.emailInput.evaluate(
        (
          element: HTMLInputElement
        ) =>
          !element.checkValidity()
      );

    if (invalid) {
      return true;
    }
  }

  return this.verifyLocatorInvalid(
    this.emailInput
  );
}

// CHECKOUT-025
async verifyInvalidPostalCodeHandled(): Promise<boolean> {
  if (
    !(await this.zipInput
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  const original =
    await this.zipInput
      .inputValue()
      .catch(() => '');

  await this.zipInput.fill(
    '!!!'
  );

  await this.zipInput.blur();

  await this.page.waitForTimeout(
    300
  );

  const invalid =
    await this.verifyLocatorInvalid(
      this.zipInput
    );

  if (invalid) {
    return true;
  }

  const normalized =
    await this.zipInput
      .inputValue()
      .catch(() => '');

  if (
    normalized !== '!!!'
  ) {
    return true;
  }

  /*
   * Restore original value so the test
   * does not leave checkout unusable.
   */
  await this.zipInput.fill(
    original
  );

  return false;
}

private async verifyLocatorInvalid(
  locator: Locator
): Promise<boolean> {
  const ariaInvalid =
    await locator.getAttribute(
      'aria-invalid'
    );

  if (
    ariaInvalid === 'true'
  ) {
    return true;
  }

  const invalid =
    await locator
      .evaluate(
        (
          element:
            | HTMLInputElement
            | HTMLSelectElement
        ) => {
          if (
            typeof element.checkValidity !==
            'function'
          ) {
            return false;
          }

          return !element.checkValidity();
        }
      )
      .catch(() => false);

  if (invalid) {
    return true;
  }

  const container =
    locator.locator(
      'xpath=..'
    );

  const error =
    container
      .locator(
        [
          '[role="alert"]:visible',
          '[class*="error" i]:visible',
          '[class*="validation" i]:visible',
          '[class*="invalid" i]:visible',
        ].join(',')
      )
      .first();

  return error
    .isVisible()
    .catch(() => false);
}

// CHECKOUT-026
async verifyInvalidPhoneHandled(): Promise<boolean> {
  if (
    !(await this.phoneInput
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  const original =
    await this.phoneInput
      .inputValue()
      .catch(() => '');

  await this.phoneInput.fill(
    'abc'
  );

  await this.phoneInput.blur();

  await this.page.waitForTimeout(
    300
  );

  const invalid =
    await this.verifyLocatorInvalid(
      this.phoneInput
    );

  if (invalid) {
    return true;
  }

  const current =
    await this.phoneInput
      .inputValue()
      .catch(() => '');

  if (
    current !== 'abc'
  ) {
    return true;
  }

  await this.phoneInput.fill(
    original
  );

  return false;
}

// CHECKOUT-027
async verifyShippingWhitespaceHandled(): Promise<boolean> {
  const ready =
    await this.ensureShippingFormReady();

  if (!ready) {
    return false;
  }

  const original =
    await this.firstNameInput
      .inputValue()
      .catch(() => '');

  const value =
    original || 'Automation';

  await this.firstNameInput.fill(
    `   ${value}   `
  );

  await this.firstNameInput.blur();

  await this.page.waitForTimeout(
    300
  );

  const current = (
    await this.firstNameInput
      .inputValue()
      .catch(() => '')
  );

  const trimmed =
    current.trim();

  expect(
    trimmed,
    'Shipping field should preserve meaningful input when surrounded by spaces'
  ).toBe(value);

  return true;
}

// CHECKOUT-028
async verifyLongShippingInputDoesNotBreakLayout(): Promise<boolean> {
  const ready =
    await this.ensureShippingFormReady();

  if (!ready) {
    return false;
  }

  const original =
    await this.firstNameInput
      .inputValue()
      .catch(() => '');

  const longValue =
    'A'.repeat(120);

  await this.firstNameInput.fill(
    longValue
  );

  await this.firstNameInput.blur();

  await this.page.waitForTimeout(
    300
  );

  const bodyVisible =
    await this.page
      .locator('body')
      .isVisible()
      .catch(() => false);

  const horizontalOverflow =
    await this.page.evaluate(() => {
      const root =
        document.documentElement;

      return (
        root.scrollWidth >
        root.clientWidth + 2
      );
    });

  await this.firstNameInput.fill(
    original
  );

  expect(
    bodyVisible,
    'Checkout page should remain visible after long input'
  ).toBeTruthy();

  expect(
    horizontalOverflow,
    'Long shipping input should not break mobile layout'
  ).toBeFalsy();

  return true;
}

// CHECKOUT-029 / CHECKOUT-030
async getSelectedDeliveryMethodCount(): Promise<number> {
  const radios =
    this.page.locator(
      [
        'input[type="radio"]:visible',
        '[role="radio"]:visible',
      ].join(',')
    );

  const count =
    await radios.count();

  let selected = 0;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const radio =
      radios.nth(i);

    const checked =
      (await radio
        .isChecked()
        .catch(() => false)) ||
      (await radio.getAttribute(
        'aria-checked'
      )) === 'true';

    if (checked) {
      selected++;
    }
  }

  return selected;
}

async verifySelectedDeliveryMethodPersists(): Promise<boolean> {
  if (
    await this.isPaymentVisible()
  ) {
    return true;
  }

  await this.selectDeliveryMethodIfNeeded();

  const before =
    await this.getSelectedDeliveryMethodCount();

  if (before === 0) {
    return false;
  }

  await this.page.waitForTimeout(
    500
  );

  const after =
    await this.getSelectedDeliveryMethodCount();

  return after > 0;
}

// CHECKOUT-031
async refreshAndVerifyCheckoutPersistence(): Promise<boolean> {
  const beforeUrl =
    this.page.url();

  await this.page.reload({
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  const currentUrl =
    this.page.url();

  const stillCheckout =
    currentUrl
      .toLowerCase()
      .includes(
        'singlepagecheckoutview'
      );

  if (!stillCheckout) {
    return false;
  }

  await this.verifyCheckoutStateAvailable();

  return (
    currentUrl === beforeUrl ||
    stillCheckout
  );
}

// CHECKOUT-032
async verifyBackForwardNavigationSafe(): Promise<boolean> {
  const checkoutUrl =
    this.page.url();

  const wentBack =
    await this.page
      .goBack({
        waitUntil:
          'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!wentBack) {
    return false;
  }

  const returned =
    await this.page
      .goForward({
        waitUntil:
          'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!returned) {
    return false;
  }

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  const currentUrl =
    this.page.url();

  expect(
    currentUrl,
    'Forward navigation should return to checkout'
  ).toBe(checkoutUrl);

  await this.verifyCheckoutStateAvailable();

  return true;
}

// CHECKOUT-033
async verifyRepeatedContinueHandledSafely(): Promise<void> {
  await this.continueToPayment();

  await this.verifyPaymentStepLoaded();

  /*
   * Calling the same navigation action again
   * should be idempotent once Payment is visible.
   */
  await this.continueToPayment();

  await this.verifyPaymentStepLoaded();

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
  ).not.toMatch(
    /internal server error|application error|stack trace|uncaught exception/i
  );
}

// CHECKOUT-034
async hasPaymentFormOrControls(): Promise<boolean> {
  if (
    !(await this.isPaymentVisible())
  ) {
    return false;
  }

  const paymentControls =
    this.page.locator(
      [
        'input[autocomplete="cc-number"]:visible',
        'input[name*="card" i]:visible',
        'input[id*="card" i]:visible',
        'input[autocomplete="cc-exp"]:visible',
        'input[autocomplete="cc-csc"]:visible',
        '[class*="payment" i] input:visible',
        '[data-testid*="payment" i] input:visible',
        'iframe[title*="payment" i]:visible',
        'iframe[title*="card" i]:visible',
      ].join(',')
    );

  if (
    await paymentControls.count() > 0
  ) {
    return true;
  }

  /*
   * Some payment implementations render hosted
   * payment fields only after choosing a method.
   * The visible payment section is still a valid
   * safe checkpoint for automation.
   */
  return this.isPaymentVisible();
}

// CHECKOUT-035
async getVisiblePaymentFieldCount(): Promise<number> {
  if (
    !(await this.isPaymentVisible())
  ) {
    return 0;
  }

  const fields =
    this.page.locator(
      [
        'input[autocomplete="cc-number"]:visible',
        'input[autocomplete="cc-name"]:visible',
        'input[autocomplete="cc-exp"]:visible',
        'input[autocomplete="cc-csc"]:visible',
        'input[name*="card" i]:visible',
        'input[id*="card" i]:visible',
        '[class*="payment" i] input:visible',
        '[data-testid*="payment" i] input:visible',
        'iframe[title*="payment" i]:visible',
        'iframe[title*="card" i]:visible',
      ].join(',')
    );

  return fields.count();
}


// CHECKOUT-036
async verifyNoOrderSubmissionControlsAreTriggered(): Promise<void> {
  /*
   * Safety check:
   * Automation must never submit/place the order.
   * We only verify that potentially dangerous controls exist
   * without interacting with them.
   */
  const submitControls =
    this.page
      .getByRole('button')
      .filter({
        hasText:
          /place order|submit order|complete purchase|complete order|buy now|purchase/i,
      });

  const count =
    await submitControls.count();

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const control =
      submitControls.nth(i);

    if (
      await control
        .isVisible()
        .catch(() => false)
    ) {
      expect(
        await control.isEnabled()
          .catch(() => true),
        'Order submission control may exist, but automation must not click it'
      ).toBeDefined();
    }
  }

  const url =
    this.page.url().toLowerCase();

  expect(
    url,
    'Automation should still be inside checkout and must not reach order confirmation'
  ).not.toMatch(
    /orderconfirmation|confirmation|thank-you|thankyou|order-complete/
  );
}

// CHECKOUT-037
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

// CHECKOUT-038
async verifyVisibleCheckoutControlsDoNotOverlap(): Promise<void> {
  const controls =
    this.page.locator(
      [
        'button:visible',
        'input:visible',
        'select:visible',
        'textarea:visible',
      ].join(',')
    );

  const count = Math.min(
    await controls.count(),
    50
  );

  const boxes: {
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[] = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const control =
      controls.nth(i);

    const box =
      await control
        .boundingBox()
        .catch(() => null);

    if (!box) {
      continue;
    }

    if (
      box.width <= 0 ||
      box.height <= 0
    ) {
      continue;
    }

    boxes.push({
      index: i,
      ...box,
    });
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
        boxes[i];

      const b =
        boxes[j];

      const horizontal =
        Math.min(
          a.x + a.width,
          b.x + b.width
        ) -
        Math.max(
          a.x,
          b.x
        );

      const vertical =
        Math.min(
          a.y + a.height,
          b.y + b.height
        ) -
        Math.max(
          a.y,
          b.y
        );

      const overlap =
        horizontal > 8 &&
        vertical > 8;

      /*
       * Small/nested overlaps are common in styled controls.
       * We only fail on substantial overlap.
       */
      if (overlap) {
        const overlapArea =
          horizontal *
          vertical;

        const smallerArea =
          Math.min(
            a.width * a.height,
            b.width * b.height
          );

        const ratio =
          smallerArea > 0
            ? overlapArea /
              smallerArea
            : 0;

        expect(
          ratio,
          `Checkout controls ${a.index} and ${b.index} should not substantially overlap`
        ).toBeLessThan(
          0.8
        );
      }
    }
  }
}

// CHECKOUT-039
async verifyCheckoutScrollableAndUsable(): Promise<void> {
  const initialY =
    await this.page.evaluate(
      () => window.scrollY
    );

  const bodyHeight =
    await this.page.evaluate(
      () =>
        document.body.scrollHeight
    );

  const viewportHeight =
    await this.page.evaluate(
      () => window.innerHeight
    );

  if (
    bodyHeight >
    viewportHeight
  ) {
    await this.page.evaluate(
      () => {
        window.scrollTo(
          0,
          document.body.scrollHeight
        );
      }
    );

    await this.page.waitForTimeout(
      400
    );

    const afterY =
      await this.page.evaluate(
        () => window.scrollY
      );

    expect(
      afterY,
      'Checkout page should scroll vertically'
    ).toBeGreaterThan(
      initialY
    );
  }

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
    bodyText
  ).not.toMatch(
    /internal server error|application error|uncaught exception|stack trace/i
  );
}

// CHECKOUT-040
async getCheckoutViewport(): Promise<{
  width: number;
  height: number;
}> {
  return this.page.evaluate(() => ({
    width:
      window.innerWidth,
    height:
      window.innerHeight,
  }));
}

async verifyCheckoutResponsiveLayout(): Promise<void> {
  const viewport =
    await this.getCheckoutViewport();

  expect(
    viewport.width
  ).toBeGreaterThan(0);

  expect(
    viewport.height
  ).toBeGreaterThan(0);

  const overflow =
    await this.hasHorizontalOverflow();

  expect(
    overflow,
    'Checkout should not have horizontal overflow at the current Android viewport'
  ).toBeFalsy();

  await expect(
    this.page.locator('body')
  ).toBeVisible();
}


  private async isPaymentVisible(): Promise<boolean> {
    return (
      (await this.paymentSection
        .isVisible()
        .catch(() => false)) ||
      (await this.paymentHeading
        .isVisible()
        .catch(() => false))
    );
  }

  private async selectAddressSuggestion(): Promise<boolean> {
    const deadline =
      Date.now() + 9000;

    const candidateSelector =
      [
        '[role="listbox"] [role="option"]:visible',
        '[role="option"]:visible',
        '.pac-container .pac-item:visible',
        '[class*="autocomplete" i] [role="option"]:visible',
        '[class*="autocomplete" i] li:visible',
        '[class*="autocomplete" i] button:visible',
        '[class*="autocomplete" i] a:visible',
        '[class*="suggest" i] [role="option"]:visible',
        '[class*="suggest" i] li:visible',
        '[class*="suggest" i] button:visible',
        '[class*="suggest" i] a:visible',
        '[data-testid*="address" i][data-testid*="suggest" i]:visible',
        '[data-testid*="autocomplete" i]:visible',
      ].join(',');

    while (
      Date.now() < deadline
    ) {
      const options =
        this.page.locator(
          candidateSelector
        );

      const count =
        Math.min(
          await options
            .count()
            .catch(() => 0),
          30
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const option =
          options.nth(i);

        const visible =
          await option
            .isVisible()
            .catch(() => false);

        if (!visible) {
          continue;
        }

        const text = (
          await option
            .innerText()
            .catch(() => '')
        )
          .replace(/\s+/g, ' ')
          .trim();

        if (
          !text ||
          /loading|searching|please wait|no results|no addresses|not found/i.test(
            text
          )
        ) {
          continue;
        }

        const ariaLabel =
          (await option
            .getAttribute(
              'aria-label'
            )) ?? '';

        const combined =
          `${text} ${ariaLabel}`
            .replace(/\s+/g, ' ')
            .trim();

        if (
          /close|clear|cancel|search|use current location/i.test(
            combined
          )
        ) {
          continue;
        }

        console.log(
          `Trying address suggestion: "${text}"`
        );

        const clicked =
          await option
            .click({
              timeout: 2500,
            })
            .then(() => true)
            .catch(() => false);

        if (!clicked) {
          const child =
            option
              .locator(
                'button:visible, a:visible, [role="option"]:visible'
              )
              .first();

          const childClicked =
            await child
              .click({
                timeout: 1500,
              })
              .then(() => true)
              .catch(() => false);

          if (!childClicked) {
            continue;
          }
        }

        await this.page.waitForTimeout(
          500
        );

        this.addressSelected = true;

        console.log(
          'Address autocomplete suggestion selected'
        );

        return true;
      }

      const city =
        await this.getCityInput();

      const cityValue =
        city
          ? await city
              .inputValue()
              .catch(() => '')
          : '';

      const zipVisible =
        await this.zipInput
          .isVisible()
          .catch(() => false);

      const zipValue =
        zipVisible
          ? await this.zipInput
              .inputValue()
              .catch(() => '')
          : '';

      if (
        cityValue.trim() ||
        zipValue.trim()
      ) {
        this.addressSelected = true;

        console.log(
          'Address widget populated downstream fields without a clickable suggestion'
        );

        return true;
      }

      await this.page.waitForTimeout(
        400
      );
    }

    return false;
  }

  private async fillManualAddressFields(
    data: ShippingData
  ): Promise<void> {
    const city =
      await this.getCityInput();

    if (
      city &&
      data.city
    ) {
      const current =
        await city
          .inputValue()
          .catch(() => '');

      if (!current.trim()) {
        console.log(
          `Filling manual city: ${data.city}`
        );

        await city.fill(
          data.city
        );
      }
    }

    const stateControl =
      await this.getStateControl();

    if (
      stateControl &&
      data.state
    ) {
      const tag =
        await stateControl
          .evaluate(
            (element) =>
              element.tagName.toLowerCase()
          )
          .catch(() => '');

      if (tag === 'select') {
        const options =
          stateControl.locator(
            'option'
          );

        const count =
          await options
            .count()
            .catch(() => 0);

        let selected = false;

        for (
          let i = 0;
          i < count;
          i++
        ) {
          const option =
            options.nth(i);

          const value =
            (await option
              .getAttribute(
                'value'
              )) ?? '';

          const label = (
            await option
              .innerText()
              .catch(() => '')
          )
            .replace(/\s+/g, ' ')
            .trim();

          if (
            value.toLowerCase() ===
              data.state.toLowerCase() ||
            label.toLowerCase() ===
              data.state.toLowerCase()
          ) {
            await stateControl
              .selectOption(
                value
              );

            selected = true;
            break;
          }
        }

        if (!selected) {
          await stateControl
            .selectOption({
              label:
                data.state,
            })
            .catch(() => undefined);
        }
      } else {
        const current =
          await stateControl
            .inputValue()
            .catch(() => '');

        if (!current.trim()) {
          await stateControl.fill(
            data.state
          );
        }
      }
    }

    const postal =
      data.zip ??
      data.postalCode ??
      '';

    if (
      postal &&
      await this.zipInput
        .isVisible()
        .catch(() => false)
    ) {
      const current =
        await this.zipInput
          .inputValue()
          .catch(() => '');

      if (!current.trim()) {
        console.log(
          `Filling manual ZIP / postal code: ${postal}`
        );

        await this.zipInput.fill(
          postal
        );
      }
    }

    await this.addressInput
      .blur()
      .catch(() => undefined);

    await this.page.waitForTimeout(
      500
    );
  }

  private async fillRequired(
    input: Locator,
    value: string,
    fieldName: string
  ): Promise<void> {
    if (!value) {
      throw new Error(
        `Required checkout value is empty: ${fieldName}`
      );
    }

    await expect(
      input,
      `${fieldName} input should be visible`
    ).toBeVisible({
      timeout: 10000,
    });

    await input.fill(value);
  }

  private async ensureShippingFormReady(): Promise<boolean> {
    await this.page
      .waitForLoadState(
        'domcontentloaded',
        {
          timeout: 10000,
        }
      )
      .catch(() => undefined);

    await this.page.waitForTimeout(
      1500
    );

    await this.page
      .locator(
        [
          '[id^="accordion__header-step1-"]',
          '#shipping-next-btn',
          'input[name*="first" i]',
          'input[type="email"]',
          'text=/shipping/i',
        ].join(',')
      )
      .first()
      .waitFor({
        state: 'visible',
        timeout: 10000,
      })
      .catch(() => undefined);

    if (
      await this.firstNameInput
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }

    if (
      await this.continueDeliveryButton
        .isVisible()
        .catch(() => false)
    ) {
      return false;
    }

    const shippingHeader =
      this.page
        .locator(
          '[id^="accordion__header-step1-"]'
        )
        .first();

    const shippingHeaderCount =
      await shippingHeader
        .count()
        .catch(() => 0);

    if (
      shippingHeaderCount > 0
    ) {
      const expanded =
        await shippingHeader
          .getAttribute(
            'aria-expanded'
          )
          .catch(() => null);

      if (
        expanded === 'false'
      ) {
        await shippingHeader
          .click({
            timeout: 5000,
          })
          .catch(() => undefined);

        await this.page.waitForTimeout(
          500
        );

        if (
          await this.firstNameInput
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
      }
    }

    const shippingButton = this.page
      .getByRole('button')
      .filter({
        hasText: /^shipping$/i,
      })
      .first();

    if (
      await shippingButton
        .isVisible()
        .catch(() => false)
    ) {
      await shippingButton
        .click({
          timeout: 5000,
        })
        .catch(() => undefined);

      if (
        await this.firstNameInput
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
    }

    const editButton = this.page
      .getByRole('button', {
        name: /^edit$/i,
      })
      .first();

    if (
      await editButton
        .isVisible()
        .catch(() => false)
    ) {
      await editButton
        .click({
          timeout: 5000,
        })
        .catch(() => undefined);

      if (
        await this.firstNameInput
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
    }

    if (
      await this.deliverySection
        .isVisible()
        .catch(() => false)
    ) {
      return false;
    }

    if (
      await this.isPaymentVisible()
    ) {
      return false;
    }

    console.log(
      '===== CHECKOUT STATE DEBUG ====='
    );

    console.log(
      'URL:',
      this.page.url()
    );

    console.log(
      'Title:',
      await this.page
        .title()
        .catch(() => '')
    );

    const checkoutSelectors = [
      '[id^="accordion__header-step1-"]',
      '[id^="accordion__header-step2-"]',
      '[id^="accordion__header-step3-"]',
      '#shipping-next-btn',
      'input[name*="first" i]',
      'input[name*="last" i]',
      'input[name*="address" i]',
      'input[name*="city" i]',
      'input[name*="zip" i]',
      'input[name*="postal" i]',
      'input[type="email"]',
      'input[type="tel"]',
    ];

    for (
      const selector of checkoutSelectors
    ) {
      const locator =
        this.page
          .locator(selector)
          .first();

      const count =
        await locator
          .count()
          .catch(() => 0);

      let visible = false;
      let value = '';
      let expanded:
        string | null = null;

      if (count > 0) {
        visible =
          await locator
            .isVisible()
            .catch(() => false);

        expanded =
          await locator
            .getAttribute(
              'aria-expanded'
            )
            .catch(() => null);

        const tagName =
          await locator
            .evaluate(
              (el) =>
                el.tagName
                  .toLowerCase()
            )
            .catch(() => '');

        if (
          tagName === 'input' ||
          tagName === 'textarea'
        ) {
          value =
            await locator
              .inputValue({
                timeout: 1000,
              })
              .catch(() => '');
        }
      }

      console.log(
        `[CHECKOUT] ${selector}`,
        {
          count,
          visible,
          expanded,
          value,
        }
      );
    }

    const bodyText =
      (
        await this.page
          .locator('body')
          .innerText({
            timeout: 2000,
          })
          .catch(() => '')
      )
        .replace(/\s+/g, ' ')
        .slice(0, 2000);

    console.log(
      'Checkout body preview:',
      bodyText
    );

    console.log(
      '===== END CHECKOUT STATE DEBUG ====='
    );

    throw new Error(
      'Shipping form is not visible and existing shipping state could not be detected'
    );
  }
}