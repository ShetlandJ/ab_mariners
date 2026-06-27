async function up(db) {
  console.log('Running migration: Create change_history table');

  const existing = await db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='change_history'"
  );

  if (existing.length === 0) {
    await db.exec(`
      CREATE TABLE change_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        change_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        entity_name TEXT,
        changes_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.exec(`CREATE INDEX idx_change_history_created_at ON change_history(created_at DESC);`);
    await db.exec(`CREATE INDEX idx_change_history_entity ON change_history(entity_type, entity_id);`);
    console.log('Created change_history table and indexes');
  } else {
    console.log('change_history table already exists, skipping');
  }
}

async function down(db) {
  console.log('Rolling back: dropping change_history table');
  await db.exec(`DROP TABLE IF EXISTS change_history;`);
}

module.exports = { up, down };
