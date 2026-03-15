function pageButtonTemplate(page, currentPage) {
	const isActive = page === currentPage;
	const sharedClasses =
		"inline-flex h-6 min-w-6 items-center justify-center rounded-[6px] px-1.5 text-[13px] font-medium";

	return `
    <button
      type="button"
      data-role="pagination-page"
      data-page="${page}"
      class="${isActive ? `${sharedClasses} bg-[#34383f] text-white` : `${sharedClasses} text-[#545d73]`}"
      aria-current="${isActive ? "page" : "false"}"
    >
      ${page}
    </button>
  `;
}

function getVisiblePages(currentPage, totalPages, maxVisiblePages = 3) {
	const visibleCount = Math.min(totalPages, maxVisiblePages);
	const startPage = Math.max(
		1,
		Math.min(currentPage - 1, totalPages - visibleCount + 1),
	);

	return Array.from({ length: visibleCount }, (_, index) => startPage + index);
}

export function renderPagination({ currentPage, totalPages }) {
	const pageButtons = getVisiblePages(currentPage, totalPages)
		.map((page) => pageButtonTemplate(page, currentPage))
		.join("");
	const isPreviousDisabled = currentPage <= 1;
	const isNextDisabled = currentPage >= totalPages;

	return `
    <nav class="mt-14 flex flex-wrap items-center justify-center gap-3 text-[13px] font-medium" aria-label="Paginação">
      <button
        type="button"
        data-role="pagination-previous"
        class="inline-flex items-center gap-1 ${isPreviousDisabled ? "text-[#c9cdd7]" : "text-[#656f83]"}"
        ${isPreviousDisabled ? "disabled" : ""}
      >
        <span aria-hidden="true">←</span>
        <span>Anterior</span>
      </button>
      ${pageButtons}
      <button
        type="button"
        data-role="pagination-next"
        class="inline-flex items-center gap-1 ${isNextDisabled ? "text-[#c9cdd7]" : "text-[#31363f]"}"
        ${isNextDisabled ? "disabled" : ""}
      >
        <span>Próximo</span>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  `;
}
