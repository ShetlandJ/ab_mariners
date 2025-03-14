const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { dbPath } = require('../config/database');
const { importPersons } = require('../seeders/importPersons');
const { importShips } = require('../seeders/importShips');
const importPersonShips = require('../seeders/importPersonShips');

function ensureDatabaseDirectory(dbPath) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function seed() {
    console.log(`Starting database seed process for ${dbPath}`);
    ensureDatabaseDirectory(dbPath);
    
    // Check if database exists and optionally backup
    if (fs.existsSync(dbPath)) {
        const backupPath = `${dbPath}.backup-${new Date().toISOString().replace(/:/g, '-')}`;
        console.log(`Database exists. Creating backup at ${backupPath}`);
        fs.copyFileSync(dbPath, backupPath);
    }
    
    const db = new Database(dbPath);

    try {
        console.log('Creating database schema...');
        db.exec('BEGIN TRANSACTION');

        // Drop tables if they exist to start fresh
        console.log('Dropping existing tables...');
        db.exec(`
            DROP TABLE IF EXISTS person_ship;
            DROP TABLE IF EXISTS person;
            DROP TABLE IF EXISTS ship;
        `);
        console.log('Tables dropped successfully.');

        // Create person table
        db.exec(`
            CREATE TABLE IF NOT EXISTS person (
                person_id INTEGER PRIMARY KEY,
                surname TEXT,
                forename TEXT,
                alias1surname TEXT,
                alias1forename TEXT,
                alias2surname TEXT,
                alias2forename TEXT,
                year_of_birth INTEGER,
                year_of_death INTEGER,
                place_of_birth TEXT,
                remittence TEXT,
                allotment TEXT,
                effects TEXT,
                grenpen TEXT,
                freetext TEXT,
                cod TEXT,
                appdate1 TEXT,
                entdate1 TEXT,
                ship1 TEXT,
                where1 TEXT,
                prest1 TEXT,
                appdate2 TEXT,
                entdate2 TEXT,
                ship2 TEXT,
                where2 TEXT,
                prest2 TEXT,
                appdate3 TEXT,
                entdate3 TEXT,
                ship3 TEXT,
                where3 TEXT,
                prest3 TEXT,
                shiplist TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create ship table
        db.exec(`
            CREATE TABLE IF NOT EXISTS ship (
                shipID INTEGER PRIMARY KEY,
                name TEXT,
                designation TEXT,
                freetext TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create person_ship relationship table
        db.exec(`
            CREATE TABLE IF NOT EXISTS person_ship (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_id INTEGER,
                ship_id INTEGER,
                rank TEXT,
                start_date TEXT,
                end_date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.exec('COMMIT');
        console.log('Database schema created successfully');

        // Import data in sequence
        console.log('\n==== IMPORTING PERSONS ====');
        await importPersons(db, true);
        
        console.log('\n==== IMPORTING SHIPS ====');
        await importShips(db, true);
        
        console.log('\n==== IMPORTING PERSON-SHIP RELATIONSHIPS ====');
        await importPersonShips(db);

        console.log('\nDatabase seeded successfully with all data');
        
        // Log final record counts
        const personCount = db.prepare('SELECT COUNT(*) as count FROM person').get();
        const shipCount = db.prepare('SELECT COUNT(*) as count FROM ship').get();
        const relationshipCount = db.prepare('SELECT COUNT(*) as count FROM person_ship').get();
        
        console.log('\nFinal Record Counts:');
        console.log(`- Persons: ${personCount.count}`);
        console.log(`- Ships: ${shipCount.count}`);
        console.log(`- Person-Ship Relationships: ${relationshipCount.count}`);
        
    } catch (error) {
        console.error('Error seeding database:', error);
        try {
            db.exec('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during rollback:', rollbackError);
        }
        throw error;
    } finally {
        db.close();
    }
}

seed().catch(error => {
    console.error('Fatal error during seeding process:', error);
    process.exit(1);
});
