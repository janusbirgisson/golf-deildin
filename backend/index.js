require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

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

    // Log the incoming request (excluding password)
    console.log('Registration attempt:', { 
        username, 
        email, 
        handicap,
        bodyReceived: !!req.body 
    });

    try {
        // Log before hashing
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Log after hashing
        console.log('Password hashed successfully');

        const result = await pool.query(
            `INSERT INTO users (username, password, email, handicap)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, handicap`,
            [username, hashedPassword, email, handicap]
        );

        // Log after query execution
        console.log('User registered successfully');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        
        // Send more specific error response
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
    const { userId } = req.user;
    const { date_played, course_name, gross_score } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO rounds (user_id, date_played, course_name, gross_score)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, date_played, course_name, gross_score, created_at`,
            [userId, date_played, course_name, gross_score]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting round:', error);
        res.status(500).json({ error: 'Error inserting round' });
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

// Add this test endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});
