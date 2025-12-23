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
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background-color: #f3f4f6;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
        "Liberation Mono", monospace;
    font-size: 0.875rem;
}

.demo-result__label {
    color: #6b7280;
    font-weight: 500;
}

.demo-result__value {
    color: #1f2937;
    margin-left: 0.5rem;
}
</style>
