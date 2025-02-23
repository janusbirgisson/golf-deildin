import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import React from 'react';

import Leaderboard from './components/Leaderboard';
import ScoreForm from './components/ScoreForm';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> |{' '}
        {!user ? (
          <>
            <Link to="/login">Login</Link> |{' '}
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/submit">Submit a Round</Link> |{' '}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/register" element={<RegisterForm /> } />
        <Route path="/login" element={<LoginForm onLoginSuccess={setUser} />} />
        <Route path="/submit" element={user ? <ScoreForm /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
