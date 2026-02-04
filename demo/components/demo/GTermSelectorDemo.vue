<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import GTermSelector from "../../../src/components/GTermSelector.vue";
import { ref } from "vue";
import DemoResult from "~/components/DemoResult.vue";


const term = ref({year: "2026", name: "Spring"});
const termYears = ref(["2026", "2025", "2024"]);
</script>

<template>
    <section id="term-selector" class="demo-section">
        <h2 class="demo-section__title">Term Selector</h2>
        <ComponentDemo
            description="A button to show and select a term."
            component="GTermSelector"
            :props-config="{
                title: {
                    type: 'string',
                    label: 'Title for the popover.',
                    default: 'Period Selection'
                },
                yearLabel: {
                    type: 'string',
                    label: 'Label for year select.',
                    default: 'Select Year'
                },
                periodLabel: {
                    type: 'string',
                    label: 'Label for period select.',
                    default: 'Term'
                }
            }"
        >
            <template #docs><p>A button that shows the selected term. Clicking it opens a popover
that allows jumping to a different term.</p>
</template>
            <template #default="{ props }">
                <GTermSelector v-bind="props"  v-model="term" :term-years="termYears">

                        <p>Example content</p>
                    </GTermSelector>
                <DemoResult label="Selected">{{ term }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
