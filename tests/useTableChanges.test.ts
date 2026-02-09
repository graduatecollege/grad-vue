import { describe, expect, it, beforeEach } from "vitest";
import { useTableChanges, CellChangePayload } from "../src/compose/useTableChanges";

interface TestRow {
    key: string;
    name: string;
    value: number;
    category: string;
}

// Helper function to create a complete change payload
function createChange(
    rowKey: string,
    columnKey: keyof TestRow,
    value: any,
    previousValue: any
): CellChangePayload<TestRow> {
    return {
        row: {
            key: rowKey,
            name: "",
            value: 0,
            category: "",
        },
        column: {
            key: columnKey as any,
            label: String(columnKey),
        },
        value,
        previousValue,
    };
}

describe("useTableChanges", () => {
    describe("Basic Change Tracking", () => {
        it("should track a single change", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "New Name", "Old Name"));
            
            expect(tracker.hasChanges()).toBe(true);
            expect(tracker.hasChange("row1", "name")).toBe(true);
            expect(tracker.getChange("row1", "name")).toBe("New Name");
        });

        it("should track multiple changes in same row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "New Name", "Old Name"));
            tracker.trackChange(createChange("row1", "value", 100, 50));
            
            expect(tracker.changeCount()).toBe(2);
            expect(tracker.hasChange("row1", "name")).toBe(true);
            expect(tracker.hasChange("row1", "value")).toBe(true);
        });

        it("should track changes across multiple rows", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "Name 1", "Old 1"));
            tracker.trackChange(createChange("row2", "name", "Name 2", "Old 2"));
            
            expect(tracker.changeCount()).toBe(2);
            expect(tracker.hasChange("row1", "name")).toBe(true);
            expect(tracker.hasChange("row2", "name")).toBe(true);
        });

        it("should remove change when value returns to original", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "New Name", "Old Name"));
            expect(tracker.hasChange("row1", "name")).toBe(true);
            
            // Change back to original
            tracker.trackChange(createChange("row1", "name", "Old Name", "Old Name"));
            expect(tracker.hasChange("row1", "name")).toBe(false);
            expect(tracker.hasChanges()).toBe(false);
        });

        it("should preserve original value through multiple edits", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", 100, 50));
            tracker.trackChange(createChange("row1", "value", 150, 100));
            tracker.trackChange(createChange("row1", "value", 200, 150));
            
            const changes = tracker.getChanges();
            expect(changes.length).toBe(1);
            expect(changes[0].previousValue).toBe(50);
            expect(changes[0].newValue).toBe(200);
        });
    });

    describe("Getting Changes", () => {
        it("should return all changes as array", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "New 1", "Old 1"));
            tracker.trackChange(createChange("row2", "value", 100, 50));
            
            const changes = tracker.getChanges();
            expect(changes.length).toBe(2);
            expect(changes[0].rowKey).toBe("row1");
            expect(changes[1].rowKey).toBe("row2");
        });

        it("should return changes organized by row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "New Name", "Old Name"));
            tracker.trackChange(createChange("row1", "value", 100, 50));
            tracker.trackChange(createChange("row2", "category", "electronics", "accessories"));
            
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
            
            tracker.trackChange(createChange("row1", "name", "New 1", "Old 1"));
            tracker.trackChange(createChange("row2", "value", 100, 50));
            
            expect(tracker.hasChanges()).toBe(true);
            
            tracker.clearChanges();
            
            expect(tracker.hasChanges()).toBe(false);
            expect(tracker.changeCount()).toBe(0);
        });

        it("should clear changes for specific row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "New 1", "Old 1"));
            tracker.trackChange(createChange("row2", "value", 100, 50));
            
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
            tracker.trackChange(createChange("row1", "name", "User Edit", "Original"));
            tracker.trackChange(createChange("row1", "value", 999, 100));
            
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
            
            tracker.trackChange(createChange("row1", "name", "Changed", "Original"));
            
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
            
            tracker.trackChange(createChange("row1", "name", "New Value", undefined));
            
            expect(tracker.hasChange("row1", "name")).toBe(true);
            const changes = tracker.getChanges();
            expect(changes[0].previousValue).toBeUndefined();
        });

        it("should handle checking non-existent changes", () => {
            const tracker = useTableChanges<TestRow>();
            
            expect(tracker.hasChange("row999", "name")).toBe(false);
            expect(tracker.getChange("row999", "name")).toBeUndefined();
        });

        it("should handle clearing non-existent row", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "name", "Test", "Old"));
            tracker.clearRowChanges("row999");
            
            expect(tracker.hasChange("row1", "name")).toBe(true);
        });
    });

    describe("Error Tracking", () => {
        it("should set and get error for a cell", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", -5, 10));
            tracker.setError("row1", "value", "Value must be positive");
            
            expect(tracker.hasError("row1", "value")).toBe(true);
            expect(tracker.getError("row1", "value")).toBe("Value must be positive");
        });

        it("should clear error for a cell", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", -5, 10));
            tracker.setError("row1", "value", "Value must be positive");
            
            expect(tracker.hasError("row1", "value")).toBe(true);
            
            tracker.clearError("row1", "value");
            
            expect(tracker.hasError("row1", "value")).toBe(false);
            expect(tracker.getError("row1", "value")).toBeUndefined();
        });

        it("should return false for hasError when no error exists", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", 100, 50));
            
            expect(tracker.hasError("row1", "value")).toBe(false);
        });

        it("should return undefined for getError when no error exists", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", 100, 50));
            
            expect(tracker.getError("row1", "value")).toBeUndefined();
        });

        it("should handle error on non-existent change", () => {
            const tracker = useTableChanges<TestRow>();
            
            // Try to set error without a change
            tracker.setError("row1", "value", "Some error");
            
            expect(tracker.hasError("row1", "value")).toBe(false);
            expect(tracker.getError("row1", "value")).toBeUndefined();
        });

        it("should preserve error when updating the cell value", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", -5, 10));
            tracker.setError("row1", "value", "Value must be positive");
            
            // Update the value
            tracker.trackChange(createChange("row1", "value", -10, -5));
            
            // Error should still be there
            expect(tracker.hasError("row1", "value")).toBe(true);
            expect(tracker.getError("row1", "value")).toBe("Value must be positive");
        });

        it("should clear error when change is removed by returning to original value", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", -5, 10));
            tracker.setError("row1", "value", "Value must be positive");
            
            expect(tracker.hasError("row1", "value")).toBe(true);
            
            // Change back to original value
            tracker.trackChange(createChange("row1", "value", 10, -5));
            
            // Change should be removed, so error should also be gone
            expect(tracker.hasChange("row1", "value")).toBe(false);
            expect(tracker.hasError("row1", "value")).toBe(false);
        });

        it("should include error in getChanges result", () => {
            const tracker = useTableChanges<TestRow>();
            
            tracker.trackChange(createChange("row1", "value", -5, 10));
            tracker.setError("row1", "value", "Value must be positive");
            tracker.trackChange(createChange("row2", "name", "Test", "Old"));
            
            const changes = tracker.getChanges();
            
            expect(changes.length).toBe(2);
            const changeWithError = changes.find(c => c.rowKey === "row1");
            const changeWithoutError = changes.find(c => c.rowKey === "row2");
            
            expect(changeWithError?.error).toBe("Value must be positive");
            expect(changeWithoutError?.error).toBeUndefined();
        });
    });
});
