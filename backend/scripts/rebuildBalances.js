/**
 * Balance Rebuild Script
 * 
 * This script rebuilds all customer and supplier balances from the Account Ledger.
 * It ensures the Account Ledger is the single source of truth.
 * 
 * Usage: node scripts/rebuildBalances.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const CustomerTransaction = require('../models/CustomerTransaction');
const Sales = require('../models/Sales');
const SalesOrder = require('../models/SalesOrder');
const CashReceipt = require('../models/CashReceipt');
const BankReceipt = require('../models/BankReceipt');
const Return = require('../models/Return');
const PurchaseInvoice = require('../models/PurchaseInvoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const CashPayment = require('../models/CashPayment');
const BankPayment = require('../models/BankPayment');

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-system');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

/**
 * Calculate customer balance from all transactions
 */
async function calculateCustomerBalance(customerId) {
    let balance = 0;

    // Sales Invoices (increase balance - debit)
    // NOTE: Include ALL sales, not just confirmed, to match Account Ledger Summary
    const sales = await Sales.find({
        customer: customerId,
        isDeleted: { $ne: true }
    }).lean();

    const salesTotal = sales.reduce((sum, sale) => sum + (sale.pricing?.total || 0), 0);
    balance += salesTotal;

    // Cash Payments TO customer (increase balance - debit) - advances/refunds
    const cashPayments = await CashPayment.find({
        customer: customerId
    }).lean();

    const cashPaymentsTotal = cashPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    balance += cashPaymentsTotal;

    // Bank Payments TO customer (increase balance - debit) - advances/refunds
    const bankPayments = await BankPayment.find({
        customer: customerId
    }).lean();

    const bankPaymentsTotal = bankPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    balance += bankPaymentsTotal;

    // Cash Receipts FROM customer (decrease balance - credit)
    const cashReceipts = await CashReceipt.find({
        customer: customerId
    }).lean();

    const cashReceiptsTotal = cashReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    balance -= cashReceiptsTotal;

    // Bank Receipts FROM customer (decrease balance - credit)
    const bankReceipts = await BankReceipt.find({
        customer: customerId
    }).lean();

    const bankReceiptsTotal = bankReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    balance -= bankReceiptsTotal;

    // Sales Returns (decrease balance - credit)
    const returns = await Return.find({
        customer: customerId,
        origin: 'sales',
        status: { $in: ['completed', 'refunded', 'approved', 'received'] },
        isDeleted: { $ne: true }
    }).lean();

    const returnsTotal = returns.reduce((sum, ret) => sum + (ret.netRefundAmount || ret.totalRefundAmount || 0), 0);
    balance -= returnsTotal;

    return Math.round(balance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate supplier balance from all transactions
 */
async function calculateSupplierBalance(supplierId) {
    let balance = 0;

    // Purchase Invoices (increase balance - credit/payable)
    // NOTE: Only CONFIRMED purchases, to match Account Ledger Summary
    const purchases = await PurchaseInvoice.find({
        supplier: supplierId,
        status: 'confirmed',
        isDeleted: { $ne: true }
    }).lean();

    const purchasesTotal = purchases.reduce((sum, purchase) => sum + (purchase.pricing?.total || 0), 0);
    balance += purchasesTotal;

    // Cash Payments TO supplier (decrease balance - debit)
    const cashPayments = await CashPayment.find({
        supplier: supplierId
    }).lean();

    const cashPaymentsTotal = cashPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    balance -= cashPaymentsTotal;

    // Bank Payments TO supplier (decrease balance - debit)
    const bankPayments = await BankPayment.find({
        supplier: supplierId
    }).lean();

    const bankPaymentsTotal = bankPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    balance -= bankPaymentsTotal;

    // Cash Receipts FROM supplier (decrease balance - debit) - refunds/advances from supplier
    const cashReceipts = await CashReceipt.find({
        supplier: supplierId
    }).lean();

    const cashReceiptsTotal = cashReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    balance -= cashReceiptsTotal;

    // Bank Receipts FROM supplier (decrease balance - debit) - refunds/advances from supplier
    const bankReceipts = await BankReceipt.find({
        supplier: supplierId
    }).lean();

    const bankReceiptsTotal = bankReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    balance -= bankReceiptsTotal;

    // Purchase Returns (decrease balance - debit)
    const returns = await Return.find({
        supplier: supplierId,
        origin: 'purchase',
        status: { $in: ['completed', 'refunded', 'approved', 'received'] },
        isDeleted: { $ne: true }
    }).lean();

    const returnsTotal = returns.reduce((sum, ret) => sum + (ret.netRefundAmount || ret.totalRefundAmount || 0), 0);
    balance -= returnsTotal;

    return Math.round(balance * 100) / 100; // Round to 2 decimal places
}

/**
 * Rebuild all customer balances
 */
async function rebuildCustomerBalances() {
    console.log('\n📊 Rebuilding Customer Balances...\n');

    const customers = await Customer.find({}).lean();
    let updated = 0;
    let errors = 0;

    for (const customer of customers) {
        try {
            const calculatedBalance = await calculateCustomerBalance(customer._id);
            const oldBalance = customer.currentBalance || 0;

            await Customer.findByIdAndUpdate(customer._id, {
                currentBalance: calculatedBalance
            });

            const diff = calculatedBalance - oldBalance;
            const status = Math.abs(diff) < 0.01 ? '✅' : '🔄';

            console.log(`${status} ${customer.name || 'Unknown'}`);
            console.log(`   Old: ${oldBalance.toFixed(2)} → New: ${calculatedBalance.toFixed(2)} (Diff: ${diff.toFixed(2)})`);

            updated++;
        } catch (error) {
            console.error(`❌ Error updating ${customer.name}:`, error.message);
            errors++;
        }
    }

    console.log(`\n✅ Updated ${updated} customers`);
    if (errors > 0) {
        console.log(`❌ ${errors} errors encountered`);
    }
}

/**
 * Rebuild all supplier balances
 */
async function rebuildSupplierBalances() {
    console.log('\n📊 Rebuilding Supplier Balances...\n');

    const suppliers = await Supplier.find({}).lean();
    let updated = 0;
    let errors = 0;

    for (const supplier of suppliers) {
        try {
            const calculatedBalance = await calculateSupplierBalance(supplier._id);
            const oldBalance = supplier.pendingBalance || 0;

            await Supplier.findByIdAndUpdate(supplier._id, {
                pendingBalance: calculatedBalance
            });

            const diff = calculatedBalance - oldBalance;
            const status = Math.abs(diff) < 0.01 ? '✅' : '🔄';

            console.log(`${status} ${supplier.name || supplier.companyName || 'Unknown'}`);
            console.log(`   Old: ${oldBalance.toFixed(2)} → New: ${calculatedBalance.toFixed(2)} (Diff: ${diff.toFixed(2)})`);

            updated++;
        } catch (error) {
            console.error(`❌ Error updating ${supplier.name || supplier.companyName}:`, error.message);
            errors++;
        }
    }

    console.log(`\n✅ Updated ${updated} suppliers`);
    if (errors > 0) {
        console.log(`❌ ${errors} errors encountered`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 BALANCE REBUILD SCRIPT');
    console.log('═══════════════════════════════════════════════════════');
    console.log('This script will recalculate all balances from the');
    console.log('Account Ledger (single source of truth)');
    console.log('═══════════════════════════════════════════════════════\n');

    await connectDB();

    const startTime = Date.now();

    try {
        // Rebuild customer balances
        await rebuildCustomerBalances();

        // Rebuild supplier balances
        await rebuildSupplierBalances();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log(`✅ Balance rebuild completed in ${duration}s`);
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB\n');
    }
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
