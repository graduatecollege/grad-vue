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
            padding="0"
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
                        <h3 class="sidebar-title">Sample Heading</h3>
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
.demo-section {
    :deep(.g-sidebar__light) {
        h3 {
            color: #000;
        }
    }
}
.sidebar-demo {
    width: 300px;
    min-height: 360px;
    overflow: hidden;
    color: #fff;
}

.sidebar-demo--compact {
    min-height: 180px;
}

.sidebar-content {
    padding: 1.25rem;
}

.sidebar-title {
    font-size: 1.75rem;
    font-family: var(--il-font-heading);
}

.sidebar-description {
    margin: 0.75rem 0 0;
}
</style>
