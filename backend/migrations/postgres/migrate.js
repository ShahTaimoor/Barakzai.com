const fs = require('fs');
const path = require('path');
const { query, connectDB } = require('../../config/postgres');

const MIGRATIONS = [
  '001_create_schema.sql',
  '002_insert_default_accounts.sql',
  '003_add_users_categories.sql',
  '004_users_auth_fields.sql',
  '005_returns_reference_id_varchar.sql',
  '006_mongo_repos_tables.sql',
  '007_settings_logo.sql',
  '008_customer_transactions.sql',
  '009_payment_applications.sql',
  '010_customer_transactions_reversal.sql',
  '011_sales_applied_discounts.sql',
  '012_customers_credit_policy.sql',
  '013_returns_inspection_refund.sql',
  '014_audit_logs.sql',
  '015_disputes_counters.sql',
  '016_batches.sql',
  '017_optional_audit_tables.sql',
  '018_account_ledger_reference_id_not_null.sql',
  '019_add_supplier_to_receipts.sql',
  '020_add_business_name_to_suppliers.sql'
];

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getCompletedMigrations() {
  const result = await query('SELECT name FROM schema_migrations');
  return new Set(result.rows.map((r) => r.name));
}

// PostgreSQL codes for "object already exists" – treat as already applied
const ALREADY_EXISTS_CODES = new Set(['42710', '42P07', '42P16']);

async function runMigration(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${fileName} (file not found)`);
    return;
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Running migration: ${fileName}...`);
  try {
    await query(sql);
    await query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [fileName]);
    console.log(`✅ ${fileName} completed`);
  } catch (error) {
    if (ALREADY_EXISTS_CODES.has(error.code)) {
      console.log(`⏭️  ${fileName} already applied (objects exist), marking as done`);
      await query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [fileName]);
      return;
    }
    console.error(`❌ ${fileName} failed:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await connectDB();
    console.log('✅ Connected to PostgreSQL\n');

    await ensureMigrationsTable();
    const completed = await getCompletedMigrations();

    for (const fileName of MIGRATIONS) {
      if (completed.has(fileName)) {
        console.log(`⏭️  Skipping ${fileName} (already applied)`);
        continue;
      }
      await runMigration(fileName);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Migrations finished.');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runMigration };
