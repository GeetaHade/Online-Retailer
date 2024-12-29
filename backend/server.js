const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',  // Change from 'localhost' to '127.0.0.1'
    user: 'root',
    password: '',
    database: 'online_retailer'
});
  

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Route to get all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products'; // SQL query to get all products
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Server Error');
    } else {
      res.json(results);
    }
  });
});

//test
// app.get('/api/products', (req, res) => {
//   setTimeout(() => {
//     const query = 'SELECT * FROM products';
//     db.query(query, (err, results) => {
//       if (err) {
//         console.error('Error fetching products:', err);
//         res.status(500).send('Server Error');
//       } else {
//         res.json(results);
//       }
//     });
//   }, 2000); // Simulate a 2-second delay
// });


// Route to create a new product
app.post('/api/products', (req, res) => {
  const { name, price, description, category } = req.body;
  const query = 'INSERT INTO products (name, price, description, category) VALUES (?, ?, ?, ?)';
  db.query(query, [name, price, description, category], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).send('Server Error');
    } else {
      res.status(201).send('Product created');
    }
  });
});

// Route to update an existing product
app.put('/api/products/:id', (req, res) => {
  const { name, price, description, category } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, description = ?, category = ? WHERE id = ?';
  db.query(query, [name, price, description, category, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Server Error');
    } else {
      res.send('Product updated');
    }
  });
});

// Route to delete a product
app.delete('/api/products/:id', (req, res) => {
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      res.status(500).send('Server Error');
    } else {
      res.send('Product deleted');
    }
  });
});


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/online_retailer')
  .then(() => console.log('Connected to MongoDB database'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Simple route
app.get('/', (req, res) => {
  res.send('Backend server is working!');
});

// Start the server
app.listen(5003, () => {
  console.log('Backend server is running on http://localhost:5003');
});
