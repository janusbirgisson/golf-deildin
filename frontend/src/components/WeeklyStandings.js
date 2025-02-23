import React from "react";
import { useEffect, useState } from "react";
import { getCurrentWeek } from "./weekCalculator";

function WeeklyStandings() {
    const [standings, setStandings] = useState([]);
    const { week, year } = getCurrentWeek(); // You'll need to create this utility in frontend

    useEffect(() => {
        fetch(`/api/standings/weekly?week=${week}&year=${year}`)
            .then(res => res.json())
            .then(data => setStandings(data))
            .catch(error => console.error('Error:', error));
    }, [week, year]);

    return (
        <div>
            <h3>This Week's Standings</h3>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Net Score</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((standing, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{standing.username}</td>
                            <td>{standing.net_score}</td>
                            <td>{standing.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WeeklyStandings;