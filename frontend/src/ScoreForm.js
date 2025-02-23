import React, { useState } from "react";



function ScoreForm() {
    const [datePlayed, setDatePlayed] = useState('');
    const [courseName, setCourseName] = useState('');
    const [grossScore, setGrossScore] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newRound = {
            user_id : 1,
            date_played: datePlayed,
            course_name: courseName,
            gross_score: parseInt(grossScore, 10)
        };

        fetch('/api/rounds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(newRound)
        })
        .then((res) => {
            if (!res.ok) {
              throw new Error('Network response was not ok.');
            }
            return res.json();
          })
          .then((data) => {
            console.log('New round saved:', data);
            // Optionally reset the form or navigate away
            setDatePlayed('');
            setCourseName('');
            setGrossScore('');
          })
          .catch((err) => {
            console.error('Error submitting round:', err);
          });
      };

      return (
        <div>
            <h2>Submit a Round</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="datePlayed">Date Played:</label>
                    <input
                        type="date"
                        id="datePlayed"
                        value={datePlayed}
                        onChange={(e) => setDatePlayed(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="courseName">Course Name</label>
                    <input
                        type="text"
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="grossScore">Gross Score:</label>
                    <input
                        type="number"
                        id="grossScore"
                        value={grossScore}
                        onChange={(e) => setGrossScore(e.target.value)}
                        required
                    />
                </div>

                 <button type="submit">Submit</button>
            </form>
        </div>
      );
}

export default ScoreForm;