<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GForm, GTextInput, GEmailInput, GSubmitButton } from "@illinois-grad/grad-vue";

const formData = ref<Record<string, any>>({});
const submitResult = ref<string>("");

function handleSubmit(values: Record<string, any>) {
    submitResult.value = `Form submitted with: ${JSON.stringify(values, null, 2)}`;
}

function handleError(errors: Record<string, string>) {
    submitResult.value = `Form has errors: ${JSON.stringify(errors, null, 2)}`;
}
</script>

<template>
    <ComponentSection title="Form">
        <ComponentDemo
            description="A form wrapper component that automatically manages form state."
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
                <p>A form wrapper component that automatically manages form state and connects to child input components.</p>
                <p>Child input components that have a <code>name</code> prop will automatically register with the form and their values will be tracked in the form model.</p>
                <h3>Features</h3>
                <ul>
                    <li>Automatic value tracking for all child inputs with <code>name</code> prop</li>
                    <li>Form-level error handling</li>
                    <li>Submit event with all form values</li>
                    <li>Integration with GSubmitButton for loading states</li>
                </ul>
                <h3>Usage</h3>
                <pre><code>&lt;GForm v-model="formData" @submit="handleSubmit" @error="handleError"&gt;
  &lt;GTextInput name="firstName" label="First Name" /&gt;
  &lt;GEmailInput name="email" label="Email" /&gt;
  &lt;GSubmitButton&gt;Submit&lt;/GSubmitButton&gt;
&lt;/GForm&gt;</code></pre>
            </template>
            <template #default="{ props }">
                <GForm
                    v-model="formData"
                    v-bind="props"
                    @submit="handleSubmit"
                    @error="handleError"
                >
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
                    />
                    <GSubmitButton>Submit Form</GSubmitButton>
                </GForm>
                <DemoResult v-if="submitResult">{{ submitResult }}</DemoResult>
                <DemoResult>Form Data: {{ JSON.stringify(formData, null, 2) }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
