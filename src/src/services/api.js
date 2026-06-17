import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pixelgame_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const authService = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  register: (data) => api.post('/auth/register', data),
  // A API espera { currentPassword, newPassword }.
  changePassword: ({ senhaAtual, novaSenha }) =>
    api.put('/auth/change-password', { currentPassword: senhaAtual, newPassword: novaSenha }),
};

export const gameService = {
  getAll: (params) => api.get('/jogos', { params }),
  getById: (id) => api.get(`/jogos/${id}`),
  create: (data) => api.post('/jogos', data),
  update: (id, data) => api.put(`/jogos/${id}`, data),
  remove: (id) => api.delete(`/jogos/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
};

export const companyService = {
  getAll: () => api.get('/empresas'),
  getById: (id) => api.get(`/empresas/${id}`),
  create: (data) => api.post('/empresas', data),
  update: (id, data) => api.put(`/empresas/${id}`, data),
  remove: (id) => api.delete(`/empresas/${id}`),
};

export const cartService = {
  get: () => api.get('/carrinho/ativo'),
  addItem: (jogoId) => api.post('/carrinho/add', { jogoId }),
  removeItem: (gameId) => api.delete(`/carrinho/${gameId}`),
};

export const orderService = {
  checkout: () => api.post('/vendas/checkout'),
  pay: (metodo, dados) => api.post('/vendas/pay', { metodo, dados }),
  getHistory: () => api.get('/vendas/'),
};

export const wishlistService = {
  get: () => api.get('/lista-desejo'),
  add: (jogoId) => api.post('/lista-desejo', { jogoId }),
  remove: (jogoId) => api.delete('/lista-desejo', { data: { jogoId } }),
};

export const reviewService = {
  getMedia: (jogoId) => api.get(`/avaliacoes/media/${jogoId}`),
  // GET /avaliacoes retorna apenas as avaliações do próprio usuário logado.
  getMine: () => api.get('/avaliacoes'),
  create: (jogoId, nota, comentario) =>
    api.post('/avaliacoes', { jogoId, nota, comentario }),
  update: (jogoId, nota, comentario) =>
    api.put('/avaliacoes', { jogoId, nota, comentario }),
};

export const reportService = {
  // params opcionais: { empresa, top }. Sem empresa = ranking geral de mais vendidos.
  jogosMaisVendidos: (params) => api.get('/relatorios/jogos-mais-vendidos', { params }),
};

export const publicService = {
  getJogos: () => api.get('/public/jogos'),
};

export const userService = {
  getById: (id) => api.get(`/usuarios/${id}`),
  // PUT /usuarios/:id espera { nome, dataNascimento (DD/MM/YYYY), fkPerfil }.
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  // Jogos comprados pelo usuário, com as chaves de ativação.
  getMyGames: () => api.get('/usuarios/my/games'),
  // Lista todos os usuários (admin).
  getAll: () => api.get('/usuarios'),
};

export const profileService = {
  getAll: () => api.get('/profiles'),
  create: (data) => api.post('/profiles', data),
};

export default api;
