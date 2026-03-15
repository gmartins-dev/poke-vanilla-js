import { afterEach, describe, expect, it } from "vitest";

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

// Fixture pequena e previsível para validar busca, filtro e paginação
// sem depender de requests externos ou de uma lista muito grande.
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
});

describe("pokemon service helpers", () => {
	it("combines search and type filters", () => {
		// Garante que a busca textual e o filtro por tipo funcionam juntos,
		// retornando apenas os itens que satisfazem os dois critérios.
		const result = applyPokemonFilters(pokemonFixture, {
			searchTerm: "char",
			selectedType: "fire",
		});

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("Charmander");
	});

	it("returns translated type options in stable order", () => {
		// Confirma que as opções do select são geradas com os rótulos em PT-BR
		// e seguem uma ordem estável, útil para manter a UI previsível.
		const result = getPokemonTypeOptions(pokemonFixture);

		expect(result).toEqual([
			{ value: "all", label: "Todos os tipos" },
			{ value: "fire", label: "Fogo" },
			{ value: "grass", label: "Planta" },
			{ value: "water", label: "Água" },
		]);
	});

	it("clamps the page and slices correctly", () => {
		// Verifica se a paginação corrige páginas fora do intervalo válido
		// e devolve apenas o recorte correspondente à página final.
		const result = getPaginatedSlice(pokemonFixture, 5, 2);

		expect(result.currentPage).toBe(2);
		expect(result.totalPages).toBe(2);
		expect(result.items.map((pokemon) => pokemon.name)).toEqual(["Squirtle"]);
	});
});

describe("url state helpers", () => {
	it("round-trips search, filter and page values", () => {
		// Mock mínimo de window para validar a leitura/escrita do estado na URL
		// sem precisar subir navegador real dentro do teste unitário.
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

		// Escreve estado na URL como a aplicação faz em tempo de execução.
		writeViewStateToUrl({
			searchTerm: "pikachu",
			selectedType: "electric",
			currentPage: 3,
		});

		// Depois lê de volta e garante que os helpers preservam os mesmos valores.
		expect(globalThis.window.location.search).toBe(
			"?search=pikachu&type=electric&page=3",
		);

		expect(readViewStateFromUrl()).toEqual({
			searchTerm: "pikachu",
			selectedType: "electric",
			currentPage: 3,
		});
	});
});
