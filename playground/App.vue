<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useActiveLinkContent } from "../src/compose/useActiveLink";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import GButton from "../src/components/GButton.vue";

const buttons = useTemplateRef("buttons");
const text = useTemplateRef("text");
const popover = useTemplateRef("popover");

const activeId = ref<string>("");
const alertOpen = ref(false);
const alert2Open = ref(false);

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
                        { label: 'Alert Dialog', href: '#alert-dialog' },
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
                    <GPopover label="Popover Demo">
                        <template #trigger="{ onToggle }">
                            <GButton @click="onToggle">Open popover</GButton>
                        </template>
                        <template #content>
                            <div style="padding: 0.5rem 1rem">
                                Hello from popover a a a a a a a a ab
                            </div>
                            <div style="height: 200px"></div>
                            <div>yo</div>
                        </template>
                    </GPopover>
                </section>
                <section id="alert-dialog" ref="alert">
                    <h2>Alert Dialog</h2>
                    <GButton @click="alertOpen = true"
                        >Open Alert Dialog</GButton
                    >
                    <GAlertDialog
                        v-if="alertOpen"
                        label="Alert Dialog Demo"
                        button-text="Confirm"
                        @cancel="alertOpen = false"
                        @confirm="alertOpen = false"
                    >
                        Foobar
                        <GButton @click="alert2Open = true">Open Alert Dialog 2</GButton>
                    </GAlertDialog>
                    <GAlertDialog
                        v-if="alert2Open"
                        label="Alert Dialog Demo 2"
                        button-text="Confirm"
                        @cancel="alert2Open = false"
                        @confirm="alert2Open = false"
                    >
                        Foobar
                    </GAlertDialog>
                </section>
            </main>
        </div>
    </div>
    <div id="modal-root"></div>
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
