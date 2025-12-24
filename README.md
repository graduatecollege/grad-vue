# grad-vue

Shared Vue.js components and composable functions for the Graduate College.

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
npm install @illinois-grad/grad-vue
```

## Usage

### Import All Components In Vue.js

```javascript
import { createApp } from 'vue'
import GradVue from '@illinois-grad/grad-vue'
import App from './App.vue'

const app = createApp(App)
app.use(GradVue)
```

### Import All Components in Nuxt.js

Add `grad-vue.ts` into your plugins folder:

```javascript
import GradVue from '@illinois-grad/grad-vue';
import '@illinois-grad/grad-vue/grad-vue.css';

export default defineNuxtPlugin(async (nuxt) => {
    nuxt.vueApp.use(GradVue);
})
```

### Import Individual Components In Vue.js

```javascript
import { GButton } from '@illinois-grad/grad-vue'

export default {
  components: {
    GButton
  }
}
```

Or in a script setup:

```vue
<script setup>
import { GButton } from '@illinois-grad/grad-vue'
</script>

<template>
  <GButton @click="handleClick">Click me</GButton>
</template>
```

## Development

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
