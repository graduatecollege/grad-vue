<script setup lang="ts">
import { computed, h, onMounted, provide, ref, useTemplateRef } from "vue";
import type { TreeMenuItem } from "../packages/grad-vue/src/grad-vue";

const formData = ref<Record<string, any>>({});
const submitResult = ref<string>("");

const textErrors = computed(() => {
    const errors: string[] = [];
    const text = formData.value.firstName;
    if (text && text.length < 5) {
        errors.push("Text is too short");
    }
    return errors;
});

// Example: reactive errors for validation
const emailErrors = computed(() => {
    const errors: string[] = [];
    const email = formData.value.email;
    if (email && !email.includes("@")) {
        errors.push("Email must contain @");
    }
    if (email && email.length < 5) {
        errors.push("Email is too short");
    }
    return errors;
});

function handleSubmit(values: Record<string, any>) {
    submitResult.value = `Form submitted with: ${JSON.stringify(values, null, 2)}`;
}

const fname = ref("heh");

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
</script>

<template>
    <div class="playground">
        <GAppHeader title="grad-vue playground" illinois> </GAppHeader>

        <div class="wrap">
            <main class="main" ref="main">
                <div style="max-width: 320px">
                    <GTreeMenu
                        title="With Linked Parents"
                        :items="linkedParentItems"
                        style="min-height: 240px;"
                    />
                    <GTreeMenu
                        title="Numbered Chapters"
                        list-type="ol"
                        :items="bookItems"
                        style="min-height: 200px;"
                    />
                </div>
                <div style="max-width: 500px;">
                    <GDetailList>
                        <GDetailListItem label="Description">Engineering: Energy Systems</GDetailListItem>
                        <GDetailListItem label="Major">Engineering</GDetailListItem>
                        <GDetailListItem label="Department Code">123</GDetailListItem>
                        <GDetailListItem label="College Name">Grainger Engineering</GDetailListItem>
                    </GDetailList>
                </div>
                <section id="buttons">
                    <h2>Buttons (with icons)</h2>
                    <div>
                        <GButton theme="primary"> Primary </GButton>
                        <GButton theme="accent" outlined icon="demo-icon">
                            Accent Outlined
                        </GButton>
                        <GButton theme="secondary" text icon="demo-icon">
                            Secondary Text
                        </GButton>

                        <GButton theme="primary" outlined>
                            <template #icon>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        stroke="currentColor"
                                        fill="currentColor"
                                        d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"
                                    />
                                </svg>
                            </template>
                            With SVG Slot
                        </GButton>
                    </div>
                    <div>
                        <GButton size="small" theme="primary"> Primary </GButton>
                        <GButton size="small" theme="accent" outlined icon="demo-icon">
                            Accent Outlined
                        </GButton>
                        <GButton size="small" theme="secondary" text icon="demo-icon">
                            Secondary Text
                        </GButton>

                        <GButton size="small" theme="primary" outlined>
                            <template #icon>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"
                                    />
                                </svg>
                            </template>
                            With SVG Slot
                        </GButton>
                    </div>
                    <div>
                        <GButton size="large" theme="primary"> Primary </GButton>
                        <GButton size="large" theme="accent" outlined icon="demo-icon">
                            Accent
                        </GButton>
                        <GButton size="large" theme="secondary" text icon="demo-icon">
                            Secondary
                        </GButton>

                        <GButton size="large" theme="primary" outlined>
                            <template #icon>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"
                                    />
                                </svg>
                            </template>
                            With SVG
                        </GButton>
                    </div>
                </section>
                <section id="modal-popovers">
                    <h2>Modal and Popovers</h2>
                    <GButton v-gtooltip="'Real Button'">Button</GButton>
                    <GPopover>
                        <template #trigger="{ toggle }">
                            <GButton @click="toggle">Open Popover</GButton>
                        </template>
                        <p>This popover is inside a modal and should be positioned correctly.
                            <GButton v-gtooltip="'Real Button 2'">Button</GButton>
                        </p>
                    </GPopover>
                </section>
            </main>
        </div>
    </div>
    <GOverlay />
</template>

<style scoped>
.wrap {
    margin-top: var(--g-toolbar-height);
}
.wrap:not(.sidebar-collapsible) {
    padding-left: 300px;
}

.main {
    padding: 2rem;
}

section {
    margin: 1.5rem 0 2rem;
}
h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
}
section > *:not(h2) {
    margin-right: 0.5rem;
}

#buttons > div {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
}

/* Playground-only icon class to visualize the icon prop
   Use a UTF-8 star so it behaves like a font icon kit. */
:deep(.demo-icon) {
    line-height: 1;
    color: currentColor;
    -webkit-font-smoothing: antialiased;
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
}

:deep(.demo-icon)::before {
    content: "★"; /* simple UTF-8 icon glyph */
    text-decoration: inherit;
    vertical-align: inherit;
}

.history-scroller {
    display: block;
    height: 200px;
    width: 500px;
}

.history-entry {
    font-size: 1.125rem;
    line-height: 1.5rem;
}
</style>
