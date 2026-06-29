async function up(db) {
  console.log('Running migration: Add deleted_at column (soft deletes)');

  const columns = await db.all("PRAGMA table_info(person)");
  const hasDeletedAt = columns.some(col => col.name === 'deleted_at');

  if (!hasDeletedAt) {
    await db.exec(`ALTER TABLE person ADD COLUMN deleted_at DATETIME DEFAULT NULL;`);
    console.log('Added deleted_at column');
  } else {
    console.log('deleted_at column already exists, skipping');
  }
}

async function down(db) {
  console.log('Rollback for deleted_at requires table recreation; not performed automatically');
}

module.exports = { up, down };
