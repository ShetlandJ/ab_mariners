// Add died_at_sea column to person table
const Database = require('better-sqlite3');
const path = require('path');
const { dbPath } = require('../../src/config/database');

function migrate() {
  console.log('Starting migration: Add died_at_sea column to person table');
  console.log(`Using database at: ${dbPath}`);

  // Connect to the database
  const db = new Database(dbPath);

  try {
    // Start a transaction
    db.prepare('BEGIN TRANSACTION').run();
    console.log('Transaction started');

    // 1. Add the new column
    console.log('Adding died_at_sea column to person table...');
    db.prepare('ALTER TABLE person ADD COLUMN died_at_sea BOOLEAN').run();
    
    // 2. Update values based on year_of_death
    console.log('Updating died_at_sea values based on year_of_death...');
    const updated = db.prepare(`
      UPDATE person 
      SET died_at_sea = CASE 
        WHEN year_of_death IS NOT NULL THEN 1
        ELSE NULL
      END
    `).run();
    
    console.log(`Updated ${updated.changes} records`);

    // 3. Commit the transaction
    db.prepare('COMMIT').run();
    console.log('Transaction committed successfully');

    // 4. Verify the changes
    const columnExists = db.prepare("PRAGMA table_info(person)").all()
      .some(column => column.name === 'died_at_sea');
    
    if (columnExists) {
      console.log('Column died_at_sea created successfully');
      const counts = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN died_at_sea = 1 THEN 1 ELSE 0 END) as died_at_sea_true,
          SUM(CASE WHEN died_at_sea IS NULL THEN 1 ELSE 0 END) as died_at_sea_null
        FROM person
      `).get();
      
      console.log('Stats after migration:');
      console.log(`- Total records: ${counts.total}`);
      console.log(`- Records with died_at_sea = TRUE: ${counts.died_at_sea_true}`);
      console.log(`- Records with died_at_sea = NULL: ${counts.died_at_sea_null}`);
    } else {
      throw new Error('Column died_at_sea was not created successfully');
    }

  } catch (error) {
    // Roll back in case of error
    console.error('Migration failed:', error.message);
    db.prepare('ROLLBACK').run();
    throw error;
  } finally {
    // Close the database connection
    db.close();
  }
}

// Execute the migration
migrate();