import React from 'react';

const ProductList = ({ products, handleEditClick, handleDelete, userRole }) => {
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

              {/* Show Edit and Delete buttons only for owners */}
              {userRole === 'owner' && (
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditClick(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
