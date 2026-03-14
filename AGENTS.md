# AGENTS.md
## Codex / AI Agent Guidelines — Pokédex Lumis

This repository is designed to be worked on by **Codex CLI or similar agentic coding tools**.
The goal is to maintain **architectural consistency and predictable changes** while implementing the Pokédex.

The project stack is:

- Vite v7
- Vanilla JavaScript (ES Modules)
- Tailwind CSS v4
- Biome (lint + formatter)
- PokéAPI

---

# Core Principles

Agents must prioritize:

1. Simplicity
2. Readability
3. Predictable architecture
4. Minimal dependencies
5. Clear separation of concerns

Do not introduce unnecessary complexity.

---

# Architecture Rules

Agents MUST follow this structure:

src/

  index.html
  main.js

  js/
    state.js
    api.js
    filters.js
    pagination.js
    events.js

    services/
      pokemonService.js

    render/
      renderPokemonList.js
      renderPagination.js
      renderStatus.js

    components/
      pokemonCard.js
      paginationButton.js

Responsibilities:

- state.js → global application state
- api.js → raw API communication
- services → data orchestration and caching
- render → DOM updates
- components → reusable UI pieces

---

# Coding Rules

Agents MUST:

- Use ES Modules
- Avoid global variables
- Keep files small and focused
- Separate UI from logic

Agents MUST NOT:

- Install frameworks (React, Vue, Angular)
- Rewrite unrelated files
- Introduce unnecessary dependencies
- Mix API logic with DOM manipulation

---

# Styling Rules

All layout and styling must be implemented using:

Tailwind CSS v4

Do not create large custom CSS files unless strictly necessary.

---

# API Rules

Primary endpoint:

https://pokeapi.co/api/v2/pokemon?limit=151

Details endpoint:

https://pokeapi.co/api/v2/pokemon/{name}

Agents must implement caching:

state.pokemonDetailsCache = new Map()

Never refetch already cached Pokémon.

---

# State Rules

Application state must remain centralized.

Example structure:

state = {
  allPokemon: [],
  filteredPokemon: [],
  pokemonDetailsCache: new Map(),
  searchTerm: "",
  currentPage: 1,
  pageSize: 12,
  totalPages: 1
}

All rendering must derive from state.

---

# Code Quality

Use Biome for linting and formatting.

Commands:

pnpm biome format .
pnpm biome lint .

Agents should keep the codebase clean and consistent.