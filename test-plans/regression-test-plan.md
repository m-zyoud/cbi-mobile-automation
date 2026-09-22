# CBI Mobile Regression Test Plan

## Purpose

This document defines the Regression test strategy and coverage for the CBI mobile automation framework.

The Regression suite validates critical and non-critical behavior across the configured CBI mobile storefronts using:

- Playwright
- TypeScript
- Real Android Chrome
- Android Debug Bridge (ADB)
- Chrome DevTools Protocol (CDP)
- Shared Page Objects
- Area-based test organization
- Reusable fixtures and helpers

Regression scenarios include:

- Positive scenarios
- Negative scenarios
- Boundary scenarios
- Edge cases
- Mobile UI validation
- Navigation behavior
- State persistence
- Cross-brand behavior

---

# Supported Brands

The Regression suite is configured for:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

Site configuration is centralized in:

```text
config/sites.ts
```

---

# Regression Strategy

Regression coverage is selected from the existing area-based suites using:

```text
@regression
```

The framework does not maintain a separate duplicated regression test folder.

Instead, scenarios are organized by functional area:

```text
tests/areas/
```

and selected for Regression execution using tags.

Run the Regression suite with:

```bash
npm run test:regression
```

Equivalent command:

```bash
playwright test --grep @regression --workers=1
```

---

# Test Architecture

```text
tests/
├── areas/
│   ├── account/
│   │   ├── login.spec.ts
│   │   └── registration.spec.ts
│   ├── cart/
│   │   └── cart.spec.ts
│   ├── checkout/
│   │   └── checkout.spec.ts
│   ├── globals/
│   │   └── header-footer.spec.ts
│   ├── pdp/
│   │   └── pdp.spec.ts
│   ├── plp/
│   │   └── plp.spec.ts
│   ├── search/
│   │   └── search.spec.ts
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

---

# Current Regression Scope

The current Regression scope includes:

- Global Header / Footer
- Login
- Registration
- PLP
- PDP
- Search
- Cart
- Checkout
- Wishlist

The dedicated End-to-End purchase journey is maintained separately under:

```text
tests/journeys/purchase-flow.e2e.spec.ts
```

---

# 1. Global Header / Footer Regression

**File:**

```text
tests/areas/globals/header-footer.spec.ts
```

Current scenario range:

```text
GLOBAL-001 → GLOBAL-030
```

## Coverage

Regression coverage includes:

- Header rendering
- Brand logo
- Search entry point
- Cart entry point
- Account entry point
- Mobile navigation
- Footer rendering
- Logo navigation
- Search navigation
- Cart navigation
- Account navigation
- Mobile menu open/close behavior
- Newsletter controls where supported
- Footer navigation
- Social links where supported
- Refresh behavior
- Back navigation
- Forward navigation
- Mobile horizontal overflow
- Header overlap
- Footer overlap
- Global responsive behavior
- Repeated navigation behavior
- Optional content handling
- Layout stability

## Validation Goal

The global site shell should remain usable across all configured brands and should not block access to key customer journeys.

---

# 2. Login Regression

**File:**

```text
tests/areas/account/login.spec.ts
```

Current scenario range:

```text
LOGIN-001 → LOGIN-030
```

## Coverage

Regression scenarios include:

- Open My Account
- Login form visibility
- Email field behavior
- Password field behavior
- Password masking
- Forgot Password
- Empty submission
- Missing email
- Missing password
- Invalid email format
- Invalid credentials
- Leading whitespace
- Trailing whitespace
- Email case behavior
- Long email input
- Long password input
- Keyboard submission
- Refresh behavior
- Back navigation
- Forward navigation
- Repeated form interaction
- Mobile layout validation
- Overflow checks
- Control overlap
- Validation message behavior
- Login state stability

## Validation Goal

The Login flow should correctly handle valid interaction paths and safely reject invalid or incomplete user input.

---

# 3. Registration Regression

**File:**

```text
tests/areas/account/registration.spec.ts
```

Current scenario range:

```text
REG-001 → REG-030
```

## Coverage

Regression scenarios include:

- Registration page loading
- Registration form visibility
- First name
- Last name
- Email field
- Password field
- Password masking
- Confirm password where supported
- Empty submission
- Missing required fields
- Invalid email
- Weak password
- Password mismatch
- Existing email handling
- Terms / consent controls where supported
- Long input values
- Leading / trailing whitespace
- Keyboard submission
- Refresh behavior
- Back navigation
- Forward navigation
- Repeated interaction
- Responsive layout
- Horizontal overflow
- Control overlap

## Validation Goal

Registration should provide clear validation, preserve usable mobile behavior, and prevent invalid account creation states.

---

# 4. Product Listing Page Regression

**File:**

```text
tests/areas/plp/plp.spec.ts
```

Current scenario range:

```text
PLP-001 → PLP-040
```

## Coverage

Regression includes:

- PLP loading
- Breadcrumbs
- Product grid
- Product cards
- Product images
- Product names
- Product prices
- PDP navigation
- Sort low-to-high
- Sort high-to-low
- Sort persistence
- Filter drawer
- Single filters
- Multiple filters
- Removing filters
- Clearing filters
- Filter-result consistency
- No-results behavior
- Pagination / Load More
- Swatches where supported
- Out-of-stock states
- Price boundaries
- Invalid price ranges
- Filter state
- Sort state
- URL behavior
- Refresh behavior
- Product counts
- Duplicate product checks
- Promotional price display
- Disabled filters
- Horizontal overflow
- Product-card overlap
- Long scrolling
- Responsive layout changes

## Validation Goal

Customers should be able to browse, filter, sort, and navigate product listings without unexpected state or mobile-layout failures.

---

# 5. Product Detail Page Regression

**File:**

```text
tests/areas/pdp/pdp.spec.ts
```

Current scenario range:

```text
PDP-001 → PDP-050
```

## Coverage

Regression includes:

- PDP loading
- Product title
- Product price
- Product image
- Image gallery
- Breadcrumbs
- Availability
- Add To Cart visibility
- Add To Cart state
- Required product options
- Color selection
- Size selection
- Multiple option selection
- Disabled options
- Out-of-stock options
- Dependent options
- Missing required option behavior
- Products without required options
- Quantity minimum
- Quantity increase/decrease
- Quantity maximum
- Invalid quantity
- Cart-state update
- Correct product added
- Option consistency
- Quantity consistency
- Price consistency
- Promotional pricing
- Dynamic price changes
- Dynamic image changes
- SKU changes where supported
- Product details
- Accordions
- Ratings / reviews where supported
- Unavailable products
- Sold-out products
- Back navigation
- Refresh behavior
- Invalid PDP URL
- Mobile image layout
- Product information overlap
- Sticky Add To Cart where supported
- Long-page scrolling
- Optional modules
- Changing options
- Availability updates
- Repeated Add To Cart behavior
- Responsive layout changes

## Validation Goal

A customer should be able to inspect, configure, and add a valid product while invalid or unavailable configurations are handled correctly.

---

# 6. Search Regression

**File:**

```text
tests/areas/search/search.spec.ts
```

Current scenario range:

```text
SEARCH-001 → SEARCH-040
```

## Coverage

Regression includes:

- Search control
- Search input
- Valid search
- Product results
- Product navigation
- Runtime search-term discovery
- Exact searches
- Partial searches
- Case handling
- Leading spaces
- Trailing spaces
- Repeated spaces
- Unknown terms
- Empty search
- Whitespace-only search
- Special characters
- Numeric search input
- Suggestions where supported
- Suggestion selection
- Suggestion updates
- Search result product information
- Search result prices
- Result count
- Sorting
- Filtering
- Pagination / Load More
- Repeated searches
- Query replacement
- URL behavior
- Refresh behavior
- Back navigation
- Forward navigation
- No-result recovery
- Long search terms
- Input boundaries
- Responsive behavior
- Horizontal overflow
- Control overlap
- Search-state persistence

## Validation Goal

Search should remain usable for normal, invalid, edge, and repeated input patterns without breaking navigation or product discovery.

---

# 7. Cart Regression

**File:**

```text
tests/areas/cart/cart.spec.ts
```

Current scenario range:

```text
CART-001 → CART-035
```

## Coverage

Regression includes:

- Cart loading
- Cart item count
- Product presence
- Product identity
- Product price
- Product quantity
- Quantity increase
- Quantity decrease
- Minimum quantity
- Maximum quantity where supported
- Invalid quantity handling
- Product options
- Remove item
- Empty-cart state
- Multiple products
- Cart subtotal
- Promotional pricing
- Promo code controls where supported
- Invalid promo handling
- Refresh persistence
- Back navigation
- Forward navigation
- Cart persistence
- Checkout button
- Repeated updates
- Duplicate-product behavior
- Mobile responsive layout
- Horizontal overflow
- Cart-control overlap
- Long product names
- Long cart states
- Price consistency
- PDP-to-Cart product consistency

## Validation Goal

The cart should retain the selected product and configuration, provide correct cart state, and support safe quantity and navigation behavior.

---

# 8. Checkout Regression

**File:**

```text
tests/areas/checkout/checkout.spec.ts
```

Current scenario range:

```text
CHECKOUT-001 → CHECKOUT-040
```

## Coverage

Regression includes:

- Checkout loading
- Guest checkout
- Shipping form
- Required fields
- First name
- Last name
- Email
- Phone
- Street address
- City
- Region / State
- Postal code
- Invalid email
- Invalid phone
- Invalid postal code
- Empty shipping form
- Address autocomplete
- Address verification
- Delivery Method
- Delivery selection
- Order summary
- Product identity
- Product quantity
- Item price
- Subtotal
- Shipping cost
- Tax
- Discounts where supported
- Total
- Checkout refresh
- Back navigation
- Forward navigation
- Re-entering checkout state
- Existing shipping-state handling
- Existing Delivery-state handling
- Payment navigation
- Payment checkpoint
- Payment UI
- Mobile overflow
- Control overlap
- Safe prevention of final order submission

## Validation Goal

Checkout should support the complete safe pre-purchase journey while preserving product and order information through Shipping, Delivery Method, and Payment.

---

# 9. Wishlist Regression

**File:**

```text
tests/areas/wishlist/wishlist.spec.ts
```

Current scenario range:

```text
WISHLIST-001 → WISHLIST-030
```

## Coverage

Regression includes:

- Wishlist control availability
- Add product to Wishlist
- Open Wishlist
- Product visibility
- Product identity
- Remove product
- Empty Wishlist
- Repeated Add action
- Duplicate behavior
- Wishlist persistence
- Refresh behavior
- Back navigation
- Forward navigation
- Product link navigation
- Count / badge where supported
- Product price
- Product imagery
- Product options where available
- Multiple-item behavior
- Repeated Add / Remove cycles
- Mobile layout
- Horizontal overflow
- Control overlap
- Long content behavior
- Optional account requirements
- Wishlist-state recovery

## Validation Goal

Wishlist behavior should remain stable across repeated actions, navigation, and mobile-layout conditions.

---

# Scenario Types

Regression coverage intentionally contains multiple test types.

## Positive

Valid customer behavior.

Examples:

```text
Valid search
Valid product option selection
Add To Cart
Valid shipping information
```

## Negative

Invalid or unsupported customer behavior.

Examples:

```text
Invalid email
Unknown search
Invalid quantity
Missing required option
```

## Boundary

Minimum and maximum supported values.

Examples:

```text
Minimum quantity
Maximum quantity
Long input
Price-range boundaries
```

## Edge

Less common but important state transitions.

Examples:

```text
Refresh
Back / Forward navigation
Repeated interaction
Existing Checkout state
Optional modules
```

## UI / Mobile

Mobile-specific layout validation.

Examples:

```text
Horizontal overflow
Overlapping controls
Responsive layout
Long content
```

---

# Cross-Site Regression Execution

Regression scenarios are parameterized across the configured CBI brands where applicable.

Therefore, a single business scenario may generate multiple Playwright executions.

The current complete Playwright suite discovers:

```text
Total: 1296 tests in 10 files
```

This is an execution count across the configured suites and brands.

It is not the count of unique business scenarios.

---

# Real Android Environment

Regression execution uses Chrome running on a real Android device.

The connection architecture is:

```text
Playwright
    ↓
Chrome DevTools Protocol
    ↓
localhost:9222
    ↓
ADB Port Forwarding
    ↓
Android Chrome
```

The shared fixture is:

```text
tests/fixtures/android.fixture.ts
```

---

# Pre-Execution Requirements

Before Regression execution:

```bash
adb devices
```

The device should appear as:

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

Forward CDP:

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

Verify the connection:

```bash
curl http://127.0.0.1:9222/json/version
```

---

# Execution

Run the complete Regression-tagged suite:

```bash
npm run test:regression
```

Equivalent:

```bash
playwright test --grep @regression --workers=1
```

The suite uses:

```text
workers=1
```

because tests share the same real Android Chrome environment.

---

# Pre-Run Static Validation

Before runtime execution:

```bash
npm run typecheck
```

Then:

```bash
npm run test:list
```

Current discovery result:

```text
Total: 1296 tests in 10 files
```

---

# Regression Pass Criteria

Regression execution is successful when:

- Android/CDP environment is available.
- Selected Regression scenarios complete successfully.
- No unexpected critical functional failures occur.
- Core product flows remain usable.
- Mobile layout remains functional.
- Invalid inputs are handled safely.
- State transitions remain consistent.
- Checkout reaches the safe Payment checkpoint where applicable.
- No final order is unintentionally submitted.

---

# Regression Failure Criteria

A Regression scenario should fail when expected product behavior is not met.

Examples include:

- Required control is missing.
- Expected validation does not occur.
- Product identity changes unexpectedly.
- Cart state becomes invalid.
- Checkout cannot continue.
- Invalid data is incorrectly accepted where rejection is required.
- Navigation breaks expected state.
- Mobile layout prevents interaction.
- A required Payment checkpoint cannot be reached.

Automation or environment failures should be identified separately from confirmed product defects.

---

# Runtime Validation Status

Current confirmed status:

```text
TypeScript Validation:
PASS

Playwright Test Discovery:
PASS

Current Discovered Suite:
1296 tests in 10 files

Real Android CDP Architecture:
IMPLEMENTED

Full Expanded Regression Runtime Execution:
PENDING
```

The expanded Regression suite has not yet been fully runtime-validated across all four brands after the latest coverage expansion.

Static test discovery should not be interpreted as full Regression PASS.

---

# Reporting

Playwright supports:

- HTML report
- Console output
- Screenshots on failure
- Video on failure
- Trace on failure
- Test result artifacts

Generated locations:

```text
playwright-report/
test-results/
```

Open the HTML report with:

```bash
npm run report
```

---

# Final Scope Summary

| Functional Area | Regression Coverage |
|---|---|
| Global Header / Footer | Yes |
| Login | Yes |
| Registration | Yes |
| PLP | Yes |
| PDP | Yes |
| Search | Yes |
| Cart | Yes |
| Checkout | Yes |
| Wishlist | Yes |
| Positive Scenarios | Yes |
| Negative Scenarios | Yes |
| Boundary Scenarios | Yes |
| Edge Cases | Yes |
| Mobile UI Validation | Yes |
| Final Order Submission | No |

The Regression suite is designed to provide broad functional coverage while keeping execution reusable across all configured CBI brands.