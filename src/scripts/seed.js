const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { dbPath } = require('../config/database');

function ensureDatabaseDirectory(dbPath) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function seed() {
    ensureDatabaseDirectory(dbPath);
    const db = new Database(dbPath);

    try {
        db.exec('BEGIN TRANSACTION');

        // Create mariners table
        db.exec(`
            CREATE TABLE IF NOT EXISTS mariners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rank TEXT NOT NULL,
                experience_years INTEGER,
                certification_date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert sample data
        const sampleMariners = [
            ['John Smith', 'Captain', 15, '2020-01-01'],
            ['Sarah Jones', 'First Mate', 8, '2019-06-15'],
            ['Mike Wilson', 'Engineer', 12, '2018-03-22']
        ];

        const insert = db.prepare(`
            INSERT INTO mariners (name, rank, experience_years, certification_date)
            VALUES (?, ?, ?, ?)
        `);

        sampleMariners.forEach(mariner => {
            insert.run(mariner);
        });

        db.exec('COMMIT');
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        db.exec('ROLLBACK');
        throw error;
    } finally {
        db.close();
    }
}

seed().catch(console.error);
