<script setup lang="ts">
/**
 * A date input component.
 * 
 * This component is a wrapper around GTextInput with type="date" for
 * proper date selection using the browser's native date picker.
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

    // Error messages array (supports multiple validation errors)
    errors?: string[];
    /**
     * Instructions
     */
    instructions?: string;
    // Name for form registration
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
        type="date"
        v-bind="$attrs"
    />
</template>

<style scoped>
/* No additional styles needed, using GTextInput styles */
</style>
