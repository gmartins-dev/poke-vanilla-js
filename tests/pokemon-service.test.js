import { afterEach, describe, expect, it } from "vitest";

import {
	applyPokemonFilters,
	getPokemonTypeOptions,
} from "../src/logic/filters.js";
import {
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "../src/events/ui-events.js";
import {
	getResponsivePageSize,
	paginateItems,
} from "../src/logic/pagination.js";
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
	},
	{
		name: "Charmander",
		searchName: "charmander",
		rawType: "fire",
		type: "Fogo",
		number: "#004",
	},
	{
		name: "Squirtle",
		searchName: "squirtle",
		rawType: "water",
		type: "Água",
		number: "#007",
	},
];

afterEach(() => {
	delete globalThis.window;
	resetState();
});

describe("pokemon logic helpers", () => {
	it("combines search and type filters", () => {
		const result = applyPokemonFilters(pokemonFixture, {
			searchTerm: "char",
			selectedType: "fire",
		});

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("Charmander");
	});

	it("returns translated type options in stable order", () => {
		const result = getPokemonTypeOptions(pokemonFixture);

		expect(result).toEqual([
			{ value: "all", label: "Todos os tipos" },
			{ value: "fire", label: "Fogo" },
			{ value: "grass", label: "Planta" },
			{ value: "water", label: "Água" },
		]);
	});

	it("clamps the page and slices correctly", () => {
		const result = paginateItems(pokemonFixture, 5, 2);

		expect(result.currentPage).toBe(2);
		expect(result.totalPages).toBe(2);
		expect(result.items.map((pokemon) => pokemon.name)).toEqual(["Squirtle"]);
	});

	it("adapts page size to shorter viewports", () => {
		expect(getResponsivePageSize(780)).toBe(12);
		expect(getResponsivePageSize(900)).toBe(18);
	});
});

describe("state transitions", () => {
	it("preserves the requested page from the URL until data arrives", () => {
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
