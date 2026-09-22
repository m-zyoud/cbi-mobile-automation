# CBI Mobile Automation - Issues and Findings

## Purpose

This document records technical issues, environment limitations, automation findings, and resolved framework problems identified while developing and validating the CBI mobile automation framework.

The purpose of this report is to distinguish between:

- Product defects
- Automation defects
- Environment failures
- Test-data limitations
- Framework improvements

A product defect should not be reported unless the behavior is independently reproduced and confirmed as a product issue.

---

# ISSUE-001 - PDP Option Scanner Selected Global Site Control

## Area

Product Detail Page

## Scenario

The automation dynamically scanned visible controls while attempting to identify required product options.

## Actual Behavior

A global site selector was detected as though it were a PDP product option.

The automation selected a non-product control and navigated away from the intended CBI certification storefront.

Example observed value:

```text
QVC
```

## Expected Behavior

Only PDP-related product option controls should be considered when selecting:

- Color
- Size
- Finish
- Style
- Fabric
- Configuration
- Other product-specific variants

Global controls should never be treated as product configuration.

## Root Cause

The initial dynamic option discovery strategy searched controls across too broad a portion of the page.

This allowed unrelated global controls to be included in option discovery.

## Resolution

Product option discovery was restricted to the Product Detail Page content region.

The automation also excludes controls associated with:

- Affiliate sites
- Store selectors
- Country selectors
- Language selectors
- Currency selectors
- Navigation
- Sorting
- Filtering
- Global site configuration

## Status

```text
RESOLVED
```

---

# ISSUE-002 - Android CDP Connection Failure

## Area

Android / Automation Environment

## Error

```text
connect ECONNREFUSED 127.0.0.1:9222
```

## Scenario

Playwright attempted to connect to Android Chrome when the ADB forwarding session was unavailable.

## Expected Behavior

Playwright should connect to Chrome on the real Android device through the Chrome DevTools Protocol endpoint.

## Actual Behavior

No service was available at:

```text
127.0.0.1:9222
```

Therefore, the tests failed before functional test execution began.

## Root Cause

One or more Android runtime prerequisites were unavailable:

- Android device not connected
- USB Debugging unavailable
- Chrome not running
- ADB forwarding removed
- CDP endpoint unavailable

## Resolution

Restore the Android Chrome debugging bridge:

```bash
adb forward --remove-all
```

Then:

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

Verify the connection:

```bash
curl http://127.0.0.1:9222/json/version
```

A working response should contain values such as:

```text
Browser
webSocketDebuggerUrl
```

## Classification

This is an environment failure, not a product defect.

## Status

```text
ENVIRONMENT-DEPENDENT / RECOVERABLE
```

---

# ISSUE-003 - Checkout Session Persisted Between Runs

## Area

Checkout / Session Management

## Scenario

Multiple automated runs used the same real Android Chrome session.

## Actual Behavior

Checkout and Cart state from previous executions remained available.

Examples included:

- Existing Cart items
- Increasing Cart counts
- Shipping information already populated
- Checkout already past Guest Checkout
- Delivery Method already available

## Expected Behavior

The automation should remain usable whether the browser starts from:

- A clean session
- An existing Cart state
- An existing Checkout state

## Root Cause

The framework uses a persistent real Android Chrome browser session through CDP.

Unlike isolated Playwright browser contexts, the Android Chrome state may continue between test executions.

## Resolution

Checkout logic was made state-aware.

The automation detects whether:

- Guest Checkout is already completed
- Shipping information already exists
- Delivery Method is already available
- Checkout has progressed beyond the expected earlier step

The flow continues from the current valid Checkout state instead of blindly replaying previous steps.

## Status

```text
RESOLVED
```

---

# ISSUE-004 - Clearing Browser State Broke Certification Session

## Area

Environment / Session Management

## Scenario

Browser cookies and storage were cleared in an attempt to create a clean Cart state.

## Actual Behavior

The certification environment behavior was affected.

After clearing browser state, the flow no longer behaved consistently and dynamic product discovery became unreliable.

## Expected Behavior

Test cleanup should reduce unwanted state without breaking certification access or site session requirements.

## Root Cause

The certification environment depends on browser/session state that may include:

- Access cookies
- Environment-specific state
- Bypass/session information

Clearing the complete Android Chrome storage removed state required by the certification environment.

## Resolution

The framework no longer clears the complete Android Chrome session before every test.

Instead, the automation is designed to work with the detected runtime state.

## Status

```text
RESOLVED
```

---

# ISSUE-005 - Shipping Address Autocomplete Populates Multiple Fields

## Area

Checkout / Shipping

## Scenario

The Checkout form uses address autocomplete.

## Actual Behavior

Selecting an address suggestion automatically populated multiple fields such as:

- City
- State
- ZIP / Postal Code

After the autocomplete selection, some of these fields were no longer independently available or required manual entry.

## Expected Behavior

The automation should support the site's real address-autocomplete behavior.

It should not require fields to remain independently editable after autocomplete has populated them.

## Resolution

Checkout automation tracks whether a valid autocomplete address has been selected.

When autocomplete populates:

- City
- State
- ZIP / Postal Code

the framework does not unnecessarily attempt to fill those fields again.

## Status

```text
RESOLVED
```

---

# ISSUE-006 - Shipping Address Verification Modal

## Area

Checkout

## Scenario

After valid Shipping information was entered, Checkout displayed an address verification dialog.

Observed actions included:

```text
Edit
Keep Original Address
```

## Expected Behavior

The automation should safely handle the address verification step before attempting to continue to Delivery Method.

## Resolution

Checkout automation detects the Shipping Address Verification dialog.

When appropriate for the configured QA data, it continues using:

```text
Keep Original Address
```

The flow then proceeds to the next valid Checkout state.

## Status

```text
RESOLVED
```

---

# ISSUE-007 - Checkout Already Past Shipping Step

## Area

Checkout State Management

## Scenario

A previous execution had already completed Shipping.

## Actual Behavior

The original automation searched for:

```text
Continue To Delivery Method
```

even though the Delivery Method step was already visible.

## Expected Behavior

The test should detect and continue from the current Checkout state.

## Resolution

The Checkout flow now checks whether Delivery Method is already available.

If Delivery Method is already visible, the automation does not attempt to repeat the Shipping continuation step.

## Status

```text
RESOLVED
```

---

# ISSUE-008 - Duplicate CDP Connection Logic in E2E Journey

## Area

Framework Architecture

## Scenario

The original End-to-End purchase journey created its own Android CDP connection logic inside the test flow.

## Actual Behavior

Android connection handling was duplicated instead of using the reusable framework fixture.

This increased:

- Code duplication
- Maintenance cost
- Risk of inconsistent setup behavior

## Expected Behavior

Android Chrome connectivity should be centralized and reusable.

## Resolution

The End-to-End journey was refactored to use:

```text
tests/fixtures/android.fixture.ts
```

The shared fixture provides:

- Browser connection
- Android browser context
- Android page access

The E2E journey no longer needs to create its own independent CDP connection.

## Status

```text
RESOLVED
```

---

# ISSUE-009 - Product Discovery Logic Was Too Large Inside E2E Journey

## Area

Framework Architecture / Maintainability

## Scenario

Dynamic Search and product discovery logic originally existed directly inside the End-to-End purchase test file.

## Actual Behavior

The E2E test became large and difficult to maintain.

Product discovery behavior was mixed with:

- Checkout flow
- Cart validation
- PDP interaction
- Journey orchestration

## Expected Behavior

Product discovery should be reusable and separated from journey orchestration.

## Resolution

Dynamic product discovery was extracted into:

```text
tests/helpers/product-discovery.ts
```

The End-to-End journey now focuses primarily on orchestration while discovery logic is maintained independently.

## Status

```text
RESOLVED
```

---

# ISSUE-010 - Cart Validation Did Not Initially Guarantee Same PDP Product

## Area

Cart / End-to-End Journey

## Scenario

The initial Cart validation confirmed that the Cart contained at least one item.

## Actual Behavior

A Cart count greater than zero did not guarantee that the item was the same product selected on the Product Detail Page.

This was especially important because persistent Android browser sessions could contain existing Cart state.

## Expected Behavior

The End-to-End journey should verify that the product selected on PDP is actually present in the Cart.

## Resolution

The product name captured from the PDP is passed into Cart validation.

The framework verifies the selected product using reusable Cart Page logic.

Example responsibility:

```text
verifyProductInCart(productName)
```

## Status

```text
RESOLVED
```

---

# ISSUE-011 - End-to-End Flow Originally Stopped Before Payment Validation

## Area

Checkout / End-to-End Journey

## Scenario

The original main journey reached Delivery Method but did not complete Payment checkpoint validation.

## Expected Behavior

The safe End-to-End journey should validate the critical customer flow through Payment without submitting an order.

## Resolution

The journey was extended to:

```text
Shipping
    ↓
Delivery Method
    ↓
Payment
    ↓
STOP
```

The current flow validates:

- Delivery Method availability
- Delivery Method selection
- Continue To Payment
- Payment step visibility
- Payment-related controls
- Safe prevention of final submission

## Status

```text
RESOLVED
```

---

# ISSUE-012 - Final Order Submission Was Unsafe for Standard Automation

## Area

Checkout / Test Safety

## Scenario

Earlier test-plan documentation included steps for:

```text
Place Order
Complete Order
Submit Order
```

## Risk

Automatic order submission could create:

- Unintended certification orders
- Invalid payment interactions
- Incorrect test data
- Potential confusion between certification and production behavior

## Expected Behavior

Standard automated coverage should stop before final purchase submission unless a dedicated approved order-placement flow exists.

## Resolution

The current End-to-End journey intentionally stops at the Payment checkpoint.

The automation should not intentionally activate actions such as:

```text
Place Order
Submit Order
Complete Purchase
Complete Order
Buy Now
Purchase
```

The framework also validates that it has not reached an Order Confirmation state.

## Status

```text
RESOLVED BY DESIGN
```

---

# ISSUE-013 - Smoke Execution Failed When Android Device Was Not Connected

## Area

Execution Environment

## Scenario

The expanded Smoke suite was started while the Android device / CDP environment was not active.

## Actual Behavior

Tests failed almost immediately during environment setup.

These failures occurred before meaningful functional validation could take place.

## Expected Behavior

Runtime results should only be considered valid functional evidence when the Android/CDP prerequisites are available.

## Classification

The failed run was an environment setup failure.

It should not be interpreted as:

- Product failure
- Regression failure
- Confirmation that Smoke scenarios themselves are broken

## Resolution

Before runtime execution, verify:

```bash
adb devices
```

Then:

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

And:

```bash
curl http://127.0.0.1:9222/json/version
```

## Status

```text
ENVIRONMENT FAILURE IDENTIFIED
```

---

# ISSUE-014 - Accidental Nested Git Repository

## Area

Repository Structure / Git

## Scenario

A second `cbi-mobile-automation` Git repository existed inside the main repository.

## Actual Behavior

Git tracked the inner repository as a Gitlink instead of a normal project directory.

The inner repository pointed to an older commit while the outer repository contained the current framework.

## Expected Behavior

The project should contain only one active Git repository root.

## Resolution

The nested repository was:

1. Compared with the current outer repository.
2. Moved outside the active project as a backup.
3. Removed from the outer Git index.
4. Removed from the GitHub repository structure.

The active outer repository remains the source of truth.

## Status

```text
RESOLVED
```

---

# Current Framework Improvements Already Implemented

The following items were previously considered improvements and are now implemented:

- Shared Android CDP fixture
- Area-based test architecture
- Shared Page Object Model
- Dynamic product discovery helper
- Dedicated End-to-End journey
- Smoke tagging
- Regression tagging
- Safe Payment checkpoint
- PDP-to-Cart product identity validation
- Checkout state-aware behavior
- Android execution with one Playwright worker

These should no longer be listed as future work.

---

# Current Runtime Validation Limitation

The framework currently discovers:

```text
1296 tests in 10 files
```

and static validation has been completed.

However, the complete expanded suite has not yet been executed end-to-end across all four configured brands after the latest coverage expansion.

Therefore:

```text
TypeScript Validation:
PASS

Playwright Test Discovery:
PASS

Full Expanded Runtime Validation:
PENDING
```

This distinction is important when evaluating framework health.

Static discovery does not prove that every runtime scenario passes.

---

# Product Defect Reporting Rule

A product defect should only be reported when:

1. The environment is available.
2. The test setup is valid.
3. The automation behavior is verified.
4. The issue can be reproduced.
5. The observed behavior differs from the expected product behavior.

Automation problems should be fixed or classified separately before opening a product defect.

---

# Remaining Improvement Opportunities

Future improvements may include:

- Automatic Android/CDP preflight health check
- More controlled Cart/session reset strategy
- Automatic execution summary generation
- Structured runtime result metadata
- Device-farm execution
- Cross-brand runtime result aggregation
- Improved separation between environment, automation, and product failures
- Runtime validation of the full expanded Smoke suite
- Runtime validation of the full expanded Regression suite

---

# Current Status Summary

| Finding | Status |
|---|---|
| PDP scanner detected global controls | Resolved |
| Android CDP connection recovery | Documented |
| Persistent Checkout state | Resolved |
| Full browser cleanup broke certification session | Resolved |
| Address autocomplete behavior | Resolved |
| Address verification modal | Resolved |
| Existing Delivery state | Resolved |
| Duplicate CDP setup in E2E | Resolved |
| Product discovery mixed into E2E | Resolved |
| Cart did not guarantee same PDP product | Resolved |
| Payment checkpoint missing from E2E | Resolved |
| Final order submission risk | Resolved by design |
| Smoke run without Android/CDP | Environment issue identified |
| Nested Git repository | Resolved |
| Full expanded runtime validation | Pending |

---

# Final Note

The documented findings above should be used to improve automation reliability and test diagnostics.

Framework or environment issues must not automatically be classified as CBI product defects without independent confirmation.