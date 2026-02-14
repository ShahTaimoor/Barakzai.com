# Sale Return – Flow and Risks

This document describes the **end-to-end flow** of a sale return in the POS and the **risks** to consider (business, operational, technical, and compliance).

---

## 1. High-level flow (overview)

```
[User: Sale Returns page] → Select customer → Pick sale/invoice → Add items, reason, condition, refund method
        ↓
[Frontend] POST /api/sale-returns (originalOrder, items[], refundMethod, …)
        ↓
[Backend: saleReturns route] → auth, permission 'create_orders', validation
        ↓
[returnManagementService.createReturn]
        ├── 1) Fetch original order (sale/sales order)
        ├── 2) Check return eligibility (window, quantity)
        ├── 3) Validate items, set prices, calculate refunds
        ├── 4) Persist return (PostgreSQL returns table)
        ├── 5) Update inventory (stock_movements + inventory)
        ├── 6) Process refund (account_ledger: AR, Sales Return, Cash/Bank)
        └── 7) Notify customer (optional)
        ↓
[Response] 201 + return object → Frontend refreshes list / stats
```

---

## 2. Detailed flow (step by step)

### 2.1 Frontend (user actions)

| Step | Where | What happens |
|------|--------|----------------|
| 1 | Sale Returns page | User selects **customer** (search/dropdown). |
| 2 | Same page | Optionally searches **products sold** to that customer. |
| 3 | Same page | Chooses a **sale** (invoice) to return from, or picks products from search. |
| 4 | “Create Return” | Opens **CreateSaleReturnModal** with that sale pre-filled. |
| 5 | Modal | User adds **items** from the sale, sets **quantity**, **return reason**, **condition**, **action**, **refund method** (cash, store_credit, bank_transfer, etc.). |
| 6 | Submit | Frontend sends **POST /api/sale-returns** with `originalOrder` (sale ID), `items[]`, `refundMethod`, etc. |

**Key frontend files:** `SaleReturns.jsx`, `CreateSaleReturnModal.jsx`, `saleReturnsApi.js`.

---

### 2.2 API layer

| Step | Where | What happens |
|------|--------|----------------|
| 1 | `backend/routes/saleReturns.js` | **Auth** and **permission** `create_orders`. |
| 2 | Validation (express-validator) | `originalOrder` (UUID), `items[]` (product, originalOrderItem, quantity, returnReason, condition, action). Optional: refundMethod, priority. |
| 3 | Route handler | Sets `origin: 'sales'`, calls `returnManagementService.createReturn(returnData, userId)`. |
| 4 | Response | On success: 201 with return object. On error: 400 with message. |

---

### 2.3 Service layer – createReturn (core)

**Single DB transaction (mandatory):** All of steps 5–8 run inside one PostgreSQL transaction (BEGIN … COMMIT / ROLLBACK on error) for financial and audit integrity.

| Step | Method / area | What happens |
|------|-------------------------------|----------------|
| 1 | **fetchAndNormalizeOrder** | Loads original sale (or sales order) from DB. Normalizes items and customer. Throws if not found. |
| 2 | **checkReturnEligibility** (sale only) | Return window (e.g. 30 days from order). For each item: not already fully returned, return qty ≤ remaining qty. Returns `{ eligible, reason }`. |
| 3 | **validateReturnItems** | Each return item must exist on the order. Product must exist. **Original price** and refund/restocking from order (server-side), not trusted from client. |
| 4 | **calculateRefundAmounts** | Per item: restocking fee % by condition/reason, then `refundAmount = (originalPrice × qty) − restockingFee`. Totals: totalRefundAmount, totalRestockingFee, netRefundAmount. |
| 5 | **ReturnRepository.create** (in tx) | Persist to PostgreSQL **returns** table: return_number (e.g. RET-YYYYMMDD-NNNN), return_type `sale_return`, reference_id (original sale), customer_id, items (JSON), total_amount, status `pending`, refund_details.refundMethod, etc. |
| 6 | **updateInventoryForReturn** (in tx) | For each item: resolve productId → get/create inventory row → **logInventoryMovement**(…, client, { resellable }). |
| 7 | **logInventoryMovement** (sale return) | **Resellable:** movement_type `return_in`, newStock = currentStock + qty; update **inventory** and **inventory_balance**. **Non-resellable:** movement_type `return_quarantine`; no sellable inventory increase; update **inventory_balance**.quantity_quarantine only. |
| 8 | **processRefund** → **processSaleReturnRefund** (in tx) | Accounting entries (see 2.4). All ledger writes use the same client. |
| 9 | **ReturnRepository.update** (in tx) | Set status to `processed` and refund_details. |
| 10 | **notifyCustomer** | Optional notification (e.g. return_completed). |
| 11 | Return | Returns the created return object to the route (then to frontend). |

**Status workflow:** Create persists with status `pending`. The same transaction then runs inventory + ledger and sets status to `processed`. For deferred workflow, send `deferProcess: true` on create; then call **processReturn**(id) or **PUT /api/sale-returns/:id/process** (pending → inspected → approved → processed).

**Key service file:** `backend/services/returnManagementService.js`.

---

### 2.4 Accounting (processSaleReturnRefund)

| Step | What is posted | Purpose |
|------|----------------|--------|
| 1 | **Dr Sales Returns (revenue), Cr AR (1100)** with `customerId`, `referenceType: 'Sale Return'` | Reduces revenue and customer receivable; **shows in Account Ledger** for that customer. |
| 2 | If refund method is **cash** or **original_payment**: **Dr AR, Cr Cash** | Records cash refund out. |
| 3 | If refund method is **bank_transfer** or **check**: **Dr AR, Cr Bank** | Records bank refund out. |
| 4 | If **store_credit**: only step 1 (AR already credited). | No second entry. |
| 5 | **COGS reversal** (if cogsAdjustment > 0): **Dr Inventory, Cr COGS** | Puts cost of returned goods back to inventory and reverses COGS. |

All entries use **referenceType `'Sale Return'`** and **reference_id** = return id so they can be traced and shown in reports.

---

### 2.5 Data written (summary)

| System | Table / store | What is written |
|--------|----------------|------------------|
| PostgreSQL | **returns** | One row per return (return_number, customer_id, reference_id, items, total_amount, status, etc.). |
| PostgreSQL | **stock_movements** | One row per returned item (movement_type `return`, reference_type `Return`, reference_id = return id, qty, costs, user_id, user_name). |
| PostgreSQL | **inventory** | `current_stock` and `available_stock` increased by returned qty per product. |
| PostgreSQL | **account_ledger** | Multiple rows: Sales Return Dr, AR (1100) Cr (and Cash/Bank Cr for refund); COGS reversal if applicable. All with reference_type and reference_id for the return. |

---

## 3. Risks

### 3.1 Business and fraud risks

| Risk | Description | Mitigation in place / recommendation |
|------|-------------|--------------------------------------|
| **Return window abuse** | Returns long after sale. | Eligibility check: return window (e.g. 30 days). Make window configurable or per product/category if needed. |
| **Over-return** | Returning more than was bought (or more than remaining after prior returns). | Server validates: return qty ≤ (order qty − already returned qty). |
| **Wrong or fake invoice** | Return tied to wrong or non-existent sale. | Original order loaded and validated server-side; return linked by `reference_id`. |
| **Price manipulation** | Refund based on inflated price. | **Original price taken from order only** in `validateReturnItems`; client price not trusted for refund calculation. |
| **Fake or duplicate returns** | Same goods returned multiple times or without physical return. | Return qty capped per order line; optional inspection/resellable flag to control inventory (e.g. don’t add stock if not resellable). Consider approval workflow or manager sign-off for large returns. |

### 3.2 Operational and process risks

| Risk | Description | Mitigation in place / recommendation |
|------|-------------|--------------------------------------|
| **No approval step** | Return is completed immediately; no review for large or high-value returns. | **Workflow:** status `pending` → `inspected` (optional) → `approved` → `processed`. Create with `deferProcess: true` to leave return `pending`; then use **PUT /api/sale-returns/:id/process** (or processReturn) after inspection/approval. Default create still runs inventory + ledger in one transaction and sets `processed`.  “process” |
| **Refund method vs actual payment** | Refund method (cash/bank/store credit) may not match how refund was actually given. | Ensure staff select correct refund method; consider reconciliation or audit of refund method vs bank/cash. |
| **Restocking fee disputes** | Customer disagrees with restocking fee. | Restocking % is configurable via policy; condition and reason affect fee. Document policy and show fee clearly before submit. |
| **No physical receipt of goods** | Inventory is increased even if goods are not received or not resellable. | **Resellable logic:** `resellable: true` (default) → movement_type `return_in`, inventory and inventory_balance increased. `resellable: false` → movement_type `return_quarantine`, no sellable inventory increase; quantity in inventory_balance.quantity_quarantine. |

### 3.3 Technical and data-integrity risks

| Risk | Description | Mitigation in place / recommendation |
|------|-------------|--------------------------------------|
| **Partial failure** | Return is saved but inventory or accounting fails. | **Mitigation:** createReturn (and processReturn) run in a **single DB transaction**: create return, stock_movements, inventory, inventory_balance, and account_ledger with the same client; COMMIT only when all succeed, ROLLBACK on any error. |
| **Inventory out of sync** | Stock movement or inventory update fails (e.g. constraint, timeout). | Same transaction ensures atomicity. **Recommendation:** Monitor errors; run periodic inventory vs inventory_balance reconciliation if needed. |
| **Ledger out of sync** | Accounting entries fail after return and inventory are written. | Ledger is written inside the same transaction (client passed to AccountingService.createTransaction). |
| **user_name / product_id null** | Stock_movements or ledger require non-null fields. | user_name fallback in StockMovementRepository; productId normalized and validated before movement. |
| **Double processing** | Same return processed twice (e.g. retry or duplicate request). | Return is created once with unique return_number. processReturn only allows status pending/inspected/approved. **Recommendation:** Consider idempotency key for duplicate submits. |

### 3.4 Inventory risks

| Risk | Description | Mitigation in place / recommendation |
|------|-------------|--------------------------------------|
| **Stock inflated** | Return adds stock even when goods are not received or not resellable. | **Resellable:** only `return_in` (resellable) increases inventory; `return_quarantine` (resellable: false) does not increase sellable stock; quarantine qty in inventory_balance. |
| **Wrong product or quantity** | Movement for wrong product or qty. | productId and qty come from validated return items tied to original order. |
| **Negative or incorrect stock** | Bugs or partial updates lead to wrong current_stock. | Single transaction; return_in only increases stock. **inventory_balance** table updated every transaction for fast POS and consistency. **Recommendation:** Reconcile inventory vs inventory_balance periodically. |

### 3.5 Accounting and reporting risks

| Risk | Description | Mitigation in place / recommendation |
|------|-------------|--------------------------------------|
| **Sale return not visible in ledger** | Customer AR or report doesn’t show return. | Entries are posted to AR (1100) with `customerId` and `referenceType: 'Sale Return'`; Account Ledger Summary includes these. Ensure filters (e.g. date, customer) and referenceType handling are correct. |
| **Wrong account codes** | Sales Return or AR account misconfigured. | Account codes from AccountingService (e.g. chart of accounts). **Recommendation:** Validate default account codes (Sales Returns, 1100, Cash, Bank) in config/setup. |
| **COGS mismatch** | COGS reversal doesn’t match original sale COGS. | COGS adjustment is calculated from original order item costs. **Recommendation:** Reconcile COGS and inventory with sales/returns reports. |

### 3.6 Compliance and audit risks

| Risk | Description | Mitigation in place / recommendation |
|------|-------------|--------------------------------------|
| **No audit trail** | Who did what and when is not clear. | return has `createdBy`; stock_movements have `user_id`/`user_name`; ledger has created_at. **Recommendation:** Log key events (return created, refund method, amount) and retain for audit. |
| **Data retention** | How long to keep returns and movements. | No automatic purge in the described flow. **Recommendation:** Define retention policy and archive/purge old data accordingly. |

---

## 4. Flow diagram (simplified)

```
User                    Frontend                  API                     Service                     DB
  |                        |                       |                         |                         |
  |-- Select customer ---->|                       |                         |                         |
  |-- Select sale -------->|                       |                         |                         |
  |-- Add items, submit -->| POST /sale-returns   |                         |                         |
  |                        |---------------------->| auth, validate          |                         |
  |                        |                       |------------------------>| createReturn            |
  |                        |                       |                         |  fetchOrder             |
  |                        |                       |                         |  eligibility            |
  |                        |                       |                         |  validateItems          |
  |                        |                       |                         |  calculateRefund        |
  |                        |                       |                         |  ReturnRepository.create|----> returns
  |                        |                       |                         |  updateInventoryForReturn
  |                        |                       |                         |    logInventoryMovement |----> stock_movements
  |                        |                       |                         |    InventoryRepository  |----> inventory
  |                        |                       |                         |  processRefund          |
  |                        |                       |                         |    createDoubleEntry    |----> account_ledger
  |                        |                       |                         |  notifyCustomer        |
  |                        |                       |<------------------------| return object           |
  |                        |<----------------------| 201                     |                         |
  |<-- Success, refresh ---|                       |                         |                         |
```

---

## 5. Quick reference – key files

| Layer | File | Responsibility |
|-------|------|----------------|
| Frontend | `frontend/src/pages/SaleReturns.jsx` | Page: customer selection, list, create modal trigger. |
| Frontend | `frontend/src/components/CreateSaleReturnModal.jsx` | Modal: items, reason, condition, refund method, submit. |
| Frontend | `frontend/src/store/services/saleReturnsApi.js` | API client: getSaleReturns, createSaleReturn, getSaleReturn, etc. |
| Backend | `backend/routes/saleReturns.js` | POST/GET sale returns, validation, call service. |
| Backend | `backend/services/returnManagementService.js` | createReturn, eligibility, validate, refund calc, inventory, accounting. |
| Backend | `backend/repositories/postgres/ReturnRepository.js` | Persist returns. |
| Backend | `backend/repositories/postgres/StockMovementRepository.js` | Persist stock movements (return_in, return_quarantine, return_out). |
| Backend | `backend/repositories/postgres/InventoryBalanceRepository.js` | inventory_balance upsert per transaction (fast POS). |
| Backend | `backend/services/accountingService.js` | createTransaction → account_ledger (accepts client for same-transaction posting). |

---

*Last updated to reflect current sale return flow and risk list. Adjust mitigations and policies to match your business and compliance requirements.*
