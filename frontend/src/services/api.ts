import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('edufund_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('edufund_token');
      localStorage.removeItem('edufund_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Applications
export const applicationsApi = {
  create: () => api.post('/applications'),
  getAll: () => api.get('/applications'),
  getById: (id: string) => api.get(`/applications/${id}`),
  savePersonal: (id: string, data: any) => api.patch(`/applications/${id}/personal`, data),
  saveAcademic: (id: string, data: any) => api.patch(`/applications/${id}/academic`, data),
  saveFinancial: (id: string, data: any) => api.patch(`/applications/${id}/financial`, data),
  saveLoan: (id: string, data: any) => api.patch(`/applications/${id}/loan`, data),
  submit: (id: string) => api.post(`/applications/${id}/submit`),
  updateStatus: (id: string, data: any) => api.patch(`/applications/${id}/status`, data),
};

// Admin
export const adminApi = {
  getApplications: (params?: any) => api.get('/admin/applications', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (search?: string) => api.get('/admin/users', { params: { search } }),
};

// Scoring
export const scoringApi = {
  evaluate: (id: string) => api.post(`/scoring/evaluate/${id}`),
};

export default api;
