# Pokédex Vanilla JS

Implementação do desafio técnico front-end com foco em separação de camadas, JavaScript vanilla e manutenção simples.

## Objetivo

Entregar uma Pokédex interativa com:

- listagem dos 151 pokémons da 1ª geração
- busca sem recarregar a página
- filtro por tipo
- paginação client-side
- sincronização de `search`, `type` e `page` na URL
- responsividade para mobile, tablet e desktop

## Stack

- `Vite v7`
- `Vanilla JavaScript` com `ES Modules`
- `Tailwind CSS v4`
- `Biome`
- `Vitest`

## Arquitetura

Fluxo principal:

`API -> Service -> State -> Render -> Events`

Como as responsabilidades estão separadas:

- `src/api/pokemon-api.js`: comunicação HTTP bruta com a PokéAPI e tratamento técnico de erro.
- `src/services/pokemon-service.js`: cache, normalização dos dados e orquestração do carregamento da 1ª geração.
- `src/state/state.js`: fonte única da verdade para busca, filtro, paginação, status de tela e coleções derivadas.
- `src/logic/filters.js`: regras puras de busca, filtro e derivação das opções de tipo.
- `src/logic/pagination.js`: regras puras de paginação.
- `src/render/`: geração de markup e atualização da UI.
- `src/components/`: unidades reutilizáveis de interface.
- `src/events/ui-events.js`: binding dos eventos do navegador, sincronização da URL e disparo do fluxo de renderização.

## Estrutura

```text
src/
  main.js
  style.css

  api/
    pokemon-api.js

  services/
    pokemon-service.js

  state/
    state.js

  logic/
    filters.js
    pagination.js

  render/
    render-pokemon-grid.js
    render-pagination.js
    render-states.js

  components/
    pagination-button.js
    pokemon-card.js

  events/
    ui-events.js
```

## Decisões de manutenção

- filtros e paginação saíram da camada de serviço para módulos puros e testáveis
- renderização não faz fetch nem calcula regras de negócio
- eventos usam delegação no `#app`, evitando rebinding a cada render
- estado centraliza dados derivados como `filteredPokemon`, `visiblePokemon` e `totalPages`
- cache de índice, detalhes e requests em voo permanece em `Map`

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm exec biome lint .
pnpm exec biome format .
```

## Como rodar

```bash
pnpm install
pnpm dev
```

## Testes

Os testes cobrem:

- filtros combinados
- opções de tipo derivadas
- paginação client-side
- transições de estado
- leitura e escrita do estado na URL
