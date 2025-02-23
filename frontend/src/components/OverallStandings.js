const { default: React } = require("react");
const { useState, useEffect } = require("react");

export default function OverallStandings() {
    const [standings, setStandings] = useState([]);

    useEffect(() => {
        fetch('/api/standings/overall')
            .then(res => res.json())
            .then(data => setStandings(data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <h3>Overall League Standings</h3>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((standing, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{standing.username}</td>
                            <td>{standing.total_points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}