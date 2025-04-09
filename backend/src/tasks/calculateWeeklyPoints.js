const cron = require('node-cron');
const { getCurrentWeek, getWeekDeadline } = require('../utils/weekCalculator');
const { pool } = require('../db/setup');

console.log('Setting up weekly points calculation cron job for Sunday nights...');

cron.schedule('59 23 * * 0', async () => {
    const now = new Date();
    const { week, year } = getCurrentWeek();
    
    console.log(`Weekly deadline reached! ${now.toISOString()}`);
    console.log(`Calculating final points for week ${week}, year ${year}`);

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
        
        const sortedRounds = rounds.rows.sort((a, b) => 
            (a.gross_score - a.handicap) - (b.gross_score - b.handicap)
        );
        
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
        console.log('Weekly points calculated successfully for deadline');
    } catch (error) {
        console.error('Error calculating weekly points:', error);
    }
});

async function testWeeklyCalculation() {
    const { week, year } = getCurrentWeek();
    console.log(`Testing calculation for week ${week}, year ${year}`);
    
    try {
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
        
    } catch (error) {
        console.error('Test calculation error:', error);
    }
}

module.exports = { testWeeklyCalculation };