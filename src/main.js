import "./style.css";
import { ApiError } from "./api/pokemon-api.js";
import {
	bindUiEvents,
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "./events/ui-events.js";
import { getResponsivePageSize } from "./logic/pagination.js";
import { renderPokemonGrid } from "./render/render-pokemon-grid.js";
import { getFirstGenerationPokemon } from "./services/pokemon-service.js";
import {
	hydrateViewState,
	setAllPokemon,
	setCurrentPage,
	setErrorMessage,
	setLoading,
	setPageSize,
	setSearchTerm,
	setSelectedType,
	state,
} from "./state/state.js";

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

function syncUrlState() {
	writeViewStateToUrl({
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
		currentPage: state.currentPage,
	});
}

function renderApp() {
	renderPokemonGrid(appRoot, state);
}

bindUiEvents({
	root: appRoot,
	onSearchChange: (value) => {
		setSearchTerm(value);
		syncUrlState();
		renderApp();
	},
	onTypeChange: (value) => {
		setSelectedType(value);
		syncUrlState();
		renderApp();
	},
	onPageChange: (page) => {
		setCurrentPage(page);
		syncUrlState();
		renderApp();
	},
	onResize: () => {
		if (!syncResponsivePageSize()) {
			return;
		}

		syncUrlState();
		renderApp();
	},
	onPopState: (viewState) => {
		hydrateViewState(viewState);
		syncResponsivePageSize();
		renderApp();
	},
});

async function bootstrap() {
	const urlState = readViewStateFromUrl();

	hydrateViewState(urlState);
	syncResponsivePageSize();
	setLoading(true);
	setErrorMessage("");
	renderApp();

	try {
		const pokemonList = await getFirstGenerationPokemon();
		setAllPokemon(pokemonList);
		setCurrentPage(urlState.currentPage);
		setLoading(false);
		setErrorMessage("");
		syncUrlState();
		renderApp();
	} catch (error) {
		setLoading(false);
		setErrorMessage(getErrorMessage(error));
		renderApp();
	}
}

bootstrap();
