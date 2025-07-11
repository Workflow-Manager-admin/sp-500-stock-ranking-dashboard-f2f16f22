import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockTable from './components/StockTable';
import StockDetailsModal from './components/StockDetailsModal';
import Footer from './components/Footer';

// Finnhub status checking utility
const FINNHUB_API_KEY = 'c50qf2iad3ifvojmvdpg'; // Use the same demo key for ping
const FINNHUB_PING_URL = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_API_KEY}`;

// Connection states: "connected", "disconnected", "connecting"
function useFinnhubConnectionStatus(pingIntervalMs = 15000) {
  const [status, setStatus] = useState('connecting'); // 'connected', 'disconnected', 'connecting'
  const intervalRef = useRef(null);

  useEffect(() => {
    let canceled = false;
    async function check() {
      setStatus('connecting');
      try {
        const resp = await fetch(FINNHUB_PING_URL);
        if (resp.ok) {
          // Defensive: check this field is a number (API may rate-limit)
          const json = await resp.json();
          // A good response gives an object; otherwise fetchStockPerformance will fail soon after
          if ('c' in json) setStatus('connected');
          else setStatus('disconnected');
        } else {
          setStatus('disconnected');
        }
      } catch {
        setStatus('disconnected');
      }
    }
    // Initial immediate call
    check();
    // Then schedule repeated checks as a lightweight heartbeat
    intervalRef.current = setInterval(check, pingIntervalMs);

    return () => {
      canceled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pingIntervalMs]);

  return status;
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
  const finnhubStatus = useFinnhubConnectionStatus();

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
