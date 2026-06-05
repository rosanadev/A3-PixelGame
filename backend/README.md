# API de Vendas de Jogos Digitais

## 1. Descrição

Uma API RESTful para gerenciar uma loja de jogos digitais.

### 1.1 Funcionalidades Gerais

- Autenticação e autorização via JWT (perfis cliente e administrador).
- Registro, login e alteração de senha de usuários.
- Criação, edição, remoção e listagem de empresas (apenas admin).
- Criação, edição, remoção e listagem de categorias (apenas admin).
- Criação, edição, remoção e listagem de jogos (apenas admin).
- Listagem pública de jogos.
- Detalhamento de jogo específico.
- Lista de desejos (wishlist) por usuário.
- Carrinho de compras: adicionar/remover itens e listar itens.
- Finalizar venda: cálculo do valor total, geração de chaves de ativação, marcação do carrinho como finalizado e registro da venda.
- Simulação de pagamentos via métodos de cartão de crédito, pix e boleto.
- Histórico de compras do usuário (vendas e chaves de ativação associadas).
- Avaliações de jogos: nota (1–5) e comentário; média de avaliações e contagem de comentários; suporte a marcação de spoilers (em construção).

## 2. Requisitos Funcionais da API

### 2.1. Autenticação e Autorização

RF01 – Permitir cadastro de usuário com: nome completo, e-mail, senha, data de nascimento.

RF02 – Permitir login de usuário com e-mail e senha.

RF03 – Diferenciar perfis de acesso: cliente e administrador.

RF04 – Autenticação baseada em JWT.

### 2.2. Jogos

RF01 – Cadastrar jogo (apenas admin) com: título, descrição, categoria, preço, ano de lançamento, desenvolvedora.

RF02 – Listar todos os jogos com filtros por: categoria e palavras-chave no título/descrição.

RF03 – Detalhar um jogo específico.

RF04 – Permitir ao usuário adicionar jogos à lista de desejos.

RF05 – Permitir ao usuário adicionar jogos ao carrinho.

RF06 – Permitir listar todas as categorias.

RF07 – Buscar uma categoria específica.

### 2.3. Vendas

RF01 – Finalizar venda (simulação de pagamento).

RF01 – Consultar histórico de compras do usuário.

RF02 – Gerar uma chave de ativação automaticamente.

### 2.4. Avaliações do Jogo

RF01 – Usuários podem avaliar jogos com nota (1–5) e comentário.

RF02 – API disponibilizará média de avaliações e quantidade de comentários.

RF03 – Comentários devem permitir marcação de spoilers (EM CONSTRUÇÃO).

## 3. Requisitos Não Funcionais

A API fornecerá informações de modo a forçar o frontend a trabalhar com:

RNF01 – Exibição de mensagens claras de erro (ex.: campos obrigatórios, senha fraca, e-mail já cadastrado).

RNF02 – Retornar códigos HTTP adequados (200, 201, 400, 401, 403, 404, 422, 500).

RNF03 – Retornar mensagens de validação detalhadas em JSON legível (exemplo: "error": "Senha deve ter pelo menos 8 caracteres").

RNF04 – Suporte a paginação e ordenação em listagens (EM CONSTRUÇÃO).

RNF05 – API deve retornar mensagens de confirmação em operações sensíveis (ex.: exclusão de conta, remoção de item do carrinho).

## 4. Protocolos e Tecnologias

- Node.js
- Protocolo: HTTP/HTTPS
- Formato de dados: JSON
- Autenticação: JWT
- Padrão de API: RESTful
- Versionamento: /api/v1/...
- Banco de dados: SQLite

## 5. Como rodar (local)

1. Copiar `.env.example` para `.env` e ajustar variáveis (ex.: DB_NAME, JWT_SECRET).
2. Instalar dependências:
   npm install
3. Rodar a aplicação:
   npm start