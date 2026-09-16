# CBI Mobile Smoke Test Plan

## Scope

This smoke test validates the critical end-to-end mobile shopping flow across the following CBI sites:

- Frontgate
- Ballard Designs
- Garnet Hill
- Grandin Road

Execution must run on a real Android device.

---

## TC-SM-001 - Open Site

### Steps
1. Connect Playwright to Chrome on a real Android device.
2. Navigate to the selected CBI site.

### Validation
- The page loads successfully.
- The page title is available.
- The page body is visible.
- The global mobile layout is rendered.

---

## TC-SM-002 - Verify Global Elements

### Steps
1. Open the site.
2. Verify the main global elements.

### Validation
- Header is visible.
- Logo is visible.
- Search is available.
- Cart is available.
- Account access is available.
- Footer is available.

---

## TC-SM-003 - Search for Product

### Steps
1. Open the search control.
2. Select a search term dynamically.
3. Submit the search.

### Validation
- Search control is usable.
- Search request is submitted successfully.
- Search results are loaded.

---

## TC-SM-004 - Open Product

### Steps
1. Identify available products from the search result.
2. Open the first valid visible product.

### Validation
- PDP opens successfully.
- Product title is visible.
- Core product information is available.

---

## TC-SM-005 - Select Product Options

### Steps
1. Detect available product options.
2. Select enabled variants dynamically.

### Validation
- Disabled options are not selected.
- Available options can be selected.
- No hardcoded size, color, or variant is required.

---

## TC-SM-006 - Add Product to Cart

### Steps
1. Select the required product options.
2. Tap Add to Cart.

### Validation
- Add to Cart control is available.
- Product is added successfully.
- Product information can be carried forward for validation.

---

## TC-SM-007 - Verify Cart

### Steps
1. Open the cart.
2. Locate the selected product.

### Validation
- Cart page loads.
- Selected product is visible.
- Product name matches the PDP.
- Cart contains at least one item.

---

## TC-SM-008 - Proceed to Checkout

### Steps
1. Tap Checkout.
2. Open the checkout flow.

### Validation
- Checkout page loads successfully.
- Shipping step is available.

---

## TC-SM-009 - Complete Shipping Information

### Steps
1. Fill valid test shipping information.
2. Continue to the next checkout step.

### Validation
- Required shipping fields accept input.
- Checkout proceeds to payment.

---

## TC-SM-010 - Validate Payment Step

### Steps
1. Continue from shipping to payment.

### Validation
- Payment section loads.
- Payment-related controls are visible.

---

## TC-SM-011 - Complete Order

### Steps
1. Use approved QA payment data.
2. Place the order.

### Validation
- Order is submitted successfully.
- Order confirmation is displayed.
- Core product and order information remains correct.

Note: Final order submission must only run when approved QA payment data and a safe certification environment are available.