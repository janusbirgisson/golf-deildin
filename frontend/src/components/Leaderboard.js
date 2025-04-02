import React from "react";
import WeeklyStandings from './WeeklyStandings';
import OverallStandings from './OverallStandings';
import DeadlineCountdown from './DeadlineCountdown';

function Leaderboard() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
            <DeadlineCountdown />
            {/* This div handles the side-by-side layout */}
            <div className="flex flex-col md:flex-row gap-5 mt-5">
                {/* Each div takes up equal space */}
                <div className="flex-1 min-w-0">
                    <WeeklyStandings />
                </div>
                <div className="flex-1 min-w-0">
                    <OverallStandings />
                </div>
            </div>
        </div>
    );
}

export default Leaderboard;