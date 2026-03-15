function pageButtonTemplate(page, currentPage) {
	const isActive = page === currentPage;

	return `
    <button
      type="button"
      data-role="pagination-page"
      data-page="${page}"
      class="${isActive ? "h-6 w-6 rounded-md bg-slate-800 text-xs font-semibold text-white" : "text-slate-500"}"
      aria-current="${isActive ? "page" : "false"}"
    >
      ${page}
    </button>
  `;
}

export function renderPagination({ currentPage, totalPages }) {
	const pageButtons = Array.from({ length: totalPages }, (_, index) =>
		pageButtonTemplate(index + 1, currentPage),
	).join("");
	const isPreviousDisabled = currentPage <= 1;
	const isNextDisabled = currentPage >= totalPages;

	return `
    <nav class="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm" aria-label="Paginação">
      <button
        type="button"
        data-role="pagination-previous"
        class="${isPreviousDisabled ? "text-slate-400" : "text-slate-700"}"
        ${isPreviousDisabled ? "disabled" : ""}
      >
        ← Anterior
      </button>
      ${pageButtons}
      <button
        type="button"
        data-role="pagination-next"
        class="${isNextDisabled ? "text-slate-400" : "text-slate-700"}"
        ${isNextDisabled ? "disabled" : ""}
      >
        Próximo →
      </button>
    </nav>
  `;
}
