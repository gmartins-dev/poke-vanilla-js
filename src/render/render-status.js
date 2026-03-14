export function renderStatus({ isLoading, errorMessage }) {
	if (isLoading) {
		return `
      <div class="mt-6 rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
        Carregando pokémons...
      </div>
    `;
	}

	if (errorMessage) {
		return `
      <div class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        ${errorMessage}
      </div>
    `;
	}

	return "";
}
