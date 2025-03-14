const Database = require('better-sqlite3');
const { app } = require('electron').remote;
const path = require('path');
import importPersons from '../seeders/importPersons';
import importShips from '../seeders/importShips';
import importPersonShips from '../seeders/importPersonShips';

class DatabaseService {
    constructor() {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'database.sqlite');
        this.db = new Database(dbPath, { 
            verbose: console.log,
            fileMustExist: false
        });
        this.init();
    }

    init() {
        console.log('Initializing database...');
        // Create person table
        this.db.exec(`
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
                appdate1 DATE,
                entdate1 DATE,
                ship1 TEXT,
                where1 TEXT,
                prest1 TEXT,
                appdate2 DATE,
                entdate2 DATE,
                ship2 TEXT,
                where2 TEXT,
                prest2 TEXT,
                appdate3 DATE,
                entdate3 DATE,
                ship3 TEXT,
                where3 TEXT,
                prest3 TEXT,
                shiplist TEXT
            )
        `);

        // Create ships table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ship (
                shipID INTEGER PRIMARY KEY,
                name TEXT,
                designation TEXT,
                freetext TEXT
            )
        `);

        // Create person_ship junction table without FK constraints
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS person_ship (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_id INTEGER,
                ship_id INTEGER,
                rank TEXT,
                start_date DATE,
                end_date DATE
            )
        `);
        console.log('Database initialized');
    }

    dropTables() {
        this.db.exec(`DROP TABLE IF EXISTS person`);
        this.db.exec(`DROP TABLE IF EXISTS ship`);
        this.db.exec(`DROP TABLE IF EXISTS examples`);
        this.db.exec(`DROP TABLE IF EXISTS person_ship`);
    }

    // Example query method
    getAllExamples() {
        return this.db.prepare('SELECT * FROM examples').all();
    }

    addTestExample() {
        const insert = this.db.prepare('INSERT INTO examples (name) VALUES (?)');
        return insert.run(`Test Item ${Date.now()}`);
    }

    disableForeignKeys() {
        this.db.exec('PRAGMA foreign_keys = OFF;');
    }

    enableForeignKeys() {
        this.db.exec('PRAGMA foreign_keys = ON;');
    }

    async seed(fresh = true) {
        this.disableForeignKeys();
        
        if (fresh) {
            this.dropTables();
            this.init();
        }
        
        await importPersons(this.db);
        await importShips(this.db);
        await importPersonShips(this.db);
        
        this.enableForeignKeys();
    }

    getMarinersCount() {
        return this.db.prepare('SELECT COUNT(*) as count FROM person').get().count;
    }

    getMarinersPaginated(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        return this.db.prepare(`
            SELECT person_id, surname, forename, year_of_birth, year_of_death, place_of_birth 
            FROM person 
            ORDER BY surname, forename 
            LIMIT ? OFFSET ?
        `).all(limit, offset);
    }
}

export default new DatabaseService();
