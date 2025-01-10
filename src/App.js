import React, { useState } from 'react';
import axios from 'axios';
import Products from './Products'; // Import the Products component
import './App.css';
import './styles.css'; // Import the styles.css file

// Simple Login Component
const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5003/api/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token); // Store token in localStorage
      setIsLoggedIn(true); // Update login state
      alert('Login successful!');
    } catch (error) {
      alert('Login failed!');
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Online Retailer</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#products">Products</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <h1 className="text-center">Welcome to Online Retailer</h1>

      {/* Conditional Rendering */}
      {isLoggedIn ? (
        <Products /> // Show Products if logged in
      ) : (
        <Login setIsLoggedIn={setIsLoggedIn} /> // Show Login form if not logged in
      )}
    </div>
  );
};

export default App; 