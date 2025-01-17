const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mysqlConnection } = require('./config/database');

// JWT secret key
const SECRET_KEY = 'your_secret_key_here'; // Replace with a secure key

// Middleware to verify JWT and check user role
const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      req.user = user;

      // Check if the user has the required role
      if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access forbidden: Insufficient role' });
      }

      next();
    });
  };
};

// Login function
const authenticateUser = (req, res) => {
  const { email, password } = req.body;

  // Query user by email
  const query = 'SELECT * FROM users WHERE email = ?';
  mysqlConnection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    // Compare passwords
    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT with user role included
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '1h' } // Token expiration
      );

      res.json({ token, role: user.role });  // Send back the token and role
    });
  });
};

// Signup function
const signup = (req, res) => {
  const { email, password, role } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    mysqlConnection.query(query, [email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.status(201).json({ message: 'User created successfully' });
    });
  });
};

module.exports = { verifyRole, signup, authenticateUser };
