import { escapeAttribute, escapeHtml } from "../utils/html.js";

const TYPE_TEXT_STYLES = {
	bug: "text-[#A8B820]",
	dragon: "text-[#7038F8]",
	electric: "text-[#C5A500]",
	fairy: "text-[#E08AA3]",
	fighting: "text-[#C03028]",
	fire: "text-[#F08030]",
	flying: "text-[#7C6AE6]",
	ghost: "text-[#705898]",
	grass: "text-[#59A63A]",
	ground: "text-[#B58B2A]",
	ice: "text-[#3FA3AE]",
	normal: "text-[#8A8A59]",
	poison: "text-[#A040A0]",
	psychic: "text-[#F85888]",
	rock: "text-[#9A8624]",
	steel: "text-[#6F7A8A]",
	water: "text-[#517BDE]",
};

function getTypeClass(rawType) {
	return TYPE_TEXT_STYLES[rawType] ?? "text-[#59A63A]";
}

export function pokemonCardTemplate({ pokemon, isActive = false }) {
	const safeName = escapeAttribute(pokemon.searchName);

	return `
    <article
      class="group flex min-h-[152px] cursor-pointer flex-col rounded-[12px] bg-[#f7f8ff] px-3 py-2.5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9deef] sm:min-h-[170px] sm:px-4 sm:py-3 xl:min-h-[188px]"
      data-role="pokemon-card"
      data-pokemon-name="${safeName}"
      tabindex="0"
      role="button"
      aria-haspopup="dialog"
      aria-controls="pokemon-details-modal"
      aria-expanded="${isActive}"
      aria-label="Abrir detalhes de ${escapeAttribute(pokemon.name)}"
    >
      <div class="flex items-center justify-between text-[11px] font-semibold leading-none">
        <span class="${getTypeClass(pokemon.rawType)}">${escapeHtml(pokemon.type)}</span>
        <span class="text-[#4e5872]">${escapeHtml(pokemon.number)}</span>
      </div>
      <div class="flex flex-1 items-center justify-center px-1 py-2.5 sm:px-2 sm:py-4 xl:py-5">
        <img
          class="block h-[62px] w-[62px] object-contain transition duration-200 group-hover:scale-[1.03] sm:h-[78px] sm:w-[78px] xl:h-[92px] xl:w-[92px]"
          src="${escapeAttribute(pokemon.image)}"
          alt="${escapeAttribute(pokemon.name)}"
          loading="lazy"
        />
      </div>
      <h3 class="text-center text-[11px] font-semibold text-[#2d3652] sm:text-[12px] xl:text-[13px]">${escapeHtml(pokemon.name)}</h3>
    </article>
  `;
}
