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

export interface TableColumn<T extends TableRow, K = keyof T> {
    key: K;
    label: string;
    sortable?: boolean;
    filter?: TableColumnFilter;
    display?: (row: T) => string | VNode;
    tdClass?: string | ((row: T) => string);
    trClass?: string | ((row: T) => string);
}

export interface TableRow extends Record<string, any> {
    key: string;
}
