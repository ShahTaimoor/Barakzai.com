#!/usr/bin/env node
/**
 * Seed admin user - creates the first admin account.
 * Run: node scripts/seedAdmin.js
 * Or:  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourSecurePassword node scripts/seedAdmin.js
 *
 * Uses env vars: ADMIN_EMAIL, ADMIN_PASSWORD
 * If not set, uses defaults for development only (admin@example.com / Admin123!)
 */
require('dotenv').config();

const userRepository = require('../repositories/postgres/UserRepository');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin';
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'User';

async function seedAdmin() {
  try {
    const exists = await userRepository.emailExists(ADMIN_EMAIL);
    if (exists) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      console.log('To reset password, update the user via the API or database.');
      process.exit(0);
      return;
    }

    const user = await userRepository.create({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'active',
    });

    console.log('Admin user created successfully!');
    console.log('  Email:', user.email);
    console.log('  Name:', [user.firstName, user.lastName].join(' '));
    console.log('  Role: admin');
    if (!process.env.ADMIN_PASSWORD) {
      console.log('\n  Default password used (Admin123!). Set ADMIN_PASSWORD in .env for production.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
