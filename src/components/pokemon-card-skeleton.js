export function pokemonCardSkeletonTemplate() {
	return `
    <article class="animate-pulse rounded-md bg-indigo-50 p-3 sm:p-4">
      <div class="flex items-center justify-between">
        <span class="h-3 w-12 rounded bg-slate-200"></span>
        <span class="h-3 w-10 rounded bg-slate-200"></span>
      </div>
      <div class="mx-auto mt-3 h-20 w-20 rounded-full bg-slate-200 sm:h-24 sm:w-24"></div>
      <div class="mx-auto mt-3 h-3 w-20 rounded bg-slate-200"></div>
    </article>
  `;
}
