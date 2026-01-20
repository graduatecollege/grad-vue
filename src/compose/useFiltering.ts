import { computed, ref, type Ref, toValue, unref, watch } from "vue";

export interface FilteringOptions {
    syncWith?: Ref<{ [p: string]: string | null | (string | null)[]  | undefined}>;
}

export interface UseFilteringReturn<
    T extends Record<string, any> = Record<string, any>,
> {
    filters: Ref<Partial<T>>;
    isFiltered: Ref<boolean>;
    clearFilters: () => void;
    filteredColumns: Ref<Partial<Record<keyof T, boolean>>>;
}

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

export function useFiltering<T extends Record<string, any>>(
    filters: T,
    options: FilteringOptions = {},
): UseFilteringReturn<T> {
    const values = ref<T>({} as T);
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
                            values.value[key] = val.split(
                                ",",
                            );
                        } else {
                            values.value[key] = val;
                        }
                    }
                }
            });
        }

        watch(
            () => values.value,
            (newValues) => {
                syncWith.value = filtersToQueryParams(newValues);
            },
            { deep: true },
        );
    }

    const isFiltered = computed(() => {
        return Object.values(values.value).some(
            (filter) =>
                filter !== undefined &&
                filter !== null &&
                (!Array.isArray(filter) || filter.length > 0),
        );
    });

    const clearFilters = () => {
        Object.keys(values.value).forEach((key) => {
            values.value[key] = undefined;
        });
    };

    const filteredColumns = computed(() => {
        const result: Record<string, boolean> = {};
        for (const key of Object.keys(filters)) {
            const filterValue = values.value[key];
            result[key] =
                filterValue !== undefined &&
                filterValue !== null &&
                (!Array.isArray(filterValue) || filterValue.length > 0);
        }
        return result as Record<keyof T, boolean>;
    });

    return {
        filters: values as Ref<T>,
        isFiltered,
        clearFilters,
        filteredColumns,
    };
}
