import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";
import type { TableColumn } from "../packages/grad-vue/src/components/table/TableColumn";
import { useTableChanges } from "../packages/grad-vue/src/compose/useTableChanges";
import { createGTableFixture } from "./fixtures/createGTableFixture";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";

interface ProductRow {
    key: string;
    name: string;
    price: number;
    quantity: number;
}

const defaultFilter = {
    name: undefined,
    price: undefined,
    quantity: undefined,
};

// ========== Utility Functions for Test Data ==========

function createProduct(key: string, name: string, price: number, quantity: number): ProductRow {
    return { key, name, price, quantity };
}

// ========== Utility Functions for Column Definitions ==========

function nameColumn(): TableColumn<ProductRow> {
    return {
        key: "name",
        label: "Name",
    };
}

function priceColumn(editable: boolean = false, withPrefix: boolean = false): TableColumn<ProductRow> {
    const column: TableColumn<ProductRow> = {
        key: "price",
        label: "Price",
    };
    
    if (editable) {
        column.editable = {
            inputAttributes: { type: "number", step: "0.01" },
        };
        if (withPrefix) {
            column.editable.prefix = "$";
        }
    }
    
    return column;
}

function quantityColumn(): TableColumn<ProductRow> {
    return {
        key: "quantity",
        label: "Quantity",
        editable: {
            type: "select",
            options: [
                { label: "0", value: 0 },
                { label: "5", value: 5 },
                { label: "10", value: 10 },
            ],
        },
    };
}

// ========== Setup Helper ==========

function setupErrorTest(columnConfig: TableColumn<ProductRow>[]) {
    const changeTracker = useTableChanges<ProductRow>();
    const tableData = [createProduct("1", "Product A", 10.99, 5)];

    const fixture = createGTableFixture<ProductRow>({
        label: "Products",
        columns: columnConfig,
        data: tableData,
        initialFilter: defaultFilter,
        paginate: false,
        changeTracker,
    });
    return {
        changeTracker,
        tableData,
        columns: columnConfig,
        ...fixture
    };
}

beforeEach(() => {
    return page.viewport(800, 600);
});

describe("GTable Error Handling", () => {
    describe("Cell Error States", () => {
        const { changeTracker, tableData, columns, GTableFixture } = setupErrorTest([
            nameColumn(),
            priceColumn(true, true),
            quantityColumn(),
        ]);
        // Track a change and set an error
        changeTracker.trackChange({
            row: tableData[0],
            column: columns[1],
            value: -5,
            previousValue: 10.99,
        });
        changeTracker.trackChange({
            row: tableData[0],
            column: columns[2],
            value: 0,
            previousValue: 5,
        });
        changeTracker.setError("1", "quantity", "Quantity cannot be zero");
        changeTracker.setError("1", "price", "Price must be positive");

        it("applies aria-invalid to cells with errors", async () => {
            const { container } = mnt(GTableFixture);

            const priceInput = container.getByRole("spinbutton", { name: /Price/ });
            await expect.element(priceInput).toBeVisible();
            await expect.element(priceInput).toHaveAttribute("aria-invalid", "true");
        });

        it("applies aria-invalid to select inputs with errors", async () => {
            const { container } = mnt(GTableFixture);

            const quantitySelect = container.getByRole("combobox", { name: /Quantity/ });
            await expect.element(quantitySelect).toBeVisible();
            await expect.element(quantitySelect).toHaveAttribute("aria-invalid", "true");
        });

        it("removes aria-invalid when error is cleared", async () => {
            const { container } = mnt(GTableFixture);

            const priceInput = container.getByRole("spinbutton", { name: /Price/ });
            await expect.element(priceInput).toHaveAttribute("aria-invalid", "true");

            changeTracker.clearError("1", "price");

            // Verify error is removed
            await expect.element(priceInput).toHaveAttribute("aria-invalid", "false");
        });
    });

    describe("Error Message", () => {
        const { changeTracker, tableData, columns, GTableFixture } = setupErrorTest([
            nameColumn(),
            priceColumn(true),
        ]);
        changeTracker.clearChanges();

        // Track a change with error
        changeTracker.trackChange({
            row: tableData[0],
            column: columns[1],
            value: -5,
            previousValue: 10.99,
        });

        it("shows error message when a cell has an error", async () => {
            mnt(GTableFixture);
            changeTracker.setError("1", "price", "Price must be positive");

            await expect.element(page.getByText("Price must be positive")).toBeVisible();
        });

        it("hides error when error is cleared", async () => {
            mnt(GTableFixture);
            changeTracker.setError("1", "price", "Price must be positive");

            await expect.element(page.getByText("Price must be positive")).toBeVisible();

            changeTracker.clearError("1", "price");
            await nextTick();
            expect(page.getByText("Price must be positive")).not.toBeInTheDocument();
        });

        it("error should be associated with input", async () => {
            mnt(GTableFixture);
            changeTracker.setError("1", "price", "Price must be positive");

            await expect.element(page.getByRole('spinbutton', {name: /Price/})).toHaveAccessibleErrorMessage(/positive/);
        });
    });

    describe("Accessibility", () => {
        it("passes accessibility tests with error states", async () => {
            const { changeTracker, tableData, columns, GTableFixture } = setupErrorTest([
                nameColumn(),
                priceColumn(true),
            ]);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });
            changeTracker.setError("1", "price", "Price must be positive");

            // Test accessibility
            await testAccessibility(GTableFixture);
        });
    });
});
