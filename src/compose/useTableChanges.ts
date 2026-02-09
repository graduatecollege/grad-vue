import { reactive} from "vue";
import { TableColumn, TableRow } from "../components/table/TableColumn.ts";

/**
 * Represents a single cell change in the table
 */
export interface CellChange<T = any> {
    rowKey: string;
    columnKey: string;
    previousValue: T;
    newValue: T;
    error?: string;
}

/**
 * Payload for the `trackChange` function
 */
export interface CellChangePayload<T extends TableRow = TableRow> {
    row: T;
    column: TableColumn<T>;
    value: any;
    previousValue: any;
}

/**
 * Map of changes organized by row key and column key
 */
export type ChangeMap = Map<string, Map<string, CellChange>>;

/**
 * Return type for the useTableChanges composable
 */
export interface UseTableChangesReturn<T extends Record<string, any>> {
    /**
     * Track a change to a cell
     */
    trackChange: (payload: CellChangePayload<any>) => void;
    
    /**
     * Get all changes as an array
     */
    getChanges: () => CellChange[];
    
    /**
     * Get changes organized by row
     */
    getChangesByRow: () => Map<string, Partial<T>>;
    
    /**
     * Check if there are any changes
     */
    hasChanges: () => boolean;
    
    /**
     * Check if a specific cell has changes
     */
    hasChange: (rowKey: string, columnKey: keyof T) => boolean;
    
    /**
     * Get the changed value for a specific cell, or undefined if no change
     */
    getChange: (rowKey: string, columnKey: keyof T) => any | undefined;
    
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
     * Get count of changed cells
     */
    changeCount: () => number;
    
    /**
     * Set an error message for a specific cell
     */
    setError: (rowKey: string, columnKey: keyof T, error: string) => void;
    
    /**
     * Clear the error for a specific cell
     */
    clearError: (rowKey: string, columnKey: keyof T) => void;
    
    /**
     * Get the error message for a specific cell, or undefined if no error
     */
    getError: (rowKey: string, columnKey: keyof T) => string | undefined;
    
    /**
     * Check if a specific cell has an error
     */
    hasError: (rowKey: string, columnKey: keyof T) => boolean;
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
 *   changes.trackChange(row.key, column.key, newValue, row[column.key]);
 * }
 * 
 * // Get all changes to submit
 * const changedData = changes.getChanges();
 * await api.updateProducts(changedData);
 * 
 * // Apply user changes to fresh data from server
 * const freshData = await api.getProducts();
 * const mergedData = changes.applyChangesToData(freshData);
 * ```
 */
export function useTableChanges<T extends Record<string, any> = Record<string, any>>(): UseTableChangesReturn<T> {
    // Store changes in a reactive map: rowKey -> columnKey -> CellChange
    const changes = reactive<ChangeMap>(new Map());
    
    /**
     * Track a change to a specific cell
     */
    const trackChange = (payload: CellChangePayload) => {
        const colKey = payload.column.key as string;
        const rowKey = payload.row.key;
        const newValue = payload.value;
        const previousValue = payload.previousValue;

        if (!changes.has(rowKey)) {
            changes.set(rowKey, new Map());
        }
        
        const rowChanges = changes.get(rowKey)!;
        
        // If there's already a change for this cell, preserve the original previousValue
        const existingChange = rowChanges.get(colKey);
        const originalpreviousValue = existingChange ? existingChange.previousValue : previousValue;
        const existingError = existingChange?.error;
        
        // If the new value equals the original value, remove the change
        if (newValue === originalpreviousValue) {
            rowChanges.delete(colKey);
            // Clean up empty row maps
            if (rowChanges.size === 0) {
                changes.delete(rowKey);
            }
        } else {
            // Store or update the change, preserving error if it exists
            const updatedChange: CellChange = {
                rowKey,
                columnKey: colKey,
                previousValue: originalpreviousValue,
                newValue,
            };
            
            // Preserve error if it exists
            if (existingError !== undefined) {
                updatedChange.error = existingError;
            }
            
            rowChanges.set(colKey, updatedChange);
        }
    };
    
    /**
     * Get all changes as a flat array
     */
    const getChanges = (): CellChange[] => {
        const result: CellChange[] = [];
        changes.forEach((rowChanges) => {
            rowChanges.forEach((change) => {
                result.push({ ...change });
            });
        });
        return result;
    };
    
    /**
     * Get changes organized by row key
     * Returns a map of rowKey -> object with changed fields
     */
    const getChangesByRow = (): Map<string, Partial<T>> => {
        const result = new Map<string, Partial<T>>();
        changes.forEach((rowChanges, rowKey) => {
            const rowData: Partial<T> = { key: rowKey } as any;
            rowChanges.forEach((change, columnKey) => {
                rowData[columnKey as keyof T] = change.newValue;
            });
            result.set(rowKey, rowData);
        });
        return result;
    };
    
    /**
     * Check if there are any changes
     */
    const hasChanges = (): boolean => {
        return changes.size > 0;
    };
    
    /**
     * Check if a specific cell has changes
     */
    const hasChange = (rowKey: string, columnKey: keyof T): boolean => {
        const rowChanges = changes.get(rowKey);
        if (!rowChanges) return false;
        return rowChanges.has(String(columnKey));
    };
    
    /**
     * Get the changed value for a specific cell
     */
    const getChange = (rowKey: string, columnKey: keyof T): any | undefined => {
        const rowChanges = changes.get(rowKey);
        if (!rowChanges) return undefined;
        const change = rowChanges.get(String(columnKey));
        return change?.newValue;
    };
    
    /**
     * Clear all tracked changes
     */
    const clearChanges = () => {
        changes.clear();
    };
    
    /**
     * Clear changes for a specific row
     */
    const clearRowChanges = (rowKey: string) => {
        changes.delete(rowKey);
    };
    
    /**
     * Apply tracked changes to a new dataset
     * This is useful when you have fresh data from the server but want to preserve user edits
     */
    const applyChangesToData = (data: T[]): T[] => {
        return data.map((row) => {
            const rowChanges = changes.get(row.key);
            if (!rowChanges || rowChanges.size === 0) {
                return row;
            }
            
            // Create a new object with the row data and apply changes
            const updatedRow = { ...row };
            rowChanges.forEach((change, columnKey) => {
                updatedRow[columnKey as keyof T] = change.newValue;
            });
            
            return updatedRow;
        });
    };
    
    /**
     * Get count of changed cells
     */
    const changeCount = (): number => {
        let count = 0;
        changes.forEach((rowChanges) => {
            count += rowChanges.size;
        });
        return count;
    };
    
    /**
     * Set an error message for a specific cell
     */
    const setError = (rowKey: string, columnKey: keyof T, error: string) => {
        const rowChanges = changes.get(rowKey);
        if (!rowChanges) return;
        
        const change = rowChanges.get(String(columnKey));
        if (!change) return;
        
        change.error = error;
    };
    
    /**
     * Clear the error for a specific cell
     */
    const clearError = (rowKey: string, columnKey: keyof T) => {
        const rowChanges = changes.get(rowKey);
        if (!rowChanges) return;
        
        const change = rowChanges.get(String(columnKey));
        if (!change) return;
        
        delete change.error;
    };
    
    /**
     * Get the error message for a specific cell
     */
    const getError = (rowKey: string, columnKey: keyof T): string | undefined => {
        const rowChanges = changes.get(rowKey);
        if (!rowChanges) return undefined;
        
        const change = rowChanges.get(String(columnKey));
        return change?.error;
    };
    
    /**
     * Check if a specific cell has an error
     */
    const hasError = (rowKey: string, columnKey: keyof T): boolean => {
        const error = getError(rowKey, columnKey);
        return error !== undefined && error !== '';
    };
    
    return {
        trackChange,
        getChanges,
        getChangesByRow,
        hasChanges,
        hasChange,
        getChange,
        clearChanges,
        clearRowChanges,
        applyChangesToData,
        changeCount,
        setError,
        clearError,
        getError,
        hasError,
    };
}
