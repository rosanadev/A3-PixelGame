// Cadastro — equivalente a RegisterPage.jsx (layout simplificado, mesmo tema).
import { authService } from '../api.js';
import { initLayout, getCurrentUser, el } from '../common.js';

if (getCurrentUser()) location.href = 'index.html';

const { main } = initLayout();

main.innerHTML = `
  <div class="container auth-wrap">
    <div class="card auth-card">
      <h1>Criar conta</h1>
      <p class="page-subtitle">Preencha os dados para se cadastrar</p>
      <div id="alert"></div>
      <form id="register-form" novalidate>
        <div class="form-group">
          <label for="nome">Nome completo *</label>
          <input id="nome" type="text" class="input-field" placeholder="Seu nome" autocomplete="name" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail *</label>
          <input id="email" type="email" class="input-field" placeholder="exemplo@email.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="dataNascimento">Data de nascimento</label>
          <input id="dataNascimento" type="date" class="input-field" />
          <small class="form-hint">Opcional</small>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="senha">Senha *</label>
            <input id="senha" type="password" class="input-field" placeholder="Mínimo 6 caracteres" autocomplete="new-password" required />
          </div>
          <div class="form-group">
            <label for="confirmar">Confirmar senha *</label>
            <input id="confirmar" type="password" class="input-field" placeholder="Repita a senha" autocomplete="new-password" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="submit" style="width:100%;justify-content:center">Criar conta</button>
      </form>
      <p class="auth-switch">Já tem conta? <a href="login.html">Entrar</a></p>
    </div>
  </div>
`;

const form = main.querySelector('#register-form');
const alertEl = main.querySelector('#alert');
const submitBtn = main.querySelector('#submit');

function formatDate(value) {
  if (!value) return '';
  const [ano, mes, dia] = value.split('-');
  return `${dia}/${mes}/${ano}`;
}

function showAlert(msg, type = 'error') {
  alertEl.innerHTML = '';
  alertEl.appendChild(el(`<div class="alert alert-${type}" role="alert">${msg}</div>`));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertEl.innerHTML = '';

  const nome = main.querySelector('#nome').value;
  const email = main.querySelector('#email').value;
  const senha = main.querySelector('#senha').value;
  const confirmar = main.querySelector('#confirmar').value;
  const dataNascimento = main.querySelector('#dataNascimento').value;

  if (senha !== confirmar) { showAlert('As senhas não coincidem.'); return; }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Criando conta...';
  try {
    await authService.register({ nome, email, senha, dataNascimento: formatDate(dataNascimento) });
    showAlert('Conta criada com sucesso! Redirecionando para o login...', 'success');
    setTimeout(() => { location.href = 'login.html'; }, 2000);
  } catch (err) {
    let msg = err.data?.message;
    if (err.status === 409) msg = 'Este e-mail já está cadastrado.';
    else if (err.status === 400) msg = msg || 'Preencha todos os campos obrigatórios.';
    showAlert(msg || 'Erro ao criar conta. Tente novamente.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Criar conta';
  }
});
