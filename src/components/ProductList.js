import React from 'react';

const ProductList = ({ products, handleEditClick, handleDelete, userRole }) => {
  // Add to Cart Handler
  const handleAddToCart = (productId, event) => {
    event.stopPropagation(); // Prevent event bubbling to avoid interference with other buttons

    fetch("http://localhost:5001/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Get the token from localStorage
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1, // Default quantity to 1
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Product added to cart!");
        } else {
          response.json().then((data) => {
            alert(data.message || "Failed to add product to cart.");
          });
        }
      })
      .catch((error) => {
        console.error("Error adding product to cart:", error);
        alert("An error occurred. Please try again.");
      });
  };

  return (
    <div className="row">
      {products.map((product) => (
        <div key={product.id} className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm" onClick={() => userRole === 'customer' && handleAddToCart(product.id)}>
            <img
              src={`http://localhost:5001/uploads/${product.image}`}
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
                    onClick={(event) => {
                      event.stopPropagation(); // Prevent event bubbling for Edit button
                      handleEditClick(product);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={(event) => {
                      event.stopPropagation(); // Prevent event bubbling for Delete button
                      handleDelete(product.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Show Add to Cart button only for customers */}
              {userRole === 'customer' && (
                <button
                  className="btn btn-success mt-3"
                  onClick={(event) => handleAddToCart(product.id, event)} // Pass event to handleAddToCart
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
