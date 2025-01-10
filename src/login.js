import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Correct import for React Router v6

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Correct hook for navigation in React Router v6

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send POST request to login endpoint with email and password
    axios
      .post('http://localhost:5003/api/login', { email, password })
      .then((response) => {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('token', token);  // Store token in localStorage
          navigate('/products');  // Use navigate() to redirect to products page
        }
      })
      .catch((error) => {
        setError('Invalid credentials or server error');
        console.error(error);
      });
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
