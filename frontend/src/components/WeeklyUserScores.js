import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function WeeklyUserScores() {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username, week, year } = useParams();

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/users/${encodeURIComponent(username)}/weekly-scores?week=${week}&year=${year}`)
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
        <div className="max-w-7xl mx-auto p-5 bg-tertiary rounded-lg shadow-md my-5 min-h-[400px]">
            <div className="w-full flex justify-start mb-4">
                <h2 className="text-2xl font-medium text-white">Hringir {username} fyrir viku {week}</h2>
            </div>
            <div className="w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="text-lg bg-secondary">
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Dagsetning</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Völlur</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Högg</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Forgjöf</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Nettó skor</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Stig</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score, index) => (
                            <tr 
                                key={score.id || index}
                                className="border-b border-neutral/30 hover:bg-secondary even:bg-secondary/30"
                                title={score.is_best_score ? 'Besti hringur vikunnar' : ''}
                            >
                                <td className="p-3 text-neutral whitespace-nowrap">{new Date(score.date_played).toLocaleDateString()}</td>
                                <td className="p-3 text-neutral whitespace-nowrap">{score.course_name}</td>
                                <td className="p-3 text-white whitespace-nowrap">{score.gross_score}</td>
                                <td className="p-3 text-white whitespace-nowrap">{score.handicap}</td>
                                <td className="p-3 text-white whitespace-nowrap">{score.net_score}</td>
                                <td className="p-3 font-semibold text-accent whitespace-nowrap">
                                    {score.points}
                                    {score.is_best_score && (
                                        <span className="ml-2 text-yellow-400" title="Besti hringur vikunnar">★</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WeeklyUserScores; 