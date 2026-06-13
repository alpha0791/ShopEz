import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { portfolioAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TradeModal from '../components/TradeModal';
import './Portfolio.css';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portfolioAPI.get();
      setPortfolio(res.data.portfolio);
    } catch (err) {
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-overlay"><div className="spinner" /><p className="loading-text">Loading portfolio...</p></div>
      </div>
    );
  }

  const holdings = portfolio?.holdings || [];
  const pieData = holdings.map((h) => ({ name: h.symbol, value: h.currentValue }));

  const pnlColor = (portfolio?.totalUnrealizedPnL || 0) >= 0 ? 'price-up' : 'price-down';
  const realizedColor = (portfolio?.realizedPnL || 0) >= 0 ? 'price-up' : 'price-down';

  return (
    <div className="page-wrapper">
      <div className="container page-content">
        <h1 className="page-title">My Portfolio</h1>

        {/* Summary cards */}
        <div className="portfolio-summary-grid">
          <div className="stat-card">
            <div className="stat-label">Total Portfolio Value</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              ₹{(portfolio?.totalPortfolioValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Invested Amount</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              ₹{(portfolio?.totalInvested || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unrealized P&L</div>
            <div className={`stat-value ${pnlColor}`} style={{ fontSize: '1.5rem' }}>
              {(portfolio?.totalUnrealizedPnL || 0) >= 0 ? '+' : ''}
              ₹{(portfolio?.totalUnrealizedPnL || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cash Balance</div>
            <div className="stat-value price-up" style={{ fontSize: '1.5rem' }}>
              ₹{(user?.virtualBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Realized P&L</div>
            <div className={`stat-value ${realizedColor}`} style={{ fontSize: '1.5rem' }}>
              {(portfolio?.realizedPnL || 0) >= 0 ? '+' : ''}
              ₹{(portfolio?.realizedPnL || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Holdings</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{holdings.length}</div>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3>Your portfolio is empty</h3>
            <p>Start trading to build your portfolio.</p>
            <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/market')}>
              Browse Market →
            </button>
          </div>
        ) : (
          <div className="portfolio-main">
            {/* Holdings table */}
            <div className="card" style={{ flex: 2 }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Holdings</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Qty</th>
                      <th>Avg Buy</th>
                      <th>LTP</th>
                      <th>Current Value</th>
                      <th>P&L</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => {
                      const pnlCls = h.unrealizedPnL >= 0 ? 'price-up' : 'price-down';
                      return (
                        <tr key={h.symbol}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                              {h.symbol}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{h.stockName}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{h.quantity}</td>
                          <td>₹{h.avgBuyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                            ₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                          <td>
                            <div className={pnlCls} style={{ fontWeight: 700 }}>
                              {h.unrealizedPnL >= 0 ? '+' : ''}₹{h.unrealizedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <div className={pnlCls} style={{ fontSize: '0.75rem' }}>
                              {h.unrealizedPnLPct >= 0 ? '+' : ''}{h.unrealizedPnLPct}%
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setSelectedStock({ _id: h.stockId, symbol: h.symbol, name: h.stockName, price: h.currentPrice, change: h.change, changePercent: h.changePercent, previousClose: h.currentPrice })}
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie chart */}
            {pieData.length > 0 && (
              <div className="card portfolio-pie">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Allocation</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Value']}
                      contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onSuccess={fetchPortfolio}
        />
      )}
    </div>
  );
};

export default Portfolio;
