// Add died_at_sea column to person table with improved validation
const Database = require('better-sqlite3');
const path = require('path');
const { dbPath } = require('../../src/config/database');

function migrate() {
  console.log('Starting migration: Add died_at_sea column to person table (improved)');
  console.log(`Using database at: ${dbPath}`);

  // Connect to the database
  const db = new Database(dbPath);

  try {
    // Start a transaction
    db.prepare('BEGIN TRANSACTION').run();
    console.log('Transaction started');

    // Check if the column already exists
    const columnExists = db.prepare("PRAGMA table_info(person)").all()
      .some(column => column.name === 'died_at_sea');
    
    // 1. Add the column if it doesn't exist
    if (!columnExists) {
      console.log('Adding died_at_sea column to person table...');
      db.prepare('ALTER TABLE person ADD COLUMN died_at_sea BOOLEAN').run();
      console.log('Column added successfully');
    } else {
      console.log('Column died_at_sea already exists, will update values');
    }
    
    // 2. Reset the values to ensure clean update
    console.log('Resetting died_at_sea values to NULL...');
    db.prepare('UPDATE person SET died_at_sea = NULL').run();
    
    // 3. Update died_at_sea to TRUE only for meaningful year_of_death values
    console.log('Updating died_at_sea values based on valid year_of_death values...');
    const updated = db.prepare(`
      UPDATE person 
      SET died_at_sea = 1
      WHERE year_of_death IS NOT NULL 
        AND year_of_death != '' 
        AND (
          -- Match numeric years (like 1800)
          (CAST(year_of_death AS INTEGER) > 0) 
          -- Match partial years with question marks (like 18??)
          OR (length(year_of_death) = 4 AND year_of_death LIKE '%?%')
        )
    `).run();
    
    console.log(`Updated ${updated.changes} records with died_at_sea = TRUE`);

    // 4. Commit the transaction
    db.prepare('COMMIT').run();
    console.log('Transaction committed successfully');

    // 5. Verify the changes
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

    // Additional validation: check some sample records
    console.log('\nValidation checks:');
    
    // Sample with year_of_death = null
    const nullYearSample = db.prepare(`
      SELECT person_id, forename, surname, year_of_death, died_at_sea 
      FROM person 
      WHERE year_of_death IS NULL 
      LIMIT 1
    `).get();
    
    if (nullYearSample) {
      console.log('Sample without year_of_death:', {
        id: nullYearSample.person_id,
        name: `${nullYearSample.forename} ${nullYearSample.surname}`,
        year_of_death: nullYearSample.year_of_death,
        died_at_sea: nullYearSample.died_at_sea
      });
    }
    
    // Sample with numeric year_of_death
    const numericYearSample = db.prepare(`
      SELECT person_id, forename, surname, year_of_death, died_at_sea 
      FROM person 
      WHERE CAST(year_of_death AS INTEGER) > 0
      LIMIT 1
    `).get();
    
    if (numericYearSample) {
      console.log('Sample with numeric year_of_death:', {
        id: numericYearSample.person_id, 
        name: `${numericYearSample.forename} ${numericYearSample.surname}`,
        year_of_death: numericYearSample.year_of_death,
        died_at_sea: numericYearSample.died_at_sea
      });
    }
    
    // Sample with year pattern like 18??
    const patternYearSample = db.prepare(`
      SELECT person_id, forename, surname, year_of_death, died_at_sea 
      FROM person 
      WHERE year_of_death LIKE '%?%' AND length(year_of_death) = 4
      LIMIT 1
    `).get();
    
    if (patternYearSample) {
      console.log('Sample with pattern year_of_death:', {
        id: patternYearSample.person_id,
        name: `${patternYearSample.forename} ${patternYearSample.surname}`,
        year_of_death: patternYearSample.year_of_death,
        died_at_sea: patternYearSample.died_at_sea
      });
    }
    
    // Empty string year_of_death
    const emptyYearSample = db.prepare(`
      SELECT person_id, forename, surname, year_of_death, died_at_sea 
      FROM person 
      WHERE year_of_death = ''
      LIMIT 1
    `).get();
    
    if (emptyYearSample) {
      console.log('Sample with empty string year_of_death:', {
        id: emptyYearSample.person_id,
        name: `${emptyYearSample.forename} ${emptyYearSample.surname}`,
        year_of_death: emptyYearSample.year_of_death,
        died_at_sea: emptyYearSample.died_at_sea
      });
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