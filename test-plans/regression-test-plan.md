# CBI Mobile Regression Test Plan

## Scope

The regression suite covers the following areas across all four CBI sites:

- Global Header / Footer
- My Account
- Login
- Registration
- Wishlist
- PLP

PLP is treated as lower priority.

---

## TC-REG-001 - Global Header

### Steps
1. Open the site on a real Android device.
2. Inspect the mobile header.

### Validation
- Header is visible.
- Logo is visible.
- Search is available.
- Cart is available.
- Account access is available.

---

## TC-REG-002 - Global Footer

### Steps
1. Open the site.
2. Navigate to the footer.

### Validation
- Footer is visible.
- Footer content is rendered correctly.

---

## TC-REG-003 - My Account

### Steps
1. Open the site.
2. Open My Account.

### Validation
- Account page or account panel opens successfully.
- Account-related content is visible.

---

## TC-REG-004 - Login

### Steps
1. Open My Account.
2. Enter valid test credentials.
3. Submit the login form.

### Validation
- Email field accepts input.
- Password field accepts input.
- Login action succeeds.
- Logged-in account state is visible.

---

## TC-REG-005 - Registration

### Steps
1. Open registration.
2. Fill first name.
3. Fill last name.
4. Enter a unique test email.
5. Enter a valid password.
6. Submit registration.

### Validation
- Registration form loads.
- Required fields accept input.
- Registration result is displayed.
- Duplicate test email conflicts are avoided through dynamic data.

---

## TC-REG-006 - Wishlist

### Steps
1. Open a product.
2. Capture the product name.
3. Add the product to wishlist.
4. Open wishlist.
5. Verify the product.
6. Remove the product.

### Validation
- Product can be added to wishlist.
- Same product appears in wishlist.
- Product can be removed.

---

## TC-REG-007 - PLP Load

### Steps
1. Open a category or PLP.

### Validation
- Product listing page loads.
- At least one product is visible.

---

## TC-REG-008 - PLP Sort

### Steps
1. Open a PLP.
2. Inspect sorting controls.

### Validation
- Sort functionality is available when supported by the site.

---

## TC-REG-009 - PLP Filters

### Steps
1. Open a PLP.
2. Inspect filtering controls.

### Validation
- Filter functionality is available when supported by the site.

---

## TC-REG-010 - PLP to PDP

### Steps
1. Open a PLP.
2. Select the first valid visible product.

### Validation
- Product can be opened.
- User is navigated to a PDP.