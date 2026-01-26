/**
 * Debug script to check developer login issues
 * Usage: node scripts/debug-developer-login.js email@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const developerSchema = require('../models/master/Developer');
const bcrypt = require('bcryptjs');

async function debugDeveloperLogin() {
  try {
    // Connect to Master Database
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required.');
      process.exit(1);
    }

    const email = process.argv[2];
    if (!email) {
      console.error('❌ Error: Please provide developer email as argument');
      console.log('Usage: node scripts/debug-developer-login.js email@example.com');
      process.exit(1);
    }

    console.log('🔌 Connecting to Master Database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to Master Database\n');

    // Get Developer model
    const Developer = mongoose.models.Developer || mongoose.model('Developer', developerSchema);

    // Find developer
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Searching for developer with email: ${normalizedEmail}\n`);

    // Try to find with password field
    const developer = await Developer.findOne({ email: normalizedEmail }).select('+password');

    if (!developer) {
      console.log('❌ Developer not found!');
      console.log('\n💡 Possible reasons:');
      console.log('   1. Developer account does not exist');
      console.log('   2. Email is incorrect');
      console.log('   3. Developer was created in a different database');
      console.log('\n📝 To create a developer, run:');
      console.log('   npm run create-developer');
      process.exit(1);
    }

    console.log('✅ Developer found!\n');
    console.log('📋 Developer Details:');
    console.log('   ID:', developer._id);
    console.log('   Email:', developer.email);
    console.log('   First Name:', developer.firstName);
    console.log('   Last Name:', developer.lastName);
    console.log('   Status:', developer.status);
    console.log('   Login Attempts:', developer.loginAttempts || 0);
    console.log('   Lock Until:', developer.lockUntil || 'Not locked');
    console.log('   Is Locked:', developer.isLocked || false);
    console.log('   Has Password:', !!developer.password);
    console.log('   Password Length:', developer.password ? developer.password.length : 0);
    console.log('   Password Starts With:', developer.password ? developer.password.substring(0, 10) + '...' : 'N/A');

    // Check if password is hashed
    if (developer.password) {
      const isHashed = developer.password.startsWith('$2a$') || developer.password.startsWith('$2b$');
      console.log('   Password is Hashed:', isHashed);
      
      if (!isHashed) {
        console.log('\n⚠️  WARNING: Password is not hashed!');
        console.log('   This means the password was saved in plain text.');
        console.log('   The developer account needs to be recreated or password reset.');
      }
    }

    // Test password comparison
    const testPassword = process.argv[3];
    if (testPassword) {
      console.log(`\n🔐 Testing password: "${testPassword}"`);
      try {
        const isMatch = await developer.comparePassword(testPassword);
        console.log('   Password Match:', isMatch ? '✅ YES' : '❌ NO');
        
        if (!isMatch) {
          console.log('\n💡 Password does not match. Possible reasons:');
          console.log('   1. Wrong password entered');
          console.log('   2. Password was changed after account creation');
          console.log('   3. Password hash is corrupted');
        }
      } catch (error) {
        console.log('   ❌ Error comparing password:', error.message);
      }
    } else {
      console.log('\n💡 To test password, provide it as second argument:');
      console.log(`   node scripts/debug-developer-login.js ${email} yourpassword`);
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Verify the email is correct');
    console.log('   2. Verify the password is correct');
    console.log('   3. If password is not hashed, recreate the developer account');
    console.log('   4. If account is locked, wait 2 hours or reset login attempts');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run script
debugDeveloperLogin();
