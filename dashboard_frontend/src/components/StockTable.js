import React, { useEffect, useState } from 'react';
import { fetchStockPerformance } from '../finnhubApi';

// 10 key performance parameters, can be expanded
const parameterDefs = [
  { key: 'currentPrice', label: 'Price' },
  { key: 'peRatio', label: 'P/E Ratio' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'dividendYield', label: 'Div. Yield' },
  { key: 'roe', label: 'ROE' },
  { key: 'beta', label: 'Beta' },
  { key: 'profitMargin', label: 'Profit Margin' },
  { key: 'eps', label: 'EPS' },
  { key: 'debtToEquity', label: 'Debt/Equity' },
  { key: 'freeCashFlowYield', label: 'FCF Yield' }
];

// PUBLIC_INTERFACE
/**
 * StockTable
 * Displays single stock info (AAPL) as sortable, filterable table for demo.
 * In production: map over S&P 500 tickers.
 * @param {string} searchSymbol - Ticker to fetch, e.g. 'AAPL'
 * @param {function} onRowSelect - Called with symbol when selecting a row
 * @param {object} colors - accent/primary/secondary for styling
 */
export default function StockTable({ searchSymbol, onRowSelect, colors }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('currentPrice');
  const [sortDir, setSortDir] = useState('desc');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Demo: Only one row, later can fetch batch.
    fetchStockPerformance(searchSymbol)
      .then(stock => setData(stock ? [stock] : []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [searchSymbol]);

  // Sorting
  let displayData = [...data];
  if (displayData.length > 0 && sortBy) {
    displayData.sort((a, b) => {
      const vA = a[sortBy];
      const vB = b[sortBy];
      if (typeof vA === 'number' && typeof vB === 'number') {
        return sortDir === 'asc' ? vA - vB : vB - vA;
      } else {
        return 0;
      }
    });
  }

  const onSort = (k) => {
    if (sortBy === k) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(k);
      setSortDir('desc');
    }
  };

  // Disposition calculation (Buy/Hold/Sell)
  function getDisposition(row) {
    if (row.peRatio < 18 && row.profitMargin > 0.12 && row.beta < 1.1) return 'Buy';
    if (row.peRatio > 30 || row.beta > 1.4 || row.profitMargin < 0.07) return 'Sell';
    return 'Hold';
  }

  // Visuals
  const dispositionColor = d => ({
    'Buy': colors.accent,
    'Hold': colors.primary,
    'Sell': colors.secondary,
  }[d] || '#888');

  return (
    <div className="dashboard-table-wrap" style={{ maxWidth: 940, margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: 11, boxShadow: '0 0 8px #0001', padding: '1.3rem 0' }}>
      <div style={{ textAlign: 'left', padding: '0.8rem 1.6rem 0.2rem 1.6rem' }}>
        <span style={{ fontWeight: 500, color: colors.primary, fontSize: '1.2rem' }}>
          Stock: {searchSymbol}
        </span>
      </div>
      {loading && (<div style={{padding: '1.5rem 0'}}>Loading data…</div>)}
      {error && (<div style={{ color: '#c00', padding: '1rem' }}>Error: {error}</div>)}
      {!loading && !error && (
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '1.06rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem 1.1rem' }}>Symbol</th>
              {parameterDefs.map(pd => (
                <th key={pd.key} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', color: sortBy === pd.key ? colors.accent : undefined }} onClick={() => onSort(pd.key)}>
                  {pd.label}
                  {sortBy === pd.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              <th style={{ padding: '0.5rem 1.1rem' }}>Disposition</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={parameterDefs.length + 2} style={{ textAlign: 'center', padding: '1.3rem' }}>
                  No data found.
                </td>
              </tr>
            ) : (
              displayData.map((row, i) => {
                const disposition = getDisposition(row);
                return (
                  <tr key={row.symbol} className="hoverable-row" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => onRowSelect(row.symbol)}>
                    <td style={{ padding: '0.47rem 1.2rem', fontWeight: 600 }}>{row.symbol}</td>
                    {parameterDefs.map(pd => (
                      <td key={pd.key} style={{ padding: '0.47rem 0.7rem', textAlign: 'right', fontFamily: 'monospace' }}>
                        {row[pd.key] !== undefined && row[pd.key] !== null ? row[pd.key] : '-'}
                      </td>
                    ))}
                    <td style={{ color: dispositionColor(disposition), fontWeight: 700 }}>{disposition}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
      <div className="dashboard-table-info" style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', padding: '0.8rem 1.6rem 0 1.6rem' }}>
        Click a row for details. Demo: Only AAPL fully supported.
      </div>
    </div>
  );
}
