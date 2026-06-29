async function up(db) {
  console.log('Running migration: Add died_at_sea column');

  const columns = await db.all("PRAGMA table_info(person)");
  const hasDiedAtSea = columns.some(col => col.name === 'died_at_sea');

  if (!hasDiedAtSea) {
    // Structure only — no value backfill, so existing hand-curated data is never
    // overwritten. New column defaults to NULL ("Unknown").
    await db.exec(`ALTER TABLE person ADD COLUMN died_at_sea BOOLEAN;`);
    console.log('Added died_at_sea column');
  } else {
    console.log('died_at_sea column already exists, skipping');
  }
}

async function down(db) {
  console.log('Rollback for died_at_sea requires table recreation; not performed automatically');
}

module.exports = { up, down };
