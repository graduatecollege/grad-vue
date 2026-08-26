import { computed, ref, shallowRef, type Ref, watch } from "vue";
import type { TableSort } from "../components/table/TableColumn";
import type {
    FilterLocationQuery,
    FilterRouteQuery,
    FilterRouteQueryValue,
} from "./useFiltering";

type SortKey = string;
type SortableRow = { key: string } & Record<string, any>;

export type RawSortQuery =
    | FilterRouteQueryValue
    | FilterRouteQueryValue[]
    | readonly FilterRouteQueryValue[]
    | undefined;

export type PagingSort<K extends SortKey = SortKey> = TableSort<SortableRow, K>;

export interface UsePagingOptions {
    route?: {
        query: FilterRouteQuery;
    };
    router?: {
        replace: (location: { query: FilterLocationQuery }) => unknown;
    };
    sortsKey?: string;
    pageSizeKey?: string;
    pageOffsetKey?: string;
    defaultPageSize?: number;
    defaultPageOffset?: number;
}

export interface UsePagingReturn<K extends SortKey = SortKey> {
    sorts: Ref<PagingSort<K>[]>;
    pageSize: Ref<number>;
    pageOffset: Ref<number>;
}

/**
 * Removes duplicate or invalid sort entries while keeping the original order.
 */
export function normalizeSorts<K extends SortKey>(
    sorts: readonly PagingSort<K>[] | undefined,
): PagingSort<K>[] {
    const seen = new Set<string>();

    return (sorts ?? []).filter((sort): sort is PagingSort<K> => {
        if (!sort?.key || seen.has(sort.key) || (sort.order !== 1 && sort.order !== -1)) {
            return false;
        }

        seen.add(sort.key);
        return true;
    });
}

/**
 * Parses the route query representation of sorts into table sort objects.
 *
 * Supports either repeated query params (`["name", "-status"]`) or a single
 * comma-separated string (`"name,-status"`).
 */
export function parseSortQueryValue<K extends SortKey>(
    value: RawSortQuery,
): PagingSort<K>[] {
    if (value === null || value === undefined) {
        return [];
    }

    const values = typeof value === "string" ? value.split(",") : value;

    return normalizeSorts(
        values
            .filter((item): item is string => item !== null)
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => ({
                key: item.replace(/^-/, "") as K,
                order: item.startsWith("-") ? -1 : 1,
            })),
    );
}

/**
 * Serializes table sort objects into the query-param form used by the apps.
 */
export function serializeSortQueryValue<K extends SortKey>(
    sorts: readonly PagingSort<K>[] | undefined,
): string[] | undefined {
    const normalized = normalizeSorts(sorts);

    if (normalized.length === 0) {
        return undefined;
    }

    return normalized.map(
        ({ key, order }) => `${order === -1 ? "-" : ""}${key}`,
    );
}

/**
 * Builds the API `sortBy` string from the current sorts and optional tie-breakers.
 *
 * When the only explicit sort is descending, tie-breakers inherit that same
 * descending direction.
 */
export function buildSortBy<K extends SortKey>(
    sorts: readonly PagingSort<K>[] | undefined,
    tieBreakers: readonly string[] = [],
): string | undefined {
    const normalized = normalizeSorts(sorts);

    if (normalized.length === 0) {
        return undefined;
    }

    const serialized = normalized.map(
        ({ key, order }) => `${order === -1 ? "-" : ""}${key}`,
    );
    const existingKeys = new Set(normalized.map(({ key }) => String(key)));
    const tieBreakerOrder =
        normalized.length === 1 && normalized[0].order === -1 ? "-" : "";

    tieBreakers.forEach((key) => {
        if (!existingKeys.has(key)) {
            serialized.push(`${tieBreakerOrder}${key}`);
        }
    });

    return serialized.join(",");
}

function cloneQueryValue<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as T;
    }

    return value;
}

function areQueryValuesEqual(left: unknown, right: unknown): boolean {
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

function areSortArraysEqual<K extends SortKey>(
    left: readonly PagingSort<K>[],
    right: readonly PagingSort<K>[],
): boolean {
    return (
        left.length === right.length &&
        left.every((sort, index) => {
            const rightSort = right[index];
            return (
                sort.key === rightSort?.key &&
                sort.order === rightSort?.order
            );
        })
    );
}

function parseNumberQueryValue(
    value: FilterRouteQuery[string] | undefined,
    defaultValue: number,
): number {
    if (typeof value === "string") {
        return Number(value);
    }

    if (Array.isArray(value)) {
        const firstValue = value.find((item) => item !== null);
        return firstValue ? Number(firstValue) : defaultValue;
    }

    return defaultValue;
}

/**
 * Manages table sorts and pagination state, optionally syncing it with route query params.
 *
 * Pass `route` and `router` objects to share query-backed paging state across apps
 * without adding a direct vue-router dependency to grad-vue. If they are
 * omitted, the composable still works as local reactive state.
 */
export function usePaging<K extends SortKey = SortKey>(
    options: UsePagingOptions = {},
): UsePagingReturn<K> {
    const defaultPageSize = options.defaultPageSize ?? 50;
    const defaultPageOffset = options.defaultPageOffset ?? 0;
    const sortsKey = options.sortsKey ?? "sorts";
    const pageSizeKey = options.pageSizeKey ?? "pageSize";
    const pageOffsetKey = options.pageOffsetKey ?? "pageOffset";

    const sortsState = shallowRef<PagingSort<K>[]>([]);
    const pageSize = ref(defaultPageSize);
    const pageOffset = ref(defaultPageOffset);

    if (options.route && options.router) {
        watch(
            () => options.route?.query[sortsKey],
            (value) => {
                const nextSorts = parseSortQueryValue<K>(value);

                if (!areSortArraysEqual(sortsState.value, nextSorts)) {
                    sortsState.value = nextSorts;
                }
            },
            { immediate: true },
        );

        watch(
            () => options.route?.query[pageSizeKey],
            (value) => {
                const nextPageSize = parseNumberQueryValue(
                    value,
                    defaultPageSize,
                );

                if (pageSize.value !== nextPageSize) {
                    pageSize.value = nextPageSize;
                }
            },
            { immediate: true },
        );

        watch(
            () => options.route?.query[pageOffsetKey],
            (value) => {
                const nextPageOffset = parseNumberQueryValue(
                    value,
                    defaultPageOffset,
                );

                if (pageOffset.value !== nextPageOffset) {
                    pageOffset.value = nextPageOffset;
                }
            },
            { immediate: true },
        );

        watch(
            [sortsState, pageSize, pageOffset],
            ([nextSorts, nextPageSize, nextPageOffset]) => {
                const queryReplacement: FilterLocationQuery = {
                    ...options.route!.query,
                };
                const serializedSorts = serializeSortQueryValue(nextSorts);

                if (serializedSorts === undefined) {
                    delete queryReplacement[sortsKey];
                } else {
                    queryReplacement[sortsKey] = cloneQueryValue(serializedSorts);
                }

                if (
                    nextPageSize === defaultPageSize ||
                    nextPageSize === undefined
                ) {
                    delete queryReplacement[pageSizeKey];
                } else {
                    queryReplacement[pageSizeKey] = String(nextPageSize);
                }

                if (
                    nextPageOffset === defaultPageOffset ||
                    nextPageOffset === undefined
                ) {
                    delete queryReplacement[pageOffsetKey];
                } else {
                    queryReplacement[pageOffsetKey] = String(nextPageOffset);
                }

                const keys = new Set([
                    ...Object.keys(options.route!.query),
                    ...Object.keys(queryReplacement),
                ]);
                let didChange = false;

                for (const key of keys) {
                    if (
                        !areQueryValuesEqual(
                            options.route!.query[key],
                            queryReplacement[key],
                        )
                    ) {
                        didChange = true;
                        break;
                    }
                }

                if (didChange) {
                    options.router!.replace({ query: queryReplacement });
                }
            },
        );
    }

    const sorts = computed<PagingSort<K>[]>({
        get: (): PagingSort<K>[] => normalizeSorts(sortsState.value),
        set: (value: PagingSort<K>[]) => {
            sortsState.value = normalizeSorts(value);
        },
    });

    return {
        sorts,
        pageSize,
        pageOffset,
    };
}
