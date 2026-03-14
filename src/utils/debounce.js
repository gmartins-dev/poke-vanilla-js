export function debounce(callback, wait = 250) {
	let timeoutId;

	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => callback(...args), wait);
	};
}
