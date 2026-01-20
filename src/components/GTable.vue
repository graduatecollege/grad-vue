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
import { onMounted, useId, VNode, watch } from "vue";
import GSelect from "./GSelect.vue";
import { UseFilteringReturn } from "../compose/useFiltering.ts";
import GButton from "./GButton.vue";

type Props = {
    /**
     * Accessible label
     */
    label: string; // Demo: Colleges
    data: T[];
    columns: C[];
    resultCount?: number;
    groupBy?: keyof T;
    filtering: UseFilteringReturn<T>;
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
    startIndex: number;
};

const sortField = defineModel<keyof T>("sortField");
const sortOrder = defineModel<1 | -1>("sortOrder");
const filter = defineModel<Partial<Record<keyof T, any>>>("filter", {
    required: true,
});

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
    (e: "row-click", link: string): void;
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

onMounted(() => {
    for (const col of props.columns) {
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

const id = useId();
</script>

<template>
    <div class="table-outer-wrap">
        <div class="table-controls">
            <div class="clear-filters-wrap">
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
                    <span class="clear-filters-text"> Clear Filters </span>
                </GButton>
            </div>
            <div class="pagination">
                <slot name="pagination"></slot>
            </div>
            <span class="result-count"
                >{{ props.resultCount || data.length }} results</span
            >
        </div>
        <table
            class="table"
            :aria-label="label"
            :aria-rowcount="props.resultCount || data.length"
        >
            <thead class="table-head">
                <tr aria-rowindex="1">
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
                            'th',
                            { sorted: sortField === col.key },
                            { filtered: filteredColumns[col.key] },
                        ]"
                        scope="col"
                    >
                        <div class="th-inner">
                            <button
                                v-if="col.sortable"
                                type="button"
                                class="column-head"
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
                            <span v-else class="column-head">{{
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
                                        class="filter-btn"
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
                                    class="filter-select"
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
                :row-clickable="props.rowClickable"
                :row-class="props.rowClass as any"
                :start-index="startIndex"
                @row-click="emit('row-click', $event)"
            />
        </table>
    </div>
</template>

<style scoped>
.table-outer-wrap {
}

.table-controls {
    height: 40px;
    position: sticky;
    display: flex;
    top: 0;
    left: 0;
    padding: 2px 6px;
}

.table-head {
    background: var(--g-surface-0);
    position: sticky;
    top: 40px;
}

.th {
    text-align: left;
    padding: 0.5rem 0.2rem;
    border: 0;
    border-bottom: 2px solid var(--g-surface-900);

    &.sorted {
        color: var(--ilw-color--link-hover);
    }

    &.filtered {
        .filter-btn {
            color: var(--ilw-color--link-hover);
        }
    }

    .th-inner {
        display: flex;
    }
}

.column-head {
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

button.column-head {
    cursor: pointer;
}

button.column-head:hover {
    text-decoration: underline;
    color: var(--ilw-color--link-hover);
}

.table {
    border-spacing: 0;
    min-width: 100%;
}

.filter-btn {
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

.clear-filters-text {
    white-space: nowrap;
}

@media screen and (max-width: 600px) {
    .clear-filters-text {
        opacity: 0;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
}

.filter-select {
    min-width: 200px;
}

.table-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.2rem 1rem;
    background: var(--g-surface-150);

    .result-count {
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

.clear-filters-wrap,
.result-count {
}
</style>
