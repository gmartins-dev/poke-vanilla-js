const BASE_URL = "https://pokeapi.co/api/v2";

export class ApiError extends Error {
	constructor(message, options = {}) {
		super(message);
		this.name = "ApiError";
		this.kind = options.kind ?? "unknown";
		this.status = options.status ?? null;
		this.cause = options.cause;
	}
}

async function request(path) {
	// Centraliza o tratamento técnico dos requests para a camada de API
	// expor erros coerentes para o restante da aplicação.
	const url = `${BASE_URL}${path}`;
	let response;

	try {
		response = await fetch(url);
	} catch (error) {
		throw new ApiError("Network error while fetching API", {
			kind: "network",
			cause: error,
		});
	}

	if (!response.ok) {
		throw new ApiError(`API error: ${response.status}`, {
			kind: "http",
			status: response.status,
		});
	}

	try {
		return await response.json();
	} catch (error) {
		throw new ApiError("Failed to parse API response", {
			kind: "parsing",
			cause: error,
		});
	}
}

export function fetchPokemonIndex(limit = 151) {
	return request(`/pokemon?limit=${limit}`);
}

export function fetchPokemonDetails(name) {
	return request(`/pokemon/${name}`);
}
