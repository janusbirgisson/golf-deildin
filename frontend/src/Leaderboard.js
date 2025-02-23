import React from "react";
import { useEffect, useState } from "react";


function Leaderboard() { 
  /** @type {[Array<{id: number, username: string, date_played: string, course_name: string, gross_score: number, handicap: number, net_score: number, created_at: string}>, Function]} */
const [rounds, setRounds] = useState([]);

    useEffect(() => {
      fetch('/api/rounds')
          .then(res => {
              if (!res.ok) {
                  throw new Error('Network response was not ok');
              }
              return res.json();
          })
          .then(data => {
              if (!Array.isArray(data)) {
                  console.error('Expected array but got:', data);
                  setRounds([]);
                  return;
              }
              setRounds(data);
          })
          .catch((error) => {
              console.error('Error fetching rounds:', error);
              setRounds([]);
          });
  }, []);

    return (
        <div>
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Date</th>
              <th>Course</th>
              <th>Gross Score</th>
              <th>Handicap</th>
              <th>Net Score</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round.id}>
                <td>{round.id}</td>
                <td>{round.username}</td>
                <td>{round.date_played}</td>
                <td>{round.course_name}</td>
                <td>{round.gross_score}</td>
                <td>{round.handicap}</td>
                <td>{round.net_score}</td>
                <td>{round.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default Leaderboard;