# CBI Mobile Automation - Test Execution Report

## Project

CBI Playwright Real Android Mobile Automation

## Prepared By

Mohammad Zyoud

## Automation Stack

- Playwright
- TypeScript
- Node.js
- Page Object Model
- Android Debug Bridge (ADB)
- Chrome DevTools Protocol (CDP)

---

## Test Scope

The automation framework covers the following CBI brands:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

The suite is divided into Smoke and Regression coverage.

---

## Current Test Inventory

Total automated tests:

- 28 tests
- 7 test files
- 4 configured brands

### Smoke Tests

Main cross-site smoke suite:

`tests/smoke/cbi-mobile-smoke.spec.ts`

Coverage includes:

- Site launch
- Global page elements
- Dynamic search
- Product discovery
- PDP validation
- Dynamic product options
- Add to Cart
- Cart validation
- Checkout
- Guest checkout
- Shipping information
- Delivery Method

### Payment Tests

File:

`tests/smoke/payment.spec.ts`

Coverage includes:

- Delivery Method checkpoint
- Continue To Payment
- Payment section detection
- Payment-related UI validation

### Regression Tests

Files:

- `tests/regression/header-footer.spec.ts`
- `tests/regression/login.spec.ts`
- `tests/regression/plp.spec.ts`
- `tests/regression/registration.spec.ts`
- `tests/regression/wishlist.spec.ts`

---

## Validation Performed

### Static Validation

The complete project is validated using:

```bash
npm run typecheck


Expected result:

No TypeScript compilation errors

The complete Playwright suite is discovered using:

npm run test:list

Expected result:

28 tests in 7 files
Real Android Execution

The framework connects to Chrome running on a real Android device through:

Playwright
   ↓
Chrome DevTools Protocol
   ↓
ADB Port Forwarding
   ↓
Android Chrome

CDP endpoint:

http://127.0.0.1:9222

Real Android execution was validated during development for the Frontgate smoke and checkout flow.

The same shared implementation is parameterized for the remaining configured CBI brands.

Frontgate Execution Evidence

The Frontgate flow successfully reached the following checkpoints during development:

Dynamic Search
PDP
Product Options
Add to Cart
Shopping Cart
Checkout
Shipping
Delivery Method
Payment

Observed successful execution included:

Shipping → Delivery Method completed successfully
Frontgate checkout successfully reached Delivery Method
1 passed

Payment validation also successfully reached:

Delivery Method checkpoint confirmed
Continue To Payment found
Payment section detected
1 passed
Assertions and Validation Strategy

The framework validates actual runtime behavior against expected conditions.

Examples include:

expect(contexts.length).toBeGreaterThan(0);

Validates that a real Chrome context is available.

await expect(page.locator('body')).toBeVisible();

Validates that the page has loaded.

expect(productName).not.toBe('');

Validates that a valid product was discovered dynamically.

expect(cartCount).toBeGreaterThan(0);

Validates that the Add to Cart operation produced a valid cart state.

The framework intentionally avoids hardcoded product names and variant values.

Execution Strategy

Tests using the shared real Android browser are executed with one worker:

npm run test:smoke

or:

npx playwright test tests/smoke/cbi-mobile-smoke.spec.ts --workers=1

This prevents multiple tests from modifying the same Android Chrome session simultaneously.

Reporting and Evidence

Playwright is configured to support:

Console logs
HTML report
Screenshots on failure
Video on failure
Trace on failure
Test result artifacts

Generated output locations:

playwright-report/
test-results/

These directories are excluded from Git because they are generated during execution.

Coverage Summary
Area	Automated
Header / Footer	Yes
Search	Yes
Product Discovery	Yes
PDP	Yes
Product Options	Yes
Add to Cart	Yes
Cart	Yes
Checkout	Yes
Shipping	Yes
Delivery Method	Yes
Payment UI	Yes
Login	Yes
Registration	Yes
Wishlist	Yes
PLP	Yes
Production payment	No
Production order submission	No
Intentionally Excluded Areas

Production payment data and live order placement are intentionally excluded.

The automation must not submit a real order unless an approved certification payment method and explicit QA authorization are available.

This protects against:

Accidental production orders
Real payment transactions
Use of personal payment information
Final Status

Framework implementation:

COMPLETE

TypeScript validation:

PASS

Playwright test discovery:

PASS

Real Android framework integration:

IMPLEMENTED

Frontgate real Android smoke / checkout validation during development:

PASS

Cross-site automation implementation:

READY