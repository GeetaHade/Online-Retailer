import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected named import
import Products from './Products';
import Signup from './components/Signup';
import Login from './components/Login';
import './App.css';
import './styles.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state to handle immediate re-render

  // Check if user is logged in and retrieve their role on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode JWT token to extract role
        setIsLoggedIn(true);
        setRole(decodedToken.role); // Set role based on decoded token
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token'); // Clear invalid token
        setIsLoggedIn(false);
        setRole(null);
      }
    }
    setLoading(false); // Set loading to false after checking
  }, []);

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setRole(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while the role is being checked
  }

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
                <>
                  {role === 'owner' && (
                    <div className="nav-item">
                      <Link className="nav-link" to="/products">Manage Products</Link>
                    </div>
                  )}
                  {role === 'customer' && (
                    <div className="nav-item">
                      <Link className="nav-link" to="/products">View Products</Link>
                    </div>
                  )}
                  <div className="nav-item">
                    <button onClick={handleLogout} className="nav-link btn btn-link text-white">Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        <h1 className="text-center">Welcome to Online Retailer</h1>

        {/* Routes Setup */}
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />} />
          <Route
            path="/products"
            element={
              isLoggedIn ? (
                role === 'owner' || role === 'customer' ? (
                  <Products role={role} />
                ) : (
                  <Navigate to="/login" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to={isLoggedIn ? "/products" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
