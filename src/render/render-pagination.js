import {
	paginationPageButtonTemplate,
	paginationStepButtonTemplate,
} from "../components/pagination-button.js";

function getVisiblePages(currentPage, totalPages, maxVisiblePages = 3) {
	// Mostra uma janela curta de páginas para manter a paginação compacta
	// mesmo quando o total cresce.
	const visibleCount = Math.min(totalPages, maxVisiblePages);
	const startPage = Math.max(
		1,
		Math.min(currentPage - 1, totalPages - visibleCount + 1),
	);

	return Array.from({ length: visibleCount }, (_, index) => startPage + index);
}

export function renderPagination({ currentPage, totalPages }) {
	const pageButtons = getVisiblePages(currentPage, totalPages)
		.map((page) => paginationPageButtonTemplate(page, currentPage))
		.join("");
	const isPreviousDisabled = currentPage <= 1;
	const isNextDisabled = currentPage >= totalPages;

	return `
    <nav class="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-[13px] font-medium sm:mt-10 sm:gap-3" aria-label="Paginação">
      ${paginationStepButtonTemplate({
				direction: "previous",
				page: Math.max(1, currentPage - 1),
				disabled: isPreviousDisabled,
			})}
      ${pageButtons}
      ${paginationStepButtonTemplate({
				direction: "next",
				page: Math.min(totalPages, currentPage + 1),
				disabled: isNextDisabled,
			})}
    </nav>
  `;
}
