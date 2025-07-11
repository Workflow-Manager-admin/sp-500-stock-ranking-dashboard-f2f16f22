import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockTable from './components/StockTable';
import StockDetailsModal from './components/StockDetailsModal';
import Footer from './components/Footer';
import { FINNHUB_ERROR_TYPES, diagnoseFinnhubError } from './finnhubApi';

// Finnhub status checking utility
const FINNHUB_API_KEY = 'c50qf2iad3ifvojmvdpg'; // Use the same demo key for ping
const FINNHUB_PING_URL = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_API_KEY}`;

// Enhanced: Connection state with diagnosis info
function useFinnhubConnectionDiagnosis(pingIntervalMs = 15000) {
  const [status, setStatus] = useState('connecting'); // 'connected', 'disconnected', 'connecting'
  const [errorCategory, setErrorCategory] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let canceled = false;
    async function check() {
      setStatus('connecting');
      setErrorCategory(null);
      setErrorDetail(null);
      let resp = undefined;
      try {
        resp = await fetch(FINNHUB_PING_URL);
        if (resp.ok) {
          const json = await resp.json();
          if ('c' in json) {
            setStatus('connected');
            setErrorCategory(null);
            setErrorDetail(null);
          } else {
            // Unexpected body structure
            setStatus('disconnected');
            setErrorCategory(FINNHUB_ERROR_TYPES.OTHER);
            setErrorDetail('Unexpected response from Finnhub');
          }
        } else {
          setStatus('disconnected');
          // Diagnose error type from response
          const diagnosis = await diagnoseFinnhubError(null, resp, FINNHUB_PING_URL);
          setErrorCategory(diagnosis.type);
          setErrorDetail(diagnosis.detail);
        }
      } catch (e) {
        setStatus('disconnected');
        // Network or CORS errors
        const diagnosis = await diagnoseFinnhubError(e, resp, FINNHUB_PING_URL);
        setErrorCategory(diagnosis.type);
        setErrorDetail(diagnosis.detail);
      }
    }
    check();
    intervalRef.current = setInterval(check, pingIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pingIntervalMs]);

  return { status, errorCategory, errorDetail };
}

// PUBLIC_INTERFACE
/**
 * Root App for S&P 500 Stock Ranking Dashboard
 * Main structure with header, search, stock table, details modal, and footer.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [searchSymbol, setSearchSymbol] = useState('AAPL');
  // Enhanced: use diagnosis
  const {
    status: finnhubStatus,
    errorCategory: finnhubErrorCategory,
    errorDetail: finnhubErrorDetail,
  } = useFinnhubConnectionDiagnosis();

  // Effect: update color scheme (minimalistic manual approach)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const onRowSelect = (symbol) => {
    setSelectedSymbol(symbol);
  };

  // PUBLIC_INTERFACE
  const closeModal = () => {
    setSelectedSymbol(null);
  };

  // PUBLIC_INTERFACE
  const handleSearch = (term) => {
    setSearchSymbol(term.toUpperCase());
    setSelectedSymbol(null);
  };

  // Accent/brand palette for theme
  const accent = '#34a853';
  const primary = '#1a73e8';
  const secondary = '#fbbc05';

  return (
    <div className="App" style={{background: 'var(--bg-primary)'}}>
      <Header
        theme={theme}
        setTheme={setTheme}
        primary={primary}
        finnhubStatus={finnhubStatus}
        finnhubErrorCategory={finnhubErrorCategory}
        finnhubErrorDetail={finnhubErrorDetail}
      />
      <main className="dashboard-main" style={{minHeight: '80vh', padding: 0, margin: 0}}>
        <div className="dashboard-controls">
          <SearchBar defaultValue={searchSymbol} onSearch={handleSearch} accent={accent} />
        </div>
        <StockTable
          searchSymbol={searchSymbol}
          onRowSelect={onRowSelect}
          colors={{accent, primary, secondary}}
        />
        <StockDetailsModal
          symbol={selectedSymbol}
          open={!!selectedSymbol}
          onClose={closeModal}
          colors={{accent, primary, secondary}}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
