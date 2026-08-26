import { describe, expect, it } from "vitest";
import { nextTick, reactive } from "vue";
import {
    parseQueryArrayValue,
    type FilterLocationQuery,
    type FilterRouteQuery,
    useQueryFiltering,
} from "../packages/grad-vue/src/compose/useFiltering";

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
