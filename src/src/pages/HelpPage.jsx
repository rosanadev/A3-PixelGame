import { Link } from 'react-router-dom';
import './Pages.css';

const FAQ = [
  {
    q: 'Como faço para comprar um jogo?',
    a: 'Abra o jogo, clique em "Adicionar ao carrinho" (ou "Comprar agora"), vá ao carrinho e finalize a compra escolhendo Pix, Boleto ou Cartão. O pagamento é simulado para fins de demonstração.',
  },
  {
    q: 'Onde encontro os jogos que comprei e as chaves de ativação?',
    a: 'No menu do seu perfil, em "Minha Biblioteca". Lá ficam os jogos adquiridos e suas chaves de ativação, com a opção de copiar a chave.',
  },
  {
    q: 'Posso comprar o mesmo jogo duas vezes?',
    a: 'Não. Jogos já adquiridos aparecem como "Adquirido" e não podem ser comprados novamente.',
  },
  {
    q: 'Como salvo um jogo para depois?',
    a: 'Passe o mouse sobre o card do jogo e clique no coração para adicioná-lo aos Favoritos. Você revê tudo em "Relembre os seus Favoritos".',
  },
  {
    q: 'Como avalio um jogo?',
    a: 'Na página de detalhes do jogo, dê uma nota de 1 a 5 estrelas e, se quiser, escreva um comentário. Suas avaliações ficam em "Minhas avaliações".',
  },
  {
    q: 'Quais recursos de acessibilidade existem?',
    a: 'No cabeçalho você encontra os controles de tamanho de fonte (A− / A / A+) e a alternância entre modo claro e escuro. O site também tem tradução para Libras (VLibras), navegação por teclado e respeita a preferência de "reduzir movimento" do sistema.',
  },
];

export default function HelpPage() {
  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Ajuda</h1>
          <p className="page-subtitle">Tire suas dúvidas sobre como usar a PixelGame.</p>
        </div>
      </header>

      <section className="card" aria-label="Perguntas frequentes">
        {FAQ.map((item, i) => (
          <details className="help-item" key={i}>
            <summary className="help-question">{item.q}</summary>
            <p className="help-answer">{item.a}</p>
          </details>
        ))}
      </section>

      <p className="page-subtitle mt-1">
        Não encontrou o que procurava? Volte para a <Link to="/">página inicial</Link>.
      </p>
    </div>
  );
}
