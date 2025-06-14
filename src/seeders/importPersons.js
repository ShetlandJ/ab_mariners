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

// Add column name mapping for Excel columns with spaces
const columnMapping = {
    'year of birth': 'year_of_birth',
    'year of death': 'year_of_death',
    'place of birth': 'place_of_birth',
    'person id': 'person_id'  // Add mapping for person id with space
    // Add other mappings if needed
};

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
        
        // Enhanced debugging - log column names
        if (rows.length > 0) {
            console.log('Excel column names:', Object.keys(rows[0]));
        }
        
        // Log first row to debug column names
        console.log('First row sample:', JSON.stringify(rows[0], null, 2));

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
                appdate3, entdate3, ship3, where3, prest3, shiplist, died_at_sea
            ) VALUES (
                @person_id, @surname, @forename, @alias1surname, @alias1forename,
                @alias2surname, @alias2forename, @year_of_birth, @year_of_death,
                @place_of_birth, @remittence, @allotment, @effects, @grenpen,
                @freetext, @cod, @appdate1, @entdate1, @ship1, @where1,
                @prest1, @appdate2, @entdate2, @ship2, @where2, @prest2,
                @appdate3, @entdate3, @ship3, @where3, @prest3, @shiplist, @died_at_sea
            )
        `);

        let successCount = 0;
        let errorCount = 0;

        // Process each row
        rows.forEach((row, index) => {
            try {
                // Check for PersonID or person_id in the Excel
                // Add 'person id' to the list of possible ID column names
                const personId = row.PersonID || row.personID || row.person_id || row.PERSONID || row['person id'];
                
                if (!personId) {
                    console.warn(`No PersonID found for row ${index + 1}, skipping record`);
                    return;
                }

                // Ensure all required fields exist with defaults
                const defaultRow = {
                    person_id: personId, // Use the ID from the Excel file
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
                    shiplist: null,
                    died_at_sea: null
                };

                // Clean and transform the data
                const cleanRow = Object.keys(row).reduce((acc, key) => {
                    const lowerKey = key.toLowerCase();
                    // Map column names with spaces to underscore versions
                    const mappedKey = columnMapping[lowerKey] || lowerKey;
                    let value = row[key] === '' ? null : row[key];
                    
                    // Apply title case to any string value that isn't in skipTitleCase
                    if (value && typeof value === 'string' && !skipTitleCase.includes(mappedKey) && stringFields.includes(mappedKey)) {
                        value = toTitleCase(String(value));
                    }
                    
                    // Convert date fields
                    if (value && dateFields.includes(mappedKey)) {
                        value = formatDate(value);
                    }
                    
                    acc[mappedKey] = value;
                    return acc;
                }, {});

                // Merge with defaults
                const finalRow = { ...defaultRow, ...cleanRow };

                // Additional debugging for first row
                if (index === 0) {
                    console.log('Raw row data:', JSON.stringify(row, null, 2));
                    
                    // Try to specifically check if the problematic columns exist
                    console.log('Year of birth exists?', 'year of birth' in row);
                    console.log('Year of death exists?', 'year of death' in row);
                    console.log('Person ID exists?', 'person id' in row);
                    
                    // Check case-sensitivity
                    const columnNames = Object.keys(row);
                    const birthColumn = columnNames.find(col => col.toLowerCase() === 'year of birth');
                    const deathColumn = columnNames.find(col => col.toLowerCase() === 'year of death');
                    const idColumn = columnNames.find(col => col.toLowerCase() === 'person id');
                    
                    console.log('Actual year of birth column:', birthColumn);
                    console.log('Actual year of death column:', deathColumn);
                    console.log('Actual person id column:', idColumn);
                }

                // Debugging the mapping
                if (index === 0) {
                    console.log('After mapping:', cleanRow);
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
