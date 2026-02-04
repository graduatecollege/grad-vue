<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GAppHeader, GButton } from "@graduatecollege/grad-vue";
</script>

<template>
    <ComponentSection title="App Header">
        <ComponentDemo
            description="An application header component."
            component="GAppHeader"
            :props-config="{
                brand: {
                    type: 'string',
                    label: 'Top-left corner text',
                    default: 'GRAD',
                    instructions: 'You can customize this text element with the \'left\' slot.'
                }
            }"
        >
            <template #docs><p>This is a minimal header meant for web apps where a full Illinois
brand header would be too large.</p>
<p><strong>Slot</strong> <code>left</code> allows replacing the link element in the top-left corner.</p>
<p><strong>Slot</strong> <code>title</code> is to the right of the logo.</p>
<p><strong>Slot</strong> <code>app-controls</code> is the remaining area to the right.</p>
</template>
            <template #default="{ props }">
                <GAppHeader v-bind="props" class="app-header-demo">
                    <template #title>
                        <span class="header-title">Portal</span>
                    </template>
                    <template #app-controls>
                        <nav class="header-controls">
                            <GButton size="small">Logout</GButton>
                        </nav>
                    </template>
                </GAppHeader>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped>
.g-app-header {
    position: sticky !important;
}

.header-title {
    font-size: 1.25rem;
    font-weight: 600;
}

.header-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}
</style>
