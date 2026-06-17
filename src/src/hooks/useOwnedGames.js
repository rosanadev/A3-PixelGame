import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Retorna o conjunto de ids de jogos que o usuário JÁ COMPROU (têm chave de
// ativação), para impedir a compra do mesmo jogo mais de uma vez.
// Itens apenas no carrinho (sem chave) não contam como comprados.
export function useOwnedGames() {
  const { user } = useAuth();
  const [owned, setOwned] = useState(() => new Set());

  const refresh = useCallback(() => {
    if (!user) {
      setOwned(new Set());
      return;
    }
    userService
      .getMyGames()
      .then((r) => {
        const lista = Array.isArray(r.data) ? r.data : [];
        const ids = lista
          .filter((it) => it.chaveAtivacao)
          .map((it) => it.jogo?.id)
          .filter(Boolean);
        setOwned(new Set(ids));
      })
      .catch(() => setOwned(new Set()));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { owned, refresh };
}
