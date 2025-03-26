import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Leaderboard from './components/Leaderboard';
import ScoreForm from './components/ScoreForm';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UserScores from './components/UserScores';
import WeeklyUserScores from './components/WeeklyUserScores';

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
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm onLoginSuccess={setUser} />} />
        <Route path="/submit" element={user ? <ScoreForm /> : <Navigate to="/login" />} />
        <Route path="/user/:username" element={<UserScores />} />
        <Route path="/weekly-user/:username/:week/:year" element={<WeeklyUserScores />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
