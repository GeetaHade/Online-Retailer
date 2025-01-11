import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; 
const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://localhost:5003/api/login', { email, password })
      .then((response) => {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('token', token);  // Store token in localStorage
          setIsLoggedIn(true);  // Update the logged-in state
          navigate('/products');  // Redirect to products after successful login
        }
      })
      .catch((error) => {
        setError('Invalid credentials or server error');
        console.error('Login error:', error);
      });
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
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
        <button onClick={() => navigate('/signup')}>Create New Account</button> {/* Navigate to Signup page */}
      </div>
    </div>
  );
};

export default Login;
