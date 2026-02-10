const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Sales = require('../models/Sales');
const PurchaseInvoice = require('../models/PurchaseInvoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const SalesOrder = require('../models/SalesOrder');
const Transaction = require('../models/Transaction');

async function reconcile() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const discrepancies = [];

        // 1. Reconcile Sales (Invoices)
        console.log('\nChecking Sales Invoices...');
        const sales = await Sales.find({ isDeleted: { $ne: true } });
        for (const sale of sales) {
            const calculatedBalance = sale.pricing.total - sale.payment.amountPaid;
            const storedBalance = sale.payment.remainingBalance;

            // Check internal consistency
            if (Math.abs(calculatedBalance - storedBalance) > 0.01) {
                discrepancies.push({
                    type: 'Sales Invoice Balance',
                    ref: sale.orderNumber,
                    id: sale._id,
                    expected: calculatedBalance,
                    actual: storedBalance,
                    msg: `Internal mismatch: Total(${sale.pricing.total}) - Paid(${sale.payment.amountPaid}) = ${calculatedBalance.toFixed(2)}, but stored is ${storedBalance.toFixed(2)}`
                });
            }

            // Status check
            const paidSI = sale.payment.amountPaid;
            const totalSI = sale.pricing.total;
            let expectedStatusSI = 'pending';
            if (paidSI >= totalSI && totalSI > 0) expectedStatusSI = 'paid';
            else if (paidSI > 0) expectedStatusSI = 'partial';

            if (sale.payment.status !== expectedStatusSI && sale.status !== 'cancelled' && sale.status !== 'returned') {
                discrepancies.push({
                    type: 'Sales Invoice Status',
                    ref: sale.orderNumber,
                    id: sale._id,
                    expected: expectedStatusSI,
                    actual: sale.payment.status,
                    msg: `Status mismatch: Total(${totalSI}), Paid(${paidSI}) => should be ${expectedStatusSI}`
                });
            }

            // Check against Ledger (Transaction model)
            // Sales invoices (SI) should have a DEBIT for the total amount in the ledger
            const transactions = await Transaction.find({
                $or: [
                    { orderId: sale._id },
                    { reference: sale.orderNumber },
                    { description: { $regex: sale.orderNumber, $options: 'i' } }
                ],
                isDeleted: { $ne: true }
            });

            const ledgerTotal = transactions.reduce((sum, t) => {
                // If it's a sale transaction, it increases the receivable (DEBIT)
                // If it's a refund, it decreases it
                if (t.type === 'sale') return sum + t.amount;
                if (t.type === 'refund') return sum - t.amount;
                return sum;
            }, 0);

            // Note: This logic depends on how the system logs transactions. 
            // If the entire invoice is logged as one 'sale' transaction:
            if (ledgerTotal > 0 && Math.abs(ledgerTotal - sale.pricing.total) > 0.01) {
                discrepancies.push({
                    type: 'Sales Invoice Ledger',
                    ref: sale.orderNumber,
                    id: sale._id,
                    expected: sale.pricing.total,
                    actual: ledgerTotal,
                    msg: `Ledger total(${ledgerTotal}) does not match Invoice total(${sale.pricing.total})`
                });
            }
        }

        // 2. Reconcile Purchase Invoices
        console.log('\nChecking Purchase Invoices...');
        const purchases = await PurchaseInvoice.find({ isDeleted: { $ne: true } });
        for (const pi of purchases) {
            // PI pricing total calculation check
            let calcTotal = pi.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
            calcTotal = calcTotal - (pi.pricing.discountAmount || 0) + (pi.pricing.taxAmount || 0);

            if (Math.abs(calcTotal - pi.pricing.total) > 0.01) {
                discrepancies.push({
                    type: 'Purchase Invoice Total',
                    ref: pi.invoiceNumber,
                    id: pi._id,
                    expected: calcTotal,
                    actual: pi.pricing.total,
                    msg: `Pricing summary mismatch with item totals.`
                });
            }

            // Status check
            const paid = pi.payment.paidAmount;
            const total = pi.pricing.total;
            let expectedStatus = 'pending';
            if (paid >= total && total > 0) expectedStatus = 'paid';
            else if (paid > 0) expectedStatus = 'partial';

            if (pi.payment.status !== expectedStatus && pi.status !== 'draft' && pi.status !== 'cancelled') {
                discrepancies.push({
                    type: 'Purchase Invoice Status',
                    ref: pi.invoiceNumber,
                    id: pi._id,
                    expected: expectedStatus,
                    actual: pi.payment.status,
                    msg: `Status mismatch: Total(${total}), Paid(${paid}) => should be ${expectedStatus}`
                });
            }
        }

        // 3. Reconcile Purchase Orders
        console.log('\nChecking Purchase Orders...');
        const pos = await PurchaseOrder.find({ isDeleted: { $ne: true } });
        for (const po of pos) {
            const itemTotal = po.items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
            const grandTotal = itemTotal + (po.tax || 0);

            if (Math.abs(grandTotal - po.total) > 0.01) {
                discrepancies.push({
                    type: 'Purchase Order Total',
                    ref: po.poNumber,
                    id: po._id,
                    expected: grandTotal,
                    actual: po.total,
                    msg: `Grand total mismatch with item totals.`
                });
            }

            // Status check
            const totalQty = po.items.reduce((sum, item) => sum + item.quantity, 0);
            const receivedQty = po.items.reduce((sum, item) => sum + item.receivedQuantity, 0);

            let expectedStatus = po.status;
            if (receivedQty === 0 && totalQty > 0) {
                if (po.status !== 'draft' && po.status !== 'confirmed' && po.status !== 'cancelled') expectedStatus = 'confirmed';
            } else if (receivedQty >= totalQty && totalQty > 0) {
                expectedStatus = 'fully_received';
            } else if (receivedQty > 0) {
                expectedStatus = 'partially_received';
            }

            if (po.status !== expectedStatus && po.status !== 'cancelled' && po.status !== 'closed' && po.status !== 'draft') {
                discrepancies.push({
                    type: 'Purchase Order Status',
                    ref: po.poNumber,
                    id: po._id,
                    expected: expectedStatus,
                    actual: po.status,
                    msg: `Status mismatch: Ordered(${totalQty}), Received(${receivedQty}) => should be ${expectedStatus}`
                });
            }
        }

        // 4. Reconcile Sales Orders
        console.log('\nChecking Sales Orders...');
        const sos = await SalesOrder.find({ isDeleted: { $ne: true } });
        for (const so of sos) {
            const itemTotal = so.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            const grandTotal = itemTotal + (so.tax || 0);

            if (Math.abs(grandTotal - so.total) > 0.01) {
                discrepancies.push({
                    type: 'Sales Order Total',
                    ref: so.soNumber,
                    id: so._id,
                    expected: grandTotal,
                    actual: so.total,
                    msg: `Grand total mismatch with item totals.`
                });
            }

            // Status check
            const totalQty = so.items.reduce((sum, item) => sum + item.quantity, 0);
            const invoicedQty = so.items.reduce((sum, item) => sum + item.invoicedQuantity, 0);

            let expectedStatus = so.status;
            if (invoicedQty === 0 && totalQty > 0) {
                if (so.status !== 'draft' && so.status !== 'confirmed' && so.status !== 'cancelled') expectedStatus = 'confirmed';
            } else if (invoicedQty >= totalQty && totalQty > 0) {
                expectedStatus = 'fully_invoiced';
            } else if (invoicedQty > 0) {
                expectedStatus = 'partially_invoiced';
            }

            if (so.status !== expectedStatus && so.status !== 'cancelled' && so.status !== 'closed' && so.status !== 'draft') {
                discrepancies.push({
                    type: 'Sales Order Status',
                    ref: so.soNumber,
                    id: so._id,
                    expected: expectedStatus,
                    actual: so.status,
                    msg: `Status mismatch: Ordered(${totalQty}), Invoiced(${invoicedQty}) => should be ${expectedStatus}`
                });
            }
        }

        console.log('\n==========================================');
        console.log('ORDER/INVOICE RECONCILIATION REPORT');
        console.log('==========================================');

        if (discrepancies.length === 0) {
            console.log('All orders and invoices are consistent!');
        } else {
            console.log(`Found ${discrepancies.length} issues.`);
            discrepancies.forEach(d => {
                console.log(`\n[${d.type}] ${d.ref}`);
                console.log(`  Expected: ${d.expected}`);
                console.log(`  Actual:   ${d.actual}`);
                console.log(`  Issue:    ${d.msg}`);
            });

            if (process.argv.includes('--fix')) {
                console.log('\nApplying fixes...');
                for (const d of discrepancies) {
                    if (d.type === 'Sales Invoice Balance') {
                        await Sales.updateOne({ _id: d.id }, { $set: { 'payment.remainingBalance': d.expected } });
                    } else if (d.type === 'Sales Invoice Status') {
                        await Sales.updateOne({ _id: d.id }, { $set: { 'payment.status': d.expected } });
                    } else if (d.type === 'Purchase Invoice Status') {
                        await PurchaseInvoice.updateOne({ _id: d.id }, { $set: { 'payment.status': d.expected } });
                    } else if (d.type === 'Purchase Order Status') {
                        await PurchaseOrder.updateOne({ _id: d.id }, { $set: { status: d.expected } });
                    } else if (d.type === 'Sales Order Status') {
                        await SalesOrder.updateOne({ _id: d.id }, { $set: { status: d.expected } });
                    } else if (d.type === 'Purchase Invoice Total') {
                        await PurchaseInvoice.updateOne({ _id: d.id }, { $set: { 'pricing.total': d.expected } });
                    } else if (d.type === 'Purchase Order Total') {
                        await PurchaseOrder.updateOne({ _id: d.id }, { $set: { total: d.expected } });
                    } else if (d.type === 'Sales Order Total') {
                        await SalesOrder.updateOne({ _id: d.id }, { $set: { total: d.expected } });
                    }
                }
                console.log('Fixes applied.');
            } else {
                console.log('\nRun with --fix to apply automated corrections.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

reconcile();
