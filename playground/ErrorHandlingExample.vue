<template>
    <div style="padding: 2rem;">
        <h1>GTable Error Handling Example</h1>
        
        <div style="margin-bottom: 1rem;">
            <button @click="addError">Add Error to First Row Price</button>
            <button @click="clearError" style="margin-left: 1rem;">Clear Error</button>
        </div>
        
        <GTable
            v-model:filter="filter"
            :data="tableData"
            :columns="columns"
            label="Products with Error Handling"
            :paginate="false"
            :changeTracker="changeTracker"
            @cell-change="handleCellChange"
        />
        
        <div style="margin-top: 2rem;">
            <h2>Changes:</h2>
            <pre>{{ JSON.stringify(changeTracker.getChanges(), null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GTable from '../src/components/GTable.vue';
import { useTableChanges } from '../src/compose/useTableChanges';
import type { TableColumn } from '../src/components/table/TableColumn';

interface ProductRow {
    key: string;
    name: string;
    price: number;
    quantity: number;
}

const columns: TableColumn<ProductRow>[] = [
    {
        key: 'name',
        label: 'Product Name',
    },
    {
        key: 'price',
        label: 'Price',
        editable: {
            inputAttributes: { type: 'number', step: '0.01', min: '0' },
            prefix: '$',
            labelKey: 'name',
        },
    },
    {
        key: 'quantity',
        label: 'Quantity',
        editable: {
            inputAttributes: { type: 'number', min: '0' },
        },
    },
];

const tableData = ref<ProductRow[]>([
    { key: '1', name: 'Product A', price: 10.99, quantity: 5 },
    { key: '2', name: 'Product B', price: 25.50, quantity: 3 },
    { key: '3', name: 'Product C', price: 15.00, quantity: 10 },
]);

const filter = ref({
    name: undefined,
    price: undefined,
    quantity: undefined,
});

const changeTracker = useTableChanges<ProductRow>();

function handleCellChange(payload: any) {
    const { row, column, value } = payload;
    
    // Update the data
    const rowIndex = tableData.value.findIndex(r => r.key === row.key);
    if (rowIndex !== -1) {
        tableData.value[rowIndex][column.key] = value;
    }
    
    // Track the change
    changeTracker.trackChange({
        row,
        column,
        value,
        previousValue: row[column.key],
    });
    
    // Validate price
    if (column.key === 'price' && value < 0) {
        changeTracker.setError(row.key, column.key, 'Price must be non-negative');
    } else if (column.key === 'price' && changeTracker.hasError(row.key, column.key)) {
        changeTracker.clearError(row.key, column.key);
    }
    
    // Validate quantity
    if (column.key === 'quantity' && value < 0) {
        changeTracker.setError(row.key, column.key, 'Quantity must be non-negative');
    } else if (column.key === 'quantity' && changeTracker.hasError(row.key, column.key)) {
        changeTracker.clearError(row.key, column.key);
    }
}

function addError() {
    // Simulate a change with an error
    const row = tableData.value[0];
    changeTracker.trackChange({
        row,
        column: columns[1],
        value: -5,
        previousValue: row.price,
    });
    changeTracker.setError(row.key, 'price', 'Price must be non-negative');
}

function clearError() {
    changeTracker.clearError('1', 'price');
}
</script>
