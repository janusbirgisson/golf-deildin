import React, { useState, useEffect } from "react";
import './Standings.css';

function OverallStandings() {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/standings/overall')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch standings');
                return res.json();
            })
            .then(data => {
                setStandings(data);
                setError(null);
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load standings');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="standings-section">Loading...</div>;
    if (error) return <div className="standings-section">Error: {error}</div>;

    return (
        <div className="standings-section">
            <h3>Heildarstaðan</h3>
            <table className="standings-table">
                <thead>
                    <tr>
                        <th>Sæti</th>
                        <th>Golfari</th>
                        <th>Heildarstig</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((standing, index) => (
                        <tr key={standing.username || index}>
                            <td className="position">{index + 1}</td>
                            <td className="player-name">{standing.username}</td>
                            <td className="points">{standing.total_points || 0}</td>
                        </tr>
                    ))}
                    {standings.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{textAlign: 'center'}}>
                                Engin staða aðgengileg
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default OverallStandings;