import {
    computed,
    Reactive,
    reactive,
    ref,
    type Ref,
    toRaw,
    toValue,
    watch,
} from "vue";
import type {
    AnyFilterRecord,
    ColumnKey,
    FilterApiValue,
    FilterKey,
    TableColumn,
    TableRow,
} from "../components/table/TableColumn.ts";
import {
    columnFilterKey,
    filterRequestValue,
    type FilterInputValue,
} from "../components/table/columnFilters.ts";

export type { FilterInputValue } from "../components/table/columnFilters.ts";

/**
 * Raw UI filter state keyed by filter/request keys of `F`.
 *
 * Values are kept as entered (or as read from the URL) and are only
 * converted to request values by `buildFilterRequest()`.
 */
export type FilterState<F> = { [K in keyof F]?: FilterInputValue };

/**
 * A request object built from filter state. Each value has the type of the
 * corresponding field in `F`.
 */
export type FilterRequest<F> = { [K in keyof F]?: FilterApiValue<F, K> };

export type FilterLocationQueryValueRaw = string | number;
export type FilterRouteQueryValue = string | null;
export type FilterRouteQuery = {
    [p: string]:
        | FilterRouteQueryValue
        | undefined
        | FilterRouteQueryValue[];
};

/**
 * Query representation for filtering, compatible with vue-router
 */
export type FilterLocationQuery = {
    [p: string]:
        | string
        | null
        | number
        | undefined
        | (FilterLocationQueryValueRaw | null)[];
};

export interface FilteringOptions {
    syncWith?: Ref<FilterRouteQuery>;
}

export interface FilterStateFromQueryOptions<F = AnyFilterRecord> {
    /**
     * Array filters whose `"true"`/`"false"` query values should be
     * converted to booleans. Not needed for column filters with boolean
     * option values, since `buildFilterRequest()` matches those itself.
     */
    booleanArrayKeys?: readonly FilterKey<F>[];
}

export interface QueryFilteringOptions<F = AnyFilterRecord>
    extends FilterStateFromQueryOptions<F> {
    route: {
        query: FilterRouteQuery;
    };
    router: {
        replace: (location: { query: FilterLocationQuery }) => unknown;
    };
}

/**
 * Represents a type that defines a set of filters for a given record type.
 * The keys are based on the record, and the values are possible values
 * for a filter.
 */
export type FiltersForRecord<
    T extends object,
    F extends { [K in keyof T]?: any },
> = {
    [K in keyof T]?: T[K] extends string | number | boolean | undefined | null
        ? T[K] | string | string[]
        : T[K] extends string[] | number[]
          ? T[K][]
          : never;
};

/**
 * Represents the return type of a composition function used for handling
 * filtering logic in a data structure.
 *
 * `T` is the row type and `F` is the independent filter/request type. Filter
 * state and `filteredColumns` are keyed by filter keys of `F`.
 */
export interface UseFilteringReturn<
    T extends object = AnyFilterRecord,
    F = Partial<Record<keyof T, any>>,
> {
    filters: Reactive<FilterState<F>>;
    isFiltered: Ref<boolean>;
    clearFilters: () => void;
    filteredColumns: Ref<Partial<Record<FilterKey<F>, boolean>>>;
}

/**
 * Returns the value if it's not empty, or undefined if it's empty.
 */
export function emptyAsUndefined<
    T extends
        | string
        | number
        | boolean
        | string[]
        | number[]
        | undefined
        | null,
>(value: T) {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return undefined;
        }
    }
    if (value === null || value === false || value === "") {
        return undefined;
    }
    return value;
}

export function filterOmitEmpty<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(value).filter(([, v]) => {
            return  v && (!Array.isArray(v) || v.length > 0);
        }),
    ) as Partial<T>;
}

/**
 * Return a value as an array if it's not already one, or
 * undefined if it's undefined.
 */
export function asArray<T>(value: T | T[]): NonNullable<T>[] | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (Array.isArray(value)) {
        // Exclude null and undefined from array
        return value.filter(
            (v) => v !== null && v !== undefined,
        ) as NonNullable<T>[];
    }
    return [value];
}

/**
 * Normalizes a route query value into a string array.
 *
 * Accepts either repeated query params (`?tag=a&tag=b`) or comma-separated
 * values (`?tag=a,b`) and removes null entries from array values.
 */
export function parseQueryArrayValue(
    value:
        | FilterRouteQueryValue
        | FilterRouteQueryValue[]
        | readonly FilterRouteQueryValue[]
        | undefined,
): string[] | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }

    if (typeof value === "string") {
        return value.includes(",") ? value.split(",") : [value];
    }

    const values: string[] = [];
    for (const item of value) {
        if (item !== null) {
            values.push(item);
        }
    }
    return values.length > 0 ? values : undefined;
}

function cloneQueryValue<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as T;
    }
    return value;
}

function areFilterValuesEqual(left: unknown, right: unknown): boolean {
    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right)) {
            return false;
        }

        return (
            left.length === right.length &&
            left.every((value, index) => value === right[index])
        );
    }

    return left === right;
}

function areFilterRecordsEqual(
    left: Record<string, unknown>,
    right: Record<string, unknown>,
): boolean {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

    for (const key of keys) {
        if (!areFilterValuesEqual(left[key], right[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Serializes a raw filter value for a route query. Unlike
 * `filtersToQueryParams`, `0` and `false` are kept.
 */
function serializeFilterValue(
    value: FilterInputValue,
): string | string[] | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    if (Array.isArray(value)) {
        const items = value
            .filter((item) => item !== null && item !== undefined && item !== "")
            .map((item) => String(item));
        return items.length > 0 ? items : undefined;
    }
    return String(value);
}

function hasFilterValue(value: FilterInputValue): boolean {
    return serializeFilterValue(value) !== undefined;
}

function filterStateToQuery<F>(
    filters: FilterState<F>,
): Record<string, string | string[]> {
    const query: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(toRaw(filters))) {
        const serialized = serializeFilterValue(value as FilterInputValue);
        if (serialized !== undefined) {
            query[key] = serialized;
        }
    }
    return query;
}

/**
 * Builds a typed request object from column filter configuration and raw
 * filter state.
 *
 * Each filtered column reads `filters[filter.key ?? column.key]` and applies
 * its explicit transformation (`match` for search filters, or `transform`).
 * Only keys produced by column filters are included.
 *
 * @example
 * ```ts
 * type Query = NonNullable<GetStudentsData["query"]>;
 * const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, Query>[] = [
 *     { key: "major", label: "Major", filter: { type: "search", key: "major__like", match: "contains" } },
 * ];
 * const query: FilterRequest<Query> = buildFilterRequest(columns, filters);
 * ```
 */
export function buildFilterRequest<T extends TableRow, F>(
    columns: readonly TableColumn<T, ColumnKey<T>, F>[],
    filters: FilterState<F>,
): FilterRequest<F> {
    const request: FilterRequest<F> = {};
    const state = filters as Partial<Record<string, FilterInputValue>>;
    const output = request as Partial<Record<string, unknown>>;

    for (const column of columns) {
        if (!column.filter) {
            continue;
        }
        const key = columnFilterKey(column);
        const value = filterRequestValue(column.filter, state[key]);
        if (value !== undefined) {
            output[key] = value;
        }
    }

    return request;
}

/**
 * Builds the default filter state for `useFiltering()` / `useQueryFiltering()`
 * from column filter configuration, so filters don't have to be listed twice.
 *
 * Each filtered column adds its filter key (`filter.key ?? column.key`).
 * Multi-select filters default to `[]`, so their query params are always read
 * as arrays; all other filters default to `undefined`.
 *
 * @example
 * ```ts
 * const filtering = useQueryFiltering<StudentRow, Query>(filterDefaults(columns), { route, router });
 * ```
 */
export function filterDefaults<T extends TableRow, F>(
    columns: readonly TableColumn<T, ColumnKey<T>, F>[],
): FilterState<F> {
    const defaults: Partial<Record<string, FilterInputValue>> = {};

    for (const column of columns) {
        if (column.filter) {
            defaults[columnFilterKey(column)] =
                column.filter.type === "multi-select" ? [] : undefined;
        }
    }

    return defaults as FilterState<F>;
}

/**
 * Reads filter state from route query params, the same way
 * `useQueryFiltering()` does, without creating reactive state or writing to
 * the URL.
 *
 * Use this when another view needs the filters of a query-synced table, for
 * example a detail page that loads the same list. Keys come from `defaults`;
 * filters with array defaults are always read as arrays.
 *
 * @example
 * ```ts
 * const request = computed(() =>
 *     buildFilterRequest(columns, filterStateFromQuery(filterDefaults(columns), route.query)),
 * );
 * ```
 */
export function filterStateFromQuery<F>(
    defaults: FilterState<F>,
    query: FilterRouteQuery,
    options: FilterStateFromQueryOptions<F> = {},
): FilterState<F> {
    const defaultValues = defaults as Partial<Record<string, FilterInputValue>>;
    const booleanArrayKeys = new Set<string>(options.booleanArrayKeys ?? []);
    const state: Partial<Record<string, FilterInputValue>> = {};

    for (const key of Object.keys(defaultValues)) {
        const value = parseFilterQueryValue(
            query[key],
            Array.isArray(defaultValues[key]),
        );
        state[key] =
            booleanArrayKeys.has(key) && value !== undefined
                ? parseBooleanArray(value)
                : value;
    }

    return state as FilterState<F>;
}

function parseFilterQueryValue(
    value: FilterRouteQuery[string],
    isArrayFilter: boolean,
): string | string[] | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }

    if (!isArrayFilter && typeof value === "string") {
        return value.includes(",") ? value.split(",") : value;
    }

    return parseQueryArrayValue(value);
}

function parseBooleanArray(value: string | string[]): boolean[] {
    return (Array.isArray(value) ? value : [value]).flatMap((item) => {
        if (item === "true") {
            return [true];
        }
        if (item === "false") {
            return [false];
        }
        return [];
    });
}

/**
 * Converts filter criteria into a format suitable for use as a query object
 * in vue-router.
 */
export function filterAsQuery<
    T extends Record<string, any>,
    F extends { [K in keyof T]?: any } = Record<keyof T, any>,
>(filters: FiltersForRecord<T, F>): FilterLocationQuery {
    let query: FilterLocationQuery = {};
    for (let [key, value] of Object.entries(toRaw(filters))) {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                query[key] = value;
            }
        } else if (value === true) {
            query[key] = "true";
        } else {
            query[key] = value || undefined;
        }
    }
    return query;
}

/**
 * Converts an object of filters into a query parameters object for API calls.
 *
 * Transforms the values into strings or arrays of strings. Excludes fields with undefined,
 * null, empty string, or false values. Supports single values and arrays.
 */
export function filtersToQueryParams<T extends Record<string, any>>(
    filters: T,
): Record<keyof T, string | string[]> {
    const query: Record<string, string | string[]> = {};
    Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== false
        ) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    query[key] = value.map((v) => String(v));
                }
            } else {
                query[key] = String(value);
            }
        }
    });
    return query as Record<keyof T, string | string[]>;
}

/**
 * Provides a router-agnostic wrapper for syncing filter state with route query params.
 *
 * Pass in `route` and `router` objects from your app so grad-vue does not need
 * a direct dependency on vue-router. Filters whose defaults are arrays are
 * read from and written to query params as arrays, and `booleanArrayKeys` can
 * be used for multi-value filters that should be converted to boolean values
 * inside the filter state.
 *
 * Use `filterDefaults(columns)` to build `filters` from column configuration,
 * and `filterStateFromQuery()` to read the same state elsewhere without syncing.
 */
export function useQueryFiltering<
    T extends object = AnyFilterRecord,
    F = Partial<Record<keyof T, any>>,
>(
    filters: FilterState<F>,
    options: QueryFilteringOptions<F>,
): UseFilteringReturn<T, F> {
    const defaults = filters as Partial<Record<string, FilterInputValue>>;
    const filterKeys = Object.keys(filters) as Array<FilterKey<F>>;

    const getFilterQuery = (query: FilterRouteQuery) => {
        const nextQuery: Partial<FilterRouteQuery> = {};

        for (const key of filterKeys) {
            const value = query[key];

            if (value !== undefined) {
                nextQuery[key] = parseFilterQueryValue(
                    value,
                    Array.isArray(defaults[key]),
                );
            }
        }

        return nextQuery;
    };

    const syncWith = ref(getFilterQuery(options.route.query));
    const filtering = useFiltering<T, F>(filters, { syncWith });
    const filteringState = filtering.filters as Partial<
        Record<string, FilterInputValue>
    >;

    watch(
        () => filterStateFromQuery(filters, options.route.query, options),
        (state) => {
            const nextState = state as Partial<Record<string, FilterInputValue>>;

            for (const key of filterKeys) {
                if (!areFilterValuesEqual(filteringState[key], nextState[key])) {
                    filteringState[key] = nextState[key];
                }
            }
        },
        { immediate: true },
    );

    watch(syncWith, (query) => {
        const queryReplacement: FilterLocationQuery = { ...options.route.query };

        for (const key of filterKeys) {
            if (query[key] === undefined) {
                delete queryReplacement[key];
            } else {
                queryReplacement[key] = cloneQueryValue(query[key]);
            }
        }

        if (
            !areFilterRecordsEqual(
                options.route.query as Record<string, unknown>,
                queryReplacement as Record<string, unknown>,
            )
        ) {
            options.router.replace({ query: queryReplacement });
        }
    });

    return filtering;
}

/**
 * Provides a mechanism to manage and synchronize filterable data with given filters and options.
 *
 * Filter state is keyed by filter/request keys (`filter.key ?? column.key`)
 * and holds raw UI values. Use `buildFilterRequest()` to convert it into
 * typed request values.
 *
 * @param filters An object that defines the filters applicable to the data record.
 * @param options Configuration options for filtering, such as synchronization.
 * @return Returns an object that can be used with GTable.
 */
export function useFiltering<
    T extends object = AnyFilterRecord,
    F = Partial<Record<keyof T, any>>,
>(
    filters: FilterState<F>,
    options: FilteringOptions = {},
): UseFilteringReturn<T, F> {
    const filterKeys = Object.keys(filters);
    const values = reactive<Record<string, FilterInputValue>>({
        ...(filters as Record<string, FilterInputValue>),
    });
    const syncWith = options.syncWith;

    if (syncWith) {
        if (syncWith.value) {
            const queryParams = toValue(syncWith);
            filterKeys.forEach((key) => {
                const val = queryParams[key];
                if (typeof val === "string") {
                    // Handle arrays as a comma-separated string
                    values[key] = val.includes(",") ? val.split(",") : val;
                } else if (Array.isArray(val)) {
                    values[key] = val.filter(
                        (item): item is string => item !== null,
                    );
                }
            });
        }

        watch(
            values,
            (newValues) => {
                syncWith.value = filterStateToQuery(newValues);
            },
            { deep: true },
        );
    }

    const isFiltered = computed(() =>
        filterKeys.some((key) => hasFilterValue(values[key])),
    );

    const clearFilters = () => {
        Object.keys(values).forEach((key) => {
            values[key] = undefined;
        });
    };

    const filteredColumns = computed(() => {
        const result: Partial<Record<string, boolean>> = {};
        for (const key of filterKeys) {
            result[key] = hasFilterValue(values[key]);
        }
        return result as Partial<Record<FilterKey<F>, boolean>>;
    });

    return {
        filters: values as Reactive<FilterState<F>>,
        isFiltered,
        clearFilters,
        filteredColumns,
    };
}
