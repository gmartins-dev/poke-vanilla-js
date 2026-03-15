import test from "node:test";
import assert from "node:assert/strict";

import {
	applyPokemonFilters,
	getPaginatedSlice,
	getPokemonTypeOptions,
} from "../src/services/pokemon-service.js";
import { getResponsivePageSize } from "../src/utils/responsive.js";
import {
	readViewStateFromUrl,
	writeViewStateToUrl,
} from "../src/utils/url-state.js";

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

test("applyPokemonFilters combines search and type filters", () => {
	const result = applyPokemonFilters(pokemonFixture, {
		searchTerm: "char",
		selectedType: "fire",
	});

	assert.equal(result.length, 1);
	assert.equal(result[0].name, "Charmander");
});

test("getPokemonTypeOptions returns translated options in stable order", () => {
	const result = getPokemonTypeOptions(pokemonFixture);

	assert.deepEqual(result, [
		{ value: "all", label: "Todos os tipos" },
		{ value: "fire", label: "Fogo" },
		{ value: "grass", label: "Planta" },
		{ value: "water", label: "Água" },
	]);
});

test("getPaginatedSlice clamps the page and slices correctly", () => {
	const result = getPaginatedSlice(pokemonFixture, 5, 2);

	assert.equal(result.currentPage, 2);
	assert.equal(result.totalPages, 2);
	assert.deepEqual(
		result.items.map((pokemon) => pokemon.name),
		["Squirtle"],
	);
});

test("getResponsivePageSize reduces page size on shorter viewports", () => {
	assert.equal(getResponsivePageSize(720), 12);
	assert.equal(getResponsivePageSize(900), 18);
});

test("url state round-trips search, filter and page values", () => {
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

	writeViewStateToUrl({
		searchTerm: "pikachu",
		selectedType: "electric",
		currentPage: 3,
	});

	assert.equal(
		globalThis.window.location.search,
		"?search=pikachu&type=electric&page=3",
	);

	assert.deepEqual(readViewStateFromUrl(), {
		searchTerm: "pikachu",
		selectedType: "electric",
		currentPage: 3,
	});
});
