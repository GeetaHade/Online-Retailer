import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Import Router and Routes
import axios from 'axios';
import Products from './Products'; // Import the Products component
import Signup from './components/Signup';
import Login from './components/login';

import './App.css';
import './styles.css'; // Import the styles.css file

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if there's a token in localStorage and set login state accordingly
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // If token exists, user is logged in
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setIsLoggedIn(false); // Update login state on logout
  };

  return (
    <Router>
      <div>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <h1 className="navbar-brand">Online Retailer</h1>
            <div className="navbar-nav">
              {!isLoggedIn && (
                <>
                  <div className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </div>
                  <div className="nav-item">
                    <Link className="nav-link" to="/signup">Signup</Link>
                  </div>
                </>
              )}
              {isLoggedIn && (
                <div className="nav-item">
                  <button onClick={handleLogout} className="nav-link">Logout</button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <h1 className="text-center">Welcome to Online Retailer</h1>

        {/* Routes Setup */}
        <Routes>
          <Route path="/signup" element={<Signup />} /> {/* Signup Route */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> {/* Login Route */}
          <Route path="/products" element={isLoggedIn ? <Products /> : <Login setIsLoggedIn={setIsLoggedIn} />} /> {/* Protected Products Route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
