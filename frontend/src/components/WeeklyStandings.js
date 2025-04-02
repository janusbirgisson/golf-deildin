import React, { useEffect, useState } from "react";
import { getCurrentWeek } from "./weekCalculator";
import './Standings.css';
import { useNavigate } from 'react-router-dom';

function WeeklyStandings() {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { week, year } = getCurrentWeek();
    const navigate = useNavigate();

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

    const handleUserClick = (username) => {
        const { week, year } = getCurrentWeek();
        navigate(`/weekly-user/${encodeURIComponent(username)}/${week}/${year}`);
    };

    if (loading) return <div className="max-w-7xl mx-auto p-5">Loading...</div>;
    if (error) return <div className="max-w-7xl mx-auto p-5">Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-5 bg-tertiary rounded-lg shadow-md my-5 min-h-[400px]">
            <div className="w-full flex justify-start mb-4">
                <h2 className="text-2xl font-medium text-white">Staðan þessa vikuna (Vika {week})</h2>
            </div>
            <div className="w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="text-lg bg-secondary">
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Sæti</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Golfari</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Brúttó skor</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Forgjöf</th>
                            <th className="p-3 text-left font-medium text-white whitespace-nowrap">Nettó skor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((standing, index) => (
                            <tr 
                                key={standing.username || index}
                                className="border-b border-neutral/30 hover:bg-secondary even:bg-secondary/30"
                            >
                                <td className="p-3 font-medium text-neutral whitespace-nowrap">{index + 1}</td>
                                <td 
                                    className="p-3 text-neutral cursor-pointer hover:text-accent whitespace-nowrap"
                                    onClick={() => handleUserClick(standing.username)}
                                >
                                    {standing.username}
                                </td>
                                <td className="p-3 text-white whitespace-nowrap">{standing.gross_score}</td>
                                <td className="p-3 text-white whitespace-nowrap">{standing.handicap}</td>
                                <td className="p-3 font-semibold text-accent whitespace-nowrap">{standing.net_score}</td>
                            </tr>
                        ))}
                        {standings.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-3 text-center text-neutral">
                                    Engir hringir skráðir þessa vikuna
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WeeklyStandings;