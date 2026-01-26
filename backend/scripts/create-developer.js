/**
 * Script to create the first developer account in Master Database
 * Usage: node scripts/create-developer.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const developerSchema = require('../models/master/Developer');
const logger = require('../utils/logger');

async function createDeveloper() {
  try {
    // Connect to Master Database
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required.');
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

    // Get developer details from command line arguments or use defaults
    const email = process.argv[2] || 'developer@example.com';
    const password = process.argv[3] || 'developer123';
    const firstName = process.argv[4] || 'Developer';
    const lastName = process.argv[5] || 'Admin';

    // Check if developer already exists
    const existingDeveloper = await Developer.findOne({ email: email.toLowerCase().trim() });
    if (existingDeveloper) {
      console.log('⚠️  Developer with this email already exists.');
      console.log('   Email:', existingDeveloper.email);
      console.log('   Status:', existingDeveloper.status);
      process.exit(0);
    }

    // Create developer
    const developer = new Developer({
      email: email.toLowerCase().trim(),
      password: password,
      firstName,
      lastName,
      status: 'active'
    });

    await developer.save();

    console.log('✅ Developer created successfully!\n');
    console.log('📋 Developer Details:');
    console.log('   Email:', developer.email);
    console.log('   Name:', `${developer.firstName} ${developer.lastName}`);
    console.log('   Status:', developer.status);
    console.log('\n💡 You can now login at: POST /api/developer/login');
    console.log('   Email:', developer.email);
    console.log('   Password:', password);

  } catch (error) {
    console.error('❌ Error creating developer:', error.message);
    if (error.code === 11000) {
      console.error('   Developer with this email already exists.');
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run script
createDeveloper();
