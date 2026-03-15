const TYPE_TEXT_STYLES = {
	bug: "text-lime-500",
	dragon: "text-violet-500",
	electric: "text-amber-500",
	fairy: "text-pink-400",
	fighting: "text-orange-600",
	fire: "text-red-500",
	flying: "text-sky-500",
	ghost: "text-indigo-500",
	grass: "text-emerald-500",
	ground: "text-yellow-700",
	ice: "text-cyan-500",
	normal: "text-stone-500",
	poison: "text-fuchsia-500",
	psychic: "text-rose-500",
	rock: "text-amber-700",
	steel: "text-slate-500",
	water: "text-blue-500",
};

export function pokemonCardTemplate(pokemon) {
	const typeClass = TYPE_TEXT_STYLES[pokemon.rawType] ?? "text-emerald-500";

	return `
    <article class="flex min-h-[198px] flex-col rounded-[8px] bg-[#f7f8ff] px-4 py-3 sm:min-h-[208px]">
      <div class="flex items-center justify-between text-[11px] font-semibold leading-none">
        <span class="${typeClass}">${pokemon.type}</span>
        <span class="text-[#4e5872]">${pokemon.number}</span>
      </div>
      <div class="flex flex-1 items-center justify-center px-2 py-4 sm:py-5">
        <img
          class="block h-[92px] w-[92px] object-contain sm:h-[100px] sm:w-[100px]"
          src="${pokemon.image}"
          alt="${pokemon.name}"
          loading="lazy"
        />
      </div>
      <h3 class="text-center text-[12px] font-semibold text-[#2d3652] sm:text-[13px]">${pokemon.name}</h3>
    </article>
  `;
}
