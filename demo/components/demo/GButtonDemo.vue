<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GButton } from "@illinois-grad/grad-vue";

const clickCount = ref(0);
const handleClick = () => {
    clickCount.value++;
};
</script>

<template>
    <section id="button" class="demo-section">
        <h2 class="demo-section__title">Button</h2>

        <ComponentDemo
            name="Basic Button"
            description="A versatile button component with multiple size and theme options."
            component="GButton"
            :props-config="{
                size: {
                    type: 'select',
                    options: ['small', 'medium', 'large'],
                    default: 'medium',
                    label: 'Size',
                },
                theme: {
                    type: 'select',
                    options: [
                        'primary',
                        'secondary',
                        'accent',
                        'danger',
                        'none',
                    ],
                    default: 'primary',
                    label: 'Theme',
                },
                outlined: {
                    type: 'boolean',
                    default: false,
                    label: 'Outlined',
                },
                text: {
                    type: 'boolean',
                    default: false,
                    label: 'Text Style',
                },
            }"
        >
            <template #default="{ props }">
                <GButton
                    :size="props.size"
                    :theme="props.theme"
                    :outlined="props.outlined"
                    :text="props.text"
                    @click="handleClick"
                >
                    Click Me ({{ clickCount }})
                </GButton>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="Button Sizes"
            description="Buttons are available in three sizes: small, medium (default), and large."
        >
            <div
                style="
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                "
            >
                <GButton size="small">Small Button</GButton>
                <GButton size="medium">Medium Button</GButton>
                <GButton size="large">Large Button</GButton>
            </div>
        </ComponentDemo>

        <ComponentDemo
            name="Button Themes"
            description="Multiple theme options to match your application design."
        >
            <div style="display: flex; gap: 1rem; flex-wrap: wrap">
                <GButton theme="primary">Primary</GButton>
                <GButton theme="secondary">Secondary</GButton>
                <GButton theme="accent">Accent</GButton>
                <GButton theme="danger">Danger</GButton>
            </div>
        </ComponentDemo>

        <ComponentDemo
            name="Button Variants"
            description="Outlined and text variants for different use cases."
        >
            <div style="display: flex; gap: 1rem; flex-wrap: wrap">
                <GButton outlined>Outlined</GButton>
                <GButton text>Text Button</GButton>
                <GButton theme="accent" outlined>Accent Outlined</GButton>
            </div>
        </ComponentDemo>
    </section>
</template>
