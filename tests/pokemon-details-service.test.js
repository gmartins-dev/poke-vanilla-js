import { afterEach, describe, expect, it, vi } from "vitest";

const { fetchPokemonDetailsMock, fetchPokemonIndexMock, fetchPokemonTypeMock } =
	vi.hoisted(() => ({
		fetchPokemonDetailsMock: vi.fn(),
		fetchPokemonIndexMock: vi.fn(),
		fetchPokemonTypeMock: vi.fn(),
	}));

vi.mock("../src/api/pokemon-api.js", () => ({
	fetchPokemonDetails: fetchPokemonDetailsMock,
	fetchPokemonIndex: fetchPokemonIndexMock,
	fetchPokemonType: fetchPokemonTypeMock,
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

function createTypeResponse(name, pokemonEntries) {
	return {
		name,
		pokemon: pokemonEntries.map(([pokemonName, slot]) => ({
			pokemon: {
				name: pokemonName,
				url: `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
			},
			slot,
		})),
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
				results: [
					{
						name: "bulbasaur",
						url: "https://pokeapi.co/api/v2/pokemon/1/",
					},
					{ name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
				],
			})
			.mockResolvedValueOnce({
				count: 201,
				results: [
					{ name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
				],
			});
		fetchPokemonTypeMock.mockImplementation((typeName) => {
			switch (typeName) {
				case "grass":
					return Promise.resolve(
						createTypeResponse("grass", [
							["bulbasaur", 1],
							["ivysaur", 1],
							["venusaur", 1],
						]),
					);
				case "poison":
					return Promise.resolve(
						createTypeResponse("poison", [
							["bulbasaur", 2],
							["ivysaur", 2],
							["venusaur", 2],
						]),
					);
				default:
					return Promise.resolve(createTypeResponse(typeName, []));
			}
		});

		const catalog = await getPokemonCatalog();

		// O bootstrap agora usa índice + tipos, deixando detalhes completos
		// para o modal sob demanda.
		expect(fetchPokemonIndexMock).toHaveBeenNthCalledWith(1, 200, 0);
		expect(fetchPokemonIndexMock).toHaveBeenNthCalledWith(2, 200, 200);
		expect(fetchPokemonTypeMock).toHaveBeenCalledTimes(18);
		expect(catalog).toEqual([
			{
				number: "#001",
				type: "Planta",
				rawType: "grass",
				name: "Bulbasaur",
				searchName: "bulbasaur",
				image:
					"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
				details: {
					types: [
						{ rawType: "grass", label: "Planta" },
						{ rawType: "poison", label: "Veneno" },
					],
				},
			},
			{
				number: "#002",
				type: "Planta",
				rawType: "grass",
				name: "Ivysaur",
				searchName: "ivysaur",
				image:
					"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png",
				details: {
					types: [
						{ rawType: "grass", label: "Planta" },
						{ rawType: "poison", label: "Veneno" },
					],
				},
			},
			{
				number: "#003",
				type: "Planta",
				rawType: "grass",
				name: "Venusaur",
				searchName: "venusaur",
				image:
					"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
				details: {
					types: [
						{ rawType: "grass", label: "Planta" },
						{ rawType: "poison", label: "Veneno" },
					],
				},
			},
		]);
		expect(fetchPokemonDetailsMock).not.toHaveBeenCalled();
	});

	it("reuses the lightweight catalog cache without refetching index or types", async () => {
		fetchPokemonIndexMock.mockResolvedValue({
			count: 1,
			results: [
				{ name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
			],
		});
		fetchPokemonTypeMock.mockImplementation((typeName) => {
			if (typeName === "grass") {
				return Promise.resolve(createTypeResponse("grass", [["bulbasaur", 1]]));
			}

			return Promise.resolve(createTypeResponse(typeName, []));
		});

		const firstCatalog = await getPokemonCatalog();
		const secondCatalog = await getPokemonCatalog();

		expect(secondCatalog).toStrictEqual(firstCatalog);
		expect(fetchPokemonIndexMock).toHaveBeenCalledTimes(1);
		expect(fetchPokemonTypeMock).toHaveBeenCalledTimes(18);
	});
});
