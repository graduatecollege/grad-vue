<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
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
    <ComponentSection title="Select Button">
        <ComponentDemo
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
            <template #docs><p>This component is just a radio button group with special styling.</p>
<p>Use the <code>options</code> prop to provide a list of choices. Each option can
be a string or an object with <code>label</code> and <code>value</code> properties.</p>
<p>In addition to <code>v-model</code>, a <code>change</code> event is emitted when the
option changes from user interaction.</p>
</template>
            <template #default="{ props }">
                <GSelectButton
                    v-model="selectButtonValue"
                    v-bind="props"
                    :label="props.label"
                    :options="selectButtonOptions"
                />
                <DemoResult label="Selected">{{
                    selectButtonValue
                }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
