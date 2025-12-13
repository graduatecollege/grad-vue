# grad-vue

Shared Vue.js components and composable functions for the Graduate College.

## Installation

```bash
npm install @graduatecollege/grad-vue
```

## Usage

### Import All Components

```javascript
import { createApp } from 'vue'
import GradVue from '@graduatecollege/grad-vue'
import App from './App.vue'

const app = createApp(App)
app.use(GradVue)
```

### Import Individual Components

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

### Build the library

```bash
npm run build
```

### Preview the build

```bash
npm run preview
```

## License

MIT
