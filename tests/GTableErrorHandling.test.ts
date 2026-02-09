import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { TableColumn } from "../src/components/table/TableColumn";
import { useTableChanges } from "../src/compose/useTableChanges";
import { createGTableFixture } from "./fixtures/createGTableFixture";
import { mnt } from "./test-utils";
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

function createProduct(key: string, name: string, price: number, quantity: number): ProductRow {
    return { key, name, price, quantity };
}

beforeEach(() => {
    return page.viewport(800, 600);
});

describe("GTable Error Handling", () => {
    describe("Cell Error States", () => {
        it("applies error class to cells with errors", async () => {
            const changeTracker = useTableChanges<ProductRow>();
            const columns: TableColumn<ProductRow>[] = [
                { key: "name", label: "Name" },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number", step: "0.01" },
                        prefix: "$",
                    },
                },
            ];
            const tableData = ref<ProductRow[]>([
                createProduct("1", "Product A", 10.99, 5),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            const { container } = mnt(GTableFixture);

            // Track a change
            changeTracker.trackChange({
                row: tableData.value[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });

            // Set an error on the cell
            changeTracker.setError("1", "price", "Price must be positive");

            // Check that the cell has the error class
            const priceInput = container.getByRole("spinbutton", { name: /Price/ });
            await expect.element(priceInput).toBeVisible();
            
            // Wait for the aria-invalid attribute to be set
            await vi.waitFor(async () => {
                const priceInputEl = await priceInput.element();
                return priceInputEl.getAttribute("aria-invalid") === "true";
            });
            
            const priceInputEl = await priceInput.element();
            expect(priceInputEl.getAttribute("aria-invalid")).toBe("true");
            
            // Check that the parent cell has the error class
            const priceCell = await priceInputEl.closest("td");
            expect(priceCell?.classList.contains("cell-error")).toBe(true);
        });

        it("applies error styling to select inputs with errors", async () => {
            const changeTracker = useTableChanges<ProductRow>();
            const columns: TableColumn<ProductRow>[] = [
                { key: "name", label: "Name" },
                {
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
                },
            ];
            const tableData = ref<ProductRow[]>([
                createProduct("1", "Product A", 10.99, 5),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            const { container } = mnt(GTableFixture);

            // Track a change
            changeTracker.trackChange({
                row: tableData.value[0],
                column: columns[1],
                value: 0,
                previousValue: 5,
            });

            // Set an error on the cell
            changeTracker.setError("1", "quantity", "Quantity cannot be zero");

            // Check that the select has the error attribute
            const quantitySelect = container.getByRole("combobox", { name: /Quantity/ });
            await expect.element(quantitySelect).toBeVisible();
            
            // Wait for the aria-invalid attribute to be set
            await vi.waitFor(async () => {
                const selectEl = await quantitySelect.element();
                return selectEl.getAttribute("aria-invalid") === "true";
            });
            
            const selectEl = await quantitySelect.element();
            expect(selectEl.getAttribute("aria-invalid")).toBe("true");
        });

        it("removes error class when error is cleared", async () => {
            const changeTracker = useTableChanges<ProductRow>();
            const columns: TableColumn<ProductRow>[] = [
                { key: "name", label: "Name" },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                },
            ];
            const tableData = ref<ProductRow[]>([
                createProduct("1", "Product A", 10.99, 5),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            const { container } = mnt(GTableFixture);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData.value[0],
                column: columns[1],
                value: -5,
                previousValue: 10.99,
            });
            changeTracker.setError("1", "price", "Price must be positive");

            // Verify error is present
            const priceInput = container.getByRole("spinbutton", { name: /Price/ });
            await vi.waitFor(async () => {
                const el = await priceInput.element();
                return el.getAttribute("aria-invalid") === "true";
            });
            
            let priceInputEl = await priceInput.element();
            expect(priceInputEl.getAttribute("aria-invalid")).toBe("true");

            // Clear the error
            changeTracker.clearError("1", "price");

            // Verify error is removed
            await vi.waitFor(async () => {
                const el = await priceInput.element();
                return el.getAttribute("aria-invalid") === "false";
            });
            
            priceInputEl = await priceInput.element();
            expect(priceInputEl.getAttribute("aria-invalid")).toBe("false");
        });
    });

    describe("Error Overlay", () => {
        it("shows error overlay when focusing a cell with an error", async () => {
            const changeTracker = useTableChanges<ProductRow>();
            const columns: TableColumn<ProductRow>[] = [
                { key: "name", label: "Name" },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                },
            ];
            const tableData = ref<ProductRow[]>([
                createProduct("1", "Product A", 10.99, 5),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            mnt(GTableFixture);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData.value[0],
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
            await vi.waitFor(async () => {
                try {
                    await expect.element(errorOverlay).toBeVisible();
                    return true;
                } catch {
                    return false;
                }
            });
            
            await expect.element(errorOverlay).toBeVisible();
            await expect.element(errorOverlay).toHaveTextContent("Price must be positive");
        });

        it("hides error overlay when blurring the cell", async () => {
            const changeTracker = useTableChanges<ProductRow>();
            const columns: TableColumn<ProductRow>[] = [
                { key: "name", label: "Name" },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                },
            ];
            const tableData = ref<ProductRow[]>([
                createProduct("1", "Product A", 10.99, 5),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            mnt(GTableFixture);

            // Track a change with error
            changeTracker.trackChange({
                row: tableData.value[0],
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
            await vi.waitFor(async () => {
                try {
                    await expect.element(errorOverlay).toBeVisible();
                    return true;
                } catch {
                    return false;
                }
            });

            // Blur the input by tabbing away
            await userEvent.keyboard("{Tab}");

            // Verify overlay is hidden - wait a bit for the blur to take effect
            await vi.waitFor(async () => {
                const overlays = document.querySelectorAll('[role="alert"]');
                return overlays.length === 0 || Array.from(overlays).every(el => !el.offsetParent);
            }, { timeout: 1000 });
        });

        it("does not show error overlay when focusing a cell without an error", async () => {
            const changeTracker = useTableChanges<ProductRow>();
            const columns: TableColumn<ProductRow>[] = [
                { key: "name", label: "Name" },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                },
            ];
            const tableData = ref<ProductRow[]>([
                createProduct("1", "Product A", 10.99, 5),
            ]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
                changeTracker,
            });

            mnt(GTableFixture);

            // Track a change without error
            changeTracker.trackChange({
                row: tableData.value[0],
                column: columns[1],
                value: 15.99,
                previousValue: 10.99,
            });

            // Focus the input by clicking it
            const priceInput = page.getByRole("spinbutton", { name: /Price/ });
            await userEvent.click(priceInput);

            // Check that error overlay is not visible
            // We check by querying the DOM directly since the element may not exist
            const overlays = document.querySelectorAll('[role="alert"]');
            expect(overlays.length).toBe(0);
        });
    });
});
