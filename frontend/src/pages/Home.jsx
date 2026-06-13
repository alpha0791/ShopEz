import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const stats = [
  { label: 'Listed Stocks', value: '20+', icon: '📊' },
  { label: 'Virtual Balance', value: '₹1L', icon: '💰' },
  { label: 'Real-time Data', value: '30s', icon: '⚡' },
  { label: 'Free to Trade', value: '100%', icon: '🎯' },
];

const features = [
  {
    icon: '📈',
    title: 'Live Market Dashboard',
    desc: 'Track all NSE-listed stocks with real-time price simulations and market trend indicators.',
  },
  {
    icon: '💼',
    title: 'Portfolio Tracking',
    desc: 'Monitor your holdings, unrealized P&L, and total portfolio value with rich visualizations.',
  },
  {
    icon: '⚡',
    title: 'Instant Trade Execution',
    desc: 'Buy and sell stocks instantly with your virtual ₹1,00,000 starting balance.',
  },
  {
    icon: '📋',
    title: 'Trade History',
    desc: 'Complete audit trail of all your transactions with balance snapshots.',
  },
  {
    icon: '🔒',
    title: 'Secure Auth',
    desc: 'JWT-based authentication with bcrypt password encryption and role-based access.',
  },
  {
    icon: '⚙️',
    title: 'Admin Panel',
    desc: 'Full platform management: users, stocks, transactions, and analytics.',
  },
];

const featuredStocks = [
  { symbol: 'TCS', change: '+1.28%', price: '₹3,920', up: true },
  { symbol: 'RELIANCE', change: '+0.71%', price: '₹2,850', up: true },
  { symbol: 'INFY', change: '-0.45%', price: '₹1,780', up: false },
  { symbol: 'HDFCBANK', change: '+0.90%', price: '₹1,680', up: true },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Live Market Simulation
          </div>
          <h1 className="hero-title">
            Trade Smarter.<br />
            <span className="gradient-text">Grow Faster.</span>
          </h1>
          <p className="hero-desc">
            Experience real-world stock trading with ₹1,00,000 virtual capital.
            Explore NSE stocks, execute trades, and track your portfolio — risk-free.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/market" className="btn btn-primary btn-lg">
                Open Market Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Trading Free →
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Ticker tape */}
          <div className="ticker-wrapper">
            <div className="ticker-track">
              {[...featuredStocks, ...featuredStocks].map((s, i) => (
                <div key={i} className={`ticker-item ${s.up ? 'up' : 'down'}`}>
                  <span className="ticker-symbol">{s.symbol}</span>
                  <span className="ticker-price">{s.price}</span>
                  <span className="ticker-change">{s.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="home-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="home-stat-card">
                <span className="home-stat-icon">{s.icon}</span>
                <div className="home-stat-value">{s.value}</div>
                <div className="home-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-features">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need to <span className="gradient-text">trade like a pro</span></h2>
            <p>A full-stack trading simulation platform built with the MERN stack.</p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow" />
            <h2>Ready to start trading?</h2>
            <p>Join ShopEZ and practice trading with real market data — completely free.</p>
            {!user && (
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account →
              </Link>
            )}
            {user && (
              <Link to="/market" className="btn btn-primary btn-lg">
                Go to Market →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
