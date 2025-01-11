// ProductList.js
import React from 'react';

const ProductList = ({ products, handleEditClick, handleDelete }) => {
  return (
    <div className="row">
      {products.map((product) => (
        <div key={product.id} className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm">
            <img
              src={`http://localhost:5003/uploads/${product.image}`} 
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
  );
};

export default ProductList;