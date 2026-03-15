import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/assets/pokedex-logo.png", () => ({
	default: "/assets/pokedex-logo.png",
}));

import { bindUiEvents } from "../src/events/ui-events.js";
import { renderPokemonGrid } from "../src/render/render-pokemon-grid.js";
import {
	closePokemonDetailsModal,
	hydrateViewState,
	openPokemonDetailsModal,
	resetState,
	setAllPokemon,
	setCurrentPage,
	setPokemonDetailsLoading,
	setSearchTerm,
	setSelectedType,
	state,
} from "../src/state/state.js";

function createPokemon(id, name, rawType) {
	// Fixture pequena, mas com o mesmo shape que o render espera em produção.
	return {
		number: `#${String(id).padStart(3, "0")}`,
		type:
			rawType === "grass"
				? "Planta"
				: rawType === "fire"
					? "Fogo"
					: rawType === "water"
						? "Água"
						: "Normal",
		rawType,
		name,
		searchName: name.toLowerCase(),
		image: `https://img.test/${name.toLowerCase()}.png`,
	};
}

function createPokemonDetails(rawType, typeLabel) {
	return {
		height: "0,7 m",
		weight: "6,9 kg",
		types: [{ rawType, label: typeLabel }],
		abilities: ["Overgrow", "Chlorophyll"],
		stats: [
			{ key: "hp", label: "Vida", value: 45 },
			{ key: "attack", label: "Ataque", value: 49 },
			{ key: "speed", label: "Velocidade", value: 45 },
		],
	};
}

function createRoot() {
	const listeners = new Map();

	return {
		innerHTML: "",
		addEventListener(type, handler) {
			listeners.set(type, handler);
		},
		removeEventListener(type) {
			listeners.delete(type);
		},
		dispatch(type, event) {
			const handler = listeners.get(type);

			if (handler) {
				handler(event);
			}
		},
	};
}

function createWindowMock() {
	const listeners = new Map();

	return {
		location: {
			search: "",
			pathname: "/",
		},
		history: {
			replaceState: (_state, _title, nextUrl) => {
				const [pathname, search = ""] = nextUrl.split("?");
				windowMock.location.pathname = pathname;
				windowMock.location.search = search ? `?${search}` : "";
			},
		},
		addEventListener(type, handler) {
			listeners.set(type, handler);
		},
		removeEventListener(type) {
			listeners.delete(type);
		},
		dispatch(type, event) {
			const handler = listeners.get(type);

			if (handler) {
				handler(event);
			}
		},
		setTimeout: (...args) => globalThis.setTimeout(...args),
		clearTimeout: (...args) => globalThis.clearTimeout(...args),
	};
}

function createClosestTarget(role, options = {}) {
	// Simula apenas a API de DOM usada pela delegação de eventos.
	const target = {
		value: options.value ?? "",
		dataset: options.dataset ?? {},
		disabled: options.disabled ?? false,
	};

	target.closest = (selector) =>
		selector.includes(`[data-role="${role}"]`) ? target : null;

	return target;
}

let windowMock;

beforeEach(() => {
	windowMock = createWindowMock();
	globalThis.window = windowMock;
});

afterEach(() => {
	vi.useRealTimers();
	delete globalThis.window;
	resetState();
});

describe("ui integration", () => {
	it("applies search only after the debounce and rerenders the filtered grid", async () => {
		vi.useFakeTimers();

		const root = createRoot();
		const pokemonList = [
			createPokemon(1, "Bulbasaur", "grass"),
			createPokemon(4, "Charmander", "fire"),
			createPokemon(7, "Squirtle", "water"),
		];

		setAllPokemon(pokemonList);

		const renderApp = () => {
			renderPokemonGrid(root, state);
		};

		renderApp();

		const unbind = bindUiEvents({
			root,
			searchDebounceMs: 500,
			onSearchChange: (value) => {
				setSearchTerm(value);
				renderApp();
			},
			onTypeChange: vi.fn(),
			onPageChange: vi.fn(),
			onPokemonCardOpen: vi.fn(),
			onPokemonDetailsClose: vi.fn(),
			onPokemonDetailsRetry: vi.fn(),
			onPopState: vi.fn(),
		});

		root.dispatch("input", {
			target: createClosestTarget("pokemon-search", {
				value: "char",
			}),
		});

		// Antes do debounce expirar, a UI ainda deve refletir o estado anterior.
		expect(root.innerHTML).toContain("Bulbasaur");
		expect(state.searchTerm).toBe("");

		await vi.advanceTimersByTimeAsync(499);
		expect(state.searchTerm).toBe("");
		expect(root.innerHTML).toContain("Bulbasaur");

		await vi.advanceTimersByTimeAsync(1);
		expect(state.searchTerm).toBe("char");
		expect(root.innerHTML).toContain("Charmander");
		expect(root.innerHTML).not.toContain("Bulbasaur");

		unbind();
	});

	it("moves to the requested page from pagination clicks and rerenders the next slice", () => {
		const root = createRoot();
		const pokemonList = Array.from({ length: 20 }, (_, index) =>
			createPokemon(
				index + 1,
				`Pokemon-${String(index + 1).padStart(3, "0")}`,
				"normal",
			),
		);

		setAllPokemon(pokemonList);

		const renderApp = () => {
			renderPokemonGrid(root, state);
		};

		renderApp();

		const unbind = bindUiEvents({
			root,
			onSearchChange: vi.fn(),
			onTypeChange: vi.fn(),
			onPageChange: (page) => {
				setCurrentPage(page);
				renderApp();
			},
			onPokemonCardOpen: vi.fn(),
			onPokemonDetailsClose: vi.fn(),
			onPokemonDetailsRetry: vi.fn(),
			onPopState: vi.fn(),
		});

		expect(root.innerHTML).toContain("Pokemon-001");
		expect(root.innerHTML).toContain("Pokemon-018");

		root.dispatch("click", {
			target: createClosestTarget("pagination-page", {
				dataset: { page: "2" },
			}),
		});

		// O teste valida o fluxo completo evento -> estado -> render.
		expect(state.currentPage).toBe(2);
		expect(root.innerHTML).toContain("Pokemon-019");
		expect(root.innerHTML).toContain("Pokemon-020");
		expect(root.innerHTML).not.toContain("Pokemon-001");

		unbind();
	});

	it("rehydrates state from the URL on popstate and rerenders matching results", () => {
		const root = createRoot();
		const pokemonList = [
			createPokemon(1, "Bulbasaur", "grass"),
			createPokemon(4, "Charmander", "fire"),
			createPokemon(7, "Squirtle", "water"),
		];

		setAllPokemon(pokemonList);

		const renderApp = () => {
			renderPokemonGrid(root, state);
		};

		renderApp();

		const unbind = bindUiEvents({
			root,
			onSearchChange: (value) => {
				setSearchTerm(value);
				renderApp();
			},
			onTypeChange: (value) => {
				setSelectedType(value);
				renderApp();
			},
			onPageChange: (page) => {
				setCurrentPage(page);
				renderApp();
			},
			onPokemonCardOpen: vi.fn(),
			onPokemonDetailsClose: vi.fn(),
			onPokemonDetailsRetry: vi.fn(),
			onPopState: (viewState) => {
				hydrateViewState(viewState);
				renderApp();
			},
		});

		windowMock.location.search = "?search=squ&type=water&page=1";
		windowMock.dispatch("popstate");

		// Popstate é o ponto em que a navegação do browser precisa reconstruir a tela.
		expect(state.searchTerm).toBe("squ");
		expect(state.selectedType).toBe("water");
		expect(root.innerHTML).toContain("Squirtle");
		expect(root.innerHTML).not.toContain("Bulbasaur");
		expect(root.innerHTML).not.toContain("Charmander");

		unbind();
	});

	it("opens a details modal and swaps the active pokémon correctly", () => {
		const root = createRoot();
		const bulbasaur = createPokemon(1, "Bulbasaur", "grass");
		const charmander = createPokemon(4, "Charmander", "fire");

		setAllPokemon([bulbasaur, charmander]);
		state.pokemonDetailsCache.set("bulbasaur", {
			...bulbasaur,
			details: createPokemonDetails("grass", "Planta"),
		});
		state.pokemonDetailsCache.set("charmander", {
			...charmander,
			details: {
				...createPokemonDetails("fire", "Fogo"),
				abilities: ["Blaze", "Solar Power"],
			},
		});

		const renderApp = () => {
			renderPokemonGrid(root, state);
		};

		renderApp();

		const unbind = bindUiEvents({
			root,
			onSearchChange: vi.fn(),
			onTypeChange: vi.fn(),
			onPageChange: vi.fn(),
			onPokemonCardOpen: (name) => {
				if (state.activePokemonName === name) {
					return;
				}

				openPokemonDetailsModal(name);
				setPokemonDetailsLoading(false);
				renderApp();
			},
			onPokemonDetailsClose: () => {
				closePokemonDetailsModal();
				renderApp();
			},
			onPokemonDetailsRetry: vi.fn(),
			onPopState: vi.fn(),
		});

		root.dispatch("click", {
			target: createClosestTarget("pokemon-card", {
				dataset: { pokemonName: "bulbasaur" },
			}),
		});

		// O modal precisa refletir o pokémon ativo com os detalhes já normalizados.
		expect(state.activePokemonName).toBe("bulbasaur");
		expect(root.innerHTML).toContain('role="dialog"');
		expect(root.innerHTML).toContain("Overgrow");
		expect(root.innerHTML).toContain('data-role="pokemon-modal-dialog"');
		expect(root.innerHTML).toContain('aria-expanded="true"');

		root.dispatch("click", {
			target: createClosestTarget("pokemon-card", {
				dataset: { pokemonName: "charmander" },
			}),
		});

		expect(state.activePokemonName).toBe("charmander");
		expect(root.innerHTML).toContain("Solar Power");
		expect(root.innerHTML).toContain("Velocidade");

		root.dispatch("click", {
			target: createClosestTarget("pokemon-modal-close"),
		});

		expect(state.activePokemonName).toBe("");
		expect(root.innerHTML).not.toContain('role="dialog"');
		expect(root.innerHTML).toContain('aria-expanded="false"');

		unbind();
	});

	it("closes the modal on escape without affecting the current grid", () => {
		const root = createRoot();
		const bulbasaur = createPokemon(1, "Bulbasaur", "grass");

		setAllPokemon([bulbasaur]);
		state.pokemonDetailsCache.set("bulbasaur", {
			...bulbasaur,
			details: createPokemonDetails("grass", "Planta"),
		});

		const renderApp = () => {
			renderPokemonGrid(root, state);
		};

		renderApp();

		const unbind = bindUiEvents({
			root,
			onSearchChange: vi.fn(),
			onTypeChange: vi.fn(),
			onPageChange: vi.fn(),
			onPokemonCardOpen: (name) => {
				openPokemonDetailsModal(name);
				renderApp();
			},
			onPokemonDetailsClose: () => {
				closePokemonDetailsModal();
				renderApp();
			},
			onPokemonDetailsRetry: vi.fn(),
			onPopState: vi.fn(),
		});

		root.dispatch("click", {
			target: createClosestTarget("pokemon-card", {
				dataset: { pokemonName: "bulbasaur" },
			}),
		});

		windowMock.dispatch("keydown", { key: "Escape" });

		expect(state.activePokemonName).toBe("");
		expect(root.innerHTML).toContain("Bulbasaur");
		expect(root.innerHTML).not.toContain('role="dialog"');

		unbind();
	});
});
