const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const { mysqlConnection } = require('./config/database');
const authController = require('./authController'); // Import authController
const cartController = require('./cartController'); // Import cartController
const multer = require('multer');
const path = require('path');

dotenv.config(); // Load environment variables
const app = express();

// Set up multer storage for images
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  },
});

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json()); // Make sure bodyParser is correctly set

// Routes
app.post('/api/login', authController.authenticateUser); // User login
app.post('/api/signup', authController.signup); // User signup

// Cart routes (ensure the user is logged in and has the appropriate role)
app.use('/api', cartController); // Use cartController for cart-related routes

// Route to get cart items (only for logged-in customers)
app.get('/api/cart', authController.verifyRole('customer'), authController.getCart); // Make sure this route is set correctly

// MySQL connection check
mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Route to get all products (Public route)
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Server Error');
    }
    res.json(results);
  });
});

// Route to create a new product (Owner only)
app.post('/api/products', authController.verifyRole('owner'), upload.single('image'), (req, res) => {
  const { name, price, description, category } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = 'INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)';
  mysqlConnection.query(query, [name, price, description, category, image], (err, results) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).send('Server Error');
    }
    const newProduct = {
      id: results.insertId,
      name,
      price,
      description,
      category,
      image: image ? `/uploads/${image}` : null,
    };
    res.status(201).json(newProduct);
  });
});

// Route to update a product (Owner only)
app.put('/api/products/:id', authController.verifyRole('owner'), upload.single('image'), (req, res) => {
  const { name, price, description, category } = req.body;
  const image = req.file ? req.file.filename : null;

  let query;
  let params;

  if (image) {
    query = 'UPDATE products SET name = ?, price = ?, description = ?, category = ?, image = ? WHERE id = ?';
    params = [name, price, description, category, image, req.params.id];
  } else {
    query = 'UPDATE products SET name = ?, price = ?, description = ?, category = ? WHERE id = ?';
    params = [name, price, description, category, req.params.id];
  }

  mysqlConnection.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).send('Server Error');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Product not found');
    }
    res.status(200).send('Product updated successfully');
  });
});

// Route to delete a product (Owner only)
app.delete('/api/products/:id', authController.verifyRole('owner'), (req, res) => {
  const query = 'DELETE FROM products WHERE id = ?';
  mysqlConnection.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Server Error');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Product not found');
    }
    res.send('Product deleted');
  });
});

// Serve images from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple health check route
app.get('/', (req, res) => {
  res.send('Backend server is working!');
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
