<script setup lang="ts">
/**
 * A currency input component for US dollars.
 * 
 * This component is a wrapper around a text input with a prefix and
 * appropriate input type for currency values.
 */
import GTextInput from "./GTextInput.vue";

type Props = {
    /**
     * Label
     */
    label?: string;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Disabled
     */
    disabled?: boolean;
    /**
     * Error message
     */
    error?: string;
    /**
     * Instructions
     */
    instructions?: string;
    /**
     * Name for form registration
     */
    name?: string;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    error: "",
    name: undefined,
});

const model = defineModel<string | null>({ type: String });
</script>

<template>
    <GTextInput
        v-model="model"
        :name="props.name"
        :label="props.label"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :error="props.error"
        :instructions="props.instructions"
        prefix="$"
        type="number"
        step="0.01"
        min="0"
        v-bind="$attrs"
    />
</template>

<style scoped>
/* No additional styles needed, using GTextInput styles */
</style>
