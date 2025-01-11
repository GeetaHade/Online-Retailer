import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Pagination from './components/Pagination';
import SearchFilterSort from './components/SearchFilterSort';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5003/api/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error fetching the products:', error);
      });
  }, []);

  // Handle adding a new product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category || !newProduct.image) {
      alert('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('image', newProduct.image);

    axios
      .post('http://localhost:5003/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        alert('Product added successfully!');
        setProducts((prevProducts) => [...prevProducts, response.data]);
        setNewProduct({ name: '', price: '', description: '', category: '', image: null });
        document.getElementById('image-input').value = ''; // Reset image input field
      })
      .catch((error) => console.error('Error adding product:', error));
  };

  // Handle deleting a product
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5003/api/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        alert('Product deleted!');
        setProducts(products.filter((product) => product.id !== id));
      })
      .catch((error) => console.error('Error deleting the product:', error));
  };

  // Handle editing a product
  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
  };

  // Handle updating an existing product
  const handleUpdate = (e, id) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('price', editingProduct.price);
    formData.append('description', editingProduct.description);
    formData.append('category', editingProduct.category);

    // Append image only if it's changed
    if (editingProduct.image) {
      formData.append('image', editingProduct.image);
    }

    axios
      .put(`http://localhost:5003/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        alert('Product updated!');
        setEditingProduct(null);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === id ? { ...product, ...editingProduct, image: editingProduct.image || product.image } : product
          )
        );
      })
      .catch((error) => console.error('Error updating the product:', error));
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const filteredProducts = products
    .filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter((product) => {
      return categoryFilter ? product.category === categoryFilter : true;
    });

  const currentProducts = filteredProducts
    .sort((a, b) => {
      if (sortOption === 'price') {
        return a.price - b.price;
      } else if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    })
    .slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="container my-4">
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          <SearchFilterSort
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
          <ProductList products={currentProducts} handleEditClick={handleEditClick} handleDelete={handleDelete} />
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            indexOfLastProduct={indexOfLastProduct}
            products={products}
          />
          <ProductForm
            product={editingProduct || newProduct}
            setProduct={editingProduct ? setEditingProduct : setNewProduct}
            handleSubmit={editingProduct ? (e) => handleUpdate(e, editingProduct.id) : handleSubmit}
            isEditing={editingProduct !== null}
            handleCancel={() => setEditingProduct(null)}
          />
        </>
      )}
    </div>
  );
};

export default Products;
