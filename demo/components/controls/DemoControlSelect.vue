<script setup lang="ts">
import { useId } from "vue";

defineProps<{
    label: string;
    options: any[];
    instructions?: string;
}>();

const modelValue = defineModel<string>();

const id = useId();
</script>

<template>
    <div class="demo-control">
        <label :for="id" class="select-label">
            {{ label }}
        </label>
        <select
            :id="id"
            v-model="modelValue"
            class="select-control"
            :aria-describedby="instructions ? `${id}-instructions` : undefined"
        >
            <option v-for="option in options" :key="option" :value="option">
                {{ option }}
            </option>
        </select>
        <p
            v-if="instructions"
            :id="`${id}-instructions`"
            class="demo-control__instructions"
        >
            {{ instructions }}
        </p>
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

.demo-control__instructions {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.35;
    color: #374151;
}
</style>
