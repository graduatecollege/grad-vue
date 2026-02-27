<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GEmailInput } from "@illinois-grad/grad-vue";

const emailValue = ref("");
</script>

<template>
    <section id="email-input" class="demo-section">
        <h2 class="demo-section__title">Email Input</h2>
        <ComponentDemo
            name="Basic Email Input"
            description="An email input component with proper email validation."
            component="GEmailInput"
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
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                }
            }"
        >
            <template #docs><p>An email input component.</p>
<p>This component is a wrapper around GTextInput with type=&quot;email&quot; for
proper email validation and mobile keyboard optimization.</p>
</template>
            <template #default="{ props }">
                <GEmailInput
                    v-model="emailValue"
                    v-bind="props"
                />
                <DemoResult>{{ emailValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
