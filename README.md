# grad-vue

Shared Vue.js components and composable functions for the Graduate College.

**Package has moved in npm** to `@graduatecollege/grad-vue`.

Features:

- **Vue 3**: Built with Vue.js version 3 and the Composition API.
- **Accessibility-First**: All grad-vue components are built first to be accessible to all users.
- **Minimal Dependencies**: Only depends on Vue.js, VueUse and focus-trap.

All grad-vue components are **accessibility-first**. We can't make guarantees about
complying with specific accessibility standards, but all components are built with
consideration for all users.

## Demo Site

View live interactive demos and documentation at: [https://graduatecollege.github.io/grad-vue/](https://graduatecollege.github.io/grad-vue/)

The demo site is located in the [`demo/`](./demo) directory and is built with Nuxt 4.

## Installation

```bash
npm install @graduatecollege/grad-vue
```

## Usage

### Import All Components In Vue.js

```javascript
import { createApp } from 'vue'
import GradVue from '@graduatecollege/grad-vue'
import App from './App.vue'

const app = createApp(App)
app.use(GradVue)
```

### Import All Components in Nuxt.js

Add `grad-vue.ts` into your plugins folder:

```javascript
import GradVue from '@graduatecollege/grad-vue';
import '@graduatecollege/grad-vue/grad-vue.css';

export default defineNuxtPlugin(async (nuxt) => {
    nuxt.vueApp.use(GradVue);
})
```

### Import Individual Components In Vue.js

```javascript
import { GButton } from '@graduatecollege/grad-vue'

export default {
  components: {
    GButton
  }
}
```

Or in a script setup:

```vue
<script setup>
import { GButton } from '@graduatecollege/grad-vue'
</script>

<template>
  <GButton @click="handleClick">Click me</GButton>
</template>
```

## Development

### Bootstrapping a New Component

```bash
npm run component:new -- GMyNewComponent
```

This script creates a new component in the `src/components` directory and adds it to the `playground/`, `demo/`,
and the package exports.

### Demo Props And Documentation

The `props-config` and `docs` in each component's demo are generated automatically from the component's source:

```bash
npm run sync-props
```

Some notes on this process:

- The `docs` section is generated from a jsdoc immediately after the opening `<script setup` tag. It supports markdown formatting.
- The `props-config` section is generated from the `Props` interface or type in the component script, with default
  values from the `withDefaults` function call.
- The `Props` interface can have a `// Demo: <value>` comment to override the default value for the prop in the demo.
- Props without a jsdoc will not be included in the demo.

> [!TIP]
> The markdown docs at the top of the component file cannot have a `</script>` because of how Vue.js parses the file.
> Instead, use `&lt;/script>` in the docs.

### Running Tests

The project uses Vitest 4 for unit and accessibility testing in **browser mode**.

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

### Building

```bash
# Build the library
npm run build

# Watch for changes during development
npm run watch
```

## Release Process

This package is automatically published to NPM when a semantic version tag (prefixed with `v`) is pushed to the repository. For example:

```bash
# Create and push a new release
git tag v1.0.0
git push origin v1.0.0
```
