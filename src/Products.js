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
  const [userRole, setUserRole] = useState(null); // State for storing user role

  const productsPerPage = 6;

  // Fetch the user role from JWT token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token to get the payload
      setUserRole(decodedToken.role); // Set the user role
    }
  }, []);

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5003/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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
    // Safely check if name or description is available before calling .toLowerCase()
    const name = product.name || '';
    const description = product.description || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })
  .filter((product) => {
    return categoryFilter ? product.category === categoryFilter : true;
  });


  const currentProducts = filteredProducts
  .sort((a, b) => {
    if (sortOption === 'priceLowHigh') {
      return a.price - b.price; // Sort low to high
    } else if (sortOption === 'priceHighLow') {
      return b.price - a.price; // Sort high to low
    } else if (sortOption === 'nameAsc') {
      return a.name.localeCompare(b.name); // Sort A-Z
    } else if (sortOption === 'nameDesc') {
      return b.name.localeCompare(a.name); // Sort Z-A
    }
    return 0; // Default case (no sorting)
  })
  .slice(indexOfFirstProduct, indexOfLastProduct);

  // Show loading state if userRole is not yet fetched
  if (userRole === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-4">
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          {userRole === 'customer' && (
            <SearchFilterSort
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          )}
          <ProductList
            products={currentProducts}
            handleEditClick={handleEditClick}
            handleDelete={handleDelete}
            userRole={userRole} // Pass user role to ProductList
          />
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            indexOfLastProduct={indexOfLastProduct}
            products={products}
          />
          {userRole === 'owner' && (
            <ProductForm
              product={editingProduct || newProduct}
              setProduct={editingProduct ? setEditingProduct : setNewProduct}
              handleSubmit={editingProduct ? (e) => handleUpdate(e, editingProduct.id) : handleSubmit}
              isEditing={editingProduct !== null}
              handleCancel={() => setEditingProduct(null)}
              userRole={userRole} // Pass user role to ProductForm
            />
          )}
        </>
      )}
    </div>
  );
};

export default Products;
