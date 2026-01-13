# Customer Flow Documentation

## Overview
This document describes the complete flow of customers through the POS system, from creation to deletion, including all operations, balance management, and integrations.

---

## 1. Customer Creation Flow

### 1.1 Manual Creation
```
User Request → Route Handler → Service Layer → Repository → Database + Ledger Account
```

**Steps:**
1. **Route**: `POST /api/customers`
   - Authentication & Authorization (`create_customers` permission)
   - Request validation (name, businessName, email, phone)
   - Duplicate prevention middleware (10-second window)
   - Sanitization

2. **Service Layer** (`customerService.createCustomer()`):
   - Validates uniqueness:
     - Email (if provided, sparse unique)
     - Phone (if provided, sparse unique)
     - Business name (required, unique)
   - Handles opening balance:
     - Positive: Sets `pendingBalance` (customer owes us)
     - Negative: Sets `advanceBalance` (we owe customer)
     - Calculates `currentBalance = pendingBalance - advanceBalance`
   - Uses MongoDB transactions with retry logic for WriteConflict errors
   - Creates ledger account via `ledgerAccountService.syncCustomerLedgerAccount()`
   - Adds user tracking (`createdBy`, `lastModifiedBy`)

3. **Ledger Account Integration**:
   - Automatically creates/finds chart of accounts entry
   - Links customer to ledger account
   - Ensures accounting consistency

4. **Response**: Returns created customer with success message

### 1.2 Bulk Import (CSV/Excel)
```
File Upload → Parse → Validate Each Row → Create Customers → Return Results
```

**Steps:**
1. **Route**: `POST /api/customers/import/csv` or `/import/excel`
   - File upload validation (CSV/Excel, max 10MB)
   - Parse file content

2. **Processing**:
   - For each row:
     - Validate required fields (name, businessName)
     - Check if customer already exists (email, phone, businessName)
     - Create customer using same flow as manual creation
   - Track successes and errors per row

3. **Response**: Summary with total, success count, and error details

---

## 2. Customer Retrieval Flow

### 2.1 Get All Customers (with Filtering & Pagination)
```
Query Parameters → Build Filter → Repository Query → Transform → Response
```

**Route**: `GET /api/customers`

**Filtering Options:**
- **Search**: Multi-field search (name, email, businessName, phone)
- **Business Type**: retail, wholesale, distributor, individual
- **Status**: active, inactive, suspended
- **Customer Tier**: bronze, silver, gold, platinum
- **Email Status**: verified, unverified, no-email
- **Phone Status**: verified, unverified, no-phone

**Pagination:**
- Default: 20 per page
- Can fetch all with `all=true` or high limit

**Response Transformation:**
- Customer names converted to UPPERCASE
- Includes balance information

### 2.2 Get Single Customer
**Route**: `GET /api/customers/:id`
- Fetches by ID
- Populates ledger account
- Returns 404 if not found

### 2.3 Search Customers
**Route**: `GET /api/customers/search/:query`
- Quick search by name, email, businessName, phone
- Returns up to 10 customers
- Includes balance and tier information

### 2.4 Get Customers by Cities
**Route**: `GET /api/customers/by-cities`
- Filters customers by city addresses
- Optional: exclude zero balance customers
- Returns formatted customer list with city and balance

---

## 3. Customer Update Flow

### 3.1 Single Customer Update (with Optimistic Locking)
```
Request → Validation → Version Check → Uniqueness Check → Atomic Update → Audit Log → Response
```

**Route**: `PUT /api/customers/:id`

**Process:**
1. Validates update data
2. **Optimistic Locking Check**: Validates `version` field to prevent concurrent modifications
3. Checks uniqueness (email, phone, businessName) excluding current customer
4. Handles opening balance updates if provided
5. **Atomic Update**: Uses `findOneAndUpdate` with version check for concurrency control
6. Syncs ledger account if needed
7. Updates `lastModifiedBy` with current user
8. **Audit Logging**: Logs all field changes with before/after values
9. Uses transactions with retry logic for WriteConflict errors
10. Returns updated customer

**Optimistic Locking:**
- Customer model includes `version` field (Mongoose `__v`)
- Update requests should include current `version` in request body
- If version mismatch: Returns error "Customer was modified by another user"
- Prevents lost updates in concurrent scenarios

**Concurrent Update Handling:**
- Retry mechanism for WriteConflict errors (up to 5 retries)
- Returns 409 Conflict if retries fail
- Version-based optimistic locking prevents race conditions

### 3.2 Update Credit Limit
**Route**: `PUT /api/customers/:id/credit-limit`
- Updates customer credit limit
- Validates credit limit is non-negative
- Updates `lastModifiedBy`

---

## 4. Customer Deletion Flow

### 4.1 Soft Delete (Enterprise-Grade)
```
Request → Validation → Soft Delete → Deactivate Ledger → Audit Log → Response
```

**Route**: `DELETE /api/customers/:id`

**Process:**
1. Validates customer can be deleted:
   - Checks for outstanding balances (must be zero)
   - Checks for pending orders (must be completed/cancelled)
2. Performs soft delete:
   - Sets `isDeleted = true`
   - Sets `deletedAt = current timestamp`
   - Sets `deletedBy = current user`
   - Sets `deletionReason` (from request body)
   - Sets `status = 'inactive'`
3. Deactivates associated ledger account
4. Logs audit trail (who, when, why)
5. Uses transactions for consistency

**Restore Customer:**
- **Route**: `POST /api/customers/:id/restore`
- Restores soft-deleted customer
- Reactivates ledger account
- Sets `status = 'active'`

**Get Deleted Customers:**
- **Route**: `GET /api/customers/deleted`
- Returns all soft-deleted customers
- Includes deletion reason and timestamp

---

## 5. Customer Balance Management Flow (Transaction Sub-Ledger)

### 5.1 Balance Structure
Customers have multiple balance fields:
- **openingBalance**: Initial balance when customer is created
- **pendingBalance**: Amount customer owes (receivables)
- **advanceBalance**: Amount we owe customer (prepayments/credits)
- **currentBalance**: Net balance (`pendingBalance - advanceBalance`)

### 5.2 Customer Transaction Sub-Ledger
**NEW**: All balance changes are now tracked in `CustomerTransaction` model (transaction sub-ledger)

**Transaction Types:**
- `invoice`: Sales invoice (increases pendingBalance)
- `payment`: Customer payment (reduces pendingBalance, may create advanceBalance)
- `refund`: Refund to customer (reduces pendingBalance)
- `credit_note`: Credit note issued
- `debit_note`: Debit note issued
- `adjustment`: Manual balance adjustment
- `write_off`: Bad debt write-off
- `reversal`: Reversal of previous transaction
- `opening_balance`: Opening balance entry

**Transaction Features:**
- **Balance Snapshots**: Stores `balanceBefore` and `balanceAfter` for each transaction
- **Aging Calculation**: Automatic aging bucket assignment (current, 1-30, 31-60, 61-90, 90+)
- **Overdue Tracking**: Automatic `isOverdue` and `daysOverdue` calculation
- **Line Items**: Detailed line items for invoices
- **Payment Details**: Payment method, reference, date
- **Accounting Entries**: Linked accounting journal entries
- **Reversal Support**: Can reverse any transaction with audit trail

### 5.3 Balance Update on Sales (Transaction-Based)
```
Sale Created → Create Invoice Transaction → Update Customer Balance → Create Accounting Entries
```

**Flow:**
1. When sales order is created:
   - Creates `CustomerTransaction` with type `invoice`
   - Captures balance snapshots (before/after)
   - Links to sales order via `referenceId`
   - Includes line items from order
   - Calculates due date based on payment terms
   - Updates customer balance atomically with version check

2. Payment Processing:
   - Creates `CustomerTransaction` with type `payment`
   - Uses `customerTransactionService.applyPayment()` for invoice-specific payments
   - Reduces `pendingBalance` first
   - If payment exceeds pending, adds excess to `advanceBalance`
   - Updates `currentBalance` automatically
   - Creates `PaymentApplication` record linking payment to invoices

**Example:**
```
Customer has pendingBalance: $100
Payment received: $150
Result:
  - CustomerTransaction created (type: payment, amount: $150)
  - pendingBalance: $0 (reduced by $100)
  - advanceBalance: $50 (excess payment)
  - currentBalance: -$50 (we owe customer)
  - PaymentApplication created (applies $100 to invoice, $50 unapplied)
```

### 5.4 Payment Application Logic
**Route**: `POST /api/customers/:id/apply-payment`

**Process:**
1. Creates payment transaction
2. Applies payment to specific invoices (via `applications` array)
3. Tracks which invoices are paid and amounts
4. Handles unapplied amounts (goes to advanceBalance)
5. Updates invoice `paidAmount` and `remainingAmount`
6. Creates `PaymentApplication` record

### 5.5 Balance Recalculation (Transaction-Based)
**Route**: `POST /api/customer-balances/:customerId/recalculate`

**Process:**
1. Queries all `CustomerTransaction` records for customer
2. Sums transactions by type to calculate balances
3. Compares calculated balance vs. customer balance field
4. Detects discrepancies and alerts
5. Updates customer balance fields if needed
6. Returns reconciliation report

### 5.6 Atomic Balance Updates
- All balance updates use optimistic locking (version check)
- Prevents concurrent modification conflicts
- Uses MongoDB transactions for consistency
- Balance changes are always recorded in transaction sub-ledger first

---

## 6. Customer Integration Flows

### 6.1 Sales Integration (Transaction-Based)
```
Sale Created → Customer Validation → Credit Check → Create Invoice Transaction → Update Balance
```

**Flow:**
1. Sales order references customer
2. Before sale:
   - Validates customer exists and is active (not soft-deleted)
   - Checks credit limit if payment terms not 'cash'
   - Uses `customer.canMakePurchase(amount)` method
   - Validates customer version for optimistic locking
3. During sale:
   - Applies customer discount (tier-based or custom)
   - Calculates price based on customer type (retail/wholesale/distributor)
4. After sale:
   - Creates `CustomerTransaction` invoice record
   - Updates customer balance atomically
   - Creates accounting entries
   - Links transaction to sales order

**Credit Limit Check:**
```javascript
if (customer.paymentTerms !== 'cash') {
  const newBalance = customer.currentBalance + orderTotal;
  if (newBalance > customer.creditLimit) {
    throw new Error('Credit limit exceeded');
  }
}
```

### 6.2 Payment Integration (Transaction-Based)
```
Payment Received → Create Payment Transaction → Apply to Invoices → Update Balances → Update Order Status
```

**Flow:**
1. Payment recorded via `customerTransactionService.createTransaction()` or `applyPayment()`
2. Creates `CustomerTransaction` with type `payment`
3. Creates `PaymentApplication` linking payment to specific invoices
4. Balances updated atomically with version check
5. Order payment status updated
6. Accounting entries created

### 6.3 Transaction History & Reporting
**Routes:**
- `GET /api/customers/:id/transactions` - Get customer transaction history
- `GET /api/customers/:id/overdue` - Get overdue invoices
- `GET /api/customers/:id/aging` - Get aging report
- `GET /api/customers/:id/audit-logs` - Get audit trail

**Features:**
- Filter by transaction type, status, date range
- Includes line items, payment details
- Aging buckets and overdue tracking
- Complete audit trail

### 6.4 Ledger Account Integration
```
Customer Created/Updated → Sync Ledger Account → Link Customer
```

**Flow:**
1. Every customer has associated ledger account
2. Created automatically via `ledgerAccountService.syncCustomerLedgerAccount()`
3. Account code follows pattern (e.g., Accounts Receivable)
4. All customer transactions reflected in ledger
5. Accounting entries created for each transaction type

---

## 7. Customer Export/Import Flow

### 7.1 Export to CSV
**Route**: `POST /api/customers/export/csv`
- Applies filters if provided
- Generates CSV with all customer fields
- Returns download URL

### 7.2 Export to Excel
**Route**: `POST /api/customers/export/excel`
- Applies filters if provided
- Generates Excel file with formatted columns
- Returns download URL

### 7.3 Download Template
**Route**: `GET /api/customers/template/csv`
- Downloads CSV template with sample data
- Shows required field format

---

## 8. Customer Address Management

### 8.1 Add Address
**Route**: `POST /api/customers/:id/addresses`

**Flow:**
1. Validates address data
2. If set as default, unsets other defaults of same type
3. Adds address to customer's addresses array
4. Supports multiple addresses per customer
5. Address types: billing, shipping, both

### 8.2 Get Default Address
- Uses `customer.getDefaultAddress(type)` method
- Returns default address for billing/shipping/both

---

## 9. Customer Data Model

### Core Fields:
- **Basic**: name, email, phone
- **Business**: businessName (required, unique), businessType, taxId
- **Addresses**: Array of address objects (billing/shipping/both)
- **Classification**: customerTier (bronze/silver/gold/platinum)
- **Credit**: creditLimit, paymentTerms, discountPercent
- **Credit Policy**: gracePeriodDays, autoSuspendDays, warningThresholds
- **Balances**: openingBalance, currentBalance, pendingBalance, advanceBalance
- **Preferences**: defaultPaymentMethod, receiveEmails, receiveSms
- **Status**: active, inactive, suspended
- **Soft Delete**: isDeleted, deletedAt, deletedBy, deletionReason
- **Anonymization**: isAnonymized, anonymizedAt (for GDPR)
- **Optimistic Locking**: version (__v) for concurrency control
- **Relations**: ledgerAccount (ChartOfAccounts)
- **Metadata**: createdBy, lastModifiedBy, timestamps

### Indexes:
- Unique indexes on: businessName, email (sparse), phone (sparse)
- Business type and status
- Customer tier and status
- Current balance (for sorting)
- Status and creation date
- Soft delete: isDeleted, status
- Anonymization: isAnonymized

### Virtuals:
- `displayName`: Returns businessName or name
- `outstandingBalance`: Alias for pendingBalance

### Methods:
- `getDefaultAddress(type)`: Get default address by type
- `canMakePurchase(amount)`: Check if customer can make purchase
- `getEffectiveDiscount()`: Get discount including tier-based discounts

---

## 10. Customer Lifecycle States

```
[Created] → [Active] → [Inactive] / [Suspended]
                ↓
        [Soft Deleted] → [Restored] / [Anonymized]
```

**Status Values:**
- **active**: Customer can make purchases
- **inactive**: Customer exists but cannot make purchases
- **suspended**: Customer temporarily suspended (e.g., credit issues, overdue)

**Status Transitions:**
- Active → Inactive: Manual deactivation
- Active → Suspended: Credit limit exceeded, payment issues, auto-suspension (overdue)
- Any → Soft Deleted: Soft delete (preserves data, sets isDeleted=true)
- Soft Deleted → Restored: Restore operation
- Soft Deleted → Anonymized: GDPR compliance (removes PII)

**Auto-Suspension:**
- Based on credit policy (`autoSuspendDays`)
- Automatically suspends customers with overdue invoices exceeding threshold
- Configurable grace period before suspension
- Warning notifications before suspension

---

## 11. Customer Tier System

### Tier Levels:
- **Bronze**: Default tier, no automatic discount
- **Silver**: 5% minimum discount
- **Gold**: 10% minimum discount
- **Platinum**: 15% minimum discount

### Discount Calculation:
```javascript
let discount = customer.discountPercent;
// Apply tier-based minimum
switch(customer.customerTier) {
  case 'silver': discount = Math.max(discount, 5); break;
  case 'gold': discount = Math.max(discount, 10); break;
  case 'platinum': discount = Math.max(discount, 15); break;
}
```

---

## 12. Key Service Methods

### CustomerService Methods:
1. `createCustomer()` - Create with validation, ledger sync, and audit logging
2. `updateCustomer()` - Update with optimistic locking, uniqueness checks, ledger sync, and audit logging
3. `deleteCustomer()` - Soft delete with validation, ledger deactivation, and audit logging
4. `restoreCustomer()` - Restore soft-deleted customer
5. `getDeletedCustomers()` - Get all soft-deleted customers
6. `getCustomers()` - List with filtering/pagination (excludes soft-deleted by default)
7. `getCustomerById()` - Get single customer
8. `searchCustomers()` - Quick search
9. `checkEmailExists()` - Check email uniqueness
10. `checkBusinessNameExists()` - Check business name uniqueness
11. `updateCustomerBalance()` - Manual balance update (with transaction sub-ledger)
12. `getCustomersForExport()` - Export data preparation
13. `addCustomerAddress()` - Add address to customer
14. `updateCustomerCreditLimit()` - Update credit limit (with audit logging)
15. `getCustomerByIdWithLedger()` - Get with populated ledger account

### CustomerTransactionService Methods:
1. `createTransaction()` - Create transaction with balance snapshots and accounting entries
2. `applyPayment()` - Apply payment to specific invoices with PaymentApplication
3. `reverseTransaction()` - Reverse a transaction with audit trail
4. `getCustomerTransactions()` - Get transaction history with filtering
5. `getOverdueInvoices()` - Get overdue invoices for customer
6. `getCustomerAging()` - Get aging report (current, 1-30, 31-60, 61-90, 90+)
7. `updateCustomerBalance()` - Atomic balance update with version check
8. `calculateNewBalances()` - Calculate balance impact of transaction
9. `createAccountingEntries()` - Create accounting journal entries

### CustomerBalanceService Methods:
1. `recordPayment()` - Record payment with transaction sub-ledger
2. `recordInvoice()` - Record invoice with transaction sub-ledger
3. `recalculateBalance()` - Recalculate from CustomerTransaction records
4. `getBalanceSummary()` - Get balance summary

### CustomerAuditLogService Methods:
1. `logCustomerCreation()` - Log customer creation
2. `logCustomerUpdate()` - Log customer updates with field-level changes
3. `logCustomerDeletion()` - Log customer deletion
4. `logBalanceAdjustment()` - Log balance adjustments
5. `logCreditLimitChange()` - Log credit limit changes
6. `logCustomerSuspension()` - Log customer suspensions
7. `getCustomerAuditLogs()` - Get audit log history

### CustomerCreditPolicyService Methods:
1. `checkAndSuspendOverdueCustomers()` - Auto-suspend overdue customers
2. `getCustomersWithOverdueInvoices()` - Get all customers with overdue invoices
3. `checkGracePeriod()` - Check if customer is in grace period
4. `sendOverdueWarnings()` - Send overdue warnings based on policy
5. `calculateCreditScore()` - Calculate customer credit score

---

## 13. Error Handling

### Common Errors:
- **Duplicate Email**: Email already exists
- **Duplicate Phone**: Phone number already exists
- **Duplicate Business Name**: Business name already exists
- **Customer Not Found**: Invalid customer ID
- **Credit Limit Exceeded**: Purchase exceeds credit limit
- **Write Conflict**: Concurrent update conflict (retries automatically)
- **Validation Error**: Invalid input data

### Error Response Format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "field": "fieldName",
    "code": "ERROR_CODE",
    "retryable": true/false
  }
}
```

---

## 14. Data Flow Diagram

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Routes     │ (Validation, Auth, Permissions, Duplicate Prevention)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service    │ (Business Logic, Validation, Transaction Management)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │ (Database Queries)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   MongoDB    │ (Customer Collection)
└─────────────┘
       │
       ▼
┌─────────────┐
│   Ledger     │ (Chart of Accounts - Accounting Integration)
└─────────────┘
```

---

## 15. Integration Points

### Customers interact with:
1. **Sales**: Customer selection, pricing, balance updates
2. **Payments**: Payment recording, balance updates
3. **Ledger Accounts**: Automatic account creation and linking
4. **Accounting**: All transactions reflected in accounting system
5. **Products**: Customer-specific pricing (retail/wholesale/distributor)
6. **Users**: Created by, modified by tracking

---

## 16. Balance Calculation Logic

### Opening Balance:
- **Positive**: Customer owes us → `pendingBalance = openingBalance`
- **Negative**: We owe customer → `advanceBalance = |openingBalance|`

### Current Balance:
```
currentBalance = pendingBalance - advanceBalance
```
- **Positive**: Customer owes us money
- **Negative**: We owe customer money (credit/advance)

### Payment Processing:
1. Payment reduces `pendingBalance` first
2. If payment > pendingBalance, excess goes to `advanceBalance`
3. `currentBalance` recalculated automatically

### Invoice Processing:
1. Invoice amount added to `pendingBalance`
2. `currentBalance` increases (customer owes more)

---

## 17. Credit Limit Management

### Credit Check:
```javascript
customer.canMakePurchase(amount) {
  if (status !== 'active') return false;
  if (paymentTerms === 'cash') return true;
  return (currentBalance + amount) <= creditLimit;
}
```

### Credit Limit Update:
- Can be updated via `PUT /api/customers/:id/credit-limit`
- Requires `edit_customers` permission
- Updates `lastModifiedBy`

---

## 18. Customer Analytics

### Available Analytics:
- Customer balance summary
- Purchase history
- Payment patterns
- Credit utilization
- Tier distribution
- Geographic distribution (by city)

### Analytics Endpoints:
- `GET /api/customer-analytics/:customerId` - Customer analytics
- `GET /api/customer-analytics/summary` - Overall customer analytics

---

## 13. Credit Policy & Risk Management

### 13.1 Credit Policy Configuration
Each customer can have custom credit policy:
- **gracePeriodDays**: Days after due date before action
- **autoSuspendDays**: Days overdue before auto-suspension
- **warningThresholds**: Array of warning actions at different overdue periods

### 13.2 Auto-Suspension
**Route**: `POST /api/customers/credit-policy/check-suspensions`

**Process:**
1. Checks all active customers
2. Finds overdue invoices
3. Calculates maximum days overdue
4. Auto-suspends if exceeds `autoSuspendDays`
5. Sends warnings if approaching suspension threshold
6. Logs suspension with audit trail

### 13.3 Credit Scoring
**Route**: `GET /api/customers/:id/credit-score`

**Calculates:**
- Payment rate (total paid / total invoiced)
- Average days overdue
- Number of overdue invoices
- Overall credit score (0-100)
- Risk level (low, medium, high, very_high)

### 13.4 Overdue Management
**Routes:**
- `GET /api/customers/credit-policy/overdue` - Get all customers with overdue invoices
- `GET /api/customers/:id/overdue` - Get overdue invoices for specific customer
- `GET /api/customers/:id/aging` - Get aging report

**Features:**
- Aging buckets: current, 1-30, 31-60, 61-90, 90+ days
- Overdue tracking with days overdue
- Configurable grace periods
- Warning notifications

## 19. Balance Reconciliation & Drift Detection

### 19.1 Automated Reconciliation
**Service**: `reconciliationService.js`

**Features:**
- ✅ Reconciles customer balances from CustomerTransaction sub-ledger
- ✅ Detects discrepancies between calculated and stored balances
- ✅ Automated daily reconciliation (2 AM)
- ✅ Weekly reconciliation with auto-correction (Sundays 3 AM)
- ✅ Discrepancy logging and alerting
- ✅ Manual reconciliation endpoints

**Reconciliation Process:**
1. Queries all CustomerTransaction records for customer
2. Calculates balances from transaction history
3. Compares with stored customer balance fields
4. Detects discrepancies (threshold: 0.01)
5. Logs discrepancies in audit trail
6. Alerts administrators (TODO: implement notifications)
7. Auto-corrects if enabled (weekly job)

**API Endpoints:**
- `POST /api/reconciliation/customers/:customerId` - Reconcile single customer
- `POST /api/reconciliation/customers` - Reconcile all customers
- `GET /api/reconciliation/customers/:customerId/report` - Get reconciliation report

**Reconciliation Report:**
```json
{
  "reconciliation": {
    "customerId": "...",
    "reconciled": true,
    "current": { "pendingBalance": 100, "advanceBalance": 0 },
    "calculated": { "pendingBalance": 100, "advanceBalance": 0 },
    "discrepancy": { "hasDifference": false }
  },
  "transactionCount": 25,
  "period": { "startDate": "...", "endDate": "..." }
}
```

---

## 20. Accounting Period Locking & Compliance

### 20.1 Accounting Period Model
**Model**: `AccountingPeriod.js`

**Period Types:**
- `monthly` - Monthly periods
- `quarterly` - Quarterly periods
- `yearly` - Yearly periods

**Period Status:**
- `open` - Period is open for transactions
- `closing` - Period is being closed
- `closed` - Period is closed (read-only)
- `locked` - Period is locked (no modifications allowed)

### 20.2 Period Management Flow
```
Create Period → Open → Closing → Closed → Locked
```

**Period Closing Process:**
1. Validates no unposted transactions exist
2. Reconciles all customer balances
3. Calculates period statistics
4. Sets status to `closed`
5. Records closing user and timestamp

**Period Locking:**
- Prevents all modifications to closed periods
- Requires unlock before any changes
- Used for final period closure

### 20.3 Transaction Date Validation
**Automatic Validation:**
- CustomerTransaction model validates transaction dates
- Prevents creating transactions in closed/locked periods
- Throws error if transaction date falls in locked period

**API Endpoints:**
- `POST /api/accounting-periods` - Create period
- `GET /api/accounting-periods/current` - Get current period
- `POST /api/accounting-periods/:id/close` - Close period
- `POST /api/accounting-periods/:id/lock` - Lock period
- `POST /api/accounting-periods/:id/unlock` - Unlock period
- `GET /api/accounting-periods` - List periods

---

## 21. Cross-Module Transaction Atomicity

### 21.1 Sales Order Creation (Atomic)
**Route**: `POST /api/sales`

**Atomic Transaction Flow:**
```
Start Transaction
  ↓
1. Create Sales Order
  ↓
2. Track Stock Movements
  ↓
3. Distribute Profit (if applicable)
  ↓
4. Create CustomerTransaction Invoice (if account payment)
  ↓
5. Record Payment (if any)
  ↓
6. Create Accounting Entries
  ↓
Commit Transaction
```

**Features:**
- ✅ MongoDB session transactions for atomicity
- ✅ All operations succeed or fail together
- ✅ Automatic rollback on any error
- ✅ Creates CustomerTransaction invoice records
- ✅ Atomic balance updates with version checking

**Error Handling:**
- If any step fails, entire transaction rolls back
- No partial updates remain
- Proper error messages returned

---

## 22. Partial Reversal & Dispute Management

### 22.1 Partial Transaction Reversal
**Service**: `customerTransactionService.partialReverseTransaction()`

**Features:**
- ✅ Reverse portion of transaction amount
- ✅ Updates original transaction remaining amount
- ✅ Creates reversal transaction record
- ✅ Updates customer balance atomically
- ✅ Complete audit trail

**API Endpoint:**
- `POST /api/customer-transactions/:id/partial-reverse`
  - Body: `{ "amount": 50, "reason": "Partial refund" }`

**Use Cases:**
- Partial refunds
- Partial credit notes
- Dispute resolutions

### 22.2 Dispute Management
**Model**: `Dispute.js`
**Service**: `disputeManagementService.js`

**Dispute Types:**
- `chargeback` - Credit card chargeback
- `refund_request` - Customer refund request
- `billing_error` - Billing error
- `duplicate_charge` - Duplicate charge
- `unauthorized` - Unauthorized transaction
- `other` - Other dispute type

**Dispute Status:**
- `open` - Dispute is open
- `under_review` - Dispute is under review
- `resolved` - Dispute is resolved
- `rejected` - Dispute is rejected
- `escalated` - Dispute is escalated

**Dispute Resolution:**
- `refund_full` - Full refund
- `refund_partial` - Partial refund
- `credit_note` - Credit note issued
- `adjustment` - Balance adjustment
- `rejected` - Dispute rejected
- `other` - Other resolution

**Dispute Flow:**
```
Create Dispute → Open → Under Review → Resolved/Rejected
                                    ↓
                          Create Resolution Transaction
```

**API Endpoints:**
- `POST /api/disputes` - Create dispute
- `POST /api/disputes/:id/resolve` - Resolve dispute
- `GET /api/disputes/customers/:customerId` - Get customer disputes
- `GET /api/disputes/open` - Get open disputes

---

## 23. Customer Merge & Duplicate Resolution

### 23.1 Customer Merge Service
**Service**: `customerMergeService.js`

**Merge Process:**
1. Validates both customers exist and are not deleted
2. Calculates merged balances
3. Moves all transactions from source to target
4. Moves all sales orders from source to target
5. Merges addresses (removes duplicates)
6. Merges notes
7. Updates target customer balances
8. Soft deletes source customer
9. Logs merge in audit trail

**Merge Features:**
- ✅ Atomic merge operation (MongoDB transaction)
- ✅ Consolidates balances
- ✅ Preserves transaction history
- ✅ Complete audit trail
- ✅ Duplicate address removal

### 23.2 Duplicate Detection
**Algorithm:**
- Compares business name similarity
- Compares email addresses
- Compares phone numbers
- Calculates similarity score (0-1)
- Groups customers with similarity >= threshold

**Target Customer Selection:**
- Suggests customer with most transactions
- Suggests customer with most sales orders
- Based on total activity

**API Endpoints:**
- `POST /api/customer-merges` - Merge customers
  - Body: `{ "sourceCustomerId": "...", "targetCustomerId": "...", "mergeAddresses": true, "mergeNotes": true }`
- `GET /api/customer-merges/duplicates` - Find potential duplicates
  - Query: `?threshold=0.8&minSimilarity=0.7`

---

## Summary

The customer flow in this POS system follows a layered architecture:
- **Routes** handle HTTP requests, validation, and duplicate prevention
- **Service** contains business logic and transaction management
- **Repository** manages database operations
- **Model** defines data structure with methods and virtuals

### Enterprise-Grade Features Implemented:

**Data Integrity:**
- ✅ Soft delete (with restore capability)
- ✅ Optimistic locking (version-based concurrency control)
- ✅ Comprehensive audit logging (field-level changes)
- ✅ Transaction sub-ledger (CustomerTransaction model)
- ✅ Atomic balance updates
- ✅ **Automated balance reconciliation**
- ✅ **Cross-module transaction atomicity**

**Financial Management:**
- ✅ Transaction-based balance tracking
- ✅ Payment application logic (link payments to invoices)
- ✅ Aging reports and overdue tracking
- ✅ Credit policy enforcement
- ✅ Auto-suspension for overdue customers
- ✅ Credit scoring and risk assessment
- ✅ **Accounting period locking**
- ✅ **Partial transaction reversal**
- ✅ **Dispute management**

**Operations:**
- ✅ CRUD operations (with soft delete)
- ✅ Bulk import/export (CSV/Excel)
- ✅ Advanced filtering and search
- ✅ Balance management (pending, advance, current)
- ✅ Credit limit management
- ✅ Tier-based discount system
- ✅ Multiple addresses per customer
- ✅ Ledger account integration
- ✅ Transaction history and reporting
- ✅ Customer analytics
- ✅ **Customer merge functionality**
- ✅ **Duplicate detection**

**Compliance & Security:**
- ✅ Audit trails for all operations
- ✅ IP address and user agent tracking
- ✅ GDPR-ready anonymization support
- ✅ Role-based permissions
- ✅ Data retention policies (soft delete)
- ✅ **Period-based transaction controls**
- ✅ **SOX/GAAP compliance features**

**API Endpoints:**
- Customer CRUD operations
- Transaction management (`/api/customer-transactions`)
- Audit logs (`/api/customers/:id/audit-logs`)
- Transaction history (`/api/customers/:id/transactions`)
- Overdue tracking (`/api/customers/:id/overdue`)
- Aging reports (`/api/customers/:id/aging`)
- Payment application (`/api/customers/:id/apply-payment`)
- Credit policy (`/api/customers/credit-policy/*`)
- Credit scoring (`/api/customers/:id/credit-score`)
- **Balance reconciliation** (`/api/reconciliation/*`)
- **Accounting periods** (`/api/accounting-periods/*`)
- **Customer merge** (`/api/customer-merges/*`)
- **Dispute management** (`/api/disputes/*`)
- **Partial reversal** (`/api/customer-transactions/:id/partial-reverse`)

