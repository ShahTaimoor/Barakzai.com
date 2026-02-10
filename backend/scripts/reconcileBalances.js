const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const accountLedgerService = require('../services/accountLedgerService');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Mock request/response objects if necessary, but here we are using service directly.

async function reconcile() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const startDate = '1970-01-01';
        const endDate = '2099-12-31';

        console.log(`Fetching Ledger Summary (Date Range: ${startDate} to ${endDate})...`);

        // We want to fetch all, so we don't pass IDs.
        // Note: getLedgerSummary fetches all if no ID is passed.
        const ledgerResult = await accountLedgerService.getLedgerSummary({
            startDate,
            endDate
        });

        if (!ledgerResult.success) {
            console.error('Failed to get ledger summary:', ledgerResult);
            process.exit(1);
        }

        const { customers: customerLedger, suppliers: supplierLedger } = ledgerResult.data;

        console.log(`Ledger contains ${customerLedger.count} customers and ${supplierLedger.count} suppliers.`);

        // Fetch actual profiles with current balance
        console.log('Fetching actual profiles...');
        const allCustomers = await Customer.find({}).select('_id businessName name currentBalance openingBalance');
        const allSuppliers = await Supplier.find({}).select('_id companyName contactPerson currentBalance openingBalance');

        const customerMap = new Map(allCustomers.map(c => [c._id.toString(), c]));
        const supplierMap = new Map(allSuppliers.map(s => [s._id.toString(), s]));

        const discrepancies = [];

        // Check Customers
        console.log('\nChecking Customers...');
        for (const led of customerLedger.summary) {
            const profile = customerMap.get(led.id.toString());
            if (!profile) {
                console.warn(`Customer found in ledger but not in DB? ID: ${led.id}`);
                continue;
            }

            // Ledger Closing Balance vs Profile Current Balance
            const ledgerBalance = led.closingBalance;
            const profileBalance = profile.currentBalance;

            // Allow small floating point diff
            if (Math.abs(ledgerBalance - profileBalance) > 0.01) {
                discrepancies.push({
                    type: 'Customer',
                    id: profile._id,
                    name: profile.businessName || profile.name,
                    profileBalance: profileBalance,
                    ledgerBalance: ledgerBalance,
                    diff: profileBalance - ledgerBalance
                });
            }
        }

        // Check Suppliers
        console.log('\nChecking Suppliers...');
        for (const led of supplierLedger.summary) {
            const profile = supplierMap.get(led.id.toString());
            if (!profile) {
                console.warn(`Supplier found in ledger but not in DB? ID: ${led.id}`);
                continue;
            }

            const ledgerBalance = led.closingBalance;
            const profileBalance = profile.currentBalance;

            if (Math.abs(ledgerBalance - profileBalance) > 0.01) {
                discrepancies.push({
                    type: 'Supplier',
                    id: profile._id,
                    name: profile.companyName || (profile.contactPerson ? profile.contactPerson.name : 'Unknown'),
                    profileBalance: profileBalance,
                    ledgerBalance: ledgerBalance,
                    diff: profileBalance - ledgerBalance
                });
            }
        }

        console.log('\n==========================================');
        console.log('RECONCILIATION REPORT');
        console.log('==========================================');

        if (discrepancies.length === 0) {
            console.log('All profiles match the ledger!');
        } else {
            console.log(`Found ${discrepancies.length} discrepancies.`);

            discrepancies.forEach(d => {
                const action = d.diff > 0
                    ? `Profile is higher by ${d.diff.toFixed(2)}. Action: Decrease Profile Balance.`
                    : `Profile is lower by ${Math.abs(d.diff).toFixed(2)}. Action: Increase Profile Balance.`;

                console.log(`\n[${d.type}] ${d.name} (${d.id})`);
                console.log(`  Profile Balance: ${d.profileBalance.toFixed(2)}`);
                console.log(`  Ledger Balance:  ${d.ledgerBalance.toFixed(2)}`);
                console.log(`  Difference:      ${d.diff.toFixed(2)}`);
                console.log(`  Recommendation:  ${action}`);
            });

            console.log('\nTo fix these discrepancies, run this script with --fix flag.');
        }

        // Handle Fix
        if (process.argv.includes('--fix') && discrepancies.length > 0) {
            console.log('\nApplying fixes...');
            for (const d of discrepancies) {
                console.log(`Updating ${d.type} ${d.name}...`);
                if (d.type === 'Customer') {
                    await Customer.updateOne({ _id: d.id }, { $set: { currentBalance: d.ledgerBalance } });
                } else {
                    await Supplier.updateOne({ _id: d.id }, { $set: { currentBalance: d.ledgerBalance } });
                }
            }
            console.log('Fixes applied.');
        }

    } catch (error) {
        console.error('Error running reconciliation:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

reconcile();
