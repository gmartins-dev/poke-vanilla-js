import { pokemonCardTemplate } from "../components/pokemon-card.js";
import { pokemonCardSkeletonTemplate } from "../components/pokemon-card-skeleton.js";
import { renderStatus } from "./render-status.js";

function escapeAttribute(value) {
	return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function logoTemplate() {
	return `
    <a href="#" class="inline-flex items-center" aria-label="Página inicial da Pokédex">
      <span class="text-3xl font-black tracking-tight text-yellow-300 [text-shadow:_-2px_-2px_0_#1d4ed8,_2px_-2px_0_#1d4ed8,_-2px_2px_0_#1d4ed8,_2px_2px_0_#1d4ed8]">
        Pokédex
      </span>
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
        data-role="pokemon-search"
        value="${safeValue}"
        placeholder="Faça uma busca pelo nome do pokémon"
        class="h-11 w-full rounded-full bg-slate-100 px-6 pr-12 text-sm text-slate-600 outline-none ring-1 ring-transparent placeholder:text-slate-500 focus:ring-slate-300"
      />
      <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.3-4.3"></path>
        </svg>
      </span>
    </label>
  `;
}

function paginationTemplate() {
	return `
    <nav class="mt-12 flex items-center justify-center gap-3 text-sm" aria-label="Paginação">
      <button type="button" class="text-slate-400" aria-disabled="true">← Anterior</button>
      <button type="button" class="h-6 w-6 rounded-md bg-slate-800 text-xs font-semibold text-white">1</button>
      <button type="button" class="text-slate-500">2</button>
      <button type="button" class="text-slate-500">3</button>
      <button type="button" class="text-slate-700">Próximo →</button>
    </nav>
  `;
}

export function renderHomeLayout(
	root,
	pokemonList,
	{ isLoading = false, errorMessage = "", searchTerm = "" } = {},
) {
	const cards = pokemonList
		.map((pokemon) => pokemonCardTemplate(pokemon))
		.join("");
	const skeletons = Array.from({ length: 12 }, () =>
		pokemonCardSkeletonTemplate(),
	).join("");
	const hasResults = cards.length > 0;
	const isEmpty = !isLoading && !errorMessage && !hasResults;
	const statusMarkup = renderStatus({ isLoading, errorMessage, isEmpty });
	const shouldShowGrid = isLoading || hasResults;
	const gridContent = isLoading ? skeletons : cards;

	root.innerHTML = `
    <div class="min-h-screen bg-zinc-100 text-slate-700">
      <header class="border-b border-zinc-300">
        <div class="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 md:px-8">
          ${logoTemplate()}
          <nav class="flex items-center gap-2 text-xs sm:text-sm">
            <a href="#" class="rounded-md bg-zinc-200 px-2.5 py-1.5 text-slate-700">Home</a>
            <a href="#" class="rounded-md px-2.5 py-1.5 text-slate-600">Pokédex</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 md:px-8">
        ${searchTemplate(searchTerm)}

        ${statusMarkup}
        ${
					shouldShowGrid
						? `
          <section class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Lista de Pokémon">
            ${gridContent}
          </section>
        `
						: ""
				}

        ${hasResults ? paginationTemplate() : ""}
      </main>
    </div>
  `;
}
