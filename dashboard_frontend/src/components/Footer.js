import React from 'react';

// PUBLIC_INTERFACE
/**
 * Dashboard Footer
 * Displays application credits.
 */
export default function Footer() {
  return (
    <footer
      style={{
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        padding: '1.1rem 0',
        borderTop: '1.5px solid #eee',
        marginTop: '2rem'
      }}
    >
      <span>
        &copy; {new Date().getFullYear()} S&amp;P 500 Dashboard Demo &mdash; Data via <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8' }}>Finnhub</a>
      </span>
    </footer>
  );
}
