import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import GSelect from "../packages/grad-vue/src/components/GSelect.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page } from "vitest/browser";

describe("GSelect", () => {
    const options = ["Option 1", "Option 2", "Option 3"];

    describe("Functional Tests", () => {
        it("renders with label and options", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                },
            });

            await expect.element(container.getByText("Select option")).toBeVisible();
        });

        it("opens below when there is at least 200px of space below and constrains max-height", async () => {

            await page.viewport(420, 500);

            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                },
            });

            await container.getByRole("combobox").click();
            await nextTick();

            await expect.element(container.getByRole("listbox")).toBeInView();
        });

        it("opens below when listbox is shorter than 200px and there is enough room for the full listbox", async () => {
            await page.viewport(420, 500);
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                    style: {
                        marginTop: "250px"
                    }
                },
            });
            await container.getByRole("combobox").click();
            await nextTick();

            await expect.element(container.getByRole("listbox")).toBeInView();
        });

        it("opens above when there is less than 200px below and more space above", async () => {
            await page.viewport(420, 500);
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options: [
                        "Option 1",
                        "Option 2",
                        "Option 3",
                        "Option 4",
                        "Option 5",
                        "Option 6",
                    ],
                    modelValue: null,
                    style: {
                        paddingTop: "350px"
                    }
                },
            });
            await container.getByRole("combobox").click();
            await nextTick();


        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
            });
        });

        it("with selected value", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: "Option 2",
            });
        });

        it("with object options", async () => {
            const objectOptions = [
                { label: "First", value: 1 },
                { label: "Second", value: 2 },
            ];

            await testAccessibility(GSelect, {
                label: "Select option",
                options: objectOptions,
                modelValue: 1,
            });
        });

        it("with searchable enabled", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
                searchable: true,
            });
        });
    });
});
