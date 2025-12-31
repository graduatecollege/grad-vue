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
                    label: 'Button size',
                    default: 'medium',
                    options: [
                        'small',
                        'medium',
                        'large'
                    ]
                },
                theme: {
                    type: 'select',
                    label: 'Button color theme',
                    default: 'primary',
                    options: [
                        'primary',
                        'secondary',
                        'accent',
                        'danger',
                        'none'
                    ]
                },
                outlined: {
                    type: 'boolean',
                    label: 'Use outlined style',
                    default: false
                },
                text: {
                    type: 'boolean',
                    label: 'Use text style',
                    default: false
                }
            }"
            docs=""
        >
            <template #default="{ props }">
                <GButton v-bind="props"
                    @click="handleClick"
                >
                    Click Me ({{ clickCount }})
                </GButton>
            </template>
        </ComponentDemo>

        <div class="additional-demos">
            <ComponentDemo
                additional
                name="Button Sizes"
            >
                <div class="demo-variants">
                    <GButton size="small">Small Button</GButton>
                    <GButton size="medium">Medium Button</GButton>
                    <GButton size="large">Large Button</GButton>
                </div>
            </ComponentDemo>

            <ComponentDemo
                additional
                name="Button Themes"
            >
                <div class="demo-variants">
                    <GButton theme="primary">Primary</GButton>
                    <GButton theme="secondary">Secondary</GButton>
                    <GButton theme="accent">Accent</GButton>
                    <GButton theme="danger">Danger</GButton>
                </div>
            </ComponentDemo>

            <ComponentDemo
                additional
                name="Button Variants"
            >
                <div class="demo-variants">
                    <GButton outlined>Outlined</GButton>
                    <GButton text>Text Button</GButton>
                </div>
            </ComponentDemo>
        </div>
    </section>
</template>

<style scoped>
.demo-variants {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}
</style>
