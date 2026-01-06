<script setup lang="ts">
interface Props {
    /**
     * Label shown for the item.
     */
    label: string;
}

defineProps<Props>();
</script>

<template>
    <div class="g-detail-list-item">
        <dt class="g-detail-list-item__label">
            <slot name="label">{{ label }}</slot>
        </dt>
        <dd class="g-detail-list-item__value">
            <slot />
        </dd>
    </div>
</template>

<style>
.g-detail-list-item {
    margin: 0;
}

.g-detail-list-item__label {
    margin: 0;
    font-weight: 700;
    color: var(--g-primary-500);
}

.g-detail-list-item__value {
    margin: 0;
}
</style>
