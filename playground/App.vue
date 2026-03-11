<script setup lang="ts">
import { computed, h, onMounted, provide, ref, useTemplateRef } from "vue";

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
</script>

<template>
    <div class="playground">
        <GAppHeader title="grad-vue playground" illinois> </GAppHeader>

        <div class="wrap">
            <main class="main" ref="main">
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
