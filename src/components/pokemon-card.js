export function pokemonCardTemplate(pokemon) {
	return `
    <article class="rounded-md bg-indigo-50 p-3 sm:p-4">
      <div class="flex items-center justify-between text-[11px] font-semibold sm:text-xs">
        <span class="text-green-500">${pokemon.type}</span>
        <span class="text-slate-500">${pokemon.number}</span>
      </div>
      <img
        class="mx-auto mt-3 h-20 w-20 object-contain sm:h-24 sm:w-24"
        src="${pokemon.image}"
        alt="${pokemon.name}"
        loading="lazy"
      />
      <h3 class="mt-3 text-center text-xs font-bold text-slate-700 sm:text-sm">${pokemon.name}</h3>
    </article>
  `;
}
