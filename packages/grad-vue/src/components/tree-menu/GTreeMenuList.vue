<script lang="ts">
/**
 * List wrapper for `GTreeMenuItem` items inside a `GTreeMenu`.
 * Renders as `<ul>` or `<ol>` depending on the `listType` prop.
 * When no `listType` is specified the value provided by the parent
 * `GTreeMenu` (via provide/inject) is used, falling back to `ul`.
 */
export default { name: "GTreeMenuList" };
</script>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onMounted } from "vue";
import { isCustomElementMode } from "../../compose/useCustomElementAttrs";

const props = withDefaults(
    defineProps<{
        /**
         * List element type (`ul` or `ol`).
         */
        listType?: "ul" | "ol";
    }>(),
    {
        listType: undefined,
    },
);

const injectedListType = inject<string>("g-tree-menu-list-type", "ul");

const resolvedListType = computed(
    () => props.listType ?? injectedListType ?? "ul",
);

// In Web Components mode the inner `<ul>`/`<ol>` would be wrapped by the
// custom-element host `<g-tree-menu-list>`, breaking HTML validity and the
// list/listitem parent-child relationship in the accessibility tree.
// Instead, we render a plain `<div role="list">` inner wrapper so that the
// direct children (`g-tree-menu-item[role="listitem"]`) satisfy the
// parent-child requirement. The CE host itself gets no list role.
const isCE = isCustomElementMode();
const instance = getCurrentInstance();

onMounted(() => {
    if (!isCE) return;
    const ceHost = (instance as any)?.ce as HTMLElement | undefined;
    if (!ceHost) return;
    ceHost.setAttribute("data-list-type", resolvedListType.value);
});
</script>

<template>
    <component
        :is="isCE ? 'div' : resolvedListType"
        :role="isCE ? 'list' : undefined"
        class="g-tree-menu__list"
    >
        <slot />
    </component>
</template>

<style>
g-tree-menu-list,
.g-tree-menu__list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-weight: bold;
    display: block;
}
.g-tree-menu__list ul,
.g-tree-menu__list ol {
    font-weight: 600 !important;
}

.g-tree-menu__list .g-tree-menu__list,
g-tree-menu-list g-tree-menu-list {
    padding-left: 1.25em;
}

g-tree-menu-list > g-tree-menu-item {
    margin-top: 0.4em;
}

g-tree-menu-list > g-tree-menu-item:first-of-type {
    margin-top: 0;
}

</style>