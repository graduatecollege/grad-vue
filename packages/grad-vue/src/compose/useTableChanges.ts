import { computed, ComputedRef, shallowReactive } from "vue";
import { TableColumn, TableRow } from "../components/table/TableColumn.ts";
import { createEventHook, EventHook, EventHookOn } from "@vueuse/core";

export type ColumnKey<R extends TableRow> = Extract<keyof R, string>;

/**
 * Represents a single cell change in the table
 */
export interface CellChange<
    R extends TableRow = TableRow,
    K extends ColumnKey<R> = ColumnKey<R>,
> {
    rowKey: string;
    columnKey: K;
    row: R;
    /**
     * Represents the original value before user changes.
     */
    previousValue: R[K];
    /**
     * New value from the change. This will be null in events
     * if the new value is the same as the original.
     */
    newValue: R[K];
    error?: string;
}

export interface CellChangeEvent<
    R extends TableRow = TableRow,
    K extends ColumnKey<R> = ColumnKey<R>,
> {
    rowKey: string;
    columnKey: K;
    row: R;
    previousValue: R[K];
    newValue: R[K] | null;
    error?: string;
}

/**
 * Payload for the `trackChange` function
 */
export interface CellChangePayload<
    T extends TableRow = TableRow,
    K extends ColumnKey<T> = ColumnKey<T>,
> {
    row: T;
    column: TableColumn<T, K>;
    value: T[K];
    previousValue: T[K];
}

/**
 * Map of changes organized by row key and column key
 */
export type ChangeMap<T extends TableRow> = Map<
    string,
    Map<ColumnKey<T>, CellChange<T>>
>;

/**
 * Return type for the useTableChanges composable
 */
export interface UseTableChangesReturn<T extends TableRow> {
    /**
     * Track a change to a cell
     */
    trackChange: <K extends ColumnKey<T>>(payload: CellChangePayload<T, K>) => void;

    /**
     * Reactive array of all current changes
     */
    changes: ComputedRef<CellChange<T>[]>;

    /**
     * Get changes organized by row
     */
    getChangesByRow: () => Map<string, Partial<T>>;

    /**
     * Reactive flag indicating whether there are any changes
     */
    hasChanges: ComputedRef<boolean>;

    /**
     * Check if a specific cell has changes
     */
    hasChange: <K extends ColumnKey<T>>(rowKey: string, columnKey: K) => boolean;

    /**
     * Get the changed value for a specific cell, or undefined if no change
     */
    getChange: <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ) => T[K] | undefined;

    /**
     * Clear all tracked changes
     */
    clearChanges: () => void;

    /**
     * Clear changes for a specific row
     */
    clearRowChanges: (rowKey: string) => void;

    /**
     * Apply tracked changes to a new dataset (for merging with updated data)
     */
    applyChangesToData: (data: T[]) => T[];

    /**
     * Reactive count of changed cells
     */
    changeCount: ComputedRef<number>;

    /**
     * Reactive flag indicating whether any cell has an error
     */
    hasErrors: ComputedRef<boolean>;

    /**
     * Set an error message for a specific cell
     */
    setError: <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
        error: string,
    ) => void;

    /**
     * Clear the error for a specific cell
     */
    clearError: <K extends ColumnKey<T>>(rowKey: string, columnKey: K) => void;

    /**
     * Get the error message for a specific cell, or undefined if no error
     */
    getError: <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ) => string | undefined;

    /**
     * Check if a specific cell has an error
     */
    hasError: <K extends ColumnKey<T>>(rowKey: string, columnKey: K) => boolean;

    /**
     * Event emitted when a cell changes.
     *
     * `newValue` will be null if the cell's value is the same as the original.
     */
    onChange: EventHookOn<CellChangeEvent<T>>;
}

/**
 * Composable for tracking changes to table data
 *
 * This composable helps manage user edits to table data by:
 * - Tracking which cells have been modified
 * - Storing both old and new values
 * - Providing methods to retrieve just the changes (not full data)
 * - Allowing changes to be applied to updated data for real-time syncing
 *
 * @example
 * ```typescript
 * const changes = useTableChanges<ProductRow>();
 *
 * // Track a change when user edits a cell
 * function handleCellChange(row, column, newValue) {
 *   changes.trackChange({
 *     row,
 *     column,
 *     value: newValue,
 *     previousValue: row[column.key],
 *   });
 * }
 *
 * // Get all changes to submit
 * const changedData = changes.changes.value;
 * await api.updateProducts(changedData);
 *
 * // Apply user changes to fresh data from server
 * const freshData = await api.getProducts();
 * const mergedData = changes.applyChangesToData(freshData);
 * ```
 */
export function useTableChanges<
    T extends TableRow,
>(): UseTableChangesReturn<T> {
    // Store changes in a reactive map: rowKey -> columnKey -> CellChange
    const changeMap = shallowReactive<ChangeMap<T>>(new Map());

    const changeEvent = createEventHook<CellChangeEvent<T>>();

    /**
     * Track a change to a specific cell
     */
    const trackChange = <K extends ColumnKey<T>>(
        payload: CellChangePayload<T, K>,
    ) => {
        const colKey: K = payload.column.key;
        const rowKey = payload.row.key;
        const newValue: T[K] = payload.value;
        const previousValue: T[K] = payload.previousValue;

        if (!changeMap.has(rowKey)) {
            changeMap.set(
                rowKey,
                shallowReactive(new Map<ColumnKey<T>, CellChange<T>>()),
            );
        }

        const rowChanges = changeMap.get(
            rowKey,
        )!;

        // If there's already a change for this cell, preserve the original previousValue
        const existingChange = rowChanges.get(colKey);
        const originalpreviousValue: T[K] = (existingChange
            ? existingChange.previousValue
            : previousValue) as T[K];
        const existingError = existingChange?.error;

        // If the new value equals the original value, remove the change
        if (newValue === originalpreviousValue) {
            rowChanges.delete(colKey);
            // Clean up empty row maps
            if (rowChanges.size === 0) {
                changeMap.delete(rowKey);
            }
            // null newValue means the value was reverted to the original
            changeEvent.trigger({
                rowKey,
                columnKey: colKey,
                row: payload.row,
                previousValue: originalpreviousValue,
                newValue: null,
            });
        } else {
            // Store or update the change, preserving error if it exists
            const updatedChange: CellChange<T, K> = {
                rowKey,
                columnKey: colKey,
                row: payload.row,
                previousValue: originalpreviousValue,
                newValue,
            };

            // Preserve error if it exists
            if (existingError !== undefined) {
                updatedChange.error = existingError;
            }

            rowChanges.set(colKey, updatedChange);
            changeEvent.trigger(updatedChange);
        }
    };

    const changes = computed(() => {
        const result: CellChange<T>[] = [];
        changeMap.forEach((rowChanges) => {
            rowChanges.forEach((change) => {
                result.push({ ...change });
            });
        });
        return result;
    });

    /**
     * Get changes organized by row key
     * Returns a map of rowKey -> object with changed fields
     */
    const getChangesByRow = (): Map<string, Partial<T>> => {
        const result = new Map<string, Partial<T>>();
        changeMap.forEach((rowChanges, rowKey) => {
            const rowData: Partial<T> = { key: rowKey } as Partial<T>;
            rowChanges.forEach((change, columnKey) => {
                rowData[columnKey] = change.newValue;
            });
            result.set(rowKey, rowData);
        });
        return result;
    };

    const hasChanges = computed<boolean>(() => changeMap.size > 0);

    /**
     * Check if a specific cell has changes
     */
    const hasChange = <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ): boolean => {
        const rowChanges = changeMap.get(rowKey);
        if (!rowChanges) return false;
        return rowChanges.has(columnKey);
    };

    /**
     * Get the changed value for a specific cell
     */
    const getChange = <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ): T[K] | undefined => {
        const rowChanges = changeMap.get(rowKey);
        if (!rowChanges) return undefined;
        const change = rowChanges.get(columnKey);
        return change?.newValue as T[K] | undefined;
    };

    /**
     * Clear all tracked changes
     */
    const clearChanges = () => {
        changeMap.clear();
    };

    /**
     * Clear changes for a specific row
     */
    const clearRowChanges = (rowKey: string) => {
        changeMap.delete(rowKey);
    };

    /**
     * Apply tracked changes to a new dataset
     * This is useful when you have fresh data from the server but want to preserve user edits
     */
    const applyChangesToData = (data: T[]): T[] => {
        return data.map((row) => {
            const rowChanges = changeMap.get(row.key);
            if (!rowChanges || rowChanges.size === 0) {
                return row;
            }

            // Create a new object with the row data and apply changes
            const updatedRow = { ...row };
            rowChanges.forEach((change, columnKey) => {
                updatedRow[columnKey] = change.newValue;
            });

            return updatedRow;
        });
    };

    const changeCount = computed<number>(() => {
        let count = 0;
        changeMap.forEach((rowChanges) => {
            count += rowChanges.size;
        });
        return count;
    });

    const hasErrors = computed<boolean>(() =>
        changes.value.some(
            (change) => change.error !== undefined && change.error !== "",
        ),
    );

    /**
     * Set an error message for a specific cell
     */
    const setError = <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
        error: string,
    ) => {
        const rowChanges = changeMap.get(rowKey);
        if (!rowChanges) return;

        const change = rowChanges.get(columnKey);
        if (!change) return;

        // With shallowReactive(Map), mutating nested objects won't trigger updates.
        // Replace the map entry so Vue can observe the change.
        const updatedChange: CellChange<T> = { ...change, error };
        rowChanges.set(columnKey, updatedChange);
    };

    /**
     * Clear the error for a specific cell
     */
    const clearError = <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ) => {
        const rowChanges = changeMap.get(rowKey);
        if (!rowChanges) return;

        const change = rowChanges.get(columnKey);
        if (!change) return;

        // Replace the map entry so Vue can observe the change.
        const updatedChange: CellChange<T> = { ...change };
        delete updatedChange.error;
        rowChanges.set(columnKey, updatedChange);
    };

    /**
     * Get the error message for a specific cell
     */
    const getError = <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ): string | undefined => {
        const rowChanges = changeMap.get(rowKey);
        if (!rowChanges) return undefined;

        const change = rowChanges.get(columnKey);
        return change?.error;
    };

    /**
     * Check if a specific cell has an error
     */
    const hasError = <K extends ColumnKey<T>>(
        rowKey: string,
        columnKey: K,
    ): boolean => {
        const error = getError(rowKey, columnKey);
        return error !== undefined && error !== "";
    };

    return {
        trackChange,
        changes,
        getChangesByRow,
        hasChanges,
        hasChange,
        getChange,
        clearChanges,
        clearRowChanges,
        applyChangesToData,
        changeCount,
        hasErrors,
        setError,
        clearError,
        getError,
        hasError,
        onChange: changeEvent.on,
    };
}
