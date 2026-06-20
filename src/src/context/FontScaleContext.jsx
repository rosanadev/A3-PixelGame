import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FontScaleContext = createContext(null);
const STORAGE_KEY = 'pixelgame_fontscale';
const BASE_PX = 16;
const MIN = 0.9;
const MAX = 1.3;
const STEP = 0.1;

function clamp(v) {
  return Math.min(MAX, Math.max(MIN, Math.round(v * 10) / 10));
}

export function FontScaleProvider({ children }) {
  const [scale, setScale] = useState(() => {
    const saved = parseFloat(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(saved) ? clamp(saved) : 1;
  });

  // Como o app usa unidades rem, mudar o font-size da raiz escala tudo.
  useEffect(() => {
    document.documentElement.style.fontSize = `${BASE_PX * scale}px`;
    localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const increase = useCallback(() => setScale((s) => clamp(s + STEP)), []);
  const decrease = useCallback(() => setScale((s) => clamp(s - STEP)), []);
  const reset = useCallback(() => setScale(1), []);

  return (
    <FontScaleContext.Provider value={{ scale, increase, decrease, reset, min: MIN, max: MAX }}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext);
  if (!ctx) throw new Error('useFontScale deve ser usado dentro de FontScaleProvider');
  return ctx;
}
