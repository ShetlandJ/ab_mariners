async function up(db) {
  console.log('Running migration: Add bayanne_id and sfhs_id columns');
  
  // Check if columns already exist to prevent errors
  const columns = await db.all("PRAGMA table_info(person)");
  const hasBAyanneId = columns.some(col => col.name === 'bayanne_id');
  const hasSfhsId = columns.some(col => col.name === 'sfhs_id');
  
  // Add bayanne_id column if it doesn't exist
  if (!hasBAyanneId) {
    await db.exec(`
      ALTER TABLE person 
      ADD COLUMN bayanne_id INTEGER CHECK(bayanne_id IS NULL OR bayanne_id >= 1);
    `);
    console.log('Added bayanne_id column');
  } else {
    console.log('bayanne_id column already exists, skipping');
  }
  
  // Add sfhs_id column if it doesn't exist
  if (!hasSfhsId) {
    await db.exec(`
      ALTER TABLE person 
      ADD COLUMN sfhs_id INTEGER CHECK(sfhs_id IS NULL OR sfhs_id >= 1);
    `);
    console.log('Added sfhs_id column');
  } else {
    console.log('sfhs_id column already exists, skipping');
  }
  
  console.log('Migration completed: Added bayanne_id and sfhs_id columns');
}

async function down(db) {
  console.log('Rolling back migration: Remove bayanne_id and sfhs_id columns');
  
  // SQLite doesn't support DROP COLUMN directly in older versions
  // This is a workaround - would need table recreation in production
  console.log('Note: SQLite does not support DROP COLUMN in older versions');
  console.log('To rollback, you would need to recreate the table without these columns');
}

module.exports = { up, down };
