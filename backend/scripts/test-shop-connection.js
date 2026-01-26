/**
 * Script to test shop database connection
 * This helps verify that shop databases can be connected dynamically
 */

const path = require('path');
const fs = require('fs');

// Try to load .env from multiple possible locations
const envPaths = [
  path.join(__dirname, '../.env'), // backend/.env
  path.join(__dirname, '../../.env'), // root/.env
  path.join(process.cwd(), '.env'), // current working directory
  path.join(process.cwd(), 'backend/.env') // current working directory/backend/.env
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`📁 Loaded .env from: ${envPath}\n`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  // Try default dotenv config as fallback
  require('dotenv').config();
}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const shopRepository = require('../repositories/master/ShopRepository');
const { getShopConnection } = require('../services/databaseConnectionService');
const User = require('../models/User');

async function testShopConnection() {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required.');
      console.error('   Please create a .env file in the backend directory with:');
      console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/master_db\n');
      process.exit(1);
    }

    console.log('🔌 Connecting to Master Database...\n');
    await connectDB();
    console.log('✅ Master Database connected\n');

    // Get shopId from command line arguments
    const shopId = process.argv[2];
    if (!shopId) {
      console.log('📋 Available shops:\n');
      const shops = await shopRepository.findAll({ status: 'active' });
      
      if (shops.length === 0) {
        console.log('   No shops found. Create a shop first.\n');
        process.exit(0);
      }

      shops.forEach((shop, index) => {
        console.log(`   ${index + 1}. ${shop.shopName} (${shop.shopId})`);
        console.log(`      Admin Email: ${shop.adminEmail}`);
        console.log(`      Status: ${shop.status}\n`);
      });

      console.log('\n💡 Usage: node test-shop-connection.js <shopId>');
      console.log('   Example: node test-shop-connection.js shop_1234567890_abc12345\n');
      process.exit(0);
    }

    // Find shop
    console.log(`🔍 Looking for shop: ${shopId}\n`);
    const shop = await shopRepository.findByShopId(shopId);
    
    if (!shop) {
      console.error(`❌ Shop not found: ${shopId}\n`);
      console.log('📋 Available shops:\n');
      const shops = await shopRepository.findAll({});
      
      if (shops.length === 0) {
        console.log('   No shops found. Create a shop first.\n');
        process.exit(0);
      }

      shops.forEach((s, index) => {
        console.log(`   ${index + 1}. ${s.shopName} (${s.shopId})`);
        console.log(`      Admin Email: ${s.adminEmail}`);
        console.log(`      Status: ${s.status}\n`);
      });

      console.log('\n💡 Usage: npm run backend:test-shop-connection <shopId>');
      console.log(`   Example: npm run backend:test-shop-connection ${shops[0]?.shopId || 'shop_xxx'}\n`);
      process.exit(1);
    }

    console.log(`✅ Shop found: ${shop.shopName}`);
    console.log(`   Admin Email: ${shop.adminEmail}`);
    console.log(`   Status: ${shop.status}\n`);

    // Get decrypted database URL
    console.log('🔓 Decrypting database URL...');
    const databaseUrl = shop.getDecryptedDatabaseUrl();
    console.log(`✅ Database URL decrypted (length: ${databaseUrl.length} chars)\n`);

    // Connect to shop database
    console.log('🔌 Connecting to shop database...');
    const shopConnection = await getShopConnection(databaseUrl, shop.shopId);
    console.log(`✅ Connected to shop database: ${shopConnection.db.databaseName}\n`);

    // Test query - get admin users
    console.log('👥 Testing query - Getting admin users...');
    const ShopUser = shopConnection.model('User', User.schema);
    const admins = await ShopUser.find({ role: 'admin' })
      .select('-password')
      .limit(5)
      .lean();

    console.log(`✅ Found ${admins.length} admin user(s):\n`);
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.firstName} ${admin.lastName}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Role: ${admin.role}`);
      console.log(`      Status: ${admin.status || 'N/A'}`);
      console.log(`      Created: ${admin.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A'}\n`);
    });

    console.log('✅ Shop database connection test successful!\n');
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
      console.log('✅ Master Database connection closed');
    }
    process.exit(0);
  }
}

// Run the script
testShopConnection();
