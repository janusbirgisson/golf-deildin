import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterForm.css';

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        handicap: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    handicap: parseInt(formData.handicap, 10)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Clear form and redirect to login
            setFormData({
                username: '',
                email: '',
                password: '',
                handicap: ''
            });
            navigate('/login');

        } catch (err) {
            setError(err.message || 'An error occurred during registration');
        }
    };

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Nýskráning</h2>
                
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="username">Notendanafn</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Netfang</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Lykilorð</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <small>Lykilorð verður að vera að minnsta kosti 8 stafir</small>
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
                    />
                </div>

                <button type="submit" className="btn-primary">
                    Nýskrá
                </button>

                <div className="form-help">
                    Ertu nú þegar skráður? <Link to="/login">Innskráning hér</Link>
                </div>
            </form>
        </div>
    );
}

export default RegisterForm;