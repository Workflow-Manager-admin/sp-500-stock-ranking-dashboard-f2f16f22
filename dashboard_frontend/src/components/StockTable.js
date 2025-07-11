import React, { useEffect, useState } from 'react';
import { fetchBatchStockPerformance } from '../finnhubApi';
import { SP500_TICKERS } from '../sp500_tickers';

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
 * Displays all S&P 500 stock info as a sortable, filterable table.
 * @param {string} searchSymbol - Ticker to filter, e.g. 'AAPL' (empty string means show all)
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
    let active = true;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      let filterSymbols;
      // If search is blank, show all; if set, filter to it.
      if (searchSymbol?.trim()) {
        // Support both 'AAPL' and substring match (search bar)
        filterSymbols = SP500_TICKERS.filter(t =>
          t.toUpperCase().includes(searchSymbol.toUpperCase())
        );
        if (filterSymbols.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }
      } else {
        filterSymbols = [...SP500_TICKERS];
      }
      try {
        const stocks = await fetchBatchStockPerformance(filterSymbols);
        if (active) setData(stocks);
      } catch (e) {
        if (active) setError(String(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchAll();
    return () => { active = false; };
  }, [searchSymbol]);

  // Sorting
  let displayData = [...data];
  if (displayData.length > 0 && sortBy) {
    displayData.sort((a, b) => {
      const vA = a[sortBy];
      const vB = b[sortBy];
      if (typeof vA === 'number' && typeof vB === 'number') {
        return sortDir === 'asc' ? vA - vB : vB - vA;
      } else if (typeof vA === 'string' && typeof vB === 'string') {
        return sortDir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      } else {
        // Null/undefineds at bottom
        if (vA === vB) return 0;
        if (vA == null) return 1;
        if (vB == null) return -1;
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
  /**
   * Compute disposition for a stock row using the agreed scoring formula:
   * - Score 1-3 for each of the four metrics: P/E Ratio (lower=better), Beta (lower=better), Profit Margin (higher=better), EPS (higher=better).
   * - Buy: score 10-12, Hold: score 7-9, Sell: score 4-6.
   * Implements exact thresholds; missing data (null/undefined/"-") yields lowest score for that metric.
   */
  // PUBLIC_INTERFACE
  function getDisposition(row) {
    // Helper: convert to number; use default if missing/invalid
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

  // Visuals
  const dispositionColor = d => ({
    'Buy': colors.accent,
    'Hold': colors.primary,
    'Sell': colors.secondary,
  }[d] || '#888');

  return (
    <div className="dashboard-table-wrap" style={{ maxWidth: 1100, margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: 11, boxShadow: '0 0 8px #0001', padding: '1.3rem 0', overflowX: 'auto' }}>
      <div style={{ textAlign: 'left', padding: '0.8rem 1.6rem 0.2rem 1.6rem' }}>
        <span style={{ fontWeight: 500, color: colors.primary, fontSize: '1.2rem' }}>
          {searchSymbol && searchSymbol.trim()
            ? `Filtering: '${searchSymbol}' (${displayData.length} / ${SP500_TICKERS.length})`
            : `Showing all S&P 500 companies (${displayData.length})`
          }
        </span>
      </div>
      {loading && (<div style={{padding: '1.5rem 0'}}>Loading data… (May take a while for all 500 stocks)</div>)}
      {error && (<div style={{ color: '#c00', padding: '1rem' }}>Error: {error}</div>)}
      {!loading && !error && (
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '1.06rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem 1.1rem', cursor: 'pointer' }} onClick={() => onSort('symbol')}>
                Symbol{sortBy === 'symbol' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
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
        Click a row for details. Sorted by {sortBy} ({sortDir}). All S&P 500 stocks shown.
      </div>
    </div>
  );
}
