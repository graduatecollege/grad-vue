<script setup lang="ts">
interface Props {
    label?: string;
}

withDefaults(defineProps<Props>(), {
    label: "Value",
});
</script>

<template>
    <div class="demo-result">
        <span class="demo-result__label">{{ label }}:</span>
        <span class="demo-result__value">
            <slot />
        </span>
    </div>
</template>

<style scoped>
.demo-result {
    margin-top: 3rem;
}

.demo-result__label {
}

.demo-result__value {
    margin-left: 0.5rem;
    display: inline-block;
    padding: 0.2rem;
    background-color: var(--il-storm-95);
    border-radius: 6px;
    border: 1px solid var(--il-storm-80);
    font-family: monospace;
    font-size: 0.875rem;
}
</style>
