<script setup lang="ts" generic="T extends TableRow, C extends TableColumn<T>">
import { computed, ref, type VNode } from "vue";
import { TableColumn, TableRow } from "./TableColumn.ts";
import { UseTableChangesReturn } from "../../compose/useTableChanges.ts";

type Props = {
    data: T[];
    groupBy?: keyof T;
    columns: C[];
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
    startIndex: number;
    bulkSelectionEnabled?: boolean;
    selectedRows?: string[];
    tableId: string;
    changeTracker?: UseTableChangesReturn<T>;
};

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "row-click", link: string): void;
    (e: "toggle-row", rowKey: string, shiftKey: boolean): void;
    (e: "cell-change", payload: { row: T; column: C; value: any }): void;
}>();


function handleMouseDown(event: MouseEvent, rowKey: string) {
    // Prevent text selection when shift-clicking for bulk selection
    // Only if bulk selection is enabled and shift is held and we're not on an input
    if (
        props.bulkSelectionEnabled &&
        event.shiftKey &&
        !(event.target as HTMLElement).closest("a,button,[tabindex],input")
    ) {
        event.preventDefault();
    }
}

function handleRowClick(event: MouseEvent, rowKey: string) {
    if (!props.rowClickable && !props.bulkSelectionEnabled) {
        return; // Do nothing if rows are not clickable
    }
    // Only trigger if not clicking on a link or button directly
    if ((event.target as HTMLElement).closest("a,button,[tabindex],input")) {
        return;
    }
    const row = (event.target as HTMLElement).closest(
        "tr",
    ) as HTMLTableRowElement;
    if (row) {
        if (props.bulkSelectionEnabled) {
            let checkbox = row.querySelector(
                "input[type=checkbox]",
            ) as HTMLInputElement | null;
            if (checkbox) {
                // Trigger the checkbox change with shift key info
                handleCheckboxChange(rowKey, event.shiftKey);
            }
        } else if (props.rowClickable) {
            const firstLink = row.querySelector("a[href]");
            const link = firstLink?.getAttribute("href");
            if (link) {
                emit("row-click", link);
            }
        }
    }
}

function isRowSelected(rowKey: string): boolean {
    return props.selectedRows?.includes(rowKey) ?? false;
}

function handleCheckboxChange(rowKey: string, shiftKey: boolean = false) {
    emit("toggle-row", rowKey, shiftKey);
}

function handleCellChange(event: Event, row: T, col: C) {
    const target = event.target as unknown as
        | HTMLInputElement
        | HTMLSelectElement;
    const value = target.value;
    emit("cell-change", { row, column: col, value });
}

function buildAriaLabelledBy(row: T, col: C): string {
    const columnHeaderId = `${props.tableId}-th-${String(col.key)}`;

    // If labelKey is specified, add the label cell ID
    if (col.editable?.labelKey) {
        const labelCellId = `${props.tableId}-td-${row.key}-${col.editable.labelKey}`;
        return `${labelCellId} ${columnHeaderId} `;
    }

    return columnHeaderId;
}

const labelCellColumn = computed(() => {
    for (const col of props.columns) {
        if (col.editable?.labelKey) {
            return col.editable.labelKey;
        }
    }
    return undefined;
    }
);

function shouldAddCellId(col: C): boolean {
    // Check if this column is used as a label for any editable column
    return col.key === labelCellColumn.value;
}

function hasCellChange(row: T, col: C): boolean {
    if (!props.changeTracker) return false;
    return props.changeTracker.hasChange(row.key, col.key);
}

function hasCellError(row: T, col: C): boolean {
    if (!props.changeTracker) return false;
    return props.changeTracker.hasError(row.key, col.key);
}
function getCellError(row: T, col: C): string | undefined {
    if (!props.changeTracker) return undefined;
    return props.changeTracker.getError(row.key, col.key);
}

</script>

<template>
    <tbody ref="tableBodyRef" class="efficient-table-body">
        <template v-for="(row, idx) in data" :key="row.key">
            <tr
                v-if="
                    groupBy &&
                    (idx === 0 || row[groupBy] !== data[idx - 1][groupBy])
                "
                :aria-rowindex="startIndex + idx + 2"
            >
                <td
                    v-if="bulkSelectionEnabled"
                    class="table-group-checkbox"
                ></td>
                <td :colspan="columns.length" class="table-group-row">
                    <template v-if="groupRender">
                        <component :is="groupRender(row[groupBy], row)" />
                    </template>
                    <template v-else>
                        {{ row[groupBy] }}
                    </template>
                </td>
            </tr>

            <tr
                :class="[
                    'efficient-table-row',
                    {
                        'row-striped': idx % 2 === 1,
                        'row-clickable': rowClickable || bulkSelectionEnabled,
                    },
                    rowClass ? rowClass(row) : undefined,
                ]"
                :aria-rowindex="startIndex + idx + 2"
                @mousedown="handleMouseDown($event, row.key)"
                @click="handleRowClick($event, row.key)"
            >
                <td v-if="bulkSelectionEnabled" class="td-checkbox" @click.stop>
                    <input
                        type="checkbox"
                        :checked="isRowSelected(row.key)"
                        @click="(e) => handleCheckboxChange(row.key, e.shiftKey)"
                        :aria-label="`Select row ${row.key}`"
                        :name="`row-${row.key}-checkbox`"
                        class="g-bulk-select-checkbox"
                    />
                </td>

                <td
                    v-for="col in columns"
                    :key="col.key"
                    :id="
                        shouldAddCellId(col)
                            ? `${tableId}-td-${row.key}-${String(col.key)}`
                            : undefined
                    "
                    :class="[
                        col.editable ? 'editable-td' : '',
                        hasCellChange(row, col) ? 'g-cell-changed' : '',
                        hasCellError(row, col) ? 'g-cell-error' : '',
                        typeof col.tdClass === 'function'
                            ? col.tdClass(row)
                            : col.tdClass,
                    ]"
                >
                    <div v-if="col.editable" class="editable-cell">
                        <span v-if="col.editable.prefix" class="cell-prefix">{{
                            col.editable.prefix
                        }}</span>
                        <select
                            v-if="col.editable.type === 'select'"
                            :value="row[col.key]"
                            @change="handleCellChange($event, row, col)"
                            :aria-labelledby="buildAriaLabelledBy(row, col)"
                            :aria-invalid="hasCellError(row, col)"
                            :name="`row-${row.key}-${String(col.key)}-select`"
                            class="editable-input editable-select"
                        >
                            <option
                                v-for="option in col.editable.options"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <input
                            v-else
                            :value="row[col.key]"
                            v-bind="col.editable.inputAttributes"
                            @input="handleCellChange($event, row, col)"
                            :aria-labelledby="buildAriaLabelledBy(row, col)"
                            :aria-invalid="hasCellError(row, col)"
                            :aria-errormessage="hasCellError(row, col) ? `${tableId}-error-${row.key}-${String(col.key)}` : undefined"
                            :name="`row-${row.key}-${String(col.key)}-input`"
                            class="editable-input"
                            :style="{
                                paddingLeft: col.editable.prefix
                                    ? '1.5rem'
                                    : undefined,
                                paddingRight: col.editable.suffix
                                    ? '2rem'
                                    : undefined,
                            }"
                        />
                        <span v-if="col.editable.suffix" class="cell-suffix">{{
                            col.editable.suffix
                        }}</span>
                    </div>
                    <component v-else-if="col.display" :is="col.display(row)" />
                    <template v-else>{{ row[col.key] }}</template>
                    <div v-if="hasCellError(row, col)" role="alert" class="g-cell-error-message" :id="`${tableId}-error-${row.key}-${String(col.key)}`">
                        {{ getCellError(row, col) }}
                    </div>
                </td>
            </tr>
        </template>
    </tbody>
</template>

<style>
.efficient-table-body {
    th,
    td {
        padding: 0.4rem 0.2rem;
    }

    td.editable-td {
        padding: 0;
        border-right: 1px solid var(--g-surface-300);
        border-bottom: 1px solid var(--g-surface-300);
    }

    /* Add left border to first editable cell or after non-editable cell */
    td.editable-td:first-child,
    td:not(.editable-td) + td.editable-td {
        border-left: 1px solid var(--g-surface-300);
    }

    /* Add top border to editable cells in first row */
    tr:first-child td.editable-td {
        border-top: 1px solid var(--g-surface-300);
    }

    .table-group-row {
        font-weight: 600;
        background: var(--g-surface-0);
        padding: 1rem;
        font-size: 1.25rem;
        border-bottom: 1px solid var(--g-accent-500);
    }

    .table-group-checkbox {
        width: 50px;
        background: var(--g-surface-0);
    }

    .td-checkbox {
        width: 50px;
        text-align: center;
        padding: 0.4rem;
    }

    .g-bulk-select-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--g-primary-500);
    }
}

.row-striped {
    background-color: var(--g-surface-100);
}

.efficient-table-row.row-clickable {
    cursor: pointer;
}

.efficient-table-row.row-clickable:hover {
    background-color: var(--ilw-color--focus--background);
}

.efficient-table-row.row-clickable:hover td,
.efficient-table-row.row-clickable:hover a,
.efficient-table-row.row-clickable:hover span,
.efficient-table-row.row-clickable:hover strong {
    text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
    .efficient-table-row.row-clickable,
    .efficient-table-row.row-clickable:hover {
        transition: none !important;
    }
}

.editable-cell {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
}

.editable-input {
    width: 100%;
    padding: 0.4rem 0.5rem 0.4rem 0.75rem;
    border: none;
    border-radius: 0;
    font-size: 1rem;
    font-family: var(--il-font-sans);
    background: transparent;
    box-sizing: border-box;
}

.editable-input:focus {
    outline: 2px solid var(--g-primary-500);
    outline-offset: -2px;
    background: var(--g-surface-0);
}

.editable-select {
    cursor: pointer;
}

.cell-prefix,
.cell-suffix {
    position: absolute;
    font-size: 1rem;
    color: var(--g-surface-600);
    pointer-events: none;
    top: 50%;
    transform: translateY(-50%);
}

.cell-prefix {
    left: 0.5rem;
}

.cell-suffix {
    right: 0.5rem;
}

/* Highlight cells that have been changed by the user */
.g-cell-changed {
    background: rgba(101, 199, 255, 0.29);
}

/* Highlight cells with errors */
.g-cell-error {
    background: var(--g-danger-100);
    position: relative;
}

.g-cell-error-message {
    background: var(--g-danger-500);
    color: var(--g-surface-0);
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
}

.g-cell-error .editable-input[aria-invalid="true"]:focus {
    outline-color: var(--g-danger-500);
}
</style>
