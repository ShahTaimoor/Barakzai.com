const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const reconciliationService = require('../services/reconciliationService');

async function testJob() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Running Full System Reconciliation (Dry Run)...');
        const results = await reconciliationService.runFullSystemReconciliation({
            autoCorrect: false
        });

        console.log('Reconciliation Results:');
        console.log(JSON.stringify(results, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

testJob();
