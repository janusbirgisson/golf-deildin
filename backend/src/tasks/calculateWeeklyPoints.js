const cron = require('node-cron');
const { getCurrentWeek, getWeekDeadline } = require('../utils/weekCalculator');
const { pool } = require('../db/setup');
cron.schedule('59 23 * * *', async () => {
    const { week, year } = getCurrentWeek();

    try {
        const rounds = await pool.query(`
            SELECT
                r.id,
                r.user_id,
                r.gross_score,
                u.handicap,
                (r.gross_score - u.handicap) as netscore
            FROM rounds r
            JOIN users u ON r.user_id = u.id
            WHERE r.week_number = $1 AND r.year = $2
            ORDER BY (r.gross_score - u.handicap) ASC
        `, [week, year]);
        
        const points = [10, 8, 6, 4, 2];

        for (let i = 0; i < rounds.rows.length; i++) {
            const round = rounds.rows[i];
            await pool.query(`
                INSERT INTO weekly_standings (week_number, year, user_id, round_id, points)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (week_number, user_id, year) 
                DO UPDATE SET points = EXCLUDED.points
            `, [week, year, round.user_id, round.id, points[i] || 1]);
        }
        console.log('Weekly points calculated successfully');
    } catch (error) {
        console.error('Error calculating weekly points:', error);
    }
});

// Add this development testing function
async function testWeeklyCalculation() {
    const { week, year } = getCurrentWeek();
    console.log(`Testing calculation for week ${week}, year ${year}`);
    
    try {
        // Same query as in the cron job
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

        console.log('Found rounds:', rounds.rows);
        
        // Rest of the calculation...
    } catch (error) {
        console.error('Test calculation error:', error);
    }
}

// Export for testing
module.exports = { testWeeklyCalculation };