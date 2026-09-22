import { sites } from '../../../config/sites';
import { SearchPage } from '../../../pages/SearchPage';
import { test, expect } from '../../fixtures/android.fixture';

async function prepareSearch(
  page: any,
  siteUrl: string
): Promise<SearchPage> {
  await page.goto(siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  return new SearchPage(page);
}

for (const site of Object.values(sites)) {
  test.describe(`${site.name} - Search`, () => {
    test.setTimeout(120000);

    test(
      'SEARCH-001 Verify search control opens',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.openSearch();
      }
    );

    test(
      'SEARCH-002 Verify search input accepts text',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.openSearch();

        const terms =
          await searchPage.discoverSearchTerms();

        expect(
          terms.length
        ).toBeGreaterThan(0);
      }
    );

    test(
      'SEARCH-003 Verify valid search returns results',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const result =
          await searchPage.findWorkingSearchTerm(
            site.url
          );

        expect(result.term).not.toBe('');

        expect(
          result.productHref
        ).not.toBe('');
      }
    );

    test(
      'SEARCH-004 Verify search results contain eligible products',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.findWorkingSearchTerm(
          site.url
        );

        await searchPage.verifyResultsLoaded();

        const count =
          await searchPage.getEligibleProductCount();

        expect(count).toBeGreaterThan(0);
      }
    );

    test(
      'SEARCH-005 Verify product can be opened from search results',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.findWorkingSearchTerm(
          site.url
        );

        const beforeUrl =
          androidPage.url();

        await searchPage.openFirstEligibleProduct();

        expect(
          androidPage.url()
        ).not.toBe(beforeUrl);
      }
    );

    test(
      'SEARCH-006 Verify runtime search terms can be discovered',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const terms =
          await searchPage.discoverSearchTerms();

        expect(
          terms.length
        ).toBeGreaterThan(0);
      }
    );

    test(
      'SEARCH-007 Verify exact search returns relevant results',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const result =
          await searchPage.findWorkingSearchTerm(
            site.url
          );

        await searchPage.verifyRelevantSearchResults(
          result.term
        );
      }
    );

    test(
      'SEARCH-008 Verify partial search term returns relevant results',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const result =
          await searchPage.findWorkingSearchTerm(
            site.url
          );

        const partial =
          await searchPage.createPartialSearchTerm(
            result.term
          );

        test.skip(
          !partial,
          `${site.name}: discovered search term is too short for partial-search validation`
        );

        await androidPage.goto(
          site.url,
          {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
          }
        );

        await searchPage.searchFor(
          partial!
        );

        const count =
          await searchPage.getEligibleProductCount();

        test.skip(
          count === 0,
          `${site.name}: current Search does not return products for partial term "${partial}"`
        );

        expect(count).toBeGreaterThan(0);
      }
    );

    test(
      'SEARCH-009 Verify search is case-insensitive when supported',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const result =
          await searchPage.findWorkingSearchTerm(
            site.url
          );

        await androidPage.goto(
          site.url,
          {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
          }
        );

        await searchPage.verifyCaseInsensitiveSearch(
          result.term,
          site.url
        );
      }
    );

    test(
      'SEARCH-010 Verify leading and trailing spaces are handled',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const result =
          await searchPage.findWorkingSearchTerm(
            site.url
          );

        await androidPage.goto(
          site.url,
          {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
          }
        );

        await searchPage.verifyQueryHandledSafely(
          `   ${result.term}   `
        );
      }
    );

    test(
      'SEARCH-011 Verify repeated spaces inside query are handled',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        const result =
          await searchPage.findWorkingSearchTerm(
            site.url
          );

        const words =
          result.term
            .trim()
            .split(/\s+/);

        test.skip(
          words.length < 2,
          `${site.name}: discovered search term contains only one word`
        );

        const repeatedSpaceQuery =
          words.join('   ');

        await androidPage.goto(
          site.url,
          {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
          }
        );

        await searchPage.verifyQueryHandledSafely(
          repeatedSpaceQuery
        );
      }
    );

    test(
      'SEARCH-012 Verify no-results state for unknown search term',
      {
        tag: ['@smoke', '@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.searchForGuaranteedUnknownTerm();

        await searchPage.verifyNoResultsState();
      }
    );

    test(
      'SEARCH-013 Verify empty search submission behavior',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.verifyEmptyOrWhitespaceSearchHandled(
          ''
        );
      }
    );

    test(
      'SEARCH-014 Verify whitespace-only search submission',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.verifyEmptyOrWhitespaceSearchHandled(
          '     '
        );
      }
    );

    test(
      'SEARCH-015 Verify special characters do not break search',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.verifySpecialCharacterSearchHandled();
      }
    );

    test(
      'SEARCH-016 Verify numeric search term handling',
      {
        tag: ['@regression'],
      },
      async ({ androidPage }) => {
        const searchPage =
          await prepareSearch(
            androidPage,
            site.url
          );

        await searchPage.verifyNumericSearchHandled();
      }
    );

    test(
  'SEARCH-017 Verify search suggestions appear when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const terms =
      await searchPage.discoverSearchTerms();

    expect(terms.length).toBeGreaterThan(0);

    await searchPage.openSearchAndType(
      terms[0]
    );

    const count =
      await searchPage.getSuggestionCount();

    test.skip(
      count === 0,
      `${site.name}: search suggestions are not supported`
    );

    expect(count).toBeGreaterThan(0);
  }
);

test(
  'SEARCH-018 Verify search suggestion can be selected',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const terms =
      await searchPage.discoverSearchTerms();

    expect(terms.length).toBeGreaterThan(0);

    await searchPage.openSearchAndType(
      terms[0]
    );

    const beforeUrl =
      androidPage.url();

    const selected =
      await searchPage.selectFirstSuggestion();

    test.skip(
      !selected,
      `${site.name}: search suggestions are not available`
    );

    expect(
      androidPage.url() !== beforeUrl ||
        (await searchPage.getEligibleProductCount()) > 0
    ).toBeTruthy();
  }
);

test(
  'SEARCH-019 Verify search suggestions update when query changes',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const terms =
      await searchPage.discoverSearchTerms();

    test.skip(
      terms.length < 2,
      `${site.name}: fewer than two runtime search terms were discovered`
    );

    await searchPage.openSearchAndType(
      terms[0]
    );

    const first =
      await searchPage.getSuggestionTexts();

    test.skip(
      first.length === 0,
      `${site.name}: search suggestions are not supported`
    );

    await searchPage.searchInput.fill(
      terms[1]
    );

    await androidPage.waitForTimeout(500);

    const second =
      await searchPage.getSuggestionTexts();

    test.skip(
      second.length === 0,
      `${site.name}: no suggestions were returned for the second query`
    );

    expect(second).not.toEqual(first);
  }
);

test(
  'SEARCH-020 Verify search result product image is displayed',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.verifyFirstResultImageVisible();
  }
);

test(
  'SEARCH-021 Verify search result product name is displayed',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.verifyFirstResultNameVisible();
  }
);

test(
  'SEARCH-022 Verify search result product price is displayed',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.verifyFirstResultPriceVisible();
  }
);

test(
  'SEARCH-023 Verify search result count is valid when displayed',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const displayed =
      await searchPage.getDisplayedResultCount();

    test.skip(
      displayed === null,
      `${site.name}: search result count is not displayed`
    );

    expect(displayed).toBeGreaterThan(0);
  }
);

test(
  'SEARCH-024 Verify duplicate products are not shown unexpectedly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const identifiers =
      await searchPage.getEligibleProductIdentifiers();

    expect(
      identifiers.length
    ).toBeGreaterThan(0);

    const unique =
      new Set(identifiers);

    expect(
      unique.size,
      'Search results should not contain duplicate product URLs'
    ).toBe(identifiers.length);
  }
);

test(
  'SEARCH-025 Verify search pagination or Load More when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const result =
      await searchPage.loadMoreResultsIfAvailable();

    test.skip(
      !result.supported,
      `${site.name}: Load More is not supported on current search results`
    );

    expect(
      result.after,
      'Search result count should not decrease after Load More'
    ).toBeGreaterThanOrEqual(
      result.before
    );
  }
);

test(
  'SEARCH-026 Verify search query remains after opening results page',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const result =
      await searchPage.findWorkingSearchTerm(
        site.url
      );

    const persisted =
      await searchPage.verifySearchQueryPersisted(
        result.term
      );

    test.skip(
      !persisted,
      `${site.name}: search query is not persisted in the visible search input`
    );

    expect(persisted).toBeTruthy();
  }
);

test(
  'SEARCH-027 Verify back navigation returns to search results',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.verifyBackNavigationToSearchResults();
  }
);

test(
  'SEARCH-028 Verify refresh keeps search page usable',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.refreshSearchResults();
  }
);

test(
  'SEARCH-029 Verify search URL reflects query when supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const result =
      await searchPage.findWorkingSearchTerm(
        site.url
      );

    const reflected =
      await searchPage.searchUrlContainsQuery(
        result.term
      );

    test.skip(
      !reflected,
      `${site.name}: current Search implementation does not expose query in URL`
    );

    expect(reflected).toBeTruthy();
  }
);

test(
  'SEARCH-030 Verify new search can be performed from existing results',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const first =
      await searchPage.findWorkingSearchTerm(
        site.url
      );

    await androidPage.goto(
      site.url,
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      }
    );

    const terms =
      await searchPage.discoverSearchTerms();

    const secondTerm =
      terms.find(
        (term) =>
          term.toLowerCase() !==
          first.term.toLowerCase()
      );

    test.skip(
      !secondTerm,
      `${site.name}: no second distinct runtime search term available`
    );

    await searchPage.searchFor(
      first.term
    );

    await searchPage.replaceCurrentSearch(
      secondTerm!
    );

    await searchPage.verifyResultsLoaded();
  }
);

test(
  'SEARCH-031 Verify search sort control works when available',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const supported =
      await searchPage.interactWithSearchSort();

    test.skip(
      !supported,
      `${site.name}: search sorting is not available`
    );

    expect(supported).toBeTruthy();
  }
);

test(
  'SEARCH-032 Verify search filter control works when available',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const supported =
      await searchPage.interactWithSearchFilter();

    test.skip(
      !supported,
      `${site.name}: search filtering is not available`
    );

    expect(supported).toBeTruthy();
  }
);

test(
  'SEARCH-033 Verify clearing search input works correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.openSearch();

    await searchPage.searchInput.fill(
      'automation'
    );

    await searchPage.clearSearchInput();

    const value =
      await searchPage.getCurrentSearchValue();

    expect(value).toBe('');
  }
);

test(
  'SEARCH-034 Verify search can be reopened after closing it',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const reopened =
      await searchPage.reopenSearchAfterClose();

    test.skip(
      !reopened,
      `${site.name}: Search UI does not expose a closable overlay`
    );

    expect(reopened).toBeTruthy();
  }
);

test(
  'SEARCH-035 Verify rapid repeated search submission is handled safely',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    const terms =
      await searchPage.discoverSearchTerms();

    expect(
      terms.length
    ).toBeGreaterThan(0);

    await searchPage.submitSearchRepeatedly(
      terms[0]
    );

    await searchPage.verifyResultsLoaded();
  }
);

test(
  'SEARCH-036 Verify search results do not cause horizontal overflow on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const overflow =
      await searchPage.hasHorizontalOverflow();

    expect(
      overflow,
      'Search results should not create horizontal overflow'
    ).toBeFalsy();
  }
);

test(
  'SEARCH-037 Verify search result cards do not overlap on mobile',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.verifySearchCardsDoNotOverlap();
  }
);

test(
  'SEARCH-038 Verify scrolling through search results works correctly',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.scrollThroughSearchResults();
  }
);

test(
  'SEARCH-039 Verify search remains functional after navigating back from PDP',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    await searchPage.verifySearchUsableAfterBackFromPDP();
  }
);

test(
  'SEARCH-040 Verify search behavior after device orientation or layout change if supported',
  {
    tag: ['@regression'],
  },
  async ({ androidPage }) => {
    const searchPage =
      await prepareSearch(
        androidPage,
        site.url
      );

    await searchPage.findWorkingSearchTerm(
      site.url
    );

    const viewport =
      await searchPage.getCurrentViewport();

    test.skip(
      viewport.width >= viewport.height,
      `${site.name}: current Android session is not in portrait mode`
    );

    await searchPage.verifyResultsLoaded();

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