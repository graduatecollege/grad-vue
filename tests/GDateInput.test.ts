import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GDateInput from "../src/components/GDateInput.vue";
import { testAccessibility } from "./test-utils";

describe("GDateInput", () => {
    describe("Functional Tests", () => {
        it("has date input type", () => {
            const wrapper = mount(GDateInput, {
                props: {
                    label: "Date",
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("type")).toBe("date");
        });

        it("renders with label", () => {
            const wrapper = mount(GDateInput, {
                props: {
                    label: "Start Date",
                    modelValue: "",
                },
            });

            const label = wrapper.find("label");
            expect(label.text()).toBe("Start Date");
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
