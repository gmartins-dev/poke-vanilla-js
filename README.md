
# Pokédex Vanilla Js

Implementação do desafio técnico front-end.

Esta aplicação consiste em uma **Pokédex interativa** baseada no design fornecido no Figma.
O objetivo do projeto é demonstrar boas práticas de engenharia front-end utilizando uma stack
moderna, simples e bem organizada.

## Objetivos do projeto

- código organizado e legível
- arquitetura modular mesmo sem frameworks
- integração eficiente com API
- experiência de usuário fluida
- layout responsivo
- boas práticas de qualidade de código

A aplicação consome dados da **PokéAPI** e permite **listagem, busca e paginação de Pokémon**.

---

# Stack Utilizada

### Core

- HTML5
- JavaScript (ES Modules)
- Vite v7

### Estilização

- Tailwind CSS v4

### Qualidade de Código
- Biome (lint/format)

### Fonte de Dados
- PokéAPI (fonte de dados)

## Funcionalidades

- Listagem de 151 pokémons (1ª geração) com imagem, nome, número e tipo
- Busca client-side por nome (case-insensitive)
- Debounce de busca em 250ms
- Paginação client-side (anterior, próximo e páginas numéricas)
- Integração entre busca + paginação sem reload
- Cache em `Map` para índice e detalhes de pokémons
- Deduplicação de requests em voo para evitar chamadas duplicadas

## Estados de UX

- Loading: mensagem + skeleton cards
- Empty: mensagem quando não há resultados
- Error: mensagens específicas para erro de rede, HTTP e parsing

## Responsividade do grid

- Mobile: 2 colunas
- Tablet: 3-4 colunas
- Desktop: 6 colunas

## Arquitetura

Estrutura principal em `src/`:

- `api.js`: endpoints da PokéAPI
- `state.js`: estado global da aplicação
- `services/pokemon-service.js`: regras de negócio, cache e paginação
- `render/`: renderização de layout, status e paginação
- `components/`: card de pokémon e skeleton
- `events.js`: binding de eventos de busca e paginação
- `utils/`: utilitários (`request`, `debounce`)

## Como rodar

1. Instalar dependências:

```bash
pnpm install
```

2. Rodar em desenvolvimento:

```bash
pnpm dev
```

3. Build de produção:

```bash
pnpm build
```

## Scripts disponíveis

- `pnpm dev`
- `pnpm build`
- `pnpm preview`

## Qualidade de código

```bash
pnpm exec biome check src
```
