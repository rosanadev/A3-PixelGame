import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import './AccessibilityBar.css';

export default function AccessibilityBar() {
  const { theme, toggle } = useTheme();
  const { scale, increase, decrease, reset, min, max } = useFontScale();

  // Aciona o widget VLibras (clica no botão de acesso renderizado pelo plugin).
  function openVLibras() {
    const btn = document.querySelector('[vw-access-button]');
    if (btn) {
      btn.click();
    } else {
      toast('VLibras indisponível. Verifique sua conexão e recarregue a página.');
    }
  }

  return (
    <div className="a11y-bar">
      <div className="container a11y-bar__inner">
        <span className="a11y-bar__label">Acessibilidade</span>

        <div className="a11y-bar__group" role="group" aria-label="Tamanho da fonte">
          <button
            type="button"
            className="a11y-btn"
            onClick={decrease}
            disabled={scale <= min}
            aria-label="Diminuir tamanho da fonte"
            title="Diminuir fonte"
          >
            A−
          </button>
          <button
            type="button"
            className="a11y-btn"
            onClick={reset}
            aria-label="Restaurar tamanho padrão da fonte"
            title="Tamanho padrão"
          >
            A
          </button>
          <button
            type="button"
            className="a11y-btn"
            onClick={increase}
            disabled={scale >= max}
            aria-label="Aumentar tamanho da fonte"
            title="Aumentar fonte"
          >
            A+
          </button>
        </div>

        <button
          type="button"
          className="a11y-btn a11y-btn--text"
          onClick={toggle}
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
        </button>

        <button
          type="button"
          className="a11y-btn a11y-btn--text"
          onClick={openVLibras}
          aria-label="Abrir tradução em Libras (VLibras)"
        >
          🤟 Libras
        </button>
      </div>
    </div>
  );
}
