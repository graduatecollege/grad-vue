<script setup lang="ts" generic="T extends TableRow, C extends TableColumn<T>">
import { toRefs, type VNode } from "vue";
import { TableColumn, TableRow } from "./TableColumn.ts";

type Props = {
    data: T[];
    groupBy?: keyof T;
    columns: C[];
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
    startIndex: number;
};

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "row-click", link: string): void;
}>();

function handleRowClick(event: MouseEvent) {
    if (!props.rowClickable) {
        return; // Do nothing if rows are not clickable
    }
    // Only trigger if not clicking on a link or button directly
    if ((event.target as HTMLElement).closest("a,button,[tabindex]")) {
        return;
    }
    const row = (event.target as HTMLElement).closest(
        "tr",
    ) as HTMLTableRowElement;
    if (row) {
        const firstLink = row.querySelector("a[href]");
        const link = firstLink?.getAttribute("href");
        if (link) {
            emit("row-click", link);
        }
    }
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
                            'row-clickable': rowClickable,
                        },
                        rowClass ? rowClass(row) : undefined,
                    ]"
                    :aria-rowindex="startIndex + idx + 2"
                    @click="handleRowClick"
                >
                    <td
                        v-for="col in columns"
                        :key="col.key"
                        :class="
                            typeof col.tdClass === 'function'
                                ? col.tdClass(row)
                                : col.tdClass
                        "
                    >
                        <component v-if="col.display" :is="col.display(row)" />
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
                        'row-clickable': rowClickable,
                    },
                    rowClass ? rowClass(row) : undefined,
                ]"
                :aria-rowindex="startIndex + idx + 2"
                @click="handleRowClick"
            >
                <td
                    v-for="col in columns"
                    :key="col.key"
                    :class="
                        typeof col.tdClass === 'function'
                            ? col.tdClass(row)
                            : col.tdClass
                    "
                >
                    <component v-if="col.display" :is="col.display(row)" />
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
</style>
