import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token JWT em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pixelgame_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login se token expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pixelgame_token');
      localStorage.removeItem('pixelgame_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH 
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// JOGOS
export const gameService = {
  getAll: (params) => api.get('/games', { params }),
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  remove: (id) => api.delete(`/games/${id}`),
};

// CATEGORIAS 
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

// EMPRESAS 
export const companyService = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  remove: (id) => api.delete(`/companies/${id}`),
};

// CARRINHO 
export const cartService = {
  get: () => api.get('/cart'),
  addItem: (gameId) => api.post('/cart/items', { gameId }),
  removeItem: (gameId) => api.delete(`/cart/items/${gameId}`),
};

// VENDAS 
export const orderService = {
  checkout: (paymentData) => api.post('/sales', paymentData),
  getHistory: () => api.get('/sales/history'),
};

// WISHLIST 
export const wishlistService = {
  get: () => api.get('/wishlist'),
  add: (gameId) => api.post('/wishlist', { gameId }),
  remove: (gameId) => api.delete(`/wishlist/${gameId}`),
};

// AVALIAÇÕES 
export const reviewService = {
  getByGame: (gameId) => api.get(`/games/${gameId}/reviews`),
  create: (gameId, data) => api.post(`/games/${gameId}/reviews`, data),
};

// RELATÓRIOS 
export const reportService = {
  topSelling: () => api.get('/reports/top-selling'),
  topSellingByCompany: () => api.get('/reports/top-selling-by-company'),
  ranking: () => api.get('/reports/ranking'),
  rankingByCategory: () => api.get('/reports/ranking-by-category'),
};

export default api;
