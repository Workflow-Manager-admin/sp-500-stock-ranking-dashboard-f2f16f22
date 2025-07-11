import React from 'react';

// PUBLIC_INTERFACE
/**
 * Dashboard Header
 * Displays project title and theme toggle button.
 */
export default function Header({ theme, setTheme, primary }) {
  return (
    <header
      className="dashboard-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '1.1rem 2.4rem 1.3rem 2.4rem',
        borderBottom: `2px solid ${primary}`,
        boxShadow: '0 1px 6px #0001'
      }}
    >
      <span
        className="dashboard-title"
        style={{
          fontWeight: 600,
          fontSize: '1.65rem',
          letterSpacing: '-0.03em',
          color: primary
        }}
      >
        S&amp;P 500 Stock Ranking Dashboard
      </span>
      <button
        className="theme-toggle"
        style={{
          marginLeft: 'auto',
          background: primary,
          color: 'white'
        }}
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}
