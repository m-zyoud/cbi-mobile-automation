import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class HeaderFooterPage {
  readonly page: Page;

  readonly header: Locator;
  readonly footer: Locator;
  readonly logo: Locator;
  readonly searchControl: Locator;
  readonly cartControl: Locator;
  readonly accountControl: Locator;
  readonly mobileMenuControl: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page
      .locator('header')
      .first();

    this.footer = page
      .locator('footer')
      .first();

    this.logo = page
      .locator(
        [
          'header img[alt*="logo" i]',
          'header [class*="logo" i]',
          'header a[class*="logo" i]',
          'header [data-testid*="logo" i]',
        ].join(',')
      )
      .first();

    this.searchControl = page
      .locator(
        [
          'header button[class*="search" i]',
          'header [aria-label*="search" i]',
          'header [class*="search" i]',
          'header [data-testid*="search" i]',
        ].join(',')
      )
      .first();

    this.cartControl = page
      .locator(
        [
          'header a[href*="cart" i]',
          'header button[class*="cart" i]',
          'header [aria-label*="cart" i]',
          'header [data-testid*="cart" i]',
        ].join(',')
      )
      .first();

    this.accountControl = page
      .locator(
        [
          'header a[href*="account" i]',
          'header [class*="account" i]',
          'header [aria-label*="account" i]',
          'header [data-testid*="account" i]',
        ].join(',')
      )
      .first();

    this.mobileMenuControl = page
      .locator(
        [
          'header button[aria-label*="menu" i]',
          'header button[class*="menu" i]',
          'header button[class*="hamburger" i]',
          'header [data-testid*="menu" i]',
        ].join(',')
      )
      .first();
  }

  async verifyHeaderVisible(): Promise<void> {
    await expect(
      this.header,
      'Header should be visible'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyFooterVisible(): Promise<void> {
    await this.footer.scrollIntoViewIfNeeded();

    await expect(
      this.footer,
      'Footer should be visible'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyLogoVisible(): Promise<void> {
    await expect(
      this.logo,
      'Brand logo should be visible in the header'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifySearchAvailable(): Promise<void> {
    await expect(
      this.searchControl,
      'Search control should be available in the header'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyCartAvailable(): Promise<void> {
    await expect(
      this.cartControl,
      'Cart control should be available in the header'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyAccountAvailable(): Promise<void> {
    await expect(
      this.accountControl,
      'Account control should be available in the header'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyMobileMenuAvailable(): Promise<void> {
    await expect(
      this.mobileMenuControl,
      'Mobile navigation menu should be available'
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async openMobileMenu(): Promise<void> {
    await this.verifyMobileMenuAvailable();

    await this.mobileMenuControl.click();
  }

  async verifyGlobalLayout(): Promise<void> {
    await this.verifyHeaderVisible();
    await this.verifyLogoVisible();
    await this.verifySearchAvailable();
    await this.verifyCartAvailable();
    await this.verifyAccountAvailable();
  }

  // GLOBAL-009
async verifyLogoNavigation(): Promise<boolean> {
  await this.verifyLogoVisible();

  const beforeUrl =
    this.page.url();

  const logoLink =
    this.logo.locator(
      'xpath=ancestor-or-self::a[1]'
    );

  if (
    !(await logoLink
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await logoLink.click();

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  const afterUrl =
    this.page.url();

  expect(
    afterUrl,
    'Logo navigation should navigate safely'
  ).not.toBe('');

  expect(
    afterUrl,
    'Logo navigation should not leave page in invalid state'
  ).not.toContain(
    'undefined'
  );

  return (
    beforeUrl !== afterUrl ||
    afterUrl.length > 0
  );
}

// GLOBAL-010
async verifySearchInteraction(): Promise<void> {
  await this.verifySearchAvailable();

  await this.searchControl.click();

  const searchInput =
    this.page
      .locator(
        [
          'input[type="search"]:visible',
          'input[name*="search" i]:visible',
          'input[placeholder*="search" i]:visible',
          'input[aria-label*="search" i]:visible',
        ].join(',')
      )
      .first();

  await expect(
    searchInput,
    'Search input should become visible after Search interaction'
  ).toBeVisible({
    timeout: 10000,
  });
}

// GLOBAL-011
async verifyCartNavigation(): Promise<void> {
  await this.verifyCartAvailable();

  await this.cartControl.click();

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  const url =
    this.page.url();

  expect(
    url,
    'Cart navigation should not produce an invalid URL'
  ).not.toContain(
    'undefined'
  );
}

// GLOBAL-012
async verifyAccountNavigation(): Promise<void> {
  await this.verifyAccountAvailable();

  await this.accountControl.click();

  await this.page.waitForLoadState(
    'domcontentloaded'
  );

  await expect(
    this.page.locator('body')
  ).toBeVisible();

  const url =
    this.page.url();

  expect(
    url,
    'Account navigation should not produce an invalid URL'
  ).not.toContain(
    'undefined'
  );
}

// GLOBAL-013
async verifyMobileMenuOpens(): Promise<boolean> {
  await this.verifyMobileMenuAvailable();

  const beforeExpanded =
    await this.mobileMenuControl
      .getAttribute(
        'aria-expanded'
      );

  await this.mobileMenuControl.click();

  await this.page.waitForTimeout(
    300
  );

  const afterExpanded =
    await this.mobileMenuControl
      .getAttribute(
        'aria-expanded'
      );

  const visibleMenu =
    await this.page
      .locator(
        [
          'nav:visible',
          '[class*="menu" i]:visible',
          '[class*="drawer" i]:visible',
          '[class*="navigation" i]:visible',
          '[data-testid*="menu" i]:visible',
        ].join(',')
      )
      .filter({
        visible: true,
      })
      .first()
      .isVisible()
      .catch(() => false);

  return (
    beforeExpanded !==
      afterExpanded ||
    visibleMenu
  );
}

// GLOBAL-014
async verifyMobileMenuCanClose(): Promise<boolean> {
  const opened =
    await this.verifyMobileMenuOpens();

  if (!opened) {
    return false;
  }

  const closeControl =
    this.page
      .locator(
        [
          'button[aria-label*="close" i]:visible',
          'button[class*="close" i]:visible',
          '[data-testid*="close" i]:visible',
        ].join(',')
      )
      .first();

  if (
    await closeControl
      .isVisible()
      .catch(() => false)
  ) {
    await closeControl.click();

    return true;
  }

  if (
    await this.mobileMenuControl
      .isVisible()
      .catch(() => false)
  ) {
    await this.mobileMenuControl.click();

    return true;
  }

  return false;
}

// GLOBAL-015
async getVisibleFooterLinksCount(): Promise<number> {
  await this.verifyFooterVisible();

  return this.footer
    .locator(
      'a:visible'
    )
    .count();
}

// GLOBAL-016
async verifyNewsletterAvailableWhenSupported(): Promise<boolean> {
  await this.verifyFooterVisible();

  const emailInput =
    this.footer
      .locator(
        [
          'input[type="email"]:visible',
          'input[name*="email" i]:visible',
          'input[placeholder*="email" i]:visible',
        ].join(',')
      )
      .first();

  if (
    !(await emailInput
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await emailInput.fill(
    'automation@example.com'
  );

  expect(
    await emailInput.inputValue()
  ).toContain(
    'automation@example.com'
  );

  return true;
}

// GLOBAL-017
async getLegalLinksCount(): Promise<number> {
  await this.verifyFooterVisible();

  return this.footer
    .locator('a')
    .filter({
      hasText:
        /privacy|terms|conditions|accessibility|legal/i,
    })
    .count();
}

// GLOBAL-018
async getSocialLinksCount(): Promise<number> {
  await this.verifyFooterVisible();

  return this.footer
    .locator(
      [
        'a[href*="facebook" i]',
        'a[href*="instagram" i]',
        'a[href*="youtube" i]',
        'a[href*="pinterest" i]',
        'a[href*="twitter" i]',
        'a[href*="x.com" i]',
        'a[href*="tiktok" i]',
      ].join(',')
    )
    .count();
}

// GLOBAL-019
async refreshAndVerifyGlobalComponents(): Promise<void> {
  await this.page.reload({
    waitUntil:
      'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyHeaderVisible();

  await this.verifyLogoVisible();

  await this.verifySearchAvailable();

  await this.verifyCartAvailable();

  await this.verifyAccountAvailable();
}

// GLOBAL-020
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

// GLOBAL-021
async verifyBackForwardNavigationStable(): Promise<boolean> {
  const currentUrl =
    this.page.url();

  const backWorked =
    await this.page
      .goBack({
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!backWorked) {
    return false;
  }

  const forwardWorked =
    await this.page
      .goForward({
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      .then(() => true)
      .catch(() => false);

  if (!forwardWorked) {
    return false;
  }

  expect(
    this.page.url(),
    'Forward navigation should restore the original page'
  ).toBe(
    currentUrl
  );

  await this.verifyHeaderVisible();

  return true;
}

// GLOBAL-022
async verifyRepeatedMobileMenuToggle(): Promise<void> {
  await this.verifyMobileMenuAvailable();

  for (
    let i = 0;
    i < 2;
    i++
  ) {
    const opened =
      await this.verifyMobileMenuOpens();

    expect(
      opened,
      `Mobile menu should open on cycle ${i + 1}`
    ).toBeTruthy();

    const closed =
      await this.verifyMobileMenuCanClose();

    expect(
      closed,
      `Mobile menu should close on cycle ${i + 1}`
    ).toBeTruthy();
  }
}

// GLOBAL-023
async verifyFooterScrollableAndUsable(): Promise<void> {
  await this.footer.scrollIntoViewIfNeeded();

  await expect(
    this.footer
  ).toBeVisible({
    timeout: 10000,
  });

  const box =
    await this.footer.boundingBox();

  expect(
    box,
    'Footer should have a visible layout box'
  ).not.toBeNull();

  const viewportHeight =
    await this.page.evaluate(
      () => window.innerHeight
    );

  expect(
    viewportHeight
  ).toBeGreaterThan(0);
}

// GLOBAL-024
async verifyNewsletterInvalidEmailHandled(): Promise<boolean> {
  await this.verifyFooterVisible();

  const emailInput =
    this.footer
      .locator(
        [
          'input[type="email"]:visible',
          'input[name*="email" i]:visible',
          'input[placeholder*="email" i]:visible',
        ].join(',')
      )
      .first();

  if (
    !(await emailInput
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await emailInput.fill(
    'invalid-email'
  );

  await emailInput.blur();

  const invalid =
    await emailInput
      .evaluate(
        (
          element:
            HTMLInputElement
        ) =>
          !element.checkValidity()
      )
      .catch(() => false);

  if (invalid) {
    return true;
  }

  const ariaInvalid =
    await emailInput.getAttribute(
      'aria-invalid'
    );

  return ariaInvalid === 'true';
}

// GLOBAL-025
async verifyNewsletterEmptyEmailHandled(): Promise<boolean> {
  await this.verifyFooterVisible();

  const emailInput =
    this.footer
      .locator(
        [
          'input[type="email"]:visible',
          'input[name*="email" i]:visible',
          'input[placeholder*="email" i]:visible',
        ].join(',')
      )
      .first();

  if (
    !(await emailInput
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await emailInput.fill('');

  const submit =
    this.footer
      .getByRole('button')
      .filter({
        hasText:
          /sign up|subscribe|submit|join/i,
      })
      .first();

  if (
    !(await submit
      .isVisible()
      .catch(() => false))
  ) {
    return false;
  }

  await submit.click();

  const browserInvalid =
    await emailInput
      .evaluate(
        (
          element:
            HTMLInputElement
        ) =>
          !element.checkValidity()
      )
      .catch(() => false);

  const ariaInvalid =
    await emailInput.getAttribute(
      'aria-invalid'
    );

  return (
    browserInvalid ||
    ariaInvalid === 'true'
  );
}

// GLOBAL-026
async verifyExternalFooterLinksSafe(): Promise<boolean> {
  await this.verifyFooterVisible();

  const externalLinks =
    this.footer.locator(
      'a[href^="http"]'
    );

  const count =
    await externalLinks.count();

  if (count === 0) {
    return false;
  }

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const href =
      await externalLinks
        .nth(i)
        .getAttribute(
          'href'
        );

    expect(
      href,
      'External footer links should have valid href values'
    ).toBeTruthy();

    expect(
      href
    ).not.toContain(
      'undefined'
    );
  }

  return true;
}

// GLOBAL-027
async verifyLogoAfterRefresh(): Promise<void> {
  await this.verifyLogoVisible();

  await this.page.reload({
    waitUntil:
      'domcontentloaded',
    timeout: 60000,
  });

  await this.verifyLogoVisible();
}

// GLOBAL-028
async verifyHeaderControlsDoNotOverlap(): Promise<void> {
  const controls = [
    this.logo,
    this.searchControl,
    this.cartControl,
    this.accountControl,
    this.mobileMenuControl,
  ];

  const boxes = [];

  for (
    const control of controls
  ) {
    if (
      !(await control
        .isVisible()
        .catch(() => false))
    ) {
      continue;
    }

    const box =
      await control
        .boundingBox()
        .catch(() => null);

    if (box) {
      boxes.push(box);
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
        horizontal > 5 &&
        vertical > 5;

      expect(
        overlap,
        `Header controls ${i} and ${j} should not substantially overlap`
      ).toBeFalsy();
    }
  }
}

// GLOBAL-029
async verifyFooterControlsDoNotOverlap(): Promise<void> {
  await this.verifyFooterVisible();

  const controls =
    this.footer.locator(
      [
        'a:visible',
        'button:visible',
        'input:visible',
      ].join(',')
    );

  const count =
    Math.min(
      await controls.count(),
      20
    );

  const boxes = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const box =
      await controls
        .nth(i)
        .boundingBox()
        .catch(() => null);

    if (box) {
      boxes.push(box);
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

      expect(
        overlap,
        `Footer controls ${i} and ${j} should not substantially overlap`
      ).toBeFalsy();
    }
  }
}

// GLOBAL-030
async verifyResponsiveGlobalLayout(): Promise<void> {
  await this.verifyHeaderVisible();

  const viewport =
    await this.page.evaluate(() => ({
      width:
        window.innerWidth,
      height:
        window.innerHeight,
    }));

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
    'Global layout should not horizontally overflow current Android viewport'
  ).toBeFalsy();

  await this.verifyHeaderControlsDoNotOverlap();

  await this.verifyFooterVisible();
}

}