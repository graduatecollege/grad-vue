# grad-vue

Shared Vue.js components and composable functions for the Graduate College.

## Installation

```bash
npm install grad-vue
```

## Usage

### Import All Components

```javascript
import { createApp } from 'vue'
import GradVue from 'grad-vue'
import App from './App.vue'

const app = createApp(App)
app.use(GradVue)
app.mount('#app')
```

### Import Individual Components

```javascript
import { GButton } from 'grad-vue'

export default {
  components: {
    GButton
  }
}
```

Or in a script setup:

```vue
<script setup>
import { GButton } from 'grad-vue'
</script>

<template>
  <GButton @click="handleClick">Click me</GButton>
</template>
```

## Available Components

### GButton

A customizable button component with multiple variants.

**Props:**
- `type` - Button type: `'button'` | `'submit'` | `'reset'` (default: `'button'`)
- `variant` - Button style: `'primary'` | `'secondary'` | `'outline'` (default: `'primary'`)
- `disabled` - Whether the button is disabled (default: `false`)

**Events:**
- `click` - Emitted when the button is clicked

**Example:**

```vue
<template>
  <GButton variant="primary" @click="handleClick">
    Primary Button
  </GButton>
  
  <GButton variant="secondary" @click="handleClick">
    Secondary Button
  </GButton>
  
  <GButton variant="outline" :disabled="true">
    Disabled Button
  </GButton>
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
