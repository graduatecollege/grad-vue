<script setup lang="ts">
import { ref } from "vue";
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
    <section id="select" class="demo-section">
        <h2 class="demo-section__title">Select</h2>

        <ComponentDemo
            name="Basic Select"
            description="A dropdown select component with customizable options."
            component="GSelect"
        >
            <GSelect
                :model-value="selectedValue"
                @update:model-value="selectedValue = $event"
                :options="selectOptions"
                label="Select an option"
            />
            <DemoResult label="Selected">{{ selectedValue }}</DemoResult>
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
    </section>
</template>
