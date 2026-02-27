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
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
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
    errors: () => [],
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
        :errors="props.errors"
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
