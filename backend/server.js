const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { mysqlConnection } = require('./config/database'); // Import MySQL connection
const { verifyRole, signup, authenticateUser } = require('./authController');

require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5003;

// Set up multer storage to store images in 'uploads/' folder with unique names
const storage = multer.diskStorage({
  destination: './uploads/', // Folder where images will be stored
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Unique filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Allowed file types
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true); // Accept the file
    } else {
      cb('Error: Images only!'); // Reject invalid file type
    }
  },
});

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

// Serve images from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to login and generate JWT token
app.post('/api/login', authenticateUser);

// Route to handle user signup
app.post('/api/signup', signup); // Use the signup method from authController

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

// Route to create a new product - Protected route (Owner only)
app.post('/api/products', verifyRole('owner'), upload.single('image'), (req, res) => {
  const { name, price, description, category } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = 'INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)';
  mysqlConnection.query(query, [name, price, description, category, image], (err, results) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).send('Server Error');
    } else {
      // Return the newly created product data
      const newProduct = {
        id: results.insertId, // Get the newly created product ID
        name,
        price,
        description,
        category,
        image: image ? `/uploads/${image}` : null, // Send back image path
      };
      res.status(201).json(newProduct); // Send the new product details in response
    }
  });
});

// Route to update a product - Protected route (Owner only)
app.put('/api/products/:id', verifyRole('owner'), upload.single('image'), (req, res) => {
  const { name, price, description, category } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = image
    ? 'UPDATE products SET name = ?, price = ?, description = ?, category = ?, image = ? WHERE id = ?'
    : 'UPDATE products SET name = ?, price = ?, description = ?, category = ? WHERE id = ?';

  const params = image 
    ? [name, price, description, category, image, req.params.id]
    : [name, price, description, category, req.params.id];

  mysqlConnection.query(query, params, (err) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Server Error');
    } else {
      res.status(200).send('Product updated successfully');
    }
  });
});

// Route to delete a product - Protected route (Owner only)
app.delete('/api/products/:id', verifyRole('owner'), (req, res) => {
  const query = 'DELETE FROM products WHERE id = ?';
  mysqlConnection.query(query, [req.params.id], (err) => {
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
