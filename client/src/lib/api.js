import axios from 'axios';

export const TOKEN_KEY = 'finora_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      window.dispatchEvent(new CustomEvent('finora:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again.';
  }
  if (!error?.response) {
    return 'Could not reach the server. Make sure the API is running.';
  }
  return error.response.data?.message || fallback;
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
};

export const transactionApi = {
  list: (params) => api.get('/transactions', { params }),
  create: (payload) => api.post('/transactions', payload),
  update: (id, payload) => api.patch(`/transactions/${id}`, payload),
  remove: (id) => api.delete(`/transactions/${id}`),
  exportCsv: (params) => api.get('/transactions/export', { params, responseType: 'blob' }),
};

export const budgetApi = {
  list: (month) => api.get('/budgets', { params: { month } }),
  save: (payload) => api.put('/budgets', payload),
  remove: (id) => api.delete(`/budgets/${id}`),
};

export const dashboardApi = {
  get: (month) => api.get('/dashboard', { params: { month } }),
};

export const healthApi = {
  get: () => api.get('/health'),
};

export default api;
