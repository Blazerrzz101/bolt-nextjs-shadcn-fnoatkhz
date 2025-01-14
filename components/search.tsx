import React from 'react';

export const Search: React.FC = () => {
  return (
    <div className="search-container">
      <label htmlFor="searchInput">Search input</label>
      <input 
        id="searchInput"
        type="text" 
        className="search-input"
        placeholder="Search here..."
      />
    </div>
  );
}; 