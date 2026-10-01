import { describe, expectTypeOf, test } from "vitest";
import type {
    ColumnKey,
    TableColumn,
    TableColumnFilter,
} from "../../packages/grad-vue/src/components/table/TableColumn";
import {
    buildFilterRequest,
    useFiltering,
    useQueryFiltering,
    type FilterRequest,
    type FilterState,
} from "../../packages/grad-vue/src/compose/useFiltering";

interface StudentRow {
    key: string;
    first_name: string;
    major: string;
    tags: string[];
    hooder_count: number;
    has_deposit: boolean;
}

// Mirrors a generated API query type, e.g. `NonNullable<GetStudentsData["query"]>`.
type GetStudentsData = {
    query?: {
        major__like?: string | null;
        tags?: Array<string> | null;
        hooder_count?: number | null;
        deposit_date__notnull?: boolean | null;
        status?: "active" | "inactive" | null;
        sort?: string;
    };
};
type StudentQuery = NonNullable<GetStudentsData["query"]>;
type StudentColumn = TableColumn<StudentRow, ColumnKey<StudentRow>, StudentQuery>;

const route = { query: {} };
const router = { replace: () => undefined };

describe("typed filter mappings", () => {
    test("accepts filter keys and values from the request type", () => {
        const columns: StudentColumn[] = [
            {
                key: "major",
                label: "Major",
                sortable: true,
                filter: { type: "search", key: "major__like", match: "contains" },
            },
            {
                key: "tags",
                label: "Tags",
                filter: {
                    type: "search",
                    transform: (text) => {
                        expectTypeOf(text).toEqualTypeOf<string>();
                        return text.split(",");
                    },
                },
            },
            {
                key: "hooder_count",
                label: "Hooders",
                filter: {
                    type: "select",
                    options: [
                        { label: "None", value: 0 },
                        { label: "One", value: 1 },
                    ],
                },
            },
            {
                key: "has_deposit",
                label: "Deposit",
                filter: { type: "toggle", label: "Has deposit", key: "deposit_date__notnull" },
            },
            {
                key: "first_name",
                label: "Status",
                filter: {
                    type: "multi-select",
                    key: "status",
                    options: [{ label: "Active", value: "active" }],
                    transform: (values) => (values.includes("active") ? "active" : undefined),
                },
            },
        ];
        expectTypeOf(columns).toBeArray();
    });

    test("rejects filter keys that are not in the request type", () => {
        const columns: StudentColumn[] = [
            // @ts-expect-error unknown request key
            { key: "major", label: "Major", filter: { type: "search", key: "major__bogus" } },
            // @ts-expect-error row keys are not request keys
            { key: "major", label: "Major", filter: { type: "search", key: "first_name" } },
            // @ts-expect-error the column key is not a request key, so filter.key is required
            { key: "major", label: "Major", filter: { type: "search", match: "contains" } },
        ];
        expectTypeOf(columns).toBeArray();
    });

    test("rejects values that do not match the request field type", () => {
        const columns: StudentColumn[] = [
            // @ts-expect-error contains produces a string, but tags is a string array
            { key: "tags", label: "Tags", filter: { type: "search", match: "contains" } },
            // @ts-expect-error transform must return the request field type
            { key: "tags", label: "Tags", filter: { type: "search", transform: (text: string) => text } },
            {
                key: "hooder_count",
                label: "Hooders",
                // @ts-expect-error option values must be numbers
                filter: { type: "select", options: [{ label: "None", value: "0" }] },
            },
            {
                key: "major",
                label: "Major",
                // @ts-expect-error multi-select without transform needs an array field
                filter: { type: "multi-select", key: "major__like", options: [{ label: "A", value: "A" }] },
            },
            {
                key: "major",
                label: "Major",
                // @ts-expect-error toggle without transform needs a field accepting true
                filter: { type: "toggle", label: "Major", key: "major__like" },
            },
        ];
        expectTypeOf(columns).toBeArray();
    });

    test("builds a typed request assignable to the generated query type", () => {
        const columns: StudentColumn[] = [
            { key: "major", label: "Major", filter: { type: "search", key: "major__like", match: "contains" } },
        ];
        const filtering = useQueryFiltering<StudentRow, StudentQuery>(
            { major__like: undefined, tags: undefined, hooder_count: undefined },
            { route, router },
        );
        const request = buildFilterRequest(columns, filtering.filters);

        expectTypeOf(request).toEqualTypeOf<FilterRequest<StudentQuery>>();
        expectTypeOf(request.tags).toEqualTypeOf<string[] | undefined>();
        expectTypeOf(request.hooder_count).toEqualTypeOf<number | undefined>();
        expectTypeOf(request.deposit_date__notnull).toEqualTypeOf<boolean | undefined>();

        const query: GetStudentsData["query"] = { ...request, sort: "major" };
        expectTypeOf(query).not.toBeAny();
    });

    test("filter state and active columns use request keys", () => {
        const filtering = useFiltering<StudentRow, StudentQuery>({ major__like: undefined });

        expectTypeOf(filtering.filters).toMatchTypeOf<FilterState<StudentQuery>>();
        expectTypeOf(filtering.filteredColumns.value).toHaveProperty("major__like");

        // @ts-expect-error unknown request key in defaults
        useFiltering<StudentRow, StudentQuery>({ major: undefined });
        // @ts-expect-error unknown request key in boolean array keys
        useQueryFiltering<StudentRow, StudentQuery>({}, { route, router, booleanArrayKeys: ["major"] });
    });

    test("mapped columns satisfy GTable's untyped column constraint", () => {
        expectTypeOf<StudentColumn>().toMatchTypeOf<TableColumn<StudentRow>>();
    });

    test("columns without a filter type keep accepting row keys", () => {
        const columns: TableColumn<StudentRow>[] = [
            { key: "major", label: "Major", filter: { type: "search" } },
            { key: "tags", label: "Tags", filter: { type: "multi-select", options: [{ label: "A", value: "A" }] } },
        ];
        const filter: TableColumnFilter = { type: "select", options: [{ label: "A", value: 1 }] };
        expectTypeOf(columns).toBeArray();
        expectTypeOf(filter).not.toBeAny();
    });
});
