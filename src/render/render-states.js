function loadingSkeletonTemplate() {
	return `
    <article class="animate-pulse rounded-[8px] bg-[#f7f8ff] px-3 py-2.5 sm:px-4 sm:py-3">
      <div class="flex items-center justify-between">
        <span class="h-3 w-12 rounded bg-slate-200"></span>
        <span class="h-3 w-10 rounded bg-slate-200"></span>
      </div>
      <div class="flex h-[84px] items-center justify-center sm:h-[108px] xl:h-[122px]">
        <div class="h-[62px] w-[62px] rounded-full bg-slate-200 sm:h-[78px] sm:w-[78px] xl:h-[92px] xl:w-[92px]"></div>
      </div>
      <div class="mx-auto h-3 w-20 rounded bg-slate-200"></div>
    </article>
  `;
}

export function renderLoadingSkeletons(count) {
	return Array.from({ length: count }, () => loadingSkeletonTemplate()).join(
		"",
	);
}

export function renderFeedbackState({ isLoading, errorMessage, isEmpty }) {
	if (isLoading) {
		return `
      <div role="status" aria-live="polite" class="mt-6 rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
        Carregando pokémons...
      </div>
    `;
	}

	if (errorMessage) {
		return `
      <div role="alert" aria-live="assertive" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        ${errorMessage}
      </div>
    `;
	}

	if (isEmpty) {
		return `
      <div role="status" aria-live="polite" class="mt-6 rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
        Nenhum pokémon encontrado.
      </div>
    `;
	}

	return "";
}
