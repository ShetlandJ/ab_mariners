const Database = require('better-sqlite3');
const path = require('path');

function runMigration() {
  const dbPath = path.join(__dirname, '../../db/database.sqlite');
  const db = new Database(dbPath);
  
  try {
    console.log('Starting migration: create change_history table');
    
    // Check if table already exists
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='change_history'"
    ).get();
    
    if (tableExists) {
      console.log('Table change_history already exists, skipping migration');
      return;
    }
    
    // Create change_history table
    db.exec(`
      CREATE TABLE change_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        change_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        entity_name TEXT,
        changes_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for faster queries
    db.exec(`
      CREATE INDEX idx_change_history_created_at ON change_history(created_at DESC);
      CREATE INDEX idx_change_history_entity ON change_history(entity_type, entity_id);
    `);
    
    console.log('Successfully created change_history table');
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
