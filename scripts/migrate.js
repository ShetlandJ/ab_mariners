// This script should be run after setting up your Prisma schema
// Run with: node scripts/migrate.js

const { execSync } = require('child_process');

console.log('Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('Creating initial migration...');
execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

console.log('Migration complete!');
