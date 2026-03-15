import {
	applyPokemonFilters,
	getPokemonTypeOptions,
} from "../logic/filters.js";
import { paginateItems } from "../logic/pagination.js";

function createInitialState() {
	return {
		allPokemon: [],
		filteredPokemon: [],
		visiblePokemon: [],
		typeOptions: getPokemonTypeOptions([]),
		pokemonIndexCache: new Map(),
		pokemonDetailsCache: new Map(),
		pokemonDetailsRequests: new Map(),
		searchTerm: "",
		selectedType: "all",
		currentPage: 1,
		pageSize: 18,
		totalPages: 1,
		activePokemonName: "",
		isPokemonDetailsLoading: false,
		pokemonDetailsErrorMessage: "",
		isLoading: false,
		errorMessage: "",
	};
}

export const state = createInitialState();

function ensureSelectedTypeIsAvailable() {
	// Quando a lista base muda, o tipo presente na URL pode deixar de existir.
	// Nesse caso, a UI recua para "all" para evitar um filtro inválido.
	const availableTypes = new Set(
		state.typeOptions.map((option) => option.value),
	);

	if (!availableTypes.has(state.selectedType)) {
		state.selectedType = "all";
	}
}

function syncFilteredPokemon() {
	// Este é o ponto que mantém o estado derivado consistente:
	// filtros, slice visível, página atual e total de páginas.
	state.filteredPokemon = applyPokemonFilters(state.allPokemon, {
		searchTerm: state.searchTerm,
		selectedType: state.selectedType,
	});

	const pagination = paginateItems(
		state.filteredPokemon,
		state.currentPage,
		state.pageSize,
	);

	state.visiblePokemon = pagination.items;
	state.currentPage = pagination.currentPage;
	state.totalPages = pagination.totalPages;

	if (
		state.activePokemonName &&
		!state.visiblePokemon.some(
			(pokemon) => pokemon.searchName === state.activePokemonName,
		)
	) {
		// Fecha o modal quando o item deixa de existir na página atual,
		// evitando referência visual para um card já oculto.
		closePokemonDetailsModal();
	}
}

function normalizeSearchTerm(value) {
	return value?.trim() ?? "";
}

function normalizeType(value) {
	return value?.trim().toLowerCase() || "all";
}

function normalizePage(value) {
	const page = Number(value);

	return Number.isInteger(page) && page > 0 ? page : 1;
}

function normalizePokemonName(value) {
	return value?.trim().toLowerCase() ?? "";
}

export function resetState() {
	Object.assign(state, createInitialState());
}

export function hydrateViewState({
	searchTerm = "",
	selectedType = "all",
	currentPage = 1,
} = {}) {
	// Reidrata apenas o estado navegável vindo da URL.
	// O estado derivado só é recalculado quando a coleção base já existe.
	state.searchTerm = normalizeSearchTerm(searchTerm);
	state.selectedType = normalizeType(selectedType);
	state.currentPage = normalizePage(currentPage);

	if (state.allPokemon.length > 0) {
		ensureSelectedTypeIsAvailable();
		syncFilteredPokemon();
	}
}

export function setAllPokemon(pokemonList) {
	state.allPokemon = pokemonList;
	state.typeOptions = getPokemonTypeOptions(pokemonList);
	ensureSelectedTypeIsAvailable();
	syncFilteredPokemon();
}

export function setSearchTerm(value) {
	// Busca e filtro sempre voltam para a primeira página
	// para evitar páginas vazias após refinar o resultado.
	state.searchTerm = normalizeSearchTerm(value);
	state.currentPage = 1;
	syncFilteredPokemon();
}

export function setSelectedType(value) {
	state.selectedType = normalizeType(value);
	state.currentPage = 1;
	syncFilteredPokemon();
}

export function setCurrentPage(page) {
	state.currentPage = normalizePage(page);
	syncFilteredPokemon();
}

export function openPokemonDetailsModal(name) {
	state.activePokemonName = normalizePokemonName(name);
	state.isPokemonDetailsLoading = false;
	state.pokemonDetailsErrorMessage = "";
}

export function closePokemonDetailsModal() {
	state.activePokemonName = "";
	state.isPokemonDetailsLoading = false;
	state.pokemonDetailsErrorMessage = "";
}

export function setPokemonDetailsLoading(isLoading) {
	state.isPokemonDetailsLoading = Boolean(isLoading);
}

export function setPokemonDetailsErrorMessage(message = "") {
	state.pokemonDetailsErrorMessage = message;
}

export function setLoading(isLoading) {
	state.isLoading = Boolean(isLoading);
}

export function setErrorMessage(message = "") {
	state.errorMessage = message;
}
