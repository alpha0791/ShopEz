import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopez_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shopez_token');
      localStorage.removeItem('shopez_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Stocks ──────────────────────────────────────────────────────────────────
export const stocksAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`),
  create: (data) => api.post('/stocks', data),
  update: (id, data) => api.put(`/stocks/${id}`, data),
  delete: (id) => api.delete(`/stocks/${id}`),
  simulatePrice: (id) => api.post(`/stocks/${id}/simulate`),
};

// ─── Trades ──────────────────────────────────────────────────────────────────
export const tradesAPI = {
  buy: (data) => api.post('/trades/buy', data),
  sell: (data) => api.post('/trades/sell', data),
  getHistory: (params) => api.get('/trades/history', { params }),
};

// ─── Portfolio ───────────────────────────────────────────────────────────────
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getStats: () => api.get('/admin/stats'),
};

export default api;
