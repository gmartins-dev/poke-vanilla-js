import "./style.css";
import { renderHomeLayout } from "./render/render-home-layout.js";
import { getFirstGenerationPokemon } from "./services/pokemon-service.js";
import { setAllPokemon, state } from "./state.js";
import { ApiError } from "./utils/request.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
	throw new Error("App root not found");
}

function getErrorMessage(error) {
	if (!(error instanceof ApiError)) {
		return "Erro inesperado ao carregar os pokémons.";
	}

	if (error.kind === "network") {
		return "Erro de rede. Verifique sua conexão e tente novamente.";
	}

	if (error.kind === "http") {
		return `Erro HTTP (${error.status ?? "desconhecido"}). Tente novamente.`;
	}

	if (error.kind === "parsing") {
		return "Erro ao processar resposta da API. Tente novamente.";
	}

	return "Não foi possível carregar os pokémons. Tente novamente.";
}

async function bootstrap() {
	renderHomeLayout(appRoot, [], { isLoading: true });

	try {
		const pokemonList = await getFirstGenerationPokemon();
		setAllPokemon(pokemonList);
		renderHomeLayout(appRoot, state.filteredPokemon);
	} catch (error) {
		renderHomeLayout(appRoot, [], {
			errorMessage: getErrorMessage(error),
		});
	}
}

bootstrap();
