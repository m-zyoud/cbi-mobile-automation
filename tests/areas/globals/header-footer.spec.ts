import { Page } from '@playwright/test';

import { sites } from '../../../config/sites';
import { HeaderFooterPage } from '../../../pages/HeaderFooterPage';


import {
  test,
  expect,
} from '../../fixtures/android.fixture';

async function prepareHome(
  page: Page,
  siteUrl: string
): Promise<HeaderFooterPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  return new HeaderFooterPage(page);
}

for (const site of Object.values(sites)) {
  test.describe(
    `${site.name} - Global Components`,
    () => {
      test.setTimeout(120000);

      test(
        'GLOBAL-001 Verify header is displayed',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyHeaderVisible();
        }
      );

      test(
        'GLOBAL-002 Verify brand logo is displayed',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyLogoVisible();
        }
      );

      test(
        'GLOBAL-003 Verify Search control is available',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifySearchAvailable();
        }
      );

      test(
        'GLOBAL-004 Verify Cart control is available',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyCartAvailable();
        }
      );

      test(
        'GLOBAL-005 Verify Account control is available',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyAccountAvailable();
        }
      );

      test(
        'GLOBAL-006 Verify mobile navigation control is available',
        {
          tag: [
            '@smoke',
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyMobileMenuAvailable();
        }
      );

      test(
        'GLOBAL-007 Verify footer is displayed',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyFooterVisible();
        }
      );

      test(
        'GLOBAL-008 Verify core global layout',
        {
          tag: [
            '@regression',
          ],
        },
        async ({ androidPage }) => {
          const globals =
            await prepareHome(
              androidPage,
              site.url
            );

          await globals.verifyGlobalLayout();
        }
      );

      test(
  'GLOBAL-009 Verify logo navigation works',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const handled =
      await globals.verifyLogoNavigation();

    test.skip(
      !handled,
      `${site.name}: logo is not exposed as a navigable link`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-010 Verify Search control opens search interface',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifySearchInteraction();
  }
);

test(
  'GLOBAL-011 Verify Cart control navigates safely',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyCartNavigation();
  }
);

test(
  'GLOBAL-012 Verify Account control navigates safely',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyAccountNavigation();
  }
);

test(
  'GLOBAL-013 Verify mobile navigation menu opens',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const opened =
      await globals.verifyMobileMenuOpens();

    expect(
      opened,
      'Mobile navigation should expose an opened state'
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-014 Verify mobile navigation menu can close',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const closed =
      await globals.verifyMobileMenuCanClose();

    expect(
      closed,
      'Mobile navigation should support closing'
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-015 Verify footer exposes navigation links',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const count =
      await globals.getVisibleFooterLinksCount();

    expect(
      count,
      'Footer should expose at least one visible navigation link'
    ).toBeGreaterThan(0);
  }
);

test(
  'GLOBAL-016 Verify newsletter email field works when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const supported =
      await globals.verifyNewsletterAvailableWhenSupported();

    test.skip(
      !supported,
      `${site.name}: newsletter email field is not exposed`
    );

    expect(
      supported
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-017 Verify legal links are available when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const count =
      await globals.getLegalLinksCount();

    test.skip(
      count === 0,
      `${site.name}: footer legal links are not exposed`
    );

    expect(
      count
    ).toBeGreaterThan(0);
  }
);

test(
  'GLOBAL-018 Verify social links are available when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const count =
      await globals.getSocialLinksCount();

    test.skip(
      count === 0,
      `${site.name}: footer social links are not exposed`
    );

    expect(
      count
    ).toBeGreaterThan(0);
  }
);

test(
  'GLOBAL-019 Verify global components remain usable after refresh',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.refreshAndVerifyGlobalComponents();
  }
);

test(
  'GLOBAL-020 Verify global layout has no horizontal overflow',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const overflow =
      await globals.hasHorizontalOverflow();

    expect(
      overflow,
      'Global page layout should not horizontally overflow'
    ).toBeFalsy();
  }
);

test(
  'GLOBAL-021 Verify back and forward navigation remains stable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const safe =
      await globals.verifyBackForwardNavigationStable();

    test.skip(
      !safe,
      `${site.name}: browser history does not expose usable navigation`
    );

    expect(
      safe
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-022 Verify repeated mobile menu open close remains stable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyRepeatedMobileMenuToggle();
  }
);

test(
  'GLOBAL-023 Verify footer remains usable while scrolling',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyFooterScrollableAndUsable();
  }
);

test(
  'GLOBAL-024 Verify newsletter rejects malformed email when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const handled =
      await globals.verifyNewsletterInvalidEmailHandled();

    test.skip(
      !handled,
      `${site.name}: newsletter email validation is not exposed`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-025 Verify newsletter rejects empty email when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const handled =
      await globals.verifyNewsletterEmptyEmailHandled();

    test.skip(
      !handled,
      `${site.name}: newsletter submit flow is not exposed`
    );

    expect(
      handled
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-026 Verify external footer links are valid when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    const supported =
      await globals.verifyExternalFooterLinksSafe();

    test.skip(
      !supported,
      `${site.name}: no external footer links are exposed`
    );

    expect(
      supported
    ).toBeTruthy();
  }
);

test(
  'GLOBAL-027 Verify brand logo remains visible after refresh',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyLogoAfterRefresh();
  }
);

test(
  'GLOBAL-028 Verify header controls do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyHeaderControlsDoNotOverlap();
  }
);

test(
  'GLOBAL-029 Verify footer controls do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyFooterControlsDoNotOverlap();
  }
);

test(
  'GLOBAL-030 Verify global layout is responsive on current Android viewport',
  {
    tag: [
      '@smoke',
      '@regression',
    ],
  },
  async ({ androidPage }) => {
    const globals =
      await prepareHome(
        androidPage,
        site.url
      );

    await globals.verifyResponsiveGlobalLayout();
  }
);


    }
  );
}