<script setup lang="ts">
import { ref } from "vue";
import GTable from "../src/components/GTable.vue";
import {
    CellChangePayload,
    useTableChanges,
} from "../src/compose/useTableChanges";
import type { TableColumn } from "../src/components/table/TableColumn";
import { useFiltering } from "../src/compose/useFiltering";

interface ProductRow {
    key: string;
    name: string;
    price: number;
    quantity: number;
}

const columns: TableColumn<ProductRow>[] = [
    {
        key: "name",
        label: "Product Name",
    },
    {
        key: "price",
        label: "Price",
        editable: {
            inputAttributes: { type: "number", step: "0.01", min: "0" },
            prefix: "$",
            labelKey: "name",
        },
    },
    {
        key: "quantity",
        label: "Quantity",
        editable: {
            inputAttributes: { type: "number", min: "0" },
            labelKey: "name",
        },
    },
];

const tableData = ref<ProductRow[]>([
    { key: "1", name: "Product A", price: 10.99, quantity: 5 },
    { key: "2", name: "Product B", price: 25.5, quantity: 3 },
    { key: "3", name: "Product C", price: 15.0, quantity: 10 },
]);

const filter = useFiltering({
    name: undefined,
    price: undefined,
    quantity: undefined,
});

const changeTracker = useTableChanges<ProductRow>();

changeTracker.onChange((change) => {
    const { rowKey, columnKey, newValue, previousValue } = change;

    if (newValue === null) {
        changeTracker.clearError(rowKey, columnKey);
    }

    // Validate price
    if (columnKey === "price" && newValue < 0) {
        changeTracker.setError(
            rowKey,
            columnKey,
            "Price must be non-negative",
        );
    } else if (
        columnKey === "price" &&
        changeTracker.hasError(rowKey, columnKey)
    ) {
        changeTracker.clearError(rowKey, columnKey);
    }

    // Validate quantity
    if (columnKey === "quantity" && newValue < 0) {
        changeTracker.setError(
            rowKey,
            columnKey,
            "Quantity must be non-negative",
        );
    } else if (
        columnKey === "quantity" &&
        changeTracker.hasError(rowKey, columnKey)
    ) {
        changeTracker.clearError(rowKey, columnKey);
    }
});

</script>

<template>
    <div style="padding: 2rem">
        <h1>GTable Error Handling Example</h1>
        <!-- @vue-generic {ProductRow, TableColumn<ProductRow>} -->
        <GTable
            :filter="filter.filters"
            :data="tableData"
            :filtering="filter"
            :columns="columns"
            label="Products with Error Handling"
            :paginate="false"
            :changeTracker="changeTracker"
            @cell-change="changeTracker.trackChange"
            :start-index="0"
        />

        <div style="margin-top: 2rem">
            <h2>Changes:</h2>
            <pre>{{ JSON.stringify(changeTracker.getChanges(), null, 2) }}</pre>
        </div>
    </div>
</template>