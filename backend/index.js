require('dotenv').config();

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

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'golf_deildin',
    password: process.env.DB_PASS || 'aserthebest',
    port: parseInt(process.env.DB_PORT || '5432', 10)
});

// Run every Sunday at 23:59
cron.schedule('59 23 * * 0', async () => {
    const { week, year } = getCurrentWeek();
    
    try {
        // Get all rounds for the week
        const rounds = await pool.query(`
            SELECT 
                r.id,
                r.user_id,
                r.gross_score,
                u.handicap,
                (r.gross_score - u.handicap) as net_score
            FROM rounds r
            JOIN users u ON r.user_id = u.id
            WHERE r.week_number = $1 AND r.year = $2
            ORDER BY (r.gross_score - u.handicap) ASC
        `, [week, year]);

        // Calculate points (example: 10 points for 1st, 8 for 2nd, etc.)
        const points = [10, 8, 6, 4, 2];
        
        // Insert standings
        for (let i = 0; i < rounds.rows.length; i++) {
            const round = rounds.rows[i];
            await pool.query(`
                INSERT INTO weekly_standings (week_number, year, user_id, round_id, points)
                VALUES ($1, $2, $3, $4, $5)
            `, [week, year, round.user_id, round.id, points[i] || 1]);
        }
    } catch (error) {
        console.error('Error calculating weekly points:', error);
    }
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
        const result = await pool.query(`
            SELECT 
                u.username,
                SUM(ws.points) as total_points
            FROM users u
            LEFT JOIN weekly_standings ws ON u.id = ws.user_id
            GROUP BY u.id, u.username
            ORDER BY total_points DESC NULLS LAST
        `);
        
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
    const { date_played, course_name, gross_score } = req.body;
    const { week, year } = getCurrentWeek();
    const deadline = getWeekDeadline(week, year);

    try {
        // Check if past deadline
        if (new Date() > deadline) {
            return res.status(400).json({ error: 'Past deadline for this week' });
        }

        // Insert new round
        const result = await pool.query(
            `INSERT INTO rounds (user_id, date_played, course_name, gross_score, week_number, year)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [req.user.userId, date_played, course_name, gross_score, week, year]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error submitting round:', error);
        res.status(500).json({ error: 'Error submitting round' });
    }
});

app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(
            `SELECT id, username, email, password, handicap
            FROM users
            WHERE email = $1`,
           [email]
        );

        if (userResult.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
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
    }   catch (error) {
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
                ORDER BY user_id, created_at DESC
            ) r ON u.id = r.user_id
            LEFT JOIN weekly_standings ws ON u.id = ws.user_id 
                AND ws.week_number = $1 
                AND ws.year = $2
            WHERE r.id IS NOT NULL
            ORDER BY net_score ASC
        `, [week, year]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ error: 'Error fetching standings' });
    }
});
