---
applyTo: "**/*.vue"
---

When creating Vue components:

- Use the composition API.
- Place the script tag at the top of the file.
- with `defineProps`, use TypeScript `type` for props, and then `withDefaults` to set default values.
- Some Vue setup functions are compiler macros, so no import is needed. This includes:
    - `defineProps`
    - `defineEmits`
    - `defineExpose`
    - `useSlots`