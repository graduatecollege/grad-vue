<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GSidebarMenu } from "@illinois-grad/grad-vue";

const demoActiveId = ref<string | null>(null);

const demoItems = [
    { label: "Overview", href: "#sidebar-menu-demo-overview" },
    { label: "Details", href: "#sidebar-menu-demo-details" },
    { label: "More", href: "#sidebar-menu-demo-more" },
];
</script>

<template>
    <section id="sidebar-menu" class="demo-section">
        <h2 class="demo-section__title">Sidebar Menu</h2>

        <ComponentDemo
            name="Basic Sidebar Menu"
            description="A sidebar navigation menu with accessible in-page link focus management."
            :props-config="{
                title: {
                    type: 'string',
                    default: 'Demo Menu',
                    label: 'Title',
                },
                theme: {
                    type: 'select',
                    options: ['dark', 'light'],
                    default: 'light',
                    label: 'Theme',
                },
                spy: {
                    type: 'boolean',
                    default: false,
                    label: 'Spy (auto-active)',
                },
            }"
        >
            <template #default="{ props }">
                <div
                    style="display: grid; grid-template-columns: 280px 1fr; gap: 1rem; align-items: start"
                >
                    <GSidebarMenu
                        :title="props.title"
                        :theme="props.theme"
                        :spy="props.spy"
                        :items="demoItems"
                        v-model:activeId="demoActiveId"
                        style="border-radius: 8px; overflow: hidden"
                    />

                    <div style="padding: 0.5rem 0">
                        <section id="sidebar-menu-demo-overview" style="margin-bottom: 1.25rem">
                            <h3 style="margin: 0 0 0.5rem 0">Overview</h3>
                            <p style="margin: 0">
                                This content area provides destinations for the menu’s in-page links.
                            </p>
                        </section>

                        <section id="sidebar-menu-demo-details" style="margin-bottom: 1.25rem">
                            <h3 style="margin: 0 0 0.5rem 0">Details</h3>
                            <p style="margin: 0">
                                When using hash links, the component focuses the destination heading.
                            </p>
                        </section>

                        <section id="sidebar-menu-demo-more">
                            <h3 style="margin: 0 0 0.5rem 0">More</h3>
                            <p style="margin: 0">
                                Current active id: <code>{{ demoActiveId || "(none)" }}</code>
                            </p>
                        </section>
                    </div>
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>
