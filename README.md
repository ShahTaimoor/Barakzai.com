# Wholesale & Retail POS Accounting System

A professional, unified Point of Sale (POS) and Accounting system built with Node.js, Express, PostgreSQL, and React. This system features double-entry accounting, real-time inventory management, and comprehensive reporting.

## 🚀 Features

### 🛒 Point of Sale (POS)
- **Unified Sales Interface**: Process retail and wholesale transactions with ease.
- **Customer Management**: Quick customer selection with real-time balance and credit limit checks.
- **Flexible Pricing**: Supports multiple price types (Retail, Wholesale, Distributor, Custom).
- **Barcode Integration**: Fast product lookup using barcode scanners.
- **Print after Sale**: Optional automatic invoice printing after transaction completion.

### 📦 Inventory Management
- **Product Variants**: Manage products with different sizes, colors, or types.
- **Stock Tracking**: Real-time stock levels with low-stock alerts.
- **Stock Adjustments**: Tools for manual stock corrections and movements.
- **Categorization**: Multi-level category management for organized inventory.

### 💰 Accounting & Ledger
- **Double-Entry System**: Every transaction automatically posts balanced debits and credits.
- **Unified Cash/Bank Module**: Record receipts and payments for both customers and suppliers in one place.
- **Account Ledger**: Detailed transaction history for every account (Cash, Bank, AR, AP).
- **Profit/Loss Statements**: Real-time calculation of gross and net profit.
- **Atomic Transactions**: Ensures database integrity using PostgreSQL transactions (BEGIN/COMMIT).

### 👥 Party Management
- **Customers & Suppliers**: Comprehensive profiles with business details, contact info, and addresses.
- **Business Name Prioritization**: Consistent display of business names across all modules.
- **Credit Policies**: Manage credit limits and payment terms for customers.

### 📊 Reporting & Tools
- **Excel Import/Export**: Robust tools for importing/exporting customers, cities, and categories.
- **Dashboard**: Real-time summary of sales, purchases, and financial performance.
- **City Management**: Manage geographical data for better customer/supplier tracking.

### 📱 PWA Support
- **Installable App**: Can be installed on mobile and desktop for a native-like experience.
- **Offline Capabilities**: Basic caching for static resources and images.
- **Quick Shortcuts**: Direct access to Dashboard and Sales from the app icon.

## 🛠️ Tech Stack

- **Frontend**: React, Redux Toolkit (RTK Query), Tailwind CSS, Lucide Icons, React Hot Toast.
- **Backend**: Node.js, Express.js, PostgreSQL (`pg` library).
- **Database**: PostgreSQL (Single source of truth via Ledger).
- **Tools**: ExcelJS, XLSX, PDFKit, Multer.

## 📁 Project Structure

```
sa-pos/
├── backend/                # Express.js Server
│   ├── config/             # DB and App configurations
│   ├── middleware/         # Auth, Validation, Error handling
│   ├── migrations/         # PostgreSQL schema migrations
│   ├── models/             # (Legacy MongoDB models)
│   ├── repositories/       # Data access layer (Postgres)
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic layer
│   └── scripts/            # DB reset and seeding scripts
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── store/          # Redux state & RTK Query APIs
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Frontend utilities
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Database Setup
1. Create a PostgreSQL database named `Barakzai` (or as configured in `.env`).
2. Update `backend/.env` with your PostgreSQL credentials:
   ```env
   POSTGRES_HOST=
   POSTGRES_PORT=
   POSTGRES_DB=
   POSTGRES_USER=
   POSTGRES_PASSWOR
   JWT_SECRET=your_jwt_secret
   ```

### 2. Backend Installation
```bash
cd backend
npm install
npm run migrate:postgres    # Run schema migrations
npm run seed:admin          # Create initial admin user
npm run dev                 # Start development server
```

### 3. Frontend Installation
```bash
cd frontend
npm install
npm run dev                 # Start Vite development server
```

## 📜 Key Scripts

- `npm run migrate:postgres`: Applies all SQL migrations to the database.
- `npm run db:reset`: Completely clears the database (drops public schema).
- `npm run seed:admin`: Seeds the default administrator account.
- `npm run seed:data`: Seeds sample products and categories.

## 🔒 Security & Rules

- **Ledger Integrity**: The ledger is the single source of truth for all balances.
- **Account Codes**:
  - `1000`: Cash Account
  - `1001`: Bank Account
  - `1100`: Accounts Receivable (Customers)
  - `2000`: Accounts Payable (Suppliers)
- **Permissions**: Role-based access control (Admin, Manager, User).


