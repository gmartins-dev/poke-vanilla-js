export function getResponsivePageSize(viewportHeight) {
	return viewportHeight <= 820 ? 12 : 18;
}

export function paginateItems(items, currentPage, pageSize) {
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
