<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GProgress } from "@illinois-grad/grad-vue";
</script>

<template>
    <section id="progress" class="demo-section">
        <h2 class="demo-section__title">Progress</h2>

        <ComponentDemo
            name="Basic Progress"
            description="A progress indicator component."
            component="GProgress"
            :props-config="{
                value: {
                    type: 'number',
                    label: 'Progress 1-100 or blank',
                    default: null
                },
                size: {
                    type: 'select',
                    label: 'Progress circle size',
                    default: 'medium',
                    options: [
                        'tiny',
                        'small',
                        'medium',
                        'large'
                    ]
                },
                ariaLabel: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Loading'
                }
            }"
        >
            <template #default="{ props }">
                <GProgress v-bind="props" />
                <DemoResult label="Progress">{{ props.value }}%</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
