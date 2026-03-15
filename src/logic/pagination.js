export function paginateItems(items, currentPage, pageSize) {
	// A paginação sempre protege a página atual para evitar índices inválidos
	// quando a quantidade de itens muda por busca ou filtro.
	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
	const startIndex = (safeCurrentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;

	return {
		items: items.slice(startIndex, endIndex),
		currentPage: safeCurrentPage,
		totalPages,
	};
}
