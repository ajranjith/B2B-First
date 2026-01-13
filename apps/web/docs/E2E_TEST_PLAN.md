# End-to-End Test Plan - B2B Dealer Portal

## Test Overview

This document outlines comprehensive end-to-end test scenarios for the B2B dealer portal, covering the complete user journey from login to checkout.

---

## Test Environment

**Base URL:** `http://localhost:3000`
**Test User Credentials:**
- **Dealer Email:** `dealer@example.com`
- **Dealer Password:** `password123`
- **Admin Email:** `admin@example.com`
- **Admin Password:** `password123`

---

## Test Scenarios

### 1. File Upload (Admin)

#### Test Case 1.1: Upload Product File
**Priority:** High
**User Role:** Admin

**Steps:**
1. Navigate to `/admin/login`
2. Enter admin credentials
3. Click "Sign In"
4. Verify redirect to `/admin/dashboard`
5. Navigate to `/admin/imports`
6. Click "Upload File" button
7. Select a CSV file with product data
8. Click "Upload"
9. Verify file appears in imports table
10. Verify status shows "PROCESSING"
11. Wait for processing to complete
12. Verify status changes to "SUCCEEDED" or "SUCCEEDED_WITH_ERRORS"
13. Check total rows, valid rows, and invalid rows
14. Verify success rate percentage

**Expected Results:**
- ✅ File upload initiated successfully
- ✅ Import batch created with status "PROCESSING"
- ✅ Background job processes file
- ✅ Status updates to completion state
- ✅ Statistics displayed (total, valid, invalid rows)
- ✅ Success rate calculated correctly

**Test Data:**
```csv
productCode,description,partType,freeStock,price
ABC123,Engine Oil Filter,GENUINE,100,45.50
XYZ789,Brake Pad Set,AFTERMARKET,50,89.99
```

#### Test Case 1.2: Download Error Report
**Priority:** Medium
**User Role:** Admin

**Steps:**
1. From imports page, find a batch with errors
2. Click expand icon on row with invalid rows
3. Verify error details displayed
4. Click "Download Errors" button
5. Verify CSV file downloaded
6. Open downloaded file
7. Verify error details include row numbers and error messages

**Expected Results:**
- ✅ Error rows expandable
- ✅ Error summary displayed
- ✅ CSV export successful
- ✅ Error details clear and actionable

---

### 2. Dealer Login

#### Test Case 2.1: Successful Login
**Priority:** Critical
**User Role:** Dealer

**Steps:**
1. Navigate to `/dealer/login`
2. Enter email: `dealer@example.com`
3. Enter password: `password123`
4. Check "Remember me" checkbox
5. Click "Sign In"
6. Verify redirect to `/dealer/dashboard`
7. Verify user email stored in localStorage
8. Verify user role set to "dealer"

**Expected Results:**
- ✅ Login form submitted
- ✅ Loading state displayed ("Signing in...")
- ✅ Redirect to dashboard after 1 second
- ✅ User credentials stored locally
- ✅ Dashboard loads successfully

#### Test Case 2.2: Invalid Credentials
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Navigate to `/dealer/login`
2. Enter email: `invalid@example.com`
3. Enter password: `wrongpassword`
4. Click "Sign In"
5. Verify error message displayed

**Expected Results:**
- ✅ Error message shown
- ✅ User remains on login page
- ✅ Form cleared or retains email

#### Test Case 2.3: Form Validation
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Navigate to `/dealer/login`
2. Try to submit empty form
3. Verify required field validations
4. Enter invalid email format
5. Verify email validation

**Expected Results:**
- ✅ Required field errors shown
- ✅ Email format validated
- ✅ Submit button disabled until valid

---

### 3. Search Parts

#### Test Case 3.1: Basic Search
**Priority:** Critical
**User Role:** Dealer

**Steps:**
1. Login as dealer
2. Navigate to `/dealer/search`
3. Enter search query: "brake"
4. Press Enter or click "Search"
5. Verify loading state shown
6. Verify results displayed
7. Check result count displayed

**Expected Results:**
- ✅ Search initiated
- ✅ Loading skeleton displayed
- ✅ Results returned from API
- ✅ Product cards displayed with:
  - Product code
  - Description
  - Part type badge
  - Stock status
  - Price
  - Add to cart button
- ✅ Result count matches actual results

#### Test Case 3.2: Search with Filters
**Priority:** High
**User Role:** Dealer

**Steps:**
1. From search page, enter query: "filter"
2. Click "Filters" button
3. Verify filter panel expands
4. Select "Part Type": GENUINE
5. Check "In Stock Only"
6. Select "Sort By": Price: Low to High
7. Click "Search"
8. Verify results filtered correctly

**Expected Results:**
- ✅ Filters applied to query
- ✅ Only GENUINE parts shown
- ✅ Only in-stock items shown
- ✅ Results sorted by price ascending
- ✅ Filter values retained

#### Test Case 3.3: No Results
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Enter search query: "xyznonexistent123"
2. Click "Search"
3. Verify empty state displayed

**Expected Results:**
- ✅ "No products found" message shown
- ✅ Helpful suggestion to adjust search
- ✅ No error thrown

#### Test Case 3.4: Search Multiple Times
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Search for "oil"
2. Verify results
3. Clear search, search for "brake"
4. Verify new results replace old
5. Use browser back button
6. Verify previous search restored (if applicable)

**Expected Results:**
- ✅ Multiple searches work correctly
- ✅ Results updated each time
- ✅ No caching issues

---

### 4. Add to Cart

#### Test Case 4.1: Add Single Item
**Priority:** Critical
**User Role:** Dealer

**Steps:**
1. From search page, find a product
2. Leave quantity as 1
3. Click "Add to Cart"
4. Verify loading state on button
5. Verify success toast notification
6. Verify mini cart opens
7. Verify item appears in mini cart
8. Verify mini cart auto-closes after 3 seconds

**Expected Results:**
- ✅ Button shows loading state
- ✅ Success toast displayed
- ✅ Mini cart opens automatically
- ✅ Cart count updated
- ✅ Item visible in mini cart
- ✅ Auto-close after 3 seconds

#### Test Case 4.2: Add Multiple Quantities
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Find a product with sufficient stock
2. Change quantity to 5
3. Click "Add to Cart"
4. Verify 5 units added
5. Verify total price calculated correctly

**Expected Results:**
- ✅ Quantity input accepted
- ✅ Correct quantity added
- ✅ Price multiplied correctly
- ✅ Toast shows quantity (e.g., "Added 5x ABC123 to cart")

#### Test Case 4.3: Add Out of Stock Item
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Find product with freeStock = 0
2. Verify "Add to Cart" button is disabled
3. Verify "Out of Stock" badge displayed

**Expected Results:**
- ✅ Button disabled
- ✅ Clear stock status shown
- ✅ Cannot add to cart

#### Test Case 4.4: Add Same Item Multiple Times
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Add item ABC123 qty 2
2. Search again for same item
3. Add ABC123 qty 3 again
4. Open cart
5. Verify quantities merged (total 5)

**Expected Results:**
- ✅ Duplicate items merged
- ✅ Quantities summed
- ✅ Single cart line for same product

---

### 5. Update Cart

#### Test Case 5.1: Increase Quantity
**Priority:** Critical
**User Role:** Dealer

**Steps:**
1. Navigate to `/dealer/cart`
2. Find an item in cart
3. Click "+" button on quantity control
4. Verify quantity increased
5. Verify line total updated
6. Verify cart subtotal updated

**Expected Results:**
- ✅ Quantity incremented
- ✅ Line total = price × new qty
- ✅ Subtotal recalculated
- ✅ Update persisted

#### Test Case 5.2: Decrease Quantity
**Priority:** Critical
**User Role:** Dealer

**Steps:**
1. Find item with qty > 1
2. Click "-" button
3. Verify quantity decreased
4. Verify totals updated
5. Try to decrease qty below 1
6. Verify minimum quantity enforced

**Expected Results:**
- ✅ Quantity decremented
- ✅ Totals updated
- ✅ Cannot go below 1
- ✅ Button disabled at qty = 1

#### Test Case 5.3: Manual Quantity Entry
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Click on quantity input field
2. Clear value
3. Type "10"
4. Press Enter or click outside
5. Verify quantity updated to 10
6. Verify totals recalculated

**Expected Results:**
- ✅ Manual entry accepted
- ✅ Quantity updated on blur/enter
- ✅ Validation for positive integers
- ✅ Totals updated

#### Test Case 5.4: Remove Item
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Find item in cart
2. Click trash icon (remove button)
3. Confirm deletion in prompt
4. Verify item removed from cart
5. Verify success toast
6. Verify cart totals updated
7. If last item, verify empty cart state

**Expected Results:**
- ✅ Confirmation dialog shown
- ✅ Item removed on confirm
- ✅ Cart updated
- ✅ Success notification
- ✅ Empty state if no items left

---

### 6. View Cart

#### Test Case 6.1: Cart Summary Display
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Navigate to `/dealer/cart` with items
2. Verify cart header shows item count
3. Verify each item displays:
   - Product image placeholder
   - Product code and description
   - Part type badge
   - Unit price
   - Quantity controls
   - Line total
   - Remove button
4. Verify order summary card shows:
   - Item count
   - Subtotal
   - "Proceed to Checkout" button

**Expected Results:**
- ✅ All cart items listed
- ✅ Complete product information
- ✅ Accurate pricing
- ✅ Order summary correct
- ✅ Professional layout

#### Test Case 6.2: Empty Cart State
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Navigate to cart with no items
2. Verify empty state message
3. Verify "Continue Shopping" button
4. Click button
5. Verify redirect to search page

**Expected Results:**
- ✅ Clear empty state message
- ✅ Shopping cart icon displayed
- ✅ CTA button present
- ✅ Redirect works

#### Test Case 6.3: Cart Persistence
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Add items to cart
2. Navigate away from cart
3. Close browser tab
4. Open new tab, login
5. Navigate to cart
6. Verify items still present

**Expected Results:**
- ✅ Cart persisted to backend
- ✅ Items retained across sessions
- ✅ Quantities correct

---

### 7. Checkout

#### Test Case 7.1: Standard Checkout Flow
**Priority:** Critical
**User Role:** Dealer

**Steps:**
1. From cart page with items
2. Click "Proceed to Checkout"
3. Verify checkout dialog opens
4. Verify cart summary displayed
5. Select dispatch method: "Standard Delivery"
6. Enter PO reference: "PO-2024-001"
7. Enter order notes: "Please deliver before 3pm"
8. Click "Place Order"
9. Verify loading state
10. Verify order confirmation dialog
11. Verify order number displayed
12. Wait for auto-redirect
13. Verify redirect to `/dealer/orders`

**Expected Results:**
- ✅ Checkout dialog opens
- ✅ All fields displayed
- ✅ Form submission works
- ✅ Loading state shown
- ✅ Order created successfully
- ✅ Order number generated
- ✅ Confirmation dialog shown
- ✅ Auto-redirect after 3 seconds
- ✅ Cart cleared

#### Test Case 7.2: Express Delivery Checkout
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Proceed to checkout
2. Select "Express Delivery"
3. Complete checkout
4. Verify order placed with express method

**Expected Results:**
- ✅ Express option selectable
- ✅ Order reflects delivery method
- ✅ Proper pricing applied

#### Test Case 7.3: Collection Checkout
**Priority:** High
**User Role:** Dealer

**Steps:**
1. Proceed to checkout
2. Select "Collection"
3. Complete checkout
4. Verify collection method saved

**Expected Results:**
- ✅ Collection option works
- ✅ Order marked for collection
- ✅ No delivery address required

#### Test Case 7.4: Checkout with Suspended Account
**Priority:** Critical
**User Role:** Dealer (Suspended)

**Steps:**
1. Use suspended dealer account
2. Add items to cart
3. Attempt checkout
4. Verify error message
5. Verify order NOT created

**Expected Results:**
- ✅ Error: "Your account is suspended"
- ✅ Clear contact support message
- ✅ Order not placed
- ✅ Cart retained

#### Test Case 7.5: Cancel Checkout
**Priority:** Medium
**User Role:** Dealer

**Steps:**
1. Proceed to checkout
2. Fill in some details
3. Click "Back to Cart"
4. Verify returned to cart
5. Verify cart unchanged
6. Re-open checkout
7. Verify form reset

**Expected Results:**
- ✅ Can cancel checkout
- ✅ Cart unaffected
- ✅ Form cleared on re-open

---

## Component Alias System Validation

### Test Case 8.1: Verify Component Imports
**Priority:** Critical
**Scope:** All Pages

**Steps:**
1. Inspect source code of migrated pages
2. Verify imports use centralized barrel exports:
   ```typescript
   import { Button, Card, Input } from '@/components';
   ```
3. Verify NO direct file imports like:
   ```typescript
   import { Button } from '@/components/ui/button'; // ❌ Old way
   ```
4. Build the application
5. Verify no import errors
6. Verify bundle size reasonable

**Expected Results:**
- ✅ All pages use barrel exports
- ✅ No import errors
- ✅ Application builds successfully
- ✅ TypeScript validation passes
- ✅ Tree-shaking works correctly

### Test Case 8.2: Component Registry Stats
**Priority:** Medium

**Steps:**
1. Run `pnpm components:stats`
2. Verify output shows:
   - Registry version
   - Category counts
   - Total components
   - Aliases
   - All component listings
3. Verify count matches actual components

**Expected Results:**
- ✅ Stats command works
- ✅ Accurate component count
- ✅ All categories listed
- ✅ Component details displayed

### Test Case 8.3: Auto-Generation
**Priority:** High

**Steps:**
1. Edit `component-registry.json`
2. Add new component entry
3. Run `pnpm components:generate`
4. Verify new index files generated
5. Verify new component importable
6. Build application
7. Verify no errors

**Expected Results:**
- ✅ Generation script runs
- ✅ Index files updated
- ✅ New component accessible
- ✅ Builds successfully

---

## Performance Tests

### Test Case 9.1: Page Load Performance
**Priority:** Medium

**Steps:**
1. Open browser DevTools
2. Navigate to search page
3. Measure Time to Interactive (TTI)
4. Verify < 3 seconds on 3G

**Expected Results:**
- ✅ Fast page loads
- ✅ No layout shift
- ✅ Responsive UI

### Test Case 9.2: Search Performance
**Priority:** Medium

**Steps:**
1. Enter search query
2. Measure time to results
3. Verify < 1 second for typical query

**Expected Results:**
- ✅ Fast search results
- ✅ No UI blocking

### Test Case 9.3: Cart Update Performance
**Priority:** Medium

**Steps:**
1. Update cart item quantity
2. Measure update time
3. Verify immediate UI feedback

**Expected Results:**
- ✅ Instant optimistic update
- ✅ Background sync
- ✅ No lag

---

## Cross-Browser Testing

Test all scenarios above in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

---

## Mobile Responsiveness

Test key flows on:
- ✅ Mobile (375px width)
- ✅ Tablet (768px width)
- ✅ Desktop (1920px width)

---

## Accessibility Tests

### Test Case 10.1: Keyboard Navigation
**Steps:**
1. Navigate entire flow using Tab key
2. Verify all interactive elements focusable
3. Verify focus indicators visible
4. Verify logical tab order

**Expected Results:**
- ✅ Complete keyboard navigation
- ✅ Clear focus states
- ✅ Logical flow

### Test Case 10.2: Screen Reader
**Steps:**
1. Enable screen reader (NVDA/JAWS)
2. Navigate search and checkout
3. Verify all content announced
4. Verify form labels clear

**Expected Results:**
- ✅ All content accessible
- ✅ Proper ARIA labels
- ✅ Form validation announced

---

## Test Data

### Sample Products
```json
[
  {
    "id": "1",
    "productCode": "ABC-123",
    "description": "Engine Oil Filter - High Performance",
    "partType": "GENUINE",
    "freeStock": 100,
    "price": 45.50
  },
  {
    "id": "2",
    "productCode": "BRK-456",
    "description": "Brake Pad Set - Front Axle",
    "partType": "AFTERMARKET",
    "freeStock": 50,
    "price": 89.99
  },
  {
    "id": "3",
    "productCode": "SPK-789",
    "description": "Spark Plug Set - 4 Pack",
    "partType": "BRANDED",
    "freeStock": 0,
    "price": 32.00
  }
]
```

### Sample Import Files

**products_genuine.csv:**
```csv
productCode,description,partType,freeStock,price,bandLevel
ABC-123,Engine Oil Filter,GENUINE,100,45.50,A
XYZ-456,Air Filter Element,GENUINE,75,28.99,B
DEF-789,Fuel Pump Assembly,GENUINE,10,425.00,A
```

**products_errors.csv:**
```csv
productCode,description,partType,freeStock,price
,Missing Code,GENUINE,50,10.00
INVALID,Valid Description,INVALID_TYPE,20,15.00
ABC-999,Negative Stock,GENUINE,-5,20.00
```

---

## Bug Reporting Template

When bugs are found, report using:

**Bug ID:** BUG-XXX
**Severity:** Critical/High/Medium/Low
**Test Case:** [Test case number]
**Steps to Reproduce:**
1. Step 1
2. Step 2

**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]
**Screenshots:** [Attach if applicable]
**Browser/Device:** [Environment details]

---

## Test Sign-Off

| Test Suite | Status | Date | Tester | Notes |
|------------|--------|------|--------|-------|
| File Upload | ⬜ | - | - | - |
| Dealer Login | ⬜ | - | - | - |
| Search Parts | ⬜ | - | - | - |
| Add to Cart | ⬜ | - | - | - |
| Update Cart | ⬜ | - | - | - |
| View Cart | ⬜ | - | - | - |
| Checkout | ⬜ | - | - | - |
| Component System | ⬜ | - | - | - |
| Performance | ⬜ | - | - | - |
| Cross-Browser | ⬜ | - | - | - |
| Mobile | ⬜ | - | - | - |
| Accessibility | ⬜ | - | - | - |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## Automation Recommendations

Consider automating with:
- **Playwright** - E2E tests
- **Cypress** - Component tests
- **Jest** - Unit tests
- **React Testing Library** - Component integration

**Sample Playwright Test:**
```typescript
test('dealer can search and add to cart', async ({ page }) => {
  await page.goto('/dealer/login');
  await page.fill('[name="email"]', 'dealer@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('/dealer/dashboard');
  await page.goto('/dealer/search');

  await page.fill('[placeholder*="Search"]', 'brake');
  await page.click('button:has-text("Search")');

  await page.waitForSelector('text=BRK-456');
  await page.click('button:has-text("Add to Cart")');

  await expect(page.locator('text=Added to cart')).toBeVisible();
});
```

---

## Conclusion

This E2E test plan covers all critical user journeys in the B2B dealer portal. Execute these tests before each release to ensure quality and reliability.

**Next Steps:**
1. Set up automated E2E testing with Playwright
2. Create CI/CD pipeline integration
3. Set up test data fixtures
4. Schedule regression testing
