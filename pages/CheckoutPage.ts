import { expect, Page } from '@playwright/test';

type ShippingData = {
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
  private addressSelected = false;

  constructor(private readonly page: Page) {}

  async verifyCheckoutLoaded() {
    console.log('Verifying checkout page');

    await expect(this.page.locator('body')).toBeVisible({
      timeout: 15000,
    });

    expect(
      this.page.url(),
      'Should be on checkout page'
    ).toContain('SinglePageCheckoutView');

    console.log(`Checkout URL: ${this.page.url()}`);
  }

  async continueAsGuestIfNeeded() {
    console.log('Checking guest checkout');

    const guestButton = this.page
      .getByRole('button', {
        name: /continue as guest/i,
      })
      .first();

    if (
      !(await guestButton
        .isVisible()
        .catch(() => false))
    ) {
      console.log('Guest step already completed');
      return;
    }

    console.log('Continue As Guest found');

    await guestButton.click({
      timeout: 5000,
    });

    await this.page.waitForTimeout(1500);

    console.log('Guest checkout opened');
  }

  async fillShippingDetails(
    data: ShippingData
  ) {
    console.log('Filling shipping details');
    const shouldFill =
  await this.ensureShippingFormReady();

if (!shouldFill) {
  console.log(
    'Existing shipping information will be reused'
  );

  return;
}

    this.addressSelected = false;

    await this.fillRequired(
      [
        'input[autocomplete="given-name"]',
        '#fName',
      ],
      data.firstName ?? ''
    );

    await this.fillRequired(
      [
        'input[autocomplete="family-name"]',
        '#lName',
      ],
      data.lastName ?? ''
    );

    const address =
      data.address ??
      data.address1 ??
      '';

    await this.fillRequired(
      [
        'input[autocomplete="address-line1"]',
        '[aria-label="Street Address*"]',
      ],
      address
    );

    await this.selectAddressSuggestion();

    if (data.email) {
      await this.fillRequired(
        [
          '#checkout_step1_email',
          'input[type="email"]',
        ],
        data.email
      );
    }

    if (data.phone) {
      await this.fillRequired(
        [
          '#phone1box',
          'input[type="tel"]',
        ],
        data.phone
      );
    }

    if (this.addressSelected) {
      console.log(
        'City / State / ZIP populated by address autocomplete'
      );

      const zip = this.page
        .locator(
          '#zipbox, input[autocomplete="postal-code"]'
        )
        .first();

      if (
        await zip
          .isVisible()
          .catch(() => false)
      ) {
        console.log(
          `Detected ZIP: ${await zip.inputValue()}`
        );
      }
    }

    console.log('Shipping details completed');
  }

  async continueToDeliveryMethod() {
  console.log('Continuing to Delivery Method');

  /*
   * Case 1:
   * Checkout is already on/past Delivery Method.
   */
  const deliverySection = this.page
    .getByText(
      /delivery method & gift options|delivery method|shipping method/i
    )
    .first();

  if (
    await deliverySection
      .isVisible()
      .catch(() => false)
  ) {
    console.log(
      'Delivery Method is already available - no continuation click required'
    );

    return;
  }

  /*
   * Case 2:
   * Shipping is still active and we need to continue.
   */
  const button = this.page
    .getByRole('button', {
      name: /continue to delivery method/i,
    })
    .first();

  if (
    !(await button
      .isVisible()
      .catch(() => false))
  ) {
    throw new Error(
      'Neither Delivery Method section nor Continue To Delivery Method button is visible'
    );
  }

  console.log(
    'Clicking Continue To Delivery Method'
  );

  const clicked = await button
    .click({
      timeout: 7000,
    })
    .then(() => true)
    .catch(() => false);

  if (!clicked) {
    console.log(
      'Using DOM click fallback'
    );

    await button.evaluate(
      (element: HTMLElement) => {
        element.click();
      }
    );
  }

  await this.page.waitForTimeout(
    1500
  );

  await this.handleAddressVerification();
}

  async handleAddressVerification() {
    const heading = this.page
      .getByRole('heading', {
        name: /shipping address verification/i,
      })
      .first();

    if (
      !(await heading
        .isVisible()
        .catch(() => false))
    ) {
      console.log(
        'Address verification modal not shown'
      );

      return;
    }

    console.log(
      'Shipping Address Verification detected'
    );

    const keepOriginal = this.page
      .getByRole('button', {
        name: /keep original address/i,
      })
      .first();

    await expect(
      keepOriginal
    ).toBeVisible({
      timeout: 5000,
    });

    console.log(
      'Choosing Keep Original Address'
    );

    await keepOriginal.click({
      timeout: 5000,
    });

    await this.page.waitForTimeout(1500);
  }

  async verifyDeliveryMethodLoaded() {
  console.log(
    'Verifying Delivery Method section'
  );

  const deliveryText = this.page
    .getByText(
      /delivery method & gift options|delivery method|shipping method/i
    )
    .first();

  const deliveryButton = this.page
    .getByRole('button')
    .filter({
      hasText:
        /delivery method & gift options|delivery method/i,
    })
    .first();

  const deliveryVisible =
    (await deliveryText
      .isVisible()
      .catch(() => false)) ||
    (await deliveryButton
      .isVisible()
      .catch(() => false));

  if (!deliveryVisible) {
    throw new Error(
      'Delivery Method section was not detected'
    );
  }

  console.log(
    'Delivery Method section detected'
  );
}
  async selectDeliveryMethodIfNeeded() {
    console.log(
      'Checking delivery options'
    );

    const radios = this.page.locator(
      'input[type="radio"]:visible:not([disabled]), [role="radio"]:visible:not([aria-disabled="true"])'
    );

    const count = await radios.count();

    if (count === 0) {
      console.log(
        'No delivery radio selection required'
      );

      return;
    }

    for (let i = 0; i < count; i++) {
      const radio = radios.nth(i);

      const checked =
        (await radio
          .isChecked()
          .catch(() => false)) ||
        (await radio.getAttribute(
          'aria-checked'
        )) === 'true';

      if (checked) {
        console.log(
          'Delivery method already selected'
        );

        return;
      }
    }

    console.log(
      'Selecting first available delivery method'
    );

    await radios.first().click({
      timeout: 5000,
    });

    await this.page.waitForTimeout(1000);
  }

  async printDeliveryControls() {
    console.log(
      'Visible controls inside Delivery step:'
    );

    const controls = this.page.locator(
      'button:visible, a:visible, [role="button"]:visible'
    );

    const count = Math.min(
      await controls.count(),
      60
    );

    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);

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

      if (!text && !aria) {
        continue;
      }

      if (
        /delivery|payment|continue|shipping|gift/i.test(
          `${text} ${aria}`
        )
      ) {
        console.log(
          `CONTROL ${i}: text="${text}" aria="${aria}"`
        );
      }
    }
  }

  private async selectAddressSuggestion() {
    console.log(
      'Waiting for address suggestion'
    );

    const deadline =
      Date.now() + 7000;

    while (
      Date.now() < deadline
    ) {
      const options = this.page.locator(
        '[role="option"]:visible'
      );

      const count = Math.min(
        await options.count(),
        20
      );

      for (let i = 0; i < count; i++) {
        const option =
          options.nth(i);

        const text = (
          await option
            .innerText()
            .catch(() => '')
        )
          .replace(/\s+/g, ' ')
          .trim();

        if (
          !text ||
          /loading|searching|please wait/i.test(
            text
          )
        ) {
          continue;
        }

        console.log(
          `Address candidate: "${text}"`
        );

        const clicked =
          await option
            .click({
              timeout: 2000,
            })
            .then(() => true)
            .catch(() => false);

        if (!clicked) {
          continue;
        }

        this.addressSelected = true;

        console.log(
          `Address selected: "${text}"`
        );

        await this.page.waitForTimeout(
          1000
        );

        return;
      }

      await this.page.waitForTimeout(
        500
      );
    }

    throw new Error(
      'No usable address autocomplete suggestion was found'
    );
  }

  private async fillRequired(
    selectors: string[],
    value: string
  ) {
    if (!value) {
      throw new Error(
        'Required checkout value is empty'
      );
    }

    for (const selector of selectors) {
      const input = this.page
        .locator(selector)
        .first();

      if (
        !(await input
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      console.log(
        `Filling ${selector} with "${value}"`
      );

      await input.fill(value);

      return;
    }

    throw new Error(
      `Required input was not found for value: ${value}`
    );
  }
  async continueToPayment() {
  console.log(
    'Compatibility flow: advancing from Delivery Method toward Payment'
  );

  await this.verifyDeliveryMethodLoaded();

  await this.selectDeliveryMethodIfNeeded();

  const nextButton = this.page
    .getByRole('button', {
      name:
        /continue to payment|continue to payment method|continue to payment information|payment/i,
    })
    .first();

  if (
    await nextButton
      .isVisible()
      .catch(() => false)
  ) {
    const text = (
      await nextButton
        .innerText()
        .catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();

    console.log(
      `Payment continuation control found: "${text}"`
    );

    await nextButton.click({
      timeout: 7000,
    });

    await this.page.waitForTimeout(
      1500
    );

    return;
  }

  console.log(
    'Payment continuation control not available yet'
  );
}

async verifyPaymentStepLoaded() {
  console.log(
    'Checking whether Payment step is visible'
  );

  const paymentSection = this.page
    .getByText(
      /payment|credit card|billing/i
    )
    .first();

  const paymentHeading = this.page
    .getByRole('heading', {
      name: /payment/i,
    })
    .first();

  const paymentVisible =
    (await paymentSection
      .isVisible()
      .catch(() => false)) ||
    (await paymentHeading
      .isVisible()
      .catch(() => false));

  if (!paymentVisible) {
    throw new Error(
      'Payment step is not visible yet'
    );
  }

  console.log(
    'Payment step detected'
  );
}
private async ensureShippingFormReady(): Promise<boolean> {
  console.log('Checking shipping form state');

  const firstName = this.page
    .locator(
      'input[autocomplete="given-name"]:visible, #fName:visible'
    )
    .first();

  if (
    await firstName
      .isVisible()
      .catch(() => false)
  ) {
    console.log('Shipping form is already open');
    return true;
  }

  const deliverySection = this.page
    .getByText(
      /delivery method & gift options|delivery method/i
    )
    .first();

  const continueDelivery = this.page
    .getByRole('button', {
      name: /continue to delivery method/i,
    })
    .first();

  /*
   * Shipping may already be completed from a previous run.
   */
  if (
    await continueDelivery
      .isVisible()
      .catch(() => false)
  ) {
    console.log(
      'Shipping data already exists; no need to refill it'
    );

    return false;
  }

  /*
   * Try to reopen Shipping/Edit section.
   */
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
    console.log('Opening Shipping section');

    await shippingButton.click({
      timeout: 5000,
    });

    await this.page.waitForTimeout(1000);

    if (
      await firstName
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
    console.log('Opening saved Shipping information');

    await editButton.click({
      timeout: 5000,
    });

    await this.page.waitForTimeout(1000);

    if (
      await firstName
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }
  }

  if (
    await deliverySection
      .isVisible()
      .catch(() => false)
  ) {
    console.log(
      'Checkout is already past Shipping; keeping existing shipping data'
    );

    return false;
  }

  throw new Error(
    'Shipping form is not visible and existing shipping state could not be detected'
  );
}
}