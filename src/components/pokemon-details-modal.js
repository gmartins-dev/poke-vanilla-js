import { escapeAttribute, escapeHtml } from "../utils/html.js";

const TYPE_TEXT_STYLES = {
	bug: "bg-[#eff7c2] text-[#6f7b12]",
	dark: "bg-[#e7ded8] text-[#654f43]",
	dragon: "bg-[#ede5ff] text-[#5d3edb]",
	electric: "bg-[#fff4bf] text-[#9c7a00]",
	fairy: "bg-[#ffe2ec] text-[#ba5777]",
	fighting: "bg-[#ffe1dd] text-[#a2322c]",
	fire: "bg-[#ffe3d1] text-[#c55b1d]",
	flying: "bg-[#e6ebff] text-[#5b64c9]",
	ghost: "bg-[#e7e0f4] text-[#5f4a8c]",
	grass: "bg-[#dbf0d2] text-[#3d7f28]",
	ground: "bg-[#f4e8c9] text-[#8c6820]",
	ice: "bg-[#dff6f8] text-[#2e7f88]",
	normal: "bg-[#ece8dd] text-[#6f6d49]",
	poison: "bg-[#f1dff3] text-[#803f86]",
	psychic: "bg-[#ffdfe9] text-[#c54572]",
	rock: "bg-[#f0e6bf] text-[#816d17]",
	steel: "bg-[#e2e7ed] text-[#546172]",
	water: "bg-[#dfe9ff] text-[#3f62bf]",
};
const TYPE_HERO_STYLES = {
	bug: "from-[#dce77f] via-[#edf6b6] to-[#f8fbec]",
	dark: "from-[#cdbfb7] via-[#ece5e1] to-[#faf8f7]",
	dragon: "from-[#c8bbff] via-[#e7e0ff] to-[#faf8ff]",
	electric: "from-[#f9e17c] via-[#fff1be] to-[#fffaf0]",
	fairy: "from-[#f7bfd2] via-[#ffe4ef] to-[#fff7fb]",
	fighting: "from-[#f6b9ad] via-[#ffe0dc] to-[#fff7f6]",
	fire: "from-[#ffc394] via-[#ffe2d1] to-[#fff7f2]",
	flying: "from-[#cbd5ff] via-[#edf1ff] to-[#fafbff]",
	ghost: "from-[#d1c7ec] via-[#ece7f7] to-[#faf8ff]",
	grass: "from-[#b7dfa4] via-[#e1f1d8] to-[#fbfef9]",
	ground: "from-[#e7d0a3] via-[#f6ead1] to-[#fcfaf5]",
	ice: "from-[#bcecef] via-[#e1f8f9] to-[#f8ffff]",
	normal: "from-[#ddd8c4] via-[#f0ece2] to-[#faf9f4]",
	poison: "from-[#debfeb] via-[#f2e5f6] to-[#fcf8fd]",
	psychic: "from-[#ffbfd2] via-[#ffe4ec] to-[#fff9fb]",
	rock: "from-[#dfd09b] via-[#f3eccd] to-[#fcfbf4]",
	steel: "from-[#ccd4de] via-[#e8edf2] to-[#fafbfc]",
	water: "from-[#bcd0ff] via-[#e4edff] to-[#f8fbff]",
};

function getTypeBadgeClass(rawType) {
	return TYPE_TEXT_STYLES[rawType] ?? "bg-[#dbf0d2] text-[#3d7f28]";
}

function getHeroGradient(rawType) {
	return (
		TYPE_HERO_STYLES[rawType] ?? "from-[#b7dfa4] via-[#e1f1d8] to-[#fbfef9]"
	);
}

function renderTypes(types = []) {
	return types
		.map(
			(type) => `
        <span class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${getTypeBadgeClass(type.rawType)}">
          ${escapeHtml(type.label)}
        </span>
      `,
		)
		.join("");
}

function renderAbilities(abilities = []) {
	return abilities
		.map(
			(ability) => `
        <li class="rounded-full border border-[#e3e7f2] bg-[#f8faff] px-3 py-1.5 text-[11px] font-medium text-[#55617d]">
          ${escapeHtml(ability)}
        </li>
      `,
		)
		.join("");
}

function renderStats(stats = []) {
	return stats
		.map(
			(stat) => `
        <li class="rounded-[14px] border border-[#e5e9f3] bg-[#fbfcff] px-3 py-3 text-center">
          <span class="block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a93a7]">${escapeHtml(stat.label)}</span>
          <strong class="mt-1 block text-[20px] font-semibold text-[#2d3652]">${stat.value}</strong>
        </li>
      `,
		)
		.join("");
}

function renderLoadingState() {
	return `
    <div class="p-5 sm:p-6">
      <div class="space-y-3.5">
        <div class="min-h-[220px] animate-pulse rounded-[24px] bg-[#eef3ff] sm:min-h-[240px]"></div>
        <div class="mx-auto h-6 w-40 animate-pulse rounded-full bg-slate-200"></div>
        <div class="mx-auto h-10 w-52 animate-pulse rounded-full bg-slate-100"></div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="h-18 animate-pulse rounded-[18px] bg-slate-100"></div>
          <div class="h-18 animate-pulse rounded-[18px] bg-slate-100"></div>
        </div>
        <div class="h-20 animate-pulse rounded-[18px] bg-slate-100"></div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="h-20 animate-pulse rounded-[18px] bg-slate-100"></div>
          <div class="h-20 animate-pulse rounded-[18px] bg-slate-100"></div>
          <div class="h-20 animate-pulse rounded-[18px] bg-slate-100"></div>
        </div>
      </div>
    </div>
  `;
}

function renderErrorState(errorMessage, pokemonName, pokemonSearchName) {
	return `
    <div class="flex flex-col items-start gap-4 p-5 sm:p-7">
      <span class="inline-flex rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-semibold text-[#c14f57]">
        Não foi possível carregar os detalhes
      </span>
      <div>
        <h2 id="pokemon-details-modal-title" class="text-[24px] font-semibold text-[#2d3652]">${escapeHtml(pokemonName)}</h2>
        <p class="mt-2 max-w-[42ch] text-[14px] leading-relaxed text-[#62708c]">${escapeHtml(errorMessage)}</p>
      </div>
      <button
        type="button"
        data-role="pokemon-modal-retry"
        data-pokemon-name="${escapeAttribute(pokemonSearchName)}"
        class="inline-flex cursor-pointer items-center rounded-full bg-[#2d3652] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#242c45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9deef]"
      >
        Tentar novamente
      </button>
    </div>
  `;
}

function renderDetailsState({ pokemon, details }) {
	const heroGradient = getHeroGradient(pokemon.rawType);

	return `
    <div>
      <section class="relative overflow-hidden bg-gradient-to-br ${heroGradient} px-5 py-[clamp(1rem,2.6dvh,1.5rem)] text-center sm:px-8">
        <div class="absolute right-[-28px] top-[-28px] h-36 w-36 rounded-full bg-white/35 blur-2xl"></div>
        <div class="relative">
          <span class="inline-flex rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold text-[#5d6780]">
            ${escapeHtml(pokemon.number)}
          </span>
          <h2 id="pokemon-details-modal-title" class="mt-[clamp(0.75rem,1.8dvh,1rem)] text-[clamp(1.9rem,5dvw,2.125rem)] font-semibold tracking-[-0.02em] text-[#27304a]">
            ${escapeHtml(pokemon.name)}
          </h2>

          <div class="mt-[clamp(0.75rem,1.8dvh,1rem)] flex flex-wrap justify-center gap-2">
            ${renderTypes(details.types)}
          </div>

          <div class="mt-[clamp(0.875rem,2.2dvh,1.25rem)] flex justify-center">
            <img
              src="${escapeAttribute(pokemon.image)}"
              alt="${escapeAttribute(pokemon.name)}"
              class="h-[clamp(8.75rem,24dvh,13rem)] w-[clamp(8.75rem,24dvh,13rem)] object-contain drop-shadow-[0_18px_32px_rgba(15,23,42,0.16)]"
            />
          </div>

        </div>
      </section>

      <section class="px-5 py-[clamp(1rem,2.6dvh,1.5rem)] sm:px-8">
        <div class="grid gap-3 sm:grid-cols-2">
          <article class="rounded-[18px] border border-[#e5e9f3] bg-[#fbfcff] px-4 py-3.5">
            <span class="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8a93a7]">Altura</span>
            <strong class="mt-1.5 block text-[clamp(1.125rem,3.1dvw,1.25rem)] font-semibold text-[#2d3652]">${escapeHtml(details.height)}</strong>
          </article>
          <article class="rounded-[18px] border border-[#e5e9f3] bg-[#fbfcff] px-4 py-3.5">
            <span class="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8a93a7]">Peso</span>
            <strong class="mt-1.5 block text-[clamp(1.125rem,3.1dvw,1.25rem)] font-semibold text-[#2d3652]">${escapeHtml(details.weight)}</strong>
          </article>
        </div>

        <section class="mt-4.5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a93a7]">Habilidades</h3>
          </div>
          <ul class="mt-3 flex flex-wrap gap-2">
            ${renderAbilities(details.abilities)}
          </ul>
        </section>

        <section class="mt-5">
          <h3 class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a93a7]">Atributos base</h3>
          <ul class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            ${renderStats(details.stats)}
          </ul>
        </section>
      </section>
    </div>
  `;
}

export function pokemonDetailsModalTemplate({
	pokemon,
	details,
	isLoading = false,
	errorMessage = "",
}) {
	if (!pokemon) {
		return "";
	}

	return `
    <div
      class="fixed inset-0 z-50 overflow-y-auto bg-[#0f172a]/52 px-3 py-4 backdrop-blur-[3px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:py-8"
      data-role="pokemon-modal-overlay"
    >
      <div class="flex min-h-full items-start justify-center sm:items-center">
        <section
          id="pokemon-details-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pokemon-details-modal-title"
          data-role="pokemon-modal-dialog"
          data-pokemon-name="${escapeAttribute(pokemon.searchName)}"
          class="relative my-auto max-h-[calc(100dvh-1.5rem)] w-[min(800px,calc(100dvw-1.5rem))] overflow-y-auto overscroll-contain rounded-[28px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:max-h-[calc(100dvh-3rem)] sm:w-[min(800px,calc(100dvw-3rem))]"
        >
          <button
            type="button"
            data-role="pokemon-modal-close"
            class="absolute top-4 right-4 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/88 text-[#55617d] shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9deef]"
            aria-label="Fechar detalhes do pokémon"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          ${
						isLoading
							? renderLoadingState()
							: errorMessage
								? renderErrorState(
										errorMessage,
										pokemon.name,
										pokemon.searchName,
									)
								: renderDetailsState({ pokemon, details })
					}
        </section>
      </div>
    </div>
  `;
}
