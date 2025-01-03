import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ product, setProduct, handleSubmit, isEditing, handleCancel }) => {
  return (
    <form onSubmit={handleSubmit} className="product-form">
      <input
        type="text"
        placeholder="Name"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={product.description}
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Category"
        value={product.category}
        onChange={(e) => setProduct({ ...product, category: e.target.value })}
      />
      <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
      {isEditing && <button type="button" onClick={handleCancel}>Cancel</button>}
    </form>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',  // Add image field to new product
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const productsPerPage = 6;

  useEffect(() => {
    console.log('Fetching products...');
    setLoading(true);
    axios
      .get('http://localhost:5003/api/products')
      .then((response) => {
        console.log('Fetch successful!');
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching the products:', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category) {
      alert('Please fill in all fields.');
      return;
    }
    axios
      .post('http://localhost:5003/api/products', newProduct)
      .then((response) => {
        alert('Product added successfully!');
        setProducts((prevProducts) => [...prevProducts, response.data]);
        setNewProduct({ name: '', price: '', description: '', category: '' });
      })
      .catch((error) => console.error('Error adding product:', error));
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5003/api/products/${id}`)
      .then(() => {
        alert('Product deleted!');
        setProducts(products.filter((product) => product.id !== id));
      })
      .catch((error) => console.error('Error deleting the product:', error));
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = (e, id) => {
    e.preventDefault();
    axios
      .put(`http://localhost:5003/api/products/${id}`, editingProduct)
      .then(() => {
        alert('Product updated!');
        setEditingProduct(null);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === id ? editingProduct : product
          )
        );
      })
      .catch((error) => console.error('Error updating the product:', error));
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter
        ? product.category === categoryFilter
        : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === 'nameAsc') return a.name?.localeCompare(b.name) || 0;
      if (sortOption === 'nameDesc') return b.name?.localeCompare(a.name) || 0;
      if (sortOption === 'priceLowHigh') return a.price - b.price;
      if (sortOption === 'priceHighLow') return b.price - a.price;
      return 0;
    })
    .slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="container my-4">
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          {/* Search, Filter, and Sort */}
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="nameAsc">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
                <option value="priceLowHigh">Price (Low to High)</option>
                <option value="priceHighLow">Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Products */}
          <div className="row">
            {currentProducts.map((product) => (
              <div key={product.id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    <button
                      className="btn btn-danger me-2"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination justify-content-center">
            {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map(
              (number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number + 1)}
                  className={
                    currentPage === number + 1 ? 'btn btn-primary me-2' : 'btn btn-outline-secondary me-2'
                  }
                >
                  {number + 1}
                </button>
              )
            )}
          </div>

          {/* Forms */}
          {editingProduct ? (
            <ProductForm
              product={editingProduct}
              setProduct={setEditingProduct}
              handleSubmit={(e) => handleUpdate(e, editingProduct.id)}
              isEditing
              handleCancel={() => setEditingProduct(null)}
            />
          ) : (
            <ProductForm
              product={newProduct}
              setProduct={setNewProduct}
              handleSubmit={handleSubmit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Products;
