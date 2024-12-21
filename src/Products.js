import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    // Fetch products from the backend API
    axios.get('http://localhost:5003/api/products')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the products:', error);
      });
  }, []); // Empty array ensures this runs only once, after the component mounts

  // Handle form submission to add a new product
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5003/api/products', newProduct)
      .then(() => {
        alert('Product added successfully!');
        // Refresh the product list
        axios.get('http://localhost:5003/api/products').then((response) => setProducts(response.data));
      })
      .catch((error) => {
        console.error('There was an error adding the product:', error);
      });
  };

  // Handle deleting a product
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5003/api/products/${id}`)
      .then(() => {
        alert('Product deleted!');
        // Remove the product from the state without re-fetching all products
        setProducts(products.filter((product) => product.id !== id));
      })
      .catch((error) => {
        console.error('There was an error deleting the product:', error);
      });
  };

   const [editingProduct, setEditingProduct] = useState(null); // Store the product being edited

   const handleEditClick = (product) => {
      setEditingProduct(product); // Set the product to be edited
  };
    
  const handleUpdate = (e, id) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    // Send the updated product to the backend via a PUT request
    axios.put(`http://localhost:5003/api/products/${id}`, editingProduct)
      .then(() => {
        alert('Product updated!');
        setEditingProduct(null); // Close the edit form
        // Refresh the product list
        axios.get('http://localhost:5003/api/products').then((response) => setProducts(response.data));
      })
      .catch((error) => {
        console.error('There was an error updating the product:', error);
      });
  };
  
  

  

  return (
    <div>
      <h2>Product List</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category}</p>
            <button onClick={() => handleDelete(product.id)}>Delete</button>
            <button onClick={() => handleEditClick(product)}>Edit</button>
          </li>
        ))}
      </ul>
      {/* Conditionally render the Edit form */}
      {editingProduct && (
        <div>
          <h2>Edit Product</h2>
          <form onSubmit={(e) => handleUpdate(e, editingProduct.id)}>
            <input
              className="form-input"
              type="text"
              placeholder="Name"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            />
            <input
              className="form-input"
              type="number"
              placeholder="Price"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
            />
            <textarea
              className="form-input"
              placeholder="Description"
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
            <input
              className="form-input"
              type="text"
              placeholder="Category"
              value={editingProduct.category}
              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
            />
            <button type="submit">Update Product</button>
            <button onClick={() => setEditingProduct(null)}>Cancel</button>
          </form>
        </div>
      )}

      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <input
           className="form-input"
           type="text"
           placeholder="Name"
           value={newProduct.name}
           onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
        <input
            className="form-input"
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
        <textarea
            className="form-input"
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <input
            className="form-input"
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
        />
        <button type="submit">Add Product</button>
        </form>
    </div>
  );
};

export default Products;
