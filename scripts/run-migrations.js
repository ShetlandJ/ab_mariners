#!/usr/bin/env node

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const { runMigrations } = require('../src/migrations/migrationRunner');

async function main() {
  const dbPath = path.join(__dirname, '../db/database.sqlite');
  
  console.log('='.repeat(50));
  console.log('Running Database Migrations');
  console.log('='.repeat(50));
  console.log(`Database: ${dbPath}\n`);
  
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('✅ Connected to database\n');
    
    await runMigrations(db);
    
    await db.close();
    console.log('\n✅ Database migrations completed successfully');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('='.repeat(50));
    process.exit(1);
  }
}

main();
