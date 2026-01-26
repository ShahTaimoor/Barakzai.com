/**
 * Script to check if shops have invoices
 * This helps debug why invoices are not showing
 */

const path = require('path');
const fs = require('fs');

// Try to load .env from multiple possible locations
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend/.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const shopRepository = require('../repositories/master/ShopRepository');
const { getShopConnection } = require('../services/databaseConnectionService');
const PurchaseInvoice = require('../models/PurchaseInvoice');

async function checkShopInvoices() {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required.');
      process.exit(1);
    }

    console.log('🔌 Connecting to Master Database...\n');
    await connectDB();
    console.log('✅ Master Database connected\n');

    // Get all shops
    console.log('📋 Getting all shops...\n');
    const shops = await shopRepository.findAll({});
    console.log(`✅ Found ${shops.length} shop(s)\n`);

    if (shops.length === 0) {
      console.log('❌ No shops found. Create shops first.\n');
      process.exit(0);
    }

    let totalInvoices = 0;
    const shopInvoiceCounts = [];

    // Check each shop
    for (const shop of shops) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 Checking shop: ${shop.shopName} (${shop.shopId})`);
      console.log(`   Status: ${shop.status}`);
      console.log(`   Admin Email: ${shop.adminEmail}\n`);

      try {
        // Get decrypted database URL
        const databaseUrl = shop.getDecryptedDatabaseUrl();
        console.log(`   ✅ Database URL decrypted`);

        // Connect to shop database
        const shopConnection = await getShopConnection(databaseUrl, shop.shopId);
        console.log(`   ✅ Connected to shop database: ${shopConnection.db.databaseName}`);

        // Get PurchaseInvoice model
        const ShopPurchaseInvoice = shopConnection.model('PurchaseInvoice', PurchaseInvoice.schema);

        // Count all invoices (including deleted for debugging)
        const totalCount = await ShopPurchaseInvoice.countDocuments({});
        const activeCount = await ShopPurchaseInvoice.countDocuments({ isDeleted: { $ne: true } });
        const deletedCount = await ShopPurchaseInvoice.countDocuments({ isDeleted: true });

        console.log(`\n   📊 Invoice Statistics:`);
        console.log(`      Total invoices (including deleted): ${totalCount}`);
        console.log(`      Active invoices: ${activeCount}`);
        console.log(`      Deleted invoices: ${deletedCount}`);

        if (activeCount > 0) {
          // Get sample invoices
          const sampleInvoices = await ShopPurchaseInvoice.find({ isDeleted: { $ne: true } })
            .select('invoiceNumber status pricing.total createdAt')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

          console.log(`\n   📄 Sample invoices (latest 5):`);
          sampleInvoices.forEach((inv, index) => {
            console.log(`      ${index + 1}. ${inv.invoiceNumber || 'N/A'} - ${inv.status} - ${inv.pricing?.total || 0} - ${new Date(inv.createdAt).toLocaleDateString()}`);
          });
        } else {
          console.log(`\n   ⚠️  No active invoices found in this shop.`);
          console.log(`      💡 Invoices are created when shop admins make purchases.`);
        }

        shopInvoiceCounts.push({
          shopId: shop.shopId,
          shopName: shop.shopName,
          status: shop.status,
          totalInvoices: totalCount,
          activeInvoices: activeCount,
          deletedInvoices: deletedCount
        });

        totalInvoices += activeCount;

      } catch (error) {
        console.error(`   ❌ Error checking shop ${shop.shopId}:`);
        console.error(`      ${error.message}`);
        if (error.stack) {
          console.error(`      Stack: ${error.stack.split('\n')[1]}`);
        }
        
        shopInvoiceCounts.push({
          shopId: shop.shopId,
          shopName: shop.shopName,
          status: shop.status,
          error: error.message
        });
      }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY\n`);
    console.log(`Total Shops: ${shops.length}`);
    console.log(`Total Active Invoices: ${totalInvoices}\n`);

    console.log(`Shop Invoice Breakdown:`);
    shopInvoiceCounts.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.shopName} (${item.shopId})`);
      console.log(`   Status: ${item.status}`);
      if (item.error) {
        console.log(`   ❌ Error: ${item.error}`);
      } else {
        console.log(`   Active Invoices: ${item.activeInvoices}`);
        console.log(`   Total Invoices: ${item.totalInvoices}`);
        if (item.deletedInvoices > 0) {
          console.log(`   Deleted Invoices: ${item.deletedInvoices}`);
        }
      }
    });

    if (totalInvoices === 0) {
      console.log(`\n💡 Why no invoices?`);
      console.log(`   1. Invoices are created by shop admins when they make purchases`);
      console.log(`   2. Make sure shop admins have logged in and created purchase invoices`);
      console.log(`   3. Check if shops have products and suppliers set up`);
      console.log(`   4. Invoices are created in the Purchase section of each shop\n`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Close connections
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n✅ Master Database connection closed');
    }
    process.exit(0);
  }
}

// Run the script
checkShopInvoices();
