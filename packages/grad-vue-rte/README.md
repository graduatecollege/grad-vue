# @illinois-grad/grad-vue-rte

Rich Text Editor components for Graduate College apps using [Tiptap](https://tiptap.dev/).

This is a companion package to `@illinois-grad/grad-vue` that provides components which depend on rich text editing capabilities. By keeping these components in a separate package, we keep the main library lightweight for projects that don't need rich text editing features.

## Features

- **Vue 3**: Built with Vue.js version 3 and the Composition API.
- **Tiptap Integration**: Uses Tiptap for rich text editing capabilities.
- **Accessibility-First**: All components are built with consideration for all users.

## Installation

```bash
npm install @illinois-grad/grad-vue-rte
```

**Note:** This package has peer dependencies on several Tiptap packages which will be installed automatically.

## Usage

### Import All Components In Vue.js

```javascript
import { createApp } from 'vue'
import GradVueRTE from '@illinois-grad/grad-vue-rte'
import '@illinois-grad/grad-vue-rte/grad-vue-rte.css'
import App from './App.vue'

const app = createApp(App)
app.use(GradVueRTE)
```

### Import All Components in Nuxt.js

Add `grad-vue-rte.ts` into your plugins folder:

```javascript
import GradVueRTE from '@illinois-grad/grad-vue-rte';
import '@illinois-grad/grad-vue-rte/grad-vue-rte.css';

export default defineNuxtPlugin(async (nuxt) => {
    nuxt.vueApp.use(GradVueRTE);
});
```

### Import Individual Components

```javascript
import { GChatInput } from '@illinois-grad/grad-vue-rte'
import '@illinois-grad/grad-vue-rte/grad-vue-rte.css'
```

## Components

### GChatInput

A chat input component with rich text editing capabilities.

**Props:**
- `placeholder` (string, default: "Type a comment"): Placeholder text for the input
- `disabled` (boolean, default: false): Whether the input is disabled
- `maxRows` (number, default: 5): Maximum number of rows for the editor
- `label` (string, default: "Comment input"): Accessible label for the editor

**Events:**
- `send`: Emitted when the user presses Enter (without Shift) or clicks the send button

**v-model:**
- Binds to the editor content as a Tiptap JSON object

**Example:**

```vue
<template>
  <GChatInput 
    v-model="comment"
    placeholder="Enter your comment"
    @send="handleSend"
  />
</template>

<script setup>
import { ref } from 'vue'
import { GChatInput } from '@illinois-grad/grad-vue-rte'

const comment = ref('')

function handleSend(content) {
  console.log('Comment sent:', content)
  comment.value = ''
}
</script>
```

## Development

This package is part of the grad-vue monorepo. See the main [README](../../README.md) for development instructions.

## License

MIT - University of Illinois Graduate College
