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
