import { beforeEach, describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import type { TableColumn } from "../src/components/table/TableColumn";
import { createGTableFixture } from "./fixtures/createGTableFixture";
import { mnt, testAccessibility } from "./test-utils";
import { page } from "vitest/browser";

interface ProductRow {
    key: string;
    name: string;
    price: number;
    quantity: number;
    weight: number;
    category?: string;
}

const defaultFilter = {
    name: undefined,
    price: undefined,
    quantity: undefined,
    weight: undefined,
    category: undefined,
};

function filterProductData(data: ProductRow[], filter: Record<string, any>) {
    return data;
}

// ========== Utility Functions for Test Data ==========

function createProduct(key: string, name: string, overrides: Partial<ProductRow> = {}): ProductRow {
    return {
        key,
        name,
        price: 10.99,
        quantity: 5,
        weight: 1.5,
        ...overrides,
    };
}

function createProductA(overrides: Partial<ProductRow> = {}): ProductRow {
    return createProduct("1", "Product A", overrides);
}

function createProductB(overrides: Partial<ProductRow> = {}): ProductRow {
    return createProduct("2", "Product B", { price: 25.5, quantity: 3, weight: 2.0, ...overrides });
}

// ========== Utility Functions for Column Definitions ==========

function nameColumn(): TableColumn<ProductRow> {
    return {
        key: "name",
        label: "Product Name",
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
            labelKey: "name",
        };
        if (withPrefix) {
            column.editable.prefix = "$";
        }
    }
    
    return column;
}

function quantityColumn(editable: boolean = false): TableColumn<ProductRow> {
    const column: TableColumn<ProductRow> = {
        key: "quantity",
        label: "Quantity",
    };
    
    if (editable) {
        column.editable = {
            inputAttributes: { type: "number", min: "0" },
        };
    }
    
    return column;
}

function weightColumn(editable: boolean = false, withSuffix: boolean = false): TableColumn<ProductRow> {
    const column: TableColumn<ProductRow> = {
        key: "weight",
        label: "Weight",
    };
    
    if (editable) {
        column.editable = {
            inputAttributes: { type: "number" },
            labelKey: "name",
        };
        if (withSuffix) {
            column.editable.suffix = "kg";
        }
    }
    
    return column;
}

function categoryColumn(editable: boolean = false, withLabelKey: boolean = false): TableColumn<ProductRow> {
    const column: TableColumn<ProductRow> = {
        key: "category",
        label: "Category",
    };
    
    if (editable) {
        column.editable = {
            type: "select",
            options: [
                { label: "Electronics", value: "electronics" },
                { label: "Accessories", value: "accessories" },
            ],
        };
        if (withLabelKey) {
            column.editable.labelKey = "name";
        }
    }
    
    return column;
}

beforeEach(() => {
    return page.viewport(600, 800);
});

describe("GTable Editable Columns", () => {
    describe("Setting editable columns", () => {

        const columns: TableColumn<ProductRow>[] = [
            nameColumn(),
            priceColumn(true, true),
            quantityColumn(true),
        ];

        const tableData: ProductRow[] = [
            createProductA(),
            createProductB(),
        ];

        const { GTableFixture } = createGTableFixture<ProductRow>({
            label: "Products",
            columns,
            data: tableData,
            initialFilter: defaultFilter,
            paginate: false,
        });

        it("doesn't render inputs for non-editable columns", async () => {
            mnt(GTableFixture);

            const row = page.getByRole('row').filter({ hasText: 'Product A' });
            const cells = row.getByRole('cell');
            await expect.element(cells.nth(0)).toHaveTextContent('Product A');
            await expect.element(cells.nth(0).getByRole('textbox')).not.toBeInTheDocument();
            await expect.element(cells.nth(0).getByRole('spinbutton')).not.toBeInTheDocument();
        });
        it("renders inputs for editable columns", async () => {
            mnt(GTableFixture);

            const row = page.getByRole('row').filter({ hasText: 'Product A' });
            const cells = row.getByRole('cell');
            await expect.element(cells.nth(1).getByRole('spinbutton', {name: 'Product A Price'})).toBeVisible();
        })

    });

    describe("Prefix and Suffix", () => {
        const columns: TableColumn<ProductRow>[] = [
            nameColumn(),
            priceColumn(true, true),
            weightColumn(true, true),
        ];

        const tableData: ProductRow[] = [createProductA()];

        const { GTableFixture } = createGTableFixture<ProductRow>({
            label: "Products",
            columns,
            data: tableData,
            initialFilter: defaultFilter,
            paginate: false,
        });

        it("displays prefix correctly", async () => {
            mnt(GTableFixture);
            // The value should be unchanged
            await expect.element(page.getByRole('spinbutton', {name: 'Product A Price'})).toHaveValue(10.99);

            const row = page.getByRole('row').filter({ hasText: 'Product A' });
            const cells = row.getByRole('cell');
            await expect.element(cells.nth(1).getByText('$')).toBeVisible();
        });
        it("displays suffix correctly", async () => {
            mnt(GTableFixture);
            // The value should be unchanged
            await expect.element(page.getByRole('spinbutton', {name: 'Product A Weight'})).toHaveValue(1.5);

            const row = page.getByRole('row').filter({ hasText: 'Product A' });
            const cells = row.getByRole('cell');
            await expect.element(cells.nth(2).getByText('kg')).toBeVisible();
        });
    });

    describe("Data updates", () => {
        it("updates reactive data when input changes", async () => {
            const columns: TableColumn<ProductRow>[] = [
                nameColumn(),
                priceColumn(true),
            ];

            const tableData = ref<ProductRow[]>([createProductA()]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container, vm } = mnt(GTableFixture);

            // Get the price input
            const priceInput = container.getByRole("spinbutton").first();
            await expect.element(priceInput).toBeVisible();

            // Change the value
            await priceInput.fill("15.99");

            // Wait for update
            await vm.$nextTick();

            // Check that the data was updated (converted to number)
            expect(tableData.value[0].price).toBe(15.99);
        });

        it("emits cell-change event with correct payload", async () => {
            const columns: TableColumn<ProductRow>[] = [priceColumn(true)];

            const tableData: ProductRow[] = [createProductA()];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const onCellChange = vi.fn();
            const { container, vm } = mnt(GTableFixture, {
                props: {
                    onCellChange,
                },
            });

            const priceInput = container.getByRole("spinbutton").first();
            await priceInput.fill("20.5");

            await vm.$nextTick();

            // Check that the event was emitted
            expect(onCellChange).toHaveBeenCalled();
            const payload = onCellChange.mock.calls[0][0];
            expect(payload.value).toBe(20.5); // Should be converted to number
            expect(payload.row.key).toBe("1");
            expect(payload.column.key).toBe("price");
        });

        it("applies various input attributes correctly", async () => {
            const columns: TableColumn<ProductRow>[] = [
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: {
                            type: "number",
                            step: "0.01",
                            min: "0",
                            max: "1000",
                            pattern: "[0-9]+(\.[0-9]{1,2})?",
                        },
                    },
                },
            ];

            const tableData: ProductRow[] = [createProductA()];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container } = mnt(GTableFixture);

            const input = container.getByRole("spinbutton").first();
            await expect.element(input).toBeVisible();
            
            // Check attributes via element
            const inputEl = await input.element();
            expect(inputEl.getAttribute("type")).toBe("number");
            expect(inputEl.getAttribute("step")).toBe("0.01");
            expect(inputEl.getAttribute("min")).toBe("0");
            expect(inputEl.getAttribute("max")).toBe("1000");
            expect(inputEl.getAttribute("pattern")).toBe("[0-9]+(\.[0-9]{1,2})?");
        });

        it("editable columns do not support custom display function", async () => {
            const columns: TableColumn<ProductRow>[] = [
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                    display: (row) => h("span", `$${row.price}`),
                },
            ];

            const tableData: ProductRow[] = [createProductA()];

            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            mnt(GTableFixture);

            // Check that a warning was logged
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("has both 'editable' and 'display'")
            );

            consoleWarnSpy.mockRestore();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with editable columns", async () => {
            const columns: TableColumn<ProductRow>[] = [
                nameColumn(),
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number", "aria-label": "Product price" },
                        prefix: "$",
                    },
                },
            ];

            const tableData: ProductRow[] = [createProductA()];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            await testAccessibility(GTableFixture);
        });

        it("adds unique IDs to column headers", async () => {
            const columns: TableColumn<ProductRow>[] = [
                nameColumn(),
                priceColumn(true),
            ];

            const tableData: ProductRow[] = [createProductA()];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container } = mnt(GTableFixture);

            // Check that column headers have IDs
            const nameHeader = container.getByRole("columnheader", { name: "Product Name" });
            const priceHeader = container.getByRole("columnheader", { name: "Price" });
            
            await expect.element(nameHeader).toBeVisible();
            await expect.element(priceHeader).toBeVisible();
            
            const nameHeaderEl = await nameHeader.element();
            const priceHeaderEl = await priceHeader.element();
            expect(nameHeaderEl.id).toMatch(/-th-name$/);
            expect(priceHeaderEl.id).toMatch(/-th-price$/);
        });

        it("adds IDs to cells that are used as labels for editable columns", async () => {
            const columns: TableColumn<ProductRow>[] = [
                nameColumn(),
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                        labelKey: "name",
                    },
                },
            ];

            const tableData: ProductRow[] = [
                createProductA(),
                createProductB(),
            ];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container } = mnt(GTableFixture);

            // Check that name cells have IDs - use exact match to avoid matching editable cells
            const nameCell1 = container.getByRole("cell", { name: "Product A", exact: true });
            const nameCell2 = container.getByRole("cell", { name: "Product B", exact: true });
            
            await expect.element(nameCell1).toBeVisible();
            await expect.element(nameCell2).toBeVisible();
            
            const nameCell1El = await nameCell1.element();
            const nameCell2El = await nameCell2.element();
            
            expect(nameCell1El.id).toMatch(/-td-1-name$/);
            expect(nameCell2El.id).toMatch(/-td-2-name$/);
        });
    });

    describe("Select Dropdown Features", () => {
        it("renders select dropdown for editable columns with type='select'", async () => {
            const columns: TableColumn<ProductRow>[] = [
                nameColumn(),
                categoryColumn(true),
            ];

            const tableData: ProductRow[] = [createProductA({ category: "electronics" })];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container } = mnt(GTableFixture);

            // Check that select element is rendered
            const selectElement = container.getByRole("combobox").first();
            await expect.element(selectElement).toBeVisible();
            
            // Check CSS class
            const selectEl = await selectElement.element();
            expect(selectEl.classList.contains("editable-select")).toBe(true);

            // Check that options are rendered
            const options = await container.getByRole("option").all();
            expect(options.length).toBe(2);
            
            // Check option text content by getting elements
            const option1El = await options[0].element();
            const option2El = await options[1].element();
            expect(option1El.textContent).toBe("Electronics");
            expect(option2El.textContent).toBe("Accessories");
        });

        it("updates reactive data when select value changes", async () => {
            const columns: TableColumn<ProductRow>[] = [categoryColumn(true)];

            const tableData = ref<ProductRow[]>([createProductA({ category: "electronics" })]);

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData.value,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container, vm } = mnt(GTableFixture);

            const selectElement = container.getByRole("combobox").first();
            await expect.element(selectElement).toBeVisible();

            // Change the value
            await selectElement.selectOptions("accessories");

            // Wait for update
            await vm.$nextTick();

            // Check that the data was updated
            expect(tableData.value[0].category).toBe("accessories");
        });

        it("emits cell-change event when select value changes", async () => {
            const columns: TableColumn<ProductRow>[] = [categoryColumn(true)];

            const tableData: ProductRow[] = [createProductA({ category: "electronics" })];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const onCellChange = vi.fn();
            const { container, vm } = mnt(GTableFixture, {
                props: {
                    onCellChange,
                },
            });

            const selectElement = container.getByRole("combobox").first();
            await selectElement.selectOptions("accessories");

            await vm.$nextTick();

            // Check that the event was emitted
            expect(onCellChange).toHaveBeenCalled();
            const payload = onCellChange.mock.calls[0][0];
            expect(payload.value).toBe("accessories");
            expect(payload.row.key).toBe("1");
            expect(payload.column.key).toBe("category");
        });

        it("passes accessibility tests with select dropdown", async () => {
            const columns: TableColumn<ProductRow>[] = [
                nameColumn(),
                categoryColumn(true, true),
            ];

            const tableData: ProductRow[] = [createProductA({ category: "electronics" })];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            await testAccessibility(GTableFixture);
        });
    });
});
