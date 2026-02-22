<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GEmailInput } from "@illinois-grad/grad-vue";

const emailValue = ref("");
</script>

<template>
    <section id="email-input" class="demo-section">
        <h2 class="demo-section__title">Email Input</h2>
        <ComponentDemo
            name="Basic Email Input"
            description="An email input component with proper email validation."
            component="GEmailInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Email'
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: 'user@example.com'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                error: {
                    type: 'string',
                    label: 'Error message',
                    default: ''
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                }
            }"
        >
            <template #docs><p>An email input component with type="email" for proper validation and mobile keyboard support.</p></template>
            <template #default="{ props }">
                <GEmailInput
                    v-model="emailValue"
                    v-bind="props"
                />
                <DemoResult>{{ emailValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
