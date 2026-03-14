import "./style.css";
import { MOCK_POKEMON } from "./data/mock-pokemon.js";
import { renderHomeLayout } from "./render/render-home-layout.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
	throw new Error("App root not found");
}

renderHomeLayout(appRoot, MOCK_POKEMON);
