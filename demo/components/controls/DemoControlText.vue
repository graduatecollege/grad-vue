<script setup lang="ts">
defineProps<{
    id: string;
    label: string;
    modelValue: string;
}>();

defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
    <div class="demo-control">
        <label :for="id" class="text-label">
            {{ label }}
        </label>
        <input
            :id="id"
            type="text"
            :value="modelValue"
            class="text-input"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
    </div>
</template>

<style scoped>
.demo-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.text-label {
    font-size: 0.875rem;
    font-weight: 500;
}

.text-input {
    padding: 0.5rem;
    border: 2px solid var(--il-blue);
    border-radius: 4px;
    font-size: 0.875rem;
}
</style>
