import { computed, ref, type Ref, toValue, watch } from "vue";

export interface UseFilteringReturn<T extends Record<string, any> = Record<string, any>> {
    filters: Ref<T>;
    isFiltered: Ref<boolean>;
    clearFilters: () => void;
    filteredColumns: Ref<Record<string, boolean>>;
}

export function filtersToQueryParams<T extends Record<string, any>>(filters: T): Record<string, string | string[]> {
    const query: Record<string, string | string[]> = {};
    Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== "" && value !== false) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    query[key] = value.map((v) => String(v));
                }
            } else {
                query[key] = String(value);
            }
        }
    });
    return query;
}

export function useFiltering<T extends Record<string, any>>(
    filters: T
): UseFilteringReturn<T> {

    const values = ref<T>({} as T);

    const isFiltered = computed(() => {
        console.log("isFiltered")
        return Object.values(values.value).some(
            (filter) => (filter !== undefined && filter !== null) && (!Array.isArray(filter) || filter.length > 0),
        );
    });

    const clearFilters = () => {
        Object.keys(values.value).forEach((key) => {
            values.value[key] = undefined;
        });
    };

    const filteredColumns = computed(() => {
        console.log("filteredColumns")
        const result: Record<string, boolean> = {};
        for (const key of Object.keys(filters)) {
            const filterValue = values.value[key];
            result[key] = filterValue !== undefined && filterValue !== null && (!Array.isArray(filterValue) || filterValue.length > 0);
        }
        return result;
    });

    return {
        filters: values as Ref<T>,
        isFiltered,
        clearFilters,
        filteredColumns,
    };
}
