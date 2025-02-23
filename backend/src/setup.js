const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'golf_deildin',
    password: 'aserthebest', // match your Docker postgres password
    port: 5432,
});

async function setupDatabase() {
    try {
        // First, drop existing tables if they exist
        console.log('Dropping existing tables...');
        await pool.query(`
            DROP TABLE IF EXISTS rounds;
            DROP TABLE IF EXISTS users;
        `);

        // Read and execute the SQL file
        console.log('Creating new tables...');
        const sqlFile = await fs.readFile(path.join(__dirname, '..', 'database.sql'), 'utf8');
        await pool.query(sqlFile);

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await pool.end();
    }
}

setupDatabase();