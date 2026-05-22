import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tw_token');
      localStorage.removeItem('tw_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadDocuments: (files, onProgress) => {
    const form = new FormData();
    files.forEach((f) => form.append('documents', f));
    return api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
};

// ── Itineraries ───────────────────────────────────────────────────────────────
export const itineraryAPI = {
  list: (params) => api.get('/itineraries', { params }),
  get: (id) => api.get(`/itineraries/${id}`),
  getStatus: (id) => api.get(`/itineraries/${id}/status`),
  delete: (id) => api.delete(`/itineraries/${id}`),
  toggleShare: (id) => api.patch(`/itineraries/${id}/share`),
  getShared: (token) => api.get(`/itineraries/shared/${token}`),
};

export default api;
