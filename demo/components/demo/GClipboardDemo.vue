<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <section id="clipboard" class="demo-section">
        <h2 class="demo-section__title">Clipboard</h2>
        <ComponentDemo
            name="Basic Clipboard"
            description="Scaffolded demo for GClipboard."
            component="GClipboard"
            :props-config="{
                text: {
                    type: 'string',
                    label: 'Text',
                    default: 'This is some text to get copied'
                }
            }"
        >
            <template #default="{ props }">
                <GClipboard v-bind="props" />
            </template>
        </ComponentDemo>
    </section>
</template>
