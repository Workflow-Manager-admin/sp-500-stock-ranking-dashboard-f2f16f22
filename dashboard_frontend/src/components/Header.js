import React from 'react';

// PUBLIC_INTERFACE
/**
 * Dashboard Header
 * Displays project title, Finnhub connection status, and theme toggle button.
 * @param {string} theme - The current theme ("light" or "dark")
 * @param {function} setTheme - Setter for theme
 * @param {string} primary - Primary color for accent
 * @param {string} [finnhubStatus] - Connection status: "connected", "disconnected", "connecting"
 */
export default function Header({ theme, setTheme, primary, finnhubStatus }) {
  // Map connectivity state to dot color and label
  let statusColor = '#a0a0a0', statusLabel = 'Unknown';
  if (finnhubStatus === 'connected') {
    statusColor = '#34a853'; // green
    statusLabel = 'Connected';
  } else if (finnhubStatus === 'disconnected') {
    statusColor = '#e24343'; // red
    statusLabel = 'Disconnected';
  } else if (finnhubStatus === 'connecting') {
    statusColor = '#fbbc05'; // orange
    statusLabel = 'Connecting...';
  }
  const showWarning = finnhubStatus === 'disconnected';

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
        {/* Finnhub live status indicator */}
        <span
          title={`Finnhub API status: ${statusLabel}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.39em',
            fontSize: 16,
            fontWeight: 500,
            background: showWarning ? '#fff6f5' : 'transparent',
            padding: showWarning ? '0.42em 0.82em' : '0.2em 0.68em',
            borderRadius: 14,
            color: showWarning ? '#e24343' : 'var(--text-primary)',
            border: showWarning ? `1px solid #fabdbd` : undefined,
            boxShadow: showWarning ? '0 2px 10px #e2434320' : undefined,
            transition: 'background 0.2s'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 13,
              height: 13,
              borderRadius: '100%',
              background: statusColor,
              marginRight: 6,
              border: showWarning ? '2.5px solid #fff' : undefined,
              boxShadow: `0 0 0 1px ${statusColor}50`,
              transition: 'background 0.22s'
            }}
          />
          <span>{statusLabel}</span>
        </span>
        {/* Theme toggle button */}
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
      {
        showWarning &&
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-1.05rem',
            transform: 'translateX(-50%)',
            color: '#e24343',
            fontWeight: 600,
            fontSize: '1.02rem',
            background: '#fff0ef',
            padding: '2px 14px',
            borderRadius: 12,
            border: '1.1px solid #fadada',
            boxShadow: '0 2px 10px #e2434315',
            zIndex: 16
          }}
          role="alert"
        >
          Lost connection to Finnhub API. Data may be outdated.
        </div>
      }
    </header>
  );
}
