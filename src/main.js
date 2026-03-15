import "./style.css";
import { ApiError } from "./api/pokemon-api.js";
import {
	bindUiEvents,
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "./events/ui-events.js";
import { renderPokemonGrid } from "./render/render-pokemon-grid.js";
import { getFirstGenerationPokemon } from "./services/pokemon-service.js";
import {
	hydrateViewState,
	setAllPokemon,
	setCurrentPage,
	setErrorMessage,
	setLoading,
	setSearchTerm,
	setSelectedType,
	state,
} from "./state/state.js";

const SEARCH_DEBOUNCE_MS = 500;
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

function syncUrlState() {
	writeViewStateToUrl({
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
		currentPage: state.currentPage,
	});
}

function renderApp() {
	// O render lê somente o estado já preparado, sem recalcular regra de negócio aqui.
	renderPokemonGrid(appRoot, state);
}

bindUiEvents({
	root: appRoot,
	searchDebounceMs: SEARCH_DEBOUNCE_MS,
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
	onPopState: (viewState) => {
		hydrateViewState(viewState);
		renderApp();
	},
});

async function bootstrap() {
	// O bootstrap reconstrói a navegação antes do fetch para que loading,
	// URL e estado inicial já fiquem coerentes desde o primeiro paint.
	const urlState = readViewStateFromUrl();

	hydrateViewState(urlState);
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
