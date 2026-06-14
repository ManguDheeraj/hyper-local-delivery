import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: attach JWT ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor: handle 401 ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ── Auth ── */
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

/* ── Orders ── */
export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrderStats = () => api.get('/orders/stats');
export const createOrder = (data) => api.post('/orders', data);
export const assignRider = (orderId, riderId) =>
  api.put(`/orders/${orderId}/assign`, { riderId });
export const updateOrderStatus = (orderId, status) =>
  api.put(`/orders/${orderId}/status`, { status });

/* ── Riders ── */
export const getRiders = (params) => api.get('/riders', { params });
export const getRider = (id) => api.get(`/riders/${id}`);
export const updateRiderLocation = (id, location) =>
  api.put(`/riders/${id}/location`, { location });
export const toggleRiderOnline = (id) =>
  api.put(`/riders/${id}/toggle-online`);
export const getRiderEarnings = (id, params) =>
  api.get(`/riders/${id}/earnings`, { params });

export default api;
