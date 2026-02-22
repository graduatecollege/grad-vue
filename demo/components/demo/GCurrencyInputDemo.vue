<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GCurrencyInput } from "@illinois-grad/grad-vue";

const currencyValue = ref("");
</script>

<template>
    <section id="currency-input" class="demo-section">
        <h2 class="demo-section__title">Currency Input</h2>
        <ComponentDemo
            name="Basic Currency Input"
            description="A currency input component for US dollars with a $ prefix."
            component="GCurrencyInput"
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
            <template #docs><p>A currency input component for US dollars.</p>
<p>This component is a wrapper around a text input with a prefix and
appropriate input type for currency values.</p>
</template>
            <template #default="{ props }">
                <GCurrencyInput
                    v-model="currencyValue"
                    v-bind="props"
                />
                <DemoResult>{{ currencyValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
