import React, { useEffect, useState } from 'react';
import { fetchStockPerformance } from '../finnhubApi';

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
 * Responsive: On desktop, displays as horizontal table; on mobile, stacks as a vertical card.
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

  // Responsive rendering helpers
  function StockCardMobile({ row }) {
    return (
      <div
        className="dashboard-mobile-stock-card"
        style={{
          borderRadius: 14,
          border: `1.5px solid ${colors.accent}`,
          background: 'var(--bg-primary)',
          boxShadow: '0 1px 11px #0002',
          padding: '1.1rem 1.1rem',
          margin: '0.7rem 1.1rem',
          fontSize: '1.08rem',
          cursor: 'pointer', // Whole card clickable
          transition: 'box-shadow 0.19s'
        }}
        tabIndex={0}
        onClick={() => onRowSelect(row.symbol)}
        onKeyDown={e => { if (["Enter", " "].includes(e.key)) onRowSelect(row.symbol); }}
        aria-label={`Show details for ${row.symbol}`}
      >
        <div style={{ fontWeight: 700, color: colors.primary, fontSize: '1.2rem', marginBottom: 9 }}>
          <span>{row.symbol}</span>
          <span
            style={{
              float: 'right',
              background: dispositionColor(getDisposition(row)),
              color: '#fff',
              fontWeight: 600,
              padding: '0.13em 0.74em',
              borderRadius: 14,
              fontSize: '1.02rem'
            }}
            aria-label={`Disposition: ${getDisposition(row)}`}
          >
            {getDisposition(row)}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 0.6rem' }}>
          {parameterDefs.map(pd => (
            <div
              key={pd.key}
              style={{
                flex: '1 1 48%',
                minWidth: 120,
                display: 'flex',
                alignItems: 'center',
                padding: '2px 0'
              }}
            >
              <span style={{ color: colors.primary, minWidth: 99, fontSize: '1.05rem', fontWeight: 500 }}>
                {pd.label}:
              </span>
              <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>
                {row[pd.key] !== undefined && row[pd.key] !== null ? row[pd.key] : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Determine if on mobile: match the media query for 900px or less (JS for SSR-safe, pure CSS for production)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className="dashboard-table-wrap"
      style={{
        maxWidth: 900,
        margin: '0 auto',
        background: 'var(--bg-secondary)',
        borderRadius: 11,
        boxShadow: '0 0 8px #0001',
        padding: '0.8rem 0.25rem 1.6rem 0.25rem',
        overflowX: 'hidden'
      }}
    >
      <div
        style={{
          textAlign: 'left',
          padding: isMobile
            ? '0.85rem 1.1rem 0.5rem 1.1rem'
            : '0.8rem 1.95rem 0.3rem 1.95rem'
        }}
      >
        <span
          style={{
            fontWeight: 500,
            color: colors.primary,
            fontSize: isMobile ? '1.08rem' : '1.18rem'
          }}
        >
          {searchSymbol
            ? `Results for '${searchSymbol.trim().toUpperCase()}'`
            : `Enter a US stock ticker above to view its data.`}
        </span>
      </div>
      {loading && (<div style={{ padding: '2rem 0', color: colors.primary }}>Loading data…</div>)}
      {error && (
        <div
          style={{
            color: '#c00',
            background: '#ffeaea',
            padding: '1rem 1.5rem',
            borderRadius: '6px',
            margin: '1.3rem 2.1rem'
          }}
        >
          Error: {error}
        </div>
      )}
      {!loading && !error && row && (
        isMobile
          ? <StockCardMobile row={row} />
          : (
            <div style={{ width: '100%', overflow: 'visible' }}>
              <table
                className="stock-table-justified"
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  minWidth: 0,
                  fontSize: '0.97rem',
                  marginTop: 10
                }}
              >
                <colgroup>
                  {/* 30% increased widths handled via CSS, but can put min/max inline as well if needed */}
                  <col className="stock-col-symbol" style={{ minWidth: 60, width: '11.7%' }} />
                  {parameterDefs.map((pd, idx) => (
                    <col
                      key={pd.key}
                      className={`stock-col-param stock-col-param-${idx}`}
                      style={{
                        minWidth: 72,
                        maxWidth: 156,
                        width: '9.36%'
                      }}
                    />
                  ))}
                  <col className="stock-col-disposition" style={{ minWidth: 85, maxWidth: 156, width: '15.6%' }} />
                </colgroup>
                <thead>
                  <tr className="stock-row-header">
                    <th className="stock-cell-header stock-col-symbol">Symbol</th>
                    {parameterDefs.map((pd, idx) => (
                      <th
                        className={`stock-cell-header stock-cell-header-param stock-col-param stock-col-param-${idx}`}
                        key={pd.key}
                      >
                        {pd.label}
                      </th>
                    ))}
                    <th className="stock-cell-header stock-col-disposition">Disposition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className="hoverable-row stock-row-body"
                    tabIndex={0}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.99rem',
                      fontWeight: 500,
                      boxSizing: 'border-box'
                    }}
                    onClick={() => onRowSelect(row.symbol)}
                  >
                    <td className="stock-cell-body stock-col-symbol" style={{
                      fontWeight: 600,
                      textAlign: 'left',
                    }}>{row.symbol}</td>
                    {parameterDefs.map((pd, idx) => (
                      <td
                        key={pd.key}
                        className={`stock-cell-body stock-col-param stock-col-param-${idx}`}
                        style={{
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontSize: '0.98rem',
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 72,
                          maxWidth: 156,
                          width: '9.36%'
                        }}
                        title={(row[pd.key] !== undefined && row[pd.key] !== null) ? String(row[pd.key]) : '-'}
                      >
                        {row[pd.key] !== undefined && row[pd.key] !== null ? row[pd.key] : '-'}
                      </td>
                    ))}
                    <td
                      className="stock-cell-body stock-col-disposition"
                      style={{
                        color: dispositionColor(getDisposition(row)),
                        fontWeight: 700,
                        textAlign: 'center',
                        minWidth: 85,
                        maxWidth: 156,
                        width: '15.6%'
                      }}
                    >
                      {getDisposition(row)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
      )}
      {!loading && !error && !row && (
        <div style={{
          padding: '1.6rem 0',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          fontSize: '1.06rem'
        }}>
          {searchSymbol
            ? <>No data found for "<b>{searchSymbol.trim().toUpperCase()}</b>". Please check if the ticker is valid.</>
            : <>Please enter a ticker (e.g., <i>AAPL</i>) above to search for a US stock.</>
          }
        </div>
      )}
      <div
        className="dashboard-table-info"
        style={{
          fontSize: '0.97rem',
          color: 'var(--text-secondary)',
          padding: isMobile
            ? '0.75rem 1.1rem 0 1.1rem'
            : '0.8rem 1.7rem 0 1.7rem'
        }}
      >
        Click {isMobile ? "card" : "row"} for more company details. Results based on single-stock lookup.&nbsp;
        {searchSymbol && !loading && !error && row?.symbol && (
          <span>Disposition is based on P/E, Beta, Profit Margin, and EPS.</span>
        )}
      </div>
    </div>
  );
}
