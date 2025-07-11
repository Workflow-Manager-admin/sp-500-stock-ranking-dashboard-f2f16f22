/**
 * Finnhub API Utilities for S&P 500 Dashboard
 * Note: You must replace FINNHUB_API_KEY with your Finnhub key (demo or real).
 * Enhanced: detects error details (missing/invalid key, CORS, endpoint, network, rate limit).
 */

// Error codes/types
export const FINNHUB_ERROR_TYPES = {
  MISSING_KEY: "Missing or invalid API key",
  INVALID_KEY: "Missing or invalid API key",
  ENDPOINT: "Incorrect endpoint",
  CORS: "CORS not allowed",
  NETWORK: "Network problem",
  RATE_LIMIT: "Exceeded rate limit",
  OTHER: "Other error"
};

// Helper for error diagnosis
export async function diagnoseFinnhubError(errorObj, resp, url) {
  // CORS: likely if resp is undefined, error is TypeError, and error message includes "Failed to fetch"
  // Network: also if resp is undefined but reason doesn't match CORS
  // API errors: check resp.status and body
  // Endpoint: HTTP 404 or 400, or message contains "endpoint"
  // Invalid key: HTTP 401, or body message "Invalid API key"
  // Rate limit: HTTP 429, or response includes "rate limit"
  // Defensive: Try-catch in handler for robustness
  if (!resp) {
    if (typeof errorObj === "object" && errorObj && errorObj.message && errorObj.message.match(/(network|fetch|cors)/i)) {
      if (/cors/i.test(errorObj.message)) return { type: FINNHUB_ERROR_TYPES.CORS, detail: "Browser CORS blocked the request" };
      if (/network/i.test(errorObj.message)) return { type: FINNHUB_ERROR_TYPES.NETWORK, detail: "Network problem: " + errorObj.message };
      if (/fetch/i.test(errorObj.message)) return { type: FINNHUB_ERROR_TYPES.NETWORK, detail: "Network error in fetch: " + errorObj.message };
    }
    if (errorObj instanceof TypeError) {
      // CORS or network error
      return { type: FINNHUB_ERROR_TYPES.CORS, detail: "Request blocked due to CORS or failed network request" };
    }
    return { type: FINNHUB_ERROR_TYPES.NETWORK, detail: errorObj?.message || "Unknown network error" };
  }
  // Error response from Finnhub
  if (resp.status === 401) return { type: FINNHUB_ERROR_TYPES.INVALID_KEY, detail: "Invalid or missing Finnhub API key" };
  if (resp.status === 403) return { type: FINNHUB_ERROR_TYPES.INVALID_KEY, detail: "Finnhub API key invalid or not authorized" };
  if (resp.status === 404) return { type: FINNHUB_ERROR_TYPES.ENDPOINT, detail: "Endpoint not found (404)" };
  if (resp.status === 429) return { type: FINNHUB_ERROR_TYPES.RATE_LIMIT, detail: "Finnhub rate limit exceeded" };
  if (resp.status === 400) return { type: FINNHUB_ERROR_TYPES.ENDPOINT, detail: "Finnhub endpoint incorrect (400)" };

  // Attempt to decode json body for additional info
  let detail = "";
  try {
    const bodyText = await resp.text();
    if (bodyText) {
      if (bodyText.match(/rate limit/i)) {
        return { type: FINNHUB_ERROR_TYPES.RATE_LIMIT, detail: "Finnhub rate limit exceeded" };
      }
      if (bodyText.match(/invalid.+key|key.+invalid/i)) {
        return { type: FINNHUB_ERROR_TYPES.INVALID_KEY, detail: "Invalid/missing API key: " + bodyText };
      }
      if (bodyText.match(/endpoint|not found/i)) {
        return { type: FINNHUB_ERROR_TYPES.ENDPOINT, detail: "Incorrect Finnhub endpoint: " + bodyText };
      }
      if (bodyText.match(/cors/i)) {
        return { type: FINNHUB_ERROR_TYPES.CORS, detail: "CORS issue: " + bodyText };
      }
      detail = bodyText;
    }
  } catch { /* ignore */ }
  return { type: FINNHUB_ERROR_TYPES.OTHER, detail: detail || (errorObj?.message || "Unknown error") };
}

const FINNHUB_API_KEY = 'd1oh9thr01quemd91de0d1oh9thr01quemd91deg'; // Updated API key

// Internal fetch wrapper for diagnosis
async function finnhubFetchJSON(url) {
  let resp = undefined;
  try {
    resp = await fetch(url);
    if (!resp.ok) {
      // Try to parse error
      const errType = await diagnoseFinnhubError(null, resp, url);
      const err = new Error(errType.type + (errType.detail ? ": " + errType.detail : ""));
      err.category = errType.type;
      err.detail = errType.detail;
      throw err;
    }
    return await resp.json();
  } catch (err) {
    // Network/CORS diagnosis
    if (!resp) {
      const errType = await diagnoseFinnhubError(err, resp, url);
      const error = new Error(errType.type + (errType.detail ? ": " + errType.detail : ""));
      error.category = errType.type;
      error.detail = errType.detail;
      throw error;
    }
    throw err;
  }
}

/**
 * Fetch core performance metrics for a stock.
 * Returns object with all 10 metrics.
 * Throws with error.category and error.detail if failed.
 */
// PUBLIC_INTERFACE
export async function fetchStockPerformance(symbol) {
  // Fetch quote, metrics, profile—aggregate for demo.
  try {
    const [quote, metrics, profile] = await Promise.all([
      finnhubFetchJSON(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      finnhubFetchJSON(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`),
      finnhubFetchJSON(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
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
  } catch (error) {
    // error.category, error.detail available, propagate
    throw error;
  }
}

/**
 * Fetch detailed company profile.
 * Throws with error.category and error.detail if failed.
 */
// PUBLIC_INTERFACE
export async function fetchStockProfile(symbol) {
  try {
    return await finnhubFetchJSON(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
  } catch (error) {
    throw error;
  }
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
