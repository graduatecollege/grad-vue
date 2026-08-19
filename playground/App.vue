<script setup lang="ts">
import {
    computed,
    h,
    onMounted,
    provide,
    ref,
    useTemplateRef,
    watch,
} from "vue";
import {
    useFiltering,
    type TableColumn,
    type TableSort,
} from "../packages/grad-vue/src/grad-vue";

interface PlaygroundTableEntry {
    key: string;
    code: string;
    name: string;
    abbr: string;
    unitType: string;
    collegeInName: boolean;
}

const playgroundTableColumns: TableColumn<PlaygroundTableEntry>[] = [
    {
        key: "code",
        label: "Code",
        sortable: true,
    },
    {
        key: "name",
        label: "Name",
        sortable: true,
        filter: {
            type: "search",
            placeholder: "Search name",
        },
    },
    {
        key: "abbr",
        label: "Abbreviation",
        sortable: true,
    },
    {
        key: "unitType",
        label: "Unit Type",
        sortable: true,
        filter: {
            type: "select",
            options: [
                { label: "College", value: "College" },
                { label: "School", value: "School" },
                { label: "Institute", value: "Institute" },
                { label: "Division", value: "Division" },
            ],
            placeholder: "Any type",
        },
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

const playgroundTableRows: PlaygroundTableEntry[] = [
    {
        key: "LT",
        code: "LT",
        name: "Carle Illinois College of Medicine",
        abbr: "COM",
        unitType: "College",
        collegeInName: true,
    },
    {
        key: "KL",
        code: "KL",
        name: "College of Agricultural, Consumer and Environmental Sciences (ACES)",
        abbr: "ACES",
        unitType: "College",
        collegeInName: true,
    },
    {
        key: "KY",
        code: "KY",
        name: "College of Applied Health Sciences",
        abbr: "AHS",
        unitType: "College",
        collegeInName: true,
    },
    {
        key: "KN",
        code: "KN",
        name: "College of Education",
        abbr: "EDUC",
        unitType: "College",
        collegeInName: true,
    },
    {
        key: "KO",
        code: "KO",
        name: "Gies College of Business",
        abbr: "GIES",
        unitType: "College",
        collegeInName: true,
    },
    {
        key: "KP",
        code: "KP",
        name: "Grainger College of Engineering",
        abbr: "ENGR",
        unitType: "College",
        collegeInName: true,
    },
    {
        key: "LP",
        code: "LP",
        name: "School of Information Sciences",
        abbr: "IS",
        unitType: "School",
        collegeInName: false,
    },
    {
        key: "KW",
        code: "KW",
        name: "Division of Exploratory Studies",
        abbr: "DES",
        unitType: "Division",
        collegeInName: false,
    },
];

const playgroundFiltering = useFiltering({
    code: undefined as string | undefined,
    name: undefined as string | undefined,
    abbr: undefined as string | undefined,
    unitType: undefined as string | undefined,
    collegeInName: undefined as string | undefined,
});

const { filters: playgroundFilters } = playgroundFiltering;
const playgroundSorts = ref<TableSort<PlaygroundTableEntry>[]>([]);
const playgroundStart = ref(0);
const playgroundPageSize = ref(5);
const playgroundColumnVisibility = ref({
    code: true,
    name: true,
    abbr: true,
    unitType: true,
    collegeInName: true,
});

const playgroundFilteredRows = computed(() => {
    return playgroundTableRows.filter((row) => {
        if (
            playgroundFilters.name &&
            !row.name
                .toLowerCase()
                .includes(playgroundFilters.name.toLowerCase())
        ) {
            return false;
        }

        if (
            playgroundFilters.unitType &&
            row.unitType !== playgroundFilters.unitType
        ) {
            return false;
        }

        if (playgroundFilters.collegeInName) {
            const expectsCollege = playgroundFilters.collegeInName === "yes";
            if (row.collegeInName !== expectsCollege) {
                return false;
            }
        }

        return true;
    });
});

const playgroundSortedRows = computed(() => {
    const sortedRows = [...playgroundFilteredRows.value];

    if (!playgroundSorts.value.length) {
        return sortedRows;
    }

    return sortedRows.sort((a, b) => {
        for (const sort of playgroundSorts.value) {
            const sortValue = String(a[sort.key] ?? "").localeCompare(
                String(b[sort.key] ?? ""),
            );

            if (sortValue !== 0) {
                return sortValue * sort.order;
            }
        }

        return 0;
    });
});

const playgroundVisibleRows = computed(() => {
    return playgroundSortedRows.value.slice(
        playgroundStart.value,
        playgroundStart.value + playgroundPageSize.value,
    );
});

watch([playgroundFilteredRows, playgroundPageSize], ([rows]) => {
    if (playgroundStart.value >= rows.length) {
        playgroundStart.value = 0;
    }
});

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
                <section class="playground-table-demo">
                    <h2>GTable Playground</h2>
                    <p class="playground-table-demo__note">
                        Keep a live table at the top of the playground for
                        faster iteration on table layout, filters, and
                        pagination.
                    </p>
                    <!-- @vue-generic {PlaygroundTableEntry, TableColumn<PlaygroundTableEntry>} -->
                    <GTable
                        label="Playground development table"
                        :data="playgroundVisibleRows"
                        :columns="playgroundTableColumns"
                        :filtering="playgroundFiltering"
                        :filter="playgroundFilters"
                        :result-count="playgroundFilteredRows.length"
                        :start-index="playgroundStart"
                        v-model:sorts="playgroundSorts"
                        v-model:column-visibility="playgroundColumnVisibility"
                    >
                        <template #pagination>
                            <GTablePagination
                                v-model:start="playgroundStart"
                                v-model:page-size="playgroundPageSize"
                                :total="playgroundFilteredRows.length"
                                :page-sizes="[5, 10, 25]"
                            />
                        </template>
                    </GTable>
                </section>
                <div>
                    <GHamburgerMenu label="Menu" style="display: flex;">

                    </GHamburgerMenu>
                    <GTextarea></GTextarea>
                    <GFileInput
                        label="File Input"
                        instructions="Upload a file"
                    />
                    <GFileInput
                        disabled
                        label="File Input"
                        instructions="Upload a file"
                    />
                    <GFileInput
                        :errors="['There is a problem!']"
                        label="File Input"
                        instructions="Upload a file"
                    />
                    <GFileInput
                        label="File Input"
                        instructions="Upload a file or more"
                        multiple
                    />
                </div>
                <div style="max-width: 320px">
                    <GTreeMenu heading="With Linked Parents" style="min-height: 240px;" show-expand-all>
                        <GTreeMenuList>
                            <GTreeMenuItem label="Chapter 1">
                                <a href="#ch1">Chapter 1</a>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch1-s1">Section 1.1</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch1-s2">Section 1.2</a></GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem label="Chapter 2">
                                <a href="#ch2">Chapter 2</a>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch2-s1">Minimum Requirements for Admission</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch2-s2">Minimum Requirements for Admission</a></GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem><a href="#refs">References</a></GTreeMenuItem>
                        </GTreeMenuList>
                    </GTreeMenu>
                    <GTreeMenu heading="Numbered Chapters" small-heading style="min-height: 200px;" storage-key="tree-menu-state">
                        <GTreeMenuList list-type="ol">
                            <GTreeMenuItem label="Chapter 1: Introduction">
                                <button>Chapter 1: Introduction</button>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch1-background">1.1 Background</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch1-motivation">1.2 Motivation</a></GTreeMenuItem>
                                    <GTreeMenuItem label="1.3 Overview">
                                        1.3 Overview
                                        <template #children>
                                            <GTreeMenuItem><a href="#ch1-part1">1.3.1 Part One</a></GTreeMenuItem>
                                            <GTreeMenuItem><a href="#ch1-part2">1.3.2 Part Two</a></GTreeMenuItem>
                                        </template>
                                    </GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem label="Chapter 2: Methods">
                                <button>Chapter 2: Methods</button>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch2-data">2.1 Data Collection</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch2-analysis">2.2 Analysis</a></GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem label="Chapter 3: Results">
                                <button>Chapter 3: Results</button>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch3-findings">3.1 Findings</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch3-discussion">3.2 Discussion</a></GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem><a href="#appendix">Appendix</a></GTreeMenuItem>
                        </GTreeMenuList>
                    </GTreeMenu>
                </div>
                <div style="max-width: 500px;">
                    <GDetailList>
                        <GDetailListItem label="Description">Engineering: Energy Systems</GDetailListItem>
                        <GDetailListItem label="Major">Engineering</GDetailListItem>
                        <GDetailListItem label="Department Code">123</GDetailListItem>
                        <GDetailListItem label="College Name">Grainger Engineering</GDetailListItem>
                    </GDetailList>
                </div>
                <section id="modal-popovers">
                    <h2>Modal and Popovers</h2>
                    <GButton v-gtooltip="'Real Button'">Button</GButton>
                    <GPopover>
                        <template #trigger="{ toggle }">
                            <GButton @click="toggle">Open Popover</GButton>
                            <GTooltip text="Sibling tooltip"/>
                        </template>
                        <p>This popover is inside a modal and should be positioned correctly.
                            <GButton v-gtooltip="'Real Button 2'">Button</GButton>
                        </p>
                    </GPopover>
                </section>
                <section id="popover-scroll-demo">
                    <h2>Oversized Popover</h2>
                    <p class="popover-scroll-demo-note">
                        This example intentionally makes the popover taller than the viewport so you can confirm the contents scroll.
                    </p>
                    <GPopover>
                        <template #trigger="{ toggle }">
                            <GButton @click="toggle">Open Tall Popover</GButton>
                        </template>
                        <div class="popover-scroll-demo">
                            <h3>Scrollable popover content</h3>
                            <p>
                                If the popover is taller than the screen, the
                                outer popover should stay inside the viewport
                                and this content area should scroll.
                            </p>
                            <p v-for="index in 18" :key="index">
                                Example content block {{ index }}. Keep
                                scrolling to make sure interactive content near
                                the end stays reachable.
                            </p>
                            <GButton theme="secondary">
                                Action near the bottom
                            </GButton>
                        </div>
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

.popover-scroll-demo-note {
    max-width: 40rem;
}

.playground-table-demo__note {
    max-width: 42rem;
}

.playground-table-demo :deep(.g-table-controls),
.playground-table-demo :deep(.g-table-head) {
    position: static;
}

.playground-table-demo :deep(.g-table-table-wrap) {
    overflow-x: auto;
}

.playground-table-demo :deep(#v-0-th-name) {
    min-width: 22rem;
}

.popover-scroll-demo {
    width: min(20rem, 100%);
}

.popover-scroll-demo h3 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
}
</style>
