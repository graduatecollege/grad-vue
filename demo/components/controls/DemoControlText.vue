<script setup lang="ts">
defineProps<{
    id: string;
    label: string;
    instructions?: string;
}>();

const modelValue = defineModel<string>();

</script>

<template>
    <div class="demo-control">
        <label :for="id" class="text-label">
            {{ label }}
        </label>
        <p
            v-if="instructions"
            :id="`${id}-instructions`"
            class="demo-control__instructions"
        >
            {{ instructions }}
        </p>
        <input
            :id="id"
            type="text"
            v-model="modelValue"
            class="text-input"
            :aria-describedby="instructions ? `${id}-instructions` : undefined"
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
    font-weight: 500;
}

.text-input {
    padding: 0.5rem;
    border: 2px solid var(--il-blue);
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: var(--il-font-sans);
}

.demo-control__instructions {
    margin: 0;
    line-height: 1.35;
    color: #374151;
}
</style>
