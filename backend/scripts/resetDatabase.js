const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'Barakzai',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'yousafzai',
});

async function resetDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting database reset...');

    // 1. Drop the public schema and recreate it
    // This is the most reliable way to remove all tables, views, functions, etc.
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    await client.query('GRANT ALL ON SCHEMA public TO ' + (process.env.POSTGRES_USER || 'postgres'));
    
    // 2. Re-enable the uuid-ossp extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    console.log('✅ Database cleared successfully.');
    console.log('Next steps:');
    console.log('1. Run npm run migrate:postgres to recreate the schema');
    console.log('2. Run npm run seed:admin to create the initial admin user');
  } catch (err) {
    console.error('❌ Reset failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
