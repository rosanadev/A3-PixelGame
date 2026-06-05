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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH 
export const authService = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// JOGOS 
export const gameService = {
  getAll: (params) => api.get('/jogos', { params }),
  getById: (id) => api.get(`/jogos/${id}`),
  create: (data) => api.post('/jogos', data),
  update: (id, data) => api.put(`/jogos/${id}`, data),
  remove: (id) => api.delete(`/jogos/${id}`),
};

// CATEGORIAS 
export const categoryService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
};

// EMPRESAS 
export const companyService = {
  getAll: () => api.get('/empresas'),
  getById: (id) => api.get(`/empresas/${id}`),
  create: (data) => api.post('/empresas', data),
  update: (id, data) => api.put(`/empresas/${id}`, data),
  remove: (id) => api.delete(`/empresas/${id}`),
};

// CARRINHO 
export const cartService = {
  get: () => api.get('/carrinho/ativo'),
  addItem: (jogoId) => api.post('/carrinho/add', { jogoId }),
  removeItem: (gameId) => api.delete(`/carrinho/${gameId}`),
};

// VENDAS
export const orderService = {
  checkout: () => api.post('/vendas/checkout'),
  pay: (metodo, dados) => api.post('/vendas/pay', { metodo, dados }),
  getHistory: () => api.get('/vendas/'),
};

// USUÁRIO (jogos comprados / chaves de ativação)
export const userService = {
  getMyGames: () => api.get('/usuarios/my/games'),
};

// LISTA DE DESEJOS
export const wishlistService = {
  get: () => api.get('/lista-desejo'),
  add: (jogoId) => api.post('/lista-desejo', { jogoId }),
  remove: (jogoId) => api.delete('/lista-desejo', { data: { jogoId } }),
};

// AVALIAÇÕES
export const reviewService = {
  getAll: () => api.get('/avaliacoes'),
  getMedia: (jogoId) => api.get(`/avaliacoes/media/${jogoId}`),
  create: (jogoId, nota, comentario) =>
    api.post('/avaliacoes', { jogoId, nota, comentario }),
  update: (jogoId, nota, comentario) =>
    api.put('/avaliacoes', { jogoId, nota, comentario }),
};

// RELATÓRIOS 
export const reportService = {
  jogosMaisVendidos: () => api.get('/relatorios/jogos-mais-vendidos'),
};

// PÚBLICO (sem login)
export const publicService = {
  getJogos: () => api.get('/public/jogos'),
};

export default api;
