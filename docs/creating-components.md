# Vue 3

- Components need to be compatible with Nuxt 4.
- [VueUse](https://vueuse.org/) is available for reducing boilerplate.

# Creating a component

Use `npm run component:new <name>` to create a new component. For example:

```shell
npm run component:new GButton
```

When creating child components not meant to be used on their own, place them
into a subdirectory of `components`. DO NOT use `component:new` for these.

If creating a component for packages other than `grad-vue`, move the
changes after generating the component into the appropriate package.