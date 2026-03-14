export class ApiError extends Error {
	constructor(message, options = {}) {
		super(message);
		this.name = "ApiError";
		this.kind = options.kind ?? "unknown";
		this.status = options.status ?? null;
		this.cause = options.cause;
	}
}

export async function request(url) {
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
