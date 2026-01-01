<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GSidebar } from "@illinois-grad/grad-vue";
</script>

<template>
    <ComponentSection title="Sidebar">
        <ComponentDemo
            name="Basic Sidebar"
            description="A container component intended for persistent side navigation."
            component="GSidebar"
            padding="0"
            :props-config="{
                backgroundColor: {
                    type: 'string',
                    label: 'Custom background color',
                    default: ''
                },
                backgroundImage: {
                    type: 'string',
                    label: 'Custom background image',
                    default: 'none'
                },
                theme: {
                    type: 'select',
                    label: 'Sidebar theme',
                    default: 'dark',
                    options: [
                        'light',
                        'dark'
                    ]
                }
            }"
        >
            <template #docs></template>
            <template #default="{ props }">
                <GSidebar v-bind="props" class="sidebar-demo">
                    <div class="sidebar-content">
                        <h3 class="sidebar-title">Sample Heading</h3>
                    </div>
                </GSidebar>
            </template>
        </ComponentDemo>
    </ComponentSection>
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
