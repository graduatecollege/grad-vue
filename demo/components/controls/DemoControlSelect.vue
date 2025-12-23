<script setup lang="ts">
defineProps<{
    id: string;
    label: string;
    modelValue: any;
    options: any[];
}>();

defineEmits<{
    (e: "update:modelValue", value: any): void;
}>();
</script>

<template>
    <div class="demo-control">
        <label :for="id" class="select-label">
            {{ label }}
        </label>
        <select
            :id="id"
            :value="modelValue"
            class="select-control"
            @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        >
            <option
                v-for="option in options"
                :key="option"
                :value="option"
            >
                {{ option }}
            </option>
        </select>
    </div>
</template>

<style scoped>
.demo-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.select-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.select-control {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
}
</style>
