<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
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
                    default: 50,
                    label: 'Progress Value',
                },
            }"
        >
            <template #default="{ props }">
                <GProgress :value="props.value" />
                <p style="margin-top: 1rem; color: #6b7280">
                    Progress: {{ props.value }}%
                </p>
            </template>
        </ComponentDemo>
    </section>
</template>
