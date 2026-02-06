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
}

const defaultFilter = {
    name: undefined,
    price: undefined,
    quantity: undefined,
    weight: undefined,
};

function filterProductData(data: ProductRow[], filter: Record<string, any>) {
    return data;
}

beforeEach(() => {
    return page.viewport(600, 800);
});

describe("GTable Editable Columns", () => {
    describe("Basic Editable Features", () => {
        it("renders input elements for editable columns", async () => {
            const columns: TableColumn<ProductRow>[] = [
                {
                    key: "name",
                    label: "Product Name",
                },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number", step: "0.01" },
                        prefix: "$",
                    },
                },
                {
                    key: "quantity",
                    label: "Quantity",
                    editable: {
                        inputAttributes: { type: "number", min: "0" },
                    },
                },
            ];

            const tableData: ProductRow[] = [
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
                {
                    key: "2",
                    name: "Product B",
                    price: 25.5,
                    quantity: 3,
                    weight: 2.0,
                },
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
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                        prefix: "$",
                    },
                },
                {
                    key: "weight",
                    label: "Weight",
                    editable: {
                        inputAttributes: { type: "number" },
                        suffix: "kg",
                    },
                },
            ];

            const tableData: ProductRow[] = [
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
            ];

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
                {
                    key: "name",
                    label: "Product Name",
                },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                },
            ];

            const tableData = ref<ProductRow[]>([
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
            ]);

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

            // Check that the data was updated
            expect(tableData.value[0].price).toBe("15.99");
        });

        it("emits cell-change event with correct payload", async () => {
            const columns: TableColumn<ProductRow>[] = [
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number" },
                    },
                },
            ];

            const tableData: ProductRow[] = [
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
            ];

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
            expect(payload.value).toBe("20.5");
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

            const tableData: ProductRow[] = [
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
            ];

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

            const tableData: ProductRow[] = [
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
            ];

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
                {
                    key: "name",
                    label: "Product Name",
                },
                {
                    key: "price",
                    label: "Price",
                    editable: {
                        inputAttributes: { type: "number", "aria-label": "Product price" },
                        prefix: "$",
                    },
                },
            ];

            const tableData: ProductRow[] = [
                {
                    key: "1",
                    name: "Product A",
                    price: 10.99,
                    quantity: 5,
                    weight: 1.5,
                },
            ];

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
