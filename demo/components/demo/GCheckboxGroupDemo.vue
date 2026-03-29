<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GCheckboxGroup } from "@illinois-grad/grad-vue";

const selectedValues = ref<string[]>([]);
const radioValue = ref<string[]>([]);

const options = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c", hint: "This option has a hint" },
    { label: "Option D (disabled)", value: "d", disabled: true },
];
</script>

<template>
    <ComponentSection title="Checkbox Group">
        <ComponentDemo
            description="A group of checkboxes with label, instructions, and error support."
            component="GCheckboxGroup"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Legend label',
                    default: 'Choose options'
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                },
                required: {
                    type: 'boolean',
                    label: 'Required',
                    default: false
                },
                radio: {
                    type: 'boolean',
                    label: 'Radio mode (single-select)',
                    default: false
                }
            }"
        >
            <template #docs>
                <p>
                    Renders a <code>fieldset</code> + <code>legend</code> for semantic grouping.
                    Each option is a native <code>&lt;input type=&quot;checkbox&quot;&gt;</code>
                    (or <code>type=&quot;radio&quot;</code> when <code>radio</code> is set).
                </p>
                <p>
                    The <code>options</code> prop accepts <code>{ label, value, disabled?, hint? }[]</code>.
                    The <code>v-model</code> is always <code>string[]</code>.
                </p>
            </template>
            <template #default="{ props }">
                <GCheckboxGroup
                    v-bind="props"
                    v-model="selectedValues"
                    :options="options"
                    label="Choose options"
                />
                <DemoResult label="Selected">{{ selectedValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Checkbox Group in radio mode (single-select)."
            component="GCheckboxGroup"
            :props-config="{}"
        >
            <template #default>
                <GCheckboxGroup
                    label="Pick one"
                    :options="options"
                    v-model="radioValue"
                    :radio="true"
                />
                <DemoResult label="Selected">{{ radioValue }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Checkbox Group with error messages."
            component="GCheckboxGroup"
            :props-config="{}"
        >
            <template #default>
                <GCheckboxGroup
                    label="Required selection"
                    :options="options"
                    :model-value="[]"
                    :errors="['Please select at least one option']"
                    required
                />
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
