<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useActiveLinkContent } from "../src/compose/useActiveLink";

const buttons = useTemplateRef("buttons");
const text = useTemplateRef("text");
const popover = useTemplateRef("popover");

const activeId = ref<string>("");

const main = useTemplateRef("main");

onMounted(() => {
    useActiveLinkContent(main, 70, activeId);
});

</script>

<template>
    <div class="playground">
        <GAppHeader title="grad-vue playground" illinois />

        <div class="wrap">
            <GSidebar class="sidebar" theme="light">
                <GSidebarMenu
                    class="sidebar-menu"
                    title="Components"
                    theme="light"
                    :items="[
                        { label: 'Buttons', href: '#buttons' },
                        { label: 'Text Input', href: '#text-input' },
                        { label: 'Popover', href: '#popover' },
                    ]"
                    v-model="activeId"
                />
            </GSidebar>
            <main class="main" ref="main">
                <section id="buttons" ref="buttons">
                    <h2>Buttons</h2>
                    <GButton>Default</GButton>
                    <GButton variant="primary">Primary</GButton>
                    <div style="height: 500px"></div>
                </section>

                <section id="text-input" ref="text">
                    <h2>Text Input</h2>
                    <GTextInput placeholder="Type here..." />
                    <div style="height: 500px"></div>
                </section>

                <section id="popover" ref="popover">
                    <h2>Popover</h2>
                    <GPopover>
                        <template #trigger>
                            <GButton>Open popover</GButton>
                        </template>
                        <div style="padding: 0.5rem 1rem">
                            Hello from popover
                        </div>
                        <div style="height: 500px"></div>
                    </GPopover>
                </section>
            </main>
        </div>
    </div>
</template>

<style scoped>
.wrap {
    padding-left: 300px;
}

.sidebar {
    position: fixed;
    left: 0;
    top: var(--g-toolbar-height);
    bottom: 0;
    width: 300px;
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

.sidebar-menu {
    margin-top: 3rem;
}
</style>
