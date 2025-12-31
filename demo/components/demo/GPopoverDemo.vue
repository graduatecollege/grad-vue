<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GButton, GPopover } from "@illinois-grad/grad-vue";

const isPopoverOpen = ref(false);
const isPopover2Open = ref(false);
const isPopover3Open = ref(false);
</script>

<template>
    <section id="popover" class="demo-section">
        <h2 class="demo-section__title">Popover</h2>

        <ComponentDemo
            name="Basic Popover"
            description="A popover overlay component that appears relative to a trigger element."
            component="GPopover"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Sample Popover'
                },
                minimal: {
                    type: 'boolean',
                    label: 'Render without padding',
                    default: false
                }
            }"
        >
            <template #default="{ props }">
                <GPopover v-model="isPopoverOpen" v-bind="props">
                    <template #trigger>
                        <GButton @click="isPopoverOpen = !isPopoverOpen"
                            >Toggle Popover</GButton
                        >
                    </template>
                    <template #content>
                        <div class="popover-content">
                            <p class="popover-text">This is popover content!</p>
                            <GPopover v-model="isPopover2Open">
                                <template #trigger>
                                    <GButton
                                        @click="
                                            isPopover2Open = !isPopover2Open
                                        "
                                        >Can Popovers have Popovers?</GButton
                                    >
                                </template>
                                <template #content>
                                    <div class="popover-content">
                                        <p class="popover-text">
                                            This is popover content 2!
                                        </p>
                                        <GPopover v-model="isPopover3Open">
                                            <template #trigger>
                                                <GButton
                                                    @click="
                                                        isPopover3Open =
                                                            !isPopover3Open
                                                    "
                                                    >Can Popovers' Popovers have
                                                    Popovers?</GButton
                                                >
                                            </template>
                                            <template #content>
                                                <div class="popover-content">
                                                    <p class="popover-text">
                                                        Even if they can, should
                                                        they?
                                                    </p>
                                                </div>
                                            </template>
                                        </GPopover>
                                    </div>
                                </template>
                            </GPopover>
                        </div>
                    </template>
                </GPopover>
            </template>
        </ComponentDemo>
    </section>
</template>

<style scoped>
</style>
