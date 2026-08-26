import { beforeEach, describe, expect, it, vi } from "vitest";
import { Component, defineComponent, h } from "vue";
import type { TableColumn } from "../packages/grad-vue/src/components/table/TableColumn";
import { createGTableFixture } from "./fixtures/createGTableFixture";
import { mnt, testAccessibility } from "./test-utils";
import { Locator, page, userEvent } from "vitest/browser";
import GTable from "../packages/grad-vue/src/components/GTable.vue";
import { useFiltering } from "../packages/grad-vue/src/compose/useFiltering";

interface TableEntry {
    key: string;
    name: string;
    abbr: string;
    collegeInName: boolean;
}

interface MultiSortEntry {
    key: string;
    group: string;
    name: string;
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
    key: undefined as string | undefined,
    name: undefined as string | undefined,
    abbr: undefined as string | undefined,
    collegeInName: undefined as string | undefined,
};

const multiSortColumns: TableColumn<MultiSortEntry>[] = [
    {
        key: "key",
        label: "ID",
    },
    {
        key: "group",
        label: "Group",
        sortable: true,
    },
    {
        key: "name",
        label: "Name",
        sortable: true,
    },
];

const multiSortData: MultiSortEntry[] = [
    {
        key: "1",
        group: "A",
        name: "Beta",
    },
    {
        key: "2",
        group: "B",
        name: "Alpha",
    },
    {
        key: "3",
        group: "A",
        name: "Alpha",
    },
    {
        key: "4",
        group: "B",
        name: "Beta",
    },
];

function filterCollegesData(data: TableEntry[], filter: Record<string, any>) {
    let filtered = [...data];
    for (let [key, val] of Object.entries(filter)) {
        if (val) {
            if (key === "name") {
                filtered = filtered.filter((item) =>
                    item.name.toLowerCase().includes(String(val).toLowerCase()),
                );
            } else {
                filtered = filtered.filter((item) =>
                    val === "yes" ? (item as any)[key] : !(item as any)[key],
                );
            }
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

function createMultiSortFixture() {
    return createGTableFixture<MultiSortEntry>({
        label: "Multi Sort",
        columns: multiSortColumns,
        data: multiSortData,
        paginate: false,
    });
}

function getColumn(container: Locator, index: number = 0) {
    const cells = container
        .element()
        .querySelectorAll("tr > td:nth-child(" + (index + 1) + ")");

    return [...cells].map((cell) => cell.textContent);
}

function wrapInWidth(component: Component, width: number) {
    return defineComponent({
        name: "GTableWidthWrapper",
        render() {
            return h("div", { style: { width: `${width}px` } }, [h(component)]);
        },
    });
}

beforeEach(() => {
    return page.viewport(1200, 800);
});

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
            expect(getColumn(container, 0)).toEqual([
                "LT",
                "KL",
                "KY",
                "KN",
                "KM",
                "KO",
                "KV",
                "LL",
            ]);
        });
        it("sorts rows by code in ascending order after clicking on code column header", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const codeSortButton = container.getByRole("button", {
                name: /^Code\b/,
            });
            await codeSortButton.click();
            expect(getColumn(container, 0)).toEqual(["KL", "KM", "KN"]);
        });
        it("sorts rows by code in descending order after clicking on code column header twice", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const codeSortButton = container.getByRole("button", {
                name: /^Code\b/,
            });
            await codeSortButton.click();
            await codeSortButton.click();
            expect(getColumn(container, 0)).toEqual(["LT", "LL", "KY"]);
        });
        it("removes sorting after clicking on code column header thrice", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const codeSortButton = container.getByRole("button", {
                name: /^Code\b/,
            });
            await codeSortButton.click();
            await codeSortButton.click();
            await codeSortButton.click();
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
        });
        it("adds a secondary sort with shift-click", async () => {
            const { GTableFixture, sorts } = createMultiSortFixture();
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", { name: /^Group\b/ })
                .click();
            await container
                .getByRole("button", { name: /^Name\b/ })
                .click({ modifiers: ["Shift"] });

            expect(sorts.value).toEqual([
                { key: "group", order: 1 },
                { key: "name", order: 1 },
            ]);
            expect(getColumn(container, 0)).toEqual(["3", "1", "2", "4"]);
        });
        it("updates the primary sort from the sort builder", async () => {
            const { GTableFixture, sorts } = createMultiSortFixture();
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", { name: /^Group\b/ })
                .click();
            await container
                .getByRole("button", { name: "Choose sort order" })
                .click();
            await page
                .getByRole("button", { name: "Clear sort" })
                .click();
            await page
                .getByRole("button", { name: "Add Name ascending sort" })
                .click();
            await page
                .getByRole("button", { name: "Add Group ascending sort" })
                .click();

            expect(sorts.value).toEqual([
                { key: "name", order: 1 },
                { key: "group", order: 1 },
            ]);
            expect(getColumn(container, 0)).toEqual(["3", "2", "1", "4"]);
        });
        it("focuses the sort popover fieldset when opened", async () => {
            const { GTableFixture } = createMultiSortFixture();
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", { name: "Choose sort order" })
                .click();

            await expect
                .element(page.getByRole("group", { name: "Sort order" }))
                .toHaveFocus();
        });
        it("focuses the new active sort row after adding with the keyboard", async () => {
            const { GTableFixture, sorts } = createMultiSortFixture();
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", { name: "Choose sort order" })
                .click();

            await userEvent.keyboard("{Tab}{Tab}{Tab}");
            await expect
                .element(page.getByRole("button", { name: "Add Name ascending sort" }))
                .toHaveFocus();

            await userEvent.keyboard("{Enter}");

            expect(sorts.value).toEqual([{ key: "name", order: 1 }]);
            await expect
                .element(
                    page.getByRole("listitem", {
                        name: "Name Ascending sort, priority 1",
                    }),
                )
                .toHaveFocus();
        });
        it("filters rows by 'No' in college in name column", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const filterButton = container.getByRole("button", {
                name: "Filter",
            });
            await filterButton.click();

            await page
                .getByRole("option", {
                    name: "No",
                })
                .click();

            expect(getColumn(container, 0)).toEqual(["LL"]);
        });
        it("shows correct number of results after filtering", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);
            const filterButton = container.getByRole("button", {
                name: "Filter",
            });
            await filterButton.click();
            await page
                .getByRole("option", {
                    name: "No",
                })
                .click();

            await expect.element(container.getByText("1 result")).toBeVisible();
        });
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
            await page
                .getByRole("option", {
                    name: "No",
                })
                .click();
            await clearFiltersButton.click();
            await vm.$nextTick();
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
        });
        it("filters rows by partial text match in name column", async () => {
            const searchColumns: TableColumn<TableEntry>[] = [
                { key: "key", label: "Code", sortable: true },
                {
                    key: "name",
                    label: "Name",
                    sortable: true,
                    filter: { type: "search", placeholder: "Search name" },
                },
            ];
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns: searchColumns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 10,
                pageSizes: [10, 50],
                filterData: filterCollegesData,
            });
            const { container } = mnt(GTableFixture);
            const filterButton = container.getByRole("button", {
                name: "Filter Column",
            });
            await filterButton.click();

            const searchInput = page.getByRole("searchbox", {
                name: "Search Name",
            });
            await searchInput.fill("School");

            expect(getColumn(container, 1)).toEqual(["School of Social Work"]);
        });
    });
    describe("Column Visibility Tests", () => {
        it("hides the column chooser when column visibility is not configured", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
            });
            const { container } = mnt(GTableFixture);

            await expect
                .element(
                    container.getByRole("button", {
                        name: "Choose visible columns",
                    }),
                )
                .not.toBeInTheDocument();
        });

        it("shows a column chooser even without pagination", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                initialColumnState: {},
            });
            const { container } = mnt(GTableFixture);

            await expect
                .element(
                    container.getByRole("button", {
                        name: "Choose visible columns",
                    }),
                )
                .toBeVisible();
        });

        it("hides the Show All action when every column is visible", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                initialColumnState: {},
            });
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", {
                    name: "Choose visible columns",
                })
                .click();

            await expect
                .element(page.getByRole("group", { name: "Shown columns" }))
                .toBeVisible();
            await expect
                .element(
                    page.getByRole("button", {
                        name: "Show All",
                        includeHidden: true,
                    }),
                )
                .not.toBeVisible();
        });

        it("omits configured hidden columns from rendering", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                initialFilter: defaultFilter,
                initialPageSize: 3,
                pageSizes: [3, 10, 50],
                filterData: filterCollegesData,
                initialColumnState: {
                    abbr: { visible: false },
                },
            });
            const { container } = mnt(GTableFixture);

            await expect
                .element(
                    container.getByRole("columnheader", { name: "Abbreviation" }),
                )
                .not.toBeInTheDocument();
            expect(getColumn(container, 0)).toEqual(["LT", "KL", "KY"]);
            expect(getColumn(container, 1)).toEqual([
                "Carle Illinois College of Medicine",
                "College of Agricultural, Consumer and Environmental Sciences (ACES)",
                "College of Applied Health Sciences",
            ]);
            expect(getColumn(container, 2)).toEqual(["Yes", "Yes", "Yes"]);
            expect(getColumn(container, 3)).toEqual([]);
        });

        it("updates column visibility from the chooser", async () => {
            const { GTableFixture, columnState } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 3,
                    pageSizes: [3, 10, 50],
                    filterData: filterCollegesData,
                    initialColumnState: {
                        abbr: { visible: false },
                    },
                });
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", {
                    name: "Choose visible columns",
                })
                .click();
            await page.getByRole("checkbox", { name: "Abbreviation" }).click();

            expect(columnState.value.abbr?.visible).toBe(true);
            await expect
                .element(
                    container.getByRole("columnheader", { name: "Abbreviation" }),
                )
                .toBeVisible();
            expect(getColumn(container, 2)).toEqual(["COM", "ACES", "AHS"]);
        });

        it("shows a Show All action when columns are hidden and restores them", async () => {
            const { GTableFixture, columnState } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 3,
                    pageSizes: [3, 10, 50],
                    filterData: filterCollegesData,
                    initialColumnState: {
                        abbr: { visible: false },
                    },
                });
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", {
                    name: "Choose visible columns",
                })
                .click();

            await expect
                .element(page.getByRole("button", { name: "Show All" }))
                .toBeVisible();

            await page.getByRole("button", { name: "Show All" }).click();

            expect(columnState.value.abbr?.visible).toBe(true);
            await expect
                .element(
                    container.getByRole("columnheader", { name: "Abbreviation" }),
                )
                .toBeVisible();
            await expect
                .element(
                    page.getByRole("button", {
                        name: "Show All",
                        includeHidden: true,
                    }),
                )
                .not.toBeVisible();
        });

        it("keeps the column chooser width stable when Show All appears", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                initialColumnState: {},
            });
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", {
                    name: "Choose visible columns",
                })
                .click();

            const chooser = page.getByRole("group", { name: "Shown columns" });

            await expect.element(chooser).toBeVisible();
            await new Promise((resolve) => setTimeout(resolve, 200));

            const widthBefore = chooser.element().getBoundingClientRect().width;

            await page.getByRole("checkbox", { name: "Abbreviation" }).click();

            await expect
                .element(page.getByRole("button", { name: "Show All" }))
                .toBeVisible();
            await new Promise((resolve) => setTimeout(resolve, 50));

            const widthAfter = chooser.element().getBoundingClientRect().width;

            expect(Math.abs(widthAfter - widthBefore)).toBeLessThanOrEqual(0.5);
        });

        it("uses the visible column count for grouped row colspan", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                groupBy: "collegeInName",
                initialColumnState: {
                    name: { visible: false },
                    abbr: { visible: false },
                },
            });
            const { container } = mnt(GTableFixture);

            const groupRow = container
                .element()
                .querySelector(".table-group-row") as HTMLTableCellElement | null;

            expect(groupRow?.getAttribute("colspan")).toBe("2");
        });
    });
    describe("Resizable Column Tests", () => {
        it("applies stored widths from column state", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                resizableColumns: true,
                initialColumnState: {
                    key: { width: 160 },
                    name: { width: 320 },
                },
            });
            const { container } = mnt(wrapInWidth(GTableFixture, 900));

            const keyColumn = container.element().querySelector(
                'col[data-column-key="key"]',
            ) as HTMLTableColElement | null;

            expect(keyColumn?.style.width).toBe("160px");
            expect(keyColumn?.style.minWidth).toBe("160px");
        });

        it("updates column width from keyboard input", async () => {
            const { GTableFixture, columnState } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                resizableColumns: true,
                initialColumnState: {
                    key: { width: 160 },
                },
            });
            const { container } = mnt(wrapInWidth(GTableFixture, 900));

            const resizeHandle = container.getByRole("separator", {
                name: "Resize Code column",
            });
            resizeHandle.element().focus();
            await userEvent.keyboard("{ArrowRight}");

            expect(columnState.value.key?.width).toBe(176);
            await expect.element(resizeHandle).toHaveAttribute("aria-valuenow", "176");
        });

        it("updates column width from pointer drag", async () => {
            const { GTableFixture, columnState } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                resizableColumns: true,
                initialColumnState: {
                    key: { width: 160 },
                },
            });
            const { container } = mnt(wrapInWidth(GTableFixture, 900));

            const resizeHandle = container.getByRole("separator", {
                name: "Resize Code column",
            });

            resizeHandle.element().dispatchEvent(
                new PointerEvent("pointerdown", {
                    bubbles: true,
                    clientX: 200,
                }),
            );
            window.dispatchEvent(
                new PointerEvent("pointermove", {
                    bubbles: true,
                    clientX: 244,
                }),
            );
            window.dispatchEvent(
                new PointerEvent("pointerup", {
                    bubbles: true,
                    clientX: 244,
                }),
            );

            await vi.waitUntil(() => columnState.value.key?.width === 204);
        });

        it("keeps the last resize handle inside the table wrapper", async () => {
            const { GTableFixture } = createGTableFixture<TableEntry>({
                label: "Colleges",
                columns,
                data: tableData,
                paginate: false,
                resizableColumns: true,
            });
            const { container } = mnt(wrapInWidth(GTableFixture, 900));

            const wrap = container.element().querySelector(
                ".g-table-table-wrap",
            ) as HTMLDivElement | null;
            const handles = container.element().querySelectorAll(
                ".g-column-resize-handle",
            );
            const lastHandle = handles.item(handles.length - 1) as HTMLElement | null;

            expect(wrap).not.toBeNull();
            expect(lastHandle).not.toBeNull();

            const wrapRect = wrap!.getBoundingClientRect();
            const handleRect = lastHandle!.getBoundingClientRect();

            expect(handleRect.right).toBeLessThanOrEqual(wrapRect.right + 0.5);
            expect(wrap!.scrollWidth).toBeLessThanOrEqual(wrap!.clientWidth + 1);
            expect(handleRect.width).toBeGreaterThanOrEqual(24);
        });
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

            const rowCheckboxes = container
                .element()
                .querySelectorAll(
                    'input[type="checkbox"][aria-label^="Select row"]',
                );
            expect(rowCheckboxes.length).toBe(3); // 3 rows on first page

            await expect.element(
                container
                    .getByRole("cell")
                    .getByRole("checkbox"))
                .toHaveLength(3);
        });

        it("selects a row when checkbox is clicked", async () => {
            const { GTableFixture, selectedRows } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 3,
                    pageSizes: [3, 10, 50],
                    filterData: filterCollegesData,
                    bulkSelectionEnabled: true,
                    bulkActions: [
                        {
                            id: "delete",
                            label: "Delete",
                            theme: "danger" as const,
                        },
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
                    {
                        id: "export",
                        label: "Export",
                        theme: "primary" as const,
                    },
                ],
            });
            const { container } = mnt(GTableFixture);

            const firstRowCheckbox = container.getByRole("checkbox", {
                name: "Select row LT",
            });
            await firstRowCheckbox.click();

            const toolbar = container.getByRole("list");
            await expect.element(toolbar).toBeVisible();
            await expect
                .element(container.getByText("1 row selected"))
                .toBeVisible();
            await expect
                .element(container.getByRole("button", { name: "Delete" }))
                .toBeVisible();
            await expect
                .element(container.getByRole("button", { name: "Export" }))
                .toBeVisible();
        });

        it("selects all rows when select all checkbox is clicked", async () => {
            const { GTableFixture, selectedRows } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 3,
                    pageSizes: [3, 10, 50],
                    filterData: filterCollegesData,
                    bulkSelectionEnabled: true,
                    bulkActions: [
                        {
                            id: "delete",
                            label: "Delete",
                            theme: "danger" as const,
                        },
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
            const { GTableFixture, selectedRows } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 5, // Show 5 rows for better range testing
                    pageSizes: [5, 10, 50],
                    filterData: filterCollegesData,
                    bulkSelectionEnabled: true,
                    bulkActions: [
                        {
                            id: "delete",
                            label: "Delete",
                            theme: "danger" as const,
                        },
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
            const { GTableFixture, selectedRows } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 5,
                    pageSizes: [5, 10, 50],
                    filterData: filterCollegesData,
                    bulkSelectionEnabled: true,
                    bulkActions: [
                        {
                            id: "delete",
                            label: "Delete",
                            theme: "danger" as const,
                        },
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
            const { GTableFixture, selectedRows } =
                createGTableFixture<TableEntry>({
                    label: "Colleges",
                    columns,
                    data: tableData,
                    initialFilter: defaultFilter,
                    initialPageSize: 5,
                    pageSizes: [5, 10, 50],
                    filterData: filterCollegesData,
                    bulkSelectionEnabled: true,
                    bulkActions: [
                        {
                            id: "delete",
                            label: "Delete",
                            theme: "danger" as const,
                        },
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
        it("shows built-in pagination when enabled", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            // The pagination component should be visible
            await expect.element(container.getByText("1 to 3")).toBeVisible();

            // The pagination navigation buttons should exist
            const nextPageButton = container.getByRole("button", {
                name: "Next Page",
            });
            await expect.element(nextPageButton).toBeInTheDocument();

            await expect
                .element(container.getByRole("button", { name: "First Page" }))
                .toBeInTheDocument();
        });

        it("hides the controls bar when pagination is disabled and no other controls are needed", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;

                    return () =>
                        h(
                            GTable<TableEntry, TableColumn<TableEntry>>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns: [{ key: "name", label: "Name" }],
                                filtering,
                                filter: filters,
                                startIndex: 0,
                                pagination: false,
                            },
                        );
                },
            });

            const { container } = mnt(GTableFixture);

            await expect
                .element(container.getByText("results"))
                .not.toBeInTheDocument();
        });

        it("shows controls bar when pagination is enabled even without other controls", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;

                    return () =>
                        h(
                            GTable<TableEntry, TableColumn<TableEntry>>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns: [{ key: "name", label: "Name" }],
                                filtering,
                                filter: filters,
                                startIndex: 0,
                                pageSize: 3,
                                pageSizes: [3, 10],
                                resultCount: tableData.length,
                                pagination: true,
                            },
                        );
                },
            });

            const { container } = mnt(GTableFixture);

            await expect
                .element(container.getByRole("navigation", { name: "Pagination" }))
                .toBeVisible();
        });

        it("renders the table in a separate wrapper from the controls", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            const controls = container.element().querySelector(
                ".g-table-controls",
            ) as HTMLElement | null;
            const tableWrapper = container.element().querySelector(
                ".g-table-table-wrap",
            ) as HTMLElement | null;
            const table = tableWrapper?.querySelector(".g-table");

            expect(controls).not.toBeNull();
            expect(tableWrapper).not.toBeNull();
            expect(table).not.toBeNull();
            expect(tableWrapper?.querySelector(".g-table-controls")).toBeNull();
            expect(controls?.closest(".g-table-table-wrap")).toBeNull();
        });

        it("keeps pagination centered and result count pinned right", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(GTableFixture);

            const controls = container.element().querySelector(
                ".g-table-controls",
            ) as HTMLElement | null;
            const pagination = controls?.querySelector(
                ".pagination",
            ) as HTMLElement | null;
            const resultCount = controls?.querySelector(
                ".g-result-count",
            ) as HTMLElement | null;

            expect(controls).not.toBeNull();
            expect(pagination).not.toBeNull();
            expect(resultCount).not.toBeNull();

            expect(window.getComputedStyle(controls!).display).toBe("grid");
            expect(window.getComputedStyle(pagination!).gridColumnStart).toBe(
                "2",
            );
            expect(window.getComputedStyle(resultCount!).gridColumnStart).toBe(
                "3",
            );
        });

        it("switches the controls bar to flex layout below 1000px", async () => {
            const { GTableFixture } = createCollegesTableFixture();
            const { container } = mnt(wrapInWidth(GTableFixture, 980));

            const controls = container.element().querySelector(
                ".g-table-controls",
            ) as HTMLElement | null;

            expect(controls).not.toBeNull();
            expect(window.getComputedStyle(controls!).display).toBe("flex");
            expect(window.getComputedStyle(controls!).justifyContent).toBe(
                "space-between",
            );
        });

        it("keeps result count on the right without pagination", async () => {
            const { GTableFixture } = createMultiSortFixture();
            const { container } = mnt(GTableFixture);

            const controls = container.element().querySelector(
                ".g-table-controls",
            ) as HTMLElement | null;
            const pagination = controls?.querySelector(".pagination");
            const resultCount = controls?.querySelector(
                ".g-result-count",
            ) as HTMLElement | null;

            expect(controls).not.toBeNull();
            expect(pagination).toBeNull();
            expect(resultCount).not.toBeNull();
            expect(window.getComputedStyle(resultCount!).gridColumnStart).toBe(
                "3",
            );
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
                            GTable<TableEntry, TableColumn<TableEntry>>,
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
                        );
                },
            });

            const { container } = mnt(GTableFixture);

            // The clear filters button should be visible
            await expect
                .element(container.getByText("Clear Filters"))
                .toBeVisible();
        });

        it("renders custom controls between column visibility and clear filters", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;
                    const columnState = {
                        key: { visible: true },
                        name: { visible: true },
                    };

                    filters.collegeInName = "yes";

                    return () =>
                        h(
                            GTable<TableEntry, TableColumn<TableEntry>>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns: [
                                    { key: "key", label: "Code" },
                                    { key: "name", label: "Name" },
                                ],
                                filtering,
                                filter: filters,
                                startIndex: 0,
                                columnState,
                                "onUpdate:columnState": () => undefined,
                            },
                            {
                                controls: () =>
                                    h(
                                        "button",
                                        { type: "button", class: "test-custom-control" },
                                        "Custom Control",
                                    ),
                            },
                        );
                },
            });

            const { container } = mnt(GTableFixture);
            const actions = container.element().querySelector(
                ".g-table-control-actions",
            ) as HTMLElement | null;
            const customControl = container.element().querySelector(
                ".test-custom-control",
            ) as HTMLElement | null;

            await expect
                .element(container.getByRole("button", { name: "Custom Control" }))
                .toBeVisible();
            expect(actions).not.toBeNull();
            expect(customControl).not.toBeNull();
            expect(customControl?.closest(".g-table-custom-controls")).not.toBeNull();

            const childClasses = Array.from(actions!.children).map((child) =>
                child.className.toString(),
            );
            expect(childClasses).toEqual([
                "g-column-visibility-wrap",
                "g-table-custom-controls",
                "g-clear-filters-wrap",
            ]);
        });

        it("collapses clear filters to icon-only below 760px", async () => {
            const GTableFixture = defineComponent({
                setup() {
                    const filtering = useFiltering(defaultFilter);
                    const { filters } = filtering;

                    filters.collegeInName = "yes";

                    return () =>
                        h(
                            GTable<TableEntry, TableColumn<TableEntry>>,
                            {
                                label: "Test Table",
                                data: tableData,
                                columns,
                                filtering,
                                filter: filters,
                                startIndex: 0,
                            },
                            {},
                        );
                },
            });

            const { container } = mnt(wrapInWidth(GTableFixture, 750));

            const clearFiltersButton = container.getByRole("button", {
                name: "Clear Filters",
            });
            const clearFiltersText = container
                .element()
                .querySelector(".g-clear-filters-text") as HTMLElement | null;

            await expect.element(clearFiltersButton).toBeVisible();
            expect(clearFiltersText).not.toBeNull();
            expect(window.getComputedStyle(clearFiltersText!).display).toBe(
                "none",
            );
        });

        it("moves first, last, and page size controls into the overflow menu below 720px", async () => {
            const { GTableFixture, pageSize, start } = createCollegesTableFixture();
            const { container } = mnt(wrapInWidth(GTableFixture, 700));

            await expect
                .element(
                    container.getByRole("button", {
                        name: "More pagination options",
                    }),
                )
                .toBeVisible();
            await expect
                .element(container.getByRole("button", { name: "First Page" }))
                .not.toBeInTheDocument();

            await container
                .getByRole("button", {
                    name: "More pagination options",
                })
                .click();

            await expect
                .element(page.getByRole("heading", { name: "Pagination options" }))
                .toHaveFocus();

            const overflowPageSizeSelect = document.body.querySelector(
                "#modal-root .page-size-select",
            ) as HTMLSelectElement | null;

            expect(overflowPageSizeSelect).not.toBeNull();
            expect(
                window.getComputedStyle(overflowPageSizeSelect!).borderTopWidth,
            ).toBe("2px");
            expect(
                window.getComputedStyle(overflowPageSizeSelect!).borderTopLeftRadius,
            ).not.toBe("0px");

            await page.getByRole("button", { name: "Last Page" }).click();
            await expect.element(container.getByText("7 to 8")).toBeVisible();

            await expect.element(container.getByRole("button", { name: "More pagination options" })).toBeVisible();
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

    describe("Searchable Multi-Select Filter", () => {
        interface AbbrEntry {
            key: string;
            name: string;
            abbr: string;
        }

        const abbrData: AbbrEntry[] = [
            { key: "LT", name: "Carle Illinois College of Medicine", abbr: "COM" },
            { key: "KL", name: "College of Agricultural, Consumer and Environmental Sciences (ACES)", abbr: "ACES" },
            { key: "KY", name: "College of Applied Health Sciences", abbr: "AHS" },
            { key: "KN", name: "College of Education", abbr: "EDUC" },
            { key: "LL", name: "School of Social Work", abbr: "SOCW" },
        ];

        const searchableColumns: TableColumn<AbbrEntry>[] = [
            { key: "key", label: "Code" },
            { key: "name", label: "Name" },
            {
                key: "abbr",
                label: "Abbreviation",
                filter: {
                    type: "multi-select",
                    searchable: true,
                    options: [
                        { label: "COM", value: "COM" },
                        { label: "ACES", value: "ACES" },
                        { label: "AHS", value: "AHS" },
                        { label: "EDUC", value: "EDUC" },
                        { label: "SOCW", value: "SOCW" },
                    ],
                    placeholder: "Search abbreviations…",
                },
            },
        ];

        function filterAbbrData(data: AbbrEntry[], filter: Record<string, any>) {
            let filtered = [...data];
            if (filter.abbr && filter.abbr.length > 0) {
                filtered = filtered.filter((item) =>
                    filter.abbr.includes(item.abbr),
                );
            }
            return filtered;
        }

        function createSearchableFixture() {
            return createGTableFixture<AbbrEntry>({
                label: "Abbreviations",
                columns: searchableColumns,
                data: abbrData,
                initialFilter: { key: undefined, name: undefined, abbr: [] },
                filterData: filterAbbrData,
                paginate: false,
            });
        }

        it("renders a GMultiSelect combobox for searchable multi-select filter", async () => {
            const { GTableFixture } = createSearchableFixture();
            const { container } = mnt(GTableFixture);

            const filterButton = container.getByRole("button", {
                name: "Filter Column",
            });
            await filterButton.click();

            await expect
                .element(page.getByRole("combobox"))
                .toBeInTheDocument();
        });

        it("does not render checkboxes for a searchable multi-select filter", async () => {
            const { GTableFixture } = createSearchableFixture();
            const { container } = mnt(GTableFixture);

            const filterButton = container.getByRole("button", {
                name: "Filter Column",
            });
            await filterButton.click();

            await expect
                .element(page.getByRole("checkbox"))
                .not.toBeInTheDocument();
        });

        it("filters rows when values are selected in the searchable multi-select", async () => {
            const { GTableFixture } = createSearchableFixture();
            const { container } = mnt(GTableFixture);

            const filterButton = container.getByRole("button", {
                name: "Filter Column",
            });
            await filterButton.click();

            await page.getByRole("combobox").click();

            const comOption = page.getByRole("option", { name: "COM" });
            await comOption.click();

            expect(getColumn(container, 0)).toEqual(["LT"]);
        });

        it("filters rows by multiple values in the searchable multi-select", async () => {
            const { GTableFixture } = createSearchableFixture();
            const { container } = mnt(GTableFixture);

            const filterButton = container.getByRole("button", {
                name: "Filter Column",
            });
            await filterButton.click();

            await page.getByRole("combobox").click();

            await page.getByRole("option", { name: "COM" }).click();
            await page.getByRole("option", { name: "AHS" }).click();

            expect(getColumn(container, 0)).toEqual(["LT", "KY"]);
        });
    });

    describe("Multi-Select Filter", () => {
        interface AbbrEntry {
            key: string;
            name: string;
            abbr: string;
        }

        const abbrData: AbbrEntry[] = [
            {
                key: "LT",
                name: "Carle Illinois College of Medicine",
                abbr: "COM",
            },
            {
                key: "KL",
                name: "College of Agricultural, Consumer and Environmental Sciences (ACES)",
                abbr: "ACES",
            },
            { key: "LL", name: "School of Social Work", abbr: "SOCW" },
        ];

        const multiSelectColumns: TableColumn<AbbrEntry>[] = [
            { key: "key", label: "Code" },
            { key: "name", label: "Name" },
            {
                key: "abbr",
                label: "Abbreviation",
                filter: {
                    type: "multi-select",
                    options: [
                        { label: "COM", value: "COM" },
                        { label: "ACES", value: "ACES" },
                        { label: "SOCW", value: "SOCW" },
                    ],
                },
            },
        ];

        function filterAbbrData(data: AbbrEntry[], filter: Record<string, any>) {
            return filter.abbr?.length
                ? data.filter((item) => filter.abbr.includes(item.abbr))
                : data;
        }

        it("stores checkbox selections as option values", async () => {
            const { GTableFixture, filters } = createGTableFixture<AbbrEntry>({
                label: "Abbreviations",
                columns: multiSelectColumns,
                data: abbrData,
                initialFilter: { abbr: undefined },
                filterData: filterAbbrData,
                paginate: false,
            });
            const { container } = mnt(GTableFixture);

            await container
                .getByRole("button", { name: "Filter Column" })
                .click();
            await page.getByRole("checkbox", { name: "COM" }).click();
            await page.getByRole("checkbox", { name: "ACES" }).click();

            await expect
                .element(page.getByRole("checkbox", { name: "COM" }))
                .toBeChecked();
            await expect
                .element(page.getByRole("checkbox", { name: "ACES" }))
                .toBeChecked();
            expect(filters.abbr).toEqual(["COM", "ACES"]);
            expect(getColumn(container, 2)).toEqual(["COM", "ACES"]);

            await page.getByRole("checkbox", { name: "COM" }).click();
            await page.getByRole("checkbox", { name: "ACES" }).click();

            expect(filters.abbr).toEqual([]);

            await page.getByRole("checkbox", { name: "SOCW" }).click();

            expect(filters.abbr).toEqual(["SOCW"]);
            expect(getColumn(container, 2)).toEqual(["SOCW"]);

            await container
                .getByRole("button", { name: "Clear Filters" })
                .click();
            await container
                .getByRole("button", { name: "Filter Column" })
                .click();
            await page.getByRole("checkbox", { name: "SOCW" }).click();

            expect(filters.abbr).toEqual(["SOCW"]);
            expect(getColumn(container, 2)).toEqual(["SOCW"]);
        });
    });
});
