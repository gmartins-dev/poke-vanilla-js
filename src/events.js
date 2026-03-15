import { debounce } from "./utils/debounce.js";

export function bindSearchEvents(
	root,
	{ onSearch, initialValue = "", debounceMs = 250 },
) {
	const searchInput = root.querySelector('[data-role="pokemon-search"]');

	if (!searchInput) {
		return;
	}

	searchInput.value = initialValue;
	const debouncedSearch = debounce((value) => onSearch(value), debounceMs);

	searchInput.addEventListener("input", (event) => {
		debouncedSearch(event.target.value);
	});
}

export function bindPaginationEvents(
	root,
	{ currentPage, totalPages, onPageChange },
) {
	const previousButton = root.querySelector(
		'[data-role="pagination-previous"]',
	);
	const nextButton = root.querySelector('[data-role="pagination-next"]');
	const pageButtons = root.querySelectorAll('[data-role="pagination-page"]');

	if (previousButton) {
		previousButton.addEventListener("click", () => {
			onPageChange(Math.max(1, currentPage - 1));
		});
	}

	if (nextButton) {
		nextButton.addEventListener("click", () => {
			onPageChange(Math.min(totalPages, currentPage + 1));
		});
	}

	for (const button of pageButtons) {
		button.addEventListener("click", () => {
			const page = Number(button.dataset.page);

			if (!Number.isNaN(page)) {
				onPageChange(page);
			}
		});
	}
}
