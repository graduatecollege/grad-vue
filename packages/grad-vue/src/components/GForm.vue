<script lang="ts" setup>
/**
 * A form wrapper component that automatically manages form state and
 * connects to child input components.
 *
 * Child input components that have a `name` prop will automatically
 * register with the form and their values will be tracked in the form model.
 *
 * @example
 * <GForm v-model="formData" @submit="handleSubmit" @error="handleError">
 *   <GTextInput name="firstName" label="First Name" />
 *   <GTextInput name="lastName" label="Last Name" />
 *   <GSubmitButton>Submit</GSubmitButton>
 * </GForm>
 */

import { provide, watch } from "vue";
import { useForm } from "../compose/useForm.ts";

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
    error: [errors: Record<string, string>];
}>();

const form = useForm();

provide("form", form);

watch(
    () => form.values.value,
    (newValues) => {
        model.value = { ...model.value, ...newValues };
    },
    { deep: true },
);

watch(
    () => form.errors.value,
    (newErrors) => {
        if (Object.keys(newErrors).length > 0) {
            emit("error", newErrors);
        }
    },
    { deep: true },
);

watch(
    () => model.value,
    (newModel) => {
        Object.entries(newModel).forEach(([name, value]) => {
            const field = form.fields.value.get(name);
            if (field && field.value.value !== value) {
                form.setFieldValue(name, value);
            }
        });
    },
    { deep: true },
);

async function handleSubmit(e: Event) {
    e.preventDefault();
    await form.submit(async (values) => {
        emit("submit", values);
    });
}

defineExpose({
    setErrors: form.setErrors,
    clearErrors: form.clearErrors,
    isSubmitting: form.isSubmitting,
    hasErrors: form.hasErrors,
    values: form.values,
    errors: form.errors,
});
</script>

<template>
    <form
        @submit="handleSubmit"
        :action="props.action"
        :method="props.method"
        class="g-form"
        novalidate
    >
        <slot></slot>
    </form>
</template>

<style scoped>
.g-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
