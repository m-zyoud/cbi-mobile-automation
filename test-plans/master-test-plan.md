# CBI Mobile Automation - Master Test Plan

## Purpose

This document defines the current functional automation coverage for the CBI mobile websites.

The framework is organized by functional area to provide reusable, maintainable, and scalable automation across the configured CBI brands.

The test design includes:

- Positive scenarios
- Negative scenarios
- Boundary scenarios
- Edge cases
- Mobile-specific validation
- Navigation behavior
- State persistence
- Smoke coverage
- Regression coverage

Each test case includes:

- Test Case ID
- Scenario
- Test Type
- Smoke Coverage
- Regression Coverage
- Notes

---

# Supported Brands

The framework is configured for:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

Site configuration is centralized in:

```text
config/sites.ts
```

---

# Automation Architecture

The functional tests are organized by area:

```text
tests/
├── areas/
│   ├── account/
│   │   ├── login.spec.ts
│   │   └── registration.spec.ts
│   │
│   ├── cart/
│   │   └── cart.spec.ts
│   │
│   ├── checkout/
│   │   └── checkout.spec.ts
│   │
│   ├── globals/
│   │   └── header-footer.spec.ts
│   │
│   ├── pdp/
│   │   └── pdp.spec.ts
│   │
│   ├── plp/
│   │   └── plp.spec.ts
│   │
│   ├── search/
│   │   └── search.spec.ts
│   │
│   └── wishlist/
│       └── wishlist.spec.ts
│
├── fixtures/
│   └── android.fixture.ts
│
├── helpers/
│   └── product-discovery.ts
│
└── journeys/
    └── purchase-flow.e2e.spec.ts
```

Smoke and Regression coverage are selected using:

```text
@smoke
@regression
```

The same functional scenario can participate in both suites without duplicating the implementation.

---

# Scenario Classification

| Type | Purpose |
|---|---|
| Positive | Validate expected customer behavior |
| Negative | Validate invalid or unsupported behavior |
| Boundary | Validate minimum, maximum, and limit conditions |
| Edge | Validate uncommon states and transitions |
| UI / Edge | Validate mobile layout, overflow, and interaction stability |

---

# 1. Product Listing Page - PLP

## Scope

PLP coverage includes:

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

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| PLP-001 | Verify PLP loads successfully | Positive | Yes | Yes |
| PLP-002 | Verify breadcrumb is displayed correctly | Positive | No | Yes |
| PLP-003 | Verify product grid is displayed | Positive | Yes | Yes |
| PLP-004 | Verify product card displays product image | Positive | No | Yes |
| PLP-005 | Verify product card displays product name | Positive | No | Yes |
| PLP-006 | Verify product card displays product price | Positive | Yes | Yes |
| PLP-007 | Verify clicking product opens correct PDP | Positive | Yes | Yes |
| PLP-008 | Verify sorting from low price to high price | Positive | Yes | Yes |
| PLP-009 | Verify sorting from high price to low price | Positive | No | Yes |
| PLP-010 | Verify selected sort option remains active | Positive | No | Yes |
| PLP-011 | Verify mobile filter drawer opens | Positive | No | Yes |
| PLP-012 | Verify applying a single filter | Positive | Yes | Yes |
| PLP-013 | Verify applying multiple filters | Positive | No | Yes |
| PLP-014 | Verify removing one applied filter | Positive | No | Yes |
| PLP-015 | Verify clearing all filters | Positive | No | Yes |
| PLP-016 | Verify filtered products match selected filter | Positive | No | Yes |
| PLP-017 | Verify no-results state after restrictive filter | Negative | No | Yes |
| PLP-018 | Verify pagination or Load More behavior | Positive | No | Yes |
| PLP-019 | Verify back navigation returns to previous PLP state | Edge | No | Yes |
| PLP-020 | Verify product swatches are displayed when available | Positive | No | Yes |
| PLP-021 | Verify swatch selection updates product information | Positive | No | Yes |
| PLP-022 | Verify out-of-stock product state | Negative | No | Yes |
| PLP-023 | Verify minimum price boundary filter | Boundary | No | Yes |
| PLP-024 | Verify maximum price boundary filter | Boundary | No | Yes |
| PLP-025 | Verify invalid or empty price range handling | Negative | No | Yes |
| PLP-026 | Verify filter drawer closes correctly | Positive | No | Yes |
| PLP-027 | Verify mobile sort control opens and closes | Positive | No | Yes |
| PLP-028 | Verify URL updates after filtering when supported | Positive | No | Yes |
| PLP-029 | Verify URL updates after sorting when supported | Positive | No | Yes |
| PLP-030 | Verify refresh preserves filter/sort state when supported | Edge | No | Yes |
| PLP-031 | Verify product count updates after filtering | Positive | No | Yes |
| PLP-032 | Verify product count remains valid after clearing filters | Positive | No | Yes |
| PLP-033 | Verify duplicate products are not displayed unexpectedly | Edge | No | Yes |
| PLP-034 | Verify product card price format is valid | Boundary | No | Yes |
| PLP-035 | Verify promotional price displays correctly | Positive | No | Yes |
| PLP-036 | Verify unavailable filter values are disabled or hidden | Negative | No | Yes |
| PLP-037 | Verify horizontal overflow does not appear on mobile | UI / Edge | No | Yes |
| PLP-038 | Verify product card elements do not overlap on mobile | UI / Edge | No | Yes |
| PLP-039 | Verify scrolling through product list works correctly | Positive | No | Yes |
| PLP-040 | Verify PLP after orientation/layout change when supported | Edge | No | Yes |

---

## Smoke PLP Coverage

Critical PLP Smoke scenarios include:

- PLP-001
- PLP-003
- PLP-006
- PLP-007
- PLP-008
- PLP-012

All PLP scenarios participate in Regression coverage.

---

# 2. Product Detail Page - PDP

## Scope

PDP coverage includes:

- Page loading
- Product title
- Product imagery
- Pricing
- Availability
- Product options
- Variants
- Quantity
- Add To Cart
- Product details
- Reviews
- Breadcrumbs
- Mobile layout
- Negative and edge behavior

---

## PDP Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| PDP-001 | Verify PDP loads successfully | Positive | Yes | Yes |
| PDP-002 | Verify product title is displayed | Positive | Yes | Yes |
| PDP-003 | Verify product price is displayed | Positive | Yes | Yes |
| PDP-004 | Verify primary product image is displayed | Positive | Yes | Yes |
| PDP-005 | Verify additional product images/gallery when supported | Positive | No | Yes |
| PDP-006 | Verify product breadcrumb is displayed | Positive | No | Yes |
| PDP-007 | Verify product availability status is displayed | Positive | Yes | Yes |
| PDP-008 | Verify Add To Cart button is visible | Positive | Yes | Yes |
| PDP-009 | Verify Add To Cart is enabled for valid configuration | Positive | Yes | Yes |
| PDP-010 | Verify required product option groups are identified | Positive | Yes | Yes |
| PDP-011 | Verify selecting a valid color option | Positive | Yes | Yes |
| PDP-012 | Verify selecting a valid size option | Positive | Yes | Yes |
| PDP-013 | Verify selecting multiple required options | Positive | Yes | Yes |
| PDP-014 | Verify disabled option cannot be selected | Negative | No | Yes |
| PDP-015 | Verify out-of-stock option cannot be purchased | Negative | No | Yes |
| PDP-016 | Verify dependent options update correctly | Edge | No | Yes |
| PDP-017 | Verify Add To Cart without required selection | Negative | No | Yes |
| PDP-018 | Verify product without required options can be added | Positive | No | Yes |
| PDP-019 | Verify quantity defaults to valid minimum | Boundary | No | Yes |
| PDP-020 | Verify increasing quantity | Positive | No | Yes |
| PDP-021 | Verify decreasing quantity | Positive | No | Yes |
| PDP-022 | Verify quantity minimum boundary | Boundary | No | Yes |
| PDP-023 | Verify quantity maximum boundary when enforced | Boundary | No | Yes |
| PDP-024 | Verify invalid manual quantity input | Negative | No | Yes |
| PDP-025 | Verify Add To Cart updates Cart state | Positive | Yes | Yes |
| PDP-026 | Verify correct product is added to Cart | Positive | Yes | Yes |
| PDP-027 | Verify selected options remain consistent in Cart | Positive | No | Yes |
| PDP-028 | Verify selected quantity remains consistent in Cart | Positive | No | Yes |
| PDP-029 | Verify price remains consistent after Add To Cart | Positive | No | Yes |
| PDP-030 | Verify promotional price is displayed correctly | Positive | No | Yes |
| PDP-031 | Verify option selection updates price when applicable | Positive | No | Yes |
| PDP-032 | Verify option selection updates image when applicable | Positive | No | Yes |
| PDP-033 | Verify option selection updates SKU when supported | Positive | No | Yes |
| PDP-034 | Verify product description/details are accessible | Positive | No | Yes |
| PDP-035 | Verify details accordion opens and closes | Positive | No | Yes |
| PDP-036 | Verify reviews/ratings when available | Positive | No | Yes |
| PDP-037 | Verify unavailable product state | Negative | No | Yes |
| PDP-038 | Verify sold-out product messaging | Negative | No | Yes |
| PDP-039 | Verify back navigation returns to previous state | Positive | No | Yes |
| PDP-040 | Verify refresh behavior with selected options | Edge | No | Yes |
| PDP-041 | Verify invalid/non-existent PDP URL behavior | Negative | No | Yes |
| PDP-042 | Verify product image remains usable on mobile | UI / Edge | No | Yes |
| PDP-043 | Verify PDP controls do not overlap on mobile | UI / Edge | No | Yes |
| PDP-044 | Verify sticky Add To Cart when supported | Positive | No | Yes |
| PDP-045 | Verify long PDP scrolling remains usable | Edge | No | Yes |
| PDP-046 | Verify optional content does not block purchase flow | Edge | No | Yes |
| PDP-047 | Verify variant can be changed before Add To Cart | Positive | No | Yes |
| PDP-048 | Verify changing option updates availability | Positive | No | Yes |
| PDP-049 | Verify repeated Add To Cart is handled safely | Edge | No | Yes |
| PDP-050 | Verify PDP after orientation/layout change when supported | Edge | No | Yes |

---

# 3. Search

## Scope

Search coverage includes:

- Search entry point
- Search input
- Valid search
- Invalid search
- Suggestions
- Result presentation
- Product navigation
- Sorting
- Filtering
- Pagination
- Mobile behavior
- URL state
- Navigation
- Repeated interaction

---

## Search Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| SEARCH-001 | Verify Search control opens successfully | Positive | Yes | Yes |
| SEARCH-002 | Verify Search input accepts text | Positive | No | Yes |
| SEARCH-003 | Verify valid search returns results | Positive | Yes | Yes |
| SEARCH-004 | Verify results contain eligible products | Positive | Yes | Yes |
| SEARCH-005 | Verify product can open from Search results | Positive | Yes | Yes |
| SEARCH-006 | Verify runtime search terms can be discovered | Positive | No | Yes |
| SEARCH-007 | Verify exact search returns relevant results | Positive | Yes | Yes |
| SEARCH-008 | Verify partial search returns relevant results | Positive | No | Yes |
| SEARCH-009 | Verify case handling when supported | Edge | No | Yes |
| SEARCH-010 | Verify leading/trailing spaces | Edge | No | Yes |
| SEARCH-011 | Verify repeated spaces | Edge | No | Yes |
| SEARCH-012 | Verify no-results state | Negative | Yes | Yes |
| SEARCH-013 | Verify empty Search submission | Negative | No | Yes |
| SEARCH-014 | Verify whitespace-only Search | Negative | No | Yes |
| SEARCH-015 | Verify special characters | Negative | No | Yes |
| SEARCH-016 | Verify numeric Search term | Edge | No | Yes |
| SEARCH-017 | Verify suggestions appear when supported | Positive | No | Yes |
| SEARCH-018 | Verify Search suggestion can be selected | Positive | No | Yes |
| SEARCH-019 | Verify suggestions update with query | Positive | No | Yes |
| SEARCH-020 | Verify result product image | Positive | No | Yes |
| SEARCH-021 | Verify result product name | Positive | No | Yes |
| SEARCH-022 | Verify result product price | Positive | No | Yes |
| SEARCH-023 | Verify result count when displayed | Positive | No | Yes |
| SEARCH-024 | Verify duplicate products are not unexpected | Edge | No | Yes |
| SEARCH-025 | Verify pagination/Load More when supported | Positive | No | Yes |
| SEARCH-026 | Verify query remains available on result page | Positive | No | Yes |
| SEARCH-027 | Verify Back returns to Search results | Positive | No | Yes |
| SEARCH-028 | Verify refresh keeps Search usable | Edge | No | Yes |
| SEARCH-029 | Verify Search URL reflects query when supported | Positive | No | Yes |
| SEARCH-030 | Verify a new Search from existing results | Positive | No | Yes |
| SEARCH-031 | Verify Search sorting when available | Positive | No | Yes |
| SEARCH-032 | Verify Search filtering when available | Positive | No | Yes |
| SEARCH-033 | Verify clearing Search input | Positive | No | Yes |
| SEARCH-034 | Verify reopening Search | Edge | No | Yes |
| SEARCH-035 | Verify rapid repeated Search submissions | Edge | No | Yes |
| SEARCH-036 | Verify no horizontal overflow on mobile | UI / Edge | No | Yes |
| SEARCH-037 | Verify result cards do not overlap | UI / Edge | No | Yes |
| SEARCH-038 | Verify scrolling Search results | Positive | No | Yes |
| SEARCH-039 | Verify Search after returning from PDP | Edge | No | Yes |
| SEARCH-040 | Verify Search after layout/orientation change | Edge | No | Yes |

---

# 4. Cart

## Scope

Cart coverage includes:

- Cart entry
- Product information
- Quantity
- Product variants
- Price
- Removal
- Empty Cart
- Multiple products
- Subtotal
- Promotions
- Persistence
- Checkout navigation
- Mobile layout

---

## Cart Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| CART-001 | Verify Cart opens successfully | Positive | Yes | Yes |
| CART-002 | Verify Cart contains added product | Positive | Yes | Yes |
| CART-003 | Verify Cart product name | Positive | Yes | Yes |
| CART-004 | Verify Cart product image | Positive | No | Yes |
| CART-005 | Verify Checkout control is available | Positive | Yes | Yes |
| CART-006 | Verify Cart remains usable after product addition | Positive | Yes | Yes |
| CART-007 | Verify Cart product price | Positive | Yes | Yes |
| CART-008 | Verify Cart quantity | Positive | No | Yes |
| CART-009 | Verify selected product options | Positive | No | Yes |
| CART-010 | Verify SKU/identifier when available | Positive | No | Yes |
| CART-011 | Verify quantity can increase | Positive | Yes | Yes |
| CART-012 | Verify quantity can decrease | Positive | No | Yes |
| CART-013 | Verify minimum quantity boundary | Boundary | No | Yes |
| CART-014 | Verify maximum quantity boundary | Boundary | No | Yes |
| CART-015 | Verify invalid quantity handling | Negative | No | Yes |
| CART-016 | Verify item can be removed | Positive | Yes | Yes |
| CART-017 | Verify Cart becomes empty after final removal | Positive | Yes | Yes |
| CART-018 | Verify empty Cart state | Positive | No | Yes |
| CART-019 | Verify multiple products can be added | Positive | No | Yes |
| CART-020 | Verify multiple items remain distinct | Edge | No | Yes |
| CART-021 | Verify duplicate product handling | Edge | No | Yes |
| CART-022 | Verify Cart subtotal | Positive | Yes | Yes |
| CART-023 | Verify subtotal after quantity increase | Positive | No | Yes |
| CART-024 | Verify subtotal after quantity decrease | Positive | No | Yes |
| CART-025 | Verify subtotal after item removal | Positive | No | Yes |
| CART-026 | Verify promotional price consistency | Positive | No | Yes |
| CART-027 | Verify promo/coupon control when supported | Positive | No | Yes |
| CART-028 | Verify invalid promo handling | Negative | No | Yes |
| CART-029 | Verify Cart after refresh | Edge | No | Yes |
| CART-030 | Verify Cart after leaving and returning | Edge | No | Yes |
| CART-031 | Verify Checkout navigation | Positive | Yes | Yes |
| CART-032 | Verify repeated Checkout action safely | Edge | No | Yes |
| CART-033 | Verify Cart horizontal overflow | UI / Edge | No | Yes |
| CART-034 | Verify Cart controls do not overlap | UI / Edge | No | Yes |
| CART-035 | Verify Cart after layout/orientation change | Edge | No | Yes |

---

# 5. Checkout

## Scope

Checkout coverage includes:

- Checkout loading
- Guest Checkout
- Shipping
- Required fields
- Field validation
- Address autocomplete
- Address verification
- Delivery Method
- Order summary
- Totals
- Payment checkpoint
- Mobile behavior
- Safe prevention of final submission

---

## Checkout Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| CHECKOUT-001 | Verify Checkout loads successfully | Positive | Yes | Yes |
| CHECKOUT-002 | Verify valid Checkout state is available | Positive | No | Yes |
| CHECKOUT-003 | Verify Guest Checkout can continue when required | Positive | Yes | Yes |
| CHECKOUT-004 | Verify Shipping information can be completed | Positive | Yes | Yes |
| CHECKOUT-005 | Verify user can continue to Delivery Method | Positive | Yes | Yes |
| CHECKOUT-006 | Verify Delivery Method can be selected | Positive | No | Yes |
| CHECKOUT-007 | Verify user can continue toward Payment | Positive | Yes | Yes |
| CHECKOUT-008 | Verify Payment step is displayed | Positive | Yes | Yes |
| CHECKOUT-009 | Verify order summary is visible | Positive | No | Yes |
| CHECKOUT-010 | Verify Cart items remain visible in summary | Positive | No | Yes |
| CHECKOUT-011 | Verify product quantity in Checkout | Positive | No | Yes |
| CHECKOUT-012 | Verify Checkout subtotal | Positive | No | Yes |
| CHECKOUT-013 | Verify Shipping cost when applicable | Positive | No | Yes |
| CHECKOUT-014 | Verify estimated tax when applicable | Positive | No | Yes |
| CHECKOUT-015 | Verify Checkout total is greater than zero | Positive | No | Yes |
| CHECKOUT-016 | Verify First Name is required | Negative | No | Yes |
| CHECKOUT-017 | Verify Last Name is required | Negative | No | Yes |
| CHECKOUT-018 | Verify Street Address is required | Negative | No | Yes |
| CHECKOUT-019 | Verify City is required when exposed | Negative | No | Yes |
| CHECKOUT-020 | Verify State/Region is required when exposed | Negative | No | Yes |
| CHECKOUT-021 | Verify ZIP/Postal Code is required | Negative | No | Yes |
| CHECKOUT-022 | Verify Phone is required when requested | Negative | No | Yes |
| CHECKOUT-023 | Verify Email is required when requested | Negative | No | Yes |
| CHECKOUT-024 | Verify malformed Email is rejected | Negative | No | Yes |
| CHECKOUT-025 | Verify invalid Phone is handled safely | Negative | No | Yes |
| CHECKOUT-026 | Verify invalid Postal Code handling | Negative | No | Yes |
| CHECKOUT-027 | Verify Shipping Address autocomplete | Positive | No | Yes |
| CHECKOUT-028 | Verify Address Verification handling | Edge | No | Yes |
| CHECKOUT-029 | Verify existing Shipping state is handled | Edge | No | Yes |
| CHECKOUT-030 | Verify existing Delivery state is handled | Edge | No | Yes |
| CHECKOUT-031 | Verify Checkout remains usable after refresh | Edge | No | Yes |
| CHECKOUT-032 | Verify Back navigation safely | Edge | No | Yes |
| CHECKOUT-033 | Verify Forward navigation safely | Edge | No | Yes |
| CHECKOUT-034 | Verify product remains visible through Checkout | Positive | No | Yes |
| CHECKOUT-035 | Verify pricing remains consistent | Positive | No | Yes |
| CHECKOUT-036 | Verify Payment controls are available | Positive | No | Yes |
| CHECKOUT-037 | Verify no unexpected Confirmation state | Negative | No | Yes |
| CHECKOUT-038 | Verify Checkout has no horizontal overflow | UI / Edge | No | Yes |
| CHECKOUT-039 | Verify controls do not overlap on mobile | UI / Edge | No | Yes |
| CHECKOUT-040 | Verify final order submission is not triggered | Safety / Edge | No | Yes |

---

## Checkout Safety

The standard automated Checkout flow stops at the Payment checkpoint.

It must not intentionally activate:

```text
Place Order
Submit Order
Complete Purchase
Complete Order
Buy Now
Purchase
```

No final order submission is part of the standard automated suite.

---

# 6. Login

## Scope

Login coverage includes:

- My Account access
- Login form
- Required fields
- Email validation
- Password behavior
- Invalid credentials
- Keyboard behavior
- Navigation
- Mobile layout

---

## Login Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| LOGIN-001 | Verify My Account can be opened | Positive | Yes | Yes |
| LOGIN-002 | Verify Login form is visible | Positive | Yes | Yes |
| LOGIN-003 | Verify Email field is visible | Positive | Yes | Yes |
| LOGIN-004 | Verify Password field is visible | Positive | Yes | Yes |
| LOGIN-005 | Verify Password is masked | Positive | Yes | Yes |
| LOGIN-006 | Verify Login control is available | Positive | Yes | Yes |
| LOGIN-007 | Verify Forgot Password is available | Positive | Yes | Yes |
| LOGIN-008 | Verify empty Login submission | Negative | No | Yes |
| LOGIN-009 | Verify missing Email validation | Negative | No | Yes |
| LOGIN-010 | Verify missing Password validation | Negative | No | Yes |
| LOGIN-011 | Verify invalid Email format | Negative | No | Yes |
| LOGIN-012 | Verify invalid credentials handling | Negative | No | Yes |
| LOGIN-013 | Verify leading Email whitespace | Edge | No | Yes |
| LOGIN-014 | Verify trailing Email whitespace | Edge | No | Yes |
| LOGIN-015 | Verify Email case handling | Edge | No | Yes |
| LOGIN-016 | Verify long Email input | Boundary | No | Yes |
| LOGIN-017 | Verify long Password input | Boundary | No | Yes |
| LOGIN-018 | Verify Password remains masked after input | Positive | No | Yes |
| LOGIN-019 | Verify Enter-key Login submission | Positive | No | Yes |
| LOGIN-020 | Verify repeated Login interaction | Edge | No | Yes |
| LOGIN-021 | Verify refresh keeps Login usable | Edge | No | Yes |
| LOGIN-022 | Verify Back navigation | Edge | No | Yes |
| LOGIN-023 | Verify Forward navigation | Edge | No | Yes |
| LOGIN-024 | Verify form remains usable after validation | Edge | No | Yes |
| LOGIN-025 | Verify validation messages remain readable | UI / Edge | No | Yes |
| LOGIN-026 | Verify Login page has no horizontal overflow | UI / Edge | No | Yes |
| LOGIN-027 | Verify form controls do not overlap | UI / Edge | No | Yes |
| LOGIN-028 | Verify long content remains usable | UI / Edge | No | Yes |
| LOGIN-029 | Verify mobile keyboard interaction remains usable | UI / Edge | No | Yes |
| LOGIN-030 | Verify Login remains functional after layout change | Edge | No | Yes |

---

# 7. Registration

## Scope

Registration coverage includes:

- Registration access
- Required fields
- Name validation
- Email validation
- Password validation
- Confirm Password
- Existing account handling
- Terms/Consent
- Navigation
- Mobile behavior

---

## Registration Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| REG-001 | Verify Registration page opens | Positive | Yes | Yes |
| REG-002 | Verify Registration form is visible | Positive | Yes | Yes |
| REG-003 | Verify First Name input | Positive | Yes | Yes |
| REG-004 | Verify Last Name input | Positive | Yes | Yes |
| REG-005 | Verify Email input | Positive | Yes | Yes |
| REG-006 | Verify Password input | Positive | Yes | Yes |
| REG-007 | Verify Password masking | Positive | Yes | Yes |
| REG-008 | Verify Registration submit control | Positive | No | Yes |
| REG-009 | Verify empty Registration submission | Negative | Yes | Yes |
| REG-010 | Verify required field validation | Negative | No | Yes |
| REG-011 | Verify missing First Name | Negative | No | Yes |
| REG-012 | Verify missing Last Name | Negative | No | Yes |
| REG-013 | Verify missing Email | Negative | No | Yes |
| REG-014 | Verify missing Password | Negative | No | Yes |
| REG-015 | Verify invalid Email format | Negative | No | Yes |
| REG-016 | Verify weak Password handling | Negative | No | Yes |
| REG-017 | Verify Confirm Password when supported | Positive | No | Yes |
| REG-018 | Verify Password mismatch handling | Negative | No | Yes |
| REG-019 | Verify existing Email handling | Negative | No | Yes |
| REG-020 | Verify Terms/Consent when supported | Positive | No | Yes |
| REG-021 | Verify leading/trailing whitespace handling | Edge | No | Yes |
| REG-022 | Verify long First Name | Boundary | No | Yes |
| REG-023 | Verify long Last Name | Boundary | No | Yes |
| REG-024 | Verify long Email input | Boundary | No | Yes |
| REG-025 | Verify long Password input | Boundary | No | Yes |
| REG-026 | Verify keyboard submission behavior | Edge | No | Yes |
| REG-027 | Verify refresh behavior | Edge | No | Yes |
| REG-028 | Verify Back/Forward navigation | Edge | No | Yes |
| REG-029 | Verify no horizontal overflow / overlap | UI / Edge | No | Yes |
| REG-030 | Verify Registration after layout change | Edge | No | Yes |

---

# 8. Wishlist

## Scope

Wishlist coverage includes:

- Wishlist action
- Product addition
- Product identity
- Removal
- Empty state
- Persistence
- Duplicate handling
- Navigation
- Mobile behavior

---

## Wishlist Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| WISHLIST-001 | Verify Wishlist control is available | Positive | Yes | Yes |
| WISHLIST-002 | Verify product can be added to Wishlist | Positive | Yes | Yes |
| WISHLIST-003 | Verify Wishlist can be opened | Positive | Yes | Yes |
| WISHLIST-004 | Verify added product appears in Wishlist | Positive | Yes | Yes |
| WISHLIST-005 | Verify correct product identity | Positive | Yes | Yes |
| WISHLIST-006 | Verify product can be removed | Positive | Yes | Yes |
| WISHLIST-007 | Verify empty Wishlist state | Positive | No | Yes |
| WISHLIST-008 | Verify repeated Add action safely | Edge | No | Yes |
| WISHLIST-009 | Verify duplicate Wishlist behavior | Edge | No | Yes |
| WISHLIST-010 | Verify Wishlist count/badge when supported | Positive | No | Yes |
| WISHLIST-011 | Verify product image | Positive | No | Yes |
| WISHLIST-012 | Verify product name | Positive | No | Yes |
| WISHLIST-013 | Verify product price | Positive | No | Yes |
| WISHLIST-014 | Verify product options when available | Positive | No | Yes |
| WISHLIST-015 | Verify Wishlist product link | Positive | No | Yes |
| WISHLIST-016 | Verify Wishlist after refresh | Edge | No | Yes |
| WISHLIST-017 | Verify Wishlist after leaving and returning | Edge | No | Yes |
| WISHLIST-018 | Verify Back navigation | Edge | No | Yes |
| WISHLIST-019 | Verify Forward navigation | Edge | No | Yes |
| WISHLIST-020 | Verify multiple Wishlist items | Positive | No | Yes |
| WISHLIST-021 | Verify removing one of multiple items | Positive | No | Yes |
| WISHLIST-022 | Verify repeated Add/Remove cycles | Edge | No | Yes |
| WISHLIST-023 | Verify optional account requirement safely | Edge | No | Yes |
| WISHLIST-024 | Verify Wishlist state recovery | Edge | No | Yes |
| WISHLIST-025 | Verify long product names remain readable | UI / Edge | No | Yes |
| WISHLIST-026 | Verify no horizontal overflow | UI / Edge | No | Yes |
| WISHLIST-027 | Verify Wishlist controls do not overlap | UI / Edge | No | Yes |
| WISHLIST-028 | Verify scrolling long Wishlist | UI / Edge | No | Yes |
| WISHLIST-029 | Verify Wishlist after PDP navigation | Edge | No | Yes |
| WISHLIST-030 | Verify Wishlist after layout/orientation change | Edge | No | Yes |

---

# 9. Global Header / Footer

## Scope

Global coverage includes:

- Header
- Logo
- Search
- Cart
- Account
- Mobile navigation
- Footer
- Newsletter
- Social links
- Navigation
- Responsive layout

---

## Global Test Cases

| ID | Scenario | Type | Smoke | Regression |
|---|---|---|---|---|
| GLOBAL-001 | Verify Header is visible | Positive | Yes | Yes |
| GLOBAL-002 | Verify Brand Logo is visible | Positive | Yes | Yes |
| GLOBAL-003 | Verify Search control is available | Positive | Yes | Yes |
| GLOBAL-004 | Verify Cart control is available | Positive | Yes | Yes |
| GLOBAL-005 | Verify Account control is available | Positive | Yes | Yes |
| GLOBAL-006 | Verify mobile navigation control | Positive | Yes | Yes |
| GLOBAL-007 | Verify Footer is visible | Positive | Yes | Yes |
| GLOBAL-008 | Verify Logo navigates correctly | Positive | No | Yes |
| GLOBAL-009 | Verify Search navigation | Positive | No | Yes |
| GLOBAL-010 | Verify Cart navigation | Positive | No | Yes |
| GLOBAL-011 | Verify Account navigation | Positive | No | Yes |
| GLOBAL-012 | Verify mobile menu opens | Positive | No | Yes |
| GLOBAL-013 | Verify mobile menu closes | Positive | No | Yes |
| GLOBAL-014 | Verify navigation links when available | Positive | No | Yes |
| GLOBAL-015 | Verify Footer links | Positive | No | Yes |
| GLOBAL-016 | Verify Newsletter control when supported | Positive | No | Yes |
| GLOBAL-017 | Verify Social links when supported | Positive | No | Yes |
| GLOBAL-018 | Verify external links safely | Edge | No | Yes |
| GLOBAL-019 | Verify Header after refresh | Edge | No | Yes |
| GLOBAL-020 | Verify Footer after refresh | Edge | No | Yes |
| GLOBAL-021 | Verify Back navigation | Edge | No | Yes |
| GLOBAL-022 | Verify Forward navigation | Edge | No | Yes |
| GLOBAL-023 | Verify repeated mobile-menu interaction | Edge | No | Yes |
| GLOBAL-024 | Verify Search can reopen | Edge | No | Yes |
| GLOBAL-025 | Verify global controls stay usable after scrolling | Edge | No | Yes |
| GLOBAL-026 | Verify no horizontal overflow | UI / Edge | No | Yes |
| GLOBAL-027 | Verify Header controls do not overlap | UI / Edge | No | Yes |
| GLOBAL-028 | Verify Footer controls do not overlap | UI / Edge | No | Yes |
| GLOBAL-029 | Verify long-page scrolling | UI / Edge | No | Yes |
| GLOBAL-030 | Verify global layout after orientation/layout change | Edge | No | Yes |

---

# Current Functional Coverage Summary

| Area | Scenario Range | Scenario Count |
|---|---|---:|
| PLP | PLP-001 → PLP-040 | 40 |
| PDP | PDP-001 → PDP-050 | 50 |
| Search | SEARCH-001 → SEARCH-040 | 40 |
| Cart | CART-001 → CART-035 | 35 |
| Checkout | CHECKOUT-001 → CHECKOUT-040 | 40 |
| Login | LOGIN-001 → LOGIN-030 | 30 |
| Registration | REG-001 → REG-030 | 30 |
| Wishlist | WISHLIST-001 → WISHLIST-030 | 30 |
| Global Header / Footer | GLOBAL-001 → GLOBAL-030 | 30 |

The table above represents functional scenario definitions.

The Playwright execution count is higher because scenarios are parameterized across configured CBI brands.

---

# Smoke Strategy

Smoke coverage is selected from the area-based scenarios using:

```text
@smoke
```

Run:

```bash
npm run test:smoke
```

Equivalent:

```bash
playwright test --grep @smoke --workers=1
```

Smoke focuses on critical customer functionality, including:

- Site availability
- Global navigation
- Search
- Product discovery
- PDP
- Product configuration
- Add To Cart
- Cart
- Checkout
- Shipping
- Delivery Method
- Payment checkpoint

---

# Regression Strategy

Regression coverage uses:

```text
@regression
```

Run:

```bash
npm run test:regression
```

Equivalent:

```bash
playwright test --grep @regression --workers=1
```

Regression includes broader:

- Positive validation
- Negative validation
- Boundary testing
- Edge cases
- Navigation
- Persistence
- Mobile layout
- Repeated interaction
- State-management validation

---

# End-to-End Purchase Journey

The dedicated E2E journey is implemented in:

```text
tests/journeys/purchase-flow.e2e.spec.ts
```

The journey validates:

```text
Open Brand
    ↓
Verify Global Elements
    ↓
Discover Search Term
    ↓
Search
    ↓
Discover Product Dynamically
    ↓
Open PDP
    ↓
Verify Product
    ↓
Select Required Options
    ↓
Add To Cart
    ↓
Open Cart
    ↓
Verify Same PDP Product In Cart
    ↓
Proceed To Checkout
    ↓
Continue As Guest
    ↓
Fill Shipping Information
    ↓
Reach Delivery Method
    ↓
Select Delivery Method
    ↓
Continue To Payment
    ↓
Verify Payment Checkpoint
    ↓
STOP
```

The standard E2E journey intentionally stops before final order submission.

---

# Product Discovery Strategy

Reusable dynamic product discovery is implemented in:

```text
tests/helpers/product-discovery.ts
```

The automation avoids unnecessary dependency on one fixed product.

Runtime discovery may use:

- Visible navigation
- Search terms
- Search results
- Eligible product links
- Current product availability

---

# Real Android Execution

The framework executes against Chrome running on a real Android device.

```text
Playwright
    ↓
Chrome DevTools Protocol
    ↓
localhost:9222
    ↓
ADB Port Forwarding
    ↓
Chrome on Android
```

The shared fixture is:

```text
tests/fixtures/android.fixture.ts
```

Because the test suite shares the same Android Chrome environment:

```text
workers=1
```

is used.

---

# Android Pre-Execution Requirements

Verify the Android device:

```bash
adb devices
```

Expected:

```text
device
```

Reset forwarding:

```bash
adb forward --remove-all
```

Restart Chrome:

```bash
adb shell am force-stop com.android.chrome
```

Forward the Chrome DevTools endpoint:

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

Verify CDP:

```bash
curl http://127.0.0.1:9222/json/version
```

---

# Current Test Discovery

Static Playwright discovery currently reports:

```text
Total: 1296 tests in 10 files
```

This is an **execution count**.

It does not represent 1296 unique business scenarios.

Many scenarios are executed against multiple configured brands.

---

# Validation Status

Current confirmed validation:

```text
TypeScript Validation:
PASS

Playwright Test Discovery:
PASS

Current Discovered Suite:
1296 tests in 10 files

Area-Based Architecture:
IMPLEMENTED

Page Object Model:
IMPLEMENTED

Shared Android Fixture:
IMPLEMENTED

Dynamic Product Discovery:
IMPLEMENTED

Smoke / Regression Tagging:
IMPLEMENTED

Dedicated E2E Journey:
IMPLEMENTED

Full Expanded Cross-Site Runtime Validation:
PENDING
```

The expanded suite has not yet been fully runtime-executed across all configured brands after the latest coverage expansion.

Static discovery success does not mean that every scenario has passed at runtime.

---

# Pass / Failure Interpretation

A functional failure should only be treated as product evidence when:

- Android/CDP environment is available.
- Required test data is available.
- The automation itself is functioning correctly.
- The scenario executes far enough to validate the intended product behavior.
- The failure can be reproduced.

Environment or automation failures must be distinguished from confirmed product defects.

---

# Reporting

Playwright reporting includes:

- Console output
- HTML report
- Screenshot on failure
- Video on failure
- Trace on failure
- Test artifacts

Generated locations include:

```text
playwright-report/
test-results/
```

Open the report using:

```bash
npm run report
```

---

# Related Documentation

Detailed runtime status:

```text
test-plans/test-execution-report.md
```

Smoke strategy:

```text
test-plans/smoke-test-plan.md
```

Regression strategy:

```text
test-plans/regression-test-plan.md
```

Automation and environment findings:

```text
test-plans/issues-report.md
```

---

# Final Status

The Master Test Plan represents the current functional coverage design of the CBI Playwright Real Android Mobile Automation framework.

Current framework status:

```text
Functional Areas:
DEFINED AND IMPLEMENTED

Smoke Coverage:
IMPLEMENTED

Regression Coverage:
IMPLEMENTED

Real Android CDP Integration:
IMPLEMENTED

Static Validation:
PASS

Test Discovery:
1296 tests in 10 files

Full Expanded Runtime Validation:
PENDING
```