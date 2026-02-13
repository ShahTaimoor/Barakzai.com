#!/usr/bin/env node
/**
 * Seed 10 suppliers
 * Run: node scripts/seedSuppliers.js
 * Or:  npm run seed:suppliers (if added to package.json)
 *
 * Requires admin user to exist first (run npm run seed:admin).
 */
require('dotenv').config();

const userRepository = require('../repositories/postgres/UserRepository');
const supplierRepository = require('../repositories/postgres/SupplierRepository');

const SUPPLIERS = [
  {
    companyName: 'Premium Foods Distributors',
    name: 'Ahmed Malik',
    contactPerson: 'Ahmed Malik',
    email: 'ahmed@premiumfoods.com',
    phone: '+92-300-1112233',
    address: { street: '123 Main Street', city: 'Karachi', province: 'Sindh', country: 'Pakistan' },
    paymentTerms: 'net30',
    creditLimit: 50000,
    taxId: 'TAX-001',
    notes: 'Primary supplier for food items',
    openingBalance: 0
  },
  {
    companyName: 'Textile Wholesale Co.',
    name: 'Sara Khan',
    contactPerson: 'Sara Khan',
    email: 'sara@textilewholesale.com',
    phone: '+92-321-2223344',
    address: { street: '456 Industrial Area', city: 'Lahore', province: 'Punjab', country: 'Pakistan' },
    paymentTerms: 'net45',
    creditLimit: 100000,
    taxId: 'TAX-002',
    notes: 'Bulk textile supplier',
    openingBalance: 0
  },
  {
    companyName: 'Electronics Importers Ltd',
    name: 'Muhammad Hassan',
    contactPerson: 'Muhammad Hassan',
    email: 'hassan@electronicsimport.com',
    phone: '+92-333-3334455',
    address: { street: '789 Tech Park', city: 'Islamabad', province: 'Islamabad', country: 'Pakistan' },
    paymentTerms: 'net15',
    creditLimit: 75000,
    taxId: 'TAX-003',
    notes: 'Electronics and gadgets supplier',
    openingBalance: 0
  },
  {
    companyName: 'Pharma Supplies Inc',
    name: 'Fatima Noor',
    contactPerson: 'Fatima Noor',
    email: 'fatima@pharmasupplies.com',
    phone: '+92-345-4445566',
    address: { street: '321 Medical Street', city: 'Rawalpindi', province: 'Punjab', country: 'Pakistan' },
    paymentTerms: 'net30',
    creditLimit: 60000,
    taxId: 'TAX-004',
    notes: 'Pharmaceutical products supplier',
    openingBalance: 0
  },
  {
    companyName: 'Building Materials Hub',
    name: 'Omar Sheikh',
    contactPerson: 'Omar Sheikh',
    email: 'omar@buildingmaterials.com',
    phone: '+92-300-5556677',
    address: { street: '654 Construction Road', city: 'Faisalabad', province: 'Punjab', country: 'Pakistan' },
    paymentTerms: 'net60',
    creditLimit: 150000,
    taxId: 'TAX-005',
    notes: 'Construction materials supplier',
    openingBalance: 0
  },
  {
    companyName: 'Fashion & Apparel Wholesale',
    name: 'Ayesha Malik',
    contactPerson: 'Ayesha Malik',
    email: 'ayesha@fashionwholesale.com',
    phone: '+92-321-6667788',
    address: { street: '987 Fashion Avenue', city: 'Multan', province: 'Punjab', country: 'Pakistan' },
    paymentTerms: 'net30',
    creditLimit: 80000,
    taxId: 'TAX-006',
    notes: 'Clothing and fashion items supplier',
    openingBalance: 0
  },
  {
    companyName: 'Agricultural Products Co.',
    name: 'Usman Rafiq',
    contactPerson: 'Usman Rafiq',
    email: 'usman@agriproducts.com',
    phone: '+92-333-7778899',
    address: { street: '147 Farm Road', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', country: 'Pakistan' },
    paymentTerms: 'net30',
    creditLimit: 90000,
    taxId: 'TAX-007',
    notes: 'Agricultural and farming supplies',
    openingBalance: 0
  },
  {
    companyName: 'Stationery & Office Supplies',
    name: 'Zainab Hussain',
    contactPerson: 'Zainab Hussain',
    email: 'zainab@stationeryco.com',
    phone: '+92-345-8889900',
    address: { street: '258 Office Plaza', city: 'Quetta', province: 'Balochistan', country: 'Pakistan' },
    paymentTerms: 'net15',
    creditLimit: 40000,
    taxId: 'TAX-008',
    notes: 'Office supplies and stationery',
    openingBalance: 0
  },
  {
    companyName: 'Automotive Parts Distributors',
    name: 'Bilal Ahmed',
    contactPerson: 'Bilal Ahmed',
    email: 'bilal@autoparts.com',
    phone: '+92-300-9990011',
    address: { street: '369 Auto Market', city: 'Sialkot', province: 'Punjab', country: 'Pakistan' },
    paymentTerms: 'net45',
    creditLimit: 120000,
    taxId: 'TAX-009',
    notes: 'Automotive parts and accessories',
    openingBalance: 0
  },
  {
    companyName: 'Home & Kitchen Essentials',
    name: 'Hira Yousaf',
    contactPerson: 'Hira Yousaf',
    email: 'hira@homekitchen.com',
    phone: '+92-321-0001122',
    address: { street: '741 Home Center', city: 'Gujranwala', province: 'Punjab', country: 'Pakistan' },
    paymentTerms: 'net30',
    creditLimit: 55000,
    taxId: 'TAX-010',
    notes: 'Home and kitchen products supplier',
    openingBalance: 0
  }
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

async function seedSuppliers(createdBy) {
  let count = 0;
  for (const supplier of SUPPLIERS) {
    try {
      // Check if supplier already exists by email or company name
      const existing = await supplierRepository.findAll(
        { search: supplier.email || supplier.companyName },
        { limit: 1 }
      );
      
      if (existing.length > 0) {
        console.log(`  Skipping ${supplier.companyName} - already exists`);
        continue;
      }

      await supplierRepository.create({
        ...supplier,
        createdBy,
        isActive: true,
        status: 'active'
      });
      console.log(`  ✓ Created: ${supplier.companyName}`);
      count++;
    } catch (error) {
      console.error(`  ✗ Failed to create ${supplier.companyName}:`, error.message);
    }
  }
  return count;
}

async function main() {
  try {
    console.log('Seeding suppliers...\n');

    const createdBy = await getOrCreateAdmin();
    const suppliersCount = await seedSuppliers(createdBy);

    console.log(`\nSeed complete!`);
    console.log(`  Suppliers: ${suppliersCount} created`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
