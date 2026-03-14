import { request } from "./utils/request.js";

const BASE_URL = "https://pokeapi.co/api/v2";

export function fetchPokemonIndex(limit = 151) {
	return request(`${BASE_URL}/pokemon?limit=${limit}`);
}

export function fetchPokemonDetails(name) {
	return request(`${BASE_URL}/pokemon/${name}`);
}
