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
import { computed, inject } from "vue";

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
</script>

<template>
    <component :is="resolvedListType" class="g-tree-menu__list">
        <slot />
    </component>
</template>

<style scoped>

.g-tree-menu__list{
    list-style: none;
    margin: 0;
    padding: 0;
    font-weight: bold;

    :deep(ul), :deep(ol) {
        font-weight: 600 !important;
    }
}

.g-tree-menu__list :deep(.g-tree-menu__list){
    padding-left: 1.25em;
}

</style>