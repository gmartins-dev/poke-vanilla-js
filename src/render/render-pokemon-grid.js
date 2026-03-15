import pokedexLogo from "../assets/pokedex-logo.png";
import { pokemonCardTemplate } from "../components/pokemon-card.js";
import { renderPagination } from "./render-pagination.js";
import {
	renderFeedbackState,
	renderLoadingSkeletons,
} from "./render-states.js";

function escapeAttribute(value) {
	return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

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

export function renderPokemonGrid(root, viewModel) {
	const cardsMarkup = viewModel.visiblePokemon
		.map((pokemon) => pokemonCardTemplate(pokemon))
		.join("");
	const isEmpty =
		!viewModel.isLoading &&
		!viewModel.errorMessage &&
		viewModel.filteredPokemon.length === 0;
	const shouldShowGrid =
		viewModel.isLoading || viewModel.visiblePokemon.length > 0;
	const gridMarkup = viewModel.isLoading
		? renderLoadingSkeletons(viewModel.pageSize)
		: cardsMarkup;
	const statusMarkup = renderFeedbackState({
		isLoading: viewModel.isLoading,
		errorMessage: viewModel.errorMessage,
		isEmpty,
	});
	const totalResults =
		viewModel.isLoading || viewModel.errorMessage
			? 0
			: viewModel.filteredPokemon.length;

	root.innerHTML = `
    <div class="min-h-screen bg-white text-slate-700">
      <header class="border-b border-[#e8ebf2]">
        <div class="mx-auto flex max-w-[1366px] items-center justify-between px-4 py-3 sm:px-[18px]">
          ${logoTemplate()}
          <nav class="flex items-center gap-1 text-[12px] font-medium" aria-label="Seções principais">
            <a href="#" class="rounded-md bg-[#f2f3f7] px-3 py-1.5 text-[#555d71]">Home</a>
            <a href="#" class="rounded-md px-3 py-1.5 text-[#636b7f]">Pokédex</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-[1366px] px-4 pt-3 pb-8 sm:px-[18px] sm:pt-4 sm:pb-10">
        ${filterControlsTemplate({
					searchTerm: viewModel.searchTerm,
					selectedType: viewModel.selectedType,
					totalResults,
					typeOptions: viewModel.typeOptions,
				})}
        ${statusMarkup}
        ${
					shouldShowGrid
						? `
          <section class="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 lg:grid-cols-6" aria-label="Lista de Pokémon">
            ${gridMarkup}
          </section>
        `
						: ""
				}
        ${
					viewModel.visiblePokemon.length > 0 && viewModel.totalPages > 1
						? renderPagination({
								currentPage: viewModel.currentPage,
								totalPages: viewModel.totalPages,
							})
						: ""
				}
      </main>
    </div>
  `;
}
