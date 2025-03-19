import React from "react";
import WeeklyStandings from './WeeklyStandings';
import OverallStandings from './OverallStandings';
import './Leaderboard.css';
import DeadlineCountdown from './DeadlineCountdown';
function Leaderboard() {
    return (
        <div className="leaderboard-container">
            <h2>Golf League Standings</h2>
            <DeadlineCountdown />
            <div className="standings-layout">
                <WeeklyStandings />
                <OverallStandings />
            </div>
        </div>
    );
}

export default Leaderboard;