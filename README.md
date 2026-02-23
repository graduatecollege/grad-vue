# grad-vue Monorepo

Shared Vue.js components and composable functions for the Graduate College.

This monorepo contains multiple packages:

## Packages

### [@illinois-grad/grad-vue](./packages/grad-vue)

The main component library with minimal dependencies. Contains components for common UI patterns like buttons, inputs, modals, tables, and more.

**Installation:**
```bash
npm install @illinois-grad/grad-vue
```

### [@illinois-grad/grad-vue-rte](./packages/grad-vue-rte)

Rich text editor components built with Tiptap. This package is kept separate to avoid adding rich text editor dependencies to projects that don't need them.

**Installation:**
```bash
npm install @illinois-grad/grad-vue-rte
```

## Features

- **Vue 3**: Built with Vue.js version 3 and the Composition API.
- **Accessibility-First**: All components are built with consideration for all users.
- **Minimal Dependencies**: Main library only depends on Vue.js, VueUse and focus-trap.
- **Modular**: Choose the packages you need.

## Demo Site

View live interactive demos and documentation at: [https://graduatecollege.github.io/grad-vue/](https://graduatecollege.github.io/grad-vue/)

## Development

This is a monorepo managed with npm workspaces.

### Prerequisites

- Node.js 18+ 
- npm 7+

### Setup

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Build specific package
npm run build:grad-vue
npm run build:grad-vue-rte

# Run tests
npm test

# Start playground for development
npm run dev
```

### Project Structure

```
grad-vue/
├── packages/
│   ├── grad-vue/          # Main component library
│   └── grad-vue-rte/      # Rich text editor components
├── demo/                  # Demo site (Nuxt 4)
├── playground/            # Development playground
├── tests/                 # Tests for all packages
└── scripts/               # Build and utility scripts
```

### Creating a New Component

For the main grad-vue package:

```bash
npm run component:new ComponentName
```

For the grad-vue-rte package, manually create the component in `packages/grad-vue-rte/src/components/`.

### Testing

Tests are located in the `tests/` directory and use Vitest with Playwright.

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests and generate report
npm run test:run
```

## Code Conventions

- Avoid obvious comments when the code is self-explanatory
- Prefer const over let
- Always use braces for `if`, `else`, and `for` loops
- Avoid using `any` type
- Components must be compatible with Nuxt 4

## Contributing

See individual package READMEs for more details:
- [grad-vue README](./packages/grad-vue/README.md)
- [grad-vue-rte README](./packages/grad-vue-rte/README.md)

## License

MIT - University of Illinois Graduate College
