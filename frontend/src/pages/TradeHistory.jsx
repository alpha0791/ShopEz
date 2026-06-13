import { useState, useEffect, useCallback } from 'react';
import { tradesAPI } from '../api';
import './TradeHistory.css';

const TradeHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tradesAPI.getHistory({ page, limit: 20, type: filter || undefined });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Trade history fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-wrapper">
      <div className="container page-content">
        <div className="history-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Trade History</h1>
            <p style={{ marginTop: 'var(--space-1)' }}>{total} transactions total</p>
          </div>
          <div className="history-filters">
            {['', 'buy', 'sell'].map((t) => (
              <button
                key={t}
                className={`sector-filter-btn ${filter === t ? 'active' : ''}`}
                onClick={() => { setFilter(t); setPage(1); }}
              >
                {t === '' ? 'All' : t === 'buy' ? '📈 Buy' : '📉 Sell'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /><p className="loading-text">Loading transactions...</p></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No transactions yet</h3>
            <p>Your trade history will appear here after your first trade.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Stock</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                            {tx.symbol}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{tx.stockName}</div>
                        </td>
                        <td>
                          <span className={`badge ${tx.type === 'buy' ? 'badge-success' : 'badge-danger'}`}>
                            {tx.type === 'buy' ? '📈 Buy' : '📉 Sell'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{tx.quantity}</td>
                        <td>₹{tx.priceAtTrade.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          ₹{tx.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td style={{ color: 'var(--color-success-light)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                          ₹{tx.balanceAfter.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
