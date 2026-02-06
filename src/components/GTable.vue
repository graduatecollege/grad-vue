<script setup lang="ts" generic="T extends TableRow, C extends TableColumn<T>">
/**
 * A data table component with support for grouping, sorting, filtering, and pagination.
 *
 * A heavy focus has been on performance. The table body doesn't use any
 * Vue components, it's pure render functions. We've used it with
 * 4000 rows and 14 columns loaded without issues.
 *
 * This is a bit complicated to use, so an example has been omitted here.
 * Instead, look at the source for this demo: [GTable Demo Source](https://github.com/graduatecollege/grad-vue/blob/main/demo/components/demo/GTableDemo.vue).
 *
 * Here are some of the key points.
 *
 * Table content is provided with:
 * - `columns` configuration using the `TableColumn` type.
 *   - At minimum the configuration must include `key` for which field of the data
 *     objects to use, and `label` for the column header.
 *   - `sortable: true` makes the column sortable.
 *   - `filter` can be used to provide a `TableColumnFilter` configuration.
 *   - `display` accepts a custom render function for the column data.
 *   - `trClass` and `tdClass` can be used to provide custom classes for table rows and cells.
 * - `data` array with objects containing fields for the columns.
 *
 * Rows can be made clickable with `row-clickable`. In this case, one of the
 * cells must contain a link. Clicking a row will emit a `row-click` event
 * with the link `href` from the first link in the row.
 *
 * Grouping can be enabled by passing a column key to `groupBy`.
 */
import GTableBody from "./table/GTableBody.vue";
import GPopover from "./GPopover.vue";
import { TableColumn, TableRow } from "./table/TableColumn.ts";
import {
    computed,
    onMounted,
    ref,
    useId,
    useTemplateRef,
    VNode,
    watch,
} from "vue";
import GSelect from "./GSelect.vue";
import { UseFilteringReturn } from "../compose/useFiltering.ts";
import GButton from "./GButton.vue";

export interface BulkAction {
    /**
     * Action identifier
     */
    id: string;
    /**
     * Action label
     */
    label: string;
    /**
     * Action theme/color
     */
    theme?: "primary" | "secondary" | "accent" | "danger";
}

type Props = {
    /**
     * Accessible label
     */
    label: string; // Demo: Colleges
    data: T[];
    columns: C[];
    resultCount?: number;
    groupBy?: keyof T;
    filtering: UseFilteringReturn<any>;
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
    startIndex: number;
    /**
     * Enable bulk selection with checkboxes
     */
    bulkSelectionEnabled?: boolean;
    // Array of actions to show in the sticky toolbar when rows are selected
    bulkActions?: BulkAction[];
};

const sortField = defineModel<keyof T>("sortField");
const sortOrder = defineModel<1 | -1>("sortOrder");
const filter = defineModel<Partial<Record<keyof T, any>>>("filter", {
    required: true,
});
const selectedRows = defineModel<string[]>("selectedRows", {
    default: () => [],
});

const props = withDefaults(defineProps<Props>(), {
    bulkSelectionEnabled: false,
    bulkActions: () => [],
});

const emit = defineEmits<{
    (e: "row-click", link: string): void;
    (e: "bulk-action", actionId: string, selectedKeys: string[]): void;
    (e: "cell-change", payload: { row: T; column: C; value: any }): void;
}>();

function onSort(col: TableColumn<T>) {
    if (!col.sortable) {
        return;
    }
    if (sortField.value === col.key) {
        if (sortOrder.value === 1) {
            sortOrder.value = -1;
        } else if (sortOrder.value === -1) {
            sortField.value = undefined as any;
            sortOrder.value = 1;
        }
    } else {
        sortField.value = col.key;
        sortOrder.value = 1;
    }
}

const { filters, filteredColumns, isFiltered, clearFilters } = props.filtering;

// Bulk selection logic
const allRowKeys = computed(() => props.data.map((row) => row.key));
const selectedRowsOnPage = computed(() => {
    return selectedRows.value.filter((key) => allRowKeys.value.includes(key));
});
const allSelected = computed(() => {
    if (!props.bulkSelectionEnabled || props.data.length === 0) {
        return false;
    }
    return selectedRowsOnPage.value.length === allRowKeys.value.length;
});
const someSelected = computed(() => {
    if (!props.bulkSelectionEnabled || props.data.length === 0) {
        return false;
    }
    return (
        selectedRowsOnPage.value.length > 0 &&
        selectedRowsOnPage.value.length < allRowKeys.value.length
    );
});

const lastClickedRowKey = ref<string | null>(null);

function toggleAllRows() {
    if (allSelected.value) {
        // Deselect all rows on current page
        selectedRows.value = selectedRows.value.filter(
            (key) => !allRowKeys.value.includes(key),
        );
    } else {
        // Select all rows on current page
        const newSelected = new Set(selectedRows.value);
        allRowKeys.value.forEach((key) => newSelected.add(key));
        selectedRows.value = Array.from(newSelected);
    }
}

function toggleRow(rowKey: string, shiftKey: boolean = false) {
    if (shiftKey && lastClickedRowKey.value) {
        // Handle shift-click range selection
        const lastIndex = allRowKeys.value.indexOf(lastClickedRowKey.value);
        const currentIndex = allRowKeys.value.indexOf(rowKey);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rowsInRange = allRowKeys.value.slice(start, end + 1);
            
            // Select all rows in the range
            const newSelected = new Set(selectedRows.value);
            rowsInRange.forEach((key) => newSelected.add(key));
            selectedRows.value = Array.from(newSelected);
        }
    } else {
        // Normal toggle behavior
        if (selectedRows.value.includes(rowKey)) {
            selectedRows.value = selectedRows.value.filter((key) => key !== rowKey);
        } else {
            selectedRows.value = [...selectedRows.value, rowKey];
        }
    }
    
    // Update last clicked row
    lastClickedRowKey.value = rowKey;
}

function clickRow(link: string) {
    emit("row-click", link);
}

function handleBulkAction(actionId: string) {
    emit("bulk-action", actionId, selectedRows.value);
}

function handleCellChange(payload: { row: T; column: C; value: any }) {
    // Update the reactive data
    payload.row[payload.column.key as keyof T] = payload.value;
    // Emit the change event
    emit("cell-change", payload);
}

const id = useId();

onMounted(() => {
    if (props.rowClickable && props.bulkSelectionEnabled) {
        console.warn(
            "GTable: rowClickable and bulkSelectionEnabled cannot be used together. rowClickable will be ignored.",
        );
    }
    for (const col of props.columns) {
        if (col.editable && col.display) {
            console.warn(
                `GTable: Column "${String(col.key)}" has both 'editable' and 'display' configured. 'display' will be ignored.`,
            );
        }
        if (col.filter && col.filter.type === "multi-select") {
            if (!Array.isArray(filter.value[col.key])) {
                let val = filter.value[col.key];
                filter.value[col.key] = val ? [val] : [];
            }
        }
    }
});

watch(
    () => props.columns,
    (newColumns) => {
        for (const col of newColumns) {
            if (col.filter && col.filter.type === "multi-select") {
                if (!Array.isArray(filter.value[col.key])) {
                    let val = filter.value[col.key];
                    filter.value[col.key] = val ? [val] : [];
                }
            }
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="g-table-outer-wrap">
        <div class="g-table-controls">
            <div class="g-clear-filters-wrap">
                <GButton
                    v-if="isFiltered"
                    outlined
                    size="small"
                    class="clear-filters"
                    @click="clearFilters"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 51.26 51.26"
                        height="1em"
                        aria-hidden="true"
                    >
                        <path
                            fill="currentColor"
                            d="m37.84 32.94-7.63-7.63 7.63-7.63a3.24 3.24 0 0 0-4.58-4.58l-7.63 7.63L18 13.1a3.24 3.24 0 0 0-4.58 4.58L21 25.31l-7.62 7.63A3.24 3.24 0 1 0 18 37.52l7.63-7.63 7.63 7.63a3.24 3.24 0 0 0 4.58-4.58Z"
                        />
                    </svg>
                    <span class="g-clear-filters-text"> Clear Filters </span>
                </GButton>
            </div>
            <div class="pagination">
                <slot name="pagination"></slot>
            </div>
            <span class="g-result-count"
                >{{ props.resultCount || data.length }} results</span
            >
        </div>
        <table
            class="g-table"
            :aria-label="label"
            :aria-rowcount="props.resultCount || data.length"
        >
            <thead class="g-table-head">
                <tr aria-rowindex="1">
                    <th
                        v-if="bulkSelectionEnabled"
                        scope="col"
                        class="g-th g-th-checkbox"
                    >
                        <input
                            type="checkbox"
                            :checked="allSelected"
                            :indeterminate="someSelected"
                            @change="toggleAllRows"
                            :aria-label="
                                allSelected
                                    ? 'Deselect all rows'
                                    : 'Select all rows'
                            "
                            class="g-bulk-select-checkbox"
                        />
                    </th>
                    <th
                        v-for="col in columns"
                        :key="col.key"
                        :aria-sort="
                            sortField === col.key
                                ? sortOrder === 1
                                    ? 'ascending'
                                    : 'descending'
                                : 'none'
                        "
                        :class="[
                            'g-th',
                            { sorted: sortField === col.key },
                            { filtered: filteredColumns[col.key] },
                        ]"
                        scope="col"
                    >
                        <div class="th-inner">
                            <button
                                v-if="col.sortable"
                                type="button"
                                class="g-column-head"
                                @click="onSort(col)"
                            >
                                {{ col.label }}
                                <span
                                    v-if="sortField === col.key"
                                    class="sort-indicator"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640"
                                        height="1.5em"
                                        role="img"
                                        :aria-label="
                                            sortOrder === 1
                                                ? 'Sorted ascending'
                                                : 'Sorted descending'
                                        "
                                        :style="{
                                            transform: `rotate(${sortOrder === 1 ? 0 : 180}deg)`,
                                        }"
                                    >
                                        <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                        <path
                                            fill="currentColor"
                                            d="M300.3 199.2C312.9 188.9 331.4 189.7 343.1 201.4L471.1 329.4C480.3 338.6 483 352.3 478 364.3C473 376.3 461.4 384 448.5 384L192.5 384C179.6 384 167.9 376.2 162.9 364.2C157.9 352.2 160.7 338.5 169.9 329.4L297.9 201.4L300.3 199.2z"
                                        />
                                    </svg>
                                </span>
                            </button>
                            <span v-else class="g-column-head">{{
                                col.label
                            }}</span>
                            <GPopover v-if="col.filter">
                                <template #trigger="{ toggle }">
                                    <button
                                        @click.stop="toggle"
                                        :aria-label="
                                            filteredColumns[col.key]
                                                ? 'Column Filtered'
                                                : 'Filter Column'
                                        "
                                        class="g-filter-btn"
                                        :class="{
                                            'g-active':
                                                filteredColumns[col.key],
                                        }"
                                        type="button"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 640 640"
                                            height="1.5em"
                                            aria-hidden="true"
                                        >
                                            <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                            <path
                                                fill="currentColor"
                                                d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z"
                                            />
                                        </svg>
                                    </button>
                                </template>
                                <GSelect
                                    v-if="col.filter.type === 'select'"
                                    v-model="filter[col.key]"
                                    :options="col.filter.options"
                                    class="g-filter-select"
                                    label="Filter select"
                                    searchable
                                    clear-button
                                />
                                <div v-else-if="col.filter.type === 'toggle'">
                                    <div class="g-filter-toggle">
                                        <input
                                            type="checkbox"
                                            v-model="filter[col.key]"
                                            :id="`${id}-filter-${String(col.key)}`"
                                            :aria-describedby="
                                                col.filter.description
                                                    ? `${id}-filter-description-${String(col.key)}`
                                                    : undefined
                                            "
                                        />
                                        <label
                                            :for="`${id}-filter-${String(col.key)}`"
                                            >{{ col.filter.label }}</label
                                        >
                                        <span
                                            class="g-filter-description"
                                            v-if="col.filter.description"
                                            :id="`${id}-filter-description-${String(col.key)}`"
                                        >
                                            {{ col.filter.description }}
                                        </span>
                                    </div>
                                </div>
                                <fieldset
                                    v-else-if="
                                        col.filter.type === 'multi-select'
                                    "
                                    class="g-multi-select"
                                >
                                    <legend class="g-multi-select-legend">
                                        Include values
                                    </legend>
                                    <div
                                        v-for="opt in col.filter.options"
                                        :key="opt.value"
                                    >
                                        <input
                                            type="checkbox"
                                            v-model="filter[col.key]"
                                            :id="`filter-${String(col.key)}-${opt.value}`"
                                            :value="opt.value"
                                            name="filter-multiselect"
                                        />
                                        <label
                                            :for="`filter-${String(col.key)}-${opt.value}`"
                                            >{{ opt.label }}</label
                                        >
                                    </div>
                                    <GButton
                                        class="clear-multiselect-btn"
                                        theme="accent"
                                        size="small"
                                        @click="filter[col.key] = []"
                                        v-if="
                                            filter[col.key] &&
                                            filter[col.key].length
                                        "
                                    >
                                        Clear
                                    </GButton>
                                </fieldset>
                            </GPopover>
                        </div>
                    </th>
                </tr>
            </thead>
            <!-- @vue-generic {T, C} -->
            <GTableBody
                :data="data"
                :columns="columns"
                :group-by="groupBy"
                :group-render="groupRender"
                :row-clickable="rowClickable"
                :row-class="rowClass as any"
                :start-index="startIndex"
                :bulk-selection-enabled="bulkSelectionEnabled"
                :selected-rows="selectedRows"
                @row-click="clickRow"
                @toggle-row="toggleRow"
                @cell-change="handleCellChange"
            />
        </table>
        <div
            v-if="bulkSelectionEnabled && selectedRows.length > 0"
            class="g-bulk-actions-toolbar"
        >
            <span class="g-selected-count"
                >{{ selectedRows.length }} row{{
                    selectedRows.length === 1 ? "" : "s"
                }}
                selected</span
            >
            <ul class="g-bulk-actions">
                <li v-for="action in bulkActions" :key="action.id">
                    <GButton
                        :theme="action.theme || 'accent'"
                        @click="handleBulkAction(action.id)"
                        size="small"
                    >
                        {{ action.label }} {{ selectedRows.length }} row{{
                            selectedRows.length === 1 ? "" : "s"
                        }}
                    </GButton>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.g-table-outer-wrap {
}

.g-table-controls {
    height: 40px;
    position: sticky;
    display: flex;
    top: 0;
    left: 0;
    padding: 2px 6px;
}

.g-table-head {
    background: var(--g-surface-0);
    position: sticky;
    top: 40px;
}

.g-th {
    text-align: left;
    padding: 0.5rem 0.2rem;
    border: 0;
    border-bottom: 2px solid var(--g-surface-900);

    &.sorted {
        color: var(--ilw-color--link-hover);
    }

    &.filtered {
        .g-filter-btn {
            color: var(--ilw-color--link-hover);
        }
    }

    .th-inner {
        display: flex;
    }
}

.g-column-head {
    color: currentColor;
    position: relative;
    height: 2rem;
    border: none;
    background: none;
    font-weight: 700;
    font-family: var(--il-font-sans);
    font-size: 1rem;
    line-height: 1.3;
    white-space: nowrap;

    .sort-indicator {
        position: absolute;
        bottom: -1.1em;
        left: calc(50% - 0.7em);
    }
}

button.g-column-head {
    cursor: pointer;
}

button.g-column-head:hover {
    text-decoration: underline;
    color: var(--ilw-color--link-hover);
}

.g-table {
    border-spacing: 0;
    min-width: 100%;
}

.g-filter-btn {
    border: none;
    background: transparent;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
        background: var(--g-primary-500);
        color: var(--g-primary-text);
    }

    &:focus {
        background: var(--ilw-color--focus--background);
        color: var(--ilw-color--focus--text);
    }

    &.g-active {
        border: 2px solid var(--ilw-color--link-hover);
    }
}

.g-clear-filters-text {
    white-space: nowrap;
}

@media screen and (max-width: 600px) {
    .g-clear-filters-text {
        opacity: 0;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
}

.g-filter-select {
    min-width: 200px;
}

.g-table-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.2rem 1rem;
    background: var(--g-surface-150);

    .g-result-count {
        font-size: 1rem;
        line-height: 1.2;
    }
}

.g-multi-select {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .clear-multiselect-btn {
        margin-top: 0.5rem;
    }

    legend {
        font-size: 1.125rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    div {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:has(:focus-visible) {
            outline: 2px solid var(--g-primary-500);
        }
    }

    input {
        width: 24px;
        height: 24px;
        accent-color: var(--g-primary-500);
        display: block;
    }

    label {
        font-size: 1.125rem;
        flex: 1;
    }
}

.g-multi-select-legend {
    margin: 0;
    padding: 0;
    font-size: 1rem;
    line-height: 1.2;
}

.g-filter-toggle {
    display: grid;
    grid-template-areas:
        "label input"
        "description description";

    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.5rem;

    input {
        width: 24px;
        height: 24px;
    }

    label {
        font-size: 1.125rem;
        font-weight: bold;
    }

    .g-filter-description {
        grid-area: description;
    }
}

.g-clear-filters-wrap,
.g-result-count {
}

/* Bulk selection styles */
.g-th-checkbox {
    width: 50px;
    text-align: center;
}

.g-bulk-select-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--g-primary-500);
}

.g-bulk-actions-toolbar {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1;

    ul {
        display: flex;
        gap: 1rem;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        margin: 0;
    }
}

.g-selected-count {
    font-weight: 600;
    font-size: 1rem;
}

.g-bulk-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
</style>
