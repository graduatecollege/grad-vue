<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GDateRangeInput } from "@illinois-grad/grad-vue";

const dateRange = ref({ start: null, end: null });
</script>

<template>
    <section id="date-range-input" class="demo-section">
        <h2 class="demo-section__title">Date Range Input</h2>
        <ComponentDemo
            name="Basic Date Range Input"
            description="A date range input with start and end dates laid out horizontally."
            component="GDateRangeInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label for the component',
                    default: null
                },
                startLabel: {
                    type: 'string',
                    label: 'Label for the start date input',
                    default: 'Start Date'
                },
                endLabel: {
                    type: 'string',
                    label: 'Label for the end date input',
                    default: 'End Date'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                }
            }"
        >
            <template #docs><p>A date range input component with start and end dates.</p>
<p>This component uses two GDateInput components laid out horizontally
to allow selecting a date range.</p>
</template>
            <template #default="{ props }">
                <GDateRangeInput
                    v-model="dateRange"
                    v-bind="props"
                />
                <DemoResult>{{ dateRange }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
