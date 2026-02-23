import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import type { TableColumn } from "../packages/grad-vue/src/components/table/TableColumn";
import { createGTableFixture } from "./fixtures/createGTableFixture";
import { mnt, testAccessibility } from "./test-utils";
import { Locator, page } from "vitest/browser";
import GTable from "../packages/grad-vue/src/components/GTable.vue";
import { useFiltering } from "../packages/grad-vue/src/compose/useFiltering";

interface TableEntry {
    key: string;
    name: string;
    abbr: string;
    collegeInName: boolean;
}

const columns: TableColumn<TableEntry>[] = [
    {
        key: "key",
        label: "Code",
        sortable: true,
    },
    {
        key: "name",
        label: "Name",
        sortable: true,
    },
    {
        key: "abbr",
        label: "Abbreviation",
        sortable: true,
    },
    {
        key: "collegeInName",
        label: "'College' in Name",
        sortable: true,
        display: (row) => h("span", row.collegeInName ? "Yes" : "No"),
        filter: {
            type: "select",
            options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
            ],
            placeholder: "Any",
        },
    },
];

const tableData: TableEntry[] = [
    {
        key: "LT",
        name: "Carle Illinois College of Medicine",
        abbr: "COM",
        collegeInName: true,
    },
    {
        key: "KL",
        name: "College of Agricultural, Consumer and Environmental Sciences (ACES)",
        abbr: "ACES",
        collegeInName: true,
    },
    {
        key: "KY",
        name: "College of Applied Health Sciences",
        abbr: "AHS",
        collegeInName: true,
    },
    {
        key: "KN",
        name: "College of Education",
        abbr: "EDUC",
        collegeInName: true,
    },
    {
        key: "KM",
        name: "College of Fine and Applied Arts",
        abbr: "FAA",
        collegeInName: true,
    },
    {
        key: "KO",
        name: "Gies College of Business",
        abbr: "GIES",
        collegeInName: true,
    },
    {
        key: "KV",
        name: "College of Liberal Arts and Sciences",
        abbr: "LAS",
        collegeInName: true,
    },
    {
        key: "LL",
        name: "School of Social Work",
        abbr: "SOCW",
        collegeInName: false,
    },
];

const defaultFilter = {
    key: undefined,
    name: undefined,
    abbr: undefined,
    collegeInName: undefined,
};

function filterCollegesData(data: TableEntry[], filter: Record<string, any>) {
    let filtered = [...data];
    for (let [key, val] of Object.entries(filter)) {
        if (val) {
            filtered = filtered.filter((item) =>
                val === "yes"
                    ? (item as any)[key]
                    : !(item as any)[key],
            );
        }
    }
    return filtered;
}

function createCollegesTableFixture() {
    return createGTableFixture<TableEntry>({
        label: "Colleges",
        columns,
        data: tableData,
        initialFilter: defaultFilter,
        initialPageSize: 3,
        pageSizes: [3, 10, 50],
        filterData: filterCollegesData,
    });
}

function getColumn(container: Locator, index: number = 0) {
    const cells = container.element().querySelectorAll("tr > td:nth-child(" + (index + 1) + ")");

    return [...cells].map((cell) => cell.textContent);
}

beforeEach(() => {
    // Make the viewport a little bigger
    return page.viewport(600, 800);
})

describe("GTable", () => {
    describe("Functional Tests", () => {
        it("shows first page by default", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { instance, container } = mnt(GTableFixture);

            await expect.element(instance.getByText("1 to 3")).toBeVisible();

            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
        });
        it("shows second page after clicking next page", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            const nextPageButton = container.getByRole("button", {
                name: "Next Page",
            });
            await nextPageButton.click();

            await expect.element(container.getByText("4 to 6")).toBeVisible();

            expect(getColumn(container, 0)).toEqual(["KN", "KM", "KO"]);
        });
        it("shows third page after clicking last page", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            const nextPageButton = container.getByRole("button", {
                name: "Last Page",
            });
            await nextPageButton.click();

            await expect.element(container.getByText("7 to 8")).toBeVisible();

            expect(getColumn(container, 0)).toEqual(["KV", "LL"]);
        });
        it("shows second page after clicking last page and previous page", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            const nextPageButton = container.getByRole("button", {
                name: "Last Page",
            });
            await nextPageButton.click();

            const previousPageButton = container.getByRole("button", {
                name: "Previous Page",
            });
            await previousPageButton.click();

            expect(getColumn(container, 0)).toEqual(["KN", "KM", "KO"]);
        });
        it("shows first page after clicking last page and previous page twice", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const nextPageButton = container.getByRole("button", {
                name: "Last Page",
            });
            await nextPageButton.click();
            const previousPageButton = container.getByRole("button", {
                name: "Previous Page",
            });
            await previousPageButton.click();
            await previousPageButton.click();
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
        });
        it("shows all results after changing page size to 10", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            await container.getByRole("combobox").selectOptions("10");
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY", "KN", "KM", "KO", "KV", "LL"]);
        });
        it("sorts rows by code in ascending order after clicking on code column header", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const codeColumnHeader = container.getByRole("columnheader", {
                name: "Code",
            });
            await codeColumnHeader.click();
            expect(getColumn(container, 0)).toEqual(["KL", "KM", "KN"]);
        });
        it("sorts rows by code in descending order after clicking on code column header twice", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const codeColumnHeader = container.getByRole("columnheader", {
                name: "Code",
            });
            await codeColumnHeader.click();
            await codeColumnHeader.click();
            expect(getColumn(container, 0)).toEqual(["LT", "LL", "KY"]);
        });
        it("removes sorting after clicking on code column header thrice", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const codeColumnHeader = container.getByRole("columnheader", {
                name: "Code",
            });
            await codeColumnHeader.click();
            await codeColumnHeader.click();
            await codeColumnHeader.click();
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
        });
        it("filters rows by 'No' in college in name column", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const filterButton = container.getByRole("button", {
                name: "Filter",
            });
            await filterButton.click();

            await container.getByRole("option", {
                name: "No",
            }).click();

            expect(getColumn(container, 0)).toEqual(["LL"]);
        });
        it("shows correct number of results after filtering", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const filterButton = container.getByRole("button", {
                name: "Filter",
            });
            await filterButton.click();
            await container.getByRole("option", {
                name: "No",
            }).click();

            await expect.element(container.getByText("1 result")).toBeVisible();
        })
        it("clear filters removes all filters", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container, vm } = mnt(GTableFixture);
            const filterButton = container.getByRole("button", {
                name: "Filter",
            });
            await filterButton.click();
            const clearFiltersButton = container.getByRole("button", {
                name: "Clear Filters",
            });
            await container
                .getByRole("option", {
                    name: "No",
                })
                .click();
            await clearFiltersButton.click();
            await vm.$nextTick();
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
        })
    });
    describe("Bulk Selection Tests", () => {
        it("shows checkboxes when bulk selection is enabled", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 3,
                pageSizes: [3, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            const selectAllCheckbox = container.getByRole("checkbox", {
                name: "Select all rows",
            });
            await expect.element(selectAllCheckbox).toBeVisible();

            const rowCheckboxes = container.element().querySelectorAll('input[type="checkbox"][aria-label^="Select row"]');
            expect(rowCheckboxes.length).toBe(3); // 3 rows on first page
        });

        it("selects a row when checkbox is clicked", async () => {
            const { GTableFixture, selectedRows } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 3,
                pageSizes: [3, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            const firstRowCheckbox = container.getByRole("checkbox", {
                name: "Select row LT",
            });
            await firstRowCheckbox.click();

            expect(selectedRows.value).toContain("LT");
        });

        it("shows sticky toolbar when rows are selected", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 3,
                pageSizes: [3, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                    { id: "export", label: "Export", theme: "primary" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            const firstRowCheckbox = container.getByRole("checkbox", {
                name: "Select row LT",
            });
            await firstRowCheckbox.click();

            const toolbar = container.getByRole("list");
            await expect.element(toolbar).toBeVisible();
            await expect.element(container.getByText("1 row selected")).toBeVisible();
            await expect.element(container.getByRole("button", { name: "Delete" })).toBeVisible();
            await expect.element(container.getByRole("button", { name: "Export" })).toBeVisible();
        });

        it("selects all rows when select all checkbox is clicked", async () => {
            const { GTableFixture, selectedRows } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 3,
                pageSizes: [3, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            const selectAllCheckbox = container.getByRole("checkbox", {
                name: "Select all rows",
            });
            await selectAllCheckbox.click();

            expect(selectedRows.value).toEqual(["LT", "KL", "KY"]);
        });

        it("selects range of rows when using shift-click", async () => {
            const { GTableFixture, selectedRows } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 5, // Show 5 rows for better range testing
                pageSizes: [5, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            // First, select the first row (LT)
            const firstRowCheckbox = container.getByRole("checkbox", {
                name: "Select row LT",
            });
            await firstRowCheckbox.click();

            expect(selectedRows.value).toEqual(["LT"]);

            // Now shift-click the third row (KY) to select rows LT, KL, and KY
            const thirdRowCheckbox = container.getByRole("checkbox", {
                name: "Select row KY",
            });
            
            // Simulate shift-click by clicking with shiftKey
            await thirdRowCheckbox.click({ modifiers: ["Shift"] });

            expect(selectedRows.value).toEqual(["LT", "KL", "KY"]);
        });

        it("selects range of rows in reverse order with shift-click", async () => {
            const { GTableFixture, selectedRows } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 5,
                pageSizes: [5, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            // First, select the fourth row (KN)
            const fourthRowCheckbox = container.getByRole("checkbox", {
                name: "Select row KN",
            });
            await fourthRowCheckbox.click();

            expect(selectedRows.value).toEqual(["KN"]);

            // Now shift-click the second row (KL) to select rows KL, KY, and KN
            const secondRowCheckbox = container.getByRole("checkbox", {
                name: "Select row KL",
            });
            await secondRowCheckbox.click({ modifiers: ["Shift"] });

            expect(selectedRows.value).toEqual(["KN", "KL", "KY"]);
        });

        it("extends selection when shift-clicking after initial selection", async () => {
            const { GTableFixture, selectedRows } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 5,
                pageSizes: [5, 10, 50],
                filterData: filterCollegesData,
                bulkSelectionEnabled: true,
                bulkActions: [
                    { id: "delete", label: "Delete", theme: "danger" as const },
                ],
            });
            const { container } = mnt(GTableFixture);

            // Select first row (LT)
            const firstRowCheckbox = container.getByRole("checkbox", {
                name: "Select row LT",
            });
            await firstRowCheckbox.click();

            // Select third row (KY) without shift - this should toggle it on
            const thirdRowCheckbox = container.getByRole("checkbox", {
                name: "Select row KY",
            });
            await thirdRowCheckbox.click();

            expect(selectedRows.value).toEqual(["LT", "KY"]);

            // Now shift-click the fifth row (KM) to select KY, KN, and KM
            const fifthRowCheckbox = container.getByRole("checkbox", {
                name: "Select row KM",
            });
            await fifthRowCheckbox.click({ modifiers: ["Shift"] });

            expect(selectedRows.value).toEqual(["LT", "KY", "KN", "KM"]);
        });
    });

    describe("Pagination Visibility Tests", () => {
        it("shows controls bar when slot has content", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            // The pagination component should be visible
            await expect.element(container.getByText("1 to 3")).toBeVisible();
            
            // The pagination navigation buttons should exist
            const nextPageButton = container.getByRole("button", {
                name: "Next Page",
            });
            await expect.element(nextPageButton).toBeInTheDocument();
            
            // The controls bar should be visible
            const controlsBar = container.element().querySelector('.g-table-controls');
            expect(controlsBar).toBeTruthy();
        });

        it("hides entire controls bar when slot is empty and showPagination is false", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Test Table",
                columns,
                data: tableData,
                paginate: false, // Don't provide pagination slot
            });
            const { container } = mnt(GTableFixture);

            // The entire controls bar should not be visible
            const controlsBar = container.element().querySelector('.g-table-controls');
            expect(controlsBar).toBeNull();
            
            // The pagination div should not exist
            const paginationDiv = container.element().querySelector('.pagination');
            expect(paginationDiv).toBeNull();
        });

        it("shows controls bar when showPagination prop is true even with empty slot", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;
                    
                    return () =>
                        h(
                            GTable<TableEntry>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns,
                                filtering,
                                filter: filters,
                                startIndex: 0,
                                showPagination: true, // Explicitly show pagination
                            },
                            {
                                // Empty pagination slot
                            },
                        );
                },
            });
            
            const { container } = mnt(GTableFixture);

            // The controls bar should be visible
            const controlsBar = container.element().querySelector('.g-table-controls');
            expect(controlsBar).toBeTruthy();
            
            // The pagination div should be visible even though the slot is empty
            const paginationDiv = container.element().querySelector('.pagination');
            expect(paginationDiv).toBeTruthy();
        });

        it("hides controls bar when showPagination is false and slot is empty", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;
                    
                    return () =>
                        h(
                            GTable<TableEntry>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns,
                                filtering,
                                filter: filters,
                                startIndex: 0,
                                showPagination: false, // Explicitly hide pagination
                            },
                            {
                                // Empty pagination slot
                            },
                        );
                },
            });
            
            const { container } = mnt(GTableFixture);

            // The entire controls bar should not be visible
            const controlsBar = container.element().querySelector('.g-table-controls');
            expect(controlsBar).toBeNull();
        });

        it("shows controls bar with custom content in slot", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;
                    
                    return () =>
                        h(
                            GTable<TableEntry>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns,
                                filtering,
                                filter: filters,
                                startIndex: 0,
                            },
                            {
                                pagination: () => h('span', 'Custom pagination content'),
                            },
                        );
                },
            });
            
            const { container } = mnt(GTableFixture);

            // The pagination div should be visible with custom content
            await expect.element(container.getByText("Custom pagination content")).toBeVisible();
        });

        it("shows controls bar when filters are active even without pagination", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;
                    
                    // Set a filter to make isFiltered true
                    filters.collegeInName = "yes";
                    
                    return () =>
                        h(
                            GTable<TableEntry>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns,
                                filtering,
                                filter: filters,
                                "onUpdate:filter": (value: any) => {
                                    for (const key in Object.keys(value)) {
                                        // @ts-ignore
                                        filters[key] = value[key];
                                    }
                                },
                                startIndex: 0,
                            },
                            {
                                // No pagination slot
                            },
                        );
                },
            });
            
            const { container } = mnt(GTableFixture);

            // The controls bar should be visible because filters are active
            const controlsBar = container.element().querySelector('.g-table-controls');
            expect(controlsBar).toBeTruthy();
            
            // The clear filters button should be visible
            await expect.element(container.getByText("Clear Filters")).toBeVisible();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            await testAccessibility(GTableFixture);
        });

        it("passes accessibility tests with a different table configuration", async () => {
            interface SimpleRow {
                key: string;
                value: string;
            }

            const { GTableFixture } = createGTableFixture<SimpleRow>({
                label: "Simple",
                columns: [
                    { key: "key", label: "ID" },
                    { key: "value", label: "Value" },
                ],
                data: [
                    { key: "1", value: "One" },
                    { key: "2", value: "Two" },
                ],
                paginate: false,
            });

            await testAccessibility(GTableFixture);
        });
    });
});
