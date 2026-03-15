import { pokemonCardTemplate } from "../components/pokemon-card.js";
import { pokemonCardSkeletonTemplate } from "../components/pokemon-card-skeleton.js";
import pokedexLogo from "../assets/pokedex-logo.png";
import { renderPagination } from "./render-pagination.js";
import { renderStatus } from "./render-status.js";

const SKELETON_COUNT = 18;

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

function searchTemplate(searchTerm = "") {
	const safeValue = escapeAttribute(searchTerm);

	return `
    <label class="relative mx-auto block w-full max-w-[430px]">
      <span class="sr-only">Buscar Pokémon</span>
      <input
        type="text"
        id="pokemon-search"
        name="pokemon-search"
        data-role="pokemon-search"
        value="${safeValue}"
        placeholder="Faça uma busca pelo nome do pokémon"
        class="h-8 w-full rounded-full border border-transparent bg-[#f3f4fb] px-8 pr-11 text-[12px] font-medium text-[#6b7081] outline-none transition focus:border-[#d8dce8]"
      />
      <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#5c6378]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.3-4.3"></path>
        </svg>
      </span>
    </label>
  `;
}

export function renderHomeLayout(
	root,
	pokemonList,
	{
		isLoading = false,
		errorMessage = "",
		searchTerm = "",
		currentPage = 1,
		totalPages = 1,
	} = {},
) {
	const cards = pokemonList
		.map((pokemon) => pokemonCardTemplate(pokemon))
		.join("");
	const skeletons = Array.from({ length: SKELETON_COUNT }, () =>
		pokemonCardSkeletonTemplate(),
	).join("");
	const hasResults = cards.length > 0;
	const isEmpty = !isLoading && !errorMessage && !hasResults;
	const statusMarkup = renderStatus({ isLoading, errorMessage, isEmpty });
	const shouldShowGrid = isLoading || hasResults;
	const gridContent = isLoading ? skeletons : cards;

	root.innerHTML = `
    <div class="min-h-screen bg-white text-slate-700">
      <header class="border-b border-[#e8ebf2]">
        <div class="mx-auto flex max-w-[1366px] items-center justify-between px-[18px] py-3">
          ${logoTemplate()}
          <nav class="flex items-center gap-1 text-[12px] font-medium">
            <a href="#" class="rounded-md bg-[#f2f3f7] px-3 py-1.5 text-[#555d71]">Home</a>
            <a href="#" class="rounded-md px-3 py-1.5 text-[#636b7f]">Pokédex</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-[1366px] px-[18px] pt-4 pb-10">
        ${searchTemplate(searchTerm)}

        ${statusMarkup}
        ${
					shouldShowGrid
						? `
          <section class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" aria-label="Lista de Pokémon">
            ${gridContent}
          </section>
        `
						: ""
				}

        ${hasResults && totalPages > 1 ? renderPagination({ currentPage, totalPages }) : ""}
      </main>
    </div>
  `;
}
