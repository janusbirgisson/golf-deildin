const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'golf_deildin',
    password: 'aserthebest',
    port: 5432,
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDb(maxAttempts = 5) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempting to connect to database (attempt ${attempt}/${maxAttempts})...`);
            await pool.query('SELECT 1');
            console.log('Successfully connected to database!');
            return true;
        } catch (error) {
            console.log(`Connection attempt ${attempt} failed:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error('Max attempts reached. Could not connect to database.');
            }
            await delay(2000); // Wait 2 seconds before next attempt
        }
    }
}

async function setupDatabase() {
    try {
        await waitForDb();

        // First, drop existing tables if they exist
        console.log('Dropping existing tables...');
        await pool.query(`
            DROP TABLE IF EXISTS weekly_standings;
            DROP TABLE IF EXISTS rounds;
            DROP TABLE IF EXISTS users;
        `);

        // Read and execute the SQL file
        console.log('Creating new tables...');
        const sqlFile = await fs.readFile(path.join(__dirname, '..', '..', 'database.sql'), 'utf8');
        await pool.query(sqlFile);

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await pool.end();
    }
}

setupDatabase();

module.exports = { pool };