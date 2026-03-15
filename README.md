# Pokédex Vanilla JS

Implementação do desafio técnico front-end com foco em JavaScript vanilla, arquitetura modular e fidelidade visual ao Figma.

## Objetivo

Entregar uma Pokédex interativa com:

- listagem dos 151 pokémons da 1ª geração
- busca sem recarregar a página
- filtro por tipo
- paginação client-side
- responsividade para mobile, tablet e desktop

## Justificativa da Stack

- `Vanilla JavaScript (ES Modules)`: atende diretamente ao requisito principal do teste e evidencia organização sem depender de framework.
- `Vite`: reduz setup manual, melhora a experiência de desenvolvimento e mantém o projeto leve.
- `Tailwind CSS v4`: acelera a aproximação com o layout do Figma sem introduzir uma camada de abstração pesada.
- `Biome`: garante padronização de lint e formatação com configuração mínima.

## Funcionalidades

- listagem dos 151 pokémons usando PokéAPI
- busca client-side por nome
- filtro por tipo
- paginação sem reload
- sincronização de `search`, `type` e `page` na URL
- cache em `Map` para índice e detalhes dos pokémons
- deduplicação de requests em voo
- layout responsivo com page size adaptado à altura da viewport

## Arquitetura

Fluxo principal:

`api -> services -> state -> render -> events`

Responsabilidades:

- `src/api.js`: comunicação bruta com a PokéAPI
- `src/services/pokemon-service.js`: transformação, filtros, paginação e opções derivadas
- `src/state.js`: estado centralizado da aplicação
- `src/render/`: renderização de layout, estados e paginação
- `src/components/`: partes reutilizáveis da UI
- `src/events.js`: binding dos eventos de busca, filtro e paginação
- `src/utils/`: debounce, request, URL state e responsividade

## UX e Acessibilidade

- busca, filtro e paginação funcionam sem refresh
- resumo de resultados com `aria-live`
- estados de loading, erro e vazio
- foco visível em busca, filtro e paginação
- paginação adaptada para telas menores

## Como rodar

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm exec biome lint src
```

## Testes

Os testes usam o runner nativo do Node para validar:

- filtros combinados
- paginação
- geração de opções de tipo
- regra de responsividade
- leitura/escrita do estado da URL
