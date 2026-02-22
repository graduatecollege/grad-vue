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
                    label: 'Label',
                    default: 'Date Range'
                },
                startLabel: {
                    type: 'string',
                    label: 'Start Label',
                    default: 'Start Date'
                },
                endLabel: {
                    type: 'string',
                    label: 'End Label',
                    default: 'End Date'
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
            <template #docs><p>A date range input component with two date inputs (start and end) laid out horizontally.</p></template>
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
