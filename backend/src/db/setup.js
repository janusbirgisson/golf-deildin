require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const { getCurrentWeek } = require('../utils/weekCalculator');

const pool = new Pool({
    user: 'postgres',
    host: process.env.DB_HOST || 'db.golf-deildin.orb.local',
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

if (process.env.NODE_ENV === 'development' && process.env.SETUP_DB === 'true') {
    setupDatabase();
}

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        await waitForDb();

        // Drop existing tables
        console.log('Dropping existing tables...');
        await pool.query(`
            DROP TABLE IF EXISTS weekly_standings;
            DROP TABLE IF EXISTS rounds;
            DROP TABLE IF EXISTS users;
        `);

        // Create new tables
        console.log('Creating new tables...');
        const sqlFile = await fs.readFile(path.join(__dirname, '..', '..', 'database.sql'), 'utf8');
        await pool.query(sqlFile);

        // Create admin user
        console.log('Creating admin user...');
        const adminResult = await pool.query(
            `INSERT INTO users (username, email, password, handicap)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            ['admin', 'admin@golf.com', await bcrypt.hash('admin123', 10), 0]
        );
        const adminId = adminResult.rows[0].id;

        // Create test users and store their IDs
        console.log('Creating test users...');
        const testUsers = [
            ['Tiger Woods', 'tiger@golf.com', 'tiger123', 0],
            ['Phil Mickelson', 'phil@golf.com', 'phil123', 5],
            ['Rory McIlroy', 'rory@golf.com', 'rory123', 2]
        ];

        const userIds = {};
        for (const [username, email, password, handicap] of testUsers) {
            const result = await pool.query(
                `INSERT INTO users (username, email, password, handicap)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, username`,
                [username, email, await bcrypt.hash(password, 10), handicap]
            );
            userIds[result.rows[0].username] = result.rows[0].id;
        }

        // Get current week/year
        const { week, year } = getCurrentWeek();
        console.log(`Setting up test data for current week ${week}, year ${year}`);

        // Add test rounds for the current week
        const testRounds = [
            // Admin's rounds for current week
            {
                userId: adminId,
                date: new Date(), // Today's date
                course: 'Augusta National',
                score: 72,
                week,
                year,
                points: 3,
                round: {  // Add round object to match historical data format
                    date: new Date(),
                    course: 'Augusta National',
                    score: 72
                }
            },
            // Tiger's rounds
            {
                userId: userIds['Tiger Woods'],
                date: new Date(),
                course: 'St Andrews',
                score: 68,
                week,
                year,
                points: 10,
                round: {  // Add round object to match historical data format
                    date: new Date(),
                    course: 'St Andrews',
                    score: 68
                }
            }
        ];

        // Insert rounds and their corresponding points
        for (const round of testRounds) {
            // Insert round first
            const roundResult = await pool.query(
                `INSERT INTO rounds (user_id, date_played, course_name, gross_score, week_number, year)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [round.userId, round.round.date, round.round.course, round.round.score, round.week, round.year]
            );

            // Insert weekly standing with round_id
            await pool.query(
                `INSERT INTO weekly_standings (user_id, week_number, year, points, round_id)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (week_number, user_id, year) DO UPDATE 
                 SET points = EXCLUDED.points, round_id = EXCLUDED.round_id`,
                [round.userId, round.week, round.year, round.points, roundResult.rows[0].id]
            );
        }

        // Add some historical data (previous weeks)
        const historicalData = [
            // Week week-2
            {
                userId: userIds['Tiger Woods'],
                week: week - 2,
                year,
                points: 10,
                round: {
                    date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)), // 2 weeks ago
                    course: 'Pebble Beach',
                    score: 65
                }
            },
            {
                userId: adminId,
                week: week - 2,
                year,
                points: 7,
                round: {
                    date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)),
                    course: 'St Andrews',
                    score: 70
                }
            },
            // Week week-1
            {
                userId: userIds['Phil Mickelson'],
                week: week - 1,
                year,
                points: 10,
                round: {
                    date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 1 week ago
                    course: 'Augusta National',
                    score: 67
                }
            },
            {
                userId: adminId,
                week: week - 1,
                year,
                points: 5,
                round: {
                    date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
                    course: 'Pine Valley',
                    score: 73
                }
            }
        ];

        // Insert historical rounds and their corresponding points
        for (const data of historicalData) {
            // Insert round first
            const roundResult = await pool.query(
                `INSERT INTO rounds (user_id, date_played, course_name, gross_score, week_number, year)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [data.userId, data.round.date, data.round.course, data.round.score, data.week, data.year]
            );

            // Insert weekly standing with round_id
            await pool.query(
                `INSERT INTO weekly_standings (user_id, week_number, year, points, round_id)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (week_number, user_id, year) DO UPDATE 
                 SET points = EXCLUDED.points, round_id = EXCLUDED.round_id`,
                [data.userId, data.week, data.year, data.points, roundResult.rows[0].id]
            );
        }

        // Log expected totals
        console.log('\nTest data added successfully!');
        console.log('Expected standings for current week:');
        console.log('Tiger Woods: 10 points');
        console.log('Admin: 3 points');
        
        console.log('\nExpected overall standings:');
        console.log('Tiger Woods: 20 points (10 + 10 + 0)');
        console.log('Admin: 15 points (3 + 5 + 7)');
        console.log('Phil Mickelson: 10 points (0 + 10 + 0)');

    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await pool.end();
    }
}

module.exports = { pool };