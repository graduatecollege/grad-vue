<script setup lang="ts">
import { useId } from "vue";

defineProps<{
    label: string;
    instructions?: string;
}>();
const id = useId();

const modelValue = defineModel<number>();
</script>

<template>
    <div class="demo-control">
        <label :for="id" class="number-label">
            {{ label }}
        </label>
        <input
            :id="id"
            type="number"
            v-model="modelValue"
            class="number-input"
            :aria-describedby="instructions ? `${id}-instructions` : undefined"
        />
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

.demo-control__instructions {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.35;
    color: #374151;
}
</style>
