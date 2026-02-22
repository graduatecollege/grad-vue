import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GDateRangeInput from "../src/components/GDateRangeInput.vue";
import { testAccessibility } from "./test-utils";

describe("GDateRangeInput", () => {
    describe("Functional Tests", () => {
        it("renders two date inputs", () => {
            const wrapper = mount(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    modelValue: { start: null, end: null },
                },
            });

            const inputs = wrapper.findAll("input[type='date']");
            expect(inputs.length).toBe(2);
        });

        it("renders with custom start and end labels", () => {
            const wrapper = mount(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    startLabel: "From",
                    endLabel: "To",
                    modelValue: { start: null, end: null },
                },
            });

            const labels = wrapper.findAll("label");
            expect(labels[0].text()).toBe("From");
            expect(labels[1].text()).toBe("To");
        });

        it("displays error message", () => {
            const wrapper = mount(GDateRangeInput, {
                props: {
                    label: "Date Range",
                    error: "Invalid date range",
                    modelValue: { start: null, end: null },
                },
            });

            const error = wrapper.find(".g-date-range-input__error");
            expect(error.exists()).toBe(true);
            expect(error.text()).toBe("Invalid date range");
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
                error: "Invalid date range",
                modelValue: { start: null, end: null },
            });
        });
    });
});
