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
		isLoading: false,
		errorMessage: "",
	};
}

export const state = createInitialState();

function ensureSelectedTypeIsAvailable() {
	const availableTypes = new Set(
		state.typeOptions.map((option) => option.value),
	);

	if (!availableTypes.has(state.selectedType)) {
		state.selectedType = "all";
	}
}

function syncFilteredPokemon() {
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

export function resetState() {
	Object.assign(state, createInitialState());
}

export function hydrateViewState({
	searchTerm = "",
	selectedType = "all",
	currentPage = 1,
} = {}) {
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

export function setPageSize(pageSize) {
	const nextPageSize = Number(pageSize);

	if (!Number.isInteger(nextPageSize) || nextPageSize <= 0) {
		return;
	}

	state.pageSize = nextPageSize;

	if (state.allPokemon.length > 0) {
		syncFilteredPokemon();
	}
}

export function setLoading(isLoading) {
	state.isLoading = Boolean(isLoading);
}

export function setErrorMessage(message = "") {
	state.errorMessage = message;
}
