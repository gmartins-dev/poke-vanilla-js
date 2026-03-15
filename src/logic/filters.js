const TYPE_LABELS = {
	bug: "Inseto",
	dragon: "Dragão",
	electric: "Elétrico",
	fairy: "Fada",
	fighting: "Lutador",
	fire: "Fogo",
	flying: "Voador",
	ghost: "Fantasma",
	grass: "Planta",
	ground: "Terra",
	ice: "Gelo",
	normal: "Normal",
	poison: "Veneno",
	psychic: "Psíquico",
	rock: "Pedra",
	steel: "Aço",
	water: "Água",
};

const TYPE_ORDER = [
	"all",
	"bug",
	"dragon",
	"electric",
	"fairy",
	"fighting",
	"fire",
	"flying",
	"ghost",
	"grass",
	"ground",
	"ice",
	"normal",
	"poison",
	"psychic",
	"rock",
	"steel",
	"water",
];

function normalizeSearchTerm(value) {
	return value?.trim().toLowerCase() ?? "";
}

function normalizeType(value) {
	return value?.trim().toLowerCase() || "all";
}

export function getPokemonTypeLabel(type) {
	return TYPE_LABELS[type] ?? type;
}

export function filterPokemonByName(pokemonList, searchTerm) {
	const normalizedSearch = normalizeSearchTerm(searchTerm);

	if (!normalizedSearch) {
		return pokemonList;
	}

	return pokemonList.filter((pokemon) =>
		`${pokemon.searchName} ${pokemon.name}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
}

export function filterPokemonByType(pokemonList, selectedType) {
	const normalizedType = normalizeType(selectedType);

	if (normalizedType === "all") {
		return pokemonList;
	}

	return pokemonList.filter((pokemon) => pokemon.rawType === normalizedType);
}

export function applyPokemonFilters(
	pokemonList,
	{ searchTerm = "", selectedType = "all" } = {},
) {
	// Encadeia filtros simples e previsíveis para manter a lógica testável.
	return filterPokemonByType(
		filterPokemonByName(pokemonList, searchTerm),
		selectedType,
	);
}

export function getPokemonTypeOptions(pokemonList) {
	const availableTypes = new Set(
		pokemonList.map((pokemon) => pokemon.rawType).filter(Boolean),
	);

	// A ordem é fixa para a UI não "saltar" conforme a lista filtrada muda.
	return TYPE_ORDER.filter((type) =>
		type === "all" ? true : availableTypes.has(type),
	).map((type) => ({
		value: type,
		label: type === "all" ? "Todos os tipos" : getPokemonTypeLabel(type),
	}));
}
