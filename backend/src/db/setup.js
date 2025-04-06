require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const { getCurrentWeek } = require('../utils/weekCalculator');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db.golf-deildin.orb.local',
    database: process.env.DB_NAME || 'golf_deildin',
    password: process.env.DB_PASSWORD || 'aserthebest',
    port: process.env.DB_PORT || 5432,
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
            await delay(2000);
        }
    }
}

if (process.env.SETUP_DB === 'true') {
    setupDatabase();
}

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        await waitForDb();

        console.log('Dropping existing tables...');
        await pool.query(`
            DROP TABLE IF EXISTS weekly_standings;
            DROP TABLE IF EXISTS rounds;
            DROP TABLE IF EXISTS users;
        `);

        console.log('Creating new tables...');
        const sqlFile = await fs.readFile(path.join(__dirname, '..', '..', 'database.sql'), 'utf8');
        await pool.query(sqlFile);

        console.log('Creating admin user...');
        const adminResult = await pool.query(
            `INSERT INTO users (username, email, password, handicap)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            ['Janus', 'admin@golf.com', await bcrypt.hash('admin123', 10), 0]
        );
        const adminId = adminResult.rows[0].id;

        console.log('Creating test users...');
        const testUsers = [
            ['Tiger Woods', 'tiger@golf.com', 'tiger123', 0],
            ['Birgir Leifur Hafþórsson', 'birgir@golf.com', 'birgir123', 5],
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

        const { week, year } = getCurrentWeek();
        console.log(`Setting up test data for current week ${week}, year ${year}`);

        // Test rounds fyrir núverandi viku
        const testRounds = [
            {
                userId: adminId,
                date: new Date(),
                course: 'Augusta National',
                score: 72,
                week,
                year,
                points: 6,
                round: {
                    date: new Date(),
                    course: 'Augusta National',
                    score: 72
                }
            },
            {
                userId: userIds['Tiger Woods'],
                date: new Date(),
                course: 'St Andrews',
                score: 68,
                week,
                year,
                points: 10,
                round: {
                    date: new Date(),
                    course: 'St Andrews',
                    score: 68
                }
            },
            {
                userId: userIds['Birgir Leifur Hafþórsson'],
                date: new Date(Date.now() - 24*60*60*1000),
                course: 'Pine Valley',
                score: 73,
                week,
                year,
                points: 5,
                round: {
                    date: new Date(Date.now() - 24*60*60*1000),
                    course: 'Pine Valley',
                    score: 73
                }
            },
            {
                userId: userIds['Birgir Leifur Hafþórsson'],
                date: new Date(),
                course: 'Augusta National',
                score: 70,
                week,
                year,
                points: 8,
                round: {
                    date: new Date(),
                    course: 'Augusta National',
                    score: 70
                }
            },
            {
                userId: userIds['Rory McIlroy'],
                date: new Date(),
                course: 'St Andrews',
                score: 69,
                week,
                year,
                points: 9,
                round: {
                    date: new Date(),
                    course: 'St Andrews',
                    score: 69
                }
            }
        ];

        // Bæta við hringjum og samsvarandi stigum
        for (const round of testRounds) {
            // Fyrst bæta við hringjum
            const roundResult = await pool.query(
                `INSERT INTO rounds (user_id, date_played, course_name, gross_score, week_number, year)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [round.userId, round.round.date, round.round.course, round.round.score, round.week, round.year]
            );

            // Bæta við weekly standing með round_id
            await pool.query(
                `INSERT INTO weekly_standings (user_id, week_number, year, points, round_id)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (week_number, user_id, year) DO UPDATE 
                 SET points = EXCLUDED.points, round_id = EXCLUDED.round_id`,
                [round.userId, round.week, round.year, round.points, roundResult.rows[0].id]
            );
        }

        // Bæta við sögulegum gögnum (fyrri vikur)
        const historicalData = [
            // Week week-2
            {
                userId: userIds['Tiger Woods'],
                week: week - 2,
                year,
                points: 8,
                round: {
                    date: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)),
                    course: 'St Andrews',
                    score: 68
                }
            },
            {
                userId: userIds['Tiger Woods'],
                week: week - 2,
                year,
                points: 10,
                round: {
                    date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)),
                    course: 'Pebble Beach',
                    score: 65
                }
            },
            {
                userId: userIds['Birgir Leifur Hafþórsson'],
                week: week - 2,
                year,
                points: 10,
                round: {
                    date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)),
                    course: 'Augusta National',
                    score: 67
                }
            },
            {
                userId: userIds['Rory McIlroy'],
                week: week - 2,
                year,
                points: 7,
                round: {
                    date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)),
                    course: 'St Andrews',
                    score: 71
                }
            },
            {
                userId: adminId,
                week: week - 2,
                year,
                points: 8,
                round: {
                    date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)),
                    course: 'Augusta National',
                    score: 70
                }
            },
            // Week week-1
            {
                userId: userIds['Tiger Woods'],
                week: week - 1,
                year,
                points: 10,
                round: {
                    date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
                    course: 'St Andrews',
                    score: 66
                }
            },
            {
                userId: userIds['Birgir Leifur Hafþórsson'],
                week: week - 1,
                year,
                points: 9,
                round: {
                    date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
                    course: 'Augusta National',
                    score: 68
                }
            },
            {
                userId: userIds['Rory McIlroy'],
                week: week - 1,
                year,
                points: 6,
                round: {
                    date: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)),
                    course: 'Pebble Beach',
                    score: 72
                }
            },
            {
                userId: userIds['Rory McIlroy'],
                week: week - 1,
                year,
                points: 8,
                round: {
                    date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
                    course: 'St Andrews',
                    score: 70
                }
            },
            {
                userId: adminId,
                week: week - 1,
                year,
                points: 5,
                round: {
                    date: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)),
                    course: 'Pine Valley',
                    score: 73
                }
            },
            {
                userId: adminId,
                week: week - 1,
                year,
                points: 7,
                round: {
                    date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
                    course: 'Augusta National',
                    score: 71
                }
            }
        ];

        // Bæta við sögulegum hringjum og samsvarandi stigum
        for (const data of historicalData) {
            // Fyrst bæta við hringjum
            const roundResult = await pool.query(
                `INSERT INTO rounds (user_id, date_played, course_name, gross_score, week_number, year)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [data.userId, data.round.date, data.round.course, data.round.score, data.week, data.year]
            );

            // Bæta við weekly standing með round_id
            await pool.query(
                `INSERT INTO weekly_standings (user_id, week_number, year, points, round_id)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (week_number, user_id, year) DO UPDATE 
                 SET points = EXCLUDED.points, round_id = EXCLUDED.round_id`,
                [data.userId, data.week, data.year, data.points, roundResult.rows[0].id]
            );
        }

        console.log('\nTest data added successfully!');
        console.log('Expected standings for current week:');
        console.log('Tiger Woods: 10 points');
        console.log('Rory McIlroy: 9 points');
        console.log('Birgir Leifur Hafþórsson: 8 points');
        console.log('Janus: 6 points');
        
        console.log('\nExpected overall standings:');
        console.log('Tiger Woods: 30 points (10 + 10 + 10)');
        console.log('Birgir Leifur Hafþórsson: 27 points (8 + 10 + 9)');
        console.log('Rory McIlroy: 24 points (9 + 7 + 8)');
        console.log('Janus: 21 points (6 + 8 + 7)');

    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await pool.end();
    }
}

module.exports = { pool };