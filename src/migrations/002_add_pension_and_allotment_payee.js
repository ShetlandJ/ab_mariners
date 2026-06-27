async function up(db) {
  console.log('Running migration: Add pension and allotment_payee columns');

  // Check if columns already exist to prevent errors (idempotent)
  const columns = await db.all("PRAGMA table_info(person)");
  const hasPension = columns.some(col => col.name === 'pension');
  const hasAllotmentPayee = columns.some(col => col.name === 'allotment_payee');

  // Free-text notes about a man's pension records (e.g. Greenwich / RN pension)
  if (!hasPension) {
    await db.exec(`ALTER TABLE person ADD COLUMN pension TEXT;`);
    console.log('Added pension column');
  } else {
    console.log('pension column already exists, skipping');
  }

  // Name of the person an allotment was paid to (e.g. wife / mother)
  if (!hasAllotmentPayee) {
    await db.exec(`ALTER TABLE person ADD COLUMN allotment_payee TEXT;`);
    console.log('Added allotment_payee column');
  } else {
    console.log('allotment_payee column already exists, skipping');
  }

  console.log('Migration completed: Added pension and allotment_payee columns');
}

async function down(db) {
  console.log('Rolling back migration: Remove pension and allotment_payee columns');

  // SQLite did not support DROP COLUMN until 3.35; a safe rollback would require
  // recreating the table. Left as a no-op to match 001_add_external_ids.
  console.log('Note: rollback requires table recreation; not performed automatically');
}

module.exports = { up, down };
