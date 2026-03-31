<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GMultiSelect } from "@illinois-grad/grad-vue";

const selectedValues = ref<Array<string | number>>([]);
const formValues = ref<Array<string | number>>(["apple"]);

const fruitOptions = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
    { label: "Date", value: "date" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape" },
];

const stringOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
</script>

<template>
    <ComponentSection title="Multi Select">
        <ComponentDemo
            description="A multi-select combobox with search/filter support and removable chip tags."
            component="GMultiSelect"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Select Fruits'
                },
                hiddenLabel: {
                    type: 'boolean',
                    label: 'Hide the label visually',
                    default: null
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: null
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: null
                }
            }"
        >
            <template #default="{ props }">
                <GMultiSelect
                    v-bind="props"
                    v-model="selectedValues"
                    :options="fruitOptions"
                    label="Select Fruits"
                    placeholder="Search or pick…"
                />
                <DemoResult label="Selected">{{ selectedValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Multi Select with string options (no objects required)."
            component="GMultiSelect"
            :props-config="{}"
        >
            <template #default>
                <GMultiSelect
                    v-model="selectedValues"
                    :options="stringOptions"
                    label="String options"
                />
                <DemoResult label="Selected">{{ selectedValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Multi Select with pre-selected values and error messages."
            component="GMultiSelect"
            :props-config="{}"
        >
            <template #default>
                <GMultiSelect
                    v-model="formValues"
                    :options="fruitOptions"
                    label="Favourite fruits"
                    :errors="['Please select at least 2 items']"
                    instructions="Pick your top fruits"
                />
                <DemoResult label="Selected">{{ formValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Disabled Multi Select."
            component="GMultiSelect"
            :props-config="{}"
        >
            <template #default>
                <GMultiSelect
                    :model-value="['apple', 'banana']"
                    :options="fruitOptions"
                    label="Favourite fruits (disabled)"
                    disabled
                />
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
