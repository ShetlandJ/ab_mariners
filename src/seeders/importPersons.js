const XLSX = require('xlsx');
const path = require('path');

// Add title case function
function toTitleCase(str) {
    if (!str) return null;
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Add date formatting function
function formatDate(dateStr) {
    if (!dateStr) return null;
    // Convert various date formats to YYYY-MM-DD
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
}

// Define fields that should NOT be title cased (if any)
const skipTitleCase = [
    'person_id',    // numeric
    'year_of_birth', // numeric
    'year_of_death', // numeric
    'remittence',    // might be raw data/codes
    'grenpen',       // might be raw data/codes
    'prest1',        // might be raw data/codes
    'prest2',        // might be raw data/codes
    'prest3'         // might be raw data/codes
];

// Apply title case to all text fields except those in skipTitleCase
const stringFields = [
    'surname', 'forename', 
    'alias1surname', 'alias1forename',
    'alias2surname', 'alias2forename', 
    'place_of_birth', 
    'allotment', 
    'effects',
    'freetext',
    'cod',
    'ship1', 'where1',
    'ship2', 'where2',
    'ship3', 'where3',
    'shiplist'
];

// Add date fields array
const dateFields = [
    'appdate1', 'entdate1', 'appdate2', 'entdate2', 'appdate3', 'entdate3'
];

async function importPersons(db, useTransaction = true) {
    console.log("Starting person import process...");

    try {
        // Log current record count
        const currentCount = db.prepare('SELECT COUNT(*) as count FROM person').get();
        console.log(`Current records in database: ${currentCount.count}`);

        const excelPath = path.join(__dirname, '../../data/person.xlsx');
        console.log(`Looking for Excel file at: ${excelPath}`);

        if (!require('fs').existsSync(excelPath)) {
            throw new Error(`Excel file not found at ${excelPath}`);
        }

        console.log('Reading Excel file...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`Excel file read successfully. Found ${rows.length} rows.`);
        
        // Log first row to debug column names
        console.log('First row sample:', rows[0]);

        // Start transaction
        if (useTransaction) db.prepare('BEGIN TRANSACTION').run();

        // Clear existing data
        console.log('Clearing existing data...');
        const deleted = db.prepare('DELETE FROM person').run();
        console.log(`Deleted ${deleted.changes} existing records`);

        // Prepare insert statement
        const insert = db.prepare(`
            INSERT INTO person (
                person_id, surname, forename, alias1surname, alias1forename,
                alias2surname, alias2forename, year_of_birth, year_of_death,
                place_of_birth, remittence, allotment, effects, grenpen,
                freetext, cod, appdate1, entdate1, ship1, where1,
                prest1, appdate2, entdate2, ship2, where2, prest2,
                appdate3, entdate3, ship3, where3, prest3, shiplist
            ) VALUES (
                @person_id, @surname, @forename, @alias1surname, @alias1forename,
                @alias2surname, @alias2forename, @year_of_birth, @year_of_death,
                @place_of_birth, @remittence, @allotment, @effects, @grenpen,
                @freetext, @cod, @appdate1, @entdate1, @ship1, @where1,
                @prest1, @appdate2, @entdate2, @ship2, @where2, @prest2,
                @appdate3, @entdate3, @ship3, @where3, @prest3, @shiplist
            )
        `);

        let successCount = 0;
        let errorCount = 0;

        // Process each row
        rows.forEach((row, index) => {
            try {
                // Ensure all required fields exist with defaults
                const defaultRow = {
                    person_id: index + 1, // Fallback ID if none provided
                    surname: null,
                    forename: null,
                    alias1surname: null,
                    alias1forename: null,
                    alias2surname: null,
                    alias2forename: null,
                    year_of_birth: null,
                    year_of_death: null,
                    place_of_birth: null,
                    remittence: null,
                    allotment: null,
                    effects: null,
                    grenpen: null,
                    freetext: null,
                    cod: null,
                    appdate1: null,
                    entdate1: null,
                    ship1: null,
                    where1: null,
                    prest1: null,
                    appdate2: null,
                    entdate2: null,
                    ship2: null,
                    where2: null,
                    prest2: null,
                    appdate3: null,
                    entdate3: null,
                    ship3: null,
                    where3: null,
                    prest3: null,
                    shiplist: null
                };

                // Clean and transform the data
                const cleanRow = Object.keys(row).reduce((acc, key) => {
                    const lowerKey = key.toLowerCase();
                    let value = row[key] === '' ? null : row[key];
                    
                    // Apply title case to any string value that isn't in skipTitleCase
                    if (value && typeof value === 'string' && !skipTitleCase.includes(lowerKey)) {
                        value = toTitleCase(String(value));
                    }
                    
                    // Convert date fields
                    if (value && dateFields.includes(lowerKey)) {
                        value = formatDate(value);
                    }
                    
                    acc[lowerKey] = value;
                    return acc;
                }, {});

                // Merge with defaults
                const finalRow = { ...defaultRow, ...cleanRow };

                if (index === 0) {
                    console.log('Sample processed row:', finalRow);
                }

                insert.run(finalRow);
                successCount++;

                if ((index + 1) % 50 === 0) {
                    console.log(`Progress: ${index + 1}/${rows.length} records processed`);
                }
            } catch (err) {
                errorCount++;
                console.error(`Error on row ${index + 1}:`, err.message);
                console.error('Problem row data:', JSON.stringify(row, null, 2));
                throw err;
            }
        });

        // Commit transaction
        if (useTransaction) db.prepare('COMMIT').run();

        // Final count verification
        const finalCount = db.prepare('SELECT COUNT(*) as count FROM person').get();
        console.log('\nImport Summary:');
        console.log(`- Total rows in Excel: ${rows.length}`);
        console.log(`- Successfully imported: ${successCount}`);
        console.log(`- Errors encountered: ${errorCount}`);
        console.log(`- Final database count: ${finalCount.count}`);

    } catch (err) {
        console.error('\nImport failed with error:', err.message);
        if (useTransaction) {
            console.log('Rolling back changes...');
            db.prepare('ROLLBACK').run();
        }
        throw err;
    }
}

module.exports = {
    importPersons
};
