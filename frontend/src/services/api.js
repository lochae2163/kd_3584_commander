import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set auth password for all requests
export const setAuthPassword = (password) => {
  if (password) {
    api.defaults.headers.common['Authorization'] = password;
    localStorage.setItem('rokPassword', password);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('rokPassword');
  }
};

// Initialize password from localStorage
const savedPassword = localStorage.getItem('rokPassword');
if (savedPassword) {
  api.defaults.headers.common['Authorization'] = savedPassword;
}

// Auth service
export const authService = {
  verifyPassword: (password) => api.post('/governors/auth/verify', { password }),
  isAuthenticated: () => !!localStorage.getItem('rokPassword'),
  logout: () => {
    localStorage.removeItem('rokPassword');
    delete api.defaults.headers.common['Authorization'];
  },
};

// Governor service
export const governorService = {
  getAll: (search = '', sortBy = 'name', order = 'asc') =>
    api.get('/governors', { params: { search, sortBy, order } }),
  getById: (id) => api.get(`/governors/${id}`),
  create: (data) => api.post('/governors', data),
  update: (id, data) => api.put(`/governors/${id}`, data),
  delete: (id) => api.delete(`/governors/${id}`),
};

// Build service
export const buildService = {
  getAll: (troopType = null, buildType = null) =>
    api.get('/governors/builds', { params: { troopType, buildType } }),
  getByGovernor: (governorId) => api.get(`/governors/${governorId}/builds`),
  getById: (governorId, buildId) => api.get(`/governors/${governorId}/builds/${buildId}`),
  create: (governorId, data) => api.post(`/governors/${governorId}/builds`, data),
  update: (governorId, buildId, data) => api.put(`/governors/${governorId}/builds/${buildId}`, data),
  delete: (governorId, buildId) => api.delete(`/governors/${governorId}/builds/${buildId}`),
};

// Data service (reference data)
export const dataService = {
  getCommanders: (troopType = null, role = null) =>
    api.get('/data/commanders', { params: { troopType, role } }),
  getEquipment: (type = null) =>
    api.get('/data/equipment', { params: type ? { type } : {} }),
  getInscriptions: (armamentType = null) =>
    api.get('/data/inscriptions', { params: armamentType ? { armamentType } : {} }),
  getArmaments: () =>
    api.get('/data/armaments'),
};

export default api;
