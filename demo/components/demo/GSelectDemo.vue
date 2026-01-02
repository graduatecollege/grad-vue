<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GSelect } from "@illinois-grad/grad-vue";

const selectedValue = ref<string | number | undefined>(undefined);
const searchableValue = ref<string | number | undefined>(undefined);
const selectOptions = ref([
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
]);
</script>

<template>
    <ComponentSection title="Select">
        <ComponentDemo
            description="A dropdown select component with customizable options."
            component="GSelect"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Select Option'
                },
                hiddenLabel: {
                    type: 'boolean',
                    label: 'Hide the label visually'
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder',
                    instructions: 'Only used if the component is searchable.'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                name: {
                    type: 'string',
                    label: 'Name',
                    default: null
                },
                searchable: {
                    type: 'boolean',
                    label: 'Searchable',
                    default: false
                },
                clearButton: {
                    type: 'boolean',
                    label: 'Show clear button'
                }
            }"
        >
            <template #docs><p>By default, this component behaves like a normal select element with
custom styling.</p>
<p>The component can be marked <code>searchable</code> to enable search functionality.
This turns it into a text input that filters the options. Filtering is
done with a simple lower-case string search.</p>
<p>The <code>options</code> prop can be an array of strings or objects with <code>label</code>
and <code>value</code> properties.</p>
</template>
            <template #default="{ props }">
                <GSelect
                    v-bind="props"
                    :model-value="selectedValue"
                    @update:model-value="selectedValue = $event"
                    :options="selectOptions"
                    label="Select an option"
                />
                <DemoResult label="Selected">{{ selectedValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
