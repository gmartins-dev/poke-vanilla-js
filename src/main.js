import "./style.css";
import faviconUrl from "./assets/favicon.ico";
import { ApiError } from "./api/pokemon-api.js";
import {
	bindUiEvents,
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "./events/ui-events.js";
import { renderPokemonGrid } from "./render/render-pokemon-grid.js";
import {
	getCachedPokemonDetails,
	getFirstGenerationPokemon,
	getPokemonCardDetails,
} from "./services/pokemon-service.js";
import {
	closePokemonDetailsModal,
	hydrateViewState,
	openPokemonDetailsModal,
	setAllPokemon,
	setCurrentPage,
	setErrorMessage,
	setLoading,
	setPokemonDetailsErrorMessage,
	setPokemonDetailsLoading,
	setSearchTerm,
	setSelectedType,
	state,
} from "./state/state.js";

const SEARCH_DEBOUNCE_MS = 500;
const appRoot = document.querySelector("#app");
let previousActivePokemonName = "";

if (!appRoot) {
	throw new Error("App root not found");
}

function ensureAppFavicon() {
	const faviconLink =
		document.querySelector("#app-favicon") ??
		document.head.appendChild(document.createElement("link"));

	faviconLink.setAttribute("id", "app-favicon");
	faviconLink.setAttribute("rel", "icon");
	faviconLink.setAttribute("type", "image/x-icon");
	faviconLink.setAttribute("href", faviconUrl);
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

function getPokemonDetailsErrorMessage(error) {
	if (!(error instanceof ApiError)) {
		return "Erro ao abrir detalhes.";
	}

	if (error.kind === "network") {
		return "Sem conexão para carregar os detalhes.";
	}

	if (error.kind === "http") {
		return `Erro HTTP (${error.status ?? "?"}).`;
	}

	if (error.kind === "parsing") {
		return "Resposta inválida da API.";
	}

	return "Não foi possível carregar os detalhes.";
}

function syncUrlState() {
	writeViewStateToUrl({
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
		currentPage: state.currentPage,
	});
}

function syncModalUiState() {
	document.body.classList.toggle(
		"overflow-hidden",
		Boolean(state.activePokemonName),
	);

	if (
		state.activePokemonName &&
		state.activePokemonName !== previousActivePokemonName
	) {
		appRoot.querySelector('[data-role="pokemon-modal-close"]')?.focus();
	}

	if (!state.activePokemonName && previousActivePokemonName) {
		appRoot
			.querySelector(
				`[data-role="pokemon-card"][data-pokemon-name="${previousActivePokemonName}"]`,
			)
			?.focus();
	}

	previousActivePokemonName = state.activePokemonName;
}

function renderApp() {
	// O render lê somente o estado já preparado, sem recalcular regra de negócio aqui.
	renderPokemonGrid(appRoot, state);
	syncModalUiState();
}

async function openPokemonDetails(name) {
	const normalizedName = name?.trim().toLowerCase();

	if (!normalizedName) {
		return;
	}

	const cachedDetails = getCachedPokemonDetails(normalizedName);

	openPokemonDetailsModal(normalizedName);
	setPokemonDetailsLoading(!cachedDetails);
	setPokemonDetailsErrorMessage("");
	renderApp();

	if (cachedDetails) {
		return;
	}

	try {
		await getPokemonCardDetails(normalizedName);

		if (state.activePokemonName !== normalizedName) {
			return;
		}

		setPokemonDetailsLoading(false);
		setPokemonDetailsErrorMessage("");
		renderApp();
	} catch (error) {
		if (state.activePokemonName !== normalizedName) {
			return;
		}

		setPokemonDetailsLoading(false);
		setPokemonDetailsErrorMessage(getPokemonDetailsErrorMessage(error));
		renderApp();
	}
}

function closePokemonDetails() {
	if (!state.activePokemonName) {
		return;
	}

	closePokemonDetailsModal();
	renderApp();
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
	onPokemonCardOpen: (name) => {
		void openPokemonDetails(name);
	},
	onPokemonDetailsClose: () => {
		closePokemonDetails();
	},
	onPokemonDetailsRetry: (name) => {
		void openPokemonDetails(name);
	},
	onPopState: (viewState) => {
		hydrateViewState(viewState);
		renderApp();
	},
});

ensureAppFavicon();

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
