import React, { useEffect, useState } from 'react';
import { fetchStockProfile } from '../finnhubApi';

// PUBLIC_INTERFACE
/**
 * StockDetailsModal
 * Displays modal/drawer for selected stock symbol with additional company profile data.
 */
export default function StockDetailsModal({ symbol, open, onClose, colors }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol || !open) return;
    setLoading(true);
    setError(null);
    fetchStockProfile(symbol)
      .then(setDetails)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [symbol, open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="dashboard-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'rgba(34,34,34,0.23)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
      }}
      onClick={onClose}
    >
      <div
        className="dashboard-modal"
        style={{
          minWidth: 305, maxWidth: '98vw',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: 13,
          padding: '2.1rem 2.2rem',
          boxShadow: '0 4px 33px #0003',
          border: `1.5px solid ${colors.accent}`,
          zIndex: 50,
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          aria-label="Close details"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#444'
          }}
        >
          ✕
        </button>
        <h2 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '1.2rem', color: colors.primary }}>
          {symbol} Details
        </h2>
        {loading && <div style={{ padding: '1.3rem 0', color: colors.primary }}>Loading…</div>}
        {error && <div style={{ color: '#d00' }}>Error: {error}</div>}
        {details &&
          <div style={{ lineHeight: 1.75 }}>
            <div><b>Name:</b> {details.name}</div>
            <div><b>Industry:</b> {details.finnhubIndustry}</div>
            <div><b>Country:</b> {details.country}</div>
            <div><b>Website:</b> <a href={details.weburl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{details.weburl}</a></div>
            <div><b>IPO:</b> {details.ipo}</div>
            <div style={{ marginTop: '0.6em' }}>
              <b>Description:</b>
              <div style={{ fontSize: '1rem', color: '#444', marginTop: '0.1em', maxWidth: 350 }}>
                {details.description ?? 'No description available.'}
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
