import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, onLogout }) {
    return (
        <header className="main-header">
            <nav className="main-nav">
                <div className="nav-brand">
                    <Link to="/">Golf deildin</Link>
                </div>
                <div className="nav-links">
                    {user ? (
                        <>
                            <span className="user-status">
                                Velkominn, {user.username}
                            </span>
                            <Link to="/">Forsíða</Link>
                            <Link to="/submit">Skrá skor</Link>
                            <button onClick={onLogout} className="btn-link">
                                Útskráning
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/">Forsíða</Link>
                            <Link to="/login">Innskráning</Link>
                            <Link to="/register">Nýskráning</Link>
                        </>
                    )}
                </div>
            </nav>

        </header>
        
    );
}

export default Navbar;