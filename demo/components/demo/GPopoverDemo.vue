<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GButton, GPopover } from "@illinois-grad/grad-vue";

const isPopoverOpen = ref(false);
</script>

<template>
    <section id="popover" class="demo-section">
        <h2 class="demo-section__title">Popover</h2>

        <ComponentDemo
            name="Basic Popover"
            description="A popover overlay component that appears relative to a trigger element."
            component="GPopover"
        >
            <GPopover v-model="isPopoverOpen">
                <template #trigger>
                    <GButton @click="isPopoverOpen = !isPopoverOpen"
                        >Toggle Popover</GButton
                    >
                </template>
                <template #default>
                    <div class="popover-content">
                        <p class="popover-text">This is popover content!</p>
                        <GButton
                            size="small"
                            class="popover-button"
                            @click="isPopoverOpen = false"
                            >Close</GButton
                        >
                    </div>
                </template>
            </GPopover>
        </ComponentDemo>
    </section>
</template>

<style scoped>
.popover-content {
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.popover-text {
    margin: 0;
}

.popover-button {
    margin-top: 0.5rem;
}
</style>
