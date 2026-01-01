<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GTextInput } from "@illinois-grad/grad-vue";

const textValue = ref("");
</script>

<template>
    <ComponentSection title="Text Input">
        <ComponentDemo
            name="Basic Text Input"
            description="A text input component with label and validation support."
            component="GTextInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: ''
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
            <template #docs></template>
            <template #default="{ props }">
                <GTextInput
                    v-model="textValue"
                    v-bind="props"
                    label="Example Label"
                />
                <DemoResult>{{ textValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
