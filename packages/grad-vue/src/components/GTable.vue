<script lang="ts">
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
export default {};
</script>

<script setup lang="ts" generic="T extends TableRow, C extends TableColumn<T>">
import GTableBody from "./table/GTableBody.vue";
import GPopover from "./GPopover.vue";
import { TableColumn, TableRow, TableSort } from "./table/TableColumn.ts";
import {
    computed,
    getCurrentInstance,
    nextTick,
    onMounted,
    ref,
    toRaw,
    useId,
    useSlots,
    VNode,
} from "vue";
import GSelect from "./GSelect.vue";
import GMultiSelect from "./GMultiSelect.vue";
import GCheckboxGroup from "./GCheckboxGroup.vue";
import { useFiltering, UseFilteringReturn } from "../compose/useFiltering.ts";
import {
    CellChangePayload,
    UseTableChangesReturn,
} from "../compose/useTableChanges.ts";
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

type ColumnVisibilityKey<T extends TableRow> = Extract<keyof T, string>;
type SortKey<T extends TableRow> = Extract<keyof T, string>;

type Props = {
    /**
     * Accessible label
     * @demo Colleges
     */
    label: string;
    /**
     * The data to display in the table
     *
     * The data should be an array of objects, each representing a row in the table.
     * Each object should have a unique `key` property that can be used to identify the row.
     */
    data: T[];
    /**
     * The columns to display in the table
     *
     * Each column's key needs to match the key of a property in the data objects,
     * which determines the data to display in that column by default. You can also
     * provide a custom display function to customize the data display.
     */
    columns: C[];
    /**
     * Result count for all of the possible results (not just the current page)
     *
     * This is shown in the toolbar.
     */
    resultCount?: number;
    /**
     * A column key to group the data by
     *
     * If provided, the `groupRender` render function will be used to render the group header.
     */
    groupBy?: keyof T;
    /**
     * A render function to customize the display of the group header.
     *
     * @param groupValue The value of the group key for the current row
     * @param row The row object for the first row in the group
     */
    groupRender?: (groupValue: any, row: T) => VNode;
    /**
     * Filtering object created with useFiltering()
     */
    filtering?: UseFilteringReturn<any>;
    /**
     * Make the table rows clickable
     */
    rowClickable?: boolean;
    /**
     * A function to customize the classes applied to table rows
     * @param row The row object
     */
    rowClass?: (row: T) => string | string[] | undefined;
    /**
     * The starting index for this page
     *
     * This is used for the ARIA rowindex attribute, and is VERY important
     * to not get wrong.
     */
    startIndex: number;
    /**
     * Enable bulk selection with checkboxes
     * @demo
     */
    bulkSelectionEnabled?: boolean;
    /**
     * Array of actions to show in the sticky toolbar when rows are selected
     */
    bulkActions?: BulkAction[];

    /**
     * Optional change tracker for editable tables.
     * Pass a composable from useTableChanges() to track user edits.
     */
    changeTracker?: UseTableChangesReturn<T>;

    /**
     * Explicitly show the pagination bar even if the slot is empty
     * @demo
     */
    showPagination?: boolean;
};

const sorts = defineModel<TableSort<T>[]>("sorts", {
    default: () => [],
});
const filter = defineModel<Partial<Record<keyof T, any>>>("filter", {
    default: () => ({}),
});
const columnVisibility = defineModel<
    Partial<Record<Extract<keyof T, string>, boolean>>
>("columnVisibility", {
    default: () => ({}),
});
const selectedRows = defineModel<string[]>("selectedRows", {
    default: () => [],
});

const props = withDefaults(defineProps<Props>(), {
    bulkSelectionEnabled: false,
    bulkActions: () => [],
    showPagination: false,
});

const emit = defineEmits<{
    (e: "row-click", link: string): void;
    (e: "bulk-action", actionId: string, selectedKeys: string[]): void;
    (e: "cell-change", payload: CellChangePayload<T>): void;
}>();

let filtering: UseFilteringReturn<any> = props.filtering!;

if (!filtering) {
    filtering = useFiltering({}) as any;
}

const { filters, filteredColumns, isFiltered, clearFilters } = filtering;

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
            selectedRows.value = selectedRows.value.filter(
                (key) => key !== rowKey,
            );
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

function handleCellChange(change: { row: T; column: C; value: any }) {
    // Update the reactive data
    // Convert the value to the appropriate type based on input attributes
    let convertedValue: any = change.value;
    const columnKey = change.column.key;
    const previousValue = toRaw(change.row[columnKey]);
    if (change.column.editable?.inputAttributes?.type === "number") {
        convertedValue = change.value === "" ? null : Number(change.value);
    }
    change.row[columnKey] = convertedValue;

    const payload: CellChangePayload<T> = {
        row: change.row,
        column: change.column,
        value: convertedValue,
        previousValue,
    };

    emit("cell-change", payload);
}

const id = useId();
const slots = useSlots();
const instance = getCurrentInstance();
const sortBuilderRef = ref<HTMLFieldSetElement | null>(null);

function normalizeSorts(value: TableSort<T>[]) {
    const seen = new Set<string>();
    return value.filter((sort): sort is TableSort<T> => {
        if (!sort?.key || seen.has(String(sort.key))) {
            return false;
        }

        seen.add(String(sort.key));
        return sort.order === 1 || sort.order === -1;
    });
}

function createSort(key: SortKey<T>, order: 1 | -1): TableSort<T> {
    return { key, order };
}

const activeSorts = computed(() => normalizeSorts(sorts.value));

function setSortState(nextSorts: TableSort<T>[]) {
    sorts.value = normalizeSorts(nextSorts);
}

const sortableColumns = computed(() => props.columns.filter((col) => col.sortable));
const shouldShowSortBuilder = computed(() => sortableColumns.value.length > 1);
const inactiveSortColumns = computed(() => {
    const sortedKeys = new Set(activeSorts.value.map((sort) => String(sort.key)));
    return sortableColumns.value.filter((col) => !sortedKeys.has(String(col.key)));
});

function sortIndex(key: keyof T) {
    return activeSorts.value.findIndex((sort) => sort.key === key);
}

function sortForColumn(key: keyof T) {
    return activeSorts.value.find((sort) => sort.key === key);
}

function columnLabel(key: keyof T) {
    return props.columns.find((col) => col.key === key)?.label || String(key);
}

function columnAriaSort(key: keyof T) {
    const index = sortIndex(key);
    if (index === -1) {
        return "none";
    }
    if (index > 0) {
        return "other";
    }
    return activeSorts.value[0]?.order === 1 ? "ascending" : "descending";
}

function columnSortDescription(key: keyof T) {
    const index = sortIndex(key);
    if (index === -1) {
        return "";
    }

    const sort = activeSorts.value[index];
    const direction = sort.order === 1 ? "ascending" : "descending";
    return activeSorts.value.length > 1
        ? `Sorted ${direction}, priority ${index + 1}`
        : `Sorted ${direction}`;
}

function sortDirectionLabel(order: 1 | -1) {
    return order === 1 ? "Ascending" : "Descending";
}

function nextPrimarySort(key: SortKey<T>) {
    const currentPrimary =
        activeSorts.value[0]?.key === key ? activeSorts.value[0] : undefined;

    if (!currentPrimary) {
        return [createSort(key, 1)];
    }

    if (currentPrimary.order === 1) {
        return [createSort(key, -1)];
    }

    return [] as TableSort<T>[];
}

function nextStackSorts(key: SortKey<T>) {
    const nextSorts = [...activeSorts.value];
    const index = nextSorts.findIndex((sort) => sort.key === key);

    if (index === -1) {
        nextSorts.push(createSort(key, 1));
        return nextSorts;
    }

    if (nextSorts[index].order === 1) {
        nextSorts[index] = createSort(key, -1);
        return nextSorts;
    }

    nextSorts.splice(index, 1);
    return nextSorts;
}

function onSort(col: TableColumn<T>, shiftKey: boolean = false) {
    if (!col.sortable) {
        return;
    }

    const key = col.key as SortKey<T>;
    setSortState(shiftKey ? nextStackSorts(key) : nextPrimarySort(key));
}

function addSortRule(key: SortKey<T>, order: 1 | -1) {
    setSortState([...activeSorts.value, createSort(key, order)]);
    nextTick(() => {
        const root = sortBuilderRef.value;
        if (!root) {
            return;
        }

        const target =
            root.querySelector<HTMLElement>(
                `[data-sort-row-key="${String(key)}"]`,
            ) ?? root;

        target?.focus();
    }).catch((err) => {
        console.error(err);
    });
}

function toggleSortRuleDirection(key: keyof T) {
    setSortState(
        activeSorts.value.map((sort) =>
            sort.key === key
                ? createSort(
                      sort.key as SortKey<T>,
                      sort.order === 1 ? -1 : 1,
                  )
                : sort,
        ),
    );
}

function removeSortRule(key: keyof T) {
    setSortState(activeSorts.value.filter((sort) => sort.key !== key));
}

function clearSorts() {
    setSortState([]);
}

const columnVisibilityConfigured = computed(() => {
    const vnodeProps = instance?.vnode.props ?? {};
    return (
        "columnVisibility" in vnodeProps ||
        "column-visibility" in vnodeProps ||
        "onUpdate:columnVisibility" in vnodeProps
    );
});

const visibleColumns = computed(() => {
    const visibility = columnVisibility.value;
    return props.columns.filter(
        (col) => visibility[col.key as ColumnVisibilityKey<T>] !== false,
    );
});
const hasHiddenColumns = computed(
    () => visibleColumns.value.length !== props.columns.length,
);
const shouldShowColumnVisibilityControls = computed(
    () => columnVisibilityConfigured.value && props.columns.length > 0,
);

function isColumnVisible(col: C) {
    return columnVisibility.value[col.key as ColumnVisibilityKey<T>] !== false;
}

function setColumnVisibility(col: C, visible: boolean) {
    columnVisibility.value = {
        ...columnVisibility.value,
        [col.key]: visible,
    };
}

const shouldShowPagination = computed(() => {
    // Show if explicitly requested via prop
    if (props.showPagination) {
        return true;
    }
    // Show if the pagination slot has content
    return !!slots.pagination;
});

const shouldShowControls = computed(() => {
    if (shouldShowSortBuilder.value) {
        return true;
    }
    // Show if filters are active (clear filters button is visible)
    if (isFiltered.value) {
        return true;
    }
    // Show if pagination should be shown
    if (shouldShowPagination.value) {
        return true;
    }
    if (shouldShowColumnVisibilityControls.value) {
        return true;
    }
    // Otherwise hide the entire controls bar
    return false;
});

function multiSelectFilterOptions(col: C) {
    if (col.filter?.type !== "multi-select") {
        return [];
    }
    return col.filter.options.map((option) => ({
        label: option.label,
        value: option.value,
        hint: option.description,
    }));
}

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
    }
});
</script>

<template>
    <div class="g-table-outer-wrap">
        <div v-if="shouldShowControls" class="g-table-controls">
            <div class="g-table-control-actions">
                <div v-if="shouldShowSortBuilder" class="g-sort-builder-wrap">
                    <GPopover>
                        <template #trigger="{ toggle }">
                            <GButton
                                size="small"
                                class="g-sort-builder-trigger"
                                :class="{
                                    'g-sort-builder-trigger--active':
                                        activeSorts.length > 0,
                                }"
                                aria-label="Choose sort order"
                                @click="toggle"
                            >
                                <svg
                                    class="g-sort-builder-trigger-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    height="1.5em"
                                    aria-hidden="true"
                                >
                                    <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                    <path
                                        fill="currentColor"
                                        d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z"
                                    />
                                </svg>
                                <span
                                    v-if="activeSorts.length"
                                    class="g-sort-builder-count"
                                >
                                    {{ activeSorts.length }}
                                </span>
                            </GButton>
                        </template>
                        <fieldset
                            ref="sortBuilderRef"
                            class="g-sort-builder-popover"
                            tabindex="-1"
                            popover-focus
                        >
                            <legend class="g-sort-builder-legend">
                                Sort order
                            </legend>
                            <p class="g-sort-builder-help">
                                Click a column header to change the primary sort.
                                Use Shift-click as a shortcut to add or update
                                secondary sorts.
                            </p>
                            <ol
                                v-if="activeSorts.length"
                                class="g-sort-builder-list"
                            >
                                <li
                                    v-for="(sort, index) in activeSorts"
                                    :key="sort.key"
                                    class="g-sort-builder-rule"
                                    tabindex="-1"
                                    :data-sort-row-key="String(sort.key)"
                                    :aria-label="`${columnLabel(sort.key)} ${sortDirectionLabel(sort.order)} sort, priority ${index + 1}`"
                                >
                                    <span
                                        class="g-sort-builder-rule-priority"
                                        aria-hidden="true"
                                    >
                                        {{ index + 1 }}
                                    </span>
                                    <span class="g-sort-builder-rule-label">
                                        {{ columnLabel(sort.key) }}
                                    </span>
                                    <button
                                        type="button"
                                        class="g-sort-builder-direction"
                                        :aria-label="`Toggle ${columnLabel(sort.key)} sort direction`"
                                        @click="toggleSortRuleDirection(sort.key)"
                                    >
                                        <span class="g-visually-hidden">
                                            {{ sortDirectionLabel(sort.order) }}
                                        </span>
                                        <span class="sort-indicator" aria-hidden="true">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 640 640"
                                                height="1.25em"
                                                :style="{
                                                    transform: `rotate(${sort.order === 1 ? 0 : 180}deg)`,
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
                                    <button
                                        type="button"
                                        class="g-sort-builder-remove"
                                        :aria-label="`Remove ${columnLabel(sort.key)} sort`"
                                        @click="removeSortRule(sort.key)"
                                    >
                                        Remove
                                    </button>
                                </li>
                            </ol>
                            <p v-else class="g-sort-builder-empty">
                                No active sort rules.
                            </p>
                            <div
                                v-if="inactiveSortColumns.length"
                                class="g-sort-builder-add"
                            >
                                <p class="g-sort-builder-add-label">
                                    Add sort column
                                </p>
                                <ul class="g-sort-builder-add-list">
                                    <li
                                        v-for="col in inactiveSortColumns"
                                        :key="col.key"
                                        class="g-sort-builder-add-item"
                                    >
                                        <span class="g-sort-builder-add-name">
                                            {{ col.label }}
                                        </span>
                                        <div class="g-sort-builder-add-actions">
                                            <button
                                                type="button"
                                                class="g-sort-builder-direction"
                                                :aria-label="`Add ${col.label} ascending sort`"
                                                @click="
                                                    addSortRule(
                                                        col.key as SortKey<T>,
                                                        1,
                                                    )
                                                "
                                            >
                                                <span class="g-visually-hidden">
                                                    Add ascending sort
                                                </span>
                                                <span
                                                    class="sort-indicator"
                                                    aria-hidden="true"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 640 640"
                                                        height="1.25em"
                                                    >
                                                        <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                                        <path
                                                            fill="currentColor"
                                                            d="M300.3 199.2C312.9 188.9 331.4 189.7 343.1 201.4L471.1 329.4C480.3 338.6 483 352.3 478 364.3C473 376.3 461.4 384 448.5 384L192.5 384C179.6 384 167.9 376.2 162.9 364.2C157.9 352.2 160.7 338.5 169.9 329.4L297.9 201.4L300.3 199.2z"
                                                        />
                                                    </svg>
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                class="g-sort-builder-direction"
                                                :aria-label="`Add ${col.label} descending sort`"
                                                @click="
                                                    addSortRule(
                                                        col.key as SortKey<T>,
                                                        -1,
                                                    )
                                                "
                                            >
                                                <span class="g-visually-hidden">
                                                    Add descending sort
                                                </span>
                                                <span
                                                    class="sort-indicator"
                                                    aria-hidden="true"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 640 640"
                                                        height="1.25em"
                                                        style="transform: rotate(180deg);"
                                                    >
                                                        <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                                        <path
                                                            fill="currentColor"
                                                            d="M300.3 199.2C312.9 188.9 331.4 189.7 343.1 201.4L471.1 329.4C480.3 338.6 483 352.3 478 364.3C473 376.3 461.4 384 448.5 384L192.5 384C179.6 384 167.9 376.2 162.9 364.2C157.9 352.2 160.7 338.5 169.9 329.4L297.9 201.4L300.3 199.2z"
                                                        />
                                                    </svg>
                                                </span>
                                            </button>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <GButton
                                v-if="activeSorts.length"
                                outlined
                                size="small"
                                class="g-sort-builder-clear"
                                @click="clearSorts"
                            >
                                Clear sort
                            </GButton>
                        </fieldset>
                    </GPopover>
                </div>
                <div
                    v-if="shouldShowColumnVisibilityControls"
                    class="g-column-visibility-wrap"
                >
                    <GPopover>
                        <template #trigger="{ toggle }">
                            <GButton

                                size="small"
                                class="g-column-visibility-trigger"
                                aria-label="Choose visible columns"
                                :class="{
                                    'g-column-visibility-trigger--active':
                                        hasHiddenColumns,
                                }"
                                @click="toggle"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    height="1.5em"
                                    style="transform: rotate(90deg);"
                                    aria-hidden="true"
                                >
                                    <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                    <path
                                        fill="currentColor"
                                        d="M64 160C64 142.3 78.3 128 96 128L480 128C497.7 128 512 142.3 512 160C512 177.7 497.7 192 480 192L96 192C78.3 192 64 177.7 64 160zM128 320C128 302.3 142.3 288 160 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L160 352C142.3 352 128 337.7 128 320zM512 480C512 497.7 497.7 512 480 512L96 512C78.3 512 64 497.7 64 480C64 462.3 78.3 448 96 448L480 448C497.7 448 512 462.3 512 480z"/>
                                </svg>
                            </GButton>
                        </template>
                        <fieldset class="g-column-visibility-popover">
                            <legend class="g-column-visibility-legend">
                                Shown columns
                            </legend>
                            <div class="g-column-visibility-list">
                                <label
                                    v-for="col in columns"
                                    :key="col.key"
                                    class="g-column-visibility-option"
                                >
                                    <input
                                        :checked="isColumnVisible(col)"
                                        type="checkbox"
                                        @change="
                                            setColumnVisibility(
                                                col,
                                                (
                                                    $event.target as HTMLInputElement
                                                ).checked,
                                            )
                                        "
                                    />
                                    <span>{{ col.label }}</span>
                                </label>
                            </div>
                        </fieldset>
                    </GPopover>
                </div>

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
            </div>
            <div v-if="shouldShowPagination" class="pagination">
                <slot name="pagination"></slot>
            </div>
            <span class="g-result-count"
                >{{ props.resultCount || data.length }} results</span
            >
        </div>
        <div class="g-table-table-wrap">
            <table
                class="g-table"
                ref="tableRef"
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
                            v-for="col in visibleColumns"
                            :key="col.key"
                            :id="`${id}-th-${String(col.key)}`"
                            :aria-sort="columnAriaSort(col.key)"
                            :class="[
                                'g-th',
                                { sorted: sortIndex(col.key) !== -1 },
                                { filtered: filteredColumns[col.key] },
                            ]"
                            scope="col"
                        >
                            <div class="th-inner">
                                <button
                                    v-if="col.sortable"
                                    type="button"
                                    class="g-column-head"
                                    @click="onSort(col, $event.shiftKey)"
                                >
                                    {{ col.label }}
                                    <span
                                        v-if="sortIndex(col.key) !== -1"
                                        class="sort-indicator"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 640 640"
                                            height="1.5em"
                                            :style="{
                                                transform: `rotate(${sortForColumn(col.key)?.order === 1 ? 0 : 180}deg)`,
                                            }"
                                        >
                                            <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                            <path
                                                fill="currentColor"
                                                d="M300.3 199.2C312.9 188.9 331.4 189.7 343.1 201.4L471.1 329.4C480.3 338.6 483 352.3 478 364.3C473 376.3 461.4 384 448.5 384L192.5 384C179.6 384 167.9 376.2 162.9 364.2C157.9 352.2 160.7 338.5 169.9 329.4L297.9 201.4L300.3 199.2z"
                                            />
                                        </svg>
                                    </span>
                                    <span
                                        v-if="sortIndex(col.key) !== -1"
                                        class="g-visually-hidden"
                                    >
                                        {{ columnSortDescription(col.key) }}
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
                                        :search-description="col.filter.searchDescription"
                                        clear-button
                                    />
                                    <div
                                        v-else-if="col.filter.type === 'search'"
                                        class="g-filter-search"
                                        role="search"
                                    >
                                        <span
                                            class="g-filter-search-icon"
                                            aria-hidden="true"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 51.26 51.26"
                                                height="1em"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M30 9.76A14.05 14.05 0 1 0 28.3 31l11.3 13a3.34 3.34 0 0 0 4.72-4.72L31.44 27.86A14.05 14.05 0 0 0 30 9.76ZM27.27 27a10.26 10.26 0 1 1 0-14.5 10.25 10.25 0 0 1 0 14.5Z"
                                                />
                                            </svg>
                                        </span>
                                        <input
                                            type="search"
                                            class="g-filter-search-input"
                                            v-model="filter[col.key]"
                                            :placeholder="col.filter.placeholder"
                                            :aria-label="`Search ${col.label}`"
                                        />
                                    </div>
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
                                    <GMultiSelect
                                        v-else-if="
                                            col.filter.type === 'multi-select' &&
                                            col.filter.searchable
                                        "
                                        v-model="filter[col.key]"
                                        :options="col.filter.options"
                                        label="Include values"
                                        :placeholder="col.filter.placeholder"
                                        :search-description="col.filter.searchDescription"
                                        class="g-multi-select-searchable"
                                    />
                                    <div
                                        v-else-if="
                                            col.filter.type === 'multi-select'
                                        "
                                        class="g-multi-select"
                                    >
                                        <GCheckboxGroup
                                            v-model="filter[col.key]"
                                            :options="multiSelectFilterOptions(col)"
                                            label="Include values"
                                        />
                                        <GButton
                                            class="clear-multiselect-btn"
                                            theme="accent"
                                            size="small"
                                            @click="filter[col.key] = []"
                                            v-if="filter[col.key]?.length"
                                        >
                                            Clear
                                        </GButton>
                                    </div>
                                </GPopover>
                            </div>
                        </th>
                    </tr>
                </thead>
                <!-- @vue-generic {T, C} -->
                <GTableBody
                    :data="data"
                    :columns="visibleColumns"
                    :group-by="groupBy"
                    :group-render="groupRender"
                    :row-clickable="rowClickable"
                    :row-class="rowClass as any"
                    :start-index="startIndex"
                    :bulk-selection-enabled="bulkSelectionEnabled"
                    :selected-rows="selectedRows"
                    :table-id="id"
                    :change-tracker="changeTracker"
                    @row-click="clickRow"
                    @toggle-row="toggleRow"
                    @cell-change="handleCellChange"
                />
            </table>
        </div>
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

<style>
g-table {
    display: block;
}
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
    z-index: 1;
}

.g-th {
    text-align: left;
    padding: 0.5rem 0.2rem;
    border: 0;
    border-bottom: 2px solid var(--g-surface-900);
    background: var(--g-surface-0);

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
        align-items: center;
    }
}

.g-column-head {
    color: currentColor;
    border: none;
    font-weight: 700;
    font-family: var(--il-font-sans);
    font-size: 1rem;
    line-height: 1.3;
    white-space: nowrap;
    padding-left: 4px;
    background: var(--g-surface-0);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    .sort-indicator {
        display: inline-flex;
        align-items: center;
    }
}

th:first-of-type .g-column-head {
    padding-left: 0;
}

button.g-column-head {
    cursor: pointer;
    height: 2rem;
}

button.g-column-head:hover {
    text-decoration: underline;
    color: var(--ilw-color--link-hover);
}

.g-table {
    border-spacing: 0;
    min-width: 100%;
}

.g-table-table-wrap {
    min-width: 0;
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
        outline-color: var(--g-primary-500);
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

.g-filter-search {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 200px;
}

.g-filter-search-input {
    width: 100%;
    flex: 1;
    padding: 0.4rem 0.75rem 0.4rem 2.25rem;
    line-height: 1.33rem;
    font-size: 1rem;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid var(--g-primary-500);
    border-radius: var(--g-border-radius-m);

    &:focus {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }
}

.g-filter-search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    color: var(--g-accent-700);
    pointer-events: none;
}

.g-table-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 1rem;
    padding: 0.2rem 0.5rem;
    background: var(--g-surface-150);

    .pagination {
        grid-column: 2;
        justify-self: center;
        display: flex;
        justify-content: center;
        min-width: 0;
    }

    .g-result-count {
        grid-column: 3;
        justify-self: end;
        font-size: 1rem;
        line-height: 1.2;
        text-align: right;
        white-space: nowrap;
    }
}

.g-table-control-actions {
    grid-column: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
}

.g-column-visibility-wrap {
    display: flex;
    align-items: center;
}

.g-sort-builder-wrap {
    display: flex;
    align-items: center;
}

.g-sort-builder-trigger {
    min-width: auto;
    padding: 0.25rem 0.5rem;
    gap: 0.4rem;
}

.g-sort-builder-trigger-icon {
    display: block;
}

.g-sort-builder-trigger--active {
    border-color: var(--ilw-color--link-hover);
    color: var(--ilw-color--link-hover);
    background: var(--g-surface-0);
}

.g-sort-builder-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.25rem;
    border-radius: 999px;
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    font-size: 0.8rem;
    line-height: 1;
}

.g-sort-builder-popover {
    min-width: 20rem;
    max-width: 24rem;
    border: 0;
    margin: 0;
    padding: 0;
}

.g-sort-builder-legend {
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.g-sort-builder-help,
.g-sort-builder-empty {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
}

.g-sort-builder-list {
    display: grid;
    gap: 0.5rem;
    list-style: none;
    padding-left: 0;
    margin: 0 0 1rem;
}

.g-sort-builder-rule {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
}

.g-sort-builder-rule-label {
    font-weight: 700;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.g-sort-builder-rule-priority {
    font-variant-numeric: tabular-nums;
    color: var(--g-surface-700);
}

.g-sort-builder-add-label {
    margin: 0 0 0.5rem;
    font-weight: 700;
}

.g-sort-builder-add-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.g-sort-builder-add-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.5rem;
}

.g-sort-builder-add-name {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.g-sort-builder-add-actions {
    display: inline-flex;
    gap: 0.25rem;
}

.g-sort-builder-direction,
.g-sort-builder-remove {
    border: 0;
    background: transparent;
    color: currentColor;
    font: inherit;
    padding: 0.15rem 0.25rem;
    border-radius: var(--g-border-radius-s);
}

.g-sort-builder-direction {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.g-sort-builder-direction:hover,
.g-sort-builder-remove:hover {
    color: var(--ilw-color--link-hover);
    text-decoration: underline;
}

.g-sort-builder-direction:focus,
.g-sort-builder-remove:focus {
    outline: 2px solid var(--g-primary-500);
    outline-offset: 2px;
}

.g-sort-builder-remove {
    cursor: pointer;
    text-decoration: underline;
}

.g-sort-builder-clear {
    margin-top: 0.75rem;
}

.g-column-visibility-trigger {
    min-width: auto;
    padding: 0.25rem 0.5rem;
}

.g-column-visibility-trigger--active {
    border-color: var(--ilw-color--link-hover);
    color: var(--ilw-color--link-hover);
    background: var(--g-surface-0);
}

.g-column-visibility-popover {
    min-width: 12rem;
    border: 0;
    margin: 0;
    padding: 0;
}

.g-column-visibility-legend {
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.g-column-visibility-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.g-column-visibility-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;

    input {
        width: 20px;
        height: 20px;
        margin: 0;
        accent-color: var(--g-primary-500);
    }
}

.g-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.g-multi-select {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .clear-multiselect-btn {
        margin-top: 0.5rem;
    }

    .g-checkbox-group__legend {
        font-size: 1rem;
        line-height: 1.2;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .g-checkbox-group__option {
        padding: 0;
        align-items: center;
    }

    .g-checkbox-group__input {
        width: 24px;
        height: 24px;
        margin-top: 0;
    }

    .g-checkbox-group__label-text {
        font-size: 1.125rem;
        flex: 1;
    }

    .g-checkbox-group__hint {
        padding-left: 0;
        font-size: 0.8em;
    }
}

.g-multi-select-searchable {
    min-width: 16rem;
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
