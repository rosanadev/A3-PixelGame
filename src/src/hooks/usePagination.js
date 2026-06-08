import { useMemo, useState } from 'react';

/**
 * Paginação no cliente: recebe a lista completa e devolve apenas a
 * fatia da página atual. A página é "clampada" durante a renderização,
 * então se a lista encolher (filtro/remoção) a página volta a um valor
 * válido sem precisar de efeito.
 */
export function usePagination(items, pageSize = 12) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  return { page: currentPage, setPage, totalPages, pageItems };
}
