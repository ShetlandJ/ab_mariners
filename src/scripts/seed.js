const database = require('../services/database');

(async () => {
    try {
        const fresh = true; // Always do fresh install
        await database.seed(fresh);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
})();
