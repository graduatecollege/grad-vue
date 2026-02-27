<script lang="ts" setup>
/**
 * A submit button that integrates with GForm.
 *
 * When used inside a GForm, the button will automatically:
 * - Show a loading state during form submission
 * - Be disabled when specified
 *
 * @example
 * <GForm v-model="formData" @submit="handleSubmit">
 *   <GTextInput name="email" label="Email" />
 *   <GSubmitButton>Submit</GSubmitButton>
 * </GForm>
 */

import { inject, computed } from "vue";
import { UseFormReturn } from "../compose/useForm.ts";
import GButton from "./GButton.vue";

interface Props {
    /**
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Loading text to show during submission
     */
    loadingText?: string;
    /**
     * Variant
     */
    variant?: "primary" | "secondary" | "danger";
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    loadingText: "Submitting...",
    variant: "primary",
});

const form = inject<UseFormReturn | null>("form", null);

const isDisabled = computed(() => {
    return props.disabled || (form?.isSubmitting.value ?? false);
});

const isSubmitting = computed(() => {
    return form?.isSubmitting.value ?? false;
});
</script>

<template>
    <GButton
        type="submit"
        :disabled="isDisabled"
        :variant="props.variant"
        class="g-submit-button"
    >
        <template v-if="isSubmitting">{{ props.loadingText }}</template>
        <slot v-else>Submit</slot>
    </GButton>
</template>

<style scoped>
.g-submit-button {
    align-self: flex-start;
}
</style>
