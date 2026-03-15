import { fetchPokemonDetails, fetchPokemonIndex } from "../api/pokemon-api.js";
import { getPokemonTypeLabel } from "../logic/filters.js";
import { state } from "../state/state.js";

const SPECIAL_NAME_LABELS = {
	farfetchd: "Farfetch'd",
	"mr-mime": "Mr. Mime",
	"nidoran-f": "Nidoran♀",
	"nidoran-m": "Nidoran♂",
};

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

function formatPokemonDetails(details) {
	// O service normaliza o payload bruto da PokéAPI para um formato
	// estável que a UI consegue consumir sem conhecer a estrutura externa.
	const rawType = details.types[0]?.type?.name ?? "normal";

	return {
		number: formatPokemonNumber(details.id),
		type: getPokemonTypeLabel(rawType),
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

	// Evita duplicar requests concorrentes para o mesmo pokémon
	// enquanto o primeiro fetch ainda está em andamento.
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

	// Faz o carregamento em lotes para reduzir explosão de concorrência
	// sem abrir mão da paralelização dentro de cada bloco.
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
	// A PokéAPI já devolve nomes únicos aqui, mas deduplicar mantém
	// o fluxo defensivo caso a origem mude no futuro.
	const uniquePokemonIndex = Array.from(
		new Map(pokemonIndex.map((pokemon) => [pokemon.name, pokemon])).values(),
	);

	return resolveInBatches(uniquePokemonIndex, 20, (pokemon) =>
		getPokemonDetailsCached(pokemon.name),
	);
}
