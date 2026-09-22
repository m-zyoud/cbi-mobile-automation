# CBI Mobile Automation - Master Test Plan

## Purpose

This document defines the planned functional automation coverage for the CBI mobile websites.

The automation will be planned area by area before implementation.

Each test case includes:

- Test Case ID
- Functional Area
- Scenario
- Test Type
- Smoke Coverage
- Regression Coverage
- Notes

---

# 1. Product Listing Page - PLP

## Scope

The PLP coverage includes:

- Page loading
- Breadcrumbs
- Product grid
- Product cards
- Product navigation
- Sorting
- Filtering
- Empty results
- Pagination / Load More
- Product swatches
- Mobile behavior
- URL/state persistence

---

## PLP Test Cases

| ID | Scenario | Type | Smoke | Regression | Notes |
|---|---|---|---|---|---|
| PLP-001 | Verify PLP loads successfully | Positive | Yes | Yes | Page should load without errors |
| PLP-002 | Verify breadcrumb is displayed correctly | Positive | No | Yes | Breadcrumb should match current category |
| PLP-003 | Verify product grid is displayed | Positive | Yes | Yes | At least one product should be visible |
| PLP-004 | Verify product card displays product image | Positive | No | Yes | Image should be visible and loaded |
| PLP-005 | Verify product card displays product name | Positive | No | Yes | Product name should not be empty |
| PLP-006 | Verify product card displays product price | Positive | Yes | Yes | Valid price should be displayed |
| PLP-007 | Verify clicking product opens correct PDP | Positive | Yes | Yes | Product identity should match |
| PLP-008 | Verify sorting from low price to high price | Positive | Yes | Yes | Prices should be sorted ascending |
| PLP-009 | Verify sorting from high price to low price | Positive | No | Yes | Prices should be sorted descending |
| PLP-010 | Verify selected sort option remains active | Positive | No | Yes | Selected sort should remain visible |
| PLP-011 | Verify mobile filter drawer opens | Positive | No | Yes | Filter panel should become visible |
| PLP-012 | Verify applying a single filter | Positive | Yes | Yes | Results should update |
| PLP-013 | Verify applying multiple filters | Positive | No | Yes | Multiple filters should work together |
| PLP-014 | Verify removing one applied filter | Positive | No | Yes | Only selected filter should be removed |
| PLP-015 | Verify clearing all filters | Positive | No | Yes | Original result set should return |
| PLP-016 | Verify filtered products match selected filter | Positive | No | Yes | Results should match filter criteria |
| PLP-017 | Verify no-results state after restrictive filter | Negative | No | Yes | User-friendly empty state expected |
| PLP-018 | Verify pagination or Load More behavior | Positive | No | Yes | Additional products should load |
| PLP-019 | Verify back navigation returns to previous PLP state | Edge | No | Yes | Sort/filter/scroll state should be preserved if supported |
| PLP-020 | Verify product swatches are displayed when available | Positive | No | Yes | Swatches should belong to the correct product |
| PLP-021 | Verify swatch selection updates product information | Positive | No | Yes | Image/variation should update when supported |
| PLP-022 | Verify out-of-stock product state | Negative | No | Yes | Product should clearly show unavailable state |
| PLP-023 | Verify minimum price boundary filter | Boundary | No | Yes | Products should respect lower boundary |
| PLP-024 | Verify maximum price boundary filter | Boundary | No | Yes | Products should respect upper boundary |
| PLP-025 | Verify invalid or empty price range handling | Negative | No | Yes | UI should prevent or handle invalid input |
| PLP-026 | Verify filter drawer closes correctly | Positive | No | Yes | Drawer should close without changing unintended state |
| PLP-027 | Verify mobile sort control opens and closes | Positive | No | Yes | Mobile sort UI should behave correctly |
| PLP-028 | Verify URL updates after filtering when supported | Positive | No | Yes | Query/path should reflect selected state if implemented |
| PLP-029 | Verify URL updates after sorting when supported | Positive | No | Yes | Sort state should be reflected if implemented |
| PLP-030 | Verify refresh preserves filter/sort state when supported | Edge | No | Yes | State should persist according to site behavior |
| PLP-031 | Verify product count updates after filtering | Positive | No | Yes | Count should match filtered result set |
| PLP-032 | Verify product count remains valid after clearing filters | Positive | No | Yes | Count should return to original state |
| PLP-033 | Verify duplicate products are not displayed unexpectedly | Edge | No | Yes | Product list should not contain unintended duplicates |
| PLP-034 | Verify product card price format is valid | Boundary | No | Yes | Currency and price format should be correct |
| PLP-035 | Verify promotional price displays correctly | Positive | No | Yes | Sale/original price relationship should be correct |
| PLP-036 | Verify unavailable filter values are disabled or hidden | Negative | No | Yes | User should not select invalid values |
| PLP-037 | Verify horizontal overflow does not appear on mobile | UI/Edge | No | Yes | Layout should fit viewport |
| PLP-038 | Verify product card elements do not overlap on mobile | UI/Edge | No | Yes | Image/name/price/actions should remain readable |
| PLP-039 | Verify scrolling through product list works correctly | Positive | No | Yes | No layout break or stuck content |
| PLP-040 | Verify PLP behavior after device orientation/layout change if supported | Edge | No | Yes | Page should remain usable |

---

## Smoke PLP Coverage

The following PLP scenarios are included in Smoke coverage:

- PLP-001 - PLP loads successfully
- PLP-003 - Product grid is displayed
- PLP-006 - Product price is displayed
- PLP-007 - Product opens correct PDP
- PLP-008 - Sort low to high
- PLP-012 - Apply one filter

These scenarios represent the minimum critical PLP functionality needed to confirm that a user can browse products and continue toward the purchase journey.

---

## Regression PLP Coverage

All PLP test cases from PLP-001 through PLP-040 are part of Regression coverage.

Regression coverage includes:

- Positive scenarios
- Negative scenarios
- Boundary scenarios
- Edge cases
- Mobile-specific behavior
- State persistence
- Sorting
- Filtering
- Product presentation
- Navigation


# 2. Product Detail Page - PDP

## Scope

The PDP coverage includes:

- Page loading
- Product title
- Product images
- Product price
- Promotions
- Availability
- Product options
- Variant selection
- Quantity
- Add to Cart
- Product details
- Reviews
- Breadcrumbs
- Mobile layout
- Error and edge handling

---

## PDP Test Cases

| ID | Scenario | Type | Smoke | Regression | Notes |
|---|---|---|---|---|---|
| PDP-001 | Verify PDP loads successfully | Positive | Yes | Yes | Main product content should load |
| PDP-002 | Verify product title is displayed | Positive | Yes | Yes | Title should not be empty |
| PDP-003 | Verify product price is displayed | Positive | Yes | Yes | Valid price should be visible |
| PDP-004 | Verify primary product image is displayed | Positive | Yes | Yes | Image should load correctly |
| PDP-005 | Verify additional product images/gallery are available when supported | Positive | No | Yes | Gallery should be functional |
| PDP-006 | Verify product breadcrumb is displayed | Positive | No | Yes | Breadcrumb should reflect navigation path |
| PDP-007 | Verify product availability status is displayed | Positive | Yes | Yes | Stock/purchasability state should be clear |
| PDP-008 | Verify Add to Cart button is visible | Positive | Yes | Yes | CTA should be visible |
| PDP-009 | Verify Add to Cart button is enabled for valid configuration | Positive | Yes | Yes | Product should be purchasable |
| PDP-010 | Verify required product option groups are identified | Positive | Yes | Yes | Required selectors should be detectable |
| PDP-011 | Verify selecting a valid color option | Positive | Yes | Yes | Selection should update state |
| PDP-012 | Verify selecting a valid size option | Positive | Yes | Yes | Selection should update state |
| PDP-013 | Verify selecting multiple required options | Positive | Yes | Yes | All required groups should work together |
| PDP-014 | Verify disabled option cannot be selected | Negative | No | Yes | Disabled values should remain unavailable |
| PDP-015 | Verify out-of-stock option cannot be purchased | Negative | No | Yes | UI should block invalid purchase |
| PDP-016 | Verify dependent options update correctly | Edge | No | Yes | Available values should change when applicable |
| PDP-017 | Verify Add to Cart without selecting required option | Negative | No | Yes | Validation should prevent purchase |
| PDP-018 | Verify product with no required options can be added directly | Positive | No | Yes | Default configuration should work |
| PDP-019 | Verify quantity defaults to valid minimum | Boundary | No | Yes | Quantity should start at valid minimum |
| PDP-020 | Verify increasing quantity | Positive | No | Yes | Quantity should update |
| PDP-021 | Verify decreasing quantity | Positive | No | Yes | Quantity should not go below minimum |
| PDP-022 | Verify quantity minimum boundary | Boundary | No | Yes | Invalid lower quantity should be blocked |
| PDP-023 | Verify quantity maximum boundary when enforced | Boundary | No | Yes | Site limit should be respected |
| PDP-024 | Verify invalid manual quantity input | Negative | No | Yes | Invalid value should be rejected or normalized |
| PDP-025 | Verify Add to Cart updates cart state | Positive | Yes | Yes | Cart count or confirmation should update |
| PDP-026 | Verify correct product is added to cart | Positive | Yes | Yes | Cart product should match PDP |
| PDP-027 | Verify selected options remain consistent in cart | Positive | No | Yes | Variant details should match |
| PDP-028 | Verify selected quantity remains consistent in cart | Positive | No | Yes | Quantity should match |
| PDP-029 | Verify displayed price remains consistent after Add to Cart | Positive | No | Yes | Cart price should match PDP unless promo applies |
| PDP-030 | Verify promotional price is displayed correctly | Positive | No | Yes | Sale/original price relationship should be correct |
| PDP-031 | Verify option selection updates price when applicable | Positive | No | Yes | Dynamic price should update correctly |
| PDP-032 | Verify option selection updates image when applicable | Positive | No | Yes | Selected variation should reflect visually |
| PDP-033 | Verify option selection updates SKU/product identifier when supported | Positive | No | Yes | Variant identity should update |
| PDP-034 | Verify product description/details are accessible | Positive | No | Yes | Content should be readable |
| PDP-035 | Verify product details accordion opens and closes | Positive | No | Yes | Accordion behavior should work |
| PDP-036 | Verify reviews/ratings module displays when available | Positive | No | Yes | Optional reviews section should not break PDP |
| PDP-037 | Verify unavailable product state | Negative | No | Yes | Add to Cart should be disabled or unavailable |
| PDP-038 | Verify sold-out product messaging | Negative | No | Yes | Clear sold-out state expected |
| PDP-039 | Verify back navigation returns to previous listing/search | Positive | No | Yes | User should return without unexpected state loss |
| PDP-040 | Verify PDP refresh preserves selected options when supported | Edge | No | Yes | State persistence depends on implementation |
| PDP-041 | Verify invalid/non-existent PDP URL behavior | Negative | No | Yes | User-friendly 404 or redirect expected |
| PDP-042 | Verify product image does not break on mobile | UI/Edge | No | Yes | Image should fit viewport |
| PDP-043 | Verify product title/price/options do not overlap on mobile | UI/Edge | No | Yes | Layout should remain readable |
| PDP-044 | Verify sticky Add to Cart behavior if supported | Positive | No | Yes | CTA should remain usable |
| PDP-045 | Verify page remains usable after scrolling through long product details | Edge | No | Yes | No broken/stuck layout |
| PDP-046 | Verify optional content does not block purchase flow | Edge | No | Yes | Reviews/promos/accordions should not block CTA |
| PDP-047 | Verify variant selection can be changed before Add to Cart | Positive | No | Yes | Latest selection should be used |
| PDP-048 | Verify changing option after previous selection updates availability | Positive | No | Yes | State should refresh correctly |
| PDP-049 | Verify duplicate Add to Cart action is prevented or handled correctly | Edge | No | Yes | Rapid/repeated clicks should not create unintended duplicates |
| PDP-050 | Verify PDP remains functional after device orientation/layout change if supported | Edge | No | Yes | Page should remain usable |

---

## Smoke PDP Coverage

The following PDP scenarios are included in Smoke coverage:

- PDP-001 - PDP loads successfully
- PDP-002 - Product title is displayed
- PDP-003 - Product price is displayed
- PDP-004 - Primary image is displayed
- PDP-007 - Product availability is displayed
- PDP-008 - Add to Cart button is visible
- PDP-009 - Add to Cart button is enabled for valid product configuration
- PDP-010 - Required product options are identified
- PDP-011 - Valid product option can be selected
- PDP-013 - Required option combinations can be completed
- PDP-025 - Add to Cart updates cart state
- PDP-026 - Correct product is added to cart

These scenarios validate the minimum critical PDP journey required for a customer to configure and add a valid product to the shopping cart.

---

## Regression PDP Coverage

All PDP test cases from PDP-001 through PDP-050 are part of Regression coverage.

Regression coverage includes:

- Core product content
- Product options and variants
- Positive scenarios
- Negative scenarios
- Boundary cases
- Availability states
- Quantity behavior
- Cart consistency
- Promotional pricing
- Mobile layout
- Navigation
- Optional modules
- Important edge cases

---

# 3. Search

## Scope

The Search coverage includes:

- Search entry point
- Search input
- Valid searches
- Partial searches
- Search result presentation
- Product navigation
- Empty searches
- No-results behavior
- Search suggestions
- Query persistence
- Repeated searches
- Search result count
- Sorting and filtering
- Pagination / Load More
- Mobile behavior
- URL behavior
- Navigation and refresh
- Negative and edge cases

---

## Search Test Cases

| ID | Scenario | Type | Smoke | Regression | Notes |
|---|---|---|---|---|---|
| SEARCH-001 | Verify Search control opens successfully | Positive | Yes | Yes | Search input should become available |
| SEARCH-002 | Verify Search input accepts text | Positive | No | Yes | User should be able to enter a query |
| SEARCH-003 | Verify valid search returns results | Positive | Yes | Yes | Valid query should return usable results |
| SEARCH-004 | Verify search results contain eligible products | Positive | Yes | Yes | At least one valid product should be displayed |
| SEARCH-005 | Verify product can be opened from Search results | Positive | Yes | Yes | Selected result should open its PDP |
| SEARCH-006 | Verify runtime search terms can be discovered | Positive | No | Yes | Automation should identify usable terms dynamically |
| SEARCH-007 | Verify exact product/category search returns relevant results | Positive | Yes | Yes | Results should relate to exact query |
| SEARCH-008 | Verify partial search term returns relevant results | Positive | No | Yes | Partial query should be handled correctly |
| SEARCH-009 | Verify Search is case-insensitive when supported | Edge | No | Yes | Upper/lowercase should not unexpectedly change results |
| SEARCH-010 | Verify leading and trailing spaces are handled | Edge | No | Yes | Query should be trimmed or handled correctly |
| SEARCH-011 | Verify repeated spaces inside query are handled | Edge | No | Yes | Search should remain usable |
| SEARCH-012 | Verify no-results state for unknown search term | Negative | Yes | Yes | User-friendly no-results state should be shown |
| SEARCH-013 | Verify empty Search submission behavior | Negative | No | Yes | Site should block, ignore, or safely handle empty query |
| SEARCH-014 | Verify whitespace-only Search submission | Negative | No | Yes | Whitespace-only search should be handled safely |
| SEARCH-015 | Verify special characters do not break Search | Negative | No | Yes | Search should remain functional |
| SEARCH-016 | Verify numeric Search term handling | Edge | No | Yes | Product numbers or numeric input should be handled safely |
| SEARCH-017 | Verify Search suggestions appear when supported | Positive | No | Yes | Suggestions/autocomplete should become available |
| SEARCH-018 | Verify Search suggestion can be selected | Positive | No | Yes | Selected suggestion should navigate correctly |
| SEARCH-019 | Verify Search suggestions update when query changes | Positive | No | Yes | Suggestions should correspond to current input |
| SEARCH-020 | Verify Search result product image is displayed | Positive | No | Yes | Product result should expose valid image |
| SEARCH-021 | Verify Search result product name is displayed | Positive | No | Yes | Product name should not be empty |
| SEARCH-022 | Verify Search result product price is displayed | Positive | No | Yes | Valid product price should be visible |
| SEARCH-023 | Verify Search result count is valid when displayed | Positive | No | Yes | Count should represent current results |
| SEARCH-024 | Verify duplicate products are not shown unexpectedly | Edge | No | Yes | Results should not contain unintended duplicates |
| SEARCH-025 | Verify Search pagination or Load More when supported | Positive | No | Yes | Additional results should load correctly |
| SEARCH-026 | Verify Search query remains after opening results page | Positive | No | Yes | Search term should remain visible when supported |
| SEARCH-027 | Verify back navigation returns to Search results | Positive | No | Yes | User should return to previous results state |
| SEARCH-028 | Verify refresh keeps Search page usable | Edge | No | Yes | Search results should remain valid after refresh |
| SEARCH-029 | Verify Search URL reflects query when supported | Positive | No | Yes | Query/path should reflect search state if implemented |
| SEARCH-030 | Verify new Search can be performed from existing results | Positive | No | Yes | User should be able to replace the previous query |
| SEARCH-031 | Verify Search sort control works when available | Positive | No | Yes | Results should update according to selected sort |
| SEARCH-032 | Verify Search filter control works when available | Positive | No | Yes | Filters should update Search results |
| SEARCH-033 | Verify clearing Search input works correctly | Positive | No | Yes | Search field should return to empty state |
| SEARCH-034 | Verify Search can be reopened after closing it | Edge | No | Yes | Search UI should remain reusable |
| SEARCH-035 | Verify rapid repeated Search submission is handled safely | Edge | No | Yes | Multiple submissions should not break results |
| SEARCH-036 | Verify Search results do not cause horizontal overflow on mobile | UI/Edge | No | Yes | Results should fit mobile viewport |
| SEARCH-037 | Verify Search result cards do not overlap on mobile | UI/Edge | No | Yes | Name/image/price should remain readable |
| SEARCH-038 | Verify scrolling through Search results works correctly | Positive | No | Yes | Results should remain usable while scrolling |
| SEARCH-039 | Verify Search remains functional after navigating back from PDP | Edge | No | Yes | Search context should remain usable |
| SEARCH-040 | Verify Search behavior after device orientation/layout change if supported | Edge | No | Yes | Search should remain usable after layout change |

---

## Smoke Search Coverage

The following Search scenarios are included in Smoke coverage:

- SEARCH-001 - Search control opens successfully
- SEARCH-003 - Valid search returns results
- SEARCH-004 - Search results contain eligible products
- SEARCH-005 - Product opens from Search results
- SEARCH-007 - Exact search returns relevant results
- SEARCH-012 - No-results state is handled correctly

These scenarios represent the minimum critical Search functionality required to confirm that a customer can discover a product and continue to the PDP.

---

## Regression Search Coverage

All Search test cases from SEARCH-001 through SEARCH-040 are part of Regression coverage.

Regression coverage includes:

- Positive scenarios
- Negative scenarios
- Boundary and edge cases
- Search suggestions
- Result presentation
- Navigation
- State persistence
- Sorting
- Filtering
- Pagination
- Mobile-specific behavior
- Error handling

---

# 4. Cart

## Scope

The Cart coverage includes:

- Cart entry point
- Cart page loading
- Added product validation
- Product name, image, options, price, and quantity
- Quantity update behavior
- Remove item behavior
- Empty cart behavior
- Multiple products
- Duplicate Add to Cart handling
- Subtotal and total calculations
- Promotional pricing
- Promo / coupon behavior
- Cart persistence
- Checkout navigation
- Mobile layout
- Negative and edge cases

---

## Cart Test Cases

| ID | Scenario | Type | Smoke | Regression | Notes |
|---|---|---|---|---|---|
| CART-001 | Verify Cart opens successfully | Positive | Yes | Yes | Cart page or drawer should load |
| CART-002 | Verify Cart contains added product | Positive | Yes | Yes | Added product should appear in Cart |
| CART-003 | Verify Cart product name is displayed | Positive | Yes | Yes | Product name should match selected product |
| CART-004 | Verify Cart product image is displayed | Positive | No | Yes | Product image should be visible |
| CART-005 | Verify Checkout control is available | Positive | Yes | Yes | Checkout button/link should be visible |
| CART-006 | Verify Cart remains usable after adding product | Positive | Yes | Yes | Cart should be interactive after product addition |
| CART-007 | Verify Cart product price is displayed | Positive | Yes | Yes | Product price should be visible |
| CART-008 | Verify Cart quantity is displayed | Positive | No | Yes | Current quantity should be visible |
| CART-009 | Verify Cart selected product options are displayed | Positive | No | Yes | Selected variant details should remain visible |
| CART-010 | Verify product SKU or identifier when available | Positive | No | Yes | Identifier should match PDP when exposed |
| CART-011 | Verify quantity can be increased in Cart | Positive | Yes | Yes | Quantity update should succeed |
| CART-012 | Verify quantity can be decreased in Cart | Positive | No | Yes | Quantity should decrease when above minimum |
| CART-013 | Verify Cart quantity minimum boundary | Boundary | No | Yes | Quantity should not drop below allowed minimum |
| CART-014 | Verify Cart quantity maximum boundary when enforced | Boundary | No | Yes | Quantity should not exceed allowed maximum |
| CART-015 | Verify invalid manual quantity is handled safely | Negative | No | Yes | Invalid quantity should be rejected or normalized |
| CART-016 | Verify item can be removed from Cart | Positive | Yes | Yes | Removed product should disappear |
| CART-017 | Verify Cart becomes empty after removing last item | Positive | Yes | Yes | Empty state should be displayed |
| CART-018 | Verify empty Cart state is user-friendly | Positive | No | Yes | Empty Cart should provide meaningful UI |
| CART-019 | Verify multiple products can be added | Positive | No | Yes | More than one distinct product should be supported |
| CART-020 | Verify multiple Cart items remain distinct | Edge | No | Yes | Items should not merge incorrectly |
| CART-021 | Verify same product added twice is handled correctly | Edge | No | Yes | Quantity may increase or duplicate row may be created according to site behavior |
| CART-022 | Verify Cart subtotal is displayed | Positive | Yes | Yes | Subtotal should be visible when Cart has items |
| CART-023 | Verify Cart subtotal updates after quantity increase | Positive | No | Yes | Subtotal should respond to quantity change |
| CART-024 | Verify Cart subtotal updates after quantity decrease | Positive | No | Yes | Subtotal should respond to quantity change |
| CART-025 | Verify Cart subtotal updates after removing item | Positive | No | Yes | Removed item should no longer contribute to subtotal |
| CART-026 | Verify promotional price remains consistent in Cart when applicable | Positive | No | Yes | Promotional price should match expected product price |
| CART-027 | Verify promo/coupon input is available when supported | Positive | No | Yes | Promo code UI may be optional |
| CART-028 | Verify invalid promo/coupon is handled safely | Negative | No | Yes | Invalid code should show validation and not break Cart |
| CART-029 | Verify Cart state persists after page refresh | Edge | No | Yes | Current items should remain after refresh when supported |
| CART-030 | Verify Cart state persists after leaving and returning | Edge | No | Yes | Cart should retain items during same session when supported |
| CART-031 | Verify Checkout navigation opens Checkout flow | Positive | Yes | Yes | Checkout control should navigate correctly |
| CART-032 | Verify duplicate Checkout submission is handled safely | Edge | No | Yes | Repeated Checkout action should not corrupt state |
| CART-033 | Verify Cart does not create horizontal overflow on mobile | UI/Edge | No | Yes | Cart layout should fit mobile viewport |
| CART-034 | Verify Cart item controls do not overlap on mobile | UI/Edge | No | Yes | Quantity/remove/price controls should remain usable |
| CART-035 | Verify Cart remains functional after device orientation/layout change if supported | Edge | No | Yes | Cart should remain usable after layout change |

---

## Smoke Cart Coverage

The following Cart scenarios are included in Smoke coverage:

- CART-001 - Cart opens successfully
- CART-002 - Added product is displayed
- CART-003 - Product name is displayed
- CART-005 - Checkout control is available
- CART-006 - Cart remains usable after product addition
- CART-007 - Product price is displayed
- CART-011 - Quantity can be increased
- CART-016 - Item can be removed
- CART-017 - Empty Cart state after removing last item
- CART-022 - Subtotal is displayed
- CART-031 - Checkout flow can be opened

These scenarios represent the minimum critical Cart functionality required to confirm that a customer can review an item, modify the Cart, and continue toward Checkout.

---

## Regression Cart Coverage

All Cart test cases from CART-001 through CART-035 are part of Regression coverage.

Regression coverage includes:

- Product information
- Quantity behavior
- Boundary and invalid quantity scenarios
- Remove-item behavior
- Empty Cart behavior
- Multiple items
- Duplicate product handling
- Subtotal and pricing behavior
- Promo/coupon handling
- Cart persistence
- Checkout navigation
- Mobile-specific behavior
- Error and edge-case handling