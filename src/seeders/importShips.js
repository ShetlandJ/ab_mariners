const XLSX = require('xlsx');
const path = require('path');

function toTitleCase(str) {
    if (!str) return null;
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

module.exports = function importShips(db) {
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

        db.prepare('BEGIN TRANSACTION').run();

        const insert = db.prepare(`
            INSERT INTO ship (shipID, name, designation, freetext)
            VALUES (@shipID, @name, @designation, @freetext)
        `);

        let successCount = 0;
        let errorCount = 0;

        rows.forEach((row, index) => {
            try {
                const cleanRow = {
                    shipID: row.shipID || index + 1,
                    name: row.name ? toTitleCase(String(row.name)) : null,
                    designation: row.designation ? toTitleCase(String(row.designation)) : null,
                    freetext: row.freetext || null
                };

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

        db.prepare('COMMIT').run();

        const finalCount = db.prepare('SELECT COUNT(*) as count FROM ship').get();
        console.log('\nShip Import Summary:');
        console.log(`- Total rows in Excel: ${rows.length}`);
        console.log(`- Successfully imported: ${successCount}`);
        console.log(`- Errors encountered: ${errorCount}`);
        console.log(`- Final ship count: ${finalCount.count}`);

    } catch (err) {
        console.error('\nShip import failed with error:', err.message);
        console.log('Rolling back changes...');
        db.prepare('ROLLBACK').run();
        throw err;
    }
};
