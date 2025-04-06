require('dotenv').config();
require('./src/tasks/calculateWeeklyPoints');

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const { getCurrentWeek, getWeekDeadline } = require('./src/utils/weekCalculator');
const cron = require('node-cron');
const { testWeeklyCalculation } = require('./src/tasks/calculateWeeklyPoints');



// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db.golf-deildin.orb.local',
    database: process.env.DB_NAME || 'golf_deildin',
    password: process.env.DB_PASSWORD || 'aserthebest',
    port: parseInt(process.env.DB_PORT || '5432', 10)
});

// Routes
app.get('/api', (req, res) => {
    res.send('Hello from the Golf League Backend!');
  });

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


app.post('/api/users/register', async (req, res) => {
    const { username, password, email, handicap } = req.body;

    console.log('Registration attempt:', { 
        username, 
        email, 
        handicap,
        bodyReceived: !!req.body 
    });

    try {
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Password hashed successfully');

        const result = await pool.query(
            `INSERT INTO users (username, password, email, handicap)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, handicap`,
            [username, hashedPassword, email, handicap]
        );

        console.log('User registered successfully');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        
        if (error.code === '23505') {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ 
                error: 'Error registering user',
                details: error.message 
            });
        }
    }
});

app.get('/api/standings/overall', async (req, res) => {
    try {
        const { week, year } = getCurrentWeek();
        const deadline = getWeekDeadline(week, year);
        
        const result = await pool.query(`
            SELECT 
                u.username,
                COALESCE(SUM(ws.points), 0) as total_points
            FROM users u
            LEFT JOIN weekly_standings ws ON u.id = ws.user_id
            WHERE ws.week_number < $1 OR (ws.week_number = $1 AND ws.year < $2)
            GROUP BY u.id, u.username
            ORDER BY total_points DESC NULLS LAST
        `, [week, year]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching overall standings:', error);
        res.status(500).json({ error: 'Error fetching overall standings' });
    }
});

app.get('/api/rounds', async (req, res) => {
    try {
        // This is a simple query that grabs all rounds.
        // You could ORDER BY date_played, user_id, or whatever you need.
        const result = await pool.query(`
            SELECT
                r.id,
                r.date_played,
                r.course_name,
                r.gross_score,
                r.created_at,
                u.username,
                u.handicap,
                (r.gross_score - u.handicap) AS net_score
            FROM rounds r
            JOIN users u ON r.user_id = u.id
            ORDER BY net_score ASC
        `);
    
        // Return the rows as JSON
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching rounds', error);
        res.status(500).json({ error: 'Error fetching rounds' });
    }
});

app.post('/api/rounds', authMiddleware, async (req, res) => {
    const { date_played, course_name, gross_score, handicap } = req.body;
    const { week, year } = getCurrentWeek();
    const deadline = getWeekDeadline(week, year);

    try {
        // Check if past deadline
        if (new Date() > deadline) {
            return res.status(400).json({ error: 'Past deadline for this week' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update user handicap
            await client.query(
                `UPDATE users SET handicap = $1 WHERE id = $2`,
                [handicap, req.user.userId]
            );

            // Insert new round
            const result = await client.query(
                `INSERT INTO rounds (user_id, date_played, course_name, gross_score, week_number, year)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [req.user.userId, date_played, course_name, gross_score, week, year]
            );

            await client.query('COMMIT');
            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error submitting round:', error);
        res.status(500).json({ error: 'Error submitting round' });
    }
});

app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email }); // Don't log password

    try {
        const userResult = await pool.query(
            `SELECT id, username, email, password, handicap
            FROM users
            WHERE email = $1`,
           [email]
        );

        console.log('User found:', userResult.rowCount > 0);

        if (userResult.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                handicap: user.handicap
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

app.get('/api/standings/weekly', async (req, res) => {
    const { week, year } = req.query.week ? 
        { week: parseInt(req.query.week), year: parseInt(req.query.year) } : 
        getCurrentWeek();

    console.log('Backend: Fetching standings for week:', week, 'year:', year);

    try {
        const result = await pool.query(`
            SELECT 
                u.username,
                r.gross_score,
                u.handicap,
                (r.gross_score - u.handicap) as net_score,
                COALESCE(ws.points, 0) as points
            FROM users u
            LEFT JOIN (
                SELECT DISTINCT ON (user_id) *
                FROM rounds
                WHERE week_number = $1 AND year = $2
                ORDER BY user_id, (gross_score) ASC
            ) r ON u.id = r.user_id
            LEFT JOIN weekly_standings ws ON u.id = ws.user_id 
                AND ws.week_number = $1 
                AND ws.year = $2
            WHERE r.id IS NOT NULL
            ORDER BY net_score ASC
        `, [week, year]);

        console.log('Backend: Query results:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Backend: Error fetching standings:', error);
        res.status(500).json({ error: 'Error fetching standings' });
    }
});

app.post('/api/test-weekly-calculation', async (req, res) => {
    try {
        await testWeeklyCalculation();
        res.json({ success: true, message: 'Weekly calculation test completed' });
    } catch (error) {
        console.error('Error during weekly calculation test:', error);
        res.status(500).json({ error: 'Error during weekly calculation test' });
    }
});

app.get('/api/users/:username/scores', async (req, res) => {
    try {
        const { week, year } = getCurrentWeek();
        
        // First get the user's total points (only from completed weeks)
        const totalPointsResult = await pool.query(`
            SELECT COALESCE(SUM(ws.points), 0) as total_points
            FROM users u
            LEFT JOIN weekly_standings ws ON u.id = ws.user_id
            WHERE u.username = $1
            AND (ws.week_number < $2 OR (ws.week_number = $2 AND ws.year < $3))
            GROUP BY u.id
        `, [req.params.username, week, year]);

        // Then get scores with their weekly points
        const scoresResult = await pool.query(`
            WITH BestScores AS (
                SELECT DISTINCT ON (user_id, week_number, year) 
                    r.id as best_round_id
                FROM rounds r
                JOIN users u ON r.user_id = u.id
                WHERE u.username = $1
                AND (r.week_number < $2 OR (r.week_number = $2 AND r.year < $3))
                GROUP BY user_id, week_number, year, r.id, (r.gross_score - u.handicap)
                ORDER BY user_id, week_number, year, (r.gross_score - u.handicap) ASC
            )
            SELECT 
                r.id,
                r.date_played,
                r.course_name,
                r.gross_score,
                r.week_number,
                r.year,
                u.handicap,
                (r.gross_score - u.handicap) as net_score,
                COALESCE(ws.points, 0) as points,
                CASE 
                    WHEN bs.best_round_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_best_score
            FROM users u
            JOIN rounds r ON u.id = r.user_id
            LEFT JOIN weekly_standings ws 
                ON u.id = ws.user_id 
                AND r.week_number = ws.week_number 
                AND r.year = ws.year
            LEFT JOIN BestScores bs ON r.id = bs.best_round_id
            WHERE u.username = $1
            ORDER BY r.date_played DESC
        `, [req.params.username, week, year]);

        res.json({
            total_points: totalPointsResult.rows[0]?.total_points || 0,
            scores: scoresResult.rows
        });
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ error: 'Error fetching user scores' });
    }
});

app.get('/api/users/:username/weekly-scores', async (req, res) => {
    try {
        const { week, year } = req.query;
        const username = req.params.username;

        const scoresResult = await pool.query(`
            WITH BestScores AS (
                SELECT DISTINCT ON (user_id) 
                    r.id as best_round_id
                FROM rounds r
                JOIN users u ON r.user_id = u.id
                WHERE u.username = $1
                AND r.week_number = $2
                AND r.year = $3
                ORDER BY user_id, (r.gross_score - u.handicap) ASC
            )
            SELECT 
                r.id,
                r.date_played,
                r.course_name,
                r.gross_score,
                u.handicap,
                (r.gross_score - u.handicap) as net_score,
                COALESCE(ws.points, 0) as points,
                CASE WHEN bs.best_round_id IS NOT NULL THEN true ELSE false END as is_best_score
            FROM users u
            JOIN rounds r ON u.id = r.user_id
            LEFT JOIN weekly_standings ws 
                ON u.id = ws.user_id 
                AND r.week_number = ws.week_number 
                AND r.year = ws.year
            LEFT JOIN BestScores bs ON r.id = bs.best_round_id
            WHERE u.username = $1
            AND r.week_number = $2
            AND r.year = $3
            ORDER BY r.date_played DESC
        `, [username, week, year]);

        res.json({
            scores: scoresResult.rows
        });
    } catch (error) {
        console.error('Error fetching weekly user scores:', error);
        res.status(500).json({ error: 'Error fetching weekly user scores' });
    }
});

app.post('/api/simulate-deadline', async (req, res) => {
    console.log('Simulating deadline calculation...');
    const now = new Date();
    const { week, year } = getCurrentWeek();
    
    try {
        const rounds = await pool.query(`
            SELECT DISTINCT ON (r.user_id)
                r.id,
                r.user_id,
                r.gross_score,
                r.date_played,
                u.handicap,
                u.username,
                (r.gross_score - u.handicap) as netscore
            FROM rounds r
            JOIN users u ON r.user_id = u.id
            WHERE r.week_number = $1 AND r.year = $2
            ORDER BY r.user_id, r.date_played DESC
        `, [week, year]);
        
        console.log(`Found ${rounds.rows.length} most recent rounds to process`);
        console.log('Rounds before sorting:', rounds.rows);
        
        const sortedRounds = rounds.rows.sort((a, b) => 
            (a.gross_score - a.handicap) - (b.gross_score - b.handicap)
        );
        
        console.log('Rounds after sorting by net score:', sortedRounds);
        
        const points = [10, 8, 6, 4, 2];

        for (let i = 0; i < sortedRounds.length; i++) {
            const round = sortedRounds[i];
            await pool.query(`
                INSERT INTO weekly_standings (week_number, year, user_id, round_id, points)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (week_number, user_id, year) 
                DO UPDATE SET points = EXCLUDED.points
            `, [week, year, round.user_id, round.id, points[i] || 1]);
            console.log(`Assigned ${points[i] || 1} points to ${round.username} (user_id: ${round.user_id}) for their most recent round ${round.id} (played on ${round.date_played}) with net score ${round.netscore}`);
        }

        res.json({
            message: 'Deadline simulation completed',
            processedRounds: sortedRounds.map(round => ({
                username: round.username,
                gross_score: round.gross_score,
                handicap: round.handicap,
                net_score: round.netscore,
                date_played: round.date_played,
                points: points[sortedRounds.indexOf(round)] || 1
            }))
        });
    } catch (error) {
        console.error('Error in deadline simulation:', error);
        res.status(500).json({ error: 'Failed to simulate deadline' });
    }
});
