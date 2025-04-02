import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ user, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-primary shadow-md">
            <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-white">
                            Golfdeildin
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {user ? (
                            <>
                                <span className="text-gray-300">
                                    Velkomin/n, {user.username}
                                </span>
                                <Link to="/" className="text-white hover:text-neutral px-3 py-2 rounded-md">
                                    Forsíða
                                </Link>
                                <Link to="/submit" className="text-white hover:text-neutral px-3 py-2 rounded-md">
                                    Skrá skor
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="text-white hover:text-neutral px-3 py-2 rounded-md"
                                >
                                    Útskráning
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/" className="text-white hover:text-neutral px-3 py-2 rounded-md">
                                    Forsíða
                                </Link>
                                <Link to="/login" className="text-white hover:text-neutral px-3 py-2 rounded-md">
                                    Innskráning
                                </Link>
                                <Link to="/register" className="text-white hover:text-neutral px-3 py-2 rounded-md">
                                    Nýskráning
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {user ? (
                            <>
                                <span className="block text-gray-300 px-3 py-2">
                                    Velkomin/n, {user.username}
                                </span>
                                <Link
                                    to="/"
                                    className="block text-white hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Forsíða
                                </Link>
                                <Link
                                    to="/submit"
                                    className="block text-white hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Skrá skor
                                </Link>
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="block w-full text-left text-white hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                                >
                                    Útskráning
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/"
                                    className="block text-white hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Forsíða
                                </Link>
                                <Link
                                    to="/login"
                                    className="block text-white hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Innskráning
                                </Link>
                                <Link
                                    to="/register"
                                    className="block text-white hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Nýskráning
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;