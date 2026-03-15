function debounce(callback, delayMs) {
	let timeoutId;

	return (value) => {
		// Mantém apenas a última intenção do usuário em sequências rápidas de input.
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			callback(value);
		}, delayMs);
	};
}

function normalizeSearch(value) {
	return value?.trim() ?? "";
}

function normalizeType(value) {
	return value?.trim().toLowerCase() || "all";
}

function normalizePage(value) {
	const page = Number(value);

	return Number.isInteger(page) && page > 0 ? page : 1;
}

export function readViewStateFromUrl(browser = window) {
	const params = new URLSearchParams(browser.location.search);

	return {
		searchTerm: normalizeSearch(params.get("search")),
		selectedType: normalizeType(params.get("type")),
		currentPage: normalizePage(params.get("page")),
	};
}

export function writeViewStateToUrl(
	{ searchTerm, selectedType, currentPage },
	browser = window,
) {
	// Persiste apenas o estado relevante para navegação e refresh.
	const params = new URLSearchParams(browser.location.search);
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
	const nextUrl = `${browser.location.pathname}${query ? `?${query}` : ""}`;
	browser.history.replaceState({}, "", nextUrl);
}

export function bindUiEvents({
	root,
	onSearchChange,
	onTypeChange,
	onPageChange,
	onPokemonCardOpen,
	onPokemonDetailsClose,
	onPokemonDetailsRetry,
	onPopState,
	searchDebounceMs = 500,
}) {
	const debouncedSearch = debounce(onSearchChange, searchDebounceMs);

	const handleInput = (event) => {
		// Usa delegação para sobreviver a re-renderizações sem rebinding manual.
		const input = event.target.closest('[data-role="pokemon-search"]');

		if (!input) {
			return;
		}

		debouncedSearch(input.value);
	};

	const handleChange = (event) => {
		const select = event.target.closest('[data-role="pokemon-type-filter"]');

		if (!select) {
			return;
		}

		onTypeChange(select.value);
	};

	const handleClick = (event) => {
		const button = event.target.closest(
			'[data-role="pagination-page"], [data-role="pagination-previous"], [data-role="pagination-next"]',
		);

		if (button && !button.disabled) {
			const page = Number(button.dataset.page);

			if (!Number.isNaN(page)) {
				onPageChange(page);
			}

			return;
		}

		const closeButton = event.target.closest(
			'[data-role="pokemon-modal-close"]',
		);

		if (closeButton) {
			onPokemonDetailsClose();
			return;
		}

		const retryButton = event.target.closest(
			'[data-role="pokemon-modal-retry"]',
		);

		if (retryButton) {
			onPokemonDetailsRetry(
				retryButton.dataset.pokemonName ??
					retryButton
						.closest('[data-role="pokemon-modal-dialog"]')
						?.getAttribute("data-pokemon-name") ??
					"",
			);
			return;
		}

		const overlay = event.target.closest('[data-role="pokemon-modal-overlay"]');
		const dialog = event.target.closest('[data-role="pokemon-modal-dialog"]');

		if (overlay && !dialog) {
			onPokemonDetailsClose();
			return;
		}

		const card = event.target.closest('[data-role="pokemon-card"]');

		if (!card) {
			return;
		}

		onPokemonCardOpen(card.dataset.pokemonName ?? "");
	};

	const handleRootKeyDown = (event) => {
		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}

		const card = event.target.closest?.('[data-role="pokemon-card"]');

		if (!card) {
			return;
		}

		event.preventDefault();
		onPokemonCardOpen(card.dataset.pokemonName ?? "");
	};

	const handleWindowKeyDown = (event) => {
		if (event.key === "Escape") {
			onPokemonDetailsClose();
		}
	};

	const handlePopState = () => {
		onPopState(readViewStateFromUrl());
	};

	root.addEventListener("input", handleInput);
	root.addEventListener("change", handleChange);
	root.addEventListener("click", handleClick);
	root.addEventListener("keydown", handleRootKeyDown);
	window.addEventListener("keydown", handleWindowKeyDown);
	window.addEventListener("popstate", handlePopState);

	return () => {
		root.removeEventListener("input", handleInput);
		root.removeEventListener("change", handleChange);
		root.removeEventListener("click", handleClick);
		root.removeEventListener("keydown", handleRootKeyDown);
		window.removeEventListener("keydown", handleWindowKeyDown);
		window.removeEventListener("popstate", handlePopState);
	};
}
