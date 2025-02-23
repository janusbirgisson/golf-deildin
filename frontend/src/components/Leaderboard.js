import React from "react";
import WeeklyStandings from './WeeklyStandings';
import OverallStandings from './OverallStandings';

function Leaderboard() {
    return (
        <div>
            <h2>Golf League Standings</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                <WeeklyStandings />
                <OverallStandings />
            </div>
        </div>
    );
}

export default Leaderboard;