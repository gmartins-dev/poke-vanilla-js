
# ARCHITECTURE.md

## Arquitetura da Pokédex

A aplicação segue uma arquitetura modular para manter o código simples e escalável.

Stack:

- Vite v7
- Tailwind CSS v4
- Vanilla JavaScript
- Biome

---

# Camadas da Aplicação

UI (HTML + Tailwind)
↓
Render Layer
↓
Application State
↓
Services
↓
PokéAPI

---

# Estado Global

Arquivo:

state.js

state = {
  allPokemon: [],
  filteredPokemon: [],
  pokemonDetailsCache: new Map(),
  searchTerm: "",
  currentPage: 1,
  pageSize: 12,
  totalPages: 1
}

---

# API

api.js

Endpoints:

https://pokeapi.co/api/v2/pokemon?limit=151
https://pokeapi.co/api/v2/pokemon/{name}

---

# Services

services/pokemonService.js

Responsável por:

- cache
- formatação de dados
- integração com API

---

# Render

render/

renderPokemonList.js
renderPagination.js
renderStatus.js

---

# Components

components/

pokemonCard.js
paginationButton.js

---

# Eventos

events.js

- busca
- paginação

---

# Estilização

Tailwind CSS v4

---

# Qualidade de Código

Biome

- lint
- format
