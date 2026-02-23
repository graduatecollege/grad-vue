import {
    computed,
    Reactive,
    reactive,
    ref,
    type Ref,
    toRaw,
    toValue,
    unref,
    watch,
} from "vue";

export type FilterLocationQueryValueRaw = string | number;

/**
 * Query representation for filtering, compatible with vue-router
 */
export type FilterLocationQuery = {
    [p: string]:
        | string
        | null
        | number
        | undefined
        | FilterLocationQueryValueRaw[];
};

export interface FilteringOptions {
    syncWith?: Ref<{
        [p: string]: string | null | (string | null)[] | undefined;
    }>;
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
        Object.entries(value).filter(([k, v]) => {
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
