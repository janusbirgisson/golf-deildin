import React, { useState } from "react";


function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password})
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error('Login failed');
            }
            return res.json();
        })
        .then((data) => {
            console.log('Login success', data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            onLoginSuccess(data.user);
        })
        .catch((err) => {
            console.error('Error logging in', err);

        });
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginForm;