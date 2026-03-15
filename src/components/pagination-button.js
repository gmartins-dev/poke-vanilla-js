function getSharedClasses() {
	return "inline-flex cursor-pointer items-center justify-center rounded-md px-1 py-1 text-[13px] font-medium focus-visible:ring-2 focus-visible:ring-[#d9deef]";
}

export function paginationPageButtonTemplate(page, currentPage) {
	const isActive = page === currentPage;

	return `
    <button
      type="button"
      data-role="pagination-page"
      data-page="${page}"
      class="${isActive ? `${getSharedClasses()} h-6 min-w-6 rounded-[6px] bg-[#34383f] px-1.5 text-white` : `${getSharedClasses()} h-6 min-w-6 rounded-[6px] px-1.5 text-[#545d73]`}"
      aria-current="${isActive ? "page" : "false"}"
    >
      ${page}
    </button>
  `;
}

export function paginationStepButtonTemplate({
	direction,
	page,
	disabled = false,
}) {
	const isPrevious = direction === "previous";
	const label = isPrevious
		? '<span aria-hidden="true">←</span><span>Anterior</span>'
		: '<span>Próximo</span><span aria-hidden="true">→</span>';
	const textColor = disabled
		? "text-[#c9cdd7]"
		: isPrevious
			? "text-[#656f83]"
			: "text-[#31363f]";

	return `
    <button
      type="button"
      data-role="pagination-${direction}"
      data-page="${page}"
      class="${getSharedClasses()} gap-1 ${textColor} ${disabled ? "cursor-default" : ""}"
      ${disabled ? "disabled" : ""}
      aria-label="${isPrevious ? "Página anterior" : "Próxima página"}"
    >
      ${label}
    </button>
  `;
}
