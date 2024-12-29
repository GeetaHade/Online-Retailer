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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Fetching products...');
    setLoading(true);
    axios.get('http://localhost:5003/api/products')
      .then((response) => {
        console.log('Fetch successful!');
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('There was an error fetching the products:', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category) {
      alert('Please fill in all fields.');
      return;
    }

    axios.post('http://localhost:5003/api/products', newProduct)
      .then((response) => {
        alert('Product added successfully!');
        setProducts((prevProducts) => [...prevProducts, response.data]);
        setNewProduct({ name: '', price: '', description: '', category: '' });
      })
      .catch((error) => console.error('Error adding product:', error));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5003/api/products/${id}`)
      .then(() => {
        alert('Product deleted!');
        setProducts(products.filter((product) => product.id !== id));
      })
      .catch((error) => console.error('There was an error deleting the product:', error));
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = (e, id) => {
    e.preventDefault();
    axios.put(`http://localhost:5003/api/products/${id}`, editingProduct)
      .then(() => {
        alert('Product updated!');
        setEditingProduct(null);
        setProducts((prevProducts) => prevProducts.map((product) =>
          product.id === id ? editingProduct : product
        ));
      })
      .catch((error) => {
        console.error('There was an error updating the product:', error);
      });
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  
  const currentProducts = products
  .filter((product) => {
    // Check if product.name exists before calling toLowerCase()
    const matchesSearch = product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  })
  .sort((a, b) => {
    if (sortOption === 'nameAsc') {
      return a.name ? a.name.localeCompare(b.name) : -1; // Ensure a.name exists
    } else if (sortOption === 'nameDesc') {
      return b.name ? b.name.localeCompare(a.name) : -1; // Ensure b.name exists
    } else if (sortOption === 'priceLowHigh') {
      return a.price - b.price;
    } else if (sortOption === 'priceHighLow') {
      return b.price - a.price;
    } else {
      return 0;
    }
  })
  .slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className='search-filter-container'>
      <h2>Search and Filter Products</h2>
      <div>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <h2>Sort Products</h2>
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="">Default</option>
        <option value="nameAsc">Name (A-Z)</option>
        <option value="nameDesc">Name (Z-A)</option>
        <option value="priceLowHigh">Price (Low to High)</option>
        <option value="priceHighLow">Price (High to Low)</option>
      </select>

      <ul className='product-list'>
        {currentProducts.map((product) => (
          <li key={product.id} className='product-card'>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <div className='button-container'>
              <button onClick={() => handleDelete(product.id)}>Delete</button>
              <button onClick={() => handleEditClick(product)}>Edit</button>
            </div>
          </li>
        ))}
      </ul>

      {loading && <p>Loading products...</p>}

      {/* New Product Form */}
      {!editingProduct && (
        <div className = "form-container"> 
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>
            <button type="submit">Add Product</button>
          </form>
        </div>
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <div className="form-container">
          <h2>Edit Product</h2>
          <form onSubmit={(e) => handleUpdate(e, editingProduct.id)}>
            <div className="form-group">
              <label htmlFor="edit-name">Name</label>
              <input
                type="text"
                id="edit-name"
                placeholder="Name"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-price">Price</label>
              <input
                type="number"
                id="edit-price"
                placeholder="Price"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                placeholder="Description"
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <input
                type="text"
                id="edit-category"
                placeholder="Category"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              />
            </div>
            <button type="submit">Update Product</button>
            <button type="button" onClick={() => setEditingProduct(null)}>
              Cancel
            </button>
          </form>
        </div>
)}


      <div className="pagination">
        {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map((number) => (
          <button key={number} onClick={() => setCurrentPage(number + 1)} className={currentPage === number + 1 ? 'active' : ''}>
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Products;
