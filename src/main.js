import "./style.css";
import { bindPaginationEvents, bindSearchEvents } from "./events.js";
import { renderHomeLayout } from "./render/render-home-layout.js";
import {
	filterPokemonByName,
	getFirstGenerationPokemon,
	getPaginatedSlice,
} from "./services/pokemon-service.js";
import {
	setAllPokemon,
	setCurrentPage,
	setFilteredPokemon,
	setSearchTerm,
	state,
} from "./state.js";
import { ApiError } from "./utils/request.js";

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

function renderApp({ isLoading = false, errorMessage = "" } = {}) {
	const paginated = getPaginatedSlice(
		state.filteredPokemon,
		state.currentPage,
		state.pageSize,
	);
	setCurrentPage(paginated.currentPage);

	renderHomeLayout(appRoot, paginated.items, {
		isLoading,
		errorMessage,
		searchTerm: state.searchTerm,
		currentPage: state.currentPage,
		totalPages: paginated.totalPages,
	});

	if (!isLoading && !errorMessage) {
		bindSearchEvents(appRoot, {
			initialValue: state.searchTerm,
			debounceMs: 250,
			onSearch: (rawValue) => {
				setSearchTerm(rawValue);
				const filteredPokemon = filterPokemonByName(state.allPokemon, rawValue);
				setFilteredPokemon(filteredPokemon);
				renderApp();
			},
		});

		bindPaginationEvents(appRoot, {
			currentPage: state.currentPage,
			totalPages: paginated.totalPages,
			onPageChange: (page) => {
				setCurrentPage(page);
				renderApp();
			},
		});
	}
}

async function bootstrap() {
	setFilteredPokemon([]);
	renderApp({ isLoading: true });

	try {
		const pokemonList = await getFirstGenerationPokemon();
		setAllPokemon(pokemonList);
		renderApp();
	} catch (error) {
		renderApp({ errorMessage: getErrorMessage(error) });
	}
}

bootstrap();
