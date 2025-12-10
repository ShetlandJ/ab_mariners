const Database = require('better-sqlite3');
const path = require('path');

function runMigration() {
  const dbPath = path.join(__dirname, '../../db/database.sqlite');
  const db = new Database(dbPath);
  
  try {
    console.log('Starting migration: add deleted_at column to person table');
    
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(person)").all();
    const columnExists = tableInfo.some(col => col.name === 'deleted_at');
    
    if (columnExists) {
      console.log('Column deleted_at already exists, skipping migration');
      return;
    }
    
    // Add deleted_at column
    db.prepare('ALTER TABLE person ADD COLUMN deleted_at DATETIME DEFAULT NULL').run();
    
    console.log('Successfully added deleted_at column to person table');
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
