import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';
import { stocksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TradeModal from '../components/TradeModal';
import './StockDetail.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-date">{label}</p>
        <p className="chart-tooltip-price">
          ₹{parseFloat(payload[0].value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrade, setShowTrade] = useState(false);
  const [chartRange, setChartRange] = useState(30);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await stocksAPI.getBySymbol(symbol);
        setStock(res.data.stock);
      } catch {
        navigate('/market');
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [symbol, navigate]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-overlay"><div className="spinner" /><p className="loading-text">Loading stock data...</p></div>
      </div>
    );
  }

  if (!stock) return null;

  const chartData = stock.historicalData
    .slice(-chartRange)
    .map((d) => ({ date: d.date.slice(5), close: d.close, open: d.open, high: d.high, low: d.low }));

  const isUp = stock.change >= 0;
  const chartColor = isUp ? '#10b981' : '#ef4444';
  const firstPrice = chartData[0]?.close || stock.price;
  const overallGain = ((stock.price - firstPrice) / firstPrice) * 100;

  return (
    <div className="page-wrapper">
      <div className="container page-content">
        {/* Back */}
        <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate('/market')}>
          ← Back to Market
        </button>

        {/* Stock Header */}
        <div className="stock-detail-header card">
          <div className="stock-detail-info">
            <div className="stock-detail-symbol-row">
              <div className="stock-symbol-large">{stock.symbol}</div>
              <span className="sector-tag">{stock.sector}</span>
              <span className={`badge ${isUp ? 'badge-success' : 'badge-danger'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
              </span>
            </div>
            <h2 className="stock-detail-name">{stock.name}</h2>
            <p className="stock-description">{stock.description}</p>
          </div>
          <div className="stock-detail-price-block">
            <div className="stock-detail-price">
              ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className={`stock-detail-change ${isUp ? 'price-up' : 'price-down'}`}>
              {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </div>
            <p className="stock-prev-close">Prev. Close: ₹{stock.previousClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            {user && (
              <button
                id="trade-btn"
                className="btn btn-primary"
                style={{ marginTop: 'var(--space-4)', width: '100%' }}
                onClick={() => setShowTrade(true)}
              >
                Trade Now
              </button>
            )}
            {!user && (
              <button
                className="btn btn-outline"
                style={{ marginTop: 'var(--space-4)', width: '100%' }}
                onClick={() => navigate('/login')}
              >
                Sign In to Trade
              </button>
            )}
          </div>
        </div>

        {/* Price Chart */}
        <div className="card stock-chart-card">
          <div className="chart-header">
            <div>
              <h3>Price History</h3>
              <span className={`chart-overall ${overallGain >= 0 ? 'price-up' : 'price-down'}`}>
                {overallGain >= 0 ? '+' : ''}{overallGain.toFixed(2)}% over {chartRange} days
              </span>
            </div>
            <div className="chart-range-btns">
              {[7, 14, 30, 60].map((r) => (
                <button
                  key={r}
                  className={`range-btn ${chartRange === r ? 'active' : ''}`}
                  onClick={() => setChartRange(r)}
                >
                  {r}D
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,153,255,0.08)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#4d6280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#4d6280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: chartColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats grid */}
        <div className="stock-stats-grid">
          {[
            { label: 'Market Cap', value: `₹${(stock.marketCap / 1e12).toFixed(2)}T` },
            { label: 'Volume', value: stock.volume ? `${(stock.volume / 1e6).toFixed(2)}M` : 'N/A' },
            { label: 'Prev Close', value: `₹${stock.previousClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
            { label: 'Day Change', value: `${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%`, cls: isUp ? 'price-up' : 'price-down' },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <div className="stat-label">{item.label}</div>
              <div className={`stat-value ${item.cls || ''}`} style={{ fontSize: '1.25rem' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {showTrade && (
        <TradeModal
          stock={stock}
          onClose={() => setShowTrade(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default StockDetail;
