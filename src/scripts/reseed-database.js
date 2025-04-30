// reseed-database.js
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { importPersons } = require('../seeders/importPersons');
const { importShips } = require('../seeders/importShips');
const importPersonShips = require('../seeders/importPersonShips');

/**
 * Reseeds the database while preserving original IDs from Excel files
 */
async function reseedDatabase() {
  console.log('🔄 Starting database re-seeding process...');
  
  try {
    // 1. Create a backup first
    const dbPath = path.join(__dirname, '../../db/database.sqlite');
    const backupPath = path.join(
      __dirname, 
      `../../db/database.sqlite.backup-${new Date().toISOString().replace(/:/g, '-')}`
    );
    
    console.log(`📦 Creating backup at: ${backupPath}`);
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ Backup created successfully');
    
    // 2. Open database connection using better-sqlite3
    console.log('🔌 Connecting to database...');
    const db = new Database(dbPath, { verbose: console.log });
    console.log('✅ Database connected');
    
    // 3. Check database structure to ensure migrations have been applied
    console.log('🔍 Verifying database structure...');
    const hasRequiredColumns = checkDatabaseStructure(db);
    if (!hasRequiredColumns) {
      throw new Error('Database structure check failed. Missing required columns from migrations.');
    }
    console.log('✅ Database structure verified');
    
    // 4. Re-seed the database using updated importers that respect IDs
    console.log('\n🌱 Starting re-seeding process...');
    
    // Disable foreign key constraints temporarily to avoid issues during import
    db.pragma('foreign_keys = OFF');
    
    // Import persons
    console.log('\n📋 Importing persons...');
    // await importPersons(db, true);
    
    // Import ships
    console.log('\n🚢 Importing ships...');
    await importShips(db, true);
    
    // Import person-ship relationships
    console.log('\n🔗 Importing person-ship relationships...');
    // await importPersonShips(db);
    
    // Re-enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    console.log('\n✅ Database re-seeding completed successfully!');
    console.log(`💾 Your original database has been backed up to: ${backupPath}`);
    
    // Close database connection
    db.close();
    
  } catch (error) {
    console.error('\n❌ Error during re-seeding:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Checks if database has the required structure with migrations
 */
function checkDatabaseStructure(db) {
  try {
    // Check if died_at_sea column exists in person table
    const personTableInfo = db.prepare('PRAGMA table_info(person)').all();
    const diedAtSeaColumn = personTableInfo.find(col => col.name === 'died_at_sea');
    
    if (!diedAtSeaColumn) {
      console.error('Missing column: died_at_sea in person table');
      return false;
    }
    
    // All required columns exist
    return true;
  } catch (error) {
    console.error('Error checking database structure:', error);
    return false;
  }
}

// Run the re-seeding process
reseedDatabase().then(() => {
  console.log('Re-seeding process completed');
}).catch(err => {
  console.error('Re-seeding failed:', err);
  process.exit(1);
});