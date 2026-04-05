import { describe, it, expect } from "vitest";
import GDateRangeInput from "../packages/grad-vue/src/components/GDateRangeInput.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GDateRangeInput", () => {
    describe("Functional Tests", () => {
        it("renders two date inputs", async () => {
            const wrapper = mnt(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    modelValue: { start: null, end: null },
                },
            });

            const inputs = await wrapper.instance.getByRole("textbox").all();
            expect(inputs.length).toBe(2);
        });

        it("renders with custom start and end labels", async () => {
            const wrapper = mnt(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    startLabel: "From",
                    endLabel: "To",
                    modelValue: { start: null, end: null },
                },
            });

            await expect.element(wrapper.instance.getByRole("textbox", { name: "From" })).toBeInTheDocument();
            await expect.element(wrapper.instance.getByRole("textbox", { name: "To" })).toBeInTheDocument();
        });

        it("displays error message", async () => {
            const wrapper = mnt(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    errors: ["Invalid date range"],
                    modelValue: { start: null, end: null },
                },
            });

            await expect.element(wrapper.instance.getByRole("alert")).toHaveTextContent("Invalid date range");
        });

        it("sets required on both date inputs when required", async () => {
            const wrapper = mnt(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    required: true,
                    modelValue: { start: null, end: null },
                },
            });

            const inputs = await wrapper.instance.getByRole("textbox").all();
            await expect.element(inputs[0]).toHaveAttribute("required");
            await expect.element(inputs[1]).toHaveAttribute("required");
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GDateRangeInput, {
                label: "Date Range",
                modelValue: { start: null, end: null },
            });
        });

        it("passes accessibility tests with error", async () => {
            await testAccessibility(GDateRangeInput, {
                label: "Date Range",
                errors: ["Invalid date range"],
                modelValue: { start: null, end: null },
            });
        });

        it("passes accessibility tests with required", async () => {
            await testAccessibility(GDateRangeInput, {
                label: "Date Range",
                required: true,
                modelValue: { start: null, end: null },
            });
        });
    });
});
