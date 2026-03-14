const BASE_POKEMON = {
	number: "#1001",
	type: "Planta",
	name: "Bulbasauro",
	image:
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
};

export const MOCK_POKEMON = Array.from({ length: 18 }, () => ({
	...BASE_POKEMON,
}));
