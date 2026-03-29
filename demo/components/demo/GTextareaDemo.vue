<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GTextarea } from "@illinois-grad/grad-vue";

const textareaValue = ref("");
</script>

<template>
    <ComponentSection title="Textarea">
        <ComponentDemo
            description="A multi-line plain text input."
            component="GTextarea"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Example Label'
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
                readonly: {
                    type: 'boolean',
                    label: 'Read-only',
                    default: false
                },
                required: {
                    type: 'boolean',
                    label: 'Required',
                    default: false
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                },
                rows: {
                    type: 'number',
                    label: 'Rows',
                    default: 4
                },
                autoGrow: {
                    type: 'boolean',
                    label: 'Auto-grow',
                    default: false
                }
            }"
        >
            <template #default="{ props }">
                <GTextarea
                    v-model="textareaValue"
                    v-bind="props"
                />
                <DemoResult>{{ textareaValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
