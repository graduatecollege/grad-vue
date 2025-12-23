<script setup lang="ts">
defineProps<{
    id: string;
    label: string;
    modelValue: number;
}>();

defineEmits<{
    (e: "update:modelValue", value: number): void;
}>();
</script>

<template>
    <div class="demo-control">
        <label :for="id" class="number-label">
            {{ label }}
        </label>
        <input
            :id="id"
            type="number"
            :value="modelValue"
            class="number-input"
            @input="
                $emit(
                    'update:modelValue',
                    Number(($event.target as HTMLInputElement).value),
                )
            "
        />
    </div>
</template>

<style scoped>
.demo-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.number-label {
    font-size: 0.875rem;
    font-weight: 500;
}

.number-input {
    padding: 0.5rem;
    border-radius: 4px;
    border: 2px solid var(--il-blue);
    font-size: 0.875rem;
}
</style>
