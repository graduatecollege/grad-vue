<script lang="ts">
/**
 * A currency input component for US dollars.
 *
 * This component is a wrapper around a text input with a prefix and
 * appropriate input type for currency values.
 *
 * In standard Vue usage, this registers with the nearest parent `GForm` via
 * injection. In custom-elements mode, use matching `form-key` values to pair
 * with a `GForm`.
 */
export default {};
</script>

<script setup lang="ts">
import GTextInput from "./GTextInput.vue";

type Props = {
    /**
     * Label
     * @demo
     */
    label?: string;
    /**
     * Placeholder text
     * @demo
     */
    placeholder?: string;
    /**
     * Disabled
     * @demo
     */
    disabled?: boolean;
    /**
     * Required
     * @demo
     */
    required?: boolean;

    /**
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
    /**
     * Instructions
     * @demo
     */
    instructions?: string;
    /**
     * Name for form registration
     */
    name?: string;
    /**
     * Form channel key for custom elements mode
     */
    formKey?: string;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    required: false,
    errors: () => [],
    name: undefined,
    formKey: undefined,
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
        :required="props.required"
        :errors="props.errors"
        :instructions="props.instructions"
        :form-key="props.formKey"
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
