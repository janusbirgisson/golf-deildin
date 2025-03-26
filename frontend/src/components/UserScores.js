import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Standings.css';

function UserScores() {
    const [scores, setScores] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username } = useParams();

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/users/${encodeURIComponent(username)}/scores`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch scores');
                return res.json();
            })
            .then(data => {
                console.log('Received data:', data);
                setScores(data.scores || []);
                setTotalPoints(data.total_points || 0);
                setError(null);
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load scores');
            })
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    if (!scores) {
        return <div>No scores available</div>;
    }

    return (
        <div className="standings-section">
            <h3>Saga {username}</h3>
            <div className="total-points-banner">
                <h4>Heildarstig: {totalPoints}</h4>
            </div>
            <table className="standings-table">
                <thead>
                    <tr>
                        <th>Dagsetning</th>
                        <th>Völlur</th>
                        <th>Högg</th>
                        <th>Forgjöf</th>
                        <th>Nettó skor</th>
                        <th>Vika</th>
                        <th>Stig</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.length > 0 ? (
                        scores.map((score, index) => (
                            <tr 
                                key={score.id || index}
                                className={score.is_best_score ? 'best-score-row' : ''}
                                title={score.is_best_score ? 'Besti hringur vikunnar' : ''}
                            >
                                <td>{new Date(score.date_played).toLocaleDateString()}</td>
                                <td>{score.course_name}</td>
                                <td>{score.gross_score}</td>
                                <td>{score.handicap}</td>
                                <td>{score.net_score}</td>
                                <td>Vika {score.week_number}</td>
                                <td>
                                    {score.points}
                                    {score.is_best_score && (
                                        <span className="best-score-indicator" title="Besti hringur vikunnar">★</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{textAlign: 'center'}}>
                                Engir hringir skráðir
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default UserScores;