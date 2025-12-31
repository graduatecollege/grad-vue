<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useActiveLinkContent } from "../src/compose/useActiveLink";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import GButton from "../src/components/GButton.vue";
import GSelect from "../src/components/GSelect.vue";
import GSearch from "../src/components/GSearch.vue";
import GHistoryScroller from "../src/components/GHistoryScroller.vue";

const buttons = useTemplateRef("buttons");
const text = useTemplateRef("text");
const popover = useTemplateRef("popover");

const activeId = ref<string>("");
const alertOpen = ref(false);
const alert2Open = ref(false);

const selectValue = ref("");

const main = useTemplateRef("main");

onMounted(() => {
    useActiveLinkContent(main, 70, activeId);
});
const searchQuery = ref("");
const select = ref("");
const searchLoading = ref(false);

interface SearchResult {
    id: string | number;
    title: string;
}

const searchData = ref<SearchResult[]>([
    { id: 1, title: "The Quick Fox" },
    { id: 2, title: "The Lazy Dog" },
    { id: 3, title: "The Brown Bear" },
    { id: 4, title: "The Quick Brown Fox" },
    { id: 5, title: "The Quick Brown Fox Jumps Over The Lazy Dog" },
]);
const searchResults = ref<SearchResult[]>([]);

function submit(query: string) {
    console.log("submit", query);
    searchLoading.value = true;
    setTimeout(() => {
        searchResults.value = searchData.value.filter((result) =>
            result.title.toLowerCase().includes(query.toLowerCase()),
        );
        searchLoading.value = false;
    }, 2000);
}
function selected(item: SearchResult) {
    console.log("Selected:", item);
    select.value = item.title;
}

const historyEntries = ref([
    {id: "twelve"},
    {id: "eleven"},
    {id: "ten"},
    {id: "nine"},
    {id: "eight"},
    {id: "seven"},
    {id: "six"},
    {id: "five"},
    {id: "four"},
    {id: "three"},
    {id: "two"},
    {id: "one"},
])

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
                        { label: 'Search', href: '#search' },
                        { label: 'Text Input', href: '#text-input' },
                        { label: 'Select', href: '#select' },
                        { label: 'Popover', href: '#popover' },
                        { label: 'Alert Dialog', href: '#alert-dialog' },
                                            { label: 'Clipboard', href: '#clipboard' },
                        { label: 'History Scroller', href: '#history-scroller' },
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

                <section id="search" ref="search">
                    <GSearch
                        label="Search"
                        v-model="searchQuery"
                        @submit="submit"
                        @select="selected"
                        :results="searchResults"
                        :loading="searchLoading"
                    />
                </section>

                <section id="text-input" ref="text">
                    <h2>Text Input</h2>
                    <GTextInput placeholder="Type here..." error="It's bad" />
                    <div style="height: 500px"></div>
                </section>
                <section id="select" style="max-width: 400px">
                    <h2>Select</h2>
                    <GSelect
                        v-model="selectValue"
                        label="Select"
                        clear-button
                        :options="['foo', 'bar', 'baz']"
                    />
                    <GSelect
                        v-model="selectValue"
                        label="Select 2"
                        clear-button
                        :options="['foo', 'bar', 'baz']"
                        searchable
                    />
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
                        <GButton @click="alert2Open = true"
                            >Open Alert Dialog 2</GButton
                        >
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
                <section id="clipboard">
                    <h2>Clipboard</h2>
                    <GClipboard text="Clipboard text"></GClipboard>
                </section>
                <section id="history-scroller">
                    <h2>History Scroller</h2>
                    <GHistoryScroller :entries="historyEntries" class="history-scroller">
                        <template #default="{ entry }">
                            <div class="history-entry">
                                This is history for: {{ entry.id }}
                            </div>
                        </template>

                    </GHistoryScroller>
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
