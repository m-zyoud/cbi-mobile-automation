# CBI Playwright Real Android Mobile Automation

A reusable Playwright + TypeScript automation framework for testing CBI mobile web experiences across multiple brands using **real Android Chrome**, **ADB**, and the **Chrome DevTools Protocol (CDP)**.

The framework uses a shared Page Object Model, area-based test organization, reusable fixtures and helpers, and cross-site Smoke / Regression coverage.

---

## Supported CBI Brands

The framework is configured to run against:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

Site configuration is centralized in:

```text
config/sites.ts
```

---

## Tech Stack

- Playwright
- TypeScript
- Node.js
- Page Object Model
- Android Debug Bridge (ADB)
- Chrome DevTools Protocol (CDP)
- Real Android Chrome
- VS Code
- Playwright Agents
- Git / GitHub

---

## Project Goals

The project provides a reusable mobile automation framework with emphasis on:

- Cross-brand reusable automation
- Real Android browser execution
- Area-based test architecture
- Page Object Model
- Dynamic product discovery
- Dynamic search
- Dynamic PDP option handling
- Shopping cart validation
- Checkout validation
- Account and Registration coverage
- Wishlist coverage
- PLP and PDP validation
- Header and Footer validation
- Positive, negative, boundary, and edge-case scenarios
- Smoke and Regression tagging
- End-to-End purchase journey validation
- Minimal site-specific hardcoding
- Maintainable and scalable automation

---

# Current Architecture

```text
cbi-mobile-automation/
│
├── .github/
│   ├── agents/
│   └── workflows/
│
├── .vscode/
│   └── mcp.json
│
├── config/
│   ├── sites.ts
│   └── test-data.ts
│
├── pages/
│   ├── AccountPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── HeaderFooterPage.ts
│   ├── HomePage.ts
│   ├── PLPPage.ts
│   ├── ProductPage.ts
│   ├── RegistrationPage.ts
│   ├── SearchPage.ts
│   └── WishlistPage.ts
│
├── specs/
│
├── test-plans/
│   ├── issues-report.md
│   ├── master-test-plan.md
│   ├── regression-test-plan.md
│   ├── smoke-test-plan.md
│   └── test-execution-report.md
│
├── tests/
│   ├── areas/
│   │   ├── account/
│   │   │   ├── login.spec.ts
│   │   │   └── registration.spec.ts
│   │   │
│   │   ├── cart/
│   │   │   └── cart.spec.ts
│   │   │
│   │   ├── checkout/
│   │   │   └── checkout.spec.ts
│   │   │
│   │   ├── globals/
│   │   │   └── header-footer.spec.ts
│   │   │
│   │   ├── pdp/
│   │   │   └── pdp.spec.ts
│   │   │
│   │   ├── plp/
│   │   │   └── plp.spec.ts
│   │   │
│   │   ├── search/
│   │   │   └── search.spec.ts
│   │   │
│   │   └── wishlist/
│   │       └── wishlist.spec.ts
│   │
│   ├── fixtures/
│   │   └── android.fixture.ts
│   │
│   ├── helpers/
│   │   └── product-discovery.ts
│   │
│   └── journeys/
│       └── purchase-flow.e2e.spec.ts
│
├── utils/
│
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

---

# Test Organization

The framework is organized by functional area rather than by separate duplicated Smoke and Regression folders.

Current functional areas include:

- Login
- Registration
- PLP
- PDP
- Search
- Cart
- Checkout
- Wishlist
- Global Header / Footer
- End-to-End Purchase Journey

Smoke and Regression execution is controlled using Playwright tags:

```text
@smoke
@regression
```

This allows critical scenarios to be reused in both suites without duplicating test logic.

---

# Current Test Discovery

The current Playwright suite discovers:

```text
Total: 1296 tests in 10 files
```

This number represents the discovered Playwright executions across the configured CBI brands.

Many area scenarios are executed against all four configured websites, so this should not be interpreted as 1296 unique business scenarios.

To verify the current discovered suite:

```bash
npm run test:list
```

---

# Area Coverage

## Login

Covers scenarios such as:

- Open My Account
- Login form visibility
- Password masking
- Forgot Password
- Required field validation
- Invalid email
- Invalid credentials
- Email whitespace
- Email case handling
- Enter-key submission
- Refresh behavior
- Back / Forward navigation
- Long input handling
- Mobile overflow validation
- Mobile control overlap checks

---

## Registration

Covers:

- Registration page loading
- Registration form visibility
- Required fields
- First and last name input
- Email validation
- Password validation
- Password masking
- Weak password handling
- Confirm password behavior where available
- Existing email handling
- Terms controls where available
- Keyboard interaction
- Refresh / navigation behavior
- Long input handling
- Mobile responsive validation

---

## Product Listing Page (PLP)

Covers:

- Category / PLP loading
- Product cards
- Product links
- Product information
- Prices
- Sorting
- Filtering
- Swatches where supported
- Empty and unavailable states
- URL behavior
- Persistence
- Promotional states
- Mobile layout validation

---

## Product Detail Page (PDP)

Covers:

- PDP loading
- Product name
- Product price
- Product imagery
- Product options
- Required option selection
- Add To Cart
- Quantity
- Product details
- Availability
- Promotional pricing
- Repeated interactions
- Responsive mobile behavior

---

## Search

Covers:

- Search interface
- Search submission
- Valid search
- Invalid / empty search
- No-result states
- Search result products
- Search term handling
- URL behavior
- Sorting
- Filtering
- Keyboard submission
- Repeated interaction
- Mobile layout validation

---

## Cart

Covers:

- Cart loading
- Cart item count
- Product presence
- Product price
- Quantity controls
- Quantity boundaries
- Product options
- Remove item
- Empty cart
- Multiple items
- Subtotal
- Promo code behavior
- Refresh persistence
- Navigation persistence
- Checkout availability
- Responsive layout validation

---

## Checkout

Covers:

- Checkout loading
- Guest checkout
- Shipping data
- Required field validation
- Email validation
- Postal code validation
- Phone validation
- Delivery Method
- Delivery selection
- Order summary
- Quantity
- Subtotal
- Shipping cost
- Tax
- Total
- Refresh behavior
- Back / Forward navigation
- Payment checkpoint
- Mobile responsiveness
- Safe prevention of final order submission

---

## Wishlist

Covers:

- Add To Wishlist availability
- Add product
- Wishlist loading
- Product presence
- Remove product
- Empty wishlist
- Duplicate add behavior
- Wishlist persistence
- Product links
- Count / badge behavior where supported
- Back / Forward navigation
- Responsive layout
- Add / Remove stability

---

## Global Components

Covers:

- Header
- Brand logo
- Search control
- Cart control
- Account control
- Mobile navigation
- Footer
- Logo navigation
- Search interaction
- Cart navigation
- Account navigation
- Mobile menu behavior
- Newsletter behavior where supported
- Footer links
- Social links
- Refresh behavior
- Back / Forward behavior
- Mobile overflow
- Header overlap
- Footer overlap
- Responsive global layout

---

# End-to-End Purchase Journey

The framework includes:

```text
tests/journeys/purchase-flow.e2e.spec.ts
```

The Journey validates the main mobile purchase path:

```text
Open Brand
    ↓
Verify Global Elements
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
Verify Cart Contains Product
    ↓
Verify Same PDP Product In Cart
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
```

## Order Safety

The automated Journey intentionally stops at the Payment stage.

It does **not** click:

```text
Place Order
Submit Order
Complete Purchase
Complete Order
Buy Now
```

The framework verifies that automation does not reach an Order Confirmation state.

---

# Dynamic Product Discovery

Product discovery logic is separated from the main E2E Journey:

```text
tests/helpers/product-discovery.ts
```

Instead of depending on a single hardcoded product, the automation can discover product candidates dynamically from the active CBI website.

This helps reduce unnecessary brand-specific hardcoding.

---

# Page Object Model

Reusable browser interaction logic is stored in:

```text
pages/
```

Examples:

### `PLPPage`

Handles:

- PLP discovery
- Product listing validation
- Product cards
- Sorting
- Filtering
- PLP-specific interactions

### `ProductPage`

Handles:

- PDP validation
- Product information
- Product option selection
- Add To Cart behavior

### `CartPage`

Handles:

- Cart page validation
- Product verification
- Quantity
- Prices
- Subtotal
- Removal
- Checkout navigation

### `CheckoutPage`

Handles:

- Checkout validation
- Guest checkout
- Shipping
- Address autocomplete
- Address verification
- Delivery Method
- Payment navigation
- Safe Payment checkpoint validation

### `AccountPage`

Handles Login and account-related interactions.

### `RegistrationPage`

Handles Registration-specific interactions and validation.

### `HeaderFooterPage`

Handles reusable global UI components.

### `WishlistPage`

Handles Wishlist interactions and state validation.

---

# Real Android Architecture

This framework is designed to execute against **Chrome running on a real Android device**.

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

The reusable Android fixture is located at:

```text
tests/fixtures/android.fixture.ts
```

Playwright connects to Android Chrome using CDP:

```ts
chromium.connectOverCDP(
  'http://127.0.0.1:9222'
);
```

---

# Android Setup

## 1. Connect Android Device

Connect the Android device through USB.

Enable:

```text
Developer Options
USB Debugging
```

Verify connectivity:

```bash
adb devices
```

The device should appear with status:

```text
device
```

---

## 2. Reset Existing ADB Forwarding

```bash
adb forward --remove-all
```

---

## 3. Restart Android Chrome

```bash
adb shell am force-stop com.android.chrome
```

Example:

```bash
adb shell am start \
  -a android.intent.action.VIEW \
  -d "https://certwcs.frontgate.com/" \
  com.android.chrome
```

---

## 4. Forward Chrome DevTools Port

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

---

## 5. Verify Chrome DevTools Connection

```bash
curl http://127.0.0.1:9222/json/version
```

A successful response should contain data such as:

```text
Browser
webSocketDebuggerUrl
```

The Android device and CDP forwarding must be active before executing runtime tests.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/m-zyoud/cbi-mobile-automation.git
```

Enter the project:

```bash
cd cbi-mobile-automation
```

Install dependencies:

```bash
npm install
```

---

# Validation Commands

## TypeScript Validation

```bash
npm run typecheck
```

Equivalent to:

```bash
tsc --noEmit
```

---

## List Tests Without Running Them

```bash
npm run test:list
```

Current expected result:

```text
Total: 1296 tests in 10 files
```

---

# Test Execution

Because all tests share the same real Android Chrome environment, the framework executes with:

```text
workers=1
```

## Run All Tests

```bash
npm test
```

---

## Run Smoke

```bash
npm run test:smoke
```

Equivalent to:

```bash
playwright test --grep @smoke --workers=1
```

---

## Run Regression

```bash
npm run test:regression
```

Equivalent to:

```bash
playwright test --grep @regression --workers=1
```

---

## Run End-to-End Journey

```bash
npm run test:e2e
```

This executes:

```text
tests/journeys/purchase-flow.e2e.spec.ts
```

---

# Run By Brand

## Frontgate

```bash
npm run test:frontgate
```

## Ballard Designs

```bash
npm run test:ballard
```

## Garnet Hill

```bash
npm run test:garnet
```

## Grandin Road

```bash
npm run test:grandin
```

---

# Playwright Report

Open the latest Playwright HTML report:

```bash
npm run report
```

---

# Test Data

Reusable test data is stored in:

```text
config/test-data.ts
```

This includes data used by flows such as:

- Login
- Registration
- Shipping

Sensitive values should be supplied through environment variables where required.

Example:

```bash
export CBI_TEST_EMAIL="example@example.com"
export CBI_TEST_PASSWORD="your-password"
```

Sensitive credentials should never be committed to the repository.

---

# Playwright Agents

The repository contains Playwright agent configuration under:

```text
.github/agents/
```

Available agent definitions include:

- Planner
- Generator
- Healer

They can assist with:

- Test planning
- Test generation
- Locator maintenance
- Automation troubleshooting

VS Code integration is configured under:

```text
.vscode/
```

---

# Reliability Strategy

The framework uses several techniques to improve maintainability and reliability:

- Shared Page Objects
- Reusable Android fixture
- Runtime product discovery
- Dynamic PDP option handling
- Explicit visibility assertions
- Controlled retries during discovery
- Centralized site configuration
- Area-based test organization
- Smoke / Regression tags
- Single Android worker
- Safe checkout checkpoints
- Mobile overflow validation
- Responsive control checks
- Avoidance of final order submission

---

# Generated Files

Generated and local files should not be committed:

```text
node_modules/
test-results/
playwright-report/
.env
.DS_Store
```

---

# Current Validation Status

The current project has been successfully validated for:

```bash
npm run typecheck
```

and:

```bash
npm run test:list
```

Current discovered suite:

```text
1296 tests in 10 files
```

Full runtime execution requires a connected Android device with active ADB and CDP forwarding.

Static discovery success does not imply that every test has been runtime-validated on every brand.

---

# Repository

```text
https://github.com/m-zyoud/cbi-mobile-automation
```