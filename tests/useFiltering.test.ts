import { describe, expect, it } from "vitest";
import { nextTick, reactive, ref } from "vue";
import {
    buildFilterRequest,
    filterDefaults,
    filterStateFromQuery,
    parseQueryArrayValue,
    type FilterLocationQuery,
    type FilterRouteQuery,
    useFiltering,
    useQueryFiltering,
} from "../packages/grad-vue/src/compose/useFiltering";
import type {
    ColumnKey,
    TableColumn,
} from "../packages/grad-vue/src/components/table/TableColumn";

interface TestFilters {
    status?: string;
    tags?: string[];
    depositDate?: boolean[];
}

function createQueryContext(initialQuery: FilterRouteQuery = {}) {
    const route = reactive<{ query: FilterRouteQuery }>({
        query: { ...initialQuery },
    });
    const replacements: FilterLocationQuery[] = [];

    const router = {
        replace({ query }: { query: FilterLocationQuery }) {
            replacements.push({ ...query });
            route.query = { ...query } as FilterRouteQuery;
        },
    };

    return {
        route,
        router,
        replacements,
    };
}

async function flushFiltering() {
    await nextTick();
    await nextTick();
}

describe("useFiltering query helpers", () => {
    it("parses route query arrays and comma-separated values", () => {
        expect(parseQueryArrayValue(undefined)).toBeUndefined();
        expect(parseQueryArrayValue("draft,published")).toEqual([
            "draft",
            "published",
        ]);
        expect(parseQueryArrayValue(["draft", null, "published"])).toEqual([
            "draft",
            "published",
        ]);
    });

    it("syncs query params into filter state and preserves unrelated params", async () => {
        const { route, router, replacements } = createQueryContext({
            tags: "draft,published",
            keep: "true",
        });
        const filtering = useQueryFiltering<TestFilters, TestFilters>(
            {
                status: undefined,
                tags: [],
                depositDate: [],
            },
            { route, router },
        );

        await flushFiltering();

        expect(filtering.filters.tags).toEqual(["draft", "published"]);
        expect(filtering.filters.status).toBeUndefined();

        filtering.filters.status = "ready";
        await flushFiltering();

        expect(replacements.at(-1)).toEqual({
            keep: "true",
            status: "ready",
            tags: ["draft", "published"],
        });
    });

    it("supports boolean array filters from query params", async () => {
        const { route, router, replacements } = createQueryContext({
            depositDate: ["true", "false", "ignore-me"],
            keep: "1",
        });
        const filtering = useQueryFiltering<TestFilters, TestFilters>(
            {
                status: undefined,
                tags: [],
                depositDate: [],
            },
            {
                route,
                router,
                booleanArrayKeys: ["depositDate"],
            },
        );

        await flushFiltering();

        expect(filtering.filters.depositDate).toEqual([true, false]);

        filtering.filters.depositDate = [false];
        await flushFiltering();

        expect(replacements.at(-1)).toEqual({
            depositDate: ["false"],
            keep: "1",
        });
    });
});

interface StudentRow {
    key: string;
    first_name: string;
    major: string;
    tags: string[];
    hooder_count: number;
    has_deposit: boolean;
}

interface StudentQuery {
    major__like?: string | null;
    major_code?: string | null;
    first_name__like?: string | null;
    last_name__like?: string | null;
    tags?: string[] | null;
    hooder_count?: number | null;
    deposit_date__notnull?: boolean | null;
    is_confirmed?: boolean | null;
    college?: string[] | null;
    sort?: string;
}

const studentColumns: TableColumn<
    StudentRow,
    ColumnKey<StudentRow>,
    StudentQuery
>[] = [
    {
        key: "major",
        label: "Major",
        sortable: true,
        filter: { type: "search", key: "major__like", match: "contains" },
    },
    {
        key: "first_name",
        label: "First Name",
        filter: { type: "search", key: "first_name__like", match: "startsWith" },
    },
    {
        key: "tags",
        label: "Tags",
        filter: {
            type: "search",
            transform: (text) =>
                text
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
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
];

function emptyStudentFilters() {
    return {
        major__like: undefined,
        first_name__like: undefined,
        tags: undefined,
        hooder_count: undefined,
        deposit_date__notnull: undefined,
    };
}

describe("buildFilterRequest", () => {
    it("reads mapped filter keys and applies explicit search matches", () => {
        expect(
            buildFilterRequest(studentColumns, {
                major__like: "Chem",
                first_name__like: " Al ",
            }),
        ).toEqual({ major__like: "%Chem%", first_name__like: "Al%" });
    });

    it("does not infer like operators or wildcards from search filters", () => {
        const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, StudentQuery>[] = [
            { key: "major", label: "Major", filter: { type: "search", key: "major_code" } },
            { key: "first_name", label: "Name", filter: { type: "search", key: "last_name__like", match: "endsWith" } },
        ];

        expect(
            buildFilterRequest(columns, { major_code: "CHEM", last_name__like: "son" }),
        ).toEqual({ major_code: "CHEM", last_name__like: "%son" });
    });

    it("ignores filter state stored under the row key", () => {
        expect(
            buildFilterRequest(studentColumns, {
                major: "Chem",
            } as Record<string, string>),
        ).toEqual({});
    });

    it("transforms tag searches into string arrays on the plain tags key", () => {
        expect(buildFilterRequest(studentColumns, { tags: "honors, late" })).toEqual({
            tags: ["honors", "late"],
        });
        // Route parsing may split comma-separated text into an array.
        expect(buildFilterRequest(studentColumns, { tags: ["honors", " late"] })).toEqual({
            tags: ["honors", "late"],
        });
    });

    it("keeps numeric and boolean types, including 0 and false", () => {
        const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, StudentQuery>[] = [
            ...studentColumns,
            {
                key: "first_name",
                label: "Confirmed",
                filter: {
                    type: "select",
                    key: "is_confirmed",
                    options: [
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                    ],
                },
            },
        ];

        expect(
            buildFilterRequest(columns, {
                hooder_count: 0,
                deposit_date__notnull: true,
                is_confirmed: false,
            }),
        ).toEqual({ hooder_count: 0, deposit_date__notnull: true, is_confirmed: false });

        // Values read back from the URL are strings.
        expect(
            buildFilterRequest(columns, {
                hooder_count: "0",
                deposit_date__notnull: "true",
                is_confirmed: "false",
            }),
        ).toEqual({ hooder_count: 0, deposit_date__notnull: true, is_confirmed: false });
    });

    it("maps multi-select arrays and supports explicit transforms", () => {
        const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, StudentQuery>[] = [
            {
                key: "major",
                label: "College",
                filter: {
                    type: "multi-select",
                    key: "college",
                    options: [
                        { label: "Engineering", value: "KP" },
                        { label: "LAS", value: "KV" },
                    ],
                },
            },
            {
                key: "hooder_count",
                label: "Hooders",
                filter: {
                    type: "multi-select",
                    options: [
                        { label: "None", value: 0 },
                        { label: "Some", value: 1 },
                    ],
                    transform: (values) => Math.max(...values.map(Number)),
                },
            },
        ];

        expect(
            buildFilterRequest(columns, { college: ["KP", "KV"], hooder_count: ["0", "1"] }),
        ).toEqual({ college: ["KP", "KV"], hooder_count: 1 });
        expect(buildFilterRequest(columns, { college: "KP" })).toEqual({ college: ["KP"] });
        expect(buildFilterRequest(columns, { college: [] })).toEqual({});
    });

    it("omits empty values and inactive toggles", () => {
        expect(
            buildFilterRequest(studentColumns, {
                major__like: "   ",
                first_name__like: "",
                tags: undefined,
                hooder_count: null,
                deposit_date__notnull: false,
            }),
        ).toEqual({});
    });
});

describe("mapped filter state", () => {
    it("round trips mapped keys through the URL without double transformation", async () => {
        const { route, router, replacements } = createQueryContext({
            major__like: "Chem",
            hooder_count: "0",
            keep: "1",
        });
        const filtering = useQueryFiltering<StudentRow, StudentQuery>(
            emptyStudentFilters(),
            { route, router },
        );

        await flushFiltering();

        expect(filtering.filters.major__like).toBe("Chem");
        expect(buildFilterRequest(studentColumns, filtering.filters)).toEqual({
            major__like: "%Chem%",
            hooder_count: 0,
        });

        filtering.filters.tags = "honors";
        filtering.filters.deposit_date__notnull = true;
        await flushFiltering();

        expect(replacements.at(-1)).toEqual({
            keep: "1",
            major__like: "Chem",
            hooder_count: "0",
            tags: "honors",
            deposit_date__notnull: "true",
        });
        expect(route.query.major).toBeUndefined();
        expect(filtering.filters.major__like).toBe("Chem");
        expect(buildFilterRequest(studentColumns, filtering.filters)).toEqual({
            major__like: "%Chem%",
            hooder_count: 0,
            tags: ["honors"],
            deposit_date__notnull: true,
        });
    });

    it("round trips search text containing commas", async () => {
        const { route, router } = createQueryContext();
        const filtering = useQueryFiltering<StudentRow, StudentQuery>(
            emptyStudentFilters(),
            { route, router },
        );

        filtering.filters.major__like = "Arts, Science";
        await flushFiltering();
        await flushFiltering();

        expect(buildFilterRequest(studentColumns, filtering.filters)).toEqual({
            major__like: "%Arts, Science%",
        });
    });

    it("treats 0 and false as active values that are kept in the URL", async () => {
        const { route, router, replacements } = createQueryContext();
        const filtering = useQueryFiltering<StudentRow, StudentQuery>(
            { hooder_count: undefined, is_confirmed: undefined },
            { route, router },
        );

        expect(filtering.isFiltered.value).toBe(false);

        filtering.filters.hooder_count = 0;
        filtering.filters.is_confirmed = false;
        await flushFiltering();

        expect(filtering.isFiltered.value).toBe(true);
        expect(filtering.filteredColumns.value).toEqual({
            hooder_count: true,
            is_confirmed: true,
        });
        expect(replacements.at(-1)).toEqual({
            hooder_count: "0",
            is_confirmed: "false",
        });
    });

    it("reports active state and clears filters by mapped key", async () => {
        const { route, router, replacements } = createQueryContext({
            major__like: "Chem",
            tags: ["honors", "late"],
            keep: "1",
        });
        const filtering = useQueryFiltering<StudentRow, StudentQuery>(
            emptyStudentFilters(),
            { route, router },
        );

        await flushFiltering();

        expect(filtering.filteredColumns.value).toMatchObject({
            major__like: true,
            tags: true,
            hooder_count: false,
        });
        expect(filtering.filteredColumns.value).not.toHaveProperty("major");

        filtering.clearFilters();
        await flushFiltering();

        expect(filtering.isFiltered.value).toBe(false);
        expect(replacements.at(-1)).toEqual({ keep: "1" });
        expect(buildFilterRequest(studentColumns, filtering.filters)).toEqual({});
    });

    it("syncs mapped keys without a router", async () => {
        const syncWith = ref<FilterRouteQuery>({ major__like: "Chem" });
        const filtering = useFiltering<StudentRow, StudentQuery>(
            emptyStudentFilters(),
            { syncWith },
        );

        expect(filtering.filters.major__like).toBe("Chem");

        filtering.filters.hooder_count = 0;
        await flushFiltering();

        expect(syncWith.value).toEqual({ major__like: "Chem", hooder_count: "0" });
    });
});

describe("filterDefaults", () => {
    it("builds default state keyed by filter key, with arrays for multi-selects", () => {
        const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, StudentQuery>[] = [
            ...studentColumns,
            { key: "first_name", label: "No filter" },
            {
                key: "major",
                label: "College",
                filter: { type: "multi-select", key: "college", options: [] },
            },
        ];

        const defaults = filterDefaults(columns);

        expect(defaults).toEqual({ ...emptyStudentFilters(), college: [] });
        expect(Object.keys(defaults)).toEqual([
            "major__like",
            "first_name__like",
            "tags",
            "hooder_count",
            "deposit_date__notnull",
            "college",
        ]);
    });
});

describe("filterStateFromQuery", () => {
    const columns: TableColumn<StudentRow, ColumnKey<StudentRow>, StudentQuery>[] = [
        ...studentColumns,
        {
            key: "major",
            label: "College",
            filter: {
                type: "multi-select",
                key: "college",
                options: [
                    { label: "KP", value: "KP" },
                    { label: "KV", value: "KV" },
                ],
            },
        },
        {
            key: "has_deposit",
            label: "Confirmed",
            filter: {
                type: "select",
                key: "is_confirmed",
                options: [
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                ],
            },
        },
    ];

    it("reads only filter keys, keeping array filters as arrays", () => {
        expect(
            filterStateFromQuery(filterDefaults(columns), {
                major__like: "Arts, Science",
                college: "KP",
                is_confirmed: "false",
                unrelated: "1",
            }),
        ).toEqual({
            major__like: ["Arts", " Science"],
            first_name__like: undefined,
            tags: undefined,
            hooder_count: undefined,
            deposit_date__notnull: undefined,
            college: ["KP"],
            is_confirmed: "false",
        });
    });

    it("produces the same request as useQueryFiltering", async () => {
        const query = {
            major__like: "Arts, Science",
            tags: "honors,late",
            hooder_count: "0",
            college: ["KP", "KV"],
            is_confirmed: "false",
        };
        const { route, router } = createQueryContext(query);
        const filtering = useQueryFiltering<StudentRow, StudentQuery>(
            filterDefaults(columns),
            { route, router },
        );
        await flushFiltering();

        const request = buildFilterRequest(
            columns,
            filterStateFromQuery(filterDefaults(columns), query),
        );

        expect(request).toEqual(buildFilterRequest(columns, filtering.filters));
        expect(request).toEqual({
            major__like: "%Arts, Science%",
            tags: ["honors", "late"],
            hooder_count: 0,
            college: ["KP", "KV"],
            is_confirmed: false,
        });
    });

    it("converts boolean array keys", () => {
        expect(
            filterStateFromQuery<TestFilters>(
                { depositDate: [] },
                { depositDate: ["true", "false", "ignore-me"] },
                { booleanArrayKeys: ["depositDate"] },
            ),
        ).toEqual({ depositDate: [true, false] });
    });
});
