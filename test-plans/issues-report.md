# CBI Mobile Automation - Issues and Findings

## Purpose

This document contains technical issues and automation findings identified while developing and validating the CBI mobile automation framework.

These findings include framework-level and environment-level issues discovered during test development.

---

## ISSUE-001 - PDP Option Scanner Selected Global Site Control

### Area

Product Detail Page

### Scenario

The automation dynamically scanned visible dropdowns while looking for required product options.

### Actual Behavior

A global affiliate-site selector was detected as if it were a product option.

The automation selected:

```text
QVC

This redirected the browser away from the CBI certification site.

Expected Behavior

Only product-related variant controls should be considered when selecting PDP options.

Root Cause

The initial option discovery strategy scanned controls across the complete page.

Resolution

Option discovery was restricted to the product content area.

The logic also excludes controls associated with:

Affiliate sites
Store selectors
Country selectors
Language selectors
Currency selectors
Navigation
Sorting
Filtering
Status

Resolved

ISSUE-002 - Android CDP Connection Failure
Area

Android / Automation Environment

Error
connect ECONNREFUSED 127.0.0.1:9222
Scenario

Playwright attempted to connect to Android Chrome after the ADB forwarding session was no longer active.

Expected Behavior

Playwright should connect to the Chrome DevTools endpoint.

Actual Behavior

No service was available on port 9222.

Resolution

The Android CDP bridge can be restored using:

adb forward --remove-all
adb forward tcp:9222 localabstract:chrome_devtools_remote

The connection can then be validated using:

curl http://127.0.0.1:9222/json/version
Status

Environment-dependent / Recoverable

ISSUE-003 - Checkout Session Persisted Between Runs
Area

Checkout

Scenario

Multiple smoke runs used the same Android Chrome session.

Actual Behavior

Cart and checkout state remained available from previous runs.

Examples included increasing cart counts across executions.

Expected Behavior

The automation should correctly handle either:

A fresh checkout session
An existing checkout state
Resolution

The checkout flow was made state-aware.

The test detects whether:

Guest checkout is already completed
Shipping data already exists
Delivery Method is already available

This prevents unnecessary re-entry of already completed steps.

Status

Resolved

ISSUE-004 - Clearing Browser State Broke Certification Session
Area

Test Environment / Session Management

Scenario

Cookies and browser storage were cleared in an attempt to create a clean cart state.

Actual Behavior

The certification environment/session behavior was affected and the dynamic flow stopped discovering usable search data.

Expected Behavior

Test cleanup should not invalidate required certification access state.

Resolution

The framework no longer clears the complete Android Chrome session before every test.

The automation instead works with detected runtime state.

Status

Resolved

ISSUE-005 - Shipping Address Autocomplete Handles Multiple Fields
Area

Checkout / Shipping

Scenario

The checkout form uses address autocomplete.

Actual Behavior

Selecting the address suggestion automatically populated:

ZIP code
City
State

Some fields were no longer independently available after address selection.

Expected Behavior

The automation should support the site's autocomplete behavior rather than requiring every address field to remain separately visible.

Resolution

Checkout logic tracks whether an autocomplete address was selected.

When autocomplete handles City, State, and ZIP, the automation does not attempt to fill those fields again.

Status

Resolved

ISSUE-006 - Shipping Address Verification Modal
Area

Checkout

Scenario

After shipping information was entered, checkout displayed:

Shipping Address Verification

with options such as:

Edit
Keep Original Address
Expected Behavior

The automation should safely handle the verification step before continuing.

Resolution

Checkout automation detects the verification dialog and confirms the QA shipping address using:

Keep Original Address
Status

Resolved

ISSUE-007 - Checkout Was Already Past Shipping Step
Area

Checkout State Management

Scenario

A previous run had already completed shipping.

Actual Behavior

The original automation searched for:

Continue To Delivery Method

even though Delivery Method was already available.

Expected Behavior

The test should continue from the current checkout state.

Resolution

The automation now checks whether the Delivery Method section is already visible.

If it is available, the test skips the unnecessary shipping continuation action.

Status

Resolved

Product Bugs

No product defect should be reported solely from an automation framework issue.

The issues documented above are development, environment, and automation findings unless separate product behavior is independently reproduced and confirmed.

Follow-up Opportunities

Future improvements may include:

Automatic Android connection health check
Dedicated checkout state reset mechanism
More structured test-result metadata
CI execution using a device farm
Central reusable Android CDP fixture
Automatic test execution summary generation