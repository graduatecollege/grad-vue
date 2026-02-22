<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GDateInput } from "@illinois-grad/grad-vue";

const dateValue = ref("");
</script>

<template>
    <section id="date-input" class="demo-section">
        <h2 class="demo-section__title">Date Input</h2>
        <ComponentDemo
            name="Basic Date Input"
            description="A date input component using the browser's native date picker."
            component="GDateInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Date'
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: ''
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
            <template #docs><p>A date input component with type="date" for easy date selection using the browser's native date picker.</p></template>
            <template #default="{ props }">
                <GDateInput
                    v-model="dateValue"
                    v-bind="props"
                />
                <DemoResult>{{ dateValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
