# AGENTS

This is a collection of reusable Vue.js components for the Graduate College.

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

- `npm run test`: run tests
- `npm run build`: build the components for production
- `npm run dev`: start the development server for the playground

## Notes

- API.md is automatically generated, don't edit
- Component demo props-config, and #props and #docs slots are auto-generated
- `npm run sync-props` does the above