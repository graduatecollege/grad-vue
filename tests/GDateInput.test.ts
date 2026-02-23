import { describe, it, expect } from "vitest";
import { ref } from "vue";
import GDateInput from "../src/components/GDateInput.vue";
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

        it("updates model value immediately on date change", async () => {
            const dateModel = ref("");
            const wrapper = mnt(GDateInput, {
                props: {
                    label: "Date",
                },
                model: dateModel,
            });

            const input = wrapper.instance.getByRole("textbox", { name: "Date" });
            
            // Fill in a date value and trigger change event
            await input.fill("2026-03-15");
            
            // The model should be updated immediately after the change event
            // without needing to lose focus
            expect(dateModel.value).toBe("2026-03-15");
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
