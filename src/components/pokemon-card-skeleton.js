export function pokemonCardSkeletonTemplate() {
	return `
    <article class="animate-pulse rounded-[8px] bg-[#f7f8ff] px-4 py-3">
      <div class="flex items-center justify-between">
        <span class="h-3 w-12 rounded bg-slate-200"></span>
        <span class="h-3 w-10 rounded bg-slate-200"></span>
      </div>
      <div class="flex h-[122px] items-center justify-center">
        <div class="h-[92px] w-[92px] rounded-full bg-slate-200"></div>
      </div>
      <div class="mx-auto h-3 w-20 rounded bg-slate-200"></div>
    </article>
  `;
}
