import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";
import {
    normalizeTableColumnState,
    usePersistentTableColumnState,
} from "../packages/grad-vue/src/compose/usePersistentTableColumnState";
import type { TableColumn } from "../packages/grad-vue/src/components/table/TableColumn";

interface TestRow {
    key: string;
    name: string;
    status: string;
    count: number;
}

const columns: TableColumn<TestRow>[] = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "count", label: "Count" },
];

describe("normalizeTableColumnState", () => {
    it("keeps valid state for known columns and normalizes widths", () => {
        expect(
            normalizeTableColumnState(
                {
                    name: { visible: false, width: 101.6 },
                    status: { visible: true, width: 40 },
                },
                columns,
            ),
        ).toEqual({
            name: { visible: false, width: 102 },
            status: { visible: true, width: 50 },
        });
    });

    it("drops unknown columns and invalid entries", () => {
        expect(
            normalizeTableColumnState(
                {
                    unknown: { visible: false, width: 200 },
                    name: { visible: "false", width: Infinity },
                    status: null,
                    count: ["invalid"],
                },
                columns,
            ),
        ).toEqual({});
    });

    it("returns an empty state for non-object values", () => {
        expect(normalizeTableColumnState(null, columns)).toEqual({});
        expect(normalizeTableColumnState([], columns)).toEqual({});
        expect(normalizeTableColumnState("invalid", columns)).toEqual({});
    });
});

describe("usePersistentTableColumnState", () => {
    const storageKey = "test-persistent-table-column-state";

    beforeEach(() => {
        localStorage.removeItem(storageKey);
    });

    it("loads and normalizes state from localStorage", async () => {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                name: { visible: false, width: 124.4 },
                removed: { visible: false },
            }),
        );

        const { columnState } = usePersistentTableColumnState(storageKey, columns);

        expect(columnState.value).toEqual({
            name: { visible: false, width: 124 },
        });
        await nextTick();
        expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({
            name: { visible: false, width: 124 },
        });
    });

    it("removes state for columns that are no longer available", async () => {
        const availableColumns = ref<readonly TableColumn<TestRow>[]>(columns);
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                name: { visible: false },
                status: { width: 160 },
                count: { visible: true },
            }),
        );

        const { columnState } = usePersistentTableColumnState(storageKey, availableColumns);

        availableColumns.value = [columns[0]];
        await nextTick();

        expect(columnState.value).toEqual({
            name: { visible: false },
        });
        expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({
            name: { visible: false },
        });
    });
});
