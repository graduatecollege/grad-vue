<script setup lang="ts">
/**
 * An email input component.
 * 
 * This component is a wrapper around GTextInput with type="email" for
 * proper email validation and mobile keyboard optimization.
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
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    error: "",
});

const model = defineModel<string | null>({ type: String });
</script>

<template>
    <GTextInput
        v-model="model"
        :label="props.label"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :error="props.error"
        :instructions="props.instructions"
        type="email"
        v-bind="$attrs"
    />
</template>

<style scoped>
/* No additional styles needed, using GTextInput styles */
</style>
