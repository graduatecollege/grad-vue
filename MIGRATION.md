# Migration Guide

## Migrating from v6 to v7

### Typed API filter mappings

v7 of `@illinois-grad/grad-vue` lets table columns map their filter to a
different filter/request key with `filter.key`, and converts filter state to
typed request values with `buildFilterRequest()`. This is a breaking change to
filter state typing and a few runtime behaviors. Projects using `GTable`
filtering, `useFiltering()`, or `useQueryFiltering()` should review the
sections below when upgrading to v7.

#### Filter state values are raw, loosely typed values

`useFiltering()` / `useQueryFiltering()` return `filters` typed as
`FilterState<F>`: every value is a `FilterInputValue`
(`string | number | boolean | Array<string | number | boolean> | null | undefined`)
rather than the value type you declared. This reflects what the state really
holds: values restored from the URL are strings.

Code that passed `filters` straight into typed helpers, or called methods such
as `.trim()`, no longer compiles. Do one of the following:

**Recommended: describe the request type on the columns and build the request.**

```ts
type Query = NonNullable<GetStudentsData["query"]>;

const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, Query>[] = [
    { key: "major", label: "Major", filter: { type: "search", key: "major__like", match: "contains" } },
    { key: "tags", label: "Tags", filter: { type: "search", transform: (text) => text.split(",") } },
    { key: "hooder_count", label: "Hooders", filter: { type: "select", options: [{ label: "None", value: 0 }] } },
];

const filtering = useQueryFiltering<StudentRow, Query>(
    { major__like: undefined, tags: undefined, hooder_count: undefined },
    { route, router },
);

const query = computed<GetStudentsData["query"]>(() => ({
    ...buildFilterRequest(columns, filtering.filters),
    sort: sortBy.value,
}));
```

`buildFilterRequest()` handles trimming, `%text%` wrapping (only when `match`
is set), string-to-number/boolean conversion from URL values and omitting empty
filters. Remove hand-written `__like` key rewriting and `as ...["query"]` casts.

**Or: narrow values where you read them.**

```ts
// Before
const lastName = filters.last_name?.trim();
// After
const lastName = typeof filters.last_name === "string" ? filters.last_name.trim() : undefined;
```

#### Filter state is keyed by the filter key

Filter state, URL query params, `filteredColumns`, and Clear Filters use
`filter.key ?? column.key`. Existing columns without `filter.key` are
unaffected. If you add `filter.key`, also rename the matching key in your
`useFiltering()` defaults. The URL parameter name changes too, so bookmarked
links using the old name stop applying.

`like` operators are never inferred from `type: "search"`. Set the key
(`major__like`) and `match: "contains"` explicitly.

#### `0` and `false` are active filter values

- `isFiltered`, `filteredColumns`, and the column filter indicator treat `0`
  and `false` as active.
- Query syncing keeps them (`?count=0`, `?confirmed=false`) instead of dropping
  them.
- If you used `false` as an "off" default (for example for a toggle), use
  `undefined` instead, or the table will show as filtered on load.

#### Values written by GTable controls

| Control | Previously when cleared | Now |
| --- | --- | --- |
| Search input | `""` | `undefined` |
| Select | `null` | `undefined` |
| Toggle (unchecked) | `false` | `undefined` |
| Multi-select | `[]` | `[]` |

Select and multi-select options may now use number and boolean values. The
selected option's original value is stored.

#### Type changes

- `TableColumn<T, K, F>` is now a type alias (a union over column keys) with an
  optional third filter/request type parameter. Interfaces cannot `extends` it;
  extend `TableColumnConfig<T, K, F>` instead.
- `CellChangePayload.column` is typed as `TableColumnConfig<T, K>`.
- `UseFilteringReturn<T, F>`: `filteredColumns` is keyed by the filter keys of
  `F`.
- Search filters without `transform` require the target request field to
  accept a string; multi-select filters without `transform` require an array
  field; toggles without `transform` require a field that accepts `true`.
