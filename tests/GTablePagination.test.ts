import { describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import GTablePagination from "../packages/grad-vue/src/components/table/GTablePagination.vue";
import { mnt, testAccessibility } from "./test-utils";

function mountPagination(total = 25) {
    const start = ref(0);
    const pageSize = ref(10);
    const fixture = defineComponent({
        setup() {
            return () =>
                h(GTablePagination, {
                    start: start.value,
                    pageSize: pageSize.value,
                    total,
                    "onUpdate:start": (value: number) => {
                        start.value = value;
                    },
                    "onUpdate:pageSize": (value: number) => {
                        pageSize.value = value;
                    },
                });
        },
    });
    return mnt(fixture);
}

describe("GTablePagination", () => {
    it("provides a persistent polite, atomic status region", async () => {
        const { instance } = mountPagination();
        const status = instance.getByRole("status");
        await expect.element(status).toHaveAttribute("aria-live", "polite");
        await expect.element(status).toHaveAttribute("aria-atomic", "true");
        await expect
            .element(status)
            .toHaveTextContent(
                "Page 1 of 3. Showing rows 1 to 10 of 25. First page.",
            );
        const statusElement = status.element();

        await instance.getByRole("button", { name: "Next Page" }).click();
        await expect
            .element(status)
            .toHaveTextContent("Page 2 of 3. Showing rows 11 to 20 of 25.");
        expect(status.element()).toBe(statusElement);

        await instance.getByRole("button", { name: "Next Page" }).click();
        await expect
            .element(status)
            .toHaveTextContent(
                "Page 3 of 3. Showing rows 21 to 25 of 25. Last page.",
            );
        await expect
            .element(instance.getByRole("button", { name: "Next Page" }))
            .toBeDisabled();
        await expect
            .element(instance.getByRole("button", { name: "Last Page" }))
            .toBeDisabled();
    });

    it("announces the first page when navigating back to the beginning", async () => {
        const { instance } = mountPagination();
        await instance.getByRole("button", { name: "Last Page" }).click();
        await instance.getByRole("button", { name: "Previous Page" }).click();
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent("Page 2 of 3. Showing rows 11 to 20 of 25.");
        await instance.getByRole("button", { name: "Previous Page" }).click();
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent(
                "Page 1 of 3. Showing rows 1 to 10 of 25. First page.",
            );
        await expect
            .element(instance.getByRole("button", { name: "Previous Page" }))
            .toBeDisabled();
        await expect
            .element(instance.getByRole("button", { name: "First Page" }))
            .toBeDisabled();
    });

    it("announces direct jumps to the first and last page", async () => {
        const { instance } = mountPagination();
        await instance.getByRole("button", { name: "Last Page" }).click();
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent(
                "Page 3 of 3. Showing rows 21 to 25 of 25. Last page.",
            );
        await instance.getByRole("button", { name: "First Page" }).click();
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent(
                "Page 1 of 3. Showing rows 1 to 10 of 25. First page.",
            );
    });

    it("updates the announcement when the page size changes", async () => {
        const { instance } = mountPagination();
        await instance.getByRole("button", { name: "Last Page" }).click();
        await instance
            .getByRole("combobox", { name: "per page" })
            .selectOptions("25");
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent(
                "Page 1 of 1. Showing rows 1 to 25 of 25. Only page.",
            );
    });

    it("describes empty results without announcing a nonexistent page", async () => {
        const { instance } = mountPagination(0);
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent("No rows to display.");
    });

    it("describes a single page", async () => {
        const { instance } = mountPagination(5);
        await expect
            .element(instance.getByRole("status"))
            .toHaveTextContent(
                "Page 1 of 1. Showing rows 1 to 5 of 5. Only page.",
            );
    });

    it("is accessible with default pagination props", async () => {
        await testAccessibility(GTablePagination, {
            start: 0,
            pageSize: 10,
            total: 25,
        });
    });
});
