import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rokToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired or invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rokToken');
      // Don't redirect here, let the AuthContext handle it
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (visibleGovernorId, password) => api.post('/auth/login', { visibleGovernorId, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  linkGovernor: (governorId) => api.post('/auth/link-governor', { governorId }),
  getUnclaimedGovernors: () => api.get('/auth/unclaimed-governors'),
  createAdmin: (data) => api.post('/auth/create-admin', data),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
  updateGovernorName: (newName) => api.put('/auth/update-governor-name', { newName }),
  deleteAccount: (password, deleteGovernor = false) => api.delete('/auth/delete-account', { data: { password, deleteGovernor } }),
  checkVerification: (governorId) => api.get(`/auth/check-verification/${governorId}`),
  isAuthenticated: () => !!localStorage.getItem('rokToken'),
  logout: () => {
    localStorage.removeItem('rokToken');
  },
};

// Admin service
export const adminService = {
  uploadWhitelist: (file) => {
    const formData = new FormData();
    formData.append('whitelist', file);
    return api.post('/admin/upload-whitelist', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getWhitelist: (page = 1, limit = 50, search = '') =>
    api.get('/admin/whitelist', { params: { page, limit, search } }),
  getWhitelistStats: () => api.get('/admin/whitelist/stats'),
  addToWhitelist: (visibleGovernorId, governorName) =>
    api.post('/admin/whitelist/add', { visibleGovernorId, governorName }),
  removeFromWhitelist: (id) => api.delete(`/admin/whitelist/${id}`),
  getUsers: () => api.get('/admin/users'),
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

// Upload service
export const uploadService = {
  uploadScreenshot: (governorId, buildId, file) => {
    const formData = new FormData();
    formData.append('screenshot', file);
    return api.post(`/upload/build/${governorId}/${buildId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteScreenshot: (governorId, buildId, publicId) =>
    api.delete(`/upload/build/${governorId}/${buildId}/${encodeURIComponent(publicId)}`)
};

// Data service (reference data)
export const dataService = {
  getCommanders: (troopType = null, role = null) =>
    api.get('/data/commanders', { params: { troopType, role } }),
  getEquipment: (type = null) =>
    api.get('/data/equipment', { params: type ? { type } : {} }),
  getInscriptions: (formation = null, slot = null, tier = null) => {
    const params = {};
    if (formation) params.formation = formation;
    if (slot) params.slot = slot;
    if (tier) params.tier = tier;
    return api.get('/data/inscriptions', { params });
  },
  getArmaments: () => api.get('/data/armaments'),
};

export default api;
