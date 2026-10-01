import type {
    FilterOption,
    FilterPrimitive,
    SearchFilterMatch,
} from "./TableColumn.ts";

/**
 * A raw filter value as stored in filter state and route queries.
 *
 * Values read back from a URL are strings, so column-aware helpers normalize
 * them against the column filter configuration before use.
 */
export type FilterInputValue =
    | FilterPrimitive
    | FilterPrimitive[]
    | null
    | undefined;

/**
 * Structural view of any `TableColumnFilter`, independent of its filter type.
 */
type AnyColumnFilter =
    | {
          type: "search";
          match?: SearchFilterMatch;
          transform?: (value: string) => unknown;
      }
    | {
          type: "select";
          options: readonly FilterOption<unknown>[];
          transform?: (value: FilterPrimitive) => unknown;
      }
    | {
          type: "multi-select";
          options: readonly FilterOption<unknown>[];
          transform?: (value: FilterPrimitive[]) => unknown;
      }
    | {
          type: "toggle";
          transform?: (value: true) => unknown;
      };

interface FilterableColumn {
    key: string;
    filter?: { key?: string };
}

/**
 * The filter/request key a column filter reads and writes.
 */
export function columnFilterKey(column: FilterableColumn): string {
    return column.filter?.key ?? column.key;
}

function isBlank(value: unknown): value is null | undefined | "" {
    return value === null || value === undefined || value === "";
}

function matchOption(
    options: readonly FilterOption<unknown>[],
    value: FilterPrimitive,
): FilterPrimitive {
    const exact = options.find((option) => option.value === value);
    if (exact) {
        return exact.value as FilterPrimitive;
    }
    const text = String(value);
    const loose = options.find((option) => String(option.value) === text);
    return loose ? (loose.value as FilterPrimitive) : value;
}

function searchText(raw: FilterInputValue): string {
    if (isBlank(raw)) {
        return "";
    }
    // Comma-containing text may have been split into an array by route parsing.
    return Array.isArray(raw) ? raw.join(",") : String(raw);
}

function inputArray(raw: FilterInputValue): FilterPrimitive[] {
    if (isBlank(raw)) {
        return [];
    }
    const values = Array.isArray(raw) ? raw : [raw];
    return values.filter((value) => !isBlank(value));
}

function applySearchMatch(text: string, match: SearchFilterMatch): string {
    switch (match) {
        case "contains":
            return `%${text}%`;
        case "startsWith":
            return `${text}%`;
        case "endsWith":
            return `%${text}`;
        default:
            return text;
    }
}

/**
 * Normalizes a raw state value into the value expected by the filter control.
 */
export function filterInputValue(
    filter: AnyColumnFilter,
    raw: FilterInputValue,
): FilterPrimitive | FilterPrimitive[] | undefined {
    switch (filter.type) {
        case "search":
            return searchText(raw);
        case "select": {
            if (isBlank(raw) || (Array.isArray(raw) && raw.length === 0)) {
                return undefined;
            }
            const value = Array.isArray(raw) ? raw.join(",") : raw;
            return matchOption(filter.options, value);
        }
        case "multi-select":
            return inputArray(raw).map((value) =>
                matchOption(filter.options, value),
            );
        case "toggle":
            return raw === true || raw === "true";
    }
}

/**
 * Converts a value emitted by a filter control into a raw state value.
 * Empty values (including an unchecked toggle) become `undefined`, except
 * multi-select values, which stay arrays.
 */
export function filterStateValue(
    filter: AnyColumnFilter,
    input: unknown,
): FilterInputValue {
    switch (filter.type) {
        case "search":
            return typeof input === "string" && input !== "" ? input : undefined;
        case "select":
            return isBlank(input) ? undefined : (input as FilterPrimitive);
        case "multi-select":
            return Array.isArray(input) ? [...(input as FilterPrimitive[])] : undefined;
        case "toggle":
            return input === true ? true : undefined;
    }
}

/**
 * Whether a raw state value represents an active filter for the column.
 * `0` and `false` are meaningful select values; toggles are active only when on.
 */
export function isColumnFilterActive(
    filter: AnyColumnFilter,
    raw: FilterInputValue,
): boolean {
    const value = filterInputValue(filter, raw);
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (filter.type === "toggle") {
        return value === true;
    }
    return !isBlank(value);
}

/**
 * Converts a raw state value into the request value for the column filter.
 * Returns `undefined` when the filter is inactive.
 */
export function filterRequestValue(
    filter: AnyColumnFilter,
    raw: FilterInputValue,
): unknown {
    switch (filter.type) {
        case "search": {
            const text = searchText(raw).trim();
            if (!text) {
                return undefined;
            }
            if (filter.transform) {
                return filter.transform(text);
            }
            return applySearchMatch(text, filter.match ?? "exact");
        }
        case "select": {
            const value = filterInputValue(filter, raw);
            if (isBlank(value) || Array.isArray(value)) {
                return undefined;
            }
            return filter.transform ? filter.transform(value) : value;
        }
        case "multi-select": {
            const values = inputArray(raw).map((value) =>
                matchOption(filter.options, value),
            );
            if (values.length === 0) {
                return undefined;
            }
            return filter.transform ? filter.transform(values) : values;
        }
        case "toggle": {
            if (filterInputValue(filter, raw) !== true) {
                return undefined;
            }
            return filter.transform ? filter.transform(true) : true;
        }
    }
}
