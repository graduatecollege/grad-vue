import { describe, expect, it, beforeEach } from "vitest";
import { useTableChanges } from "../src/compose/useTableChanges";

interface TestRow {
    key: string;
    name: string;
    value: number;
    category: string;
}

describe("useTableChanges", () => {
    describe("Basic Change Tracking", () => {
        it("should track a single change", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New Name", "Old Name");
            
            expect(tracker.hasChanges()).toBe(true);
            expect(tracker.hasChange("row1", "name")).toBe(true);
            expect(tracker.getChange("row1", "name")).toBe("New Name");
        });

        it("should track multiple changes in same row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New Name", "Old Name");
            tracker.trackChange("row1", "value", 100, 50);
            
            expect(tracker.changeCount()).toBe(2);
            expect(tracker.hasChange("row1", "name")).toBe(true);
            expect(tracker.hasChange("row1", "value")).toBe(true);
        });

        it("should track changes across multiple rows", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "Name 1", "Old 1");
            tracker.trackChange("row2", "name", "Name 2", "Old 2");
            
            expect(tracker.changeCount()).toBe(2);
            expect(tracker.hasChange("row1", "name")).toBe(true);
            expect(tracker.hasChange("row2", "name")).toBe(true);
        });

        it("should remove change when value returns to original", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New Name", "Old Name");
            expect(tracker.hasChange("row1", "name")).toBe(true);
            
            // Change back to original
            tracker.trackChange("row1", "name", "Old Name", "Old Name");
            expect(tracker.hasChange("row1", "name")).toBe(false);
            expect(tracker.hasChanges()).toBe(false);
        });

        it("should preserve original value through multiple edits", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "value", 100, 50);
            tracker.trackChange("row1", "value", 150, 100);
            tracker.trackChange("row1", "value", 200, 150);
            
            const changes = tracker.getChanges();
            expect(changes.length).toBe(1);
            expect(changes[0].oldValue).toBe(50);
            expect(changes[0].newValue).toBe(200);
        });
    });

    describe("Getting Changes", () => {
        it("should return all changes as array", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New 1", "Old 1");
            tracker.trackChange("row2", "value", 100, 50);
            
            const changes = tracker.getChanges();
            expect(changes.length).toBe(2);
            expect(changes[0].rowKey).toBe("row1");
            expect(changes[1].rowKey).toBe("row2");
        });

        it("should return changes organized by row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New Name", "Old Name");
            tracker.trackChange("row1", "value", 100, 50);
            tracker.trackChange("row2", "category", "electronics", "accessories");
            
            const changesByRow = tracker.getChangesByRow();
            
            expect(changesByRow.size).toBe(2);
            expect(changesByRow.get("row1")).toEqual({
                key: "row1",
                name: "New Name",
                value: 100,
            });
            expect(changesByRow.get("row2")).toEqual({
                key: "row2",
                category: "electronics",
            });
        });

        it("should return empty array when no changes", () => {
            const tracker = useTableChanges<TestRow>();
            
            expect(tracker.getChanges()).toEqual([]);
            expect(tracker.changeCount()).toBe(0);
        });
    });

    describe("Clearing Changes", () => {
        it("should clear all changes", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New 1", "Old 1");
            tracker.trackChange("row2", "value", 100, 50);
            
            expect(tracker.hasChanges()).toBe(true);
            
            tracker.clearChanges();
            
            expect(tracker.hasChanges()).toBe(false);
            expect(tracker.changeCount()).toBe(0);
        });

        it("should clear changes for specific row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New 1", "Old 1");
            tracker.trackChange("row2", "value", 100, 50);
            
            tracker.clearRowChanges("row1");
            
            expect(tracker.hasChange("row1", "name")).toBe(false);
            expect(tracker.hasChange("row2", "value")).toBe(true);
            expect(tracker.changeCount()).toBe(1);
        });
    });

    describe("Applying Changes to Data", () => {
        it("should apply changes to updated data", () => {
            const tracker = useTableChanges<TestRow>();
            
            // User made changes to row1
            tracker.trackChange("row1", "name", "User Edit", "Original");
            tracker.trackChange("row1", "value", 999, 100);
            
            // Fresh data from server (row1 value was updated by another user)
            const freshData: TestRow[] = [
                { key: "row1", name: "Original", value: 200, category: "electronics" },
                { key: "row2", name: "Item 2", value: 50, category: "accessories" },
            ];
            
            // Apply user changes to fresh data
            const mergedData = tracker.applyChangesToData(freshData);
            
            // User's edits should be preserved
            expect(mergedData[0].name).toBe("User Edit");
            expect(mergedData[0].value).toBe(999);
            // Other fields should come from fresh data
            expect(mergedData[0].category).toBe("electronics");
            // Unchanged rows should remain unchanged
            expect(mergedData[1]).toEqual(freshData[1]);
        });

        it("should not modify rows without changes", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "Changed", "Original");
            
            const freshData: TestRow[] = [
                { key: "row1", name: "Original", value: 100, category: "A" },
                { key: "row2", name: "Unchanged", value: 50, category: "B" },
            ];
            
            const mergedData = tracker.applyChangesToData(freshData);
            
            expect(mergedData[0].name).toBe("Changed");
            expect(mergedData[1]).toBe(freshData[1]);
        });

        it("should handle empty change set", () => {
            const tracker = useTableChanges<TestRow>();
            
            const data: TestRow[] = [
                { key: "row1", name: "Item 1", value: 100, category: "A" },
            ];
            
            const result = tracker.applyChangesToData(data);
            
            expect(result[0]).toBe(data[0]);
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined old value", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "New Value");
            
            expect(tracker.hasChange("row1", "name")).toBe(true);
            const changes = tracker.getChanges();
            expect(changes[0].oldValue).toBeUndefined();
        });

        it("should handle checking non-existent changes", () => {
            const tracker = useTableChanges<TestRow>();
            
            expect(tracker.hasChange("row999", "name")).toBe(false);
            expect(tracker.getChange("row999", "name")).toBeUndefined();
        });

        it("should handle clearing non-existent row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange("row1", "name", "Test", "Old");
            tracker.clearRowChanges("row999");
            
            expect(tracker.hasChange("row1", "name")).toBe(true);
        });
    });
});
