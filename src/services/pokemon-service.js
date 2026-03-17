import { fetchPokemonDetails, fetchPokemonIndex } from "../api/pokemon-api.js";
import { getPokemonTypeLabel } from "../logic/filters.js";
import { state } from "../state/state.js";

const SPECIAL_NAME_LABELS = {
	farfetchd: "Farfetch'd",
	"mr-mime": "Mr. Mime",
	"nidoran-f": "Nidoran♀",
	"nidoran-m": "Nidoran♂",
};
const DETAIL_METRIC_FORMATTER = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
});
const DETAIL_STAT_LABELS = {
	hp: "Vida",
	attack: "Ataque",
	speed: "Velocidade",
};
const DETAIL_STAT_ORDER = ["hp", "attack", "speed"];
const POKEMON_INDEX_PAGE_SIZE = 200;
const POKEMON_DETAILS_BATCH_SIZE = 24;

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

function formatPokemonMetric(value, unit) {
	return `${DETAIL_METRIC_FORMATTER.format(value / 10)} ${unit}`;
}

function formatPokemonTypes(types = []) {
	return [...types]
		.sort((typeA, typeB) => typeA.slot - typeB.slot)
		.map(({ type }) => ({
			rawType: type.name,
			label: getPokemonTypeLabel(type.name),
		}));
}

function formatPokemonAbilities(abilities = []) {
	return [...abilities]
		.sort((abilityA, abilityB) => abilityA.slot - abilityB.slot)
		.map(({ ability }) => formatPokemonName(ability.name));
}

function formatPokemonStats(stats = []) {
	const statsByName = new Map(
		stats.map((entry) => [entry.stat.name, entry.base_stat]),
	);

	return DETAIL_STAT_ORDER.map((statName) => {
		const value = statsByName.get(statName);

		if (typeof value !== "number") {
			return null;
		}

		return {
			key: statName,
			label: DETAIL_STAT_LABELS[statName],
			value,
		};
	}).filter(Boolean);
}

function formatPokemonDetails(details) {
	// O service normaliza o payload bruto da PokéAPI para um formato
	// estável que a UI consegue consumir sem conhecer a estrutura externa.
	const types = formatPokemonTypes(details.types);
	const rawType = types[0]?.rawType ?? "normal";

	return {
		number: formatPokemonNumber(details.id),
		type: getPokemonTypeLabel(rawType),
		rawType,
		name: formatPokemonName(details.name),
		searchName: details.name,
		image:
			details.sprites.other?.["official-artwork"]?.front_default ??
			details.sprites.front_default ??
			"",
		details: {
			height: formatPokemonMetric(details.height, "m"),
			weight: formatPokemonMetric(details.weight, "kg"),
			types,
			abilities: formatPokemonAbilities(details.abilities),
			stats: formatPokemonStats(details.stats),
		},
	};
}

function normalizePokemonName(name) {
	return name?.trim().toLowerCase() ?? "";
}

async function getPokemonDetailsCached(name) {
	const normalizedName = normalizePokemonName(name);

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

function getPokemonIndexCacheKey(limit, offset) {
	return `${limit}:${offset}`;
}

async function getPokemonIndexCached(limit, offset = 0) {
	const cacheKey = getPokemonIndexCacheKey(limit, offset);

	if (state.pokemonIndexCache.has(cacheKey)) {
		return state.pokemonIndexCache.get(cacheKey);
	}

	const response = await fetchPokemonIndex(limit, offset);
	state.pokemonIndexCache.set(cacheKey, response);

	return response;
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

async function getPokemonCatalogIndex() {
	const firstPage = await getPokemonIndexCached(POKEMON_INDEX_PAGE_SIZE, 0);
	const totalCount = firstPage.count ?? firstPage.results?.length ?? 0;
	const remainingOffsets = [];

	for (
		let offset = POKEMON_INDEX_PAGE_SIZE;
		offset < totalCount;
		offset += POKEMON_INDEX_PAGE_SIZE
	) {
		remainingOffsets.push(offset);
	}

	const remainingPages = await Promise.all(
		remainingOffsets.map((offset) =>
			getPokemonIndexCached(POKEMON_INDEX_PAGE_SIZE, offset),
		),
	);

	return [firstPage, ...remainingPages].flatMap((page) => page.results ?? []);
}

export async function getPokemonCatalog() {
	if (state.allPokemon.length > 0) {
		return state.allPokemon;
	}

	const pokemonIndex = await getPokemonCatalogIndex();
	// A PokéAPI já devolve nomes únicos aqui, mas deduplicar mantém
	// o fluxo defensivo caso a origem mude no futuro.
	const uniquePokemonIndex = Array.from(
		new Map(pokemonIndex.map((pokemon) => [pokemon.name, pokemon])).values(),
	);

	return resolveInBatches(
		uniquePokemonIndex,
		POKEMON_DETAILS_BATCH_SIZE,
		(pokemon) => getPokemonDetailsCached(pokemon.name),
	);
}

export function getCachedPokemonDetails(name) {
	const pokemon = state.pokemonDetailsCache.get(normalizePokemonName(name));

	return pokemon?.details ?? null;
}

export async function getPokemonCardDetails(name) {
	const pokemon = await getPokemonDetailsCached(name);

	return pokemon.details;
}
