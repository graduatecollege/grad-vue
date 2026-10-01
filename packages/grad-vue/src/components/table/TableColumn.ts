import { VNode } from "vue";

/**
 * Default filter/request type used when a column does not declare one.
 */
export type AnyFilterRecord = Record<string, any>;

/**
 * String keys of a filter/request type.
 */
export type FilterKey<F> = Extract<keyof F, string>;

/**
 * The non-null value type accepted by the request field `K` of `F`.
 */
export type FilterApiValue<F, K extends keyof F> = Exclude<F[K], null | undefined>;

export type FilterPrimitive = string | number | boolean;

/**
 * How a search filter's text is converted for the request.
 *
 * - `exact` (default): the trimmed text is sent unchanged.
 * - `contains`: `%text%`
 * - `startsWith`: `text%`
 * - `endsWith`: `%text`
 */
export type SearchFilterMatch = "exact" | "contains" | "startsWith" | "endsWith";

export interface FilterOption<V = any> {
    label: string;
    value: V;
    description?: string;
}

/**
 * Converts a normalized UI value into the request value for `F[K]`.
 * Returning `undefined` omits the field from the request.
 */
export type FilterTransform<In, F, K extends keyof F> = (
    value: In,
) => FilterApiValue<F, K> | undefined;

type ArrayElement<V> = V extends readonly (infer E)[] ? E : never;

interface SearchFilterBase {
    type: "search";
    /**
     * Placeholder text shown in the search input.
     */
    placeholder?: string;
}

type SearchFilterMapping<F, K extends keyof F> =
    | (string extends FilterApiValue<F, K>
          ? { match?: SearchFilterMatch; transform?: undefined }
          : never)
    | { match?: undefined; transform: FilterTransform<string, F, K> };

interface SelectFilterBase {
    type: "select";
    placeholder?: string;
    /**
     * Include the option `description` in the searchable text match.
     * Enabled by default; set to `false` to match on the label only.
     */
    searchDescription?: boolean;
}

type SelectFilterMapping<F, K extends keyof F> =
    | {
          options: Array<FilterOption<FilterApiValue<F, K>>>;
          transform?: undefined;
      }
    | {
          options: Array<FilterOption<FilterPrimitive>>;
          transform: FilterTransform<FilterPrimitive, F, K>;
      };

interface MultiSelectFilterBase {
    type: "multi-select";
    placeholder?: string;
    /**
     * When true, renders a searchable GMultiSelect combobox instead of a
     * list of checkboxes. Recommended when there are many options.
     */
    searchable?: boolean;
    /**
     * Include the option `description` in the searchable text match.
     * Only applies when `searchable` is true. Enabled by default; set to
     * `false` to match on the label only.
     */
    searchDescription?: boolean;
}

type MultiSelectFilterMapping<F, K extends keyof F> =
    | ([FilterApiValue<F, K>] extends [readonly unknown[]]
          ? {
                options: Array<FilterOption<ArrayElement<FilterApiValue<F, K>>>>;
                transform?: undefined;
            }
          : never)
    | {
          options: Array<FilterOption<FilterPrimitive>>;
          transform: FilterTransform<FilterPrimitive[], F, K>;
      };

interface ToggleFilterBase {
    type: "toggle";
    label: string;
    description?: string;
}

type ToggleFilterMapping<F, K extends keyof F> =
    | (true extends FilterApiValue<F, K> ? { transform?: undefined } : never)
    | { transform: FilterTransform<true, F, K> };

/**
 * A search input filter.
 *
 * The UI value is the entered text. Without `transform`, the request field
 * must accept a string; `match` controls wildcard wrapping. With
 * `transform`, the trimmed text is converted to the request field's type.
 */
export type SearchColumnFilter<
    F = AnyFilterRecord,
    K extends FilterKey<F> = FilterKey<F>,
> = SearchFilterBase & { key?: K } & SearchFilterMapping<F, K>;

/**
 * A single-select filter. Without `transform`, option values must match the
 * request field's type.
 */
export type SelectColumnFilter<
    F = AnyFilterRecord,
    K extends FilterKey<F> = FilterKey<F>,
> = SelectFilterBase & { key?: K } & SelectFilterMapping<F, K>;

/**
 * A multi-select filter. Without `transform`, the request field must be an
 * array and option values must match its element type.
 */
export type MultiSelectColumnFilter<
    F = AnyFilterRecord,
    K extends FilterKey<F> = FilterKey<F>,
> = MultiSelectFilterBase & { key?: K } & MultiSelectFilterMapping<F, K>;

/**
 * A toggle filter. It is active only when on. Without `transform`, the
 * request field must accept `true`.
 */
export type ToggleColumnFilter<
    F = AnyFilterRecord,
    K extends FilterKey<F> = FilterKey<F>,
> = ToggleFilterBase & { key?: K } & ToggleFilterMapping<F, K>;

type ColumnFilterFor<F, K extends FilterKey<F>> =
    | (SearchFilterBase & SearchFilterMapping<F, K>)
    | (SelectFilterBase & SelectFilterMapping<F, K>)
    | (MultiSelectFilterBase & MultiSelectFilterMapping<F, K>)
    | (ToggleFilterBase & ToggleFilterMapping<F, K>);

type KeyedColumnFilter<F, K extends FilterKey<F>> = K extends unknown
    ? ColumnFilterFor<F, K> & {
          /**
           * The filter/request field this filter reads and writes. Defaults to
           * the column key, which must then be a key of the filter type.
           */
          key: K;
      }
    : never;

type DefaultKeyColumnFilter<F, K> = K extends FilterKey<F>
    ? ColumnFilterFor<F, K> & { key?: undefined }
    : never;

/**
 * Filter configuration for a column.
 *
 * `F` is the filter/request type (for example a generated API query type).
 * `filter.key` must be a key of `F`. When `key` is omitted, the column key
 * (`DefaultKey`) is used and must itself be a key of `F`.
 */
export type TableColumnFilter<
    F = AnyFilterRecord,
    DefaultKey extends string = FilterKey<F>,
> = KeyedColumnFilter<F, FilterKey<F>> | DefaultKeyColumnFilter<F, DefaultKey>;

export interface EditableColumnConfig {
    /**
     * Type of editable control. Defaults to "input".
     */
    type?: "input" | "select";
    /**
     * Attributes to apply to the input element (type, pattern, step, min, max, etc.)
     * Only applies when type is "input" or undefined.
     */
    inputAttributes?: Record<string, any>;
    /**
     * Options for select dropdown. Required when type is "select".
     */
    options?: Array<{ label: string; value: any }>;
    /**
     * Text to display before the input (e.g., "$" for currency)
     */
    prefix?: string;
    /**
     * Text to display after the input (e.g., "kg" for weight)
     */
    suffix?: string;
    /**
     * Key of the column to use as the identifying label for the input's aria-labelledby.
     * If not provided, the input will only be labeled by its column header.
     */
    labelKey?: string;
}

export type ColumnKey<T> = Extract<keyof T, string>;

export interface TableColumnStateValue {
    visible?: boolean;
    width?: number;
}

export type TableColumnState<
    T extends TableRow,
    K extends ColumnKey<T> = ColumnKey<T>,
> = Partial<Record<K, TableColumnStateValue>>;

export interface TableSort<T extends TableRow, K extends ColumnKey<T> = ColumnKey<T>> {
    key: K;
    order: 1 | -1;
}

export interface TableColumnConfig<
    T extends TableRow,
    K extends ColumnKey<T> = ColumnKey<T>,
    F = AnyFilterRecord,
> {
    /**
     * Row field used for display and sorting.
     */
    key: K;
    label: string;
    sortable?: boolean;
    /**
     * Filter configuration. Use `filter.key` when the filter/request field
     * differs from the column key.
     */
    filter?: TableColumnFilter<F, K>;
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

/**
 * A table column for rows of type `T`.
 *
 * `F` is an independent filter/request type that column filters map to.
 * This distributes over `K` so each column's default filter key is checked
 * against its own row key.
 */
export type TableColumn<
    T extends TableRow,
    K extends ColumnKey<T> = ColumnKey<T>,
    F = AnyFilterRecord,
> = K extends ColumnKey<T> ? TableColumnConfig<T, K, F> : never;

export interface TableRow extends Record<string, any> {
    key: string;
}
