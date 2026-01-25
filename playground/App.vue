<script setup lang="ts">
import { computed, h, onMounted, provide, ref, useTemplateRef } from "vue";
import { useActiveLinkContent } from "../src/compose/useActiveLink";
import { useSidebar } from "../src/compose/useSidebar";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import GButton from "../src/components/GButton.vue";
import GSelect from "../src/components/GSelect.vue";
import GSearch from "../src/components/GSearch.vue";
import GHistoryScroller from "../src/components/GHistoryScroller.vue";
import GSelectButton from "../src/components/GSelectButton.vue";
import GSidebar from "../src/components/GSidebar.vue";
import GTable from "../src/components/GTable.vue";
import { TableColumn } from "../src/components/table/TableColumn";
import { useFiltering } from "../src/compose/useFiltering";
import GTablePagination from "../src/components/table/GTablePagination.vue";
import GModal from "../src/components/GModal.vue";
import { useOverlayStack, useOverlayStackState } from "../src/grad-vue";
import GOverlay from "../src/components/GOverlay.vue";
import GHamburgerMenu from "../src/components/GHamburgerMenu.vue";
import GDetailListItem from "../src/components/detail-list/GDetailListItem.vue";
import GDetailList from "../src/components/GDetailList.vue";

const sidebar = useSidebar();

provide("sidebar", sidebar);

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
    { id: "twelve" },
    { id: "eleven" },
    { id: "ten" },
    { id: "nine" },
    { id: "eight" },
    { id: "seven" },
    { id: "six" },
    { id: "five" },
    { id: "four" },
    { id: "three" },
    { id: "two" },
    { id: "one" },
]);

interface TableEntry {
    key: string;
    name: string;
    abbr: string;
    collegeInName: boolean;
}

const columns = computed<TableColumn<TableEntry>[]>(() => {
    return [
        {
            key: "key",
            label: "Code",
            sortable: true,
        },
        {
            key: "name",
            label: "Name",
            sortable: true,
        },
        {
            key: "abbr",
            label: "Abbreviation",
            sortable: true,
        },
        {
            key: "collegeInName",
            label: "'College' in Name",
            sortable: true,
            display: (row) => h("span", row.collegeInName ? "Yes" : "No"),
            filter: {
                type: "select",
                options: [
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" },
                ],
                placeholder: "Any",
            },
        },
    ];
});

const tableData = ref<TableEntry[]>([
    {
        key: "LT",
        name: "Carle Illinois College of Medicine",
        abbr: "COM",
        collegeInName: true,
    },
    {
        key: "KL",
        name: "College of Agricultural, Consumer and Environmental Sciences (ACES)",
        abbr: "ACES",
        collegeInName: true,
    },
    {
        key: "KY",
        name: "College of Applied Health Sciences",
        abbr: "AHS",
        collegeInName: true,
    },
    {
        key: "KN",
        name: "College of Education",
        abbr: "EDUC",
        collegeInName: true,
    },
    {
        key: "KR",
        name: "College of Fine and Applied Arts",
        abbr: "FAA",
        collegeInName: true,
    },
    {
        key: "KU",
        name: "College of Law",
        abbr: "LAW",
        collegeInName: true,
    },
    {
        key: "KV",
        name: "College of Liberal Arts and Sciences",
        abbr: "LAS",
        collegeInName: true,
    },
    {
        key: "KT",
        name: "College of Media",
        abbr: "Media",
        collegeInName: true,
    },
    {
        key: "LC",
        name: "College of Veterinary Medicine",
        abbr: "V MED",
        collegeInName: true,
    },
    {
        key: "KW",
        name: "Division of Exploratory Studies",
        abbr: "DES",
        collegeInName: false,
    },
    {
        key: "KM",
        name: "Gies College of Business",
        abbr: "BUS",
        collegeInName: true,
    },
    {
        key: "KS",
        name: "Graduate College",
        abbr: "GRAD",
        collegeInName: true,
    },
    {
        key: "KP",
        name: "Grainger College of Engineering",
        abbr: "ENGR",
        collegeInName: true,
    },
    {
        key: "LP",
        name: "School of Information Sciences",
        abbr: "SIS",
        collegeInName: false,
    },
    {
        key: "LG",
        name: "School of Labor and Employment Relations",
        abbr: "LER",
        collegeInName: false,
    },
    {
        key: "LL",
        name: "School of Social Work",
        abbr: "SOC W",
        collegeInName: false,
    },
]);

const filtering = useFiltering({
    key: "",
    name: "",
    abbr: "",
    collegeInName: false,
});

const { filters, isFiltered, clearFilters } = filtering;

const sortField = ref<keyof TableEntry | undefined>(undefined);
const sortOrder = ref<1 | -1 | undefined>(undefined);
const start = ref(0);
const pageSize = ref(5);
const selectedRows = ref<string[]>([]);

const bulkActions = [
    { id: "delete", label: "Delete", theme: "danger" as const },
    { id: "export", label: "Export" },
    { id: "archive", label: "Archive", theme: "secondary" as const },
];

function handleBulkAction(actionId: string, selectedKeys: string[]) {
    console.log(`Bulk action "${actionId}" on rows:`, selectedKeys);
    alert(`Action "${actionId}" performed on ${selectedKeys.length} row(s)`);
}

const filteredData = computed(() => {
    let data = [...tableData.value];
    for (let [key, val] of Object.entries(filters.value)) {
        if (val) {
            data = data.filter((item) =>
                val === "yes"
                    ? item[key as keyof typeof item]
                    : !item[key as keyof typeof item],
            );
        }
    }
    return data;
});

const computedData = computed(() => {
    let data = [...filteredData.value];
    if (sortField.value) {
        data.sort((a: any, b: any) => {
            const aVal: any = a[sortField.value!];
            const bVal: any = b[sortField.value!];
            const sortVal = (aVal?.toString() ?? "").localeCompare(
                bVal?.toString() ?? "",
            );
            return sortOrder.value === 1 ? sortVal : sortVal * -1;
        });
    }

    data = data.slice(start.value, start.value + pageSize.value);

    return data;
});

const showModal = ref(false);
</script>

<template>
    <div class="playground">
        <GAppHeader title="grad-vue playground" illinois>
            <template #app-controls>
                <GHamburgerMenu />
            </template>
        </GAppHeader>

        <div
            class="wrap"
            :class="{
                'sidebar-open': sidebar.open.value,
                'sidebar-collapsible': sidebar.isCollapsible.value,
            }"
        >
            <GSidebar
                class="sidebar"
                theme="light"
                top-offset-var="--g-toolbar-height"
            >
                <GSidebarMenu
                    label="Component List"
                    class="sidebar-menu"
                    title="Components"
                    theme="light"
                    :items="[
                        { label: 'Buttons', href: '#buttons' },
                        { label: 'Search', href: '#search' },
                        { label: 'Text Input', href: '#text-input' },
                        { label: 'Select', href: '#select' },
                        { label: 'Select Buttons', href: '#select-buttons' },
                        { label: 'Popover', href: '#popover' },
                        { label: 'Alert Dialog', href: '#alert-dialog' },
                        { label: 'Clipboard', href: '#clipboard' },
                        {
                            label: 'History Scroller',
                            href: '#history-scroller',
                        },
                        {
                            label: 'Three Way Toggle',
                            href: '#three-way-toggle',
                        },
                        { label: 'Modal', href: '#modal' },
                        { label: 'Detail List', href: '#detail-list' },
                    ]"
                    v-model="activeId"
                />
            </GSidebar>
            <main class="main" ref="main">
                <section id="table">
                    <h2>Table</h2>
                    <GTable
                        label="Colleges"
                        :data="computedData"
                        :columns="columns"
                        :filtering="filtering"
                        :filter="filters"
                        :result-count="filteredData.length"
                        :start-index="start"
                        :bulk-selection-enabled="true"
                        :bulk-actions="bulkActions"
                        v-model:sort-field="sortField"
                        v-model:sort-order="sortOrder"
                        v-model:selected-rows="selectedRows"
                        @bulk-action="handleBulkAction"
                    >
                        <template #pagination>
                            <GTablePagination
                                v-model:start="start"
                                v-model:page-size="pageSize"
                                :total="filteredData.length"
                                :page-sizes="[5, 10, 50]"
                            />
                        </template>
                    </GTable>
                </section>
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
                    <GTextInput
                        label="Text Input"
                        placeholder="Type here..."
                        error="It's bad"
                    />
                    <GTextInput
                        label="Text Input"
                        placeholder="Type here..."
                        instructions="This is very instructive!"
                    >
                    </GTextInput>
                    <div style="height: 500px"></div>
                </section>
                <section id="select" style="max-width: 400px">
                    <h2>Select</h2>
                    <div style="display: flex">
                        <GSelect
                            v-model="selectValue"
                            label="Select"
                            clear-button
                            :options="['foo', 'bar', 'baz']"
                            compact
                        />
                        <GSelect
                            v-model="selectValue"
                            label="Select 2"
                            clear-button
                            :options="['foo', 'bar', 'baz']"
                            searchable
                            compact
                        />
                    </div>
                </section>

                <section id="select-buttons">
                    <h2>Select Buttons</h2>
                    <GSelectButton
                        v-model="select"
                        label="Select"
                        :options="['foo', 'bar', 'baz']"
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
                    <GHistoryScroller
                        :entries="historyEntries"
                        class="history-scroller"
                    >
                        <template #default="{ entry }">
                            <div class="history-entry">
                                This is history for: {{ entry.id }}
                            </div>
                        </template>
                    </GHistoryScroller>
                </section>
                <section id="three-way-toggle" style="max-width: 200px">
                    <h2>Three Way Toggle</h2>
                    <GThreeWayToggle
                        label="Three Way Toggle"
                        :modelValue="null"
                    />
                </section>
                <section id="modal">
                    <h2>Modal</h2>
                    <GButton @click="showModal = true">Open Modal</GButton>
                    <GModal
                        v-if="showModal"
                        label="Modal Fun Time"
                        size="large"
                        @close="showModal = false"
                    >
                        <p>Example content</p>
                    </GModal>
                </section>
                <section id="detail-list">
                    <h2>Detail List</h2>
                    <GDetailList label="Detail List">
                        <GDetailListItem label="Major"
                            >Engineering</GDetailListItem
                        >
                        <GDetailListItem label="Minor"
                            >Computer Science</GDetailListItem
                        >
                        <GDetailListItem label="GPA">3.8</GDetailListItem>
                        <GDetailListItem label="Honors">Yes</GDetailListItem>
                        <GDetailListItem label="Activities"
                            >None</GDetailListItem
                        >
                    </GDetailList>
                    <GDetailList label="Detail List" variant="vertical">
                        <GDetailListItem label="Major"
                            >Engineering</GDetailListItem
                        >
                        <GDetailListItem label="Minor"
                            >Computer Science</GDetailListItem
                        >
                        <GDetailListItem label="GPA">3.8</GDetailListItem>
                        <GDetailListItem label="Honors">Yes</GDetailListItem>
                        <GDetailListItem label="Activities"
                            >None</GDetailListItem
                        >
                    </GDetailList>
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
