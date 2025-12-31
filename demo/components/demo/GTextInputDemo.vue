<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GTextInput } from "@illinois-grad/grad-vue";

const textValue = ref("");
</script>

<template>
    <section id="text-input" class="demo-section">
        <h2 class="demo-section__title">Text Input</h2>

        <ComponentDemo
            name="Basic Text Input"
            description="A text input component with label and validation support."
            component="GTextInput"
            :props-config="{
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
                }
            }"
        >
            <template #default="{ props }">
                <GTextInput
                    v-model="textValue"
                    v-bind="props"
                    label="Example Label"
                />
                <DemoResult>{{ textValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
