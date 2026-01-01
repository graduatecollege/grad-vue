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
            name="Basic Select"
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
            <template #docs></template>
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

        <ComponentDemo
            name="Searchable Select"
            description="Select with search functionality to filter options."
        >
            <GSelect
                :model-value="searchableValue"
                @update:model-value="searchableValue = $event"
                :options="selectOptions"
                label="Searchable select"
                searchable
            />
            <DemoResult label="Selected">{{ searchableValue }}</DemoResult>
        </ComponentDemo>
    </ComponentSection>
</template>
