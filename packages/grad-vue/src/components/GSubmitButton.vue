<script lang="ts">
/**
 * A submit button that integrates with GForm.
 *
 * When used inside a GForm, the button will automatically:
 * - Show a loading state during form submission
 * - Be disabled when specified
 *
 * In standard Vue usage, this resolves the nearest parent `GForm` via
 * injection. In custom-elements mode, use matching `form-key` values to pair
 * with a `GForm`.
 *
 * @example
 * <GForm v-model="formData" @submit="handleSubmit">
 *   <GTextInput name="email" label="Email" />
 *   <GSubmitButton>Submit</GSubmitButton>
 * </GForm>
 */
export default {};
</script>

<script lang="ts" setup>
import { inject, computed, useAttrs } from "vue";
import { UseFormReturn } from "../compose/useForm.ts";
import { useWebComponentForm } from "../compose/useWebComponentForm.ts";
import { isCustomElementMode } from "../compose/useCustomElementAttrs.ts";
import GButton from "./GButton.vue";

type Props = {
    /**
     * Disabled state
     * @demo
     */
    disabled?: boolean;
    /**
     * Loading text to show during submission
     * @demo
     */
    loadingText?: string;
    /**
     * Variant
     * @demo
     */
    variant?: "primary" | "secondary" | "danger";
    /**
     * Form channel key for custom elements mode
     * @demo
     */
    formKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    loadingText: "Submitting...",
    variant: "primary",
    formKey: "default",
});

const attrs = useAttrs();
const attrFormKey = typeof attrs["form-key"] === "string" ? attrs["form-key"] : undefined;
const formKey = props.formKey || attrFormKey || "default";

const injectedForm = inject<UseFormReturn | null>("form", null);
const form =
    injectedForm ??
    (isCustomElementMode() ? useWebComponentForm(formKey) : null);

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
        <span v-show="isSubmitting">{{ props.loadingText }}</span>
        <span v-show="!isSubmitting">
            <slot>Submit</slot>
        </span>
    </GButton>
</template>

<style scoped>
.g-submit-button {
    align-self: flex-start;
}
</style>
