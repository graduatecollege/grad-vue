<script
    setup
    lang="ts"
    generic="T extends Record<string, any>, C extends TableColumn<T>"
>
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
import { TableColumn } from "./table/TableColumn.ts";
import { onMounted, VNode, watch } from "vue";
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
    groupBy?: string;
    filtering: UseFilteringReturn;
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
};

const sortField = defineModel<string>("sortField");
const sortOrder = defineModel<1 | -1>("sortOrder");
const filter = defineModel<Record<string, any>>("filter", { required: true });

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
    (e: "row-click", link: string): void;
}>();

function onSort(col: C) {
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
                        viewBox="0 0 640 640"
                        height="1em"
                    >
                        <path
                            fill="currentColor"
                            d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L399.9 366.2L399.9 346L567.2 178.7C572.8 173.1 575.9 165.6 575.9 157.7C575.9 141.3 562.6 128 546.2 128L161.8 128L73 39.1zM209.8 176L502 176L359 319L355.9 322.1L209.8 176zM240 345.9L240 345.9L240 448C240 454.4 242.5 460.5 247 465L349.4 567.3C355 572.9 362.5 576 370.4 576C386.8 576 400.1 562.7 400.1 546.3L400.1 501.8L352.1 453.8L352.1 502L288.1 438L288.1 389.8L240.1 341.8L240.1 345.9z"
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
        <table class="table" :aria-label="label">
            <thead class="table-head">
                <tr>
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
                                        aria-label="Filter column"
                                        class="filter-btn p-button p-button-text"
                                        type="button"
                                    >
                                        <svg
                                            v-if="filteredColumns[col.key]"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 640 640"
                                            height="1.5em"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z"
                                            />
                                        </svg>
                                        <svg
                                            v-else
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 640 640"
                                            height="1.5em"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"
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
                                <fieldset
                                    v-else-if="
                                        col.filter.type === 'multi-select'
                                    "
                                    class="g-multi-select"
                                >
                                    <legend class="sr-only">
                                        Filter options
                                    </legend>
                                    <div
                                        v-for="opt in col.filter.options"
                                        :key="opt.value"
                                    >
                                        <input
                                            type="checkbox"
                                            v-model="filter[col.key]"
                                            :id="`filter-${col.key}-${opt.value}`"
                                            :value="opt.value"
                                            name="filter-multiselect"
                                        />
                                        <label
                                            :for="`filter-${col.key}-${opt.value}`"
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
            <GTableBody
                :data="data"
                :columns="columns"
                :group-by="groupBy"
                :group-render="groupRender"
                :row-clickable="props.rowClickable"
                :row-class="props.rowClass"
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
    }
}

.g-multi-select {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    .clear-multiselect-btn {
        margin-top: 0.5rem;
    }

    :deep(div) {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:has(:focus-visible) {
            outline: 2px solid var(--g-primary-500);
        }
    }

    :deep(input) {
        width: 24px;
        height: 24px;
        accent-color: var(--g-primary-500);
        display: block;
    }

    :deep(label) {
        font-size: 1.125rem;
        flex: 1;
    }
}

.clear-filters-wrap,
.result-count {
}
</style>
