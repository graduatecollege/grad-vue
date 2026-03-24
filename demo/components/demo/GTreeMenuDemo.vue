<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GTreeMenu } from "@illinois-grad/grad-vue";
import type { TreeMenuItem } from "@illinois-grad/grad-vue";

const bookItems: TreeMenuItem[] = [
    {
        label: "Chapter 1: Introduction",
        children: [
            { label: "1.1 Background", href: "#ch1-background" },
            { label: "1.2 Motivation", href: "#ch1-motivation" },
            {
                label: "1.3 Overview",
                children: [
                    { label: "1.3.1 Part One", href: "#ch1-part1" },
                    { label: "1.3.2 Part Two", href: "#ch1-part2" },
                ],
            },
        ],
    },
    {
        label: "Chapter 2: Methods",
        children: [
            { label: "2.1 Data Collection", href: "#ch2-data" },
            { label: "2.2 Analysis", href: "#ch2-analysis" },
        ],
    },
    {
        label: "Chapter 3: Results",
        children: [
            { label: "3.1 Findings", href: "#ch3-findings" },
            { label: "3.2 Discussion", href: "#ch3-discussion" },
        ],
    },
    { label: "Appendix", href: "#appendix" },
];

const linkedParentItems: TreeMenuItem[] = [
    {
        label: "Chapter 1",
        href: "#ch1",
        children: [
            { label: "Section 1.1", href: "#ch1-s1" },
            { label: "Section 1.2", href: "#ch1-s2" },
        ],
    },
    {
        label: "Chapter 2",
        href: "#ch2",
        children: [
            { label: "Section 2.1", href: "#ch2-s1" },
            { label: "Section 2.2", href: "#ch2-s2" },
        ],
    },
    { label: "References", href: "#refs" },
];
</script>

<template>
    <ComponentSection title="Tree Menu">
        <ComponentDemo
            description="A hierarchical sidebar menu for book-like or nested-section navigation. Items with children collapse and expand individually. Supports keyboard navigation (↑↓ to move, →← to expand/collapse, Home/End)."
            component="GTreeMenu"
            padding="0"
            :props-config="{
                title: {
                    type: 'string',
                    label: 'Title and accessible name',
                    default: 'Contents'
                },
                listType: {
                    type: 'select',
                    label: 'List element type',
                    default: 'ul',
                    options: ['ul', 'ol']
                },
                theme: {
                    type: 'select',
                    label: 'Theme',
                    default: 'light',
                    options: ['light', 'dark']
                }
            }"
        >
            <template #default="{ props }">
                <div style="max-width: 300px;">
                    <GTreeMenu v-bind="props" :items="bookItems" style="min-height: 420px;" />
                </div>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Parent items that also carry a link — the label navigates while the chevron button separately toggles expansion."
            component="GTreeMenu"
            padding="0"
            :show-props="false"
        >
            <template #default>
                <div style="max-width: 300px;">
                    <GTreeMenu
                        title="With Linked Parents"
                        :items="linkedParentItems"
                        style="min-height: 240px;"
                    />
                </div>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Ordered list variant — useful for numbered chapter/section hierarchies."
            component="GTreeMenu"
            padding="0"
            :show-props="false"
        >
            <template #default>
                <div style="max-width: 300px;">
                    <GTreeMenu
                        title="Numbered Chapters"
                        list-type="ol"
                        :items="bookItems"
                        style="min-height: 200px;"
                    />
                </div>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
