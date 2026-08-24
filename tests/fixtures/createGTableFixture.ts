import { computed, defineComponent, h, ref, shallowRef, VNode } from "vue";
import {
    GTable,
    TableColumn,
    TableColumnState,
    TableSort,
    useFiltering,
    UseTableChangesReturn,
    BulkAction,
    TableRow,
} from "../../packages/grad-vue/src/grad-vue";

export type CreateGTableFixtureOptions<
    T extends TableRow,
    C extends TableColumn<T>,
> = {
    label?: string;
    columns: C[] | (() => C[]);
    data: T[];

    /**
     * Shape for the required `v-model:filter`. Keys here are also used by
     * `useFiltering()` to compute `filteredColumns`.
     */
    initialFilter?: FixtureFilters<T>;
    filterKeys?: Array<Extract<keyof T, string>>;
    filterData?: (data: T[], filter: FixtureFilters<T>) => T[];

    initialSorts?: TableSort<T>[];
    sortData?: (data: T[], sorts: TableSort<T>[]) => T[];

    paginate?: boolean;
    initialStart?: number;
    initialPageSize?: number;
    pageSizes?: number[];
    initialColumnState?: TableColumnState<T>;
    resizableColumns?: boolean;

    resultCount?: (filteredData: T[]) => number;
    groupBy?: keyof T;
    groupRender?: (groupValue: any, row: T) => VNode;
    rowClickable?: boolean;
    rowClass?: (row: T) => string | string[] | undefined;
    bulkSelectionEnabled?: boolean;
    bulkActions?: BulkAction[];
    changeTracker?: UseTableChangesReturn<T>;
};

type FilterKey<T extends TableRow> = Extract<keyof T, string>;
type FixtureFilters<T extends TableRow> = Partial<Record<keyof T, any>>;

function defaultSortData<T extends TableRow>(
    data: T[],
    sorts: TableSort<T>[] = [],
): T[] {
    if (!sorts.length) {
        return data;
    }

    return [...data].sort((a, b) => {
        for (const sort of sorts) {
            const sortVal = String(a[sort.key] ?? "").localeCompare(
                String(b[sort.key] ?? ""),
            );

            if (sortVal !== 0) {
                return sortVal * sort.order;
            }
        }

        return 0;
    });
}

function buildInitialFilter<T extends TableRow>(options: {
    initialFilter?: FixtureFilters<T>;
    filterKeys?: FilterKey<T>[];
}): FixtureFilters<T> {
    const fromKeys = Object.fromEntries(
        (options.filterKeys || []).map((key) => [key, undefined]),
    ) as FixtureFilters<T>;
    return {
        ...fromKeys,
        ...(options.initialFilter || {}),
    };
}

function assignRecordValues<K extends string, V>(
    target: Partial<Record<K, V>>,
    source: Partial<Record<K, V>>,
) {
    for (const key of Object.keys(source) as K[]) {
        target[key] = source[key] as V;
    }
}

export function createGTableFixture<
    T extends TableRow,
    C extends TableColumn<T> = TableColumn<T>,
>(options: CreateGTableFixtureOptions<T, C>) {
    const initialSorts = options.initialSorts ?? [];
    const sorts = shallowRef<TableSort<T>[]>([...initialSorts]);
    const start = ref(options.initialStart ?? 0);
    const pageSize = ref(options.initialPageSize ?? 5);
    const columnState = ref<TableColumnState<T>>(options.initialColumnState || {});
    const selectedRows = ref<string[]>([]);
    const initialFilter = buildInitialFilter<T>({
        initialFilter: options.initialFilter,
        filterKeys: options.filterKeys,
    });

    const filtering = useFiltering<T, FixtureFilters<T>>(initialFilter);
    const filters = filtering.filters as FixtureFilters<T>;
    assignRecordValues(filters, initialFilter);

    const GTableFixture = defineComponent({
        name: "GTableFixture",
        setup() {
            const columnsComputed = computed(() => {
                return (
                    typeof options.columns === "function"
                        ? options.columns()
                        : options.columns
                ) as C[];
            });

            const tableData = ref<T[]>([...options.data]);

            const filteredData = computed(() => {
                const data = [...tableData.value] as T[];
                return options.filterData
                    ? options.filterData(data, filters)
                    : data;
            });

            const visibleData = computed(() => {
                const sort = options.sortData || defaultSortData;
                let data = sort([...filteredData.value], sorts.value);

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
                    GTable<T, C>,
                    {
                        label: options.label || "Table",
                        data: visibleData.value,
                        columns: columnsComputed.value,
                        filtering,
                        filter: filters,
                        "onUpdate:filter": (value: FixtureFilters<T>) => {
                            assignRecordValues(filters, value);
                        },
                        resultCount: resultCount.value,
                        pageSize:
                            options.paginate === false ? undefined : pageSize.value,
                        pageSizes:
                            options.paginate === false
                                ? undefined
                                : options.pageSizes || [5, 10, 50],
                        pagination: options.paginate !== false,
                        sorts: sorts.value,
                        "onUpdate:sorts": (value: TableSort<T>[]) => {
                            sorts.value = value;
                        },
                        ...((options.initialColumnState !== undefined ||
                            options.resizableColumns)
                            ? {
                                  columnState: columnState.value,
                                  "onUpdate:columnState": (
                                      value: TableColumnState<T>,
                                  ) => {
                                      columnState.value = value;
                                  },
                              }
                            : {}),
                        resizableColumns: options.resizableColumns,
                        groupBy: options.groupBy,
                        groupRender: options.groupRender,
                        rowClickable: options.rowClickable,
                        rowClass: options.rowClass,
                        startIndex: start.value,
                        "onUpdate:startIndex": (value: number) => {
                            start.value = value;
                        },
                        bulkSelectionEnabled: options.bulkSelectionEnabled,
                        bulkActions: options.bulkActions,
                        selectedRows: selectedRows.value,
                        "onUpdate:selectedRows": (value: string[]) => {
                            selectedRows.value = value;
                        },
                        changeTracker: options.changeTracker,
                        "onUpdate:pageSize": (value: number) => {
                            pageSize.value = value;
                        },
                    },
                    {},
                );
        },
    });

    return {
        GTableFixture,
        sorts,
        start,
        pageSize,
        columnState,
        filters,
        selectedRows,
    };
}
