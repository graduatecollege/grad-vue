<script setup lang="ts">
/**
 * This component is used with the `GDetailListItem` component to display
 * a list of key-value pairs in a grid or vertical layout.
 *
 * For example:
 *
 * ```vue-html
 * <GDetailList>
 *     <GDetailListItem label="Name">John Doe</GDetailListItem>
 *     <GDetailListItem label="Age">30</GDetailListItem>
 *     <GDetailListItem label="City">New York</GDetailListItem>
 * </GDetailList>
 * ```
 */
interface Props {
    /**
     * Layout style for the items.
     */
    variant?: "grid" | "vertical";
}

const props = withDefaults(defineProps<Props>(), {
    variant: "grid",
});
</script>

<template>
    <dl
        class="g-detail-list"
        :class="`g-detail-list--${props.variant}`"
    >
        <slot />
    </dl>
</template>

<style scoped>
.g-detail-list {
    margin: 0;
}

.g-detail-list--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--g-detail-list-item-min-width, 10rem), var(--g-detail-list-item-max-width, 1fr)));
    column-gap: 2.5rem;
    row-gap: 1.5rem;
}

.g-detail-list--grid :deep(.g-detail-list-item) {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.g-detail-list--grid :deep(.g-detail-list-item__label) {
    font-size: 0.875rem;
    padding-bottom: 0.375rem;
    border-bottom: 2px solid var(--g-accent-500);
}

.g-detail-list--vertical {
    display: flex;
    flex-direction: column;
}

.g-detail-list--vertical :deep(.g-detail-list-item) {
    display: grid;
    grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
    column-gap: 1rem;
    row-gap: 0.25rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--g-surface-200);
}

.g-detail-list--vertical :deep(.g-detail-list-item:last-child) {
    border-bottom: none;
}

.g-detail-list--vertical :deep(.g-detail-list-item__label) {
    font-size: 1rem;
    align-self: start;
}

.g-detail-list--vertical :deep(.g-detail-list-item__value) {
    justify-self: end;
    text-align: right;
}
</style>
