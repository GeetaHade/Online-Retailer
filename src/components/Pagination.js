// Pagination.js
import React from 'react';

const Pagination = ({ currentPage, setCurrentPage, indexOfLastProduct, products }) => {
  return (
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
  );
};

export default Pagination;
