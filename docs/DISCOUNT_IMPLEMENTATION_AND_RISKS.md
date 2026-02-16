# Discount Implementation & Risk Summary

## How discounts are implemented

### 1. **Backend (discountService.js)**

- **Create/update discounts**  
  `createDiscount`, `updateDiscount` — validated, stored in Postgres via `DiscountRepository` (table `discounts`: code, type, value, valid_from, valid_until, usage_limit, usage_limit_per_customer, applicable_to, etc.).

- **Apply discount to an order**  
  `applyDiscountToOrder(orderId, discountCode, customerId?)`:
  1. Loads order (SalesRepository) and discount by code (DiscountRepository).
  2. Enforces **total usage limit** (if set): rejects when `current_usage >= usage_limit`.
  3. Enforces **per-customer usage limit** (if set): counts uses from `analytics.usageHistory` by `customerId`; rejects if count >= limit.
  4. Checks **applicability**: `isApplicableToOrder(discount, order, customer)` — valid dates, minimum order amount.
  5. Prevents duplicate apply (discount not already in `applied_discounts`).
  6. Respects **combinable** flag when other discounts are already applied.
  7. Computes amount via `calculateDiscountAmount(discount, orderTotal)` (percentage with optional cap, or fixed amount).
  8. Updates sale: `total`, `discount`, `applied_discounts`.
  9. Increments discount `current_usage` and appends to `analytics.usageHistory` (with `orderId`, `customerId`, amount, etc.).

- **Remove discount**  
  `removeDiscountFromOrder(orderId, discountCode)` — removes one applied discount from the order and restores total (does not decrement discount usage count).

- **Applicable discounts for an order**  
  `getApplicableDiscounts(orderData, customerData?)` — returns active discounts that pass:
  - validity window (valid_from / valid_until),
  - minimum order amount,
  - **total usage limit** (not exhausted),
  - **per-customer usage limit** (for the given customer when present).

### 2. **API routes (discounts.js)**

- `POST /api/discounts` — create discount.
- `PUT /api/discounts/:id` — update discount.
- `GET /api/discounts` — list with filters (type, status, search, etc.).
- `POST /api/discounts/apply` — body: `orderId`, `discountCode`, optional `customerId` → applies discount to that order.
- `POST /api/discounts/remove` — remove discount from order.
- `POST /api/discounts/check-applicable` — body: `orderData` (e.g. `{ total }`), optional `customerData` → returns applicable discounts and calculated amounts.

### 3. **Frontend**

- **Discount management**  
  `Discounts.jsx` — list, filters, create modal, detail modal, toggle active, delete. Uses normalized discount (status, validFrom, applicableTo) for Postgres snake_case.

- **Applying discount at sale/checkout**  
  `DiscountSelector.jsx` — calls `checkApplicableDiscounts` with `orderData`/`customerData`; user enters code and calls `onApplyDiscount(code)`. Used from Sales/SalesOrders flows that call the apply/remove API.

- **Create discount**  
  `CreateDiscountModal.jsx` — form with basic info, applicability, conditions, usage limits; validation (non-negative usage limit, non-negative max discount, etc.) and backend error handling.

---

## Risks that were identified and fixed

### 1. **Usage limit not enforced (fixed)**

- **Risk:** Total usage limit (`usage_limit`) was never checked before applying; a discount could be applied after it was “exhausted.”
- **Fix:** In `applyDiscountToOrder`, before applying, we now check `usage_limit` and reject with “Discount usage limit reached” when `current_usage >= usage_limit`.

### 2. **Per-customer usage limit not enforced (fixed)**

- **Risk:** Per-customer limit (`usage_limit_per_customer`) was not checked; one customer could use a “once per customer” (or N times) discount repeatedly.
- **Fix:** Before applying, we count this customer’s uses from `analytics.usageHistory` (by `customerId`). If count >= `usage_limit_per_customer`, we reject with “You have reached the maximum uses of this discount.” Usage is recorded with the order’s customer (`order.customer_id` / `order.customer` or passed-in `customerId`) for consistent counting.

### 3. **Applicable list could show exhausted discounts (fixed)**

- **Risk:** `getApplicableDiscounts` did not filter by usage limits, so exhausted or over-per-customer discounts could still be suggested.
- **Fix:** We now exclude discounts that have reached total usage limit or (when customer is known) per-customer limit, so the list only returns discounts that can still be applied.

### 4. **Other risks / limitations (for awareness)**

- **Applicable to products/categories/customers**  
  `isApplicableToOrder` currently only checks dates and minimum order amount. It does **not** yet enforce `applicable_to` (e.g. product/category/customer allowlists). Adding that would require order line items and customer id and matching to `applicable_products`, `applicable_categories`, `applicable_customers` in the discount.

- **Remove discount does not decrement usage**  
  Removing a discount from an order does not decrement `current_usage` or remove the entry from `usageHistory`. So “usage” is “number of times applied,” not “number of orders that currently have it.” This is a design choice; if you need reversible usage counts, that would require a separate change.

- **Numeric empty string**  
  Previously, sending empty strings for numeric fields (e.g. `maximum_discount`, `usage_limit`) could cause Postgres “invalid input syntax for type numeric.” This is handled in `DiscountRepository` by coercing optional numerics to `null` and defaults (e.g. 0) where appropriate.

---

## Quick reference: where things live

| What | Where |
|------|--------|
| Apply / remove / applicable logic | `backend/services/discountService.js` |
| Discount CRUD + apply/remove/check-applicable routes | `backend/routes/discounts.js` |
| Discount Postgres table & repo | `backend/repositories/postgres/DiscountRepository.js` |
| Sales (order) updates for applied discount | `backend/repositories/postgres/SalesRepository.js` (total, discount, applied_discounts) |
| Discount UI (list, create, detail) | `frontend/src/pages/Discounts.jsx`, `CreateDiscountModal.jsx`, `DiscountDetailModal.jsx` |
| Apply discount in checkout/sale | `frontend/src/components/DiscountSelector.jsx` + Sales/SalesOrders pages |
| Customer churn / risk (separate from discounts) | `backend/services/customerAnalyticsService.js`, `backend/routes/customerAnalytics.js`, `frontend/src/pages/CustomerAnalytics.jsx` |
