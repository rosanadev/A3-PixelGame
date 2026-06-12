// Meu Perfil — equivalente a ProfilePage.jsx (authService.changePassword).
import { authService } from '../api.js';
import { initLayout, requireAuth, logout, escapeHtml, toast } from '../common.js';

const user = requireAuth();
if (!user) throw new Error('redirecting');
const { main } = initLayout();

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Meu Perfil</h1></header>
    <div class="split-layout">
      <section class="card" aria-label="Alterar senha">
        <h2>Alterar senha</h2>
        <p class="page-subtitle">Use uma senha forte com pelo menos 6 caracteres.</p>
        <form id="pwd-form" class="mt-1">
          <div class="form-group">
            <label for="senhaAtual">Senha atual *</label>
            <input id="senhaAtual" type="password" class="input-field" placeholder="Sua senha atual" autocomplete="current-password" required />
          </div>
          <div class="form-group">
            <label for="novaSenha">Nova senha *</label>
            <input id="novaSenha" type="password" class="input-field" placeholder="Mínimo 6 caracteres" autocomplete="new-password" required />
          </div>
          <div class="form-group">
            <label for="confirmar">Confirmar nova senha *</label>
            <input id="confirmar" type="password" class="input-field" placeholder="Repita a nova senha" autocomplete="new-password" required />
          </div>
          <button class="btn btn-primary" id="submit">Alterar senha</button>
        </form>
      </section>
      <aside class="card summary-card" aria-label="Dados da conta">
        <h2>Conta</h2>
        <div class="summary-line"><span>Nome</span><strong>${escapeHtml(user.nome || '—')}</strong></div>
        <div class="summary-line"><span>Perfil</span><strong>${escapeHtml(user.perfil || 'Cliente')}</strong></div>
      </aside>
    </div>
  </div>
`;

const form = main.querySelector('#pwd-form');
const submitBtn = main.querySelector('#submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const senhaAtual = main.querySelector('#senhaAtual').value;
  const novaSenha = main.querySelector('#novaSenha').value;
  const confirmar = main.querySelector('#confirmar').value;

  if (novaSenha.length < 6) { toast('A nova senha deve ter pelo menos 6 caracteres.', 'error'); return; }
  if (novaSenha !== confirmar) { toast('A confirmação não corresponde à nova senha.', 'error'); return; }
  if (novaSenha === senhaAtual) { toast('A nova senha deve ser diferente da atual.', 'error'); return; }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Salvando...';
  try {
    await authService.changePassword({ senhaAtual, novaSenha });
    form.reset();
    toast('Senha alterada com sucesso! Faça login novamente.', 'success');
    setTimeout(() => logout(), 1500);
  } catch (err) {
    if (err.status === 401 || err.status === 400) {
      toast(err.data?.message || 'Senha atual incorreta.', 'error');
    } else {
      toast(err.data?.message || 'Não foi possível alterar a senha.', 'error');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Alterar senha';
  }
});
