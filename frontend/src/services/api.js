import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Data endpoints
export const dataService = {
  getRoles: () => api.get('/data/roles'),
  getEquipment: (type = null) => api.get('/data/equipment', { params: type ? { type } : {} }),
  getInscriptions: (rarity = null) => api.get('/data/inscriptions', { params: rarity ? { rarity } : {} }),
  getVIPBonuses: () => api.get('/data/vip'),
  getCivilisations: () => api.get('/data/civilisations'),
  getSpendingTiers: () => api.get('/data/spending'),
  getCitySkins: () => api.get('/data/cityskins'),
  getSetBonuses: () => api.get('/data/setbonuses'),
};

// Calculator endpoints
export const calculatorService = {
  calculateBuild: (buildData) => api.post('/calculator/calculate', buildData),
  getLeaderboard: (role, limit = 50) => api.get(`/calculator/leaderboard/${encodeURIComponent(role)}`, { params: { limit } }),
  getPlayerBuilds: (playerName) => api.get(`/calculator/player/${encodeURIComponent(playerName)}`),
  getBuild: (id) => api.get(`/calculator/build/${id}`),
  deleteBuild: (id) => api.delete(`/calculator/build/${id}`),
};

export default api;