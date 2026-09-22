# CBI Mobile Automation - Test Execution Report

## Project

CBI Playwright Real Android Mobile Automation

## Prepared By

Mohammad Zyoud

---

# Automation Stack

- Playwright
- TypeScript
- Node.js
- Page Object Model
- Android Debug Bridge (ADB)
- Chrome DevTools Protocol (CDP)
- Real Android Chrome
- VS Code
- Git / GitHub

---

# Supported Brands

The automation framework is configured for the following CBI brands:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

Site configuration is centralized in:

```text
config/sites.ts
Current Automation Architecture

The framework is organized by functional areas instead of duplicated Smoke and Regression folders.

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
Current Test Inventory

Static Playwright discovery currently reports:

Total: 1296 tests in 10 files

This number represents discovered Playwright executions across the configured brands.

It does not represent 1296 unique business scenarios because many functional scenarios are parameterized and executed against multiple CBI sites.

Functional Coverage

The automation currently includes coverage for:

Global Header / Footer
Login
Registration
PLP
PDP
Search
Cart
Checkout
Wishlist
End-to-End Purchase Journey
Area Scenario Inventory

Current planned and implemented area coverage includes:

Area	Scenario Range
PLP	PLP-001 → PLP-040
PDP	PDP-001 → PDP-050
Search	SEARCH-001 → SEARCH-040
Cart	CART-001 → CART-035
Checkout	CHECKOUT-001 → CHECKOUT-040
Login	LOGIN-001 → LOGIN-030
Registration	REG-001 → REG-030
Wishlist	WISHLIST-001 → WISHLIST-030
Global Header / Footer	GLOBAL-001 → GLOBAL-030

The exact number of runtime executions is greater than the number of unique business scenarios because the suites are executed across multiple configured brands.

Smoke Coverage

Smoke coverage is selected from the existing area-based test suites using:

@smoke

The Smoke suite does not duplicate business scenarios into a separate smoke folder.

Run Smoke tests with:

npm run test:smoke

Equivalent command:

playwright test --grep @smoke --workers=1
Regression Coverage

Regression coverage is selected using:

@regression

Run Regression tests with:

npm run test:regression

Equivalent command:

playwright test --grep @regression --workers=1

Regression coverage includes:

Positive scenarios
Negative scenarios
Boundary scenarios
Edge cases
Mobile UI behavior
Navigation
State persistence
Cross-brand behavior
Checkout state handling
Product consistency validation
End-to-End Purchase Journey

The dedicated purchase journey is implemented in:

tests/journeys/purchase-flow.e2e.spec.ts

The current journey covers:

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
Add Product To Cart
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

The automation intentionally stops at the Payment checkpoint.

It does not intentionally trigger:

Place Order
Submit Order
Complete Purchase
Complete Order
Buy Now

This prevents accidental order submission.

Dynamic Product Discovery

Dynamic product discovery is handled by:

tests/helpers/product-discovery.ts

The framework avoids unnecessary hardcoded product names.

Product discovery may use current runtime site content such as:

Visible navigation
Search results
Eligible product links
Runtime product information

This improves cross-brand reusability.

Real Android Execution Architecture

The framework runs against Chrome on a real Android device.

Playwright
    ↓
Chrome DevTools Protocol
    ↓
localhost:9222
    ↓
ADB Port Forwarding
    ↓
Chrome on Android

The shared fixture is located at:

tests/fixtures/android.fixture.ts

The fixture connects using:

chromium.connectOverCDP(
  'http://127.0.0.1:9222'
);
Android Environment Setup

Verify the connected device:

adb devices

Expected device state:

device

Reset existing forwarding:

adb forward --remove-all

Restart Chrome:

adb shell am force-stop com.android.chrome

Open Chrome on the configured certification environment.

Forward Chrome DevTools:

adb forward tcp:9222 localabstract:chrome_devtools_remote

Verify the endpoint:

curl http://127.0.0.1:9222/json/version

A working response should expose Chrome debugging information such as:

Browser
webSocketDebuggerUrl
Validation Performed
TypeScript Validation

The project was validated using:

npm run typecheck

Expected result:

No TypeScript compilation errors

Current status:

PASS
Playwright Test Discovery

The complete suite was discovered using:

npm run test:list

Current result:

Total: 1296 tests in 10 files

Current status:

PASS
Runtime Validation Status

The expanded 1296-test suite has not yet been fully executed across all four CBI brands after the latest architecture and coverage expansion.

Therefore:

Full Cross-Site Runtime Validation:
NOT YET COMPLETED

The current confirmed status is:

TypeScript Validation:
PASS

Playwright Test Discovery:
PASS

Framework Structure:
IMPLEMENTED

Real Android CDP Integration:
IMPLEMENTED

Expanded Area Coverage:
IMPLEMENTED

Full Expanded Runtime Execution:
PENDING

Static discovery success does not mean that every runtime scenario has passed.

Previous Runtime Validation During Development

Real Android execution was validated during framework development for core portions of the purchase flow.

Observed runtime checkpoints included:

Dynamic Search
PDP
Product Options
Add To Cart
Shopping Cart
Checkout
Shipping
Delivery Method
Payment checkpoint

These earlier successful checkpoints confirm that the Android/CDP architecture and core flow can operate in the target environment.

They should not be interpreted as proof that the complete current expanded test suite has passed.

Important Environment Finding

A Smoke execution attempt performed without an active Android CDP connection failed immediately at environment setup.

This was an environment condition rather than product-test evidence.

Runtime tests require:

Android device connected
USB Debugging enabled
Chrome running
ADB forwarding active
CDP endpoint reachable at:
http://127.0.0.1:9222
Assertions and Validation Strategy

The framework validates real runtime behavior through Playwright assertions.

Examples include:

await expect(page.locator('body')).toBeVisible();

Validates that the page body is visible.

expect(productName).not.toBe('');

Validates that a product identity was successfully discovered.

expect(cartCount).toBeGreaterThan(0);

Validates that the Cart contains at least one item.

The Cart flow also validates that the product captured from the PDP appears in the Cart.

Checkout Safety Strategy

Checkout automation intentionally avoids final purchase submission.

The framework validates:

Checkout availability
Guest checkout
Shipping
Address autocomplete
Address verification
Delivery Method
Delivery selection
Payment step
Payment-related UI
Prevention of final order submission

The test should stop before creating an order.

Execution Strategy

Tests that share the real Android Chrome session run with:

workers=1

This prevents multiple parallel Playwright workers from attempting to control the same Android Chrome session.

Run all tests:

npm test

Run Smoke:

npm run test:smoke

Run Regression:

npm run test:regression

Run the dedicated E2E Journey:

npm run test:e2e
Reporting

Playwright is configured to support:

Console output
HTML report
Screenshots on failure
Video on failure
Trace on failure
Test result artifacts

Generated folders include:

playwright-report/
test-results/

These directories are generated at runtime and should not be committed.

Open the HTML report with:

npm run report
Current Coverage Summary
Area	Automated Coverage
Header / Footer	Yes
Search	Yes
Product Discovery	Yes
PLP	Yes
PDP	Yes
Product Options	Yes
Add To Cart	Yes
Cart	Yes
Checkout	Yes
Shipping	Yes
Delivery Method	Yes
Payment Checkpoint	Yes
Login	Yes
Registration	Yes
Wishlist	Yes
Mobile UI / Responsive Checks	Yes
Negative Scenarios	Yes
Boundary Scenarios	Yes
Edge Cases	Yes
Production Payment	No
Final Order Submission	No
Intentionally Excluded Actions

The framework intentionally excludes:

Real payment transactions
Production payment data
Final purchase submission
Production order creation

No order should be created unless a separate explicitly approved QA flow is introduced.

Current Project Status
Framework Architecture:
COMPLETE

Area-Based Test Organization:
COMPLETE

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

TypeScript Validation:
PASS

Playwright Test Discovery:
PASS

Current Discovered Suite:
1296 tests in 10 files

Full Expanded Cross-Site Runtime Validation:
PENDING
Final Note

The current automation framework is structurally ready for real-device execution across the configured CBI brands.

The next validation step is to execute the expanded Smoke and Regression suites with an active Android/CDP environment and record the resulting runtime evidence.