# Profit & Loss, Products, Purchase, and Inventory Flow Documentation

## Table of Contents
1. [Profit & Loss (P&L) Flow](#1-profit--loss-pl-flow)
2. [Products Flow](#2-products-flow)
3. [Purchase Flow](#3-purchase-flow)
4. [Inventory Flow](#4-inventory-flow)
5. [Integration Between Modules](#5-integration-between-modules)

---

## 1. Profit & Loss (P&L) Flow

### 1.1 Overview
The Profit & Loss (P&L) statement shows the financial performance of the business over a specific period, including revenue, expenses, and net income.

### 1.2 P&L Generation Process

#### 1.2.1 Request Flow
```
Frontend → API Route → Service Layer → Calculation → Database → Response
```

**Route**: `GET /api/pl-statements/summary` or `POST /api/pl-statements/generate`

**Request Parameters**:
- `startDate`: Period start date (ISO format)
- `endDate`: Period end date (ISO format)
- `periodType`: monthly, quarterly, yearly, custom (optional)
- `includeDetails`: Include line-item details (optional, default: false)

#### 1.2.2 Calculation Steps

**Step 1: Revenue Calculation**
1. **Primary Method**: Query `Transaction` model for revenue transactions
   - Filter by: `accountCode = salesRevenueCode`, `status = 'completed'`, date range
   - Sum all `creditAmount` values
   
2. **Fallback Method**: If no transactions found, query `Sales` model directly
   - Filter by: `createdAt` in date range, `status` in ['completed', 'delivered', 'shipped', 'confirmed']
   - Exclude: `orderType = 'return'` or `'exchange'`
   - Sum: `pricing.total` or `pricing.subtotal`

3. **Sales Returns**: Query transactions with `debitAmount > 0` on sales revenue account
   - Or query Sales orders with `orderType = 'return'`

4. **Sales Discounts**: 
   - From Sales orders: Sum `pricing.discountAmount`
   - From Transactions: Sum discount-type transactions

5. **Net Sales**: `Gross Sales - Sales Returns - Sales Discounts`

**Step 2: Cost of Goods Sold (COGS) Calculation**
1. **Primary Method**: Query `Transaction` model for COGS transactions
   - Filter by: `accountCode = costOfGoodsSoldCode`, `status = 'completed'`, date range
   - Sum all `debitAmount` values

2. **Fallback Method**: Calculate from Sales orders
   - For each completed sale: `COGS = sum(item.unitCost * item.quantity)`
   - Sum all item COGS values

3. **Inventory Formula** (Alternative):
   ```
   COGS = Beginning Inventory + Purchases + Freight In - Purchase Returns - Purchase Discounts - Ending Inventory
   ```

**Step 3: Gross Profit Calculation**
```
Gross Profit = Net Sales - COGS
Gross Margin = (Gross Profit / Net Sales) * 100
```

**Step 4: Operating Expenses Calculation**
1. **Selling Expenses**:
   - Query expense transactions with category = 'selling'
   - Categories: advertising, marketing, sales_commissions, sales_salaries, travel_entertainment, promotional, customer_service
   - Sum by category

2. **Administrative Expenses**:
   - Query expense transactions with category = 'administrative'
   - Categories: office_supplies, rent, utilities, insurance, legal, accounting, management_salaries, training, software, equipment, maintenance, professional_services
   - Sum by category

3. **Total Operating Expenses**: `Selling Expenses + Administrative Expenses`

**Step 5: Operating Income Calculation**
```
Operating Income = Gross Profit - Total Operating Expenses
Operating Margin = (Operating Income / Net Sales) * 100
```

**Step 6: Other Income/Expenses**
1. **Other Income**: Interest income, rental income, other revenue
2. **Other Expenses**: Interest expense, depreciation, amortization, other expenses

**Step 7: Net Income Calculation**
```
Earnings Before Tax = Operating Income + Other Income - Other Expenses
Income Tax = Calculate based on tax brackets and earnings
Net Income = Earnings Before Tax - Income Tax
Net Margin = (Net Income / Net Sales) * 100
```

### 1.3 P&L Statement Structure

```javascript
{
  period: {
    startDate: Date,
    endDate: Date,
    type: String // monthly, quarterly, yearly, custom
  },
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
    totalCOGS: { 
      amount: Number, 
      calculation: String, 
      calculationMethod: String // 'transaction' or 'inventory_formula'
    }
  },
  grossProfit: {
    amount: Number,
    margin: Number,
    calculation: String
  },
  operatingExpenses: {
    sellingExpenses: {
      total: Number,
      details: Array,
      budgetComparison: Object // optional
    },
    administrativeExpenses: {
      total: Number,
      details: Array,
      budgetComparison: Object // optional
    },
    totalOperatingExpenses: { amount: Number, calculation: String }
  },
  operatingIncome: {
    amount: Number,
    margin: Number,
    calculation: String
  },
  otherIncome: {
    interestIncome: Number,
    rentalIncome: Number,
    other: { amount: Number, details: Array }
  },
  otherExpenses: {
    interestExpense: Number,
    depreciation: Number,
    amortization: Number,
    other: { amount: Number, details: Array }
  },
  incomeTax: {
    current: Number,
    deferred: Number,
    total: Number,
    details: Object // optional
  },
  netIncome: {
    amount: Number,
    margin: Number,
    calculation: String
  },
  comparison: {
    previousPeriod: Object, // optional
    budget: Object // optional
  }
}
```

### 1.4 Key Service Methods

**File**: `backend/services/plCalculationService.js`

- `generatePLStatement(period, options)`: Generate full P&L statement
- `getPLSummary(period)`: Get summary for dashboard
- `calculateRevenue(period)`: Calculate revenue data
- `calculateCOGS(period)`: Calculate cost of goods sold
- `calculateExpenses(period)`: Calculate operating expenses
- `calculateOtherIncome(period)`: Calculate other income
- `calculateOtherExpenses(period)`: Calculate other expenses
- `calculateTaxes(period, earningsBeforeTax)`: Calculate taxes
- `getInventoryValue(date)`: Get inventory value at specific date

### 1.5 API Endpoints

- `GET /api/pl-statements/summary`: Get P&L summary
- `POST /api/pl-statements/generate`: Generate full P&L statement
- `GET /api/pl-statements/:statementId`: Get specific P&L statement
- `GET /api/pl-statements`: List all P&L statements
- `POST /api/pl-statements/:statementId/export`: Export P&L statement
- `GET /api/pl-statements/:statementId/versions`: Get version history

---

## 2. Products Flow

### 2.1 Overview
Products represent items sold by the business. Each product has pricing, inventory, and categorization information.

### 2.2 Product Lifecycle

#### 2.2.1 Product Creation
```
POST /api/products
```

**Flow**:
1. Validate product data (name, pricing, inventory)
2. Check for duplicate product name
3. Create Product document
4. **Auto-create Inventory record** for the product
5. Create ledger account (if accounting integration enabled)
6. Log audit trail
7. Return created product

**Product Schema**:
```javascript
{
  name: String (required, unique),
  description: String,
  pricing: {
    cost: Number (required, min: 0),
    retail: Number (required, min: 0),
    wholesale: Number (required, min: 0),
    distributor: Number (optional, min: 0)
  },
  inventory: {
    currentStock: Number (default: 0, min: 0),
    minStock: Number (default: 0, min: 0),
    maxStock: Number (optional, min: 0),
    reorderPoint: Number (default: 0, min: 0)
  },
  category: ObjectId (ref: 'Category'),
  brand: String,
  suppliers: [ObjectId] (ref: 'Supplier'),
  status: String (enum: ['active', 'inactive', 'discontinued'], default: 'active'),
  costingMethod: String (enum: ['FIFO', 'LIFO', 'average', 'standard'], default: 'average'),
  version: Number (for optimistic locking),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.2.2 Product Update
```
PUT /api/products/:id
```

**Flow**:
1. Validate update data
2. Check optimistic locking (version field)
3. Check for duplicate name (if name changed)
4. Update product document
5. **Sync Inventory record** if stock changed
6. Update ledger account (if accounting integration enabled)
7. Log audit trail
8. Return updated product

**Optimistic Locking**:
- Uses `version` field to prevent concurrent update conflicts
- If version mismatch, returns 409 Conflict error

#### 2.2.3 Product Deletion
```
DELETE /api/products/:id
```

**Flow**:
1. Check if product has active sales orders
2. Check if product has inventory > 0
3. **Soft delete**: Set `isDeleted = true`, `deletedAt = Date`, `deletedBy = userId`
4. Deactivate ledger account
5. Log audit trail
6. Return success

**Note**: Products are soft-deleted, not hard-deleted, for data integrity.

#### 2.2.4 Product Retrieval
```
GET /api/products
GET /api/products/:id
```

**Filters**:
- `search`: Search by name or description
- `category`: Filter by category
- `status`: Filter by status
- `lowStock`: Filter low stock items only
- `page`, `limit`: Pagination

### 2.3 Product Pricing

**Pricing Methods**:
- `getPriceForCustomerType(customerType, quantity)`: Get price based on customer type and quantity
- Supports: retail, wholesale, distributor pricing
- Bulk discounts: Applied based on quantity thresholds

**Customer Types**:
- `retail`: Uses `pricing.retail`
- `wholesale`: Uses `pricing.wholesale`
- `distributor`: Uses `pricing.distributor`

### 2.4 Product Inventory Integration

When a product is created:
1. Product document created
2. **Inventory record auto-created** with:
   - `currentStock`: From product.inventory.currentStock
   - `reorderPoint`: From product.inventory.reorderPoint
   - `status`: 'active' if stock > 0, else 'out_of_stock'

When product stock is updated:
1. Product.inventory.currentStock updated
2. **Inventory record synced** to match product stock
3. Stock movement recorded

### 2.5 Key Service Methods

**File**: `backend/services/productService.js`

- `createProduct(productData, userId, req)`: Create new product
- `updateProduct(id, updateData, userId, req)`: Update product
- `deleteProduct(id, userId, req)`: Soft delete product
- `getProducts(filters, options)`: Get products with filters
- `getProductById(id)`: Get single product
- `bulkUpdateProducts(updates)`: Bulk update products
- `calculateProductCost(productId, quantity, method)`: Calculate product cost

### 2.6 API Endpoints

- `POST /api/products`: Create product
- `GET /api/products`: List products
- `GET /api/products/:id`: Get product
- `PUT /api/products/:id`: Update product
- `DELETE /api/products/:id`: Delete product
- `POST /api/products/bulk`: Bulk operations
- `POST /api/products/import/csv`: Import from CSV
- `POST /api/products/export/excel`: Export to Excel

---

## 3. Purchase Flow

### 3.1 Overview
Purchase flow handles procurement of products from suppliers, including purchase orders and purchase invoices.

### 3.2 Purchase Order Flow

#### 3.2.1 Purchase Order Creation
```
POST /api/purchase-orders
```

**Flow**:
1. Validate purchase order data
2. Check supplier exists
3. Validate product IDs and quantities
4. Calculate order totals (subtotal, tax, total)
5. Create PurchaseOrder document
6. **Reserve inventory** (if applicable)
7. Create accounting entries (Accounts Payable)
8. Return created purchase order

**Purchase Order Schema**:
```javascript
{
  poNumber: String (auto-generated),
  supplier: ObjectId (ref: 'Supplier', required),
  items: [{
    product: ObjectId (ref: 'Product', required),
    quantity: Number (required, min: 1),
    unitPrice: Number (required, min: 0),
    discountPercent: Number (default: 0),
    taxRate: Number (default: 0),
    subtotal: Number,
    discountAmount: Number,
    taxAmount: Number,
    total: Number
  }],
  pricing: {
    subtotal: Number,
    discountAmount: Number,
    taxAmount: Number,
    shippingCost: Number,
    total: Number
  },
  status: String (enum: ['draft', 'sent', 'confirmed', 'received', 'completed', 'cancelled']),
  expectedDelivery: Date,
  receivedDate: Date,
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2.2 Purchase Order Status Flow

**Status Transitions**:
1. `draft` → `sent`: Order sent to supplier
2. `sent` → `confirmed`: Supplier confirms order
3. `confirmed` → `received`: Goods received
4. `received` → `completed`: Order fully processed
5. Any status → `cancelled`: Order cancelled

**On Status Change to 'received'**:
1. Update inventory stock (increase)
2. Create stock movement record
3. Update product costs (if using average cost method)
4. Create accounting entries:
   - Debit: Inventory
   - Credit: Accounts Payable

**On Status Change to 'completed'**:
1. Finalize accounting entries
2. Update supplier balance
3. Mark order as completed

#### 3.2.3 Purchase Order Cancellation
```
PUT /api/purchase-orders/:id/cancel
```

**Flow**:
1. Check if order can be cancelled (not already received/completed)
2. Release reserved inventory (if any)
3. Reverse accounting entries
4. Update status to 'cancelled'
5. Log cancellation reason

### 3.3 Purchase Invoice Flow

#### 3.3.1 Purchase Invoice Creation
```
POST /api/purchase-invoices
```

**Flow**:
1. Validate invoice data
2. Link to purchase order (if applicable)
3. Validate supplier
4. Calculate invoice totals
5. Create PurchaseInvoice document
6. **Update inventory** (if goods received)
7. Create accounting entries:
   - Debit: Inventory (or Expense)
   - Credit: Accounts Payable
8. Update supplier balance
9. Return created invoice

**Purchase Invoice Schema**:
```javascript
{
  invoiceNumber: String (auto-generated),
  supplier: ObjectId (ref: 'Supplier', required),
  purchaseOrder: ObjectId (ref: 'PurchaseOrder', optional),
  invoiceType: String (enum: ['purchase', 'return'], default: 'purchase'),
  invoiceDate: Date (required),
  dueDate: Date,
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number,
    unitPrice: Number,
    discountAmount: Number,
    taxAmount: Number,
    total: Number
  }],
  pricing: {
    subtotal: Number,
    discountAmount: Number,
    taxAmount: Number,
    shippingCost: Number,
    total: Number
  },
  status: String (enum: ['draft', 'confirmed', 'received', 'paid', 'closed', 'cancelled']),
  paymentStatus: String (enum: ['unpaid', 'partial', 'paid']),
  paidAmount: Number (default: 0),
  remainingAmount: Number,
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.3.2 Purchase Invoice Payment
```
POST /api/purchase-invoices/:id/pay
```

**Flow**:
1. Validate payment amount
2. Update invoice payment status
3. Create payment transaction
4. Update supplier balance
5. Create accounting entries:
   - Debit: Accounts Payable
   - Credit: Cash/Bank
6. If fully paid, update invoice status to 'paid'

### 3.4 Purchase Returns Flow

#### 3.4.1 Return Creation
```
POST /api/purchase-invoices (with invoiceType: 'return')
```

**Flow**:
1. Link to original purchase invoice
2. Validate return items and quantities
3. Calculate return amount
4. Create return invoice
5. **Decrease inventory** (if goods returned)
6. Create accounting entries:
   - Debit: Accounts Payable
   - Credit: Inventory
7. Update supplier balance
8. Return created return invoice

### 3.5 Key Service Methods

**File**: `backend/services/purchaseOrderService.js`

- `createPurchaseOrder(orderData, userId)`: Create purchase order
- `updatePurchaseOrder(id, updateData, userId)`: Update purchase order
- `receivePurchaseOrder(id, receivedData, userId)`: Mark order as received
- `cancelPurchaseOrder(id, reason, userId)`: Cancel purchase order
- `getPurchaseOrders(filters, options)`: Get purchase orders

**File**: `backend/services/purchaseInvoiceService.js`

- `createPurchaseInvoice(invoiceData, userId)`: Create purchase invoice
- `payPurchaseInvoice(id, paymentData, userId)`: Record payment
- `returnPurchaseInvoice(id, returnData, userId)`: Create return
- `getPurchaseInvoices(filters, options)`: Get purchase invoices

### 3.6 API Endpoints

**Purchase Orders**:
- `POST /api/purchase-orders`: Create purchase order
- `GET /api/purchase-orders`: List purchase orders
- `GET /api/purchase-orders/:id`: Get purchase order
- `PUT /api/purchase-orders/:id`: Update purchase order
- `PUT /api/purchase-orders/:id/receive`: Mark as received
- `PUT /api/purchase-orders/:id/cancel`: Cancel order

**Purchase Invoices**:
- `POST /api/purchase-invoices`: Create purchase invoice
- `GET /api/purchase-invoices`: List purchase invoices
- `GET /api/purchase-invoices/:id`: Get purchase invoice
- `POST /api/purchase-invoices/:id/pay`: Record payment
- `POST /api/purchase-invoices/:id/return`: Create return

---

## 4. Inventory Flow

### 4.1 Overview
Inventory management tracks stock levels, movements, reservations, and availability of products.

### 4.2 Inventory Model Structure

```javascript
{
  product: ObjectId (ref: 'Product', required),
  productModel: String (enum: ['Product', 'ProductVariant'], default: 'Product'),
  currentStock: Number (required, min: 0, default: 0),
  reservedStock: Number (default: 0, min: 0),
  availableStock: Number (calculated: currentStock - reservedStock),
  reorderPoint: Number (required, min: 0, default: 10),
  reorderQuantity: Number (required, min: 1, default: 50),
  maxStock: Number (optional, min: 0),
  status: String (enum: ['active', 'inactive', 'out_of_stock'], default: 'active'),
  location: {
    warehouse: String (default: 'Main Warehouse'),
    aisle: String,
    shelf: String,
    bin: String
  },
  cost: {
    average: Number (default: 0),
    lastPurchase: Number (default: 0),
    fifo: Array,
    lifo: Array
  },
  movements: [{
    type: String (enum: ['in', 'out', 'adjustment', 'return', 'damage', 'theft']),
    quantity: Number,
    reason: String,
    reference: String,
    referenceId: ObjectId,
    referenceModel: String,
    performedBy: ObjectId (ref: 'User'),
    notes: String,
    createdAt: Date
  }],
  reservations: [{
    reservationId: String (required),
    quantity: Number (required, min: 0),
    expiresAt: Date (required),
    reservedBy: ObjectId (ref: 'User'),
    referenceType: String (enum: ['cart', 'sales_order', 'manual', 'system']),
    referenceId: ObjectId,
    createdAt: Date
  }],
  lastUpdated: Date,
  createdAt: Date
}
```

### 4.3 Inventory Operations

#### 4.3.1 Stock Update (Sales)
**When**: Sales order created
**Flow**:
1. Check available stock: `availableStock = currentStock - reservedStock`
2. Validate: `availableStock >= requestedQuantity`
3. Update inventory:
   - Decrease `currentStock` by quantity
   - Create stock movement record (type: 'out')
4. Update `availableStock` automatically
5. Update status if stock reaches 0

#### 4.3.2 Stock Update (Purchase)
**When**: Purchase order received
**Flow**:
1. Increase `currentStock` by received quantity
2. Create stock movement record (type: 'in')
3. Update product cost (if using average cost method)
4. Update `availableStock` automatically
5. Update status if stock > 0 (from 'out_of_stock' to 'active')

#### 4.3.3 Stock Reservation
**When**: Item added to cart or sales order created
**Flow**:
1. Check available stock
2. Create reservation record with expiration
3. Increase `reservedStock`
4. Decrease `availableStock`
5. Auto-release expired reservations (cron job)

#### 4.3.4 Stock Adjustment
**When**: Manual adjustment, damage, theft, etc.
**Flow**:
1. Validate adjustment reason
2. Update `currentStock` (increase or decrease)
3. Create stock movement record (type: 'adjustment', 'damage', 'theft')
4. Update `availableStock`
5. Log audit trail

#### 4.3.5 Stock Return
**When**: Sales return or purchase return
**Flow**:
1. Increase `currentStock` by return quantity
2. Create stock movement record (type: 'return')
3. Update `availableStock`
4. Update product cost (if needed)

### 4.4 Inventory Calculation Methods

#### 4.4.1 Available Stock
```
availableStock = currentStock - reservedStock
```

#### 4.4.2 Stock Status
- `active`: currentStock > 0
- `out_of_stock`: currentStock === 0
- `inactive`: Manually set

#### 4.4.3 Low Stock Alert
Triggered when: `currentStock <= reorderPoint`

### 4.5 Inventory Sync with Products

**Auto-Sync Rules**:
1. When Inventory record doesn't exist: Create from Product.inventory.currentStock
2. When Product stock > Inventory stock: Sync Inventory to match Product
3. When Inventory updated: Update Product.inventory.currentStock (optional, configurable)

**Sync Triggers**:
- Product creation → Auto-create Inventory
- Product stock update → Sync Inventory
- Sales order creation → Check both Product and Inventory, use higher value
- Purchase order received → Update both Product and Inventory

### 4.6 Stock Movements

**Movement Types**:
- `in`: Stock increase (purchase, return)
- `out`: Stock decrease (sale)
- `adjustment`: Manual adjustment
- `return`: Return to supplier or from customer
- `damage`: Damaged goods write-off
- `theft`: Theft write-off

**Movement Record**:
```javascript
{
  type: String,
  quantity: Number,
  reason: String,
  reference: String,
  referenceId: ObjectId,
  referenceModel: String,
  performedBy: ObjectId,
  notes: String,
  createdAt: Date
}
```

### 4.7 Key Service Methods

**File**: `backend/services/inventoryService.js`

- `updateStock(params)`: Update stock with movement record
- `reserveStock(productId, quantity, options)`: Reserve stock
- `releaseStock(reservationId)`: Release reserved stock
- `adjustStock(productId, quantity, reason, userId)`: Manual adjustment
- `getInventoryStatus(productId)`: Get inventory status
- `getInventoryHistory(productId, filters)`: Get stock movement history
- `getInventorySummary()`: Get inventory summary statistics

**File**: `backend/services/stockReservationService.js`

- `reserveStock(productId, quantity, options)`: Reserve stock with expiration
- `releaseStock(reservationId)`: Release reservation
- `clearExpiredReservations()`: Clear expired reservations (cron job)

### 4.8 API Endpoints

- `GET /api/inventory`: List inventory items
- `GET /api/inventory/summary`: Get inventory summary
- `GET /api/inventory/low-stock`: Get low stock items
- `GET /api/inventory/:productId`: Get inventory for product
- `GET /api/inventory/:productId/history`: Get stock movement history
- `POST /api/inventory/update-stock`: Update stock
- `POST /api/inventory/stock-adjustments`: Create stock adjustment
- `POST /api/inventory/reserve-stock`: Reserve stock
- `POST /api/inventory/release-stock`: Release stock

---

## 5. Integration Between Modules

### 5.1 Sales → Inventory → Products

**Flow**:
1. Sales order created
2. Check inventory availability (from Inventory model)
3. If Inventory missing, create from Product stock
4. Update Inventory.currentStock (decrease)
5. Update Product.inventory.currentStock (sync)
6. Create stock movement record
7. Create accounting entries (Revenue, COGS)

### 5.2 Purchase → Inventory → Products

**Flow**:
1. Purchase order created
2. On receipt, update Inventory.currentStock (increase)
3. Update Product.inventory.currentStock (sync)
4. Update product cost (average cost method)
5. Create stock movement record
6. Create accounting entries (Inventory, Accounts Payable)

### 5.3 Inventory → P&L

**Flow**:
1. P&L calculation queries Inventory for:
   - Beginning inventory value
   - Ending inventory value
2. Calculates COGS using inventory formula
3. Uses stock movements for COGS details

### 5.4 Products → P&L

**Flow**:
1. P&L calculation queries Sales orders
2. Gets product costs from Sales order items (unitCost)
3. Calculates COGS: `sum(item.unitCost * item.quantity)`
4. Uses product pricing for revenue calculation

### 5.5 Purchase → P&L

**Flow**:
1. P&L calculation queries Purchase orders
2. Sums purchase totals for COGS calculation
3. Includes freight, returns, discounts
4. Uses purchase data in inventory formula

### 5.6 Accounting Integration

**All modules create accounting entries**:
- **Sales**: Revenue (Credit), COGS (Debit), AR (Debit), Cash (Debit)
- **Purchase**: Inventory (Debit), Accounts Payable (Credit), Cash (Credit)
- **Inventory Adjustments**: Inventory (Debit/Credit), Expense (Debit)
- **P&L**: Reads from Transaction model for revenue and expenses

### 5.7 Data Flow Diagram

```
┌─────────┐
│ Products│
└────┬────┘
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐      ┌──────────┐
│Inventory │      │  Sales   │
└────┬─────┘      └────┬─────┘
     │                 │
     │                 │
     ├─────────┬───────┤
     │         │       │
     ▼         ▼       ▼
┌──────────┐  ┌──────────────┐
│ Purchase │  │  Accounting  │
└────┬─────┘  │  (Transactions)│
     │        └──────┬───────┘
     │               │
     └───────┬───────┘
             │
             ▼
      ┌─────────────┐
      │ Profit &    │
      │   Loss      │
      └─────────────┘
```

### 5.8 Key Integration Points

1. **Stock Synchronization**: Product ↔ Inventory
2. **Cost Calculation**: Purchase → Product → Sales → COGS
3. **Revenue Calculation**: Sales → Transactions → P&L
4. **Expense Calculation**: Transactions → P&L
5. **Accounting Posting**: All modules → Transactions → P&L/Balance Sheet

---

## 6. Common Issues and Solutions

### 6.1 P&L Shows Zero Revenue

**Causes**:
- No transactions created for sales
- Account codes don't match
- Date range incorrect

**Solutions**:
- Check if `AccountingService.recordSale()` is being called
- Verify account codes in Chart of Accounts
- P&L now has fallback to calculate from Sales orders directly

### 6.2 Inventory Out of Sync

**Causes**:
- Product stock updated but Inventory not synced
- Manual inventory adjustments not reflected in Product

**Solutions**:
- Auto-sync on sales/purchase operations
- Manual sync endpoint available
- Use Inventory as source of truth for stock checks

### 6.3 Stock Availability Issues

**Causes**:
- Reserved stock not released
- Available stock calculation incorrect

**Solutions**:
- Check `availableStock = currentStock - reservedStock`
- Clear expired reservations (cron job)
- Manual stock adjustment available

---

## 7. Best Practices

1. **Always use Inventory model** as source of truth for stock availability
2. **Sync Product and Inventory** after stock updates
3. **Create accounting entries** for all financial transactions
4. **Use transactions for P&L** when available, fallback to direct queries
5. **Log all stock movements** for audit trail
6. **Reserve stock** for pending orders to prevent overselling
7. **Update product costs** when purchases are received
8. **Validate stock availability** before creating sales orders

---

## 8. API Response Examples

### 8.1 P&L Summary Response
```json
{
  "totalRevenue": 50000,
  "grossProfit": 30000,
  "operatingIncome": 20000,
  "netIncome": 15000,
  "grossMargin": 60,
  "operatingMargin": 40,
  "netMargin": 30,
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  },
  "lastUpdated": "2024-02-01T10:00:00.000Z"
}
```

### 8.2 Inventory Response
```json
{
  "product": {
    "_id": "...",
    "name": "Product Name"
  },
  "currentStock": 100,
  "reservedStock": 10,
  "availableStock": 90,
  "reorderPoint": 20,
  "status": "active",
  "location": {
    "warehouse": "Main Warehouse"
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team

