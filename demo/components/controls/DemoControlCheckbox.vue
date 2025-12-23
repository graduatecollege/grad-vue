<script setup lang="ts">
defineProps<{
    id: string;
    label: string;
    modelValue: boolean;
}>();

defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();
</script>

<template>
    <div class="demo-control">
        <input
            :id="id"
            type="checkbox"
            :checked="modelValue"
            class="checkbox-control"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <label :for="id" class="checkbox-label">
            {{ label }}
        </label>
    </div>
</template>

<style scoped>
.demo-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.checkbox-label {
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
}

.checkbox-control {
    width: 20px;
    height: 20px;
    cursor: pointer;
}
</style>
