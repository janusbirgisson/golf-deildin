import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Standings.css';

function WeeklyUserScores() {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username, week, year } = useParams();

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/users/${encodeURIComponent(username)}/weekly-scores?week=${week}&year=${year}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch scores');
                return res.json();
            })
            .then(data => {
                console.log('Received weekly scores:', data);
                setScores(data.scores || []);
                setError(null);
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load scores');
            })
            .finally(() => setLoading(false));
    }, [username, week, year]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    if (!scores || scores.length === 0) {
        return <div>No scores available for this week</div>;
    }

    return (
        <div className="standings-section">
            <h3>Hringir {username} fyrir viku {week}</h3>
            <table className="standings-table">
                <thead>
                    <tr>
                        <th>Dagsetning</th>
                        <th>Völlur</th>
                        <th>Högg</th>
                        <th>Forgjöf</th>
                        <th>Nettó skor</th>
                        <th>Stig</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((score, index) => (
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
                            <td>
                                {score.points}
                                {score.is_best_score && (
                                    <span className="best-score-indicator" title="Besti hringur vikunnar">★</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WeeklyUserScores; 