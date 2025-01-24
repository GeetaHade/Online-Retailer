const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('./authController'); // Corrected import
const { mysqlConnection } = require('./config/database');

// Add to Cart
router.post('/api/cart', authenticateJWT, (req, res) => {
    const { product_id, quantity } = req.body;
    const email = req.user.email; // Use email instead of user_id

    const query = `
        INSERT INTO cart (email, productId, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + ?;
    `;
    mysqlConnection.query(query, [email, product_id, quantity, quantity], (err) => {
        if (err) {
            console.error('Error adding to cart:', err);
            res.status(500).send('Server Error');
        } else {
            res.status(201).send('Product added to cart');
        }
    });
});

// View Cart
router.get('/api/cart', authenticateJWT, (req, res) => {
    const email = req.user.email; // Use email instead of user_id

    const query = `
        SELECT cart.id AS cart_id, products.id AS product_id, products.name, products.price, 
               products.image, cart.quantity
        FROM cart
        JOIN products ON cart.productId = products.id
        WHERE cart.email = ?;
    `;
    mysqlConnection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            res.status(500).send('Server Error');
        } else {
            res.json(results);
        }
    });
});

// Remove from Cart
router.delete('/api/cart/:id', authenticateJWT, (req, res) => {
    const cart_id = req.params.id;

    const query = `DELETE FROM cart WHERE id = ?`;
    mysqlConnection.query(query, [cart_id], (err) => {
        if (err) {
            console.error('Error removing item from cart:', err);
            res.status(500).send('Server Error');
        } else {
            res.send('Item removed from cart');
        }
    });
});

module.exports = router;
