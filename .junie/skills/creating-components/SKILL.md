---
name: creating-components
description: Use when creating new Vue components
---

# Creating Components

Use when creating new components in any package in this repository.

## Guidelines
- 
- Use `npm run component:new <PascalCaseName>` to scaffold a component. Example: `npm run component:new GButton`.
- Components MUST be compatible with Nuxt 4.
- Prefer composables. Utilities from [VueUse](https://vueuse.org/) are available to reduce boilerplate.
- Child/part components that are not meant to be consumed directly should live under the parent’s subdirectory. Do NOT run the generator for these — create them manually under a `parts/` (or similar) subfolder.
- If the component belongs to a package other than `@illinois-grad/grad-vue`, run the generator and then move the generated files to the correct package, updating imports/exports accordingly.

## Code examples

### Scaffold a new component

```bash
npm run component:new GButton
```

### Example directory layout for child parts
```text
packages/grad-vue/src/components/GButton/
  GButton.vue
  parts/
    GButtonIcon.vue  # child component; don’t generate separately
```

### Moving a scaffold to a different package

The bootstrap command will show the changes it makes. Use that information to move the files to the correct package
if needed.