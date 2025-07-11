/**
 * Finnhub API Utilities for S&P 500 Dashboard
 * Note: You must replace FINNHUB_API_KEY with your Finnhub key (demo or real).
 */
const FINNHUB_API_KEY = 'c50qf2iad3ifvojmvdpg'; // DEMO PUBLIC (rate limited)—change for prod!

/**
 * Fetch core performance metrics for a stock.
 * Returns object with all 10 metrics.
 */
export async function fetchStockPerformance(symbol) {
  // Fetch quote, profile, metrics—aggregate for demo.
  const [quote, metrics, profile] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`).then(r => r.json()),
    fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`).then(r => r.json()),
    fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`).then(r => r.json()),
  ]);

  // Compose a row with 10 metrics.
  // Defensive: Provide '-' if missing.
  const ratios = metrics.metric || {};
  return {
    symbol: symbol,
    currentPrice: quote.c ?? '-',
    peRatio: parseNumber(ratios.peNormalizedAnnual) ?? '-',
    marketCap: compactMillions(profile.marketCapitalization),
    dividendYield: parsePercent(ratios.dividendYieldAnnual),
    roe: parsePercent(ratios.roeAnnual),
    beta: parseNumber(ratios.beta),
    profitMargin: parsePercent(ratios.netProfitMarginAnnual),
    eps: parseNumber(ratios.epsAnnual),
    debtToEquity: parseNumber(ratios.debtEquityAnnual),
    freeCashFlowYield: parsePercent(ratios.freeCashFlowYieldAnnual)
  };
}

/**
 * Fetch detailed company profile.
 */
export async function fetchStockProfile(symbol) {
  const resp = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
  if (!resp.ok) throw new Error('Failed to fetch company info');
  return await resp.json();
}

/* Helper for numbers and percentages */
function parseNumber(v) {
  if (v === undefined || v === null) return undefined;
  try {
    return +Number(v).toFixed(3);
  } catch {
    return undefined;
  }
}
function parsePercent(v) {
  const parsed = parseNumber(v);
  if (typeof parsed === 'number') return +parsed;
  return undefined;
}
function compactMillions(mcap) {
  return mcap && !isNaN(mcap) ? (mcap/1e9).toFixed(2) + "B" : '-';
}
