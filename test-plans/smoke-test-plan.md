# CBI Mobile Smoke Test Plan

## Purpose

This document defines the Smoke test strategy and critical-path coverage for the CBI mobile automation framework.

The Smoke suite validates the most important customer journeys across the configured CBI mobile storefronts using:

- Playwright
- TypeScript
- Real Android Chrome
- Android Debug Bridge (ADB)
- Chrome DevTools Protocol (CDP)
- Shared Page Objects
- Area-based test organization
- Reusable fixtures and helpers
- Dynamic product discovery

---

# Supported Brands

The Smoke suite is configured for:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

Site configuration is centralized in:

```text
config/sites.ts
```

---

# Smoke Strategy

Smoke scenarios are selected from the existing area-based suites using:

```text
@smoke
```

The framework does not maintain a separate duplicated Smoke folder.

Instead, critical scenarios are tagged inside the existing functional test files.

This allows the same scenario to participate in both Smoke and Regression execution without duplicating implementation.

Run Smoke with:

```bash
npm run test:smoke
```

Equivalent command:

```bash
playwright test --grep @smoke --workers=1
```

---

# Current Test Architecture

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

# Smoke Scope

The Smoke suite focuses on critical customer-facing functionality:

- Site launch
- Global mobile elements
- Search
- Product discovery
- PDP
- Required product options
- Add To Cart
- Cart validation
- Checkout
- Guest checkout
- Shipping information
- Delivery Method
- Payment checkpoint
- Selected Login checks
- Selected Registration checks
- Selected Wishlist checks
- Core mobile layout validation

---

# 1. Site Launch

## TC-SM-001 - Open Configured Site

### Steps

1. Connect Playwright to Chrome running on a real Android device.
2. Open the selected configured CBI certification site.
3. Wait for DOM content to load.
4. Verify the page body is visible.

### Validation

- The configured site loads successfully.
- The page body is visible.
- The page is not blank.
- No fatal application error is displayed.
- The mobile storefront renders in Android Chrome.

---

# 2. Global Elements

## TC-SM-002 - Verify Critical Global Mobile Elements

**Area:**

```text
tests/areas/globals/header-footer.spec.ts
```

### Steps

1. Open the site.
2. Verify the mobile header.
3. Verify the brand logo.
4. Verify Search access.
5. Verify Cart access.
6. Verify Account access.
7. Verify mobile navigation.
8. Verify critical layout stability.

### Validation

- Header is visible.
- Logo is visible.
- Search is accessible.
- Cart is accessible.
- Account is accessible.
- Mobile navigation is usable.
- Critical controls do not substantially overlap.
- No unexpected horizontal overflow blocks interaction.

---

# 3. Search

## TC-SM-003 - Open and Use Search

**Area:**

```text
tests/areas/search/search.spec.ts
```

### Steps

1. Open the Search control.
2. Verify a usable Search input appears.
3. Obtain a usable runtime search term.
4. Submit the search.
5. Wait for the results state.

### Validation

- Search input is visible and actionable.
- A non-empty search term is available.
- Search submission succeeds.
- Search results or a valid result state loads.
- The flow remains usable on the Android viewport.

---

# 4. Dynamic Product Discovery

## TC-SM-004 - Discover a Valid Product

Dynamic product discovery logic is implemented in:

```text
tests/helpers/product-discovery.ts
```

### Steps

1. Inspect the current Search result state.
2. Identify eligible product links.
3. Ignore invalid, placeholder, duplicate, or unavailable candidates.
4. Select a usable product.
5. Capture relevant product information for downstream validation.

### Validation

- At least one eligible product can be discovered.
- Product discovery does not depend on one fixed hardcoded product.
- The selected product can be opened.
- Product identity is retained for later Cart validation.

---

# 5. Product Detail Page

## TC-SM-005 - Verify PDP

**Area:**

```text
tests/areas/pdp/pdp.spec.ts
```

### Steps

1. Open the dynamically discovered product.
2. Wait for PDP content.
3. Capture the product name.
4. Verify product information.
5. Verify product price or valid price state.
6. Verify Add To Cart availability.

### Validation

- PDP loads successfully.
- Product name is non-empty.
- Product price or valid price state is visible.
- Core PDP content is available.
- Add To Cart is visible for a purchasable product.

---

# 6. Product Options

## TC-SM-006 - Select Required Product Options Dynamically

### Steps

1. Inspect required product option groups.
2. Identify valid enabled values.
3. Select valid values when required.
4. Re-evaluate dependent option groups when needed.
5. Continue until the product has a valid purchasable configuration.

### Validation

- Required options are detected dynamically.
- Disabled or sold-out values are not intentionally selected.
- No fixed color, size, or variant is required.
- Products without required options can continue safely.

---

# 7. Add To Cart

## TC-SM-007 - Add Product To Cart

### Steps

1. Retain the captured PDP product name.
2. Ensure required options are completed.
3. Activate Add To Cart.
4. Wait for Cart state update or confirmation.

### Validation

- Add To Cart action succeeds.
- Cart state updates.
- No unintended duplicate product is added through repeated clicks.
- Product remains identifiable for downstream verification.

---

# 8. Cart Validation

## TC-SM-008 - Verify Cart

**Area:**

```text
tests/areas/cart/cart.spec.ts
```

### Steps

1. Open the Cart.
2. Verify Cart loads.
3. Verify Cart contains at least one item.
4. Verify the captured PDP product appears in the Cart.
5. Verify core Cart values.

### Validation

- Cart loads successfully.
- Cart item count is greater than zero.
- The same PDP product appears in Cart.
- Product identity remains consistent.
- Product price is available.
- Quantity is valid.
- Subtotal is visible.
- Checkout control is available.

---

# 9. Checkout

## TC-SM-009 - Proceed To Checkout

**Area:**

```text
tests/areas/checkout/checkout.spec.ts
```

### Steps

1. Activate Checkout from the Cart.
2. Wait for checkout navigation.
3. Verify Checkout loads.
4. Detect the current Checkout state.

### Validation

- Checkout loads successfully.
- Checkout is not in a fatal error state.
- The customer can continue from the current Checkout step.

---

# 10. Guest Checkout

## TC-SM-010 - Continue As Guest When Required

### Steps

1. Detect whether Guest Checkout is presented.
2. If present, activate Continue As Guest.
3. If Checkout is already beyond that state, continue from the current state.

### Validation

- Guest Checkout can continue when required.
- Existing Checkout state is handled correctly.
- The test does not fail simply because a previous Checkout step is already completed.

---

# 11. Shipping

## TC-SM-011 - Complete Shipping Information

Reusable QA test data is stored in:

```text
config/test-data.ts
```

### Steps

1. Fill First Name.
2. Fill Last Name.
3. Fill approved QA Shipping Address.
4. Handle address autocomplete when displayed.
5. Fill Email.
6. Fill Phone.
7. Complete required Shipping information.
8. Continue toward Delivery Method.

### Validation

- Required Shipping fields accept valid QA data.
- Address autocomplete can be handled.
- Automatically populated City, State, or ZIP values are respected.
- Address verification can be handled when displayed.
- Checkout can advance from Shipping.

---

# 12. Delivery Method

## TC-SM-012 - Verify Delivery Method

### Steps

1. Reach Delivery Method.
2. Verify Delivery Method section is visible.
3. Inspect available options.
4. Detect whether an option is already selected.
5. Select a valid option when required.

### Validation

- Delivery Method is reachable.
- A valid delivery option is available where required.
- Disabled options are not intentionally selected.
- Checkout remains stable after selection.

---

# 13. Payment Checkpoint

## TC-SM-013 - Continue To Payment

### Steps

1. Continue from Delivery Method.
2. Wait for Payment state.
3. Verify Payment section or Payment controls.

### Validation

- Payment state is reachable.
- Payment-related UI is available.
- No blank or fatal Checkout state is displayed.

---

# 14. Safe Checkout Stop

## TC-SM-014 - Verify No Final Order Submission

The Smoke journey intentionally stops at Payment.

The automation must not intentionally activate controls such as:

```text
Place Order
Submit Order
Complete Purchase
Complete Order
Buy Now
Purchase
```

### Steps

1. Verify Payment state is loaded.
2. Verify the current URL is not an Order Confirmation URL.
3. Verify the flow has not reached a completed-order state.
4. Stop the End-to-End journey.

### Validation

- No final order is submitted.
- No Order Confirmation page is reached.
- No Thank You page is reached.
- No real payment transaction is attempted.
- The journey ends safely at the Payment checkpoint.

---

# 15. Login Smoke Coverage

**Area:**

```text
tests/areas/account/login.spec.ts
```

Selected critical Login scenarios may include:

- My Account access
- Login form visibility
- Email field visibility
- Password field visibility
- Password masking
- Required-field behavior
- Forgot Password accessibility
- Basic mobile form usability

The complete Login suite remains part of Regression coverage.

---

# 16. Registration Smoke Coverage

**Area:**

```text
tests/areas/account/registration.spec.ts
```

Selected critical Registration scenarios may include:

- Registration page loading
- Registration form visibility
- Required fields
- Email input
- Password input
- Password masking
- Empty form validation
- Basic mobile form usability

The complete Registration suite remains part of Regression coverage.

---

# 17. Wishlist Smoke Coverage

**Area:**

```text
tests/areas/wishlist/wishlist.spec.ts
```

Selected critical Wishlist scenarios may include:

- Wishlist action availability
- Add product to Wishlist
- Open Wishlist
- Verify selected product
- Remove product
- Basic Wishlist state validation

The complete Wishlist suite remains part of Regression coverage.

---

# End-to-End Purchase Journey

The dedicated End-to-End flow is implemented in:

```text
tests/journeys/purchase-flow.e2e.spec.ts
```

Current journey:

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
Select Required Product Options
    ↓
Add To Cart
    ↓
Open Cart
    ↓
Verify Same Product In Cart
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

Final order submission is intentionally excluded.

---

# Real Android Environment

Smoke execution runs on Chrome on a real Android device.

Architecture:

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

Shared fixture:

```text
tests/fixtures/android.fixture.ts
```

---

# Android Pre-Execution Setup

Verify device:

```bash
adb devices
```

Expected state:

```text
device
```

Reset ADB forwarding:

```bash
adb forward --remove-all
```

Restart Chrome:

```bash
adb shell am force-stop com.android.chrome
```

Open a configured CBI certification URL.

Forward Chrome DevTools:

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

Verify CDP:

```bash
curl http://127.0.0.1:9222/json/version
```

A valid response should include Chrome debugging information such as:

```text
Browser
webSocketDebuggerUrl
```

---

# Smoke Execution

Run Smoke-tagged tests:

```bash
npm run test:smoke
```

Equivalent:

```bash
playwright test --grep @smoke --workers=1
```

The suite uses:

```text
workers=1
```

because the tests share the same real Android Chrome environment.

---

# Run End-to-End Journey

```bash
npm run test:e2e
```

This executes:

```text
tests/journeys/purchase-flow.e2e.spec.ts
```

---

# Static Validation

Before runtime execution:

```bash
npm run typecheck
```

Then:

```bash
npm run test:list
```

Current discovered suite:

```text
Total: 1296 tests in 10 files
```

This number represents Playwright executions across the configured brands.

It does not represent 1296 unique business scenarios.

---

# Smoke Pass Criteria

The Smoke suite should be considered successful when:

- Android device is connected.
- CDP forwarding is active.
- Configured site loads.
- Critical global controls are available.
- Search works.
- A usable product can be discovered.
- PDP loads.
- Required options can be completed.
- Product can be added to Cart.
- Same product appears in Cart.
- Checkout can load.
- Shipping can be completed using approved QA data.
- Delivery Method can be reached.
- Payment checkpoint can be reached.
- No unintended final order submission occurs.

---

# Smoke Failure Criteria

A Smoke scenario should fail when critical expected behavior cannot continue.

Examples include:

- Android Chrome cannot be reached through CDP.
- Site cannot load.
- Critical navigation is unavailable.
- Search cannot be used.
- No usable product can be discovered.
- PDP cannot load.
- Required options cannot be completed.
- Add To Cart fails.
- Cart does not contain the selected product.
- Checkout cannot load.
- Shipping cannot continue.
- Delivery Method cannot be reached.
- Payment checkpoint cannot be reached.
- Fatal application error is displayed.

Environment or framework failures should be distinguished from confirmed product defects.

---

# Current Validation Status

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

Smoke Tagging:
IMPLEMENTED

Dedicated End-to-End Journey:
IMPLEMENTED

Full Expanded Smoke Runtime Validation:
PENDING
```

The expanded Smoke suite has not yet been fully runtime-validated across all configured brands after the latest coverage expansion.

Static test discovery should not be interpreted as full Smoke PASS.

---

# Reporting

Playwright reporting includes:

- Console output
- HTML report
- Screenshots on failure
- Video on failure
- Trace on failure
- Test-result artifacts

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

| Area | Smoke Coverage |
|---|---|
| Site Launch | Yes |
| Global Header / Navigation | Yes |
| Search | Yes |
| Dynamic Product Discovery | Yes |
| PDP | Yes |
| Product Options | Yes |
| Add To Cart | Yes |
| Cart | Yes |
| Checkout | Yes |
| Guest Checkout | Yes |
| Shipping | Yes |
| Delivery Method | Yes |
| Payment Checkpoint | Yes |
| Login | Selected Critical Scenarios |
| Registration | Selected Critical Scenarios |
| Wishlist | Selected Critical Scenarios |
| Final Order Submission | No |

The Smoke suite is designed to provide fast validation of critical customer journeys while safely stopping before final purchase submission.