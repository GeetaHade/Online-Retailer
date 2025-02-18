import React, { useEffect, useState } from "react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]); // State to store cart items

  // Fetch Cart Items
  useEffect(() => {
    fetch("http://localhost:5001/api/cart", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Send token for authentication
      },
    })
      .then((response) => response.json())
      .then((data) => setCartItems(data)) // Set cart items to state
      .catch((error) => console.error("Error fetching cart:", error));
  }, []);

  // Remove Item from Cart
  const handleRemoveFromCart = (cartId) => {
    fetch(`http://localhost:5001/api/cart/${cartId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Remove the item from the state after successful deletion
          setCartItems((prevItems) =>
            prevItems.filter((item) => item.cart_id !== cartId)
          );
          alert("Item removed from cart!");
        } else {
          alert("Failed to remove item from cart.");
        }
      })
      .catch((error) => console.error("Error removing item:", error));
  };

  return (
    <div className="container my-4">
      <h2>Your Cart</h2>
      {cartItems.length > 0 ? (
        <ul className="list-group">
          {cartItems.map((item) => (
            <li key={item.cart_id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <img
                  src={`http://localhost:5001/uploads/${item.image}`}
                  alt={item.name}
                  style={{ width: "50px", marginRight: "10px" }}
                />
                <strong>{item.name}</strong> - ${item.price} x {item.quantity}
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveFromCart(item.cart_id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
