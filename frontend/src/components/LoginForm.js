import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';

function LoginForm({ onLoginSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            console.log('Attempting login with:', { email: formData.email });
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update parent component with user data
            onLoginSuccess(data.user);

            // Clear form and redirect to home
            setFormData({
                email: '',
                password: ''
            });
            navigate('/');

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login');
        }
    };

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Innskráning</h2>
                
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

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
                </div>

                <button type="submit" className="btn-primary">
                    Innskrá
                </button>

                <div className="form-help">
                    Ertu nú þegar skráður? <Link to="/register">Nýskráning hér</Link>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;