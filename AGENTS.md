# AGENTS

This is a collection of reusable Vue.js components for the Graduate College.

Run this to see available documentation:

```bash
find docs/ -name "*.md" | sort
```

## Code conventions

- Avoid obvious comments when the code is self-explanatory.
  
## Repository Structure

- `packages/`: groups of components
  - `packages/grad-vue/`: main component library without heavy dependencies
  - `packages/grad-vue-rte/`: rich text editor components based on tiptap
- `demo/`: component demos and examples.
- `tests/`: Vitest + Playwright tests for the components.
- `playground/`: component development playground.

## Development Commands

- `npm run test:run`: run tests
- `npm run build`: build the components for production