# Project Guidelines

This is a collection of Vue.js components for the Graduate College.

Accessibility is the first priority.

## Code conventions

- Use 4 spaces for indentation.
- Avoid obvious comments when the code is self-explanatory.
- Keep chatting terse and to the point.

[VueUse](https://vueuse.org/functions.html) is available to reduce boilerplate.

## Repository Structure

- `demo/`: component demos and examples.
- `src/`: the source code for the components.
- `tests/`: Vitest + Playwright tests for the components.
- `playground/`: component development playground.

## Development Commands

- `npm run dev`: component development playground
- `npm run test`: start vitest
- `npm run test:run`: run tests and transform results to JSON for the demo
- `npm run build`: build the components for production
- `cd demo && npm run dev:demo`: demo site development
- `cd demo && npm run build:gh-pages`: build the demo site for GitHub Pages