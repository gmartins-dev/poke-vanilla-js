import pokedexLogo from "../assets/pokedex-logo.png";
import { pokemonDetailsModalTemplate } from "../components/pokemon-details-modal.js";
import { pokemonCardTemplate } from "../components/pokemon-card.js";
import { escapeAttribute } from "../utils/html.js";
import { renderPagination } from "./render-pagination.js";
import {
	renderFeedbackState,
	renderLoadingSkeletons,
} from "./render-states.js";

const runtimeRegions = new WeakMap();

function logoTemplate() {
	return `
    <a href="#" class="inline-flex items-center" aria-label="Página inicial da Pokédex">
      <img src="${pokedexLogo}" alt="Pokédex" class="block h-[38px] w-auto sm:h-[40px]" />
    </a>
  `;
}

function filterControlsTemplate({
	searchTerm,
	selectedType,
	totalResults,
	typeOptions,
}) {
	const safeValue = escapeAttribute(searchTerm);
	const optionsMarkup = typeOptions
		.map(
			(option) => `
        <option value="${option.value}" ${option.value === selectedType ? "selected" : ""}>
          ${option.label}
        </option>
      `,
		)
		.join("");

	return `
    <section class="mx-auto grid w-full max-w-[920px] grid-cols-1 gap-2.5 rounded-[20px] bg-[#fbfcff] px-4 py-3 sm:px-5 sm:py-3.5 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center" aria-label="Controles da pokédex">
      <label class="relative block w-full">
        <span class="sr-only">Buscar Pokémon</span>
        <input
          type="text"
          id="pokemon-search"
          name="pokemon-search"
          data-role="pokemon-search"
          value="${safeValue}"
          placeholder="Faça uma busca pelo nome do pokémon"
          class="h-8 w-full rounded-full border border-transparent bg-[#f3f4fb] px-8 pr-11 text-[12px] font-medium text-[#6b7081] outline-none transition focus:border-[#d8dce8] focus-visible:ring-2 focus-visible:ring-[#d9deef]"
        />
        <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#5c6378]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.3-4.3"></path>
          </svg>
        </span>
      </label>

      <label class="block">
        <span class="sr-only">Filtrar por tipo</span>
        <select
          id="pokemon-type-filter"
          name="pokemon-type-filter"
          data-role="pokemon-type-filter"
          class="w-full rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-[12px] text-[#475569] outline-none transition focus:border-[#cfd7ea] focus-visible:ring-2 focus-visible:ring-[#d9deef]"
        >
          ${optionsMarkup}
        </select>
      </label>

      <p class="text-center text-[12px] font-medium text-[#697488] lg:text-left" role="status" aria-live="polite">
        ${totalResults} pokémon${totalResults === 1 ? "" : "s"} encontrado${totalResults === 1 ? "" : "s"}
      </p>
    </section>
  `;
}

function shellTemplate() {
	return `
    <div class="min-h-screen bg-white text-slate-700">
      <header class="border-b border-[#e8ebf2]">
        <div class="mx-auto flex max-w-[1366px] items-center justify-between px-4 py-3 sm:px-[18px]">
          ${logoTemplate()}
          <nav class="flex items-center gap-1 text-[12px] font-medium" aria-label="Seções principais">
            <a href="#" class="rounded-md bg-[#f2f3f7] px-3 py-1.5 text-[#555d71]">Início</a>
            <a href="#" class="rounded-md px-3 py-1.5 text-[#636b7f]">Pokédex</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-[1366px] px-4 pt-3 pb-8 sm:px-[18px] sm:pt-4 sm:pb-10">
        <div data-region="controls"></div>
        <div data-region="feedback"></div>
        <div data-region="grid"></div>
        <div data-region="pagination"></div>
      </main>
      <div data-region="modal"></div>
    </div>
  `;
}

function getDerivedViewState(viewModel) {
	const activePokemon = viewModel.activePokemonName
		? (viewModel.allPokemon.find(
				(pokemon) => pokemon.searchName === viewModel.activePokemonName,
			) ?? null)
		: null;
	const totalResults =
		viewModel.isLoading || viewModel.errorMessage
			? 0
			: viewModel.filteredPokemon.length;
	const isEmpty =
		!viewModel.isLoading &&
		!viewModel.errorMessage &&
		viewModel.filteredPokemon.length === 0;
	const shouldShowGrid =
		viewModel.isLoading || viewModel.visiblePokemon.length > 0;

	return {
		activePokemon,
		isEmpty,
		shouldShowGrid,
		totalResults,
	};
}

function getRuntime(root) {
	if (runtimeRegions.has(root)) {
		return runtimeRegions.get(root);
	}

	root.innerHTML = shellTemplate();

	const runtime = {
		controls: root.querySelector('[data-region="controls"]'),
		feedback: root.querySelector('[data-region="feedback"]'),
		grid: root.querySelector('[data-region="grid"]'),
		modal: root.querySelector('[data-region="modal"]'),
		pagination: root.querySelector('[data-region="pagination"]'),
		previousSnapshot: null,
	};

	runtimeRegions.set(root, runtime);

	return runtime;
}

function syncControlsRegion(
	runtime,
	viewModel,
	totalResults,
	shouldRemountControls,
) {
	if (shouldRemountControls || !runtime.controls.firstElementChild) {
		runtime.controls.innerHTML = filterControlsTemplate({
			searchTerm: viewModel.searchTerm,
			selectedType: viewModel.selectedType,
			totalResults,
			typeOptions: viewModel.typeOptions,
		});

		return;
	}

	const searchInput = runtime.controls.querySelector(
		'[data-role="pokemon-search"]',
	);
	const typeFilter = runtime.controls.querySelector(
		'[data-role="pokemon-type-filter"]',
	);
	const resultsStatus = runtime.controls.querySelector('[role="status"]');

	if (searchInput && searchInput.value !== viewModel.searchTerm) {
		searchInput.value = viewModel.searchTerm;
	}

	if (typeFilter && typeFilter.value !== viewModel.selectedType) {
		typeFilter.value = viewModel.selectedType;
	}

	if (resultsStatus) {
		resultsStatus.textContent = `${totalResults} pokémon${
			totalResults === 1 ? "" : "s"
		} encontrado${totalResults === 1 ? "" : "s"}`;
	}
}

function createSnapshot(viewModel, derivedState) {
	return {
		searchTerm: viewModel.searchTerm,
		selectedType: viewModel.selectedType,
		typeOptionsKey: viewModel.typeOptions
			.map((option) => `${option.value}:${option.label}`)
			.join("|"),
		totalResults: derivedState.totalResults,
		isLoading: viewModel.isLoading,
		errorMessage: viewModel.errorMessage,
		isEmpty: derivedState.isEmpty,
		visiblePokemonKey: viewModel.visiblePokemon
			.map((pokemon) => pokemon.searchName)
			.join("|"),
		currentPage: viewModel.currentPage,
		totalPages: viewModel.totalPages,
		activePokemonName: viewModel.activePokemonName,
		isPokemonDetailsLoading: viewModel.isPokemonDetailsLoading,
		pokemonDetailsErrorMessage: viewModel.pokemonDetailsErrorMessage,
		activeDetailsReady:
			Boolean(derivedState.activePokemon) &&
			Boolean(
				viewModel.pokemonDetailsCache.get(derivedState.activePokemon.searchName)
					?.details,
			),
	};
}

function renderGridContent(viewModel) {
	if (viewModel.isLoading) {
		return renderLoadingSkeletons(viewModel.pageSize);
	}

	return viewModel.visiblePokemon
		.map((pokemon) =>
			pokemonCardTemplate({
				pokemon,
				isActive: viewModel.activePokemonName === pokemon.searchName,
			}),
		)
		.join("");
}

function buildFullMarkup(viewModel) {
	const derivedState = getDerivedViewState(viewModel);
	const feedbackMarkup = renderFeedbackState({
		isLoading: viewModel.isLoading,
		errorMessage: viewModel.errorMessage,
		isEmpty: derivedState.isEmpty,
	});
	const gridMarkup = derivedState.shouldShowGrid
		? `
          <section class="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 lg:grid-cols-6" aria-label="Lista de Pokémon">
            ${renderGridContent(viewModel)}
          </section>
        `
		: "";
	const paginationMarkup =
		viewModel.visiblePokemon.length > 0 && viewModel.totalPages > 1
			? renderPagination({
					currentPage: viewModel.currentPage,
					totalPages: viewModel.totalPages,
				})
			: "";
	const modalMarkup = derivedState.activePokemon
		? pokemonDetailsModalTemplate({
				pokemon: derivedState.activePokemon,
				details:
					viewModel.pokemonDetailsCache.get(
						derivedState.activePokemon.searchName,
					)?.details ?? null,
				isLoading: viewModel.isPokemonDetailsLoading,
				errorMessage: viewModel.pokemonDetailsErrorMessage,
			})
		: "";

	return `
    <div class="min-h-screen bg-white text-slate-700">
      <header class="border-b border-[#e8ebf2]">
        <div class="mx-auto flex max-w-[1366px] items-center justify-between px-4 py-3 sm:px-[18px]">
          ${logoTemplate()}
          <nav class="flex items-center gap-1 text-[12px] font-medium" aria-label="Seções principais">
            <a href="#" class="rounded-md bg-[#f2f3f7] px-3 py-1.5 text-[#555d71]">Início</a>
            <a href="#" class="rounded-md px-3 py-1.5 text-[#636b7f]">Pokédex</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-[1366px] px-4 pt-3 pb-8 sm:px-[18px] sm:pt-4 sm:pb-10">
        ${filterControlsTemplate({
					searchTerm: viewModel.searchTerm,
					selectedType: viewModel.selectedType,
					totalResults: derivedState.totalResults,
					typeOptions: viewModel.typeOptions,
				})}
        ${feedbackMarkup}
        ${gridMarkup}
        ${paginationMarkup}
      </main>
      ${modalMarkup}
    </div>
  `;
}

function syncExpandedCard(
	root,
	previousActivePokemonName,
	nextActivePokemonName,
) {
	if (
		previousActivePokemonName &&
		previousActivePokemonName !== nextActivePokemonName
	) {
		root
			.querySelector(
				`[data-role="pokemon-card"][data-pokemon-name="${previousActivePokemonName}"]`,
			)
			?.setAttribute("aria-expanded", "false");
	}

	if (nextActivePokemonName) {
		root
			.querySelector(
				`[data-role="pokemon-card"][data-pokemon-name="${nextActivePokemonName}"]`,
			)
			?.setAttribute("aria-expanded", "true");
	}
}

function updateRuntimeRegions(root, runtime, viewModel, derivedState) {
	const previousSnapshot = runtime.previousSnapshot;
	const nextSnapshot = createSnapshot(viewModel, derivedState);

	const shouldUpdateControls =
		!previousSnapshot ||
		previousSnapshot.searchTerm !== nextSnapshot.searchTerm ||
		previousSnapshot.selectedType !== nextSnapshot.selectedType ||
		previousSnapshot.typeOptionsKey !== nextSnapshot.typeOptionsKey ||
		previousSnapshot.totalResults !== nextSnapshot.totalResults;
	const shouldUpdateFeedback =
		!previousSnapshot ||
		previousSnapshot.isLoading !== nextSnapshot.isLoading ||
		previousSnapshot.errorMessage !== nextSnapshot.errorMessage ||
		previousSnapshot.isEmpty !== nextSnapshot.isEmpty;
	const shouldUpdateGrid =
		!previousSnapshot ||
		previousSnapshot.isLoading !== nextSnapshot.isLoading ||
		previousSnapshot.visiblePokemonKey !== nextSnapshot.visiblePokemonKey;
	const shouldUpdatePagination =
		!previousSnapshot ||
		previousSnapshot.visiblePokemonKey !== nextSnapshot.visiblePokemonKey ||
		previousSnapshot.currentPage !== nextSnapshot.currentPage ||
		previousSnapshot.totalPages !== nextSnapshot.totalPages;
	const shouldUpdateModal =
		!previousSnapshot ||
		previousSnapshot.activePokemonName !== nextSnapshot.activePokemonName ||
		previousSnapshot.isPokemonDetailsLoading !==
			nextSnapshot.isPokemonDetailsLoading ||
		previousSnapshot.pokemonDetailsErrorMessage !==
			nextSnapshot.pokemonDetailsErrorMessage ||
		previousSnapshot.activeDetailsReady !== nextSnapshot.activeDetailsReady;

	if (shouldUpdateControls) {
		syncControlsRegion(
			runtime,
			viewModel,
			derivedState.totalResults,
			!previousSnapshot ||
				previousSnapshot.typeOptionsKey !== nextSnapshot.typeOptionsKey,
		);
	}

	if (shouldUpdateFeedback) {
		runtime.feedback.innerHTML = renderFeedbackState({
			isLoading: viewModel.isLoading,
			errorMessage: viewModel.errorMessage,
			isEmpty: derivedState.isEmpty,
		});
	}

	if (shouldUpdateGrid) {
		runtime.grid.innerHTML = derivedState.shouldShowGrid
			? `
          <section class="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 lg:grid-cols-6" aria-label="Lista de Pokémon">
            ${renderGridContent(viewModel)}
          </section>
        `
			: "";
	}

	if (shouldUpdatePagination) {
		runtime.pagination.innerHTML =
			viewModel.visiblePokemon.length > 0 && viewModel.totalPages > 1
				? renderPagination({
						currentPage: viewModel.currentPage,
						totalPages: viewModel.totalPages,
					})
				: "";
	}

	if (shouldUpdateModal) {
		runtime.modal.innerHTML = derivedState.activePokemon
			? pokemonDetailsModalTemplate({
					pokemon: derivedState.activePokemon,
					details:
						viewModel.pokemonDetailsCache.get(
							derivedState.activePokemon.searchName,
						)?.details ?? null,
					isLoading: viewModel.isPokemonDetailsLoading,
					errorMessage: viewModel.pokemonDetailsErrorMessage,
				})
			: "";
	}

	if (
		previousSnapshot?.activePokemonName !== nextSnapshot.activePokemonName &&
		!shouldUpdateGrid
	) {
		// O modal não deve forçar rerender da lista inteira; só atualizamos
		// o estado expandido do card já renderizado.
		syncExpandedCard(
			root,
			previousSnapshot?.activePokemonName ?? "",
			nextSnapshot.activePokemonName,
		);
	}

	runtime.previousSnapshot = nextSnapshot;
}

export function renderPokemonGrid(root, viewModel) {
	// Em runtime real, a aplicação monta uma vez e depois atualiza apenas
	// as regiões afetadas por cada interação.
	if (typeof root.querySelector !== "function") {
		root.innerHTML = buildFullMarkup(viewModel);
		return;
	}

	const runtime = getRuntime(root);
	const derivedState = getDerivedViewState(viewModel);

	updateRuntimeRegions(root, runtime, viewModel, derivedState);
}
