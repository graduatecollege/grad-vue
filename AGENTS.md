This is a collection of reusable Vue.js components for the Graduate College.

Accessibility is the first priority.

## Code conventions

- Avoid obvious comments when the code is self-explanatory.

## TypeScript

- Prefer const over let
- Always use braces for `if`, `else`, and `for` loops.
- Avoid using `any` type

## Vue 3

- Components need to be compatible with Nuxt 4.
- [VueUse](https://vueuse.org/) is available for reducing boilerplate.

### Creating a component

Use `npm run component:new <name>` to create a new component. For example:

```shell
npm run component:new GButton
```

When creating child components not meant to be used on their own, place them
into a subdirectory of `src/components`. DO NOT use `component:new` for these.

## Tests

- Use `vitest/browser` for all tests with Playwright.
- `tests/test-utils.ts` has helpers for testing components, including:
  - `testAccessibility` to run automated accessibility checks on a component.
  - `mnt` to mount a Vue component into Playwright.
  - `tabTo` tabs through elements until the currently active element matches the specified text.
- Create fixtures when more than one test uses the same setup.
- Avoid repeating a lot of code in each test, write helper functions instead.
- For testing variations of the same setup, use `describe.for` and `it.for`.
  
## Repository Structure

- `demo/`: component demos and examples.
- `src/`: the source code for the components.
- `tests/`: Vitest + Playwright tests for the components.
- `playground/`: component development playground.

## Development Commands

- `npm run test:run`: run tests and transform results to JSON for the demo
- `npm run build`: build the components for production