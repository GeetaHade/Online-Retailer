const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { mysqlConnection } = require('./config/database'); // Import MySQL connection
const multer = require('multer');
const path = require('path');


const app = express();
const port = process.env.PORT || 5003;

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Ensure unique file names
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Allowed extensions
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  },
});


// Middleware
app.use(cors());
app.use(bodyParser.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sample in-memory users database (replace with a real database in the future)
const users = [
  { id: 1, username: 'storeOwner', password: 'password123', role: 'storeOwner' },
  { id: 2, username: 'customer', password: 'password123', role: 'customer' }
];

// Middleware function to verify the JWT token
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract the token from the "Authorization" header
  console.log('Token received:', token); // Log the token for debugging
  console.log('Secret Key in authenticateJWT:', 'your-secret-key');

  if (!token) return res.status(401).send('Access Denied: No token provided');
  
  const SECRET_KEY = 'your-secure-secret-key'; // Ensure consistency in the secret key

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Token verification error:', err); // Log the error for debugging
      return res.status(403).send('Access Denied: Invalid token');
    }
    req.user = user; // Store the user data in the request object
    next(); // Continue to the next middleware or route handler

  });
}

// Login route to authenticate users and generate a JWT token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Secret Key in /api/login:', 'your-secret-key');


  // Find user by username and password
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Generate a JWT token with the user's ID and role, and set an expiration time
    const SECRET_KEY = 'your-secure-secret-key'; // Ensure consistency in the secret key
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    // Send the token as the response
    res.json({ token });
  } else {
    // If authentication fails, return an error
    res.status(401).send('Invalid credentials');
  }
});

// Test the MySQL connection
mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Route to get all products - Public route (no authentication needed)
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Server Error');
    } else {
      res.json(results);
    }
  });
});


// Route to create a new product - Protected route (authentication needed)
app.post('/api/products', authenticateJWT, upload.single('image'), (req, res) => {
  const { name, price, description, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const query = 'INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)';
  mysqlConnection.query(query, [name, price, description, category, image], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).send('Server Error');
    } else {
      res.status(201).send('Product created with image');
    }
  });
});

// Route to update an existing product - Protected route (authentication needed)
app.put('/api/products/:id', authenticateJWT, (req, res) => {
  const { name, price, description, category } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, description = ?, category = ? WHERE id = ?';
  mysqlConnection.query(query, [name, price, description, category, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Server Error');
    } else {
      res.send('Product updated');
    }
  });
});

// Route to delete a product - Protected route (authentication needed)
app.delete('/api/products/:id', authenticateJWT, (req, res) => {
  const query = 'DELETE FROM products WHERE id = ?';
  mysqlConnection.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      res.status(500).send('Server Error');
    } else {
      res.send('Product deleted');
    }
  });
});

// Simple route for health check
app.get('/', (req, res) => {
  res.send('Backend server is working!');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
