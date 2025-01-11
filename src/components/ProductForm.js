// ProductForm.js
import React from 'react';

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

export default ProductForm;
