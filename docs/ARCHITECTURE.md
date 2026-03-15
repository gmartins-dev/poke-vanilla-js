# ARCHITECTURE.md

## Visão Geral

A Pokédex foi organizada para deixar explícita a separação entre lógica, estrutura da UI e styling.

Fluxo principal:

`API -> Service -> State -> Render -> Events`

Leitura do fluxo:

1. `API` faz apenas requests HTTP para a PokéAPI.
2. `Service` orquestra cache e normaliza os dados recebidos.
3. `State` recebe os dados prontos e mantém a fonte única da verdade.
4. `Render` transforma o estado atual em markup.
5. `Events` escutam interações do usuário, atualizam o estado e disparam novo render.

## Estrutura

```text
src/
  main.js

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
    pokemon-card.js
    pagination-button.js

  events/
    ui-events.js
```

## Separação De Responsabilidades

### API

Arquivo: `src/api/pokemon-api.js`

Responsável por:

- chamar a PokéAPI
- encapsular erros de rede, HTTP e parsing

Não faz:

- mutação de estado
- formatação de dados
- qualquer operação de DOM

### Service

Arquivo: `src/services/pokemon-service.js`

Responsável por:

- carregar a 1ª geração
- cachear índice, detalhes e requests em voo
- normalizar o payload da PokéAPI para o formato consumido pela aplicação

Não faz:

- renderização
- binding de eventos

### State

Arquivo: `src/state/state.js`

Responsável por:

- manter o estado global da aplicação
- centralizar transições de busca, filtro, paginação e status
- armazenar coleções derivadas como `filteredPokemon`, `visiblePokemon` e `totalPages`

Estado principal:

```js
state = {
  allPokemon: [],
  filteredPokemon: [],
  visiblePokemon: [],
  typeOptions: [],
  pokemonIndexCache: new Map(),
  pokemonDetailsCache: new Map(),
  pokemonDetailsRequests: new Map(),
  searchTerm: "",
  selectedType: "all",
  currentPage: 1,
  pageSize: 18,
  totalPages: 1,
  isLoading: false,
  errorMessage: ""
}
```

### Logic

Arquivos:

- `src/logic/filters.js`
- `src/logic/pagination.js`

Responsável por:

- busca por nome
- filtro por tipo
- derivação das opções do select
- cálculo de paginação
- regra de page size responsivo

Todos os exports dessa camada são funções puras.

### Render

Arquivos:

- `src/render/render-pokemon-grid.js`
- `src/render/render-pagination.js`
- `src/render/render-states.js`

Responsável por:

- montar a estrutura da tela
- renderizar cards, estados visuais e paginação
- manter styling apenas com classes Tailwind

Não faz:

- fetch
- atualização de estado
- regras de negócio

### Components

Arquivos:

- `src/components/pokemon-card.js`
- `src/components/pagination-button.js`

Responsável por:

- pequenas unidades reutilizáveis de markup

### Events

Arquivo: `src/events/ui-events.js`

Responsável por:

- delegação de eventos da interface
- debounce de busca e resize
- sincronização de `search`, `type` e `page` na URL
- disparo do ciclo de atualização da aplicação

## Styling

Toda a apresentação permanece em `Tailwind CSS v4`.

Regras adotadas:

- sem CSS utilitário customizado grande
- sem lógica de negócio embutida em classes ou templates
- classes de apresentação restritas à camada de render/components

## Qualidade

Ferramentas:

- `Biome` para lint e formatação
- `Vitest` para regras puras e helpers críticos de estado/URL
