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
    describe("Basic Editable Features", () => {
        it("renders input elements for editable columns", async () => {
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

            const { container } = mnt(GTableFixture);

            // Check that editable columns have input elements
            const priceInputs = container.element().querySelectorAll("input[type='number'][step='0.01']");
            expect(priceInputs.length).toBe(2);

            const quantityInputs = container.element().querySelectorAll("input[type='number'][min='0']:not([step])");
            expect(quantityInputs.length).toBe(2);

            // Check that non-editable column doesn't have input
            const nameInputs = container.element().querySelectorAll("td:nth-child(1) input");
            expect(nameInputs.length).toBe(0);
        });

        it("displays prefix and suffix correctly", async () => {
            const columns: TableColumn<ProductRow>[] = [
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

            const { container } = mnt(GTableFixture);

            // Check for prefix
            const prefix = container.element().querySelector(".cell-prefix");
            expect(prefix?.textContent).toBe("$");

            // Check for suffix
            const suffix = container.element().querySelector(".cell-suffix");
            expect(suffix?.textContent).toBe("kg");
        });

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

            const priceInput = container.element().querySelector("input[type='number']") as HTMLInputElement;
            expect(priceInput).not.toBeNull();

            // Change the value
            priceInput.value = "15.99";
            priceInput.dispatchEvent(new Event("input", { bubbles: true }));

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

            const priceInput = container.element().querySelector("input[type='number']") as HTMLInputElement;
            priceInput.value = "20.5";
            priceInput.dispatchEvent(new Event("input", { bubbles: true }));

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

            const input = container.element().querySelector("input") as HTMLInputElement;
            expect(input.type).toBe("number");
            expect(input.step).toBe("0.01");
            expect(input.min).toBe("0");
            expect(input.max).toBe("1000");
            expect(input.pattern).toBe("[0-9]+(\.[0-9]{1,2})?");
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
            const nameHeader = container.element().querySelector("th[id$='-th-name']");
            const priceHeader = container.element().querySelector("th[id$='-th-price']");
            
            expect(nameHeader).not.toBeNull();
            expect(priceHeader).not.toBeNull();
            expect(nameHeader?.id).toMatch(/-th-name$/);
            expect(priceHeader?.id).toMatch(/-th-price$/);
        });

        it("adds aria-labelledby to editable inputs referencing column header", async () => {
            const columns: TableColumn<ProductRow>[] = [priceColumn(true)];

            const tableData: ProductRow[] = [createProductA()];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container } = mnt(GTableFixture);

            const priceInput = container.element().querySelector("input[type='number']") as HTMLInputElement;
            const priceHeader = container.element().querySelector("th[id$='-th-price']");
            
            expect(priceInput).not.toBeNull();
            expect(priceInput.getAttribute("aria-labelledby")).toBe(priceHeader?.id);
        });

        it("adds aria-labelledby referencing both column header and label cell when labelKey is specified", async () => {
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

            const tableData: ProductRow[] = [createProductA()];

            const { GTableFixture } = createGTableFixture<ProductRow>({
                label: "Products",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                paginate: false,
            });

            const { container } = mnt(GTableFixture);

            const priceInput = container.element().querySelector("input[type='number']") as HTMLInputElement;
            const priceHeader = container.element().querySelector("th[id$='-th-price']");
            const nameCell = container.element().querySelector("td[id$='-td-1-name']");
            
            expect(priceInput).not.toBeNull();
            expect(nameCell).not.toBeNull();
            
            const ariaLabelledBy = priceInput.getAttribute("aria-labelledby");
            expect(ariaLabelledBy).toContain(priceHeader?.id);
            expect(ariaLabelledBy).toContain(nameCell?.id);
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

            // Check that name cells have IDs
            const nameCell1 = container.element().querySelector("td[id$='-td-1-name']");
            const nameCell2 = container.element().querySelector("td[id$='-td-2-name']");
            
            expect(nameCell1).not.toBeNull();
            expect(nameCell2).not.toBeNull();
            expect(nameCell1?.textContent).toBe("Product A");
            expect(nameCell2?.textContent).toBe("Product B");
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
            const selectElement = container.element().querySelector("select");
            expect(selectElement).not.toBeNull();
            expect(selectElement?.classList.contains("editable-select")).toBe(true);

            // Check that options are rendered
            const options = container.element().querySelectorAll("select option");
            expect(options.length).toBe(2);
            expect(options[0].textContent).toBe("Electronics");
            expect(options[1].textContent).toBe("Accessories");
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

            const selectElement = container.element().querySelector("select") as HTMLSelectElement;
            expect(selectElement).not.toBeNull();

            // Change the value
            selectElement.value = "accessories";
            selectElement.dispatchEvent(new Event("change", { bubbles: true }));

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

            const selectElement = container.element().querySelector("select") as HTMLSelectElement;
            selectElement.value = "accessories";
            selectElement.dispatchEvent(new Event("change", { bubbles: true }));

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
