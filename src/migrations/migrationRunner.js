const fs = require('fs');
const path = require('path');

async function ensureMigrationsTable(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedMigrations(db) {
  const rows = await db.all('SELECT name FROM migrations ORDER BY id');
  return rows.map(row => row.name);
}

async function runMigrations(db) {
  await ensureMigrationsTable(db);
  
  const appliedMigrations = await getAppliedMigrations(db);
  const migrationsDir = path.join(__dirname);
  
  let migrationFiles = [];
  try {
    migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.match(/^\d{3}_.*\.js$/))
      .sort();
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return;
  }
  
  if (migrationFiles.length === 0) {
    console.log('No migrations found');
    return;
  }
  
  let migrationsRan = 0;
  
  for (const file of migrationFiles) {
    const migrationName = file.replace('.js', '');
    
    if (appliedMigrations.includes(migrationName)) {
      console.log(`Migration ${migrationName} already applied, skipping...`);
      continue;
    }
    
    console.log(`Running migration: ${migrationName}`);
    const migration = require(path.join(migrationsDir, file));
    
    try {
      await migration.up(db);
      await db.run('INSERT INTO migrations (name) VALUES (?)', [migrationName]);
      console.log(`✅ Migration ${migrationName} completed successfully`);
      migrationsRan++;
    } catch (error) {
      console.error(`❌ Error running migration ${migrationName}:`, error);
      throw error;
    }
  }
  
  if (migrationsRan > 0) {
    console.log(`✅ ${migrationsRan} migration(s) completed`);
  } else {
    console.log('✅ All migrations up to date');
  }
}

module.exports = { runMigrations };
