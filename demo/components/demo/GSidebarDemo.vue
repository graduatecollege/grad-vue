<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import { GSidebar } from "@illinois-grad/grad-vue";
</script>

<template>
    <section id="sidebar" class="demo-section">
        <h2 class="demo-section__title">Sidebar</h2>

        <ComponentDemo
            name="Basic Sidebar"
            description="A container component intended for persistent side navigation."
            component="GSidebar"
            :props-config="{
                theme: {
                    type: 'select',
                    options: ['dark', 'light'],
                    default: 'dark',
                    label: 'Theme',
                },
                backgroundColor: {
                    type: 'string',
                    default: '',
                    label: 'Background Color',
                },
                backgroundImage: {
                    type: 'string',
                    default: '',
                    label: 'Background Image',
                },
            }"
        >
            <template #default="{ props }">
                <GSidebar
                    :theme="props.theme"
                    :background-color="props.backgroundColor"
                    :background-image="props.backgroundImage"
                    style="
                        width: 320px;
                        min-height: 260px;
                        border-radius: 8px;
                        overflow: hidden;
                    "
                >
                    <div style="padding: 1.25rem">
                        <p style="margin: 0; font-weight: 600">
                            Graduate College
                        </p>
                        <p style="margin: 0.75rem 0 0">
                            Use this area for navigation, filters, and
                            contextual actions.
                        </p>
                    </div>
                </GSidebar>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="Light Theme"
            description="Use the light theme when the surrounding layout is light."
        >
            <GSidebar
                theme="light"
                style="
                    width: 320px;
                    min-height: 180px;
                    border-radius: 8px;
                    overflow: hidden;
                "
            >
                <div style="padding: 1.25rem">
                    <p style="margin: 0; font-weight: 600">Sidebar (Light)</p>
                    <p style="margin: 0.75rem 0 0">
                        This is a simple content slot.
                    </p>
                </div>
            </GSidebar>
        </ComponentDemo>
    </section>
</template>
