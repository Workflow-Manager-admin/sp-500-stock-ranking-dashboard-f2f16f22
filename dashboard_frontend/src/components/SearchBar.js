import React, { useState } from 'react';

// PUBLIC_INTERFACE
/**
 * SearchBar
 * Allows searching for a company ticker or filtering the table.
 * @param {string} defaultValue - The initial/placeholder value.
 * @param {function} onSearch - Callback when searching.
 * @param {string} accent - Accent color.
 */
export default function SearchBar({ defaultValue, onSearch, accent }) {
  const [value, setValue] = useState(defaultValue);

  // PUBLIC_INTERFACE
  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass empty string if nothing entered: shows all stocks.
    if (typeof onSearch === 'function') onSearch(value?.trim() || '');
  };

  return (
    <form
      className="dashboard-searchbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: 320,
        margin: '2rem auto 1.4rem auto',
        gap: '0.5rem',
      }}
      onSubmit={handleSubmit}
    >
      <input
        aria-label="Search by company ticker"
        style={{
          padding: '0.7rem 1.0rem',
          fontSize: '1.08rem',
          border: `1.5px solid ${accent}`,
          borderRadius: 8,
          outline: 'none',
          minWidth: 0,
          flex: 1,
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
        type="text"
        value={value}
        placeholder="Enter ticker or part of name (leave blank to list all)"
        onChange={e => setValue(e.target.value.toUpperCase())}
        maxLength={10}
        autoFocus
      />
      <button
        type="submit"
        style={{
          padding: '0.7rem 1.2rem',
          fontWeight: 500,
          border: 'none',
          borderRadius: 7,
          background: accent,
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Search
      </button>
    </form>
  );
}
