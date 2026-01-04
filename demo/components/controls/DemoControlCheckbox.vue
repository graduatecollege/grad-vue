<script setup lang="ts">
import { useId } from "vue";

defineProps<{
    label: string;
    instructions?: string;
}>();

const modelValue = defineModel<boolean>();

const id = useId();
</script>

<template>
    <div class="demo-control">
        <div class="demo-control__row">
            <input
                :id="id"
                type="checkbox"
                v-model="modelValue"
                class="checkbox-control"
                :aria-describedby="
                    instructions ? `${id}-instructions` : undefined
                "
            />
            <label :for="id" class="checkbox-label">
                {{ label }}
            </label>
        </div>
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
    gap: 0.25rem;
}

.demo-control__row {
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

.demo-control__instructions {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.35;
    color: #374151;
}
</style>
