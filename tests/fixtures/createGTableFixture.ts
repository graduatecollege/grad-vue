import { computed, defineComponent, h, ref, VNode } from "vue";
import GTable from "../../src/components/GTable.vue";
import GTablePagination from "../../src/components/table/GTablePagination.vue";
import type { TableColumn } from "../../src/components/table/TableColumn";
import { useFiltering } from "../../src/compose/useFiltering";

export type CreateGTableFixtureOptions<T extends Record<string, any>> = {
    label?: string;
    columns: TableColumn<T>[] | (() => TableColumn<T>[]);
    data: T[];

    /**
     * Shape for the required `v-model:filter`. Keys here are also used by
     * `useFiltering()` to compute `filteredColumns`.
     */
    initialFilter?: Record<string, any>;
    filterKeys?: string[];
    filterData?: (data: T[], filter: Record<string, any>) => T[];

    initialSortField?: string;
    initialSortOrder?: 1 | -1;
    sortData?: (
        data: T[],
        sortField: string | undefined,
        sortOrder: 1 | -1 | undefined,
    ) => T[];

    paginate?: boolean;
    initialStart?: number;
    initialPageSize?: number;
    pageSizes?: number[];

    resultCount?: (filteredData: T[]) => number;
    groupBy?: string;
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
};

function defaultSortData<T extends Record<string, any>>(
    data: T[],
    sortField: string | undefined,
    sortOrder: 1 | -1 | undefined,
): T[] {
    if (!sortField) {
        return data;
    }

    const direction = sortOrder === -1 ? -1 : 1;
    return [...data].sort((a: any, b: any) => {
        const aVal: any = a[sortField];
        const bVal: any = b[sortField];
        const sortVal = (aVal?.toString() ?? "").localeCompare(
            bVal?.toString() ?? "",
        );
        return sortVal * direction;
    });
}

function buildInitialFilter(options: {
    initialFilter?: Record<string, any>;
    filterKeys?: string[];
}) {
    const fromKeys = Object.fromEntries(
        (options.filterKeys || []).map((key) => [key, undefined]),
    );
    return {
        ...fromKeys,
        ...(options.initialFilter || {}),
    };
}

export function createGTableFixture<T extends Record<string, any>>(
    options: CreateGTableFixtureOptions<T>,
) {
    const sortField = ref<string | undefined>(options.initialSortField);
    const sortOrder = ref<1 | -1 | undefined>(options.initialSortOrder);
    const start = ref(options.initialStart ?? 0);
    const pageSize = ref(options.initialPageSize ?? 5);
    const initialFilter = buildInitialFilter({
        initialFilter: options.initialFilter,
        filterKeys: options.filterKeys,
    });

    const filtering = useFiltering(initialFilter);
    const { filters } = filtering;
    filters.value = { ...initialFilter };

    const GTableFixture = defineComponent({
        name: "GTableFixture",
        setup() {
            const columnsComputed = computed<TableColumn<T>[]>(() => {
                return typeof options.columns === "function"
                    ? options.columns()
                    : options.columns;
            });

            const tableData = ref<T[]>([...options.data]);

            const filteredData = computed(() => {
                const data = [...tableData.value] as T[];
                return options.filterData
                    ? options.filterData(data, filters.value)
                    : data;
            });

            const visibleData = computed(() => {
                const sort = options.sortData || defaultSortData;
                let data = sort(
                    [...filteredData.value],
                    sortField.value,
                    sortOrder.value,
                );

                if (options.paginate === false) {
                    return data;
                }

                return data.slice(start.value, start.value + pageSize.value);
            });

            const resultCount = computed(() => {
                if (options.resultCount) {
                    return options.resultCount(filteredData.value);
                }
                return filteredData.value.length;
            });
            return () =>
                h(
                    GTable,
                    {
                        label: options.label || "Table",
                        data: visibleData.value,
                        // @ts-ignore It can't figure out the types match
                        columns: columnsComputed.value,
                        filtering,
                        filter: filters.value,
                        "onUpdate:filter": (value: any) => {
                            filters.value = value;
                        },
                        resultCount: resultCount.value,
                        sortField: sortField.value,
                        "onUpdate:sortField": (value: string | undefined) => {
                            sortField.value = value;
                        },
                        sortOrder: sortOrder.value,
                        "onUpdate:sortOrder": (value: 1 | -1 | undefined) => {
                            sortOrder.value = value;
                        },
                        groupBy: options.groupBy,
                        // @ts-ignore It can't figure out the types match
                        groupRender: options.groupRender,
                        rowClickable: options.rowClickable,
                        // @ts-ignore It can't figure out the types match
                        rowClass: options.rowClass,
                    },
                    {
                        pagination:
                            options.paginate === false
                                ? undefined
                                : () =>
                                      h(GTablePagination, {
                                          start: start.value,
                                          pageSize: pageSize.value,
                                          total: resultCount.value,
                                          pageSizes: options.pageSizes || [
                                              5, 10, 50,
                                          ],
                                          "onUpdate:start": (
                                              value: number | undefined,
                                          ) => {
                                              start.value = value || 0;
                                          },
                                          "onUpdate:pageSize": (
                                              value: number | undefined,
                                          ) => {
                                              pageSize.value = value || 5;
                                          },
                                      }),
                    },
                );
        },
    });

    return {
        GTableFixture,
        sortField,
        sortOrder,
        start,
        pageSize,
        filters,
    };
}
