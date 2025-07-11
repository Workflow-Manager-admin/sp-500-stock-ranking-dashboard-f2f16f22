import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockTable from './components/StockTable';
import StockDetailsModal from './components/StockDetailsModal';
import Footer from './components/Footer';

// PUBLIC_INTERFACE
/**
 * Root App for S&P 500 Stock Ranking Dashboard
 * Main structure with header, search, stock table, details modal, and footer.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [searchSymbol, setSearchSymbol] = useState('AAPL');

  // Effect: update color scheme (minimalistic manual approach)
  React.useEffect(() => {
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
