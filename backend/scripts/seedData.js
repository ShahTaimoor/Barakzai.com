#!/usr/bin/env node
/**
 * Seed sample data: 10 customers, 10 products, 10 cities, 10 banks.
 * Run: npm run seed:data
 * Or:  node scripts/seedData.js
 *
 * Requires admin user to exist first (run npm run seed:admin).
 */
require('dotenv').config();

const userRepository = require('../repositories/postgres/UserRepository');
const customerRepository = require('../repositories/postgres/CustomerRepository');
const productRepository = require('../repositories/postgres/ProductRepository');
const categoryRepository = require('../repositories/postgres/CategoryRepository');
const cityRepository = require('../repositories/postgres/CityRepository');
const bankRepository = require('../repositories/postgres/BankRepository');

const CUSTOMERS = [
  { name: 'Ahmed Khan', businessName: 'Khan Traders', email: 'ahmed@khantraders.com', phone: '+92-300-1112233' },
  { name: 'Sara Ali', businessName: 'Ali Enterprises', email: 'sara@alienterprises.com', phone: '+92-321-2223344' },
  { name: 'Muhammad Hassan', businessName: 'Hassan & Co', email: 'hassan@hassanco.com', phone: '+92-333-3334455' },
  { name: 'Fatima Noor', businessName: 'Noor Store', email: 'fatima@noorstore.com', phone: '+92-345-4445566' },
  { name: 'Omar Sheikh', businessName: 'Sheikh Wholesale', email: 'omar@sheikhwholesale.com', phone: '+92-300-5556677' },
  { name: 'Ayesha Malik', businessName: 'Malik Mart', email: 'ayesha@malikmart.com', phone: '+92-321-6667788' },
  { name: 'Usman Rafiq', businessName: 'Rafiq Traders', email: 'usman@rafiqtraders.com', phone: '+92-333-7778899' },
  { name: 'Zainab Hussain', businessName: 'Hussain Retail', email: 'zainab@hussainretail.com', phone: '+92-345-8889900' },
  { name: 'Bilal Ahmed', businessName: 'Bilal Distributors', email: 'bilal@bilaldist.com', phone: '+92-300-9990011' },
  { name: 'Hira Yousaf', businessName: 'Yousaf General Store', email: 'hira@yousafstore.com', phone: '+92-321-0001122' },
];

const PRODUCTS = [
  { name: 'Premium Rice 5kg', sku: 'RICE-001', costPrice: 450, sellingPrice: 550 },
  { name: 'Cooking Oil 1L', sku: 'OIL-001', costPrice: 280, sellingPrice: 350 },
  { name: 'Sugar 2kg', sku: 'SUGAR-001', costPrice: 220, sellingPrice: 280 },
  { name: 'Tea Premium 500g', sku: 'TEA-001', costPrice: 380, sellingPrice: 480 },
  { name: 'Wheat Flour 10kg', sku: 'FLOUR-001', costPrice: 520, sellingPrice: 650 },
  { name: 'Pulses Mix 1kg', sku: 'PULSE-001', costPrice: 180, sellingPrice: 250 },
  { name: 'Biscuits Pack', sku: 'BISCUIT-001', costPrice: 80, sellingPrice: 120 },
  { name: 'Soap Bar 3-Pack', sku: 'SOAP-001', costPrice: 150, sellingPrice: 200 },
  { name: 'Detergent 2kg', sku: 'DET-001', costPrice: 320, sellingPrice: 420 },
  { name: 'Salt 1kg', sku: 'SALT-001', costPrice: 25, sellingPrice: 40 },
];

const CITIES = [
  { name: 'Karachi', state: 'Sindh' },
  { name: 'Lahore', state: 'Punjab' },
  { name: 'Islamabad', state: 'Islamabad' },
  { name: 'Rawalpindi', state: 'Punjab' },
  { name: 'Faisalabad', state: 'Punjab' },
  { name: 'Multan', state: 'Punjab' },
  { name: 'Peshawar', state: 'Khyber Pakhtunkhwa' },
  { name: 'Quetta', state: 'Balochistan' },
  { name: 'Sialkot', state: 'Punjab' },
  { name: 'Gujranwala', state: 'Punjab' },
];

const BANKS = [
  { accountName: 'Main Business Account', accountNumber: '1001-001', bankName: 'HBL' },
  { accountName: 'Operating Account', accountNumber: '1001-002', bankName: 'MCB' },
  { accountName: 'Savings Account', accountNumber: '1001-003', bankName: 'UBL' },
  { accountName: 'Payroll Account', accountNumber: '1001-004', bankName: 'ABL' },
  { accountName: 'Supplier Payments', accountNumber: '1001-005', bankName: 'JazzCash' },
  { accountName: 'Cash Collection', accountNumber: '1001-006', bankName: 'EasyPaisa' },
  { accountName: 'Reserve Account', accountNumber: '1001-007', bankName: 'NBP' },
  { accountName: 'Tax Account', accountNumber: '1001-008', bankName: 'Allied Bank' },
  { accountName: 'Export Account', accountNumber: '1001-009', bankName: 'Askari Bank' },
  { accountName: 'Petty Cash Account', accountNumber: '1001-010', bankName: 'Meezan Bank' },
];

async function getOrCreateAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  let user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    user = await userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email,
      password,
      role: 'admin',
      status: 'active',
    });
    console.log('Created admin user for seeding');
  }
  return user.id;
}

async function ensureCategory() {
  let cat = await categoryRepository.findByName('General');
  if (!cat) {
    cat = await categoryRepository.create({ name: 'General', description: 'General products' });
    console.log('Created General category');
  }
  return cat.id;
}

async function seedCustomers(createdBy) {
  let count = 0;
  for (const c of CUSTOMERS) {
    const existing = await customerRepository.findAll({ search: c.email }, { limit: 1 });
    if (existing.length > 0) continue;
    await customerRepository.create({ ...c, createdBy });
    count++;
  }
  return count;
}

async function seedProducts(categoryId, createdBy) {
  let count = 0;
  for (const p of PRODUCTS) {
    const existing = await productRepository.findAll({ search: p.sku }, { limit: 1 });
    if (existing.length > 0) continue;
    await productRepository.create({
      ...p,
      categoryId,
      stockQuantity: 100,
      minStockLevel: 10,
      unit: 'pcs',
      createdBy,
    });
    count++;
  }
  return count;
}

async function seedCities(createdBy) {
  let count = 0;
  for (const city of CITIES) {
    const existing = await cityRepository.findByName(city.name);
    if (existing) continue;
    await cityRepository.create({ ...city, createdBy });
    count++;
  }
  return count;
}

async function seedBanks(createdBy) {
  let count = 0;
  for (const bank of BANKS) {
    const existing = await bankRepository.findByAccountNumber(bank.accountNumber);
    if (existing) continue;
    await bankRepository.create({
      ...bank,
      openingBalance: 0,
      currentBalance: 0,
      createdBy,
    });
    count++;
  }
  return count;
}

async function main() {
  try {
    console.log('Seeding data...\n');

    const createdBy = await getOrCreateAdmin();
    const categoryId = await ensureCategory();

    const customersCount = await seedCustomers(createdBy);
    const productsCount = await seedProducts(categoryId, createdBy);
    const citiesCount = await seedCities(createdBy);
    const banksCount = await seedBanks(createdBy);

    console.log('\nSeed complete!');
    console.log(`  Customers: ${customersCount} created`);
    console.log(`  Products:  ${productsCount} created`);
    console.log(`  Cities:    ${citiesCount} created`);
    console.log(`  Banks:     ${banksCount} created`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

main();
