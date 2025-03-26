import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScoreForm.css';

function ScoreForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        course: '',
        score: '',
        date: new Date().toISOString().split('T')[0],
        handicap: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateScore = (score) => {
        const numScore = parseInt(score, 10);
        return numScore > 0 && numScore < 200; // Basic validation for realistic golf scores
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Validate score
        if (!validateScore(formData.score)) {
            setError('Please enter a valid score (between 1 and 200)');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Updated endpoint to match backend
            const response = await fetch('/api/rounds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date_played: formData.date,
                    course_name: formData.course,
                    gross_score: parseInt(formData.score, 10),
                    handicap: parseInt(formData.handicap, 10)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit score');
            }

            setSuccess('Score submitted successfully!');
            
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            setError(err.message || 'An error occurred while submitting the score');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <form className="score-form" onSubmit={handleSubmit}>
                <h2>Skrá hring</h2>
                
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="course">Golfvöllur</label>
                    <input
                        type="text"
                        id="course"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        required
                        placeholder="Sláðu inn nafn golfvallarins"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="score">Skor</label>
                    <input
                        type="number"
                        id="score"
                        name="score"
                        value={formData.score}
                        onChange={handleChange}
                        required
                        min="1"
                        max="199"
                        placeholder="Sláðu inn heildarfjölda högga á hringnum"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="handicap">Forgjöf</label>
                    <input
                        type="number"
                        id="handicap"
                        name="handicap"
                        value={formData.handicap}
                        onChange={handleChange}
                        required
                        placeholder="Sláðu inn núverandi forgjöf"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Dagsetning</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().split('T')[0]} // Can't select future dates
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Verið  er að skrá hringinn...' : 'Skrá hring'}
                </button>
            </form>
        </div>
    );
}

export default ScoreForm;