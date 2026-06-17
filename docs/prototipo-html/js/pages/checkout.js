// Finalizar compra — equivalente a CheckoutPage.jsx.
import { cartService, gameService, orderService } from '../api.js';
import { initLayout, requireAuth, formatPrice, escapeHtml, el } from '../common.js';

if (!requireAuth()) throw new Error('redirecting');
const { main } = initLayout();

const METODOS = [
  { id: 'pix', label: '⚡ Pix' },
  { id: 'boleto', label: '🧾 Boleto' },
];

let items = [];
let metodo = 'pix';

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Finalizar compra</h1></header>
    <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
  </div>
`;
const contentEl = main.querySelector('#content');

loadCart();

async function loadCart() {
  try {
    const data = await cartService.get();
    const itens = data?.carrinho?.itens || [];
    items = await Promise.all(itens.map(async (item) => {
      try { return { ...item, jogo: await gameService.getById(item.fkJogo) }; }
      catch { return { ...item, jogo: null }; }
    }));
    render();
  } catch {
    contentEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar o carrinho.</div>';
  }
}

function render() {
  if (items.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon" aria-hidden="true">🛒</span>
        <p>Seu carrinho está vazio.</p>
        <a href="index.html" class="btn btn-primary mt-1">Explorar jogos</a>
      </div>`;
    return;
  }

  const total = items.reduce((s, i) => s + (Number(i.jogo?.preco) || 0), 0);

  const form = el('<form class="split-layout"></form>');
  const left = el(`
    <div class="card">
      <h2>Pagamento</h2>
      <div class="option-chips mt-1" role="radiogroup" aria-label="Método de pagamento"></div>
      <p class="page-subtitle mt-1" id="metodo-hint"></p>
    </div>
  `);

  const chips = left.querySelector('.option-chips');
  METODOS.forEach((m) => {
    const chip = el(`<button type="button" class="option-chip ${metodo === m.id ? 'active' : ''}" role="radio" aria-checked="${metodo === m.id}">${m.label}</button>`);
    chip.addEventListener('click', () => { metodo = m.id; render(); });
    chips.appendChild(chip);
  });
  left.querySelector('#metodo-hint').textContent = metodo === 'pix'
    ? 'Ao confirmar, um código Pix seria gerado. (pagamento simulado)'
    : 'Ao confirmar, um boleto seria gerado. (pagamento simulado)';

  const aside = el(`
    <aside class="card summary-card" aria-label="Resumo do pedido">
      <h2>Resumo</h2>
      ${items.map((i) => `<div class="summary-line"><span>${escapeHtml(i.jogo?.nome || `Jogo #${i.fkJogo}`)}</span><span>${formatPrice(i.jogo?.preco)}</span></div>`).join('')}
      <div class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn btn-primary" id="pay">Pagar ${formatPrice(total)}</button>
    </aside>
  `);

  form.appendChild(left);
  form.appendChild(aside);
  form.addEventListener('submit', (e) => { e.preventDefault(); pay(total); });

  contentEl.innerHTML = '';
  contentEl.appendChild(form);
}

async function pay(total) {
  const btn = contentEl.querySelector('#pay');
  btn.disabled = true;
  btn.textContent = 'Processando...';
  try {
    await orderService.pay(metodo, {});
    const data = await orderService.checkout();
    if (data?.venda) {
      location.href = 'orders.html?sucesso=1';
    } else {
      showError(data?.message || 'Não foi possível concluir a compra.');
    }
  } catch (err) {
    showError(err.data?.message || 'Erro ao processar o pagamento.');
  } finally {
    btn.disabled = false;
    btn.textContent = `Pagar ${formatPrice(total)}`;
  }
}

function showError(msg) {
  let box = contentEl.querySelector('.alert');
  if (!box) {
    box = el('<div class="alert alert-error" role="alert"></div>');
    contentEl.prepend(box);
  }
  box.textContent = msg;
}
