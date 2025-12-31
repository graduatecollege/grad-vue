<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GSelectButton } from "@illinois-grad/grad-vue";

const selectButtonValue = ref("option1");
const selectButtonOptions = ref([
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
]);
</script>

<template>
    <section id="select-button" class="demo-section">
        <h2 class="demo-section__title">Select Button</h2>

        <ComponentDemo
            name="Basic Select Button"
            description="A button-style select component for choosing between options."
            component="GSelectButton"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Select Option'
                },
                size: {
                    type: 'select',
                    label: 'Size',
                    default: 'medium',
                    options: [
                        'small',
                        'medium',
                        'large'
                    ]
                },
                theme: {
                    type: 'select',
                    label: 'Color theme',
                    default: 'primary',
                    options: [
                        'primary',
                        'secondary',
                        'accent',
                        'danger'
                    ]
                },
                name: {
                    type: 'string',
                    label: 'Name',
                    default: null
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                }
            }"
        >
            <template #default="{ props }">
                <GSelectButton
                    v-model="selectButtonValue"
                    v-bind="props"
                    :options="selectButtonOptions"
                />
                <DemoResult label="Selected">{{
                    selectButtonValue
                }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
