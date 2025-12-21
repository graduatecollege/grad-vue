<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import { GAppHeader, GButton } from "@illinois-grad/grad-vue";
</script>

<template>
    <section id="app-header" class="demo-section">
        <h2 class="demo-section__title">App Header</h2>

        <ComponentDemo
            name="Basic App Header"
            description="An application header component with Block I branding and Illinois styling."
            :props-config="{
                illinois: {
                    type: 'boolean',
                    default: false,
                    label: 'Illinois',
                },
            }"
        >
            <template #default="{ props }">
                <GAppHeader :illinois="props.illinois">
                    <template #title>
                        <span style="font-size: 1.25rem; font-weight: 600"
                            >Portal</span
                        >
                    </template>
                    <template #app-controls>
                        <nav
                            style="
                                display: flex;
                                gap: 1rem;
                                align-items: center;
                            "
                        >
                            <GButton size="small">Logout</GButton>
                        </nav>
                    </template>
                </GAppHeader>
            </template>
        </ComponentDemo>
    </section>
</template>
