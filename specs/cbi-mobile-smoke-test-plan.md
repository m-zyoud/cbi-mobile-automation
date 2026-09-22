# CBI Mobile Cross-Site Smoke Test Plan

## Application Overview

This smoke test plan validates the core mobile shopping experience across the following CBI storefronts:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

The automation runs against **real Android Chrome** using:

- Playwright
- Android Debug Bridge (ADB)
- Chrome DevTools Protocol (CDP)
- A shared Android fixture:
  `tests/fixtures/android.fixture.ts`

The framework uses:

- Shared Page Objects
- Area-based test organization
- Reusable helpers
- Dynamic product discovery
- Smoke / Regression tags
- A dedicated End-to-End purchase journey

The same reusable automation logic is shared across all configured CBI brands with minimal site-specific hardcoding.

---

# Smoke Strategy

Smoke coverage is selected from the existing area-based test suites using the:

```text
@smoke

tag.

Smoke tests are not duplicated into a separate smoke folder.

The same scenario can belong to both Smoke and Regression suites through tags such as:

@smoke
@regression

This keeps the test suite maintainable and avoids duplicated business flows.

The main End-to-End purchase journey is implemented separately in:

tests/journeys/purchase-flow.e2e.spec.ts

Dynamic product discovery logic is isolated in:

tests/helpers/product-discovery.ts
Execution Environment

The smoke suite is designed for a real Android device.

The runtime connection flow is:

Playwright
    ↓
Chrome DevTools Protocol
    ↓
localhost:9222
    ↓
ADB Port Forwarding
    ↓
Chrome on Android

Before executing runtime tests:

adb devices

The connected Android device should appear with:

device

Reset forwarding:

adb forward --remove-all

Restart Chrome:

adb shell am force-stop com.android.chrome

Open a configured CBI certification URL:

adb shell am start \
  -a android.intent.action.VIEW \
  -d "https://certwcs.frontgate.com/" \
  com.android.chrome

Forward Chrome DevTools:

adb forward tcp:9222 localabstract:chrome_devtools_remote

Verify CDP:

curl http://127.0.0.1:9222/json/version

A successful response should contain information such as:

Browser
webSocketDebuggerUrl
Test Scope

The smoke suite focuses on the most important customer-facing paths:

Global page shell
Search
Product discovery
PDP
Required product options
Add To Cart
Shopping Cart
Checkout
Shipping
Delivery Method
Payment checkpoint
Core Account and Registration checks
Critical mobile layout validation
Test Scenarios
1. Global Mobile Experience
SM-GLOBAL-001 Open each configured CBI site

Area:

tests/areas/globals/

Steps:

Open the configured site URL on the connected Android Chrome session.
Wait for DOM content to load.
Verify the page body is visible.
Verify the page is not blank or in an application error state.

Expected Results:

The configured certification site opens successfully.
The page remains inside the expected brand environment.
No unexpected blank page or fatal application error is displayed.
The page renders successfully on the current Android viewport.
SM-GLOBAL-002 Verify global mobile components

Steps:

Verify the mobile header is visible.
Verify the brand logo is visible.
Verify Search access is available.
Verify Cart access is available.
Verify Account access is available.
Verify the mobile navigation control is available.
Verify global layout remains usable.

Expected Results:

Header is rendered.
Brand logo is visible.
Search control is available.
Cart control is available.
Account control is available.
Mobile navigation is available.
Core controls are not substantially overlapping.
No unexpected horizontal overflow is present.
2. Search
SM-SEARCH-001 Open Search

Area:

tests/areas/search/search.spec.ts

Steps:

Open the site's Search control.
Verify a usable search field becomes available.
Focus the field.

Expected Results:

Search UI opens successfully.
Search input is visible and actionable.
Mobile layout remains stable.
SM-SEARCH-002 Discover a usable runtime search term

The framework should avoid unnecessary hardcoded product names.

Product discovery logic is handled by:

tests/helpers/product-discovery.ts

Steps:

Inspect visible navigation and eligible site content.
Collect usable candidate search terms.
Ignore utility links and irrelevant text.
Select a usable runtime search term.
Record the selected search term for diagnostics.

Expected Results:

A non-empty runtime search term is selected.
The term is based on current site content.
Utility controls such as Account, Cart, Login, Privacy, and Customer Service are ignored.
Product discovery does not depend on one fixed product.
SM-SEARCH-003 Execute Search

Steps:

Fill the Search input with the selected runtime term.
Submit using Enter or the site's search interaction.
Wait for the Search results state.

Expected Results:

Search submission succeeds.
Search results or a valid results state is displayed.
The page remains responsive.
At least one eligible product is discoverable for the End-to-End smoke journey.
3. Product Detail Page
SM-PDP-001 Open a dynamically discovered PDP

Area:

tests/areas/pdp/pdp.spec.ts

Steps:

Select an eligible product from runtime-discovered Search results.
Open the product.
Wait for the Product Detail Page to load.

Expected Results:

A valid PDP is displayed.
Product title/name is available.
Product page content is visible.
Product URL is valid.
The product identity can be captured for downstream validation.
SM-PDP-002 Verify core product information

Steps:

Capture the product name.
Verify product information.
Verify price or valid price state.
Verify product imagery where available.
Verify Add To Cart availability for a purchasable product.

Expected Results:

Product name is non-empty.
Product information is readable.
Product price or price state is displayed.
Product media does not prevent the flow.
Add To Cart is available when the product is purchasable.
SM-PDP-003 Select required product options dynamically

Steps:

Detect required product option groups.
Identify enabled and purchasable values.
Select the first valid option when required.
Re-evaluate dependent options if the site updates available values.
Continue until all required product selections are complete.

Expected Results:

Required options are handled dynamically.
Disabled or sold-out values are not intentionally selected.
No hardcoded color, size, or variant value is required.
A product with no required options can continue using its valid default configuration.
4. Add To Cart
SM-CART-001 Add selected product to Cart

Steps:

Retain the PDP product name.
Complete any required option selection.
Activate Add To Cart.
Wait for cart confirmation or cart state update.

Expected Results:

Product is added successfully.
Cart state updates.
The flow does not intentionally add duplicate items through repeated clicks.
No product-unavailable error is returned for the selected configuration.
SM-CART-002 Open and verify Cart

Area:

tests/areas/cart/cart.spec.ts

Steps:

Open the Cart.
Verify the Cart page loads.
Verify the Cart contains at least one item.
Verify Cart item count is greater than zero.

Expected Results:

Cart opens successfully.
Cart is not empty.
At least one Cart item is present.
Checkout control is available.
SM-CART-003 Verify the same PDP product is present in Cart

Steps:

Use the captured PDP product name.
Locate the corresponding product in the Cart.
Verify that product is visible.

Expected Results:

The same product selected on PDP appears in Cart.
The Cart does not contain only an unrelated stale product.
Product identity remains consistent through the PDP → Cart transition.
SM-CART-004 Verify critical Cart values

Steps:

Verify product price is visible.
Verify quantity information or control where supported.
Verify subtotal.
Verify Checkout control.

Expected Results:

Product price is available.
Quantity remains valid.
Cart subtotal is displayed.
Checkout can be initiated.
5. Checkout
SM-CHECKOUT-001 Proceed to Checkout

Area:

tests/areas/checkout/checkout.spec.ts

Steps:

Activate Checkout from Cart.
Wait for checkout navigation.
Verify Checkout loads.

Expected Results:

Checkout opens successfully.
Checkout state is available.
The page does not remain on a broken Cart state.
SM-CHECKOUT-002 Continue as Guest when required

Steps:

Detect whether a Continue As Guest option is displayed.
If displayed, activate it.
Otherwise continue with the currently available Checkout state.

Expected Results:

Guest checkout can continue when required.
Sites that already expose Shipping or a later state are handled without unnecessary failure.
SM-CHECKOUT-003 Fill approved QA shipping information

Reusable test data is stored in:

config/test-data.ts

Steps:

Populate first name.
Populate last name.
Populate approved QA street address.
Handle address autocomplete.
Populate approved QA email.
Populate approved QA phone.
Verify required shipping state.

Expected Results:

Required Shipping fields accept the configured QA values.
Address autocomplete can be handled.
ZIP/postal data is populated or retained where supported.
No real personal information is required.
SM-CHECKOUT-004 Continue to Delivery Method

Steps:

Continue from Shipping.
Handle Shipping Address Verification if displayed.
Verify Delivery Method state becomes available.

Expected Results:

Checkout advances from Shipping.
Address verification can be handled safely.
Delivery Method section is visible.
SM-CHECKOUT-005 Select Delivery Method

Steps:

Inspect available delivery choices.
Detect whether a delivery choice is already selected.
If none is selected and selectable options exist, choose a valid option.
Verify a Delivery Method is selected when required.

Expected Results:

A valid Delivery Method is available.
A required delivery choice can be selected.
Disabled options are not intentionally selected.
6. Payment Safety Checkpoint
SM-CHECKOUT-006 Continue to Payment

Steps:

Continue from Delivery Method toward Payment.
Use the currently available checkout control.
Wait for Payment state.

Expected Results:

Payment state is reachable.
Payment heading, Payment section, hosted fields, or equivalent Payment controls are displayed.
The Checkout remains stable.
SM-CHECKOUT-007 Verify Payment checkpoint safely

Steps:

Verify Payment step is visible.
Verify Payment-related controls or Payment section are available.
Verify the page does not display a fatal error.
Verify the current URL is not an order confirmation URL.

Expected Results:

Payment checkpoint is reached successfully.
Payment UI is available.
No blank hosted payment state blocks the test where supported.
No order is created.
SM-CHECKOUT-008 Prevent final order submission

The End-to-End smoke journey intentionally stops at Payment.

The automation must not click controls matching actions such as:

Place Order
Submit Order
Complete Purchase
Complete Order
Buy Now
Purchase

Expected Results:

No final purchase action is triggered.
The automation remains inside Checkout.
No Order Confirmation page is reached.
No Thank You page is reached.
No real or certification order is intentionally submitted.
End-to-End Smoke Journey

The main End-to-End purchase flow is implemented in:

tests/journeys/purchase-flow.e2e.spec.ts

The flow is:

Open Brand
    ↓
Verify Global Elements
    ↓
Discover Search Term
    ↓
Search
    ↓
Discover Product
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
Verify Same Product In Cart
    ↓
Proceed To Checkout
    ↓
Continue As Guest
    ↓
Fill Shipping Details
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

The flow intentionally stops before final order submission.

Additional Smoke Areas

Smoke tags are also applied to selected critical tests in other functional areas.

Login

Area:

tests/areas/account/login.spec.ts

Critical smoke coverage may include:

Open My Account
Login form visibility
Password masking
Forgot Password accessibility
Login control visibility and accessibility
Registration

Area:

tests/areas/account/registration.spec.ts

Critical smoke coverage may include:

Registration page loading
Registration form visibility
Empty form prevention
Password masking
Global Components

Area:

tests/areas/globals/header-footer.spec.ts

Critical smoke coverage may include:

Header
Logo
Search
Cart
Account
Mobile menu
Navigation safety
Current Android viewport responsiveness
Smoke Execution

Run all Smoke-tagged tests:

npm run test:smoke

Equivalent to:

playwright test --grep @smoke --workers=1

Because the suite shares the same real Android Chrome environment, execution uses:

workers=1
Run the End-to-End Journey
npm run test:e2e

This executes:

tests/journeys/purchase-flow.e2e.spec.ts
Run One Brand

Example:

npm run test:frontgate

Other configured brand commands:

npm run test:ballard
npm run test:garnet
npm run test:grandin
Static Validation

Before runtime execution, validate TypeScript:

npm run typecheck

Verify test discovery:

npm run test:list

Current discovered suite:

Total: 1296 tests in 10 files

This represents Playwright test executions across the configured brands.

It does not mean there are 1296 unique business scenarios.

Many scenarios are parameterized and executed against multiple CBI sites.

Pass Criteria

The Smoke suite is considered successful when:

The Android device is connected.
Chrome CDP forwarding is active.
The selected CBI certification sites load.
Critical Smoke-tagged scenarios execute successfully.
The dynamic purchase journey reaches the Payment checkpoint.
The same selected product remains consistent from PDP through Cart.
Shipping and Delivery states remain usable.
No fatal application errors are displayed.
No unintended final order submission occurs.
Failure Criteria

A Smoke scenario should fail when a critical flow cannot continue, including examples such as:

Android Chrome cannot be reached through CDP.
A configured site cannot load.
Critical global navigation is missing.
Search cannot be used.
No eligible product can be discovered for the purchase journey.
PDP cannot load.
Required product options cannot be completed.
Add To Cart fails.
Cart does not contain the selected product.
Checkout cannot load.
Shipping cannot be completed with approved QA data.
Delivery Method cannot be reached.
Payment checkpoint cannot be reached.
A fatal application error is displayed.

Feature-specific optional behavior should only be skipped when the feature is genuinely not exposed by that brand.

Failures must not be converted into skips merely to make the suite pass.

Reporting

Playwright reporting is configured in:

playwright.config.ts

Generated runtime output may include:

playwright-report/
test-results/

These generated files should not be committed.

Open the latest HTML report with:

npm run report
Current Validation Status

The current framework has been statically validated using:

npm run typecheck

and:

npm run test:list

Current discovered test count:

1296 tests in 10 files

Full runtime validation requires:

Connected Android device
USB Debugging
Android Chrome
ADB forwarding
Active CDP connection

Static test discovery does not imply that all runtime scenarios have passed on all four brands.