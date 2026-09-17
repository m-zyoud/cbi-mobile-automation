# CBI Playwright Real Android Mobile Automation

A reusable Playwright automation framework for validating CBI mobile web experiences across multiple brands using a shared Page Object Model and real Android Chrome connectivity through ADB and Chrome DevTools Protocol (CDP).

## Covered Sites

The framework is configured for:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

All site URLs are centralized in:

```text
config/sites.ts

Tech Stack
Playwright
TypeScript
Node.js
Page Object Model
Android Debug Bridge (ADB)
Chrome DevTools Protocol (CDP)
VS Code
Playwright Agents

Project Goals

The project provides a reusable cross-site mobile automation solution for CBI brands with emphasis on:

Shared automation logic
Dynamic product discovery
Dynamic search
Dynamic PDP option handling
Shopping cart validation
Checkout validation
Shipping flow
Delivery Method
Payment step validation
Regression coverage
Real Android browser execution
Minimal site-specific hardcoding

Architecture

The framework follows the Page Object Model pattern.

cbi-mobile-automation/
│
├── .github/
│   └── agents/
│
├── .vscode/
│   └── mcp.json
│
├── config/
│   ├── sites.ts
│   └── test-data.ts
│
├── pages/
│   ├── HomePage.ts
│   ├── SearchPage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
│
├── specs/
│
├── test-plans/
│
├── tests/
│   ├── regression/
│   │   ├── header-footer.spec.ts
│   │   ├── login.spec.ts
│   │   ├── plp.spec.ts
│   │   ├── registration.spec.ts
│   │   └── wishlist.spec.ts
│   │
│   └── smoke/
│       ├── cbi-mobile-smoke.spec.ts
│       └── payment.spec.ts
│
├── utils/
│
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── README.md

Test Coverage

The current suite contains:

28 tests
7 test files

Coverage is shared across all four CBI brands.

Smoke Testing

The main smoke test is:

tests/smoke/cbi-mobile-smoke.spec.ts

It validates:

Open the configured CBI site
Validate global page elements
Discover search terms dynamically
Search for products
Detect a valid PDP dynamically
Validate product details
Detect and select product options dynamically
Add product to cart
Validate shopping cart
Proceed to checkout
Handle guest checkout
Complete shipping information
Reach Delivery Method
Validate Delivery Method

The smoke flow is shared across all configured sites.

Payment Coverage

Payment validation is handled by:

tests/smoke/payment.spec.ts

The test validates:

Delivery Method checkpoint
Continue To Payment action
Payment section visibility
Payment-related controls

The same payment implementation is reused across:

Frontgate
Ballard Designs
Garnet Hill
Grandin Road
Regression Coverage

The regression suite covers the following areas.

Header and Footer
tests/regression/header-footer.spec.ts

Validates reusable global site components.

Login
tests/regression/login.spec.ts

Validates account login functionality.

Registration
tests/regression/registration.spec.ts

Validates account registration functionality.

Wishlist
tests/regression/wishlist.spec.ts

Validates wishlist behavior.

PLP
tests/regression/plp.spec.ts

Validates Product Listing Page behavior.

Dynamic Test Strategy

The framework avoids unnecessary hardcoded product data.

Instead, the automation discovers information at runtime.

Examples include:

Search terms discovered from visible navigation
Products discovered dynamically from search results
PDP URLs detected from runtime search results
Product names extracted dynamically
Required PDP options detected dynamically
Cart values validated dynamically

This allows the same automation flow to work across multiple CBI websites.

Page Object Model

Reusable browser interaction logic is stored inside the pages directory.

HomePage

Responsible for:

Page load validation
Global element validation
SearchPage

Responsible for:

Opening mobile search
Search interactions
ProductPage

Responsible for:

PDP validation
Product name extraction
Dynamic option discovery
Add To Cart behavior

Product option detection is intentionally restricted to the product content area to avoid accidentally interacting with global controls such as:

Affiliate site selectors
Country selectors
Currency selectors
Navigation controls
CartPage

Responsible for:

Opening the shopping cart
Cart page validation
Cart item count
Checkout navigation
CheckoutPage

Responsible for:

Checkout validation
Guest checkout
Shipping information
Address autocomplete
Address verification
Delivery Method
Payment navigation
Payment section validation
Real Android Architecture

The framework is designed to interact with Chrome running on an Android device instead of using desktop browser emulation.

The connection flow is:

Playwright
    ↓
Chrome DevTools Protocol
    ↓
localhost:9222
    ↓
ADB Port Forwarding
    ↓
Chrome on Android

Playwright connects using:

await chromium.connectOverCDP(
  'http://127.0.0.1:9222'
);
Android Setup
1. Connect Android Device

Connect an Android phone through USB and enable:

Developer Options
USB Debugging

Verify the device:

adb devices

The device should appear with status:

device
2. Open Chrome on Android

Chrome must be running on the Android device.

Example:

adb shell am start \
  -a android.intent.action.VIEW \
  -d "https://certwcs.frontgate.com/" \
  com.android.chrome
3. Configure CDP Forwarding

Run:

adb forward --remove-all

Then:

adb forward tcp:9222 localabstract:chrome_devtools_remote
4. Verify Chrome Debugging

Run:

curl http://127.0.0.1:9222/json/version

A successful response should return Chrome debugging information including:

webSocketDebuggerUrl
Installation

Clone the repository:

git clone https://github.com/m-zyoud/cbi-mobile-automation.git

Enter the project:

cd cbi-mobile-automation

Install dependencies:

npm install
TypeScript Validation

Validate the project without executing Android tests:

npx tsc --noEmit
List Available Tests

To verify test discovery without executing them:

npx playwright test --list

Expected suite size:

28 tests in 7 files
Run Smoke Tests

Run all cross-site smoke tests:

npx playwright test tests/smoke/cbi-mobile-smoke.spec.ts --workers=1

Using one worker is recommended because the tests share the same real Android Chrome session.

Run One Brand

Example for Frontgate:

npx playwright test \
  tests/smoke/cbi-mobile-smoke.spec.ts \
  --grep="Frontgate" \
  --workers=1

Example for Ballard Designs:

npx playwright test \
  tests/smoke/cbi-mobile-smoke.spec.ts \
  --grep="Ballard" \
  --workers=1

  Run Payment Tests
npx playwright test tests/smoke/payment.spec.ts --workers=1
Run Regression Tests
npx playwright test tests/regression --workers=1
Test Data

Reusable test data is stored in:

config/test-data.ts

Examples include:

Account data
Registration data
Shipping details

Sensitive values should be provided through environment variables whenever required.

Example:

export CBI_TEST_EMAIL="example@example.com"
export CBI_TEST_PASSWORD="your-password"
Playwright Agents

The project includes Playwright agent configuration.

The following agents are available:

Planner
Generator
Healer

Agent definitions are stored under:

.github/agents/

VS Code integration is configured in:

.vscode/mcp.json

The agents can support:

Test planning
Test generation
Test maintenance
Locator healing
Automation troubleshooting
Reliability Strategy

Several techniques are used to improve test reliability:

Runtime element discovery
Reusable Page Objects
Limited search retries
Explicit visibility checks
DOM fallback clicks where required
Dynamic product selection
Dynamic PDP option handling
URL validation
Checkout state detection
Shipping state reuse
Address autocomplete support
Address verification handling
Serial execution for shared Android sessions
Generated Files

The following generated files are excluded from Git:

node_modules/
test-results/
playwright-report/
.env
.DS_Store
Current Validation Status

The project has been statically validated using:

npx tsc --noEmit

and:

npx playwright test --list

The current discovered suite contains:

28 tests
7 files

The automation architecture supports execution against all four configured CBI brands using the same reusable real-Android Playwright framework.

Repository
https://github.com/m-zyoud/cbi-mobile-automation

