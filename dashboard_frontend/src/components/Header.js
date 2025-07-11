import React from 'react';

/**
 * Dashboard Header
 * Displays project title and theme toggle button.
 * @param {string} theme - The current theme ("light" or "dark")
 * @param {function} setTheme - Setter for theme
 * @param {string} primary - Primary color for accent
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
        boxShadow: '0 1px 6px #0001',
        position: 'relative',
        minHeight: 71
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
        S&P 500 Stock Ranking Dashboard
      </span>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
        marginLeft: 24
      }}>
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
      </div>
    </header>
  );
}
