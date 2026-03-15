export const state = {
	allPokemon: [],
	filteredPokemon: [],
	pokemonIndexCache: new Map(),
	pokemonDetailsCache: new Map(),
	pokemonDetailsRequests: new Map(),
	searchTerm: "",
	selectedType: "all",
	currentPage: 1,
	pageSize: 18,
	totalPages: 1,
};

export function setAllPokemon(pokemonList) {
	state.allPokemon = pokemonList;
	state.filteredPokemon = pokemonList;
	state.totalPages = Math.max(
		1,
		Math.ceil(pokemonList.length / state.pageSize),
	);
}

export function setSearchTerm(value) {
	state.searchTerm = value;
}

export function setSelectedType(value) {
	state.selectedType = value;
}

export function setFilteredPokemon(pokemonList) {
	state.filteredPokemon = pokemonList;
	state.currentPage = 1;
	state.totalPages = Math.max(
		1,
		Math.ceil(pokemonList.length / state.pageSize),
	);
}

export function setCurrentPage(page) {
	state.currentPage = Math.min(Math.max(1, page), state.totalPages);
}

export function setPageSize(pageSize) {
	state.pageSize = pageSize;
	state.totalPages = Math.max(
		1,
		Math.ceil(state.filteredPokemon.length / state.pageSize),
	);
	state.currentPage = Math.min(state.currentPage, state.totalPages);
}
