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
        console.log('Raw first row:', rows[0]); // Debug column names
        console.log('Available columns:', Object.keys(rows[0]));  // Debug available columns

        db.prepare('BEGIN TRANSACTION').run();

        const insert = db.prepare(`
            INSERT INTO person_ship (person_id, ship_id, rank, start_date, end_date)
            VALUES (@person_id, @ship_id, @rank, @start_date, @end_date)
        `);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        rows.forEach((row, index) => {
            try {
                // Use "C" column as person_id, fallback to other possibilities
                const personId = row['C'] || row['person id'] || row['Person ID'] || row['personID'];
                const shipId = row['ship ID'] || row['Ship ID'] || row['shipID'];
                
                if (index === 0) {
                    console.log('Column debug:', {
                        foundPersonId: personId,
                        foundShipId: shipId,
                        availableColumns: Object.keys(row),
                        rawRow: row
                    });
                }

                const cleanRow = {
                    person_id: parseInt(personId),
                    ship_id: parseInt(shipId),
                    rank: toTitleCase(String(row['rank'])),
                    start_date: parsePartialDate(row['startdate']),
                    end_date: parsePartialDate(row['enddate'])
                };

                // Validate required fields
                if (!cleanRow.person_id || isNaN(cleanRow.person_id)) {
                    throw new Error(`Invalid person_id: ${personId} from row: ${JSON.stringify(row)}`);
                }

                if (index === 0) {
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
                throw err;
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
