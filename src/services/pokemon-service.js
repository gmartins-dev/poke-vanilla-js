import { fetchPokemonDetails, fetchPokemonIndex } from "../api.js";
import { state } from "../state.js";

const SPECIAL_NAME_LABELS = {
	farfetchd: "Farfetch'd",
	"mr-mime": "Mr. Mime",
	"nidoran-f": "Nidoran♀",
	"nidoran-m": "Nidoran♂",
};

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

function formatPokemonNumber(id) {
	return `#${String(id).padStart(3, "0")}`;
}

function formatPokemonName(name) {
	if (SPECIAL_NAME_LABELS[name]) {
		return SPECIAL_NAME_LABELS[name];
	}

	return name
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function formatPokemonType(types) {
	const rawType = types[0]?.type?.name ?? "normal";

	return TYPE_LABELS[rawType] ?? rawType;
}

function formatPokemonDetails(details) {
	const rawType = details.types[0]?.type?.name ?? "normal";

	return {
		number: formatPokemonNumber(details.id),
		type: formatPokemonType(details.types),
		rawType,
		name: formatPokemonName(details.name),
		searchName: details.name,
		image:
			details.sprites.other["official-artwork"].front_default ??
			details.sprites.front_default ??
			"",
	};
}

async function getPokemonDetailsCached(name) {
	const normalizedName = name.toLowerCase();

	if (state.pokemonDetailsCache.has(normalizedName)) {
		return state.pokemonDetailsCache.get(normalizedName);
	}

	if (state.pokemonDetailsRequests.has(normalizedName)) {
		return state.pokemonDetailsRequests.get(normalizedName);
	}

	const detailsRequest = fetchPokemonDetails(normalizedName)
		.then((details) => {
			const formatted = formatPokemonDetails(details);
			state.pokemonDetailsCache.set(normalizedName, formatted);
			return formatted;
		})
		.finally(() => {
			state.pokemonDetailsRequests.delete(normalizedName);
		});

	state.pokemonDetailsRequests.set(normalizedName, detailsRequest);

	return detailsRequest;
}

async function getPokemonIndexCached(limit) {
	if (state.pokemonIndexCache.has(limit)) {
		return state.pokemonIndexCache.get(limit);
	}

	const response = await fetchPokemonIndex(limit);
	const pokemonIndex = response.results ?? [];
	state.pokemonIndexCache.set(limit, pokemonIndex);

	return pokemonIndex;
}

async function resolveInBatches(items, batchSize, mapper) {
	const result = [];

	for (let index = 0; index < items.length; index += batchSize) {
		const slice = items.slice(index, index + batchSize);
		const chunk = await Promise.all(slice.map(mapper));
		result.push(...chunk);
	}

	return result;
}

export async function getFirstGenerationPokemon() {
	if (state.allPokemon.length >= 151) {
		return state.allPokemon;
	}

	const pokemonIndex = await getPokemonIndexCached(151);
	const uniquePokemonIndex = Array.from(
		new Map(pokemonIndex.map((pokemon) => [pokemon.name, pokemon])).values(),
	);

	return resolveInBatches(uniquePokemonIndex, 20, (pokemon) =>
		getPokemonDetailsCached(pokemon.name),
	);
}

export function filterPokemonByName(pokemonList, searchTerm) {
	const normalizedTerm = searchTerm.trim().toLowerCase();

	if (!normalizedTerm) {
		return pokemonList;
	}

	return pokemonList.filter((pokemon) =>
		`${pokemon.searchName} ${pokemon.name}`
			.toLowerCase()
			.includes(normalizedTerm),
	);
}

export function filterPokemonByType(pokemonList, selectedType) {
	if (!selectedType || selectedType === "all") {
		return pokemonList;
	}

	return pokemonList.filter((pokemon) => pokemon.rawType === selectedType);
}

export function applyPokemonFilters(
	pokemonList,
	{ searchTerm = "", selectedType = "all" } = {},
) {
	return filterPokemonByType(
		filterPokemonByName(pokemonList, searchTerm),
		selectedType,
	);
}

export function getPokemonTypeOptions(pokemonList) {
	const availableTypes = new Set(
		pokemonList.map((pokemon) => pokemon.rawType).filter(Boolean),
	);

	return TYPE_ORDER.filter((type) =>
		type === "all" ? true : availableTypes.has(type),
	).map((type) => ({
		value: type,
		label: type === "all" ? "Todos os tipos" : (TYPE_LABELS[type] ?? type),
	}));
}

export function getPaginatedSlice(pokemonList, currentPage, pageSize) {
	const totalPages = Math.max(1, Math.ceil(pokemonList.length / pageSize));
	const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
	const startIndex = (safeCurrentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;

	return {
		items: pokemonList.slice(startIndex, endIndex),
		currentPage: safeCurrentPage,
		totalPages,
	};
}
