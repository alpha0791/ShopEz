import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/RouteGuards';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Market from './pages/Market';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import TradeHistory from './pages/TradeHistory';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/market" element={<Market />} />
              <Route path="/stocks/:symbol" element={<StockDetail />} />

              {/* Guest-only routes (redirect if logged in) */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              {/* Protected routes */}
              <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
              <Route path="/trades" element={<ProtectedRoute><TradeHistory /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

              {/* 404 fallback */}
              <Route path="*" element={
                <div className="page-wrapper">
                  <div className="loading-overlay" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '4rem' }}>🚀</div>
                    <h2>404 — Page Not Found</h2>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
