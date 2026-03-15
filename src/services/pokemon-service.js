import { fetchPokemonDetails, fetchPokemonIndex } from "../api.js";
import { state } from "../state.js";

function formatPokemonDetails(details) {
	return {
		number: `#${String(details.id).padStart(4, "0")}`,
		type: details.types[0]?.type?.name ?? "unknown",
		name: details.name,
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
		pokemon.name.toLowerCase().includes(normalizedTerm),
	);
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
