import { afterEach, describe, expect, it, vi } from "vitest";

const { fetchPokemonDetailsMock, fetchPokemonIndexMock } = vi.hoisted(() => ({
	fetchPokemonDetailsMock: vi.fn(),
	fetchPokemonIndexMock: vi.fn(),
}));

vi.mock("../src/api/pokemon-api.js", () => ({
	fetchPokemonDetails: fetchPokemonDetailsMock,
	fetchPokemonIndex: fetchPokemonIndexMock,
}));

import {
	getCachedPokemonDetails,
	getPokemonCatalog,
	getPokemonCardDetails,
} from "../src/services/pokemon-service.js";
import { resetState, state } from "../src/state/state.js";

function createPokemonDetailsResponse({
	id = 1,
	name = "bulbasaur",
	rawTypes = ["grass", "poison"],
} = {}) {
	return {
		id,
		name,
		height: 7,
		weight: 69,
		types: rawTypes.map((rawType, index) => ({
			slot: index + 1,
			type: { name: rawType },
		})),
		abilities: [
			{ slot: 1, ability: { name: "overgrow" } },
			{ slot: 3, ability: { name: "chlorophyll" } },
		],
		stats: [
			{ base_stat: 45, stat: { name: "hp" } },
			{ base_stat: 49, stat: { name: "attack" } },
			{ base_stat: 45, stat: { name: "speed" } },
		],
		sprites: {
			front_default: "https://img.test/front.png",
			other: {
				"official-artwork": {
					front_default: "https://img.test/artwork.png",
				},
			},
		},
	};
}

afterEach(() => {
	vi.clearAllMocks();
	resetState();
});

describe("pokemon detail service", () => {
	it("fetches a pokemon only once and reuses the normalized cache", async () => {
		// O teste garante o contrato principal da feature:
		// detalhes sob demanda sem refetch para o mesmo card.
		fetchPokemonDetailsMock.mockResolvedValue(createPokemonDetailsResponse());

		const firstDetails = await getPokemonCardDetails("bulbasaur");
		const secondDetails = await getPokemonCardDetails("bulbasaur");

		expect(fetchPokemonDetailsMock).toHaveBeenCalledTimes(1);
		expect(firstDetails).toEqual(secondDetails);
		expect(firstDetails).toEqual({
			height: "0,7 m",
			weight: "6,9 kg",
			types: [
				{ rawType: "grass", label: "Planta" },
				{ rawType: "poison", label: "Veneno" },
			],
			abilities: ["Overgrow", "Chlorophyll"],
			stats: [
				{ key: "hp", label: "Vida", value: 45 },
				{ key: "attack", label: "Ataque", value: 49 },
				{ key: "speed", label: "Velocidade", value: 45 },
			],
		});
		expect(getCachedPokemonDetails("bulbasaur")).toEqual(firstDetails);
		expect(state.pokemonDetailsCache.get("bulbasaur")?.name).toBe("Bulbasaur");
	});

	it("fetches the full pokemon catalog across paginated index responses", async () => {
		fetchPokemonIndexMock
			.mockResolvedValueOnce({
				count: 201,
				results: [{ name: "bulbasaur" }, { name: "ivysaur" }],
			})
			.mockResolvedValueOnce({
				count: 201,
				results: [{ name: "venusaur" }],
			});
		fetchPokemonDetailsMock.mockImplementation((name) =>
			Promise.resolve(
				createPokemonDetailsResponse({
					id: name === "bulbasaur" ? 1 : name === "ivysaur" ? 2 : 3,
					name,
					rawTypes: ["grass", "poison"],
				}),
			),
		);

		const catalog = await getPokemonCatalog();

		// Garante que o service percorre o índice inteiro antes de resolver
		// os detalhes, sem ficar preso ao recorte antigo da primeira geração.
		expect(fetchPokemonIndexMock).toHaveBeenNthCalledWith(1, 200, 0);
		expect(fetchPokemonIndexMock).toHaveBeenNthCalledWith(2, 200, 200);
		expect(catalog.map((pokemon) => pokemon.name)).toEqual([
			"Bulbasaur",
			"Ivysaur",
			"Venusaur",
		]);
		expect(fetchPokemonDetailsMock).toHaveBeenCalledTimes(3);
	});
});
