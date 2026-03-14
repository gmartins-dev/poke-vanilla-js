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
	if (state.pokemonDetailsCache.has(name)) {
		return state.pokemonDetailsCache.get(name);
	}

	const details = await fetchPokemonDetails(name);
	const formatted = formatPokemonDetails(details);
	state.pokemonDetailsCache.set(name, formatted);

	return formatted;
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
	const indexResponse = await fetchPokemonIndex(151);
	const pokemonIndex = indexResponse.results ?? [];

	return resolveInBatches(pokemonIndex, 20, (pokemon) =>
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
