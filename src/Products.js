import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ product, setProduct, handleSubmit, isEditing, handleCancel }) => {
  return (
    <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
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
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProduct({ ...product, image: e.target.files[0] })}
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
    image: null,
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
      .get('http://localhost:5003/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Corrected template literal
        },
      })
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

    // Debugging: Log the new product data
    console.log('Adding new product:', newProduct);

    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category || !newProduct.image) {
      alert('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('image', newProduct.image);  // Ensure image is added properly

    axios
      .post('http://localhost:5003/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Corrected template literal
        },
      })
      .then((response) => {
        alert('Product added successfully!');
        setProducts((prevProducts) => [...prevProducts, response.data]);
        setNewProduct({ name: '', price: '', description: '', category: '', image: null });
      })
      .catch((error) => console.error('Error adding product:', error));
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5003/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Corrected template literal
        },
      })
      .then(() => {
        alert('Product deleted!');
        setProducts(products.filter((product) => product.id !== id));
      })
      .catch((error) => console.error('Error deleting the product:', error));
  };

  const handleEditClick = (product) => {
    console.log('Editing product:', product); // Check the product data
    setEditingProduct({ ...product });  // Ensure you're making a copy of the product to edit
  };

  const handleUpdate = (e, id) => {
    e.preventDefault();
  
    // Debugging: log the updated product
    console.log('Updated product:', editingProduct);
  
    // Debugging: log the ID of the product being updated
    console.log('Updating product with ID:', id);
  
    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('price', editingProduct.price);
    formData.append('description', editingProduct.description);
    formData.append('category', editingProduct.category);
  
    // Handle the image upload (only if a new image is provided)
    if (editingProduct.image && editingProduct.image !== 'existing-image') {
      formData.append('image', editingProduct.image);  // Attach new image if available
    }
  
    // Make the PUT request to update the product
    axios
      .put(`http://localhost:5003/api/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Corrected template literal
        },
      })
      .then(() => {
        alert('Product updated!');
        setEditingProduct(null); // Clear the form
  
        // Optionally fetch updated product from the backend
        axios.get(`http://localhost:5003/api/products/${id}`).then((response) => {
          const updatedProduct = response.data;
  
          // Update the product in the UI immediately
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.id === id ? updatedProduct : product
            )
          );
        }).catch((error) => {
          console.error('Error fetching updated product:', error.response?.data || error.message);
        });
      })
      .catch((error) => {
        console.error('Error updating the product:', error.response?.data || error.message);
      });
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
                  <img
                    src={`http://localhost:5003/uploads/${product.image}`}  // Fixed image URL
                    alt={product.name}
                    className="card-img-top"
                  />

                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <p className="card-text">${product.price}</p>
                    <p className="card-text">{product.category}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-secondary me-2"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastProduct >= products.length}
            >
              Next
            </button>
          </div>

          {/* Product Form */}
          {editingProduct ? (
            <ProductForm
              product={editingProduct}
              setProduct={setEditingProduct}
              handleSubmit={(e) => handleUpdate(e, editingProduct.id)}
              isEditing={true}
              handleCancel={() => setEditingProduct(null)}
            />
          ) : (
            <ProductForm
              product={newProduct}
              setProduct={setNewProduct}
              handleSubmit={handleSubmit}
              isEditing={false}
              handleCancel={() => setNewProduct({ name: '', price: '', description: '', category: '', image: null })}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Products;
