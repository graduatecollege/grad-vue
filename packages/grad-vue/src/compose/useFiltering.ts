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

export interface QueryFilteringOptions<
    F extends Record<string, any> = Record<string, any>,
> {
    route: {
        query: FilterRouteQuery;
    };
    router: {
        replace: (location: { query: FilterLocationQuery }) => unknown;
    };
    booleanArrayKeys?: readonly Extract<keyof F, string>[];
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
 */
export interface UseFilteringReturn<
    T extends Record<string, any> = Record<string, any>,
    F extends { [K in keyof T]?: any } = Record<keyof T, any>,
> {
    filters: Reactive<F>;
    isFiltered: Ref<boolean>;
    clearFilters: () => void;
    filteredColumns: Ref<Partial<Record<keyof T, boolean>>>;
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
 */
export function useQueryFiltering<
    T extends Record<string, any>,
    F extends { [K in keyof T]?: any } = Record<keyof T, any>,
>(filters: F, options: QueryFilteringOptions<F>): UseFilteringReturn<T, F> {
    const filterKeys = Object.keys(filters) as Array<Extract<keyof F, string>>;
    const arrayFilterKeys = new Set(
        filterKeys.filter((key) => Array.isArray(filters[key])),
    );
    const booleanArrayKeys = new Set(options.booleanArrayKeys ?? []);

    const parseFilterValue = (
        key: Extract<keyof F, string>,
        value: FilterRouteQuery[string] | undefined,
    ) => {
        if (value === null || value === undefined) {
            return undefined;
        }

        if (arrayFilterKeys.has(key)) {
            return parseQueryArrayValue(value);
        }

        if (typeof value === "string" && value.includes(",")) {
            return value.split(",");
        }

        return cloneQueryValue(value);
    };

    const getFilterQuery = (query: FilterRouteQuery) => {
        const nextQuery: Partial<FilterRouteQuery> = {};

        for (const key of filterKeys) {
            const value = query[key];

            if (value !== undefined) {
                nextQuery[key] = parseFilterValue(key, value) as
                    | FilterRouteQueryValue
                    | FilterRouteQueryValue[]
                    | undefined;
            }
        }

        return nextQuery;
    };

    const syncWith = ref(getFilterQuery(options.route.query));
    const filtering = useFiltering<T, F>(filters, { syncWith });
    const filteringState = filtering.filters as Record<string, unknown>;

    const parseFilterStateValue = (
        key: Extract<keyof F, string>,
        value: FilterRouteQuery[string] | undefined,
    ) => {
        const parsedValue = parseFilterValue(key, value);

        if (!booleanArrayKeys.has(key) || parsedValue === undefined) {
            return parsedValue;
        }

        const values = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
        return values
            .map((item) => {
                if (item === "true") {
                    return true;
                }
                if (item === "false") {
                    return false;
                }
                return undefined;
            })
            .filter((item): item is boolean => item !== undefined);
    };

    watch(
        () => getFilterQuery(options.route.query),
        (query) => {
            for (const key of filterKeys) {
                const nextValue = parseFilterStateValue(key, query[key]);

                if (!areFilterValuesEqual(filteringState[key], nextValue)) {
                    filteringState[key] = nextValue;
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
 * @param filters An object that defines the filters applicable to the data record.
 * @param options Configuration options for filtering, such as synchronization.
 * @return Returns an object that can be used with GTable.
 */
export function useFiltering<
    T extends Record<string, any> = Record<string, any>,
    F extends { [K in keyof T]?: any } = Record<keyof T, any>,
>(filters: F, options: FilteringOptions = {}): UseFilteringReturn<T, F> {
    const values = reactive<T>(
        Object.fromEntries(
            Object.entries(filters).map(([key, val]) => [key, val]),
        ) as any,
    );
    const syncWith = options.syncWith;

    if (syncWith) {
        if (syncWith.value) {
            const queryParams = toValue(syncWith);
            Object.keys(filters).forEach((key) => {
                if (queryParams[key] !== undefined) {
                    // Handle arrays as a comma-separated string
                    const val = queryParams[key];
                    if (typeof val === "string") {
                        if (val.includes(",")) {
                            values[key] = val.split(",");
                        } else {
                            values[key] = val;
                        }
                    }
                }
            });
        }

        watch(
            values,
            (newValues) => {
                syncWith.value = filtersToQueryParams(newValues);
            },
            { deep: true },
        );
    }

    const isFiltered = computed(() => {
        for (const key of Object.keys(filters)) {
            if (!!emptyAsUndefined(values[key])) {
                return true;
            }
        }
        return false;
    });

    const clearFilters = () => {
        Object.keys(values).forEach((key) => {
            values[key] = undefined;
        });
    };

    const filteredColumns = computed(() => {
        const result: Record<string, boolean> = {};
        for (const key of Object.keys(filters)) {
            result[key] = !!emptyAsUndefined(values[key]);
        }
        return result as Record<keyof T, boolean>;
    });

    return {
        filters: values as any,
        isFiltered,
        clearFilters,
        filteredColumns,
    };
}
