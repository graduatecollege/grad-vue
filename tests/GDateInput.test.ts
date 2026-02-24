import { describe, it, expect } from "vitest";
import GDateInput from "../packages/grad-vue/src/components/GDateInput.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GDateInput", () => {
    describe("Functional Tests", () => {
        it("has date input type", async () => {
            const wrapper = mnt(GDateInput, {
                props: {
                    label: "Date",
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("textbox", { name: "Date" });
            await expect.element(input).toHaveAttribute("type", "date");
        });

        it("renders with label", async () => {
            const wrapper = mnt(GDateInput, {
                props: {
                    label: "Start Date",
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance.getByRole("textbox", { name: "Start Date" })).toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GDateInput, {
                label: "Date",
                modelValue: "",
            });
        });

        it("passes accessibility tests with error", async () => {
            await testAccessibility(GDateInput, {
                label: "Date",
                error: "Invalid date",
                modelValue: "",
            });
        });
    });
});
