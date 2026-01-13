# Product Flow Documentation

## Overview
This document describes the complete flow of products through the POS system, from creation to deletion, including all operations and integrations.

---

## 1. Product Creation Flow

### 1.1 Manual Creation
```
User Request → Route Handler → Service Layer → Repository → Database
```

**Steps:**
1. **Route**: `POST /api/products`
   - Authentication & Authorization (`create_products` permission)
   - Request validation (name, pricing fields)
   - Sanitization

2. **Service Layer** (`productService.createProduct()`):
   - Validates uniqueness:
     - Product name (case-insensitive)
     - SKU (if provided)
     - Barcode (if provided)
   - Adds user tracking (`createdBy`, `lastModifiedBy`)
   - Creates product via repository

3. **Automatic Inventory Creation**:
   - Creates `Inventory` record automatically
   - Defaults: `currentStock: 0`, `reorderPoint: 10`, `reorderQuantity: 50`
   - Location: Main Warehouse, Aisle A1, Shelf S1

4. **Response**: Returns created product with success message

### 1.2 Bulk Import (CSV/Excel)
```
File Upload → Parse → Validate Each Row → Create Products → Return Results
```

**Steps:**
1. **Route**: `POST /api/products/import/csv` or `/import/excel`
   - File upload validation (CSV/Excel, max 10MB)
   - Parse file content

2. **Processing**:
   - For each row:
     - Validate required fields (name)
     - Check if product already exists
     - Create product using same flow as manual creation
   - Track successes and errors per row

3. **Response**: Summary with total, success count, and error details

---

## 2. Product Retrieval Flow

### 2.1 Get All Products (with Filtering & Pagination)
```
Query Parameters → Build Filter → Repository Query → Transform → Response
```

**Route**: `GET /api/products`

**Filtering Options:**
- **Search**: Multi-field search (name, description, SKU, barcode)
- **Category**: Single or multiple categories
- **Status**: active, inactive, discontinued
- **Price Range**: min/max for cost, retail, wholesale
- **Stock Level**: min/max stock, low stock, out of stock, in stock
- **Date Range**: Filter by createdAt or updatedAt
- **Brand**: Brand name search

**Pagination:**
- Default: 20 per page
- Can fetch all with `all=true` or high limit

**Response Transformation:**
- Product names converted to UPPERCASE
- Populates category and investors

### 2.2 Get Single Product
**Route**: `GET /api/products/:id`
- Fetches by ID
- Populates category and investors
- Returns 404 if not found

### 2.3 Search Products
**Route**: `GET /api/products/search/:query`
- Quick search by name
- Returns up to 10 active products
- Names in UPPERCASE

### 2.4 Low Stock Products
**Route**: `GET /api/products/low-stock`
- Finds products where `currentStock <= reorderPoint`
- Sorted by stock level (lowest first)

---

## 3. Product Update Flow

### 3.1 Single Product Update
```
Request → Validation → Uniqueness Check → Update → Response
```

**Route**: `PUT /api/products/:id`

**Process:**
1. Validates update data
2. Checks uniqueness (name, SKU, barcode) excluding current product
3. Updates product via repository
4. Updates `lastModifiedBy` with current user
5. Returns updated product

### 3.2 Bulk Update
**Route**: `PUT /api/products/bulk`

**Supported Updates:**
- **Price Updates**:
  - Set: Direct value assignment
  - Increase: Add value to current price
  - Decrease: Subtract value from current price
  - Percentage: Apply percentage change
- **Category Update**: Change category for multiple products
- **Status Update**: Change status (active/inactive/discontinued)
- **Stock Adjustment**:
  - Set: Direct stock value
  - Increase: Add to current stock
  - Decrease: Subtract from current stock

---

## 4. Product Deletion Flow

### 4.1 Soft Delete (Single)
```
Request → Find Product → Soft Delete → Response
```

**Route**: `DELETE /api/products/:id`

**Process:**
1. Finds product by ID
2. Performs soft delete (sets `isDeleted: true`, `deletedAt: timestamp`)
3. Product remains in database but excluded from normal queries

### 4.2 Bulk Delete
**Route**: `DELETE /api/products/bulk`
- Soft deletes multiple products at once
- Returns count of deleted products

### 4.3 Restore Deleted Product
**Route**: `POST /api/products/:id/restore`
- Restores soft-deleted product
- Sets `isDeleted: false`, clears `deletedAt`

### 4.4 View Deleted Products
**Route**: `GET /api/products/deleted`
- Lists all soft-deleted products
- Sorted by deletion date (newest first)

---

## 5. Product Integration Flows

### 5.1 Purchase Invoice Integration
```
Purchase Invoice Created → Products Referenced → Stock Updated
```

**Flow:**
1. Purchase invoice contains product items
2. Each item references a product with:
   - Product ID
   - Quantity purchased
   - Unit cost
   - Total cost
3. When invoice is processed:
   - Product stock increases
   - Last purchase price tracked (via `getLastPurchasePrice()`)

**Service Method**: `productService.getLastPurchasePrice(productId)`
- Queries purchase invoices for product
- Returns last purchase price, invoice number, and date

### 5.2 Sales Integration
```
Sale Created → Product Validation → Stock Check → Stock Deduction
```

**Flow:**
1. Sales order contains product items
2. Before sale:
   - Validates product exists
   - Checks stock availability (from Inventory model)
   - Uses higher of Product.inventory.currentStock or Inventory.currentStock
3. During sale:
   - Calculates price based on customer type (retail/wholesale/distributor)
   - Applies bulk discounts if applicable
   - Validates sufficient stock
4. After sale:
   - Stock is deducted from inventory
   - Product inventory updated

**Price Calculation**:
- Uses `product.getPriceForCustomerType(customerType, quantity)`
- Applies bulk discounts from `wholesaleSettings.bulkDiscounts`

### 5.3 Purchase Order Integration
```
Purchase Order → Products Listed → Order Confirmed → Stock Received
```

**Flow:**
1. Purchase order references products
2. Tracks:
   - Requested quantity
   - Received quantity
   - Remaining quantity
3. When order is received:
   - Stock updated via purchase invoice

---

## 6. Product Export/Import Flow

### 6.1 Export to CSV
**Route**: `POST /api/products/export/csv`
- Applies filters if provided
- Generates CSV with all product fields
- Returns download URL

### 6.2 Export to Excel
**Route**: `POST /api/products/export/excel`
- Applies filters if provided
- Generates Excel file with formatted columns
- Falls back to CSV if Excel generation fails
- Returns download URL

### 6.3 Download Template
**Route**: `GET /api/products/template/csv`
- Downloads CSV template with sample data
- Shows required field format

---

## 7. Product Investor Management

### 7.1 Link Investors to Product
**Route**: `POST /api/products/:id/investors`

**Flow:**
1. Validates investor IDs exist
2. Links investors with share percentages
3. Sets `hasInvestors: true` if investors added
4. Tracks `addedAt` timestamp

### 7.2 Remove Investor
**Route**: `DELETE /api/products/:id/investors/:investorId`
- Removes investor from product
- Updates `hasInvestors` flag if no investors remain

---

## 8. Product Price Check Flow

### 8.1 Price Check for Customer Type
**Route**: `POST /api/products/:id/price-check`

**Process:**
1. Validates customer type (retail/wholesale/distributor/individual)
2. Validates quantity
3. Calculates price using `getPriceForCustomerType()`
4. Returns:
   - Unit price
   - Total price (unit × quantity)
   - Available stock

---

## 9. Product Data Model

### Core Fields:
- **Basic**: name, description, category, brand
- **Identifiers**: SKU, barcode
- **Pricing**: cost, retail, wholesale, distributor
- **Inventory**: currentStock, minStock, maxStock, reorderPoint
- **Settings**: wholesaleSettings, taxSettings
- **Relations**: suppliers, investors, category
- **Metadata**: createdBy, lastModifiedBy, timestamps
- **Soft Delete**: isDeleted, deletedAt

### Indexes:
- Text search on name and description
- Category and status
- Stock levels
- Brand and status
- Investor flag

---

## 10. Product Lifecycle States

```
[Created] → [Active] → [Inactive] → [Discontinued]
                ↓
            [Soft Deleted]
                ↓
            [Restored] → [Active]
```

**Status Values:**
- **active**: Product is available for sale
- **inactive**: Product exists but not available
- **discontinued**: Product no longer sold
- **isDeleted: true**: Soft deleted (excluded from queries)

---

## 11. Key Service Methods

### ProductService Methods:
1. `createProduct()` - Create with validation
2. `updateProduct()` - Update with uniqueness checks
3. `deleteProduct()` - Soft delete
4. `getProducts()` - List with filtering/pagination
5. `getProductById()` - Get single product
6. `searchProducts()` - Quick name search
7. `getLowStockProducts()` - Find low stock items
8. `bulkUpdateProducts()` - Simple bulk update
9. `bulkUpdateProductsAdvanced()` - Complex bulk operations
10. `bulkDeleteProducts()` - Bulk soft delete
11. `getPriceForCustomerType()` - Price calculation
12. `updateProductInvestors()` - Link investors
13. `removeProductInvestor()` - Remove investor
14. `getLastPurchasePrice()` - Get last purchase info
15. `getLastPurchasePrices()` - Bulk purchase price lookup
16. `getProductsForExport()` - Export data preparation

---

## 12. Error Handling

### Common Errors:
- **Duplicate Name**: Product name already exists
- **Duplicate SKU**: SKU already in use
- **Duplicate Barcode**: Barcode already in use
- **Product Not Found**: Invalid product ID
- **Insufficient Stock**: Not enough stock for sale
- **Validation Error**: Invalid input data

---

## 13. Data Flow Diagram

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Routes     │ (Validation, Auth, Permissions)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service    │ (Business Logic, Validation)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │ (Database Queries)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   MongoDB    │ (Product Collection)
└─────────────┘
       │
       ▼
┌─────────────┐
│  Inventory  │ (Separate Inventory Tracking)
└─────────────┘
```

---

## 14. Integration Points

### Products interact with:
1. **Categories**: Product categorization
2. **Suppliers**: Product sourcing
3. **Investors**: Product ownership/share tracking
4. **Inventory**: Stock level tracking
5. **Purchase Invoices**: Stock additions, cost tracking
6. **Sales**: Stock deductions, pricing
7. **Purchase Orders**: Order planning
8. **Users**: Created by, modified by tracking

---

---

## 15. Enterprise Features (NEW)

### 15.1 Optimistic Locking
**Purpose**: Prevents concurrent update conflicts

**How it works:**
1. Each product has a `version` field (Mongoose `__v`)
2. When updating, client must send current version
3. Server checks version matches before update
4. If version mismatch, returns error: "Product was modified by another user"

**Usage:**
```javascript
// Frontend must include version
PUT /api/products/:id
Body: {
  name: "Updated Name",
  version: 5  // Current version from GET request
}
```

### 15.2 Audit Logging
**Purpose**: Complete audit trail for compliance and security

**Features:**
- Tracks all product changes (create, update, delete)
- Records field-level changes
- Captures user, IP address, user agent, timestamp
- Stores before/after values
- Queryable by product, user, action, date range

**Endpoints:**
- `GET /api/products/:id/audit-logs` - Get audit logs for a product

**Logged Actions:**
- CREATE, UPDATE, DELETE, RESTORE
- STOCK_ADJUSTMENT, PRICE_CHANGE, STATUS_CHANGE
- BULK_UPDATE, IMPORT, EXPORT

### 15.3 Costing Methods
**Purpose**: Accurate cost calculation for COGS and profit margins

**Supported Methods:**
- **Standard**: Uses `product.pricing.cost` directly
- **FIFO**: First In First Out (oldest stock first)
- **LIFO**: Last In First Out (newest stock first)
- **Average**: Weighted average cost

**Usage:**
```javascript
// Set costing method when creating/updating product
POST /api/products
Body: {
  name: "Product",
  costingMethod: "fifo",  // or "lifo", "average", "standard"
  // ... other fields
}

// Calculate cost for quantity
POST /api/products/:id/calculate-cost
Body: { quantity: 10 }
```

**FIFO/LIFO Implementation:**
- Batches stored in `Inventory.cost.fifo` array
- Each batch has: quantity, cost, date, purchaseOrder
- Automatically updated on purchase/sale

### 15.4 Stock Reservations with Expiration
**Purpose**: Prevent stock overselling and manage cart reservations

**Features:**
- Reserve stock with expiration time (default: 15 minutes)
- Automatic release of expired reservations
- Support for different reservation types (cart, sales_order, manual)
- Track available stock (currentStock - reservedStock)

**Reservation Types:**
- `cart`: Shopping cart reservations (15 min default)
- `sales_order`: Sales order reservations (longer expiration)
- `manual`: Manual reservations
- `system`: System-generated reservations

**Automatic Cleanup:**
- Cron job runs every 5 minutes to release expired reservations
- See `backend/jobs/maintenanceJobs.js`

### 15.5 Expiry Date Management & FEFO
**Purpose**: Manage product expiry and prevent selling expired items

**Features:**
- Batch/lot tracking with expiry dates
- FEFO (First Expired First Out) for sales
- Expiry alerts (30, 15, 7 days before)
- Automated expiry write-off
- Expired product queries

**Endpoints:**
- `GET /api/products/expiring-soon?days=30` - Get products expiring soon
- `GET /api/products/expired` - Get expired products
- `POST /api/products/:id/write-off-expired` - Write off expired inventory

**Batch Model:**
- Tracks batch numbers, lot numbers
- Expiry dates, manufacture dates
- Quality checks, recall management
- Location tracking

**FEFO Sales:**
- Automatically selects batches with oldest expiry first
- Ensures expired products are never sold
- Integrates with costing methods

### 15.6 Batch/Lot Tracking
**Purpose**: Track inventory by batch for quality control and recalls

**Features:**
- Unique batch numbers per product
- Lot number tracking
- Expiry date per batch
- Quality check tracking
- Recall management
- Location tracking per batch

**Use Cases:**
- Food/pharmaceutical products
- Product recalls
- Quality control
- Regulatory compliance

---

## Summary

The product flow in this POS system follows a layered architecture:
- **Routes** handle HTTP requests and validation
- **Service** contains business logic
- **Repository** manages database operations
- **Model** defines data structure

Products support:
- ✅ CRUD operations (with soft delete)
- ✅ Bulk operations
- ✅ Import/Export (CSV/Excel)
- ✅ Advanced filtering and search
- ✅ Multi-level pricing
- ✅ Inventory integration
- ✅ Investor tracking
- ✅ Purchase history tracking
- ✅ **Optimistic locking** (prevents concurrent conflicts)
- ✅ **Comprehensive audit logging** (compliance & security)
- ✅ **Multiple costing methods** (FIFO/LIFO/Average)
- ✅ **Stock reservations with expiration** (prevents overselling)
- ✅ **Expiry management & FEFO** (regulatory compliance)
- ✅ **Batch/lot tracking** (quality control & recalls)

