# PixelGame — Versão HTML/CSS/JS puro

Porte do front-end React (`../src`) para **HTML + CSS + JavaScript puro** (ES Modules + Fetch),
sem nenhuma dependência ou etapa de build. Consome a mesma API REST e reproduz o mesmo
sistema de design e todas as telas.

## Estrutura

```
html/
├── index.html            # Loja (home) — lista de jogos com filtro/busca
├── catalog.html          # Catálogo público (GET /public/jogos)
├── reviews.html          # Avaliações da comunidade (GET /avaliacoes)
├── game.html?id=         # Detalhes do jogo + avaliações
├── login.html            # Login
├── register.html         # Cadastro
├── cart.html             # Carrinho (privado)
├── checkout.html         # Finalizar compra (privado)
├── orders.html           # Minhas compras + biblioteca/chaves (privado)
├── wishlist.html         # Lista de desejos (privado)
├── profile.html          # Meu perfil / alterar senha (privado)
├── reports.html          # Relatório de jogos mais vendidos (admin)
├── admin-games.html      # CRUD de jogos (admin)
├── admin-categories.html # Categorias — somente leitura (admin)
├── admin-companies.html  # CRUD de empresas (admin)
├── css/
│   └── styles.css        # Sistema de design completo (portado do React)
└── js/
    ├── api.js            # Cliente Fetch + JWT + serviços (espelha src/services/api.js)
    ├── common.js         # Navbar, rodapé, toast, modal, paginação, guardas, helpers
    └── pages/            # Um script por página
```

## Como executar

As páginas usam **ES Modules** e **Fetch**, então precisam ser servidas por HTTP
(abrir o arquivo direto via `file://` não funciona). Use qualquer servidor estático:

```bash
# dentro da pasta html/

# Opção 1 — Node (sem instalar nada global)
npx serve .

# Opção 2 — Python
python -m http.server 8080

# Opção 3 — extensão "Live Server" do VS Code (botão "Go Live")
```

Depois acesse, por exemplo, `http://localhost:8080/index.html`.

## Configurar a URL da API

Por padrão o front aponta para `http://localhost:3000/api/v1`. Para mudar, você pode:

- Editar a constante `BASE_URL` no topo de `js/api.js`; **ou**
- Definir `window.PIXELGAME_API_URL` antes dos módulos carregarem (ex.: adicionando
  `<script>window.PIXELGAME_API_URL = 'https://sua-api/api/v1'</script>` no `<head>` da página).

> O back-end precisa estar rodando para as telas com dados funcionarem (login, jogos,
> carrinho, etc.). O token JWT é guardado em `localStorage` sob a chave `pixelgame_token`.

## Diferenças em relação à versão React

- **Sem build**: arquivos estáticos servidos diretamente.
- **Roteamento**: cada tela é um arquivo `.html` próprio (em vez do roteador SPA).
- **Estado/contexto**: a sessão é lida do JWT no `localStorage`; o "badge" do carrinho é
  recarregado a cada página.
- **Bibliotecas substituídas**: `sonner` → toast próprio; `recharts` → gráfico de barras em
  CSS; `react-router` → links/`location`; o modal e a paginação foram reimplementados em JS.
- **Login/Cadastro**: layout simplificado (card centralizado com o mesmo tema), sem as
  imagens de logo da versão React.
