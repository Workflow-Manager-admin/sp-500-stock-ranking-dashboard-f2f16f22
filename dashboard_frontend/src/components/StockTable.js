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
 * Displays a single searched stock's info as a mini-table (rather than the full S&P 500 batch).
 * @param {string} searchSymbol - Ticker to fetch, e.g. 'AAPL'
 * @param {function} onRowSelect - Called with symbol when selecting a row
 * @param {object} colors - accent/primary/secondary for styling
 */
export default function StockTable({ searchSymbol, onRowSelect, colors }) {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch a single stock upon change
  useEffect(() => {
    let active = true;
    async function fetchStock() {
      if (!searchSymbol?.trim()) {
        setRow(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setRow(null);
      try {
        const result = await fetchStockPerformance(searchSymbol.trim().toUpperCase());
        if (active) setRow(result);
      } catch (e) {
        if (active) setError(((e.detail) || e.message || String(e)).replace(/^Error:\s*/, ''));
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchStock();
    return () => { active = false; };
  }, [searchSymbol]);

  // Disposition calculation (Buy/Hold/Sell)
  // PUBLIC_INTERFACE
  function getDisposition(row) {
    function safeNum(v, fallback) { return (typeof v === 'number' && !isNaN(v)) ? v : ((v !== undefined && v !== null && v !== '-') ? +v : fallback); }

    // P/E Ratio: [<16:3] [16-25:2] [>25:1]
    let peVal = safeNum(row.peRatio, null);
    let peScore = peVal === null ? 1 : (peVal < 16 ? 3 : (peVal <= 25 ? 2 : 1));

    // Beta: [<1.0:3] [1.0-1.25:2] [>1.25:1]
    let betaVal = safeNum(row.beta, null);
    let betaScore = betaVal === null ? 1 : (betaVal < 1.0 ? 3 : (betaVal <= 1.25 ? 2 : 1));

    // Profit Margin: [>0.15:3] [0.09-0.15:2] [<=0.09:1]
    let pmVal = safeNum(row.profitMargin, null);
    let pmScore = pmVal === null ? 1 : (pmVal > 0.15 ? 3 : (pmVal > 0.09 ? 2 : 1));

    // EPS: [>6:3] [3-6:2] [<3:1]
    let epsVal = safeNum(row.eps, null);
    let epsScore = epsVal === null ? 1 : (epsVal > 6 ? 3 : (epsVal >= 3 ? 2 : 1));

    let dispositionScore = peScore + betaScore + pmScore + epsScore;
    if (dispositionScore >= 10) return 'Buy';
    if (dispositionScore >= 7) return 'Hold';
    return 'Sell';
  }

  // Color for disposition
  const dispositionColor = d => ({
    'Buy': colors.accent,
    'Hold': colors.primary,
    'Sell': colors.secondary,
  }[d] || '#888');

  return (
    <div className="dashboard-table-wrap" style={{ maxWidth: 700, margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: 11, boxShadow: '0 0 8px #0001', padding: '1.3rem 0', overflowX: 'auto' }}>
      <div style={{ textAlign: 'left', padding: '0.8rem 1.6rem 0.2rem 1.6rem' }}>
        <span style={{ fontWeight: 500, color: colors.primary, fontSize: '1.2rem' }}>
          {searchSymbol
            ? `Results for '${searchSymbol.trim().toUpperCase()}'`
            : `Enter a US stock ticker above to view its data.`}
        </span>
      </div>
      {loading && (<div style={{padding: '2rem 0', color: colors.primary}}>Loading data…</div>)}
      {error && (<div style={{ color: '#c00', background: '#ffeaea', padding: '1rem 1.5rem', borderRadius: '6px', margin: '1.3rem 2.1rem' }}>Error: {error}</div>)}
      {!loading && !error && row &&
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '1.10rem', marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem 1.1rem', minWidth: 80 }}>Symbol</th>
              {parameterDefs.map(pd => (
                <th key={pd.key} style={{ padding: '0.5rem 0.7rem', minWidth: 90 }}>
                  {pd.label}
                </th>
              ))}
              <th style={{ padding: '0.5rem 1.1rem', minWidth: 100 }}>Disposition</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hoverable-row" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => onRowSelect(row.symbol)}>
              <td style={{ padding: '0.47rem 1.2rem', fontWeight: 600 }}>{row.symbol}</td>
              {parameterDefs.map(pd => (
                <td key={pd.key} style={{ padding: '0.47rem 0.7rem', textAlign: 'right', fontFamily: 'monospace' }}>
                  {row[pd.key] !== undefined && row[pd.key] !== null ? row[pd.key] : '-'}
                </td>
              ))}
              <td style={{ color: dispositionColor(getDisposition(row)), fontWeight: 700 }}>{getDisposition(row)}</td>
            </tr>
          </tbody>
        </table>
      }
      {!loading && !error && !row && (
        <div style={{ padding: '1.6rem 0', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '1.06rem' }}>
          {searchSymbol
            ? <>No data found for "<b>{searchSymbol.trim().toUpperCase()}</b>". Please check if the ticker is valid.</>
            : <>Please enter a ticker (e.g., <i>AAPL</i>) above to search for a US stock.</>
          }
        </div>
      )}
      <div className="dashboard-table-info" style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', padding: '0.8rem 1.6rem 0 1.6rem' }}>
        Click row for more company details. Results based on single-stock lookup.&nbsp;
        {searchSymbol && !loading && !error && row?.symbol && (
          <span>Disposition is based on P/E, Beta, Profit Margin, and EPS.</span>
        )}
      </div>
    </div>
  );
}
