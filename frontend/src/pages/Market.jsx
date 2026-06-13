import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { stocksAPI } from '../api';
import StockCard from '../components/StockCard';
import './Market.css';

const SECTORS = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Utilities', 'Materials'];
const SORT_OPTIONS = [
  { value: 'symbol', label: 'Symbol A-Z' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'change_desc', label: 'Gainers' },
  { value: 'change_asc', label: 'Losers' },
];

const Market = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sort, setSort] = useState('symbol');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const intervalRef = useRef(null);

  const fetchStocks = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await stocksAPI.getAll({ search, sector, sort, page, limit: 20 });
      setStocks(res.data.stocks);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
    } finally {
      setLoading(false);
    }
  }, [search, sector, sort, page]);

  useEffect(() => {
    fetchStocks(true);
  }, [fetchStocks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchStocks(false), 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchStocks]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSectorChange = (s) => {
    setSector(s);
    setPage(1);
  };

  const gainers = stocks.filter((s) => s.changePercent > 0).length;
  const losers = stocks.filter((s) => s.changePercent < 0).length;

  return (
    <div className="page-wrapper">
      <div className="container page-content">
        {/* Header */}
        <div className="market-header">
          <div>
            <h1>Market Dashboard</h1>
            <p className="market-subtitle">
              {total} stocks listed · {gainers} gaining · {losers} declining
              <span className="refresh-badge">🔄 Refreshes every 30s</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="market-controls card card-sm">
          <div className="search-wrapper" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              id="stock-search"
              type="text"
              className="form-input search-input"
              placeholder="Search by symbol or company name..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <select
            id="sort-select"
            className="form-input form-select"
            style={{ width: '160px' }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Sector filters */}
        <div className="sector-filters">
          {SECTORS.map((s) => (
            <button
              key={s}
              className={`sector-filter-btn ${sector === s ? 'active' : ''}`}
              onClick={() => handleSectorChange(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stocks grid */}
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <p className="loading-text">Loading market data...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No stocks found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="stocks-grid">
              {stocks.map((stock) => (
                <StockCard
                  key={stock._id}
                  stock={stock}
                  onClick={() => navigate(`/stocks/${stock.symbol}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Market;
