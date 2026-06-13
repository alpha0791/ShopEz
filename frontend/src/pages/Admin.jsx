import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { adminAPI, stocksAPI } from '../api';
import { useToast } from '../context/ToastContext';
import './Admin.css';

const TABS = ['Overview', 'Users', 'Stocks', 'Transactions'];

const Admin = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      toast.error('Failed to load stats.');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ limit: 50 });
      setUsers(res.data.users);
    } catch { } finally { setLoading(false); }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getTransactions({ limit: 50 });
      setTransactions(res.data.transactions);
    } catch { } finally { setLoading(false); }
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stocksAPI.getAll({ limit: 50 });
      setStocks(res.data.stocks);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'Users') fetchUsers();
    if (activeTab === 'Transactions') fetchTransactions();
    if (activeTab === 'Stocks') fetchStocks();
  }, [activeTab]);

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(id, newRole);
      toast.success(`Role updated to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed.');
    }
  };

  const handleSimulate = async (id, symbol) => {
    try {
      await stocksAPI.simulatePrice(id);
      toast.success(`${symbol} price updated.`);
      fetchStocks();
    } catch {
      toast.error('Simulation failed.');
    }
  };

  const volumeData = stats?.volume?.map((v) => ({
    type: v._id.charAt(0).toUpperCase() + v._id.slice(1),
    count: v.count,
    amount: Math.round(v.totalAmount / 1000),
  })) || [];

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-wrapper">
      <div className="container page-content">
        <div className="admin-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>⚙️ Admin Dashboard</h1>
            <p style={{ marginTop: 'var(--space-1)' }}>Platform management and analytics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`admin-tab-${tab.toLowerCase()}`}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'Overview' && stats && (
          <div className="admin-overview">
            <div className="grid grid-4 gap-4">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-primary-glow)' }}>👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-success-bg)' }}>📊</div>
                <div className="stat-value">{stats.totalStocks}</div>
                <div className="stat-label">Active Stocks</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-warning-bg)' }}>💱</div>
                <div className="stat-value">{stats.totalTransactions}</div>
                <div className="stat-label">Total Trades</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-danger-bg)' }}>💰</div>
                <div className="stat-value">₹{(volumeData.reduce((s, v) => s + v.amount, 0)).toLocaleString()}K</div>
                <div className="stat-label">Volume Traded</div>
              </div>
            </div>

            {volumeData.length > 0 && (
              <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Trade Volume by Type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,153,255,0.08)" />
                    <XAxis dataKey="type" tick={{ fill: '#4d6280', fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: '#4d6280', fontSize: 12 }} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="# of Trades" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent transactions */}
            {stats.recentTransactions?.length > 0 && (
              <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {stats.recentTransactions.map((tx) => (
                    <div key={tx._id} className="recent-tx">
                      <span className={`badge ${tx.type === 'buy' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.type}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{tx.symbol}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        by {tx.userId?.name}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'Users' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Balance</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.name}</td>
                      <td style={{ fontSize: '0.875rem' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-success-light)', fontWeight: 600 }}>
                        ₹{u.virtualBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRoleToggle(u._id, u.role)}
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stocks */}
        {activeTab === 'Stocks' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Sector</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>{s.symbol}</td>
                      <td style={{ fontSize: '0.875rem' }}>{s.name}</td>
                      <td><span className="sector-tag">{s.sector}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        ₹{s.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={s.changePercent >= 0 ? 'price-up' : 'price-down'} style={{ fontWeight: 600 }}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent?.toFixed(2)}%
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleSimulate(s._id, s.symbol)}
                        >
                          Simulate Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions */}
        {activeTab === 'Transactions' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(tx.createdAt)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{tx.userId?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{tx.userId?.email}</div>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{tx.symbol}</td>
                      <td>
                        <span className={`badge ${tx.type === 'buy' ? 'badge-success' : 'badge-danger'}`}>
                          {tx.type === 'buy' ? '📈 Buy' : '📉 Sell'}
                        </span>
                      </td>
                      <td>{tx.quantity}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        ₹{tx.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
