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
                    class="sidebar-demo"
                >
                    <div class="sidebar-content">
                        <p class="sidebar-title">Graduate College</p>
                        <p class="sidebar-description">
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
            <GSidebar theme="light" class="sidebar-demo sidebar-demo--compact">
                <div class="sidebar-content">
                    <p class="sidebar-title">Sidebar (Light)</p>
                    <p class="sidebar-description">
                        This is a simple content slot.
                    </p>
                </div>
            </GSidebar>
        </ComponentDemo>
    </section>
</template>

<style scoped>
.sidebar-demo {
    width: 320px;
    min-height: 260px;
    border-radius: 8px;
    overflow: hidden;
}

.sidebar-demo--compact {
    min-height: 180px;
}

.sidebar-content {
    padding: 1.25rem;
}

.sidebar-title {
    margin: 0;
    font-weight: 600;
}

.sidebar-description {
    margin: 0.75rem 0 0;
}
</style>
