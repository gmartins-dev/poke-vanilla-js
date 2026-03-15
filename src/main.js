import "./style.css";
import {
	bindFilterEvents,
	bindPaginationEvents,
	bindSearchEvents,
} from "./events.js";
import { renderHomeLayout } from "./render/render-home-layout.js";
import {
	applyPokemonFilters,
	getFirstGenerationPokemon,
	getPaginatedSlice,
} from "./services/pokemon-service.js";
import {
	setAllPokemon,
	setCurrentPage,
	setFilteredPokemon,
	setPageSize,
	setSearchTerm,
	setSelectedType,
	state,
} from "./state.js";
import { debounce } from "./utils/debounce.js";
import { ApiError } from "./utils/request.js";
import { getResponsivePageSize } from "./utils/responsive.js";
import {
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "./utils/url-state.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
	throw new Error("App root not found");
}

function getErrorMessage(error) {
	if (!(error instanceof ApiError)) {
		return "Erro inesperado ao carregar os pokémons.";
	}

	if (error.kind === "network") {
		return "Erro de rede. Verifique sua conexão e tente novamente.";
	}

	if (error.kind === "http") {
		return `Erro HTTP (${error.status ?? "desconhecido"}). Tente novamente.`;
	}

	if (error.kind === "parsing") {
		return "Erro ao processar resposta da API. Tente novamente.";
	}

	return "Não foi possível carregar os pokémons. Tente novamente.";
}

function syncResponsivePageSize() {
	const nextPageSize = getResponsivePageSize(window.innerHeight);

	if (state.pageSize === nextPageSize) {
		return false;
	}

	setPageSize(nextPageSize);
	return true;
}

function applyCurrentFilters() {
	const filteredPokemon = applyPokemonFilters(state.allPokemon, {
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
	});

	setFilteredPokemon(filteredPokemon);
}

function syncUrlState() {
	writeViewStateToUrl({
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
		currentPage: state.currentPage,
	});
}

function renderApp({ isLoading = false, errorMessage = "" } = {}) {
	syncResponsivePageSize();

	const paginated = getPaginatedSlice(
		state.filteredPokemon,
		state.currentPage,
		state.pageSize,
	);
	setCurrentPage(paginated.currentPage);

	renderHomeLayout(appRoot, paginated.items, {
		isLoading,
		errorMessage,
		allPokemon: state.allPokemon,
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
		currentPage: state.currentPage,
		totalPages: paginated.totalPages,
		pageSize: state.pageSize,
		totalResults: state.filteredPokemon.length,
	});

	if (!isLoading && !errorMessage) {
		bindSearchEvents(appRoot, {
			initialValue: state.searchTerm,
			debounceMs: 250,
			onSearch: (rawValue) => {
				setSearchTerm(rawValue);
				applyCurrentFilters();
				syncUrlState();
				renderApp();
			},
		});

		bindFilterEvents(appRoot, {
			initialValue: state.selectedType,
			onFilterChange: (value) => {
				setSelectedType(value);
				applyCurrentFilters();
				syncUrlState();
				renderApp();
			},
		});

		bindPaginationEvents(appRoot, {
			currentPage: state.currentPage,
			totalPages: paginated.totalPages,
			onPageChange: (page) => {
				setCurrentPage(page);
				syncUrlState();
				renderApp();
			},
		});
	}
}

const handleViewportResize = debounce(() => {
	if (syncResponsivePageSize()) {
		renderApp();
	}
}, 120);

window.addEventListener("resize", handleViewportResize);
window.addEventListener("popstate", () => {
	const urlState = readViewStateFromUrl();
	setSearchTerm(urlState.searchTerm);
	setSelectedType(urlState.selectedType);
	applyCurrentFilters();
	setCurrentPage(urlState.currentPage);
	renderApp();
});

async function bootstrap() {
	const urlState = readViewStateFromUrl();

	setSearchTerm(urlState.searchTerm);
	setSelectedType(urlState.selectedType);
	setFilteredPokemon([]);
	setCurrentPage(urlState.currentPage);
	renderApp({ isLoading: true });

	try {
		const pokemonList = await getFirstGenerationPokemon();
		setAllPokemon(pokemonList);
		applyCurrentFilters();
		setCurrentPage(urlState.currentPage);
		syncUrlState();
		renderApp();
	} catch (error) {
		renderApp({ errorMessage: getErrorMessage(error) });
	}
}

bootstrap();
