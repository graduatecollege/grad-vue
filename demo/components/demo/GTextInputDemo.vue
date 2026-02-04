<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GTextInput } from "@graduatecollege/grad-vue";

const textValue = ref("");
</script>

<template>
    <ComponentSection title="Text Input">
        <ComponentDemo
            description="A text input component."
            component="GTextInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: null
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
            <template #docs><p>A text input with styling for a label, instructions, and an error message.</p>
<p>If <code>label</code> is omitted, an accessible label must be provided some other way.
All non-prop attributes are passed through to the input element, including
<code>id</code>.</p>
</template>
            <template #default="{ props }">
                <GTextInput
                    v-model="textValue"
                    v-bind="props"
                    :label="props.label"
                />
                <DemoResult>{{ textValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
