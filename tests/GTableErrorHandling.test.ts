import { beforeEach, describe, expect, it } from "vitest";
import { ref } from "vue";
import type { TableColumn } from "../src/components/table/TableColumn";
import { useTableChanges } from "../src/compose/useTableChanges";
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

interface ErrorTestSetup {
    changeTracker: ReturnType<typeof useTableChanges<ProductRow>>;
    tableData: ProductRow[];
    columns: TableColumn<ProductRow>[];
}

function setupErrorTest(columnConfig: TableColumn<ProductRow>[]): ErrorTestSetup {
    const changeTracker = useTableChanges<ProductRow>();
    const tableData = [createProduct("1", "Product A", 10.99, 5)];
    
    return {
        changeTracker,
        tableData,
        columns: columnConfig,
    };
}

beforeEach(() => {
    return page.viewport(800, 600);
});

describe("GTable Error Handling", () => {
    describe("Cell Error States", () => {
        it("applies error class to cells with errors", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                priceColumn(true, true),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            const { container } = mnt(GTableFixture);

            // Track a change and set an error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });
            changeTracker.setError("1", "price", "Price must be positive");

            // Check that the cell has the error class
            const priceInput = container.getByRole("spinbutton", { name: /Price/ });
            await expect.element(priceInput).toBeVisible();
            await expect.element(priceInput).toHaveAttribute("aria-invalid", "true");
            
            // Check that the parent cell has the error class
            const priceInputEl = await priceInput.element();
            const priceCell = await priceInputEl.closest("td");
            expect(priceCell?.classList.contains("cell-error")).toBe(true);
        });

        it("applies error styling to select inputs with errors", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                quantityColumn(),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            const { container } = mnt(GTableFixture);

            // Track a change and set an error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: 0,
                previousValue: 5,
            });
            changeTracker.setError("1", "quantity", "Quantity cannot be zero");

            // Check that the select has the error attribute
            const quantitySelect = container.getByRole("combobox", { name: /Quantity/ });
            await expect.element(quantitySelect).toBeVisible();
            await expect.element(quantitySelect).toHaveAttribute("aria-invalid", "true");
        });

        it("removes error class when error is cleared", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                priceColumn(true),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            const { container } = mnt(GTableFixture);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });
            changeTracker.setError("1", "price", "Price must be positive");

            // Verify error is present
            const priceInput = container.getByRole("spinbutton", { name: /Price/ });
            await expect.element(priceInput).toHaveAttribute("aria-invalid", "true");

            // Clear the error
            changeTracker.clearError("1", "price");

            // Verify error is removed
            await expect.element(priceInput).toHaveAttribute("aria-invalid", "false");
        });
    });

    describe("Error Overlay", () => {
        it("shows error overlay when focusing a cell with an error", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                priceColumn(true),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            mnt(GTableFixture);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });
            changeTracker.setError("1", "price", "Price must be positive");

            // Focus the input by clicking it
            const priceInput = page.getByRole("spinbutton", { name: /Price/ });
            await userEvent.click(priceInput);

            // Check that error overlay is visible
            const errorOverlay = page.getByRole("alert");
            await expect.element(errorOverlay).toBeVisible();
            await expect.element(errorOverlay).toHaveTextContent("Price must be positive");
        });

        it("hides error overlay when blurring the cell", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                priceColumn(true),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            mnt(GTableFixture);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });
            changeTracker.setError("1", "price", "Price must be positive");

            // Focus the input by clicking it
            const priceInput = page.getByRole("spinbutton", { name: /Price/ });
            await userEvent.click(priceInput);

            // Verify overlay is visible
            const errorOverlay = page.getByRole("alert");
            await expect.element(errorOverlay).toBeVisible();

            // Blur the input by tabbing away
            await userEvent.keyboard("{Tab}");

            // Verify overlay is hidden
            const overlays = document.querySelectorAll('[role="alert"]');
            expect(overlays.length === 0 || Array.from(overlays).every(el => !el.offsetParent)).toBe(true);
        });

        it("does not show error overlay when focusing a cell without an error", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                priceColumn(true),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            mnt(GTableFixture);

            // Track a change without error
            changeTracker.trackChange({
                row: tableData[0],
                column: columns[1],
                value: 15.99,
                previousValue: 10.99,
            });

            // Focus the input by clicking it
            const priceInput = page.getByRole("spinbutton", { name: /Price/ });
            await userEvent.click(priceInput);

            // Check that error overlay is not visible
            const overlays = document.querySelectorAll('[role="alert"]');
            expect(overlays.length).toBe(0);
        });
    });

    describe("Accessibility", () => {
        it("passes accessibility tests with error states", async () => {
            const { changeTracker, tableData, columns } = setupErrorTest([
                nameColumn(),
                priceColumn(true),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

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
