function normalizeSearch(value) {
	return value?.trim() ?? "";
}

function normalizeType(value) {
	return value?.trim() || "all";
}

function normalizePage(value) {
	const page = Number(value);

	return Number.isInteger(page) && page > 0 ? page : 1;
}

export function readViewStateFromUrl() {
	const params = new URLSearchParams(window.location.search);

	return {
		searchTerm: normalizeSearch(params.get("search")),
		selectedType: normalizeType(params.get("type")),
		currentPage: normalizePage(params.get("page")),
	};
}

export function writeViewStateToUrl({ searchTerm, selectedType, currentPage }) {
	const params = new URLSearchParams(window.location.search);
	const normalizedSearch = normalizeSearch(searchTerm);
	const normalizedType = normalizeType(selectedType);
	const normalizedPage = normalizePage(currentPage);

	if (normalizedSearch) {
		params.set("search", normalizedSearch);
	} else {
		params.delete("search");
	}

	if (normalizedType !== "all") {
		params.set("type", normalizedType);
	} else {
		params.delete("type");
	}

	if (normalizedPage > 1) {
		params.set("page", String(normalizedPage));
	} else {
		params.delete("page");
	}

	const query = params.toString();
	const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
	window.history.replaceState({}, "", nextUrl);
}
