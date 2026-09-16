# CBI Mobile Cross-Site Smoke Test Plan

## Application Overview

A real-Android smoke plan for the CBI mobile web storefronts Frontgate, Ballard Designs, Garnet Hill, and Grandin Road. The suite uses seed.spec.ts to connect to Android Chrome and opens each site's certification URL with the configured bypass token. Tests are parameterized by site and must begin from a fresh browser/cart state. Product names, search terms, and option values are discovered at runtime from visible site content; no product or variant is hardcoded. Checkout and order submission use only approved certification/test data, and final submission is skipped when an approved non-production payment method or explicit QA authorization is unavailable.

## Test Scenarios

### 1. CBI Mobile Cross-Site Smoke

**Seed:** `seed.spec.ts`

#### 1.1. SM-001 Open each CBI site on real Android

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Run the test with seed.spec.ts and connect to Chrome on the real Android device through CDP.
    - expect: A real Android Chrome context is available.
    - expect: The test does not silently fall back to a desktop or emulated browser.
  2. For each configured site in config/sites.ts (Frontgate, Ballard Designs, Garnet Hill, and Grandin Road), navigate to its configured certification URL and wait for DOM content to load.
    - expect: The selected site resolves and loads without a network or certificate error.
    - expect: The site remains within the expected site domain and certification environment.
  3. Wait for the mobile shell to settle, dismiss only expected site-provided cookie, privacy, location, or promotional dialogs, and record the page title and final URL.
    - expect: The page title is non-empty and the document body is visible.
    - expect: Any dismissed dialog is a normal site dialog; unexpected errors, blank content, or redirects are failures.

#### 1.2. SM-002 Verify shared global mobile elements

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Starting from the freshly opened site, inspect the visible mobile header and use accessible roles, labels, landmarks, or stable site attributes to identify the header controls.
    - expect: A visible brand/logo or home link is present.
    - expect: A mobile menu/navigation control is present or the primary navigation is accessible.
    - expect: Search access is visible and actionable.
    - expect: Account/sign-in access is visible or available from the mobile menu.
    - expect: Cart/bag access is visible and exposes an empty or zero-item state for the fresh session.
  2. Open and close the mobile navigation if present, then open and close search without submitting a query.
    - expect: Navigation and search overlays open and close without layout breakage.
    - expect: Focus remains usable on the Android viewport and no control is obscured by the overlay.
  3. Scroll to the bottom of the home page or use the footer landmark, then inspect footer links and return to the top.
    - expect: A visible footer is rendered with usable links or accordions.
    - expect: The page remains responsive and no horizontal overflow or overlapping global element is observed.

#### 1.3. SM-003 Discover and execute a dynamic product search

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Open the site's search control and inspect the input, autocomplete suggestions, recently viewed terms, category links, or other runtime-provided discovery sources.
    - expect: A usable search input is visible and focused or can be focused.
    - expect: The test can obtain a non-empty search term from current site content without hardcoding a product name.
  2. Choose the first usable runtime-discovered term that is not a placeholder, or derive a term from a visible category/navigation label or an eligible product listing when autocomplete is unavailable. Use a configuration fallback only if the site provides no discoverable term.
    - expect: The selected term is recorded for diagnostics.
    - expect: The term is not an empty string, placeholder text, or a hardcoded product-specific value.
  3. Submit the discovered term using the search control and wait for the results page or results region to become ready.
    - expect: The URL, heading, or results state reflects a submitted search.
    - expect: The results page contains a visible results region, product cards, or an explicit no-results state that is handled as a test failure for smoke coverage.
  4. Inspect the result cards and choose the first visible, enabled product link with a usable product-detail URL; ignore sponsored, placeholder, duplicate, or unavailable tiles.
    - expect: At least one eligible product can be selected without relying on a product name.
    - expect: The selected product link is actionable on the Android viewport.

#### 1.4. SM-004 Open and verify a dynamic PDP

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Open the selected product from the search results and wait for the product detail content to load.
    - expect: The URL or page content identifies a product detail page.
    - expect: The PDP body and primary product content are visible.
  2. Capture the visible product title/name, canonical or product URL, and displayed price text before interacting with options.
    - expect: The product name is non-empty and stored for later cart and checkout comparisons.
    - expect: A price or price-state is visible, or the page clearly identifies a valid configured price state.
    - expect: The captured product identity is not replaced by a hardcoded expected value.
  3. Verify the PDP's core content using semantic locators and stable attributes: primary image/gallery, product title, price, availability or fulfillment status, quantity control if present, product description/details, and Add to Cart/Add to Bag control.
    - expect: The primary image or gallery is visible and loaded or has an intentional accessible image state.
    - expect: The title and price are visible and readable.
    - expect: Availability and fulfillment messaging is present when supplied by the site.
    - expect: The primary purchase control is visible, enabled when the product is purchasable, and not hidden behind an unresolved modal.
  4. Inspect breadcrumbs, ratings/reviews, promotional messaging, delivery estimates, and accordion content when present, without making optional content a cross-site hard requirement.
    - expect: Optional modules do not block the core purchase flow.
    - expect: Any displayed product information is internally consistent with the selected PDP.

#### 1.5. SM-005 Dynamically select required product options or variants

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Enumerate visible required selectors, swatches, radio groups, buttons, and other variant controls on the PDP; distinguish required product options from quantity, personalization, financing, and unrelated controls.
    - expect: All visible required option groups are identified from labels, required attributes, validation messages, or purchase-control state.
    - expect: No option label or value is assumed in advance.
  2. For each required option group, choose the first visible, enabled, in-stock value that is not a placeholder such as Select or Choose; for selects, read option attributes and labels before selecting; for swatches/buttons, use accessible labels or data attributes.
    - expect: Only enabled and purchasable options are selected.
    - expect: The selected label/value for every group is captured for later assertions.
    - expect: Dependent option groups update without leaving the PDP or producing an error.
  3. If selecting one option changes the available choices, re-enumerate the dependent group and repeat until every required group is complete.
    - expect: The Add to Cart control becomes enabled or the page reports a valid purchasable selection.
    - expect: Disabled, sold-out, or placeholder values are not selected.
  4. If the PDP has no required variants, record that no required option groups were present and continue with the default purchasable configuration.
    - expect: The test does not fail merely because a product has no variants.
    - expect: The selected configuration remains identifiable as the product's default configuration.

#### 1.6. SM-006 Add the selected product to cart

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Record the selected quantity, defaulting to the displayed minimum quantity when the control exists, and retain the captured product name, price, and option labels.
    - expect: The quantity is valid, visible, and within the site's allowed range.
    - expect: The product identity and selected configuration are available for downstream assertions.
  2. Activate Add to Cart/Add to Bag and wait for the cart drawer, confirmation message, or navigation response.
    - expect: A success confirmation or cart update is displayed.
    - expect: The selected product is not reported as unavailable or invalid.
  3. If the site opens a mini-cart, inspect it and use the provided control to continue to the full cart; otherwise open the global cart control.
    - expect: The cart can be opened from the success state or global navigation.
    - expect: The flow does not add a second item through repeated clicks.

#### 1.7. SM-007 Verify cart contents and selected product information

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Wait for the full cart page or cart region and locate the item using the captured product identity, product URL, or item data attributes rather than a hardcoded name.
    - expect: The cart is loaded and contains at least one line item.
    - expect: The selected product is present and uniquely identifiable.
  2. Compare the cart line item's product name and link with the PDP capture.
    - expect: The cart product name and product destination match the selected PDP.
    - expect: The cart item is not a different product selected by a stale or duplicate click.
  3. Compare displayed price, quantity, selected variant/option labels, and availability messaging between PDP and cart wherever each value is shown.
    - expect: Displayed selected option labels match the captured PDP selection.
    - expect: The cart quantity matches the requested quantity or the site clearly applies a documented minimum/default.
    - expect: The cart price is present and consistent with the selected configuration, allowing only an explicitly displayed promotion or tax/shipping distinction.
  4. Verify the cart subtotal/total region, remove/update controls, and Checkout control.
    - expect: A subtotal or total is visible.
    - expect: Cart controls are usable without changing the item unexpectedly.
    - expect: Checkout is visible and enabled for the valid cart.

#### 1.8. SM-008 Proceed through checkout and validate order summary

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Select Checkout from the cart and wait for the checkout shell to load.
    - expect: Checkout loads in the same tab or an expected checkout tab.
    - expect: The current checkout step and order summary are visible or accessible.
  2. Capture the checkout order-summary product identity, selected options, quantity, item price, subtotal, and any displayed shipping/tax/discount totals.
    - expect: The checkout summary contains the same product and configuration as the cart.
    - expect: The quantity and item price remain consistent with the cart, accounting for clearly labeled promotions.
  3. Verify the shipping/contact step's required fields, validation affordances, and Continue/Next control without entering data yet.
    - expect: Required shipping and contact fields are visible or can be opened.
    - expect: The next-step control is present and the checkout identifies missing required data when invoked.

#### 1.9. SM-009 Enter safe QA shipping data and validate shipping step

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Populate only approved non-production QA shipping/contact data from the repository's test-data configuration or the current run's injected QA environment variables. Do not use a real person's data.
    - expect: First name, last name, street, city, region/state, postal code, phone, and email are accepted in the site's corresponding fields.
    - expect: The entered values remain within the certification environment and are not exposed in test output beyond masked or approved diagnostics.
  2. Submit or continue from the shipping step and wait for validation or the next checkout step.
    - expect: Valid QA data advances the flow without client-side validation errors.
    - expect: If the site requires address validation, a suggested address can be reviewed and the QA address is intentionally selected or confirmed.
  3. Re-check the order summary after shipping is accepted.
    - expect: The same dynamic product name, selected options, quantity, and item price remain present.
    - expect: Shipping cost, tax, discounts, and order total are recalculated and visibly labeled.
    - expect: No unexpected product, option, or quantity change occurs.

#### 1.10. SM-010 Validate payment step and complete the order with approved QA data

**File:** `specs/cbi-mobile-smoke-test-plan.md`

**Steps:**
  1. Continue to the payment step using the site's current checkout control and wait for payment fields or the approved payment-provider component to load.
    - expect: The payment step is reachable and its heading or payment region is visible.
    - expect: Required payment controls are rendered without a blank iframe, script error, or unexpected authentication failure.
  2. Before entering payment data, verify that the current environment is a certification/test environment and that approved QA payment data is available through the team's secure test-data mechanism.
    - expect: The test is allowed to continue only with non-production payment data and explicit QA authorization.
    - expect: The test stops before submission if the environment or payment data cannot be verified; no live card or personal payment information is used.
  3. Enter the approved QA payment data through the provider's supported fields, complete any required non-production billing details or test challenge, and review the final order summary.
    - expect: Payment validation succeeds using QA data.
    - expect: The final summary still matches the captured product, selected options, quantity, price, and shipping details.
    - expect: The final total is present and consistent with the checkout calculations.
  4. Submit the order once using the enabled Place Order/Complete Order control and wait for the confirmation page or confirmation region.
    - expect: The order is created only in the approved certification environment.
    - expect: A confirmation state is displayed with an order number or equivalent confirmation identifier.
    - expect: The confirmation retains or exposes the expected product/order summary information.
    - expect: Repeated submission is prevented or not attempted.
  5. If approved QA payment data or explicit authorization is unavailable, stop before Place Order and mark the scenario blocked at the payment gate.
    - expect: No production order is submitted.
    - expect: The report clearly identifies the missing safe-test prerequisite rather than treating an intentional stop as a product failure.
