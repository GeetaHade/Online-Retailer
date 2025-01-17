import React from 'react';

const SearchFilterSort = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, sortOption, setSortOption }) => {
  return (
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
  );
};

export default SearchFilterSort;
