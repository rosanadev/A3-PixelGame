// Cliente de API em JavaScript puro (Fetch), espelhando src/services/api.js do
// projeto React. Mantém o mesmo contrato de endpoints e a injeção de JWT.

const BASE_URL = window.PIXELGAME_API_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'pixelgame_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Erro padronizado: expõe status e o corpo retornado pela API (quando houver).
export class ApiError extends Error {
  constructor(status, data) {
    super((data && (data.message || data.error)) || `Erro ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token expirado/ inválido: limpa sessão e manda para o login.
  if (res.status === 401) {
    clearToken();
    if (!location.pathname.endsWith('login.html')) {
      location.href = 'login.html';
    }
    throw new ApiError(401, null);
  }

  let data = null;
  if (res.status !== 204) {
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }
  }

  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// Decodifica o payload de um JWT sem dependências externas.
export function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ===================== Serviços (mesma API do projeto React) =====================

export const authService = {
  login: (email, senha) => request('POST', '/auth/login', { email, senha }),
  register: (data) => request('POST', '/auth/register', data),
  changePassword: (data) => request('PUT', '/auth/change-password', data),
};

export const gameService = {
  getAll: () => request('GET', '/jogos'),
  getById: (id) => request('GET', `/jogos/${id}`),
  create: (data) => request('POST', '/jogos', data),
  update: (id, data) => request('PUT', `/jogos/${id}`, data),
  remove: (id) => request('DELETE', `/jogos/${id}`),
};

export const categoryService = {
  getAll: () => request('GET', '/categorias'),
  getById: (id) => request('GET', `/categorias/${id}`),
};

export const companyService = {
  getAll: () => request('GET', '/empresas'),
  getById: (id) => request('GET', `/empresas/${id}`),
  create: (data) => request('POST', '/empresas', data),
  update: (id, data) => request('PUT', `/empresas/${id}`, data),
  remove: (id) => request('DELETE', `/empresas/${id}`),
};

export const cartService = {
  get: () => request('GET', '/carrinho/ativo'),
  addItem: (jogoId) => request('POST', '/carrinho/add', { jogoId }),
  removeItem: (gameId) => request('DELETE', `/carrinho/${gameId}`),
};

export const orderService = {
  checkout: () => request('POST', '/vendas/checkout'),
  pay: (metodo, dados) => request('POST', '/vendas/pay', { metodo, dados }),
  getHistory: () => request('GET', '/vendas/'),
};

export const userService = {
  getMyGames: () => request('GET', '/usuarios/my/games'),
};

export const wishlistService = {
  get: () => request('GET', '/lista-desejo'),
  add: (jogoId) => request('POST', '/lista-desejo', { jogoId }),
  remove: (jogoId) => request('DELETE', '/lista-desejo', { jogoId }),
};

export const reviewService = {
  getAll: () => request('GET', '/avaliacoes'),
  getMedia: (jogoId) => request('GET', `/avaliacoes/media/${jogoId}`),
  create: (jogoId, nota, comentario) => request('POST', '/avaliacoes', { jogoId, nota, comentario }),
  update: (jogoId, nota, comentario) => request('PUT', '/avaliacoes', { jogoId, nota, comentario }),
};

export const reportService = {
  jogosMaisVendidos: () => request('GET', '/relatorios/jogos-mais-vendidos'),
};

export const publicService = {
  getJogos: () => request('GET', '/public/jogos'),
};
