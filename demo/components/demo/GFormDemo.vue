<script setup lang="ts">
import { ref, computed } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GForm, GTextInput, GEmailInput, GSubmitButton } from "@illinois-grad/grad-vue";

const formData = ref<Record<string, any>>({});
const submitResult = ref<string>("");

// Example: reactive errors for validation
const emailErrors = computed(() => {
    const errors: string[] = [];
    const email = formData.value.email;
    if (email && !email.includes('@')) {
        errors.push('Email must contain @');
    }
    if (email && email.length < 5) {
        errors.push('Email is too short');
    }
    return errors;
});

function handleSubmit(values: Record<string, any>) {
    submitResult.value = `Form submitted with: ${JSON.stringify(values, null, 2)}`;
}
</script>

<template>
    <ComponentSection title="Form">
        <ComponentDemo
            description="A form wrapper component that automatically manages form state using reactive patterns."
            component="GForm"
            :props-config="{
                action: {
                    type: 'string',
                    label: 'Action URL (optional, for native form submission)',
                    default: null
                },
                method: {
                    type: 'string',
                    label: 'HTTP method (optional, for native form submission)',
                    default: 'post'
                }
            }"
        >
            <template #docs>
                <p>A form wrapper component that automatically manages form state and connects to child input components using Vue.js reactive patterns.</p>
                <p>Child input components that have a <code>name</code> prop will automatically register with the form and their values will be tracked in the form model.</p>
                <h3>Features</h3>
                <ul>
                    <li>Automatic value tracking for all child inputs with <code>name</code> prop</li>
                    <li>Reactive error handling with support for multiple errors per field</li>
                    <li>Slot props for <code>isSubmitting</code>, <code>hasErrors</code>, <code>values</code>, and <code>errors</code></li>
                    <li>Submit event with all form values</li>
                    <li>Integration with GSubmitButton for loading states</li>
                    <li>Optional form injection - only creates form if none exists in parent</li>
                </ul>
                <h3>Usage with Slot Props</h3>
                <pre><code>&lt;GForm v-model="formData" @submit="handleSubmit"&gt;
  &lt;template #default="{ isSubmitting, hasErrors }"&gt;
    &lt;GTextInput name="email" label="Email" :errors="emailErrors" /&gt;
    &lt;GSubmitButton :disabled="hasErrors"&gt;Submit&lt;/GSubmitButton&gt;
    &lt;div v-if="isSubmitting"&gt;Submitting...&lt;/div&gt;
  &lt;/template&gt;
&lt;/GForm&gt;</code></pre>
            </template>
            <template #default="{ props }">
                <GForm
                    v-model="formData"
                    v-bind="props"
                    @submit="handleSubmit"
                >
                    <template #default="{ isSubmitting, hasErrors, errors }">
                        <GTextInput
                            name="firstName"
                            label="First Name"
                            placeholder="Enter your first name"
                        />
                        <GTextInput
                            name="lastName"
                            label="Last Name"
                            placeholder="Enter your last name"
                        />
                        <GEmailInput
                            name="email"
                            label="Email"
                            placeholder="your@email.com"
                            :errors="emailErrors"
                        />
                        <div v-if="hasErrors" style="color: var(--g-danger-600); padding: 0.5em;">
                            Form has errors. Please fix them before submitting.
                        </div>
                        <GSubmitButton :disabled="hasErrors">
                            {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
                        </GSubmitButton>
                    </template>
                </GForm>
                <DemoResult v-if="submitResult">{{ submitResult }}</DemoResult>
                <DemoResult>Form Data: {{ JSON.stringify(formData, null, 2) }}</DemoResult>
                <DemoResult v-if="emailErrors.length > 0">Email Errors: {{ emailErrors }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
