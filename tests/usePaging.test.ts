import { describe, expect, it } from "vitest";
import { nextTick, reactive } from "vue";
import {
    buildSortBy,
    parseSortQueryValue,
    serializeSortQueryValue,
    type FilterLocationQuery,
    type FilterRouteQuery,
    usePaging,
} from "../packages/grad-vue/src/grad-vue";

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

async function flushPaging() {
    await nextTick();
    await nextTick();
}

describe("usePaging", () => {
    it("parses and serializes sort query values", () => {
        expect(parseSortQueryValue("name,-status,name")).toEqual([
            { key: "name", order: 1 },
            { key: "status", order: -1 },
        ]);
        expect(serializeSortQueryValue([{ key: "name", order: 1 }])).toEqual([
            "name",
        ]);
    });

    it("builds sortBy strings with tie breakers", () => {
        expect(
            buildSortBy([{ key: "name", order: -1 }], ["status", "name"]),
        ).toBe("-name,-status");
    });

    it("syncs paging state with route query params", async () => {
        const { route, router, replacements } = createQueryContext({
            keep: "1",
            sort: ["-name", "status"],
            pageSize: "25",
            pageOffset: "50",
        });
        const paging = usePaging({
            route,
            router,
        });

        await flushPaging();

        expect(paging.sort.value).toEqual([
            { key: "name", order: -1 },
            { key: "status", order: 1 },
        ]);
        expect(paging.pageSize.value).toBe(25);
        expect(paging.pageOffset.value).toBe(50);

        paging.sort.value = [{ key: "updatedAt", order: 1 }];
        paging.pageSize.value = 50;
        paging.pageOffset.value = 0;
        await flushPaging();

        expect(replacements.pop()).toEqual({
            keep: "1",
            sort: ["updatedAt"],
        });
    });
});
