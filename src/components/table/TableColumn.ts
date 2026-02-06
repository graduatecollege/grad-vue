import { VNode } from "vue";

export type TableColumnFilter =
    | SelectColumnFilter
    | MultiSelectColumnFilter
    | ToggleColumnFilter;

export interface SelectColumnFilter {
    type: 'select';
    options: Array<{ label: string; value: any }>;
    placeholder?: string;
}

export interface MultiSelectColumnFilter {
    type: 'multi-select';
    options: Array<{ label: string; value: any }>;
    placeholder?: string;
}

export interface ToggleColumnFilter {
    type: 'toggle';
    label: string;
    description?: string;
}

export interface EditableColumnConfig {
    /**
     * Attributes to apply to the input element (type, pattern, step, min, max, etc.)
     */
    inputAttributes?: Record<string, any>;
    /**
     * Text to display before the input (e.g., "$" for currency)
     */
    prefix?: string;
    /**
     * Text to display after the input (e.g., "kg" for weight)
     */
    suffix?: string;
}

export interface TableColumn<T extends TableRow, K = keyof T> {
    key: K;
    label: string;
    sortable?: boolean;
    filter?: TableColumnFilter;
    /**
     * Custom render function for the column data.
     * Cannot be used with `editable`.
     */
    display?: (row: T) => string | VNode;
    tdClass?: string | ((row: T) => string);
    trClass?: string | ((row: T) => string);
    /**
     * Configuration for editable columns.
     * When set, the column will render as an input element.
     * Cannot be used with `display`.
     */
    editable?: EditableColumnConfig;
}

export interface TableRow extends Record<string, any> {
    key: string;
}
