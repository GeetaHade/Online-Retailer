import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for decoding the JWT token
import '../styles.css';

const Login = ({ setIsLoggedIn, setRole }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5003/api/login', credentials);
  
      const { token } = response.data;
      if (token) {
        // Store token in localStorage
        localStorage.setItem('token', token);
  
        // Decode the token to check the user role
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
  
        // Update the logged-in state and role
        setIsLoggedIn(true);
        setRole(userRole); // Pass the role to the parent component
  
        // Navigate based on user role
        if (userRole === 'owner') {  // Make sure to check for 'owner'
          navigate('/products'); // Redirect to products page for store owners
        } else if (userRole === 'customer') {
          navigate('/products'); // Redirect to products page for customers
        }
      }
    } catch (error) {
      setError('Invalid credentials or server error');
      console.error('Login error:', error);
    }
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
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
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
