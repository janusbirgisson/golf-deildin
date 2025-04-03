import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function UserScores() {
    const [scores, setScores] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { username } = useParams();

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/users/${encodeURIComponent(username)}/scores`)
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
        <div className="max-w-7xl mx-auto p-5 bg-tertiary rounded-lg shadow-md my-5 min-h-[400px]">
            <div className="w-full flex justify-start mb-4">
                <h2 className="text-2xl font-medium text-white">Saga {username}</h2>
            </div>
            <div className="bg-secondary p-4 rounded-lg mb-6">
                <h3 className="text-xl font-medium text-white text-center">Heildarstig: {totalPoints}</h3>
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
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Vika</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Stig</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.length > 0 ? (
                            scores.map((score, index) => (
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
                                    <td className="p-3 text-neutral whitespace-nowrap">Vika {score.week_number}</td>
                                    <td className="p-3 font-semibold text-accent whitespace-nowrap">
                                        {score.points}
                                        {score.is_best_score && (
                                            <span className="ml-2 text-yellow-400" title="Besti hringur vikunnar">★</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-3 text-center text-neutral">
                                    Engir hringir skráðir
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserScores;