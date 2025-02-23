import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [handicap, setHandicap] = useState('');
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();

        const newUser = {
            username,
            email,
            password,
            handicap: parseInt(handicap, 10)
        };

        console.log('Sending registration request:', {
            username: newUser.username,
            email: newUser.email,
            handicap: newUser.handicap
        });

        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        })
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('Registration failed');
        })
        .then((data) => {
            console.log('User registered:', data);
            setUsername('');
            setEmail('');
            setPassword('');
            setHandicap('');
            navigate('/login');
        })
        .catch((error) => {
            console.error('Error registering user', error);
        });
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="handicap">Handicap:</label>
                <input
                    type="number"
                    id="handicap"
                    value={handicap}
                    onChange={(e) => setHandicap(e.target.value)}
                    required
                />
            </div>

            <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterForm;