import React, { useEffect, useState } from "react";
import { getCurrentWeek } from "./weekCalculator";
import './Standings.css';

function WeeklyStandings() {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { week, year } = getCurrentWeek();

    useEffect(() => {
        setLoading(true);
        fetch(`/api/standings/weekly?week=${week}&year=${year}`)
            .then(res => res.json())
            .then(data => {
                console.log('Setting standings with:', data);
                setStandings(data);
                setError(null);
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load standings');
            })
            .finally(() => setLoading(false));
    }, [week, year]);

    if (loading) return <div className="standings-section">Loading...</div>;
    if (error) return <div className="standings-section">Error: {error}</div>;

    return (
        <div className="standings-section">
            <h3>Staðan þessa vikuna (Vika {week})</h3>
            <table className="standings-table">
                <thead>
                    <tr>
                        <th>Sæti</th>
                        <th>Golfari</th>
                        <th>Brúttó skor</th>
                        <th>Forgjöf</th>
                        <th>Nettó skor</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((standing, index) => (
                        <tr key={standing.username || index}>
                            <td className="position">{index + 1}</td>
                            <td className="player-name">{standing.username}</td>
                            <td className="gross-score">{standing.gross_score}</td>
                            <td className="handicap">{standing.handicap}</td>
                            <td className="net-score">{standing.net_score}</td>
                        </tr>
                    ))}
                    {standings.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{textAlign: 'center'}}>
                                Engir hringir skráðir þessa vikuna
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default WeeklyStandings;