const XLSX = require('xlsx');
const path = require('path');

function toTitleCase(str) {
    if (!str) return null;
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Add column name mapping for Excel columns with spaces
const columnMapping = {
    'ship ID': 'shipID'
    // Add other mappings if needed
};

function importShips(db, useTransaction = true) {
    console.log("\nStarting ship import process...");

    try {
        const excelPath = path.join(__dirname, '../../data/ship.xlsx');
        console.log(`Looking for Excel file at: ${excelPath}`);

        if (!require('fs').existsSync(excelPath)) {
            throw new Error(`Ship Excel file not found at ${excelPath}`);
        }

        console.log('Reading ship Excel file...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`Ship Excel file read successfully. Found ${rows.length} rows.`);
        
        // Display column names from the Excel file
        if (rows.length > 0) {
            console.log('Ship Excel column names:', Object.keys(rows[0]));
            console.log('First ship row sample:', JSON.stringify(rows[0], null, 2));
        }

        if (useTransaction) db.prepare('BEGIN TRANSACTION').run();

        // Clear existing ship data
        console.log('Clearing existing ship data...');
        const deleted = db.prepare('DELETE FROM ship').run();
        console.log(`Deleted ${deleted.changes} existing ship records`);

        const insert = db.prepare(`
            INSERT INTO ship (shipID, name, designation, freetext)
            VALUES (@shipID, @name, @designation, @freetext)
        `);

        let successCount = 0;
        let errorCount = 0;

        rows.forEach((row, index) => {
            try {
                // First apply column mapping to create a properly mapped row
                const mappedRow = Object.keys(row).reduce((acc, key) => {
                    const lowerKey = key.toLowerCase();
                    const mappedKey = columnMapping[lowerKey] || key;
                    acc[mappedKey] = row[key];
                    return acc;
                }, {});

                // Now check for ship ID in various possible column names
                const shipId = mappedRow.shipID || row.shipID || row.ShipID || row.SHIPID || row.ship_id || row['ship ID'] || row.ID;
                
                if (!shipId) {
                    console.warn(`No ShipID found for row ${index + 1}, skipping record`);
                    console.warn('Available columns:', Object.keys(row).join(', '));
                    return;
                }

                const cleanRow = {
                    shipID: shipId, // Use the original ID from the Excel
                    name: mappedRow.name ? toTitleCase(String(mappedRow.name)) : null,
                    designation: mappedRow.designation ? toTitleCase(String(mappedRow.designation)) : null,
                    freetext: mappedRow.freetext || null
                };

                // Debugging for the first row
                if (index === 0) {
                    console.log('Ship row after mapping:', cleanRow);
                    console.log('Original row keys:', Object.keys(row));
                }

                insert.run(cleanRow);
                successCount++;

                if ((index + 1) % 50 === 0) {
                    console.log(`Progress: ${index + 1}/${rows.length} ships processed`);
                }
            } catch (err) {
                errorCount++;
                console.error(`Error on ship row ${index + 1}:`, err.message);
                console.error('Problem row data:', JSON.stringify(row, null, 2));
                throw err;
            }
        });

        if (useTransaction) db.prepare('COMMIT').run();

        const finalCount = db.prepare('SELECT COUNT(*) as count FROM ship').get();
        console.log('\nShip Import Summary:');
        console.log(`- Total rows in Excel: ${rows.length}`);
        console.log(`- Successfully imported: ${successCount}`);
        console.log(`- Errors encountered: ${errorCount}`);
        console.log(`- Final ship count: ${finalCount.count}`);

    } catch (err) {
        console.error('\nShip import failed with error:', err.message);
        if (useTransaction) {
            console.log('Rolling back changes...');
            db.prepare('ROLLBACK').run();
        }
        throw err;
    }
}

module.exports = {
    importShips
};
