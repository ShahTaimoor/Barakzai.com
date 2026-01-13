# Financial Modules Flow Documentation

## Overview
This document describes the complete flow of financial and accounting modules in the POS system, including Balance Sheet, Sales, Purchase, Dashboard, Chart of Accounts, and Profit & Loss statements.

---

## 1. Balance Sheet Flow

### 1.1 Overview
The Balance Sheet provides a snapshot of the company's financial position at a specific point in time, showing Assets, Liabilities, and Equity.

### 1.2 Balance Sheet Generation Flow
```
Request → Validation → Calculate Assets → Calculate Liabilities → Calculate Equity → Generate Statement → Save
```

**Route**: `GET /api/balance-sheets/generate` or `POST /api/balance-sheets`

**Steps:**
1. **Request Parameters**:
   - `statementDate`: Date for the balance sheet (default: current date)
   - `periodType`: monthly, quarterly, yearly (default: monthly)
   - `includeComparisons`: Include previous period comparison (optional)

2. **Service Layer** (`balanceSheetCalculationService.generateBalanceSheet()`):
   - Validates statement date
   - Generates statement number (format: `BS-YYYY-MM`)
   - Calculates all components:
     - **Assets**: Current Assets, Fixed Assets
     - **Liabilities**: Current Liabilities, Long-term Liabilities
     - **Equity**: Owner Equity, Retained Earnings

3. **Asset Calculation**:
   - **Current Assets**:
     - Cash and Cash Equivalents (from CashReceipt, BankReceipt)
     - Accounts Receivable (from Customer balances)
     - Inventory (from Inventory model)
     - Prepaid Expenses
   - **Fixed Assets**:
     - Property, Plant & Equipment
     - Accumulated Depreciation
     - Intangible Assets
     - Long-term Investments

4. **Liability Calculation**:
   - **Current Liabilities**:
     - Accounts Payable (from Supplier balances)
     - Accrued Expenses
     - Short-term Debt
   - **Long-term Liabilities**:
     - Long-term Debt
     - Other Long-term Liabilities

5. **Equity Calculation**:
   - Owner Equity
   - Retained Earnings (from P&L statements)
   - Current Period Earnings

6. **Validation**:
   - Assets = Liabilities + Equity (balance equation)
   - All calculations validated

7. **Save Statement**:
   - Creates `BalanceSheet` document
   - Status: draft, review, approved, final
   - Links to accounting period

### 1.3 Balance Sheet Components

**Assets Structure:**
```javascript
assets: {
  currentAssets: {
    cashAndCashEquivalents: {
      cashOnHand: Number,
      bankAccounts: Number,
      pettyCash: Number,
      total: Number
    },
    accountsReceivable: {
      tradeReceivables: Number,
      otherReceivables: Number,
      allowanceForDoubtfulAccounts: Number,
      netReceivables: Number
    },
    inventory: {
      rawMaterials: Number,
      workInProgress: Number,
      finishedGoods: Number,
      total: Number
    },
    prepaidExpenses: Number,
    otherCurrentAssets: Number,
    totalCurrentAssets: Number
  },
  fixedAssets: {
    propertyPlantEquipment: {...},
    accumulatedDepreciation: Number,
    intangibleAssets: {...},
    longTermInvestments: Number,
    otherAssets: Number,
    totalFixedAssets: Number
  },
  totalAssets: Number
}
```

**Liabilities Structure:**
```javascript
liabilities: {
  currentLiabilities: {
    accountsPayable: {
      tradePayables: Number,
      otherPayables: Number,
      total: Number
    },
    accruedExpenses: {
      salariesPayable: Number,
      utilitiesPayable: Number,
      rentPayable: Number,
      taxesPayable: Number,
      interestPayable: Number,
      total: Number
    },
    shortTermDebt: {...},
    totalCurrentLiabilities: Number
  },
  longTermLiabilities: {
    longTermDebt: Number,
    otherLongTermLiabilities: Number,
    totalLongTermLiabilities: Number
  },
  totalLiabilities: Number
}
```

**Equity Structure:**
```javascript
equity: {
  ownerEquity: Number,
  retainedEarnings: Number,
  currentPeriodEarnings: Number,
  totalEquity: Number
}
```

### 1.4 Balance Sheet API Endpoints

- `GET /api/balance-sheets` - List all balance sheets
- `GET /api/balance-sheets/:id` - Get single balance sheet
- `POST /api/balance-sheets/generate` - Generate new balance sheet
- `PUT /api/balance-sheets/:id` - Update balance sheet
- `POST /api/balance-sheets/:id/approve` - Approve balance sheet
- `GET /api/balance-sheets/:id/export/pdf` - Export as PDF
- `GET /api/balance-sheets/:id/export/excel` - Export as Excel

### 1.5 Balance Sheet Status Workflow
```
Draft → Review → Approved → Final
```

---

## 2. Sales Flow

### 2.1 Sales Order Creation Flow
```
Request → Validation → Inventory Check → Calculate Pricing → Create Order → Update Inventory → Create Transaction → Update Customer Balance → Accounting Entry
```

**Route**: `POST /api/orders`

**Steps:**
1. **Request Validation**:
   - Order type: retail, wholesale, return, exchange
   - Customer (optional for retail)
   - Items array (at least 1 item)
   - Payment method and amount
   - Tax exemption status

2. **Product Validation**:
   - Validates each product exists
   - Checks inventory availability
   - Validates quantities

3. **Inventory Check**:
   - Checks stock from Inventory model (source of truth)
   - Validates sufficient stock for each item
   - Reserves stock if needed

4. **Pricing Calculation**:
   - Unit price based on customer type (retail/wholesale/distributor)
   - Applies customer discounts (tier-based)
   - Calculates item-level discounts
   - Calculates tax (if not tax-exempt)
   - Calculates totals

5. **Credit Limit Check** (if customer account payment):
   - Validates customer credit limit
   - Checks current balance + order total
   - Throws error if limit exceeded

6. **MongoDB Transaction** (Atomic):
   - Creates Sales order
   - Updates inventory (reduces stock)
   - Creates CustomerTransaction invoice (if account payment)
   - Records payment (if any)
   - Creates accounting entries
   - All operations succeed or fail together

7. **Post-Order Processing**:
   - Tracks stock movements
   - Distributes profit (if investor-linked products)
   - Updates customer balance
   - Creates accounting journal entries

### 2.2 Sales Order Status Flow
```
Draft → Confirmed → Processing → Completed
         ↓
      Cancelled
```

**Status Values:**
- `draft`: Order created but not confirmed
- `confirmed`: Order confirmed, inventory reserved
- `processing`: Order being processed
- `completed`: Order fulfilled
- `cancelled`: Order cancelled

### 2.3 Payment Processing

**Payment Methods:**
- `cash`: Cash payment (immediate)
- `credit_card`: Credit card payment
- `debit_card`: Debit card payment
- `check`: Check payment
- `account`: Customer account (credit)
- `split`: Split payment
- `bank`: Bank transfer

**Payment Flow:**
1. If `account` payment or partial payment:
   - Creates CustomerTransaction invoice
   - Updates customer pendingBalance
2. If payment received:
   - Creates CustomerTransaction payment
   - Reduces pendingBalance
   - Adds to advanceBalance if overpayment
3. Updates order payment status

### 2.4 Sales Integration Points

**Inventory Integration:**
- Reduces stock on order creation
- Tracks stock movements
- Updates Inventory model

**Customer Integration:**
- Updates customer balance
- Creates transaction records
- Applies discounts

**Accounting Integration:**
- Creates journal entries:
  - Debit: Accounts Receivable (if account payment)
  - Credit: Sales Revenue
  - Debit: Cash/Bank (if cash payment)
  - Credit: Inventory (COGS)
  - Debit: Cost of Goods Sold

### 2.5 Sales API Endpoints

- `GET /api/orders` - List all orders (with filtering)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/payment` - Record payment
- `DELETE /api/orders/:id` - Cancel order
- `GET /api/orders/export/csv` - Export orders to CSV
- `GET /api/orders/export/excel` - Export orders to Excel

---

## 3. Purchase Flow

### 3.1 Purchase Order Creation Flow
```
Request → Validation → Create PO → Update Supplier Balance → Save
```

**Route**: `POST /api/purchase-orders`

**Steps:**
1. **Request Validation**:
   - Supplier (required)
   - Items array (at least 1 item)
   - Expected delivery date (optional)
   - Notes and terms (optional)

2. **Service Layer** (`purchaseOrderService.createPurchaseOrder()`):
   - Generates PO number (auto-generated)
   - Validates supplier exists
   - Validates products exist
   - Calculates totals (subtotal, tax, total)

3. **Purchase Order Creation**:
   - Creates PurchaseOrder document
   - Status: draft (default)
   - Links to supplier and products

4. **Supplier Balance Update**:
   - Updates supplier pendingBalance
   - Adds PO total to pendingBalance
   - Maintains supplier balance history

5. **Response**:
   - Returns created purchase order
   - Populates supplier and product details

### 3.2 Purchase Order Status Flow
```
Draft → Confirmed → Partially Received → Fully Received → Closed
         ↓
      Cancelled
```

**Status Values:**
- `draft`: PO created but not confirmed
- `confirmed`: PO confirmed with supplier
- `partially_received`: Some items received
- `fully_received`: All items received
- `cancelled`: PO cancelled
- `closed`: PO closed (fully received and invoiced)

### 3.3 Purchase Invoice Flow
```
PO Received → Create Purchase Invoice → Update Inventory → Update Supplier Balance → Accounting Entry
```

**Route**: `POST /api/purchase-invoices`

**Steps:**
1. **Create Purchase Invoice**:
   - Links to purchase order
   - Records received quantities
   - Calculates invoice totals

2. **Inventory Update**:
   - Increases stock for received items
   - Updates Inventory model
   - Tracks stock movements

3. **Supplier Balance Update**:
   - Records invoice in supplier balance
   - Updates pendingBalance
   - Creates supplier transaction record

4. **Accounting Entry**:
   - Debit: Inventory
   - Credit: Accounts Payable
   - Debit: Cost of Goods Sold (if applicable)

### 3.4 Purchase Integration Points

**Supplier Integration:**
- Updates supplier balance
- Tracks purchase history
- Maintains supplier relationship

**Inventory Integration:**
- Increases stock on receipt
- Updates product costs
- Tracks purchase movements

**Accounting Integration:**
- Creates journal entries for purchases
- Updates Accounts Payable
- Records inventory increases

### 3.5 Purchase API Endpoints

- `GET /api/purchase-orders` - List all purchase orders
- `GET /api/purchase-orders/:id` - Get single purchase order
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order
- `PUT /api/purchase-orders/:id/confirm` - Confirm purchase order
- `PUT /api/purchase-orders/:id/receive` - Receive items
- `POST /api/purchase-invoices` - Create purchase invoice
- `GET /api/purchase-invoices` - List purchase invoices
- `PUT /api/purchase-orders/:id/cancel` - Cancel purchase order

---

## 4. Dashboard Flow

### 4.1 Dashboard Overview
The Dashboard provides real-time insights into business performance, including sales, inventory, customers, and financial metrics.

### 4.2 Dashboard Data Flow
```
Request → Fetch Multiple Data Sources → Aggregate → Calculate Metrics → Return Dashboard Data
```

**Route**: `GET /api/dashboard` or frontend component

**Data Sources:**
1. **Sales Metrics**:
   - Total sales (today, week, month)
   - Sales growth percentage
   - Top selling products
   - Sales by category

2. **Inventory Metrics**:
   - Low stock alerts
   - Out of stock items
   - Inventory value
   - Stock movements

3. **Customer Metrics**:
   - Total customers
   - New customers
   - Customer balances
   - Overdue invoices

4. **Financial Metrics**:
   - Revenue trends
   - Profit margins
   - Outstanding receivables
   - Outstanding payables

5. **Operational Metrics**:
   - Pending orders
   - Pending purchase orders
   - Recent transactions
   - System alerts

### 4.3 Dashboard Components

**Sales Summary:**
- Today's sales
- Week-to-date sales
- Month-to-date sales
- Sales growth trend

**Inventory Alerts:**
- Low stock items
- Out of stock items
- Expiring products
- Reorder recommendations

**Financial Overview:**
- Cash balance
- Accounts receivable
- Accounts payable
- Net profit

**Recent Activity:**
- Recent sales
- Recent purchases
- Recent payments
- System notifications

### 4.4 Dashboard API Endpoints

- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/sales-metrics` - Get sales metrics
- `GET /api/dashboard/inventory-alerts` - Get inventory alerts
- `GET /api/dashboard/financial-overview` - Get financial overview
- `GET /api/dashboard/recent-activity` - Get recent activity

---

## 5. Chart of Accounts Flow

### 5.1 Chart of Accounts Overview
The Chart of Accounts is the foundation of the accounting system, organizing all accounts into a hierarchical structure.

### 5.2 Account Creation Flow
```
Request → Validation → Check Uniqueness → Create Account → Link to Parent → Update Hierarchy → Save
```

**Route**: `POST /api/chart-of-accounts`

**Steps:**
1. **Request Validation**:
   - Account code (required, unique, uppercase)
   - Account name (required)
   - Account type: asset, liability, equity, revenue, expense
   - Account category (specific to type)
   - Normal balance: debit or credit
   - Parent account (optional, for hierarchy)

2. **Service Layer** (`chartOfAccountsService.createAccount()`):
   - Validates account code uniqueness
   - Validates account type and category match
   - Sets account level (based on parent)
   - Sets opening balance
   - Links to parent account if provided

3. **Account Properties**:
   - `isActive`: Account is active
   - `isSystemAccount`: System account (cannot be deleted)
   - `allowDirectPosting`: Can post transactions directly
   - `requiresReconciliation`: Requires periodic reconciliation
   - `isTaxable`: Account is taxable
   - `taxRate`: Tax rate if taxable

4. **Balance Management**:
   - `openingBalance`: Initial balance
   - `currentBalance`: Current balance (updated by transactions)
   - `normalBalance`: Debit or credit

5. **Save Account**:
   - Creates ChartOfAccounts document
   - Updates parent account children list
   - Maintains account hierarchy

### 5.3 Account Hierarchy

**Account Levels:**
- Level 0: Root accounts (e.g., Assets, Liabilities)
- Level 1: Main categories (e.g., Current Assets, Fixed Assets)
- Level 2: Sub-categories (e.g., Cash, Accounts Receivable)
- Level 3-5: Detailed accounts

**Example Hierarchy:**
```
Assets (Level 0)
  ├─ Current Assets (Level 1)
  │   ├─ Cash and Cash Equivalents (Level 2)
  │   │   ├─ Cash on Hand (Level 3)
  │   │   └─ Bank Accounts (Level 3)
  │   └─ Accounts Receivable (Level 2)
  └─ Fixed Assets (Level 1)
      └─ Property, Plant & Equipment (Level 2)
```

### 5.4 Account Types and Categories

**Asset Accounts:**
- `current_assets`: Cash, AR, Inventory
- `fixed_assets`: Property, Plant, Equipment
- `other_assets`: Investments, Intangibles

**Liability Accounts:**
- `current_liabilities`: AP, Accrued Expenses
- `long_term_liabilities`: Long-term Debt

**Equity Accounts:**
- `owner_equity`: Owner's Capital
- `retained_earnings`: Retained Earnings

**Revenue Accounts:**
- `sales_revenue`: Sales Revenue
- `other_revenue`: Other Income

**Expense Accounts:**
- `cost_of_goods_sold`: COGS
- `operating_expenses`: Operating Expenses
- `other_expenses`: Other Expenses

### 5.5 Account Balance Updates

**Balance Update Flow:**
```
Transaction → Identify Accounts → Determine Debit/Credit → Update Account Balances
```

**Normal Balance Rules:**
- **Assets**: Normal balance is Debit (increases with debit)
- **Liabilities**: Normal balance is Credit (increases with credit)
- **Equity**: Normal balance is Credit (increases with credit)
- **Revenue**: Normal balance is Credit (increases with credit)
- **Expenses**: Normal balance is Debit (increases with debit)

### 5.6 Chart of Accounts API Endpoints

- `GET /api/chart-of-accounts` - List all accounts
- `GET /api/chart-of-accounts/:id` - Get single account
- `POST /api/chart-of-accounts` - Create account
- `PUT /api/chart-of-accounts/:id` - Update account
- `DELETE /api/chart-of-accounts/:id` - Delete account (if not system account)
- `GET /api/chart-of-accounts/hierarchy` - Get account hierarchy
- `GET /api/chart-of-accounts/stats` - Get account statistics
- `GET /api/chart-of-accounts/:id/ledger` - Get account ledger

---

## 6. Profit & Loss (P&L) Statement Flow

### 6.1 P&L Statement Overview
The Profit & Loss statement shows revenue, expenses, and profit over a specific period.

### 6.2 P&L Statement Generation Flow
```
Request → Validate Period → Calculate Revenue → Calculate COGS → Calculate Expenses → Calculate Profit → Generate Statement → Save
```

**Route**: `POST /api/pl-statements/generate` or `GET /api/pl-statements/generate`

**Steps:**
1. **Request Parameters**:
   - `startDate`: Period start date
   - `endDate`: Period end date
   - `periodType`: monthly, quarterly, yearly, custom
   - `includeDetails`: Include line-item details (optional)
   - `calculateComparisons`: Include previous period (optional)

2. **Service Layer** (`plCalculationService.generatePLStatement()`):
   - Validates period dates
   - Generates statement ID
   - Calculates all financial components

3. **Revenue Calculation**:
   - **Gross Sales**: Sum of all sales orders
   - **Sales Returns**: Sum of returns
   - **Sales Discounts**: Sum of discounts applied
   - **Net Sales**: Gross Sales - Returns - Discounts
   - **Other Revenue**: Other income sources
   - **Total Revenue**: Net Sales + Other Revenue

4. **Cost of Goods Sold (COGS) Calculation**:
   - **Beginning Inventory**: Inventory at period start
   - **Purchases**: Total purchases during period
   - **Freight In**: Shipping costs
   - **Purchase Returns**: Returns to suppliers
   - **Purchase Discounts**: Discounts received
   - **Ending Inventory**: Inventory at period end
   - **COGS**: Beginning + Purchases + Freight - Returns - Discounts - Ending

5. **Expense Calculation**:
   - **Selling Expenses**:
     - Salaries and wages
     - Advertising
     - Rent
     - Utilities
     - Depreciation
   - **Administrative Expenses**:
     - Office expenses
     - Professional services
     - Insurance
     - Other admin expenses
   - **Total Operating Expenses**: Selling + Administrative

6. **Profit Calculation**:
   - **Gross Profit**: Total Revenue - COGS
   - **Operating Income**: Gross Profit - Operating Expenses
   - **Other Income**: Non-operating income
   - **Other Expenses**: Non-operating expenses
   - **Net Income**: Operating Income + Other Income - Other Expenses

7. **Statement Generation**:
   - Creates FinancialStatement document
   - Type: 'profit_loss'
   - Status: draft
   - Includes all calculated values
   - Links to accounting period

### 6.3 P&L Statement Structure

```javascript
{
  revenue: {
    grossSales: { amount: Number, details: Array },
    salesReturns: { amount: Number, details: Array },
    salesDiscounts: { amount: Number, details: Array },
    netSales: { amount: Number, calculation: String },
    otherRevenue: { amount: Number, details: Array },
    totalRevenue: { amount: Number, calculation: String }
  },
  costOfGoodsSold: {
    beginningInventory: Number,
    purchases: { amount: Number, details: Array },
    freightIn: Number,
    purchaseReturns: Number,
    purchaseDiscounts: Number,
    endingInventory: Number,
    totalCOGS: { amount: Number, calculation: String, calculationMethod: String }
  },
  grossProfit: {
    amount: Number,
    margin: Number,
    calculation: String
  },
  operatingExpenses: {
    sellingExpenses: {...},
    administrativeExpenses: {...},
    totalOperatingExpenses: { amount: Number, calculation: String }
  },
  operatingIncome: {
    amount: Number,
    margin: Number,
    calculation: String
  },
  otherIncome: { amount: Number, details: Array },
  otherExpenses: { amount: Number, details: Array },
  netIncome: {
    amount: Number,
    margin: Number,
    calculation: String
  }
}
```

### 6.4 P&L Statement Calculation Methods

**COGS Calculation Methods:**
1. **Transaction-Based**: Sum of COGS from sales transactions
2. **Inventory Formula**: Beginning + Purchases - Ending
3. **Hybrid**: Uses transaction-based if available, falls back to formula

**Revenue Calculation:**
- Queries Sales orders in period
- Filters by order type (excludes returns)
- Sums order totals
- Deducts returns and discounts

**Expense Calculation:**
- Queries Expense transactions
- Groups by expense category
- Sums by category
- Includes depreciation and accruals

### 6.5 P&L Statement API Endpoints

- `GET /api/pl-statements` - List all P&L statements
- `GET /api/pl-statements/:id` - Get single P&L statement
- `POST /api/pl-statements/generate` - Generate new P&L statement
- `PUT /api/pl-statements/:id` - Update P&L statement
- `POST /api/pl-statements/:id/approve` - Approve P&L statement
- `GET /api/pl-statements/:id/export/pdf` - Export as PDF
- `GET /api/pl-statements/:id/export/excel` - Export as Excel
- `GET /api/pl-statements/compare` - Compare periods

### 6.6 P&L Statement Status Workflow
```
Draft → Review → Approved → Published
```

---

## 7. Integration Flows

### 7.1 Sales → Accounting Flow
```
Sales Order Created
  ↓
Create Journal Entry:
  - Debit: Accounts Receivable (if account payment)
  - Credit: Sales Revenue
  - Debit: Cash/Bank (if cash payment)
  - Credit: Inventory (COGS)
  - Debit: Cost of Goods Sold
  ↓
Update Chart of Accounts Balances
  ↓
Reflect in P&L Statement
```

### 7.2 Purchase → Accounting Flow
```
Purchase Order Received
  ↓
Create Purchase Invoice
  ↓
Create Journal Entry:
  - Debit: Inventory
  - Credit: Accounts Payable
  ↓
Update Chart of Accounts Balances
  ↓
Reflect in Balance Sheet
```

### 7.3 Payment → Accounting Flow
```
Payment Received
  ↓
Create Journal Entry:
  - Debit: Cash/Bank
  - Credit: Accounts Receivable
  ↓
Update Customer Balance
  ↓
Update Chart of Accounts Balances
```

### 7.4 Financial Statement Generation Flow
```
Period End
  ↓
Generate P&L Statement
  ↓
Calculate Net Income
  ↓
Generate Balance Sheet
  ↓
Update Retained Earnings
  ↓
Close Accounting Period
```

---

## 8. Data Models

### 8.1 Balance Sheet Model
- `statementNumber`: Unique statement identifier
- `statementDate`: Date of balance sheet
- `periodType`: monthly, quarterly, yearly
- `status`: draft, review, approved, final
- `assets`: Complete assets structure
- `liabilities`: Complete liabilities structure
- `equity`: Complete equity structure

### 8.2 Sales Model
- `orderNumber`: Unique order identifier
- `orderType`: retail, wholesale, return, exchange
- `customer`: Customer reference
- `items`: Order items array
- `pricing`: Subtotal, discount, tax, total
- `payment`: Payment method, amount, status
- `status`: Order status

### 8.3 Purchase Order Model
- `poNumber`: Unique PO identifier
- `supplier`: Supplier reference
- `items`: PO items array
- `subtotal`, `tax`, `total`: Financial totals
- `status`: PO status
- `orderDate`, `expectedDelivery`: Dates

### 8.4 Chart of Accounts Model
- `accountCode`: Unique account code
- `accountName`: Account name
- `accountType`: asset, liability, equity, revenue, expense
- `accountCategory`: Specific category
- `parentAccount`: Parent account reference
- `level`: Hierarchy level
- `normalBalance`: debit or credit
- `currentBalance`: Current account balance

### 8.5 Financial Statement Model (P&L)
- `statementId`: Unique statement identifier
- `type`: profit_loss, balance_sheet, cash_flow
- `period`: Start date, end date, type
- `revenue`: Revenue structure
- `costOfGoodsSold`: COGS structure
- `grossProfit`: Gross profit
- `operatingExpenses`: Operating expenses
- `operatingIncome`: Operating income
- `netIncome`: Net income
- `status`: Statement status

---

## 9. Key Service Methods

### Balance Sheet Service:
- `generateBalanceSheet()` - Generate balance sheet
- `calculateAssets()` - Calculate all assets
- `calculateLiabilities()` - Calculate all liabilities
- `calculateEquity()` - Calculate equity
- `validateBalance()` - Validate balance equation

### Sales Service:
- `createOrder()` - Create sales order
- `updateOrderStatus()` - Update order status
- `recordPayment()` - Record payment
- `calculateTotals()` - Calculate order totals

### Purchase Service:
- `createPurchaseOrder()` - Create PO
- `receiveItems()` - Receive items
- `createPurchaseInvoice()` - Create invoice
- `updateSupplierBalance()` - Update supplier balance

### Chart of Accounts Service:
- `createAccount()` - Create account
- `updateAccount()` - Update account
- `getAccountHierarchy()` - Get account tree
- `updateAccountBalance()` - Update balance
- `getAccountLedger()` - Get account transactions

### P&L Service:
- `generatePLStatement()` - Generate P&L
- `calculateRevenue()` - Calculate revenue
- `calculateCOGS()` - Calculate COGS
- `calculateExpenses()` - Calculate expenses
- `calculateProfit()` - Calculate profit

---

## 10. API Endpoints Summary

### Balance Sheet:
- `GET /api/balance-sheets` - List
- `POST /api/balance-sheets/generate` - Generate
- `GET /api/balance-sheets/:id` - Get single
- `PUT /api/balance-sheets/:id` - Update
- `POST /api/balance-sheets/:id/approve` - Approve

### Sales:
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id` - Update order
- `POST /api/orders/:id/payment` - Record payment

### Purchase:
- `GET /api/purchase-orders` - List POs
- `POST /api/purchase-orders` - Create PO
- `GET /api/purchase-orders/:id` - Get PO
- `PUT /api/purchase-orders/:id` - Update PO
- `POST /api/purchase-invoices` - Create invoice

### Dashboard:
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/sales-metrics` - Sales metrics
- `GET /api/dashboard/inventory-alerts` - Inventory alerts

### Chart of Accounts:
- `GET /api/chart-of-accounts` - List accounts
- `POST /api/chart-of-accounts` - Create account
- `GET /api/chart-of-accounts/hierarchy` - Get hierarchy
- `GET /api/chart-of-accounts/:id/ledger` - Get ledger

### Profit & Loss:
- `GET /api/pl-statements` - List statements
- `POST /api/pl-statements/generate` - Generate
- `GET /api/pl-statements/:id` - Get statement
- `GET /api/pl-statements/compare` - Compare periods

---

## 11. Error Handling

### Common Errors:
- **Insufficient Stock**: Not enough inventory
- **Credit Limit Exceeded**: Customer credit limit exceeded
- **Invalid Account**: Account code doesn't exist
- **Period Locked**: Accounting period is locked
- **Balance Mismatch**: Assets ≠ Liabilities + Equity
- **Validation Error**: Invalid input data

### Error Response Format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "field": "fieldName"
  }
}
```

---

## Summary

This POS system provides comprehensive financial management with:

**Financial Statements:**
- ✅ Balance Sheet generation and management
- ✅ Profit & Loss statement generation
- ✅ Period-based reporting

**Transaction Management:**
- ✅ Sales order processing with atomic transactions
- ✅ Purchase order and invoice management
- ✅ Payment processing and recording

**Accounting Integration:**
- ✅ Chart of Accounts with hierarchy
- ✅ Automatic journal entry creation
- ✅ Account balance tracking

**Reporting & Analytics:**
- ✅ Real-time dashboard
- ✅ Financial metrics
- ✅ Comparative analysis

All modules are integrated to provide a complete financial management system with proper accounting principles and audit trails.

