const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mysqlConnection } = require('./config/database');

// JWT secret key
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key_here'; // Replace with a secure key

// Middleware to verify JWT and check user role
const verifyRole = (role) => {
    return (req, res, next) => {
        const authHeader = req.header('Authorization'); // Get token from headers

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("Missing or invalid Authorization header:", authHeader);
            return res.status(401).json({ message: 'Authentication token missing or invalid' });
        }

        const token = authHeader.split(' ')[1]; // Extract token after "Bearer"

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded; // Store decoded user in request

            console.log('Decoded user:', decoded); // Debugging: Check if token is decoded correctly

            if (decoded.role !== role) {
                return res.status(403).json({ message: 'Access forbidden: Insufficient role' });
            }

            next(); // Proceed to the next middleware
        } catch (error) {
            console.error("JWT verification error:", error);
            return res.status(401).json({ message: 'Unauthorized - Invalid or expired token' });
        }
    };
};

// Login function
const authenticateUser = (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email); // Debugging log

    const query = 'SELECT * FROM users WHERE email = ?';
    mysqlConnection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (compareErr, isMatch) => {
            if (compareErr || !isMatch) {
                console.log('Password mismatch for user:', email);
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            console.log('Login successful, token generated for user:', email);
            res.json({ token, role: user.role });
        });
    });
};

// Signup function
const signup = (req, res) => {
    const { email, password, role } = req.body;

    console.log('Signup attempt for email:', email);

    const allowedRoles = ['owner', 'customer'];
    if (!allowedRoles.includes(role)) {
        console.log('Invalid role specified:', role);
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        mysqlConnection.query(query, [email, hashedPassword, role], (err) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            console.log('User created successfully with email:', email);
            res.status(201).json({ message: 'User created successfully' });
        });
    });
};

// Get cart items for a user based on email
const getCart = (req, res) => {
    const email = req.user.email; // Get the user's email from the decoded token

    const query = 'SELECT * FROM cart WHERE email = ?';
    mysqlConnection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No items found in the cart' });
        }

        console.log('Cart items for user:', email);
        res.json({ cartItems: results });
    });
};

module.exports = { verifyRole, signup, authenticateUser, getCart };
