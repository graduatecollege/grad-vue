<script setup lang="ts" generic="T extends TableRow, C extends TableColumn<T>">
import { toRefs, type VNode } from "vue";
import { TableColumn, TableRow } from "./TableColumn.ts";
import { HTMLInputElement } from "happy-dom";

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
    const input = event.target as unknown as HTMLInputElement;
    const value = input.value;
    emit("cell-change", { row, column: col, value });
}
</script>

<template>
    <tbody class="efficient-table-body">
        <template v-if="groupBy">
            <template v-for="(row, idx) in data" :key="row.key">
                <tr
                    v-if="idx === 0 || row[groupBy] !== data[idx - 1][groupBy]"
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
                            'row-clickable':
                                rowClickable || bulkSelectionEnabled,
                        },
                        rowClass ? rowClass(row) : undefined,
                    ]"
                    :aria-rowindex="startIndex + idx + 2"
                    @mousedown="handleMouseDown($event, row.key)"
                    @click="handleRowClick($event, row.key)"
                >
                    <td
                        v-if="bulkSelectionEnabled"
                        class="td-checkbox"
                        @click.stop
                    >
                        <input
                            type="checkbox"
                            :checked="isRowSelected(row.key)"
                            @click="(e) => handleCheckboxChange(row.key, e.shiftKey)"
                            :aria-label="`Select row ${row.key}`"
                            class="g-bulk-select-checkbox"
                        />
                    </td>
                    <td
                        v-for="col in columns"
                        :key="col.key"
                        :class="
                            typeof col.tdClass === 'function'
                                ? col.tdClass(row)
                                : col.tdClass
                        "
                    >
                        <div v-if="col.editable" class="editable-cell">
                            <span v-if="col.editable.prefix" class="cell-prefix">{{ col.editable.prefix }}</span>
                            <input
                                :value="row[col.key]"
                                v-bind="col.editable.inputAttributes"
                                @input="handleCellChange($event, row, col)"
                                class="editable-input"
                            />
                            <span v-if="col.editable.suffix" class="cell-suffix">{{ col.editable.suffix }}</span>
                        </div>
                        <component v-else-if="col.display" :is="col.display(row)" />
                        <template v-else>{{ row[col.key] }}</template>
                    </td>
                </tr>
            </template>
        </template>
        <template v-else>
            <tr
                v-for="(row, idx) in data"
                :key="row.key"
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
                        class="g-bulk-select-checkbox"
                    />
                </td>
                <td
                    v-for="col in columns"
                    :key="col.key"
                    :class="
                        typeof col.tdClass === 'function'
                            ? col.tdClass(row)
                            : col.tdClass
                    "
                >
                    <div v-if="col.editable" class="editable-cell">
                        <span v-if="col.editable.prefix" class="cell-prefix">{{ col.editable.prefix }}</span>
                        <input
                            :value="row[col.key]"
                            v-bind="col.editable.inputAttributes"
                            @input="handleCellChange($event, row, col)"
                            class="editable-input"
                        />
                        <span v-if="col.editable.suffix" class="cell-suffix">{{ col.editable.suffix }}</span>
                    </div>
                    <component v-else-if="col.display" :is="col.display(row)" />
                    <template v-else>{{ row[col.key] }}</template>
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
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.editable-input {
    flex: 1;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--g-surface-900);
    border-radius: 3px;
    font-size: 1rem;
    font-family: var(--il-font-sans);
    background: var(--g-surface-0);
}

.editable-input:focus {
    outline: 2px solid var(--g-primary-500);
    outline-offset: 2px;
}

.cell-prefix,
.cell-suffix {
    font-size: 1rem;
    color: var(--g-text-color);
}
</style>
