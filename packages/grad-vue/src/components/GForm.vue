<script lang="ts" setup>
/**
 * A form wrapper component that automatically manages form state and
 * connects to child input components.
 *
 * Child input components that have a `name` prop will automatically
 * register with the form, and their values will be tracked in the form model.
 *
 * ### Features
 *
 * - Automatic value tracking for child input components with the `name` prop
 * - Reactive error handling by providing a computed list of errors
 * - Optionally manage your own form state in a parent component by providing a
 *   `form` injection
 *
 * ### Basic example
 *
 * ```vue-html
 * <GForm v-model="formData" @submit="handleSubmit">
 *   <template #default="{ isSubmitting, hasErrors }">
 *     <GTextInput name="firstName" label="First Name" :errors="firstNameErrors" />
 *     <GSubmitButton :disabled="hasErrors">Submit</GSubmitButton>
 *   </template>
 * </GForm>
 * ```
 */

import { provide, watch, inject, computed } from "vue";
import { useForm, UseFormReturn } from "../compose/useForm.ts";

interface Props {
    /**
     * Action URL (optional, for native form submission)
     */
    action?: string;
    /**
     * HTTP method (optional, for native form submission)
     */
    method?: string;
}

const props = withDefaults(defineProps<Props>(), {
    action: undefined,
    method: "post",
});

const model = defineModel<Record<string, any>>({ default: () => ({}) });

const emit = defineEmits<{
    submit: [values: Record<string, any>];
}>();

// Check if a form is already injected from a parent
const parentForm = inject<UseFormReturn | null>("form", null);

// Only create a new form if one wasn't already provided
const form = parentForm || useForm();

// Only provide the form if we created it (not if we're using a parent's form)
if (!parentForm) {
    provide("form", form);
}

// Sync form values to model
watch(
    () => form.values.value,
    (newValues) => {
        model.value = { ...newValues };
    },
    { deep: true },
);

// Initialize fields from model value
watch(
    () => model.value,
    (newModel) => {
        if (newModel) {
            Object.entries(newModel).forEach(([name, value]) => {
                const field = form.fields[name];
                if (field && field.value.value !== value) {
                    field.value.value = value;
                }
            });
        }
    },
    { deep: true, immediate: true },
);

async function handleSubmit(e: Event) {
    e.preventDefault();
    await form.submit(async (values) => {
        emit("submit", values);
    });
}

</script>

<template>
    <form
        @submit="handleSubmit"
        :action="props.action"
        :method="props.method"
        class="g-form"
        novalidate
    >
        <slot
            :isSubmitting="form.isSubmitting.value"
            :hasErrors="form.hasErrors.value"
            :values="form.values.value"
            :errors="form.errors.value"
        ></slot>
    </form>
</template>

<style scoped>
.g-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
