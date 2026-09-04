import type { TableColumn, TableColumnState, TableColumnStateValue, TableRow } from "@illinois-grad/grad-vue";
import { useLocalStorage } from "@vueuse/core";
import { toValue, type MaybeRefOrGetter, watch } from "vue";

export function normalizeTableColumnState<T extends TableRow>(
    value: unknown,
    columns: readonly TableColumn<T>[],
): TableColumnState<T> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    const columnKeys = new Set(columns.map(({ key }) => String(key)));
    const normalizedState: Record<string, TableColumnStateValue> = {};

    for (const [key, entryValue] of Object.entries(value)) {
        if (!columnKeys.has(key) || !entryValue || typeof entryValue !== "object" || Array.isArray(entryValue)) {
            continue;
        }

        const normalizedValue: TableColumnStateValue = {};

        if ("visible" in entryValue && typeof entryValue.visible === "boolean") {
            normalizedValue.visible = entryValue.visible;
        }
        if ("width" in entryValue && typeof entryValue.width === "number" && Number.isFinite(entryValue.width)) {
            normalizedValue.width = Math.max(50, Math.round(entryValue.width));
        }
        if (Object.keys(normalizedValue).length > 0) {
            normalizedState[key] = normalizedValue;
        }
    }

    return normalizedState as TableColumnState<T>;
}

export function usePersistentTableColumnState<T extends TableRow>(
    storageKey: string,
    columns: MaybeRefOrGetter<readonly TableColumn<T>[]>,
) {
    const columnState = useLocalStorage<TableColumnState<T>>(storageKey, {} as TableColumnState<T>);

    watch(
        () => toValue(columns).map(({ key }) => String(key)),
        () => {
            columnState.value = normalizeTableColumnState(columnState.value, toValue(columns));
        },
        { immediate: true },
    );

    return { columnState };
}
