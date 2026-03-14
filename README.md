
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

- Biome (lint + formatter)

### Fonte de Dados

- PokéAPI

---

# Funcionalidades

## Listagem de Pokémon

Exibição em grid de cards contendo:

- imagem
- nome
- número
- tipo

---

## Busca

Busca por nome com:

- filtro client-side
- debounce
- sem reload da página

---

## Paginação

- paginação client-side
- navegação anterior / próxima
- integração com busca

---

# Executando o Projeto

Instalar dependências

pnpm install

Rodar ambiente de desenvolvimento

pnpm dev

Abrir

http://localhost:5173

---

# Autor

Guilherme Martins
