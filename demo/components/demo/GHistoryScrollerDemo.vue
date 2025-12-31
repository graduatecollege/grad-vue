<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <section id="history-scroller" class="demo-section">
        <h2 class="demo-section__title">History Scroller</h2>
        <ComponentDemo
            name="Basic History Scroller"
            description="Scaffolded demo for GHistoryScroller."
            component="GHistoryScroller"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'History Scroller'
                }
            }"
        >
            <template #docs></template>
            <template #default="{ props }">
                <GHistoryScroller v-bind="props">
                    <p>Example content</p>
                </GHistoryScroller>
            </template>
        </ComponentDemo>
    </section>
</template>
