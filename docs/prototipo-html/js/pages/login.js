// Login — equivalente a LoginPage.jsx (layout simplificado, mesmo tema).
import { authService, setToken } from '../api.js';
import { initLayout, getCurrentUser, getParam, el } from '../common.js';

// Já logado? Vai para a home.
if (getCurrentUser()) location.href = 'index.html';

const { main } = initLayout();
const redirect = getParam('redirect') || 'index.html';

main.innerHTML = `
  <div class="container auth-wrap">
    <div class="card auth-card">
      <h1>Bem-vindo de volta!</h1>
      <p class="page-subtitle">Conecte-se com seu email</p>
      <div id="alert"></div>
      <form id="login-form" novalidate>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input id="email" type="email" class="input-field" placeholder="exemplo@email.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="senha">Senha</label>
          <input id="senha" type="password" class="input-field" placeholder="Sua senha" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn btn-primary" id="submit" style="width:100%;justify-content:center">Entrar</button>
      </form>
      <p class="auth-switch">Não tem conta? <a href="register.html">Criar conta gratuita</a></p>
    </div>
  </div>
`;

const form = main.querySelector('#login-form');
const alertEl = main.querySelector('#alert');
const submitBtn = main.querySelector('#submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertEl.innerHTML = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Entrando...';
  try {
    const email = main.querySelector('#email').value;
    const senha = main.querySelector('#senha').value;
    const data = await authService.login(email, senha);
    setToken(data.token);
    location.href = redirect;
  } catch (err) {
    let msg = err.data?.message;
    if (err.status === 404) msg = 'Usuário não encontrado.';
    else if (err.status === 401) msg = 'Senha incorreta.';
    showAlert(msg || 'Erro ao tentar entrar. Tente novamente.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';
  }
});

function showAlert(msg) {
  alertEl.innerHTML = '';
  alertEl.appendChild(el(`<div class="alert alert-error" role="alert">${msg}</div>`));
}
