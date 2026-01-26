/**
 * Script to debug admin login issues
 * This helps identify why admin login is failing
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
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function debugAdminLogin() {
  try {
    // Get email and password from command line
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.log('📋 Usage: node debug-admin-login.js <email> <password>\n');
      console.log('   Example: node debug-admin-login.js uzair4@pos.com password123\n');
      process.exit(0);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Debugging Admin Login\n');
    console.log('='.repeat(60));
    console.log(`📧 Email provided: ${email}`);
    console.log(`📧 Email normalized: ${normalizedEmail}\n`);

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required.');
      process.exit(1);
    }

    console.log('🔌 Step 1: Connecting to Master Database...');
    await connectDB();
    console.log('✅ Master Database connected\n');

    // Step 1: Find shop in Master Database
    console.log('🔍 Step 2: Looking for shop in Master Database...');
    const shop = await shopRepository.findByAdminEmail(normalizedEmail);
    
    if (!shop) {
      console.log('❌ Shop not found in Master Database');
      console.log('\n📋 Available shops in Master DB:\n');
      const allShops = await shopRepository.findAll({});
      allShops.forEach((s, index) => {
        console.log(`   ${index + 1}. ${s.shopName} (${s.shopId})`);
        console.log(`      Admin Email: ${s.adminEmail}`);
        console.log(`      Status: ${s.status}\n`);
      });
      process.exit(1);
    }

    console.log('✅ Shop found in Master Database:');
    console.log(`   Shop Name: ${shop.shopName}`);
    console.log(`   Shop ID: ${shop.shopId}`);
    console.log(`   Admin Email (stored): ${shop.adminEmail}`);
    console.log(`   Status: ${shop.status}\n`);

    if (shop.status !== 'active') {
      console.log('⚠️  Warning: Shop status is not "active"');
      console.log(`   Current status: ${shop.status}\n`);
    }

    // Step 2: Get decrypted database URL
    console.log('🔓 Step 3: Decrypting database URL...');
    let databaseUrl;
    try {
      databaseUrl = shop.getDecryptedDatabaseUrl();
      console.log(`✅ Database URL decrypted (length: ${databaseUrl.length} chars)`);
      console.log(`   Database: ${databaseUrl.split('/').pop()?.split('?')[0] || 'N/A'}\n`);
    } catch (error) {
      console.error(`❌ Failed to decrypt database URL: ${error.message}\n`);
      process.exit(1);
    }

    // Step 3: Connect to shop database
    console.log('🔌 Step 4: Connecting to shop database...');
    let shopConnection;
    try {
      shopConnection = await getShopConnection(databaseUrl, shop.shopId);
      console.log(`✅ Connected to shop database: ${shopConnection.db.databaseName}\n`);
    } catch (error) {
      console.error(`❌ Failed to connect to shop database: ${error.message}\n`);
      process.exit(1);
    }

    // Step 4: Find user in shop database
    console.log('👤 Step 5: Looking for user in shop database...');
    const ShopUser = shopConnection.model('User', User.schema);
    
    // Try to find user with password
    let user = await ShopUser.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in shop database');
      console.log(`   Searched for email: ${normalizedEmail}\n`);
      
      // Show all admin users
      console.log('📋 All admin users in shop database:\n');
      const allAdmins = await ShopUser.find({ role: 'admin' })
        .select('-password')
        .limit(10)
        .lean();
      
      if (allAdmins.length === 0) {
        console.log('   No admin users found.\n');
      } else {
        allAdmins.forEach((admin, index) => {
          console.log(`   ${index + 1}. ${admin.firstName} ${admin.lastName}`);
          console.log(`      Email: ${admin.email}`);
          console.log(`      Role: ${admin.role}`);
          console.log(`      Status: ${admin.status || 'N/A'}\n`);
        });
      }
      process.exit(1);
    }

    console.log('✅ User found in shop database:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status || 'N/A'}`);
    console.log(`   isActive: ${user.isActive}`);
    console.log(`   Password hash exists: ${!!user.password}`);
    console.log(`   Password hash length: ${user.password ? user.password.length : 0}\n`);

    // Check if account is locked
    if (user.isLocked) {
      console.log('⚠️  Warning: Account is locked');
      console.log(`   Login attempts: ${user.loginAttempts || 0}`);
      console.log(`   Lock until: ${user.lockUntil || 'N/A'}\n`);
    }

    // Step 5: Test password
    console.log('🔐 Step 6: Testing password...');
    console.log(`   Password provided: ${'*'.repeat(password.length)}`);
    
    if (!user.password) {
      console.log('❌ User password field is empty or null\n');
      process.exit(1);
    }

    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('✅ Password matches!\n');
      console.log('='.repeat(60));
      console.log('✅ All checks passed! Login should work.\n');
      console.log('💡 If you still get "Invalid credentials", check:');
      console.log('   1. Frontend is sending email correctly (normalized)');
      console.log('   2. Frontend is sending password correctly');
      console.log('   3. API route is using correct endpoint (/api/auth/admin/login)');
      console.log('   4. Check server logs for detailed error messages\n');
    } else {
      console.log('❌ Password does NOT match!\n');
      console.log('💡 Possible issues:');
      console.log('   1. Password was changed after user creation');
      console.log('   2. Password hash was corrupted');
      console.log('   3. Wrong password provided\n');
      
      // Show password hash info for debugging
      console.log('🔍 Password hash info:');
      console.log(`   Hash starts with: ${user.password.substring(0, 10)}...`);
      console.log(`   Hash length: ${user.password.length}`);
      console.log(`   Expected length for bcrypt: ~60 characters\n`);
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
    }
    process.exit(0);
  }
}

// Run the script
debugAdminLogin();
