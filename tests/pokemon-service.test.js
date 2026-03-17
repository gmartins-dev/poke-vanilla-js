import { afterEach, describe, expect, it } from "vitest";

import {
	applyPokemonFilters,
	getPokemonTypeOptions,
} from "../src/logic/filters.js";
import {
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "../src/events/ui-events.js";
import { paginateItems } from "../src/logic/pagination.js";
import {
	hydrateViewState,
	resetState,
	setAllPokemon,
	state,
} from "../src/state/state.js";

const pokemonFixture = [
	{
		name: "Bulbasaur",
		searchName: "bulbasaur",
		rawType: "grass",
		type: "Planta",
		number: "#001",
		details: {
			types: [
				{ rawType: "grass", label: "Planta" },
				{ rawType: "poison", label: "Veneno" },
			],
		},
	},
	{
		name: "Charmander",
		searchName: "charmander",
		rawType: "fire",
		type: "Fogo",
		number: "#004",
		details: {
			types: [{ rawType: "fire", label: "Fogo" }],
		},
	},
	{
		name: "Squirtle",
		searchName: "squirtle",
		rawType: "water",
		type: "Água",
		number: "#007",
		details: {
			types: [{ rawType: "water", label: "Água" }],
		},
	},
];

afterEach(() => {
	delete globalThis.window;
	resetState();
});

describe("pokemon logic helpers", () => {
	it("combines search and type filters", () => {
		// Valida o comportamento mais crítico da busca: combinar critérios
		// sem a camada de UI interferir no resultado.
		const result = applyPokemonFilters(pokemonFixture, {
			searchTerm: "char",
			selectedType: "fire",
		});

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("Charmander");
	});

	it("returns translated type options in stable order", () => {
		// Garante previsibilidade visual no select de tipos.
		const result = getPokemonTypeOptions(pokemonFixture);

		expect(result).toEqual([
			{ value: "all", label: "Todos os tipos" },
			{ value: "fire", label: "Fogo" },
			{ value: "grass", label: "Planta" },
			{ value: "poison", label: "Veneno" },
			{ value: "water", label: "Água" },
		]);
	});

	it("considers secondary types during filtering", () => {
		const result = applyPokemonFilters(pokemonFixture, {
			selectedType: "poison",
		});

		expect(result.map((pokemon) => pokemon.name)).toEqual(["Bulbasaur"]);
	});

	it("clamps the page and slices correctly", () => {
		// Confirma que a paginação corrige páginas fora do intervalo
		// antes de devolver os itens visíveis.
		const result = paginateItems(pokemonFixture, 5, 2);

		expect(result.currentPage).toBe(2);
		expect(result.totalPages).toBe(2);
		expect(result.items.map((pokemon) => pokemon.name)).toEqual(["Squirtle"]);
	});
});

describe("state transitions", () => {
	it("preserves the requested page from the URL until data arrives", () => {
		// Esse cenário cobre o bootstrap real: primeiro a URL hidrata o estado,
		// depois a lista chega e o estado derivado é recalculado.
		hydrateViewState({
			searchTerm: "saur",
			selectedType: "grass",
			currentPage: 3,
		});

		expect(state.currentPage).toBe(3);
		expect(state.searchTerm).toBe("saur");
		expect(state.selectedType).toBe("grass");

		setAllPokemon(pokemonFixture);

		expect(state.currentPage).toBe(1);
		expect(state.filteredPokemon.map((pokemon) => pokemon.name)).toEqual([
			"Bulbasaur",
		]);
	});
});

describe("url state helpers", () => {
	it("round-trips search, filter and page values", () => {
		// Mock mínimo de browser para testar a serialização da URL
		// sem depender de ambiente DOM completo.
		globalThis.window = {
			location: {
				search: "",
				pathname: "/",
			},
			history: {
				replaceState: (_state, _title, nextUrl) => {
					const [pathname, search = ""] = nextUrl.split("?");
					globalThis.window.location.pathname = pathname;
					globalThis.window.location.search = search ? `?${search}` : "";
				},
			},
		};

		const browser = globalThis.window;

		writeViewStateToUrl(
			{
				searchTerm: "pikachu",
				selectedType: "electric",
				currentPage: 3,
			},
			browser,
		);

		expect(globalThis.window.location.search).toBe(
			"?search=pikachu&type=electric&page=3",
		);

		expect(readViewStateFromUrl(browser)).toEqual({
			searchTerm: "pikachu",
			selectedType: "electric",
			currentPage: 3,
		});
	});
});
