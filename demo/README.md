# Grad-Vue Demo Site

This is the demo and documentation site for the Grad-Vue component library.

## Overview

The demo site showcases all components available in the Grad-Vue library with:
- Interactive examples with configurable props
- Component documentation and descriptions
- Test result placeholders (to be implemented)

## Development

First, build the parent library:

```bash
cd ..
npm install
npm run build
```

Then install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Building for GitHub Pages

To build the site for deployment to GitHub Pages:

```bash
npm run generate:gh-pages
```

This will generate static files in `.output/public` with the correct base URL for GitHub Pages.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch via GitHub Actions.

See `.github/workflows/deploy-demo.yml` for the deployment configuration.

## Adding New Component Demos

1. Create a new page in `pages/` directory (e.g., `pages/my-component.vue`)
2. Use the `ComponentDemo` wrapper component to create interactive examples
3. Add a navigation link in `app/app.vue`
4. Add the route to the prerender list in `nuxt.config.ts`

### Example Component Demo

```vue
<script setup lang="ts">
import { ref } from 'vue';

const myValue = ref('');
</script>

<template>
  <div>
    <h1>MyComponent</h1>
    
    <ComponentDemo
      name="Basic Usage"
      description="Description of your component"
      :props-config="{
        propName: {
          type: 'string',
          default: 'default value',
          label: 'Prop Label'
        }
      }"
    >
      <template #default="{ props }">
        <MyComponent v-model="myValue" v-bind="props" />
      </template>
    </ComponentDemo>
  </div>
</template>
```
