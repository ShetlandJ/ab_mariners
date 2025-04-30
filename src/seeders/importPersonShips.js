const XLSX = require('xlsx');
const path = require('path');

function parsePartialDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle dates with missing days (e.g., "1805/07/--")
    if (dateStr.endsWith('--')) {
        const [year, month] = dateStr.split('/');
        return `${year}-${month}-01`; // Use first day of month
    }

    // Handle regular dates
    const [year, month, day] = dateStr.split('/');
    return `${year}-${month}-${day || '01'}`;
}

function toTitleCase(str) {
    if (!str) return null;
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

module.exports = function importPersonShips(db) {
    console.log("\nStarting person_ship relationship import process...");

    try {
        const excelPath = path.join(__dirname, '../../data/person_ship.xlsx');
        console.log(`Looking for Excel file at: ${excelPath}`);

        if (!require('fs').existsSync(excelPath)) {
            throw new Error(`Person-Ship Excel file not found at ${excelPath}`);
        }

        console.log('Reading person_ship Excel file...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`Person-Ship Excel file read successfully. Found ${rows.length} rows.`);

        // Log the first row to see available columns
        if (rows.length > 0) {
            console.log('Person-Ship Excel column names:', Object.keys(rows[0]));
            console.log('First person-ship row sample:', JSON.stringify(rows[0], null, 2));
        }

        db.prepare('BEGIN TRANSACTION').run();

        // Clear existing person_ship data
        console.log('Clearing existing person_ship data...');
        const deleted = db.prepare('DELETE FROM person_ship').run();
        console.log(`Deleted ${deleted.changes} existing person_ship records`);

        const insert = db.prepare(`
            INSERT INTO person_ship (person_id, ship_id, rank, start_date, end_date)
            VALUES (@person_id, @ship_id, @rank, @start_date, @end_date)
        `);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        rows.forEach((row, index) => {
            try {
                // Updated to match the actual column names in the Excel file
                // 'C' for person_id and 'ship ID' (with a space) for ship_id
                const personId = row.C || row.person_id || row.PersonID || row.personID || row.PERSONID || 
                               row['Person ID'] || row['Person Id'] || row['person id'];
                               
                const shipId = row['ship ID'] || row.ship_id || row.ShipID || row.shipID || row.SHIPID || 
                             row['Ship ID'] || row['Ship Id'] || row['ship id'];

                if (!personId || !shipId) {
                    console.warn(`Missing personId or shipId on row ${index + 1}, skipping record.`);
                    skippedCount++;
                    return;
                }

                const cleanRow = {
                    person_id: parseInt(personId),
                    ship_id: parseInt(shipId),
                    rank: row.rank ? toTitleCase(String(row.rank)) : null,
                    start_date: row.startdate ? parsePartialDate(row.startdate) : null,
                    end_date: row.enddate ? parsePartialDate(row.enddate) : null
                };

                // Debug first row to verify mappings
                if (index === 0) {
                    console.log('Example row mapping:');
                    console.log('Raw Excel row:', row);
                    console.log('Mapped and cleaned row:', cleanRow);
                }

                insert.run(cleanRow);
                successCount++;

                if ((index + 1) % 50 === 0) {
                    console.log(`Progress: ${index + 1}/${rows.length} relationships processed`);
                }
            } catch (err) {
                errorCount++;
                console.error(`Error on relationship row ${index + 1}:`, err.message);
                console.error('Problem row data:', JSON.stringify(row, null, 2));
                // Continue with other rows instead of failing entirely
                // throw err;
            }
        });

        db.prepare('COMMIT').run();

        const finalCount = db.prepare('SELECT COUNT(*) as count FROM person_ship').get();
        console.log('\nPerson-Ship Relationship Import Summary:');
        console.log(`- Total rows in Excel: ${rows.length}`);
        console.log(`- Successfully imported: ${successCount}`);
        console.log(`- Errors encountered: ${errorCount}`);
        console.log(`- Skipped invalid relationships: ${skippedCount}`);
        console.log(`- Final relationship count: ${finalCount.count}`);

    } catch (err) {
        console.error('\nPerson-Ship relationship import failed with error:', err.message);
        console.log('Rolling back changes...');
        db.prepare('ROLLBACK').run();
        throw err;
    }
};
