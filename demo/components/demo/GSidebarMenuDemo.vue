<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GSidebarMenu } from "@illinois-grad/grad-vue";

const demoItems = [
    { label: "Overview", href: "#sidebar-menu-demo-overview" },
    { label: "Details", href: "#sidebar-menu-demo-details" },
    { label: "More", href: "#sidebar-menu-demo-more" },
    { label: "About", href: "#sidebar-menu-demo-more" },
    { label: "Help", href: "#sidebar-menu-demo-more" },
];

const demoActiveId = ref(demoItems[0].href);
</script>

<template>
    <ComponentSection title="Sidebar Menu">
        <ComponentDemo
            name="Basic Sidebar Menu"
            description="A sidebar navigation menu with accessible in-page link focus management."
            component="GSidebarMenu"
            padding="0"
            :props-config="{
                title: {
                    type: 'string',
                    label: 'Title and accessible name',
                    default: 'Sidebar Menu'
                },
                theme: {
                    type: 'select',
                    label: 'Sidebar theme',
                    default: 'light',
                    options: [
                        'light',
                        'dark'
                    ]
                }
            }"
        >
            <template #docs></template>
            <template #default="{ props }">
                <div style="max-width: 300px">
                    <GSidebarMenu
                        v-bind="props"
                        :items="demoItems"
                        v-model="demoActiveId"
                    />
                </div>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
