const express = require('express');
const { mysqlConnection } = require('./config/database');
const { verifyRole } = require('./authController'); // Import the verifyRole function

const router = express.Router();

// Add item to cart (only for logged-in users)
router.post('/cart', verifyRole('customer'), (req, res) => {
    const { productId, quantity } = req.body;
    const userEmail = req.user.email; // The email comes from the decoded JWT

    console.log('Received product ID:', productId);
    console.log('Received quantity:', quantity);
    console.log('Decoded User Email:', userEmail);

    if (!productId || quantity < 1) {
        return res.status(400).json({ message: 'Valid product ID and quantity are required' });
    }

    // Check if the product is already in the cart
    const checkQuery = 'SELECT * FROM cart WHERE email = ? AND productId = ?';
    mysqlConnection.query(checkQuery, [userEmail, productId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            // If product exists, update quantity
            const updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE email = ? AND productId = ?';
            mysqlConnection.query(updateQuery, [quantity, userEmail, productId], (err, updateResults) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }
                return res.status(200).json({ message: 'Cart updated successfully' });
            });
        } else {
            // If product does not exist, insert a new row
            const insertQuery = 'INSERT INTO cart (email, productId, quantity) VALUES (?, ?, ?)';
            mysqlConnection.query(insertQuery, [userEmail, productId, quantity], (err, insertResults) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }
                return res.status(201).json({ message: 'Item added to cart' });
            });
        }
    });
});

// Get cart items (only for logged-in users)
router.get('/cart', verifyRole('customer'), (req, res) => {
    const userEmail = req.user.email; // The email comes from the decoded JWT

    const query = `
        SELECT cart.id AS cart_id, products.name, products.price, products.image, cart.quantity 
        FROM cart
        JOIN products ON cart.productId = products.id
        WHERE cart.email = ?
    `;

    mysqlConnection.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json(results); // Send the cart items back as JSON
    });
});

// Remove item from cart (only for logged-in users)
router.delete('/cart/:id', verifyRole('customer'), (req, res) => {
    const cartItemId = req.params.id;
    const userEmail = req.user.email; // The email comes from the decoded JWT

    const query = 'DELETE FROM cart WHERE id = ? AND email = ?';
    mysqlConnection.query(query, [cartItemId, userEmail], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Item removed from cart' });
    });
});

module.exports = router;
